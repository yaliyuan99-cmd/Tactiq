/**
 * Minimal ambient typing for the one node API the prerender entry uses.
 * The project tsconfig is browser-scoped on purpose (no @types/node, so node
 * globals can't leak into browser code) — prerender-entry.tsx runs only under
 * node during the SSG build step, where the real 'node:stream' exists.
 */
declare module 'node:stream' {
  export class Writable {
    constructor(options: {
      write?: (chunk: unknown, encoding: string, callback: () => void) => void;
      final?: (callback: () => void) => void;
    });
  }
}
