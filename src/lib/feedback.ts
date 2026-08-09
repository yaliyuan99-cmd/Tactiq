/**
 * Multi-channel feedback for simulated gestures, honouring the user's saved
 * accessibility preferences: short audio cues (Web Audio), phone vibration
 * where the browser supports it, and always a screen-reader announcement
 * through the live regions.
 *
 * Feedback is class-level by design (P4): confirm, reject, armed, emergency —
 * never one pattern per command.
 */
import { announce } from './announce';
import { loadA11yPrefs } from './a11yPrefs';

export type FeedbackClass = 'armed' | 'confirm' | 'reject' | 'emergency';

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function beep(frequency: number, startMs: number, durationMs: number, gainValue = 0.06) {
  const audio = ctx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  const t0 = audio.currentTime + startMs / 1000;
  const t1 = t0 + durationMs / 1000;
  gain.gain.setValueAtTime(gainValue, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t1);
  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t1 + 0.02);
}

const TONES: Record<FeedbackClass, () => void> = {
  armed: () => beep(1320, 0, 45),
  confirm: () => beep(880, 0, 70),
  reject: () => {
    beep(240, 0, 80);
    beep(240, 140, 80);
  },
  emergency: () => {
    beep(660, 0, 160, 0.08);
    beep(440, 200, 160, 0.08);
    beep(660, 400, 160, 0.08);
  },
};

const VIBRATION: Record<FeedbackClass, number[]> = {
  armed: [20],
  confirm: [45],
  reject: [30, 60, 30],
  emergency: [250, 120, 250, 120, 250],
};

const STRENGTH_SCALE = { gentle: 0.5, standard: 1, strong: 1.6 } as const;

/** Fire class-level feedback across every enabled channel. */
export function giveFeedback(kind: FeedbackClass, spokenText?: string) {
  const prefs = loadA11yPrefs();
  TONES[kind]();
  const scale = STRENGTH_SCALE[prefs.hapticStrength] ?? 1;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(VIBRATION[kind].map((ms) => Math.round(ms * scale)));
    } catch {
      /* vibration is best-effort */
    }
  }
  if (spokenText) {
    announce(spokenText, kind === 'emergency' ? 'assertive' : 'polite');
  }
}
