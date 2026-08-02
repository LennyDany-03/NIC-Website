"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import CornerTicks from "../CornerTicks";
import FrameCanvas from "../FrameCanvas";
import MemberDialog from "../MemberDialog";
import SceneStill from "../SceneStill";
import Slide, {
  SLIDE_COMPLETE_AT,
  SLIDE_REARM_MARGIN,
  SLIDE_TRIGGER_AT,
} from "../Slide";
import useIsMobile from "../useIsMobile";
import useSlideHandoff from "../useSlideHandoff";
import {
  rowFromLeft,
  rowFromRight,
  seatCard,
  seatRow,
  slideRise,
} from "../motionPresets";
import { GRAIN_PLATE, HEADING_SHADOW, LABEL_SHADOW, PANEL } from "../surfaces";
import { BOARDS, CREW, MASTERMINDS } from "./content";

/**
 * How dark the corridor is allowed to be.
 *
 * Both ends are far lighter than they were. The boards used to be a wall of
 * eighteen cards scrolled past in two screens, and carrying that much small
 * type meant blacking the frames out almost entirely underneath it. Dealt three
 * to a screen there is no wall left to read over — every card is its own opaque
 * plate, the name sits under it on a shadowed line, and the two thirds of the
 * screen between them is corridor that no longer has to be paid for.
 */
const SCRIM_OPEN = 0.3;
const SCRIM_CLOSED = 0.48;
/** 0 as the boards come over the horizon, 1 by the time they are half up. */
const BOARDS_OFFSET = ["start end", "start center"];
/**
 * The runway the archive is pushed in over, measured the way the hero measures
 * its own: 0 when the runway's top touches the bottom of the screen, 1 when it
 * reaches the top — exactly one viewport, whatever the roster above it measures.
 *
 * It has to be an element rather than a fraction of the section for the reason
 * the hero's does: the roster decides this section's height, so a fraction
 * would drift every time a seat is added and the corridor would stop matching
 * the rate the archive rises at.
 */
const RUNWAY_OFFSET = ["start end", "start start"];

/**
 * The corridor, held at the frame where the vanishing point is dead centre —
 * the one composition in the sequence that is as much a portrait shot as a
 * landscape one, and the reason the phone can stand a roster in it.
 */
const PHONE_STILL = "/frames/frames_corridor/frame_0110.webp";

/**
 * The portrait is sized off screen height, not width.
 *
 * A roster slide only advances as one while it fits on one screen, and the
 * portrait is by far the tallest thing on it — so it is the one element that
 * has to answer to the height available rather than take whatever its column
 * gives it. The width is then derived from it at the 4:5 the art is cropped
 * to, which is what lets the grid column be `auto`.
 *
 * Both axes are stated. `aspect-ratio` alone would not do it: with a definite
 * height and `width: auto`, a block box still fills its containing block and
 * the ratio is dropped — which on a phone, where the figure is a full-width
 * grid item rather than an `auto` column, is every phone.
 */
const PORTRAIT_SIZE = {
  // The `vw` term only ever binds on a phone, where the figure is a full-width
  // grid item: 48vh of a tall portrait screen is wider than the column it has
  // to stand in, and a portrait that overflows its own slide is the one thing
  // worse than a small one.
  "--portrait-h": "clamp(13rem, min(48vh, 104vw), 26rem)",
};
const PORTRAIT_BOX = "h-[var(--portrait-h)] w-[calc(var(--portrait-h)*0.8)]";

