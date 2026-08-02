"use client";

import { motion } from "framer-motion";
import { FOIL } from "./gold";
import { EVENT } from "./content";
import { slideRise } from "../motionPresets";

/**
 * The name, set as large as the screen will carry it.
 *
 * This is the whole point of the page. A coming-soon page has one job — say
 * what is coming — and the loudest thing on it should be the thing's name, not
 * a paragraph about it. So GENESIS runs edge to edge and everything else on the
 * screen is sized in relation to it.
 *
 * Two things keep it from breaking:
 *
 * `clamp` against `vh` as well as `vw`. The hero holds the wordmark, a strapline,
 * a four-face clock and a fact strip in one screen, and type that only clamps
 * against width grows unchecked on a short landscape laptop until the clock is
 * pushed under the fold — which on a countdown is the whole page falling over.
 * `min(15vw, 19vh)` is the same discipline the deck's slides use to stay inside
 * a viewport, applied to a page that is not a deck.
 *
 * `leading-[0.78]` with `tracking-tight`. At this size the default line box
 * leaves a visible gutter under the word and the letters drift apart; display
 * type is set tighter than body type, and heavy display type tighter still.
 */
export default function GenesisWordmark() {
  return (
    <motion.h1
      variants={slideRise}
      className="relative text-[clamp(3rem,min(15vw,19vh),11rem)] font-black uppercase leading-[0.78] tracking-tight"
    >
      {/*
       * The glow behind the metal.
       *
       * The gold is painted by clipping a gradient to the glyphs, which means
       * the type is technically transparent and a drop-shadow has nothing to
       * bite on — the usual way this site makes a heading survive its backdrop
       * is unavailable here. A blurred copy of the same word sitting behind it
       * does the job instead: it reads as the light the foil is catching, and
       * it is what stops the letterforms sitting flat on the black.
       *
       * `aria-hidden` and absolutely positioned, so the word is in the document
       * once. A screen reader that announced "Genesis Genesis" would be
       * describing a lighting effect.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none text-genesis-gold/25 blur-[0.35em]"
      >
        {EVENT.lead}
        <span className="ml-[0.06em]">{EVENT.edition}</span>
      </span>

      <span className={`relative ${FOIL}`}>
        {EVENT.lead}
        {/*
         * The year, set apart rather than run on. It is a different kind of
         * word to the name — an edition number, not a title — and letting it
         * ride slightly small and slightly up is what makes the pair read as a
         * masthead instead of as one long string.
         */}
        <span className="ml-[0.06em] align-super text-[0.42em] tracking-[0.02em]">
          {EVENT.edition}
        </span>
      </span>
    </motion.h1>
  );
}
