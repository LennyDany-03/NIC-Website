"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { GRAIN_PLATE } from "./surfaces";

/**
 * What a pinned frame sequence becomes on a phone.
 *
 * The sequences are 16:9 and a phone is 9:19.5, so there is no honest way to
 * play one behind portrait content: `cover` crops away the whole subject, and
 * the compromise the canvas makes instead — zoom capped so a fixed share of the
 * frame width stays on screen — letterboxes the shot into a band across the
 * middle with a third of a black screen above and below it. That band is the
 * single worst thing on the phone layout, and it is not a bug in the canvas: it
 * is what a 16:9 sequence looks like in a portrait window.
 *
 * So the phone gets one frame instead of two hundred and forty, cropped to fill
 * the screen properly, and the motion the sequence was carrying is spent
 * somewhere it survives the format: the still drifts against the scroll, which
 * is the one scroll-linked effect that costs nothing on a touch device, needs
 * no decoded bitmaps, and reads as depth rather than as playback.
 *
 * It saves the sequences too. Four of them are ~35 MB, thinned to ~15 MB for a
 * phone, downloaded over whatever connection the phone has — for a backdrop
 * that was appearing letterboxed anyway. One still is around 40 KB.
 *
 * Pinned the same way the canvas is, so the phone keeps the page's one real
 * structural idea: content travels, the scene behind it holds. The sticky box
 * lives inside an absolutely positioned wrapper rather than in the flow, which
 * is what lets the section below it start where its content starts — no
 * `pull-up-viewport`, no screen-tall hole. The wrapper must not clip: an
 * ancestor with `overflow: hidden` is a scrollport, and a sticky child of one
 * that cannot scroll never moves.
 */
export default function SceneStill({
  still,
  /** How far the still travels across the whole section, as a share of itself. */
  drift = 6,
  /** How much of the frame is let through the black. */
  opacity = 0.72,
  /** The ember the section is lit by — see the call sites for the palette. */
  glow = "radial-gradient(90% 55% at 50% 38%, rgba(237,10,20,0.2) 0%, rgba(237,10,20,0) 70%)",
}) {
  const prefersReducedMotion = useReducedMotion();
  /*
   * Measured off this component's own wrapper rather than off the section's
   * ref. The wrapper is `inset-0` of the section, so it is the same box — and
   * a ref belonging to the parent is not attached yet when a child's layout
   * effect runs, which is exactly when `useScroll` goes looking for it.
   */
  const boxRef = useRef(null);

  // 0 as the section's top reaches the bottom of the screen, 1 as its bottom
  // leaves the top — the whole time any of it is on screen, which is the travel
  // the drift is spread across.
  const { scrollYProgress } = useScroll({
    target: boxRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-drift}%`, `${drift}%`],
  );

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      <div className="sticky top-0 h-viewport w-full overflow-hidden bg-black">
        {/*
         * Inset past every edge so the drift never exposes one, and scaled a
         * little besides — these frames carry a generator's watermark in the
         * bottom right corner, and the crop is what takes it off the phone.
         */}
        <motion.div
          className="absolute -inset-[8%] will-change-transform"
          style={prefersReducedMotion ? undefined : { y }}
        >
          <Image
            src={still}
            alt=""
            fill
            sizes="100vw"
            className="scale-105 object-cover"
            style={{ opacity }}
          />
        </motion.div>

        {/* The ember the club is lit in. */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: glow }}
        />

        {/*
         * Top and bottom go to black. The navbar has to have something to sit
         * on, the seam between two sections has to read as a seam, and a still
         * that runs bright to both edges leaves neither.
         */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.42)_20%,rgba(0,0,0,0.5)_70%,rgba(0,0,0,0.95)_100%)]" />

        {/*
         * The circuit rule the badge is built from, at texture strength — and
         * texture is the whole of it. Any more and a still of a dark corridor
         * is a sheet of graph paper with a corridor behind it.
         *
         * The opacity is set here rather than as a utility because it belongs
         * with the two lines it is dimming, and because this layer is one
         * missing class away from being white grid paper across the screen.
         */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            opacity: 0.035,
          }}
        />

        {/* The same darkroom grain the portraits are mounted on. */}
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{ backgroundImage: GRAIN_PLATE, opacity: 0.1 }}
        />
      </div>
    </div>
  );
}
