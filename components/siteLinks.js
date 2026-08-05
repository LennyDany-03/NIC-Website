/**
 * Everything the club has run, is running, or is about to run — one page.
 *
 * A route rather than a section, and the only entry in `NAV_LINKS` that is:
 * `/events` is a board of events, each of which already has (or will have) a
 * page of its own, and a front-page slide cannot hold a list that grows. It is
 * declared above the list because the list uses it.
 *
 * Unlike `GENESIS_HREF` and `WORKSHOP_HREF` below, this one is permanent. The
 * events on it come and go; the board does not.
 */
export const EVENTS_HREF = "/events";

/**
 * The site's table of contents, stated once.
 *
 * Both the navbar and the footer are lists of the same links, and they were
 * going to be maintained by different people at different times — a section
 * renamed in one and not the other is the kind of drift nobody notices until a
 * link goes nowhere.
 *
 * Every `#` entry here is a `Slide` id from the front page's sections. The one
 * entry that is not a hash is a route, and `SectionLink` tells them apart by
 * that leading `#` rather than by a flag — see the note there on why a route
 * cannot go through the same branch a section does.
 *
 * Six links, and it wants to stay six: the desktop bar splits this list into
 * equal halves that flank the Genesis pill (`SPLIT_AT` in `Navbar`), and an odd
 * count leaves the two sides uneven. "Meet Us" came out when `/events` went in,
 * which is what kept the count. The `#meet-us` slide is still there and still
 * reachable by scrolling — it is off the *menu*, not off the page.
 */
export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Department", href: "#department" },
  { label: "Events", href: EVENTS_HREF },
  { label: "Vision", href: "#vision" },
  { label: "Crew", href: "#masterminds" },
  { label: "Archive", href: "#archive" },
];

/**
 * The one destination on this site that is not a section of the front page.
 *
 * Stated here with the rest of the table of contents because three places link
 * it — the navbar's button, the mobile sheet's, and the footer's — and a route
 * that moves should move in one edit.
 */
export const JOIN_HREF = "/join";

/**
 * Genesis'26 — the symposium, and the second route that is not a section of the
 * front page.
 *
 * Stated here with the rest of the table of contents for the same reason
 * `JOIN_HREF` is: the bar and the mobile sheet both link it, and a route that
 * moves should move in one edit. Deliberately not in `NAV_LINKS` — that list is
 * the front page's sections, and every href in it is a hash the smooth-scroll
 * layer expects to intercept.
 *
 * Unlike the entries above, this one is expected to be temporary. It is an
 * event with a date on it, and the day Genesis'26 has been run the honest thing
 * is to file it in the archive's ledger and take the button out of the bar —
 * at which point this constant and `components/Genesis26/` go together.
 */
export const GENESIS_HREF = "/genesis-26";

/** What the button says. Set here so the bar and the sheet cannot disagree. */
export const GENESIS_LABEL = "Genesis '26";

/**
 * The Modern Cyber Defence workshop — 20 August 2026.
 *
 * One route, not two. There was a `/register` beside this one while sign-ups
 * were shut, because an event page and a closed form answer different questions
 * and get shared separately. Once registration opened there was only one
 * question left, and a visitor who has to find a second link before they can
 * answer it is a visitor given an extra chance to leave — so the form moved onto
 * this route and the other one went. Anything still holding the old URL lands on
 * the page it was trying to reach.
 *
 * Stated here with the rest of the table of contents for the reason `JOIN_HREF`
 * is: more than one place links it, and a route that moves should move in one
 * edit. Deliberately not in `NAV_LINKS` — that list is the front page's
 * sections, and every href in it is a hash the smooth-scroll layer intercepts.
 * `/events` is where this is reached from instead, which is a board built to
 * outlive any one event on it.
 *
 * Like `GENESIS_HREF`, this is expected to be temporary. The day after the
 * workshop has run, the honest thing is to file it in the archive's ledger; at
 * that point this constant and `components/WorkshopCyberDefence/` go together.
 */
export const WORKSHOP_HREF = "/events/workshop-modern-cyber-defence";

/**
 * Where the club itself is reached, as opposed to any one member of it.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 * The footer renders all four channels whether or not they are set — a missing
 * one is a dimmed, dead tile rather than a gap — so the strip keeps its shape
 * while these are still being collected. Drop the handles in as they come:
 *
 *   email: "nic@example.com",              // rendered as a mailto:
 *   instagram: "https://instagram.com/...",
 *   linkedin: "https://linkedin.com/company/...",
 *   github: "https://github.com/...",
 * ---------------------------------------------------------------------------
 */
export const CLUB_LINKS = {
  email: "",
  instagram: "",
  linkedin: "",
  github: "",
};
