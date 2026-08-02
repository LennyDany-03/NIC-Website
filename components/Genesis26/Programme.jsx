"use client";

import { motion } from "framer-motion";
import GoldTicks from "./GoldTicks";
import { GOLD_TILE } from "./gold";
import { PROGRAMME } from "./content";
import { seatCard, seatRow, slideRise } from "../motionPresets";

/**
 * What the two days hold — or rather, the shape of it, since none of it is
 * settled yet.
 *
 * Every tile here is currently an open slot, and that is the section working as
 * intended rather than the section being unfinished. The alternative was to
 * invent a keynote, and a coming-soon page caught making up its own programme
 * has nothing left to be believed about — including the date, which is the one
 * thing on this page that genuinely matters. Numbered, dimmed and honest is the
 * same treatment the archive gives a ledger row that has a date before it has a
 * write-up.
 *
 * The tiles light up one at a time as `content.js` is filled in; nothing here
 * needs touching to do it.
 */
function Slot({ slot, index }) {
  const filled = Boolean(slot.title);
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      variants={seatCard}
      className={`group flex min-h-44 flex-col justify-between p-6 sm:min-h-52 sm:p-7 ${GOLD_TILE} ${
        filled ? "" : "border-dashed"
      }`}
    >
      {filled && <GoldTicks />}

      <div className="flex items-start justify-between gap-4">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
            filled ? "text-genesis-gold" : "text-genesis-bronze"
          }`}
        >
          {slot.kind || "Slot"}
        </span>
        <span
          aria-hidden
          className="font-mono text-[10px] tracking-[0.2em] text-genesis-bronze/80"
        >
          {number}
        </span>
      </div>

      <div className="mt-10">
        <h3
          className={`text-lg font-black uppercase leading-tight sm:text-xl ${
            filled ? "text-genesis-champagne" : "text-genesis-bronze"
          }`}
        >
          {slot.title || "To be announced"}
        </h3>

        {slot.note && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {slot.note}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Programme() {
  return (
    <>
      <motion.h2
        variants={slideRise}
        className="text-[clamp(1.75rem,5.5vw,3rem)] font-black uppercase leading-[0.9] tracking-tight text-white"
      >
        The <span className="text-genesis-gold">Programme</span>
      </motion.h2>

      <motion.p
        variants={slideRise}
        className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]"
      >
        Being put together now. Talks, competitions and workshops across the two
        days — what exactly, and who is running each of them, goes up here as it
        is confirmed.
      </motion.p>

      <motion.div
        variants={seatRow}
        className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {PROGRAMME.map((slot, index) => (
          <Slot key={slot.id} slot={slot} index={index} />
        ))}
      </motion.div>
    </>
  );
}
