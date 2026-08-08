import { createClient } from "@supabase/supabase-js";
import {
  addressOf,
  checkRegistrationLimits,
  limitsConfigured,
} from "@/lib/rateLimit";
import { PAYMENT, TICKET_PREFIX } from "@/components/WorkshopCyberDefence/Registration/content";

/**
 * Where a finished registration is actually written.
 *
 * The one server route on this site. Everything else the public pages do goes
 * straight from the browser to Supabase with the publishable key — the trade
 * argued at the top of `submit.js` — and this row is the exception, for one
 * reason: a rate limit has to be counted somewhere the person being limited
 * does not control, and there is no such place in a bundle they downloaded.
 *
 * The two files still go up from the browser. They are the slow part of this
 * flow on a phone, they are already covered by the bucket's own size and mime
 * limits, and posting a 400 KB screenshot through a serverless function to
 * hand it to storage anyway would double the upload for nothing. So the shape
 * is: browser uploads the objects, browser posts the *paths* here, this route
 * counts the request against two limits and writes the row.
 *
 * ---------------------------------------------------------------------------
 * Making this the only way in
 *
 * As it stands a script can skip this route entirely — `anon` may still insert
 * into the table directly, so the limits below bound the form rather than the
 * table. Two changes close that, and they have to be made in this order or
 * registrations stop working between them:
 *
 *   1. Put a Supabase **secret** key in the deployment as `SUPABASE_SECRET_KEY`
 *      (Project Settings → API keys → secret). It is server-only — no
 *      `NEXT_PUBLIC_` — and it bypasses RLS, which is the entire point: this
 *      route stops needing the anon policy. `supabaseFor()` below picks it up
 *      on its own the moment it exists.
 *
 *   2. Then, and only then, run the hardening block at the bottom of
 *      `supabase/workshop-modern-cyber-defence.sql`, which drops the `anon`
 *      insert policy on the table.
 *
 * Doing 2 without 1 leaves nothing on the site able to write a registration.
 * ---------------------------------------------------------------------------
 */

const TABLE = "workshop-modern-cyber-defence";

/** Letters and digits, the same rule the form applies in the browser. */
const ALNUM = /^[A-Za-z0-9]+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `MCD26-XXXXXX` in the code's own alphabet — see `ticketSuffix` in useRegistration.js. */
const TICKET_CODE = new RegExp(`^${TICKET_PREFIX}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$`);

/**
 * The client that writes the row.
 *
 * Not either of the two in `lib/supabase/` and deliberately so. Those are the
 * browser client and the cookie-bound Server Component client, and both are
 * built around carrying *a user's* session; this route has no user and wants no
 * cookies — a session read here would be a coordinator's, if one happened to be
 * signed in on the same browser, and writing a student's registration as them
 * is a confusion waiting to happen. So: no session, no cookie storage, one
 * request's worth of client.
 *
 * The key is the secret one where the deployment has it and the publishable one
 * otherwise, which is what makes the hardening above a change of environment
 * rather than a change of code. `persistSession: false` matters for the secret
 * key in particular: a service client that cached a session between invocations
 * of a warm serverless function would be sharing it across students.
 */
function supabaseFor() {
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * What the browser sent, checked again.
 *
 * `useRegistration.js` validates all of this before the step will advance, and
 * that is the copy a student ever reads — these messages are for whoever is
 * reading the logs. It is repeated here because the browser's check is a
 * courtesy to the person filling the form in and this one is the only check
 * that exists for anybody who is not.
 *
 * Returns a string on failure and `null` on success, rather than the field map
 * the client-side validators return: this one has no form to decorate, and the
 * response it feeds has no way to point at a field.
 */
function reject(body) {
  const text = (value) => (typeof value === "string" ? value.trim() : "");

  if (!TICKET_CODE.test(text(body.ticketCode))) return "Bad ticket code.";
  if (!text(body.name)) return "Missing name.";
  if (!text(body.college)) return "Missing college.";
  if (!text(body.stream)) return "Missing class.";
  if (!text(body.section)) return "Missing section.";
  if (!text(body.year)) return "Missing year.";

  if (!EMAIL.test(text(body.email))) return "Bad email.";

  const register = text(body.registerNumber);
  if (!ALNUM.test(register) || register.length < 6) return "Bad register number.";

  const transaction = text(body.transactionId);
  if (!ALNUM.test(transaction) || transaction.length < 6 || transaction.length > 40) {
    return "Bad transaction id.";
  }

  /* Long enough to be abuse rather than a long name. The columns are `text` and
     will take a megabyte without complaint, which is the problem. */
  const tooLong = [body.name, body.college, body.stream, body.email].some(
    (value) => text(value).length > 200,
  );
  if (tooLong) return "Field too long.";

  return null;
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Malformed body." }, { status: 400 });
  }

  const bad = reject(body);
  if (bad) {
    return Response.json({ ok: false, message: bad }, { status: 400 });
  }

  /* ------------------------------------------------------------- the limits */
  const limit = await checkRegistrationLimits({
    ip: addressOf(request),
    registerNumber: body.registerNumber,
  });

  if (!limit.ok) {
    /*
     * 429 with `Retry-After` as well as the JSON, because the header is the
     * part every proxy, log and monitoring tool between here and the student
     * already understands. It is stated in seconds and rounded up — a
     * `Retry-After: 0` is an invitation to try again immediately, which is the
     * one thing this response is asking them not to do.
     */
    const seconds = Math.max(1, Math.ceil(limit.retryAfterMs / 1000));

    return Response.json(
      {
        ok: false,
        blocked: true,
        scope: limit.scope,
        retryAfterMs: limit.retryAfterMs,
      },
      { status: 429, headers: { "Retry-After": String(seconds) } },
    );
  }

  if (process.env.NODE_ENV !== "production" && !limitsConfigured()) {
    console.warn(
      "[register] UPSTASH_REDIS_REST_URL / _TOKEN are unset — the rate limit is not running.",
    );
  }

  /* --------------------------------------------------------------- the row */
  const supabase = supabaseFor();

  const { error } = await supabase.from(TABLE).insert({
    ticket_code: body.ticketCode.trim(),
    name: body.name.trim(),
    /* Both of these arrive as the *label* rather than the raw field — "Other"
       is the name of a text box in the form and never the name of a college or
       a class. See `collegeLabel` / `streamLabel` in useRegistration.js. */
    college: body.college.trim(),
    stream: body.stream.trim(),
    section: body.section.trim(),
    email: body.email.trim(),
    register_number: body.registerNumber.trim(),
    year: body.year.trim(),
    transaction_id: body.transactionId.trim(),
    /* Read from the copy rather than from the request. The fee is not something
       the browser gets an opinion about, and a register whose amounts came from
       the client is a register that cannot be totalled. */
    amount: PAYMENT.fee,
    /* Paths, not URLs, and null where the object did not make it — the bucket
       is private, so a stored URL would be a signed one with an expiry baked
       in. The browser settles both uploads before it posts here and sends null
       for whichever failed; a path recorded for a file that is not there reads
       as a working registration until a coordinator clicks it. */
    proof_path: typeof body.proofPath === "string" ? body.proofPath : null,
    ticket_path: typeof body.ticketPath === "string" ? body.ticketPath : null,
  });
  /* No `.select()`, for the same reason submit.js never had one: asking for the
     row back needs a select policy for `anon`, and a select policy on this
     table publishes every attendee's email and register number. Under the
     secret key it would work — but the route has nothing to do with the
     returned row either way, and code that only stops being safe when an env
     var is missing is code that will one day be run without it. */

  if (error) {
    console.error("[register] insert failed:", error);
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
