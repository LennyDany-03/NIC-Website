"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Celebration from "./Celebration";
import CyberTicks from "../CyberTicks";
import PosterDialog from "./PosterDialog";
import StepDetails from "./StepDetails";
import StepJoin from "./StepJoin";
import StepPayment from "./StepPayment";
import StepTicket from "./StepTicket";
import { FLOW, SAVE, STEPS } from "./content";
import { useFiling } from "./useFiling";
import { useRegistration } from "./useRegistration";
import { EVENT, POSTER } from "../content";
import {
  CYBER_BUTTON,
  CYBER_HEADING,
  CYBER_LABEL,
  CYBER_LINK,
  GRID_PLATE,
  GRID_SIZE,
  NEON,
  SPECTRUM_RULE,
} from "../../eventsTheme";
import { GRAIN_PLATE } from "../../surfaces";
import { slideBlock, slideRise } from "../../motionPresets";

/**
 * Workshop on Modern Cyber Defence — registration.
 *
 * The event's only page, and it is a form, on purpose: almost everybody
 * arriving here has come off the QR code on a printed poster they are already
 * holding, which means they have read the sessions, the speaker and the date
 * before they ever load this. A masthead that showed it all to them again would
 * be answering a question they came here having answered. So there is no clock,
 * no wordmark run at poster size — the header states what this page is and who
 * it is for in four lines and gets out of the way. What it does keep is a
 * thumbnail of the poster itself, small and off to the side: not the full
 * masthead the old hero gave it, but still the cheapest way for somebody
 * holding a printed copy to confirm they are on the right page, and a tap
 * opens it full size in a dialog rather than a new tab — see `PosterDialog`.
 *
 * The column is narrow — `max-w-2xl` at every width, not just on a phone — and
 * that is the mobile decision showing up on the desktop layout too rather than
 * the other way round. A four-step form read at 1440px in a column sized for it
 * is a form that looks like it was designed for the size it is actually filled
 * in at, which for this page is a phone held in one hand.
 *
 * Four steps, one at a time, in one client component tree. Not four routes: a
 * half-filled form must not be destroyed by a Back button, and a URL that lands
 * somebody on step 3 with nothing in state is a URL that will be shared.
 *
 * The colour is the poster's and stops at the edges of the event — the navbar
 * and footer arrive in NIC red exactly as they do everywhere else, so this reads
 * as a poster hung in a building rather than as a different building. The type
 * is the poster's too, loaded by the segment's layout in `app/events/layout.jsx`.
 *
 * The registration itself is filed on the way out of step 2, not on the way
 * into step 4 — see the note at the top of `useFiling.js`, which is the reason
 * `advance` below is asynchronous and the reason it can refuse to move. Steps 3
 * and 4 are then, in the strict sense, a receipt: by the time either of them is
 * on screen the row is written and there is nothing left that can fail.
 */
