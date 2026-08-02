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
import { JOIN_HREF, NAV_LINKS as LINKS } from "../siteLinks";

export default function Navbar({ revealed = true }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  // The button is the loudest thing in the bar; on the page it leads to it
  // should say so rather than offer the visitor a trip to where they already
  // are.
  const onJoinPage = usePathname() === JOIN_HREF;

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 32);
  });

  // Close the sheet if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
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
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <SectionLink
            href="#top"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-3"
          >
            <NicLogoMark className="h-9 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-10" />
            <span className="hidden text-sm font-black uppercase tracking-[0.28em] text-white sm:block">
              NIC
            </span>
          </SectionLink>

          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
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
            href={JOIN_HREF}
            aria-current={onJoinPage ? "page" : undefined}
            className={`hidden rounded-full border border-nic-red/60 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-colors md:block ${
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
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
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
            className="overflow-hidden border-b border-white/10 bg-black/95 backdrop-blur-xl md:hidden"
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
              <motion.li
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.3 }}
                className="pt-5"
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
