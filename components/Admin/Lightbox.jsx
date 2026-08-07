"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CornerTicks from "../CornerTicks";

/**
 * An image from the verification bucket, full size, over everything.
 *
 * The register used to hand these to a new tab. That is the wrong shape for the
 * job it is doing: checking a payment means looking at a screenshot *against*
 * the transaction ID and the amount printed beside it, and a new tab throws
 * away the row those numbers are on. Coming back means finding the tab, closing
 * it, and finding your place in a list of two hundred — per student. A dialog
 * closes onto the exact row it opened from, because the row never went
 * anywhere.
 *
 * It is the admin's answer to `PosterDialog` on the public side, and follows it
 * deliberately rather than inventing a second modal grammar: portal to
 * `document.body`, Escape and the backdrop as the two ways out, `overflow:
 * hidden` raised on the body while open. No focus trap, for the same reason
 * stated there — there is one image and one close button, so there is nothing
 * to trap focus among.
 *
 * A plain `<img>`, not `next/image`. The source is a signed Supabase URL that
 * expires within the hour, on a host the optimiser is not configured for, for
 * an image nobody wants resized — the whole point of opening it is to see it at
 * full resolution.
 */
export default function Lightbox({ open, onClose, src, alt, caption }) {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const backdropMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  };

  const panelMotion = prefersReducedMotion
    ? backdropMotion
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.985 },
        transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-lightbox"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          {...backdropMotion}
        >
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/90 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="relative flex max-h-[92svh] max-w-[94vw] flex-col outline-none"
            {...panelMotion}
          >
            {/* 44px, the smallest a thumb should be asked to hit, floating over
                the image rather than sitting in a margin the image would have
                to give up. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute -right-2 -top-2 z-10 flex h-11 w-11 items-center justify-center border border-white/20 bg-black/90 text-zinc-300 backdrop-blur-sm transition-colors hover:border-nic-red hover:bg-nic-red hover:text-white focus-visible:border-nic-red focus-visible:bg-nic-red focus-visible:text-white focus-visible:outline-none"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>

            <div className="relative border border-white/15 bg-black p-1.5 leading-[0]">
              <CornerTicks />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-h-[80svh] w-auto max-w-full object-contain"
              />
            </div>

            {/*
             * The caption, and a way out to the raw file.
             *
             * "Open in new tab" survives here as the secondary action rather
             * than the only one: a coordinator who wants to pinch into a blurry
             * UTR, or save the screenshot to send to somebody, still needs the
             * browser's own image view. It is just no longer the price of
             * looking.
             */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 leading-normal">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                {caption}
              </p>

              <a
                href={src}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 underline underline-offset-4 transition-colors hover:text-white"
              >
                Open in new tab ↗
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
