import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * How often the same address, and the same student, may file a registration.
 *
 * Server-only. This module reaches for `UPSTASH_REDIS_REST_TOKEN`, which is a
 * secret, and nothing that imports it may ever end up in a client bundle —
 * `app/api/events/workshop-modern-cyber-defence/register/route.js` is its only
 * caller and is meant to stay that way.
 *
 * Two limits, because they catch two different things and neither one catches
 * the other:
 *
 *   **Level 1, by IP.** A script pointed at the route. It is the only signal
 *   available before a single field has been read, so it is the one that has to
 *   hold when the payload is garbage.
 *
 *   **Level 2, by register number.** The campus is behind NAT: several hundred
 *   students on the college wifi arrive at this route from one address, and an
 *   IP limit tight enough to stop a script would refuse most of a lecture hall.
 *   So the IP limit is set loose enough to survive that, and the *identity*
 *   being registered carries its own budget — which is the limit that actually
 *   describes the abuse worth stopping here, somebody filing RA2411026040059
 *   forty times.
 *
 * Checked in that order and short-circuited, so a request rejected on its
 * address does not also spend the register number's budget — otherwise a script
 * spraying one victim's register number would exhaust that student's own
 * allowance and lock them out of registering for real.
 *
 * ---------------------------------------------------------------------------
 * What this does and does not protect
 *
 * The limits sit on the route, so they bound what the *form* can do — including
 * the two cases that actually happen: a double-tap on a slow connection, and
 * somebody sitting on the button because they are not sure the first one
 * worked. They are not a wall around the table. As long as
 * `supabase/workshop-modern-cyber-defence.sql` keeps its `to anon` insert
 * policy, anybody who reads the bundle can post rows to Supabase directly and
 * never touch this file. Closing that is one env var and one SQL statement, and
 * both are written down at the top of the route handler — do that before an
 * event that matters rather than after.
 * ---------------------------------------------------------------------------
 */

/**
 * Twelve in ten minutes from one address.
 *
 * The number is chosen against campus NAT rather than against a script. A
 * seven-field form with a payment in the middle of it takes a couple of
 * minutes to fill in honestly, so twelve completions from a single address
 * inside ten minutes is already several people at once — which is exactly what
 * the college wifi looks like on the day a poster goes up, and why this is not
 * set to the 3-or-4 that would otherwise be tempting. What it does buy is a
 * ceiling: a script that would have written rows as fast as the network allows
 * writes seventy-two an hour instead, and a coordinator sorting that out has an
 * afternoon's problem rather than a register with fifty thousand rows in it.
 */
const IP_LIMIT = { tokens: 12, window: "10 m" };

/**
 * Five a day for one register number.
 *
 * A student registers once. The other four are for the ways a first attempt
 * genuinely fails — a screenshot that would not upload, a transaction id typed
 * wrong and fixed on a second run through, a phone that lost signal mid-submit
 * — because every one of those spends an attempt here whether or not a row came
 * out of it, and a limit that refuses somebody their own seat over a flaky
 * connection is worse than the spam it prevents.
 *
 * The window is a day rather than an hour on purpose: the failure this is aimed
 * at is a register filling with the same name, and that is not a burst, it is
 * somebody with an afternoon.
 */
const REGISTER_LIMIT = { tokens: 5, window: "24 h" };

/**
 * Whether there is a Redis to talk to at all.
 *
 * `Redis.fromEnv()` throws when the variables are missing, which on a local
 * `npm run dev` with no Upstash project — the normal state of this repo while
 * somebody is working on the form — would turn every registration into a 500.
 * So the variables are read rather than assumed, and their absence is a
 * documented state rather than a crash. See `checkRegistrationLimits`.
 */
function configured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

