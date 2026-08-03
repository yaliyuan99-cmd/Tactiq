import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
function ProductViewer({
  src,
  poster,
  alt,
  autoRotate = false,
  cameraControls = false,
  ar = false,
  exposure = 1,
  className,
  children
}) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    import("@google/model-viewer").catch(() => setFailed(true));
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const toggle = (name, on) => on ? el.setAttribute(name, "") : el.removeAttribute(name);
    toggle("camera-controls", cameraControls);
    toggle("auto-rotate", autoRotate);
    toggle("ar", ar);
  }, [cameraControls, autoRotate, ar]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onError = () => setFailed(true);
    const onLoad = () => setReady(true);
    el.addEventListener("error", onError);
    el.addEventListener("load", onLoad);
    const poll = () => {
      if (!ref.current) return;
      if (ref.current.loaded) {
        setReady(true);
        return;
      }
      raf = requestAnimationFrame(poll);
    };
    poll();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("error", onError);
      el.removeEventListener("load", onLoad);
    };
  }, [src]);
  useEffect(() => {
    setFailed(false);
    setReady(false);
  }, [src]);
  if (failed) {
    return /* @__PURE__ */ jsx("div", { className, children });
  }
  return /* @__PURE__ */ jsxs("div", { className, style: { position: "relative" }, children: [
    /* @__PURE__ */ jsx(
      "model-viewer",
      {
        ref,
        src,
        alt,
        exposure: String(exposure),
        loading: "eager",
        reveal: "auto",
        "shadow-intensity": "1.1",
        "shadow-softness": "1",
        "environment-image": "neutral",
        "camera-orbit": "0deg 78deg auto",
        "rotation-per-second": "26deg",
        "auto-rotate-delay": "0",
        "interaction-prompt": "none",
        "touch-action": "pan-y",
        style: { width: "100%", height: "100%", backgroundColor: "transparent" }
      }
    ),
    poster && /* @__PURE__ */ jsx(
      "img",
      {
        src: poster,
        alt,
        "aria-hidden": true,
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          opacity: ready ? 0 : 1,
          transition: "opacity 500ms ease"
        }
      }
    )
  ] });
}
export {
  ProductViewer as default
};
