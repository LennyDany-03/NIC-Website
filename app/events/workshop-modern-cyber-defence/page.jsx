import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import WorkshopCyberDefence from "@/components/WorkshopCyberDefence";
import { CLUB_LINKS, NAV_LINKS } from "@/components/siteLinks";
import { EVENT, POSTER } from "@/components/WorkshopCyberDefence/content";

export const metadata = {
  title: `${EVENT.title} — NIC`,
  description: `${EVENT.dateLabel}, ${EVENT.timeLabel}. A one-day workshop on cyber defence at SRMIST Vadapalani, run by the Nextgen Intelligence Club. Three sessions; registration opening soon.`,
  openGraph: {
    title: `Workshop on ${EVENT.title} — NIC`,
    description: `${EVENT.dateLabel} · ${EVENT.timeLabel} · SRMIST Vadapalani`,
    type: "website",
    /* The poster is the image this link was always going to be shared as — it
       is what people have already seen on the noticeboard, and a link preview
       that matches the paper is the one that gets recognised in a group chat. */
    images: [{ url: POSTER.src, width: POSTER.width, height: POSTER.height, alt: POSTER.alt }],
  },
};

/**
 * The workshop's event page — the first route under `/events`.
 *
 * A server component, like `/join` and `/genesis-26` and for the same reason:
 * nothing here is scrubbed against scroll, so the page itself can be static and
 * only the parts that move — the navbar, the countdown, the footer — are clients
 * in their own right. That buys the route its own `metadata`, which is what a
 * link pasted into a group chat is actually read from, and this is a link that
 * is going to be pasted into a lot of group chats.
 *
 * Same furniture as everywhere else and in the same order, so a visitor who
 * lands here from the poster's QR code has the whole site one tap away: the
 * navbar knows it is off the front page and addresses the sections as `/#...`,
 * and the footer does the same through the links it is handed. The poster's
 * colours and type stop at the edges of the event — the chrome stays red.
 */
export default function WorkshopCyberDefencePage() {
  return (
    <>
      {/* The site scrolls with weight; a page that scrolled plainly would feel
          like a different site. */}
      <SmoothScroll />

      <Navbar />
      <WorkshopCyberDefence />
      <Footer navLinks={NAV_LINKS} clubLinks={CLUB_LINKS} />
    </>
  );
}
