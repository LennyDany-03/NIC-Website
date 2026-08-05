"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A link to a section of the front page, from anywhere on the site.
 *
 * Two behaviours in one component, because the two lists that use it — the
 * navbar and the footer — are now rendered on the front page *and* on `/join`,
 * and the right markup is not the same in both places:
 *
 *   On the front page a section is a hash away, and the link has to stay a
 *   plain `<a href="#...">`. The smooth-scroll layer intercepts exactly that
 *   shape and nothing else, and an anchor it does not intercept is a jump where
 *   the rest of the page glides.
 *
 *   Anywhere else the same section is a whole document away, so it becomes
 *   `/#...` on a next/link — a client transition into the front page, which
 *   replays the hash itself once its intro has handed over.
 *
 * The path is read here rather than threaded down as a prop so that neither
 * list has to know which route it is being rendered on.
 *
 * Since `/events` joined the table of contents, one entry in those lists is not
 * a section at all, so there is a third case above the two: a route is already
 * the address it wants to be and passes straight through on a next/link. It has
 * to be caught before the branch below, which prefixes a slash — `/` + `/events`
 * is `//events`, and a browser reads that as a protocol-relative URL to a host
 * called `events` rather than as a page on this site.
 */
export default function SectionLink({
  href,
  className = "",
  onClick,
  children,
}) {
  const onFront = usePathname() === "/";

  // Not a section. Nothing to intercept and nothing to rewrite, on any route.
  if (!href.startsWith("#")) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  }

  if (onFront) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={`/${href}`} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
