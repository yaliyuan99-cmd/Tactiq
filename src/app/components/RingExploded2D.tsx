/**
 * The exploded ring as a 2D engineering drawing — front elevation, parts
 * travelling along the same staged vectors the 3D view used (the choreography
 * lives in ringParts.ts and is shared). CSS transitions give the movement its
 * eased, damped feel; the site's global reduced-motion kill switch turns them
 * off wholesale.
 *
 * Engineering details: dashed leader lines tie each part back to its seat as
 * it departs, and the two-digit part numbers fade in once the assembly opens.
 *
 * Accessibility: the drawing is presentation (aria-hidden); the numbered
 * component list rendered next to it by every caller is the real control.
 * Parts are still pointer-clickable for sighted users, mirroring the list.
 */
import { RING_PARTS, type RingPart, type PartId } from '../ring3d/ringParts';

const CX = 220;
const CY = 212;
const R = 88; // band radius in px — ringParts positions are in units of R
const UNIT = 70; // px travelled per unit of explodeDistance

const EASE = (t: number) => t * t * (3 - 2 * t);

/** ringParts coords are y-up; SVG is y-down. Parts that explode along the
 * 3D z-axis get a hand-picked 2D direction instead. */
const DIR_2D: Partial<Record<PartId, [number, number]>> = {
  shell: [0, -1], // lifts away upward
  carrier: [0, 0.45], // settles slightly downward
};

function dir2d(part: RingPart): [number, number] {
  const override = DIR_2D[part.id];
  if (override) return override;
  return [part.explodeDir[0], -part.explodeDir[1]];
}

function seat2d(part: RingPart): [number, number] {
  return [CX + part.assembled[0] * R, CY - part.assembled[1] * R];
}

/** This part's eased progress within its choreography window. */
function localT(part: RingPart, explode: number): number {
  const [start, end] = part.window;
  return EASE(Math.min(1, Math.max(0, (explode - start) / (end - start))));
}

/** Band angle (degrees, math convention) for tangent-mounted parts. */
const BAND_ANGLE: Partial<Record<PartId, number>> = {
  'mag-1': 90,
  'mag-2': 210,
  'mag-3': 330,
  squeeze: 150,
  ble: 30,
};

function arcPath(deg: number, spread: number, r: number): string {
  const a0 = ((deg - spread) * Math.PI) / 180;
  const a1 = ((deg + spread) * Math.PI) / 180;
  const x0 = CX + Math.cos(a0) * r;
  const y0 = CY - Math.sin(a0) * r;
  const x1 = CX + Math.cos(a1) * r;
  const y1 = CY - Math.sin(a1) * r;
  return `M ${x0} ${y0} A ${r} ${r} 0 0 0 ${x1} ${y1}`;
}

function PartShape({ part }: { part: RingPart }) {
  const [sx, sy] = seat2d(part);
  const angle = BAND_ANGLE[part.id];
  switch (part.id) {
    case 'shell':
      return <circle cx={CX} cy={CY} r={R} fill="none" stroke={part.color} strokeWidth={30} />;
    case 'carrier':
      return <circle cx={CX} cy={CY} r={R} fill="none" stroke={part.color} strokeWidth={13} />;
    case 'mag-1':
    case 'mag-2':
    case 'mag-3':
      return (
        <rect
          x={-11}
          y={-8}
          width={22}
          height={16}
          rx={2.5}
          fill={part.color}
          transform={`translate(${sx} ${sy}) rotate(${90 - (angle ?? 0)})`}
        />
      );
    case 'squeeze':
      return (
        <path
          d={arcPath(150, 19, R)}
          fill="none"
          stroke={part.color}
          strokeWidth={13}
          strokeLinecap="round"
        />
      );
    case 'haptic':
      return (
        <g transform={`translate(${sx} ${sy})`}>
          <circle r={11} fill={part.color} />
          <circle r={4.5} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
        </g>
      );
    case 'ble':
      return (
        <g transform={`translate(${sx} ${sy}) rotate(${90 - (angle ?? 0)})`}>
          <rect x={-16} y={-9} width={32} height={18} rx={2.5} fill={part.color} />
          {/* traces */}
          <line x1={-9} y1={-3} x2={9} y2={-3} stroke="rgba(255,255,255,0.4)" strokeWidth={1.2} />
          <line x1={-9} y1={2} x2={4} y2={2} stroke="rgba(255,255,255,0.4)" strokeWidth={1.2} />
        </g>
      );
    case 'battery':
      return (
        <g transform={`translate(${sx} ${sy})`}>
          <circle r={12} fill={part.color} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.75)"
            style={{ font: '600 8px ui-monospace, monospace' }}
          >
            +
          </text>
        </g>
      );
    case 'thumb-magnet':
      return (
        <g transform={`translate(${sx} ${sy})`}>
          <circle r={10} fill={part.color} />
          <circle r={3.5} fill="rgba(255,255,255,0.6)" />
        </g>
      );
    default:
      return null;
  }
}

