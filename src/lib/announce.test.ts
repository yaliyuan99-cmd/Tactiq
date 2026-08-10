import { describe, it, expect } from 'vitest';
import { withVariation } from './announce';

/**
 * Regression cover for the live-region announcement rule.
 *
 * A screen reader only speaks an aria-live region when its text changes, so a
 * message repeated verbatim must still produce a new string. This is the bug
 * the zero-width alternation exists to prevent — if someone "simplifies"
 * withVariation to `return message`, repeated announcements go silent for
 * blind users, and nothing else in the app would catch it.
 */
describe('withVariation', () => {
  it('passes a new message through unchanged', () => {
    expect(withVariation('', 'Command window open.')).toBe('Command window open.');
    expect(withVariation('Previous.', 'Next item.')).toBe('Next item.');
  });

  it('changes the string when the same message repeats', () => {
    const first = withVariation('', 'Selected.');
    const second = withVariation(first, 'Selected.');
    expect(second).not.toBe(first);
  });

  it('keeps producing a change across a long run of identical messages', () => {
    let current = '';
    for (let i = 0; i < 10; i++) {
      const next = withVariation(current, 'Next item.');
      expect(next).not.toBe(current);
      current = next;
    }
  });

  it('only ever varies by invisible characters, so speech is unaffected', () => {
    const varied = withVariation('Selected.', 'Selected.');
    expect(varied.replace(/\u200B/g, '')).toBe('Selected.');
  });
});
