"use client";

import { motion } from "framer-motion";
import CyberTicks from "./CyberTicks";
import { CYBER_HEADING, CYBER_LABEL, CYBER_TILE } from "../eventsTheme";
import { COORDINATORS } from "./content";
import { seatCard, seatRow, slideRise } from "../motionPresets";

/**
 * Who to ask.
 *
 * The students come first and the faculty second, which is the reverse of the
 * poster's order and deliberate. A poster is a formal document and puts the
 * convener at the top; a web page is opened by somebody with a question about a
 * seat, and the two numbers on it belong to the students. Their tiles are the
 * only things on the page that dial.
 *
 * `tel:` rather than a number to copy out. On the phone this page will mostly be
 * read on, that is the difference between a question asked and a question
 * abandoned — and the numbers are the ones already printed on a poster going up
 * around the campus, so nothing is being published here that is not public.
 */
function StudentTile({ person }) {
  return (
    <motion.div variants={seatCard}>
      <a
        href={`tel:${person.tel}`}
        className={`group flex h-full flex-col justify-between p-6 focus-visible:border-cyber-teal focus-visible:outline-none sm:p-7 ${CYBER_TILE}`}
      >
        <CyberTicks />

        <div>
          <p className={CYBER_LABEL}>Student coordinator</p>
          <h3 className={`mt-4 text-xl uppercase text-white sm:text-2xl ${CYBER_HEADING}`}>
            {person.name}
          </h3>
        </div>

        <p className="mt-8 flex items-center justify-between gap-4 font-cyber-mono text-sm tracking-[0.16em] text-cyber-aqua transition-colors duration-300 group-hover:text-white">
          {person.phone}
          <span
            aria-hidden
            className="text-cyber-teal transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </p>
      </a>
    </motion.div>
  );
}

/**
 * The pair of them, as a grid.
 *
 * Exported because the registration page needs exactly this and nothing else
 * around it: a form that is not open yet has to end in two people who can answer
 * for it, and a second copy of these tiles written over there would be two sets
 * of phone numbers to keep in step. Expects a parent carrying `seatRow` — the
 * stagger belongs to whatever row is dealing the cards.
 */
export function StudentTiles() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
      {COORDINATORS.students.map((person) => (
        <StudentTile key={person.id} person={person} />
      ))}
    </div>
  );
}

/**
 * The faculty behind it. No contact on the poster and none invented here — these
 * are a credit line, not a channel, and a card that looked clickable and was not
 * would be worse than a card that plainly is not.
 */
function FacultyRow({ person }) {
  return (
    <motion.div
      variants={seatCard}
      className="flex flex-col gap-1 border-t border-cyber-steel/40 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
    >
      <p className={`${CYBER_LABEL} sm:w-56 sm:shrink-0`}>{person.role}</p>

      <p className="grow text-base text-white sm:text-lg">{person.name}</p>

      <p className="font-cyber-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
        {person.note}
      </p>
    </motion.div>
  );
}

export default function Coordinators() {
  return (
    <>
      <motion.div variants={slideRise}>
        <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
          <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
          Who to ask
        </span>
      </motion.div>

      <motion.h2
        variants={slideRise}
        className={`mt-6 text-[clamp(1.5rem,5vw,2.75rem)] uppercase text-white ${CYBER_HEADING}`}
      >
        Ask a <span className="text-cyber-teal">coordinator</span>
      </motion.h2>

      <motion.p
        variants={slideRise}
        className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]"
      >
        Anything the page does not answer — the hall, a seat, whether your year
        is eligible — goes to the two students running it. They are the ones who
        will know first when registration opens.
      </motion.p>

      <motion.div variants={seatRow} className="mt-12">
        <StudentTiles />
      </motion.div>

      <motion.div variants={seatRow} className="mt-14">
        <motion.h3
          variants={slideRise}
          className="font-cyber-mono text-[10px] uppercase tracking-[0.3em] text-cyber-rose"
        >
          Convened by
        </motion.h3>

        <div className="mt-4">
          {COORDINATORS.faculty.map((person) => (
            <FacultyRow key={person.id} person={person} />
          ))}
        </div>
      </motion.div>
    </>
  );
}
