"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import NicLogoMark from "../NicLogoMark";
import SectionLink from "../SectionLink";
import {
  GENESIS_HREF,
  GENESIS_LABEL,
  JOIN_HREF,
  NAV_LINKS as LINKS,
} from "../siteLinks";

/**
 * The sections, split into the two halves that flank the Genesis pill.
 *
 * Derived rather than written out twice, so adding a section to `siteLinks`
 * still only takes one edit — a seventh link lands on the left, an eighth
 * evens them up again. The mobile sheet below keeps the list whole and in
 * order; only the desktop bar has a centre to arrange around.
 */
const SPLIT_AT = Math.ceil(LINKS.length / 2);
const LEFT_LINKS = LINKS.slice(0, SPLIT_AT);
const RIGHT_LINKS = LINKS.slice(SPLIT_AT);

export default function Navbar({ revealed = true }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  // The button is the loudest thing in the bar; on the page it leads to it
  // should say so rather than offer the visitor a trip to where they already
  // are.
  const pathname = usePathname();
  const onJoinPage = pathname === JOIN_HREF;
  const onGenesisPage = pathname === GENESIS_HREF;

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 32);
  });

  /*
   * Close the sheet if the viewport grows past the breakpoint that replaces it
   * with the bar.
   *
   * 1024px, and it has to stay the exact complement of the `lg:` classes below
   * or the sheet can be left open on a viewport that is no longer showing the
   * button that closes it.
   *
   * It used to be 768. The bar moved up to `lg` when Genesis'26 took the
   * centre: six section links plus a 150px pill do not fit beside the logo and
   * Join in a 768px bar — measured, the links ran under both — and 1024 is
   * where they do. It is also the line this whole site is already split on, so
   * the bar now changes over at the same width the layout does instead of 256px
   * earlier.
   */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const close = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", close);
    return () => query.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={false}
      animate={{ y: revealed ? 0 : -96, opacity: revealed ? 1 : 0 }}
      transition={{ duration: 0.7, delay: revealed ? 0.2 : 0, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`transition-colors duration-500 ${
          scrolled || menuOpen
            ? "border-b border-white/10 bg-black/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <SectionLink
            href="#top"
            onClick={() => setMenuOpen(false)}
            className="group relative z-10 flex items-center gap-3"
          >
            <NicLogoMark className="h-9 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-10" />
            <span className="hidden text-sm font-black uppercase tracking-[0.28em] text-white sm:block">
              NIC
            </span>
          </SectionLink>

          {/*
           * The centre of the bar, and the one thing in it that is not part of
           * this site's furniture.
           *
           * Genesis'26 is dated: it wants to be seen before it stops being true,
           * so it takes the middle of the bar rather than a place at the end of
           * the list. Getting it *exactly* in the middle is why this is an
           * overlay rather than another `<li>` — laid out in flow it would only
           * ever land where the six links happened to leave it, which on this
           * bar was a good 250px right of centre.
           *
           * So the sections are split into equal halves that flank it. The
           * wrapper spans the full bar (`inset-x-0`), both halves are
           * `basis-0 grow` so they are the same width whatever their labels say,
           * and the pill between them therefore sits on the bar's centreline by
           * construction — not by a margin somebody tuned once at 1440px. The
           * halves point their content inward (`justify-end` / start) so the
           * links hug the pill and leave the logo and Join their corners.
           *
           * The overlay is `pointer-events-none` and each control turns them
           * back on: the halves are as wide as half the bar, and without that
           * their empty space would sit over the logo and swallow clicks on it.
           */}
          <div className="pointer-events-none absolute inset-x-0 hidden items-center px-5 sm:px-8 lg:flex">
            <ul className="flex grow basis-0 items-center justify-end gap-4 lg:gap-7">
              {LEFT_LINKS.map((link) => (
                <li key={link.href} className="pointer-events-auto">
                  <SectionLink
                    href={link.href}
                    className="group relative block py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-nic-red transition-all duration-300 group-hover:w-full" />
                  </SectionLink>
                </li>
              ))}
            </ul>

            <Link
              href={GENESIS_HREF}
              aria-current={onGenesisPage ? "page" : undefined}
              className={`group pointer-events-auto mx-4 flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] transition-colors duration-300 lg:mx-7 ${
                onGenesisPage
                  ? "border-genesis-gold bg-genesis-gold text-black"
                  : "border-genesis-gold/60 bg-genesis-gold/10 text-genesis-rich hover:bg-genesis-gold hover:text-black"
              }`}
            >
              {/* The live dot: this is the one item in the bar with a clock
                  running behind it, and a countdown nobody knows is counting is
                  just a link. */}
              <span
                aria-hidden
                className={`block h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${
                  onGenesisPage
                    ? "bg-black/70"
                    : "bg-genesis-champagne group-hover:bg-black/70"
                }`}
              />
              <span className="whitespace-nowrap">{GENESIS_LABEL}</span>
            </Link>

            <ul className="flex grow basis-0 items-center gap-4 lg:gap-7">
              {RIGHT_LINKS.map((link) => (
                <li key={link.href} className="pointer-events-auto">
                  <SectionLink
                    href={link.href}
                    className="group relative block py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-nic-red transition-all duration-300 group-hover:w-full" />
                  </SectionLink>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={JOIN_HREF}
            aria-current={onJoinPage ? "page" : undefined}
            className={`relative z-10 hidden rounded-full border border-nic-red/60 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-colors lg:block ${
              onJoinPage ? "bg-nic-red" : "hover:bg-nic-red"
            }`}
          >
            Join
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="nic-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <motion.span
              className="block h-px w-6 bg-white"
              animate={menuOpen ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.span
              className="block h-px w-6 bg-white"
              animate={menuOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
          </button>
        </nav>

        {/*
         * How far down the page you are, on the layout that has no other way of
         * telling you.
         *
         * The desktop deliberately has no scrollbar — it is a deck, and a bar
         * measuring a length in pixels says nothing about a page dealt a screen
         * at a time. The phone layout is not a deck: it is twenty-odd screens
         * of ordinary scrolling with the browser's own bar suppressed by the
         * same rule, and that combination is genuinely disorienting. So the bar
         * comes back here, as a hairline in the club's red, on exactly the
         * layout that needs it.
         */}
        <motion.span
          aria-hidden
          className="block h-px origin-left bg-nic-red/80 lg:hidden"
          style={{ scaleX: scrollYProgress }}
        />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="nic-mobile-menu"
            key="mobile-menu"
            className="overflow-hidden border-b border-white/10 bg-black/95 backdrop-blur-xl lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="flex flex-col px-5 py-4">
              {LINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * index, duration: 0.3 }}
                >
                  <SectionLink
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between border-b border-white/5 py-4 font-mono text-xs uppercase tracking-[0.3em] text-zinc-300 active:text-white"
                  >
                    {link.label}
                    <span className="text-nic-red">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </SectionLink>
                </motion.li>
              ))}
              {/* Same billing as on the desktop bar: above the club's standing
                  call to action, and in the event's own metal. */}
              <motion.li
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.3 }}
                className="pt-5"
              >
                <Link
                  href={GENESIS_HREF}
                  aria-current={onGenesisPage ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-center gap-2.5 rounded-full border border-genesis-gold/60 py-3 text-center font-mono text-xs uppercase tracking-[0.3em] ${
                    onGenesisPage
                      ? "bg-genesis-gold text-black"
                      : "bg-genesis-gold/10 text-genesis-rich"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`block h-1.5 w-1.5 rounded-full ${
                      onGenesisPage ? "bg-black/70" : "bg-genesis-champagne"
                    }`}
                  />
                  {GENESIS_LABEL}
                </Link>
              </motion.li>

              <motion.li
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.3 }}
                className="pt-3"
              >
                <Link
                  href={JOIN_HREF}
                  aria-current={onJoinPage ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full bg-nic-red py-3 text-center font-mono text-xs uppercase tracking-[0.3em] text-white"
                >
                  Join the club
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
