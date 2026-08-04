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

// [route, output file, unique <title>, canonical URL (null = self)]
const SITE = 'https://tactiq0.netlify.app';
const DEFAULT_TITLE = 'Tactiq — silent, eyes-free phone control for blind users';
const ROUTES = [
  ['/', 'index.html', DEFAULT_TITLE, null],
  ['/project', 'project/index.html', 'The research project · Tactiq', null],
  // Section pages reuse /project's content, so they canonicalise to it.
  ['/how-it-works', 'how-it-works/index.html', 'How it works · Tactiq', '/project'],
  ['/prototype', 'prototype/index.html', 'The ring — prototype · Tactiq', '/project'],
  ['/research', 'research/index.html', 'Research · Tactiq', '/project'],
  ['/status', 'status/index.html', 'Project status · Tactiq', '/project'],
  ['/faq', 'faq/index.html', 'FAQ · Tactiq', '/project'],
  ['/help', 'help/index.html', 'Help · Tactiq', null],
  ['/privacy', 'privacy/index.html', 'Privacy Policy · Tactiq', null],
  ['/terms', 'terms/index.html', 'Terms of Service · Tactiq', null],
  ['/accessibility', 'accessibility/index.html', 'Accessibility statement · Tactiq', null],
  ['/login', 'login/index.html', 'Sign in · Tactiq', null],
  ['/signup', 'signup/index.html', 'Create your account · Tactiq', null],
  ['/forgot-password', 'forgot-password/index.html', 'Reset your password · Tactiq', null],
  ['/reset-password', 'reset-password/index.html', 'Choose a new password · Tactiq', null],
  // No /404 route exists, so this renders the catch-all NotFoundPage —
  // Netlify serves dist/404.html for every unknown path with a real 404 status.
  ['/404', '404.html', 'Page not found · Tactiq', null],
];

const template = readFileSync('dist/index.html', 'utf8');
if (!template.includes('<div id="root"></div>')) {
  console.error('prerender: dist/index.html has no empty <div id="root"></div> to fill');
  process.exit(1);
}

const { render } = await import('./dist-ssr/prerender-entry.js');

let failures = 0;
for (const [route, outFile, title, canonicalTo] of ROUTES) {
  try {
    const appHtml = await render(route);
    const canonicalPath = canonicalTo ?? route;
    const canonicalUrl = canonicalPath === '/' ? `${SITE}/` : `${SITE}${canonicalPath}`;
    let page = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );
    page = page.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
    // The 404 page is served for arbitrary unknown URLs, so it gets no canonical.
    if (route !== '/404') {
      page = page.replace(
        '</head>',
        `  <link rel="canonical" href="${canonicalUrl}" />\n    </head>`,
      );
    }
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
