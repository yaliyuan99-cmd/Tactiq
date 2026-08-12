import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import apiSource from './api.ts?raw';

/**
 * Exactly one command layout may be active.
 *
 * Every reader resolves the user's layout with `rows.find((r) => r.is_active)`
 * — the dashboard shell, the simulator, training and the overview all do it.
 * `find` returns the *first* match, so a second row left marked active means
 * the older layout keeps winning and the one the user just activated never
 * takes effect. Measured before the fix: save layout A (Play/Pause) starred,
 * then layout B (Next track) starred, and both came back `is_active: true`
 * while the app resolved A.
 *
 * saveGestureConfig owns the invariant, because it is the only writer.
 */

const store: Record<string, string> = {};

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  });
  vi.stubGlobal('crypto', { randomUUID: () => `id-${Object.keys(store).length}-${Math.random()}` });
});

afterEach(() => vi.unstubAllGlobals());

/**
 * Mirror of the local-fallback write in saveGestureConfig. The real module
 * pulls in Supabase and import.meta.env at load time, which a plain unit test
 * cannot boot, so the behaviour is reproduced here and the source is checked
 * separately below to catch the two drifting apart.
 */
type Row = { id: string; is_active: boolean; layout: Record<string, string> };
function save(params: { id?: string; layout: Record<string, string>; isActive?: boolean }): Row {
  const configs: Row[] = JSON.parse(localStorage.getItem('tactiq_gesture_configs') ?? '[]');
  const existingIdx = params.id ? configs.findIndex((c) => c.id === params.id) : -1;
  const record: Row = {
    id: params.id ?? `id-${configs.length}`,
    layout: params.layout,
    is_active: params.isActive ?? false,
  };
  if (existingIdx >= 0) configs[existingIdx] = record;
  else configs.push(record);
  if (record.is_active) {
    for (const c of configs) {
      if (c.id !== record.id) c.is_active = false;
    }
  }
  localStorage.setItem('tactiq_gesture_configs', JSON.stringify(configs));
  return record;
}

const rows = (): Row[] => JSON.parse(localStorage.getItem('tactiq_gesture_configs') ?? '[]');
/** What every consumer in the app does to pick the layout in force. */
const resolveActive = (all: Row[]) => all.find((r) => r.is_active) ?? all[0];

describe('only one layout is active at a time', () => {
  it('activating a second layout deactivates the first', () => {
    save({ layout: { 'pinky-tip': 'media-playpause' }, isActive: true });
    save({ layout: { 'pinky-tip': 'media-next' }, isActive: true });
    expect(rows().filter((r) => r.is_active)).toHaveLength(1);
  });

  it('the layout the user just activated is the one that takes effect', () => {
    save({ layout: { 'pinky-tip': 'media-playpause' }, isActive: true });
    save({ layout: { 'pinky-tip': 'media-next' }, isActive: true });
    // This is the assertion that failed before the fix: it resolved to
    // media-playpause, the older layout.
    expect(resolveActive(rows()).layout['pinky-tip']).toBe('media-next');
  });

  it('saving an inactive layout leaves the active one alone', () => {
    const a = save({ layout: { 'pinky-tip': 'media-playpause' }, isActive: true });
    save({ layout: { 'pinky-tip': 'media-next' }, isActive: false });
    expect(resolveActive(rows()).id).toBe(a.id);
    expect(rows().filter((r) => r.is_active)).toHaveLength(1);
  });

  it('re-saving the active layout keeps it active', () => {
    const a = save({ layout: { 'pinky-tip': 'media-playpause' }, isActive: true });
    save({ id: a.id, layout: { 'pinky-tip': 'media-volup' }, isActive: true });
    expect(rows()).toHaveLength(1);
    expect(resolveActive(rows()).layout['pinky-tip']).toBe('media-volup');
  });

  it('with nothing activated the first layout is still used', () => {
    const a = save({ layout: { 'pinky-tip': 'media-playpause' } });
    save({ layout: { 'pinky-tip': 'media-next' } });
    expect(resolveActive(rows()).id).toBe(a.id);
  });
});

describe('the shipped source enforces it too', () => {
  // The model above is a copy, so guard against it drifting from the real
  // implementation: both write paths must clear the flag on the other rows.
  it('the local fallback clears is_active on other configs', () => {
    expect(apiSource).toMatch(/if \(c\.id !== record\.id\) c\.is_active = false;/);
  });

  it('the Supabase path clears is_active on the user’s other rows', () => {
    expect(apiSource).toMatch(/\.update\(\{ is_active: false \}\)/);
    expect(apiSource).toMatch(/\.neq\('id', data\.id\)/);
  });

  it('consumers still resolve the active layout the way this assumes', () => {
    // If a reader stopped using find(is_active), the invariant would be
    // guarding something nothing depends on any more.
    expect(apiSource.length).toBeGreaterThan(0);
    const readers = import.meta.glob('../app/**/*.tsx', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>;
    const usingFind = Object.values(readers).filter((s) =>
      /find\(\(?[rc]\)? => [rc]\.is_active\)/.test(s),
    );
    expect(usingFind.length).toBeGreaterThanOrEqual(3);
  });
});
