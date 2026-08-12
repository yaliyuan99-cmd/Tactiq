import { describe, it, expect } from 'vitest';
import apiSource from './api.ts?raw';

/**
 * The "auth unavailable" message is public copy.
 *
 * `assertLocalAuthAllowed()` throws only when `import.meta.env.DEV` is false,
 * so its message is read exclusively by visitors to the deployed site and never
 * by whoever is developing. It surfaces on three public entry points — sign-up,
 * sign-in and password reset. It previously named VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY and described the fallback as "insecure", which tells
 * a reader nothing they can act on.
 */

const guard = apiSource.slice(
  apiSource.indexOf('function assertLocalAuthAllowed'),
  apiSource.indexOf('export async function signUp'),
);

/** The string actually shown to the user. */
const thrownMessage = guard.match(/throw new Error\(\s*'([^']+)'/)?.[1] ?? '';

describe('the auth-unavailable message shown to visitors', () => {
  it('exists', () => {
    expect(thrownMessage).toBeTruthy();
  });

  it('names no environment variables', () => {
    expect(thrownMessage).not.toMatch(/VITE_/);
  });

  it('does not call anything "insecure" at the reader', () => {
    expect(thrownMessage).not.toMatch(/insecure/i);
  });

  it('says accounts are unavailable and points somewhere useful', () => {
    expect(thrownMessage).toMatch(/account/i);
    expect(thrownMessage.length).toBeLessThan(140);
  });
});

describe('the diagnosis is kept for whoever deployed it', () => {
  it('goes to the console rather than being dropped', () => {
    expect(guard).toMatch(/console\.error\(/);
  });

  it('still names the missing variables there', () => {
    const logged = guard.slice(guard.indexOf('console.error'));
    expect(logged).toMatch(/VITE_SUPABASE_URL/);
    expect(logged).toMatch(/VITE_SUPABASE_ANON_KEY/);
  });
});

describe('the guard itself is unchanged in substance', () => {
  it('still lets development through and blocks everything else', () => {
    expect(guard).toMatch(/if \(import\.meta\.env\.DEV\) return;/);
    expect(guard).toMatch(/throw new Error\(/);
  });
});
