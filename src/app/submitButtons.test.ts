import { describe, it, expect } from 'vitest';

/**
 * A submit button must not use the `disabled` attribute for its pending state.
 *
 * `disabled` removes the button from the tab order, and a focused element that
 * becomes disabled has its focus dropped to `<body>`. Every form here did that:
 * press Enter on "Sign in", get the credentials wrong, and focus was gone —
 * the error was announced (role="alert" is a live region, so that part worked)
 * but the keyboard user was left at the top of the document, tabbing all the
 * way back to retry. Measured, not theorised: focus was on the BUTTON before
 * the click and on BODY 50 ms later.
 *
 * `aria-disabled` conveys the same state without touching focusability, which
 * is why it is the fix — but it also leaves the button clickable, so each
 * handler must guard against a second in-flight submit itself.
 */

const sources = import.meta.glob('./**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Opening tags of every `type="submit"` button, with their file. */
function submitButtons(): { file: string; tag: string }[] {
  const found: { file: string; tag: string }[] = [];
  for (const [file, source] of Object.entries(sources)) {
    let from = 0;
    for (;;) {
      const at = source.indexOf('type="submit"', from);
      if (at === -1) break;
      const start = source.lastIndexOf('<button', at);
      const end = source.indexOf('>', at);
      found.push({ file, tag: source.slice(start, end + 1) });
      from = at + 1;
    }
  }
  return found;
}

const buttons = submitButtons();

describe('submit buttons', () => {
  it('finds them (a rename must fail loudly, not silently pass)', () => {
    expect(buttons.length).toBeGreaterThanOrEqual(7);
  });

  it.each(buttons.map((b, i) => [`${b.file} #${i}`, b] as const))(
    '%s does not drop focus by going `disabled`',
    (_name, button) => {
      expect(button.tag).not.toMatch(/[^-]disabled=/);
    },
  );

  it.each(buttons.map((b, i) => [`${b.file} #${i}`, b] as const))(
    '%s conveys its pending state with aria-disabled',
    (_name, button) => {
      expect(button.tag).toMatch(/aria-disabled=/);
    },
  );
});

describe('the handlers behind those buttons', () => {
  // aria-disabled leaves the button clickable, so each of these must refuse a
  // second submit itself — otherwise the follow form files two waitlist
  // entries for one person.
  const guarded = [
    './auth/LoginPage.tsx',
    './auth/SignUpPage.tsx',
    './auth/ForgotPasswordPage.tsx',
    './auth/ResetPasswordPage.tsx',
    './home/FollowForm.tsx',
    './dashboard/AccountSettingsPage.tsx',
  ];

  it.each(guarded)('%s returns early while a submit is in flight', (file) => {
    const source = sources[file] ?? '';
    expect(source).toMatch(/if \((loading|status === 'submitting'|\w+State === 'saving')\) return;/);
  });
});
