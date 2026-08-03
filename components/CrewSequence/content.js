export const MASTERMINDS = {
  eyebrow: "04 — The masterminds",
  lead: "The",
  accent: "Masterminds",
  body: `Behind every build, every late deadline and every event that somehow came together on time, there is a faculty team that made the room for it. The masterminds set NIC's direction, open the doors that students cannot open alone, and hold the club to the standard it claims for itself.`,
  /**
   * The card art is already composed — grain plate, red corner ticks and the
   * role stamped into the top-left corner are baked into each 640x640 webp with
   * a transparent surround. The stamp is cropped out of the roster slides, which
   * set the role as live text beside the portrait instead.
   *
   * ---------------------------------------------------------------------------
   * FILL ME IN — `bio`
   *
   * Every `bio` below describes the *post*, not the person: nothing in it is a
   * claim about anyone's career, and none of it came from a source. It is there
   * so the layout reads as finished while you write the real ones. Replace each
   * with two or three sentences about that faculty member — what they teach or
   * research, and what they actually do for NIC.
   * ---------------------------------------------------------------------------
   */
  people: [
    {
      id: "chitra",
      index: "01",
      name: "Dr. P. Chitra",
      role: "Head of Department, CSE E-Tech",
      photo: "/crew/Chitra-HOD.jpg",
      crop: "50% 33%",
      bio: `Oversees the CSE E-Tech department, under which NIC was founded and to which it still answers. The club's remit — what it may run, who it may bring in, how far it may go — is set at this desk.`,
    },
    {
      id: "meenakshi",
      index: "02",
      name: "Dr. Meenakshi",
      role: "Faculty Coordinator",
      photo: "/crew/Meenakshi-NIC.webp",
      crop: "49% 35%",
      bio: `Faculty coordinator to the club: the standing link between a student board that changes every year and a department that does not. Approvals, rooms, and the difference between an idea and a scheduled event.`,
    },
    {
      id: "arun-nehru",
      index: "03",
      name: "Dr. Arun Nehru",
      role: "Faculty Coordinator",
      photo: "/crew/ArunNehru-NIC.webp",
      crop: "50% 33%",
      bio: `Faculty coordinator to the club, working alongside the technical side of what NIC builds — the workshops, the certification drives, and the symposiums the club puts its name to.`,
    },
  ],
};

/**
 * The stable key an admin's edited bio is stored under — see
 * /admin/dashboard/bod and useBioOverrides. Board seats get theirs stamped
 * on by `seat()` below, since a slug there needs the prefix and term this
 * file doesn't carry on a mastermind; a mastermind's own `id` is already
 * unique, so this just namespaces it.
 */
export const mastermindSlug = (id) => `mastermind-${id}`;

export const CREW = {
  eyebrow: "05 — Meet the crew",
  lead: "Meet the",
  accent: "Crew",
  body: `Seventeen posts run NIC day to day, and a couple of them are doubled up — the senior board sets the year's agenda and answers for it, the joint board carries it out and learns the job in the process. Every seat below is someone who volunteered for more work than they were asked for.`,
};

