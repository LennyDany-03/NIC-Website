"use client";

import { motion } from "framer-motion";
import CyberTicks from "./CyberTicks";
import { CYBER_HEADING, CYBER_LABEL, CYBER_TILE } from "../eventsTheme";
import { EVENT, SESSIONS } from "./content";
import { seatCard, seatRow, slideRise } from "../motionPresets";

/**
 * The day, in the three blocks the poster breaks it into.
 *
 * This is the section that separates this page from the club's other event page.
 * Genesis'26 is four deliberately empty slots — a date and a promise — because
 * its programme genuinely is not decided; this workshop is scheduled to the
 * quarter hour before the poster was printed, and the honest thing is to lead
 * with that. Somebody deciding whether to give up a Thursday wants to know what
 * the Thursday holds, and here we can tell them.
 *
 * Laid out as an ordered list rather than a grid of tiles, because the three
 * sessions are a sequence and not a menu: the second follows from the first and
 * the third carries both into the cloud. The times run down a rail on the left
 * from `sm` up, so the day can be read as a timetable at a glance and as three
 * cards when there is no room for a rail.
 */
function Session({ session, index }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.li
      variants={seatCard}
      className={`group flex flex-col gap-6 p-6 sm:flex-row sm:gap-9 sm:p-8 ${CYBER_TILE}`}
    >
      <CyberTicks />

      {/*
       * The rail. Fixed width from `sm` up so all three times start on the same
       * vertical — a rail that sized itself to its content would step in and out
       * by a character between "9:00 AM" and "10:45 AM" and stop reading as a
       * timetable.
       */}
      <div className="flex shrink-0 items-center gap-4 sm:w-36 sm:flex-col sm:items-start sm:gap-0">
        <p className={CYBER_LABEL}>{session.label}</p>

        <p className="flex items-center gap-2 font-cyber-mono text-sm tracking-[0.12em] text-cyber-aqua sm:mt-4 sm:flex-col sm:items-start sm:gap-1">
          <span>{session.start}</span>
          {/* An arrow on the phone, where the two times sit side by side, and a
              short rule on the rail, where they stack. Same information, drawn
              the way each layout reads it. */}
          <span aria-hidden className="text-cyber-steel sm:hidden">
            →
          </span>
          <span
            aria-hidden
            className="hidden h-3 w-px bg-cyber-steel sm:my-1 sm:block"
          />
          <span className="text-cyber-teal">{session.end}</span>
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          {/* Sentence case, exactly as the poster prints it. Fourteen words of
              Orbitron in caps is a paragraph shouted. */}
          <h3 className={`text-lg text-white sm:text-xl ${CYBER_HEADING}`}>
            {session.title}
          </h3>
          <span
            aria-hidden
            className="font-cyber-mono text-[11px] tracking-[0.2em] text-cyber-steel"
          >
            {number}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]">
          {session.note}
        </p>
      </div>
    </motion.li>
  );
}

export default function Sessions() {
  return (
    <>
      <motion.div variants={slideRise}>
        <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
          <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
          {EVENT.dayLabel}
        </span>
      </motion.div>

      <motion.h2
        variants={slideRise}
        className={`mt-6 text-[clamp(1.5rem,5vw,2.75rem)] uppercase text-white ${CYBER_HEADING}`}
      >
        The <span className="text-cyber-teal">day</span>
      </motion.h2>

      <motion.p
        variants={slideRise}
        className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]"
      >
        {EVENT.body}
      </motion.p>

      <motion.ol
        variants={seatRow}
        className="mt-12 flex flex-col gap-4 sm:gap-5"
      >
        {SESSIONS.map((session, index) => (
          <Session key={session.id} session={session} index={index} />
        ))}
      </motion.ol>

      <motion.p
        variants={slideRise}
        className="mt-8 max-w-2xl border-l-2 border-cyber-rose/60 pl-5 text-sm leading-relaxed text-zinc-500 sm:leading-[1.85]"
      >
        {EVENT.note}
      </motion.p>
    </>
  );
}
