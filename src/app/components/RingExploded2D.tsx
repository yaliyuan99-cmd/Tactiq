/**
 * The exploded ring as a 2D engineering drawing — an axonometric product
 * view where the assembly separates vertically along one axis, the way a
 * classic exploded product sheet does. Rings are ellipses in perspective;
 * each layer travels within its own choreography window (shared with
 * ringParts.ts), so the shell lifts away first and the electronics separate
 * last, with thin leader lines carrying part numbers to the margins.
 *
 * CSS transitions give the motion its eased, damped feel; the global
 * reduced-motion kill switch disables them wholesale.
 *
 * Accessibility: the drawing is presentation (aria-hidden); the numbered
 * component list rendered next to it by every caller is the real control.
 * Parts stay pointer-clickable, mirroring the list.
 */
import type { ReactNode } from 'react';
import { RING_PARTS, type RingPart, type PartId } from './ringParts';

const CX = 220;
const CY = 232; // assembled resting centre
const RX = 105; // band ellipse radii (perspective)
const RY = 34;

const EASE = (t: number) => t * t * (3 - 2 * t);

/** Vertical travel per layer at 100% explode (negative = upward). */
const OFFSET: Record<PartId, number> = {
  shell: -152,
  carrier: -80,
  'mag-1': -20,
  'mag-2': -20,
  'mag-3': -20,
  squeeze: 44,
  haptic: 90,
  ble: 134,
  battery: 174,
  'thumb-magnet': 0,
};

/** Which margin a layer's leader line runs to (mags get local numbers). */
const LEADER: Partial<Record<PartId, 'left' | 'right'>> = {
  shell: 'left',
  carrier: 'right',
  squeeze: 'right',
  haptic: 'left',
  ble: 'right',
  battery: 'left',
};

/** Position around the band ellipse (degrees; 0 = right, 90 = front). */
function onEllipse(deg: number, layerY: number, scale = 0.9): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CX + Math.cos(rad) * RX * scale, layerY + Math.sin(rad) * RY * scale];
}

/** Annulus (ring band) seen in perspective, as an evenodd ellipse pair. */
function bandPath(cy: number, rxOuter: number, ryOuter: number, rxInner: number, ryInner: number): string {
  return (
    `M ${CX - rxOuter} ${cy} a ${rxOuter} ${ryOuter} 0 1 0 ${rxOuter * 2} 0 a ${rxOuter} ${ryOuter} 0 1 0 ${-rxOuter * 2} 0 Z ` +
    `M ${CX - rxInner} ${cy} a ${rxInner} ${ryInner} 0 1 0 ${rxInner * 2} 0 a ${rxInner} ${ryInner} 0 1 0 ${-rxInner * 2} 0 Z`
  );
}

