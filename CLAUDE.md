# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # next build — the only working check in this repo
npm start        # production server
```

`npm run lint` is broken: `eslint-config-next@0.2.4` ships no `core-web-vitals` or
`typescript` entry point, so `eslint.config.mjs` fails to resolve. Use
`npx next build` to verify a change compiles. There is no test suite.

`.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Both are public by design (see *Supabase*
below); without them every Supabase call fails at runtime but the build still
passes, so a broken key looks like an empty screen rather than an error.

Three optional server-only variables, none of which is needed to run the site
locally:

| Variable | What it turns on | Missing means |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | The registration rate limit ([lib/rateLimit.js](lib/rateLimit.js)) | Every registration is allowed through — it **fails open** on purpose |
| `UPSTASH_REDIS_REST_TOKEN` | ditto | ditto |
| `SUPABASE_SECRET_KEY` | The register route writing rows as the service role | The route writes as `anon`, which still works |

None may take a `NEXT_PUBLIC_` prefix — that prefix compiles a value into the
bundle every visitor downloads, and `SUPABASE_SECRET_KEY` bypasses RLS on every
table in the project. Section 3 of
[supabase/workshop-modern-cyber-defence.sql](supabase/workshop-modern-cyber-defence.sql)
is the other half of that key and says what order to do it in.

## What this is

The site for NIC (Nextgen Intelligence Club). Next.js 16 App Router, React 19,
Tailwind v4, framer-motion, Supabase. TypeScript is configured with `allowJs` and
everything except [app/layout.tsx](app/layout.tsx) and [next.config.ts](next.config.ts)
is `.jsx` — new components follow suit. `@/*` resolves to the repo root.

| Route | What it is |
|---|---|
| `/` | The front page — four pinned frame sequences, dealt one screen at a time |
| `/join` | Recruitment copy ([JoinNotice](components/JoinNotice/index.jsx)) |
| `/events` | The permanent board of everything the club runs ([EventsIndex](components/EventsIndex/index.jsx)) |
| `/genesis-26` | The symposium poster page ([Genesis26](components/Genesis26/index.jsx)) |
| `/events/workshop-modern-cyber-defence` | A poster page **plus** the four-step registration flow |
| `/admin/*` | The coordinators' console: BOD editor, registers, scanner, attendance |

Tailwind v4 is CSS-first: there is no `tailwind.config`. Every colour token and
`@utility` rule lives in [app/globals.css](app/globals.css).

**The doc comment at the top of a file is the spec.** This codebase argues for its
own decisions at length — why the ticket code drops `0/1/I/O`, why the register
never calls `.select()`, why the events theme moved up a directory. Read the header
before changing a file; most of what looks arbitrary is load-bearing and the reason
is written down a few lines above it.

## Two layouts, one page

The single most important structural fact about the front page: it is **two
different layouts**, not one layout at two sizes. The split is
[useIsMobile.js](components/useIsMobile.js) at 1024px — deliberately the same as
Tailwind's `lg`, so a `lg:` class and an `isMobile` branch always agree. Never let
them drift.

- **≥1024px — a deck.** Four frame sequences pinned behind sheets of content that
  are pushed off a screen at a time.
- **<1024px — a page.** Sections that simply flow, each lit by a single still frame
  ([SceneStill.jsx](components/SceneStill.jsx)). No frames are downloaded at all,
  and no automatic pushes exist (touch momentum belongs to the compositor).

`useIsMobile` returns `false` for one render on purpose — there is no viewport to
measure during SSR, and the first client render must agree with the server's markup
or React discards the tree. Any code that must know before a component can ask uses
the `matchesMobile()` escape hatch.

## The deck mechanics

Four layers cooperate. Changing one without the others is how this page breaks.

**1. [smoothScroll.js](components/smoothScroll.js)** — a dependency-free inertial
scroll (Lenis-shaped, ~365 lines). It swallows wheel input and replays it as a lerp
toward a target, but the **browser stays the source of truth for scroll position**,
so `useScroll`, sticky panels and anchors all keep working. A module-level
singleton; [SmoothScroll](components/SmoothScroll/index.jsx) just mounts it. Do not
introduce a scroll library — every scroll-linked animation on the page reads off
window scroll and would have to be rewritten.

