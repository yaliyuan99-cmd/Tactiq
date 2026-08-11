/**
 * Website accessibility preferences — saved to the browser, applied globally.
 * Kept in src/lib so the boot path (main.tsx) can apply them without loading
 * any dashboard code.
 */

const LS_KEY = 'tactiq-a11y';

/** Fired on the window whenever applyA11yPrefs() runs, so anything reading the
 *  preferences can re-read them without polling. */
const PREFS_EVENT = 'tactiq-a11y-change';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export interface A11yPrefs {
  textSize: 'default' | 'large' | 'larger';
  reducedMotion: boolean;
  handPreference: 'right' | 'left';
  hapticStrength: 'gentle' | 'standard' | 'strong';
  longerWindow: boolean;
  emergencyConfirm: boolean;
}

export const A11Y_DEFAULTS: A11yPrefs = {
  textSize: 'default',
  reducedMotion: false,
  handPreference: 'right',
  hapticStrength: 'standard',
  longerWindow: false,
  emergencyConfirm: true,
};

export function loadA11yPrefs(): A11yPrefs {
  try {
    return { ...A11Y_DEFAULTS, ...JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') };
  } catch {
    return A11Y_DEFAULTS;
  }
}

export function saveA11yPrefs(prefs: A11yPrefs) {
  localStorage.setItem(LS_KEY, JSON.stringify(prefs));
}

/** Applies browser-side settings immediately (text size, reduced motion). */
export function applyA11yPrefs(prefs: A11yPrefs = loadA11yPrefs()) {
  const root = document.documentElement;
  const sizes = { default: '', large: '18px', larger: '20px' } as const;
  root.style.fontSize = sizes[prefs.textSize];
  root.classList.toggle('force-reduced-motion', prefs.reducedMotion);
  window.dispatchEvent(new CustomEvent(PREFS_EVENT));
}

/**
 * Should motion be reduced right now?
 *
 * The site setting is labelled "in addition to my system setting", so both
 * sources count and either one alone is enough. CSS already does this — the
 * media query and `.force-reduced-motion` carry identical rules — and this is
 * the equivalent for motion that JavaScript drives (video playback, staged
 * animations, scroll behaviour, motion/react). Reading only the media query
 * would leave the site setting half-working: transitions would freeze while
 * scripted animation carried on, which is worse than not offering it at all,
 * because the user believes they have turned it off.
 *
 * Call this at the moment the motion starts (event handlers, effects). For
 * anything that must re-render when the answer changes, use useReducedMotion().
 */
export function prefersReducedMotion(): boolean {
  // The prerender runs in Node, where neither source exists.
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOTION_QUERY).matches || loadA11yPrefs().reducedMotion;
}

/** Subscribes to both sources of the answer above. Returns an unsubscribe. */
export function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener('change', onChange);
  window.addEventListener(PREFS_EVENT, onChange);
  // Another tab editing the settings writes localStorage but fires no
  // PREFS_EVENT here, so listen for that too.
  window.addEventListener('storage', onChange);
  return () => {
    media.removeEventListener('change', onChange);
    window.removeEventListener(PREFS_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
