import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import WorkshopRegister from "@/components/WorkshopCyberDefence/Register";
import { CLUB_LINKS, NAV_LINKS } from "@/components/siteLinks";
import { EVENT, REGISTRATION } from "@/components/WorkshopCyberDefence/content";

export const metadata = {
  title: `Register — ${EVENT.title} — NIC`,
  description: `${REGISTRATION.status}. Registration for the ${EVENT.dateLabel} workshop on modern cyber defence at SRMIST Vadapalani — what the form will ask for, and who to ask until it opens.`,
  openGraph: {
    title: `Register — ${EVENT.title}`,
    description: `${REGISTRATION.status} · ${EVENT.dateLabel}`,
    type: "website",
  },
  /*
   * Not indexed while it is shut.
   *
   * A "registration" result that lands somebody on a form they cannot fill in is
   * a bad result — worse than not appearing at all, because the event page above
   * it answers the same search properly and would have been the hit instead.
   * Take this out the day `REGISTRATION.formHref` is set.
   */
  robots: { index: false, follow: true },
};

/**
 * Registration for the workshop, which is not open yet.
 *
 * A route of its own rather than a section of the event page, because the two
 * get shared separately: the event page is what goes in a group chat, and this
 * is what a coordinator sends to somebody who has already decided. It also means
 * the day sign-ups open, a URL that has been circulating for weeks starts
 * working rather than a page needing to be rebuilt.
 *
 * Server component with the same furniture as every other route, for the reasons
 * given on the event page next door. What lives here is only the metadata — in
 * particular the `noindex`, which is the one thing this page needs that its
 * neighbour does not.
 */
export default function WorkshopRegisterPage() {
  return (
    <>
      <SmoothScroll />

      <Navbar />
      <WorkshopRegister />
      <Footer navLinks={NAV_LINKS} clubLinks={CLUB_LINKS} />
    </>
  );
}
