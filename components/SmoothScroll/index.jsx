"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { enableSmoothScroll } from "../smoothScroll";

/**
 * Mounts the inertial scroll for the whole page. Renders nothing — it only
 * installs listeners, so it can sit anywhere in the tree.
 */
export default function SmoothScroll() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Someone who asked for less motion gets the browser's plain scroll, and
    // anchors jump instead of gliding.
    if (prefersReducedMotion) return undefined;

    // Touch momentum is already interpolated; only the wheel needs help.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    return enableSmoothScroll({ wheel: !coarse, anchors: true });
  }, [prefersReducedMotion]);

  return null;
}
