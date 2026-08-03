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

## What this is

A one-page site for NIC (Nextgen Intelligence Club), plus a `/join` route. Next.js
16 App Router, React 19, Tailwind v4, framer-motion. TypeScript is configured with
`allowJs`, and everything except [app/layout.tsx](app/layout.tsx) is `.jsx` — new
components follow suit.

Tailwind v4 is CSS-first: there is no `tailwind.config`. Theme colours
(`nic-red`, `nic-ember`, `nic-bone`) and the custom `@utility` rules live in
[app/globals.css](app/globals.css).

## Two layouts, one page

The single most important structural fact: this site is **two different layouts**,
not one layout at two sizes. The split is
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
term years) — these are placeholders awaiting real data, not bugs.

[siteLinks.js](components/siteLinks.js) is the page's table of contents, stated once
for both navbar and footer; every `href` there must match a `Slide` `id` below.

Shared vocabulary, used everywhere rather than re-invented per section:
[surfaces.js](components/surfaces.js) (`PANEL`, `HEADING_SHADOW`, `LABEL_SHADOW`,
`GRAIN_PLATE`) and [motionPresets.js](components/motionPresets.js) (`slideRise`,
`seatCard`, …). Slide reveals run in **both** directions (`once: false`) because a
slide can be dealt again when the visitor scrolls back, and each variant carries its
own transition — passing a `transition` prop to a child would override both.

## Verifying visual changes

Layout arithmetic here is load-bearing and easy to get wrong on paper. When a change
touches a pinned section, screenshot it — and screenshot a **production build**, not
the dev server, which serves stale Tailwind CSS for newly added arbitrary utilities
(a fresh `opacity-[0.03]` simply is not in the stylesheet, and the bug looks like a
design mistake). Check `getComputedStyle` before believing a screenshot. The sizes
that matter are 390×844 and 1440×900 (two different layouts), plus 768×1024 and a
landscape 844×390 for the short-viewport cases where slides stop fitting.
