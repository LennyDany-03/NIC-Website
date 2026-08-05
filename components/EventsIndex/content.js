/**
 * The events board: what the club has coming, and what it has already run.
 *
 * Almost nothing here is written down twice. The two upcoming events state
 * their own dates, titles and status in their own folders — those folders are
 * what the event pages are built from — and this file imports them rather than
 * transcribing them. A board that carried its own copy of "20 August 2026"
 * would be a second place to forget to change, and the failure mode is the one
 * that matters most on an events page: a date that is wrong somewhere.
 *
 * The past half is the archive's ledger, imported flat for the same reason. The
 * club's history is one list; the front page's archive slide and this board are
 * two ways of reading it.
 */

import { ENTRIES } from "../ArchiveSequence/content";
import { GENESIS_HREF, WORKSHOP_HREF } from "../siteLinks";
import {
  EVENT as GENESIS,
  STARTS_AT_ISO as GENESIS_STARTS_AT_ISO,
  STARTS_AT_MS as GENESIS_STARTS_AT_MS,
} from "../Genesis26/content";
import {
  EVENT as WORKSHOP,
  POSTER as WORKSHOP_POSTER,
  STARTS_AT_ISO as WORKSHOP_STARTS_AT_ISO,
  STARTS_AT_MS as WORKSHOP_STARTS_AT_MS,
} from "../WorkshopCyberDefence/content";

export const BOARD = {
  eyebrow: "The board",
  lead: "Events",
  body: `Everything NIC puts on, in one place. What is coming has a page of its own and a clock running against it; what has already run is kept below, dated, in the order it happened. The club has been running workshops, hackathons and symposiums since July 2024 — this is the whole of it.`,
  note: "Upcoming first, then the record",
};

/**
 * The events that have not happened yet.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN — as events come and go
 *
 * Adding one: give it a folder and a route the way the two below have, then put
 * an entry here importing its dates from that folder. `poster` is optional — an
 * event without artwork gets a lettered plate instead of a hole in the grid.
 *
 * Retiring one: the morning after an event has run, its entry comes out of this
 * list and a row goes into the ledger in `ArchiveSequence/content.js`. That is a
 * deliberate editorial act rather than something computed from the clock. A
 * board that sorted itself by `Date.now()` would have to decide "past" during
 * server rendering, where there is no now that will still be true when the page
 * is read — the same trap `useCountdown` documents — and it would file an event
 * under history at 9:01 AM while the room was still filling up.
 *
 * When the last entry is removed, the section renders its empty state rather
 * than disappearing: "nothing on the board" is a true and useful thing for this
 * page to say, and a page that showed only a ledger would look broken.
 * ---------------------------------------------------------------------------
 *
 * `accent` picks which of the two event palettes a card is trimmed in — see
 * `ACCENTS` in `EventCard`. It is the one thing here that is about looks rather
 * than fact, and it is set per event because these two events genuinely are two
 * different posters: the workshop is teal off its own artwork, Genesis is the
 * symposium's gold. The board is the noticeboard, not the poster.
 */
const SCHEDULED = [
  {
    id: "workshop-modern-cyber-defence",
    href: WORKSHOP_HREF,
    accent: "cyber",
    kind: WORKSHOP.kind,
    lead: WORKSHOP.lead,
    title: WORKSHOP.title,
    status: WORKSHOP.status,
    dateLabel: WORKSHOP.dateLabel,
    timeLabel: WORKSHOP.timeLabel,
    startsAtIso: WORKSHOP_STARTS_AT_ISO,
    startsAtMs: WORKSHOP_STARTS_AT_MS,
    poster: WORKSHOP_POSTER,
    /* Not `WORKSHOP.body`. That paragraph is read by somebody who has already
       opened the event page and wants the day explained; this one is read by
       somebody deciding whether to. Shorter, and it ends on the reason to. */
    body: `A full day on how modern estates are actually defended — asset protection, zero trust, and end-to-end security across cloud and hybrid IT — taught in three sessions by a training director at ISACA.`,
    cta: "Open the workshop",
  },
  {
    id: "genesis-26",
    href: GENESIS_HREF,
    accent: "gold",
    kind: "Symposium",
    lead: GENESIS.lead,
    title: `${GENESIS.lead}${GENESIS.edition}`,
    status: GENESIS.status,
    dateLabel: GENESIS.dateLabel,
    timeLabel: "",
    startsAtIso: GENESIS_STARTS_AT_ISO,
    startsAtMs: GENESIS_STARTS_AT_MS,
    poster: null,
    body: `The club's flagship symposium, back for a third year — the two days NIC stops running workshops and runs a room instead. Programme and venue are still being finalised.`,
    cta: "Open Genesis '26",
  },
];

/**
 * Soonest first.
 *
 * Sorted here rather than maintained in order by hand, because the list above is
 * edited by whoever is adding their event and "put it in the right place" is an
 * instruction that gets followed until it doesn't. Sorting on the same
 * millisecond the clocks count to means the board and the countdowns can never
 * disagree about which event is next.
 */
export const UPCOMING = [...SCHEDULED].sort(
  (a, b) => a.startsAtMs - b.startsAtMs,
);

/** The whole of the record, newest first — the ledger's own order. */
export const PAST = ENTRIES;

/**
 * The strip under the wordmark: the four things somebody scans for on a board.
 *
 * Counted rather than typed. The two totals are the lengths of the lists above,
 * so they cannot drift from what is rendered under them, and "next" is read off
 * the sorted list rather than named — the day the workshop is retired, this
 * strip says Genesis without anybody editing it.
 */
export const FACTS = [
  {
    id: "upcoming",
    label: "Upcoming",
    value: String(UPCOMING.length).padStart(2, "0"),
  },
  { id: "next", label: "Next", value: UPCOMING[0]?.dateLabel ?? "" },
  {
    id: "record",
    label: "On the record",
    value: String(PAST.length).padStart(2, "0"),
  },
  { id: "since", label: "Running since", value: "July 2024" },
];

/** The three faces the card clocks carry. Seconds belong on an event page. */
export const CARD_UNITS = [
  { id: "days", label: "Days" },
  { id: "hours", label: "Hrs" },
  { id: "minutes", label: "Min" },
];
