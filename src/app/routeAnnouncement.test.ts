import { describe, it, expect } from 'vitest';
import layoutSource from './dashboard/DashboardLayout.tsx?raw';
import appSource from './App.tsx?raw';

/**
 * The dashboard announces where you just landed.
 *
 * A client-side route change swaps the whole main region without a page load,
 * so the browser hands a screen reader nothing to say. The title does change,
 * but SPA title changes are reported inconsistently across screen reader and
 * browser pairings, and focus does not move — measured in the browser, it sits
 * on <body> after a nav. For a dashboard whose users are the reason this
 * product exists, replacing the page in silence is the wrong default.
 *
 * These are source-level checks: they prove the wiring is present and that
 * every route the shell owns can produce a name. Whether a given screen reader
 * actually voices it is not something a unit test can establish.
 */

describe('route announcement wiring', () => {
  it('the layout announces on route change', () => {
    expect(layoutSource).toMatch(/announce\(`\$\{routeLabel\} page`\)/);
  });

  it('it derives the name from the nav rather than a second list', () => {
    expect(layoutSource).toMatch(/for \(const group of NAV_GROUPS\)/);
  });

  it('it stays quiet on the landing page, which the page load already covers', () => {
    expect(layoutSource).toMatch(/lastAnnounced/);
  });

  it('…via the last-announced path, not a first-render flag', () => {
    // A boolean flag is not idempotent: StrictMode runs effects twice on
    // mount, consuming the flag on the first pass and announcing on the
    // second, so every hard load would read the landing page out loud.
    expect(layoutSource).toMatch(/location\.pathname === lastAnnounced\.current/);
    expect(layoutSource).not.toMatch(/isFirstRoute/);
  });

  it('the live regions it speaks through are mounted in this shell', () => {
    expect(layoutSource).toMatch(/<LiveRegions \/>/);
  });
});

describe('every dashboard route can be named', () => {
  /** Child paths of the /dashboard route in App.tsx, resolved to full paths. */
  const routePaths = (() => {
    const block = appSource.slice(
      appSource.indexOf('<Route path="/dashboard"'),
      appSource.indexOf('<Route path="/admin"'),
    );
    const paths = ['/dashboard'];
    for (const [, sub] of block.matchAll(/<Route path="([^"/][^"]*)"/g)) {
      // Redirect-only aliases have no page of their own to name.
      if (block.includes(`path="${sub}" element={<Navigate`)) continue;
      paths.push(`/dashboard/${sub}`);
    }
    return paths;
  })();

  /** The lookup the layout performs, mirrored from NAV_GROUPS in its source. */
  const navEntries = [...layoutSource.matchAll(/\{ to: '([^']+)', label: '([^']+)'(, [^}]*)?\}/g)]
    .map((m) => ({ to: m[1], label: m[2], end: /end: true/.test(m[3] ?? '') }));

  const nameFor = (pathname: string) =>
    navEntries.find((e) => (e.end ? pathname === e.to : pathname.startsWith(e.to)))?.label ?? null;

  it('parses both sources (an empty list must not pass silently)', () => {
    expect(routePaths.length).toBeGreaterThanOrEqual(9);
    expect(navEntries.length).toBeGreaterThanOrEqual(9);
  });

  it.each(routePaths)('%s resolves to a name', (path) => {
    expect(nameFor(path)).toBeTruthy();
  });

  it('/dashboard resolves to Home, not to a child page', () => {
    // Home is the only `end` entry; without that flag every path starting
    // /dashboard would match it first and every page would announce "Home".
    expect(nameFor('/dashboard')).toBe('Home');
  });

  it('sibling paths that share a prefix stay distinct', () => {
    expect(nameFor('/dashboard/account')).toBe('Account');
    expect(nameFor('/dashboard/accessibility')).toBe('Accessibility');
  });
});