/*
 * ---------------------------------------------------------------------------
 * THE ROSTER
 *
 * `role` and `name` are the two things the card itself shows. Everything after
 * them is what the card's popup has to work with, and all of it is optional — a
 * seat with nothing but a name still opens, it just has less to say.
 *
 * `photo` is a path under /public. The portraits live in /public/crew/board and
 * were copied there from the source folder under clean, URL-safe names: spaces
 * and apostrophes in a filename survive the filesystem but not always the URL,
 * and next/image is fetching these over HTTP. A seat with `photo: null` falls
 * back to a numbered plate rather than breaking the row, so a missing portrait
 * can land later without anything else changing.
 *
 * ---------------------------------------------------------------------------
 * `crop` — where the face is
 *
 * Named `crop` rather than `focus` because `focus` is already taken, a few lines
 * below, by the thing a person works on — and a popup that prints "Focus: 47%
 * 52%" under someone's bio is what happens when two fields share a name.
 *
 * These are seventeen snapshots taken by seventeen people: a hedge, a stairwell,
 * a motorbike at night. The subject is wherever they happened to be standing —
 * half way down a wall of leaves in one, a third of the way down in another —
 * and every place the site shows a portrait crops it to a different shape: a 4:5
 * card in the roster, a band across the top of the popup on a phone, a tall
 * plate beside the copy on a desktop. One rule cannot serve all of that. `top`
 * was the rule, and on the photographs where the subject stands low it framed
 * the wall behind them and cut the head off at the bottom edge.
 *
 * So each photograph carries its own answer: the face's position in that frame,
 * as a percentage of its width and height, passed straight to `object-position`.
 * Because `object-fit: cover` maps the image's x% to the container's x%, a face
 * measured at "47% 52%" lands 52% of the way down whatever it is cropped into
 * and cannot be cropped out of it.
 *
 * To measure one: open the file, read off where the middle of the face sits
 * (left-to-right first, then top-to-bottom), and write it down. Check it against
 * the phone's popup rather than a photo viewer — that is the widest, meanest
 * crop on the site, and anything that survives it survives everywhere else. A
 * photograph with no `crop` is simply centred.
 *
 * One warning: measure it off what the browser draws, not off the file. Several
 * of these are phone photographs carrying an EXIF orientation flag — one is
 * stored on its side — and the browser turns them upright before cropping them.
 * ---------------------------------------------------------------------------
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN — `bio`
 *
 * Same rule as the faculty above: every `bio` here describes the *post*, not
 * the person. None of it came from a source and none of it is a claim about
 * anyone — it is there so a popup reads as finished while the real write-ups
 * are being collected. Replace each with two or three sentences about the
 * person: what they do for NIC, and what they were doing before the seat was
 * theirs.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN — `links`
 *
 * The popup shows four channels in a fixed order — email, Instagram, LinkedIn,
 * GitHub. A channel with no handle renders as a dimmed, dead tile rather than
 * disappearing, so the contact strip is the same shape on every card and it is
 * obvious which handles are still missing. Fill them in as they come:
 *
 *   links: {
 *     email: "someone@example.com",           // rendered as a mailto:
 *     instagram: "https://instagram.com/...",
 *     linkedin: "https://linkedin.com/in/...",
 *     github: "https://github.com/...",
 *   }
 *
 * `year`, `department` and `focus` are the optional meta lines above it.
 * ---------------------------------------------------------------------------
 */

const SENIOR_MEMBERS = [
  {
    role: "President",
    name: "Athithya S A",
    photo: "/crew/board/athithya-sa.png",
    crop: "43% 25%",
    bio: `The seat the year answers to. The president sets what NIC takes on, puts the club's name to it, and is the one asked afterwards how it went. Also holds Head of Design on this board.`,
    links: {},
  },
  {
    role: "Vice-President",
    name: "D.D. Moheeth Kumar",
    photo: "/crew/board/moheeth-kumar-dd.jpeg",
    crop: "46% 35%",
    bio: `Second chair, and the one that has to be able to take the first at no notice. The vice-president keeps the board's decisions moving between meetings and stands in wherever the president cannot be. Also holds Head of Logistics on this board.`,
    links: {},
  },
  {
    role: "Secretary & Treasurer",
    name: "G. Mohammed Azam",
    photo: "/crew/board/mohammed-azam-g.jpg",
    crop: "57% 29%",
    bio: `Both halves of the club's paperwork in one seat: the minutes, the members, the correspondence, and the money. What the club agreed to and what the club can afford are settled here.`,
    links: {},
  },
  {
    role: "Head of Working Committee",
    name: "Vivin K.S",
    photo: "/crew/board/vivin-ks.jpeg",
    crop: "51% 52%",
    bio: `Runs the committee that actually staffs an event — who is on the door, who is on the floor, and who is still there at the end putting the room back. The gap between a plan and a working day is this desk.`,
    links: {},
  },
  {
    role: "Technical Head",
    name: "Dinesh P",
    photo: "/crew/board/dinesh-p.jpeg",
    crop: "45% 31%",
    bio: `Owns everything of NIC's that runs on a machine — the site, the tooling, the workshops, and whatever has to work in front of a room on the day. The technical standard the club is held to is set here.`,
    links: {},
  },
  {
    role: "Head of Design",
    name: "Athithya S A",
    photo: "/crew/board/athithya-sa.png",
    crop: "43% 25%",
    bio: `Everything the club puts its name on has to look like the same club. Posters, decks, the stage, the site — the design head decides what NIC looks like and holds the line on it. Held alongside the presidency.`,
    links: {},
  },
  {
    role: "Head of Content",
    name: "K. Gopikasri",
    photo: null,
    bio: `Everything NIC says in writing: the captions, the copy on the posters, the scripts, the announcements. The content head decides how the club sounds and keeps it sounding that way.`,
    links: {},
  },
  {
    role: "Head of Outreach",
    name: "Neethu Jimmy Joy",
    photo: "/crew/board/neethu-jimmy-joy.png",
    crop: "45% 50%",
    bio: `Everyone NIC has to talk to who is not already in it — other clubs, other departments, speakers, sponsors, and the students who have not heard of the club yet. Outreach is where a room gets filled.`,
    links: {},
  },
  {
    role: "Head of Logistics",
    name: "D.D. Moheeth Kumar",
    photo: "/crew/board/moheeth-kumar-dd.jpeg",
    crop: "46% 35%",
    bio: `The hall, the permissions, the chairs, the projector, the food, and the timing of all of it. Logistics is the reason an event exists as a place people can turn up to. Held alongside the vice-presidency.`,
    links: {},
  },
];

