import Image from "next/image";
import { GRAIN_PLATE } from "../surfaces";

/**
 * What the admin is lit by.
 *
 * The same corridor the crew section is pinned in front of, held at the frame
 * where the vanishing point is dead centre — and deliberately that frame
 * rather than any other, because this is the screen that edits the crew. One
 * still, ~36 KB, fixed rather than pinned: there is no deck here and nothing
 * is scroll-linked, so the scene simply holds while a long roster scrolls
 * over it.
 *
 * The layers are the ones `SceneStill` uses on a phone, in the same order and
 * for the same reasons — ember, fade to black at both edges, vignette, grid,
 * grain — but every one of them is turned down. That component is lighting a
 * section with two paragraphs in it; this one is lighting a form with a
 * textarea and five inputs, and the corridor is blown out near-white down its
 * left wall. Legibility wins: the still runs at 0.28 and each block of UI
 * still gets a plate of its own on top (see ADMIN_PANEL).
 *
 * Every opacity below is an inline style rather than an `opacity-[…]` utility
 * on purpose — a freshly written arbitrary utility is missing from the dev
 * server's stylesheet, and this is a file where that would look like a design
 * mistake rather than a build one.
 */

/** The one composition in the sequence that is as much a portrait as a landscape. */
const STILL = "/frames/frames_corridor/frame_0110.webp";

export default function AdminBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
    >
      {/*
       * Inset past every edge rather than fitted to them: these frames carry a
       * generator's watermark in the bottom-right corner, and the crop is what
       * takes it off the screen.
       */}
      <div className="absolute -inset-[6%]">
        <Image
          src={STILL}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ opacity: 0.55 }}
        />
      </div>

      {/* The ember the club is lit in. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(75% 55% at 50% 30%, rgba(237,10,20,0.2) 0%, rgba(237,10,20,0) 72%)",
        }}
      />

      {/* Both edges go to black, so the bar at the top has something to sit on. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.32)_28%,rgba(0,0,0,0.44)_68%,rgba(0,0,0,0.92)_100%)]" />

      {/* And the corners, so a wide screen does not end in bare corridor. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_34%,rgba(0,0,0,0.58)_100%)]" />

      {/* The circuit rule the badge is built from, at texture strength. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.03,
        }}
      />

      {/* The same darkroom grain the portraits are mounted on. */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{ backgroundImage: GRAIN_PLATE, opacity: 0.09 }}
      />
    </div>
  );
}
