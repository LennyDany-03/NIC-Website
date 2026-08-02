"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import GoldTicks from "./GoldTicks";
import { GOLD_TILE } from "./gold";
import { PAST_EDITIONS } from "./content";
import { seatCard, seatRow, slideRise } from "../motionPresets";

/**
 * The editions that came before.
 *
 * The one section on this page carrying facts rather than promises, which is
 * why it is here at all: everything above is a date and a list of blanks, and a
 * page that only says "wait" gives a visitor no reason to believe there is
 * anything to wait for. Two symposiums already run is that reason.
 *
 * The rows are read out of the club's ledger rather than restated in this
 * folder — see `content.js`. If a past Genesis is missing from this section, it
 * is missing from the archive, and the archive is where to fix it.
 */
export default function Lineage() {
  if (PAST_EDITIONS.length === 0) return null;

  return (
    <>
      <motion.h2
        variants={slideRise}
        className="text-[clamp(1.75rem,5.5vw,3rem)] font-black uppercase leading-[0.9] tracking-tight text-white"
      >
        It has run <span className="text-genesis-gold">before</span>
      </motion.h2>

      <motion.p
        variants={slideRise}
        className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]"
      >
        Genesis is the club&rsquo;s longest-running thing. Both previous editions
        are on the record, alongside every workshop and hackathon NIC has put on
        since it was inaugurated.
      </motion.p>

      <motion.div
        variants={seatRow}
        className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6"
      >
        {PAST_EDITIONS.map((edition) => (
          <motion.div key={edition.id} variants={seatCard}>
            <Link
              href="/#archive"
              className={`group flex h-full flex-col justify-between p-6 focus-visible:border-genesis-gold focus-visible:outline-none sm:p-8 ${GOLD_TILE}`}
            >
              <GoldTicks />

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-genesis-gold">
                  {edition.kind}
                </p>
                <h3 className="mt-4 text-xl font-black uppercase leading-tight text-genesis-champagne sm:text-2xl">
                  {edition.title}
                </h3>
              </div>

              <p className="mt-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-genesis-bronze transition-colors duration-300 group-hover:text-genesis-champagne">
                {edition.year}
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
      </motion.div>
    </>
  );
}
