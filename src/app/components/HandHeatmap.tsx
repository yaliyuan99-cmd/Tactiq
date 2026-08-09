/**
 * The hand as the chart. Contact points grow and deepen with use, so
 * "your most-used controls" reads directly on the physical interface
 * instead of an abstract bar chart.
 *
 * Accessibility: every point is a real <button> whose name carries the
 * full statistic ("Index tip: Confirm — 12 uses, 31%"). Numbers are also
 * mirrored in the caller's text list; colour and size are never the only
 * carriers. Clicking a point filters the caller's timeline (digital-twin
 * rule: touch the hand, the data follows).
 */
import { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { HandIllustration } from './SimHand';
import { gesturePoints, kindOf, type ContactId } from '../../lib/gestures';

export interface HeatEntry {
  count: number;
  /** Share of all uses, 0–1. */
  share: number;
  /** Command name most recently associated with the point. */
  command: string;
}

export type HeatByContact = Partial<Record<ContactId, HeatEntry>>;

export default function HandHeatmap({
  heat,
  selectedId,
  onSelect,
  flashId,
  mirrored = false,
  className,
}: {
  heat: HeatByContact;
  /** Currently used as a timeline filter; null = no filter. */
  selectedId: ContactId | null;
  onSelect: (id: ContactId | null) => void;
  /** Point briefly flashed from outside ("show on hand"). */
  flashId?: ContactId | null;
  mirrored?: boolean;
  className?: string;
}) {
  const maxShare = useMemo(
    () => Math.max(0.0001, ...Object.values(heat).map((h) => h?.share ?? 0)),
    [heat],
  );

  return (
    <div
      role="group"
      aria-label="Usage by contact point. Each button reports its command and use count; activating one filters the timeline."
      className={cn('relative w-full max-w-sm select-none', className)}
    >
      <HandIllustration mirrored={mirrored} />
      {gesturePoints.map((point) => {
        const entry = heat[point.id];
        const share = entry?.share ?? 0;
        /* 0 uses → small hollow dot; heaviest use → 56px solid. */
        const size = 22 + (share / maxShare) * 34;
        const used = (entry?.count ?? 0) > 0;
        const isSelected = selectedId === point.id;
        const kind = kindOf(point);
        const left = mirrored ? `calc(100% - ${point.x})` : point.x;
        const pct = Math.round(share * 100);
        return (
          <button
            key={point.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${point.finger} ${point.position.toLowerCase()}: ${
              entry?.command ?? point.label
            } — ${entry?.count ?? 0} uses, ${pct} percent.${isSelected ? ' Filtering timeline.' : ''}`}
            onClick={() => onSelect(isSelected ? null : point.id)}
            style={{ position: 'absolute', left, top: point.y, width: size, height: size }}
            className={cn(
              '-translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300',
              used
                ? kind === 'fixed'
                  ? 'bg-foreground text-background'
                  : 'bg-primary text-primary-foreground'
                : 'border-2 border-muted-foreground/40 bg-background',
              isSelected && 'outline-2 outline-offset-4 outline-primary-strong',
              flashId === point.id && 'sim-flash',
              /* keep the hit target ≥44px even when the dot is small */
              'before:absolute before:inset-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-11 before:h-11 before:content-[""] before:rounded-full',
            )}
          >
            {used && size >= 34 && (
              <span aria-hidden className="text-[0.6rem] font-semibold leading-none">
                {pct}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
