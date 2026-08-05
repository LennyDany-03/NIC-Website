"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MARQUEE } from "./content";

/**
 * The strip that runs under the hero.
 *
 * Same construction as the Genesis strip, and the comment there is the one worth
 * reading: the list is rendered twice and the track translated by exactly half
 * its width, so at the moment the animation resets the second copy is sitting
 * precisely where the first started and there is no frame in which the strip is
 * anything but continuous. That only lands on a whole number while the track's
 * right padding equals its gap — the two are written to match at both
 * breakpoints for that reason alone, and changing one without the other buys a
 * stutter once per cycle that looks like a dropped frame and is not one.
 */
export default function Marquee() {
  const prefersReducedMotion = useReducedMotion();

  // Rendered twice for the seam; announced once. A screen reader reading six
  // words and then the same six again is describing the trick rather than the
  // content, and every word in here is said properly elsewhere on the page.
  const track = [...MARQUEE, ...MARQUEE];

  return (
    <div
      aria-hidden
      className="relative flex overflow-hidden border-y border-cyber-steel/50 bg-cyber-teal/[0.04] py-4 sm:py-5"
    >
      <motion.div
        className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
        // Someone who asked for less motion gets the strip standing still. It
        // carries no information they would lose by it.
        animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 28, ease: "linear", repeat: Infinity }
        }
      >
        {track.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="flex items-center gap-8 sm:gap-12"
          >
            <span className="whitespace-nowrap font-cyber-mono text-[11px] uppercase tracking-[0.34em] text-cyber-teal/80 sm:text-xs">
              {word}
            </span>
            {/* The diamond between words, in the palette's heat — so the strip
                has one warm glint travelling through a cool line. */}
            <span className="block h-1 w-1 rotate-45 bg-cyber-rose/80" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
