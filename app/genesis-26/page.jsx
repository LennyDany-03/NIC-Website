import Footer from "@/components/Footer";
import Genesis26 from "@/components/Genesis26";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import { CLUB_LINKS, NAV_LINKS } from "@/components/siteLinks";
import { EVENT } from "@/components/Genesis26/content";

export const metadata = {
  title: "Genesis '26 — NIC",
  description: `${EVENT.dateLabel}. The Next Gen Intelligence Club's flagship symposium returns for a third year. Programme and registration to be announced.`,
  openGraph: {
    title: "Genesis '26 — NIC",
    description: `${EVENT.dateLabel}. NIC's flagship symposium returns.`,
    type: "website",
  },
};

/**
 * The third route on this site, and the second that is not the front page.
 *
 * A server component, like `/join` and for the same reason: nothing here is
 * scrubbed against scroll, so the page itself can be static and only the parts
 * that move — the navbar, the countdown, the footer — are clients in their own
 * right. That buys the route its own `metadata`, which is the thing a link
 * pasted into a group chat is actually read from, and this is a link that is
 * going to be pasted into a lot of group chats.
 *
 * Same furniture as everywhere else and in the same order, so a visitor who
 * lands here from a poster QR code has the whole site one tap away: the navbar
 * knows it is off the front page and addresses the sections as `/#...`, and the
 * footer does the same through the links it is handed. The gold stops at the
 * edges of the event — the chrome stays red.
 */
export default function Genesis26Page() {
  return (
    <>
      {/* The site scrolls with weight; a page that scrolled plainly would feel
          like a different site. */}
      <SmoothScroll />

      <Navbar />
      <Genesis26 />
      <Footer navLinks={NAV_LINKS} clubLinks={CLUB_LINKS} />
    </>
  );
}
