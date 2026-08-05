"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CyberTicks from "./CyberTicks";
import {
  CYBER_BUTTON,
  CYBER_HEADING,
  CYBER_LABEL,
  CYBER_LINK,
  SPECTRUM_RULE,
} from "../eventsTheme";
import { REGISTRATION } from "./content";
import { WORKSHOP_HREF } from "../siteLinks";
import { slideRise } from "../motionPresets";

/**
 * The band that asks for something back.
 *
 * Right now it cannot ask for the obvious thing — sign-ups are not open — and
 * the temptation with a closed event page is either to hide the fact or to put
 * up a button that goes nowhere. Both are the same mistake: this is the question
 * every visitor arrives with, and a page that avoids it makes them go and ask a
 * human. So the band states the position in its heading, and the control under
 * it goes somewhere real — the registration page, where the form that will open
 * is laid out in full.
 *
 * The moment `REGISTRATION.formHref` is filled in, this becomes an ordinary
 * live call to action pointed at it, with no other edit anywhere. That is the
 * whole reason it reads its own state out of `content.js` rather than being
 * written as a "coming soon" block.
 */
export default function RegistrationCta() {
  const live = Boolean(REGISTRATION.formHref);

  return (
    <motion.div
      variants={slideRise}
      className="relative overflow-hidden border border-cyber-steel/70 bg-cyber-abyss/50 p-8 sm:p-12"
    >
      <CyberTicks still />

      {/* The palette's full sweep on the top edge — the one place on the page
          all three of the poster's lights are laid out side by side. */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-0.5 ${SPECTRUM_RULE}`}
      />

      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <span className={`inline-flex items-center gap-3 ${CYBER_LABEL}`}>
            {/* A live dot, because this is the one line on the page that is
                expected to change and the visitor's reason to come back. */}
            <span
              aria-hidden
              className={`block h-1.5 w-1.5 rounded-full ${
                live ? "bg-cyber-aqua" : "bg-cyber-rose"
              }`}
            />
            {live ? "Registration open" : REGISTRATION.status}
          </span>

          <h2
            className={`mt-5 text-[clamp(1.35rem,4.5vw,2.25rem)] uppercase text-white ${CYBER_HEADING}`}
          >
            {live ? (
              <>
                Take a <span className="text-cyber-teal">seat</span>
              </>
            ) : (
              <>
                Sign-ups <span className="text-cyber-rose">shortly</span>
              </>
            )}
          </h2>

          <p className="mt-5 text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]">
            {live
              ? "The form is open. Seats are limited by the hall, so it closes when the hall is full."
              : REGISTRATION.teaser}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          {live ? (
            <a
              href={REGISTRATION.formHref}
              target="_blank"
              rel="noreferrer"
              className={CYBER_BUTTON}
            >
              Register now
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                ↗
              </span>
            </a>
          ) : (
            <Link href={WORKSHOP_HREF} className={CYBER_BUTTON}>
              Registration page
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          )}

          <Link href="/" className={CYBER_LINK}>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              ←
            </span>
            Back to the front page
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
