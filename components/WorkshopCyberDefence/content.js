/**
 * Everything the Modern Cyber Defence workshop says about itself, kept apart
 * from the layout the way every other section on this site keeps its copy.
 *
 * All of it is transcribed from the poster in
 * `public/posters/workshop-modern-cyber-defence.jpeg`, which is the document
 * that will have been printed, put on a noticeboard and forwarded round a dozen
 * WhatsApp groups. When the two disagree the poster is right and this file is
 * the thing to fix — a page that lists a session at a time nobody else is
 * expecting is worse than no page.
 */

/**
 * The instant the doors open: 20 August 2026, 9 AM, stated in IST.
 *
 * The explicit `+05:30` is the single most important character sequence in this
 * folder — the same rule Genesis'26 records for the same reason. A bare
 * `2026-08-20T09:00` is parsed in whatever zone the reader happens to be in, so
 * the clock would count to a different moment for someone opening the link from
 * outside India and quietly be wrong for both of them. Pinned to IST, everybody
 * is counting to the one morning the workshop actually starts.
 *
 * Parsed once at module scope: with the offset stated, `Date.parse` returns the
 * same number on the server and in the browser, so this is safe to share.
 */
export const STARTS_AT_ISO = "2026-08-20T09:00:00+05:30";
export const STARTS_AT_MS = Date.parse(STARTS_AT_ISO);

/** Who is putting it on, in the order the poster stacks it. */
export const HOST = [
  "SRM Institute of Science and Technology",
  "Faculty of Engineering and Technology",
  "Vadapalani Campus, Chennai – 26",
  "Department of Computer Science and Engineering (Emerging Technologies)",
  "Nextgen Intelligence Club",
];

export const EVENT = {
  kind: "Workshop",
  /* The title is set in two pieces so the second half can take the colour and
     the line break, the same way the Genesis wordmark splits its year off. */
  lead: "Workshop on",
  title: "Modern Cyber Defence",
  status: "Registration opening soon",
  dateLabel: "20 August 2026",
  timeLabel: "9:00 AM – 3:00 PM",
  dayLabel: "One day, three sessions",
  body: `One day on how modern estates are actually defended, run end to end by somebody who does it for a living. Three sessions take it in order — locking down the assets you already have, replacing the trusted-network assumption with a zero trust design, and carrying both across the cloud services the rest of the stack now runs on.`,
  note: "Open to students of the department. Bring a laptop — the sessions are worked through rather than watched.",
};

/**
 * The strip under the countdown: the four things somebody scans for before they
 * read a word.
 *
 * An empty `value` is not a bug and does not want a placeholder invented for it
 * — it renders dimmed as "To be announced", the same way an unfilled board seat
 * and an open ledger row do elsewhere on this site.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 *   venue — the poster prints the word VENUE with nothing after it, so the hall
 *           was not booked when it went to print. Block and room number here as
 *           soon as it is, because this is the one fact on the page a visitor
 *           cannot get from anywhere else.
 * ---------------------------------------------------------------------------
 */
export const FACTS = [
  { id: "date", label: "Date", value: "20 Aug 2026" },
  { id: "time", label: "Time", value: "9 AM – 3 PM" },
  { id: "venue", label: "Venue", value: "" },
  { id: "registration", label: "Registration", value: "Opening soon" },
];

/**
 * The strip that runs across the page under the hero.
 *
 * Short words only — it moves, and anything longer than a couple of syllables
 * cannot be read while it does.
 */
export const MARQUEE = [
  "Modern Cyber Defence",
  "20 August 2026",
  "9 AM – 3 PM",
  "Zero Trust",
  "Cloud Security",
  "SRMIST Vadapalani",
];

/**
 * The day, in the three blocks the poster breaks it into.
 *
 * Unlike Genesis'26 — whose programme is four deliberately empty slots — this
 * one is fully scheduled already, times and titles both, which is why the page
 * leads on the day rather than on a promise. Only registration is outstanding.
 */
export const SESSIONS = [
  {
    id: "session-1",
    label: "Session 1",
    start: "9:00 AM",
    end: "10:30 AM",
    title: "Protect Digital Assets by using Industry Leading CyberSecurity Best Practices",
    note: `Where a defence actually starts: what you own, what it is worth and the controls the industry has settled on for keeping hold of it.`,
  },
  {
    id: "session-2",
    label: "Session 2",
    start: "10:45 AM",
    end: "12:30 PM",
    title: "Build and Implement a Modern Zero Trust Security Strategy",
    note: `The assumption that the inside of the network is friendly, taken away — and what identity, segmentation and continuous verification put in its place.`,
  },
  {
    id: "session-3",
    label: "Session 3",
    start: "1:15 PM",
    end: "3:00 PM",
    title: "Achieve End-to-End Security for Modern IT and Cloud Environments",
    note: `Carrying the first two sessions across a stack that no longer sits in one building — hybrid IT, cloud workloads, and the seams between them.`,
  },
];

