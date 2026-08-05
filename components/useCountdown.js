"use client";

import { useEffect, useState } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * A span of milliseconds, split into the four faces of the clock.
 *
 * Kept separate from the hook and pure, because the digits are not the only
 * thing that wants it — and because "does 90 minutes read as 01:30:00" is worth
 * being able to answer without mounting a component.
 */
export function splitRemaining(ms) {
  const left = Math.max(0, ms);

  return {
    days: Math.floor(left / DAY),
    hours: Math.floor((left % DAY) / HOUR),
    minutes: Math.floor((left % HOUR) / MINUTE),
    seconds: Math.floor((left % MINUTE) / SECOND),
  };
}

/**
 * Milliseconds until `targetMs`, or `null` for exactly one render.
 *
 * Lives here rather than in an event's folder because two events now count down
 * — Genesis'26 and the cyber defence workshop — and none of what follows knows
 * or cares which. An event folder is meant to be deleted whole on the day its
 * event has run (see `Genesis26/GoldTicks.jsx` on why a *styled* piece is copied
 * rather than shared); a hook with no colour in it is the opposite case, and
 * belongs beside `useIsMobile` and `useFrameSequence`.
 *
 * The null is the same trick `useIsMobile` plays with `false`, for the same
 * reason. There is no "now" during server rendering that will still be true by
 * the time the page reaches a browser — the markup is built once and may be
 * served for hours — so a countdown that rendered a real number on the server
 * would ship a stale one into the HTML and then disagree with the first client
 * render, which is not hydration but a mismatch: React throws the server's tree
 * away and rebuilds it. So the clock starts as `null`, renders as a row of
 * dashes on the server *and* on the first client render, and lands one render
 * later on mount. The dashes are never really seen; they are what the layout is
 * measured against.
 *
 * Each tick recomputes from `Date.now()` rather than subtracting a second from
 * the last value. An interval is not a clock — it is throttled to once a minute
 * in a background tab and stops entirely while a laptop is asleep — and a
 * countdown that decremented itself would come back from a lunch break minutes
 * behind. Recomputing means the worst a suspended tab costs is that the display
 * is stale until the next tick, and it is correct the instant it fires.
 */
export default function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const left = () => Math.max(0, targetMs - Date.now());

    setRemaining(left());

    // Already past. Nothing to tick towards, and an interval that only ever
    // sets 0 over 0 would re-render the page once a second forever.
    if (left() === 0) return undefined;

    const id = setInterval(() => {
      const next = left();
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, SECOND);

    return () => clearInterval(id);
  }, [targetMs]);

  return remaining;
}
