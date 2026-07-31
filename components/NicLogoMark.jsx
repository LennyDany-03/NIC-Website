/**
 * A pure-code rebuild of `public/favicon.ico` — the NIC hexagon badge.
 *
 * Everything is derived from geometry instead of being traced by hand, so the
 * badge stays razor sharp at any size and every part of it (rings, glyphs) can
 * be animated individually. `LoadingIntro` reuses the exported primitives to
 * draw the badge on screen stroke by stroke.
 */

export const NIC_RED = "#ed0a14";
export const NIC_BONE = "#f4f4f5";
export const NIC_BLACK = "#050505";

/** Badge viewBox — pointy-top hexagon centred at (56, 64) with radius 60. */
export const VIEW_BOX = "0 0 112 128";
const CENTER = { x: 56, y: 64 };
const HEX_ANGLES = [90, 150, 210, 270, 330, 30];

/** Vertices of a pointy-top hexagon, ready for `<polygon points>`. */
export function hexPoints(radius, cx = CENTER.x, cy = CENTER.y) {
  return HEX_ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy - radius * Math.sin(rad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

export const OUTER_RADIUS = 60;
/** The concentric red rings stacked inside the white border. */
export const RING_RADII = [55, 51.5, 48, 44.5, 41, 37.5];

/**
 * The wordmark is drawn in its own 72x58 box. The transform shears it back by
 * 6deg — on the real badge the letters splay along the hexagon edges — then
 * scales it up so the glyphs ride over the inner rings, exactly like the icon.
 */
export const WORDMARK_TRANSFORM = "translate(23.83 42.74) scale(0.94) skewX(-6)";

/**
 * `d` is the letter itself; `plate` is its outer silhouette, painted black
 * underneath so the counters stay solid instead of showing the rings through.
 */
export const GLYPHS = [
  {
    key: "N",
    x: 0,
    d: "M0,0 H9 L19,34 V0 H28 V58 H19 L9,24 V58 H0 Z",
    plate: "M0,0 H28 V58 H0 Z",
  },
  {
    key: "I",
    x: 31,
    d: "M3,0 H14 L11,58 H0 Z",
    plate: "M3,0 H14 L11,58 H0 Z",
  },
  {
    key: "C",
    x: 48,
    d: "M24,0 H7 L0,9 V49 L7,58 H24 V46 H10 V12 H24 Z",
    plate: "M24,0 H7 L0,9 V49 L7,58 H24 Z",
  },
];

/** The little circuit chip tucked above the wordmark. */
export function ChipMark(props) {
  return (
    <g
      fill="none"
      stroke={NIC_RED}
      strokeWidth={0.9}
      strokeLinecap="square"
      {...props}
    >
      <rect x={49.5} y={32} width={13} height={7} />
      <path d="M52 32v-3M56 32v-3M60 32v-3M52 39v2M56 39v2M60 39v2" />
    </g>
  );
}

/** Black silhouettes that sit between the rings and the letters. */
export function WordmarkPlate(props) {
  return (
    <g transform={WORDMARK_TRANSFORM} fill={NIC_BLACK} {...props}>
      {GLYPHS.map((glyph) => (
        <path
          key={glyph.key}
          d={glyph.plate}
          transform={`translate(${glyph.x} 0)`}
        />
      ))}
    </g>
  );
}

export default function NicLogoMark({ className, title = "NIC", ...props }) {
  return (
    <svg
      viewBox={VIEW_BOX}
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <polygon points={hexPoints(OUTER_RADIUS)} fill={NIC_BLACK} />
      {RING_RADII.map((radius) => (
        <polygon
          key={radius}
          points={hexPoints(radius)}
          fill="none"
          stroke={NIC_RED}
          strokeWidth={1.5}
        />
      ))}
      <WordmarkPlate />
      <ChipMark />
      <g transform={WORDMARK_TRANSFORM} fill={NIC_RED}>
        {GLYPHS.map((glyph) => (
          <path
            key={glyph.key}
            d={glyph.d}
            transform={`translate(${glyph.x} 0)`}
          />
        ))}
      </g>
      <polygon
        points={hexPoints(OUTER_RADIUS)}
        fill="none"
        stroke={NIC_BONE}
        strokeWidth={5}
      />
    </svg>
  );
}
