"use client";

import { useRef } from "react";
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
import Slide from "../Slide";
import { seatCard, seatRow, slideRise } from "../motionPresets";
import { GRAIN_PLATE, HEADING_SHADOW, LABEL_SHADOW, PANEL } from "../surfaces";
import { ARCHIVE, GALLERY, LEDGER } from "./content";

/**
 * The visual archive, hung on a sequence of photographs falling through the
 * air.
 *
 * The backdrop is doing something the other three sequences do not: it is
 * literally the subject. The corridor behind the crew is a place to stand the
 * boards in and the city behind the copy is a mood, but a swarm of tumbling
 * prints behind a wall of tumbling prints is the same object at two scales —
 * so this section leans on it rather than scrimming it down. The scrim opens as
 * the ledger runs, because the ledger is type on a busy plate, and closes again
 * for the cluster, where the tiles are opaque and the backdrop can come back up.
 *
 * The sequence also pulls back to the skyline over its last third, which is why
 * the cluster is dealt last: the section ends standing off the archive rather
 * than inside it, and hands over to the footer from there.
 */
const SCRIM_OPEN = 0.34;
const SCRIM_CLOSED = 0.52;
/** 0 as the ledger comes over the horizon, 1 once it is half way up. */
const LEDGER_OFFSET = ["start end", "start center"];

/** Same two sizes the crew deck uses, for the same reason — see its TITLE_*. */
const TITLE_XL = "text-[clamp(2.5rem,min(9.5vw,13vh),6.5rem)]";
const TITLE_LG = "text-[clamp(1.75rem,min(6.5vw,9vh),4rem)]";

/**
 * The band both records are set in.
 *
 * Capped by height as well as width for the reason every band on this page is:
 * a screen that does not fit is a screen the deck quietly stops advancing. The
 * mosaic is the binding constraint — it is a fixed-height grid, so the cap here
 * only has to keep the ledger's four rows honest on a short laptop.
 */
const BAND = "mx-auto w-full max-w-6xl";

