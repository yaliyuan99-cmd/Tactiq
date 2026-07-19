import { useEffect, useRef, useState, type ReactNode } from 'react';
import '@google/model-viewer';

interface ProductViewerProps {
  /** Path to the .glb / .gltf model, e.g. "/models/ring.glb". */
  src: string;
  /** Still image shown over the canvas until the model has loaded. */
  poster?: string;
  alt: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  /** Enable "View in your space" AR on supported phones. */
  ar?: boolean;
  exposure?: number;
  className?: string;
  /** Fallback content rendered when WebGL/model-viewer is unavailable. */
  children?: ReactNode;
}

export default function ProductViewer({
  src,
  poster,
  alt,
  autoRotate = false,
  cameraControls = false,
  ar = false,
  exposure = 1,
  className,
  children,
}: ProductViewerProps) {
  const ref = useRef<HTMLElement>(null);
  // If the model fails to load (missing file, WebGL unavailable, decode error),
  // drop the 3D canvas and show the static fallback instead of a broken frame.
  const [failed, setFailed] = useState(false);
  // We manage the poster overlay ourselves (rather than model-viewer's built-in
  // poster / fallback slot, which can linger over the canvas in environments
  // where its visibility observer doesn't fire). `ready` hides it once loaded.
  const [ready, setReady] = useState(false);

  // model-viewer reads these as boolean HTML attributes; set them imperatively
  // so toggling a prop reliably adds/removes the attribute on the custom element.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const toggle = (name: string, on: boolean) =>
      on ? el.setAttribute(name, '') : el.removeAttribute(name);
    toggle('camera-controls', cameraControls);
    toggle('auto-rotate', autoRotate);
    toggle('ar', ar);
  }, [cameraControls, autoRotate, ar]);

  // Track the model-viewer load lifecycle. A failed fetch/parse degrades to the
  // `children` fallback; a successful load reveals the canvas and fades out our
  // poster. `el.loaded` is checked synchronously in case eager loading finished
  // before this effect (and its listener) ran.
  useEffect(() => {
    const el = ref.current as (HTMLElement & { loaded?: boolean }) | null;
    if (!el) return;
    let raf = 0;
    const onError = () => setFailed(true);
    const onLoad = () => setReady(true);
    el.addEventListener('error', onError);
    el.addEventListener('load', onLoad);
    // Poll `loaded` as well: the one-shot `load` event can be missed across a
    // StrictMode remount or when eager loading completes before this listener
    // attaches, which would otherwise leave the poster covering the model.
    const poll = () => {
      if (!ref.current) return;
      if ((ref.current as { loaded?: boolean }).loaded) {
        setReady(true);
        return;
      }
      raf = requestAnimationFrame(poll);
    };
    poll();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('error', onError);
      el.removeEventListener('load', onLoad);
    };
  }, [src]);

  // Reset transient state whenever we point at a new model.
  useEffect(() => {
    setFailed(false);
    setReady(false);
  }, [src]);

  if (failed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* @ts-expect-error model-viewer is a custom element registered by @google/model-viewer at import time; it has no JSX.IntrinsicElements entry */}
      <model-viewer
        ref={ref}
        src={src}
        alt={alt}
        exposure={String(exposure)}
        loading="eager"
        reveal="auto"
        shadow-intensity="1.1"
        shadow-softness="1"
        environment-image="neutral"
        camera-orbit="0deg 78deg auto"
        rotation-per-second="26deg"
        auto-rotate-delay="0"
        interaction-prompt="none"
        touch-action="pan-y"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
      {poster && (
        <img
          src={poster}
          alt={alt}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            opacity: ready ? 0 : 1,
            transition: 'opacity 500ms ease',
          }}
        />
      )}
    </div>
  );
}
