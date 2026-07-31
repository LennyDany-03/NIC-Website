/**
 * One reveal vocabulary for every scroll-triggered block on the page, so the
 * sections read as one system rather than as three people's animation taste.
 *
 * Orchestration has to live in a parent variant for children to inherit it,
 * hence the empty `hidden` on the container presets.
 */

/**
 * Everything here is a slide, because everything on the page now is. The pair
 * that used to lead this file — a one-shot rise for a block that scrolls past
 * once and is never seen again — went out with the last section that worked
 * that way: the board rosters, dealt three cards to a screen now.
 *
 * A slide is not a block that scrolls past once — it is dealt onto the screen,
 * taken away, and dealt again if the visitor scrolls back. So the reveal has to
 * run in both directions (`once` off), and it has to be over inside the push
 * that carries the slide in:
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
 * No trimmed detection box: a slide is a screen tall, so pulling its edges in
 * only delays a reveal that should already have started.
 * The threshold is what matters — low enough that the slide is revealing while
 * it rises, high enough that it un-reveals once it is genuinely off the top.
 */
export const slideViewport = { once: false, amount: 0.28 };

/**
 * A roster slide is one person: their portrait on the left, who they are on the
 * right. The two halves arrive from the side they occupy, which is what makes
 * the pair read as a frame being hung and its plate being set beside it rather
 * than as two blocks fading up together.
 *
 * Same contract as `slideRise` — both directions, and over inside the push
 * that carries the slide in.
 */
export const rowFromLeft = {
  hidden: {
    opacity: 0,
    x: -44,
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
  shown: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] },
  },
};

export const rowFromRight = {
  hidden: {
    opacity: 0,
    x: 36,
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
  shown: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Board seats are dealt three to a screen, and a screen is a slide — so they
 * take the same two-way contract as `slideRise` rather than the one-shot reveal
 * a grid that merely scrolls past once would use. A scroll back has to hand the
 * three cards over again, whole, or the deck reads as broken behind you.
 *
 * The stagger lives on the row rather than on the slide because the row is what
 * the cards are children of; a little scale on the way in is what makes three
 * of them read as being dealt rather than as one block fading up.
 */
export const seatRow = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const seatCard = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.97,
    transition: { duration: 0.26, ease: [0.4, 0, 1, 1] },
  },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};
