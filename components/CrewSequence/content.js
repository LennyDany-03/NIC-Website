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
  body: `Eighteen students run NIC day to day. The senior board sets the year's agenda and answers for it; the joint board carries it out and learns the job in the process. Every seat below is someone who volunteered for more work than they were asked for.`,
};

/*
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 * Nine seats per board, which is what the two boards were specified as. The
 * roles below are the conventional nine — rename any that don't match how NIC
 * actually splits the work.
 *
 * `name` is intentionally blank. A card with no name renders as an unassigned
 * seat (numbered plate, dimmed) instead of breaking the grid, so the layout
 * holds while the roster is still being decided.
 *
 * `photo` takes a path under /public — e.g. "/crew/priya.webp". Until one is
 * set the card shows the plate, so names and portraits can land separately.
 * Portraits look best square with a transparent surround, matching the faculty
 * art above.
 *
 * Everything past `role`, `name` and `photo` is optional, and none of it is on
 * the card — it is what the card's popup has to show. A seat with nothing but a
 * name still opens; it just has less to say.
 *
 *   {
 *     role: "President",
 *     name: "Priya R",
 *     photo: "/crew/priya.webp",
 *     year: "Final year",              // where they are in the course
 *     department: "CSE E-Tech",
 *     focus: "Systems, and anything with a deadline",
 *     bio: `Two or three sentences. What they do for NIC, and what they were
 *           doing before the seat was theirs.`,
 *     links: {
 *       linkedin: "https://linkedin.com/in/...",
 *       github: "https://github.com/...",
 *       instagram: "https://instagram.com/...",
 *       email: "priya@example.com",    // rendered as a mailto:
 *     },
 *   }
 * ---------------------------------------------------------------------------
 */

const SENIOR_MEMBERS = [
  { role: "President", name: "", photo: null },
  { role: "Vice President", name: "", photo: null },
  { role: "Secretary", name: "", photo: null },
  { role: "Treasurer", name: "", photo: null },
  { role: "Technical Head", name: "", photo: null },
  { role: "Design Head", name: "", photo: null },
  { role: "Content Head", name: "", photo: null },
  { role: "Public Relations Head", name: "", photo: null },
  { role: "Events Head", name: "", photo: null },
];

const JOINT_MEMBERS = [
  { role: "Joint President", name: "", photo: null },
  { role: "Joint Vice President", name: "", photo: null },
  { role: "Joint Secretary", name: "", photo: null },
  { role: "Joint Treasurer", name: "", photo: null },
  { role: "Joint Technical Head", name: "", photo: null },
  { role: "Joint Design Head", name: "", photo: null },
  { role: "Joint Content Head", name: "", photo: null },
  { role: "Joint Public Relations Head", name: "", photo: null },
  { role: "Joint Events Head", name: "", photo: null },
];

/**
 * Seats per screen.
 *
 * A board is not a wall of nine cards any more — it is three screens of three,
 * each one a slide of the same deck the rest of the section is built from, so a
 * single scroll deals exactly one row and the corridor behind it keeps running
 * the whole way down. Three is also the most that can be shown at a size where
 * a face is still a face on a laptop.
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

const board = ({ id, label, caption, prefix, members }) => {
  const seats = seat(prefix, label, members);
  return { id, label, caption, members: seats, rows: intoRows(seats) };
};

export const BOARDS = [
  board({
    id: "senior-board",
    label: "Senior Board of Directors",
    caption: "Sets the agenda, and answers for it",
    prefix: "senior",
    members: SENIOR_MEMBERS,
  }),
  board({
    id: "joint-board",
    label: "Joint Board of Directors",
    caption: "Carries it out, and learns the job doing it",
    prefix: "joint",
    members: JOINT_MEMBERS,
  }),
];
