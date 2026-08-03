/**
 * Accessibility settings — every control works right now in the browser and
 * says where it is saved. Ring-dependent settings are shown but honestly
 * labelled "will sync when a ring is paired" instead of pretending to apply.
 */
import { useEffect, useState } from 'react';
import { Vibrate } from 'lucide-react';
import {
  loadA11yPrefs,
  saveA11yPrefs,
  applyA11yPrefs,
  type A11yPrefs,
} from '../../lib/a11yPrefs';

const BrowserBadge = () => (
  <span className="font-mono-label text-status-confirmed">Saved to browser — applies immediately</span>
);
const RingBadge = () => (
  <span className="font-mono-label text-status-future">Will sync when a ring is paired — not yet available</span>
);

export default function AccessibilityPage() {
  const [prefs, setPrefs] = useState<A11yPrefs>(loadA11yPrefs);
  const [hapticPlaying, setHapticPlaying] = useState(false);

  useEffect(() => {
    document.title = 'Accessibility · Tactiq';
  }, []);

  useEffect(() => {
    saveA11yPrefs(prefs);
    applyA11yPrefs(prefs);
  }, [prefs]);

  const set = <K extends keyof A11yPrefs>(k: K, v: A11yPrefs[K]) => setPrefs((p) => ({ ...p, [k]: v }));

  const previewHaptic = () => {
    setHapticPlaying(true);
    const patterns = { gentle: [40], standard: [60, 80, 60], strong: [120, 60, 120] } as const;
    if ('vibrate' in navigator) navigator.vibrate?.([...patterns[prefs.hapticStrength]]);
    window.setTimeout(() => setHapticPlaying(false), 900);
  };

  const fieldCls = 'h-11 px-3 rounded-md border border-input bg-input-background';

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl mb-1">Accessibility</h1>
      <p className="text-muted-foreground mb-8 max-w-[60ch]">
        Website settings apply immediately and are saved in this browser. Ring settings are
        recorded with your preferences and will sync once real hardware can receive them.
      </p>

      <div className="space-y-8">
        {/* Interface text size */}
        <section>
          <h2 className="text-lg mb-1">Interface text size</h2>
          <p className="mb-3"><BrowserBadge /></p>
          <div role="radiogroup" aria-label="Interface text size" className="flex flex-wrap gap-2">
            {(
              [
                ['default', 'Default'],
                ['large', 'Large'],
                ['larger', 'Larger'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                role="radio"
                aria-checked={prefs.textSize === val}
                onClick={() => set('textSize', val)}
                className={`px-4 h-11 rounded-md border text-[0.95rem] transition-colors ${
                  prefs.textSize === val
                    ? 'border-primary bg-primary/10 text-primary-strong font-medium'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Reduced motion */}
        <section>
          <h2 className="text-lg mb-1">Reduce motion</h2>
          <p className="mb-3"><BrowserBadge /></p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={prefs.reducedMotion}
              onChange={(e) => set('reducedMotion', e.target.checked)}
              className="w-5 h-5 accent-[var(--color-primary)]"
            />
            <span className="text-[0.95rem]">
              Remove non-essential animation on this site, in addition to my system setting
            </span>
          </label>
        </section>

        {/* Hand preference */}
        <section>
          <h2 className="text-lg mb-1">Hand configuration</h2>
          <p className="mb-3"><RingBadge /></p>
          <label htmlFor="a11y-hand" className="block text-[0.95rem] mb-1.5">
            Which hand will wear the ring?
          </label>
          <select
            id="a11y-hand"
            value={prefs.handPreference}
            onChange={(e) => set('handPreference', e.target.value as A11yPrefs['handPreference'])}
            className={`${fieldCls} max-w-xs w-full`}
          >
            <option value="right">Right hand</option>
            <option value="left">Left hand</option>
          </select>
        </section>

        {/* Haptics */}
        <section>
          <h2 className="text-lg mb-1">Haptic strength</h2>
          <p className="mb-3"><RingBadge /></p>
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Haptic strength" className="flex gap-2">
              {(
                [
                  ['gentle', 'Gentle'],
                  ['standard', 'Standard'],
                  ['strong', 'Strong'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  role="radio"
                  aria-checked={prefs.hapticStrength === val}
                  onClick={() => set('hapticStrength', val)}
                  className={`px-4 h-11 rounded-md border text-[0.95rem] transition-colors ${
                    prefs.hapticStrength === val
                      ? 'border-primary bg-primary/10 text-primary-strong font-medium'
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={previewHaptic}
              className="inline-flex items-center gap-2 px-4 h-11 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
            >
              <Vibrate className={`w-4 h-4 ${hapticPlaying ? 'text-primary-strong' : ''}`} aria-hidden />
              {hapticPlaying ? 'Playing…' : 'Preview'}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Preview vibrates on phones; on computers it is visual only.
          </p>
        </section>

        {/* Command window */}
        <section>
          <h2 className="text-lg mb-1">Command window</h2>
          <p className="mb-3"><RingBadge /></p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={prefs.longerWindow}
              onChange={(e) => set('longerWindow', e.target.checked)}
              className="w-5 h-5 accent-[var(--color-primary)]"
            />
            <span className="text-[0.95rem]">Keep the command window open longer after squeezing</span>
          </label>
        </section>

        {/* Emergency confirmation */}
        <section>
          <h2 className="text-lg mb-1">Emergency action</h2>
          <p className="mb-3"><RingBadge /></p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={prefs.emergencyConfirm}
              onChange={(e) => set('emergencyConfirm', e.target.checked)}
              className="w-5 h-5 accent-[var(--color-primary)]"
            />
            <span className="text-[0.95rem]">
              Ask for a second confirmation before the emergency action calls anyone
            </span>
          </label>
          <p className="text-sm text-muted-foreground mt-2 max-w-[56ch]">
            Emergency always requires the sustained five-second hold on the pinky tip and can
            never be reassigned — this setting only adds a confirmation on top.
          </p>
        </section>
      </div>
    </div>
  );
}
