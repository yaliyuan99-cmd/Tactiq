import { describe, it, expect } from 'vitest';

/**
 * Every dialog must announce itself and be escapable.
 *
 * The admin console shipped two destructive confirmations — suspend an account,
 * erase someone's data — on a plain `fixed inset-0` overlay: no role, no
 * accessible name, no Escape, and no focus management, so Tab walked straight
 * into the user table behind it. The command palette and the simulator's
 * emergency overlay had it right all along, which is exactly why nobody
 * noticed the third one.
 *
 * These checks are static, so they prove the markup contract rather than the
 * runtime behaviour; the focus trap itself is verified in the browser.
 */

const sources = import.meta.glob('./**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** The opening tag containing each `role="dialog"`, with its file. */
function dialogTags(): { file: string; tag: string }[] {
  const found: { file: string; tag: string }[] = [];
  for (const [file, source] of Object.entries(sources)) {
    let from = 0;
    for (;;) {
      const at = source.indexOf('role="dialog"', from);
      if (at === -1) break;
      const start = source.lastIndexOf('<', at);
      const end = source.indexOf('>', at);
      found.push({ file, tag: source.slice(start, end + 1) });
      from = at + 1;
    }
  }
  return found;
}

const dialogs = dialogTags();

describe('dialog semantics', () => {
  it('finds the dialogs (a rename must fail loudly, not silently pass)', () => {
    expect(dialogs.length).toBeGreaterThanOrEqual(3);
  });

  it.each(dialogs.map((d, i) => [`${d.file} #${i}`, d] as const))(
    '%s is marked aria-modal',
    (_name, dialog) => {
      expect(dialog.tag).toMatch(/aria-modal=\{?["']?true/);
    },
  );

  it.each(dialogs.map((d, i) => [`${d.file} #${i}`, d] as const))(
    '%s has an accessible name',
    (_name, dialog) => {
      expect(dialog.tag).toMatch(/aria-label(ledby)?=/);
    },
  );
});

describe('the admin confirmation dialog', () => {
  const source = sources['./admin/AdminPage.tsx'] ?? '';

  it('closes on Escape', () => {
    expect(source).toMatch(/e\.key === 'Escape'/);
  });

  it('keeps Tab inside the panel', () => {
    expect(source).toMatch(/e\.key !== 'Tab'/);
    expect(source).toMatch(/shiftKey/);
  });

  it('restores focus to whatever opened it', () => {
    expect(source).toMatch(/previousFocus\.current\?\.focus\?\.\(\)/);
  });

  it('gives both destructive dialogs a name', () => {
    // `[^\n]` rather than `[^>]`: the tag holds arrow functions, so it contains
    // `>` characters of its own.
    const labels = [...source.matchAll(/<Modal[^\n]*?label="([^"]+)"/g)].map((m) => m[1]);
    expect(labels).toEqual(['Suspend account', 'Erase user data']);
  });
});
