"use client";

/**
 * A dependency-free inertial scroll, shaped like Lenis: the browser stays the
 * source of truth for scroll position — so `useScroll`, sticky panels, anchors
 * and the scrollbar all keep working — but wheel input is swallowed and
 * replayed as a lerp toward a target.
 *
 * This is what the frame canvases were missing. A wheel notch is a single ~100px
 * jump, so a scroll-scrubbed sequence advances several frames at once and reads
 * as stepped no matter how the spring downstream is tuned. Ramping the scroll
 * position itself fixes every scroll-linked animation on the page at once.
 *
 * Touch is deliberately left alone: native momentum already interpolates, and
 * hijacking it on a phone costs more than it buys.
 */

/** Share of the remaining gap eaten per 60fps frame. Lower = longer glide. */
const LERP = 0.09;
const REFERENCE_FRAME_MS = 1000 / 60;
/** Ignore hitches (tab wakeup, GC) so a stall never teleports the page. */
const MAX_FRAME_MS = 64;
/** deltaMode 1 reports lines rather than pixels (Firefox). */
const LINE_HEIGHT = 18;
const PAGE_FACTOR = 0.92;
/** Below this the glide has arrived and the loop can idle. */
const SETTLE_PX = 0.2;
/**
 * How long a landed programmatic scroll keeps the page. Long enough to outlast
 * the tail of the gesture that triggered it, short enough that a second,
 * deliberate scroll still counts. See `autoUntil`.
 */
export const SETTLE_MS = 280;
/** Keys the browser scrolls with — the only ones that should interrupt us. */
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const easeInOutQuint = (t) =>
  t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;

/**
 * The curve for a slide push. Quint is right for a long anchor glide, where
 * the flat start reads as the page taking a breath before it moves — but a
 * push is over in 0.7s, and at that length the same flatness reads as a stall
 * followed by a jump. Cubic is moving properly by a quarter of the way in and
 * still lands soft, which is what "one gesture" is supposed to feel like.
 */
export const EASE_PUSH = (t) =>
  t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** A nested scroller (the mobile sheet, a long list) keeps native behaviour. */
function insideScroller(node) {
  let element = node instanceof Element ? node : null;
  while (element && element !== document.body) {
    if (element.scrollHeight > element.clientHeight + 1) {
      const overflow = getComputedStyle(element).overflowY;
      if (overflow === "auto" || overflow === "scroll") return true;
    }
    element = element.parentElement;
  }
  return false;
}

