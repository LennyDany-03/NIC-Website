"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CELEBRATION } from "./content";
import { CYBER_HEADING, GRID_PLATE, GRID_SIZE, NEON, SPECTRUM_RULE } from "../../eventsTheme";

/**
 * The curtain between two steps: a mark that draws itself, a line saying what
 * just happened, and then it lifts.
 *
 * Two moments earn one — see `CELEBRATION` in content.js. Both exist because
 * the step underneath buries what just happened: step 3 opens on a WhatsApp
 * group, which is not the answer to "did that work?", and step 4 opens on a
 * ticket, which is the point of the whole form and deserves more than
 * appearing.
 *
 * ---------------------------------------------------------------------------
 * Full screen rather than over the panel
 *
 * The obvious build is an overlay inside the panel — it is the panel's content
 * being replaced, after all. It does not work, for a reason that is entirely
 * about geometry: the panel is as tall as the step it contains, the group step
 * is about two screens tall on a phone, and a mark centred in that lands below
 * the fold. Every fix from there is worse than the last (pin it to the top,
 * cap the height, measure the viewport). A `fixed` layer is centred in the
 * thing that actually matters, which is the screen.
 *
 * It does **not** raise `document.body.style.overflow`, and that is the one
 * place this departs from `PosterDialog` next door. That flag is this route's
 * page-wide "something else owns the page" signal, and `index.jsx` reads it to
 * decide whether to scroll the reader down to the new step. The step change and
 * this curtain happen in the same tick — that is the whole trick, the swap
 * happens behind an opaque layer — so a lock here would cancel the scroll that
 * is meant to be happening underneath, and the curtain would lift onto the
 * wrong part of the page. There is nothing to lock against anyway: the layer is
 * opaque, it is up for under two seconds, and scrolling behind it is invisible.
 * ---------------------------------------------------------------------------
 *
 * It lifts itself, and it can also be dismissed — tap, click, or any key. A
 * celebration that cannot be skipped is two seconds taken from somebody who
 * came here to do one thing, and the second time they see it (a student who
 * went back to fix a typo) it is two seconds taken twice.
 */

/**
 * How long each one holds before lifting itself.
 *
 * `filed` gets longer than `ticket` because it carries a code somebody is
 * being asked to notice for the first time, and because it is the answer to
 * the only question anybody has at that moment. Both are under the ~2.5s where
 * an animation stops reading as feedback and starts reading as a wait.
 *
 * Reduced motion gets a shorter one rather than none at all: the message is
 * the point and the drawing was only ever how it arrived, so the mark is
 * simply already drawn and the curtain holds long enough to be read.
 */
const HOLD_MS = { filed: 2200, ticket: 1800, reduced: 1300 };

