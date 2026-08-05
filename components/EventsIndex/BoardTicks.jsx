/**
 * Corner ticks, in whichever palette the card wearing them belongs to.
 *
 * There are three of these on the site now — `CornerTicks` in red,
 * `Genesis26/GoldTicks` in gold, `WorkshopCyberDefence/CyberTicks` in teal — and
 * each is a copy rather than a `color` prop on the first, for the reason
 * `GoldTicks` states: the shared one is stamped on faculty portraits, board
 * seats and the member popup, and putting a knob on it so one route can turn it
 * makes every future edit to those consider a workshop that will have happened.
 *
 * This one takes the knob anyway, and that is the difference: the board is the
 * one surface on the site that shows two events side by side, so it genuinely
 * has two colours to draw at once. The knob is scoped to the component that
 * needs it instead of pushed down into the one everything else uses.
 */
export default function BoardTicks({ className = "border-cyber-teal/80" }) {
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 transition-all duration-500 group-hover:left-1 group-hover:top-1 ${className}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 transition-all duration-500 group-hover:bottom-1 group-hover:right-1 ${className}`}
      />
    </>
  );
}
