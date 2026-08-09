/**
 * Sensor localisation demo — move the passive thumb magnet around the hand
 * and watch the three magnetometer channels respond, with the estimated
 * contact easing to the nearest point.
 *
 * Every number here is synthetic (distance-based), and the panel says so.
 * The magnet is a real focusable control: arrow keys move it, and the
 * estimate line is the accessible output (announced only when the estimated
 * contact actually changes, so screen readers are not flooded).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { HandIllustration } from './SimHand';
import { gesturePoints, type GesturePoint } from '../../lib/gestures';
import { announce } from '../../lib/announce';
import { cn } from '../../lib/utils';

/** Magnetometer anchors, in % of the hand box — around the ring's band. */
const SENSORS: { id: 'M1' | 'M2' | 'M3'; x: number; y: number }[] = [
  { id: 'M1', x: 24, y: 46 },
  { id: 'M2', x: 36, y: 46 },
  { id: 'M3', x: 30, y: 55 },
];

function pct(v: string): number {
  return parseFloat(v);
}

export default function SensorDemo({ mirrored = false }: { mirrored?: boolean }) {
  // Magnet position in % of the hand box.
  const [pos, setPos] = useState({ x: 55, y: 40 });
  const boxRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const lastAnnounced = useRef<string>('');

  const mx = (x: number) => (mirrored ? 100 - x : x);

  const readings = useMemo(
    () =>
      SENSORS.map((s) => {
        const dist = Math.hypot(pos.x - mx(s.x), pos.y - s.y);
        // Synthetic falloff: full signal when touching, ~zero at 80% away.
        const value = Math.max(0, Math.min(1, 1 - dist / 80));
        return { id: s.id, value: Math.round(value * 100) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pos, mirrored],
  );

  const nearest: GesturePoint = useMemo(() => {
    let best = gesturePoints[0];
    let bestDist = Infinity;
    for (const p of gesturePoints) {
      const d = Math.hypot(pos.x - mx(pct(p.x)), pos.y - pct(p.y));
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, mirrored]);

  const estimateLabel = `${nearest.finger} ${nearest.position.toLowerCase()}`;
  useEffect(() => {
    if (lastAnnounced.current === estimateLabel) return;
    lastAnnounced.current = estimateLabel;
    if (lastAnnounced.current) announce(`Estimated contact: ${estimateLabel}.`);
  }, [estimateLabel]);

  const moveTo = (clientX: number, clientY: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    setPos({
      x: Math.min(96, Math.max(4, ((clientX - box.left) / box.width) * 100)),
      y: Math.min(96, Math.max(4, ((clientY - box.top) / box.height) * 100)),
    });
  };

  return (
    <div className="grid md:grid-cols-[minmax(0,340px)_1fr] gap-8 items-start">
      <div
        ref={boxRef}
        className="relative w-full max-w-sm touch-none select-none"
        onPointerMove={(e) => {
          if (draggingRef.current) moveTo(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerLeave={() => {
          draggingRef.current = false;
        }}
      >
        <HandIllustration mirrored={mirrored} />

        {/* Sensor anchors */}
        {SENSORS.map((s) => (
          <span
            key={s.id}
            aria-hidden
            style={{ position: 'absolute', left: `${mx(s.x)}%`, top: `${s.y}%` }}
            className="-translate-x-1/2 -translate-y-1/2 font-mono-label text-[0.6rem] text-primary-strong bg-background/85 rounded px-1"
          >
            {s.id}
          </span>
        ))}

        {/* Estimated contact marker — eases, never teleports. */}
        <span
          aria-hidden
          style={{ position: 'absolute', left: nearest.x, top: nearest.y }}
          className="-translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-primary transition-all duration-500 ease-out"
        />

        {/* The draggable magnet */}
        <button
          type="button"
          aria-label={`Thumb magnet. Use arrow keys to move it around the hand. Estimated contact: ${estimateLabel}.`}
          onPointerDown={(e) => {
            draggingRef.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e) => {
            const step = 3;
            if (e.key === 'ArrowLeft') setPos((p) => ({ ...p, x: Math.max(4, p.x - step) }));
            else if (e.key === 'ArrowRight') setPos((p) => ({ ...p, x: Math.min(96, p.x + step) }));
            else if (e.key === 'ArrowUp') setPos((p) => ({ ...p, y: Math.max(4, p.y - step) }));
            else if (e.key === 'ArrowDown') setPos((p) => ({ ...p, y: Math.min(96, p.y + step) }));
            else return;
            e.preventDefault();
          }}
          style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%` }}
          className="-translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-foreground text-background text-[0.6rem] font-semibold cursor-grab active:cursor-grabbing shadow-md"
        >
          MAG
        </button>
      </div>

      <div className="min-w-0">
        <p className="font-mono-label text-status-simulation mb-4">
          Interactive demonstration — synthetic values, not hardware measurements.
        </p>

        {/* Channel bars */}
        <div className="space-y-3 max-w-xs">
          {readings.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="font-mono-label w-7 shrink-0">{r.id}</span>
              <div
                role="meter"
                aria-label={`${r.id} signal`}
                aria-valuenow={r.value}
                aria-valuemin={0}
                aria-valuemax={100}
                className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden"
              >
                <div
                  className={cn('h-full bg-primary transition-[width] duration-200')}
                  style={{ width: `${r.value}%` }}
                />
              </div>
              <span className="font-mono-label text-muted-foreground w-10 text-right shrink-0">
                {r.value}%
              </span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[0.95rem]">
          Estimated contact:{' '}
          <span className="font-medium">{estimateLabel}</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground max-w-[48ch]">
          The real system would do exactly this on-device: three field strengths in, one
          contact estimate out. No camera, no microphone — nothing observes the hand except
          the magnet's own field.
        </p>
      </div>
    </div>
  );
}
