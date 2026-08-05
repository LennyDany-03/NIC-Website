"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Countdown from "./Countdown";
import CyberTicks from "./CyberTicks";
import { StudentTiles } from "./Coordinators";
import {
  CYBER_BUTTON,
  CYBER_HEADING,
  CYBER_LABEL,
  CYBER_LINK,
  GRID_PLATE,
  GRID_SIZE,
  NEON,
  SOFT_RULE,
  SPECTRUM_RULE,
} from "../eventsTheme";
import { EVENT, REGISTRATION, REGISTRATION_FIELDS } from "./content";
import { GRAIN_PLATE } from "../surfaces";
import { WORKSHOP_HREF } from "../siteLinks";
import { seatRow, slideBlock, slideRise, slideViewport } from "../motionPresets";

/**
 * Registration — the page sign-ups will open on.
 *
 * The hard question here was what a registration page should be while
 * registration is shut. Three answers were available and two of them are bad: a
 * page that only says "coming soon" wastes the trip, and a live-looking form
 * that quietly discards what is typed into it is a lie told to somebody who was
 * trying to give you their phone number.
 *
 * So this is the third: the real form, rendered in full and plainly switched
 * off. Every field that will be asked for is on screen and disabled, which turns
 * the visit into something useful — a visitor learns they will need their
 * register number before they are standing in front of a form demanding it — and
 * makes the closed state impossible to misread. The clock above it is the same
 * clock as on the event page, because the thing they actually came to find out
 * is how long they have.
 *
 * The day sign-ups open, exactly one thing changes: `REGISTRATION.formHref` in
 * `content.js` gets a URL, and this page turns itself into a live handoff. If
 * the form ends up being handled in-house instead, the fieldset below loses its
 * `disabled` and gains a submit handler — the markup is already the markup.
 */

/**
 * One field of the form that is not open.
 *
 * A real `<label>` bound to a real `<input>`, not a styled div: the point of a
 * preview is that it is the thing itself, and an input that has been faked with
 * a bordered box is one that will have to be built twice. `disabled` on the
 * surrounding fieldset does the switching off — per-field `disabled` attributes
 * would be six things to remember to remove instead of one.
 */
function Field({ field }) {
  return (
    <motion.div variants={slideRise} className="flex flex-col gap-2">
      <label
        htmlFor={field.id}
        className="font-cyber-mono text-[10px] uppercase tracking-[0.26em] text-cyber-teal"
      >
        {field.label}
      </label>

      <input
        id={field.id}
        name={field.id}
        type={field.type}
        placeholder={field.placeholder}
        autoComplete={field.autoComplete}
        className="w-full border border-cyber-steel/60 bg-black/50 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-cyber-teal disabled:cursor-not-allowed disabled:border-cyber-steel/40 disabled:bg-black/30 disabled:text-zinc-500"
      />
    </motion.div>
  );
}

