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
import Slide from "../Slide";
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
  "--portrait-h": "clamp(15rem, 48vh, 26rem)",
};
const PORTRAIT_BOX = "h-[var(--portrait-h)] w-[calc(var(--portrait-h)*0.8)]";

/**
 * Three seats across, capped by the height of the screen rather than by its
 * width.
 *
 * The row is a slide, so the whole of it — header, three cards, three names —
 * has to stand inside one viewport or the deck quietly stops advancing it and
 * the visitor hand-scrolls through a row that was supposed to arrive in one
 * gesture. Width alone cannot promise that: at `max-w-6xl` a 3:4 card is 384px
 * tall on every screen, which is most of a laptop's height before anything else
 * has been laid out.
 *
 * So the grid is capped by what its own cards would cost vertically. Three
 * cards at 3:4 come to `2.25 x` the height allowed for one, plus the two gaps —
 * hence `108vh + 4rem` for a card that may take at most 48vh. Under that the
 * cards are as large as the screen can carry; over it, on a wide desktop,
 * `72rem` takes over and they stop growing. On a phone `108vh` is far wider
 * than the screen, so the row falls back to being width-driven, which is what
 * a phone wanted anyway.
 */
const SEAT_BAND = "mx-auto w-full max-w-[min(72rem,calc(108vh+4rem))]";
const SEAT_GRID = `${SEAT_BAND} grid grid-cols-3 gap-3 sm:gap-5 lg:gap-8`;

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
function SeatCard({ member, onOpen }) {
  const named = Boolean(member.name);

  return (
    <motion.div variants={seatCard} className="group relative">
      <button
        type="button"
        onClick={() => onOpen(member)}
        aria-haspopup="dialog"
        aria-label={
          named
            ? `${member.name}, ${member.role} — open profile`
            : `${member.role} — seat open`
        }
        className="block w-full text-left focus-visible:outline-none"
      >
        <div
          className={`relative aspect-3/4 overflow-hidden border transition-colors duration-500 group-focus-within:border-nic-red ${
            named
              ? "border-white/12 bg-zinc-900 group-hover:border-nic-red/60"
              : "border-white/8 bg-zinc-950 group-hover:border-white/25"
          }`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-screen"
            style={{ backgroundImage: GRAIN_PLATE }}
          />

          {member.photo ? (
            <Image
              src={member.photo}
              alt=""
              fill
              sizes="(max-width: 640px) 30vw, (max-width: 1024px) 28vw, 22vw"
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-4xl font-black text-white/[0.06] sm:text-6xl lg:text-7xl"
            >
              {member.index}
            </span>
          )}

          {/* Keeps the role legible over a photo as easily as over the plate. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/80 to-transparent"
          />
          <span className="absolute left-2 top-2 max-w-[86%] font-mono text-[8px] uppercase leading-tight tracking-[0.16em] text-white/90 sm:left-3 sm:top-3 sm:text-[10px]">
            {member.role}
          </span>

          {/*
           * The affordance. A card that opens something has to say so, and it
           * has to say it without taking a line of the plate away from the role
           * — so it lives in the bottom edge and only exists on hover.
           */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-nic-red/90 py-1.5 text-center font-mono text-[8px] uppercase tracking-[0.24em] text-white transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0 sm:text-[9px]"
          >
            {named ? "View" : "Details"}
          </span>

          <CornerTicks />
        </div>

        <div className="mt-2 sm:mt-3">
          <span
            className={`block text-[11px] font-black uppercase leading-tight tracking-[0.04em] drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)] sm:text-sm lg:text-base ${
              named ? "text-white" : "text-zinc-500"
            }`}
          >
            {named ? member.name : "Seat open"}
          </span>
          <span
            aria-hidden
            className="mt-2 block h-px w-6 bg-nic-red/70 transition-all duration-500 group-hover:w-14 sm:w-8"
          />
        </div>
      </button>
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
function BoardDeck({ board, onOpen }) {
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

      {rows.map((row, index) => (
        <Slide key={row[0].id} id={`${board.id}-${index + 1}`}>
          {/*
           * A running head, not a title. The screen before this one said which
           * board this is at full size, so all these three have to do is hold
           * the thread — which board, which seats, and how much of it is left.
           */}
          {/*
           * Both ends sit on a plate of their own. This line runs across the
           * top third of the screen, which is where the corridor's left wall is
           * blown out near-white by the light bars — and small red mono type
           * with nothing behind it is the one thing on the page that cannot
           * survive that. Legibility is bought locally here, the same way the
           * body copy buys it with PANEL.
           */}
          <motion.div
            variants={slideRise}
            className={`flex flex-wrap items-center justify-between gap-x-8 gap-y-3 ${SEAT_BAND}`}
          >
            <span className="rounded-full bg-black/55 px-4 py-2 sm:backdrop-blur-sm">
              <Eyebrow>
                {board.short} · Seats {row[0].index}–{row[row.length - 1].index}
              </Eyebrow>
            </span>

            <div
              aria-hidden
              className="hidden items-center gap-3 rounded-full bg-black/55 px-4 py-2 sm:flex sm:backdrop-blur-sm"
            >
              <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-400">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(rows.length).padStart(2, "0")}
              </span>
              <span className="flex items-center gap-1.5">
                {rows.map((other, position) => (
                  <span
                    key={other[0].id}
                    className={`h-[3px] ${
                      position === index ? "w-8 bg-nic-red" : "w-5 bg-white/25"
                    }`}
                  />
                ))}
              </span>
            </div>
          </motion.div>

          <motion.div variants={seatRow} className={`mt-8 ${SEAT_GRID}`}>
            {row.map((member) => (
              <SeatCard key={member.id} member={member} onOpen={onOpen} />
            ))}
          </motion.div>
        </Slide>
      ))}
    </section>
  );
}

export default function CrewSequence({ framesRef, ready }) {
  const sectionRef = useRef(null);
  const boardsRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

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

  return (
    <section
      ref={sectionRef}
      className="relative z-20 pull-up-viewport bg-black"
    >
      {/* The leading edge, same as the city's — this is the seam of the push. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-linear-to-r from-transparent via-nic-red to-transparent shadow-[0_0_28px_6px_rgba(237,10,20,0.55)]"
      />

      {/* Pinned corridor — a hall of lit frames to hang the crew in. */}
      <div className="sticky top-0 h-viewport w-full overflow-hidden">
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
      </div>

      <div className="relative pull-up-viewport">
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
            {BOARDS.map((board) => (
              <BoardDeck key={board.id} board={board} onOpen={showSeat} />
            ))}
          </div>
        </div>
      </div>

      {/* Portalled to the body — see MemberDialog for why it cannot live here. */}
      <MemberDialog member={openSeat} onClose={closeSeat} />
    </section>
  );
}
