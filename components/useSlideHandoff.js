"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion } from "framer-motion";
import { smoothScrollTo } from "./smoothScroll";

/**
 * Advances a pinned section the way a deck advances a slide: once its content
 * has finished, one more scroll plays the whole push in a single uninterruptible
 * motion rather than letting it be scrubbed through by hand.
 *
 * The caller owns the geometry. This only decides *when* to fire, and scrolls to
 * the section's own progress-1 mark — which is exactly where a `-100svh` pull-up
 * puts the top of whatever comes next. Sizing that last stretch to one viewport
 * of scroll is what makes the outgoing `y: -100%` and the incoming section move
 * as one rigid sheet.
 *
 * @param completeAt  progress at which the section's content is done
 * @param triggerAt   progress that fires the push; the gap between the two is
 *                    the "one more scroll"
 * @param holdMs      advance after this long standing still. 0 disables it —
 *                    right for anything with body copy, where pausing means
 *                    reading, not waiting.
 * @param canFire     optional gate, e.g. "the frame scrub has actually settled"
 *
 * Returns whether the automatic push is live, so a caller can show a manual
 * cue where it isn't.
 */
export default function useSlideHandoff({
  sectionRef,
  progress,
  completeAt,
  triggerAt,
  rearmMargin = 0.08,
  holdMs = 0,
  pushMs = 950,
  canFire,
  enabled = true,
}) {
  const prefersReducedMotion = useReducedMotion();

  /*
   * Reduced motion keeps every push manual — a second of unrequested automatic
   * scrolling is exactly what that preference asks us not to do. Touch keeps it
   * manual too: a flick's momentum lives in the compositor, and writing
   * `scrollTo` underneath it fights rather than replaces it. Both still get the
   * push, they just scroll it themselves — and over one viewport a single flick
   * covers it anyway.
   */
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setAuto(false);
      return undefined;
    }
    const query = window.matchMedia("(pointer: fine)");
    const apply = () => setAuto(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [prefersReducedMotion]);

  const active = auto && enabled;

  const armed = useRef(true);
  const holdTimer = useRef(0);

  const clearHold = useCallback(() => {
    if (!holdTimer.current) return;
    clearTimeout(holdTimer.current);
    holdTimer.current = 0;
  }, []);

  useEffect(() => clearHold, [clearHold]);

  /** Plays the whole push in one go, start to finish. */
  const push = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const end =
      section.getBoundingClientRect().top +
      window.scrollY +
      section.offsetHeight -
      window.innerHeight;
    smoothScrollTo(end, { duration: pushMs, grace: pushMs });
  }, [sectionRef, pushMs]);

  useMotionValueEvent(progress, "change", (value) => {
    if (value < completeAt - rearmMargin) {
      clearHold();
      armed.current = true;
      return;
    }
    if (!active || !armed.current) return;
    if (value < completeAt) return;

    // One more scroll past the finished slide advances it immediately. If the
    // caller says it isn't really finished yet, fall through to the hold.
    if (value >= triggerAt && (!canFire || canFire())) {
      armed.current = false;
      clearHold();
      push();
      return;
    }

    if (!holdMs || holdTimer.current) return;
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = 0;
      if (!armed.current) return;
      // They may have gone back during the hold; don't haul anyone out of a
      // slide they just chose to stay on.
      if (progress.get() < completeAt) return;
      armed.current = false;
      push();
    }, holdMs);
  });

  return active;
}
