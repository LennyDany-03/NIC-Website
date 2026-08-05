"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CyberTicks from "../CyberTicks";

/**
 * The poster, full size, over everything.
 *
 * The thumbnail in the header is a promise that this exists, and this is what
 * redeems it — the same portrait a coordinator printed and pinned to a
 * noticeboard, at a size where the session table under the headline is
 * actually legible. A new tab does the same job worse: it drops whoever was
 * mid-form onto a bare image with no way back except the browser's own Back
 * button, which on a phone is an edge swipe that is easy to fire twice and
 * land two screens further than intended. A dialog closes onto the exact
 * field it was opened from, because nothing about the page underneath it ever
 * left.
 *
 * Built on the same lock `MemberDialog` uses, deliberately without the parts
 * of it this does not need. There is one image and one close button, so the
 * roving tab-focus trap that a bio panel full of links earns is not written
 * here — Escape and the backdrop are the two ways out, and both are enough for
 * a dialog with nothing else in it to tab to. `overflow: hidden` on the body
 * is still raised, because this route already promises `smoothScroll` that
 * exact signal, and a second dialog that forgot to would be a scroll that
 * leaks through a modal.
 */
export default function PosterDialog({ open, onClose, poster }) {
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

  // Nothing rendered on the server: a portal target of `document.body` does
  // not exist yet during SSR, and the dialog is never open on first paint
  // regardless — there is no state to restore across the hydration boundary.
  if (!mounted) return null;

  const backdropMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  };

  const panelMotion = prefersReducedMotion
    ? backdropMotion
    : {
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.985 },
        transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="poster-dialog"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
          {...backdropMotion}
        >
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/88 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={poster.alt}
            className="relative max-h-[92svh] max-w-[92vw] outline-none sm:max-w-md"
            {...panelMotion}
          >
            {/* 44px, the smallest thing a thumb should be asked to hit — and
                this one floats over the poster itself rather than sitting in
                a margin, the same reasoning `MemberDialog`'s close button
                carries. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-10 flex h-11 w-11 items-center justify-center border border-white/20 bg-black/85 text-zinc-300 backdrop-blur-sm transition-colors hover:border-cyber-teal hover:bg-cyber-teal hover:text-black focus-visible:border-cyber-teal focus-visible:bg-cyber-teal focus-visible:text-black focus-visible:outline-none"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>

            <div className="relative border border-cyber-steel/70 bg-black leading-[0]">
              <CyberTicks still />
              <Image
                src={poster.src}
                width={poster.width}
                height={poster.height}
                alt={poster.alt}
                className="max-h-[88svh] w-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