/**
 * Who is running it.
 *
 * `initials` is set here rather than derived from the name. There is no
 * headshot in the repo — the only photograph of the speaker anywhere on this
 * site is the one composited into the poster — so the card wears a monogram,
 * and a monogram computed by splitting on spaces gets titles, honorifics and
 * two-part surnames wrong often enough that it is worth writing the two letters
 * that are meant to be there.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 *   photo — drop a headshot in `public/crew` and put its path here; the card
 *           swaps the monogram for it without any other edit.
 * ---------------------------------------------------------------------------
 */
export const SPEAKER = {
  name: "Sivva Kannan",
  honorific: "Mr.",
  initials: "SK",
  photo: null,
  roles: [
    "Director – Training, ISACA",
    "CyberSecurity Associate Manager, E & Y",
  ],
  place: "Chennai, India",
  blurb: `Training director at ISACA and a cybersecurity associate manager at E & Y — which is to say the sessions are being taught by somebody who spends the rest of the week doing this to real estates rather than to a lab.`,
};

/**
 * The people to ask, in the order of who to ask first.
 *
 * The students are top of the list on purpose: they are the ones the poster
 * gives phone numbers for, and a visitor with a question about registration
 * wants a number, not a designation. `tel` is stored unpunctuated so it can go
 * straight into a `tel:` href; `phone` is the same number set the way it is read
 * aloud.
 */
export const COORDINATORS = {
  students: [
    { id: "moheeth", name: "Moheeth", phone: "78455 91717", tel: "+917845591717" },
    { id: "lohith", name: "Lohith", phone: "94423 91673", tel: "+919442391673" },
  ],
  faculty: [
    {
      id: "convener",
      role: "Convener",
      name: "Dr. P. Chitra",
      note: "Head of the Department",
    },
    {
      id: "faculty-coordinator",
      role: "Faculty Coordinator",
      name: "Dr. K. Meenakshi",
      note: "Assistant Professor",
    },
  ],
};

/**
 * What the registration page is currently able to say.
 *
 * The form on `/events/workshop-modern-cyber-defence/register` is a preview
 * with every field disabled, and this is the copy that has to make that read as
 * "not yet" rather than as "broken". `opensLabel` is deliberately vague because
 * the date genuinely is not set; give it a real one — "Opens 8 August" — the
 * moment it is, and the page needs no other edit.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 *   opensLabel — when the form goes live.
 *   formHref   — if registration ends up running on a Google Form or the like,
 *                put the URL here: the register page turns its dead button into
 *                a live link to it and drops the "opening soon" notice.
 * ---------------------------------------------------------------------------
 */
export const REGISTRATION = {
  status: "Opening soon",
  opensLabel: "",
  formHref: "",
  headline: "Registration",
  /* Two ledes, because they are read in two places and one of them cannot say
     "below": the event page's band is pointing at a route, the registration
     page's is introducing the form directly under it. */
  teaser: `Sign-ups are not open yet. The registration page is up already though — it lays out exactly what the form will ask for, so there is nothing to be caught out by on the day it opens.`,
  lede: `Sign-ups for the workshop are not open yet. This is the page they will open on — the form below is exactly the one that will go live, so this is what to have ready.`,
  note: "Seats are limited by the hall, and the department's own students are taken first.",
};

/**
 * The fields the form will ask for, previewed while it is closed.
 *
 * Kept as data rather than as markup because the point of showing a dead form
 * is that it is the real one: when registration opens, this list is what gets
 * wired to a handler, and a list that had drifted from the fields on screen
 * would make a liar of the preview.
 */
export const REGISTRATION_FIELDS = [
  { id: "name", label: "Full name", type: "text", placeholder: "As it appears on your ID card", autoComplete: "name" },
  { id: "register-number", label: "Register number", type: "text", placeholder: "RA…", autoComplete: "off" },
  { id: "email", label: "College email", type: "email", placeholder: "you@srmist.edu.in", autoComplete: "email" },
  { id: "phone", label: "Phone", type: "tel", placeholder: "10 digits", autoComplete: "tel" },
  { id: "department", label: "Department", type: "text", placeholder: "CSE (Emerging Technologies)", autoComplete: "organization" },
  { id: "year", label: "Year of study", type: "text", placeholder: "I / II / III / IV", autoComplete: "off" },
];

/** The four faces of the clock, in the order they are read. */
export const UNITS = [
  { id: "days", label: "Days" },
  { id: "hours", label: "Hours" },
  { id: "minutes", label: "Minutes" },
  { id: "seconds", label: "Seconds" },
];

/** The poster itself, and the size it was scanned at. */
export const POSTER = {
  src: "/posters/workshop-modern-cyber-defence.jpeg",
  width: 1131,
  height: 1600,
  alt: "Poster for the Workshop on Modern Cyber Defence, 20 August 2026, 9 AM to 3 PM, at SRM Institute of Science and Technology, Vadapalani.",
};