const JOINT_MEMBERS = [
  {
    role: "Joint Secretary",
    name: "Mirulla Srithar",
    photo: "/crew/board/mirulla-srithar.jpg",
    crop: "47% 52%",
    bio: `Stands behind the secretary's half of the record — minutes, membership and the correspondence that keeps a club of this size answerable to itself.`,
    links: {},
  },
  {
    role: "Joint Treasurer",
    name: "S Lakshman",
    photo: "/crew/board/s-lakshman.jpg",
    crop: "48% 45%",
    bio: `Stands behind the money: what was budgeted, what was actually spent, and the receipts that have to reconcile the two once the event is over.`,
    links: {},
  },
  {
    role: "Joint Technical Head",
    name: "Lenny Dany Derek D",
    photo: "/crew/board/Lenny.jpeg",
    crop: "47% 38%",
    bio: `Stands behind the technical head — the site, the tooling and the workshops, and whatever has to be working before a room fills up.`,
    /*
     * Taken from this repository's git config, so it is worth a second look
     * before it ships. The other seats are waiting on their handles.
     */
    links: {
      email: "lennydany3@gmail.com",
      instagram: "https://instagram.com/lennydany3",
      linkedin: "https://www.linkedin.com/in/lenny-dany-derek-d/",
      github: "https://github.com/LennyDany-03",
    },
  },
  {
    role: "Joint Creative Head of Design",
    name: "Dishan Marrio I",
    photo: "/crew/board/dishani.jpeg",
    crop: "52% 48%",
    bio: `Stands behind the design head. Posters, decks and stage art — the volume of work the club's look actually costs, week to week.`,
    links: {},
  },
  {
    role: "Joint Creative Head of Content",
    name: "Sai Shrikar M K",
    photo: "/crew/board/sai-shrikar-mk.png",
    crop: "52% 30%",
    bio: `Stands behind the content head: the captions, the copy and the scripts, written to a deadline that is usually the same day.`,
    links: {},
  },
  {
    role: "Joint Head of Outreach",
    name: "Harish Dharrsan S S",
    photo: "/crew/board/harish-dharrsan-ss.jpg",
    crop: "40% 42%",
    bio: `Stands behind outreach — the follow-ups, the other clubs, and the part of filling a room that is one conversation at a time.`,
    links: {},
  },
  {
    role: "Joint Head of Working Committee",
    name: "S Lohith",
    photo: "/crew/board/lohith-s.jpeg",
    crop: "41% 37%",
    bio: `Stands behind the working committee: rosters, volunteers, and being on the floor for the whole of a day that was planned in an hour.`,
    links: {},
  },
  {
    role: "Joint Head of Logistics",
    name: "Syed Shehroz",
    photo: "/crew/board/syed-shehroz.jpeg",
    crop: "48% 40%",
    bio: `Stands behind logistics — the hall, the kit, the permissions, and the hour before doors when all of it has to already be in place.`,
    links: {},
  },
];