export default function RingExploded2D({
  explode,
  selected,
  onSelect,
  accent = 'var(--primary)',
  className,
}: {
  /** 0 = assembled, 1 = fully exploded. */
  explode: number;
  selected: PartId | null;
  onSelect: (id: PartId | null) => void;
  /** Selection colour — callers match their surface's accent. */
  accent?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 440 430"
      aria-hidden
      className={className ?? 'w-full h-auto select-none'}
      onClick={() => onSelect(null)}
    >
      {/* Draw order: carrier first so the shell reveals it as it lifts away. */}
      {[...RING_PARTS].reverse().map((part) => {
        const t = localT(part, explode);
        const [dx, dy] = dir2d(part);
        const travel = part.explodeDistance * UNIT * t;
        const tx = dx * travel;
        const ty = dy * travel;
        const [sx, sy] = seat2d(part);
        const appeared = part.appearsAt === undefined || explode >= part.appearsAt;
        const isSelected = selected === part.id;
        const dimmed = selected !== null && !isSelected;
        // Number label sits just beyond the part (coords are inside the
        // translated group, so seat-relative only). Shell's label goes to the
        // upper-left so it never collides with magnetometer 1 at the top.
        const lx =
          part.id === 'shell' ? CX - R - 26 : sx + dx * 26 + (dx === 0 ? 26 : 0);
        const ly =
          part.id === 'shell'
            ? CY - R + 4
            : sy + dy * 26 - (part.id === 'carrier' ? -(R + 10) : 0);

        return (
          <g key={part.id} style={{ opacity: appeared ? (dimmed ? 0.25 : 1) : 0, transition: 'opacity 0.3s ease' }}>
            {/* Leader line back to the seat, drawn as the part departs. */}
            {t > 0.04 && part.id !== 'shell' && part.id !== 'carrier' && part.id !== 'thumb-magnet' && (
              <line
                x1={sx}
                y1={sy}
                x2={sx + tx}
                y2={sy + ty}
                stroke="currentColor"
                strokeOpacity={0.3 * t}
                strokeWidth={1}
                strokeDasharray="2 4"
              />
            )}

            <g
              style={{
                transform: `translate(${tx}px, ${ty}px)`,
                transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(isSelected ? null : part.id);
              }}
            >
              <PartShape part={part} />
              {/* Selection halo */}
              {isSelected &&
                (part.id === 'shell' || part.id === 'carrier' ? (
                  <circle
                    cx={CX}
                    cy={CY}
                    r={R + (part.id === 'shell' ? 22 : 12)}
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                ) : part.id === 'squeeze' ? (
                  <path
                    d={arcPath(150, 24, R)}
                    fill="none"
                    stroke={accent}
                    strokeWidth={22}
                    strokeLinecap="round"
                    strokeOpacity={0.35}
                  />
                ) : (
                  <circle cx={sx} cy={sy} r={22} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 4" />
                ))}

              {/* Engineering number, fading in as the assembly opens. */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fill={isSelected ? accent : 'currentColor'}
                fillOpacity={Math.max(0, Math.min(1, (explode - 0.3) * 3)) * (isSelected ? 1 : 0.55)}
                style={{ font: '600 11px ui-monospace, monospace', letterSpacing: '0.05em' }}
              >
                {part.number}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
