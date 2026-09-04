/**
 * ENTIREFM MARK — PROCEDURAL GEOMETRY
 * ===================================
 * The supplied logo files are raster images (the .svg files are just embedded
 * PNGs), so there is no vector geometry to animate. This rebuilds the mark as
 * real geometry so its individual facets can be addressed — flown in for the
 * intro assembly, lit per-face in WebGL, or emitted as SVG polygons.
 *
 * CONSTRUCTION
 * ------------
 * The mark is a single continuous ribbon that crosses itself — a figure-8,
 * not two separate rings. Reading the wireframe closely: the band leaves the
 * lower-right of the left lobe, travels up-right into the top-left of the
 * right lobe, wraps that lobe, then returns from its lower-left up to the
 * top-right of the left lobe. Those two crossing runs are what form the X at
 * the centre, and they are why the lobes cannot simply be drawn as closed
 * hexagons.
 *
 * The centreline is therefore one closed 12-vertex loop:
 *
 *      L5 → L0 → L1 → L2 → L3 → L4      five edges around the left lobe
 *      L4 ⇢ R1                          crossing run, up and to the right
 *      R1 → R0 → R5 → R4 → R3 → R2      five edges around the right lobe
 *      R2 ⇢ L5                          crossing run, up and to the left
 *
 * where each lobe's vertices are a pointy-top hexagon, index 0 at 12 o'clock
 * and running anticlockwise.
 *
 * The ribbon is then built by walking that loop twice — once at the outer
 * radius and once at the inner — and triangulating between the two, giving
 * two facets per segment. Extruding in z gives the crystalline thickness.
 *
 * A horizontal squash is applied at the end: the supplied artwork is an
 * isometric projection, so the mark is noticeably narrower than a true
 * regular hexagon would be.
 */

export interface Facet {
  /** Triangle corners in model space. */
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  /** 0–1 position across the whole mark, left to right. Drives the gradient. */
  t: number;
  /** Which lobe this facet belongs to. */
  lobe: 'left' | 'right';
  /** Stable index, used to stagger the assembly animation. */
  index: number;
}

const OUTER_RADIUS = 1;
const INNER_RADIUS = 0.61;
/** Horizontal distance of each lobe centre from the origin. */
const LOBE_OFFSET = 1.16;
/** Half-thickness of the extruded ribbon. */
const DEPTH = 0.1;
/** Isometric horizontal squash — the artwork is a projection, not a plan view. */
const SQUASH = 0.81;

/** Pointy-top hexagon: index 0 at 12 o'clock, running anticlockwise. */
function hexagon(radius: number, cx: number): Array<[number, number]> {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 2 + (i * Math.PI) / 3;
    return [cx + radius * Math.cos(angle), radius * Math.sin(angle)] as [number, number];
  });
}

/**
 * The closed centreline loop at a given radius, in the order described above.
 * Both the outer and inner boundaries follow this same connectivity, which is
 * what keeps the ribbon consistent through the crossing.
 */
function ribbonLoop(radius: number): Array<[number, number]> {
  const L = hexagon(radius, -LOBE_OFFSET);
  const R = hexagon(radius, LOBE_OFFSET);
  //     ── left lobe ──          cross      ── right lobe ──         cross
  return [L[5], L[0], L[1], L[2], L[3], L[4], R[1], R[0], R[5], R[4], R[3], R[2]];
}

const squash = (p: [number, number]): [number, number] => [p[0] * SQUASH, p[1]];

