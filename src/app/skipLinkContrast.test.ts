import { describe, it, expect } from 'vitest';
import introSource from './showcase/TactiqIntro.tsx?raw';
import headerSource from './home/SiteHeader.tsx?raw';
import dashboardSource from './dashboard/DashboardLayout.tsx?raw';

/**
 * The skip link is the one control that exists purely for keyboard users, and
 * it is only ever seen while focused — so when its colours are weak, the people
 * it was built for are the only people who ever notice.
 *
 * All three shipped below AA for 16px normal-weight text: white on --t-violet
 * measured 3.69:1, and white on the dark theme's --primary 4.03:1, against the
 * 4.5:1 WCAG 1.4.3 asks for.
 *
 * LIMITATION, stated so nobody trusts this further than it goes: the token
 * values below are copied from theme.css / showcase.css, because `?raw` on a
 * .css file returns an empty string here — Tailwind's Vite plugin consumes the
 * file first, by plain import and by import.meta.glob alike. So this pins the
 * pairing each skip link *uses*, not the hex the CSS currently defines. Editing
 * a token without editing this file would slip past.
 */

const AA_NORMAL_TEXT = 4.5;

/** Mirrors of the CSS custom properties — see the limitation above. */
const TOKENS = {
  tVioletDeep: '#534ab7', // showcase.css
  foregroundLight: '#211e1a', // theme.css, light block
  backgroundLight: '#f6f4ef',
  foregroundDark: '#ece8e0', // theme.css, dark block
  backgroundDark: '#1b1916',
} as const;

function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const channels = [0, 2, 4].map((i) => {
    const s = parseInt(full.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

describe('the contrast maths itself', () => {
  // A formula that quietly returns the wrong number would make every assertion
  // below meaningless, so pin it against values that are known independently.
  it('gives 21:1 for black on white', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('gives 1:1 for a colour against itself', () => {
    expect(contrast('#8b6cff', '#8b6cff')).toBeCloseTo(1, 5);
  });

  it('reproduces the 3.69:1 the browser measured on the old skip link', () => {
    expect(contrast('#ffffff', '#8b6cff')).toBeCloseTo(3.69, 1);
  });

  it('reproduces the 4.03:1 of white on the dark theme primary', () => {
    expect(contrast('#ffffff', '#d3591d')).toBeCloseTo(4.03, 1);
  });
});

describe('the pairings the skip links now use', () => {
  it('showcase: white on the deep violet clears AA', () => {
    expect(contrast('#ffffff', TOKENS.tVioletDeep)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('site header and dashboard clear AA in the light theme', () => {
    expect(contrast(TOKENS.backgroundLight, TOKENS.foregroundLight)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it('…and in the dark theme, where bg-primary was failing', () => {
    expect(contrast(TOKENS.backgroundDark, TOKENS.foregroundDark)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });
});

describe('each skip link actually uses that pairing', () => {
  it('the showcase link uses --t-violet-deep, not the bright --t-violet', () => {
    expect(introSource).toMatch(/background: 'var\(--t-violet-deep\)'/);
  });

  it.each([
    ['SiteHeader', headerSource],
    ['DashboardLayout', dashboardSource],
  ])('%s uses focus:bg-foreground rather than focus:bg-primary', (_name, source) => {
    const skipLink = source
      .split('\n')
      .find((line) => line.includes('sr-only') && line.includes('focus:not-sr-only'));
    expect(skipLink).toBeDefined();
    expect(skipLink).toContain('focus:bg-foreground');
    expect(skipLink).not.toContain('focus:bg-primary');
  });
});
