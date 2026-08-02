"use client";

import { useEffect, useState } from "react";

/**
 * The line between the two layouts this site is.
 *
 * Above it the page is a deck: four frame sequences pinned behind sheets of
 * content that are pushed off a screen at a time. Below it none of that
 * survives contact with a phone — the sequences letterbox into a band across
 * the middle of a portrait screen, the pushes are turned off anyway because a
 * flick's momentum belongs to the compositor, and every slide is padded out to
 * a full screen it has no content for. So below it the page is a page: sections
 * that flow, each one lit by a still of the sequence that would have played
 * behind it.
 *
 * 1024px, which is Tailwind's `lg`, so a class written `lg:` and a branch
 * written `isMobile` always agree. Width alone, deliberately: `pointer: coarse`
 * would put a touchscreen laptop on the phone layout at 1600px wide, and the
 * thing that actually decides which of these two layouts works is how much room
 * there is.
 */
export const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * The same answer outside React, for code that runs before a component can ask
 * — the frame loader checks it to decide whether to download anything at all.
 */
export function matchesMobile() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * Whether the phone layout is the one in force.
 *
 * False for one render, always — including on a phone. There is no viewport to
 * measure while the page is being rendered on the server, so the markup that
 * arrives is the desktop deck's, and the first client render has to agree with
 * it or it is not hydration, it is a mismatch: React throws the server's tree
 * away and rebuilds the page from scratch, which is both slower and noisier
 * than the render this costs.
 *
 * So the answer lands one render late, on purpose. That render happens on
 * mount, behind a loading screen that holds for the best part of a second
 * after it — nobody ever sees the deck flash past on a phone.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const apply = () => setIsMobile(query.matches);

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return isMobile;
}
