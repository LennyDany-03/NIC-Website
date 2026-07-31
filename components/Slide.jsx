"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import useSlideHandoff from "./useSlideHandoff";
import { block, viewport } from "./motionPresets";

/** 0 with the slide filling the screen, 1 once it has cleared the top of it. */
const SLIDE_OFFSET = ["start start", "end start"];
/** The slide is up, whole and standing still. */
export const SLIDE_COMPLETE_AT = 0.03;
/** One more scroll — about two thirds of a wheel notch — advances it. */
export const SLIDE_TRIGGER_AT = 0.08;
/** Backing this far off a slide arms it to be advanced a second time. */
export const SLIDE_REARM_MARGIN = 0.02;

/** Tracks whether an element is short enough to stand on screen all at once. */
function useFitsViewport(ref) {
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const measure = () => setFits(node.offsetHeight <= window.innerHeight);
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
 * `advances` is off for the slide that hands over to another section, which
 * owns that transition itself.
 *
 * The handoff is only armed while the slide genuinely fits the screen. Where it
 * doesn't — a short window, a phone turned sideways — one scroll would blow past
 * copy that was never shown, so the slide goes back to being plain scrolled.
 */
export default function Slide({
  id,
  className = "",
  advances = true,
  children,
}) {
  const ref = useRef(null);
  const fits = useFitsViewport(ref);

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
    enabled: advances && fits,
  });

  return (
    <motion.article
      id={id}
      ref={ref}
      // The desktop padding is deliberately tighter than the phone's. Centred
      // content never sees it — it only decides the height at which a slide
      // stops fitting the screen, and a slide that doesn't fit is one the deck
      // has to either crop or give up on. 5rem is also exactly the navbar, so
      // the top of a slide that does press against it still clears.
      className={`flex min-h-viewport flex-col justify-center py-24 sm:py-32 lg:py-20 ${className}`}
      variants={block}
      initial="hidden"
      whileInView="shown"
      viewport={viewport}
    >
      {children}
    </motion.article>
  );
}
