import { describe, it, expect } from 'vitest';
import source from './components/ErrorBoundary.tsx?raw';

/**
 * The crash screen has to announce itself.
 *
 * It swaps in without a navigation, so nothing tells a screen reader the page
 * changed: the title still names the page that crashed, and the live-region bus
 * is no help because the shell hosting it has just been replaced. Verified
 * against a real caught render error — before this, the tab still read "The
 * research project · Tactiq" while the page said "Something went wrong".
 */

describe('the crash screen', () => {
  it('retitles the tab when it catches', () => {
    expect(source).toMatch(/document\.title = ERROR_TITLE/);
  });

  it('does that in componentDidCatch, not render', () => {
    // Writing to document.title during render is a side effect in the render
    // phase; React may call render more than once per commit.
    const didCatch = source.slice(source.indexOf('componentDidCatch'), source.indexOf('render()'));
    expect(didCatch).toContain('document.title = ERROR_TITLE');
  });

  it('names the page as well as the site', () => {
    const title = source.match(/ERROR_TITLE = '([^']+)'/)?.[1];
    expect(title).toBeTruthy();
    expect(title).toMatch(/Tactiq/);
    expect(title).toMatch(/wrong/i);
  });

  it('marks the message as an alert so it is spoken on mount', () => {
    expect(source).toMatch(/<div role="alert">/);
  });

  it('keeps the recovery buttons outside that alert', () => {
    // Otherwise the announcement reads "Reload page Back to home" as part of
    // the message. Measured in the browser: 0 interactive elements inside.
    const alertStart = source.indexOf('<div role="alert">');
    const alertEnd = source.indexOf('</div>', source.indexOf('</p>', alertStart));
    const inside = source.slice(alertStart, alertEnd);
    expect(inside).toContain('Something went wrong');
    expect(inside).not.toContain('<button');
    expect(inside).not.toContain('Reload page');
  });
});
