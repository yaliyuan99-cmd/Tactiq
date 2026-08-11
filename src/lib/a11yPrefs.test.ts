import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prefersReducedMotion, subscribeReducedMotion } from './a11yPrefs';

/**
 * The site's accessibility page offers "Remove non-essential animation on this
 * site, in addition to my system setting". "In addition to" is a promise: the
 * setting has to work on its own, for someone whose OS preference is off.
 *
 * CSS keeps that promise through `.force-reduced-motion`. These cover the other
 * half — the motion JavaScript drives (video, staged animations, scrolling,
 * motion/react), which used to read the media query alone and so ignored the
 * setting entirely.
 */

const store: Record<string, string> = {};
let mediaMatches = false;
const mediaListeners = new Set<() => void>();

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  mediaMatches = false;
  mediaListeners.clear();

  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  });

  const listeners = new Map<string, Set<() => void>>();
  vi.stubGlobal('window', {
    matchMedia: () => ({
      matches: mediaMatches,
      addEventListener: (_: string, cb: () => void) => mediaListeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => mediaListeners.delete(cb),
    }),
    addEventListener: (type: string, cb: () => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(cb);
    },
    removeEventListener: (type: string, cb: () => void) => listeners.get(type)?.delete(cb),
    __listeners: listeners,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const setSiteSetting = (on: boolean) =>
  localStorage.setItem('tactiq-a11y', JSON.stringify({ reducedMotion: on }));

describe('prefersReducedMotion', () => {
  it('is false when neither the OS nor the site asks for it', () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it('is true from the OS preference alone', () => {
    mediaMatches = true;
    expect(prefersReducedMotion()).toBe(true);
  });

  it('is true from the site setting alone — the case that used to be missed', () => {
    setSiteSetting(true);
    expect(mediaMatches).toBe(false);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('is true when both ask for it', () => {
    mediaMatches = true;
    setSiteSetting(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('goes back to false when the site setting is turned off again', () => {
    setSiteSetting(true);
    expect(prefersReducedMotion()).toBe(true);
    setSiteSetting(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('survives a corrupt saved preference rather than throwing', () => {
    localStorage.setItem('tactiq-a11y', '{not json');
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('subscribeReducedMotion', () => {
  it('fires when the OS preference changes', () => {
    const onChange = vi.fn();
    subscribeReducedMotion(onChange);
    mediaListeners.forEach((cb) => cb());
    expect(onChange).toHaveBeenCalled();
  });

  it('fires when the site setting is saved in this tab', () => {
    const onChange = vi.fn();
    subscribeReducedMotion(onChange);
    const listeners = (window as unknown as { __listeners: Map<string, Set<() => void>> })
      .__listeners;
    listeners.get('tactiq-a11y-change')?.forEach((cb) => cb());
    expect(onChange).toHaveBeenCalled();
  });

  it('fires when another tab saves the setting', () => {
    const onChange = vi.fn();
    subscribeReducedMotion(onChange);
    const listeners = (window as unknown as { __listeners: Map<string, Set<() => void>> })
      .__listeners;
    listeners.get('storage')?.forEach((cb) => cb());
    expect(onChange).toHaveBeenCalled();
  });

  it('detaches every listener on unsubscribe', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeReducedMotion(onChange);
    unsubscribe();
    const listeners = (window as unknown as { __listeners: Map<string, Set<() => void>> })
      .__listeners;
    expect(mediaListeners.size).toBe(0);
    expect(listeners.get('tactiq-a11y-change')?.size ?? 0).toBe(0);
    expect(listeners.get('storage')?.size ?? 0).toBe(0);
  });
});
