import { describe, it, expect } from 'vitest';

/**
 * Don't dim --muted-foreground with an opacity modifier.
 *
 * The token is already the muted step of the ramp: measured against the app's
 * surfaces it is 6.31:1, which clears AA (4.5:1) with little room to spare. Any
 * `/NN` modifier spends that room and drops the text under, and it did in three
 * places at once — the simulator's pipeline stage labels at 60% (2.66:1), the
 * sidebar group headings at 80% (3.99:1) and the ⌘K hint at 70% (3.26:1).
 *
 * Two of those were invisible to the page-level contrast audit, because the
 * sidebar only lays out at `lg:` widths and the preview pane reports a zero
 * width — so the audit skipped them as zero-size. Hence a source-level rule
 * rather than another runtime sweep.
 *
 * Genuinely decorative text (aria-hidden separators and the like) is exempt
 * from contrast rules, so this only rejects the modifier where it lands on
 * content a user is meant to read.
 */

const sources = import.meta.glob('./**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Lines using text-muted-foreground with an opacity modifier. */
function dimmedMutedText(): { file: string; line: string; lineNo: number }[] {
  const hits: { file: string; line: string; lineNo: number }[] = [];
  for (const [file, source] of Object.entries(sources)) {
    source.split('\n').forEach((line, i) => {
      if (!/text-muted-foreground\/\d+/.test(line)) return;
      // An aria-hidden element on the same line is decoration, not content.
      if (line.includes('aria-hidden')) return;
      hits.push({ file, line: line.trim().slice(0, 90), lineNo: i + 1 });
    });
  }
  return hits;
}

describe('muted text is not dimmed further', () => {
  it('finds sources to check (an empty glob must not pass silently)', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
  });

  it('no readable text uses a text-muted-foreground opacity modifier', () => {
    expect(dimmedMutedText()).toEqual([]);
  });

  it('still catches the pattern when it is present', () => {
    // Guards the detector itself: if the regex silently stopped matching, the
    // assertion above would pass for the wrong reason.
    const sample = '<p className="font-mono-label text-muted-foreground/80 px-3">Product</p>';
    expect(/text-muted-foreground\/\d+/.test(sample)).toBe(true);
  });
});
