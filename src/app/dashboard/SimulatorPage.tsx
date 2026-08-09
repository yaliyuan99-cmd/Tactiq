/**
 * The Tactiq simulator — the full interaction loop without hardware:
 * squeeze to wake (P9) → tap a contact → simulated recognition → the command
 * drives a simulated phone screen → class-level feedback (P3/P4), with the
 * emergency 5-second hold (P6) and an event log.
 *
 * Every tap goes through the device manager, so recognition behaves exactly
 * as a connected mock ring would. Everything here is simulation and says so.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Grip,
  Keyboard,
  ListX,
  Phone,
  ShieldAlert,
  Volume2,
  CircleCheck,
  CircleAlert,
  ShieldOff,
} from 'lucide-react';
import EvidenceStatus from '../home/EvidenceStatus';
import { SimHand, HandLegend } from '../components/SimHand';
import { useDeviceEvents, useDeviceSnapshot } from '../../services/device/useDevice';
import { deviceManager } from '../../services/device/manager';
import { giveFeedback } from '../../lib/feedback';
import { announce } from '../../lib/announce';
import { cn, formatTime, uid } from '../../lib/utils';
import { loadA11yPrefs } from '../../lib/a11yPrefs';
import { listGestureConfigs } from '../../lib/api';
import {
  CONTACTS_BY_ID,
  COMMANDS_BY_ID,
  DEFAULT_LAYOUT,
  PRODUCT,
  gesturePoints,
  type ContactId,
} from '../../lib/gestures';
import type { GestureLayout } from '../../lib/database.types';
import type { DeviceEvent } from '../../services/device/types';

const EPISODES = [
  'Morning briefing — 12 min',
  'The History Hour',
  'Science Weekly',
  'Night Trains: a soundscape',
  'Designing by touch — interview',
  'Local news roundup',
];

const TAP_MAX_MS = 600;
const EMERGENCY_MS = PRODUCT.emergencyHoldMs;

/** The interaction model, made visible: each recognised tap travels it. */
const PIPELINE_STAGES = ['Hand', 'Ring', 'Sensor', 'Command', 'Phone'] as const;

/** Haptic visual language — class-level patterns, never one per command. */
const HAPTIC_GLYPH: Record<string, string> = {
  confirm: '•',
  reject: '• •',
  emergency: '———',
};

interface PhoneState {
  focusIndex: number;
  playingIndex: number | null;
}

interface LogEntry {
  id: string;
  at: string;
  gesture: string;
  command: string;
  result: 'recognised' | 'misrecognised' | 'ignored' | 'emergency' | 'dropped';
  confidence?: number;
}