export default function Celebration({ kind, code, onDone }) {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!kind) return undefined;

    const hold = prefersReducedMotion
      ? HOLD_MS.reduced
      : (HOLD_MS[kind] ?? HOLD_MS.ticket);

    const timer = setTimeout(onDone, hold);

    /* Any key, not just Escape. This is not a dialog with choices in it — there
       is one thing it can do and every key press is somebody asking for it. */
    const onKeyDown = () => onDone();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [kind, onDone, prefersReducedMotion]);

  /* Nothing on the server: the portal target does not exist during SSR, and a
     curtain is never up on first paint regardless. */
  if (!mounted) return null;

  const copy = kind ? CELEBRATION[kind] : null;

  return createPortal(
    <AnimatePresence>
      {copy && (
        <motion.div
          key={`celebration-${kind}`}
          role="status"
          aria-live="polite"
          onClick={onDone}
          className="fixed inset-0 z-[80] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-cyber-void px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          /* Lifts upward as it goes, so it reads as a curtain rather than a
             dialog dissolving. Slower out than in: the way in is covering
             something and wants to be over, the way out is a reveal. */
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -28 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.42,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* The page's own light and grid, so the curtain is plainly the same
              surface as what it covers rather than a modal from somewhere
              else. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 12%, rgba(43,183,189,0.22) 0%, rgba(43,183,189,0) 62%), radial-gradient(ellipse 80% 55% at 12% 96%, rgba(200,31,110,0.24) 0%, rgba(200,31,110,0) 60%), radial-gradient(ellipse 60% 45% at 92% 88%, rgba(242,178,60,0.14) 0%, rgba(242,178,60,0) 64%)",
            }}
          />

          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: GRID_PLATE, backgroundSize: GRID_SIZE }}
          />

          <span aria-hidden className={`absolute inset-x-0 top-0 h-0.5 ${SPECTRUM_RULE}`} />

          <Mark mark={copy.mark} still={prefersReducedMotion} />

          {/*
           * The headline wraps, and is sized so that it does.
           *
           * "You're registered" and "Here is your ticket" are three and four
           * words of Orbitron Black, which is a face that is *wide* — the
           * `clamp(2.5rem,13vw,3.5rem)` the page header wears is sized for the
           * single word "Register" and puts either of these a hundred pixels
           * past the edge of a 390px screen. The cap is in `ch` rather than
           * `rem` for the same reason: what has to fit is a number of
           * characters, and `ch` is the unit that says so at whatever size the
           * clamp settled on.
           *
           * It matters more here than it would in the panel, because this layer
           * is `overflow-hidden` — type too wide for it is not type that
           * scrolls, it is type with its last letters cut off.
           *
           * The `9vh` term is the landscape phone. Everything on this layer is
           * stacked and centred, and at 844×390 the column came out taller than
           * the screen — which, on a layer that cannot scroll, clipped the tick
           * off the top: the one element the whole thing exists to show. So
           * every vertical measure here is clamped against `vh` as well as
           * `vw`, which is the rule the slides on the front page already follow
           * and for the same reason.
           */}
          <motion.h2
            className={`relative mt-[clamp(1.25rem,4vh,2.25rem)] max-w-[13ch] text-[clamp(1.4rem,min(7.5vw,9vh),2.75rem)] uppercase ${CYBER_HEADING} ${NEON}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {copy.headline}
          </motion.h2>

          {/* `max-w-xs`, not `sm`: this layer's own `px-6` leaves 342px on a
              390px screen, and `max-w-sm` is 384. */}
          <motion.p
            className="relative mt-4 max-w-xs text-sm leading-relaxed text-zinc-400"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {copy.lede}
          </motion.p>

          {code ? (
            <motion.div
              className="relative mt-[clamp(1rem,3.5vh,1.75rem)] flex flex-col items-center gap-2"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-cyber-mono text-[10px] uppercase tracking-[0.3em] text-cyber-teal">
                {copy.codeLabel}
              </span>
              <span className="border border-cyber-teal/40 bg-cyber-teal/[0.07] px-5 py-2.5 font-cyber-mono text-lg tracking-[0.2em] text-cyber-aqua">
                {code}
              </span>
            </motion.div>
          ) : null}

          <motion.span
            className="absolute inset-x-0 bottom-[clamp(1.25rem,4vh,2.5rem)] font-cyber-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            {CELEBRATION.skip}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * The mark, drawn rather than shown.
 *
 * `pathLength` is the whole mechanism: framer-motion normalises any path to a
 * length of 1 and animates the dash offset behind it, so a stroke draws itself
 * from its own start point without anybody having to measure the geometry.
 * That is what makes the check read as being *made* — a tick that fades up is
 * a picture of a tick, and a tick that draws is somebody agreeing with you.
 *
 * Colours are written as `var(--color-cyber-*)` rather than as `stroke-cyber-*`
 * utility classes. An SVG presentation attribute takes a custom property
 * directly, and going through the token by hand keeps this off the one path in
 * this project that is genuinely unreliable — a newly added arbitrary utility
 * that the dev server has not rebuilt into the stylesheet yet, which looks
 * exactly like a design mistake. See "Verifying visual changes" in CLAUDE.md.
 */
function Mark({ mark, still }) {
  /* The ring is common to both and is what gives the mark its weight; only the
     glyph inside it changes. Drawn from the top and clockwise, which is where
     the eye expects a circle to start. */
  const ring = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] },
  };

  const glyph = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { delay: 0.38, duration: 0.44, ease: [0.34, 1.2, 0.64, 1] },
  };

  /* The reduced-motion mark. `initial: false` and no `animate` at all, which
     leaves the stroke with no `pathLength` set — and a stroke without one is
     simply drawn. The mark is the same shape either way; what is dropped is
     only the act of drawing it. */
  const stat = { initial: false };

  /* Sized against both axes. `38vw` is what keeps it from filling a phone held
     upright; `20vh` is what keeps it on the screen at all when that phone is
     turned on its side, where there are only 390 pixels of height for the mark,
     a two-line headline, a sentence and a code. */
  const size = "h-[clamp(4rem,min(38vw,20vh),11rem)] w-[clamp(4rem,min(38vw,20vh),11rem)]";

  return (
    <div className={`relative flex items-center justify-center ${size}`}>
      {/*
       * The halo: one ring expanding out of the mark and fading, which is the
       * cheapest way to make a static glyph feel like it landed rather than
       * like it was already there. Suppressed entirely under reduced motion —
       * an expanding pulse is precisely the class of movement that setting is
       * asking about.
       */}
      {!still ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: "var(--color-cyber-teal)" }}
          initial={{ scale: 0.62, opacity: 0.55 }}
          animate={{ scale: 1.45, opacity: 0 }}
          transition={{ delay: 0.42, duration: 1.1, ease: "easeOut" }}
        />
      ) : null}

      <motion.svg
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden
        className="relative h-full w-full"
        style={{ filter: "drop-shadow(0 0 26px rgba(43,183,189,0.45))" }}
        initial={still ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          stroke="var(--color-cyber-teal)"
          strokeWidth="3"
          strokeLinecap="round"
          /* From twelve o'clock rather than three, where SVG starts an arc. */
          transform="rotate(-90 60 60)"
          {...(still ? stat : ring)}
        />

        {mark === "check" ? (
          <motion.path
            d="M38 61 L53 76 L83 44"
            stroke="var(--color-cyber-aqua)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...(still ? stat : glyph)}
          />
        ) : (
          <>
            {/* A ticket stub: a rounded plate with a notch bitten out of each
                side, which is the shape a torn ticket has and the shape the one
                on the next step is drawn as. */}
            <motion.path
              d="M34 42 H86 A6 6 0 0 1 92 48 V54 A7 7 0 0 0 92 66 V72 A6 6 0 0 1 86 78 H34 A6 6 0 0 1 28 72 V66 A7 7 0 0 0 28 54 V48 A6 6 0 0 1 34 42 Z"
              stroke="var(--color-cyber-aqua)"
              strokeWidth="5"
              strokeLinejoin="round"
              {...(still ? stat : glyph)}
            />

            {/* The perforation, a beat behind the stub for the same reason a
                tick lands after its ring: the outline is the object, this is
                the detail that says which object it is. */}
            <motion.path
              d="M70 47 V73"
              stroke="var(--color-cyber-teal)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="2 7"
              initial={still ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.66, duration: 0.34, ease: "easeOut" }}
            />
          </>
        )}
      </motion.svg>
    </div>
  );
}
