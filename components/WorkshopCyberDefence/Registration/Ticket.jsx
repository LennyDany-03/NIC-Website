"use client";

import { motion } from "framer-motion";
import CyberTicks from "../CyberTicks";
import { TICKET, barcodeWidths, spectrumColorAt } from "./content";
import { EVENT, FACTS } from "../content";
import { CYBER_HEADING, CYBER_LABEL, GRID_PLATE, NEON, SPECTRUM_RULE } from "../../eventsTheme";
import { GRAIN_PLATE } from "../../surfaces";
import { slideRise } from "../../motionPresets";

/**
 * The ticket, as it is shown on the page.
 *
 * ---------------------------------------------------------------------------
 * There are two of these. This is the readable one — real text, real headings,
 * responsive, and the one a screen reader gets. `ticketCanvas.js` draws the same
 * ticket into a bitmap so it can be handed over as a file.
 *
 * The duplication is deliberate and it is the lesser of two evils: an HTML
 * ticket cannot be saved as an image without a DOM-rasterising dependency, and a
 * canvas ticket is a picture of text — unselectable, unsearchable, and blank to
 * anything that is not a pair of eyes. So the page gets the accessible one and
 * the download gets the drawn one.
 *
 * **A copy change here is a copy change there.** If the two drift, the ticket a
 * student saved will not match the ticket they were shown. The shape and the
 * barcode are the parts that can't drift by accident: `panelClipPath` and
 * `barcodeWidths` are single functions both files call rather than numbers each
 * of them was typed out separately.
 * ---------------------------------------------------------------------------
 *
 * The shape is a keycard rather than a plain rectangle — two corners clipped on
 * the diagonal, the same two `CyberTicks` does not bracket, so the two devices
 * read as one idea (a cut corner, a squared one, alternating) rather than
 * competing for the same edge. That and the glow are the whole of what turns
 * "a card with four facts on it" into something that looks like it is meant to
 * be scanned at a door rather than read at a desk.
 *
 * Body on the left, stub on the right, a dashed perforation between them with a
 * notch punched at each end. On a phone the two stack and the perforation runs
 * horizontal instead — the same object, folded the other way, rather than a
 * second layout.
 */