/**
 * Three seats across, capped by the height of the screen rather than by its
 * width.
 *
 * The row is a slide, so the whole of it — header and three cards — has to
 * stand inside one viewport or the deck quietly stops advancing it and the
 * visitor hand-scrolls through a row that was supposed to arrive in one
 * gesture. Width alone cannot promise that: at `max-w-6xl` a tall card is most
 * of a laptop's height before anything else has been laid out.
 *
 * So the grid is capped by what its own cards would cost vertically, and the
 * arithmetic is the card's own shape. A card is a 4:5 portrait with a caption
 * band under it, so its height is `1.25 w + 6rem`. Allowing one card 62vh gives
 * `w <= 49.6vh - 4.8rem`, and three of those plus two `2rem` gaps is the
 * `148.8vh - 10.4rem` below.
 *
 * 62vh rather than the 48 this was: the name used to hang outside the card on
 * its own line and the role was a hairline stamped over the photo, both of them
 * paid for out of the same budget and neither of them legible. Folding them
 * into a caption inside the card spends that height on type that can actually
 * be read, and there was slack besides — a row at this cap uses about two
 * thirds of a 900px screen once the slide's own padding is counted.
 *
 * Under the cap the cards are as large as the screen can carry; over it, on a
 * wide desktop, `72rem` takes over and they stop growing. On a phone the vh
 * term is far wider than the screen, so the row falls back to being
 * width-driven, which is what a phone wanted anyway.
 */
const SEAT_BAND = "mx-auto w-full max-w-[min(72rem,calc(148.8vh-10.4rem))]";
const SEAT_GRID = `${SEAT_BAND} grid grid-cols-3 items-stretch gap-3 sm:gap-5 lg:gap-8`;

/**
 * The same seats on a phone, where three abreast is 110px of card and a face
 * in it is a thumbnail of a face. Two abreast and the whole board in one grid:
 * paging nine seats into three screens is a deck's idea, and there is no deck
 * here — a scroll is a scroll, so the roster is simply a roster and every card
 * is twice the size it was.
 *
 * Back to three from `sm` up. Two columns of a tablet is a 350px card and a
 * portrait the size of a poster — the count is chosen to keep a face readable,
 * not to fill the width with as few cards as possible.
 */
const PHONE_SEAT_GRID =
  "grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4";

/**
 * Two sizes of title screen, because the two kinds of title are two very
 * different lengths. `THE / MASTERMINDS` is eleven characters at its widest and
 * fills the measure at the larger size; `SENIOR BOARD OF / DIRECTORS` is
 * fifteen, and set that big it would run straight out of the column — headings
 * on these screens are one line each with a hard break, so nothing wraps them
 * back in.
 */
const TITLE_XL = "text-[clamp(2.5rem,min(9.5vw,13vh),6.5rem)]";
const TITLE_LG = "text-[clamp(1.75rem,min(6.5vw,9vh),4rem)]";

