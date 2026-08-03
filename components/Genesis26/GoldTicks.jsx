/**
 * The front page's `CornerTicks`, in the event's colour.
 *
 * A copy rather than a `color` prop on the shared one, on purpose. The shared
 * component is stamped on the faculty portraits, the board seats and the member
 * popup — three places that have no opinion about gold — and adding a knob to it
 * so one route can turn it means every future edit to those ticks has to
 * consider a symposium that will have finished. This is nine lines; when
 * Genesis'26 is over, deleting the folder takes it with it.
 */
export default function GoldTicks({ still = false }) {
  const hover = still
    ? ""
    : "group-hover:border-genesis-champagne transition-all duration-500";

  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-genesis-gold/80 ${hover} ${
          still ? "" : "group-hover:left-1 group-hover:top-1"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-genesis-gold/80 ${hover} ${
          still ? "" : "group-hover:bottom-1 group-hover:right-1"
        }`}
      />
    </>
  );
}
