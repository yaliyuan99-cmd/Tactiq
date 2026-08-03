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