/**
 * The two limiters, built once and kept.
 *
 * Lazily, and at module scope, because a route handler is invoked per request
 * and constructing a limiter per request would throw away the one piece of
 * state that makes this cheap: `ephemeralCache`. That is a plain Map of
 * identifiers already known to be over their limit, and it is what lets a
 * request that is being refused be refused without a round trip to Redis —
 * which is precisely the request you least want to spend a network call on,
 * because there are by definition a lot of them.
 *
 * `analytics` is off. It is a second write per call for a dashboard nobody on
 * this project is going to open, and the free tier's command budget is better
 * spent on the limits themselves.
 */
let limiters = null;

function get() {
  if (limiters) return limiters;
  if (!configured()) return null;

  const redis = Redis.fromEnv();
  const cache = new Map();

  limiters = {
    ip: new Ratelimit({
      redis,
      analytics: false,
      ephemeralCache: cache,
      /* Prefixed per event. The next workshop gets its own route and its own
         prefix, and neither inherits a budget somebody spent in August. */
      prefix: "nic:mcd26:ip",
      limiter: Ratelimit.slidingWindow(IP_LIMIT.tokens, IP_LIMIT.window),
    }),

    register: new Ratelimit({
      redis,
      analytics: false,
      ephemeralCache: cache,
      prefix: "nic:mcd26:reg",
      limiter: Ratelimit.slidingWindow(
        REGISTER_LIMIT.tokens,
        REGISTER_LIMIT.window,
      ),
    }),
  };

  return limiters;
}

/**
 * The address a request came from, as well as it can be known.
 *
 * `NextRequest.ip` was removed in Next 15, and there is no replacement — behind
 * a proxy the address is a header and always was. `x-forwarded-for` is a
 * comma-separated chain appended to by each hop, so the *first* entry is the
 * client and everything after it is infrastructure; taking the last would rate
 * limit the load balancer.
 *
 * It is spoofable by anybody talking to the origin directly, which is why the
 * register number limit exists rather than this being the whole story.
 *
 * `"unknown"` is deliberately a bucket rather than a bypass: requests that
 * arrive with no forwarding headers at all share one budget instead of each
 * getting a free one.
 */
export function addressOf(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Both limits, in order.
 *
 * Returns `{ ok }` when the request may proceed, or `{ ok: false, scope,
 * retryAfterMs }` when it may not — `scope` being which of the two refused it,
 * so the route can say something true about *why* without the client having to
 * guess. `retryAfterMs` is derived from Upstash's `reset`, which is an absolute
 * unix timestamp; the caller wants a duration and the two are not the same
 * thing once a response has spent a second in flight.
 *
 * **Fails open.** Every error path here — no Upstash configured, Redis
 * unreachable, a request that timed out on the way to it — returns `ok`. That
 * is the deliberate direction: this is a club workshop whose registration
 * window is a few days wide, and an outage at Upstash that quietly stopped
 * students registering would cost far more than the spam it was holding back.
 * The `reason` comes back with it so the route can log the difference between
 * "allowed" and "allowed because the limiter was not there".
 */
export async function checkRegistrationLimits({ ip, registerNumber }) {
  const rate = get();
  if (!rate) return { ok: true, reason: "unconfigured" };

  try {
    const byIp = await rate.ip.limit(ip);
    if (!byIp.success) {
      return {
        ok: false,
        scope: "ip",
        retryAfterMs: Math.max(0, byIp.reset - Date.now()),
      };
    }

    /* Upper-cased and trimmed so `ra2411026040059` and `RA2411026040059 ` are
       one budget rather than three. The column itself keeps whatever the
       student typed — this normalisation is for the key and nothing else. */
    const key = registerNumber.trim().toUpperCase();
    const byRegister = await rate.register.limit(key);

    if (!byRegister.success) {
      return {
        ok: false,
        scope: "register",
        retryAfterMs: Math.max(0, byRegister.reset - Date.now()),
      };
    }

    return { ok: true, reason: "allowed" };
  } catch (error) {
    console.error("[ratelimit] check failed, allowing through:", error);
    return { ok: true, reason: "unavailable" };
  }
}

/** Whether the limits are live, for the route's own development-only reporting. */
export function limitsConfigured() {
  return configured();
}
