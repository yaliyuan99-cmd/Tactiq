import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  BatteryCharging,
  Battery,
  Bluetooth,
  HeartPulse,
  MapPin,
  HardDrive,
  Activity,
  Footprints,
  Cpu,
  RefreshCw,
  CircleCheck,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from 'lucide-react';
import {
  getDeviceTelemetry,
  getDeviceHistory,
  type DeviceTelemetry,
  type DeviceHistory,
  type MetricHistory,
} from '../../lib/api';

function timeAgo(iso: string): string {
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  return `${mins}m ago`;
}

function batteryColor(level: number): string {
  if (level > 50) return 'text-chart-2';
  if (level > 20) return 'text-yellow-500';
  return 'text-destructive';
}

interface Props {
  seedKey: string;
}

// Which history metric a card maps to, plus how to render its detail chart.
type MetricKey = keyof DeviceHistory;

interface MetricMeta {
  key: MetricKey;
  title: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind colour token used for the icon + chart stroke/fill. */
  tone: string;
  chart: 'area' | 'bar';
  /** How to render a single value (e.g. "76 bpm"). */
  format: (v: number) => string;
  blurb: string;
}

const METRICS: Record<MetricKey, MetricMeta> = {
  battery: {
    key: 'battery',
    title: 'Battery',
    icon: BatteryCharging,
    tone: 'text-chart-2',
    chart: 'area',
    format: (v) => `${v}%`,
    blurb: 'Charge level over the last 24 hours.',
  },
  heartRate: {
    key: 'heartRate',
    title: 'Heart rate',
    icon: HeartPulse,
    tone: 'text-destructive',
    chart: 'area',
    format: (v) => `${v} bpm`,
    blurb: 'Hourly average heart rate — lower overnight, higher when active.',
  },
  signal: {
    key: 'signal',
    title: 'Connection',
    icon: Bluetooth,
    tone: 'text-primary',
    chart: 'area',
    format: (v) => `${v} dBm`,
    blurb: 'Bluetooth signal strength (closer to 0 is stronger).',
  },
  steps: {
    key: 'steps',
    title: 'Steps',
    icon: Footprints,
    tone: 'text-chart-2',
    chart: 'bar',
    format: (v) => `${v.toLocaleString()}`,
    blurb: 'Steps recorded each hour across the day.',
  },
  activeMinutes: {
    key: 'activeMinutes',
    title: 'Active minutes',
    icon: Activity,
    tone: 'text-chart-2',
    chart: 'bar',
    format: (v) => `${v} min`,
    blurb: 'Active minutes logged each hour.',
  },
};

