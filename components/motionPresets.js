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
