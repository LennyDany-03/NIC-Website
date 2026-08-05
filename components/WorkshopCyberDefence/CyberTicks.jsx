/**
 * The front page's `CornerTicks`, in the workshop's colour.
 *
 * A copy rather than a `color` prop on the shared one, for the reason
 * `Genesis26/GoldTicks.jsx` states: the shared component is stamped on the
 * faculty portraits, the board seats and the member popup — three places with no
 * opinion about teal — and adding a knob to it so one route can turn it means
 * every future edit to those has to consider a workshop that will have happened.
 * This is nine lines; deleting this folder takes it with it.
 */
export default function CyberTicks({ still = false }) {
  const hover = still
    ? ""
    : "group-hover:border-cyber-aqua transition-all duration-500";

  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-cyber-teal/80 ${hover} ${
          still ? "" : "group-hover:left-1 group-hover:top-1"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-cyber-teal/80 ${hover} ${
          still ? "" : "group-hover:bottom-1 group-hover:right-1"
        }`}
      />
    </>
  );
}
