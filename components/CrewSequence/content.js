export const MASTERMINDS = {
  eyebrow: "04 — The masterminds",
  lead: "The",
  accent: "Masterminds",
  body: `Behind every build, every late deadline and every event that somehow came together on time, there is a faculty team that made the room for it. The masterminds set NIC's direction, open the doors that students cannot open alone, and hold the club to the standard it claims for itself.`,
  /**
   * The card art is already composed — grain plate, red corner ticks and the
   * role stamped into the top-left corner are baked into each 640x640 webp with
   * a transparent surround. `role` here is not drawn; it exists so the alt text
   * says who this is rather than repeating the name twice.
   */
  people: [
    {
      id: "chitra",
      name: "Dr. P. Chitra",
      role: "Head of Department, CSE E-Tech",
      photo: "/crew/CHITRA.webp",
    },
    {
      id: "meenakshi",
      name: "Dr. Meenakshi",
      role: "Faculty Coordinator",
      photo: "/crew/meenakshi.webp",
    },
    {
      id: "arun-nehru",
      name: "Dr. Arun Nehru",
      role: "Faculty Coordinator",
      photo: "/crew/arunnehru.webp",
    },
  ],
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

const withIds = (prefix, members) =>
  members.map((member, index) => ({
    ...member,
    id: `${prefix}-${index + 1}`,
    index: String(index + 1).padStart(2, "0"),
  }));

export const CREW = {
  eyebrow: "05 — Meet the crew",
  lead: "Meet the",
  accent: "Crew",
  body: `Eighteen students run NIC day to day. The senior board sets the year's agenda and answers for it; the joint board carries it out and learns the job in the process. Every seat below is someone who volunteered for more work than they were asked for.`,
};

export const BOARDS = [
  {
    id: "senior-board",
    label: "Senior Board of Directors",
    caption: "Sets the agenda, and answers for it",
    members: withIds("senior", SENIOR_MEMBERS),
  },
  {
    id: "joint-board",
    label: "Joint Board of Directors",
    caption: "Carries it out, and learns the job doing it",
    members: withIds("joint", JOINT_MEMBERS),
  },
];