export function buildMarkFacets(): Facet[] {
  const outer = ribbonLoop(OUTER_RADIUS).map(squash);
  const inner = ribbonLoop(INNER_RADIUS).map(squash);
  const span = 2 * (LOBE_OFFSET + OUTER_RADIUS) * SQUASH;

  const facets: Facet[] = [];
  let index = 0;

  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length;
    const O1 = outer[i];
    const O2 = outer[j];
    const I1 = inner[i];
    const I2 = inner[j];

    const quads: Array<[[number, number], [number, number], [number, number]]> = [
      [O1, O2, I1],
      [O2, I2, I1],
    ];

    for (const [p, q, r] of quads) {
      const centroidX = (p[0] + q[0] + r[0]) / 3;
      const t = Math.min(1, Math.max(0, (centroidX + span / 2) / span));
      const lobe: 'left' | 'right' = centroidX < 0 ? 'left' : 'right';

      // Front and back faces.
      for (const z of [DEPTH, -DEPTH]) {
        facets.push({
          a: [p[0], p[1], z],
          b: [q[0], q[1], z],
          c: [r[0], r[1], z],
          t,
          lobe,
          index: index++,
        });
      }
    }

    // Outer and inner rims, giving the ribbon a visible edge when rotated.
    for (const [e1, e2] of [
      [O1, O2],
      [I2, I1],
    ] as Array<[[number, number], [number, number]]>) {
      const centroidX = (e1[0] + e2[0]) / 2;
      const t = Math.min(1, Math.max(0, (centroidX + span / 2) / span));
      const lobe: 'left' | 'right' = centroidX < 0 ? 'left' : 'right';
      facets.push({
        a: [e1[0], e1[1], DEPTH],
        b: [e2[0], e2[1], DEPTH],
        c: [e2[0], e2[1], -DEPTH],
        t, lobe, index: index++,
      });
      facets.push({
        a: [e1[0], e1[1], DEPTH],
        b: [e2[0], e2[1], -DEPTH],
        c: [e1[0], e1[1], -DEPTH],
        t, lobe, index: index++,
      });
    }
  }

  return facets;
}

/** Edges of the wireframe state — outer loop, inner loop, and the rungs between. */
export function buildMarkEdges(): Array<[[number, number], [number, number]]> {
  const outer = ribbonLoop(OUTER_RADIUS).map(squash);
  const inner = ribbonLoop(INNER_RADIUS).map(squash);
  const edges: Array<[[number, number], [number, number]]> = [];

  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length;
    edges.push([outer[i], outer[j]]);
    edges.push([inner[i], inner[j]]);
    edges.push([outer[i], inner[i]]);
    edges.push([outer[j], inner[i]]); // facet diagonal
  }

  return edges;
}

/** Bounds of the mark in model space, for fitting it to a viewBox. */
export const MARK_BOUNDS = {
  minX: -(LOBE_OFFSET + OUTER_RADIUS) * SQUASH,
  maxX: (LOBE_OFFSET + OUTER_RADIUS) * SQUASH,
  minY: -OUTER_RADIUS,
  maxY: OUTER_RADIUS,
};

/** The brand spectrum, sampled at `t` (0 = electric blue, 1 = purple). */
export function spectrumAt(t: number): [number, number, number] {
  const stops: Array<{ at: number; rgb: [number, number, number] }> = [
    { at: 0, rgb: [0x25, 0x63, 0xeb] },
    { at: 0.38, rgb: [0x4f, 0x46, 0xe5] },
    { at: 0.7, rgb: [0x7c, 0x3a, 0xed] },
    { at: 1, rgb: [0xa8, 0x55, 0xf7] },
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const lo = stops[i];
    const hi = stops[i + 1];
    if (t > hi.at) continue;
    const k = (t - lo.at) / (hi.at - lo.at);
    return [
      lo.rgb[0] + (hi.rgb[0] - lo.rgb[0]) * k,
      lo.rgb[1] + (hi.rgb[1] - lo.rgb[1]) * k,
      lo.rgb[2] + (hi.rgb[2] - lo.rgb[2]) * k,
    ];
  }
  return stops[stops.length - 1].rgb;
}

export interface Plate {
  /** Triangle corners, in model space. */
  points: Array<[number, number]>;
  /** Final fill, already shaded. */
  fill: string;
  /** Secondary gradient color for rich facet depth. */
  altFill: string;
  /** Stable index — drives the assembly stagger. */
  index: number;
  /** Centroid, used to throw the fragment outward from the mark. */
  centroid: [number, number];
  /** Whether this facet carries a key specular highlight. */
  highlight?: boolean;
}

/**
 * Authentic crystalline facet colors directly tuned and calibrated from the
 * official 06 Crystalline Colour Mark artwork.
 */
