"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import useIsMobile from "./useIsMobile";
import useSlideHandoff from "./useSlideHandoff";
import { slideBlock, slideViewport } from "./motionPresets";

/** 0 with the slide filling the screen, 1 once it has cleared the top of it. */
const SLIDE_OFFSET = ["start start", "end start"];
/** The slide is up, whole and standing still. */
export const SLIDE_COMPLETE_AT = 0.03;
/** One more scroll — about two thirds of a wheel notch — advances it. */
export const SLIDE_TRIGGER_AT = 0.08;
/** Backing this far off a slide arms it to be advanced a second time. */
export const SLIDE_REARM_MARGIN = 0.02;
/**
 * Slack on "does this slide fit the screen?".
 *
 * A slide that fits is exactly one viewport tall — `min-h-viewport` is `100svh`
 * and nothing overflows it — so the measurement is a straight tie, and a tie is
 * the one comparison that is fragile. `offsetHeight` is a rounded integer, and
 * browser zoom, a fractional device pixel ratio or a sub-pixel `svh` is enough
 * to round it up one past `innerHeight`. The deck then quietly turns itself off
 * for that slide and the visitor hand-scrolls through what should have been an
 * advance. Two pixels of give costs nothing and removes the whole class of it.
 */
const FIT_SLACK_PX = 2;

/** Tracks whether an element is short enough to stand on screen all at once. */
function useFitsViewport(ref) {
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const measure = () =>
      setFits(node.offsetHeight <= window.innerHeight + FIT_SLACK_PX);
    measure();

    // The article resizes on its own as fonts land and text rewraps; the window
    // resizes underneath it. Either one changes the answer.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref]);

  return fits;
}

/**
 * One slide of the deck. It sits in the ordinary flow of the page, so the push
 * is just its own scroll span played in one go — and because the sequence
 * behind it is pinned, what the visitor sees is the sheet of content sliding up
 * and off while the next one arrives underneath it. Scrolling back plays the
 * same travel in reverse; `useSlideHandoff` owns both halves.
 *
 * The reveal runs both ways for the same reason: a slide that is dealt onto
 * the screen once and then never again leaves anyone scrolling back to find a
 * finished, static page where a deck used to be.
 *
 * `advances` is off for the slide that hands over to another section, which
 * owns that transition itself.
 *
 * The handoff is only armed while the slide genuinely fits the screen. Where it
 * doesn't — a short window, a phone turned sideways — one scroll would blow past
 * copy that was never shown, so the slide goes back to being plain scrolled.
 *
 * None of that exists on a phone. There is no deck to advance — touch never got
 * the automatic push in the first place — so a slide there is simply a section,
 * and the one thing the deck's geometry costs it is the padding: a screen-tall
 * minimum on a screen of copy that is half that tall is half a screen of black
 * between every heading and the last one. It sizes to its content instead, with
 * enough of a floor that a title screen still arrives alone.
 */
export default function Slide({
  id,
  className = "",
  advances = true,
  children,
}) {
  const ref = useRef(null);
  const fits = useFitsViewport(ref);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: SLIDE_OFFSET,
  });

  useSlideHandoff({
    sectionRef: ref,
    progress: scrollYProgress,
    completeAt: SLIDE_COMPLETE_AT,
    triggerAt: SLIDE_TRIGGER_AT,
    rearmMargin: SLIDE_REARM_MARGIN,
    // Nothing of the slide may be left on screen: the next one needs all of it.
    land: "top",
    enabled: advances && fits && !isMobile,
  });

  return (
    <motion.article
      id={id}
      ref={ref}
      // On desktop the padding is measured in screen height rather than fixed
      // rems. Centred content never sees it — it only decides the height at
      // which a slide stops fitting the screen, and a slide that doesn't fit is
      // one the deck has to either crop or give up on. Scaling it with `vh`
      // spends the room where it exists and takes it back on the 768px-tall
      // laptops where a fixed 5rem top and bottom was the whole margin between
      // a slide that advances and one that has to be scrolled by hand.
      //
      // The phone's floor is 70svh rather than a full screen: enough that a
      // title screen still arrives as a screen — two of them run back to back
      // where a board announces itself — and short enough that a slide of
      // three lines is three lines rather than a screen with a gap under it.
      className={`flex flex-col justify-center py-20 max-lg:min-h-[70svh] lg:min-h-viewport lg:py-[clamp(3.5rem,7.5vh,5rem)] ${className}`}
      variants={slideBlock}
      initial="hidden"
      whileInView="shown"
      viewport={slideViewport}
    >
      {children}
    </motion.article>
  );
}