/*
 * ---------------------------------------------------------------------------
 * THE BOARD BEFORE THIS ONE
 *
 * The same two boards, one year earlier. They are not a separate section: the
 * seats are the same seats, so both rosters hang off the same two boards and
 * the visitor switches between them — see `TERMS` below.
 *
 * ---------------------------------------------------------------------------
 * `crop` — why these numbers are so much larger than the ones above
 *
 * These portraits are not snapshots. All twenty are the same pre-composed
 * 1366x768 card: hexagons and black down the left, a red swoosh down the
 * right, and the subject cut out and stood in the right-hand third of the
 * frame. Everywhere the site shows a portrait it crops one to something
 * taller than it is wide — a 4:5 card in the roster keeps a strip 45% of this
 * file's width — so the whole of the branded left half is cut away and the
 * only question left is which vertical strip survives.
 *
 * That makes `crop` here mean something slightly different from the rule set
 * out above. There it is where the face is, written down and passed straight
 * through, because `object-position` maps the image's x% to the container's x%
 * and a face at 47% can never be cropped out. Do that with these and a face
 * measured at 65% lands 65% of the way across the card, with the subject's own
 * shoulder hanging off the right edge — right where the frame's dead space
 * used to be. So the number written down is the one that lands the subject in
 * the middle of the crop instead: `x = (2.22f - 0.5) / 1.22`, where `f` is the
 * face's real position in the frame. It comes out around 78% for a face two
 * thirds of the way across, which is why every value below is in the seventies
 * and eighties rather than the forties and fifties.
 *
 * The second number barely matters. This art is wider than any container it is
 * dropped into, so the height fills exactly and the vertical position is only
 * ever read in one place — a phone turned sideways, where the popup's portrait
 * band is wider than 16:9. It is the face's real height in the frame, which is
 * what that case wants.
 * ---------------------------------------------------------------------------
 *
 * FILL ME IN — `bio` and `links`
 *
 * Same rule as every roster above: each `bio` describes the *post* as it was
 * held that year, not the person, and none of it came from a source. Three of
 * these names sit on the senior board now, and where that is so it is said —
 * that much is on the roster itself rather than being a claim about anyone.
 */
const PREVIOUS_SENIOR_MEMBERS = [
  {
    role: "President",
    name: "Ramprakash R",
    photo: "/crew/previous-board/ramprakash.png",
    crop: "76% 32%",
    bio: `Held the president's seat for the year before this one: what NIC took on, whose name was on it, and the answer whenever it was asked how that went.`,
    links: {},
  },
  {
    role: "Vice President",
    name: "Kanishkaa C",
    photo: "/crew/previous-board/kanishka.png",
    crop: "80% 35%",
    bio: `Second chair on the board before this one — the seat that keeps the year moving between meetings and stands in wherever the president cannot be.`,
    links: {},
  },
  {
    role: "Secretary",
    name: "Sheerin S",
    photo: "/crew/previous-board/sheerin.png",
    crop: "76% 38%",
    bio: `Kept the record that year: the minutes, the membership, and the correspondence a club this size has to be able to produce on request.`,
    links: {},
  },
  {
    role: "Treasurer",
    name: "Kalaimani P",
    photo: "/crew/previous-board/kalai.png",
    crop: "79% 35%",
    bio: `Held the money that year — what was budgeted, what was actually spent, and the receipts that had to reconcile the two once an event was over.`,
    links: {},
  },
  {
    role: "Technical Head",
    name: "B S Sri Varshini",
    photo: "/crew/previous-board/varshini.png",
    crop: "80% 35%",
    bio: `Owned everything of NIC's that ran on a machine that year: the tooling, the workshops, and whatever had to work in front of a room on the day.`,
    links: {},
  },
  {
    role: "Head of Design",
    name: "Ratheesh Bharathi S",
    photo: "/crew/previous-board/ratheesh.png",
    crop: "78% 33%",
    bio: `Decided what NIC looked like that year — the posters, the decks, the stage, and everything else the club put its name on.`,
    links: {},
  },
  {
    role: "Head of Content",
    name: "Anshula S",
    photo: "/crew/previous-board/anshula.png",
    crop: "80% 35%",
    bio: `Everything NIC said in writing that year: the captions, the copy on the posters, the scripts and the announcements.`,
    links: {},
  },
  {
    role: "Head of Outreach",
    name: "Dhivyalakshmi V",
    photo: "/crew/previous-board/dhivya.png",
    crop: "71% 35%",
    bio: `Everyone the club had to talk to who was not already in it — other clubs, other departments, speakers, and the students who had not heard of NIC yet.`,
    links: {},
  },
  {
    role: "Head of Logistics",
    name: "Sabareeswar B",
    photo: "/crew/previous-board/sabari.png",
    crop: "86% 39%",
    bio: `The hall, the permissions, the chairs, the kit and the timing of all of it, for the year before this one.`,
    links: {},
  },
];

