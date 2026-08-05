"use client";

import { motion } from "framer-motion";
import EventCard from "./EventCard";
import PastLedger from "./PastLedger";
import { CYBER_HEADING, CYBER_LABEL, GRID_PLATE, GRID_SIZE, NEON, SOFT_RULE } from "../eventsTheme";
import { BOARD, FACTS, UPCOMING } from "./content";
import { GRAIN_PLATE } from "../surfaces";
import { slideBlock, slideRise, slideViewport, seatRow } from "../motionPresets";

/**
 * `/events` — the board.
 *
 * Not a deck, for the reason `/genesis-26`, `/join` and the workshop page are
 * not decks: a deck deals one screen at a time and decides where the visitor
 * lands, which is right for a sequence being watched and wrong for a list being
 * scanned. Somebody here is looking for a date, and should not have to be dealt
 * four pinned panels to find one.
 *
 * It is lit the way the workshop page is, and that is deliberate rather than
 * lazy: the poster the palette was read off is the artwork on the first card,
 * so the page and the thing it is advertising are the same object. The chrome
 * stays the club's red — navbar above, footer below — so this reads as a
 * noticeboard hung in the building rather than as a different building.
 *
 * The hero deliberately does *not* fill the viewport, which is the one place
 * this page departs from the event pages under it. Their heroes are a screen
 * tall because a countdown is the payload and belongs above the fold whole;
 * here the payload is the list, and a full-height title card would push the
 * first event under it. The top of the first card showing is the page saying
 * what it is.
 */
export default function EventsIndex() {
  return (
    <main className="relative overflow-hidden bg-cyber-void font-cyber-body text-white">
      {/*
       * The light, and the reason this does not read as type on black. Same
       * three washes as the workshop page — magenta raking in from the top left,
       * teal rising from the right, amber low behind the wordmark where the
       * poster puts its core — because it is the same poster's light.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[95vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 12% 0%, rgba(200,31,110,0.30) 0%, rgba(200,31,110,0) 62%), radial-gradient(ellipse 65% 60% at 88% 18%, rgba(43,183,189,0.24) 0%, rgba(43,183,189,0) 66%), radial-gradient(ellipse 45% 40% at 50% 42%, rgba(242,178,60,0.14) 0%, rgba(242,178,60,0) 70%)",
        }}
      />

      {/* The circuitry, at 4% — what stops the large empty margins of this
          layout reading as unpainted. Masked out before it reaches the cards. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] opacity-[0.04]"
        style={{
          backgroundImage: GRID_PLATE,
          backgroundSize: GRID_SIZE,
          maskImage: "linear-gradient(to bottom, black 0%, transparent 92%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 92%)",
        }}
      />

      {/* Grain over the whole page: wide flat gradients band visibly on an 8-bit
          panel, and a few percent of noise dithers the ramp. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      {/* ----------------------------------------------------------- the hero */}
      <motion.section
        className="relative mx-auto w-full max-w-6xl px-6 pb-14 pt-[clamp(7rem,18vh,10rem)] sm:px-8 sm:pb-20"
        variants={slideBlock}
        initial="hidden"
        // Announced rather than revealed on scroll: this block is already on
        // screen when the page opens, and a whileInView reveal on the thing
        // somebody navigated here to read is a reveal nobody is present for.
        animate="shown"
      >
        <motion.div variants={slideRise}>
          <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
            <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
            {BOARD.eyebrow}
          </span>
        </motion.div>

        <motion.h1
          variants={slideRise}
          className={`relative mt-6 text-[clamp(2.75rem,13vw,7rem)] uppercase ${CYBER_HEADING}`}
        >
          {/*
           * The glow behind the neon. The title is painted by clipping a
           * gradient to the glyphs, so the type is technically transparent and a
           * drop-shadow has nothing to bite on — the usual way this site makes a
           * heading survive its backdrop is unavailable. A blurred copy of the
           * same word behind it reads as the light the letters are giving off,
           * which is what the poster's own title does.
           *
           * `aria-hidden`: a screen reader announcing it twice would be reading
           * out a lighting effect.
           */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 select-none text-cyber-teal/25 blur-[0.3em]"
          >
            {BOARD.lead}
          </span>
          <span className={`relative ${NEON}`}>{BOARD.lead}</span>
        </motion.h1>

        <motion.p
          variants={slideRise}
          className="mt-7 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base sm:leading-[1.8]"
        >
          {BOARD.body}
        </motion.p>

        {/*
         * The four things somebody scans for before reading a word. A definition
         * list rather than a row of divs because that is what it is — four
         * labelled values — and every one of them is counted from the lists
         * below rather than typed, so it cannot drift from what is rendered.
         */}
        <motion.dl
          variants={slideRise}
          className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-7 border-t border-cyber-steel/50 pt-8 sm:grid-cols-4"
        >
          {FACTS.map((fact) => (
            <div key={fact.id}>
              <dt className="font-cyber-mono text-[9px] uppercase tracking-[0.26em] text-zinc-500">
                {fact.label}
              </dt>
              <dd
                className={`mt-1.5 font-cyber-mono text-[11px] uppercase tracking-[0.14em] sm:text-xs ${
                  fact.value ? "text-cyber-aqua" : "text-zinc-600"
                }`}
              >
                {fact.value || "To be announced"}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.section>

      {/* ------------------------------------------------------- what's coming */}
      <motion.section
        className="relative px-6 pb-20 sm:px-8 sm:pb-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-6xl">
          <motion.div variants={slideRise}>
            <h2
              className={`text-[clamp(1.5rem,5vw,2.75rem)] uppercase text-white ${CYBER_HEADING}`}
            >
              Coming <span className="text-cyber-rose">up</span>
            </h2>
            <span aria-hidden className={`mt-7 block h-px w-full ${SOFT_RULE}`} />
          </motion.div>

          {UPCOMING.length > 0 ? (
            /*
             * One column, not two. These cards carry a poster, a paragraph and a
             * clock each, and side by side at 1440px that is two columns of
             * ~28rem — narrow enough that the artwork stops being legible as a
             * poster, which on the card advertising it is the wrong trade. A
             * board of full-width bands also reads in the order it is sorted in;
             * a grid asks the eye to choose.
             */
            <motion.div variants={seatRow} className="mt-10 flex flex-col gap-8">
              {UPCOMING.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </motion.div>
          ) : (
            /* Nothing scheduled is a true and useful thing for this page to say,
               and saying it is better than a section that vanishes — a board
               with no upcoming half looks broken rather than empty. */
            <motion.p
              variants={slideRise}
              className="mt-10 border border-cyber-steel/50 bg-black/40 p-8 text-sm leading-relaxed text-zinc-500"
            >
              Nothing on the board at the moment. The next one will be posted
              here first — everything the club has already run is below.
            </motion.p>
          )}
        </div>
      </motion.section>

      {/* --------------------------------------------------------- the record */}
      <motion.section
        className="relative border-t border-cyber-steel/40 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <PastLedger />
        </div>
      </motion.section>
    </main>
  );
}
