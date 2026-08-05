"use client";

import { motion } from "framer-motion";
import Coordinators from "./Coordinators";
import Countdown from "./Countdown";
import Marquee from "./Marquee";
import PosterPlate from "./PosterPlate";
import RegistrationCta from "./RegistrationCta";
import ResourcePerson from "./ResourcePerson";
import Sessions from "./Sessions";
import WorkshopWordmark from "./WorkshopWordmark";
import { CYBER_LABEL, GRID_PLATE, GRID_SIZE, SOFT_RULE } from "./theme";
import { EVENT, FACTS } from "./content";
import { GRAIN_PLATE } from "../surfaces";
import { slideBlock, slideRise, slideViewport } from "../motionPresets";

/**
 * Workshop on Modern Cyber Defence — the event page.
 *
 * Not a deck, for the reason `/genesis-26` and `/join` are not decks. Every
 * screen of the front page is dealt by a pinned frame sequence that takes a
 * scroll off the visitor and decides where they land, which is right for a
 * sequence being watched and wrong for a date being checked. Somebody arriving
 * here — most of them off the QR code on the poster, on a phone, standing in a
 * corridor — wants one number and one answer about registration, and should not
 * have to negotiate four pinned panels to reach either. The clock is above the
 * fold on every size and everything under it is ordinary flow.
 *
 * The colour is the poster's and stops at the edges of the event: the navbar and
 * footer arrive in NIC red exactly as they do everywhere else, so this reads as
 * a poster hung in a building rather than as a different building. The type is
 * the poster's too, loaded by the route's own layout — see
 * `app/events/workshop-modern-cyber-defence/layout.jsx`.
 */
export default function WorkshopCyberDefence() {
  return (
    <main className="relative overflow-hidden bg-cyber-void font-cyber-body text-white">
      {/*
       * The light the page is lit by, and the whole reason it does not read as
       * type on black.
       *
       * Every other screen on this site has a frame sequence behind it; this one
       * has ~35 MB of nothing, because a page whose job is to load fast enough
       * to show a number should not download a flythrough to do it. So the
       * poster's own lighting stands in for the sequence: magenta raking in from
       * the top left, teal rising from the right, and the two overlapping low
       * behind the wordmark where the poster puts its amber core.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[95vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 12% 0%, rgba(200,31,110,0.30) 0%, rgba(200,31,110,0) 62%), radial-gradient(ellipse 65% 60% at 88% 18%, rgba(43,183,189,0.24) 0%, rgba(43,183,189,0) 66%), radial-gradient(ellipse 45% 40% at 50% 42%, rgba(242,178,60,0.14) 0%, rgba(242,178,60,0) 70%)",
        }}
      />

      {/*
       * The circuitry, at 4%. It stands in for the traced-out artwork behind the
       * poster's crowd, and it is not really seen — it is what stops the large
       * empty margins of this layout reading as unpainted. Masked away towards
       * the bottom of the hero so it never competes with the clock.
       */}
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

      {/*
       * The same grain the front page's portraits are mounted on, thrown across
       * the whole page. Wide flat gradients on an 8-bit panel band visibly — the
       * washes above step rather than sweep — and a few percent of noise is the
       * standard fix: it dithers the ramp for one inline SVG that tiles at any
       * size.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      {/* ----------------------------------------------------------- the hero */}
      {/*
       * The hero's vertical rhythm is measured in `vh`, not in fixed steps.
       *
       * A landscape phone is 390px tall, and a stack of margins that breathes on
       * a 900px desktop puts the clock's baseline well under the fold there — a
       * countdown below the fold being the page failing at the only thing it
       * does. So every gap between the eyebrow and the fact strip clamps against
       * viewport height: it opens to the desktop's spacing when there is room and
       * collapses tight when there is not. The floors stop it closing to nothing
       * on a very short screen; the ceilings are the spacing this was designed
       * at. The wordmark clamps the same way — see `WorkshopWordmark`.
       */}
      <motion.section
        className="relative mx-auto flex min-h-viewport w-full max-w-6xl flex-col items-center justify-center px-6 pb-[clamp(3rem,8vh,5rem)] pt-[clamp(5.5rem,16vh,8rem)] text-center sm:px-8"
        variants={slideBlock}
        initial="hidden"
        // Announced, not revealed on scroll. This block is already on screen
        // when the page opens, and a whileInView reveal on the thing somebody
        // navigated here to read is a reveal nobody is present for.
        animate="shown"
      >
        <motion.div variants={slideRise}>
          <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
            <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
            {EVENT.kind} — {EVENT.status}
          </span>
        </motion.div>

        <div className="mt-[clamp(0.75rem,3vh,2rem)]">
          <WorkshopWordmark />
        </div>

        <motion.p
          variants={slideRise}
          className="mt-[clamp(0.75rem,2.5vh,1.75rem)] font-cyber-mono text-[11px] uppercase tracking-[0.34em] text-cyber-aqua sm:text-sm"
        >
          {EVENT.dateLabel} · {EVENT.timeLabel}
        </motion.p>

        <motion.span
          aria-hidden
          variants={slideRise}
          className={`mt-[clamp(1.25rem,4vh,2.5rem)] block h-px w-40 ${SOFT_RULE}`}
        />

        <motion.div variants={slideRise} className="mt-[clamp(1.25rem,4vh,2.75rem)]">
          <Countdown />
        </motion.div>

        {/*
         * The four things somebody scans for before reading a word. Set as a
         * definition list rather than a row of divs because that is what it is —
         * four labelled values — and the blank in it is meant to be legible as a
         * blank rather than filled with an invented hall.
         */}
        <motion.dl
          variants={slideRise}
          className="mt-[clamp(1.5rem,5vh,3.5rem)] grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-7 border-t border-cyber-steel/50 pt-[clamp(1.25rem,3.5vh,2rem)] sm:grid-cols-4"
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

      <Marquee />

      {/* ---------------------------------------------------------- the day */}
      <motion.section
        className="relative px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <Sessions />
        </div>
      </motion.section>

      {/* ------------------------------------------------------- the speaker */}
      <motion.section
        className="relative border-t border-cyber-steel/40 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <ResourcePerson />
        </div>
      </motion.section>

      {/* -------------------------------------------------- registration */}
      <motion.section
        className="relative px-6 pb-20 sm:px-8 sm:pb-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <RegistrationCta />
        </div>
      </motion.section>

      {/* ---------------------------------------------------- who to ask */}
      <motion.section
        className="relative border-t border-cyber-steel/40 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <Coordinators />
        </div>
      </motion.section>

      {/* ------------------------------------------------------- the poster */}
      <motion.section
        className="relative border-t border-cyber-steel/40 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-6xl">
          <PosterPlate />
        </div>
      </motion.section>
    </main>
  );
}
