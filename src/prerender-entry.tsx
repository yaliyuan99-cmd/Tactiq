/**
 * SSG entry — used only by the prerender build step (`npm run build`), never
 * shipped to the browser. It renders the same route tree as `main.tsx`, but
 * wrapped in a StaticRouter at a fixed URL, and returns the finished HTML
 * string so `prerender.mjs` can inject it into dist/index.html per route.
 *
 * `renderToPipeableStream` + `onAllReady` (rather than `renderToString`) is
 * load-bearing: the route pages are React.lazy chunks, and only the streaming
 * renderer waits for them to resolve instead of emitting the Suspense spinner.
 */
import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
// Typed by src/prerender-env.d.ts — the project tsconfig is browser-scoped
// (no @types/node), and this entry only ever runs under node.
import { Writable } from 'node:stream';
import { StaticRouter } from 'react-router';
import { MotionConfig } from 'motion/react';
import ErrorBoundary from './app/components/ErrorBoundary';
import { AppRoutes } from './app/App';

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk;
        callback();
      },
      final(callback) {
        callback();
        resolve(html);
      },
    });

    const stream = renderToPipeableStream(
      <StrictMode>
        <MotionConfig reducedMotion="user">
          <ErrorBoundary>
            <StaticRouter location={url}>
              <AppRoutes />
            </StaticRouter>
          </ErrorBoundary>
        </MotionConfig>
      </StrictMode>,
      {
        onAllReady() {
          stream.pipe(sink);
        },
        onError(error) {
          reject(error);
        },
      },
    );
  });
}
