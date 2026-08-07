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
 * ---------------------------------------------------------------------------
 * It measures itself, not the window
 *
 * Every breakpoint below is a **container** query, and that is the fix to what
 * was wrong with this component rather than a stylistic preference.
 *
 * This ticket lives inside the registration panel, which is `max-w-2xl` at
 * every width on purpose — a form filled in on a phone should not be set in a
 * 1440px column just because it can be. Take the panel's padding off and the
 * ticket is **592px wide on a desktop and on a tablet alike**. It never gets
 * wider. But it used to switch to the two-column keycard at the `sm:` viewport
 * breakpoint, which asks a question about the *window* — so at 640px of
 * browser, on a screen of any size at all, the body was handed 388px and asked
 * to hold a three-word title, a club name and two columns of facts. That is
 * why the title broke onto three lines, why "NIC · NEXTGEN INTELLIGENCE CLUB"
 * wrapped, and why a fifteen-digit register number split down the middle. None
 * of it was a type-scale problem; the layout was reading the wrong number.
 *
 * A container query asks the only question that matters here — how much room
 * has this card actually got — and the answer stops depending on a window the
 * card was never sized against. The thresholds:
 *
 *   under 28rem   one column of facts; the stub is a column under the body
 *   28rem – 48rem two columns of facts; the stub is a *band* under the body,
 *                 QR beside the code, which is the shape 592px actually wants
 *   48rem and up  the boarding pass: body left, stub right, perforation
 *                 vertical between them
 *
 * The keycard needs 48rem before the body has room for that title on two
 * lines — which is more than this panel gives it, so on the registration flow
 * the ticket is the folded one at every size, and it is folded because it does
 * not fit rather than because the window is small. Drop this component in a
 * wider column and the boarding pass comes back on its own. The downloaded PNG
 * is always the horizontal keycard (`ticketCanvas.js` draws a fixed 1200×560),
 * so the shape is not lost — it is the format of the thing you keep.
 * ---------------------------------------------------------------------------
 */
