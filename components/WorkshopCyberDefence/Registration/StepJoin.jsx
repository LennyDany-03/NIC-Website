"use client";

import { motion } from "framer-motion";
import CyberTicks from "../CyberTicks";
import WhatsAppIcon, { WHATSAPP_GREEN } from "./WhatsAppIcon";
import { WHATSAPP } from "./content";
import { COORDINATORS } from "../content";
import { CYBER_LABEL, CYBER_TILE, SPECTRUM_RULE } from "../../eventsTheme";
import { seatRow, slideRise } from "../../motionPresets";

/**
 * Step 3 — the group.
 *
 * The one step that asks for nothing back. Its Next button is enabled from the
 * moment it opens, and there is no check that the link was ever followed:
 * refusing somebody a ticket until they have joined a chat is a hostage
 * situation, not a flow, and it would not work anyway — the page cannot see the
 * other tab. So the link is put where it cannot be missed, the reason to follow
 * it is stated plainly above it, and the decision is left where it belongs.
 *
 * The panel opens with something built to be read as "a WhatsApp chat" before
 * it is read as words at all — the app's own icon in its own green, in a row
 * shaped like the header of the chat it links to. A first pass at this step
 * said "open the group" in the page's own teal and nothing else, and that is
 * the kind of button a visitor skims past assuming it goes to another section
 * of the site. The icon is what stops that skim.
 *
 * The two coordinators are repeated here from the poster rather than linked to.
 * This is the step somebody is on when they realise they have paid the wrong
 * amount or typed their register number wrong, and a phone number they have to
 * navigate away to find is a phone number they will not call.
 */
export default function StepJoin() {
  return (
    <motion.div variants={seatRow} className="flex flex-col">
      <motion.div variants={slideRise} className={`group relative ${CYBER_TILE} p-6 sm:p-8`}>
        <CyberTicks still />
        <span aria-hidden className={`absolute inset-x-0 top-0 h-px ${SPECTRUM_RULE}`} />

        {/* The chat header. Same three parts a WhatsApp chat opens with — an
            icon, a name, a subtitle — so the row reads as "this is that app"
            before anyone has read a single word of it. */}
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-1"
            style={{
              backgroundColor: `${WHATSAPP_GREEN}26`,
              color: WHATSAPP_GREEN,
              boxShadow: `0 0 0 1px ${WHATSAPP_GREEN}66`,
            }}
          >
            <WhatsAppIcon className="h-6 w-6" />
          </span>

          <div className="min-w-0">
            <p className="truncate font-cyber-body text-sm font-semibold text-white">
              {WHATSAPP.chatName}
            </p>
            <p className="font-cyber-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              {WHATSAPP.chatKind}
            </p>
          </div>
        </div>

        <span className={`mt-7 block ${CYBER_LABEL}`}>Where the day is announced</span>

        <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-zinc-300">
          {["The venue, as soon as the hall is confirmed",
            "Any change to the timings",
            "What to install before the sessions",
            "Confirmation that your payment has been checked",
          ].map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-cyber-teal/70" />
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/*
           * The one button on this page not built from `CYBER_BUTTON` — see
           * the note on `WhatsAppIcon` for why the app's own green is worth
           * the exception here. Written as plain Tailwind arbitrary values
           * rather than the badge's inline style above, because this control
           * needs `hover:` and `focus-visible:` states and only the class
           * form gets those for free.
           */}
          <a
            href={WHATSAPP.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center justify-center gap-2.5 border border-[#25D366]/60 bg-[#25D366]/10 px-5 py-3 font-cyber-mono text-[11px] uppercase tracking-[0.24em] text-[#25D366] transition-all duration-300 hover:bg-[#25D366] hover:text-[#04120a] focus-visible:bg-[#25D366] focus-visible:text-[#04120a] focus-visible:outline-none"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {WHATSAPP.label}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              ↗
            </span>
          </a>

          <p className="text-xs leading-relaxed text-zinc-500">{WHATSAPP.note}</p>
        </div>
      </motion.div>

      {/* ------------------------------------------------ if something is wrong */}
      <motion.div variants={slideRise} className="mt-10">
        <span className={CYBER_LABEL}>Something wrong?</span>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
          Wrong amount, mistyped register number, paid twice — either of these
          rings the person it belongs to, and they are the ones holding the list.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {COORDINATORS.students.map((student) => (
            <li key={student.id}>
              <a
                href={`tel:${student.tel}`}
                className={`group flex items-baseline justify-between gap-4 ${CYBER_TILE} px-5 py-4`}
              >
                <span className="font-cyber-body text-sm text-white">{student.name}</span>
                <span className="font-cyber-mono text-xs tracking-[0.14em] text-cyber-aqua">
                  {student.phone}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
