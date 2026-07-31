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
import Slide from "../Slide";
import {
  block,
  card,
  cardTransition,
  gridBlock,
  gridViewport,
  rise,
  riseTransition,
  viewport,
} from "../motionPresets";
import { BOARDS, CREW, MASTERMINDS } from "./content";

/**
 * How dark the corridor is allowed to be. It opens up for the faculty, who are
 * three portraits with room to breathe around them, and closes down again for
 * the boards, where a wall of small cards and their labels has to be read over
 * whatever the frames happen to be doing behind it.
 */
const SCRIM_OPEN = 0.42;
const SCRIM_CLOSED = 0.8;
/** 0 as the boards come over the horizon, 1 by the time they are half up. */
const BOARDS_OFFSET = ["start end", "start center"];

/**
 * The grain plate behind an unassigned seat, rebuilt in CSS to match the plate
 * already composited into the faculty art. Inline turbulence rather than an
 * asset — it tiles at any size and costs no request.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.55'/%3E%3C/svg%3E\")";

function Eyebrow({ children }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red sm:text-xs">
      {children}
    </span>
  );
}

/** The red L-brackets that frame every card on the page. */
function CornerTicks() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-nic-red/80 transition-all duration-500 group-hover:left-1 group-hover:top-1 group-hover:border-nic-red"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-nic-red/80 transition-all duration-500 group-hover:bottom-1 group-hover:right-1 group-hover:border-nic-red"
      />
    </>
  );
}

/**
 * A mastermind, hung the way the corridor behind them hangs its own frames: a
 * panel of light down the wall, the portrait lit against it, and the line the
 * light draws where the wall meets the floor.
 *
 * The art is pre-composed — grain plate, red ticks and the role stamp are in
 * the file, inside a wide transparent surround — so everything here is the room
 * around it rather than more frame. Cropping the square to a portrait box is
 * what brings the plate up to the size the corridor's own frames read at: it
 * trims only surround, and the subjects, who all lean right, clear the cut with
 * room to spare.
 *
 * Nothing sits on a negative z-index. The pinned canvas above is a stacking
 * context of its own, so anything sent behind the content is sent behind the
 * corridor too, and simply never appears.
 */