const PREVIOUS_JOINT_MEMBERS = [
  {
    role: "Joint Secretary",
    name: "Athithya S A",
    photo: "/crew/previous-board/aathi.png",
    crop: "81% 36%",
    bio: `Stood behind the secretary's half of the record that year — the minutes, the membership, the correspondence. Holds the presidency on the board after it.`,
    links: {},
  },
  {
    role: "Joint Treasurer",
    name: "G Mohammed Azam",
    photo: "/crew/previous-board/azam.png",
    crop: "78% 42%",
    bio: `Stood behind the money that year: what was budgeted, what was spent, and the reconciliation afterwards. Holds secretary and treasurer on the board after it.`,
    links: {},
  },
  {
    role: "Joint Technical Head",
    name: "Haryshwa Ganesh",
    photo: "/crew/previous-board/haryshwa.png",
    crop: "76% 35%",
    bio: `Stood behind the technical head that year — the tooling, the workshops, and whatever had to be working before a room filled up.`,
    links: {},
  },
  {
    role: "Joint Head of Design",
    name: "Sri Varsha S",
    photo: "/crew/previous-board/varsha.png",
    crop: "80% 36%",
    bio: `Stood behind the design head that year: posters, decks and stage art, at the volume the club's look actually costs week to week.`,
    links: {},
  },
  {
    role: "Joint Head of Content",
    name: "Chandrika Banerjee",
    photo: "/crew/previous-board/chandrika.png",
    crop: "79% 38%",
    bio: `Stood behind the content head that year — the captions, the copy and the scripts, written to a deadline that was usually the same day.`,
    links: {},
  },
  {
    role: "Joint Head of Social Media",
    name: "J Princeton Vishal",
    photo: "/crew/previous-board/princeton.png",
    crop: "78% 34%",
    bio: `The club as it looked from outside that year: the feed, the order things went up in, and the week a club's account is actually judged on.`,
    links: {},
  },
  {
    role: "Joint Head of Outreach",
    name: "Neethu Jimmy Joy",
    photo: "/crew/previous-board/neethu.png",
    crop: "77% 33%",
    bio: `Stood behind outreach that year — the follow-ups, the other clubs, the one conversation at a time that fills a room. Holds the outreach head's seat on the board after it.`,
    links: {},
  },
  {
    role: "Joint Head of Operations",
    name: "Krishith",
    photo: "/crew/previous-board/krishith.png",
    crop: "74% 30%",
    bio: `Ran the floor that year: the rosters, the volunteers, and being there for the whole of a day that was planned in an hour.`,
    links: {},
  },
  {
    role: "Joint Head of Logistics",
    name: "Jayachandhran",
    photo: "/crew/previous-board/jai.png",
    crop: "76% 33%",
    bio: `Stood behind logistics that year — the hall, the kit, the permissions, and the hour before doors when all of it has to already be in place.`,
    links: {},
  },
];

/**
 * Seats per screen.
 *
 * A board is not a wall of nine cards any more — it is three screens of three,
 * each one a slide of the same deck the rest of the section is built from, so a
 * single scroll deals exactly one row and the corridor behind it keeps running
 * the whole way down. Three is also the most that can be shown at a size where
 * a face is still a face on a laptop.
 *
 * A board that does not divide by three leaves a short last row, which is fine:
 * it stays left-aligned in the same three-column grid rather than stretching to
 * fill it, so a card is the same size on every screen of both boards.
 */
export const SEATS_PER_SCREEN = 3;

/**
 * Which roster is on the table.
 *
 * Two boards hold the same nine-and-eight seats a year apart, so this is a
 * switch rather than a second section: the board keeps its screen, its title
 * and its place in the deck, and only the names in it change. Six more screens
 * of roster below the ones already here would be the same content at four
 * times the scroll.
 *
 * `stamp` is what the popup prints after the board's name, and the board
 * sitting now is deliberately the unmarked case — a card that says nothing
 * about when it was held is this year's, which is what a visitor who never
 * touches the switch should be looking at.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN — the years
 *
 * `tab` is what the switch itself says, and it is deliberately vague: nobody
 * told this file which academic year either board sits for. Once that is known
 * these read far better as the years themselves — "2025–26" and "2024–25" —
 * and nothing else has to change.
 * ---------------------------------------------------------------------------
 */
export const TERMS = [
  {
    id: "current",
    tab: "Current",
    stamp: null,
  },
  {
    id: "previous",
    tab: "Previous",
    stamp: "Previous",
  },
];

/** What the section opens on, and what a visitor who never touches it sees. */
export const DEFAULT_TERM = TERMS[0].id;

