"use client";

import { motion } from "framer-motion";
import { CYBER_HEADING, CYBER_LABEL, SOFT_RULE } from "../eventsTheme";
import { PAST } from "./content";
import { seatCard, seatRow, slideRise } from "../motionPresets";

/**
 * The record: everything the club has already run, newest first.
 *
 * The same rows the front page's archive slide deals four at a time, here in one
 * uninterrupted list. That difference is the point of having both. The slide is
 * paced — it is part of a deck being watched, and four rows is what a short
 * laptop carries once the running head is counted — whereas this is the list
 * somebody scrolls when they want to know whether the club has ever run a thing
 * like the one they are thinking of. A list you can scan beats a list dealt to
 * you, when scanning is what you came to do.
 *
 * Rows are numbered from the bottom, not the top. Counting down to 01 at the
 * oldest entry makes the number mean "how far back" rather than "position in a
 * list I am reading", and the oldest event the club ran keeps the same number
 * forever instead of being renumbered every time something new happens.
 *
 * A row with no `note` renders as title and date alone rather than padded out
 * with an invented sentence — the same honesty the ledger keeps in its own
 * content file, where an entry nobody can write up is left unwritten.
 */
export default function PastLedger() {
  return (
    <>
      <motion.div variants={slideRise}>
        <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
          <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
          On the record
        </span>

        <h2
          className={`mt-6 text-[clamp(1.5rem,5vw,2.75rem)] uppercase text-white ${CYBER_HEADING}`}
        >
          Already <span className="text-cyber-rose">run</span>
        </h2>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.75]">
          {PAST.length} events since the club was inaugurated in July 2024 —
          workshops, hackathons and two editions of Genesis. The photographs that
          go with them are in the archive on the front page.
        </p>

        <span aria-hidden className={`mt-9 block h-px w-full ${SOFT_RULE}`} />
      </motion.div>

      <motion.ol variants={seatRow} className="mt-2 flex flex-col">
        {PAST.map((entry, index) => (
          <motion.li
            key={entry.id}
            variants={seatCard}
            /*
             * 8.5rem for the date column, and it has to be a fixed width rather
             * than `auto`.
             *
             * Each row is its own grid — they are list items, not one grid with
             * `subgrid` rows — so an `auto` column is sized by that row's own
             * date and nothing else. The result lines up nothing: "9 Feb 2026"
             * and "25–26 Sep 2025" give their rows different column widths, and
             * the titles beside them start at a different place on every line.
             *
             * So the width is stated, and stated large enough for the longest
             * date the ledger actually holds — the two-day spans, "25–26 Sep
             * 2025" and friends, which measure ~119px set in the mono at 11px.
             * 7rem was the first guess here and it was 7px short, which is what
             * wrapped them. Anything longer than a two-day span wants this
             * number raised rather than `whitespace-nowrap` removed.
             */
            className="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-cyber-steel/30 py-5 transition-colors duration-500 hover:border-cyber-teal/50 sm:grid-cols-[3.5rem_8.5rem_minmax(0,1fr)] sm:gap-x-6"
          >
            <span
              aria-hidden
              className="col-start-1 row-start-1 font-cyber-mono text-[11px] tracking-[0.2em] text-zinc-700 transition-colors duration-500 group-hover:text-cyber-teal"
            >
              {String(PAST.length - index).padStart(2, "0")}
            </span>

            <div className="col-start-2 row-start-1 sm:col-start-3">
              <h3 className="text-sm font-medium text-zinc-200 transition-colors duration-500 group-hover:text-white sm:text-base">
                {entry.title}
              </h3>
              <p className="mt-1 font-cyber-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
                {entry.kind}
              </p>
            </div>

            {/* On a phone the date sits under the title rather than in a column
                of its own — three columns inside 390px leaves the titles, some
                of which run to fourteen words, about nine characters a line.
                It takes a grid row rather than going inside the block above so
                that it still lands directly under the title on a phone: with
                the note in that block, a date placed after it read as a
                footnote to the write-up rather than as the date of the event. */}
            <span className="col-start-2 row-start-2 mt-2 font-cyber-mono text-[10px] uppercase tracking-[0.2em] text-cyber-teal/80 sm:col-start-2 sm:row-start-1 sm:mt-0 sm:whitespace-nowrap sm:text-[11px]">
              {entry.year}
            </span>

            {entry.note && (
              <p className="col-start-2 row-start-3 mt-3 max-w-prose text-xs leading-relaxed text-zinc-500 sm:col-start-3 sm:row-start-2 sm:text-sm">
                {entry.note}
              </p>
            )}
          </motion.li>
        ))}
      </motion.ol>
    </>
  );
}
