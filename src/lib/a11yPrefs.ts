/**
 * Website accessibility preferences — saved to the browser, applied globally.
 * Kept in src/lib so the boot path (main.tsx) can apply them without loading
 * any dashboard code.
 */

const LS_KEY = 'tactiq-a11y';

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
}

// ---------------------------------------------------------------------------
// Motion gate
//
// The CSS rule in theme.css zeroes animation-duration and transition-duration,
// which stops CSS animation and Motion transitions but has NO effect on a
// requestAnimationFrame loop inside a canvas. Anything that drives its own
// frame loop must gate on shouldAnimate() as well, or it keeps running for a
// visitor who asked it not to.
//
// This is the one place that combines the OS media query with the site's own
// stored preference. Do not hand-roll `matchMedia` at a call site.
// ---------------------------------------------------------------------------

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

/** True when the OS asks for reduced motion. SSR-safe (returns false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCE_QUERY).matches;
}

/**
 * Whether animation may run at all: false if either the OS or the site's own
 * accessibility setting asks for reduced motion.
 *
 * When this is false, render one full-fidelity frame and stop the loop — never
 * a degraded image and never a blank panel. Reduced motion must not mean
 * reduced information.
 */
export function shouldAnimate(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion()) return false;
  return !document.documentElement.classList.contains('force-reduced-motion');
}

/**
 * Subscribes to motion-preference changes (OS query plus the site's own class).
 * Returns an unsubscribe function.
 */
export function onMotionPreferenceChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const media = window.matchMedia?.(REDUCE_QUERY);
  media?.addEventListener('change', callback);

  // The site's own toggle flips a class on <html> rather than the media query.
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => {
    media?.removeEventListener('change', callback);
    observer.disconnect();
  };
}
