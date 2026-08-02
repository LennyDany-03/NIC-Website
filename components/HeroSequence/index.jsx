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
import SceneStill from "../SceneStill";
import Slide, {
  SLIDE_COMPLETE_AT,
  SLIDE_REARM_MARGIN,
  SLIDE_TRIGGER_AT,
} from "../Slide";
import useIsMobile from "../useIsMobile";
import useSlideHandoff from "../useSlideHandoff";
import { slideRise } from "../motionPresets";
import { HEADING_SHADOW, LABEL_SHADOW, PANEL } from "../surfaces";
import { DEPARTMENT, MEET_US, VISION_MISSION } from "./content";

/**
 * Three slides of copy over one continuous flythrough. Each article is a screen
 * tall and rides in normal flow above the pinned city, so advancing one is
 * nothing more exotic than scrolling it off the top — but that scroll is played
 * as a single gesture rather than left to be inched through, which is what makes
 * them read as a deck instead of one long page that happens to have headings.
 *
 * The last slide is the exception: it has no push of its own, because what
 * leaves next is the whole section, city included, shoved off by the crew.
 *
 * That final push is tracked off its own runway element rather than a fraction
 * of the section, because unlike the badge slide this section has no fixed
 * height — the copy decides it. A fraction would drift with the word count and
 * the canvas would stop matching the rate the crew section rises at, which is
 * the one thing the illusion cannot survive. Anchoring to a viewport-tall
 * runway keeps the push exactly one viewport whatever the articles measure.
 *
 * `["start end", "start start"]` reads as: 0 when the runway's top touches the
 * bottom of the screen, 1 when it reaches the top. Exactly one viewport.
 */
const RUNWAY_OFFSET = ["start end", "start start"];

/**
 * Type scales off the shorter of the two axes.
 *
 * These slides advance as a unit only while they fit on one screen, so height
 * is a real constraint on the display sizes and not just width — a 16:9 laptop
 * at 768px has far less room than its width suggests. Clamping against `vh` as
 * well as `vw` keeps a heading from being the thing that pushes a slide over
 * the edge and quietly turns the deck off for it.
 */
const HEADING_XL = "text-[clamp(2.5rem,min(8vw,11vh),5.5rem)]";
const HEADING_LG = "text-[clamp(2rem,min(6.5vw,9vh),4.25rem)]";
const HEADING_MD = "text-[clamp(1.75rem,min(5vw,7vh),3.25rem)]";

/**
 * The frame the phone stands this section on: the drone shot deep in the canyon,
 * where the river runs straight down the middle of the composition. It is the
 * one part of the flythrough that survives a portrait crop with its subject
 * intact — the buildings fall away to either side and lose nothing that was
 * carrying the shot.
 */
const PHONE_STILL = "/frames/frames_drone/frame_0060.webp";

