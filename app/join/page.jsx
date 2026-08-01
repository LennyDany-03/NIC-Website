import Footer from "@/components/Footer";
import JoinNotice from "@/components/JoinNotice";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import { CLUB_LINKS, NAV_LINKS } from "@/components/siteLinks";

export const metadata = {
  title: "Join — NIC",
  description:
    "Recruitment for the Next Gen Intelligence Club is closed. Contact the Board of Directors for details on the next intake.",
};

/**
 * The one route besides the front page.
 *
 * A server component, unlike the front page, because nothing here is scrubbed
 * against scroll and only the notice itself animates — which buys the page its
 * own `metadata`, the thing a link shared in a group chat is actually read
 * from. The navbar, the notice and the footer are each clients in their own
 * right and say so.
 *
 * Same furniture as the front page and in the same order, so arriving here does
 * not read as leaving the site: the navbar knows it is off the front page and
 * addresses the sections as `/#...`, and the footer does the same through the
 * links it is handed.
 */
export default function JoinPage() {
  return (
    <>
      {/* The site scrolls with weight; a second page that scrolls plainly would
          feel like a different site. */}
      <SmoothScroll />

      <Navbar />
      <JoinNotice />
      <Footer navLinks={NAV_LINKS} clubLinks={CLUB_LINKS} />
    </>
  );
}
