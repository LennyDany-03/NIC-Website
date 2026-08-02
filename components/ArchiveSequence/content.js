/**
 * The visual archive: what the club has actually run, and what it has to show
 * for it.
 *
 * Two kinds of record, on the same backdrop. The ledger is the written half —
 * dated, countable, the line a report would carry. The cluster is the other
 * half, which is the half nobody writes down: a few hundred photographs that
 * are the only evidence a room was ever that full.
 */

export const ARCHIVE = {
  eyebrow: "08 — Visual archive",
  lead: "Visual",
  accent: "Archive",
  body: `Every workshop, every certification drive and every symposium leaves the same two things behind: a line in a report, and a camera roll nobody has looked at since. This is where both are kept. What follows is the record of what NIC has run — the part that can be counted, and the part that can only be seen.`,
  note: "The record, and the camera roll",
};

/*
 * ---------------------------------------------------------------------------
 * The ledger
 *
 * The list itself — titles, dates and what kind of thing each one was — came
 * from the club's own event register. Two of them carry more than that: the LLM
 * and Design workshops were also photographed, and their times, sessions and
 * resource persons were read straight off the slides legible on the screen in
 * /public/gallery. That is why those two have a note and the rest do not. A
 * note is optional here on purpose: an entry with nothing filed against it
 * renders as title and date alone rather than padded out with an invented
 * sentence, and the day someone can say what a workshop actually covered, the
 * line goes in and the row grows.
 *
 * A slot with no `title` renders as an open entry — dimmed, numbered, honest —
 * the way an unfilled board seat does. There are none at the moment; leave the
 * shape in place for the next one that has a date before it has a write-up.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN — the rest
 *
 * Newest first. `year` is whatever reads as the date — "2025", "Aug 2024",
 * "21–22 Aug 2024"; it is set in mono in a tag, so short is better, and the
 * dash between two days is an en dash. `kind` is the one-word register the
 * event belongs to — Workshop, Symposium, Hackathon, Event — and it sits
 * beside the date. `note` is optional: one or two sentences on what it was and
 * what came of it, and nothing at all if nobody can say.
 *
 *   {
 *     id: "ai-workshop-25",
 *     year: "2025",
 *     kind: "Workshop",
 *     title: "Two-day workshop on applied machine learning",
 *     note: `What it was, who turned up, and what the club got out of running
 *            it. One or two sentences — this is a ledger, not a write-up.`,
 *   }
 *
 * Add or remove freely: rows are dealt `ENTRIES_PER_SCREEN` at a time and a
 * short last screen is fine.
 * ---------------------------------------------------------------------------
 */
const ENTRIES = [
  {
    id: "prompt-odyssey-2026",
    year: "16 Jul 2026",
    kind: "Event",
    title: "Prompt Odyssey",
    note: `Run for AI Appreciation Day.`,
  },
  {
    id: "hackforge-2026",
    year: "9–10 Mar 2026",
    kind: "Hackathon",
    title: "Hackforge'26",
  },
  {
    id: "power-bi-2026",
    year: "9 Feb 2026",
    kind: "Workshop",
    title: "Power BI Workshop",
  },
  {
    id: "genesis-2025",
    year: "25–26 Sep 2025",
    kind: "Symposium",
    title: "Genesis'25",
  },
  {
    id: "prompt-engineering-2025",
    year: "19 Sep 2025",
    kind: "Workshop",
    title: "Prompt Engineering Workshop",
  },
  {
    id: "uiux-workshop-2025",
    year: "22 Aug 2025",
    kind: "Workshop",
    title: "UI/UX Design Workshop",
  },
  {
    id: "ai-solutions-2025",
    year: "5–6 Mar 2025",
    kind: "Workshop",
    title: "AI Powered Solutions for the Future: Scalable and Smart Systems",
  },
  {
    id: "hackforge-2025",
    year: "12–13 Feb 2025",
    kind: "Hackathon",
    title: "Hackforge'25",
  },
  {
    /*
     * Filed as 4 October *2025* in the register it was copied from, which
     * cannot be right: Genesis'25 ran 25–26 September 2025, so the '24 edition
     * would be sitting a week after the '25 one. Every other name on this list
     * carries the year it was held, so 2024 is what is set here — the one date
     * on the page that was worked out rather than read, and the one worth
     * confirming against the report before this ships.
     */
    id: "genesis-2024",
    year: "4 Oct 2024",
    kind: "Symposium",
    title: "Genesis'24",
  },
  {
    id: "rust-blockchain-2024",
    year: "21–22 Aug 2024",
    kind: "Workshop",
    title: "Role of the Rust Language in Blockchain Development",
  },
  {
    id: "design-workshop-2024",
    year: "20 Aug 2024",
    kind: "Workshop",
    title: "Design Workshop",
    note: `A full-day design workshop, 9am to 3pm, run with Skill Dragon — Mr. Prathyaksh, its founder and CEO, and Mr. A. G. Karthik, its CTO and co-founder. Faculty coordinator: Dr. J. Arun Nehru.`,
  },
  {
    id: "llm-workshop-2024",
    year: "14 Aug 2024",
    kind: "Workshop",
    title: "Workshop on Large Language Models and their Applications",
    note: `A full-day workshop, 9am to 3pm, in three sessions: an introduction to large language models, their use cases, and an interactive session with the participants. Resource person: Mr. Muthukumar Arumugam, CEO and Managing Director of IN22 Labs, Chennai.`,
  },
];

