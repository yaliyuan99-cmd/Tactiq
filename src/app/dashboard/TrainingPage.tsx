/**
 * Training mode — the command set taught progressively, two gestures at a
 * time, with accessible success/error feedback and honest metrics (accuracy,
 * response time). Practice mode is a free sandbox with no scoring.
 * Progress is saved in this browser only, and the page says so.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GraduationCap,
  Play,
  CircleCheck,
  Timer,
  Target,
  ArrowLeft,
  RotateCcw,
  Infinity as InfinityIcon,
} from 'lucide-react';
import EvidenceStatus from '../home/EvidenceStatus';
import { SimHand, HandLegend } from '../components/SimHand';
import { useAuth } from '../auth/useAuth';
import { useDeviceEvents } from '../../services/device/useDevice';
import { deviceManager } from '../../services/device/manager';
import { giveFeedback } from '../../lib/feedback';
import { announce } from '../../lib/announce';
import { cn } from '../../lib/utils';
import { loadA11yPrefs } from '../../lib/a11yPrefs';
import { listGestureConfigs } from '../../lib/api';
import {
  LESSONS,
  loadTrainingRecords,
  saveTrainingRecord,
  type Lesson,
  type TrainingLessonRecord,
} from '../../lib/training';
import {
  CONTACTS_BY_ID,
  DEFAULT_LAYOUT,
  PRODUCT,
  effectiveCommandFor,
  type ContactId,
} from '../../lib/gestures';
import type { GestureLayout } from '../../lib/database.types';
import type { DeviceEvent } from '../../services/device/types';

type Mode = { kind: 'list' } | { kind: 'lesson'; lesson: Lesson } | { kind: 'practice' };

export default function TrainingPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<TrainingLessonRecord[] | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const reload = useCallback(() => {
    if (!user) return;
    setRecords(loadTrainingRecords(user.id));
  }, [user]);

  useEffect(() => {
    document.title = 'Training · Tactiq';
    reload();
  }, [reload]);

  const stats = useMemo(() => {
    if (!records) return null;
    const done = records.filter((r) => r.completed);
    const learned = new Set<string>();
    for (const r of done) {
      const lesson = LESSONS.find((l) => l.id === r.lessonId);
      lesson?.teaches.forEach((c) => learned.add(c));
    }
    const accs = done.map((r) => r.bestAccuracyPct).filter((a) => a > 0);
    const times = done.map((r) => r.avgResponseMs).filter((t) => t > 0);
    return {
      lessonsDone: done.length,
      completionPct: Math.round((done.length / LESSONS.length) * 100),
      commandsLearned: learned.size,
      avgAccuracy: accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : null,
      avgResponse: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null,
    };
  }, [records]);

  if (mode.kind === 'lesson') {
    return (
      <LessonRunner
        lesson={mode.lesson}
        record={records?.find((r) => r.lessonId === mode.lesson.id) ?? null}
        onExit={() => {
          setMode({ kind: 'list' });
          reload();
        }}
      />
    );
  }

  if (mode.kind === 'practice') {
    return <PracticeMode onExit={() => setMode({ kind: 'list' })} />;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-3xl">Training</h1>
        <EvidenceStatus kind="simulation">Simulated recognition</EvidenceStatus>
      </div>
      <p className="text-muted-foreground mb-8 max-w-[62ch]">
        Learn the command set a few gestures at a time — each lesson is a real task, not a
        memory quiz. Progress is saved in this browser only.
      </p>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <section className="border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Lessons complete</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {stats ? `${stats.lessonsDone} / ${LESSONS.length}` : '—'}
          </p>
          {stats && (
            <p className="mt-1 text-sm text-muted-foreground">{stats.completionPct}% of the curriculum</p>
          )}
        </section>
        <section className="border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Points covered</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {stats ? `${stats.commandsLearned} / ${PRODUCT.contactPoints}` : '—'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Contact points in finished lessons</p>
        </section>
        <section className="border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Gesture accuracy</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {stats?.avgAccuracy != null ? `${stats.avgAccuracy}%` : '—'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Average best across completed lessons</p>
        </section>
        <section className="border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Response time</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {stats?.avgResponse != null ? `${(stats.avgResponse / 1000).toFixed(1)} s` : '—'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Instruction to correct gesture</p>
        </section>
      </div>

      {/* Lesson list */}
      <ol className="space-y-3">
        {LESSONS.map((lesson, index) => {
          const record = records?.find((r) => r.lessonId === lesson.id);
          const previous = index === 0 ? null : LESSONS[index - 1];
          const previousDone =
            !previous || (records?.some((r) => r.lessonId === previous.id && r.completed) ?? false);
          return (
            <li key={lesson.id}>
              <div className="border border-border rounded-lg p-5 flex flex-wrap items-center gap-4">
                <span
                  aria-hidden
                  className={cn(
                    'w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-semibold',
                    record?.completed
                      ? 'bg-status-confirmed text-white'
                      : 'bg-secondary text-foreground',
                  )}
                >
                  {record?.completed ? <CircleCheck className="w-5 h-5" /> : lesson.number}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold">
                    Lesson {lesson.number} — {lesson.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{lesson.summary}</p>
                  {record && (
                    <p className="mt-1 font-mono-label text-muted-foreground">
                      {record.completed ? 'completed' : 'attempted'} · best accuracy{' '}
                      {record.bestAccuracyPct}% · avg response{' '}
                      {(record.avgResponseMs / 1000).toFixed(1)} s · {record.attempts}{' '}
                      {record.attempts === 1 ? 'attempt' : 'attempts'}
                    </p>
                  )}
                </div>
                <button
                  disabled={!previousDone}
                  onClick={() => setMode({ kind: 'lesson', lesson })}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 h-11 rounded-md font-medium transition-opacity disabled:opacity-50 disabled:pointer-events-none',
                    record?.completed
                      ? 'border border-border hover:bg-secondary'
                      : 'bg-primary text-primary-foreground hover:opacity-90',
                  )}
                >
                  <Play aria-hidden className="w-4 h-4" />
                  {record?.completed ? 'Repeat' : record ? 'Continue' : 'Start'}
                </button>
                {!previousDone && (
                  <p className="w-full text-sm text-muted-foreground sm:w-auto">
                    Finish lesson {lesson.number - 1} first.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 border border-border rounded-lg p-5 sm:p-6 flex flex-wrap items-center gap-4">
        <InfinityIcon aria-hidden className="w-6 h-6 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Practice mode</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            No score, no steps — tap freely and hear what each point does with your current
            layout.
          </p>
        </div>
        <button
          onClick={() => setMode({ kind: 'practice' })}
          className="px-5 h-11 border border-border rounded-md font-medium hover:bg-secondary transition-colors"
        >
          Open practice
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function LessonRunner({
  lesson,
  record,
  onExit,
}: {
  lesson: Lesson;
  record: TrainingLessonRecord | null;
  onExit: () => void;
}) {
  const { user } = useAuth();
  const prefs = useMemo(() => loadA11yPrefs(), []);
  const [stepIndex, setStepIndex] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [flashId, setFlashId] = useState<ContactId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [avgResponseMs, setAvgResponseMs] = useState<number | null>(null);
  const stepShownAt = useRef(0);
  const responseTimes = useRef<number[]>([]);
  const holdStart = useRef<number | null>(null);
  const savedRef = useRef(false);

  const step = lesson.steps[stepIndex] ?? null;

  useEffect(() => {
    stepShownAt.current = Date.now();
    if (step) announce(`Step ${stepIndex + 1} of ${lesson.steps.length}. ${step.instruction}`);
  }, [stepIndex, step, lesson.steps.length]);

  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 100;

  const finish = useCallback(() => {
    setFinished(true);
    const avgResponse = responseTimes.current.length
      ? Math.round(responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length)
      : 0;
    setAvgResponseMs(avgResponse || null);
    if (!user || savedRef.current) return;
    savedRef.current = true;
    saveTrainingRecord(user.id, {
      lessonId: lesson.id,
      completed: true,
      bestAccuracyPct: Math.max(record?.bestAccuracyPct ?? 0, accuracy),
      avgResponseMs: avgResponse,
      attempts: (record?.attempts ?? 0) + 1,
      completedAt: new Date().toISOString(),
    });
    giveFeedback('confirm', `Lesson complete. Accuracy ${accuracy} percent.`);
  }, [user, lesson.id, record, accuracy]);

  const advance = useCallback(() => {
    responseTimes.current.push(Date.now() - stepShownAt.current);
    setCorrect((c) => c + 1);
    if (stepIndex + 1 >= lesson.steps.length) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, lesson.steps.length, finish]);

  const onDeviceEvent = useCallback(
    (event: DeviceEvent) => {
      if (event.type !== 'gesture' || !step || finished || step.hold) return;
      const g = event.gesture;
      if (g.contactId === step.target) {
        if (g.intendedContactId === step.target) {
          setFeedback(`Recognised — ${step.commandName}.`);
          giveFeedback('confirm', `Correct. ${step.commandName}.`);
        } else {
          setFeedback('Close enough for the classifier — but aim for the highlighted point.');
          giveFeedback('confirm', `Recognised as ${step.commandName}.`);
        }
        setFlashId(g.contactId);
        setTimeout(() => setFlashId(null), 700);
        advance();
      } else if (g.intendedContactId === step.target) {
        // Right point, misread by the simulated classifier.
        setWrong((w) => w + 1);
        setFeedback(
          'The ring misread that tap — within-finger confusion is its known failure mode. Tap the point again.',
        );
        giveFeedback('reject', 'Misread. Try the same point again.');
      } else {
        const hit = CONTACTS_BY_ID[g.intendedContactId];
        setWrong((w) => w + 1);
        setFeedback(
          `That was the ${hit.finger.toLowerCase()} ${hit.position.toLowerCase()}. ${step.instruction}`,
        );
        giveFeedback('reject', `That was ${hit.finger} ${hit.position}. Try again.`);
      }
    },
    [step, finished, advance],
  );
  useDeviceEvents(onDeviceEvent);

  // Hold steps (emergency drill) are timed locally, not classified.
  const onPressStart = useCallback(
    (id: ContactId) => {
      if (step?.hold && id === step.target) holdStart.current = Date.now();
    },
    [step],
  );
  const onPressEnd = useCallback(
    (id: ContactId) => {
      if (!step || finished) return;
      if (step.hold) {
        if (id !== step.target) {
          setWrong((w) => w + 1);
          setFeedback(`Wrong point — hold the pinky tip. ${step.instruction}`);
          giveFeedback('reject', 'Wrong point. Hold the pinky tip.');
          return;
        }
        const held = holdStart.current ? Date.now() - holdStart.current : 0;
        holdStart.current = null;
        if (held >= PRODUCT.emergencyHoldMs) {
          setFeedback('Emergency threshold reached — in real use, the platform SOS pathway would engage.');
          giveFeedback('emergency', 'Emergency drill complete.');
          advance();
        } else {
          setWrong((w) => w + 1);
          setFeedback(
            `You released at ${(held / 1000).toFixed(1)} seconds. Emergency needs the full sustained five — that duration is exactly what makes it accident-proof.`,
          );
          giveFeedback('reject', `Released at ${(held / 1000).toFixed(1)} seconds. Hold for five.`);
        }
      } else {
        deviceManager.simulateTap(id, { windowOpen: true });
      }
    },
    [step, finished, advance],
  );

  return (
    <div className="max-w-3xl">
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
      >
        <ArrowLeft aria-hidden className="w-4 h-4" />
        All lessons
      </button>

      <h1 className="text-3xl mb-1">
        Lesson {lesson.number} — {lesson.title}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-[62ch]">{lesson.summary}</p>

      {!finished && step ? (
        <>
          {/* progress */}
          <div className="mb-5" aria-hidden>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-300"
                style={{ width: `${(stepIndex / lesson.steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="border border-border rounded-lg p-5 sm:p-6 mb-6">
            <p className="font-mono-label text-muted-foreground mb-1.5">
              Step {stepIndex + 1} of {lesson.steps.length}
            </p>
            <p className="text-xl font-medium" role="status">
              {step.instruction}
            </p>
            {feedback && (
              <p className="mt-3 text-[0.95rem] text-muted-foreground" role="status">
                {feedback}
              </p>
            )}
          </div>

          <div className="max-w-sm mx-auto">
            <SimHand
              mode="press"
              onPressStart={onPressStart}
              onPressEnd={onPressEnd}
              flashId={flashId}
              emphasizeIds={lesson.teaches}
              mirrored={prefs.handPreference === 'left'}
              label={`Training hand. ${step.instruction}`}
            />
          </div>
          <HandLegend className="mt-8" />
        </>
      ) : (
        <div className="border border-border rounded-lg p-6 sm:p-8 text-center animate-enter-rise">
          <GraduationCap aria-hidden className="w-10 h-10 mx-auto text-primary" />
          <h2 className="mt-3 text-2xl">Lesson complete</h2>
          <dl className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
            <div className="rounded-md border border-border p-3.5">
              <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Target aria-hidden className="w-4 h-4" />
                Accuracy
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{accuracy}%</dd>
            </div>
            <div className="rounded-md border border-border p-3.5">
              <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Timer aria-hidden className="w-4 h-4" />
                Avg response
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {avgResponseMs ? `${(avgResponseMs / 1000).toFixed(1)} s` : '—'}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={onExit}
              className="px-5 h-11 border border-border rounded-md font-medium hover:bg-secondary transition-colors"
            >
              Back to lessons
            </button>
            <button
              onClick={() => {
                setStepIndex(0);
                setCorrect(0);
                setWrong(0);
                setFinished(false);
                setAvgResponseMs(null);
                savedRef.current = false;
                responseTimes.current = [];
                announce('Lesson restarted.');
              }}
              className="inline-flex items-center gap-2 px-5 h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              <RotateCcw aria-hidden className="w-4 h-4" />
              Run it again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function PracticeMode({ onExit }: { onExit: () => void }) {
  const prefs = useMemo(() => loadA11yPrefs(), []);
  const [activeLayout, setActiveLayout] = useState<GestureLayout>({ ...DEFAULT_LAYOUT });
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<ContactId | null>(null);

  useEffect(() => {
    listGestureConfigs()
      .then((rows) => {
        const active = rows.find((r) => r.is_active) ?? rows[0];
        if (active) setActiveLayout({ ...DEFAULT_LAYOUT, ...active.layout });
      })
      .catch(() => {});
  }, []);

  const onDeviceEvent = useCallback(
    (event: DeviceEvent) => {
      if (event.type !== 'gesture') return;
      const g = event.gesture;
      const command = effectiveCommandFor(activeLayout, g.contactId, g.hold);
      const point = CONTACTS_BY_ID[g.contactId];
      const text = `${point.finger} ${point.position.toLowerCase()} → ${command.name}`;
      setLastResult(text);
      setFlashId(g.contactId);
      setTimeout(() => setFlashId(null), 700);
      giveFeedback(g.contactId === g.intendedContactId ? 'confirm' : 'reject', command.response);
    },
    [activeLayout],
  );
  useDeviceEvents(onDeviceEvent);

  return (
    <div className="max-w-3xl">
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
      >
        <ArrowLeft aria-hidden className="w-4 h-4" />
        All lessons
      </button>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-3xl">Practice mode</h1>
        <EvidenceStatus kind="simulation">Simulated recognition</EvidenceStatus>
      </div>
      <p className="text-muted-foreground mb-8 max-w-[62ch]">
        Free experimentation — every tap announces its command with your current layout's
        mappings. Nothing is scored or saved.
      </p>
      <div className="border border-border rounded-lg p-5 sm:p-6 mb-6" aria-live="polite">
        <p className="font-mono-label text-muted-foreground mb-1">Last gesture</p>
        <p className="text-xl font-medium">{lastResult ?? 'Tap any point to begin.'}</p>
      </div>
      <div className="max-w-sm mx-auto">
        <SimHand
          mode="press"
          onPressStart={() => {}}
          onPressEnd={(id) => deviceManager.simulateTap(id, { windowOpen: true })}
          flashId={flashId}
          mirrored={prefs.handPreference === 'left'}
          label="Practice hand: tap any contact point to hear its command."
        />
      </div>
      <HandLegend className="mt-8" />
    </div>
  );
}
