import Link from "next/link";
import { HEADING_SHADOW, LABEL_SHADOW } from "../surfaces";

/**
 * The two marks every admin screen opens with, lifted from the front page's
 * section headings so the admin reads as the same building rather than as a
 * control panel bolted to the side of it.
 */

/** The red rule and the mono line the crew section's sections open with. */
export function Eyebrow({ children }) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red ${LABEL_SHADOW}`}
    >
      <span aria-hidden className="h-px w-6 bg-nic-red/70" />
      {children}
    </span>
  );
}

/**
 * A screen's title block. `accent` is set in red the way the section headings
 * on the front page split their second line.
 */
export function PageHeading({ eyebrow, lead, accent, children }) {
  return (
    <header>
      <Eyebrow>{eyebrow}</Eyebrow>

      <h1
        className={`mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-black uppercase leading-[0.95] tracking-tight text-white ${HEADING_SHADOW}`}
      >
        {lead} {accent && <span className="text-nic-red">{accent}</span>}
      </h1>

      <span aria-hidden className="mt-5 block h-px w-14 bg-nic-red" />

      {children && (
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-400">
          {children}
        </p>
      )}
    </header>
  );
}

/**
 * The way back up, stated once.
 *
 * Every screen below the dashboard carries one, and until now each wrote its
 * own copy of the same eight utility classes and the same nudging arrow — four
 * copies is the point at which one of them starts drifting, and a back link
 * that looks slightly different on one screen reads as a different kind of
 * link.
 *
 * A `<Link>`, not `router.back()`. Browser history is not the same thing as
 * the shape of this console: a coordinator who reached the register from a
 * bookmark, or by refreshing after signing in, has a history stack that goes
 * somewhere else entirely — usually the login page. Naming the destination
 * means the arrow always goes where the label says.
 *
 * `py-3 -my-3` is the one thing here that is not obvious. Ten-pixel tracked-out
 * mono makes a link about fifteen pixels tall, which is a fine thing to read
 * and a poor thing to hit with a thumb — and this is the control somebody
 * reaches for one-handed, at a door, having opened the wrong screen. The
 * padding grows the hit area to nearly forty; the matching negative margin
 * takes the growth back out of the layout, so nothing below it moves.
 */
export function BackLink({ href, children }) {
  return (
    <Link
      href={href}
      className="group -my-3 inline-flex items-center gap-2 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
    >
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:-translate-x-1"
      >
        ←
      </span>
      {children}
    </Link>
  );
}

/**
 * The running slate the crew's row heads are built from — a red light column
 * with a black plate beside it. Used here to head each board in the roster
 * rail, which is the same job it does above each row of three seats.
 */
export function Slate({ children, count }) {
  return (
    <div className="flex items-stretch">
      <span
        aria-hidden
        className="w-1 shrink-0 bg-nic-red shadow-[0_0_18px_3px_rgba(237,10,20,0.6)]"
      />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-3 bg-black/80 py-2 pl-3.5 pr-4 backdrop-blur-sm">
        <span
          className={`truncate font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white ${LABEL_SHADOW}`}
        >
          {children}
        </span>
        {count != null && (
          <span
            className={`shrink-0 font-mono text-[11px] font-medium tracking-[0.2em] text-nic-ember ${LABEL_SHADOW}`}
          >
            {String(count).padStart(2, "0")}
          </span>
        )}
      </span>
    </div>
  );
}
