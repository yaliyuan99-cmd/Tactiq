/**
 * Local interaction telemetry — the honest data source behind Activity.
 *
 * Every gesture that flows through the device manager (simulator taps,
 * training drills, mock-ring sessions) is recorded here, per signed-in user,
 * in this browser's localStorage only. Nothing is invented: if the user has
 * never used the simulator, the history is empty and the UI says so. Nothing
 * leaves the browser, and no entry is ever presented as a hardware
 * measurement — `source` says exactly where each event came from.
 */
import { deviceManager } from './device/manager';
import { effectiveCommandFor, type ContactId } from '../lib/gestures';
import type { GestureLayout } from '../lib/database.types';
import { uid } from '../lib/utils';

export interface ActivityEvent {
  id: string;
  /** ISO timestamp. */
  at: string;
  contactId: ContactId;
  /** Resolved command name at the moment it fired (layout-aware). */
  command: string;
  kind: 'fixed' | 'shortcut' | 'emergency';
  result: 'recognised' | 'misread' | 'ignored' | 'emergency';
  confidence: number | null;
  latencyMs: number | null;
  source: 'simulator' | 'mock-device' | 'web-bluetooth';
}

/** Events separated by less than this belong to the same session. */
const SESSION_GAP_MS = 10 * 60 * 1000;
const MAX_EVENTS = 500;

type Listener = () => void;

let namespace: string | null = null;
let cache: ActivityEvent[] | null = null;
const listeners = new Set<Listener>();
let unsubscribeDevice: (() => void) | null = null;
let activeLayout: GestureLayout = {};

function storageKey() {
  return `tactiq:${namespace}:events`;
}

function load(): ActivityEvent[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(storageKey()) ?? '[]');
  } catch {
    cache = [];
  }
  return cache!;
}

function persist(events: ActivityEvent[]) {
  cache = events;
  try {
    localStorage.setItem(storageKey(), JSON.stringify(events));
  } catch {
    /* storage full or blocked — history is best-effort */
  }
  listeners.forEach((l) => l());
}

/** The layout used to resolve shortcut names as events are recorded. */
export function setTelemetryLayout(layout: GestureLayout) {
  activeLayout = layout;
}

/**
 * Start recording for a user (idempotent). Called from the dashboard shell;
 * `null` stops recording on sign-out.
 */
export function startTelemetry(userId: string | null) {
  if (namespace === userId) return;
  unsubscribeDevice?.();
  unsubscribeDevice = null;
  namespace = userId;
  cache = null;
  if (!userId) return;

  unsubscribeDevice = deviceManager.subscribeEvents((event) => {
    if (event.type !== 'gesture') return;
    const g = event.gesture;
    const resolved = effectiveCommandFor(activeLayout, g.contactId, g.hold);
    const entry: ActivityEvent = {
      id: uid('ev'),
      at: new Date().toISOString(),
      contactId: g.contactId,
      command: g.gated ? '—' : resolved.name,
      kind: resolved.kind,
      result: g.gated
        ? 'ignored'
        : g.hold && g.contactId === 'pinky-tip'
          ? 'emergency'
          : g.contactId === g.intendedContactId
            ? 'recognised'
            : 'misread',
      confidence: g.gated ? null : g.confidence,
      latencyMs: g.gated ? null : g.latencyMs,
      source: g.source,
    };
    const events = [entry, ...load()].slice(0, MAX_EVENTS);
    persist(events);
  });
}

/** Stable reference for the signed-out state — useSyncExternalStore requires
 * getSnapshot to return identical values when nothing changed. */
const NO_EVENTS: ActivityEvent[] = [];

/** All recorded events, newest first. */
export function listEvents(): ActivityEvent[] {
  if (!namespace) return NO_EVENTS;
  return load();
}

/** Notifies whenever an event is recorded or history is cleared. */
export function subscribeTelemetry(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearEvents() {
  if (!namespace) return;
  persist([]);
}

export interface ActivitySession {
  id: string;
  startedAt: string;
  endedAt: string;
  /** Chronological (oldest → newest) — the order a replay plays them. */
  events: ActivityEvent[];
}

/** Group events into sessions split on 10-minute silences, newest first. */
export function listSessions(events: ActivityEvent[] = listEvents()): ActivitySession[] {
  const sessions: ActivitySession[] = [];
  let current: ActivityEvent[] = [];
  // events arrive newest-first; walk and split on gaps.
  for (const event of events) {
    if (current.length === 0) {
      current.push(event);
      continue;
    }
    const prev = current[current.length - 1];
    if (new Date(prev.at).getTime() - new Date(event.at).getTime() > SESSION_GAP_MS) {
      sessions.push(toSession(current));
      current = [event];
    } else {
      current.push(event);
    }
  }
  if (current.length > 0) sessions.push(toSession(current));
  return sessions;
}

function toSession(newestFirst: ActivityEvent[]): ActivitySession {
  const chronological = [...newestFirst].reverse();
  return {
    id: chronological[0].id,
    startedAt: chronological[0].at,
    endedAt: chronological[chronological.length - 1].at,
    events: chronological,
  };
}