**2. [useSlideHandoff.js](components/useSlideHandoff.js)** — decides *when* a
finished slide advances, then plays the whole push as one uninterruptible 0.7s
tween (`PUSH_MS`). It runs backwards too: scrolling up off a handed-over slide
replays the same viewport of travel in reverse. The caller owns the geometry; this
hook only owns timing. Automatic pushes are gated on `(pointer: fine)` and no
`prefers-reduced-motion` — everyone else still gets the same travel, they just
scroll it themselves.

**3. [Slide.jsx](components/Slide.jsx)** — one screen of the deck. It sits in normal
flow above a pinned sequence, so "pushing" it is just playing its own scroll span in
one gesture. Critically, **a slide only advances while it fits in one viewport**
(`useFitsViewport`). This is why type across the sections clamps against `vh` as
well as `vw` (`clamp(2.5rem,min(8vw,11vh),5.5rem)`) and why bands are capped by
height arithmetic (see `SEAT_BAND` in
[CrewSequence/index.jsx](components/CrewSequence/index.jsx)): a heading that grows
one line too tall silently turns the deck off for that slide.

**4. The pull-up + runway.** Each section is `lg:pull-up-viewport` (`-100svh`), which
drags it over the pinned panel above so it wipes rather than follows. The last
stretch of travel is measured against an empty, viewport-tall `runwayRef` element
rather than a fraction of the section — the copy decides section height, so a
fraction would drift with the word count and the pinned canvas would stop matching
the rate the next section rises at. Use `h-viewport` / `min-h-viewport` /
`pull-up-viewport` (all `svh`-based) rather than `h-screen`.

`document.body.style.overflow === "hidden"` is the page-wide "the page is locked"
signal. The loader, the mobile sheet and [MemberDialog](components/MemberDialog/index.jsx)
all set it, and `smoothScroll` and the hash-restore in [app/page.jsx](app/page.jsx)
both check it. `isAutoScrolling()` is the matching gate for "a programmatic scroll
owns the page" — anything that would start a scroll of its own must stand down
while it is true.

## Frame sequences

240-ish WebP frames per sequence under `public/frames/frames_{hexagon,drone,corridor,cityskyline}/`.
[useFrameSequence.js](components/useFrameSequence.js) decodes them into a **ref, not
state** — the canvas reads them 60×/second and must not drag React through a render.
[FrameCanvas.jsx](components/FrameCanvas.jsx) paints the playhead frame and
cross-fades into the next by the fractional part, which is what stops a
scroll-scrubbed sequence reading as stepped.

The four sequences **queue rather than race**: [app/page.jsx](app/page.jsx) chains
each one's `enabled` flag to the previous one's `ready`. ~35 MB total, fetched
strictly in the order it is watched. Preserve that chain when adding a sequence.

## Content lives apart from presentation

Sections are `components/<Section>/{index.jsx, content.js}`. All copy, rosters, the
ledger and gallery entries are in `content.js`; `index.jsx` is layout only. Several
content files carry `FILL ME IN` blocks (bios written about the *post* not the
person, unset club social links in [siteLinks.js](components/siteLinks.js), board
term years, the admin list in the workshop SQL) — these are placeholders awaiting
real data, not bugs.

[siteLinks.js](components/siteLinks.js) is the site's table of contents, stated once
for navbar and footer. Every `#` entry must match a `Slide` `id` on the front page;
the non-hash entries are routes. `NAV_LINKS` wants to stay **six** — the desktop bar
splits it into halves around the Genesis pill.

Slide reveals run in **both** directions (`once: false`) because a slide can be dealt
again when the visitor scrolls back, and each variant carries its own transition —
passing a `transition` prop to a child would override both.

## Four palettes, deliberately not one

Shared vocabulary is stated once per surface and **must not cross over**:

| File | Whose | Notes |
|---|---|---|
| [surfaces.js](components/surfaces.js) | The front page | `PANEL`, `HEADING_SHADOW`, `LABEL_SHADOW`, `GRAIN_PLATE` + [motionPresets.js](components/motionPresets.js) |
| [eventsTheme.js](components/eventsTheme.js) | Everything under `/events` | `cyber-*` tokens. **The front page must never import this.** |
| [Genesis26/gold.js](components/Genesis26/gold.js) | The symposium only | `genesis-*` tokens |
| [Admin/surfaces.js](components/Admin/surfaces.js) | `/admin` | `PANEL` with the radius taken off — nothing in the admin is rounded |

