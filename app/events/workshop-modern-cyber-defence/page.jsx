import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import WorkshopRegistration from "@/components/WorkshopCyberDefence/Registration";
import { CLUB_LINKS, NAV_LINKS } from "@/components/siteLinks";
import { EVENT, POSTER } from "@/components/WorkshopCyberDefence/content";
import { PAYMENT } from "@/components/WorkshopCyberDefence/Registration/content";

export const metadata = {
  title: `Register — ${EVENT.title} — NIC`,
  description: `Register for the ${EVENT.dateLabel} workshop on modern cyber defence at SRMIST Vadapalani, run by the Nextgen Intelligence Club. Three sessions, ${EVENT.timeLabel}, ${PAYMENT.feeLabel}.`,
  openGraph: {
    title: `Register — Workshop on ${EVENT.title}`,
    description: `${EVENT.dateLabel} · ${EVENT.timeLabel} · SRMIST Vadapalani`,
    type: "website",
    images: [
      { url: POSTER.src, width: POSTER.width, height: POSTER.height, alt: POSTER.alt },
    ],
  },
};

/**
 * The workshop's page, which is its registration form.
 *
 * One route rather than the event page and a `/register` beside it. The split
 * made sense while sign-ups were shut and the two answered different questions;
 * now that they are open there is only one question, and a visitor who arrives
 * at an event page, reads it, and then has to find a second link before they can
 * do anything is a visitor given an extra chance to leave. Almost all of them
 * arrive by scanning the QR on the printed poster, which is to say they have
 * already read the page that used to be here.
 *
 * The sections that page was made of are still in
 * `components/WorkshopCyberDefence/` — `Sessions`, `ResourcePerson`,
 * `Coordinators`, `PosterPlate` — unrendered rather than deleted. Any of them
 * drops back in under the flow with one line if the day comes that this needs to
 * be a page you can read as well as a page you can sign up on.
 *
 * A server component holding nothing but metadata, with the site's own furniture
 * either side of the event's colour. `SmoothScroll` because every route on this
 * site has it and a page that scrolls differently from the last one is a page
 * that feels broken; only the flow itself is a client component.
 */
export default function WorkshopCyberDefencePage() {
  return (
    <>
      <SmoothScroll />

      <Navbar />
      <WorkshopRegistration />
      <Footer navLinks={NAV_LINKS} clubLinks={CLUB_LINKS} />
    </>
  );
}
