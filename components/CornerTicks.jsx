/**
 * The red L-brackets that frame every plate on the page — the faculty
 * portraits, the board seats, and the popup a seat opens into.
 *
 * They tighten on hover, which is why the brackets take their cue from a
 * `group` on the card rather than from a prop: the whole card is the target,
 * and a card that is not inside a `group` simply gets the resting state.
 */
export default function CornerTicks({ still = false }) {
  const hover = still
    ? ""
    : "group-hover:border-nic-red transition-all duration-500";

  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-nic-red/80 ${hover} ${
          still ? "" : "group-hover:left-1 group-hover:top-1"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-nic-red/80 ${hover} ${
          still ? "" : "group-hover:bottom-1 group-hover:right-1"
        }`}
      />
    </>
  );
}