function MastermindCard({ person }) {
  return (
    <motion.figure
      variants={card}
      transition={cardTransition}
      className="group relative"
    >
      <div className="relative">
        {/* The panel of wall it hangs on. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[6%] -top-5 bottom-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.13),rgba(255,255,255,0.04)_45%,rgba(255,255,255,0)_84%)] opacity-70 transition-opacity duration-700 group-hover:opacity-100"
        />
        {/* The light above it. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[16%] -top-5 h-px bg-white/50 shadow-[0_0_28px_7px_rgba(255,255,255,0.16)] transition-all duration-700 group-hover:bg-nic-ember group-hover:shadow-[0_0_32px_9px_rgba(237,10,20,0.5)]"
        />
        {/* Ember bloom, borrowed from the corridor the frame is standing in. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] bottom-[8%] h-28 scale-90 rounded-[50%] opacity-0 blur-3xl transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(237,10,20,0.55) 0%, rgba(237,10,20,0) 70%)",
          }}
        />

        <Image
          src={person.photo}
          alt={`${person.name}, ${person.role}`}
          width={640}
          height={640}
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 42vw, 30vw"
          className="relative aspect-4/5 w-full object-cover transition-transform duration-700 ease-out group-hover:-translate-y-1.5"
        />

        {/* Where the wall meets the floor. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[12%] bottom-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent transition-all duration-700 group-hover:via-nic-red"
        />
      </div>

      <figcaption className="mt-5 text-center">
        <span className="block text-lg font-black uppercase tracking-[0.06em] text-white sm:text-xl">
          {person.name}
        </span>
        <span
          aria-hidden
          className="mx-auto mt-3 block h-px w-10 bg-nic-red transition-all duration-500 group-hover:w-24"
        />
      </figcaption>
    </motion.figure>
  );
}

/**
 * Board seats build the same plate in CSS. A seat with no name yet renders as
 * a numbered slot rather than a hole, so the grid stays intact while the
 * roster is still being settled.
 */
function CrewCard({ member }) {
  const named = Boolean(member.name);

  return (
    <motion.figure
      variants={card}
      transition={cardTransition}
      className="group relative"
    >
      <div
        className={`relative aspect-3/4 overflow-hidden border transition-colors duration-500 ${
          named
            ? "border-white/12 bg-zinc-900 group-hover:border-nic-red/60"
            : "border-white/8 bg-zinc-950"
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-screen"
          style={{ backgroundImage: GRAIN }}
        />

        {member.photo ? (
          <Image
            src={member.photo}
            alt={`${member.name}, ${member.role}`}
            fill
            sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 20vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-6xl font-black text-white/[0.06] sm:text-7xl"
          >
            {member.index}
          </span>
        )}

        {/* Keeps the role legible over a photo as easily as over the plate. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/80 to-transparent"
        />
        <span className="absolute left-3 top-3 max-w-[80%] font-mono text-[9px] uppercase leading-tight tracking-[0.18em] text-white/90 sm:text-[10px]">
          {member.role}
        </span>

        <CornerTicks />
      </div>

      <figcaption className="mt-3">
        <span
          className={`block text-sm font-black uppercase tracking-[0.05em] sm:text-base ${
            named ? "text-white" : "text-zinc-600"
          }`}
        >
          {named ? member.name : "Seat open"}
        </span>
        <span
          aria-hidden
          className="mt-2 block h-px w-8 bg-nic-red/70 transition-all duration-500 group-hover:w-16"
        />
      </figcaption>
    </motion.figure>
  );
}

export default function CrewSequence({ framesRef, ready }) {
  const sectionRef = useRef(null);
  const boardsRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Same light touch as the city: the smooth-scroll layer and the canvas
  // cross-fade do the heavy lifting, this only absorbs the odd jolt.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 46,
    mass: 0.3,
    restDelta: 0.0005,
  });
  const playhead = prefersReducedMotion ? scrollYProgress : smoothed;

  // Measured off the boards themselves rather than a fraction of the section,
  // for the same reason the pushes are: the roster decides this section's
  // height, and a fraction would drift every time a seat is filled in.
  const { scrollYProgress: boardsProgress } = useScroll({
    target: boardsRef,
    offset: BOARDS_OFFSET,
  });
  const scrimOpacity = useTransform(
    boardsProgress,
    [0, 1],
    [SCRIM_OPEN, SCRIM_CLOSED],
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-20 pull-up-viewport bg-black"
    >
      {/* The leading edge, same as the city's — this is the seam of the push. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-linear-to-r from-transparent via-nic-red to-transparent shadow-[0_0_28px_6px_rgba(237,10,20,0.55)]"
      />

      {/* Pinned corridor — a hall of lit frames to hang the crew in. */}
      <div className="sticky top-0 h-viewport w-full overflow-hidden">
        <FrameCanvas framesRef={framesRef} progress={playhead} ready={ready} />
        {/* Opens for the faculty, closes for the boards. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-black"
          style={{ opacity: scrimOpacity }}
        />
        {/*
         * The copy hugs the left, so the darkness that carries it does too.
         * Blacking out the whole frame to make one column legible is what was
         * costing the corridor its depth — this way the far end of it stays lit.
         */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.34)_52%,rgba(0,0,0,0)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_100%)]"
        />
      </div>

      <div className="relative pull-up-viewport">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          {/* ---------------------------------------------- The masterminds */}
          <Slide id="masterminds">
            {/*
             * Title and copy share one band across the top so the portraits get
             * the rest of the screen. Stacked, the way the other slides run,
             * this one either crops or leaves the faculty stranded at the foot
             * of it — which is what it was doing.
             */}
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-16">
              <div>
                <motion.div variants={rise} transition={riseTransition}>
                  <Eyebrow>{MASTERMINDS.eyebrow}</Eyebrow>
                </motion.div>

                <motion.h2
                  variants={rise}
                  transition={riseTransition}
                  className="mt-6 text-[clamp(2.25rem,8vw,5.25rem)] font-black uppercase leading-[0.85] tracking-tight text-white"
                >
                  {MASTERMINDS.lead}
                  <br />
                  <span className="text-nic-red">{MASTERMINDS.accent}</span>
                </motion.h2>
              </div>

              <motion.p
                variants={rise}
                transition={riseTransition}
                className="border-l-2 border-nic-red/70 pl-5 text-sm leading-relaxed text-zinc-300 sm:pl-6 sm:text-[15px] sm:leading-loose"
              >
                {MASTERMINDS.body}
              </motion.p>
            </div>

            <motion.div
              className="mt-12 grid grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-6 lg:gap-12"
              variants={gridBlock}
              initial="hidden"
              whileInView="shown"
              viewport={gridViewport}
            >
              {MASTERMINDS.people.map((person) => (
                <MastermindCard key={person.id} person={person} />
              ))}
            </motion.div>
          </Slide>

          {/* --------------------------------------------------- Meet the crew */}
          <Slide id="crew" className="border-t border-white/10">
            <motion.div variants={rise} transition={riseTransition}>
              <Eyebrow>{CREW.eyebrow}</Eyebrow>
            </motion.div>

            <motion.h2
              variants={rise}
              transition={riseTransition}
              className="mt-6 text-[clamp(2.25rem,9vw,6rem)] font-black uppercase leading-[0.85] tracking-tight text-white"
            >
              {CREW.lead}
              <br />
              <span className="text-nic-red">{CREW.accent}</span>
            </motion.h2>

            <motion.p
              variants={rise}
              transition={riseTransition}
              className="mt-8 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base sm:leading-loose"
            >
              {CREW.body}
            </motion.p>
          </Slide>

          {/* -------------------------------------------------- The two boards */}
          <div ref={boardsRef}>
            {BOARDS.map((board) => (
              <section
                key={board.id}
                id={board.id}
                className="border-t border-white/10 py-20 sm:py-28"
              >
                <motion.div
                  variants={block}
                  initial="hidden"
                  whileInView="shown"
                  viewport={viewport}
                >
                  <motion.h3
                    variants={rise}
                    transition={riseTransition}
                    className="text-[clamp(1.5rem,4.5vw,2.75rem)] font-black uppercase leading-[1] tracking-tight text-white"
                  >
                    {board.label}
                  </motion.h3>
                  <motion.div
                    variants={rise}
                    transition={riseTransition}
                    className="mt-4 flex items-center gap-4"
                  >
                    <span aria-hidden className="h-px w-10 bg-nic-red" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 sm:text-[11px]">
                      {board.caption} · {board.members.length} members
                    </span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8"
                  variants={gridBlock}
                  initial="hidden"
                  whileInView="shown"
                  viewport={gridViewport}
                >
                  {board.members.map((member) => (
                    <CrewCard key={member.id} member={member} />
                  ))}
                </motion.div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
