"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CornerTicks from "../CornerTicks";
import { ContactStrip } from "../ContactIcons";
import { slideBlock, slideRise, slideViewport } from "../motionPresets";
import { BOARDS } from "../CrewSequence/content";
import { CLUB_LINKS } from "../siteLinks";

/**
 * The answer to the loudest button on the site.
 *
 * "Join" has been the one filled shape in the navbar and the footer since the
 * page was built, and until now it pointed at the mission card — a paragraph
 * about what the club believes, which is not what someone clicking a button
 * marked JOIN is asking. What they are asking is whether they can get in, and
 * right now the answer is no. So this page says that in the first line, and
 * spends the rest of itself on the only thing left to do about it: who to ask.
 *
 * It is deliberately not a slide. Every screen of the front page is dealt by a
 * pinned deck that takes a scroll off the visitor and decides where they land —
 * fine for a sequence being watched, wrong for a notice being read. This is
 * ordinary flow, one screen for the answer and one block for the follow-up, and
 * a visitor who came here to be told something is told it without negotiating a
 * deck first.
 */

/**
 * The two boards, taken from the roster the front page is built from rather
 * than restated here. Names, captions and seat counts drift the moment they are
 * written down twice, and this page is the least likely of the two to be
 * remembered when a board changes.
 */
const ASK = BOARDS.map((board) => ({
  id: board.id,
  short: board.short,
  label: board.label,
  caption: board.caption,
  seats: board.members.length,
}));

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red sm:text-xs">
      <span aria-hidden className="h-px w-6 bg-nic-red/70" />
      {children}
    </span>
  );
}

export default function JoinNotice() {
  return (
    <main className="relative bg-black text-white">
      {/*
       * The one piece of atmosphere on the page: an ember low behind the
       * heading, in place of the frame sequence every other screen of this site
       * is lit by. Without it a page that is only type on black reads as an
       * error state rather than as part of the same building.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(237,10,20,0.16) 0%, rgba(237,10,20,0) 70%)",
        }}
      />

      {/* ------------------------------------------------------- the answer */}
      <motion.section
        className="relative mx-auto flex min-h-viewport w-full max-w-4xl flex-col items-center justify-center px-6 pb-20 pt-32 text-center sm:px-8 sm:pb-24 sm:pt-40"
        variants={slideBlock}
        initial="hidden"
        // Announced rather than revealed on scroll: this block is already on
        // screen when the page opens, and a whileInView reveal on the thing
        // someone navigated here to read is a reveal nobody is present for.
        animate="shown"
      >
        <motion.div variants={slideRise}>
          <Eyebrow>Join — intake closed</Eyebrow>
        </motion.div>

        <motion.h1
          variants={slideRise}
          className="mt-7 text-[clamp(2.5rem,9vw,5.75rem)] font-black uppercase leading-[0.85] tracking-tight text-white"
        >
          Hiring is
          <br />
          <span className="text-nic-red">Over</span>
        </motion.h1>

        <motion.span
          aria-hidden
          variants={slideRise}
          className="mt-9 block h-px w-16 bg-nic-red"
        />

        <motion.p
          variants={slideRise}
          className="mt-9 max-w-2xl border border-white/10 bg-white/[0.025] p-6 text-sm leading-relaxed text-zinc-300 sm:p-7 sm:leading-[1.85]"
        >
          Sorry — recruitment is over. Every seat on both boards is filled for
          this term, and NIC is not taking applications at the moment. The next
          intake is called by the Board of Directors, so they are the people to
          ask: when it opens, what a seat actually involves, and anything else
          worth knowing before then.
        </motion.p>

        <motion.a
          variants={slideRise}
          href="#contact-the-board"
          className="group mt-10 inline-flex items-center gap-3 border border-nic-red/70 bg-nic-red/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-all duration-300 hover:bg-nic-red focus-visible:bg-nic-red focus-visible:outline-none"
        >
          Contact the board
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          >
            ↓
          </span>
        </motion.a>
      </motion.section>

      {/* --------------------------------------------------- who to ask */}
      <motion.section
        id="contact-the-board"
        className="relative border-t border-white/10 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <motion.div variants={slideRise}>
            <Eyebrow>Where to ask</Eyebrow>
          </motion.div>

          <motion.h2
            variants={slideRise}
            className="mt-6 text-[clamp(1.75rem,5.5vw,3rem)] font-black uppercase leading-[0.9] tracking-tight text-white"
          >
            The Board of <span className="text-nic-red">Directors</span>
          </motion.h2>

          <motion.p
            variants={slideRise}
            className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]"
          >
            Seventeen posts run NIC, split across two boards. Both are on the
            front page — open any seat and the card gives that member&rsquo;s
            name, what they hold, and the handles they are reachable on.
          </motion.p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
            {ASK.map((board) => (
              <motion.div key={board.id} variants={slideRise}>
                <Link
                  href={`/#${board.id}`}
                  className="group relative flex h-full flex-col justify-between border border-white/10 bg-white/[0.02] p-6 transition-colors duration-500 hover:border-nic-red/60 hover:bg-nic-red/[0.06] focus-visible:border-nic-red focus-visible:outline-none sm:p-8"
                >
                  <CornerTicks />

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
                      {board.short}
                    </p>
                    <h3 className="mt-4 text-xl font-black uppercase leading-tight text-white sm:text-2xl">
                      {board.label}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {board.caption}.
                    </p>
                  </div>

                  <p className="mt-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors duration-300 group-hover:text-white">
                    {board.seats} seats
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/*
           * The club's own channels, under the people's. Same strip as the
           * footer's, so "reach the club" is one object wherever it appears —
           * and the handles it is still missing are declared once, in
           * `siteLinks`, rather than filled in twice.
           */}
          <motion.div
            variants={slideRise}
            className="mt-14 border-t border-white/10 pt-10"
          >
            <h3 className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
              <span aria-hidden className="h-px w-4 bg-nic-red/70" />
              Or the club itself
            </h3>

            <div className="mt-5 max-w-xs">
              <ContactStrip links={CLUB_LINKS} />
            </div>
          </motion.div>

          <motion.div variants={slideRise} className="mt-14">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-white"
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
    </main>
  );
}