function Eyebrow({ children, centered = false }) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red sm:text-xs ${LABEL_SHADOW}`}
    >
      <span aria-hidden className="h-px w-6 bg-nic-red/70" />
      {children}
      {/* Centred type needs the rule on both sides or the line reads as
          hanging off to the right of its own heading. */}
      {centered && <span aria-hidden className="h-px w-6 bg-nic-red/70" />}
    </span>
  );
}

/**
 * A title screen: the name of the section stacked in the middle of the corridor
 * with what it means set underneath it.
 *
 * Centred rather than the spread it used to be. A heading pushed to the left
 * with its paragraph floated off to the right is a layout that wants a subject
 * on one side — and on these two slides there is nothing on either side but the
 * corridor, which is the one thing the copy was sitting on top of instead of
 * beside. Stacked and centred, the vanishing point runs straight up through the
 * middle of the type and the shot finally has something to do with the words.
 */
function TitleSlide({ id, content, className = "", size = TITLE_XL, note }) {
  return (
    <Slide id={id} className={className}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <motion.div variants={slideRise}>
          <Eyebrow centered>{content.eyebrow}</Eyebrow>
        </motion.div>

        <motion.h2
          variants={slideRise}
          className={`mt-7 font-black uppercase leading-[0.85] tracking-tight text-white ${size} ${HEADING_SHADOW}`}
        >
          {content.lead}
          <br />
          <span className="text-nic-red">{content.accent}</span>
        </motion.h2>

        <motion.span
          aria-hidden
          variants={slideRise}
          className="mt-9 block h-px w-16 bg-nic-red"
        />

        {/*
         * Sized off height as well as width, like the headings above it and
         * for the same reason: this is the block that decides whether a title
         * screen still fits a short laptop, and a slide that doesn't fit is one
         * the deck stops advancing.
         */}
        <motion.p
          variants={slideRise}
          className={`mt-9 text-[clamp(0.8125rem,1.7vh,0.9375rem)] leading-relaxed text-zinc-300 sm:leading-[1.85] ${PANEL}`}
        >
          {content.body}
        </motion.p>

        {/* Plated like the running heads below it, for the same reason: this
            line crosses whatever the corridor happens to be doing. */}
        {note && (
          <motion.span
            variants={slideRise}
            className={`mt-7 rounded-full bg-black/55 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-300 sm:text-[11px] sm:backdrop-blur-sm ${LABEL_SHADOW}`}
          >
            {note}
          </motion.span>
        )}
      </div>
    </Slide>
  );
}

/**
 * One mastermind, given the screen the corridor gives its own frames: the
 * portrait hung on the left wall against a light column, and the plate that
 * names it set beside it on the right.
 *
 * The side each half takes is the whole reason this stopped being a grid of
 * three cards. In the corridor behind it the light bars run down the left wall
 * and the hung frames down the right — the shot is built around walking
 * between them, and three portraits abreast read as a staff page pasted over a
 * corridor rather than anything hanging in it. One frame at a time, lit from
 * the left, is what the backdrop was already doing.
 *
 * The art is pre-composed — grain plate, red ticks and the role stamped into
 * the corner are in the 640x640 file, inside a wide transparent surround. The
 * portrait box crops that square, which trims only surround (the subjects all
 * lean right and clear the cut) and takes the baked-in role stamp with it,
 * since the plate on the right now sets the role as live text.
 *
 * Nothing sits on a negative z-index. The pinned canvas above is a stacking
 * context of its own, so anything sent behind the content is sent behind the
 * corridor too, and simply never appears.
 */
function MastermindSlide({ person }) {
  return (
    <Slide id={person.id} className="border-t border-white/10">
      <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
        <motion.figure
          variants={rowFromLeft}
          style={PORTRAIT_SIZE}
          className="group relative mx-auto w-[calc(var(--portrait-h)*0.8)] lg:mx-0"
        >
          {/*
           * The light column. This is the one element lifted straight out of
           * the frames behind it — the corridor's left wall is a run of these,
           * and standing the portrait against one is what welds the two
           * together instead of leaving the card floating over a video.
           */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-5 bottom-6 top-6 w-[3px] rounded-full bg-[linear-gradient(to_bottom,rgba(237,10,20,0),rgba(255,59,59,0.95),rgba(237,10,20,0))] shadow-[0_0_34px_9px_rgba(237,10,20,0.45)] transition-all duration-700 group-hover:shadow-[0_0_40px_12px_rgba(237,10,20,0.6)] sm:-left-8"
          />
          {/* Ember bloom, borrowed from the corridor the frame stands in. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-6 scale-90 opacity-0 blur-3xl transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(237,10,20,0.4) 0%, rgba(237,10,20,0) 70%)",
            }}
          />

          {/*
           * A solid plate, not a tint. The left of the corridor is blown out
           * near-white by the bars, and a portrait laid over that with only a
           * scrim between them washes out completely.
           */}
          <div
            className={`relative overflow-hidden rounded-sm border border-white/15 bg-zinc-950 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.95)] transition-transform duration-700 ease-out group-hover:-translate-y-1.5 ${PORTRAIT_BOX}`}
          >
            {/* Behind the art, not over it — the surround it shows through is
                transparent, and this is the plate that fills it. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-screen"
              style={{ backgroundImage: GRAIN_PLATE }}
            />
            <Image
              src={person.photo}
              alt={`${person.name}, ${person.role}`}
              fill
              sizes="(max-width: 1024px) 80vw, 30vw"
              className="object-cover object-top"
            />
            <CornerTicks />
          </div>

          {/* Where the wall meets the floor. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[6%] -bottom-px h-px bg-linear-to-r from-transparent via-white/45 to-transparent transition-all duration-700 group-hover:via-nic-red"
          />
        </motion.figure>

        <motion.div variants={rowFromRight} className={PANEL}>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red ${LABEL_SHADOW}`}
          >
            {person.index} / {String(MASTERMINDS.people.length).padStart(2, "0")}
          </span>

          <h3 className="mt-5 text-[clamp(1.5rem,min(4vw,5.5vh),2.75rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            {person.name}
          </h3>

          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 sm:text-[11px]">
            {person.role}
          </p>

          <span aria-hidden className="mt-6 block h-px w-12 bg-nic-red" />

          {person.bio && (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.7]">
              {person.bio}
            </p>
          )}
        </motion.div>
      </div>
    </Slide>
  );
}