export default function SimulatorPage() {
  const device = useDeviceSnapshot();
  const prefs = useMemo(() => loadA11yPrefs(), []);
  const windowMs = prefs.longerWindow ? PRODUCT.commandWindowMs * 2 : PRODUCT.commandWindowMs;

  // The user's active saved layout drives the two shortcut points.
  const [activeLayout, setActiveLayout] = useState<GestureLayout>({ ...DEFAULT_LAYOUT });
  useEffect(() => {
    document.title = 'Simulator · Tactiq';
    listGestureConfigs()
      .then((rows) => {
        const active = rows.find((r) => r.is_active) ?? rows[0];
        if (active) setActiveLayout({ ...DEFAULT_LAYOUT, ...active.layout });
      })
      .catch(() => {});
  }, []);

  // ---- gate state ----------------------------------------------------------
  const [armed, setArmed] = useState(false);
  const [squeezing, setSqueezing] = useState(false);
  const [windowRemaining, setWindowRemaining] = useState(0);
  const windowDeadline = useRef(0);
  const squeezeStart = useRef(0);
  const activePresses = useRef(0);
  const lastSqueezeHandled = useRef(0);
  /** Synchronous mirrors — pointer down/up can arrive within one render, so
   * the state closures may be stale; these refs never are. */
  const armedRef = useRef(false);
  const squeezingRef = useRef(false);

  // ---- phone state ---------------------------------------------------------
  const [phone, setPhone] = useState<PhoneState>({ focusIndex: 0, playingIndex: null });
  const [voice, setVoice] = useState('Podcasts. 6 episodes. Morning briefing, 1 of 6.');
  const history = useRef<Array<{ state: PhoneState; description: string }>>([]);
  /** Synchronous mirror of `phone` so command handling can compute the
   * transition immediately (state updaters run later and re-run in
   * StrictMode, so they must stay side-effect-free). */
  const phoneRef = useRef(phone);

  // ---- pipeline strip -------------------------------------------------------
  const [stage, setStage] = useState(-1);
  const [stageNote, setStageNote] = useState('');
  const [hapticKind, setHapticKind] = useState<string | null>(null);
  const stageTimers = useRef<number[]>([]);

  const runPipeline = useCallback((gated: boolean, kind: 'confirm' | 'reject' | 'emergency') => {
    stageTimers.current.forEach((t) => clearTimeout(t));
    stageTimers.current = [];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const last = gated ? 1 : PIPELINE_STAGES.length - 1;
    if (reduce) {
      setStage(last);
    } else {
      for (let i = 0; i <= last; i++) {
        stageTimers.current.push(window.setTimeout(() => setStage(i), i * 160));
      }
    }
    setStageNote(gated ? 'dropped at the gate — ring was idle' : '');
    setHapticKind(gated ? null : kind);
    stageTimers.current.push(
      window.setTimeout(() => {
        setStage(-1);
        setHapticKind(null);
        setStageNote('');
      }, 2400),
    );
  }, []);
  useEffect(() => () => stageTimers.current.forEach((t) => clearTimeout(t)), []);

  // ---- log + emergency -----------------------------------------------------
  const [log, setLog] = useState<LogEntry[]>([]);
  const [flashId, setFlashId] = useState<ContactId | null>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState<number | null>(null);
  const sosCloseRef = useRef<HTMLButtonElement | null>(null);

  const pressInfo = useRef<
    Map<ContactId, { start: number; consumed: boolean; timer?: ReturnType<typeof setTimeout> }>
  >(new Map());

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'at'>) => {
    setLog((prev) =>
      [{ id: uid('log'), at: new Date().toISOString(), ...entry }, ...prev].slice(0, 50),
    );
  }, []);

  // ---- gate mechanics ------------------------------------------------------
  const openWindow = useCallback(() => {
    windowDeadline.current = Date.now() + windowMs;
    armedRef.current = true;
    setArmed(true);
    deviceManager.setGateArmed(true);
    giveFeedback('armed', 'Command window open.');
  }, [windowMs]);

  const closeWindow = useCallback((reason: 'timeout' | 'manual') => {
    armedRef.current = false;
    setArmed(false);
    deviceManager.setGateArmed(false);
    if (reason === 'timeout') announce('Command window closed. The ring is idle again.');
  }, []);

  // Window countdown — an active press keeps the window from expiring.
  useEffect(() => {
    if (!armed) return;
    const timer = setInterval(() => {
      const remaining = windowDeadline.current - Date.now();
      setWindowRemaining(Math.max(0, remaining));
      if (remaining <= 0 && activePresses.current === 0) {
        clearInterval(timer);
        closeWindow('timeout');
      }
    }, 100);
    return () => clearInterval(timer);
  }, [armed, closeWindow]);

  const startSqueeze = useCallback(() => {
    if (squeezingRef.current) return;
    squeezingRef.current = true;
    setSqueezing(true);
    squeezeStart.current = Date.now();
  }, []);

  // Any deliberate activation opens the window — gating a UI button on a
  // timed hold would exclude switch and screen-reader users (the ≥150 ms
  // requirement belongs to the physical squeeze, and the copy teaches it).
  const endSqueeze = useCallback(() => {
    if (!squeezingRef.current) return;
    squeezingRef.current = false;
    setSqueezing(false);
    const held = Date.now() - squeezeStart.current;
    openWindow();
    if (held < PRODUCT.gateHoldMsDefault) {
      announce(
        `Window open. On the physical ring this squeeze (${held} milliseconds) would be too brief — it wants a deliberate ${PRODUCT.gateHoldMsDefault} millisecond hold to filter accidental grips.`,
      );
    }
  }, [openWindow]);

  // ---- press mechanics on the hand ----------------------------------------
  const onPressStart = useCallback((contactId: ContactId) => {
    activePresses.current += 1;
    const info: { start: number; consumed: boolean; timer?: ReturnType<typeof setTimeout> } = {
      start: Date.now(),
      consumed: false,
    };
    if (contactId === 'pinky-tip') {
      // Emergency fires AT the 5 s mark, release or not.
      const started = Date.now();
      const tick = setInterval(() => {
        const held = Date.now() - started;
        setHoldProgress(Math.min(1, held / EMERGENCY_MS));
        if (held >= EMERGENCY_MS) {
          clearInterval(tick);
          info.consumed = true;
          setHoldProgress(null);
          deviceManager.simulateTap('pinky-tip', { hold: true, windowOpen: armedRef.current });
        }
      }, 100);
      info.timer = tick as unknown as ReturnType<typeof setTimeout>;
    }
    pressInfo.current.set(contactId, info);
  }, []);

  const onPressEnd = useCallback(
    (contactId: ContactId) => {
      const info = pressInfo.current.get(contactId);
      if (!info) return;
      pressInfo.current.delete(contactId);
      activePresses.current = Math.max(0, activePresses.current - 1);
      if (info.timer) clearInterval(info.timer as unknown as number);
      if (contactId === 'pinky-tip') setHoldProgress(null);
      if (info.consumed) return;
      const held = Date.now() - info.start;
      if (held <= TAP_MAX_MS) {
        deviceManager.simulateTap(contactId, { windowOpen: armedRef.current });
      } else {
        // Indeterminate press: neither a brief tap nor the 5 s emergency hold.
        giveFeedback('reject', 'Indeterminate press dropped. Taps are brief; only Emergency is a hold.');
        addLog({
          gesture: `${CONTACTS_BY_ID[contactId].finger} ${CONTACTS_BY_ID[contactId].position.toLowerCase()}`,
          command: '—',
          result: 'dropped',
        });
      }
    },
    [addLog],
  );

  // ---- the simulated phone -------------------------------------------------
  const applyCommand = useCallback(
    (recognized: ContactId, hold: boolean): { command: string; announcement: string } => {
      if (recognized === 'pinky-tip' && hold) {
        return {
          command: 'Emergency (platform SOS)',
          announcement: 'Emergency. Engaging the platform S O S pathway.',
        };
      }
      const point = CONTACTS_BY_ID[recognized];
      if (point.editable) {
        const cmdId = activeLayout[recognized] ?? DEFAULT_LAYOUT[recognized];
        const cmd = cmdId ? COMMANDS_BY_ID[cmdId] : undefined;
        let response = cmd?.response ?? 'No command assigned.';
        if (cmd?.id === 'announce-time') {
          response = `It's ${new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}.`;
        } else if (cmd?.id === 'announce-battery') {
          response =
            device.battery !== null
              ? `Ring battery ${device.battery} percent.`
              : 'Battery level unavailable.';
        }
        return { command: cmd?.label ?? 'Unassigned shortcut', announcement: response };
      }

      // Fixed commands drive the podcast screen. Compute the transition
      // synchronously from the ref mirror; setPhone only publishes it.
      const prev = phoneRef.current;
      let announcement = '';
      let command = '';
      let next = prev;
      switch (recognized) {
        case 'middle-base': {
          command = 'Next';
          const idx = Math.min(EPISODES.length - 1, prev.focusIndex + 1);
          announcement =
            idx === prev.focusIndex
              ? 'End of list.'
              : `${EPISODES[idx]}. ${idx + 1} of ${EPISODES.length}.`;
          next = { ...prev, focusIndex: idx };
          break;
        }
        case 'ring-base': {
          command = 'Previous';
          const idx = Math.max(0, prev.focusIndex - 1);
          announcement =
            idx === prev.focusIndex
              ? 'Start of list.'
              : `${EPISODES[idx]}. ${idx + 1} of ${EPISODES.length}.`;
          next = { ...prev, focusIndex: idx };
          break;
        }
        case 'index-tip': {
          command = 'Confirm';
          if (prev.playingIndex === prev.focusIndex) {
            announcement = `Paused ${EPISODES[prev.focusIndex]}.`;
            next = { ...prev, playingIndex: null };
          } else {
            announcement = `Playing ${EPISODES[prev.focusIndex]}.`;
            next = { ...prev, playingIndex: prev.focusIndex };
          }
          break;
        }
        case 'index-base': {
          command = 'Dismiss / Back';
          if (prev.playingIndex !== null) {
            announcement = 'Stopped. Podcasts list.';
            next = { ...prev, playingIndex: null };
          } else {
            announcement = `Podcasts. ${EPISODES.length} episodes.`;
          }
          break;
        }
        case 'ring-tip': {
          command = 'Read / Repeat';
          announcement = `${EPISODES[prev.focusIndex]}. ${prev.focusIndex + 1} of ${EPISODES.length}.${
            prev.playingIndex !== null ? ' Now playing.' : ''
          }`;
          break;
        }
        case 'middle-tip': {
          command = 'Undo';
          const last = history.current.pop();
          if (last) {
            announcement = `Undone — ${last.description}`;
            next = last.state;
          } else {
            announcement = 'Nothing to undo.';
          }
          break;
        }
      }
      if (recognized !== 'middle-tip' && next !== prev) {
        history.current.push({
          state: prev,
          description: `back to ${EPISODES[prev.focusIndex]}`,
        });
        if (history.current.length > 20) history.current.shift();
      }
      phoneRef.current = next;
      setPhone(next);
      return { command, announcement };
    },
    [activeLayout, device.battery],
  );

  // ---- react to gesture events from the manager ---------------------------
  const onDeviceEvent = useCallback(
    (event: DeviceEvent) => {
      if (event.type !== 'gesture') return;
      const g = event.gesture;
      const intended = CONTACTS_BY_ID[g.intendedContactId];
      const gestureLabel = `${intended.finger} ${intended.position.toLowerCase()}`;

      if (g.gated) {
        giveFeedback('reject', 'Ignored — the ring is idle. Squeeze first to open the command window.');
        addLog({ gesture: gestureLabel, command: '—', result: 'ignored' });
        runPipeline(true, 'reject');
        return;
      }

      // Keep the window alive after a successful command.
      windowDeadline.current = Math.max(windowDeadline.current, Date.now() + windowMs);

      const { command, announcement } = applyCommand(g.contactId, g.hold);
      setVoice(announcement);
      setFlashId(g.contactId);
      setTimeout(() => setFlashId(null), 900);

      if (g.hold && g.contactId === 'pinky-tip') {
        giveFeedback('emergency', announcement);
        setSosOpen(true);
        addLog({ gesture: `${gestureLabel} · 5 s hold`, command, result: 'emergency' });
        runPipeline(false, 'emergency');
        closeWindow('manual');
        return;
      }

      const correct = g.contactId === g.intendedContactId;
      giveFeedback(correct ? 'confirm' : 'reject', announcement);
      runPipeline(false, correct ? 'confirm' : 'reject');
      addLog({
        gesture: gestureLabel,
        command,
        result: correct ? 'recognised' : 'misrecognised',
        confidence: g.confidence,
      });
    },
    [addLog, applyCommand, closeWindow, windowMs, runPipeline],
  );
  useDeviceEvents(onDeviceEvent);

  // ---- keyboard control ----------------------------------------------------
  useEffect(() => {
    const downKeys = new Set<string>();
    const keyToContact = new Map(gesturePoints.map((p) => [p.simKey, p.id]));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      if (downKeys.has(e.key)) return; // ignore auto-repeat
      const contact = keyToContact.get(e.key);
      if (contact) {
        downKeys.add(e.key);
        onPressStart(contact);
      } else if (e.key === 'w' || e.key === 'W') {
        downKeys.add(e.key);
        startSqueeze();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!downKeys.delete(e.key)) return;
      const contact = keyToContact.get(e.key);
      if (contact) onPressEnd(contact);
      else if (e.key === 'w' || e.key === 'W') endSqueeze();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onPressStart, onPressEnd, startSqueeze, endSqueeze]);

  // Emergency dialog: move focus in, close on Escape.
  useEffect(() => {
    if (!sosOpen) return;
    sosCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSosOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sosOpen]);

  const windowPct = useMemo(
    () => (armed ? Math.round((windowRemaining / windowMs) * 100) : 0),
    [armed, windowRemaining, windowMs],
  );

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-3xl">Simulator</h1>
        <EvidenceStatus kind="simulation">Simulated ring &amp; screen reader</EvidenceStatus>
      </div>
      <p className="text-muted-foreground mb-8 max-w-[62ch]">
        The complete interaction loop, no hardware needed: squeeze to wake, tap a contact, and
        the command drives the phone below — exactly the pipeline a real ring would feed.
      </p>

      {/* The interaction model, live: hand → ring → sensor → command → phone. */}
      <div
        role="status"
        aria-label="Command pipeline"
        className="border border-border rounded-lg px-4 py-2.5 mb-6 flex items-center gap-2 overflow-x-auto"
      >
        {PIPELINE_STAGES.map((label, i) => (
          <span key={label} className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                'font-mono-label transition-colors duration-150',
                i <= stage ? 'text-primary-strong' : 'text-muted-foreground/60',
              )}
            >
              {label}
            </span>
            {i < PIPELINE_STAGES.length - 1 && (
              <span aria-hidden className={cn('text-xs', i < stage ? 'text-primary-strong' : 'text-muted-foreground/40')}>
                →
              </span>
            )}
          </span>
        ))}
        {stageNote && <span className="font-mono-label text-status-target ml-1 shrink-0">{stageNote}</span>}
        {hapticKind && stage >= PIPELINE_STAGES.length - 1 && (
          <span className="font-mono-label text-muted-foreground ml-auto shrink-0">
            haptic <span aria-hidden className="text-foreground tracking-wider">{HAPTIC_GLYPH[hapticKind]}</span>
            <span className="sr-only">{hapticKind} pattern</span>
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        {/* ------------------------------------------------ left: hand ---- */}
        <div>
          {/* Gate control */}
          <section aria-label="Wake gate" className="border border-border rounded-lg p-5 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onPointerDown={startSqueeze}
                onPointerUp={() => {
                  lastSqueezeHandled.current = Date.now();
                  endSqueeze();
                }}
                onPointerLeave={() => squeezing && endSqueeze()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                    e.preventDefault();
                    startSqueeze();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    lastSqueezeHandled.current = Date.now();
                    endSqueeze();
                  }
                }}
                onClick={() => {
                  // Assistive-tech activation (synthetic click, no press
                  // timing): open the window directly — a switch or
                  // screen-reader user cannot perform a timed hold.
                  if (Date.now() - lastSqueezeHandled.current > 400 && !armed) {
                    openWindow();
                  }
                }}
                aria-pressed={armed}
                className={cn(
                  'inline-flex items-center gap-2.5 h-12 px-5 rounded-full border font-medium select-none transition-colors',
                  armed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : squeezing
                      ? 'border-primary bg-primary/15'
                      : 'border-border bg-card hover:bg-secondary',
                )}
              >
                <Grip aria-hidden className="w-5 h-5" />
                {armed ? 'Ring awake' : squeezing ? 'Squeezing…' : 'Squeeze to wake'}
              </button>
              <div className="flex-1 min-w-40" aria-hidden>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-[width] duration-100"
                    style={{ width: `${windowPct}%` }}
                  />
                </div>
              </div>
              <p role="status" className="font-mono-label text-muted-foreground w-full sm:w-auto">
                {armed
                  ? `window ${(windowRemaining / 1000).toFixed(1)} s`
                  : `idle — real ring: ≥${PRODUCT.gateHoldMsDefault} ms squeeze`}
              </p>
            </div>
            {holdProgress !== null && (
              <div className="mt-4" role="status">
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <ShieldAlert aria-hidden className="w-4.5 h-4.5" />
                  Keep holding for Emergency — {((1 - holdProgress) * (EMERGENCY_MS / 1000)).toFixed(1)} s to go
                </p>
                <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
                  <div
                    className="h-full bg-destructive transition-[width] duration-100"
                    style={{ width: `${holdProgress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          <SimHand
            mode="press"
            onPressStart={onPressStart}
            onPressEnd={onPressEnd}
            flashId={flashId}
            mirrored={prefs.handPreference === 'left'}
            label="Simulator hand: press a contact point to tap it. Hold the pinky tip five seconds for emergency."
          />

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Keyboard aria-hidden className="w-4.5 h-4.5" />
              Keys 1–8 tap the points · hold W to squeeze
            </p>
          </div>
          <HandLegend className="mt-4" />
        </div>

        {/* --------------------------------------------- right: phone ----- */}
        <div className="space-y-6">
          <section aria-label="Simulated phone" className="border border-border rounded-lg p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl flex items-center gap-2">
                <Phone aria-hidden className="w-5 h-5 text-muted-foreground" />
                Simulated phone
              </h2>
              <span className="font-mono-label text-muted-foreground">Podcasts</span>
            </div>

            <ul aria-label="Podcast episodes (simulated screen)" className="space-y-1">
              {EPISODES.map((title, i) => (
                <li
                  key={title}
                  aria-current={phone.focusIndex === i ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-[0.92rem] transition-colors',
                    phone.focusIndex === i
                      ? 'border-primary bg-primary/10 font-medium'
                      : 'border-transparent text-muted-foreground',
                  )}
                >
                  {phone.playingIndex === i && (
                    <span aria-hidden className="text-primary">
                      ▶
                    </span>
                  )}
                  <span className="truncate">{title}</span>
                  {phone.playingIndex === i && <span className="sr-only">(playing)</span>}
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-md border border-border bg-muted/60 px-4 py-3" aria-live="off">
              <p className="flex items-center gap-2 font-mono-label text-muted-foreground mb-1">
                <Volume2 aria-hidden className="w-4 h-4" />
                VoiceOver would say
              </p>
              <p className="text-[0.95rem]">{voice}</p>
            </div>
          </section>

          {/* Event log */}
          <section aria-label="Event log" className="border border-border rounded-lg p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl">Event log</h2>
              <button
                onClick={() => setLog([])}
                disabled={log.length === 0}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <ListX aria-hidden className="w-4 h-4" />
                Clear
              </button>
            </div>
            {log.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing yet. Try tapping a point <em>without</em> squeezing first — the gate
                ignoring it is the design working.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <caption className="sr-only">
                    Simulator events: time, gesture, command, and result.
                  </caption>
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th scope="col" className="py-1.5 pr-3 font-medium">Time</th>
                      <th scope="col" className="py-1.5 pr-3 font-medium">Gesture</th>
                      <th scope="col" className="py-1.5 pr-3 font-medium">Command</th>
                      <th scope="col" className="py-1.5 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((entry) => (
                      <tr key={entry.id} className="border-t border-border align-top">
                        <td className="py-2 pr-3 font-mono-label text-muted-foreground whitespace-nowrap">
                          {formatTime(entry.at)}
                        </td>
                        <td className="py-2 pr-3">{entry.gesture}</td>
                        <td className="py-2 pr-3">{entry.command}</td>
                        <td className="py-2">
                          <span className="inline-flex items-center gap-1.5">
                            {entry.result === 'recognised' ? (
                              <CircleCheck aria-hidden className="w-4 h-4 text-status-confirmed" />
                            ) : entry.result === 'emergency' ? (
                              <ShieldAlert aria-hidden className="w-4 h-4 text-destructive" />
                            ) : entry.result === 'ignored' || entry.result === 'dropped' ? (
                              <ShieldOff aria-hidden className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <CircleAlert aria-hidden className="w-4 h-4 text-status-target" />
                            )}
                            {entry.result}
                            {entry.confidence !== undefined && (
                              <span className="font-mono-label text-muted-foreground">
                                {Math.round(entry.confidence * 100)}%
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Emergency overlay */}
      {sosOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40"
          onClick={() => setSosOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-2xl"
          >
            <h2 id="sos-title" className="text-xl mb-4">
              Emergency — simulation
            </h2>
            <div className="flex items-start gap-3.5">
              <span
                aria-hidden
                className="w-11 h-11 shrink-0 rounded-full bg-destructive text-white flex items-center justify-center"
              >
                <ShieldAlert className="w-6 h-6" />
              </span>
              <div>
                <p className="text-[0.95rem]">
                  The five-second hold completed. On a real device, Tactiq would now hand over to
                  your <strong>phone's own SOS pathway</strong> — it never places calls or shares
                  location itself.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  This is a simulation. No call was placed, nothing left your browser.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                ref={sosCloseRef}
                onClick={() => setSosOpen(false)}
                className="px-5 h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