[app/events/layout.jsx](app/events/layout.jsx) loads three Google fonts (Orbitron /
Poppins / Share Tech Mono) as CSS variables for the events segment alone, so the
front page never pays for them. It sets no default family on purpose: `Navbar` and
`Footer` render inside those routes and must stay in the site's own Geist.

**An event folder is meant to be deleted whole** the day after its event runs —
`components/Genesis26/` with `GENESIS_HREF`, `components/WorkshopCyberDefence/` with
`WORKSHOP_HREF`. That is why the theme and the fonts live at `/events` level and not
inside the event: `/events` is permanent and cannot depend on a folder documented as
disposable.

## Supabase

Two clients, and the distinction is not cosmetic:

- [lib/supabase/client.js](lib/supabase/client.js) — browser. Everything the public
  site and most of the admin screens use.
- [lib/supabase/server.js](lib/supabase/server.js) — Server Components. Its cookie
  writes are best-effort and swallowed, because a Server Component cannot set
  cookies.

[proxy.js](proxy.js) is what actually refreshes the session and gates `/admin/*`.
**Next 16 renamed `middleware` to `proxy`** — the export and the filename both — but
the mechanics (`matcher`, `NextResponse`) are unchanged. It calls `getUser()`, which
revalidates against Supabase Auth, rather than trusting a cookie. Pages under
`/admin` still make their own `getUser()` check close to the data they touch: a
layout does not re-render on every navigation within itself.

### Schema and access control

`supabase/*.sql` **is** the schema. There is no migration tooling — the files are
pasted into the Supabase SQL editor by hand, and every statement is idempotent so
re-running one is safe. Any column added after a file's first run must also appear
as an `add column if not exists` in that same file.

- [supabase/schema.sql](supabase/schema.sql) — `bod_bios` + the public `bod-photos`
  bucket. Policies are `to authenticated`, which is fine: the table is public-read
  anyway.
- [supabase/workshop-modern-cyber-defence.sql](supabase/workshop-modern-cyber-defence.sql)
  — registrations + a **private** verification bucket, and the `nic_admins` table
  with the `is_nic_admin()` `security definer` function. Registrations are gated on
  *that list*, not on `to authenticated`: anyone who can sign up gets a token, and
  this table holds names, register numbers and photographs of banking apps. An
  account not on the list signs in fine and sees an empty register — no error, no
  data. Adding an admin is an `insert` from the SQL editor; there is no insert policy
  on `nic_admins` on purpose.

The registrations table is named with hyphens to match its route, so **every raw SQL
reference to it must be double-quoted**. supabase-js quotes for you.

The public site writes to Supabase with the publishable key and, with one
exception, no server route in front of it. That is a considered trade, argued at
the top of [submit.js](components/WorkshopCyberDefence/Registration/submit.js):
`anon` may insert and never select, the bucket is private, and a payment is
confirmed by a human looking at a screenshot. Do not add a `select` policy for
`anon` to either — it would publish the attendee list to anyone who opens the
network tab, which is why nothing on this path ever calls `.select()` on its
insert.

The exception is the registration **row**, which goes through
[app/api/events/workshop-modern-cyber-defence/register/route.js](app/api/events/workshop-modern-cyber-defence/register/route.js)
— the only server route on the site. It exists because of the rate limit and for
no other reason: a limit counted in a bundle the person being limited downloaded
is not a limit. Two levels, both in [lib/rateLimit.js](lib/rateLimit.js) with the
numbers argued there — by IP, loose enough to survive the campus NAT that puts a
whole building on one address, and by register number, which is the identity the
abuse worth stopping actually repeats. It **fails open**: no Upstash, or an
Upstash that is down, allows the registration. An outage that quietly stopped
students registering would cost more than the spam it held back.

The two files still go up straight from the browser, and the route takes their
paths rather than their bytes.

[useBioOverrides.js](components/useBioOverrides.js) merges admin-saved bios over the
static roster at render time. `null` means "never touched, fall back to content.js";
empty string means an admin cleared it — the merge in `CrewSequence` treats those
differently.

## Registration → ticket → door

One pipeline across four places; the invariants below are what hold it together.

**The registry.** [Admin/events.js](components/Admin/events.js) is the list of events
that have a register behind them, and every admin screen is generic over an entry in
it. Adding an event = run its SQL file, then add one entry naming the `table` and
`bucket` it created. No new screens.

