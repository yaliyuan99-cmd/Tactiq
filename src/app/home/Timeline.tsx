/**
 * Project status — a transparent timeline. Completed, current and future
 * stages are distinguished by icon + text label, never by colour alone.
 * No animated progress percentages: nothing here pretends to be measurable
 * completion.
 */
import { CheckCircle2, CircleDot, Circle } from 'lucide-react';

type Stage = 'done' | 'current' | 'future';

const STAGES: { name: string; when: string; state: Stage; note: string }[] = [
  { name: 'Design study', when: 'completed', state: 'done', note: 'Nine design principles; capacity analysis found the knee at eight contact points.' },
  { name: 'Physics simulation', when: 'completed', state: 'done', note: 'Magnet trilateration simulated: ~1.65 mm localisation at the array centre.' },
  { name: 'Prototype construction', when: 'now', state: 'current', note: 'Bench hardware built from off-the-shelf parts — under $60 in components.' },
  { name: 'Bench experiment', when: 'Aug–Oct 2026', state: 'future', note: 'Real thumbs, prompted trials, pre-registered accuracy and false-activation targets.' },
  { name: 'Analysis & write-up', when: 'Oct–Nov 2026', state: 'future', note: 'Results against the pre-registered targets, whatever they turn out to be.' },
  { name: 'AUSSEF submission', when: '11 Nov 2026', state: 'future', note: 'Australian Science and Engineering Fair entry; a possible ISEF 2027 pathway follows.' },
];

const STATE_META: Record<Stage, { Icon: typeof Circle; label: string; cls: string }> = {
  done: { Icon: CheckCircle2, label: 'Completed', cls: 'text-status-confirmed' },
  current: { Icon: CircleDot, label: 'In progress', cls: 'text-status-target' },
  future: { Icon: Circle, label: 'Planned', cls: 'text-status-future' },
};

export default function Timeline() {
  return (
    <section id="status" aria-labelledby="status-heading" className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
      <div className="max-w-3xl mx-auto">
        <h2 id="status-heading" className="text-3xl sm:text-4xl mb-10">
          Project status
        </h2>

        <ol className="relative space-y-8 list-none">
          <div aria-hidden className="absolute left-[0.72rem] top-2 bottom-2 w-px bg-border" />
          {STAGES.map((s) => {
            const { Icon, label, cls } = STATE_META[s.state];
            return (
              <li key={s.name} className="relative pl-10">
                <Icon aria-hidden className={`absolute left-0 top-0.5 w-6 h-6 bg-background ${cls}`} />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <h3 className={s.state === 'future' ? 'text-muted-foreground' : ''}>{s.name}</h3>
                  <span className="font-mono-label text-muted-foreground">
                    {label} · {s.when}
                  </span>
                </div>
                <p className="text-[0.95rem] text-muted-foreground mt-1 max-w-[60ch]">{s.note}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
