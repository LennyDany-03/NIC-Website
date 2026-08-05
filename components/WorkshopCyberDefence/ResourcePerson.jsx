"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CYBER_HEADING, CYBER_LABEL, CYBER_PANEL } from "../eventsTheme";
import { SPEAKER } from "./content";
import { GRAIN_PLATE } from "../surfaces";
import { rowFromLeft, rowFromRight } from "../motionPresets";

/**
 * Who is teaching it.
 *
 * The poster gives the speaker a third of its width and a circular portrait,
 * because on a poster for a workshop the trainer *is* the offer — three session
 * titles are three session titles until you know who is standing in front of
 * them. This section is that billing, held to the same proportion.
 *
 * There is no headshot in the repo: the only photograph of him anywhere on this
 * site is the one composited into the poster's artwork, which is not a file this
 * page can crop. So the plate carries a monogram until `SPEAKER.photo` is set —
 * mounted on the same grain the front page's portraits use, so the empty state
 * reads as a frame waiting for its picture rather than as a missing image.
 */
function Plate() {
  return (
    <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-full border border-cyber-steel/70">
      {/* The poster's two lights, brought behind the plate. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-cyber-magenta/35 via-cyber-abyss to-cyber-teal/35"
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      {SPEAKER.photo ? (
        <Image
          src={SPEAKER.photo}
          alt={`${SPEAKER.honorific} ${SPEAKER.name}`}
          fill
          sizes="(min-width: 640px) 20rem, 60vw"
          className="relative object-cover"
        />
      ) : (
        <span
          aria-hidden
          className={`absolute inset-0 flex items-center justify-center text-5xl text-cyber-aqua/90 sm:text-6xl ${CYBER_HEADING}`}
        >
          {SPEAKER.initials}
        </span>
      )}
    </div>
  );
}

export default function ResourcePerson() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
      <motion.div
        variants={rowFromLeft}
        className="flex justify-center lg:justify-start"
      >
        <Plate />
      </motion.div>

      <motion.div variants={rowFromRight}>
        <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
          <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
          Resource person
        </span>

        <h2
          className={`mt-6 text-[clamp(1.5rem,5vw,2.75rem)] uppercase text-white ${CYBER_HEADING}`}
        >
          {SPEAKER.honorific}{" "}
          <span className="text-cyber-rose">{SPEAKER.name}</span>
        </h2>

        {/*
         * The two posts, as a list rather than as one comma-joined line. They
         * are held at two different organisations — the poster runs them
         * together and it is the one part of it that has to be read twice.
         */}
        <ul className="mt-6 flex flex-col gap-2">
          {SPEAKER.roles.map((role) => (
            <li
              key={role}
              className="flex items-start gap-3 text-sm text-zinc-300 sm:text-base"
            >
              <span
                aria-hidden
                className="mt-2 block h-1 w-1 shrink-0 rotate-45 bg-cyber-amber"
              />
              {role}
            </li>
          ))}
        </ul>

        <p className="mt-4 font-cyber-mono text-[11px] uppercase tracking-[0.28em] text-zinc-400">
          {SPEAKER.place}
        </p>

        <p className={`mt-8 text-sm leading-relaxed text-zinc-400 sm:leading-[1.85] ${CYBER_PANEL}`}>
          {SPEAKER.blurb}
        </p>
      </motion.div>
    </div>
  );
}