function create() {
  let hijackWheel = false;
  let handleAnchors = false;

  let target = window.scrollY;
  let current = target;
  let frameRequest = 0;
  let lastFrameAt = 0;
  let tween = null;
  /**
   * How long after a tween lands the page still counts as ours.
   *
   * A wheel gesture is not one event, it is a burst — and a trackpad's burst
   * outlives the 0.7s push it triggered. Without this, the tail of the flick
   * that advanced one slide arrives on the next one already sitting at the top
   * of its travel and advances that too, and a single gesture walks the
   * visitor through the whole deck. The window doesn't block scrolling; it
   * only tells the handoffs to stand down, so the tail merely scrolls.
   */
  let autoUntil = 0;

  const write = () => {
    window.scrollTo(0, current);
  };

  const stop = () => {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    lastFrameAt = 0;
  };

  const sync = () => {
    current = window.scrollY;
    target = current;
  };

  const frame = (now) => {
    const elapsed = lastFrameAt
      ? Math.min(now - lastFrameAt, MAX_FRAME_MS)
      : REFERENCE_FRAME_MS;
    lastFrameAt = now;

    if (tween) {
      const t =
        tween.duration > 0 ? clamp((now - tween.at) / tween.duration, 0, 1) : 1;
      current = tween.from + (tween.to - tween.from) * tween.ease(t);
      target = current;
      write();

      if (t >= 1) {
        const { onComplete, settle } = tween;
        tween = null;
        autoUntil = now + settle;
        stop();
        onComplete?.();
        return;
      }
    } else {
      // Framerate-independent easing: the same glide on 60Hz and 144Hz.
      const alpha = 1 - Math.pow(1 - LERP, elapsed / REFERENCE_FRAME_MS);
      current += (target - current) * alpha;
      if (Math.abs(target - current) < SETTLE_PX) current = target;
      write();

      if (current === target) {
        stop();
        return;
      }
    }

    frameRequest = requestAnimationFrame(frame);
  };

  const run = () => {
    if (frameRequest) return;
    lastFrameAt = 0;
    frameRequest = requestAnimationFrame(frame);
  };

  /** Hands the scroll position back to the browser and the visitor. */
  const release = () => {
    tween = null;
    // Taking over is a deliberate act, so any settle window still owed is
    // spent on the spot — the visitor owns the page from here.
    autoUntil = 0;
    stop();
    sync();
  };

  /** True while an auto-scroll is still inside its no-interrupt window. */
  const tweenIsProtected = () =>
    Boolean(tween) && performance.now() - tween.at < tween.grace;

  /** Drops an auto-scroll but leaves an in-flight wheel glide alone. */
  const cancelTween = () => {
    if (!tween) return;
    release();
  };

  const tweenTo = (
    to,
    {
      duration = 1200,
      grace = 0,
      settle = 0,
      ease = easeInOutQuint,
      onComplete,
    } = {},
  ) => {
    const from = window.scrollY;
    const destination = clamp(to, 0, maxScroll());
    if (Math.abs(destination - from) < 1) {
      onComplete?.();
      return;
    }
    current = from;
    target = from;
    tween = {
      from,
      to: destination,
      at: performance.now(),
      duration,
      grace,
      settle,
      ease,
      onComplete,
    };
    run();
  };

  const onScroll = () => {
    // While the loop is running we are the one moving the page, and every
    // event here is the echo of our own `scrollTo`. Real input reaches us
    // through the handlers below instead, which is far more reliable than
    // trying to tell our writes apart from the visitor's by pixel distance.
    if (tween || frameRequest) return;
    sync();
  };

  const onWheel = (event) => {
    // The notch that triggers a handoff usually arrives as a burst. Swallowing
    // the tail of it keeps the transition it just started from being cancelled
    // by its own trigger; past that window the visitor is deliberately taking
    // over and gets the page back.
    if (tweenIsProtected()) {
      if (hijackWheel) event.preventDefault();
      return;
    }

    // Any wheel past the grace window beats an auto-scroll, hijack or not.
    cancelTween();

    if (!hijackWheel) return;
    if (event.ctrlKey || event.defaultPrevented) return;
    // The loader and the mobile sheet both pin the page this way.
    if (document.body.style.overflow === "hidden") return;
    if (insideScroller(event.target)) return;

    event.preventDefault();
    // Notches land on top of a glide already in flight, so a flurry of them
    // travels further than one — the same way native scrolling accumulates.
    if (!frameRequest) sync();

    const unit =
      event.deltaMode === 1
        ? LINE_HEIGHT
        : event.deltaMode === 2
          ? window.innerHeight * PAGE_FACTOR
          : 1;
    target = clamp(target + event.deltaY * unit, 0, maxScroll());
    run();
  };

  // Touch scrolls natively; step out of the way entirely.
  const onInterrupt = () => {
    if (tweenIsProtected()) return;
    release();
  };

  const onKeyDown = (event) => {
    // Only the keys that actually move the page — otherwise Escape closing the
    // mobile sheet would snap an unrelated glide to a halt.
    if (!SCROLL_KEYS.has(event.key)) return;
    onInterrupt();
  };

  const onPointerDown = (event) => {
    if (tweenIsProtected()) return;
    // Past the content edge is the scrollbar, which the visitor is about to
    // drag. An ordinary click shouldn't kill a glide, so nothing else does.
    if (tween || event.clientX > document.documentElement.clientWidth) {
      release();
    }
  };

  const onResize = () => {
    if (tween || frameRequest) {
      target = clamp(target, 0, maxScroll());
      return;
    }
    sync();
  };

  const onClick = (event) => {
    if (!handleAnchors) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // Pinned by the loader: a tween would run its clock against a page that
    // cannot move, then snap when the lock lifts.
    if (document.body.style.overflow === "hidden") return;

    const anchor = event.target?.closest?.('a[href^="#"]');
    const id = anchor?.getAttribute("href")?.slice(1);
    if (!id) return;

    const destination = document.getElementById(id);
    if (!destination) return;

    event.preventDefault();
    tweenTo(destination.getBoundingClientRect().top + window.scrollY, {
      duration: 1100,
      // An anchor lands the visitor at the top of a slide's travel, which is
      // exactly where a handoff waits to fire. Without a beat afterwards the
      // slide they asked for advances out from under them.
      settle: SETTLE_MS,
    });
    // Keep the section linkable without letting the browser jump us there.
    window.history.replaceState(null, "", `#${id}`);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onInterrupt, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("keydown", onKeyDown, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("click", onClick);

  return {
    enable({ wheel = true, anchors = true } = {}) {
      hijackWheel = wheel;
      handleAnchors = anchors;
      sync();
      return () => {
        hijackWheel = false;
        handleAnchors = false;
        release();
      };
    },
    tweenTo,
    cancelTween,
    isTweening: () => Boolean(tween) || performance.now() < autoUntil,
  };
}

let instance = null;

function controller() {
  if (typeof window === "undefined") return null;
  if (!instance) instance = create();
  return instance;
}

/** Turns wheel input into an inertial ramp. Returns a teardown. */
export function enableSmoothScroll(options) {
  return controller()?.enable(options) ?? (() => {});
}

/** Eased programmatic scroll. Works whether or not the wheel hijack is on. */
export function smoothScrollTo(y, options) {
  controller()?.tweenTo(y, options);
}

/** Drops an in-flight programmatic scroll — used when a visitor takes over. */
export function cancelSmoothScroll() {
  controller()?.cancelTween();
}

/**
 * True while a programmatic scroll owns the page — an anchor from the navbar,
 * or a slide still being handed over, plus the short settle window after it
 * lands. Anything that would start a scroll of its own has to stand down until
 * then, or the two replace each other mid-flight and the visitor ends up
 * somewhere neither of them was aiming for.
 */
export function isAutoScrolling() {
  return controller()?.isTweening() ?? false;
}
