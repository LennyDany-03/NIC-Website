"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The camera, and whatever it is pointed at, decoded.
 *
 * Two decoders behind one interface. `BarcodeDetector` is built into Chrome and
 * Android WebView and is the one that should run at a door — it is native, it
 * costs nothing to ship, and it decodes a frame in about a millisecond. Safari
 * and Firefox do not have it, so `jsqr` is imported dynamically when they turn
 * out to be what somebody is holding. The import happens once, on the first
 * frame, rather than at module scope: on the phone that does have the native
 * decoder, the fallback is never downloaded at all.
 *
 * Decoding runs on a `requestAnimationFrame` loop rather than a timer, which
 * matters more here than it looks: rAF is throttled to nothing when the tab is
 * backgrounded, so a coordinator who switches apps mid-morning is not leaving a
 * decode loop chewing the battery behind a camera they cannot see.
 *
 * The frame is downscaled to `SAMPLE_EDGE` before `jsqr` sees it. A full 1080p
 * frame is two million pixels of `ImageData` allocated per attempt, several
 * times a second, and jsQR's cost is linear in that — at 480px a ticket held at
 * arm's length still resolves, and the loop stops being the reason the phone is
 * warm.
 *
 * `onDecode` is held in a ref rather than listed as a dependency. It is a
 * closure over the caller's state and is re-created on every render; as a
 * dependency it would tear down and restart the camera several times a second,
 * which on a real device is a black rectangle that never resolves.
 *
 * `paused` stops the decoding, not the camera, and the distinction is the
 * difference between a scanner that works on a queue and one that does not.
 * The camera is held open for as long as this is mounted: `getUserMedia` costs
 * the better part of a second to grant and warm up on a phone, and paying that
 * again between every two students is a visibly stalled door. Pausing skips the
 * decode — which is the expensive part per frame anyway — and leaves the
 * preview live, so the next ticket can be lined up while the last verdict is
 * still being read.
 */

const SAMPLE_EDGE = 480;

export function useQrCamera({ onDecode, paused = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const detectorRef = useRef(undefined);
  const jsqrRef = useRef(null);

  const [state, setState] = useState("idle"); // idle | starting | live | error
  const [error, setError] = useState(null);

  const decodeRef = useRef(onDecode);
  useEffect(() => {
    decodeRef.current = onDecode;
  }, [onDecode]);

  /* Read inside the loop rather than closed over, for the same reason as
     `onDecode`: pausing must not be a dependency of the effect that owns the
     camera, or every verdict would restart it. */
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  /** One frame, by whichever decoder this browser has. */
  const readFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    /* `undefined` means "not asked yet", `null` means "asked, not available" —
       three states, because the check itself is worth doing only once. */
    if (detectorRef.current === undefined) {
      detectorRef.current =
        typeof window !== "undefined" && "BarcodeDetector" in window
          ? new window.BarcodeDetector({ formats: ["qr_code"] })
          : null;
    }

    if (detectorRef.current) {
      try {
        const found = await detectorRef.current.detect(video);
        return found[0]?.rawValue ?? null;
      } catch {
        /* A detector that throws mid-session — it happens when the video track
           is being torn down — is not worth failing the whole scanner over.
           The next frame will try again. */
        return null;
      }
    }

    if (!jsqrRef.current) {
      jsqrRef.current = (await import("jsqr")).default;
    }

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const scale = Math.min(1, SAMPLE_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);
    if (!width || !height) return null;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, width, height);

    const image = ctx.getImageData(0, 0, width, height);
    /* `attemptBoth` — a ticket is dark-on-light in the PNG but a coordinator is
       usually pointing the camera at a phone screen, and a screen photographed
       at an angle inverts often enough to be worth the second pass. */
    const found = jsqrRef.current(image.data, width, height, {
      inversionAttempts: "attemptBoth",
    });

    return found?.data ?? null;
  }, []);

  useEffect(() => {
    let stream = null;
    let live = true;

    (async () => {
      setState("starting");
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setState("error");
        setError(
          "This browser will not give a web page a camera. Type the code in instead.",
        );
        return;
      }

      try {
        /* `environment` is the back camera, which is the one pointed at a
           student's phone. It is a preference rather than a constraint — a
           laptop has only the one camera and asking for a facing mode it does
           not have would fail outright instead of falling back. */
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (cause) {
        if (!live) return;
        setState("error");
        setError(
          cause?.name === "NotAllowedError"
            ? "The camera was refused. Allow it in the address bar, or type the code in below."
            : "No camera could be opened. Type the code in below instead.",
        );
        return;
      }

      if (!live) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      /* iOS will not play an inline video that is not muted and not marked
         playsinline, and refuses `play()` outside a gesture without both. */
      video.muted = true;
      video.playsInline = true;

      try {
        await video.play();
      } catch {
        /* Autoplay refused; the loop below still reads frames off the track. */
      }

      if (!live) return;
      setState("live");

      const tick = async () => {
        if (!live) return;

        /* Paused: keep the loop and the preview alive, skip the decode. The
           camera stays granted and warm, so dismissing a verdict puts the next
           ticket on screen instantly rather than after another permission
           round trip. */
        if (!pausedRef.current) {
          const value = await readFrame();
          if (!live) return;
          if (value) decodeRef.current?.(value);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    })();

    return () => {
      live = false;
      cancelAnimationFrame(rafRef.current);

      /* Every track, explicitly. Dropping the reference is not enough — the
         camera light stays on until the track itself is stopped, and a torch
         left burning on somebody's phone after they close the door is the kind
         of bug that gets noticed by the battery. */
      stream?.getTracks().forEach((track) => track.stop());

      const video = videoRef.current;
      if (video) video.srcObject = null;
    };
  }, [readFrame]);

  return { videoRef, canvasRef, state, error };
}
