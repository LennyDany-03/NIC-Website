"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import FrameCanvas from "../FrameCanvas";
import NicLogoMark, { VIEW_BOX, hexPoints } from "../NicLogoMark";
import useIsMobile from "../useIsMobile";
import useSlideHandoff from "../useSlideHandoff";

/**
 * Scroll budget for the pinned intro, as fractions of the section's progress.
 * The section is 300vh tall, so 200vh of it is actually pinned:
 *
 *   0    -> 0.48   the 240 hexagon frames scrub through to the finished badge
 *   0.36 -> 0.46   the full form lands, so it is up and still before the last
 *                  frame rather than arriving as the slide is already leaving
 *   0.48 -> 0.50   the badge is complete and holds — this is the "one scroll"
 *   0.50 -> 1      the push: the slide travels up and off
 *
 * That 0.5 split is not arbitrary. The push has to cover exactly 100vh of
 * scroll, because that is what makes `y: -100%` on the pinned slide move at
 * precisely the rate the hero rises from below — the two edges stay welded
 * together and it reads as one sheet pushing the next into place. Any other
 * split and the slide either outruns the hero or drags behind it.
 */
const FRAME_END = 0.48;
const HANDOFF_AT = 0.5;
/**
 * Two ways out of the completed badge, whichever the visitor reaches first:
 * one more scroll past HANDOFF_AT, or simply pausing to read the full form.
 * The beat exists so the club's name is never yanked off screen unread.
 */
const HOLD_MS = 900;
/** Backing off this far past the badge re-arms it for a second viewing. */
const REARM_MARGIN = 0.08;
/**
 * The scrub trails the scroll by a frame or two. "Complete" has to mean the
 * last frame is genuinely on screen, not merely that the scroll reached the
 * mark — advancing off a half-built badge is the thing this prevents.
 */
const FRAME_SETTLED = 0.995;

/**
 * The still the phone's opening screen is lit by: the badge's own sequence a
 * few dozen frames in, where the circuit board has drawn itself and the embers
 * are up but the logo has not yet resolved. The badge on top of it is the vector
 * one — the same geometry the loading screen draws, and the reason this screen
 * does not need two hundred and forty frames to arrive at a logo.
 */
const PHONE_STILL = "/frames/frames_hexagon/frame_0030.webp";
/** 0 at the top of the opening screen, 1 once it has been scrolled away. */
const PHONE_OFFSET = ["start start", "end start"];

/**
 * Two hexagons turning slowly against each other behind the badge.
 *
 * The desktop opens by scrubbing a logo into existence, and the phone cannot —
 * so what it borrows instead is the *motion* that made that worth watching,
 * drawn in the badge's own geometry rather than downloaded as pixels. Slow
 * enough to read as a mechanism rather than as a spinner.
 */
