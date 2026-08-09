/**
 * Session replay — watch a recorded sequence of commands play back on the
 * hand, one step at a time: the contact flashes, the command name appears,
 * exactly as it happened.
 *
 * Fully keyboard driven (play/pause, step buttons); the running step is
 * announced through a polite status line, and the whole sequence is also
 * readable as a plain list below the player, so nothing depends on the
 * animation. Reduced motion simply removes the flash — stepping still works.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { SimHand } from './SimHand';
import { CONTACTS_BY_ID, type ContactId } from '../../lib/gestures';
import { formatTime } from '../../lib/utils';
import type { ActivitySession } from '../../services/telemetry';

const STEP_MS = { 1: 1100, 2: 550 } as const;

export default function SessionReplay({
  session,
  mirrored = false,
  onClose,
}: {
  session: ActivitySession;
  mirrored?: boolean;
  onClose: () => void;
}) {
  const events = session.events;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [flashId, setFlashId] = useState<ContactId | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = events[step] ?? null;

  const showStep = useCallback(
    (i: number) => {
      const event = events[i];
      if (!event) return;
      setFlashId(event.contactId);
      const clear = setTimeout(() => setFlashId(null), 650);
      return () => clearTimeout(clear);
    },
    [events],
  );

  useEffect(() => showStep(step), [step, showStep]);

  useEffect(() => {
    if (!playing) return;
    if (step >= events.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setStep((s) => s + 1), STEP_MS[speed]);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, step, speed, events.length]);

  const controlCls =
    'w-11 h-11 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]';

  return (
    <div className="border border-border rounded-lg p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Session replay</h3>
          <p className="font-mono-label text-muted-foreground mt-0.5">
            {formatTime(session.startedAt)} – {formatTime(session.endedAt)} · {events.length}{' '}
            {events.length === 1 ? 'command' : 'commands'}
          </p>
        </div>
        <button onClick={onClose} aria-label="Close replay" className={controlCls}>
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,260px)_1fr] gap-6 items-start">
        <SimHand
          mode="select"
          selectedId={current?.contactId ?? null}
          flashId={flashId}
          mirrored={mirrored}
          label="Replay hand: the highlighted point is where the current command originated."
          className="mx-auto"
        />

        <div className="min-w-0">
          {/* Current step, announced politely as it advances. */}
          <div aria-live="polite" className="mb-4 min-h-16">
            {current && (
              <>
                <p className="font-mono-label text-muted-foreground">
                  Step {step + 1} of {events.length} ·{' '}
                  {CONTACTS_BY_ID[current.contactId].finger}{' '}
                  {CONTACTS_BY_ID[current.contactId].position.toLowerCase()}
                </p>
                <p className="text-2xl font-semibold mt-0.5">{current.command}</p>
                {current.result !== 'recognised' && (
                  <p className="font-mono-label text-status-target mt-0.5">{current.result}</p>
                )}
              </>
            )}
          </div>

          {/* progress */}
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-4" aria-hidden>
            <div
              className="h-full bg-primary transition-[width] duration-300"
              style={{ width: `${((step + 1) / events.length) * 100}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              aria-label="Previous step"
              className={controlCls}
            >
              <SkipBack className="w-4 h-4" aria-hidden />
            </button>
            <button
              onClick={() => {
                if (step >= events.length - 1) setStep(0);
                setPlaying((p) => !p);
              }}
              aria-label={playing ? 'Pause replay' : 'Play replay'}
              className={controlCls}
            >
              {playing ? <Pause className="w-4 h-4" aria-hidden /> : <Play className="w-4 h-4" aria-hidden />}
            </button>
            <button
              onClick={() => setStep((s) => Math.min(events.length - 1, s + 1))}
              disabled={step >= events.length - 1}
              aria-label="Next step"
              className={controlCls}
            >
              <SkipForward className="w-4 h-4" aria-hidden />
            </button>
            <button
              onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
              aria-label={`Playback speed ${speed}×, activate for ${speed === 1 ? 2 : 1}×`}
              className="h-11 px-3.5 rounded-md border border-border font-mono-label hover:bg-secondary transition-colors active:scale-[0.97]"
            >
              {speed}×
            </button>
          </div>

          {/* The same sequence as plain text — the animation is optional. */}
          <ol className="mt-5 space-y-1 text-sm text-muted-foreground">
            {events.map((event, i) => (
              <li key={event.id} className={i === step ? 'text-foreground font-medium' : undefined}>
                {i + 1}. {event.command} —{' '}
                {CONTACTS_BY_ID[event.contactId].finger.toLowerCase()}{' '}
                {CONTACTS_BY_ID[event.contactId].position.toLowerCase()}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
