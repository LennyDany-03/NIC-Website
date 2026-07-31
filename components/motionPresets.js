/**
 * One reveal vocabulary for every scroll-triggered block on the page, so the
 * sections read as one system rather than as three people's animation taste.
 *
 * Orchestration has to live in a parent variant for children to inherit it,
 * hence the empty `hidden` on the container presets.
 */

export const rise = {
  hidden: { opacity: 0, y: 28 },
  shown: { opacity: 1, y: 0 },
};

export const block = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.12 } },
};

export const riseTransition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

export const viewport = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" };

/**
 * Deck slides get their own pair, because a slide is not a block that scrolls
 * past once — it is dealt onto the screen, taken away, and dealt again if the
 * visitor scrolls back. So the reveal has to run in both directions (`once`
 * off), and it has to be over inside the push that carries the slide in:
 * ~0.7s of travel with five staggered children behind it means the last line
 * lands while the next slide is already being asked for.
 *
 * Hence the per-variant transitions: arriving is eased and unhurried, leaving
 * is quick and out of the way. A `transition` prop on the child would override
 * both, so slides pass variants alone.
 */
export const slideRise = {
  hidden: {
    opacity: 0,
    y: 22,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
  },
};

export const slideBlock = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

/**
 * No bottom margin, unlike `viewport`: a slide is a screen tall, so trimming
 * the detection box only delays a reveal that should already have started.
 * The threshold is what matters — low enough that the slide is revealing while
 * it rises, high enough that it un-reveals once it is genuinely off the top.
 */
export const slideViewport = { once: false, amount: 0.28 };

/**
 * Portrait grids get their own pair: a tighter stagger, because nine cards at
 * the block cadence takes over a second to finish, and a little scale so the
 * cards feel like they are being dealt rather than sliding.
 */
export const gridBlock = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

export const card = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  shown: { opacity: 1, y: 0, scale: 1 },
};

export const cardTransition = { duration: 0.65, ease: [0.16, 1, 0.3, 1] };

/** A tall grid needs to start revealing earlier than a paragraph does. */
export const gridViewport = {
  once: true,
  amount: 0.1,
  margin: "0px 0px -60px 0px",
};