export default function Ticket({ code, name, stream, section, year, registerNumber, qr }) {
  const venue = FACTS.find((fact) => fact.id === "venue")?.value;
  const bars = barcodeWidths(code);

  const rows = [
    { label: "Name", value: name },
    { label: "Class", value: section ? `${stream} — ${section}` : stream },
    { label: "Year", value: year },
    { label: "Reg no", value: registerNumber },
  ];

  return (
    <motion.div
      variants={slideRise}
      className="relative border border-cyber-teal/40 bg-cyber-abyss/90 shadow-[0_0_2px_1px_rgba(200,31,110,0.3),0_0_50px_-12px_rgba(242,178,60,0.35),0_0_60px_-10px_rgba(43,183,189,0.5)]"
      style={{ clipPath: PANEL_CLIP }}
    >
      {/* The poster's own light, run across the card at ticket scale: magenta
          top left where the eyebrow sits, teal bottom right behind the QR,
          amber low across the middle where the two would meet. The same
          recipe the page's own hero is lit by — see `WorkshopRegistration` —
          shrunk down, because the point of a ticket in this palette is that it
          reads as cut from the same sheet the rest of the page is, not as a
          flat panel that happens to share its border colour. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 4% 0%, rgba(200,31,110,0.38) 0%, rgba(200,31,110,0) 55%), radial-gradient(ellipse 65% 60% at 98% 100%, rgba(43,183,189,0.34) 0%, rgba(43,183,189,0) 55%), radial-gradient(ellipse 55% 45% at 46% 48%, rgba(242,178,60,0.16) 0%, rgba(242,178,60,0) 65%)",
        }}
      />
      {/* The circuit-board hairline, denser than the page-wide `GRID_PLATE` is
          drawn at — a ticket is a small object and a 64px grid would show
          barely a line across it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: GRID_PLATE, backgroundSize: "26px 26px" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      <CyberTicks still />
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1 shadow-[0_0_16px_1px_rgba(242,178,60,0.5)] ${SPECTRUM_RULE}`}
      />

      <div className="relative grid sm:grid-cols-[1fr_auto]">
        {/* ------------------------------------------------------------- body */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* The dot pulses — `animate-pulse` is Tailwind's own opacity
                keyframe, low-amplitude enough that it reads as a status light
                rather than motion somebody needs `prefers-reduced-motion` to
                be spared from. */}
            <span className="inline-flex items-center gap-1.5 border border-cyber-aqua/50 bg-cyber-aqua/10 px-2.5 py-1 font-cyber-mono text-[9px] uppercase tracking-[0.28em] text-cyber-aqua">
              <span
                aria-hidden
                className="block h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-aqua shadow-[0_0_8px_2px_rgba(142,240,230,0.7)]"
              />
              Access granted
            </span>
            <span className={CYBER_LABEL}>NIC · {TICKET.club}</span>
          </div>

          {/* The poster's light run through this title too, the same way
              `WorkshopWordmark` clips it to the page's own headline — the
              ticket and the page it was issued from share one gradient
              rather than the ticket quoting it in a single flat colour. The
              blurred copy behind is what a clipped, `text-transparent`
              gradient needs in place of a `drop-shadow`, which has nothing to
              attach to on transparent glyphs. */}
          <h3 className={`relative mt-4 text-[clamp(1.25rem,5.5vw,1.85rem)] uppercase ${CYBER_HEADING}`}>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 select-none text-cyber-teal/30 blur-[0.18em]"
            >
              {EVENT.lead} {EVENT.title}
            </span>
            <span className={`relative ${NEON}`}>
              {EVENT.lead} {EVENT.title}
            </span>
          </h3>

          <p className="mt-4 font-cyber-mono text-[11px] uppercase tracking-[0.22em] text-cyber-aqua">
            {EVENT.dateLabel} · {EVENT.timeLabel}
          </p>

          <p className="mt-1.5 font-cyber-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            {venue || TICKET.venueFallback}
          </p>

          <span aria-hidden className={`mt-6 block h-px w-full ${SPECTRUM_RULE} opacity-30`} />

          {/* A description list because that is what it is: four labels, four
              values, read as a HUD readout rather than a form's summary — a
              triangle marker and a glowing left rule per stat instead of a
              plain row. Two columns from `sm`, one on a phone — a register
              number in a half column on a 390px screen wraps mid-number. */}
          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="min-w-0 border-l-2 border-cyber-teal/50 pl-3"
              >
                <dt className="flex items-center gap-1.5 font-cyber-mono text-[9px] uppercase tracking-[0.28em] text-cyber-teal">
                  <span aria-hidden className="text-cyber-aqua">
                    ▸
                  </span>
                  {row.label}
                </dt>
                <dd className="mt-1.5 break-words font-cyber-body text-sm font-semibold text-white">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* The barcode. Decorative — nothing on this ticket scans it, the
              QR on the stub is the only thing that encodes anything — and
              seeded from the ticket code so it is the same row of bars every
              time this exact ticket is drawn. See `barcodeWidths`. Coloured
              along the poster's own sweep rather than flat teal, via
              `spectrumColorAt` — the same function `ticketCanvas.js` samples,
              so the bars in the download match the bars shown here. */}
          <div aria-hidden className="mt-7 flex h-6 items-end gap-[3px] opacity-60">
            {bars.map((width, i) => (
              <span
                key={i}
                style={{
                  width: `${width}px`,
                  height: i % 5 === 0 ? "100%" : "65%",
                  backgroundColor: spectrumColorAt(i / (bars.length - 1)),
                }}
              />
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- stub */}
        <div className="relative border-t border-dashed border-cyber-steel/70 px-6 py-7 sm:border-l sm:border-t-0 sm:px-8">
          {/* The two notches. One sits at the same corner in both orientations;
              the other moves from the far end of a horizontal perforation to the
              far end of a vertical one. */}
          <span
            aria-hidden
            className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-cyber-void"
          />
          <span
            aria-hidden
            className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-cyber-void sm:-bottom-2.5 sm:-left-2.5 sm:right-auto sm:top-auto"
          />

          <div className="flex flex-col items-center gap-4">
            {/* A targeting reticle around the plate rather than a plain
                border — four short brackets standing off the corners, echoing
                `CyberTicks` at ticket scale. The plate itself stays flatly
                white: a QR code is the one thing on this ticket the palette
                does not get to touch. */}
            <div className="relative">
              <span aria-hidden className="absolute -left-1.5 -top-1.5 h-3.5 w-3.5 border-l-2 border-t-2 border-cyber-aqua" />
              <span aria-hidden className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 border-r-2 border-t-2 border-cyber-aqua" />
              <span aria-hidden className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 border-b-2 border-l-2 border-cyber-aqua" />
              <span aria-hidden className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 border-b-2 border-r-2 border-cyber-aqua" />

              <div className="rounded-sm bg-white p-2.5 shadow-[0_0_28px_-6px_rgba(43,183,189,0.7)]">
                {qr ? (
                  /* A data URL for an image generated in this tab — nothing for
                     `next/image` to fetch, optimise or cache. */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qr}
                    alt={`QR code for ticket ${code}`}
                    className="h-[7.5rem] w-[7.5rem]"
                  />
                ) : (
                  /* Held open at the exact size the code will be, so the ticket
                     does not jolt a centimetre wider the moment it resolves. */
                  <span className="block h-[7.5rem] w-[7.5rem]" />
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <p className="font-cyber-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                Access code
              </p>
              <p className="font-cyber-mono text-lg tracking-[0.18em] text-cyber-aqua drop-shadow-[0_0_12px_rgba(142,240,230,0.55)]">
                {code}
              </p>
            </div>

            <span className="border border-cyber-steel/60 bg-white/5 px-3 py-1 font-cyber-mono text-[9px] uppercase tracking-[0.32em] text-zinc-400">
              {TICKET.admit}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * The keycard silhouette, shared with `ticketCanvas.js` in spirit if not in
 * literal code — CSS `clip-path` and a canvas `Path2D` cannot share a
 * definition, so `panelPath` there traces the same six points this polygon
 * does by hand. Cuts the top-right and bottom-left corners; `CyberTicks`
 * brackets the other two, which is why those two are left square.
 */
const PANEL_CLIP =
  "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))";
