import { describe, it, expect } from 'vitest';
import { listSessions, type ActivityEvent } from './telemetry';

/**
 * Session grouping drives Activity's "Replay a session" list. It is fed
 * newest-first events and must return sessions split on 10-minute silences,
 * each holding its events oldest-first (the order a replay plays them).
 */

const MINUTE = 60_000;

function event(minutesAgo: number, id: string): ActivityEvent {
  return {
    id,
    at: new Date(Date.UTC(2026, 7, 11, 12, 0, 0) - minutesAgo * MINUTE).toISOString(),
    contactId: 'index-tip',
    command: 'Confirm',
    kind: 'fixed',
    result: 'recognised',
    confidence: 0.95,
    latencyMs: 240,
    source: 'simulator',
  };
}

describe('listSessions', () => {
  it('returns nothing for an empty history', () => {
    expect(listSessions([])).toEqual([]);
  });

  it('keeps closely spaced events in one session', () => {
    const sessions = listSessions([event(0, 'c'), event(2, 'b'), event(4, 'a')]);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].events).toHaveLength(3);
  });

  it('splits when the gap exceeds ten minutes', () => {
    const sessions = listSessions([event(0, 'd'), event(2, 'c'), event(30, 'b'), event(32, 'a')]);
    expect(sessions).toHaveLength(2);
    expect(sessions.map((s) => s.events.length)).toEqual([2, 2]);
  });

  it('does not split on a gap of exactly ten minutes', () => {
    expect(listSessions([event(0, 'b'), event(10, 'a')])).toHaveLength(1);
  });

  it('orders each session oldest-first so replay plays forwards', () => {
    const [session] = listSessions([event(0, 'newest'), event(3, 'middle'), event(6, 'oldest')]);
    expect(session.events.map((e) => e.id)).toEqual(['oldest', 'middle', 'newest']);
    expect(new Date(session.startedAt).getTime()).toBeLessThan(new Date(session.endedAt).getTime());
  });
});