function Eyebrow({ children, centered = false }) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red sm:text-xs ${LABEL_SHADOW}`}
    >
      <span aria-hidden className="h-px w-6 bg-nic-red/70" />
      {children}
      {centered && <span aria-hidden className="h-px w-6 bg-nic-red/70" />}
    </span>
  );
}

/**
 * A title screen, stacked and centred like the crew deck's — the vanishing
 * point of the shot runs up through the middle of the type either way, and two
 * sections built the same way should announce themselves the same way.
 */
function TitleSlide({ id, content, className = "", size = TITLE_XL, note }) {
  return (
    <Slide id={id} className={className}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        {/*
         * Plated, unlike the crew deck's. Small red mono survives the corridor
         * because the corridor is dark everywhere the type is; this backdrop is
         * a swarm of lit prints tumbling straight through the middle of the
         * frame, which is exactly where a centred eyebrow sits. The heading
         * below has the weight to stand on it — this line does not.
         */}
        <motion.div variants={slideRise}>
          <span className="inline-block rounded-full bg-black/60 px-4 py-2 sm:backdrop-blur-sm">
            <Eyebrow centered>{content.eyebrow}</Eyebrow>
          </span>
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

        <motion.p
          variants={slideRise}
          className={`mt-9 text-[clamp(0.8125rem,1.7vh,0.9375rem)] leading-relaxed text-zinc-300 sm:leading-[1.85] ${PANEL}`}
        >
          {content.body}
        </motion.p>

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
 * The running head above a screen of records — the same rail the board rows
 * carry, because it is doing the same job: which record, which slots, and how
 * much of it is left.
 */
function RowHead({ label, range, index, total }) {
  return (
    <motion.div
      variants={slideRise}
      className={`flex items-center gap-4 ${BAND}`}
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
            {label}
          </span>
          <span aria-hidden className="h-4 w-px shrink-0 bg-white/25" />
          <span
            className={`shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#ff3b3b] sm:text-[13px] sm:tracking-[0.24em] ${LABEL_SHADOW}`}
          >
            {range}
          </span>
        </span>
      </div>

      <span
        aria-hidden
        className="h-px min-w-0 flex-1 bg-linear-to-r from-white/30 via-white/12 to-white/30"
      />

      <div
        aria-hidden
        className="hidden shrink-0 items-center gap-3.5 bg-black/70 px-5 py-3 sm:flex sm:backdrop-blur-sm"
      >
        <span className="font-mono text-[13px] font-medium tracking-[0.24em]">
          <span className="text-white">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-zinc-600">
            {" / "}
            {String(total).padStart(2, "0")}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          {Array.from({ length: total }, (_, position) => (
            <span
              key={position}
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
 * One line of the ledger.
 *
 * Built like a filed record rather than a card: a red spine, the slot number,
 * the date set in mono, and the thing itself in white caps. An entry with no
 * title renders as an open slot — the row is still numbered and still ruled, it
 * simply has nothing written on it yet, which is the honest state of a history
 * that has not been collected.
 */
function LedgerRow({ entry }) {
  const filled = Boolean(entry.title);

  return (
    <motion.li variants={seatCard} className="group relative flex items-stretch">
      <span
        aria-hidden
        className={`w-[3px] shrink-0 transition-all duration-500 ${
          filled
            ? "bg-nic-red/50 group-hover:bg-nic-red group-hover:shadow-[0_0_16px_2px_rgba(237,10,20,0.6)]"
            : "bg-white/12"
        }`}
      />

      <div className="flex min-w-0 flex-1 items-baseline gap-3 border border-l-0 border-white/10 bg-zinc-950/85 px-3.5 py-3 transition-colors duration-500 group-hover:border-white/20 sm:gap-6 sm:px-6 sm:py-5 sm:backdrop-blur-sm">
        <span
          aria-hidden
          className={`shrink-0 font-mono text-[11px] tracking-[0.24em] sm:text-[13px] ${
            filled ? "text-zinc-500" : "text-zinc-700"
          }`}
        >
          {entry.index}
        </span>

        <div className="min-w-0 flex-1">
          {/* The date tag, in the same tinted well the roster's roles use. */}
          {entry.year && (
            <span className="mb-2 inline-block border-l-2 border-nic-red bg-nic-red/12 py-0.5 pl-2 pr-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-[#ff6b6b] sm:text-[10px]">
              {entry.year}
            </span>
          )}

          <p
            className={`text-[13px] font-black uppercase leading-[1.2] tracking-[0.01em] sm:text-[17px] ${
              filled ? "text-white" : "text-zinc-600"
            }`}
          >
            {filled ? entry.title : "Entry open"}
          </p>

          <p className="mt-2 text-[12px] leading-relaxed text-zinc-500 sm:text-[13px] sm:leading-[1.7]">
            {filled
              ? entry.note
              : "Nothing filed against this slot yet. It is held open rather than hidden, so the ledger reads as what it is — a record still being written."}
          </p>
        </div>
      </div>
    </motion.li>
  );
}

/**
 * How a screen of tiles is cut up.
 *
 * The grid is four columns by two rows — eight cells — and every one of these
 * spends all eight, whether the screen carries four photographs or one. That is
 * the whole point of tiling it by hand rather than letting the items flow: a
 * roster of photographs never divides evenly, and an auto-flowed mosaic with
 * two tiles on it leaves half a screen of nothing where the other two would
 * have been. Tiled, a short last screen just reads as a different crop of the
 * same wall.
 *
 * Written out as whole class strings because Tailwind reads the source, not the
 * values — a span assembled from parts at runtime produces no CSS.
 */
const CLUSTER_SPANS = {
  1: ["sm:col-span-4 sm:row-span-2"],
  2: ["sm:col-span-2 sm:row-span-2", "sm:col-span-2 sm:row-span-2"],
  3: [
    "sm:col-span-2 sm:row-span-2",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-2 sm:row-span-1",
  ],
  4: [
    "sm:col-span-2 sm:row-span-2",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-1 sm:row-span-1",
    "sm:col-span-1 sm:row-span-1",
  ],
};

/**
 * Which part of a photograph survives the crop.
 *
 * The lead cell is two columns by two rows, which comes out very close to
 * square, and every photograph in the folder is 4:3 or 16:9 — so the sides are
 * always going to be lost, and on a shot where the thing that identifies the
 * event is a projector screen off to one side, losing them costs the picture
 * its subject. `focus` on an item steers what is kept.
 *
 * Whole class names, because Tailwind reads the source rather than the values.
 */
const FOCUS = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
};

/**
 * The same screen on a phone, where four columns would put a face in a 90px
 * box. Two columns: the lead runs full width, the rest sit two abreast, and if
 * that would leave the last tile stranded on its own it runs full width too —
 * an orphaned half-width tile is the one thing that reads as a mistake rather
 * than a layout.
 */
function mobileTile(count, position) {
  const wide = position === 0 || (position === count - 1 && (count - 1) % 2 === 1);
  return wide ? "col-span-2 aspect-16/10" : "col-span-1 aspect-square";
}

/**
 * One tile of the cluster. The lead shot of each screen is the one carrying the
 * event banner, so the screen says what it was before it says what it looked
 * like.
 */
function ClusterTile({ item, count, position }) {
  const filled = Boolean(item.src);
  const lead = position === 0;
  const span = (CLUSTER_SPANS[count] ?? CLUSTER_SPANS[4])[position] ?? "";

  return (
    <motion.figure
      variants={seatCard}
      className={`group relative overflow-hidden border border-white/12 bg-zinc-900 transition-all duration-500 hover:border-nic-red/70 hover:shadow-[0_26px_60px_-24px_rgba(237,10,20,0.55)] sm:aspect-auto sm:h-full ${mobileTile(
        count,
        position,
      )} ${span}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.16] mix-blend-screen"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      {filled ? (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes={
            lead
              ? "(max-width: 640px) 92vw, 46vw"
              : "(max-width: 640px) 46vw, 24vw"
          }
          className={`object-cover saturate-[0.72] transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:saturate-100 ${
            FOCUS[item.focus] ?? FOCUS.center
          }`}
        />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono font-black text-white/[0.06]"
          style={{ fontSize: lead ? "clamp(3rem,7vw,6rem)" : "clamp(1.5rem,3.5vw,3rem)" }}
        >
          {item.index}
        </span>
      )}

      {/* The caption band. Present whether or not there is a caption, because
          it is also what keeps a photograph's foot from going to mush against
          whatever the backdrop is doing behind it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/85 to-transparent"
      />

      <figcaption
        className={`absolute inset-x-0 bottom-0 px-2.5 py-2 font-mono uppercase leading-tight sm:px-3.5 sm:py-3 ${
          lead
            ? "text-[9px] tracking-[0.16em] sm:text-[11px]"
            : "text-[8px] tracking-[0.14em] sm:text-[10px]"
        } ${filled ? "text-white/90" : "text-zinc-600"}`}
      >
        {filled ? item.caption || "Untitled" : "Slot open"}
      </figcaption>

      <CornerTicks />
    </motion.figure>
  );
}

export default function ArchiveSequence({ framesRef, ready }) {
  const sectionRef = useRef(null);
  const ledgerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Tracking rather than smoothing, on the crew deck's settings and for its
  // reasons: the scroll layer already ramps the input, so anything heavier just
  // arrives after the slide has landed.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 460,
    damping: 48,
    mass: 0.22,
    restDelta: 0.0005,
  });
  const playhead = prefersReducedMotion ? scrollYProgress : smoothed;

  const { scrollYProgress: ledgerProgress } = useScroll({
    target: ledgerRef,
    offset: LEDGER_OFFSET,
  });
  const scrimOpacity = useTransform(
    ledgerProgress,
    [0, 1],
    [SCRIM_OPEN, SCRIM_CLOSED],
  );

  return (
    <section ref={sectionRef} className="relative z-30 pull-up-viewport bg-black">
      {/* The leading edge — the seam every section on this page is pushed by. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-linear-to-r from-transparent via-nic-red to-transparent shadow-[0_0_28px_6px_rgba(237,10,20,0.55)]"
      />

      <div className="sticky top-0 h-viewport w-full overflow-hidden">
        <FrameCanvas framesRef={framesRef} progress={playhead} ready={ready} />
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-black"
          style={{ opacity: scrimOpacity }}
        />
        {/* The swarm is densest through the middle of the frame and thins to
            near-black at the edges, so the vignette here only has to finish
            what the shot is already doing. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_34%,rgba(0,0,0,0.55)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),rgba(0,0,0,0))]"
        />
      </div>

      <div className="relative pull-up-viewport">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          {/* ------------------------------------------------- the archive */}
          <TitleSlide id="archive" content={ARCHIVE} note={ARCHIVE.note} />

          {/* ---------------------------------------------------- the ledger */}
          <div ref={ledgerRef}>
            <TitleSlide
              id="ledger"
              content={{
                eyebrow: LEDGER.eyebrow,
                lead: "The",
                accent: "Ledger",
                body: `The written half of the archive: what was run, when it was run, and what came of it. It is deliberately short of adjectives — a ledger's job is to be checkable, and everything here can be checked against a report.`,
              }}
              size={TITLE_LG}
              className="border-t border-white/10"
              note={`${LEDGER.caption} · ${LEDGER.total} entries`}
            />

            {LEDGER.screens.map((screen, index) => (
              <Slide key={screen[0].id} id={`ledger-${index + 1}`}>
                <RowHead
                  label={LEDGER.short}
                  range={`Entries ${screen[0].index}–${screen[screen.length - 1].index}`}
                  index={index}
                  total={LEDGER.screens.length}
                />

                <motion.ul
                  variants={seatRow}
                  className={`mt-8 flex flex-col gap-3 sm:gap-4 ${BAND}`}
                >
                  {screen.map((entry) => (
                    <LedgerRow key={entry.id} entry={entry} />
                  ))}
                </motion.ul>
              </Slide>
            ))}
          </div>

          {/* --------------------------------------------------- the cluster */}
          <TitleSlide
            id="cluster"
            content={{
              eyebrow: GALLERY.eyebrow,
              lead: "The",
              accent: "Cluster",
              body: `The other half, and the half that never makes it into a report: the camera roll. A room the moment before it filled, the whiteboard nobody wiped, and the thirty people who stayed to put the chairs back.`,
            }}
            size={TITLE_LG}
            className="border-t border-white/10"
            note={`${GALLERY.caption} · ${GALLERY.total} frames`}
          />

          {GALLERY.screens.map((screen, index) => {
            const last = index === GALLERY.screens.length - 1;

            return (
              <Slide
                key={screen[0].id}
                id={`cluster-${index + 1}`}
                // The last screen hands over to the footer, which is ordinary
                // page below an ordinary page — nothing to push into.
                advances={!last}
              >
                <RowHead
                  label={GALLERY.short}
                  range={`Frames ${screen[0].index}–${screen[screen.length - 1].index}`}
                  index={index}
                  total={GALLERY.screens.length}
                />

                {/*
                 * Fixed height from `sm` up so the mosaic is guaranteed to
                 * stand inside the slide whatever the screen is: the two rows
                 * split it and every tile stretches to its cell. Below `sm`
                 * the tiles carry their own aspect ratios instead and the grid
                 * grows — a phone has the height to spare and does not take
                 * automatic pushes anyway.
                 */}
                <motion.div
                  variants={seatRow}
                  className={`mt-8 grid grid-cols-2 gap-2 sm:h-[min(58vh,32rem)] sm:grid-cols-4 sm:grid-rows-2 sm:gap-3 lg:gap-4 ${BAND}`}
                >
                  {screen.map((item, position) => (
                    <ClusterTile
                      key={item.id}
                      item={item}
                      count={screen.length}
                      position={position}
                    />
                  ))}
                </motion.div>
              </Slide>
            );
          })}
        </div>
      </div>
    </section>
  );
}
