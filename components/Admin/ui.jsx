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
