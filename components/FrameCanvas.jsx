"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValueEvent } from "framer-motion";

/**
 * The frames are 16:9. On a tall phone a plain `cover` fit would crop away the
 * subject entirely, so zoom is capped at whatever keeps this much of the frame
 * width on screen and the remainder letterboxes — invisible in practice, since
 * these sequences are near-black along the top and bottom edges.
 */
const DEFAULT_MIN_VISIBLE_WIDTH = 0.62;
const MAX_DPR = 2;
/**
 * Below this the next frame contributes nothing worth a second drawImage.
 *
 * Deliberately small. The cost of the blend is one composite of a bitmap that
 * is already decoded and already the right size, and the thing it buys back is
 * the first and last sliver of every frame's travel — which, on a sequence
 * scrubbed slowly through a long section, is most of what is on screen.
 */
const BLEND_EPSILON = 0.008;

/** Returns the newest decoded frame at or before `index`, or null. */
function readyFrame(frames, index) {
  for (let i = Math.min(index, frames.length - 1); i >= 0; i -= 1) {
    const image = frames[i];
    if (image && image.complete && image.naturalWidth) return image;
  }
  return null;
}

function drawCover(ctx, image, width, height, minVisibleWidth) {
  const fitWidth = width / image.naturalWidth;
  const cover = Math.max(fitWidth, height / image.naturalHeight);
  const scale = Math.min(cover, fitWidth / minVisibleWidth);

  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  ctx.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

/**
 * Paints a preloaded frame sequence onto a canvas, scrubbed by a motion value
 * in the 0..1 range. Shared by the hexagon intro and the neon-city drone shot.
 */
export default function FrameCanvas({
  framesRef,
  progress,
  ready = false,
  minVisibleWidth = DEFAULT_MIN_VISIBLE_WIDTH,
  className = "",
}) {
  const canvasRef = useRef(null);
  const paintRequest = useRef(0);

  /** Draws the frame for the current playhead. Returns false if none was ready. */
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return false;

    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const ratio = Math.min(1, Math.max(0, progress.get()));
    const position = ratio * (frames.length - 1);
    const index = Math.floor(position);
    const mix = position - index;

    // Later frames may still be decoding — fall back to the newest frame that
    // is actually ready so the canvas never blanks out mid-scroll.
    const base = readyFrame(frames, index);
    if (!base) return false;

    const { width, height } = canvas;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    drawCover(ctx, base, width, height, minVisibleWidth);

    /*
     * A sequence has far fewer frames than the scroll has pixels — the drone
     * shot lands one frame every ~15px on desktop and ~30px on a phone, where
     * it is thinned harder — so snapping to the nearest frame reads as
     * stepping however well the scroll position itself is smoothed.
     * Cross-fading into the next frame by the fractional part turns that back
     * into continuous motion, for one extra composite of an already-decoded
     * bitmap.
     */
    if (mix > BLEND_EPSILON) {
      const next = frames[index + 1];
      if (next && next.complete && next.naturalWidth) {
        ctx.globalAlpha = mix;
        drawCover(ctx, next, width, height, minVisibleWidth);
        ctx.globalAlpha = 1;
      }
    }

    return true;
  }, [framesRef, progress, minVisibleWidth]);

  const schedulePaint = useCallback(() => {
    if (paintRequest.current) return;
    paintRequest.current = requestAnimationFrame(() => {
      paintRequest.current = 0;
      paint();
    });
  }, [paint]);

  useMotionValueEvent(progress, "change", schedulePaint);

  // Size the backing store to the element, capped at 2x so phones aren't asked
  // to push a 3x buffer every frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (!width || !height) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.imageSmoothingQuality = "high";
      }
      paint();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [paint]);

  // While frames are still arriving, repaint on a slow tick so a visitor who
  // stops scrolling still sees the sequence sharpen up. A rAF loop here would
  // just burn battery for frames that have not downloaded yet.
  useEffect(() => {
    paint();
    if (ready) return undefined;

    const id = setInterval(paint, 200);
    return () => clearInterval(id);
  }, [paint, ready]);

  useEffect(
    () => () => {
      if (paintRequest.current) cancelAnimationFrame(paintRequest.current);
    },
    [],
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full bg-black ${className}`}
    />
  );
}
