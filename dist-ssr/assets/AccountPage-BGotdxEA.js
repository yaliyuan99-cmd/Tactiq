import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { BatteryCharging, Battery, Cpu, RefreshCw, HeartPulse, Bluetooth, HardDrive, MapPin, Activity, Footprints, CircleCheck, ChevronRight, X, TrendingUp, TrendingDown, Minus, Zap, Radio, Ear, ChevronLeft, Undo2, CornerUpLeft, Check, ArrowRight, Hand, LogOut, ArrowLeft, Settings2, User, Loader2, KeyRound, ShoppingBag, Layers, Pencil, Trash2, Users } from "lucide-react";
import { g as getDeviceTelemetry, c as getDeviceHistory, u as useAuth, l as listGestureConfigs, d as getLatestOrder, i as isAdmin, e as signOut, f as updateProfile, h as deleteGestureConfig } from "../prerender-entry.js";
import { C as COMMANDS_BY_ID, c as commandLabelFor } from "./gestures-_WkCo3YC.js";
import { f as fieldClass } from "./AuthLayout-RShcSXXr.js";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import "react-dom/server";
import "node:stream";
import "@supabase/supabase-js";
function timeAgo(iso) {
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1e3));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  return `${mins}m ago`;
}
function batteryColor(level) {
  if (level > 50) return "text-chart-2";
  if (level > 20) return "text-yellow-500";
  return "text-destructive";
}
const METRICS = {
  battery: {
    key: "battery",
    title: "Battery",
    icon: BatteryCharging,
    tone: "text-chart-2",
    chart: "area",
    format: (v) => `${v}%`,
    blurb: "Charge level over the last 24 hours."
  },
  heartRate: {
    key: "heartRate",
    title: "Heart rate",
    icon: HeartPulse,
    tone: "text-destructive",
    chart: "area",
    format: (v) => `${v} bpm`,
    blurb: "Hourly average heart rate — lower overnight, higher when active."
  },
  signal: {
    key: "signal",
    title: "Connection",
    icon: Bluetooth,
    tone: "text-primary",
    chart: "area",
    format: (v) => `${v} dBm`,
    blurb: "Bluetooth signal strength (closer to 0 is stronger)."
  },
  steps: {
    key: "steps",
    title: "Steps",
    icon: Footprints,
    tone: "text-chart-2",
    chart: "bar",
    format: (v) => `${v.toLocaleString()}`,
    blurb: "Steps recorded each hour across the day."
  },
  activeMinutes: {
    key: "activeMinutes",
    title: "Active minutes",
    icon: Activity,
    tone: "text-chart-2",
    chart: "bar",
    format: (v) => `${v} min`,
    blurb: "Active minutes logged each hour."
  }
};
function DeviceDashboard({ seedKey }) {
  const [data, setData] = useState(() => getDeviceTelemetry(seedKey));
  const [hrHistory, setHrHistory] = useState(
    () => Array.from({ length: 24 }, () => getDeviceTelemetry(seedKey).wellness.heartRate)
  );
  const [openMetric, setOpenMetric] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const seedRef = useRef(seedKey);
  seedRef.current = seedKey;
  const syncNow = () => {
    setSyncing(true);
    const next = getDeviceTelemetry(seedRef.current);
    setData(next);
    setHrHistory((prev) => [...prev.slice(-23), next.wellness.heartRate]);
    window.setTimeout(() => setSyncing(false), 700);
  };
  const history = useMemo(() => getDeviceHistory(seedKey), [seedKey]);
  useEffect(() => {
    const tick = () => {
      const next = getDeviceTelemetry(seedRef.current);
      setData(next);
      setHrHistory((prev) => [...prev.slice(-23), next.wellness.heartRate]);
    };
    const id = window.setInterval(tick, 2500);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!openMetric) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMetric(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMetric]);
  const BatteryIcon = data.battery.charging ? BatteryCharging : Battery;
  const w = 200;
  const h = 44;
  const min = Math.min(...hrHistory) - 3;
  const max = Math.max(...hrHistory) + 3;
  const points = hrHistory.map((v, i) => {
    const x = i / (hrHistory.length - 1) * w;
    const y = h - (v - min) / Math.max(1, max - min) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const storagePct = Math.round(data.storage.usedMb / data.storage.totalMb * 100);
  const signalBars = data.signal.quality === "excellent" ? 4 : data.signal.quality === "good" ? 3 : data.signal.quality === "fair" ? 2 : 1;
  const STEP_GOAL = 1e4;
  const goalPct = Math.min(100, Math.round(data.wellness.steps / STEP_GOAL * 100));
  const distanceKm = (data.wellness.steps * 762e-6).toFixed(1);
  const ringR = 40;
  const ringC = 2 * Math.PI * ringR;
  return /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6 lg:col-span-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Cpu, { className: "w-5 h-5 text-primary" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Device status" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: syncNow,
            disabled: syncing,
            className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-60",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: `w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}` }),
              syncing ? "Syncing…" : "Sync now"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium text-chart-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
            /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" }),
            /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-chart-2" })
          ] }),
          data.connected ? "Connected" : "Offline"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: data.deviceName }),
      /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "·" }),
      /* @__PURE__ */ jsx("span", { children: data.serial }),
      /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "·" }),
      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
        " Synced ",
        timeAgo(data.lastSync)
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(MetricCard, { onClick: () => setOpenMetric("battery"), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs mb-2", children: [
          /* @__PURE__ */ jsx(BatteryIcon, { className: `w-4 h-4 ${batteryColor(data.battery.level)}` }),
          "Battery"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold", children: [
          data.battery.level,
          "%"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 h-1.5 rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsx(
          motion.div,
          {
            className: `h-full rounded-full ${data.battery.level > 20 ? "bg-chart-2" : "bg-destructive"}`,
            animate: { width: `${data.battery.level}%` },
            transition: { duration: 0.6 }
          }
        ) }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
          data.battery.charging ? "Charging" : `~${data.battery.estimatedDaysLeft} days left`,
          " · Health ",
          data.battery.health,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(MetricCard, { onClick: () => setOpenMetric("heartRate"), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs mb-2", children: [
          /* @__PURE__ */ jsx(HeartPulse, { className: "w-4 h-4 text-destructive" }),
          "Heart rate"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-1", children: [
          /* @__PURE__ */ jsx(
            motion.span,
            {
              initial: { scale: 1.15 },
              animate: { scale: 1 },
              className: "text-2xl font-semibold",
              children: data.wellness.heartRate
            },
            data.wellness.heartRate
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground mb-1", children: "bpm" })
        ] }),
        /* @__PURE__ */ jsx(
          "svg",
          {
            viewBox: `0 0 ${w} ${h}`,
            className: "mt-1 w-full h-9",
            preserveAspectRatio: "none",
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsx(
              "polyline",
              {
                points,
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                className: "text-destructive",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(MetricCard, { onClick: () => setOpenMetric("signal"), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs mb-2", children: [
          /* @__PURE__ */ jsx(Bluetooth, { className: "w-4 h-4 text-primary" }),
          "Connection"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-semibold capitalize", children: data.signal.quality }),
          /* @__PURE__ */ jsx("span", { className: "flex items-end gap-0.5 h-5", "aria-hidden": true, children: [1, 2, 3, 4].map((b) => /* @__PURE__ */ jsx(
            "span",
            {
              className: `w-1.5 rounded-sm transition-colors ${b <= signalBars ? "bg-primary" : "bg-secondary"}`,
              style: { height: `${b * 25}%` }
            },
            b
          )) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
          data.signal.rssiDbm,
          " dBm · Bluetooth 5.3 LE"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          "Firmware v",
          data.firmware
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/50 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs mb-2", children: [
          /* @__PURE__ */ jsx(HardDrive, { className: "w-4 h-4 text-chart-1" }),
          "Layout storage"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold", children: [
          storagePct,
          "%"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 h-1.5 rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-chart-1", style: { width: `${storagePct}%` } }) }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
          data.storage.usedMb,
          " / ",
          data.storage.totalMb,
          " MB used"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4 mt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/50 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs mb-3", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary" }),
          "Device location"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative h-40 rounded-lg overflow-hidden border border-border bg-secondary/40", children: [
          /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 w-full h-full text-foreground/10", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("pattern", { id: "grid", width: "24", height: "24", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx("path", { d: "M 24 0 L 0 0 0 24", fill: "none", stroke: "currentColor", strokeWidth: "1" }) }) }),
            /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", fill: "url(#grid)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsxs("span", { className: "relative flex h-4 w-4", children: [
            /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" }),
            /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-4 w-4 rounded-full bg-primary border-2 border-background" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm font-medium", children: data.location.label }),
            /* @__PURE__ */ jsxs("span", { className: "px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-muted-foreground", children: [
              "±",
              data.location.accuracyM,
              " m"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground tabular-nums", children: [
          data.location.lat.toFixed(4),
          ", ",
          data.location.lng.toFixed(4)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/50 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs mb-3", children: [
          /* @__PURE__ */ jsx(Activity, { className: "w-4 h-4 text-chart-2" }),
          "Today’s activity"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setOpenMetric("steps"),
              "aria-label": "Steps — past 24 hours",
              className: "group relative w-24 h-24 flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              children: [
                /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", className: "w-full h-full -rotate-90", children: [
                  /* @__PURE__ */ jsx(
                    "circle",
                    {
                      cx: "50",
                      cy: "50",
                      r: ringR,
                      fill: "none",
                      strokeWidth: "9",
                      className: "text-secondary",
                      stroke: "currentColor"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.circle,
                    {
                      cx: "50",
                      cy: "50",
                      r: ringR,
                      fill: "none",
                      strokeWidth: "9",
                      strokeLinecap: "round",
                      className: "text-chart-2",
                      stroke: "currentColor",
                      strokeDasharray: ringC,
                      initial: false,
                      animate: { strokeDashoffset: ringC * (1 - goalPct / 100) },
                      transition: { duration: 0.8, ease: "easeOut" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold tabular-nums leading-none", children: data.wellness.steps.toLocaleString() }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors", children: [
                    goalPct,
                    "% of goal"
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setOpenMetric("activeMinutes"),
                className: "w-full text-left rounded-lg bg-secondary/40 p-3 transition hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5", children: [
                    /* @__PURE__ */ jsx(Activity, { className: "w-3.5 h-3.5" }),
                    " Active"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-lg font-semibold tabular-nums", children: [
                    data.wellness.activeMinutes,
                    " min"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-secondary/40 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5", children: [
                /* @__PURE__ */ jsx(Footprints, { className: "w-3.5 h-3.5" }),
                " Distance"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-lg font-semibold tabular-nums", children: [
                distanceKm,
                " km"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 inline-flex items-center gap-1.5 text-xs text-chart-2", children: [
          /* @__PURE__ */ jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
          " Sensors healthy · goal ",
          STEP_GOAL.toLocaleString(),
          " steps"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Tap any metric to see the past 24 hours. All readings are simulated — Tactiq is a research prototype, and this preview shows how the companion app would present battery, location, and wear data." }),
    openMetric && /* @__PURE__ */ jsx(
      HistoryModal,
      {
        meta: METRICS[openMetric],
        history: history[openMetric],
        onClose: () => setOpenMetric(null)
      }
    )
  ] });
}
function MetricCard({
  children,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "group relative text-left rounded-xl border border-border bg-background/50 p-4 transition hover:border-primary/40 hover:bg-background hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      children: [
        /* @__PURE__ */ jsxs("span", { className: "absolute top-3 right-3 inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition group-hover:opacity-100", children: [
          "24h ",
          /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3" })
        ] }),
        children
      ]
    }
  );
}
function HistoryModal({
  meta,
  history,
  onClose
}) {
  var _a, _b;
  const Icon = meta.icon;
  const first = ((_a = history.points[0]) == null ? void 0 : _a.value) ?? 0;
  const last = ((_b = history.points[history.points.length - 1]) == null ? void 0 : _b.value) ?? 0;
  const delta = last - first;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.96, y: 8 },
          animate: { opacity: 1, scale: 1, y: 0 },
          onClick: (e) => e.stopPropagation(),
          className: "relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-xl",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": `${meta.title} — past 24 hours`,
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                "aria-label": "Close",
                className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground transition",
                children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(Icon, { className: `w-5 h-5 ${meta.tone}` }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: meta.title }),
              /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs font-medium text-muted-foreground", children: "· past 24 h" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-4", children: meta.blurb }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 mb-5", children: [
              /* @__PURE__ */ jsx(Stat, { label: "Min", value: meta.format(history.min) }),
              /* @__PURE__ */ jsx(Stat, { label: "Average", value: meta.format(history.avg) }),
              /* @__PURE__ */ jsx(Stat, { label: "Max", value: meta.format(history.max) })
            ] }),
            /* @__PURE__ */ jsx(HistoryChart, { meta, history }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(TrendIcon, { className: `w-3.5 h-3.5 ${meta.tone}` }),
              /* @__PURE__ */ jsx("span", { children: delta === 0 ? "No net change over 24 h" : `${delta > 0 ? "+" : ""}${meta.format(delta).replace(/^\+/, "")} vs. 24 h ago` })
            ] })
          ]
        }
      )
    }
  );
}
function Stat({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-secondary/40 p-3", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-base font-semibold tabular-nums", children: value })
  ] });
}
function HistoryChart({ meta, history }) {
  const W = 480;
  const H = 150;
  const padX = 6;
  const padY = 14;
  const pts = history.points;
  const n = pts.length;
  const lo = Math.min(...pts.map((p) => p.value));
  const hi = Math.max(...pts.map((p) => p.value));
  const span = Math.max(1, hi - lo);
  const yOf = (v) => padY + (H - padY * 2) * (1 - (v - lo) / span);
  const xOf = (i) => padX + i / (n - 1) * (W - padX * 2);
  const toneStroke = meta.tone;
  return /* @__PURE__ */ jsxs("div", { className: toneStroke, children: [
    /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full h-[150px]", preserveAspectRatio: "none", children: [
      [0.25, 0.5, 0.75].map((g) => /* @__PURE__ */ jsx(
        "line",
        {
          x1: padX,
          x2: W - padX,
          y1: padY + (H - padY * 2) * g,
          y2: padY + (H - padY * 2) * g,
          className: "text-border",
          stroke: "currentColor",
          strokeWidth: "1",
          strokeDasharray: "3 4",
          opacity: 0.5
        },
        g
      )),
      meta.chart === "area" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          motion.polyline,
          {
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: 1, opacity: 1 },
            transition: { duration: 0.6 },
            points: pts.map((p, i) => `${xOf(i).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(" "),
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: xOf(n - 1), cy: yOf(pts[n - 1].value), r: "3.5", fill: "currentColor" })
      ] }) : pts.map((p, i) => {
        const bw = (W - padX * 2) / n - 2;
        const x = xOf(i) - bw / 2;
        const y = yOf(p.value);
        const barH = Math.max(0, H - padY - y);
        return /* @__PURE__ */ jsx(
          motion.rect,
          {
            initial: { height: 0, y: H - padY },
            animate: { height: barH, y },
            transition: { duration: 0.4, delay: i * 0.01 },
            x,
            width: Math.max(1, bw),
            rx: 2,
            fill: "currentColor",
            opacity: 0.85
          },
          i
        );
      })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums", children: [0, 6, 12, 18, n - 1].map((i) => {
      var _a;
      return /* @__PURE__ */ jsx("span", { children: (_a = pts[i]) == null ? void 0 : _a.label }, i);
    }) })
  ] });
}
const CORE_COMMANDS = {
  "core-confirm": { id: "core-confirm", label: "Confirm", category: "Core", icon: Check },
  "core-back": { id: "core-back", label: "Dismiss / Back", category: "Core", icon: CornerUpLeft },
  "core-undo": { id: "core-undo", label: "Undo", category: "Core", icon: Undo2 },
  "core-next": { id: "core-next", label: "Next", category: "Core", icon: ChevronRight },
  "core-prev": { id: "core-prev", label: "Previous", category: "Core", icon: ChevronLeft },
  "core-read": { id: "core-read", label: "Read / Repeat", category: "Core", icon: Ear }
};
const GESTURE_EVENTS = [
  { gesture: "Index tip · tap", command: "core-confirm", weight: 6 },
  { gesture: "Middle base · tap", command: "core-next", weight: 5 },
  { gesture: "Ring base · tap", command: "core-prev", weight: 4 },
  { gesture: "Ring tip · tap", command: "core-read", weight: 4 },
  { gesture: "Index base · tap", command: "core-back", weight: 3 },
  { gesture: "Middle tip · tap", command: "core-undo", weight: 2 },
  { gesture: "Pinky base · tap", command: "announce-time", weight: 3 },
  { gesture: "Pinky tip · tap", command: "media-playpause", weight: 3 }
];
const TOTAL_WEIGHT = GESTURE_EVENTS.reduce((a, e) => a + e.weight, 0);
const CATEGORY_TONE = {
  Core: "text-primary",
  Media: "text-chart-1",
  Phone: "text-chart-2",
  Messages: "text-chart-2",
  Apps: "text-chart-1",
  Utility: "text-chart-2"
};
function seed01(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
function pickEvent() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const e of GESTURE_EVENTS) {
    r -= e.weight;
    if (r <= 0) return { gesture: e.gesture, command: e.command };
  }
  return GESTURE_EVENTS[0];
}
function relTime(at, now) {
  const s = Math.max(0, Math.round((now - at) / 1e3));
  if (s < 3) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}
function GestureActivity({ seedKey }) {
  const prefersReduced = useReducedMotion();
  const base = useMemo(() => 180 + Math.floor(seed01(seedKey) * 260), [seedKey]);
  const [today, setToday] = useState(base);
  const [events, setEvents] = useState(() => {
    const now2 = Date.now();
    return Array.from({ length: 3 }, (_, i) => {
      const e = pickEvent();
      return { id: -1 - i, gesture: e.gesture, command: e.command, at: now2 - (i + 1) * 6e3 };
    });
  });
  const [now, setNow] = useState(() => Date.now());
  const idRef = useRef(0);
  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          const e = pickEvent();
          const ev = { id: idRef.current++, gesture: e.gesture, command: e.command, at: Date.now() };
          setEvents((prev) => [ev, ...prev].slice(0, 6));
          setToday((t) => t + 1);
          schedule();
        },
        2e3 + Math.random() * 2400
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1e3);
    return () => window.clearInterval(id);
  }, []);
  return /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6 lg:col-span-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5 text-primary" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Gesture activity" })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium text-chart-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-chart-2" })
        ] }),
        /* @__PURE__ */ jsx(Radio, { className: "w-3.5 h-3.5" }),
        " Live"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-5", children: [
      /* @__PURE__ */ jsx(
        motion.span,
        {
          initial: prefersReduced ? false : { scale: 1.25, color: "var(--color-primary)" },
          animate: { scale: 1, color: "var(--color-foreground)" },
          transition: { duration: 0.35, ease: "easeOut" },
          className: "inline-block font-semibold text-foreground tabular-nums",
          children: today.toLocaleString()
        },
        today
      ),
      " ",
      "commands recognised today · simulated demo data"
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: events.map((ev) => {
      const cmd = CORE_COMMANDS[ev.command] ?? COMMANDS_BY_ID[ev.command];
      if (!cmd) return null;
      const Icon = cmd.icon;
      const tone = CATEGORY_TONE[cmd.category] ?? "text-primary";
      return /* @__PURE__ */ jsx(
        motion.li,
        {
          layout: true,
          initial: prefersReduced ? false : { opacity: 0, y: -14, height: 0 },
          animate: { opacity: 1, y: 0, height: "auto" },
          exit: prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0, transition: { duration: 0.25 } },
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
          className: "overflow-hidden",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 py-2.5", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary ${tone}`,
                children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("p", { className: "flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: ev.gesture }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: cmd.label })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                cmd.category,
                " · ",
                relTime(ev.at, now)
              ] })
            ] })
          ] })
        },
        ev.id
      );
    }) }) }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Recognised on-device — raw sensing never leaves the ring. This stream is simulated: Tactiq is a research prototype, and this preview shows how the companion app would display recognitions." })
  ] });
}
const CATEGORY_LABELS = {
  "blind-low-vision": "Blind or low-vision user",
  elderly: "Elderly or motor-impaired user",
  "motor-accessibility": "Accessibility user",
  developer: "Developer / Tech enthusiast",
  "early-adopter": "Early adopter",
  other: "Other"
};
function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState((user == null ? void 0 : user.fullName) ?? "");
  const [userCategory, setUserCategory] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [latestOrder, setLatestOrder] = useState(null);
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    setFullName((user == null ? void 0 : user.fullName) ?? "");
  }, [user == null ? void 0 : user.fullName]);
  useEffect(() => {
    let mounted = true;
    listGestureConfigs().then((rows) => {
      if (mounted) setConfigs(rows);
    }).catch(() => {
      if (mounted) setConfigs([]);
    }).finally(() => {
      if (mounted) setLoadingConfigs(false);
    });
    getLatestOrder().then((o) => mounted && setLatestOrder(o)).catch(() => {
    });
    isAdmin().then((a) => mounted && setAdmin(a)).catch(() => {
    });
    return () => {
      mounted = false;
    };
  }, []);
  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError("");
    setSavedProfile(false);
    setSavingProfile(true);
    try {
      await updateProfile({ fullName, userCategory: userCategory || void 0 });
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSavingProfile(false);
    }
  };
  const handleDeleteConfig = async (id) => {
    await deleteGestureConfig(id);
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  };
  const firstName = ((user == null ? void 0 : user.fullName) || (user == null ? void 0 : user.email) || "there").split(" ")[0];
  const seedKey = (user == null ? void 0 : user.id) || (user == null ? void 0 : user.email) || "demo";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
        /* @__PURE__ */ jsx(Hand, { className: "w-6 h-6" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Tactiq" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSignOut,
          className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
            "Sign out"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Back to site"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "animate-enter-rise", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-semibold mb-1", children: [
          "Hi, ",
          firstName
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8", children: "Your device, your keyboard, your account — all in one place." }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/customize",
            className: "group block mb-6 rounded-2xl bg-primary/10 p-6 hover:bg-primary/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Settings2, { className: "w-6 h-6" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Customise your shortcuts" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Choose what your two pinky shortcut points do — the seven core commands never move — then save layouts for different moments." })
              ] }),
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsx(DeviceDashboard, { seedKey }),
          /* @__PURE__ */ jsx(GestureActivity, { seedKey }),
          /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
              /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-primary" }),
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Profile" })
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleProfileSave, className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "acct-email", className: "block text-sm mb-1.5", children: "Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "acct-email",
                    type: "email",
                    value: (user == null ? void 0 : user.email) ?? "",
                    disabled: true,
                    className: `${fieldClass} opacity-60 cursor-not-allowed`
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "acct-name", className: "block text-sm mb-1.5", children: "Full name" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "acct-name",
                    type: "text",
                    value: fullName,
                    onChange: (e) => setFullName(e.target.value),
                    className: fieldClass
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "acct-category", className: "block text-sm mb-1.5", children: "I use Tactiq as…" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "acct-category",
                    value: userCategory,
                    onChange: (e) => setUserCategory(e.target.value),
                    className: `${fieldClass} text-muted-foreground`,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Prefer not to say" }),
                      Object.entries(CATEGORY_LABELS).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
                    ]
                  }
                )
              ] }),
              profileError && /* @__PURE__ */ jsx("p", { role: "alert", className: "text-sm text-destructive", children: profileError }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: savingProfile,
                  className: "px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-70",
                  children: savingProfile ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                    " Saving…"
                  ] }) : savedProfile ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }),
                    " Saved"
                  ] }) : "Save changes"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsx(KeyRound, { className: "w-5 h-5 text-primary" }),
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Security" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Keep your account secure with a strong, unique password." }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/reset-password",
                  className: "inline-block px-5 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium",
                  children: "Change password"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5 text-primary" }),
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Your order" })
              ] }),
              latestOrder ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: latestOrder.plan === "pro" ? "Reservation + Updates" : "Research Reservation" }),
                  /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/15 text-accent capitalize", children: latestOrder.status })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
                  (latestOrder.amount_cents / 100).toLocaleString(void 0, {
                    style: "currency",
                    currency: latestOrder.currency
                  }),
                  " ",
                  "· Reserved ",
                  new Date(latestOrder.created_at).toLocaleDateString(),
                  ". We’ll email you research updates as the bench experiment lands."
                ] }),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: "/checkout?plan=pro",
                    className: "inline-block px-5 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium",
                    children: "Change or add an order"
                  }
                )
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Want to follow the research? Register a free reservation." }),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: "/checkout?plan=pro",
                    className: "inline-block px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium",
                    children: "Go to checkout"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6 lg:col-span-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Layers, { className: "w-5 h-5 text-primary" }),
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Saved gesture layouts" })
              ] }),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/customize",
                  className: "inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:shadow-lg transition-shadow",
                  children: [
                    /* @__PURE__ */ jsx(Settings2, { className: "w-4 h-4" }),
                    " Customise"
                  ]
                }
              )
            ] }),
            loadingConfigs ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm py-4", children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
              " Loading…"
            ] }) : configs.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground py-4", children: [
              "You haven't saved any layouts yet.",
              " ",
              /* @__PURE__ */ jsx(Link, { to: "/customize", className: "text-primary hover:underline", children: "Open the customiser" }),
              " ",
              "to build and save your first one."
            ] }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border", children: configs.map((config) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between py-3 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxs("p", { className: "font-medium flex items-center gap-2", children: [
                  config.name,
                  config.is_active && /* @__PURE__ */ jsx("span", { className: "text-xs text-primary", children: "· Active" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
                  "Pinky: ",
                  commandLabelFor(config.layout, "pinky-mid"),
                  " ·",
                  " ",
                  commandLabelFor(config.layout, "pinky-bottom"),
                  " · Updated",
                  " ",
                  new Date(config.updated_at).toLocaleDateString()
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: `/customize?id=${config.id}`,
                    "aria-label": `Edit ${config.name}`,
                    className: "p-2 text-muted-foreground hover:text-foreground transition-colors",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDeleteConfig(config.id),
                    "aria-label": `Delete ${config.name}`,
                    className: "p-2 text-muted-foreground hover:text-destructive transition-colors",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] })
            ] }, config.id)) })
          ] }),
          admin && /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/admin",
              className: "lg:col-span-2 group flex items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 hover:bg-secondary/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(Users, { className: "w-5 h-5 text-primary" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Waitlist admin" }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "View and export everyone who has signed up." })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  AccountPage as default
};
