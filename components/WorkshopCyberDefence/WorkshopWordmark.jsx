"use client";

import { motion } from "framer-motion";
import { CYBER_HEADING, NEON } from "../eventsTheme";
import { EVENT } from "./content";
import { slideRise } from "../motionPresets";

/**
 * The title, set as large as the screen will carry it.
 *
 * The poster runs it across two lines — a small "workshop on" and then the
 * subject at full width — and that split is doing real work rather than fitting
 * text to a rectangle: "workshop on" is a category and "Modern Cyber Defence" is
 * the thing itself, and setting them at the same size makes the whole title read
 * as one long string nobody finishes. So the lead stays small and tracked out
 * like a label, and everything else on the screen is sized in relation to the
 * line under it.
 *
 * Two things keep it from breaking, both borrowed from `GenesisWordmark`:
 *
 * `clamp` against `vh` as well as `vw`. The hero holds a wordmark, a strapline,
 * a four-face clock and a fact strip in one screen, and type that only clamps
 * against width grows unchecked on a short landscape laptop until the clock is
 * pushed under the fold — which on a countdown is the page failing at its one
 * job. This title is three words longer than Genesis's one, so it clamps
 * tighter: `min(11vw, 13vh)` against that page's `min(15vw, 19vh)`.
 *
 * `leading-[0.85]` with `tracking-tight`. Orbitron is a wide face — the poster's
 * face — and at display size its default line box leaves a gutter between the
 * two lines big enough to read as a gap between two headings.
 */
export default function WorkshopWordmark() {
  return (
    <motion.h1
      variants={slideRise}
      className="relative flex flex-col items-center"
    >
      <span className="font-cyber-mono text-[clamp(0.7rem,min(2.6vw,3vh),1.05rem)] uppercase tracking-[0.42em] text-cyber-rose">
        {EVENT.lead}
      </span>

      <span
        className={`relative mt-[clamp(0.5rem,1.6vh,1rem)] text-[clamp(1.75rem,min(11vw,13vh),6.5rem)] uppercase ${CYBER_HEADING}`}
      >
        {/*
         * The glow behind the neon.
         *
         * The title is painted by clipping a gradient to the glyphs, which means
         * the type is technically transparent and a drop-shadow has nothing to
         * bite on — the usual way this site makes a heading survive its backdrop
         * is unavailable here. A blurred copy of the same words sitting behind
         * it does the job instead: it reads as the light the letters are giving
         * off, which is exactly what the poster's title does, and it is what
         * stops the letterforms sitting flat on the black.
         *
         * `aria-hidden` and absolutely positioned, so the title is in the
         * document once. A screen reader announcing it twice would be reading
         * out a lighting effect.
         */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none text-cyber-teal/25 blur-[0.32em]"
        >
          {EVENT.title}
        </span>

        <span className={`relative ${NEON}`}>{EVENT.title}</span>
      </span>
    </motion.h1>
  );
}