/**
 * One seat. The plate is built in CSS rather than composed into the art, so a
 * seat with no name yet renders as a numbered slot instead of a hole and the
 * row stays intact while the roster is still being settled.
 *
 * The whole card is a button, unnamed seats included. What it opens is the only
 * place the rest of a person fits — see MemberDialog — and an open seat has an
 * answer of its own worth giving, which is that nobody holds it yet.
 */
function SeatCard({ member, onOpen, standalone = false }) {
  const named = Boolean(member.name);

  /*
   * A card in a row of three is dealt by the slide it belongs to. A card in the
   * phone's roster grid has no row to be dealt by — the grid is taller than the
   * screen — so it watches for itself and arrives as it is scrolled to.
   */
  const reveal = standalone
    ? {
        initial: "hidden",
        whileInView: "shown",
        viewport: { once: true, amount: 0.3 },
      }
    : null;

  return (
    <motion.div
      variants={seatCard}
      {...reveal}
      className="group relative h-full"
    >
      <button
        type="button"
        onClick={() => onOpen(member)}
        aria-haspopup="dialog"
        aria-label={
          named
            ? `${member.name}, ${member.role} — open profile`
            : `${member.role} — seat open`
        }
        className="flex h-full w-full text-left focus-visible:outline-none"
      >
        {/*
         * The lift is the same one the faculty portraits take, with the ember
         * behind it borrowed from the corridor: a card that opens something
         * should come off the wall when it is pointed at.
         */}
        <div
          className={`flex h-full w-full flex-col border transition-all duration-500 ease-out group-focus-within:border-nic-red ${
            named
              ? "border-white/12 bg-zinc-950 group-hover:-translate-y-1.5 group-hover:border-nic-red/70 group-hover:shadow-[0_26px_60px_-24px_rgba(237,10,20,0.55)]"
              : "border-white/8 bg-zinc-950 group-hover:-translate-y-1 group-hover:border-white/25"
          }`}
        >
          {/* ------------------------------------------------------ the print */}
          <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-zinc-900">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 opacity-[0.16] mix-blend-screen"
              style={{ backgroundImage: GRAIN_PLATE }}
            />

            {member.photo ? (
              /*
               * Held slightly off full colour at rest and let all the way up on
               * hover. These are fifteen snapshots taken by fifteen people in
               * fifteen different lights — a stairwell, a hedge, a classroom —
               * and at three to a row the clash between them is the first thing
               * seen. Pulling the saturation back is what makes them read as
               * one set; the hover is what gives the photograph back.
               */
              <Image
                src={member.photo}
                alt=""
                fill
                sizes="(max-width: 640px) 30vw, (max-width: 1024px) 28vw, 22vw"
                className="object-cover object-top saturate-[0.72] transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:saturate-100"
              />
            ) : (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-4xl font-black text-white/[0.06] sm:text-6xl lg:text-7xl"
              >
                {member.index}
              </span>
            )}

            {/* The print does not stop at the plate, it falls into it. No
                z-index: it has to paint over the photograph and under the
                bottom-right tick, which is exactly DOM order between the two. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-linear-to-t from-zinc-950 via-zinc-950/30 to-transparent"
            />

            <CornerTicks />
          </div>

          {/* ---------------------------------------------------- the caption */}
          {/*
           * Underneath the print, not over it. The role used to be an 8px
           * hairline stamped into the top corner of the photograph, held up by
           * nothing but a gradient, and the name hung outside the card on the
           * corridor — so the two things the card exists to say were the two
           * least readable things on the screen.
           *
           * The post is a tag: bold mono, held in a red-tinted well with a
           * solid red edge down its leading side. It went through a solid red
           * block on the way here and that was too much — three of them to a
           * row, over a corridor that is itself red, and the boldest thing on
           * the screen was the job title rather than the person holding it. The
           * tint keeps the weight and the colour and gives back the hierarchy:
           * the name reads first, the post reads immediately after.
           *
           * `flex-1` rather than a fixed height. The grid stretches every card
           * in a row to the tallest, so a long role — "Joint Head of Working
           * Committee" wraps at phone widths — lifts all three captions
           * together and the row stays a row rather than three ragged columns.
           */}
          {/*
           * The type is set for two cards abreast rather than three: the 8px
           * role stamp and 12px name this carried were sized for a third of a
           * phone screen, and read as fine print on half of one.
           */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-1.5 border-t border-white/10 px-3 py-3 sm:gap-2.5 sm:px-4 sm:py-4">
            <span
              className={`w-fit max-w-full border-l-2 py-0.5 pl-1.5 pr-1.5 font-mono text-[9px] font-bold uppercase leading-tight tracking-[0.12em] sm:py-1 sm:pl-2 sm:pr-2.5 sm:text-[10px] sm:tracking-[0.15em] lg:text-[11px] ${
                named
                  ? "border-nic-red bg-nic-red/12 text-[#ff6b6b]"
                  : "border-white/25 bg-white/5 text-zinc-400"
              }`}
            >
              {member.role}
            </span>

            <span
              className={`text-[13px] font-black uppercase leading-[1.15] tracking-[0.01em] sm:text-[16px] lg:text-[19px] ${
                named ? "text-white" : "text-zinc-500"
              }`}
            >
              {named ? member.name : "Seat open"}
            </span>
          </div>

          {/*
           * The affordance, moved to the foot of the card. It used to be a red
           * bar that slid up over the bottom of the photograph, which is now
           * where the caption lives — and a rule that draws itself across the
           * whole width says "this opens" without asking for a line of its own.
           *
           * Drawn on a pointer, standing on a phone. A rule that only appears
           * on hover says nothing at all on a device that cannot hover, and
           * "this card opens" is the one thing a roster of tappable faces has
           * to say — so touch gets it dimmed but permanently.
           */}
          <span
            aria-hidden
            className="h-[2px] w-full bg-nic-red/40 transition-all duration-500 ease-out lg:w-0 lg:bg-nic-red lg:group-hover:w-full lg:group-focus-within:w-full"
          />
        </div>
      </button>
    </motion.div>
  );
}

/**
 * The running head above a row of seats.
 *
 * It used to be two black lozenges floating at either end of the screen, and
 * that was wrong in three ways at once. Nothing else in this section is round —
 * the cards are hard rectangles, the ticks are right angles, the seams are
 * one-pixel rules — so a pill read as borrowed from another page. The two ends
 * had nothing to do with each other, which left the top of the slide as two
 * unrelated blobs over a corridor rather than one instrument. And the type was
 * red on black on a corridor that is itself red, which is the lowest-contrast
 * combination available here.
 *
 * So: one rail, not two plates. A hairline runs the width of the seat band and
 * both readouts hang off it — the slate on the left, the counter on the right —
 * which puts them on a shared axis and lines the whole head up with the grid
 * edges below. The rule is what crosses the blown-out part of the corridor, and
 * a hairline survives that; the type never leaves its own plate.
 *
 * The red edge on the slate is the corridor's own light column, cut down to
 * label size — the same element the faculty portraits are stood against a few
 * screens earlier. It replaces the eyebrow's little dash, which was doing the
 * same job with less to say.
 *
 * Contrast is split rather than turned up: the board name goes white and only
 * the seat range stays red. One accent on the line is legible on red; two are a
 * line that vibrates.
 */
function RowHead({ board, row, index, rows }) {
  const first = row[0].index;
  const last = row[row.length - 1].index;

  return (
    <motion.div
      variants={slideRise}
      // No wrapping. The rule is a flex child that eats all the slack, so the
      // two readouts are pushed apart rather than pushed onto a second line —
      // and a rail that has wrapped is a rail with a plate sitting on it.
      className={`flex items-center gap-4 ${SEAT_BAND}`}
    >
      <div className="flex min-w-0 shrink items-stretch">
        <span
          aria-hidden
          className="w-1 shrink-0 bg-nic-red shadow-[0_0_18px_3px_rgba(237,10,20,0.6)] sm:w-[5px]"
        />
        <span className="flex min-w-0 items-center gap-3 bg-black/80 py-2.5 pl-4 pr-5 sm:gap-4 sm:bg-black/70 sm:py-3 sm:pl-5 sm:pr-6 sm:backdrop-blur-sm">
          <span
            className={`truncate font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white sm:text-[13px] sm:tracking-[0.24em] ${LABEL_SHADOW}`}
          >
            {board.short}
          </span>
          <span aria-hidden className="h-4 w-px shrink-0 bg-white/25" />
          {/*
           * A lighter red than the brand's. #ed0a14 is a heading colour — at
           * label size, on black, over a corridor that is itself red, it goes
           * muddy and this line is the one thing on the slide that has to be
           * read at a glance. The lift is the same red the corridor's own light
           * bars are drawn in, so it is still the section's palette.
           */}
          <span
            className={`shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#ff3b3b] sm:text-[13px] sm:tracking-[0.24em] ${LABEL_SHADOW}`}
          >
            Seats {first}–{last}
          </span>
        </span>
      </div>

      <span
        aria-hidden
        className="h-px min-w-0 flex-1 bg-linear-to-r from-white/30 via-white/12 to-white/30"
      />

      {/* The counter says the same thing the rule's position says, and it is
          the first thing to go when there is no width for it. */}
      <div
        aria-hidden
        className="hidden shrink-0 items-center gap-3.5 bg-black/70 px-5 py-3 sm:flex sm:backdrop-blur-sm"
      >
        <span className="font-mono text-[13px] font-medium tracking-[0.24em]">
          <span className="text-white">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-zinc-600">
            {" / "}
            {String(rows.length).padStart(2, "0")}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          {rows.map((other, position) => (
            <span
              key={other[0].id}
              className={`h-[3px] transition-all duration-500 ${
                position === index
                  ? "w-10 bg-nic-red shadow-[0_0_10px_1px_rgba(237,10,20,0.7)]"
                  : "w-4 bg-white/25"
              }`}
            />
          ))}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * The head of the phone's roster grid.
 *
 * The desktop rail carries a counter and a set of progress ticks because there
 * are three screens of seats to keep your place in. Here there is one grid and
 * you can see where you are in it, so the rail keeps only what it is actually
 * for: which board these faces belong to, and how many of them there are. The
 * slate stacks rather than truncating — "SENIOR BOAR…" was the phone's version
 * of a label that fits on a laptop.
 */
function BoardHead({ board }) {
  return (
    <motion.div variants={slideRise} className="flex items-center gap-4">
      <div className="flex min-w-0 items-stretch">
        <span
          aria-hidden
          className="w-1 shrink-0 bg-nic-red shadow-[0_0_18px_3px_rgba(237,10,20,0.6)]"
        />
        <span className="flex min-w-0 flex-col gap-1 bg-black/80 py-2.5 pl-4 pr-5">
          <span
            className={`font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-white ${LABEL_SHADOW}`}
          >
            {board.short}
          </span>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff3b3b] ${LABEL_SHADOW}`}
          >
            {board.members.length} seats · tap a card
          </span>
        </span>
      </div>

      <span
        aria-hidden
        className="h-px min-w-0 flex-1 bg-linear-to-r from-white/30 via-white/12 to-transparent"
      />
    </motion.div>
  );
}

/**
 * A board, dealt out three seats at a time.
 *
 * Nine cards in one grid was a page of a staff directory: everything arrived at
 * once, nothing was ever the thing being looked at, and the corridor behind it
 * had to be blacked out to carry the type. Three to a screen makes each row a
 * slide of the same deck the faculty are in — one scroll, one row, at a size
 * where the face on the card is actually a face.
 *
 * So a board is four screens: it names itself on one, then deals its nine seats
 * over three. Nothing about it is pinned. A sticky title bar has to stand in
 * the flow at the top of the section, and that costs the first row of each
 * board its alignment — it would land a bar's height lower than the two rows
 * below it, and take a scroll and a half to advance where every other slide in
 * the deck takes one. The running head above each row is part of the sheet
 * being dealt instead: it arrives with its three cards and leaves with them.
 */
function BoardDeck({ board, onOpen, isLast = false, isMobile = false }) {
  const rows = board.rows;

  return (
    <section id={board.id} className="border-t border-white/10">
      {/*
       * The board announces itself before it deals anything. Nine faces are a
       * roster; what makes them a board is the sentence about what the board is
       * for, and that sentence has nowhere to live on a screen already carrying
       * three cards at the largest size the screen can hold.
       */}
      <TitleSlide
        id={`${board.id}-intro`}
        content={board}
        size={TITLE_LG}
        note={`${board.caption} · ${board.members.length} seats`}
      />

      {isMobile ? (
        <Slide id={`${board.id}-roster`} advances={false}>
          <BoardHead board={board} />

          <div className={`mt-7 ${PHONE_SEAT_GRID}`}>
            {board.members.map((member) => (
              <SeatCard
                key={member.id}
                member={member}
                onOpen={onOpen}
                standalone
              />
            ))}
          </div>
        </Slide>
      ) : (
        rows.map((row, index) => (
          <Slide
            key={row[0].id}
            id={`${board.id}-${index + 1}`}
            // The very last row of the very last board has no push of its own:
            // what leaves next is the whole section, corridor included, shoved
            // off by the archive. That handoff is owned below.
            advances={!(isLast && index === rows.length - 1)}
          >
            {/*
             * A running head, not a title. The screen before this one said which
             * board this is at full size, so all these three have to do is hold
             * the thread — which board, which seats, and how much of it is left.
             */}
            <RowHead board={board} row={row} index={index} rows={rows} />

            <motion.div variants={seatRow} className={`mt-8 ${SEAT_GRID}`}>
              {row.map((member) => (
                <SeatCard key={member.id} member={member} onOpen={onOpen} />
              ))}
            </motion.div>
          </Slide>
        ))
      )}
    </section>
  );
}

export default function CrewSequence({ framesRef, ready, autoPush = false }) {
  const sectionRef = useRef(null);
  const boardsRef = useRef(null);
  const runwayRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  /** The seat whose popup is up, or null. One at a time, for the whole page. */
  const [openSeat, setOpenSeat] = useState(null);
  const showSeat = useCallback((member) => setOpenSeat(member), []);
  const closeSeat = useCallback(() => setOpenSeat(null), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Tracking, not smoothing. The smooth-scroll layer already ramps wheel input
  // and a push is a 0.7s eased tween, so the only thing left for a spring to do
  // is follow it faithfully — and the further it lags, the more of the push
  // arrives after the slide has already landed, which reads as the corridor
  // stuttering to catch up at exactly the moment it is most visible. Well
  // overdamped (critical is ~20 here), so it never rings past the mark either.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 460,
    damping: 48,
    mass: 0.22,
    restDelta: 0.0005,
  });
  const playhead = prefersReducedMotion ? scrollYProgress : smoothed;

  // Measured off the boards themselves rather than a fraction of the section,
  // for the same reason the pushes are: the roster decides this section's
  // height, and a fraction would drift every time a seat is filled in.
  const { scrollYProgress: boardsProgress } = useScroll({
    target: boardsRef,
    offset: BOARDS_OFFSET,
  });
  const scrimOpacity = useTransform(
    boardsProgress,
    [0, 1],
    [SCRIM_OPEN, SCRIM_CLOSED],
  );

  // The corridor keeps running as it is shoved off rather than freezing under
  // the archive — the same call the city makes on its way out, for the same
  // reason: a still corridor reads as a section that broke, not one that ended.
  const { scrollYProgress: pushProgress } = useScroll({
    target: runwayRef,
    offset: RUNWAY_OFFSET,
  });
  const exitY = useTransform(pushProgress, [0, 1], ["0%", "-100%"]);

  useSlideHandoff({
    sectionRef,
    progress: pushProgress,
    completeAt: SLIDE_COMPLETE_AT,
    triggerAt: SLIDE_TRIGGER_AT,
    rearmMargin: SLIDE_REARM_MARGIN,
    enabled: autoPush && !isMobile,
  });

  return (
    <section
      ref={sectionRef}
      className="relative z-20 bg-black lg:pull-up-viewport"
    >
      {/* The leading edge, same as the city's — this is the seam of the push. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-linear-to-r from-transparent via-nic-red to-transparent shadow-[0_0_28px_6px_rgba(237,10,20,0.55)]"
      />

      {isMobile ? (
        /*
         * Darker than the other two stills. This one is a corridor lit almost
         * white down its left wall, and it is also the section carrying the
         * most small type on the page — seventeen names, their posts, and two
         * screens of copy. The roster wins.
         */
        <SceneStill
          still={PHONE_STILL}
          opacity={0.4}
          drift={5}
          glow="radial-gradient(80% 50% at 50% 40%, rgba(237,10,20,0.16) 0%, rgba(237,10,20,0) 70%)"
        />
      ) : (
        /* Pinned corridor — a hall of lit frames to hang the crew in. */
        <motion.div
          className="sticky top-0 h-viewport w-full overflow-hidden will-change-transform"
          style={prefersReducedMotion ? undefined : { y: exitY }}
        >
          <FrameCanvas framesRef={framesRef} progress={playhead} ready={ready} />
          {/* Opens for the faculty, closes a little for the boards. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black"
            style={{ opacity: scrimOpacity }}
          />
          {/*
           * Weighted to both walls rather than to the left alone. The corridor is
           * blown out near-white down the left where the bars are and dark down
           * the right where its own frames hang, so the two ends need opposite
           * treatment for opposite reasons: the left has to come down far enough
           * that a portrait can stand against it, the right has to come down far
           * enough to carry a plate of text. The lit vanishing point in the
           * middle is the part worth keeping, and it is the part left alone.
           */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.12)_46%,rgba(0,0,0,0.44)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_38%,rgba(0,0,0,0.45)_100%)]"
          />
        </motion.div>
      )}

      <div className="relative lg:pull-up-viewport">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          {/* ---------------------------------------------- The masterminds */}
          {/*
           * The title stands on its own screen and the faculty get one each
           * behind it. Three portraits abreast under a heading was one slide
           * doing two jobs — it had to crop the cards to fit, and cropping is
           * what turns a deck slide back into something to be scrolled.
           */}
          <TitleSlide id="masterminds" content={MASTERMINDS} />

          {MASTERMINDS.people.map((person) => (
            <MastermindSlide key={person.id} person={person} />
          ))}

          {/* --------------------------------------------------- Meet the crew */}
          <TitleSlide
            id="crew"
            content={CREW}
            className="border-t border-white/10"
          />

          {/* -------------------------------------------------- The two boards */}
          <div ref={boardsRef}>
            {BOARDS.map((board, index) => (
              <BoardDeck
                key={board.id}
                board={board}
                onOpen={showSeat}
                isLast={index === BOARDS.length - 1}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>

        {/*
         * The runway. Exactly one viewport of empty page for the archive to be
         * pushed in over — see RUNWAY_OFFSET for why it is an element rather
         * than a number. Desktop only: nothing is pushed on a phone, so it
         * would be a screen of nothing between two sections.
         */}
        {!isMobile && <div ref={runwayRef} aria-hidden className="h-viewport" />}
      </div>

      {/* Portalled to the body — see MemberDialog for why it cannot live here. */}
      <MemberDialog member={openSeat} onClose={closeSeat} />
    </section>
  );
}
