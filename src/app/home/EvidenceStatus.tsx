/**
 * Evidence-status labels — the visual honesty system.
 * Every factual claim on the site can carry one of four statuses so visitors
 * always know what is measured, what is simulated, what is a target and what
 * is still a plan. Icon + text always accompany the colour, so the meaning
 * never depends on colour alone.
 */
import { CheckCircle2, FlaskConical, Target, CalendarClock } from 'lucide-react';

export type EvidenceKind = 'confirmed' | 'simulation' | 'target' | 'future';

const KINDS: Record<
  EvidenceKind,
  { label: string; color: string; Icon: typeof CheckCircle2 }
> = {
  confirmed: { label: 'Confirmed fact', color: 'text-status-confirmed', Icon: CheckCircle2 },
  simulation: { label: 'Simulation result', color: 'text-status-simulation', Icon: FlaskConical },
  target: { label: 'Design target', color: 'text-status-target', Icon: Target },
  future: { label: 'Planned — not yet measured', color: 'text-status-future', Icon: CalendarClock },
};

export default function EvidenceStatus({
  kind,
  children,
}: {
  kind: EvidenceKind;
  /** Optional override for the visible label (e.g. "Planned bench test"). */
  children?: string;
}) {
  const { label, color, Icon } = KINDS[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono-label ${color}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {children ?? label}
    </span>
  );
}
