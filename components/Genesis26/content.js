import { LEDGER } from "../ArchiveSequence/content";

/**
 * Everything Genesis'26 says about itself, kept apart from the layout the way
 * every other section on this site keeps its copy.
 *
 * Most of this page is a date and a number counting down to it, which means
 * almost all of it is a fact rather than a sentence — and facts about an event
 * a month out are exactly the things that change. Keeping them here means the
 * day the venue is booked is a one-line edit to this file, not a hunt through
 * markup.
 */

/**
 * The instant the countdown counts to.
 *
 * Written with an explicit `+05:30` rather than as a bare `2026-09-02`, and
 * this is the single most important line in the folder. A bare date string is
 * parsed as UTC midnight, so the clock would read one number for someone in
 * Kattankulathur and a different one for someone opening the same link on an
 * exchange semester — and both would be wrong about when the doors open. Pinned
 * to IST, every visitor is counting down to the same moment, which is the only
 * thing a countdown is for.
 *
 * Parsed once at module scope: with the offset stated, `Date.parse` returns the
 * same number on the server and in the browser, so this is safe to share.
 */
export const STARTS_AT_ISO = "2026-09-02T00:00:00+05:30";
export const STARTS_AT_MS = Date.parse(STARTS_AT_ISO);

/**
 * The editions already run, taken from the club's ledger rather than restated
 * here — the archive is where an event goes once it has happened, and a list of
 * past Genesises maintained in two files would disagree within a year.
 *
 * `genesis-2026` is filtered out deliberately, not defensively: this page is
 * live until the symposium runs, and the first thing anyone will do afterwards
 * is file it in the ledger. Without this the edition number below would tick to
 * 04 on the day Genesis'26 became a past event.
 */
export const PAST_EDITIONS = LEDGER.screens
  .flat()
  .filter((entry) => entry.id.startsWith("genesis-") && entry.id !== "genesis-2026");

/** Set in a mono tag, so a numeral rather than an ordinal word. */
export const EDITION_NO = String(PAST_EDITIONS.length + 1).padStart(2, "0");

export const EVENT = {
  eyebrow: "Genesis '26",
  /* The wordmark is set in two pieces so the apostrophe-year can be coloured
     and tracked apart from the name. */
  lead: "Genesis",
  edition: "'26",
  status: "Coming soon",
  dateLabel: "2 September 2026",
  body: `NIC's flagship symposium is back for a third year. Genesis is the two days the club stops running workshops and runs a room instead — the whole department in one place, the year's work put in front of people who did not build it, and everything the club has learned since the last one pointed at whoever turns up.`,
  note: "The full programme, the venue and how to register are being finalised. This page is where they will land.",
};

/**
 * The strip under the countdown: the four things somebody scans for before they
 * read a word of the copy.
 *
 * An empty `value` is not a bug and does not want a placeholder invented for
 * it — it renders dimmed as "To be announced", the same way an unfilled board
 * seat and an open ledger row do elsewhere on this site. Fill them in as they
 * are settled.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 *   venue         — the block and hall, once it is booked.
 *   registration  — "Opens 15 Aug", a fee, or a link's worth of words.
 * ---------------------------------------------------------------------------
 */
export const FACTS = [
  { id: "date", label: "Dates", value: "2 Sep 2026" },
  { id: "venue", label: "Venue", value: "" },
  { id: "host", label: "Hosted by", value: "NIC · CSE E-Tech" },
  { id: "registration", label: "Registration", value: "" },
];

/**
 * The strip that runs across the page under the hero.
 *
 * Short words only — it moves, and anything longer than a couple of syllables
 * cannot be read while it does.
 */
export const MARQUEE = [
  "Genesis '26",
  "2 September",
  "Coming soon",
  "SRMIST",
  "Next Gen Intelligence Club",
];

/**
 * What the two days hold.
 *
 * Every slot is deliberately empty. Genesis'24 and '25 both ran a mix of talks,
 * competitions and workshops, but *which* ones is not decided yet, and a
 * "coming soon" page that invents a keynote it does not have is the one thing
 * that would make the rest of it untrustworthy. A slot with no `title` renders
 * as an open entry — numbered, dimmed, honest — exactly like an unfilled row in
 * the archive's ledger.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 * Give a slot a `title` and it lights up; add a `note` and the tile grows a
 * sentence. Add or remove slots freely — they are laid out in a grid that takes
 * any count. Drop the file down to what actually got scheduled once it is
 * scheduled; four is a placeholder count, not a target.
 *
 *   { id: "keynote", kind: "Talk", title: "...", note: `One sentence.` }
 * ---------------------------------------------------------------------------
 */
export const PROGRAMME = [
  { id: "slot-1", kind: "", title: "", note: "" },
  { id: "slot-2", kind: "", title: "", note: "" },
  { id: "slot-3", kind: "", title: "", note: "" },
  { id: "slot-4", kind: "", title: "", note: "" },
];

/** The four faces of the clock, in the order they are read. */
export const UNITS = [
  { id: "days", label: "Days" },
  { id: "hours", label: "Hours" },
  { id: "minutes", label: "Minutes" },
  { id: "seconds", label: "Seconds" },
];
