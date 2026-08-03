import Link from "next/link";
import NicLogoMark from "../NicLogoMark";
import { LABEL_SHADOW } from "../surfaces";
import SignOutButton from "./SignOutButton";

/**
 * The bar every signed-in admin screen is worn under.
 *
 * Sticky rather than fixed: the roster below it is long, and a bar that
 * leaves the flow would need the pages to reserve its height by hand. The
 * leading red seam is the same one the member popup and each pushed section
 * carry — on this site a red hairline is what an edge is.
 */
export default function AdminChrome({ email }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-nic-red to-transparent shadow-[0_0_20px_4px_rgba(237,10,20,0.4)]"
      />

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3.5 sm:px-8">
        <Link
          href="/admin/dashboard"
          className="flex shrink-0 items-center gap-3 focus-visible:outline-none"
        >
          <NicLogoMark className="h-8 w-auto" title="NIC" />
          <span
            className={`hidden font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-white sm:inline ${LABEL_SHADOW}`}
          >
            NIC
            <span className="text-nic-red"> Admin</span>
          </span>
        </Link>

        <span aria-hidden className="h-5 w-px bg-white/15" />

        {/* The one thing this bar is actually for, besides getting out:
            which account is making the edits. */}
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {email}
        </span>

        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white sm:inline"
        >
          View site ↗
        </Link>

        <SignOutButton />
      </div>
    </header>
  );
}
