/**
 * The Genesis'26 vocabulary — what `surfaces.js` is to the front page, scoped
 * to one event.
 *
 * It lives here rather than in `surfaces.js` for the same reason the colours are
 * named `genesis-` rather than added to the club's palette: this is a poster,
 * not a new house style. Nothing on the front page should ever import from this
 * file, and when the symposium has run, the whole folder goes with it.
 */

/**
 * Gold as metal rather than as a colour.
 *
 * A flat `#cca657` fill on a headline reads as mustard — gold is only gold
 * because it is a ramp with a bright edge, so the type is painted with the top
 * three steps of the palette and clipped to the glyphs. Champagne sits at the
 * top where a light source would be, antique gold at the bottom where the
 * letterform turns away.
 *
 * `text-transparent` is doing the clipping, which means the usual trick for
 * making type survive a busy backdrop — a drop shadow — has nothing to attach
 * to. That is why everything wearing this sits on black with a glow behind it
 * rather than over artwork.
 */
export const FOIL =
  "bg-linear-to-b from-genesis-champagne via-genesis-rich to-genesis-gold bg-clip-text text-transparent";

/**
 * The same ramp on a hairline — used for the rules that separate blocks, so a
 * divider on this page is a thread of the same metal rather than a grey line.
 */
export const FOIL_RULE =
  "bg-linear-to-r from-transparent via-genesis-gold to-transparent";

/**
 * A block of running copy, or a fact worth boxing.
 *
 * Same shape as the front page's `PANEL` and for the same reason — blur only
 * from `sm` up, opacity carries legibility on a phone — but edged in bronze
 * instead of white. Bronze is the palette's outline step: dark enough to read
 * as a shadow at the edge of a plate, warm enough that the border does not go
 * grey against the gold it contains.
 */
export const GOLD_PANEL =
  "rounded-2xl border border-genesis-bronze/70 bg-black/70 p-6 sm:bg-black/50 sm:p-7 sm:backdrop-blur-md";

/**
 * A tile that is not a panel: flatter, squarer, and used where several sit in a
 * grid together. Hard corners on purpose — the front page frames its plates
 * with square edges and corner ticks, and this page keeps that grammar even
 * though it has changed colour.
 */
export const GOLD_TILE =
  "relative border border-genesis-bronze/60 bg-white/[0.015] transition-colors duration-500 hover:border-genesis-gold/70 hover:bg-genesis-gold/[0.05]";

/** The small mono type, which has no weight to carry itself over a glow. */
export const GOLD_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.3em] text-genesis-gold sm:text-xs";

/**
 * What a filled button looks like here. Gold is a light colour, so the loud
 * shape on this page inverts — black type on metal — where the club's red one
 * is white type on red.
 */
export const GOLD_BUTTON =
  "group inline-flex items-center gap-3 border border-genesis-gold/70 bg-genesis-gold/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-genesis-champagne transition-all duration-300 hover:bg-genesis-gold hover:text-black focus-visible:bg-genesis-gold focus-visible:text-black focus-visible:outline-none";
