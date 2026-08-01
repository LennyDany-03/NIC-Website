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
 */
export default function SectionLink({
  href,
  className = "",
  onClick,
  children,
}) {
  const onFront = usePathname() === "/";

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