/**
 * The board label travels on the member rather than being threaded through the
 * components, because the one place it is genuinely needed is the popup — which
 * is opened from the section but rendered outside it, in a portal. The term's
 * stamp travels the same way and for the same reason: once a popup is up, the
 * switch that opened it is somewhere behind a full-screen scrim.
 *
 * Seat ids carry the board and the seat number but not the term, so the two
 * rosters hand React the same keys. Switching then swaps the contents of a row
 * that is already standing rather than tearing it down and dealing a new one —
 * which, on a deck where every row is a slide, is the difference between a
 * roster changing and the page jumping under whoever changed it.
 */
const seat = (prefix, board, term, members) =>
  members.map((member, index) => ({
    ...member,
    board,
    term: term.stamp,
    id: `${prefix}-${index + 1}`,
    index: String(index + 1).padStart(2, "0"),
    // Stable key a bio override is stored under — see mastermindSlug above
    // and /admin/dashboard/bod. Index-based rather than role-based so a
    // role with punctuation ("Secretary & Treasurer") never has to be
    // slugified, and it never collides between terms because `term.id`
    // (not the display `stamp`) is part of it.
    slug: `${prefix}-${term.id}-${index + 1}`,
  }));

/** Deals a roster into screens. A short last row is fine — it stays left-aligned. */
export const intoRows = (members) => {
  const rows = [];
  for (let i = 0; i < members.length; i += SEATS_PER_SCREEN) {
    rows.push(members.slice(i, i + SEATS_PER_SCREEN));
  }
  return rows;
};

/**
 * A board is its identity — id, title, what the office is for — plus one dealt
 * roster per term, keyed by `TERMS`. Everything the section renders before the
 * seats themselves is shared between the two; everything that turns over with
 * the year lives under `terms`.
 */
const board = ({ prefix, label, terms, ...rest }) => ({
  ...rest,
  label,
  terms: Object.fromEntries(
    TERMS.map((term) => {
      const roster = terms[term.id];
      const seats = seat(prefix, label, term, roster.members);
      return [term.id, { ...roster, members: seats, rows: intoRows(seats) }];
    }),
  ),
});

/*
 * ---------------------------------------------------------------------------
 * Each board announces itself on a screen of its own before its seats are
 * dealt, the way the masterminds and the crew do — `eyebrow`, `lead`/`accent`
 * and `body` are what that screen is built from, and `short` is the running
 * label carried above each row of three afterwards.
 *
 * FILL ME IN — `body`
 *
 * Both paragraphs below describe the *office*, not this year's holders of it,
 * and neither came from a source: they say what a board of that name is for,
 * which is the one thing that stays true as the roster turns over. Rewrite them
 * in NIC's own terms if the split of work is not quite this.
 *
 * The `body` is per-term for one reason: it counts the seats out loud, and the
 * two boards are not the same size a year apart. Everything above it is shared.
 * ---------------------------------------------------------------------------
 */
export const BOARDS = [
  board({
    id: "senior-board",
    prefix: "senior",
    label: "Senior Board of Directors",
    short: "Senior board",
    eyebrow: "06 — The senior board",
    lead: "Senior Board of",
    accent: "Directors",
    caption: "Sets the agenda, and answers for it",
    terms: {
      current: {
        body: `Nine seats, and the year is theirs to set. The senior board decides what NIC takes on, puts the club's name to it, and answers for how it turns out — the calendar, what it costs, and the standard everything is held to.`,
        members: SENIOR_MEMBERS,
      },
      previous: {
        body: `The same nine seats, one year earlier. This is the board that set the calendar before this one did, spent the budget before this one had it, and handed over a club that had already been run for a year.`,
        members: PREVIOUS_SENIOR_MEMBERS,
      },
    },
  }),
  board({
    id: "joint-board",
    prefix: "joint",
    label: "Joint Board of Directors",
    short: "Joint board",
    eyebrow: "07 — The joint board",
    lead: "Joint Board of",
    accent: "Directors",
    caption: "Carries it out, and learns the job doing it",
    terms: {
      current: {
        body: `Eight more seats, each one standing behind a portfolio on the board above. The joint board is where the work actually gets carried out, and where the next senior board learns the job by doing it a year early.`,
        members: JOINT_MEMBERS,
      },
      previous: {
        body: `Nine seats standing behind the nine above them. Some of these names are on the senior board now, which is the whole argument for a joint board: it is where the next one learns the job a year early.`,
        members: PREVIOUS_JOINT_MEMBERS,
      },
    },
  }),
];
