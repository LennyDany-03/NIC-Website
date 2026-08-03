"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Countdown from "./Countdown";
import GenesisWordmark from "./GenesisWordmark";
import Lineage from "./Lineage";
import Marquee from "./Marquee";
import Programme from "./Programme";
import { FOIL_RULE, GOLD_BUTTON, GOLD_LABEL } from "./gold";
import { EDITION_NO, EVENT, FACTS } from "./content";
import { GRAIN_PLATE } from "../surfaces";
import { JOIN_HREF } from "../siteLinks";
import { slideBlock, slideRise, slideViewport } from "../motionPresets";

/**
 * Genesis'26 — the coming-soon page.
 *
 * Deliberately not a deck, for the same reason `/join` is not one. Every screen
 * of the front page is dealt by a pinned sequence that takes a scroll off the
 * visitor and decides where they land, which is right for a sequence being
 * watched and wrong for a date being checked. Somebody arriving here wants one
 * number, and they should not have to negotiate four pinned panels to reach it:
 * the clock is above the fold on every size, and everything under it is
 * ordinary flow.
 *
 * It is also the one page on this site that is not red. The gold is the event's,
 * not the club's — the navbar and footer arrive in NIC red exactly as they do
 * everywhere else, so the page reads as a poster hung in a building rather than
 * as a different building.
 */

function Eyebrow({ children }) {
  return (
    <span className={`inline-flex items-center gap-3 ${GOLD_LABEL}`}>
      <span aria-hidden className="h-px w-6 bg-genesis-gold/70" />
      {children}
    </span>
  );
}

export default function Genesis26() {
  return (
    <main className="relative overflow-hidden bg-genesis-void text-white">
      {/*
       * The light the whole page is lit by.
       *
       * Every other screen on this site has a frame sequence behind it; this one
       * has ~35 MB of nothing, because a page whose entire job is to load fast
       * enough to show a number should not be downloading a flythrough to do it.
       * A gold wash low behind the wordmark is standing in for the sequence, and
       * without it the page is type on black, which reads as an error state
       * rather than as a poster.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[85vh]"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 0%, rgba(204,166,87,0.20) 0%, rgba(204,166,87,0.05) 45%, rgba(1,0,0,0) 72%)",
        }}
      />

      {/*
       * The same grain the portraits are mounted on, thrown across the whole
       * page. Flat gold on flat black is the one combination that bands visibly
       * on an 8-bit panel — the gradient above steps rather than sweeps — and a
       * few percent of noise is the standard fix: it dithers the ramp and costs
       * one inline SVG that tiles at any size.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      {/* ----------------------------------------------------------- the hero */}
      {/*
       * The hero's vertical rhythm is measured in `vh`, not in fixed steps.
       *
       * A landscape phone is 390px tall, and the same stack of margins that
       * breathes on a 900px desktop pushed the clock's baseline to 447px there —
       * i.e. clean off the bottom of the screen. A countdown below the fold is
       * the page failing at the only thing it does, so every gap between the
       * eyebrow and the fact strip clamps against viewport height: it opens up
       * to the desktop's spacing when there is room and collapses to something
       * tight when there is not. The floors are what stop it closing to nothing
       * on a very short screen; the ceilings are the spacing this was designed
       * at. The wordmark already clamps the same way — see `GenesisWordmark`.
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
          <Eyebrow>
            {EVENT.status} — Edition {EDITION_NO}
          </Eyebrow>
        </motion.div>

        <div className="mt-[clamp(0.75rem,3vh,2rem)]">
          <GenesisWordmark />
        </div>

        <motion.p
          variants={slideRise}
          className="mt-[clamp(0.75rem,2.5vh,1.75rem)] font-mono text-[11px] uppercase tracking-[0.34em] text-genesis-rich sm:text-sm"
        >
          {EVENT.dateLabel}
        </motion.p>

        <motion.span
          aria-hidden
          variants={slideRise}
          className={`mt-[clamp(1.25rem,4vh,2.5rem)] block h-px w-40 ${FOIL_RULE}`}
        />

        <motion.div
          variants={slideRise}
          className="mt-[clamp(1.25rem,4vh,2.75rem)]"
        >
          <Countdown />
        </motion.div>

        {/*
         * The four things somebody scans for before reading a word. Set as a
         * definition list rather than a row of divs because that is what it is
         * — four labelled values — and the two blanks in it are meant to be
         * legible as blanks.
         */}
        <motion.dl
          variants={slideRise}
          className="mt-[clamp(1.5rem,5vh,3.5rem)] grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-7 border-t border-genesis-bronze/45 pt-[clamp(1.25rem,3.5vh,2rem)] sm:grid-cols-4"
        >
          {FACTS.map((fact) => (
            <div key={fact.id}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.26em] text-genesis-bronze">
                {fact.label}
              </dt>
              <dd
                className={`mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] sm:text-xs ${
                  fact.value ? "text-genesis-champagne" : "text-zinc-600"
                }`}
              >
                {fact.value || "To be announced"}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.section>

      <Marquee />

      {/* ------------------------------------------------------- what it is */}
      <motion.section
        className="relative px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <motion.div variants={slideRise}>
            <Eyebrow>What it is</Eyebrow>
          </motion.div>

          <motion.p
            variants={slideRise}
            className="mt-8 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg sm:leading-[1.8]"
          >
            {EVENT.body}
          </motion.p>

          <motion.p
            variants={slideRise}
            className="mt-8 max-w-2xl border-l-2 border-genesis-gold/60 pl-5 text-sm leading-relaxed text-zinc-500 sm:leading-[1.85]"
          >
            {EVENT.note}
          </motion.p>

          <motion.div
            variants={slideRise}
            className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            {/*
             * The only thing on this page asking for something back, and it
             * cannot ask for the obvious thing — there is no registration form
             * to point at yet, and a button that opens a dead link is worse
             * than no button. So it points at the people who will know first,
             * which is the same answer `/join` gives.
             */}
            <Link href={`${JOIN_HREF}#contact-the-board`} className={GOLD_BUTTON}>
              Ask the board
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-1 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-genesis-champagne"
            >
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to the front page
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* --------------------------------------------------- the programme */}
      <motion.section
        className="relative border-t border-genesis-bronze/40 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-6xl">
          <Programme />
        </div>
      </motion.section>

      {/* ------------------------------------------------------- the lineage */}
      <motion.section
        className="relative border-t border-genesis-bronze/40 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <Lineage />
        </div>
      </motion.section>
    </main>
  );
}
