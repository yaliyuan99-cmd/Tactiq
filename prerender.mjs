/**
 * Post-build prerender: renders every public route to static HTML so the
 * served pages contain the real text content instead of an empty #root.
 *
 * Runs after `vite build` (dist/) and `vite build --ssr` (dist-ssr/):
 * for each route it renders the app to a string and writes a copy of
 * dist/index.html with #root filled in. Netlify serves these files directly;
 * client-only routes (/account etc.) fall through to the SPA via _redirects.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROUTES = [
  ['/', 'index.html'],
  ['/project', 'project/index.html'],
  ['/privacy', 'privacy/index.html'],
  ['/terms', 'terms/index.html'],
  ['/accessibility', 'accessibility/index.html'],
  ['/login', 'login/index.html'],
  ['/signup', 'signup/index.html'],
  ['/forgot-password', 'forgot-password/index.html'],
  ['/reset-password', 'reset-password/index.html'],
  // No /404 route exists, so this renders the catch-all NotFoundPage —
  // Netlify serves dist/404.html for every unknown path with a real 404 status.
  ['/404', '404.html'],
];

const template = readFileSync('dist/index.html', 'utf8');
if (!template.includes('<div id="root"></div>')) {
  console.error('prerender: dist/index.html has no empty <div id="root"></div> to fill');
  process.exit(1);
}

const { render } = await import('./dist-ssr/prerender-entry.js');

let failures = 0;
for (const [route, outFile] of ROUTES) {
  try {
    const appHtml = await render(route);
    const page = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );
    const target = join('dist', outFile);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, page);
    console.log(`prerendered ${route} → dist/${outFile} (${Math.round(page.length / 1024)} kB)`);
  } catch (error) {
    failures += 1;
    console.error(`prerender FAILED for ${route}:`, error);
  }
}

process.exit(failures > 0 ? 1 : 0);
