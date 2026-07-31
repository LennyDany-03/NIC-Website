"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import FrameCanvas from "../FrameCanvas";
import useSlideHandoff from "../useSlideHandoff";
import { block, rise, riseTransition, viewport } from "../motionPresets";
import { DEPARTMENT, MEET_US, VISION_MISSION } from "./content";

/**
 * The push is tracked off its own runway element rather than a fraction of the
 * section, because unlike the badge slide this section has no fixed height —
 * the copy decides it. A fraction would drift with the word count and the
 * canvas would stop matching the rate the crew section rises at, which is the
 * one thing the illusion cannot survive. Anchoring to a viewport-tall runway
 * keeps the push exactly one viewport whatever the articles measure.
 *
 * `["start end", "start start"]` reads as: 0 when the runway's top touches the
 * bottom of the screen, 1 when it reaches the top. Exactly one viewport.
 */
const RUNWAY_OFFSET = ["start end", "start start"];
/** Content has cleared; the deck is sitting on its transition card. */
const COMPLETE_AT = 0.03;
/** One more scroll — about two thirds of a wheel notch — advances it. */
const TRIGGER_AT = 0.08;

function Eyebrow({ children }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red sm:text-xs">
      {children}
    </span>
  );
}

export default function HeroSequence({ framesRef, ready, autoPush = false }) {
  const sectionRef = useRef(null);
  const runwayRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Progress starts the instant the section finishes sliding over the intro,
  // so the city flies past for exactly as long as there is copy to read.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Light on purpose: the smooth-scroll layer hands us a continuous position
  // and the canvas cross-fades between frames, so this only has to absorb the
  // odd jolt. Anything heavier and the city lags a viewport behind the copy.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 46,
    mass: 0.3,
    restDelta: 0.0005,
  });
  const playhead = prefersReducedMotion ? scrollYProgress : smoothed;

  // The city keeps flying as it is shoved off, rather than freezing the way the
  // badge does — a still logo reads as finished, a still city reads as broken.
  const { scrollYProgress: pushProgress } = useScroll({
    target: runwayRef,
    offset: RUNWAY_OFFSET,
  });
  const exitY = useTransform(pushProgress, [0, 1], ["0%", "-100%"]);

  // No hold on this one. Three articles of body copy mean a pause is someone
  // reading, not someone waiting to be moved along.
  useSlideHandoff({
    sectionRef,
    progress: pushProgress,
    completeAt: COMPLETE_AT,
    triggerAt: TRIGGER_AT,
    rearmMargin: 0.02,
    enabled: autoPush,
  });

  return (
    <section
      ref={sectionRef}
      className="relative z-10 pull-up-viewport bg-black"
    >
      {/* The NIC-red leading edge that wipes upward over the locked badge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-nic-red to-transparent shadow-[0_0_28px_6px_rgba(237,10,20,0.55)]"
      />

      {/* Pinned city flythrough — the backdrop for everything below. */}
      <motion.div
        className="sticky top-0 h-viewport w-full overflow-hidden will-change-transform"
        style={prefersReducedMotion ? undefined : { y: exitY }}
      >
        <FrameCanvas framesRef={framesRef} progress={playhead} ready={ready} />
        {/* Enough scrim for body copy to hold up, not so much that the neon dies. */}
        <div aria-hidden className="absolute inset-0 bg-black/70" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_100%)]"
        />
      </motion.div>

      {/* Copy rides over the pinned backdrop. */}
      <div className="relative pull-up-viewport">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          {/* ---------------------------------------------------- Meet us */}
          <motion.article
            id="meet-us"
            className="flex min-h-viewport flex-col justify-center py-24 sm:py-32"
            variants={block}
            initial="hidden"
            whileInView="shown"
            viewport={viewport}
          >
            <motion.div variants={rise} transition={riseTransition}>
              <Eyebrow>{MEET_US.eyebrow}</Eyebrow>
            </motion.div>

            <motion.h2
              variants={rise}
              transition={riseTransition}
              className="mt-6 text-[clamp(3rem,14vw,8rem)] font-black uppercase leading-[0.85] tracking-tight text-white"
            >
              {MEET_US.lead}
              <br />
              <span className="text-nic-red">{MEET_US.accent}</span>
            </motion.h2>

            <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
              <motion.p
                variants={rise}
                transition={riseTransition}
                className="text-sm leading-relaxed text-zinc-300 sm:text-base sm:leading-loose"
              >
                {MEET_US.body}
              </motion.p>

              <motion.figure
                variants={rise}
                transition={riseTransition}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                  <Image
                    src={MEET_US.photo.src}
                    alt={MEET_US.photo.alt}
                    width={MEET_US.photo.width}
                    height={MEET_US.photo.height}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="h-auto w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),rgba(0,0,0,0)_55%)]"
                  />
                </div>
                {/* Corner ticks, echoing the badge's hard geometry. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-1 -top-1 h-6 w-6 border-l-2 border-t-2 border-nic-red"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-nic-red"
                />

                <figcaption className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                  {MEET_US.stats.map((stat) => (
                    <span key={stat.label} className="block">
                      <span className="block font-mono text-base text-white sm:text-lg">
                        {stat.value}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                        {stat.label}
                      </span>
                    </span>
                  ))}
                </figcaption>
              </motion.figure>
            </div>
          </motion.article>

          {/* ------------------------------------------------- Department */}
          <motion.article
            id="department"
            className="flex min-h-viewport flex-col justify-center border-t border-white/10 py-24 sm:py-32"
            variants={block}
            initial="hidden"
            whileInView="shown"
            viewport={viewport}
          >
            <motion.div variants={rise} transition={riseTransition}>
              <Eyebrow>{DEPARTMENT.eyebrow}</Eyebrow>
            </motion.div>

            <motion.h2
              variants={rise}
              transition={riseTransition}
              className="mt-6 max-w-3xl text-[clamp(1.85rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-tight text-white"
            >
              {DEPARTMENT.title}
            </motion.h2>

            <motion.ul
              variants={rise}
              transition={riseTransition}
              className="mt-10 flex flex-wrap gap-2"
            >
              {DEPARTMENT.disciplines.map((discipline) => (
                <li
                  key={discipline}
                  className="rounded-full border border-white/15 bg-black/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 sm:bg-white/[0.04] sm:text-[11px] sm:backdrop-blur-sm"
                >
                  {discipline}
                </li>
              ))}
            </motion.ul>

            <motion.p
              variants={rise}
              transition={riseTransition}
              className="mt-10 max-w-4xl text-sm leading-relaxed text-zinc-300 sm:text-base sm:leading-loose"
            >
              {DEPARTMENT.body}
            </motion.p>

            <motion.div
              variants={rise}
              transition={riseTransition}
              className="mt-10 flex items-center gap-4 border-l-2 border-nic-red pl-5"
            >
              <span className="block">
                <span className="block text-base font-semibold text-white sm:text-lg">
                  {DEPARTMENT.lead.name}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  {DEPARTMENT.lead.role}
                </span>
              </span>
            </motion.div>
          </motion.article>

          {/* -------------------------------------------- Vision & mission */}
          <motion.article
            id="vision"
            className="flex min-h-viewport flex-col justify-center border-t border-white/10 py-24 sm:py-32"
            variants={block}
            initial="hidden"
            whileInView="shown"
            viewport={viewport}
          >
            <motion.div variants={rise} transition={riseTransition}>
              <Eyebrow>{VISION_MISSION.eyebrow}</Eyebrow>
            </motion.div>

            <motion.h2
              variants={rise}
              transition={riseTransition}
              className="mt-6 text-[clamp(2.25rem,8vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white"
            >
              Vision <span className="text-nic-red">&</span> Mission
            </motion.h2>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {VISION_MISSION.cards.map((card) => (
                <motion.div
                  key={card.id}
                  id={card.id}
                  variants={rise}
                  transition={riseTransition}
                  // Blur only from `sm` up: re-blurring a large panel over a
                  // repainting canvas every frame is the one thing that drops
                  // frames on a phone. Opacity carries legibility instead.
                  className="group relative overflow-hidden rounded-2xl border border-white/12 bg-black/75 p-7 transition-colors duration-500 hover:border-nic-red/50 sm:bg-black/50 sm:p-9 sm:backdrop-blur-md"
                >
                  <span
                    aria-hidden
                    className="absolute right-6 top-6 font-mono text-5xl font-black text-white/5 sm:text-6xl"
                  >
                    {card.index}
                  </span>
                  <h3 className="relative text-xl font-bold uppercase tracking-[0.12em] text-white sm:text-2xl">
                    {card.title}
                  </h3>
                  <span
                    aria-hidden
                    className="relative mt-5 block h-px w-12 bg-nic-red transition-all duration-500 group-hover:w-24"
                  />
                  <p className="relative mt-6 text-sm leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-loose">
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.article>
        </div>

        {/*
         * Clearance. The copy needs a full viewport to scroll off before the
         * panel starts moving, or the crew section arrives over a half-read
         * paragraph. Rather than leave that viewport empty, the deck uses it to
         * announce what it is about to cut to.
         */}
        <div className="flex h-viewport items-center justify-center px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={riseTransition}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500 sm:text-xs">
              Next
            </span>
            <p className="mt-5 text-[clamp(1.75rem,6vw,3.5rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
              The <span className="text-nic-red">Masterminds</span>
            </p>
            <span
              aria-hidden
              className="mx-auto mt-7 block h-10 w-px bg-linear-to-b from-nic-red to-transparent"
            />
          </motion.div>
        </div>

        {/*
         * The runway. Exactly one viewport, and the push is measured across it
         * — see RUNWAY_OFFSET above for why it is an element and not a number.
         */}
        <div ref={runwayRef} aria-hidden className="h-viewport" />
      </div>
    </section>
  );
}
