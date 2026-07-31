"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ChipMark,
  GLYPHS,
  NIC_BLACK,
  NIC_BONE,
  NIC_RED,
  OUTER_RADIUS,
  RING_RADII,
  VIEW_BOX,
  WORDMARK_TRANSFORM,
  hexPoints,
} from "../NicLogoMark";

/**
 * Keep the badge on screen long enough to read, even on a warm cache. Tuned to
 * the draw-in below: the wordmark settles at ~0.75s, so anything shorter would
 * cut the build off part-drawn, and anything longer is just a wait.
 */
const MIN_DURATION = 850;
/** Never trap the visitor if a frame request hangs. */
const MAX_DURATION = 8000;
/** Beat to admire the finished badge before handing over to the scroll intro. */
const HAND_OFF_DELAY = 200;

export default function LoadingIntro({ progress, onComplete }) {
  const prefersReducedMotion = useReducedMotion();
  const startedAt = useRef(Date.now());
  const [percent, setPercent] = useState(0);

  // Stiff enough that the counter actually reaches 100 inside the new floor.
  const eased = useSpring(0, { stiffness: 190, damping: 26, restDelta: 0.001 });
  const barScale = useTransform(eased, (value) => value / 100);

  useEffect(() => {
    eased.set(progress * 100);
  }, [eased, progress]);

  useMotionValueEvent(eased, "change", (value) => {
    setPercent(Math.min(100, Math.round(value)));
  });

  // Lock the page at the top while the badge builds, so the scroll intro always
  // starts from frame one — browsers otherwise restore the previous scroll spot.
  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
      window.history.scrollRestoration = previousRestoration || "auto";
    };
  }, []);

  useEffect(() => {
    const elapsed = Date.now() - startedAt.current;
    const remainingFloor = Math.max(0, MIN_DURATION - elapsed);

    const bail = setTimeout(
      onComplete,
      Math.max(0, MAX_DURATION - elapsed),
    );
    const finish =
      progress >= 1
        ? setTimeout(onComplete, remainingFloor + HAND_OFF_DELAY)
        : null;

    return () => {
      clearTimeout(bail);
      if (finish) clearTimeout(finish);
    };
  }, [onComplete, progress]);

  const drawIn = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-10 bg-black px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
      transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Ember glow bleeding out from behind the badge. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(237,10,20,0.28) 0%, rgba(237,10,20,0) 65%)",
        }}
        animate={prefersReducedMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox={VIEW_BOX}
        role="img"
        aria-label="NIC"
        className="relative w-32 sm:w-40"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <polygon points={hexPoints(OUTER_RADIUS)} fill={NIC_BLACK} />

        {/* Rings snap outward one after another. */}
        {RING_RADII.map((radius, index) => (
          <motion.polygon
            key={radius}
            points={hexPoints(radius)}
            fill="none"
            stroke={NIC_RED}
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              ...drawIn,
              delay: prefersReducedMotion ? 0 : 0.08 + index * 0.035,
            }}
          />
        ))}

        {/* N, I and C drop in from below, each carrying its own black plate. */}
        <g transform={WORDMARK_TRANSFORM}>
          {GLYPHS.map((glyph, index) => (
            <motion.g
              key={glyph.key}
              initial={{ opacity: 0, x: glyph.x, y: 26 }}
              animate={{ opacity: 1, x: glyph.x, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.32,
                delay: prefersReducedMotion ? 0 : 0.34 + index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <path d={glyph.plate} fill={NIC_BLACK} />
              <path d={glyph.d} fill={NIC_RED} />
            </motion.g>
          ))}
        </g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: prefersReducedMotion ? 0 : 0.5 }}
        >
          <ChipMark />
        </motion.g>

        <motion.polygon
          points={hexPoints(OUTER_RADIUS)}
          fill="none"
          stroke={NIC_BONE}
          strokeWidth={5}
          // Opacity rides along so the border still resolves on the rare engine
          // that ignores `pathLength` on a polygon.
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={drawIn}
        />
      </motion.svg>

      <motion.div
        className="relative flex w-full max-w-xs flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : 0.2 }}
      >
        <div className="flex w-full items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          <span>Initialising</span>
          <span className="tabular-nums text-zinc-300">
            {String(percent).padStart(3, "0")}%
          </span>
        </div>

        <div className="h-px w-full overflow-hidden bg-white/15">
          <motion.div
            className="h-full w-full origin-left bg-nic-red"
            style={{ scaleX: barScale }}
          />
        </div>

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          Nextgen Intelligence Club
        </p>
      </motion.div>
    </motion.div>
  );
}