export default function Ticket({ code, name, stream, section, year, registerNumber, qr }) {
  const venue = FACTS.find((fact) => fact.id === "venue")?.value;
  const bars = barcodeWidths(code);

  const rows = [
    { label: "Name", value: name },
    { label: "Class", value: section ? `${stream} — ${section}` : stream },
    { label: "Year", value: year },
    { label: "Reg no", value: registerNumber, code: true },
  ];

  return (
    <motion.div
      variants={slideRise}
      className="@container relative border border-cyber-teal/40 bg-cyber-abyss/90 shadow-[0_0_2px_1px_rgba(200,31,110,0.3),0_0_50px_-12px_rgba(242,178,60,0.35),0_0_60px_-10px_rgba(43,183,189,0.5)]"
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

      <div className="relative grid @3xl:grid-cols-[1fr_auto]">
        {/* ------------------------------------------------------------- body */}
        {/* Padding steps with the card rather than with the window, for the
            same reason everything else here does: 32px of inset on a 320px
            ticket is a fifth of it. */}
        <div className="p-5 @xs:p-6 @2xl:p-8">
          {/* The pill and the club, on one line when there is room for one and
              on two when there is not. `gap-y-2` rather than the flat `gap-3`
              this had: wrapped, that gap set the club name a third of a line
              too far below a pill it belongs beside. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
            {/* `text-balance` so that when it does wrap it breaks into two
                even lines rather than five words and one orphan. */}
            <span className={`text-balance ${CYBER_LABEL}`}>
              NIC · {TICKET.club}
            </span>
          </div>

          {/* Sized in `cqw` — a percentage of the *card*, not of the window.
              With `vw` this read 5.5% of a 1440px browser, resolved past its
              own ceiling and pinned at 1.85rem however narrow the card
              underneath it actually was; the ticket at 320px got a title set
              for a card twice that.

              The poster's light runs through it the same way `WorkshopWordmark`
              clips it to the page's own headline — the ticket and the page it
              was issued from share one gradient rather than the ticket quoting
              it in a single flat colour. The blurred copy behind is what a
              clipped, `text-transparent` gradient needs in place of a
              `drop-shadow`, which has nothing to attach to on transparent
              glyphs. */}
          <h3
            className={`relative mt-4 text-[clamp(1.15rem,6.5cqw,1.85rem)] uppercase ${CYBER_HEADING}`}
          >
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

          <p className="mt-4 font-cyber-mono text-[10px] uppercase tracking-[0.2em] text-cyber-aqua @xs:text-[11px] @xs:tracking-[0.22em]">
            {EVENT.dateLabel} · {EVENT.timeLabel}
          </p>

          <p className="mt-1.5 font-cyber-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 @xs:text-[11px] @xs:tracking-[0.22em]">
            {venue || TICKET.venueFallback}
          </p>

          <span aria-hidden className={`mt-6 block h-px w-full ${SPECTRUM_RULE} opacity-30`} />

          {/* A description list because that is what it is: four labels, four
              values, read as a HUD readout rather than a form's summary — a
              triangle marker and a glowing left rule per stat instead of a
              plain row.

              Two columns from 28rem of *card*, which is the width at which a
              half column is about 200px — enough for `RA2411026040059` set at
              14px to stay on one line. The old rule turned two columns on at
              640px of window while the card sat at 592px in a two-column
              layout, so each fact got 170px and the register number broke
              across a line ending in "…0400" / "59". A number that wraps is a
              number somebody reads out wrong at a door. */}
          <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 @md:grid-cols-2">
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
                {/*
                 * `break-words`, never `break-all`, and the register number is
                 * additionally held on one line by `whitespace-nowrap` over a
                 * container that may scroll it. It is the one value here with
                 * no natural break point: a name wraps between words and reads
                 * fine, a register number that wraps reads as two numbers.
                 */}
                <dd
                  className={`mt-1.5 font-cyber-body text-sm font-semibold text-white ${
                    row.code
                      ? "overflow-x-auto whitespace-nowrap tracking-tight"
                      : "break-words"
                  }`}
                >
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
              so the bars in the download match the bars shown here.

              `overflow-hidden` because the bars are a fixed pixel width each
              and 46 of them is wider than a 320px card: clipped they read as a
              barcode running off the edge, which is what a barcode does;
              unclipped they were pushing the card's own width out. */}
          <div
            aria-hidden
            className="mt-7 flex h-6 items-end gap-[3px] overflow-hidden opacity-60"
          >
            {bars.map((width, i) => (
              <span
                key={i}
                className="shrink-0"
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
        <div className="relative border-t border-dashed border-cyber-steel/70 px-5 py-6 @xs:px-6 @xs:py-7 @3xl:border-l @3xl:border-t-0 @3xl:px-8">
          {/* The two notches. One sits at the same corner in both orientations;
              the other moves from the far end of a horizontal perforation to the
              far end of a vertical one. */}
          <span
            aria-hidden
            className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-cyber-void"
          />
          <span
            aria-hidden
            className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-cyber-void @3xl:-bottom-2.5 @3xl:-left-2.5 @3xl:right-auto @3xl:top-auto"
          />

          {/*
           * Three shapes, one stub.
           *
           * Under 28rem it is a centred column — the only thing that fits.
           * From 28rem it becomes a **band**: the QR on the left with the code
           * and the admit tag beside it, which is what a 592px card wants
           * rather than a 120px square marooned in the middle of it with two
           * hundred pixels of nothing either side. Folded back into a column at
           * 48rem, where the stub is a narrow strip down the right-hand edge
           * and the band would not fit again.
           */}
          <div className="flex flex-col items-center gap-4 @md:flex-row @md:items-center @md:justify-center @md:gap-7 @3xl:flex-col @3xl:gap-4">
            {/* A targeting reticle around the plate rather than a plain
                border — four short brackets standing off the corners, echoing
                `CyberTicks` at ticket scale. The plate itself stays flatly
                white: a QR code is the one thing on this ticket the palette
                does not get to touch. */}
            <div className="relative shrink-0">
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
                    className="h-[7rem] w-[7rem] @xs:h-[7.5rem] @xs:w-[7.5rem]"
                  />
                ) : (
                  /* Held open at the exact size the code will be, so the ticket
                     does not jolt a centimetre wider the moment it resolves. */
                  <span className="block h-[7rem] w-[7rem] @xs:h-[7.5rem] @xs:w-[7.5rem]" />
                )}
              </div>
            </div>

            {/* The code and the tag travel together: centred under the QR in
                column mode, left-aligned beside it in the band. */}
            <div className="flex min-w-0 flex-col items-center gap-3 @md:items-start @3xl:items-center">
              <div className="flex min-w-0 flex-col items-center gap-1.5 @md:items-start @3xl:items-center">
                <p className="font-cyber-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                  Access code
                </p>
                {/* Sized off the card again, so a 320px ticket does not set its
                    own code wider than itself. `tracking` comes down with it —
                    0.18em on an 18px mono string is most of a character between
                    every pair of glyphs. */}
                <p className="max-w-full overflow-x-auto whitespace-nowrap font-cyber-mono text-[clamp(0.95rem,4.5cqw,1.125rem)] tracking-[0.12em] text-cyber-aqua drop-shadow-[0_0_12px_rgba(142,240,230,0.55)] @xs:tracking-[0.18em]">
                  {code}
                </p>
              </div>

              <span className="border border-cyber-steel/60 bg-white/5 px-3 py-1 font-cyber-mono text-[9px] uppercase tracking-[0.32em] text-zinc-400">
                {TICKET.admit}
              </span>
            </div>
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