function HexHalo({ still }) {
  const rings = [
    { radius: 78, width: 0.5, opacity: 0.3, seconds: 54, from: 0, to: 360 },
    { radius: 96, width: 0.4, opacity: 0.16, seconds: 84, from: 360, to: 0 },
  ];

  return (
    <>
      {rings.map((ring) => (
        <motion.svg
          key={ring.radius}
          aria-hidden
          viewBox={VIEW_BOX}
          className="pointer-events-none absolute inset-[-46%]"
          animate={still ? undefined : { rotate: [ring.from, ring.to] }}
          transition={{
            duration: ring.seconds,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <polygon
            points={hexPoints(ring.radius)}
            fill="none"
            stroke="#ed0a14"
            strokeOpacity={ring.opacity}
            strokeWidth={ring.width}
          />
        </motion.svg>
      ))}
    </>
  );
}

export default function NicLogoIntro({ framesRef, ready, started }) {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Frames occupy only the first stretch of the section; everything after is
  // hold-and-hand-off, so the playhead clamps at the final frame.
  const framePosition = useTransform(scrollYProgress, [0, FRAME_END], [0, 1], {
    clamp: true,
  });

  // The smooth-scroll layer already delivers a continuous scroll position, so
  // this spring only has to take the last edge off rather than carry the whole
  // scrub — a heavier one here would just make the badge trail the wheel.
  const smoothed = useSpring(framePosition, {
    stiffness: 320,
    damping: 44,
    mass: 0.28,
    restDelta: 0.0005,
  });
  const playhead = prefersReducedMotion ? framePosition : smoothed;

  // The badge has nothing to read but its own name, so a pause here means
  // "done looking" — this is the one slide that also advances on stillness.
  const badgeIsBuilt = useCallback(
    () => playhead.get() >= FRAME_SETTLED,
    [playhead],
  );

  const autoHandoff = useSlideHandoff({
    sectionRef,
    progress: scrollYProgress,
    completeAt: FRAME_END,
    triggerAt: HANDOFF_AT,
    rearmMargin: REARM_MARGIN,
    holdMs: HOLD_MS,
    canFire: badgeIsBuilt,
    enabled: started && !isMobile,
  });

  /*
   * The phone's opening screen is one viewport rather than three, so it has no
   * scrub to spend a scroll on — what it has instead is a departure. The badge
   * lifts and dims as the screen is scrolled away and the still behind it holds
   * for a moment longer, which is the same parallax every section below uses
   * and the first thing the visitor sees the page do.
   */
  const { scrollYProgress: phoneProgress } = useScroll({
    target: sectionRef,
    offset: PHONE_OFFSET,
  });
  const phoneY = useTransform(phoneProgress, [0, 1], [0, -110]);
  const phoneOpacity = useTransform(phoneProgress, [0, 0.6], [1, 0]);
  const phoneStillY = useTransform(phoneProgress, [0, 1], ["0%", "12%"]);
  const phoneCue = useTransform(phoneProgress, [0, 0.15], [1, 0]);

  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  // Fully landed by 0.46 — two frames' worth of scroll before the badge
  // finishes. The slide is then complete and motionless, name and all, which
  // is the state the push is supposed to advance away from.
  const titleOpacity = useTransform(scrollYProgress, [0.36, 0.46], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.36, 0.46], [32, 0]);
  const titleBlur = useTransform(
    scrollYProgress,
    [0.36, 0.46],
    ["blur(14px)", "blur(0px)"],
  );
  const scrimOpacity = useTransform(scrollYProgress, [0.34, FRAME_END], [0, 0.6]);

  // Shown only where the push has to be scrolled by hand, and gone before the
  // slide starts moving.
  const cueOpacity = useTransform(
    scrollYProgress,
    [0.42, 0.47, HANDOFF_AT, 0.54],
    [0, 1, 1, 0],
  );

  /*
   * The push. Deliberately nothing but travel — no fade, no scale, no bank.
   * A slide leaving the screen in PowerPoint doesn't dissolve or shrink, it is
   * shoved off by the one behind it, and the illusion only holds if the two
   * move as a single rigid sheet. Over exactly 100vh of scroll this lands on
   * the hero the instant the last of the badge clears the top edge.
   */
  const exitY = useTransform(scrollYProgress, [HANDOFF_AT, 1], ["0%", "-100%"]);

  if (isMobile) {
    const rise = (delay) => ({
      initial: { opacity: 0, y: 18 },
      animate: started ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
      transition: {
        duration: prefersReducedMotion ? 0 : 0.7,
        delay: prefersReducedMotion || !started ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      },
    });

    return (
      <section
        id="top"
        ref={sectionRef}
        className="relative flex h-viewport w-full flex-col items-center justify-center overflow-hidden bg-black px-6"
      >
        {/* ------------------------------------------------- the scene */}
        <motion.div
          aria-hidden
          className="absolute -inset-y-[8%] inset-x-0"
          style={prefersReducedMotion ? undefined : { y: phoneStillY }}
        >
          <Image
            src={PHONE_STILL}
            alt=""
            fill
            sizes="100vw"
            preload
            className="scale-110 object-cover opacity-80"
          />
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_42%,rgba(237,10,20,0.22)_0%,rgba(237,10,20,0)_70%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.25)_28%,rgba(0,0,0,0.55)_72%,rgba(0,0,0,0.96)_100%)]"
        />

        {/* ------------------------------------------------- the badge */}
        <motion.div
          className="relative flex flex-col items-center pt-6 text-center sm:pt-10"
          style={
            prefersReducedMotion
              ? undefined
              : { y: phoneY, opacity: phoneOpacity }
          }
        >
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.86 }}
            animate={
              started ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.86 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(237,10,20,0.34) 0%, rgba(237,10,20,0) 65%)",
              }}
            />
            <HexHalo still={prefersReducedMotion} />
            {/*
             * Sized off the shorter axis, like every display size on this site
             * — a phone turned sideways is 390px tall, and a badge measured in
             * `vw` there is a badge taller than the screen it is centred in.
             */}
            <NicLogoMark className="relative h-auto w-[clamp(5rem,min(34vw,22vh),11rem)] drop-shadow-[0_18px_50px_rgba(0,0,0,0.9)]" />
          </motion.div>

          <motion.h1
            {...rise(0.18)}
            className="mt-[clamp(1.5rem,4vh,2.5rem)] text-[clamp(1.5rem,min(8.5vw,7vh),3.25rem)] font-black uppercase leading-[0.92] tracking-[0.06em] text-white drop-shadow-[0_2px_26px_rgba(0,0,0,0.92)]"
          >
            Nextgen
            <br />
            <span className="text-nic-red">Intelligence</span>
            <br />
            Club
          </motion.h1>

          <motion.span
            {...rise(0.26)}
            aria-hidden
            className="mt-[clamp(1rem,3.5vh,1.75rem)] block h-px w-14 bg-nic-red shadow-[0_0_18px_2px_rgba(237,10,20,0.6)]"
          />

          <motion.p
            {...rise(0.32)}
            className="mt-[clamp(0.875rem,3vh,1.5rem)] max-w-[19rem] font-mono text-[10px] uppercase leading-relaxed tracking-[0.3em] text-zinc-400"
          >
            Build · Break · Bring it back smarter
          </motion.p>
        </motion.div>

        {/* --------------------------------------------------- the cue */}
        {/*
         * Gone on a screen under 560px tall — a phone held sideways. There the
         * badge and the club's name already fill the screen and the cue lands
         * on top of the tagline; and "scroll" is not news to someone holding a
         * page that is plainly taller than the window.
         */}
        <motion.div
          className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 [@media(max-height:560px)]:hidden"
          style={prefersReducedMotion ? undefined : { opacity: phoneCue }}
        >
          <motion.span
            {...rise(0.42)}
            className="font-mono text-[9px] uppercase tracking-[0.42em] text-zinc-500"
          >
            Scroll to enter
          </motion.span>
          <motion.span
            aria-hidden
            className="block h-10 w-px bg-gradient-to-b from-nic-red to-transparent"
            animate={
              prefersReducedMotion
                ? undefined
                : { scaleY: [0.35, 1, 0.35], opacity: [0.35, 1, 0.35] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
          />
        </motion.div>
      </section>
    );
  }

  return (
    <section id="top" ref={sectionRef} className="relative h-[300vh] bg-black">
      <motion.div
        className="sticky top-0 h-viewport w-full overflow-hidden will-change-transform"
        style={prefersReducedMotion ? undefined : { y: exitY }}
      >
        <FrameCanvas framesRef={framesRef} progress={playhead} ready={ready} />

        {/* Hides the letterbox seam on portrait screens and keeps text legible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0)_22%,rgba(0,0,0,0)_65%,rgba(0,0,0,0.9)_100%)]"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: scrimOpacity }}
        />

        <motion.div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end px-6 pb-16 sm:pb-20"
          initial={false}
          animate={{ opacity: started ? 1 : 0 }}
          transition={{ duration: 0.8, delay: started ? 0.15 : 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            style={{ opacity: hintOpacity }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-400 sm:text-xs">
              Scroll to reveal
            </span>
            <motion.span
              aria-hidden
              className="block h-8 w-px bg-gradient-to-b from-nic-red to-transparent"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ originY: 0 }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[12%] flex flex-col items-center px-6 text-center sm:bottom-[10%]"
          style={{ opacity: titleOpacity, y: titleY, filter: titleBlur }}
        >
          <h1 className="text-[clamp(1.35rem,6.2vw,3.75rem)] font-black uppercase leading-[1.05] tracking-[0.18em] text-white">
            Nextgen
            <span className="text-nic-red"> Intelligence </span>
            Club
          </h1>
          <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-400 sm:text-xs">
            Build · Break · Bring it back smarter
          </p>
        </motion.div>

        {!autoHandoff && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2"
            style={{ opacity: cueOpacity }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500">
              Keep scrolling
            </span>
            <motion.span
              className="block h-4 w-4 rotate-45 border-b border-r border-nic-red"
              animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
