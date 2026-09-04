import React from 'react';
import { buildMarkEdges, buildMarkPlates, MARK_BOUNDS } from '@/lib/brand/mark-geometry';

/**
 * THE MARK, AS VECTOR
 * ===================
 * Inline SVG rendering of the canonical EntireFM brand mark.
 *
 * TWO STATES
 * ----------
 *   wire    outlines only. What the header shows before the fragments land.
 *   solid   the assembled mark, shaded with crystalline faceted plates.
 *
 * Both layers are always rendered and cross-faded, so the transition costs
 * nothing at the moment it happens and the geometry cannot drift between the
 * two states.
 */

const PAD = 0.16;
const VIEW_BOX = [
  MARK_BOUNDS.minX - PAD,
  -MARK_BOUNDS.maxY - PAD,
  MARK_BOUNDS.maxX - MARK_BOUNDS.minX + PAD * 2,
  MARK_BOUNDS.maxY - MARK_BOUNDS.minY + PAD * 2,
].join(' ');

const EDGES = buildMarkEdges();
const PLATES = buildMarkPlates();

/** SVG's y axis points down; the model's points up. */
export const toSvgPoints = (points: Array<[number, number]>) =>
  points.map(([x, y]) => `${x.toFixed(4)},${(-y).toFixed(4)}`).join(' ');

export interface BrandMarkProps {
  state?: 'wire' | 'solid';
  className?: string;
  /** Milliseconds for the wire → solid cross-fade. */
  transitionMs?: number;
}

export function BrandMark({ state = 'solid', className = '', transitionMs = 520 }: BrandMarkProps) {
  const solid = state === 'solid';

  return (
    <svg
      viewBox={VIEW_BOX}
      className={`brand-mark-svg ${className}`}
      role="img"
      aria-label="EntireFM"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {/* Gradients for each facet to give crystalline depth */}
        {PLATES.map((plate) => (
          <linearGradient
            key={`grad-${plate.index}`}
            id={`efm-facet-grad-${plate.index}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={plate.fill} />
            <stop offset="100%" stopColor={plate.altFill || plate.fill} />
          </linearGradient>
        ))}

        {/* Neon electric cyan glow for left lobe */}
        <filter id="efmGlowCyan" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.035" floodColor="#00d2ff" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="0" stdDeviation="0.08" floodColor="#2563eb" floodOpacity="0.65" />
        </filter>

        {/* Neon magenta/purple glow for right lobe */}
        <filter id="efmGlowMagenta" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.035" floodColor="#e879f9" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="0" stdDeviation="0.08" floodColor="#a855f7" floodOpacity="0.65" />
        </filter>

        {/* Gentle crystalline shine sweep gradient */}
        <linearGradient id="efmShineSweep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="65%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Ribbon clip path for the shine sweep */}
        <clipPath id="efmRibbonClip">
          {PLATES.map((plate) => (
            <polygon key={`clip-${plate.index}`} points={toSvgPoints(plate.points)} />
          ))}
        </clipPath>

        <style>{`
          @keyframes efmMarkShine {
            0% {
              transform: translateX(-160%) skewX(-20deg);
              opacity: 0;
            }
            12% {
              opacity: 0.75;
            }
            26% {
              transform: translateX(160%) skewX(-20deg);
              opacity: 0;
            }
            100% {
              transform: translateX(160%) skewX(-20deg);
              opacity: 0;
            }
          }
          .efm-shine-sweep {
            animation: efmMarkShine 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          .group:hover .efm-shine-sweep {
            animation: efmMarkShine 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          }
        `}</style>
      </defs>

      {/* Wireframe — the resting state before the plates arrive */}
      <Wire
        stroke="currentColor"
        width={0.03}
        opacity={solid ? 0 : 1}
        transitionMs={transitionMs}
      />

      {/* Assembled solid crystalline mark with glow and gentle shine */}
      <g
        style={{
          opacity: solid ? 1 : 0,
          transition: `opacity ${transitionMs}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
        }}
      >
        {/* 1. Rich Crystalline Faceted Plates */}
        <g>
          {PLATES.map((plate) => (
            <polygon
              key={plate.index}
              points={toSvgPoints(plate.points)}
              fill={`url(#efm-facet-grad-${plate.index})`}
            />
          ))}
        </g>

        {/* 2. Lit Silver-White Seams and Internal Ridges */}
        <Wire stroke="rgba(255,255,255,0.72)" width={0.015} opacity={1} transitionMs={0} />

        {/* 3. Hot Specular Ridge Highlights */}
        <g stroke="rgba(255,255,255,0.95)" strokeWidth={0.018} strokeLinecap="round">
          {PLATES.filter((p) => p.highlight).map((p) => (
            <line
              key={`hl-${p.index}`}
              x1={p.points[0][0].toFixed(4)}
              y1={(-p.points[0][1]).toFixed(4)}
              x2={p.points[1][0].toFixed(4)}
              y2={(-p.points[1][1]).toFixed(4)}
            />
          ))}
        </g>

        {/* 4. Left Neon Cyan Perimeter Glow */}
        <g
          stroke="#00d2ff"
          strokeWidth={0.024}
          strokeLinecap="round"
          opacity={0.95}
          filter="url(#efmGlowCyan)"
        >
          {EDGES.slice(4, 16)
            .filter((_, i) => i % 4 === 0)
            .map(([a, b], i) => (
              <line
                key={`glow-l-${i}`}
                x1={a[0].toFixed(4)}
                y1={(-a[1]).toFixed(4)}
                x2={b[0].toFixed(4)}
                y2={(-b[1]).toFixed(4)}
              />
            ))}
        </g>

        {/* 5. Right Neon Magenta Perimeter Glow */}
        <g
          stroke="#e879f9"
          strokeWidth={0.024}
          strokeLinecap="round"
          opacity={0.95}
          filter="url(#efmGlowMagenta)"
        >
          {EDGES.slice(28, 44)
            .filter((_, i) => i % 4 === 0)
            .map(([a, b], i) => (
              <line
                key={`glow-r-${i}`}
                x1={a[0].toFixed(4)}
                y1={(-a[1]).toFixed(4)}
                x2={b[0].toFixed(4)}
                y2={(-b[1]).toFixed(4)}
              />
            ))}
        </g>

        {/* 6. Gentle Crystalline Shine Sweep Effect */}
        <g clipPath="url(#efmRibbonClip)" opacity={0.6} style={{ mixBlendMode: 'overlay' }}>
          <rect
            className="efm-shine-sweep"
            x="-2.5"
            y="-1.5"
            width="5"
            height="3"
            fill="url(#efmShineSweep)"
          />
        </g>
      </g>
    </svg>
  );
}

/** The mark's edges. Shared by the wireframe state and the lit seams. */
function Wire({
  stroke,
  width,
  opacity,
  transitionMs,
}: {
  stroke: string;
  width: number;
  opacity: number;
  transitionMs: number;
}) {
  return (
    <g
      style={{
        opacity,
        transition: transitionMs
          ? `opacity ${transitionMs}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
          : undefined,
      }}
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={a[0].toFixed(4)}
          y1={(-a[1]).toFixed(4)}
          x2={b[0].toFixed(4)}
          y2={(-b[1]).toFixed(4)}
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
