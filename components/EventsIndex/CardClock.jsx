"use client";

import useCountdown, { splitRemaining } from "../useCountdown";
import { CARD_UNITS } from "./content";

/**
 * The clock on a card — the event page's countdown, cut down to fit a tile.
 *
 * Three faces rather than four. The event pages run to seconds because there
 * the clock *is* the page and a digit changing every second is what makes it
 * worth coming back to; here there are several clocks on one screen and a row of
 * them ticking in unison would be the loudest thing on a page whose job is a
 * list. Minutes is the finest unit anybody reads off a noticeboard anyway.
 *
 * Nothing rolls, for the same reason. The event page's digits animate in and out
 * of a window; two or three of those going at once reads as a page with a fault.
 *
 * What it does keep is the discipline that matters: `useCountdown` returns
 * `null` for exactly one render — there is no "now" during server rendering that
 * will still be true when the page is read — so the first paint is dashes on the
 * server and dashes on the client, and the numbers land one render later. A
 * clock that rendered a real figure on the server would ship a stale one into
 * the HTML and then disagree with the first client render, which is not
 * hydration but a mismatch: React throws the tree away and rebuilds it.
 */
export default function CardClock({ startsAtMs, startsAtIso, title, tone }) {
  const remaining = useCountdown(startsAtMs);

  const pending = remaining === null;
  const parts = splitRemaining(pending ? 0 : remaining);

  // Dashes rather than zeroes while the clock reads itself: a row of `00` is a
  // countdown that has finished, and claiming an event has started for the
  // length of a paint is worse than admitting the clock has not read itself yet.
  if (!pending && remaining === 0) {
    return (
      <p
        className={`font-cyber-mono text-[11px] uppercase tracking-[0.28em] ${tone}`}
      >
        Under way
      </p>
    );
  }

  return (
    <time
      dateTime={startsAtIso}
      aria-label={`${title} begins in ${
        pending
          ? "a moment being counted"
          : `${parts.days} days, ${parts.hours} hours and ${parts.minutes} minutes`
      }`}
      className="flex items-end gap-5"
    >
      {CARD_UNITS.map((unit) => (
        <span key={unit.id} className="flex flex-col">
          {/* `tabular-nums` and a two-character floor, so a card does not
              reflow every time a figure drops from 10 to 9. */}
          <span
            className={`min-w-[2ch] font-cyber text-2xl font-black leading-none tabular-nums sm:text-3xl ${tone}`}
          >
            {pending ? "--" : String(parts[unit.id]).padStart(2, "0")}
          </span>
          <span className="mt-1.5 font-cyber-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
            {unit.label}
          </span>
        </span>
      ))}
    </time>
  );
}
