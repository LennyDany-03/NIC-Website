"use client";

import { TICKET, barcodeWidths, spectrumColorAt } from "./content";
import { EVENT, FACTS } from "../content";

/**
 * The ticket again, drawn rather than laid out, so it can be saved as a file.
 *
 * ---------------------------------------------------------------------------
 * There are two of these. `Ticket.jsx` is the readable one on the page; this is
 * its twin. **A copy change there is a copy change here.** See the note at the
 * top of that file for why the duplication is accepted, and for `barcodeWidths`
 * — the one piece both files call rather than each typing out separately.
 * ---------------------------------------------------------------------------
 *
 * Canvas rather than a DOM rasteriser: `html2canvas` and friends re-implement a
 * browser's layout engine well enough to be wrong in interesting ways, and they
 * are a dependency the size of this entire feature. A ticket is a handful of
 * shapes and strings — drawing it directly is less code than configuring
 * something else to draw it, even with the glow and the cut corners.
 *
 * Everything below is in logical units against a fixed 1200×560 ticket, and the
 * whole context is scaled by `SCALE` once at the top. That is what makes the
 * arithmetic readable: the numbers in this file are the numbers in the design,
 * and the export happens to be twice that so it survives being opened on a
 * phone and pinched. The 40px margin on every side of the panel is not
 * whitespace for its own sake — it is where the glow this ticket is drawn with
 * is allowed to bleed before the canvas edge would clip it.
 */

const SCALE = 2;
const W = 1200;
const H = 560;

/* The panel, and the size of the two corners `panelPath` cuts off it — the
   same 22px `PANEL_CLIP` cuts in `Ticket.jsx`, in canvas units rather than CSS
   ones. Top-right and bottom-left; the other two stay square for the ticks. */
const PANEL = { x: 40, y: 40, w: 1120, h: 480 };
const CLIP = 22;

/* Where the body ends and the stub begins. */
const PERF_X = PANEL.x + 760;
const STUB_MID = (PERF_X + PANEL.x + PANEL.w) / 2;

const BODY_X = PANEL.x + 44;
const COL_2_X = BODY_X + 384;

const VOID = "#04090b";
const ABYSS = "#0a1c21";
const STEEL = "#2b4d55";
const TEAL = "#2bb7bd";
const AQUA = "#8ef0e6";
const MAGENTA = "#c81f6e";
const AMBER = "#f2b23c";
const ZINC = "#8a8f98";

/**
 * The three families, read off the live page rather than hard-coded.
 *
 * `next/font` hashes its family names at build time — the real name is something
 * like `__Orbitron_e8ce7c`, which cannot be written down here. But it publishes
 * each one as a CSS custom property on the events layout, and custom properties
 * inherit, so any element inside that layout can be asked. Falling back to a
 * generic keeps the download working even if the variable is missing, at the
 * cost of the ticket being set in the wrong face.
 */
function familiesFrom(anchor) {
  const style = getComputedStyle(anchor);
  const read = (name, fallback) =>
    style.getPropertyValue(name).trim() || fallback;

  return {
    display: read("--font-orbitron", "sans-serif"),
    body: read("--font-poppins", "sans-serif"),
    mono: read("--font-share-tech", "monospace"),
  };
}

/**
 * `ctx.letterSpacing` is what makes the tracked-out mono labels on this ticket
 * look like the ones on the page, and it is recent enough to be worth checking
 * for. Where it is missing the type simply sets tight — wrong, but legible,
 * which is the right way round for a fallback.
 */
function track(ctx, value) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = value;
}

/** Truncate to fit, because a long name must not run into the perforation. */
function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

/**
 * The keycard outline: a rectangle with the top-right and bottom-left corners
 * cut on the diagonal, traced as one path so a single `fill`, `stroke` or
 * `clip` call gets the whole silhouette rather than four separate rectangles
 * fighting each other at the seams. Mirrors `PANEL_CLIP` in `Ticket.jsx` point
 * for point.
 */
function panelPath(ctx, x, y, w, h, c) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.closePath();
}

