/**
 * The page's own table of contents, stated once.
 *
 * Both the navbar and the footer are lists of the same anchors, and they were
 * going to be maintained by different people at different times — a section
 * renamed in one and not the other is the kind of drift nobody notices until a
 * link goes nowhere. Every id here is a `Slide` id from the sections below.
 */
export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Meet Us", href: "#meet-us" },
  { label: "Department", href: "#department" },
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
