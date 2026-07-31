"use client";

import { useEffect, useRef, useState } from "react";

/** The hexagon badge build — plays through the scroll intro. */
export const HEXAGON_SEQUENCE = {
  dir: "/frames/frames_hexagon",
  prefix: "frame_",
  pad: 4,
  total: 240,
  step: 1,
  mobileStep: 2,
};

/** The neon-city drone shot that carries the Meet Us / Department copy. */
export const DRONE_SEQUENCE = {
  dir: "/frames/frames_drone",
  prefix: "frame_",
  pad: 4,
  total: 240,
  // 11.5 MB at full density, and it only ever plays behind a 70% scrim as a
  // backdrop. The camera move is slow, so every second frame reads identically
  // while halving what the visitor has to download.
  step: 2,
  mobileStep: 4,
};

/** The red neon corridor that carries the faculty and the two boards. */
export const CORRIDOR_SEQUENCE = {
  dir: "/frames/frames_corridor",
  prefix: "frame_",
  pad: 4,
  total: 192,
  // 4.7 MB at full density — less than half what the drone costs — so this one
  // keeps every frame on a desktop connection.
  step: 1,
  mobileStep: 2,
};

/**
 * Decodes a frame sequence up front so a scroll scrub never has to wait on the
 * network. `step` / `mobileStep` thin the sequence out per breakpoint — phones
 * always take fewer frames than they could display while scrolling anyway.
 *
 * Frames land in a ref rather than state on purpose: the canvas reads them 60x
 * a second and must not drag React through a render each time.
 *
 * Pass `enabled: false` to hold a sequence back — the drone frames only start
 * downloading once the intro has handed over, so they never compete with the
 * frames the visitor is actually looking at.
 */
export default function useFrameSequence(sequence, enabled = true) {
  const { dir, prefix, pad, total, step: desktopStep = 1, mobileStep = 2 } =
    sequence;

  const framesRef = useRef([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const step = window.matchMedia("(max-width: 767px)").matches
      ? mobileStep
      : desktopStep;

    const indices = [];
    for (let i = 1; i <= total; i += step) indices.push(i);
    if (indices[indices.length - 1] !== total) indices.push(total);

    const images = new Array(indices.length);
    framesRef.current = images;

    let cancelled = false;
    let settled = 0;
    let lastReported = -1;

    const onSettled = () => {
      if (cancelled) return;
      settled += 1;
      const ratio = settled / indices.length;
      // Only re-render when the visible percentage actually moves.
      const percent = Math.round(ratio * 100);
      if (percent !== lastReported) {
        lastReported = percent;
        setProgress(ratio);
      }
      if (settled === indices.length) setReady(true);
    };

    indices.forEach((frame, slot) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = onSettled;
      // A missing frame must not stall the sequence — count it and move on.
      img.onerror = onSettled;
      img.src = `${dir}/${prefix}${String(frame).padStart(pad, "0")}.webp`;
      images[slot] = img;
    });

    return () => {
      cancelled = true;
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [dir, prefix, pad, total, desktopStep, mobileStep, enabled]);

  return { framesRef, progress, ready };
}
