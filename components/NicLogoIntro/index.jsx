"use client";

import { useCallback, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import FrameCanvas from "../FrameCanvas";
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
/**
 * A slide advance is one gesture, not a scrub — so the push is uninterruptible
 * for its whole length. Nothing lands the visitor stranded half way between
 * two slides.
 */
const PUSH_MS = 950;
/** Backing off this far past the badge re-arms it for a second viewing. */
const REARM_MARGIN = 0.08;
/**
 * The scrub trails the scroll by a frame or two. "Complete" has to mean the
 * last frame is genuinely on screen, not merely that the scroll reached the
 * mark — advancing off a half-built badge is the thing this prevents.
 */
const FRAME_SETTLED = 0.995;

export default function NicLogoIntro({ framesRef, ready, started }) {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

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
    pushMs: PUSH_MS,
    canFire: badgeIsBuilt,
    enabled: started,
  });

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
