"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import BoardTicks from "./BoardTicks";
import CardClock from "./CardClock";
import { CYBER_HEADING, CYBER_LABEL } from "../eventsTheme";
import { seatCard } from "../motionPresets";

/**
 * The two palettes the board draws in, and the only place on this site they
 * appear together.
 *
 * Every other page picks one and commits: the front page is red, `/genesis-26`
 * is gold, the workshop is teal off its poster. A board is different in kind —
 * it is the noticeboard, not the poster, and two events pinned to it should look
 * like two events rather than like one house style applied twice. So a card is
 * trimmed in the colour of the page it leads to, and arriving there is a
 * continuation rather than a change of subject.
 *
 * The page around them stays teal, which is what stops this being a fruit salad:
 * the accents are on a card's edges, label, clock and button — the parts that
 * belong to that event — and everything structural is the segment's own steel.
 *
 * Both buttons are written out here rather than one importing `CYBER_BUTTON`
 * from `eventsTheme`. They are a matched pair and the whole point is that they
 * differ in exactly one thing; a pair where one is an import and the other is a
 * literal is a pair somebody will edit half of.
 */
const ACCENTS = {
  cyber: {
    label: "text-cyber-teal",
    rule: "bg-cyber-teal/70",
    digits: "text-cyber-aqua",
    ticks: "border-cyber-teal/80",
    frame: "border-cyber-steel/60 group-hover:border-cyber-teal/70",
    plate: "from-cyber-magenta/30 via-cyber-abyss to-cyber-teal/20",
    glow: "text-cyber-teal/30",
    button:
      "border-cyber-teal/70 bg-cyber-teal/10 text-cyber-aqua group-hover:bg-cyber-teal group-hover:text-black",
  },
  gold: {
    label: "text-genesis-gold",
    rule: "bg-genesis-gold/70",
    digits: "text-genesis-rich",
    ticks: "border-genesis-gold/80",
    frame: "border-genesis-bronze/70 group-hover:border-genesis-gold/70",
    plate: "from-genesis-bronze/40 via-black to-genesis-gold/15",
    glow: "text-genesis-gold/30",
    button:
      "border-genesis-gold/70 bg-genesis-gold/10 text-genesis-rich group-hover:bg-genesis-gold group-hover:text-black",
  },
};

/**
 * What sits where the artwork goes when there is no artwork.
 *
 * Same aspect ratio as the poster beside it, so a board of two cards has two
 * columns of the same shape whether or not both events have been to the
 * printers. It carries the event's own name set large in the display face —
 * which is what a poster would have led with anyway — over the accent's light.
 *
 * This is the same convention the archive uses for a photograph that has not
 * been filed yet: a plate, honestly empty, rather than a grey box or a gap.
 */
function Plate({ accent, title }) {
  return (
    <div
      className={`relative flex aspect-[1131/1600] items-center justify-center overflow-hidden bg-linear-to-br p-6 text-center ${accent.plate}`}
    >
      <span
        className={`text-[clamp(1.5rem,7vw,2.5rem)] uppercase ${CYBER_HEADING} ${accent.digits}`}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-4 font-cyber-mono text-[9px] uppercase tracking-[0.28em] ${accent.label}`}
      >
        Artwork to come
      </span>
    </div>
  );
}

/**
 * One event on the board.
 *
 * The whole card is clickable, but there is exactly one anchor in it: the
 * button's `after:absolute after:inset-0` stretches its hit area over the card.
 * The obvious alternative — wrapping the card in a link — puts an anchor inside
 * an anchor the moment anything else in it needs to be clickable, which is
 * invalid markup and gets flattened differently by every browser. One anchor
 * also means one thing in the tab order and one thing announced, which is what a
 * card that goes to exactly one place should be.
 *
 * `sizes` is load-bearing on the poster: it is a 1131×1600 JPEG, and without it
 * next/image assumes the image may fill the viewport and serves a phone its
 * widest candidate for a plate that is never more than ~17rem wide on a desktop.
 * Un-prioritised — the first card is near the fold but the clock above it is
 * what the page is for.
 */
export default function EventCard({ event }) {
  const accent = ACCENTS[event.accent] ?? ACCENTS.cyber;

  return (
    <motion.article
      variants={seatCard}
      className={`group relative border bg-black/40 p-4 transition-colors duration-500 sm:bg-cyber-abyss/40 sm:p-6 ${accent.frame}`}
    >
      <BoardTicks className={accent.ticks} />

      <div className="grid gap-6 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10">
        {/* ------------------------------------------------- the artwork */}
        <div className="relative">
          {event.poster ? (
            <Image
              src={event.poster.src}
              alt={event.poster.alt}
              width={event.poster.width}
              height={event.poster.height}
              sizes="(min-width: 1024px) 17rem, (min-width: 640px) 13rem, 88vw"
              className="h-auto w-full"
            />
          ) : (
            <Plate accent={accent} title={event.title} />
          )}
        </div>

        {/* --------------------------------------------------- the facts */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className={`inline-flex items-center gap-3 ${CYBER_LABEL} ${accent.label}`}>
              <span aria-hidden className={`h-px w-6 ${accent.rule}`} />
              {event.kind}
            </span>
            {/* The status is the one line on a card that can be out of date
                while everything above it is right, so it is set apart from the
                register rather than run on from it. */}
            <span className="font-cyber-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              {event.status}
            </span>
          </div>

          <h3
            className={`mt-4 text-[clamp(1.35rem,4.5vw,2.25rem)] uppercase text-white ${CYBER_HEADING}`}
          >
            {/* `lead` is the poster's own small first line — "Workshop on" — and
                is only set where an event has one. Genesis's title is its whole
                name, so it prints alone. */}
            {event.lead && event.lead !== event.title && (
              <span className="block font-cyber-mono text-[0.5em] font-normal uppercase tracking-[0.34em] text-zinc-500">
                {event.lead}
              </span>
            )}
            {event.title}
          </h3>

          <p className="mt-3 font-cyber-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
            {event.dateLabel}
            {event.timeLabel && ` · ${event.timeLabel}`}
          </p>

          <p className="mt-5 max-w-prose text-sm leading-relaxed text-zinc-400 sm:leading-[1.75]">
            {event.body}
          </p>

          {/* `mt-auto` rather than a fixed margin: two cards side by side on a
              wide screen have bodies of different lengths, and this is what puts
              both clocks and both buttons on the same line anyway. */}
          <div className="mt-auto pt-7">
            <CardClock
              startsAtMs={event.startsAtMs}
              startsAtIso={event.startsAtIso}
              title={event.title}
              tone={accent.digits}
            />

            <Link
              href={event.href}
              className={`mt-7 inline-flex items-center gap-3 border px-5 py-3 font-cyber-mono text-[11px] uppercase tracking-[0.24em] transition-all duration-300 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current ${accent.button}`}
            >
              {event.cta}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