export const CRYSTALLINE_FACET_PALETTE: Array<{ fill: string; altFill: string; highlight?: boolean }> = [
  { fill: '#c7d2fe', altFill: '#6366f1', highlight: true },   // 0: left top outer (specular glass highlight)
  { fill: '#3b82f6', altFill: '#1d4ed8' },                    // 1: left top inner (vibrant cobalt)
  { fill: '#1d4ed8', altFill: '#1e40af' },                    // 2: left top-left outer (electric blue)
  { fill: '#0d4db8', altFill: '#092d6e' },                    // 3: left top-left inner (deep azure)
  { fill: '#38bdf8', altFill: '#0284c7', highlight: true },   // 4: left apex outer (ice cyan reflection)
  { fill: '#0369a1', altFill: '#0c2340' },                    // 5: left apex inner (deep navy)
  { fill: '#0066ff', altFill: '#0047b3' },                    // 6: left bottom-left outer (vivid electric blue)
  { fill: '#0137aa', altFill: '#012066' },                    // 7: left bottom-left inner (rich blue)
  { fill: '#0122ba', altFill: '#001366' },                    // 8: left bottom outer (indigo blue)
  { fill: '#0024b8', altFill: '#00104d' },                    // 9: left bottom inner (cobalt)
  { fill: '#0284c7', altFill: '#0369a1' },                    // 10: crossing lower-left to upper-right (bright electric)
  { fill: '#3b82f6', altFill: '#2563eb' },                    // 11: crossing center-left (bright sapphire)
  { fill: '#1e1145', altFill: '#100826' },                    // 12: right top-left outer (deep obsidian violet)
  { fill: '#6366f1', altFill: '#4338ca' },                    // 13: right top-left inner (electric indigo-violet)
  { fill: '#ab58f1', altFill: '#7c3aed', highlight: true },   // 14: right top outer (vibrant purple/violet)
  { fill: '#c084fc', altFill: '#9333ea', highlight: true },   // 15: right top inner (bright lilac/purple)
  { fill: '#403a4f', altFill: '#231f2b' },                    // 16: right apex outer (metallic smoked amethyst)
  { fill: '#252030', altFill: '#14111a' },                    // 17: right apex inner (dark crystal)
  { fill: '#1e1929', altFill: '#0f0c14' },                    // 18: right bottom-right outer (dark obsidian)
  { fill: '#281c3b', altFill: '#150d21' },                    // 19: right bottom-right inner (dark violet crystal)
  { fill: '#e879f9', altFill: '#c026d3', highlight: true },   // 20: right bottom outer (vivid neon magenta)
  { fill: '#7c3aed', altFill: '#4c1d95' },                    // 21: right bottom inner (deep royal violet)
  { fill: '#002191', altFill: '#00114d' },                    // 22: crossing lower-right to upper-left (deep sapphire)
  { fill: '#4f46e5', altFill: '#3730a3' },                    // 23: crossing center-right (royal blue/violet)
];

export function buildMarkPlates(): Plate[] {
  const outer = ribbonLoop(OUTER_RADIUS).map(squash);
  const inner = ribbonLoop(INNER_RADIUS).map(squash);

  const plates: Plate[] = [];
  let index = 0;

  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length;
    const O1 = outer[i];
    const O2 = outer[j];
    const I1 = inner[i];
    const I2 = inner[j];

    const triangles: Array<Array<[number, number]>> = [
      [O1, O2, I1],
      [O2, I2, I1],
    ];

    for (const points of triangles) {
      const cx = (points[0][0] + points[1][0] + points[2][0]) / 3;
      const cy = (points[0][1] + points[1][1] + points[2][1]) / 3;
      const palette = CRYSTALLINE_FACET_PALETTE[index] || { fill: '#2563eb', altFill: '#1d4ed8' };

      plates.push({
        points,
        fill: palette.fill,
        altFill: palette.altFill,
        highlight: palette.highlight,
        index: index++,
        centroid: [cx, cy],
      });
    }
  }

  return plates;
}
