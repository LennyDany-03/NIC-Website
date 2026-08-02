"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ContactStrip } from "../ContactIcons";
import CornerTicks from "../CornerTicks";
import { GRAIN_PLATE } from "../surfaces";

/**
 * The card in the roster is a face and a title; this is everything else about
 * the person behind it. A board seat gets one screen shared with two others, so
 * there is no room on the card itself for a bio, a year, or a way to reach
 * them — and the deck the cards sit in is the one thing that must not grow a
 * fourth screen every time someone writes a longer paragraph.
 *
 * It renders into `document.body` rather than in place. The crew section is a
 * stacking context of its own (`z-20`, and a pinned canvas inside it), so a
 * dialog rendered inside it can never come out above the navbar no matter what
 * z-index it asks for. A portal is the only way out of that.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Meta({ label, value }) {
  if (!value) return null;

  return (
    <div className="border-t border-white/8 py-3 first:border-t-0 first:pt-0">
      <dt className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-zinc-200">{value}</dd>
    </div>
  );
}

export default function MemberDialog({ member, onClose }) {
  const [mounted, setMounted] = useState(false);
  /*
   * The last member that was actually open, kept so the panel still has
   * something to draw on the way out. Reading `member` alone would blank the
   * whole dialog on the first frame of its own exit animation.
   */
  const [shown, setShown] = useState(member ?? null);
  const panelRef = useRef(null);
  const restoreTo = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();

  const open = Boolean(member);
  const person = member ?? shown;
  const named = Boolean(person?.name);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (member) setShown(member);
  }, [member]);

  /*
   * While the dialog is up the page underneath it holds still. `overflow:
   * hidden` on the body is the same lock the loader and the mobile menu use,
   * and the smooth-scroll layer explicitly stands down when it sees it — so the
   * wheel neither scrubs the corridor nor trips a slide handoff behind the
   * panel. The dialog's own scroller keeps working: it is a nested scroller,
   * which that layer leaves to the browser.
   */
  useEffect(() => {
    if (!open) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    restoreTo.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Tab must not walk out of the panel and into the roster behind it,
      // which is still there, still focusable, and now inert to the eye.
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll(FOCUSABLE);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      // Back to the card they opened, not to the top of the document.
      const trigger = restoreTo.current;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  // The panel itself takes focus, so a screen reader starts at the name rather
  // than at the close button.
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  if (!mounted) return null;

  const backdropMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  };

  const panelMotion = prefersReducedMotion
    ? backdropMotion
    : {
        initial: { opacity: 0, y: 28, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.985 },
        transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
      };

  return createPortal(
    <AnimatePresence>
      {open && person && (
        <motion.div
          key="member-dialog"
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          {...backdropMotion}
        >
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/85 backdrop-blur-md"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden border border-white/15 bg-zinc-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,1)] outline-none sm:max-h-[86svh]"
            {...panelMotion}
          >
            {/* The leading seam, solid rather than a hairline fade — at panel
                width the fade had nothing left in the middle to read as red. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-nic-red shadow-[0_0_20px_3px_rgba(237,10,20,0.5)]"
            />

            {/* 44px on touch, which is the smallest thing a thumb should be
                asked to hit — and on a phone this button is floating over a
                photograph rather than sitting in a margin. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center border border-white/20 bg-black/80 text-zinc-300 backdrop-blur-sm transition-colors hover:border-nic-red hover:bg-nic-red hover:text-white focus-visible:border-nic-red focus-visible:bg-nic-red focus-visible:text-white focus-visible:outline-none sm:right-4 sm:top-4 lg:h-10 lg:w-10"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>

            <div className="overflow-y-auto overscroll-contain">
              {/*
               * Side by side only where there is room for two columns of it.
               * The split used to start at `sm`, which put a portrait and a
               * write-up into 640px — a 260px column of photograph beside a
               * measure of about thirty characters, on every tablet and every
               * phone held sideways. Stacked is the right shape for both.
               */}
              <div className="grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
                {/* ------------------------------------------- the portrait */}
                {/*
                 * On a phone the panel is a sheet, and every pixel the portrait
                 * takes is a line of the write-up pushed under the fold. A face
                 * earns that room; the numbered plate of an unfilled seat does
                 * not, so it gets barely more than a header band.
                 */}
                <figure
                  className={`relative w-full border-b border-white/10 bg-zinc-900 lg:h-auto lg:min-h-[22rem] lg:border-b-0 lg:border-r ${
                    person.photo ? "h-[32svh] sm:h-[36svh]" : "h-[16svh]"
                  }`}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-screen"
                    style={{ backgroundImage: GRAIN_PLATE }}
                  />

                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={`${person.name}, ${person.role}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 320px"
                      // The meanest crop on the site — a portrait photograph
                      // shown as a band across the top of a sheet — so it is
                      // the one that most needs to be told where the face is.
                      className="object-cover"
                      style={{ objectPosition: person.crop }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-7xl font-black text-white/[0.07]"
                    >
                      {person.index}
                    </span>
                  )}

                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent"
                  />
                  <CornerTicks still />
                </figure>

                {/* -------------------------------------------- who they are */}
                {/*
                 * The same three marks the card carries, in the same order and
                 * the same colours — board, name, stamped post — so opening a
                 * card reads as that card getting bigger rather than as a
                 * different object arriving over it.
                 */}
                <div className="relative p-6 sm:p-7 lg:p-8 lg:pr-20">
                  <span className="relative flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
                    <span aria-hidden className="h-px w-5 bg-nic-red/70" />
                    {person.board}
                  </span>

                  <h2
                    id={titleId}
                    className={`relative mt-5 text-[1.75rem] font-black uppercase leading-[0.95] tracking-tight sm:text-4xl ${
                      named ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {named ? person.name : "Seat open"}
                  </h2>

                  {/*
                   * The tag, lifted straight off the card, with the seat number
                   * set beside it rather than tacked onto the role with a
                   * middot. Inside the tag it read as part of the job title;
                   * out here it is what it is — which seat of the board.
                   */}
                  <span className="relative mt-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-block border-l-2 py-1 pl-2 pr-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] sm:text-[11px] ${
                        named
                          ? "border-nic-red bg-nic-red/12 text-[#ff6b6b]"
                          : "border-white/25 bg-white/5 text-zinc-400"
                      }`}
                    >
                      {person.role}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                      Seat {person.index}
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className="relative mt-6 block h-px w-12 bg-nic-red"
                  />

                  <p className="relative mt-6 text-sm leading-relaxed text-zinc-400 sm:leading-[1.75]">
                    {named
                      ? person.bio ||
                        "No write-up for this seat yet — the name is in, the paragraph is still being written."
                      : "No one has been named to this seat yet. It is held open in the roster rather than hidden, so the board reads as what it is — a set of posts, some of them still to be filled."}
                  </p>

                  {(person.year || person.department || person.focus) && (
                    <dl className="relative mt-7 border-t border-white/8 pt-3">
                      <Meta label="Year" value={person.year} />
                      <Meta label="Department" value={person.department} />
                      <Meta label="Focus" value={person.focus} />
                    </dl>
                  )}

                  {/*
                   * Only ever shown for a named seat — an open seat has nobody
                   * to reach, and four dead tiles under "seat open" would be
                   * saying that twice.
                   */}
                  {named && (
                    <div className="relative mt-8 border-t border-white/8 pt-6">
                      <span className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-nic-red">
                        <span aria-hidden className="h-px w-4 bg-nic-red/70" />
                        Contact
                      </span>
                      <div className="mt-4">
                        <ContactStrip links={person.links} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
