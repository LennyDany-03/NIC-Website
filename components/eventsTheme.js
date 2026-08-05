/**
 * The `/events` vocabulary — what `surfaces.js` is to the front page and
 * `Genesis26/gold.js` is to the symposium, scoped to the events segment.
 *
 * It lives here rather than in `surfaces.js` for the same reason the colours are
 * named `cyber-` rather than added to the club's palette: this is a poster, not
 * a new house style. Nothing on the front page should ever import from this
 * file. The club stays red; the chrome around these pages stays red with it.
 *
 * It started as `WorkshopCyberDefence/theme.js` and moved up a level when the
 * events index was built on it. That move is the point: an event folder is
 * meant to be deleted whole on the day its event has run, and `/events` is not
 * going anywhere — a permanent page reading its own vocabulary out of a folder
 * documented as disposable is a page that breaks the day somebody does the
 * tidying they were told to do. The workshop still owns its *content*; what it
 * no longer owns is the light it is lit by.
 */

/**
 * The poster's light, run through type.
 *
 * The artwork is lit from two sides — magenta raking down from the top left,
 * teal rising from the bottom, amber where they meet behind the crowd — and a
 * headline in any one of those three is a headline that has picked a corner of
 * its own poster. Clipping the full sweep to the glyphs is what makes the title
 * read as the same object as the image it was taken from.
 *
 * Diagonal rather than vertical, because that is the axis the poster's own light
 * runs on. `text-transparent` is doing the clipping, which means the usual trick
 * for making type survive a busy backdrop — a drop shadow — has nothing to
 * attach to, and anything wearing this needs a blurred copy of itself behind it
 * instead (see `WorkshopWordmark`).
 */
export const NEON =
  "bg-linear-to-br from-cyber-rose via-cyber-amber to-cyber-teal bg-clip-text text-transparent";

/** The same sweep on a hairline, for the rules that separate blocks. */
export const SPECTRUM_RULE =
  "bg-linear-to-r from-cyber-magenta via-cyber-amber to-cyber-teal";

/** A rule that fades at both ends instead — for a divider inside a block. */
export const SOFT_RULE =
  "bg-linear-to-r from-transparent via-cyber-steel to-transparent";

/**
 * A block of running copy, or a fact worth boxing.
 *
 * Same shape as the front page's `PANEL` and for the same reason — blur only
 * from `sm` up, opacity carries legibility on a phone — but edged in steel, the
 * palette's outline step: dark enough to sit back, cool enough that it does not
 * go grey next to the teal it contains.
 */
export const CYBER_PANEL =
  "rounded-2xl border border-cyber-steel/70 bg-black/70 p-6 sm:bg-cyber-abyss/60 sm:p-7 sm:backdrop-blur-md";

/**
 * A tile that is not a panel: flatter, squarer, used where several sit together.
 * Hard corners on purpose — the front page frames its plates with square edges
 * and corner ticks, and this page keeps that grammar even though it has changed
 * colour.
 */
export const CYBER_TILE =
  "relative border border-cyber-steel/60 bg-white/[0.015] transition-colors duration-500 hover:border-cyber-teal/70 hover:bg-cyber-teal/[0.06]";

/**
 * The small type: the labels, eyebrows and timestamps.
 *
 * Set in the workshop's mono rather than the site's. Share Tech Mono is a
 * terminal face and this is a workshop about defending things — but it is also
 * light, so it is only ever used uppercase, tracked out, and in teal, which is
 * the one palette step bright enough to hold at 10px on black.
 */
export const CYBER_LABEL =
  "font-cyber-mono text-[10px] uppercase tracking-[0.3em] text-cyber-teal sm:text-xs";

/**
 * A heading. Orbitron is the poster's face — wide, squared and unreadable as
 * running text, so it is never used below ~1rem and never for a paragraph.
 *
 * Deliberately without `uppercase`: the section headings on this site shout and
 * take it at the call site, but the three session titles are transcribed off the
 * poster in sentence case and must stay that way — one of them is fourteen words
 * long. Two text-transform utilities in one class string do not reliably
 * override each other (Tailwind orders them, not the author), so the one that is
 * not always wanted is not in here.
 */
export const CYBER_HEADING = "font-cyber font-black leading-[0.95] tracking-tight";

/**
 * What the loud button looks like here.
 *
 * Teal, not magenta: the magenta end of the palette is the page's heat and is
 * spent on the headline, so leaving the calls to action on the cool end is what
 * stops the two competing. Black type on teal when it fills, the same inversion
 * the gold button makes.
 */
export const CYBER_BUTTON =
  "group inline-flex items-center gap-3 border border-cyber-teal/70 bg-cyber-teal/10 px-5 py-3 font-cyber-mono text-[11px] uppercase tracking-[0.24em] text-cyber-aqua transition-all duration-300 hover:bg-cyber-teal hover:text-black focus-visible:bg-cyber-teal focus-visible:text-black focus-visible:outline-none";

/**
 * What a control you type into looks like here.
 *
 * The admin has `ADMIN_FIELD` and the front page has nothing, because until
 * registration went live the only form on this site was behind a login. This is
 * that field in the poster's palette: steel edge at rest, teal on focus, rose
 * when it is wrong.
 *
 * `aria-[invalid=true]` rather than a separate error class, so the thing that
 * colours the border is the same attribute a screen reader announces the error
 * from — one of them cannot be set without the other, which is the point. The
 * border is 1px and the ring is suppressed: `focus:border-cyber-teal` on a dark
 * field is a stronger signal than the browser's outline and does not shift
 * layout the way a ring on a tightly-packed grid does.
 *
 * Text is `text-base` (16px) rather than the `text-sm` most of this site's
 * type is set in, and that is not a stylistic choice — it is the smallest size
 * that stops iOS Safari zooming the whole page in the moment a field is
 * focused. This is a form filled in on a phone standing up; a page that lurches
 * larger on the first tap is not a detail to get wrong.
 */
export const CYBER_FIELD =
  "w-full border border-cyber-steel/60 bg-black/50 px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-cyber-teal disabled:cursor-not-allowed disabled:border-cyber-steel/40 disabled:bg-black/30 disabled:text-zinc-500 aria-[invalid=true]:border-cyber-rose";

/**
 * The same field, for a `<select>`.
 *
 * Two differences and both are forced. `appearance-none` takes away the native
 * arrow — the OS draws it in the OS's colour, which on Windows is a grey chevron
 * on a grey plate and reads as broken next to teal — so the caller draws its own
 * and `pr-11` leaves room for it. And `text-white` on the closed control does not
 * reach the open menu: the popup is rendered by the platform, so each `<option>`
 * has to state its own colours or a dark-themed page drops white text onto a
 * white list. See `SelectField`, which sets them per option.
 */
export const CYBER_SELECT = `${CYBER_FIELD} cursor-pointer appearance-none pr-11`;

/** The quiet one beside it — a link that happens to be shaped like a control. */
export const CYBER_LINK =
  "group inline-flex items-center gap-3 px-1 py-3 font-cyber-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-cyber-aqua";

/**
 * The faint grid the whole page is drawn on.
 *
 * Two hairline gradients crossed at 64px. It stands in for the circuitry in the
 * poster's artwork without carrying an image to do it, and at 4% it is not
 * really seen so much as it stops the large empty areas of this layout reading
 * as unpainted. Kept as a plain `backgroundImage` string, like `GRAIN_PLATE`,
 * because it is two values a utility class cannot express.
 */
export const GRID_PLATE =
  "linear-gradient(to right, rgba(43,183,189,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,183,189,0.5) 1px, transparent 1px)";

export const GRID_SIZE = "64px 64px";