/*
 * ---------------------------------------------------------------------------
 * The cluster
 *
 * The seven photographs in /public/gallery, dealt four to a screen as a
 * mosaic: the first of each screen runs large and the rest fill in beside it,
 * which is what makes a wall of photographs read as a cluster rather than a
 * contact sheet. See CLUSTER_SPANS in the component for how a screen of two,
 * three or four is tiled — every one of them fills the grid exactly, so a
 * short last screen leaves no holes.
 *
 * The order is deliberate. Each screen leads on the shot that says which event
 * it was — the one with the banner still on the projector — and the room and
 * lab shots follow, which is roughly how anyone tells the story of a day.
 *
 * Every `alt` below describes what is actually in the frame. None of them name
 * anybody: the people are recognisable in the photographs and several are on
 * the board above, but who is in which picture was not something the pictures
 * themselves could tell me. Add names where you know them — that is a better
 * description than "four students".
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN — more
 *
 * `src` is a path under /public. Keep the names URL-safe: no spaces, no
 * apostrophes. A slot with `src: null` renders as a numbered plate, so new
 * photographs can land a few at a time without the grid ever breaking.
 *
 * `alt` is not optional once `src` is set — it is what the photograph says to
 * someone who cannot see it. Describe the scene, not the file.
 *
 * `caption` is the line stamped across the foot of the tile. Short.
 *
 * `focus` is optional and only matters in the lead cell, which is close to
 * square and will crop the sides off anything wider. "center" (the default),
 * "left", "right", "top" or "bottom" — set it to whichever edge the subject is
 * nearer, and check it against the lead cell rather than in a photo viewer.
 * ---------------------------------------------------------------------------
 */
const CLUSTER = [
  {
    id: "llm-room",
    src: "/gallery/gallery5.JPG",
    alt: "The Large Language Models workshop in a computer lab, faculty seated and standing in front of a wall screen carrying the event banner, one speaker addressing the room.",
    caption: "LLM Workshop · 14.08.24",
    // The banner is the right half of this frame, and it is what says which
    // event this was.
    focus: "right",
  },
  {
    id: "llm-memento",
    src: "/gallery/gallery7.jpeg",
    alt: "The guest speaker being presented with a memento in front of the workshop banner, faculty and students standing either side.",
    caption: "The resource person, received",
  },
  {
    id: "llm-audience",
    src: "/gallery/gallery6.jpeg",
    alt: "The workshop audience seated in rows of blue chairs facing the screen, a speaker standing at the front of the lab.",
    caption: "Session one · 09:49",
  },
  {
    id: "board-paper",
    src: "/gallery/gallery2.jpeg",
    alt: "Three students in formal blazers and lanyards sitting together in a computer lab, reading over a printed sheet.",
    caption: "Between sessions",
  },
  {
    id: "design-workshop",
    src: "/gallery/gallery11.jpg",
    alt: "Two presenters in Skill Dragon hoodies addressing the room at the Design Workshop, the event banner projected on the screen beside them.",
    caption: "Design Workshop · 20.08.24",
  },
  {
    id: "lab-laptop",
    src: "/gallery/gallery9.jpeg",
    alt: "Five students around a lab desk with a laptop open between them and a notebook laid out beside it, working through something together.",
    caption: "The work, mid-afternoon",
  },
  {
    id: "lab-floor",
    src: "/gallery/gallery8.jpeg",
    alt: "Four students standing in the computer lab, two of them holding open laptops, talking between the benches.",
    caption: "The lab floor",
  },
];

/**
 * How much of each record goes on one screen.
 *
 * Both are slides of the same deck the rest of the page is built from, so each
 * one has to stand inside a single viewport — four ledger rows is about what a
 * short laptop will carry once the running head is counted.
 *
 * Four tiles rather than five, because the mosaic is tiled by hand: a screen of
 * four, three, two or one all fill the 4x2 grid exactly (see CLUSTER_SPANS),
 * so however many photographs there are, no screen ends up with a hole in it.
 * At seven that deals cleanly as four and three.
 */
export const ENTRIES_PER_SCREEN = 4;
export const CLUSTER_PER_SCREEN = 4;

/** Deals a flat list into screens. A short last screen stays left-aligned. */
const intoScreens = (items, size) => {
  const screens = [];
  for (let i = 0; i < items.length; i += size) {
    screens.push(items.slice(i, i + size));
  }
  return screens;
};

const numbered = (items) =>
  items.map((item, index) => ({
    ...item,
    index: String(index + 1).padStart(2, "0"),
  }));

export const LEDGER = {
  eyebrow: "09 — On the record",
  short: "The ledger",
  title: "The Ledger",
  caption: "Dated, countable, and short of nothing but the pictures",
  screens: intoScreens(numbered(ENTRIES), ENTRIES_PER_SCREEN),
  total: ENTRIES.length,
};

export const GALLERY = {
  eyebrow: "10 — The cluster",
  short: "The cluster",
  title: "The Cluster",
  caption: "The half that was never written down",
  screens: intoScreens(numbered(CLUSTER), CLUSTER_PER_SCREEN),
  total: CLUSTER.length,
};