/**
 * How the drawn ticket is encoded, in the order it is attempted.
 *
 * ---------------------------------------------------------------------------
 * This used to be `canvas.toDataURL("image/png")` and that was costing about
 * 1.9 MB per registration. PNG is lossless and it is the wrong format for this
 * particular picture: the ticket is three radial gradients, a spectrum sweep,
 * two glows and a blurred title, which is to say it is almost entirely smooth
 * tonal variation — the one thing PNG's predictors cannot compress. Measured on
 * a real ticket at 2400×1120:
 *
 *     png          1920 KB      webp q0.92    103 KB
 *     jpeg q0.92    304 KB      webp q0.95    129 KB
 *
 * Fifteen times smaller, and the QR still decodes out of every one of them
 * (checked with the same `jsqr` the door's scanner falls back to). q0.95 rather
 * than something lower because the saving from here down is tens of kilobytes
 * against a real risk: the access code and the register number are set in 11px
 * tracked-out mono over a dark panel, which is exactly what lossy encoders
 * smear first. The QR was never the fragile part — it is a 416px block of hard
 * black and white with a quiet margin.
 *
 * WebP first, JPEG behind it, PNG last. `toDataURL` does not throw on a type it
 * cannot encode — it quietly returns a PNG instead — so the result is checked
 * by reading back the MIME type it actually produced rather than by trusting
 * the request. Every browser this form runs in has had WebP for years; the
 * chain is there so that a browser without it produces a large ticket rather
 * than no ticket.
 *
 * The bucket accepts all three (`allowed_mime_types` in
 * `supabase/workshop-modern-cyber-defence.sql`), which is why the format has to
 * travel with the file — see `submitRegistration`, which names the object from
 * `ext` and uploads it under `type`. Hard-coding `.png` at either end while
 * this list says otherwise would put a WebP in the bucket under a PNG's name.
 * ---------------------------------------------------------------------------
 */
const ENCODINGS = [
  { type: "image/webp", quality: 0.95, ext: "webp" },
  { type: "image/jpeg", quality: 0.95, ext: "jpeg" },
  /* The floor. Always succeeds, so the loop below always terminates. */
  { type: "image/png", quality: undefined, ext: "png" },
];

function encode(canvas) {
  for (const option of ENCODINGS) {
    const url = canvas.toDataURL(option.type, option.quality);
    if (url.startsWith(`data:${option.type}`)) {
      return { url, type: option.type, ext: option.ext };
    }
  }

  /* Unreachable — PNG is in the list and cannot fail — but a function that
     returns undefined into a data URL is a blank ticket rather than an error,
     and that is not a failure worth making silent. */
  throw new Error("The ticket could not be encoded in any supported format.");
}

/**
 * Draw the ticket and hand back `{ url, type, ext }` — the data URL, the MIME
 * type it was actually encoded as, and the extension a file of it should carry.
 *
 * An object rather than the bare data URL it used to return, because the format
 * is no longer a constant: both callers have to name the file after whatever
 * `encode` managed, and a data URL alone cannot tell them which that was.
 *
 * `anchor` is any element inside the `/events` layout — it is read for the font
 * variables and nothing else. `qr` is the data URL the page is already showing;
 * it is decoded before anything is drawn, because an `Image` painted before it
 * has loaded silently contributes nothing and the ticket saves with a white
 * square where its code should be.
 */