export default function WorkshopRegistration() {
  const [index, setIndex] = useState(0);
  const [posterOpen, setPosterOpen] = useState(false);
  const registration = useRegistration();
  const { check, issueTicket } = registration;
  const filing = useFiling();

  /* Which curtain is up, or null. Set at the same moment the step changes, so
     the swap happens behind it — see `Celebration`. */
  const [celebration, setCelebration] = useState(null);

  const flowRef = useRef(null);
  const headingRef = useRef(null);

  /* The step the effect below has already reacted to. Compared rather than a
     "have I mounted" flag, because React invokes effects twice on mount in
     development — a flag would be spent by the first invocation and the second
     would scroll a visitor who has not touched anything. Two equal indices are
     nothing happening, whichever invocation is asking. */
  const settled = useRef(index);

  const step = STEPS[index];
  const last = STEPS.length - 1;

  /**
   * Move to a step, and put the reader where the step is.
   *
   * Both halves are needed and they are different mechanisms. The scroll is
   * because the panel is a screen further down than the header and a step
   * change otherwise swaps the content out from under somebody looking at the
   * wrong part of the page. The focus move is because a keyboard or
   * screen-reader user has just pressed a button that vanished, and focus
   * falling back to `<body>` would drop them at the top of the document with no
   * announcement that anything happened.
   *
   * `behavior: "auto"`, not smooth: `smoothScroll` is mounted on this route and
   * owns the page's inertia. Asking the browser to animate a scroll at the same
   * time gives two things a claim on the same position, and the visible result
   * is a fight. The `overflow` check is the site-wide "the page is locked"
   * signal — if the mobile sheet or a dialog has the page, nothing else may
   * scroll it.
   */
  const goTo = useCallback((next) => setIndex(next), []);

  useEffect(() => {
    /* Nothing to catch up with on first paint, and yanking a visitor past the
       header before they have read it is the page deciding it knows better than
       the link they followed. */
    if (settled.current === index) return;
    settled.current = index;

    const node = flowRef.current;
    if (!node) return;

    if (document.body.style.overflow !== "hidden") {
      const top = node.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: "auto" });
    }

    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  /**
   * Move on, and play the curtain over the change.
   *
   * Both in one call and in this order, because the point of the curtain is
   * that the step underneath swaps while it is covered. React batches the two
   * into one render, so there is no frame in which the old step is visible
   * behind a raised curtain.
   */
  const reveal = useCallback(
    (kind) => {
      setCelebration(kind);
      setIndex((current) => Math.min(current + 1, STEPS.length - 1));
    },
    [],
  );

  const endCelebration = useCallback(() => setCelebration(null), []);

  /**
   * The forward button.
   *
   * Asynchronous because one of the four steps now does real work when it is
   * left: step 2 files the whole registration and waits to hear back, and what
   * it hears decides whether the flow moves at all. The other three are the
   * same synchronous "validate, then go" they always were, and fall through to
   * the bottom of this function.
   */
  async function advance() {
    /* A second press while the first is still in the air. The button is
       disabled during a filing, so this is the keyboard and the double-tap
       rather than a click — and a second run would cut no new code but would
       spend a second attempt against the register-number limit. */
    if (filing.state === "filing") return;

    /* Steps 3 and 4 ask for nothing, so `check` has nothing to say about them
       and returns null — the guard is on there being a bad field, not on the
       step having a validator. */
    const bad = check(step.id);

    if (bad) {
      document.getElementById(bad)?.focus();
      return;
    }

    if (step.id === "payment") {
      /* Already filed, and this is somebody who went back to look at their
         screenshot and came forward again. The row exists; filing it a second
         time would fail on the unique ticket code and turn a working
         registration into an error message. */
      if (filing.state === "filed") {
        reveal("filed");
        return;
      }

      /* Cut here rather than on the way into the last step, because the code is
         now what the row is filed under and the row is written before either of
         the remaining steps is reached. Idempotent, and it returns the code
         rather than only setting it — the filing needs it in this same tick. */
      const code = issueTicket();

      const result = await filing.file({
        /* Any element inside the `/events` layout. `drawTicket` reads the font
           custom properties off it and nothing else — see `familiesFrom` in
           ticketCanvas.js. */
        anchor: flowRef.current,
        code,
        values: registration.values,
        streamLabel: registration.streamLabel,
        collegeLabel: registration.collegeLabel,
        proof: registration.proof,
      });

      /* Refused or broken. Stay exactly where we are, with every field still
         filled in — `FilingNotice` below is now saying which of the two it was
         and what to do about it. */
      if (!result.ok) return;

      reveal("filed");
      return;
    }

    if (step.id === "group") {
      reveal("ticket");
      return;
    }

    goTo(Math.min(index + 1, last));
  }

  return (
    <main className="relative overflow-hidden bg-cyber-void font-cyber-body text-white">
      {/*
       * The poster's light, stronger than any other wash on this site wears it.
       *
       * Every other screen this palette appears on has a hero's worth of room to
       * let a soft version of it breathe; this page has four lines of header and
       * then a form, so the light has to do more of the page's talking in less
       * of its space. Four pools rather than three — magenta top left, teal top
       * right, amber where they'd meet, and a second teal low on the left — is
       * what keeps the colour reaching all the way down to the step rail once
       * the hero above it stopped being tall enough to cast it there itself.
       *
       * `inset-0` rather than a fixed `vh`: this page is shorter than the one it
       * replaced, and a wash sized for a hero that no longer exists would leave
       * the panel sitting on plain black.
       */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 6% 0%, rgba(200,31,110,0.46) 0%, rgba(200,31,110,0) 58%), radial-gradient(ellipse 70% 60% at 96% 10%, rgba(43,183,189,0.38) 0%, rgba(43,183,189,0) 62%), radial-gradient(ellipse 55% 45% at 48% 30%, rgba(242,178,60,0.24) 0%, rgba(242,178,60,0) 66%), radial-gradient(ellipse 65% 50% at 14% 92%, rgba(43,183,189,0.26) 0%, rgba(43,183,189,0) 60%)",
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: GRID_PLATE,
          backgroundSize: GRID_SIZE,
          maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      {/* ----------------------------------------------------------- the header */}
      {/*
       * What this is, the date, and why it takes four steps — plus, off to the
       * side rather than woven through the sentence, the poster itself. No
       * countdown: a clock is a reason to keep this tab open and watch it, and
       * the right amount of time to spend on this page is the two minutes the
       * form actually takes.
       *
       * Two columns from `sm`, because that is the first width with anything
       * to spare beside a centred paragraph — below it the poster drops under
       * the text instead, in the same order a printed copy would be read: what
       * this is, then the picture confirming it.
       */}
      <motion.section
        className="relative mx-auto w-full max-w-3xl px-4 pb-8 pt-[clamp(5rem,13vh,6.5rem)] sm:px-8 sm:pb-10"
        variants={slideBlock}
        initial="hidden"
        animate="shown"
      >
        <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <motion.span variants={slideRise} className={CYBER_LABEL}>
              {EVENT.lead} {EVENT.title}
            </motion.span>

            <motion.h1
              variants={slideRise}
              className={`mt-4 text-[clamp(2.5rem,13vw,3.5rem)] uppercase ${CYBER_HEADING} ${NEON}`}
            >
              {FLOW.headline}
            </motion.h1>

            <motion.p
              variants={slideRise}
              className="mt-3 font-cyber-mono text-[11px] uppercase tracking-[0.26em] text-cyber-aqua"
            >
              {EVENT.dateLabel} · {EVENT.timeLabel}
            </motion.p>

            <motion.p
              variants={slideRise}
              className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-zinc-400 sm:mx-0"
            >
              {FLOW.lede}
            </motion.p>
          </div>

          {/*
           * The poster, and a button rather than a link: it opens
           * `PosterDialog` in place instead of navigating anywhere, so a tap
           * here never costs somebody the form they are about to fill in.
           *
           * It is sized per layout rather than at one size, because the two
           * layouts ask it to do different jobs. Beside the headline from `sm`
           * up it is a supporting detail and stays small — a second headline
           * next to the first helps nobody. Below the text on a phone it is a
           * block of its own with the full column to itself, and the old 112px
           * there was not a small poster so much as an unreadable one: this
           * artwork is dense with times, a venue and two phone numbers, and at
           * that width none of it resolves. Somebody arriving from the printed
           * copy needs to recognise the thing they are holding, so on a phone
           * it gets the width to be recognised at.
           */}
          <motion.button
            type="button"
            variants={slideRise}
            onClick={() => setPosterOpen(true)}
            className="group flex shrink-0 flex-col items-center gap-2.5"
          >
            <span className="relative block w-52 border border-cyber-steel/60 p-1.5 transition-colors group-hover:border-cyber-teal/70 group-focus-visible:border-cyber-teal sm:w-32 lg:w-36">
              <Image
                src={POSTER.src}
                width={POSTER.width}
                height={POSTER.height}
                alt={POSTER.alt}
                /* Tells the optimiser what it is actually painting. Without it
                   `next/image` assumes the full viewport and fetches a 640px
                   render for a 208px slot on the layout least able to afford
                   it. */
                sizes="(min-width: 1024px) 144px, (min-width: 640px) 128px, 208px"
                className="h-auto w-full"
                priority
              />
              <CyberTicks still />
            </span>

            {/* Brighter and a size up from the 9px zinc-500 it was. On a phone
                this is the only thing saying the poster opens, and a caption
                nobody can read is a caption that makes it look like a picture
                rather than a control. */}
            <span className="font-cyber-mono text-[10px] uppercase tracking-[0.24em] text-cyber-teal transition-colors group-hover:text-cyber-aqua sm:text-[9px] sm:text-zinc-500">
              Tap to view full poster
            </span>
          </motion.button>
        </div>
      </motion.section>

      <PosterDialog
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        poster={POSTER}
      />

      {/* ------------------------------------------------------------ the flow */}
      <section ref={flowRef} className="relative px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto w-full max-w-2xl">
          <StepRail index={index} />

          {/* ------------------------------------------------------- the panel */}
          <div className="relative mt-6 border border-cyber-steel/70 bg-cyber-abyss/60 p-5 sm:mt-8 sm:p-10">
            <CyberTicks still />
            <span aria-hidden className={`absolute inset-x-0 top-0 h-0.5 ${SPECTRUM_RULE}`} />

            {/*
             * Re-keyed on the step, which is what makes each one animate in
             * rather than the panel's contents blinking. There is no exit
             * animation to match it: a step that fades out while the next one
             * fades in has to hold both at once, and two panels of different
             * heights overlapping is a page that jumps at exactly the moment
             * somebody is reaching for a field.
             */}
            <motion.div
              key={step.id}
              variants={slideBlock}
              initial="hidden"
              animate="shown"
            >
              <motion.h2
                ref={headingRef}
                tabIndex={-1}
                variants={slideRise}
                className={`text-xl uppercase text-white outline-none sm:text-2xl ${CYBER_HEADING}`}
              >
                {step.headline}
              </motion.h2>

              <motion.p
                variants={slideRise}
                className="mt-4 text-sm leading-relaxed text-zinc-400"
              >
                {step.lede}
              </motion.p>

              <div className="mt-8 sm:mt-9">
                {step.id === "details" ? (
                  <StepDetails {...registration} />
                ) : step.id === "payment" ? (
                  <StepPayment {...registration} />
                ) : step.id === "group" ? (
                  <StepJoin />
                ) : (
                  <StepTicket
                    code={registration.ticketCode}
                    values={registration.values}
                    streamLabel={registration.streamLabel}
                    qr={filing.qr}
                    ticketImage={filing.ticketImage}
                    missing={filing.missing}
                  />
                )}
              </div>

              {/* ------------------------------------------------ the controls */}
              {step.next ? (
                <motion.div variants={slideRise} className="mt-9 sm:mt-10">
                  <FilingNotice
                    state={filing.state}
                    scope={filing.scope}
                    blockedUntil={filing.blockedUntil}
                    detail={filing.detail}
                  />

                  <div className="flex flex-col-reverse gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
                    {/*
                     * Enabled whatever state the form is in, and it explains
                     * itself when pressed. A Next button that greys out until
                     * every field is right is a button that tells somebody they
                     * are stuck without telling them where — and on a form with
                     * a dropdown that reveals a seventh field, "where" is not
                     * obvious.
                     *
                     * The one exception is the second and a half it is actually
                     * doing something: a filing in flight is the single state
                     * where a second press has a cost, since the row would be
                     * refused and the attempt still counted against the
                     * register number's budget. So it greys out only there, and
                     * it says what it is doing while it does.
                     *
                     * Full width on a phone: a control this important should be
                     * the widest, easiest thing to hit on the screen it is
                     * filled in on, not a button sized for a mouse.
                     */}
                    <button
                      type="button"
                      onClick={advance}
                      disabled={filing.state === "filing"}
                      aria-busy={filing.state === "filing"}
                      className={`${CYBER_BUTTON} w-full justify-center disabled:cursor-wait disabled:border-cyber-steel/50 disabled:bg-transparent disabled:text-zinc-500 disabled:hover:bg-transparent disabled:hover:text-zinc-500 sm:w-auto`}
                    >
                      {filing.state === "filing" ? SAVE.working : step.next}
                      <span
                        aria-hidden
                        className={
                          filing.state === "filing"
                            ? "h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                            : "transition-transform duration-300 group-hover:translate-x-1"
                        }
                      >
                        {filing.state === "filing" ? null : "→"}
                      </span>
                    </button>

                    {/*
                     * Back disappears the moment the row is filed, which is the
                     * only honest thing for it to do. Everything behind it is
                     * now a copy of something the club already has: a student
                     * who went back, changed their section and came forward
                     * again would be editing a form that no longer writes
                     * anywhere, and the page would have quietly agreed with
                     * them. The step they land on instead has both
                     * coordinators' numbers on it, which is what actually fixes
                     * a wrong field at this point.
                     */}
                    {index > 0 && filing.state !== "filed" ? (
                      <button
                        type="button"
                        onClick={() => goTo(index - 1)}
                        className={`${CYBER_LINK} justify-center sm:justify-start`}
                      >
                        <span
                          aria-hidden
                          className="transition-transform duration-300 group-hover:-translate-x-1"
                        >
                          ←
                        </span>
                        Back
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>

      <Celebration
        kind={celebration}
        code={registration.ticketCode}
        onDone={endCelebration}
      />
    </main>
  );
}

/**
 * Why the flow did not move.
 *
 * Only ever seen on the payment step, and only in the two states that keep
 * somebody there: the limit refused this attempt, or the row did not save. Both
 * are rendered above the button that caused them rather than below it, because
 * the button is at the bottom of a long panel on a phone and a message under it
 * is a message under the fold.
 *
 * `role="alert"` here, unlike the polite region under the ticket. This one is
 * an interruption by definition — somebody pressed a button expecting to move
 * on and did not — and it is the one thing on the screen they need told
 * without waiting for a natural pause.
 */
function FilingNotice({ state, scope, blockedUntil, detail }) {
  /* Re-rendered once a second while a block is counting down, and not at all
     otherwise. `Date.now()` in a render is a value that goes stale silently, so
     the ticking is explicit: a clock that reads "try again in 3 minutes" for
     four minutes is worse than no clock. */
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state !== "blocked") return undefined;

    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state, blockedUntil]);

  if (state !== "blocked" && state !== "error") return null;

  const blocked = state === "blocked";
  const remaining = blocked ? Math.max(0, blockedUntil - now) : 0;

  return (
    <div
      role="alert"
      className={`mb-7 border-l-2 pl-4 ${
        blocked
          ? "border-cyber-amber/70 text-cyber-amber"
          : "border-cyber-rose/70 text-cyber-rose"
      }`}
    >
      <p className="text-xs leading-relaxed">
        {blocked ? (SAVE.blocked[scope] ?? SAVE.blocked.unknown) : SAVE.failed}
      </p>

      {blocked ? (
        <p className="mt-2 font-cyber-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          {remaining > 0 ? `Try again in ${countdown(remaining)}` : "You can try again now"}
        </p>
      ) : null}

      {/*
       * The raw message from the route, in development only. It is the fastest
       * way to tell "the SQL file has not been run against this project" apart
       * from "the key is wrong" while this is being built, and it is exactly
       * the string a student should never be shown — see the note on `SAVE`.
       */}
      {detail && process.env.NODE_ENV !== "production" ? (
        <p className="mt-2 font-cyber-mono text-[10px] leading-relaxed text-zinc-600">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A wait, in the units somebody actually thinks in.
 *
 * Rounded *up*, always. A countdown that rounds down says "1 minute" for the
 * last ninety seconds of a wait and then refuses the attempt it invited, which
 * costs somebody a retry against the very limit they are waiting out.
 */
function countdown(ms) {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

/**
 * Where you are in the four.
 *
 * An `<ol>` rather than a row of divs, because that is what it is, and the
 * current step carries `aria-current="step"` so it is announced as a position
 * rather than as four unrelated words. The bar under it is the poster's spectrum
 * clipped to the fraction completed — the same sweep the panel's top edge wears,
 * used here to measure something.
 *
 * The labels are hidden below `sm` and replaced by a count. Four tracked-out mono
 * words do not fit across 390px without setting them at a size nobody can read,
 * and "Step 2 of 4" is the whole of what they were saying anyway.
 *
 * Below `sm` the whole thing is `sticky`, pinned under the navbar. This is a
 * four-screen form on the size it is actually filled in at, and scrolling a
 * screen down into "Payment" with no reminder of which of the four you are on
 * is how somebody ends up unsure whether pressing Back loses what they typed.
 * The `-mx-4` cancels this section's own side padding so the bar runs edge to
 * edge like the navbar above it, rather than floating as an inset card; `sm:`
 * reverts every one of those properties, because a wider screen shows all four
 * step labels at once and has no need to be told which one is current.
 */
function StepRail({ index }) {
  return (
    <div className="sticky top-16 z-40 -mx-4 border-b border-cyber-steel/50 bg-cyber-void/92 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
      <ol className="hidden items-center justify-between gap-4 sm:flex">
        {STEPS.map((step, i) => (
          <li
            key={step.id}
            aria-current={i === index ? "step" : undefined}
            className={`font-cyber-mono text-[10px] uppercase tracking-[0.24em] transition-colors duration-500 ${
              i === index
                ? "text-white"
                : i < index
                  ? "text-cyber-aqua"
                  : "text-zinc-600"
            }`}
          >
            <span aria-hidden className="mr-2 text-cyber-teal">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step.label}
          </li>
        ))}
      </ol>

      <p className="font-cyber-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400 sm:hidden">
        <span className="text-cyber-teal">
          {String(index + 1).padStart(2, "0")}
        </span>{" "}
        {STEPS[index].label} — step {index + 1} of {STEPS.length}
      </p>

      <div className="mt-3 h-px w-full bg-cyber-steel/40 sm:mt-4">
        <div
          className={`h-px transition-[width] duration-700 ease-out ${SPECTRUM_RULE}`}
          style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
