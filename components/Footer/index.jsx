"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import NicLogoMark from "../NicLogoMark";
import SectionLink from "../SectionLink";
import { ContactStrip } from "../ContactIcons";
import { slideBlock, slideRise, slideViewport } from "../motionPresets";
import { JOIN_HREF } from "../siteLinks";

/**
 * The end of the page, and the only part of it that is not a slide.
 *
 * Everything above this is dealt one screen at a time over a pinned sequence,
 * which is a way of being read that has to end somewhere — a footer that also
 * arrived as a deck slide would be the page refusing to stop. So this is
 * ordinary flow, ordinary scroll, and deliberately still: the frames are behind
 * you, here is where the club is written down.
 *
 * What it keeps from the rest is the vocabulary — hard edges, corner ticks, red
 * mono, and the tinted tag the roster stamps its posts with. It is the same
 * building, just the ground floor.
 */

const META = [
  { label: "Inaugurated", value: "18 July 2024" },
  { label: "Department", value: "CSE E-Tech" },
  { label: "Institution", value: "SRMIST" },
];

/** One column of links, ruled and numbered like the mobile menu's. */
function LinkColumn({ title, links }) {
  return (
    <motion.nav variants={slideRise} aria-label={title}>
      <h3 className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
        <span aria-hidden className="h-px w-4 bg-nic-red/70" />
        {title}
      </h3>

      <ul className="mt-5 flex flex-col">
        {links.map((link, index) => (
          <li key={link.href}>
            <SectionLink
              href={link.href}
              className="group flex items-center justify-between gap-4 border-b border-white/8 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:text-white sm:text-xs"
            >
              <span className="relative">
                {link.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-0 bg-nic-red transition-all duration-300 group-hover:w-full"
                />
              </span>
              <span
                aria-hidden
                className="font-mono text-[10px] tracking-[0.2em] text-zinc-700 transition-colors group-hover:text-nic-red"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </SectionLink>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}

export default function Footer({ navLinks, clubLinks }) {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      id="footer"
      className="relative z-40 border-t border-white/10 bg-black"
      variants={slideBlock}
      initial="hidden"
      whileInView="shown"
      viewport={slideViewport}
    >
      {/* The same leading seam every section above is pushed by — here it is
          the line the page finally comes to rest against. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-nic-red to-transparent shadow-[0_0_28px_6px_rgba(237,10,20,0.45)]"
      />

      <div className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16 sm:px-8 sm:pb-12 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)_minmax(0,0.9fr)] lg:gap-16">
          {/* -------------------------------------------------- the club */}
          <motion.div variants={slideRise}>
            <div className="flex items-center gap-4">
              <NicLogoMark className="h-12 w-auto sm:h-14" />
              <div>
                <p className="text-2xl font-black uppercase leading-none tracking-[0.18em] text-white sm:text-3xl">
                  NIC
                </p>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 sm:text-[10px]">
                  Next Gen Intelligence Club
                </p>
              </div>
            </div>

            <span aria-hidden className="mt-7 block h-px w-12 bg-nic-red" />

            <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-400 sm:leading-[1.75]">
              A student club of the Department of CSE E-Tech, built to put
              next-generation technology in students&rsquo; hands — workshops,
              certification drives, knowledge-sharing sessions and symposiums,
              run by the two boards above.
            </p>

            {/* The facts, set as a strip rather than a paragraph: three things
                that never change, in the one place someone scrolls to find
                them. */}
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
              {META.map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300 sm:text-xs">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* ---------------------------------------------- where to go */}
          <LinkColumn title="Navigate" links={navLinks} />

          {/* ----------------------------------------- how to reach it */}
          <motion.div variants={slideRise}>
            <h3 className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
              <span aria-hidden className="h-px w-4 bg-nic-red/70" />
              Connect
            </h3>

            <div className="mt-5">
              <ContactStrip links={clubLinks} />
            </div>

            {/*
             * The one thing on the page asking for something back, so it is
             * the one filled shape in the footer. It used to point at the
             * mission card — the nearest thing the front page had to an answer
             * — and now points at the page that actually answers it.
             */}
            <Link
              href={JOIN_HREF}
              className="group mt-8 inline-flex items-center gap-3 border border-nic-red/70 bg-nic-red/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-all duration-300 hover:bg-nic-red focus-visible:bg-nic-red focus-visible:outline-none"
            >
              Join the club
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </motion.div>
        </div>

        {/* ------------------------------------------------ the bottom bar */}
        <motion.div
          variants={slideRise}
          className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            © {year} Next Gen Intelligence Club
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
            Built by the club, for the club
          </p>
        </motion.div>
      </div>

      {/*
       * The wordmark the page signs off with. It is set as large as the
       * container will carry and cropped by the bottom edge on purpose — a
       * footer mark that fits entirely on screen reads as another heading,
       * whereas one running off the page reads as the end of the document.
       *
       * `aria-hidden`, because "NIC" has already been said twice above it and a
       * screen reader does not need it a third time as decoration.
       */}
      <div
        aria-hidden
        className="pointer-events-none relative select-none overflow-hidden"
      >
        <p className="mx-auto w-full max-w-6xl translate-y-[18%] px-6 text-center text-[clamp(4.5rem,19vw,15rem)] font-black uppercase leading-[0.75] tracking-[0.06em] text-white/[0.045] sm:px-8">
          NIC
        </p>
      </div>
    </motion.footer>
  );
}
