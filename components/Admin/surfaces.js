/**
 * The admin's shared vocabulary, stated once the way `components/surfaces.js`
 * states the front page's.
 *
 * The admin sits on the same corridor still the crew section is lit by (see
 * Backdrop), so every block of UI here has the same problem the front page's
 * panels have: it is small type over a photograph. The answer is the same —
 * a dark plate per block rather than a scrim over the whole screen — which is
 * why these read like `PANEL` with the radius taken off. Nothing in the admin
 * is rounded, because nothing in the roster it edits is.
 */

/** The plate a block of admin UI sits on. */
export const ADMIN_PANEL =
  "border border-white/10 bg-black/70 backdrop-blur-md";

/**
 * A form control. One rule for text inputs, the textarea and the file
 * picker's button, so a form of six fields reads as one instrument.
 */
export const ADMIN_FIELD =
  "w-full border border-white/12 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-nic-red focus:bg-black/85";

/** The mono line above a field. */
export const ADMIN_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400";

const BTN =
  "inline-flex items-center justify-center px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nic-red disabled:cursor-not-allowed disabled:opacity-40";

export const ADMIN_BTN_PRIMARY = `${BTN} bg-nic-red text-white shadow-[0_14px_40px_-16px_rgba(237,10,20,0.9)] hover:bg-nic-ember disabled:shadow-none`;

export const ADMIN_BTN_GHOST = `${BTN} border border-white/15 bg-black/40 text-zinc-300 hover:border-nic-red hover:text-white`;
