"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import CyberTicks from "./CyberTicks";
import { CYBER_HEADING, CYBER_LABEL } from "../eventsTheme";
import { HOST, POSTER } from "./content";
import { rowFromLeft, rowFromRight } from "../motionPresets";

/**
 * The poster itself.
 *
 * Everything above this section is the poster taken apart — its colours, its
 * schedule, its speaker — so showing the original at the end is not decoration
 * and not duplication: it is the artefact people will actually have seen on a
 * noticeboard, and the thing that makes this page recognisably the same event.
 * It is also what somebody wanting to forward the workshop to a friend will
 * reach for, hence the link out to the full-size file.
 *
 * `sizes` is the load-bearing prop. This is a 1131×1600 JPEG at 450 KB; without
 * it, next/image assumes the image may fill the viewport and serves a phone the
 * widest candidate it has for a plate that is never more than ~28rem wide.
 * Un-prioritised on purpose — it sits well below the fold, behind a countdown
 * that is the reason anybody opened the page.
 */
export default function PosterPlate() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
      <motion.div variants={rowFromLeft}>
        <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
          <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
          The poster
        </span>

        <h2
          className={`mt-6 text-[clamp(1.5rem,5vw,2.75rem)] uppercase text-white ${CYBER_HEADING}`}
        >
          As it went <span className="text-cyber-rose">up</span>
        </h2>

        {/*
         * The hosting stack, set as the poster sets it: narrowing from the
         * institute to the club, one line at a time. It is the only place on
         * this page the full formal billing appears, and it belongs beside the
         * document it was taken from rather than at the top of a page whose job
         * is a date and a clock.
         */}
        <ul className="mt-8 flex flex-col gap-2 border-l border-cyber-steel/60 pl-5">
          {HOST.map((line, index) => (
            <li
              key={line}
              className={
                index === HOST.length - 1
                  ? "text-sm text-cyber-aqua sm:text-base"
                  : "text-sm text-zinc-400"
              }
            >
              {line}
            </li>
          ))}
        </ul>

        <a
          href={POSTER.src}
          target="_blank"
          rel="noreferrer"
          className="group mt-9 inline-flex items-center gap-3 font-cyber-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-cyber-aqua"
        >
          Open the full poster
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            ↗
          </span>
        </a>
      </motion.div>

      <motion.figure
        variants={rowFromRight}
        className="group relative mx-auto w-full max-w-md border border-cyber-steel/60 p-2 sm:p-3"
      >
        <CyberTicks />

        <Image
          src={POSTER.src}
          alt={POSTER.alt}
          width={POSTER.width}
          height={POSTER.height}
          sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 90vw"
          className="h-auto w-full"
        />
      </motion.figure>
    </div>
  );
}
