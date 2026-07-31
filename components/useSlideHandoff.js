"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion } from "framer-motion";
import {
  EASE_PUSH,
  SETTLE_MS,
  isAutoScrolling,
  smoothScrollTo,
} from "./smoothScroll";

/**
 * Advances a pinned section the way a deck advances a slide: once its content
 * has finished, one more scroll plays the whole push in a single uninterruptible
 * motion rather than letting it be scrubbed through by hand.
 *
 * It runs backwards too, and has to. A deck that only moves one way leaves
 * anyone who scrolls up holding half of two slides at once, because the travel
 * they are undoing was never theirs to scrub in the first place. So a scroll
 * back off a handed-over slide replays the same viewport of travel in reverse
 * and puts the slide it came from back on screen whole.
 *
 * The caller owns the geometry. This only decides *when* to fire, and scrolls to
 * the section's own progress-1 mark — which is exactly where a `-100svh` pull-up
 * puts the top of whatever comes next. Sizing that last stretch to one viewport
 * of scroll is what makes the outgoing `y: -100%` and the incoming section move
 * as one rigid sheet — and it is also what lets the way back be measured as one
 * viewport up from the handover, whatever the section in front of it is built
 * from.
 *
 * @param completeAt  progress at which the section's content is done
 * @param triggerAt   progress that fires the push; the gap between the two is
 *                    the "one more scroll"
 * @param holdMs      advance after this long standing still. 0 disables it —
 *                    right for anything with body copy, where pausing means
 *                    reading, not waiting. A slide that has been scrolled back
 *                    to stops holding for good: coming back is a deliberate
 *                    act, and being moved on again a second later undoes it.
 * @param land        where the push leaves the section's trailing edge: at the
 *                    "bottom" of the screen, which is the end of a pinned
 *                    section's own scroll and the default, or at the "top",
 *                    which is what a slide sitting in normal flow needs in
 *                    order to hand the whole screen to the one below it.
 * @param canFire     optional gate, e.g. "the frame scrub has actually settled"
 *
 * Returns whether the automatic push is live, so a caller can show a manual
 * cue where it isn't.
 */

/** One wheel notch, near enough, as a share of the screen. */
const NOTCH = 0.08;
/** Subpixel slack on "are we standing on the handover mark?". */
const SETTLED_PX = 2;
/**
 * How long a push takes, and the one tempo the whole deck runs at.
 *
 * A slide advance is a cut, not a journey. Anything approaching a second reads
 * as the page deciding to take you somewhere; under it, the next slide is
 * simply there, and the gesture and the result feel like the same event. This
 * is also short enough to stay inside the burst of wheel input that triggered
 * it, which is what `SETTLE_MS` afterwards is for.
 */
export const PUSH_MS = 700;

export default function useSlideHandoff({
  sectionRef,
  progress,
  completeAt,
  triggerAt,
  rearmMargin = 0.08,
  holdMs = 0,
  pushMs = PUSH_MS,
  land = "bottom",
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
  /** The way back only exists once the slide has actually been handed over. */
  const armedBack = useRef(false);
  const rewound = useRef(false);
  const wasAt = useRef(progress.get());
  const holdTimer = useRef(0);

  const clearHold = useCallback(() => {
    if (!holdTimer.current) return;
    clearTimeout(holdTimer.current);
    holdTimer.current = 0;
  }, []);

  useEffect(() => clearHold, [clearHold]);

  /**
   * Page Y at which the section has finished handing over: the far end of the
   * push, and by construction one viewport on from where it began.
   */
  const handoverY = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return null;

    const trailingEdge =
      section.getBoundingClientRect().top +
      window.scrollY +
      section.offsetHeight;
    return land === "top" ? trailingEdge : trailingEdge - window.innerHeight;
  }, [sectionRef, land]);

  /** Plays the whole push in one go, start to finish. */
  const push = useCallback(() => {
    const to = handoverY();
    if (to === null) return;
    smoothScrollTo(to, {
      duration: pushMs,
      grace: pushMs,
      settle: SETTLE_MS,
      ease: EASE_PUSH,
    });
  }, [handoverY, pushMs]);

  /** The same travel, played the other way: the slide comes back down whole. */
  const rewind = useCallback(() => {
    const from = handoverY();
    if (from === null) return;
    smoothScrollTo(from - window.innerHeight, {
      duration: pushMs,
      grace: pushMs,
      settle: SETTLE_MS,
      ease: EASE_PUSH,
    });
  }, [handoverY, pushMs]);

  useMotionValueEvent(progress, "change", (value) => {
    const forwards = value > wasAt.current;
    wasAt.current = value;

    if (value < completeAt - rearmMargin) {
      clearHold();
      armed.current = true;
    }

    if (!active) return;

    const handover = handoverY();
    if (handover === null) return;

    // Standing on the handover mark, the slide is gone and the only gesture
    // left for it is the one that brings it back. Armed before the guard below,
    // because the scroll that carries us over the mark is usually our own push.
    if (value >= 1 || window.scrollY >= handover - SETTLED_PX) {
      armedBack.current = true;
    }

    // A scroll we did not start — a navbar anchor, or the slide above still
    // handing over — owns the page until it lands, and every slide it travels
    // through sweeps past its own triggers on the way. Standing down rather
    // than disarming leaves this one ready to fire on the next real scroll.
    if (isAutoScrolling()) return;

    if (!forwards) {
      if (!armedBack.current) return;
      // One scroll back off the mark, measured in screen rather than in the
      // section's own progress, so every slide asks for the same gesture.
      if (window.scrollY > handover - NOTCH * window.innerHeight) return;

      armedBack.current = false;
      // Coming back re-arms the way out, so the next scroll down plays the push
      // again instead of dragging it by hand.
      armed.current = true;
      rewound.current = true;
      clearHold();
      rewind();
      return;
    }

    if (!armed.current) return;
    if (value < completeAt) return;

    // A slide that was scrolled back to owes the visitor a whole scroll before
    // it leaves again. They landed on the exact spot the push starts from, and
    // a trackpad's stray pixel is not the gesture that should undo their having
    // come back. Sections whose trigger already sits a scroll into their own
    // travel — every slide of copy — were asking for this anyway.
    if (
      rewound.current &&
      window.scrollY <
        handover - window.innerHeight * (1 - NOTCH)
    ) {
      return;
    }

    // One more scroll past the finished slide advances it immediately. If the
    // caller says it isn't really finished yet, fall through to the hold.
    if (value >= triggerAt && (!canFire || canFire())) {
      armed.current = false;
      clearHold();
      push();
      return;
    }

    if (!holdMs || rewound.current || holdTimer.current) return;
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
