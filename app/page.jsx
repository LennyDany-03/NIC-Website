"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CrewSequence from "@/components/CrewSequence";
import HeroSequence from "@/components/HeroSequence";
import LoadingIntro from "@/components/LoadingIntro";
import Navbar from "@/components/Navbar";
import NicLogoIntro from "@/components/NicLogoIntro";
import SmoothScroll from "@/components/SmoothScroll";
import useFrameSequence, {
  CORRIDOR_SEQUENCE,
  DRONE_SEQUENCE,
  HEXAGON_SEQUENCE,
} from "@/components/useFrameSequence";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const handleBoot = useCallback(() => setBooted(true), []);

  // The three sequences queue up rather than race: each starts downloading only
  // once the one in front of it has landed, so bandwidth always belongs to the
  // frames actually being watched. ~22 MB total, fetched in the order it is
  // needed and never all at once.
  const hexagon = useFrameSequence(HEXAGON_SEQUENCE);
  const drone = useFrameSequence(DRONE_SEQUENCE, booted);
  const corridor = useFrameSequence(CORRIDOR_SEQUENCE, drone.ready);

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
        />
      </main>
    </>
  );
}
