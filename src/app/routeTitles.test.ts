import { describe, it, expect } from 'vitest';
// `?raw` reads the sources as strings through Vite's own pipeline, so this
// needs no node APIs — the tsconfig is browser-scoped on purpose.
import appSource from './App.tsx?raw';
import prerenderSource from '../../prerender.mjs?raw';

/**
 * Every route a visitor can land on must set its own document title.
 *
 * Screen readers announce the title on navigation, so a page that never sets
 * one leaves the previous page's title in place and tells the user they are
 * somewhere they are not (WCAG 2.4.2). Two routes have now shipped with that
 * bug — the 404 page, then /admin — each found by hand, one page at a time.
 * This checks the whole route table at once instead, so the next route added
 * without a title fails here rather than in front of a user.
 */

const sources = import.meta.glob('./**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Components that set the title on behalf of the pages that render them. */
const TITLE_SETTING_LAYOUTS = ['AuthLayout', 'LegalPage'];

/**
 * Routes with no content of their own — DashboardLayout renders an `<Outlet />`
 * for the child route that owns the title, and ProtectedRoute is a pure gate.
 * Requiring a title here would be wrong, not merely unnecessary.
 */
const LAYOUT_ONLY = ['DashboardLayout', 'ProtectedRoute'];

/** component name -> module path, from both eager and lazy imports in App.tsx */
function importMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [, name, path] of appSource.matchAll(
    /import\s+(\w+)\s+from\s+'([^']+)'/g,
  )) {
    map.set(name, path);
  }
  for (const [, name, path] of appSource.matchAll(
    /const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\('([^']+)'\)\)/g,
  )) {
    map.set(name, path);
  }
  // Named imports (the section pages all live in one module).
  for (const [, names, path] of appSource.matchAll(
    /import\s+\{([^}]+)\}\s+from\s+'([^']+)'/g,
  )) {
    for (const name of names.split(',')) {
      const clean = name.trim();
      if (clean) map.set(clean, path);
    }
  }
  return map;
}

/** Components used as `element={<X />}` in the route table. */
function routeComponents(): string[] {
  return [...appSource.matchAll(/element=\{<(\w+)\s*\/>\}/g)]
    .map((m) => m[1])
    .filter((name, i, all) => all.indexOf(name) === i);
}

function sourceOf(modulePath: string): string | undefined {
  return sources[`${modulePath}.tsx`];
}

const imports = importMap();
const components = routeComponents();

describe('route titles', () => {
  it('finds the route table', () => {
    // A rename that breaks the parsing must fail loudly, not silently pass.
    expect(components.length).toBeGreaterThan(15);
  });

  it('resolves every route component to a source file', () => {
    const unresolved = components.filter((name) => {
      const path = imports.get(name);
      return !path || !sourceOf(path);
    });
    expect(unresolved).toEqual([]);
  });

  it.each(components.filter((name) => !LAYOUT_ONLY.includes(name)))(
    '%s sets a document title',
    (name) => {
      const source = sourceOf(imports.get(name)!)!;
      const setsOwn = source.includes('document.title');
      const delegates = TITLE_SETTING_LAYOUTS.some((layout) => source.includes(`<${layout}`));
      expect(setsOwn || delegates).toBe(true);
    },
  );

  it('titles end with the site name so tabs are distinguishable', () => {
    const titles = [...appSource.matchAll(/document\.title\s*=\s*'([^']+)'/g)].map((m) => m[1]);
    for (const title of titles) expect(title).toMatch(/Tactiq/);
  });
});

/**
 * /project is served two ways, like the 404 page: prerendered for a direct hit,
 * client-rendered when the homepage's CTAs route to it. The two titles must
 * agree or one class of visitor gets the wrong one.
 */
describe('/project title', () => {
  const componentTitle = sources['./LandingPage.tsx']?.match(
    /PROJECT_TITLE\s*=\s*'([^']+)'/,
  )?.[1];
  const prerenderTitle = prerenderSource.match(
    /\['\/project',\s*'project\/index\.html',\s*'([^']+)'/,
  )?.[1];

  it('is declared in the component', () => {
    expect(componentTitle).toBeTruthy();
  });

  it('is declared in the prerender route table', () => {
    expect(prerenderTitle).toBeTruthy();
  });

  it('matches across both, so either route shows the same title', () => {
    expect(componentTitle).toBe(prerenderTitle);
  });
});