function Eyebrow({ children }) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red sm:text-xs ${LABEL_SHADOW}`}
    >
      <span aria-hidden className="h-px w-6 bg-nic-red/70" />
      {children}
    </span>
  );
}

export default function HeroSequence({ framesRef, ready, autoPush = false }) {
  const sectionRef = useRef(null);
  const runwayRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Progress starts the instant the section finishes sliding over the intro,
  // so the city flies past for exactly as long as there is copy to read.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Light on purpose: the smooth-scroll layer hands us a continuous position
  // and the canvas cross-fades between frames, so this only has to absorb the
  // odd jolt. Anything heavier and the city lags a viewport behind the copy —
  // which is what it had started doing, since a push now covers that viewport
  // in 0.7s and the old settings were still catching up after it landed.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 380,
    damping: 42,
    mass: 0.25,
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
    completeAt: SLIDE_COMPLETE_AT,
    triggerAt: SLIDE_TRIGGER_AT,
    rearmMargin: SLIDE_REARM_MARGIN,
    enabled: autoPush && !isMobile,
  });

  return (
    <section
      ref={sectionRef}
      // The pull-up is the deck's: it drags this section a screen up so it
      // wipes over the pinned badge. On a phone there is no pinned badge to
      // wipe over — the opening screen is one screen and ends — so the section
      // simply follows it.
      className="relative z-10 bg-black lg:pull-up-viewport"
    >
      {/* The NIC-red leading edge that wipes upward over the locked badge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-nic-red to-transparent shadow-[0_0_28px_6px_rgba(237,10,20,0.55)]"
      />

      {isMobile ? (
        <SceneStill
          still={PHONE_STILL}
          opacity={0.62}
          glow="radial-gradient(85% 50% at 50% 30%, rgba(237,10,20,0.18) 0%, rgba(237,10,20,0) 72%)"
        />
      ) : (
        /* Pinned city flythrough — the backdrop for everything below. */
        <motion.div
          className="sticky top-0 h-viewport w-full overflow-hidden will-change-transform"
          style={prefersReducedMotion ? undefined : { y: exitY }}
        >
          <FrameCanvas framesRef={framesRef} progress={playhead} ready={ready} />
          {/* Takes the glare off the neon. The panels do the rest — see PANEL. */}
          <div aria-hidden className="absolute inset-0 bg-black/40" />
          {/* Frames the shot and hides the letterbox seam on tall screens. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_38%,rgba(0,0,0,0.5)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.75),rgba(0,0,0,0))]"
          />
        </motion.div>
      )}

      {/* Copy rides over the pinned backdrop. */}
      <div className="relative lg:pull-up-viewport">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          {/* ---------------------------------------------------- Meet us */}
          <Slide id="meet-us">
            {/*
             * Title, copy and photograph share one band rather than stacking,
             * because stacked this slide is taller than any laptop screen —
             * and a slide that doesn't fit is one the deck stops advancing.
             * Side by side it also finally reads as a spread: the club stated
             * on the left, the club shown on the right.
             *
             * The photograph takes the larger share of it. It is a group of
             * around thirty people, so every point of width is a face becoming
             * recognisable; the copy beside it is a measure that was on the
             * loose side anyway and reads better narrower. The text column is
             * `minmax(0,...)` because a long unbroken word in a fractional
             * column will otherwise widen it and quietly steal that width back.
             */}
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-12">
              <div>
                <motion.div variants={slideRise}>
                  <Eyebrow>{MEET_US.eyebrow}</Eyebrow>
                </motion.div>

                <motion.h2
                  variants={slideRise}
                  className={`mt-5 font-black uppercase leading-[0.85] tracking-tight text-white ${HEADING_XL} ${HEADING_SHADOW}`}
                >
                  {MEET_US.lead}
                  <br />
                  <span className="text-nic-red">{MEET_US.accent}</span>
                </motion.h2>

                <motion.div variants={slideRise} className={`mt-6 ${PANEL}`}>
                  <p className="text-[15px] leading-relaxed text-white sm:leading-[1.6]">
                    {MEET_US.standfirst}
                  </p>
                  <span
                    aria-hidden
                    className="mt-4 block h-px w-10 bg-nic-red"
                  />
                  {/*
                   * Sized off height as well, for the reason the headings are:
                   * a narrower column is a taller one, and this is the block
                   * that decides whether the slide still fits a short screen.
                   */}
                  <p className="mt-4 text-[clamp(0.8125rem,1.65vh,0.875rem)] leading-relaxed text-zinc-400 sm:leading-[1.7]">
                    {MEET_US.body}
                  </p>
                </motion.div>
              </div>

              <motion.figure variants={slideRise} className="relative">
                {/* The plate the photograph is lit against. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(237,10,20,0.16)_0%,rgba(237,10,20,0)_70%)]"
                />

                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)]">
                  <Image
                    src={MEET_US.photo.src}
                    alt={MEET_US.photo.alt}
                    width={MEET_US.photo.width}
                    height={MEET_US.photo.height}
                    sizes="(max-width: 1024px) 92vw, 56vw"
                    className="h-auto w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.5),rgba(0,0,0,0)_55%)]"
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

                <figcaption className="relative mt-6 flex flex-wrap gap-x-10 gap-y-4">
                  {MEET_US.stats.map((stat) => (
                    <span key={stat.label} className="block">
                      <span className="block font-mono text-base text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)] sm:text-lg">
                        {stat.value}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
                        {stat.label}
                      </span>
                    </span>
                  ))}
                </figcaption>
              </motion.figure>
            </div>
          </Slide>

          {/* ------------------------------------------------- Department */}
          <Slide id="department" className="border-t border-white/10">
            <motion.div variants={slideRise}>
              <Eyebrow>{DEPARTMENT.eyebrow}</Eyebrow>
            </motion.div>

            <motion.h2
              variants={slideRise}
              className={`mt-5 max-w-3xl font-black uppercase leading-[0.95] tracking-tight text-white ${HEADING_MD} ${HEADING_SHADOW}`}
            >
              {DEPARTMENT.title}
            </motion.h2>

            <motion.ul
              variants={slideRise}
              className="mt-7 flex flex-wrap gap-2"
            >
              {DEPARTMENT.disciplines.map((discipline) => (
                <li
                  key={discipline}
                  className="rounded-full border border-white/15 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-200 sm:bg-white/[0.06] sm:text-[11px] sm:backdrop-blur-sm"
                >
                  {discipline}
                </li>
              ))}
            </motion.ul>

            <motion.div variants={slideRise} className={`mt-7 ${PANEL}`}>
              {/*
               * Two columns for the same reason the meet-us slide is a spread:
               * a single measure this long is both a tiring read and tall
               * enough on its own to cost the slide its advance.
               */}
              {/*
               * No byline under this. Dr. Chitra is named in the copy already
               * and gets a screen of her own in the masterminds deck below —
               * a third billing on the same page was the one place the site
               * repeated itself.
               */}
              <p className="text-sm leading-relaxed text-zinc-300 sm:leading-[1.75] lg:columns-2 lg:gap-12">
                {DEPARTMENT.body}
              </p>
            </motion.div>
          </Slide>

          {/* -------------------------------------------- Vision & mission */}
          {/* The section push below is this slide's handoff — see `advances`. */}
          <Slide
            id="vision"
            className="border-t border-white/10"
            advances={false}
          >
            <motion.div variants={slideRise}>
              <Eyebrow>{VISION_MISSION.eyebrow}</Eyebrow>
            </motion.div>

            <motion.h2
              variants={slideRise}
              className={`mt-5 font-black uppercase leading-[0.9] tracking-tight text-white ${HEADING_LG} ${HEADING_SHADOW}`}
            >
              Vision <span className="text-nic-red">&</span> Mission
            </motion.h2>

            <div className="mt-9 grid gap-6 lg:grid-cols-2">
              {VISION_MISSION.cards.map((card) => (
                <motion.div
                  key={card.id}
                  id={card.id}
                  variants={slideRise}
                  className={`group relative overflow-hidden transition-colors duration-500 hover:border-nic-red/50 ${PANEL}`}
                >
                  <span
                    aria-hidden
                    className="absolute right-6 top-5 font-mono text-5xl font-black text-white/[0.07] sm:text-6xl"
                  >
                    {card.index}
                  </span>
                  <h3 className="relative text-xl font-bold uppercase tracking-[0.12em] text-white sm:text-2xl">
                    {card.title}
                  </h3>
                  <span
                    aria-hidden
                    className="relative mt-4 block h-px w-12 bg-nic-red transition-all duration-500 group-hover:w-24"
                  />
                  <p className="relative mt-5 text-sm leading-relaxed text-zinc-400 sm:leading-[1.7]">
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </Slide>
        </div>

        {/*
         * The runway. Exactly one viewport, and the push is measured across it
         * — see RUNWAY_OFFSET above for why it is an element and not a number.
         *
         * Desktop only: it is empty page for the section below to be pushed in
         * over, and where nothing is pushed it is just a blank screen.
         */}
        {!isMobile && <div ref={runwayRef} aria-hidden className="h-viewport" />}
      </div>
    </section>
  );
}