**The code.** `ticket_code` (`MCD26-XXXXXX`) is the join key for everything a human
does: printed on the ticket, encoded in its QR, read aloud at the door, and the name
of both objects in the bucket. Its alphabet drops `0`, `1`, `I` and `O` because the
real risk is transcription, not collision.

**The ticket is drawn twice.** [Ticket.jsx](components/WorkshopCyberDefence/Registration/Ticket.jsx)
is the readable one on the page; [ticketCanvas.js](components/WorkshopCyberDefence/Registration/ticketCanvas.js)
redraws it to a canvas for download. **A copy change in one is a copy change in the
other** — only `barcodeWidths` is shared.

**Uploads first, row last.** [submit.js](components/WorkshopCyberDefence/Registration/submit.js)
settles both storage uploads together, then posts the row to the route with
whichever paths survived and returns `missing`. A row whose `proof_path` points at an
object that never arrived reads as a working registration until somebody clicks it.
The columns store **paths, not URLs** — the bucket is private, so a stored URL would
be a signed one with an expiry baked in; `createSignedUrl()` is called at the moment
a coordinator looks. A 409 from an upload is read as success, not failure: a retry
re-uploads to paths named after a ticket code it already used, and counting "already
there" as missing would file null paths over files that exist.

**Filed on the way out of step 2, not into step 4.**
[useFiling.js](components/WorkshopCyberDefence/Registration/useFiling.js) encodes the
QR, draws the ticket and sends the lot when *Continue* is pressed on the payment
step — which is why `advance` in
[Registration/index.jsx](components/WorkshopCyberDefence/Registration/index.jsx) is
async and can refuse to move. The rate limit forced this: a refusal has to arrive
somewhere it can be acted on, and a screen already holding a ticket is not that
place. Steps 3 and 4 are a receipt — by the time either renders, nothing can fail.
The corollary is that **Back disappears once the row is filed**; everything behind it
edits a form that no longer writes anywhere.

The two [Celebration](components/WorkshopCyberDefence/Registration/Celebration.jsx)
curtains hang off the same fact. `filed` is fired from the payment step's *result*
and never from a step merely changing, which is the difference between a tick that
means something and decoration. It is `fixed`, not an overlay inside the panel (a
mark centred in a two-screen-tall step lands below the fold), and it deliberately
does **not** raise `document.body.style.overflow` — the step swaps behind it in the
same tick, and locking the body would cancel the scroll that swap depends on.

**A QR is not a credential.** It is cut in the student's browser before anyone checks
their payment, and it can be forwarded. The [Scanner](components/Admin/Scanner/index.jsx)
uses the code only to *find the row*, and `status` decides. That check is made twice
on purpose: once for the message on screen, and once in the `update` itself via
`.eq("status", ADMITS)`, so the database refuses to record attendance for an
unverified ticket even if the component is wrong. Keep both.

The three statuses are stated once in [Registrations/status.js](components/Admin/Registrations/status.js)
and must match the `check` constraint in the SQL. The dropdown, the row tag and the
scanner's verdict all read from that list — two lists that drift by one string is a
student being refused at a door with a verified ticket.

`attended_at` is written in exactly one place (the scanner), which is what makes
[Attendance](components/Admin/Attendance/index.jsx) an attendance sheet rather than a
second opinion. It polls every 15s; Realtime would need the table added to a
publication, which is a schema change polling does not require.

## Verifying visual changes

Layout arithmetic here is load-bearing and easy to get wrong on paper. When a change
touches a pinned section, screenshot it — and screenshot a **production build**, not
the dev server, which serves stale Tailwind CSS for newly added arbitrary utilities
(a fresh `opacity-[0.03]` simply is not in the stylesheet, and the bug looks like a
design mistake). Check `getComputedStyle` before believing a screenshot. The sizes
that matter are 390×844 and 1440×900 (two different layouts), plus 768×1024 and a
landscape 844×390 for the short-viewport cases where slides stop fitting.

The registration form and the scanner are phone-first and want checking at 390×844
specifically: form fields are `text-base` (16px) because anything smaller makes iOS
Safari zoom the page on focus, and the scanner's viewfinder is capped in `svh` as
well as pixels for the phone-held-sideways case.