function localT(part: RingPart, explode: number): number {
  const [start, end] = part.window;
  return EASE(Math.min(1, Math.max(0, (explode - start) / (end - start))));
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
  const parts = Object.fromEntries(RING_PARTS.map((p) => [p.id, p])) as Record<PartId, RingPart>;
  const y = (id: PartId) => CY + OFFSET[id] * localT(parts[id], explode);
  const opened = explode > 0.06;

  /** Layers hidden inside the band at rest — they materialise as it opens. */
  const INTERNAL = new Set<PartId>(['squeeze', 'haptic', 'ble', 'battery']);

  /** Shared wrapper for a selectable layer. */
  const layer = (id: PartId, children: ReactNode, haloRy = RY + 10, haloRx = RX + 14) => {
    const isSelected = selected === id;
    const dimmed = selected !== null && !isSelected;
    const side = LEADER[id];
    const cy = y(id);
    const t = localT(parts[id], explode);
    const reveal = INTERNAL.has(id) ? Math.min(1, Math.max(0, (explode - 0.05) * 5)) : 1;
    return (
      <g
        key={id}
        style={{ opacity: reveal * (dimmed ? 0.22 : 1), transition: 'opacity 0.3s ease' }}
      >
        <g
          style={{
            transform: `translateY(${cy - CY}px)`,
            transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(isSelected ? null : id);
          }}
        >
          {children}
          {isSelected && (
            <ellipse
              cx={CX}
              cy={CY}
              rx={haloRx}
              ry={haloRy}
              fill="none"
              stroke={accent}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
          )}
          {/* Leader line + part number, drawn as the assembly opens. */}
          {side && (
            <g style={{ opacity: Math.max(0, (t - 0.45) * 2.2), transition: 'opacity 0.3s ease' }}>
              <line
                x1={side === 'left' ? 34 : CX + RX + 14}
                x2={side === 'left' ? CX - RX - 14 : 406}
                y1={CY}
                y2={CY}
                stroke="currentColor"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
              <text
                x={side === 'left' ? 22 : 418}
                y={CY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? accent : 'currentColor'}
                fillOpacity={isSelected ? 1 : 0.6}
                style={{ font: '600 11px ui-monospace, monospace', letterSpacing: '0.05em' }}
              >
                {parts[id].number}
              </text>
            </g>
          )}
        </g>
      </g>
    );
  };

  /** A small part riding a layer, with its number beside it once opened. */
  const rider = (
    id: PartId,
    deg: number,
    children: ReactNode,
    numberDx = 0,
    numberDy = -16,
  ) => {
    const isSelected = selected === id;
    const dimmed = selected !== null && !isSelected;
    const part = parts[id];
    const cy = y(id);
    const t = localT(part, explode);
    const [px, py] = onEllipse(deg, CY);
    return (
      <g key={id} style={{ opacity: dimmed ? 0.22 : 1, transition: 'opacity 0.3s ease' }}>
        <g
          style={{
            transform: `translateY(${cy - CY}px)`,
            transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(isSelected ? null : id);
          }}
        >
          <g transform={`translate(${px} ${py})`}>
            {children}
            {isSelected && (
              <circle r={20} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 4" />
            )}
            <text
              x={numberDx}
              y={numberDy}
              textAnchor="middle"
              fill={isSelected ? accent : 'currentColor'}
              fillOpacity={Math.max(0, (t - 0.4) * 2.2) * (isSelected ? 1 : 0.6)}
              style={{ font: '600 10px ui-monospace, monospace', letterSpacing: '0.05em', transition: 'fill-opacity 0.3s ease' }}
            >
              {part.number}
            </text>
          </g>
        </g>
      </g>
    );
  };

  const magnetT = localT(parts['thumb-magnet'], explode);
  const magnetVisible = explode >= (parts['thumb-magnet'].appearsAt ?? 0.72);

  return (
    <svg
      viewBox="0 0 440 470"
      aria-hidden
      className={className ?? 'w-full h-auto select-none'}
      onClick={() => onSelect(null)}
    >
      {/* Faint assembly axis, revealed as the stack opens. */}
      <line
        x1={CX}
        x2={CX}
        y1={y('shell') + 4}
        y2={y('battery') - 4}
        stroke="currentColor"
        strokeOpacity={opened ? 0.18 : 0}
        strokeWidth={1}
        strokeDasharray="3 5"
        style={{ transition: 'stroke-opacity 0.3s ease' }}
      />

      {/* Bottom-up draw order so upper layers overlap naturally. */}
      {layer(
        'battery',
        <g>
          <path d={bandPath(CY + 5, 26, 9, 0.01, 0.01)} fill={parts.battery.color} fillRule="evenodd" />
          <rect x={CX - 26} y={CY - 3} width={52} height={8} fill={parts.battery.color} />
          <ellipse cx={CX} cy={CY - 3} rx={26} ry={9} fill="#5a6d8c" />
          <text
            x={CX}
            y={CY - 3}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.8)"
            style={{ font: '600 9px ui-monospace, monospace' }}
          >
            +
          </text>
        </g>,
        18,
        44,
      )}

      {layer(
        'ble',
        <g>
          <rect x={CX - 34} y={CY - 12} width={68} height={24} rx={3} fill={parts.ble.color} transform={`rotate(-6 ${CX} ${CY})`} />
          <line x1={CX - 20} y1={CY - 4} x2={CX + 22} y2={CY - 8} stroke="rgba(255,255,255,0.45)" strokeWidth={1.4} />
          <line x1={CX - 20} y1={CY + 3} x2={CX + 8} y2={CY} stroke="rgba(255,255,255,0.45)" strokeWidth={1.4} />
          <circle cx={CX + 24} cy={CY + 4} r={2.2} fill="rgba(255,255,255,0.6)" />
        </g>,
        22,
        48,
      )}

      {layer(
        'haptic',
        <g>
          <path d={bandPath(CY + 4, 15, 6, 0.01, 0.01)} fill={parts.haptic.color} fillRule="evenodd" />
          <rect x={CX - 15} y={CY - 2} width={30} height={6} fill={parts.haptic.color} />
          <ellipse cx={CX} cy={CY - 2} rx={15} ry={6} fill="#9a917f" />
          <ellipse cx={CX} cy={CY - 2} rx={6} ry={2.4} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.2} />
        </g>,
        16,
        32,
      )}

      {layer(
        'squeeze',
        <path
          d={`M ${CX - RX * 0.82} ${CY + RY * 0.35} A ${RX * 0.86} ${RY * 0.86} 0 0 0 ${CX + RX * 0.82} ${CY + RY * 0.35}`}
          fill="none"
          stroke={parts.squeeze.color}
          strokeWidth={11}
          strokeLinecap="round"
        />,
        RY + 6,
        RX + 8,
      )}

      {/* Sensing ring with the three magnetometers riding it. */}
      {layer(
        'carrier',
        <path d={bandPath(CY, 92, 28, 78, 21)} fill={parts.carrier.color} fillRule="evenodd" />,
        38,
        104,
      )}
      {rider(
        'mag-1',
        205,
        <rect x={-10} y={-7} width={20} height={14} rx={2.5} fill={parts['mag-1'].color} />,
        -20,
        -12,
      )}
      {rider(
        'mag-2',
        270,
        <rect x={-10} y={-7} width={20} height={14} rx={2.5} fill={parts['mag-2'].color} />,
        0,
        22,
      )}
      {rider(
        'mag-3',
        335,
        <rect x={-10} y={-7} width={20} height={14} rx={2.5} fill={parts['mag-3'].color} />,
        20,
        -12,
      )}

      {/* Outer shell — the thick band that lifts away first. */}
      {layer(
        'shell',
        <path d={bandPath(CY, RX, RY, 74, 20)} fill={parts.shell.color} fillRule="evenodd" />,
        RY + 8,
        RX + 10,
      )}

      {/* The passive thumb magnet — never inside the ring; appears last. */}
      <g
        style={{
          opacity: magnetVisible ? (selected !== null && selected !== 'thumb-magnet' ? 0.22 : 1) : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        <g
          style={{
            transform: `translate(${18 * magnetT}px, ${12 * magnetT}px)`,
            transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(selected === 'thumb-magnet' ? null : 'thumb-magnet');
          }}
        >
          <g transform="translate(374 404)">
            <ellipse cx={0} cy={3} rx={13} ry={5} fill={parts['thumb-magnet'].color} />
            <rect x={-13} y={-2} width={26} height={5} fill={parts['thumb-magnet'].color} />
            <ellipse cx={0} cy={-2} rx={13} ry={5} fill="#3d3830" />
            <circle cx={0} cy={-2} r={3} fill="rgba(255,255,255,0.55)" />
            {selected === 'thumb-magnet' && (
              <circle r={22} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 4" />
            )}
            <text
              x={0}
              y={-18}
              textAnchor="middle"
              fill={selected === 'thumb-magnet' ? accent : 'currentColor'}
              fillOpacity={selected === 'thumb-magnet' ? 1 : 0.6}
              style={{ font: '600 10px ui-monospace, monospace', letterSpacing: '0.05em' }}
            >
              {parts['thumb-magnet'].number}
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}
