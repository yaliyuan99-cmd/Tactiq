import { describe, it, expect } from 'vitest';
// `?raw` pulls the files in as strings through Vite's own pipeline, so this
// test needs no node APIs — the project tsconfig is browser-scoped on purpose
// (see src/prerender-env.d.ts) and adding @types/node would undo that.
import notFoundSource from './NotFoundPage.tsx?raw';
import prerenderSource from '../../prerender.mjs?raw';

/**
 * The 404 title is declared twice, because a visitor can reach the page two
 * different ways:
 *   - a direct hit on a bad URL      → Netlify serves the prerendered 404.html
 *   - an in-app link to a dead route → React renders NotFoundPage client-side
 *
 * Both must say the same thing. If they drift, one class of visitor gets a
 * wrong page title — and screen readers announce that title on navigation, so
 * the cost lands hardest on exactly the users Tactiq is built for (WCAG 2.4.2).
 */
describe('404 page title', () => {
  const componentTitle = notFoundSource.match(/NOT_FOUND_TITLE\s*=\s*'([^']+)'/)?.[1];
  const prerenderTitle = prerenderSource.match(/\['\/404',\s*'404\.html',\s*'([^']+)'/)?.[1];

  it('is declared in the component', () => {
    expect(componentTitle).toBeTruthy();
  });

  it('is declared in the prerender route table', () => {
    expect(prerenderTitle).toBeTruthy();
  });

  it('matches across both, so either route shows the same title', () => {
    expect(componentTitle).toBe(prerenderTitle);
  });

  it('actually sets document.title when the component mounts', () => {
    expect(notFoundSource).toMatch(/document\.title\s*=\s*NOT_FOUND_TITLE/);
  });
});