export default function WorkshopRegister() {
  const live = Boolean(REGISTRATION.formHref);

  return (
    <main className="relative overflow-hidden bg-cyber-void font-cyber-body text-white">
      {/* Same lighting as the event page, turned down. This is the quieter of
          the two rooms — one question, one answer — so the magenta stays at the
          top left and the teal is left to hold the rest. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[80vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 18% 0%, rgba(200,31,110,0.24) 0%, rgba(200,31,110,0) 62%), radial-gradient(ellipse 60% 55% at 85% 12%, rgba(43,183,189,0.20) 0%, rgba(43,183,189,0) 66%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[110vh] opacity-[0.04]"
        style={{
          backgroundImage: GRID_PLATE,
          backgroundSize: GRID_SIZE,
          maskImage: "linear-gradient(to bottom, black 0%, transparent 92%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 92%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_PLATE }}
      />

      {/* --------------------------------------------------------- the answer */}
      <motion.section
        className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-16 pt-[clamp(6.5rem,18vh,9rem)] text-center sm:px-8 sm:pb-20"
        variants={slideBlock}
        initial="hidden"
        // Announced rather than revealed on scroll: this block is already on
        // screen when the page opens.
        animate="shown"
      >
        <motion.div variants={slideRise}>
          <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
            <span
              aria-hidden
              className={`block h-1.5 w-1.5 rounded-full ${
                live ? "bg-cyber-aqua" : "bg-cyber-rose"
              }`}
            />
            {live ? "Registration open" : REGISTRATION.status}
          </span>
        </motion.div>

        <motion.h1
          variants={slideRise}
          className={`mt-7 text-[clamp(2rem,10vw,4.5rem)] uppercase ${CYBER_HEADING} ${NEON}`}
        >
          {REGISTRATION.headline}
        </motion.h1>

        <motion.p
          variants={slideRise}
          className="mt-5 font-cyber-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400 sm:text-xs"
        >
          {EVENT.title} · {EVENT.dateLabel}
        </motion.p>

        <motion.span
          aria-hidden
          variants={slideRise}
          className={`mt-8 block h-px w-40 ${SOFT_RULE}`}
        />

        {/*
         * The clock, again.
         *
         * It is the same component the event page leads on, and putting it here
         * too is not a repeat — somebody who followed a link straight to
         * registration has not seen it, and "how long do I have" is the question
         * underneath "when does this open". It counts to the workshop itself,
         * not to the form opening, because the workshop's date is the one that
         * is actually known.
         */}
        <motion.div variants={slideRise} className="mt-10">
          <Countdown />
        </motion.div>

        <motion.p
          variants={slideRise}
          className="mt-12 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:leading-[1.85]"
        >
          {REGISTRATION.lede}
        </motion.p>

        {REGISTRATION.opensLabel && (
          <motion.p
            variants={slideRise}
            className="mt-6 font-cyber-mono text-[11px] uppercase tracking-[0.28em] text-cyber-aqua"
          >
            {REGISTRATION.opensLabel}
          </motion.p>
        )}
      </motion.section>

      {/* ----------------------------------------------------------- the form */}
      <motion.section
        className="relative px-6 pb-20 sm:px-8 sm:pb-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-3xl">
          <motion.div
            variants={slideRise}
            className="relative border border-cyber-steel/70 bg-cyber-abyss/50 p-6 sm:p-10"
          >
            <CyberTicks still />
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-0.5 ${SPECTRUM_RULE}`}
            />

            <h2 className={`text-xl uppercase text-white sm:text-2xl ${CYBER_HEADING}`}>
              {live ? "The form" : "What it will ask"}
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              {live
                ? "Fill this in and you are on the list. Seats are limited by the hall."
                : "Every field below is the one that will be asked for. It is switched off until sign-ups open — nothing typed here is kept or sent anywhere."}
            </p>

            <form
              className="mt-9"
              // No handler and no action while it is shut. A `<form>` with
              // neither still submits to its own URL on Enter, so the fieldset
              // being disabled is what actually holds the door: a disabled
              // control is not successful, cannot be focused and cannot fire
              // the submit in the first place.
              onSubmit={(event) => event.preventDefault()}
            >
              <fieldset disabled={!live} className="min-w-0 border-0 p-0">
                {/* The legend is the accessible statement of the state. A
                    visually-hidden one rather than none at all: sighted readers
                    have the heading and the notice above, and a screen reader
                    gets the same fact attached to the group of controls it
                    actually applies to. */}
                <legend className="sr-only">
                  {live
                    ? "Workshop registration"
                    : "Workshop registration — not open yet"}
                </legend>

                <motion.div
                  variants={seatRow}
                  className="grid gap-5 sm:grid-cols-2 sm:gap-6"
                >
                  {REGISTRATION_FIELDS.map((field) => (
                    <Field key={field.id} field={field} />
                  ))}
                </motion.div>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    className={`${CYBER_BUTTON} justify-center disabled:cursor-not-allowed disabled:border-cyber-steel/50 disabled:bg-transparent disabled:text-zinc-500 disabled:hover:bg-transparent disabled:hover:text-zinc-500`}
                  >
                    {live ? "Submit registration" : "Opens soon"}
                  </button>

                  <p className="text-xs leading-relaxed text-zinc-500">
                    {REGISTRATION.note}
                  </p>
                </div>
              </fieldset>
            </form>
          </motion.div>
        </div>
      </motion.section>

      {/* -------------------------------------------------------- until then */}
      <motion.section
        className="relative border-t border-cyber-steel/40 px-6 py-20 sm:px-8 sm:py-28"
        variants={slideBlock}
        initial="hidden"
        whileInView="shown"
        viewport={slideViewport}
      >
        <div className="mx-auto w-full max-w-5xl">
          <motion.div variants={slideRise}>
            <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
              <span aria-hidden className="h-px w-6 bg-cyber-teal/70" />
              Until then
            </span>
          </motion.div>

          <motion.h2
            variants={slideRise}
            className={`mt-6 text-[clamp(1.5rem,5vw,2.75rem)] uppercase text-white ${CYBER_HEADING}`}
          >
            Hold a <span className="text-cyber-teal">seat</span>
          </motion.h2>

          <motion.p
            variants={slideRise}
            className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]"
          >
            The two students running the workshop take names ahead of the form
            opening, and they are the ones who will know the day it does. Either
            number rings the person it belongs to.
          </motion.p>

          <motion.div variants={seatRow} className="mt-12">
            <StudentTiles />
          </motion.div>

          <motion.div
            variants={slideRise}
            className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link href={WORKSHOP_HREF} className={CYBER_BUTTON}>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to the workshop
            </Link>

            <Link href="/" className={CYBER_LINK}>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              The front page
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
