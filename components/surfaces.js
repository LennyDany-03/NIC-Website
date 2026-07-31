/**
 * The two ways copy is made legible over a frame sequence, shared by both
 * pinned sections so the rule is stated once rather than drifting apart.
 *
 * Legibility is bought locally, not globally. Blacking out the whole frame to
 * carry a column of body copy is what was costing these sections their
 * backdrop: the sequences are the reason anything is pinned at all, and under
 * a flat 70% scrim they may as well have been stills. So the scrims only take
 * the glare off, and every block of running text sits on a panel of its own
 * that is as dark as that text actually needs. The sequence stays lit in the
 * gaps between them, which is where it was always meant to be seen.
 *
 * Blur only from `sm` up: re-blurring a large surface over a canvas that
 * repaints every frame is the one thing that drops frames on a phone. Opacity
 * carries legibility there instead.
 */
export const PANEL =
  "rounded-2xl border border-white/10 bg-black/70 p-6 sm:bg-black/55 sm:p-7 sm:backdrop-blur-md";

/**
 * Headings sit on the sequence rather than on a panel — they are large enough
 * and heavy enough to, and putting them in a box would cost these sections the
 * one moment where the type and the backdrop actually meet. A shadow is all
 * they need to survive a bright window or a light bar passing behind them.
 */
export const HEADING_SHADOW = "drop-shadow-[0_2px_26px_rgba(0,0,0,0.92)]";

/** The same, for the small mono type that has no weight to carry itself. */
export const LABEL_SHADOW = "drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]";

/**
 * The grain plate a portrait is mounted on, rebuilt in CSS to match the one
 * already composited into the faculty art. Inline turbulence rather than an
 * asset — it tiles at any size and costs no request. Shared by the seat cards,
 * the faculty frames and the popup, which all have to look like the same
 * darkroom.
 */
export const GRAIN_PLATE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.55'/%3E%3C/svg%3E\")";