export async function drawTicket({ anchor, qr, code, name, stream, section, year, registerNumber }) {
  const font = familiesFrom(anchor);
  const venue = FACTS.find((fact) => fact.id === "venue")?.value;
  const bars = barcodeWidths(code);

  /* Both waits matter. `document.fonts.ready` is the difference between the
     ticket being set in Orbitron and being set in whatever the fallback is —
     canvas does not re-draw itself when a webfont arrives the way the DOM
     re-flows. */
  if (document.fonts?.ready) await document.fonts.ready;

  const image = await loadImage(qr);

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;

  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  /* ---------------------------------------------------------- the surround */
  ctx.fillStyle = VOID;
  ctx.fillRect(0, 0, W, H);

  /* -------------------------------------------------------- the panel body */
  panelPath(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, CLIP);
  ctx.fillStyle = ABYSS;
  ctx.fill();

  /* The poster's own light, clipped to the card the way the HTML version's
     wash is by its parent's `clip-path` — magenta top left, teal bottom right
     behind the QR, amber low in the middle. `createRadialGradient` only draws
     circles, not the CSS version's ellipses, which is a fine trade for a
     decoration this small; the three still land in the same corners. See the
     matching wash in `Ticket.jsx` for why a ticket in this palette wants its
     own light rather than a flat panel colour. */
  ctx.save();
  panelPath(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, CLIP);
  ctx.clip();
  blob(ctx, PANEL.x + 60, PANEL.y + 30, 420, "200,31,110", 0.38);
  blob(ctx, PANEL.x + PANEL.w - 60, PANEL.y + PANEL.h - 30, 440, "43,183,189", 0.32);
  blob(ctx, PANEL.x + PANEL.w * 0.46, PANEL.y + PANEL.h * 0.5, 320, "242,178,60", 0.15);
  ctx.restore();

  /* The circuit-board hairline, clipped to the card's own outline so it
     cannot poke past the cut corners. Restored immediately after — nothing
     drawn later on this canvas is meant to inherit the clip. */
  ctx.save();
  panelPath(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, CLIP);
  ctx.clip();
  ctx.strokeStyle = "rgba(43,183,189,0.10)";
  ctx.lineWidth = 1;
  for (let gx = PANEL.x; gx < PANEL.x + PANEL.w; gx += 26) line(ctx, gx, PANEL.y, gx, PANEL.y + PANEL.h);
  for (let gy = PANEL.y; gy < PANEL.y + PANEL.h; gy += 26) line(ctx, PANEL.x, gy, PANEL.x + PANEL.w, gy);
  ctx.restore();

  /* The glow border. Drawn as its own pass with the shadow set, then the
     shadow is zeroed straight away — a canvas shadow stays live for every
     subsequent draw call until something turns it off, which is the usual way
     this technique quietly bleeds onto text six lines later. */
  panelPath(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, CLIP);
  ctx.shadowColor = "rgba(43,183,189,0.55)";
  ctx.shadowBlur = 26;
  ctx.strokeStyle = "rgba(43,183,189,0.7)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* The spectrum top edge, clipped to the panel so the corner cut trims it
     rather than the bar sitting square across a diagonal. */
  ctx.save();
  panelPath(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, CLIP);
  ctx.clip();
  const spectrum = ctx.createLinearGradient(PANEL.x, 0, PANEL.x + PANEL.w, 0);
  spectrum.addColorStop(0, MAGENTA);
  spectrum.addColorStop(0.5, AMBER);
  spectrum.addColorStop(1, TEAL);
  ctx.shadowColor = "rgba(242,178,60,0.5)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = spectrum;
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, 5);
  ctx.shadowBlur = 0;
  ctx.restore();

  /* ------------------------------------------------------------- the ticks */
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 3;
  corner(ctx, PANEL.x + 16, PANEL.y + 18, 1, 1);
  corner(ctx, PANEL.x + PANEL.w - 16, PANEL.y + PANEL.h - 18, -1, -1);

  /* --------------------------------------------------------------- the body */
  ctx.textAlign = "left";

  /* "Access granted" — a small bordered pill with a glowing dot, the canvas
     reading of the chip `Ticket.jsx` renders as a real element. */
  const pillY = PANEL.y + 40;
  const pillText = "ACCESS GRANTED";
  track(ctx, "2.6px");
  ctx.font = `11px ${font.mono}`;
  const pillTextWidth = ctx.measureText(pillText).width;
  const pillPadX = 12;
  const pillW = pillTextWidth + pillPadX * 2 + 18;
  const pillH = 24;

  ctx.strokeStyle = "rgba(142,240,230,0.55)";
  ctx.fillStyle = "rgba(142,240,230,0.10)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(BODY_X, pillY - pillH + 6, pillW, pillH);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = "rgba(142,240,230,0.7)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = AQUA;
  ctx.beginPath();
  ctx.arc(BODY_X + pillPadX + 3, pillY - pillH / 2 + 6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = AQUA;
  ctx.fillText(pillText, BODY_X + pillPadX + 14, pillY);

  track(ctx, "3px");
  ctx.font = `13px ${font.mono}`;
  ctx.fillStyle = TEAL;
  ctx.fillText(`NIC · ${TICKET.club.toUpperCase()}`, BODY_X + pillW + 20, pillY);

  /* The title, in the poster's light rather than plain white — the same
     rose→amber→teal sweep `NEON` clips the page's own headlines to (a
     lighter pink than the wash's deep magenta, because that is the pairing
     `WorkshopWordmark` already settled on for type against black). A blurred
     copy first stands in for the `drop-shadow` a gradient fill has no room
     for; `ctx.filter` is reset in the same breath it is set, since a canvas
     shadow or filter left live is the usual way this technique bleeds onto
     whatever gets drawn next. */
  track(ctx, "0px");
  ctx.font = `900 38px ${font.display}`;

  ctx.save();
  ctx.filter = "blur(5px)";
  ctx.fillStyle = "rgba(43,183,189,0.4)";
  ctx.fillText(EVENT.lead.toUpperCase(), BODY_X, 158);
  ctx.fillText(EVENT.title.toUpperCase(), BODY_X, 202);
  ctx.restore();

  const titleGradient = ctx.createLinearGradient(BODY_X, 130, BODY_X + 420, 210);
  titleGradient.addColorStop(0, "#ef5f95");
  titleGradient.addColorStop(0.5, "#f2b23c");
  titleGradient.addColorStop(1, "#2bb7bd");
  ctx.fillStyle = titleGradient;
  ctx.fillText(EVENT.lead.toUpperCase(), BODY_X, 158);
  ctx.fillText(EVENT.title.toUpperCase(), BODY_X, 202);

  track(ctx, "2.4px");
  ctx.font = `15px ${font.mono}`;
  ctx.fillStyle = AQUA;
  ctx.fillText(`${EVENT.dateLabel} · ${EVENT.timeLabel}`.toUpperCase(), BODY_X, 238);

  ctx.fillStyle = ZINC;
  ctx.fillText((venue || TICKET.venueFallback).toUpperCase(), BODY_X, 262);

  /* The mid-rule, in the spectrum rather than a flat line, at low opacity. */
  ctx.save();
  ctx.globalAlpha = 0.3;
  const midRule = ctx.createLinearGradient(BODY_X, 0, PERF_X - 40, 0);
  midRule.addColorStop(0, MAGENTA);
  midRule.addColorStop(0.5, AMBER);
  midRule.addColorStop(1, TEAL);
  ctx.fillStyle = midRule;
  ctx.fillRect(BODY_X, 288, PERF_X - 40 - BODY_X, 1);
  ctx.restore();

  /* The four facts, HUD-style: a glowing left rule and a small triangle ahead
     of each label, mirroring the `border-l-2` + "▸" treatment on the page. */
  const rows = [
    { label: "NAME", value: name, x: BODY_X, y: 336 },
    { label: "CLASS", value: section ? `${stream} — ${section}` : stream, x: COL_2_X, y: 336 },
    { label: "YEAR", value: year, x: BODY_X, y: 410 },
    { label: "REG NO", value: registerNumber, x: COL_2_X, y: 410 },
  ];

  const columnWidth = COL_2_X - BODY_X - 36;

  for (const row of rows) {
    ctx.strokeStyle = "rgba(43,183,189,0.6)";
    ctx.lineWidth = 2;
    line(ctx, row.x - 14, row.y - 24, row.x - 14, row.y + 12);

    ctx.fillStyle = AQUA;
    ctx.beginPath();
    ctx.moveTo(row.x - 8, row.y - 15);
    ctx.lineTo(row.x - 8, row.y - 9);
    ctx.lineTo(row.x - 3, row.y - 12);
    ctx.closePath();
    ctx.fill();

    track(ctx, "3px");
    ctx.font = `12px ${font.mono}`;
    ctx.fillStyle = TEAL;
    ctx.fillText(row.label, row.x, row.y - 8);

    track(ctx, "0px");
    ctx.font = `600 20px ${font.body}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(fit(ctx, row.value ?? "", columnWidth), row.x, row.y + 22);
  }

  /* The barcode: a deterministic row of bars, seeded from the ticket code by
     `barcodeWidths` so it matches the one `Ticket.jsx` drew for this same
     code, and coloured along the same sweep by `spectrumColorAt` so the two
     are the same row of bars in the same colours. Purely decorative —
     nothing here is scanned. */
  ctx.globalAlpha = 0.6;
  let barX = BODY_X;
  const barBaseline = 494;
  bars.forEach((width, i) => {
    const barH = i % 5 === 0 ? 24 : 16;
    ctx.fillStyle = spectrumColorAt(i / (bars.length - 1));
    ctx.fillRect(barX, barBaseline - barH, width, barH);
    barX += width + 3;
  });
  ctx.globalAlpha = 1;

  /* --------------------------------------------------------- the perforation */
  ctx.strokeStyle = STEEL;
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 7]);
  line(ctx, PERF_X, PANEL.y, PERF_X, PANEL.y + PANEL.h);
  ctx.setLineDash([]);

  /* Punched in the surround's colour, which is why the panel is inset at all. */
  ctx.fillStyle = VOID;
  notch(ctx, PERF_X, PANEL.y);
  notch(ctx, PERF_X, PANEL.y + PANEL.h);

  /* --------------------------------------------------------------- the stub */
  const plate = 236;
  const qrSize = 208;
  const plateTop = PANEL.y + 60;
  const plateLeft = STUB_MID - plate / 2;

  /* The targeting-reticle brackets, standing off the white plate the same
     way `CyberTicks` stands off this whole panel's own two square corners. */
  ctx.strokeStyle = AQUA;
  ctx.lineWidth = 2.5;
  const b = 16;
  corner(ctx, plateLeft - 8, plateTop - 8, 1, 1, b);
  corner(ctx, plateLeft + plate + 8, plateTop - 8, -1, 1, b);
  corner(ctx, plateLeft - 8, plateTop + plate + 8, 1, -1, b);
  corner(ctx, plateLeft + plate + 8, plateTop + plate + 8, -1, -1, b);

  ctx.shadowColor = "rgba(43,183,189,0.65)";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(plateLeft, plateTop, plate, plate);
  ctx.shadowBlur = 0;
  ctx.drawImage(image, plateLeft + (plate - qrSize) / 2, plateTop + (plate - qrSize) / 2, qrSize, qrSize);

  ctx.textAlign = "center";

  track(ctx, "4px");
  ctx.font = `11px ${font.mono}`;
  ctx.fillStyle = ZINC;
  ctx.fillText("ACCESS CODE", STUB_MID, plateTop + plate + 42);

  track(ctx, "3px");
  ctx.font = `24px ${font.mono}`;
  ctx.shadowColor = "rgba(142,240,230,0.6)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = AQUA;
  ctx.fillText(code, STUB_MID, plateTop + plate + 78);
  ctx.shadowBlur = 0;

  /* The "admit one" tag, boxed like a stamped badge rather than plain text. */
  track(ctx, "4px");
  ctx.font = `11px ${font.mono}`;
  const admitText = TICKET.admit.toUpperCase();
  const admitWidth = ctx.measureText(admitText).width;
  const admitBoxW = admitWidth + 32;
  const admitBoxH = 26;
  const admitY = plateTop + plate + 100;

  ctx.strokeStyle = "rgba(43,77,85,0.9)";
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  ctx.textAlign = "left";
  ctx.beginPath();
  ctx.rect(STUB_MID - admitBoxW / 2, admitY, admitBoxW, admitBoxH);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = ZINC;
  ctx.fillText(admitText, STUB_MID, admitY + admitBoxH / 2 + 4);

  track(ctx, "0px");

  return encode(canvas);
}

/**
 * One of `CyberTicks`' L-brackets, in the direction given. `size` lets the
 * small reticle marks around the QR plate share this with the panel's own
 * corner ticks instead of a second near-identical function.
 */
function corner(ctx, x, y, dx, dy, size = 22) {
  ctx.beginPath();
  ctx.moveTo(x, y + dy * size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + dx * size, y);
  ctx.stroke();
}

/** One pool of the poster's light — a radial gradient faded to nothing,
    filled across the whole panel so its falloff reaches exactly as far as
    the CSS `radial-gradient` version's ellipse would. */
function blob(ctx, cx, cy, radius, rgb, alpha) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, `rgba(${rgb},${alpha})`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function notch(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Hand the drawn ticket over as a download.
 *
 * A synthetic anchor rather than `window.open`: a data URL opened in a tab is
 * blocked by every popup blocker there is, and even when it works it lands
 * somebody on a bare image with no filename. This puts a file called
 * `nic-ticket-MCD26-XXXXXX.webp` in their downloads folder, which is what they
 * will go looking for.
 *
 * Takes the whole `drawTicket` result rather than a URL and a hard-coded
 * extension. A file named `.png` that is really a WebP opens fine in a browser
 * and confuses everything else that goes by the name — including, eventually,
 * the person holding it.
 */
export function saveTicket(ticket, code) {
  const anchor = document.createElement("a");
  anchor.href = ticket.url;
  anchor.download = `nic-ticket-${code}.${ticket.ext}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
