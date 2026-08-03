"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MARQUEE } from "./content";

/**
 * The strip that runs under the hero.
 *
 * It is the one moving thing on a page whose whole job is to say "not yet" —
 * and a static poster for an event a month out reads as a page nobody has
 * touched since it was put up. Movement is the cheapest way to say the opposite.
 *
 * The list is rendered twice and the track is translated by exactly half its
 * width, so that at the moment the animation resets, the second copy is sitting
 * precisely where the first one started and there is no frame in which the
 * strip is anywhere but continuous.
 *
 * That only lands on a whole number if the track's right padding equals its
 * gap, and the two are written to match at both breakpoints for that reason
 * alone. Half of ten items joined by nine gaps is five items and four-and-a-half
 * gaps — half a gap short of where the sixth item begins — and the trailing
 * padding is what makes the difference up. Change one of the pair without the
 * other and the strip develops a visible stutter once per cycle, which is a
 * bug that looks like a dropped frame and is not one.
 */
export default function Marquee() {
  const prefersReducedMotion = useReducedMotion();

  // Rendered twice for the seam; announced once. A screen reader reading five
  // words and then the same five words again is describing the trick rather
  // than the content, so the whole strip is decoration and the words it carries
  // — the date, the name — are all said properly elsewhere on the page.
  const track = [...MARQUEE, ...MARQUEE];

  return (
    <div
      aria-hidden
      className="relative flex overflow-hidden border-y border-genesis-bronze/45 bg-genesis-gold/[0.03] py-4 sm:py-5"
    >
      <motion.div
        className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
        // Someone who asked for less motion gets the strip standing still. It
        // carries no information they would lose by it.
        animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 26, ease: "linear", repeat: Infinity }
        }
      >
        {track.map((word, index) => (
          <span key={`${word}-${index}`} className="flex items-center gap-8 sm:gap-12">
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.34em] text-genesis-gold/80 sm:text-xs">
              {word}
            </span>
            {/* The diamond between words, in the brightest step of the palette
                so the strip has a specular glint moving through it. */}
            <span className="block h-1 w-1 rotate-45 bg-genesis-champagne/70" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