export default function DeviceDashboard({ seedKey }: Props) {
  const [data, setData] = useState<DeviceTelemetry>(() => getDeviceTelemetry(seedKey));
  // Keep a short rolling history of heart-rate samples for the sparkline.
  const [hrHistory, setHrHistory] = useState<number[]>(() =>
    Array.from({ length: 24 }, () => getDeviceTelemetry(seedKey).wellness.heartRate),
  );
  const [openMetric, setOpenMetric] = useState<MetricKey | null>(null);
  const [syncing, setSyncing] = useState(false);
  const seedRef = useRef(seedKey);
  seedRef.current = seedKey;

  // Pull a fresh snapshot on demand (the "Sync now" button).
  const syncNow = () => {
    setSyncing(true);
    const next = getDeviceTelemetry(seedRef.current);
    setData(next);
    setHrHistory((prev) => [...prev.slice(-23), next.wellness.heartRate]);
    window.setTimeout(() => setSyncing(false), 700);
  };

  // 24-hour history. Deterministic per user, so it only needs to recompute when
  // the seed changes (opening a card reads from this same snapshot).
  const history = useMemo<DeviceHistory>(() => getDeviceHistory(seedKey), [seedKey]);

  useEffect(() => {
    const tick = () => {
      const next = getDeviceTelemetry(seedRef.current);
      setData(next);
      setHrHistory((prev) => [...prev.slice(-23), next.wellness.heartRate]);
    };
    const id = window.setInterval(tick, 2500);
    return () => window.clearInterval(id);
  }, []);

  // Close the detail panel on Escape.
  useEffect(() => {
    if (!openMetric) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMetric(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openMetric]);

  const BatteryIcon = data.battery.charging ? BatteryCharging : Battery;

  // Sparkline geometry
  const w = 200;
  const h = 44;
  const min = Math.min(...hrHistory) - 3;
  const max = Math.max(...hrHistory) + 3;
  const points = hrHistory
    .map((v, i) => {
      const x = (i / (hrHistory.length - 1)) * w;
      const y = h - ((v - min) / Math.max(1, max - min)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const storagePct = Math.round((data.storage.usedMb / data.storage.totalMb) * 100);

  // Connection strength → number of filled bars.
  const signalBars =
    data.signal.quality === 'excellent'
      ? 4
      : data.signal.quality === 'good'
        ? 3
        : data.signal.quality === 'fair'
          ? 2
          : 1;

  // Daily activity goal + derived distance.
  const STEP_GOAL = 10000;
  const goalPct = Math.min(100, Math.round((data.wellness.steps / STEP_GOAL) * 100));
  const distanceKm = (data.wellness.steps * 0.000762).toFixed(1);
  const ringR = 40;
  const ringC = 2 * Math.PI * ringR;

  return (
    <section className="bg-card border border-border rounded-2xl p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Device status</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={syncNow}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-chart-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-chart-2" />
            </span>
            {data.connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{data.deviceName}</span>
        <span aria-hidden>·</span>
        <span>{data.serial}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Synced {timeAgo(data.lastSync)}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Battery */}
        <MetricCard onClick={() => setOpenMetric('battery')}>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <BatteryIcon className={`w-4 h-4 ${batteryColor(data.battery.level)}`} />
            Battery
          </div>
          <div className="text-2xl font-semibold">{data.battery.level}%</div>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${data.battery.level > 20 ? 'bg-chart-2' : 'bg-destructive'}`}
              animate={{ width: `${data.battery.level}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.battery.charging ? 'Charging' : `~${data.battery.estimatedDaysLeft} days left`} ·
            Health {data.battery.health}%
          </p>
        </MetricCard>

        {/* Heart rate */}
        <MetricCard onClick={() => setOpenMetric('heartRate')}>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <HeartPulse className="w-4 h-4 text-destructive" />
            Heart rate
          </div>
          <div className="flex items-end gap-1">
            <motion.span
              key={data.wellness.heartRate}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className="text-2xl font-semibold"
            >
              {data.wellness.heartRate}
            </motion.span>
            <span className="text-xs text-muted-foreground mb-1">bpm</span>
          </div>
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="mt-1 w-full h-9"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-destructive"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </MetricCard>

        {/* Signal */}
        <MetricCard onClick={() => setOpenMetric('signal')}>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <Bluetooth className="w-4 h-4 text-primary" />
            Connection
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold capitalize">{data.signal.quality}</span>
            <span className="flex items-end gap-0.5 h-5" aria-hidden>
              {[1, 2, 3, 4].map((b) => (
                <span
                  key={b}
                  className={`w-1.5 rounded-sm transition-colors ${b <= signalBars ? 'bg-primary' : 'bg-secondary'}`}
                  style={{ height: `${b * 25}%` }}
                />
              ))}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.signal.rssiDbm} dBm · Bluetooth 5.3 LE
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Firmware v{data.firmware}</p>
        </MetricCard>

        {/* Storage (no history — static) */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <HardDrive className="w-4 h-4 text-chart-1" />
            Layout storage
          </div>
          <div className="text-2xl font-semibold">{storagePct}%</div>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-chart-1" style={{ width: `${storagePct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.storage.usedMb} / {data.storage.totalMb} MB used
          </p>
        </div>
      </div>

      {/* Location + activity row */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {/* Stylised location map (no external tiles — privacy-friendly) */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Device location
          </div>
          <div className="relative h-40 rounded-lg overflow-hidden border border-border bg-gradient-to-br from-primary/10 via-background to-chart-2/10">
            {/* faux map grid */}
            <svg className="absolute inset-0 w-full h-full text-foreground/10" aria-hidden="true">
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {/* pulsing marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-primary border-2 border-background" />
              </span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
              <span className="px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm font-medium">
                {data.location.label}
              </span>
              <span className="px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-muted-foreground">
                ±{data.location.accuracyM} m
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
            {data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}
          </p>
        </div>

        {/* Activity */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
            <Activity className="w-4 h-4 text-chart-2" />
            Today’s activity
          </div>
          <div className="flex items-center gap-4">
            {/* Daily-goal ring — click to open step history */}
            <button
              type="button"
              onClick={() => setOpenMetric('steps')}
              aria-label="Steps — past 24 hours"
              className="group relative w-24 h-24 flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={ringR}
                  fill="none"
                  strokeWidth="9"
                  className="text-secondary"
                  stroke="currentColor"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r={ringR}
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className="text-chart-2"
                  stroke="currentColor"
                  strokeDasharray={ringC}
                  initial={false}
                  animate={{ strokeDashoffset: ringC * (1 - goalPct / 100) }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold tabular-nums leading-none">
                  {data.wellness.steps.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors">
                  {goalPct}% of goal
                </span>
              </span>
            </button>

            <div className="flex-1 space-y-2">
              <button
                type="button"
                onClick={() => setOpenMetric('activeMinutes')}
                className="w-full text-left rounded-lg bg-secondary/40 p-3 transition hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                  <Activity className="w-3.5 h-3.5" /> Active
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {data.wellness.activeMinutes} min
                </div>
              </button>
              <div className="rounded-lg bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                  <Footprints className="w-3.5 h-3.5" /> Distance
                </div>
                <div className="text-lg font-semibold tabular-nums">{distanceKm} km</div>
              </div>
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-chart-2">
            <CircleCheck className="w-3.5 h-3.5" /> Sensors healthy · goal {STEP_GOAL.toLocaleString()} steps
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Tap any metric to see the past 24 hours. Live readings are simulated for this preview —
        once your rings ship, the companion app streams real battery, location, and wellness data
        here.
      </p>

      {openMetric && (
        <HistoryModal
          meta={METRICS[openMetric]}
          history={history[openMetric]}
          onClose={() => setOpenMetric(null)}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// A clickable metric card wrapper — adds hover/focus affordance + "24h" hint.
// ---------------------------------------------------------------------------
function MetricCard({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative text-left rounded-xl border border-border bg-background/50 p-4 transition hover:border-primary/40 hover:bg-background hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition group-hover:opacity-100">
        24h <ChevronRight className="w-3 h-3" />
      </span>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Detail modal: 24-hour chart + min/avg/max summary for a metric.
// ---------------------------------------------------------------------------
function HistoryModal({
  meta,
  history,
  onClose,
}: {
  meta: MetricMeta;
  history: MetricHistory;
  onClose: () => void;
}) {
  const Icon = meta.icon;
  const first = history.points[0]?.value ?? 0;
  const last = history.points[history.points.length - 1]?.value ?? 0;
  const delta = last - first;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={`${meta.title} — past 24 hours`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-5 h-5 ${meta.tone}`} />
          <h3 className="text-lg font-semibold">{meta.title}</h3>
          <span className="ml-1 text-xs font-medium text-muted-foreground">· past 24 h</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{meta.blurb}</p>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Stat label="Min" value={meta.format(history.min)} />
          <Stat label="Average" value={meta.format(history.avg)} />
          <Stat label="Max" value={meta.format(history.max)} />
        </div>

        <HistoryChart meta={meta} history={history} />

        {/* Footer: net change across the day */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendIcon className={`w-3.5 h-3.5 ${meta.tone}`} />
          <span>
            {delta === 0
              ? 'No net change over 24 h'
              : `${delta > 0 ? '+' : ''}${meta.format(delta).replace(/^\+/, '')} vs. 24 h ago`}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// SVG chart — area (line) for continuous metrics, bars for hourly counts.
function HistoryChart({ meta, history }: { meta: MetricMeta; history: MetricHistory }) {
  const W = 480;
  const H = 150;
  const padX = 6;
  const padY = 14;
  const pts = history.points;
  const n = pts.length;

  // y-range with a little headroom; for signal (negative dBm) keep natural order.
  const lo = Math.min(...pts.map((p) => p.value));
  const hi = Math.max(...pts.map((p) => p.value));
  const span = Math.max(1, hi - lo);
  const yOf = (v: number) => padY + (H - padY * 2) * (1 - (v - lo) / span);
  const xOf = (i: number) => padX + (i / (n - 1)) * (W - padX * 2);

  const toneStroke = meta.tone; // text-* class drives currentColor via the group

  return (
    <div className={toneStroke}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]" preserveAspectRatio="none">
        {/* gridlines */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={W - padX}
            y1={padY + (H - padY * 2) * g}
            y2={padY + (H - padY * 2) * g}
            className="text-border"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity={0.5}
          />
        ))}

        {meta.chart === 'area' ? (
          <>
            <motion.polyline
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              points={pts.map((p, i) => `${xOf(i).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* last-point dot */}
            <circle cx={xOf(n - 1)} cy={yOf(pts[n - 1].value)} r="3.5" fill="currentColor" />
          </>
        ) : (
          pts.map((p, i) => {
            const bw = (W - padX * 2) / n - 2;
            const x = xOf(i) - bw / 2;
            const y = yOf(p.value);
            const barH = Math.max(0, H - padY - y);
            return (
              <motion.rect
                key={i}
                initial={{ height: 0, y: H - padY }}
                animate={{ height: barH, y }}
                transition={{ duration: 0.4, delay: i * 0.01 }}
                x={x}
                width={Math.max(1, bw)}
                rx={2}
                fill="currentColor"
                opacity={0.85}
              />
            );
          })
        )}
      </svg>
      {/* hour axis: show a few labels */}
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
        {[0, 6, 12, 18, n - 1].map((i) => (
          <span key={i}>{pts[i]?.label}</span>
        ))}
      </div>
    </div>
  );
}
