"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import useCountdown, { splitRemaining } from "../useCountdown";
import { CYBER_HEADING, NEON } from "../eventsTheme";
import { EVENT, STARTS_AT_ISO, STARTS_AT_MS, UNITS } from "./content";

/**
 * The clock.
 *
 * Four faces, and the largest thing on the page after the title. A countdown
 * that has to be hunted for is decoration; this one is meant to be the second
 * thing read and the reason to come back — especially while registration is
 * still shut, because it is the only part of the page that changes.
 *
 * The mechanics are the Genesis clock's, down to the rolling digits, and that is
 * deliberate: two events on one site counting to two dates should count the same
 * way. What differs is the metal it is cut from and what it says when it lands.
 */

/** The width of the widest digit, so a face does not resize as it counts. */
const FACE_WIDTH = "min-w-[2ch]";

/**
 * One face: a number that changes and a word that does not.
 *
 * The digits roll. Every second one of these four changes, and a number that
 * simply swaps in place reads as a glitch — a value that leaves upward while its
 * replacement arrives from below reads as a mechanism, which is what a countdown
 * is. `overflow-hidden` on the window is what turns a pair of moving spans into
 * a wheel with a lid.
 *
 * `mode="popLayout"` is load-bearing: it pulls the departing digit out of layout
 * flow so the arriving one is not pushed sideways for the length of the
 * transition. Without it the whole row would shunt right once a second.
 */
function Face({ value, label, still }) {
  // Days can outgrow two digits early in a countdown's life; hours, minutes and
  // seconds never do. Padding to two is what keeps `09` from being read as a
  // different size of number to `10`.
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex justify-center overflow-hidden ${FACE_WIDTH} text-[clamp(2rem,min(8.5vw,10vh),4.75rem)] font-black leading-[1.05] tracking-tight tabular-nums ${CYBER_HEADING}`}
      >
        {still ? (
          <span className={NEON}>{display}</span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={display}
              className={NEON}
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-60%", opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              {display}
            </motion.span>
          </AnimatePresence>
        )}
      </div>

      {/* Zinc rather than the palette's steel. Steel is an outline colour — it
          is what a border is drawn in — and at 9px it does not clear 3:1 against
          this background, which on the caption telling you whether a number is
          days or hours is not a stylistic call. */}
      <span className="mt-2 font-cyber-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500 sm:mt-3 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

/**
 * The separator between two faces. Not a colon — a colon at this size sits on
 * the baseline and reads as punctuation in a sentence rather than as the divider
 * on a clock. Two dots, stacked.
 *
 * It carries the *digits'* height rather than the whole face's, and given the
 * same clamp the digits are set in, it centres on the numerals instead of on the
 * numerals-plus-caption — which is where a colon on a clock actually sits.
 *
 * Hidden below `sm`. Four faces, three separators and a phone's width is how you
 * get a clock that wraps.
 */
function Tick() {
  return (
    <span
      aria-hidden
      className="hidden h-[clamp(2rem,min(8.5vw,10vh),4.75rem)] flex-col items-center justify-center gap-2 sm:flex"
    >
      <span className="block h-1 w-1 rounded-full bg-cyber-teal/80" />
      <span className="block h-1 w-1 rounded-full bg-cyber-teal/80" />
    </span>
  );
}

export default function Countdown() {
  const remaining = useCountdown(STARTS_AT_MS);
  const prefersReducedMotion = useReducedMotion();

  // `null` for exactly one render — see `useCountdown`. Dashes rather than
  // zeroes: a row of `00` is a countdown that has finished, and claiming the
  // workshop has started for the length of a paint is worse than admitting the
  // clock has not read itself yet.
  const pending = remaining === null;
  const parts = splitRemaining(pending ? 0 : remaining);
  const done = !pending && remaining === 0;

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <p
          className={`text-[clamp(1.75rem,min(8vw,10vh),4rem)] uppercase ${CYBER_HEADING} ${NEON}`}
        >
          Doors open
        </p>
        <p className="mt-4 font-cyber-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          The workshop is under way
        </p>
      </div>
    );
  }

  return (
    /*
     * One `time` element wrapping the whole clock rather than four loose
     * numbers. The faces are a picture of a duration — split, padded, rolling —
     * and none of that is readable as a time to anything that is not looking at
     * it. `dateTime` carries the actual instant, so a screen reader and a search
     * crawler both get "20 August 2026" instead of "14 09 51 02".
     */
    <time
      dateTime={STARTS_AT_ISO}
      aria-label={`The workshop begins on ${EVENT.dateLabel} at 9 AM`}
      className="flex items-start justify-center gap-4 sm:gap-6 lg:gap-9"
    >
      {UNITS.map((unit, index) => (
        <div key={unit.id} className="flex items-start gap-4 sm:gap-6 lg:gap-9">
          {index > 0 && <Tick />}
          <Face
            value={pending ? "--" : parts[unit.id]}
            label={unit.label}
            // The dashes must not roll: they are the same on every render, so an
            // animation on them would be a wheel spinning on nothing.
            still={pending || prefersReducedMotion}
          />
        </div>
      ))}
    </time>
  );
}
