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
      bio: `Oversees the CSE E-Tech department, under which NIC was founded and to which it still answers. The club's remit — what it may run, who it may bring in, how far it may go — is set at this desk.`,
    },
    {
      id: "meenakshi",
      index: "02",
      name: "Dr. Meenakshi",
      role: "Faculty Coordinator",
      photo: "/crew/Meenakshi-NIC.webp",
      bio: `Faculty coordinator to the club: the standing link between a student board that changes every year and a department that does not. Approvals, rooms, and the difference between an idea and a scheduled event.`,
    },
    {
      id: "arun-nehru",
      index: "03",
      name: "Dr. Arun Nehru",
      role: "Faculty Coordinator",
      photo: "/crew/ArunNehru-NIC.webp",
      bio: `Faculty coordinator to the club, working alongside the technical side of what NIC builds — the workshops, the certification drives, and the symposiums the club puts its name to.`,
    },
  ],
};

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
    bio: `The seat the year answers to. The president sets what NIC takes on, puts the club's name to it, and is the one asked afterwards how it went. Also holds Head of Design on this board.`,
    links: {},
  },
  {
    role: "Vice-President",
    name: "D.D. Moheeth Kumar",
    photo: "/crew/board/moheeth-kumar-dd.jpeg",
    bio: `Second chair, and the one that has to be able to take the first at no notice. The vice-president keeps the board's decisions moving between meetings and stands in wherever the president cannot be. Also holds Head of Logistics on this board.`,
    links: {},
  },
  {
    role: "Secretary & Treasurer",
    name: "G. Mohammed Azam",
    photo: "/crew/board/mohammed-azam-g.jpg",
    bio: `Both halves of the club's paperwork in one seat: the minutes, the members, the correspondence, and the money. What the club agreed to and what the club can afford are settled here.`,
    links: {},
  },
  {
    role: "Head of Working Committee",
    name: "Vivin K.S",
    photo: "/crew/board/vivin-ks.jpeg",
    bio: `Runs the committee that actually staffs an event — who is on the door, who is on the floor, and who is still there at the end putting the room back. The gap between a plan and a working day is this desk.`,
    links: {},
  },
  {
    role: "Technical Head",
    name: "Dinesh P",
    photo: "/crew/board/dinesh-p.jpeg",
    bio: `Owns everything of NIC's that runs on a machine — the site, the tooling, the workshops, and whatever has to work in front of a room on the day. The technical standard the club is held to is set here.`,
    links: {},
  },
  {
    role: "Head of Design",
    name: "Athithya S A",
    photo: "/crew/board/athithya-sa.png",
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
    bio: `Everyone NIC has to talk to who is not already in it — other clubs, other departments, speakers, sponsors, and the students who have not heard of the club yet. Outreach is where a room gets filled.`,
    links: {},
  },
  {
    role: "Head of Logistics",
    name: "D.D. Moheeth Kumar",
    photo: "/crew/board/moheeth-kumar-dd.jpeg",
    bio: `The hall, the permissions, the chairs, the projector, the food, and the timing of all of it. Logistics is the reason an event exists as a place people can turn up to. Held alongside the vice-presidency.`,
    links: {},
  },
];

const JOINT_MEMBERS = [
  {
    role: "Joint Secretary",
    name: "Mirulla Srithar",
    photo: "/crew/board/mirulla-srithar.jpg",
    bio: `Stands behind the secretary's half of the record — minutes, membership and the correspondence that keeps a club of this size answerable to itself.`,
    links: {},
  },
  {
    role: "Joint Treasurer",
    name: "S Lakshman",
    photo: "/crew/board/s-lakshman.jpg",
    bio: `Stands behind the money: what was budgeted, what was actually spent, and the receipts that have to reconcile the two once the event is over.`,
    links: {},
  },
  {
    role: "Joint Technical Head",
    name: "Lenny Dany Derek D",
    photo: "/crew/board/Lenny.jpeg",
    bio: `Stands behind the technical head — the site, the tooling and the workshops, and whatever has to be working before a room fills up.`,
    /*
     * Taken from this repository's git config, so it is worth a second look
     * before it ships. The other seats are waiting on their handles.
     */
    links: {
      email: "lennydany3@gmail.com",
      github: "https://github.com/LennyDany-03",
    },
  },
  {
    role: "Joint Creative Head of Design",
    name: "Dishan Marrio I",
    photo: "/crew/board/dishan-marrio-i.jpeg",
    bio: `Stands behind the design head. Posters, decks and stage art — the volume of work the club's look actually costs, week to week.`,
    links: {},
  },
  {
    role: "Joint Creative Head of Content",
    name: "Sai Shrikar M K",
    photo: "/crew/board/sai-shrikar-mk.png",
    bio: `Stands behind the content head: the captions, the copy and the scripts, written to a deadline that is usually the same day.`,
    links: {},
  },
  {
    role: "Joint Head of Outreach",
    name: "Harish Dharrsan S S",
    photo: "/crew/board/harish-dharrsan-ss.jpg",
    bio: `Stands behind outreach — the follow-ups, the other clubs, and the part of filling a room that is one conversation at a time.`,
    links: {},
  },
  {
    role: "Joint Head of Working Committee",
    name: "S Lohith",
    photo: "/crew/board/lohith-s.jpeg",
    bio: `Stands behind the working committee: rosters, volunteers, and being on the floor for the whole of a day that was planned in an hour.`,
    links: {},
  },
  {
    role: "Joint Head of Logistics",
    name: "Syed Shehroz",
    photo: "/crew/board/syed-shehroz.jpeg",
    bio: `Stands behind logistics — the hall, the kit, the permissions, and the hour before doors when all of it has to already be in place.`,
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
 * The board label travels on the member rather than being threaded through the
 * components, because the one place it is genuinely needed is the popup — which
 * is opened from the section but rendered outside it, in a portal.
 */
const seat = (prefix, board, members) =>
  members.map((member, index) => ({
    ...member,
    board,
    id: `${prefix}-${index + 1}`,
    index: String(index + 1).padStart(2, "0"),
  }));

/** Deals a roster into screens. A short last row is fine — it stays left-aligned. */
const intoRows = (members) => {
  const rows = [];
  for (let i = 0; i < members.length; i += SEATS_PER_SCREEN) {
    rows.push(members.slice(i, i + SEATS_PER_SCREEN));
  }
  return rows;
};

const board = ({ prefix, label, members, ...rest }) => {
  const seats = seat(prefix, label, members);
  return { ...rest, label, members: seats, rows: intoRows(seats) };
};

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
    body: `Nine seats, and the year is theirs to set. The senior board decides what NIC takes on, puts the club's name to it, and answers for how it turns out — the calendar, what it costs, and the standard everything is held to.`,
    members: SENIOR_MEMBERS,
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
    body: `Eight more seats, each one standing behind a portfolio on the board above. The joint board is where the work actually gets carried out, and where the next senior board learns the job by doing it a year early.`,
    members: JOINT_MEMBERS,
  }),
];
