"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ArchiveSequence from "@/components/ArchiveSequence";
import CrewSequence from "@/components/CrewSequence";
import Footer from "@/components/Footer";
import HeroSequence from "@/components/HeroSequence";
import LoadingIntro from "@/components/LoadingIntro";
import Navbar from "@/components/Navbar";
import NicLogoIntro from "@/components/NicLogoIntro";
import SmoothScroll from "@/components/SmoothScroll";
import { CLUB_LINKS, NAV_LINKS } from "@/components/siteLinks";
import useFrameSequence, {
  CITYSKYLINE_SEQUENCE,
  CORRIDOR_SEQUENCE,
  DRONE_SEQUENCE,
  HEXAGON_SEQUENCE,
} from "@/components/useFrameSequence";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const handleBoot = useCallback(() => setBooted(true), []);

  // The four sequences queue up rather than race: each starts downloading only
  // once the one in front of it has landed, so bandwidth always belongs to the
  // frames actually being watched. ~35 MB in total, fetched strictly in the
  // order it is needed and never all at once — the archive's is last in the
  // chain because it is the last thing anyone reaches.
  const hexagon = useFrameSequence(HEXAGON_SEQUENCE);
  const drone = useFrameSequence(DRONE_SEQUENCE, booted);
  const corridor = useFrameSequence(CORRIDOR_SEQUENCE, drone.ready);
  const skyline = useFrameSequence(CITYSKYLINE_SEQUENCE, corridor.ready);

  /*
   * Someone arriving from /join asks for a section by hash — `/#senior-board`
   * — and nothing about this page lets them have it on their own. The loader
   * pins the page at the top on purpose, so the scroll intro always starts
   * from frame one, and a browser honouring a fragment is exactly what it is
   * there to overrule. So the hash has to be replayed afterwards, by us.
   *
   * "Afterwards" is later than it looks. `booted` flips while the loader is
   * still on screen fading out, and it holds `overflow: hidden` until it is
   * gone — a scroll written into a page that cannot move is dropped without a
   * word. So this waits for the lock to lift rather than for the flag, the
   * same way the smooth-scroll layer checks it before starting anything.
   *
   * A plain jump rather than a glide: a slide arrived at from the top of its
   * own travel reads as progress 0, which is where every handoff sits armed
   * and waiting rather than about to fire — so the visitor lands on the slide
   * they asked for, whole, and the next scroll advances it normally.
   */
  useEffect(() => {
    if (!booted) return undefined;
    const id = window.location.hash.slice(1);
    if (!id) return undefined;

    let frame = 0;
    // Enough frames to outlast the loader's fade several times over, and few
    // enough that a lock nobody lifts ends as a link that did nothing rather
    // than as a loop running for the life of the page.
    let attempts = 180;

    const land = () => {
      if (document.body.style.overflow === "hidden" && attempts-- > 0) {
        frame = requestAnimationFrame(land);
        return;
      }
      document.getElementById(id)?.scrollIntoView();
    };

    frame = requestAnimationFrame(land);
    return () => cancelAnimationFrame(frame);
  }, [booted]);

  return (
    <>
      {/* Ramps wheel input into a continuous scroll — every scroll-linked
          animation below reads off that same position. */}
      <SmoothScroll />

      <AnimatePresence>
        {!booted && (
          <LoadingIntro
            key="loader"
            progress={hexagon.progress}
            onComplete={handleBoot}
          />
        )}
      </AnimatePresence>

      <Navbar revealed={booted} />

      <main className="relative bg-black text-white">
        <NicLogoIntro
          framesRef={hexagon.framesRef}
          ready={hexagon.ready}
          started={booted}
        />
        <HeroSequence
          framesRef={drone.framesRef}
          ready={drone.ready}
          // There is a crew section below to be pushed into.
          autoPush
        />
        <CrewSequence
          framesRef={corridor.framesRef}
          ready={corridor.ready}
          // There is an archive below to be pushed into.
          autoPush
        />
        <ArchiveSequence
          framesRef={skyline.framesRef}
          ready={skyline.ready}
        />
      </main>

      {/* Outside `main`: the footer is the end of the document rather than the
          end of the deck, and nothing is pinned behind it. */}
      <Footer navLinks={NAV_LINKS} clubLinks={CLUB_LINKS} />
    </>
  );
}
