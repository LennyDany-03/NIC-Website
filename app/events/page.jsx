import EventsIndex from "@/components/EventsIndex";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import { CLUB_LINKS, NAV_LINKS } from "@/components/siteLinks";

export const metadata = {
  title: "Events — NIC",
  description:
    "Everything the Nextgen Intelligence Club has coming and everything it has already run — workshops, hackathons and symposiums at SRMIST Vadapalani, dated, in the order they happened.",
  openGraph: {
    title: "Events — Nextgen Intelligence Club",
    description: "What NIC has coming, and the record of what it has run.",
    type: "website",
  },
};

/**
 * The events board.
 *
 * The only entry in `NAV_LINKS` that is a route rather than a hash, and the only
 * one of this site's routes that is meant to be permanent: the events on it come
 * and go, the board does not. That is why its components live in
 * `components/EventsIndex/` and read their vocabulary from `eventsTheme.js` —
 * every event folder under it is documented as deletable whole on the day its
 * event has run, and a permanent page cannot depend on a disposable one.
 *
 * Same furniture as every other route on this site, for the reasons given on the
 * workshop's page next door.
 */
export default function EventsPage() {
  return (
    <>
      <SmoothScroll />

      <Navbar />
      <EventsIndex />
      <Footer navLinks={NAV_LINKS} clubLinks={CLUB_LINKS} />
    </>
  );
}
