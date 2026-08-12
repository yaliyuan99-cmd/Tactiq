/**
 * Ring — the dashboard's centrepiece: an inspectable digital twin of the
 * Tactiq hardware concept.
 *
 * Hardware mode: the 2D exploded engineering drawing with its assembly
 * slider and per-component hotspots. The numbered component list beside it
 * is not a caption — it is the same model in text form, fully keyboard and
 * screen-reader operable, and selection is shared both ways.
 *
 * Sensors mode: the localisation demo (drag the passive magnet, watch the
 * three channels). Commands mode: the eight contact points as data.
 *
 * Everything here is plain SVG — no WebGL, so it renders everywhere and
 * costs nothing to load.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Grip, Bluetooth } from 'lucide-react';
import EvidenceStatus from '../home/EvidenceStatus';
import SensorDemo from '../components/SensorDemo';
import RingExploded2D from '../components/RingExploded2D';
import { SimHand, HandLegend } from '../components/SimHand';
import { RING_PARTS, type PartId } from '../components/ringParts';
import { useDeviceSnapshot } from '../../services/device/useDevice';
import { deviceManager } from '../../services/device/manager';
import { loadA11yPrefs } from '../../lib/a11yPrefs';
import { gesturePoints, kindOf, KIND_LABEL, PRODUCT, type ContactId } from '../../lib/gestures';
import { cn } from '../../lib/utils';

type Mode = 'hardware' | 'sensors' | 'commands';

function DeviceHud() {
  const device = useDeviceSnapshot();
  const prefs = useMemo(() => loadA11yPrefs(), []);
  const connected = device.state === 'connected';

  const segments: ReactNode[] = [];
  segments.push(
    <span key="state" className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cn('w-2 h-2 rounded-full', connected ? 'bg-status-confirmed' : 'border-[1.5px] border-muted-foreground')}
      />
      {connected ? 'Connected — simulated ring' : device.paired.length > 0 ? 'Ring offline' : 'No ring paired'}
    </span>,
  );
  if (connected && device.battery !== null) segments.push(<span key="bat">Battery {device.battery}%</span>);
  segments.push(<span key="cmd">{PRODUCT.commands} commands</span>);
  if (connected) segments.push(<span key="tr">{device.active?.transport === 'web-bluetooth' ? 'BLE' : 'BLE (simulated)'}</span>);
  segments.push(<span key="hand">{prefs.handPreference === 'left' ? 'Left' : 'Right'} hand</span>);

  return (
    <div className="flex flex-wrap items-center border border-border rounded-lg divide-x divide-border text-sm overflow-x-auto">
      {segments.map((s, i) => (
        <span key={i} className="px-4 py-2.5 whitespace-nowrap text-muted-foreground first:text-foreground">
          {s}
        </span>
      ))}
      {!connected && device.paired.length > 0 && (
        <button
          onClick={() => void deviceManager.connectTo(device.paired[0].id)}
          className="px-4 py-2.5 text-primary-strong font-medium hover:bg-secondary transition-colors whitespace-nowrap"
        >
          Reconnect
        </button>
      )}
      {!connected && device.paired.length === 0 && (
        <Link to="/dashboard/device" className="px-4 py-2.5 text-primary-strong font-medium hover:bg-secondary transition-colors whitespace-nowrap inline-flex items-center gap-1.5">
          <Bluetooth className="w-3.5 h-3.5" aria-hidden />
          Pair
        </Link>
      )}
    </div>
  );
}

export default function RingPage() {
  const [mode, setMode] = useState<Mode>('hardware');
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<PartId | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactId | null>(null);
  const prefs = useMemo(() => loadA11yPrefs(), []);

  useEffect(() => {
    document.title = 'Ring · Tactiq';
  }, []);

  const contactDetail = selectedContact
    ? gesturePoints.find((p) => p.id === selectedContact) ?? null
    : null;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-3xl">Ring</h1>
        <EvidenceStatus kind="simulation">Stylised engineering view</EvidenceStatus>
      </div>
      <p className="text-muted-foreground mb-6 max-w-[62ch]">
        Inspect the hardware concept piece by piece. No wearable ring exists yet — this is
        the design as specified, drawn to be handled.
      </p>

      <div className="mb-8">
        <DeviceHud />
      </div>

      {/* Mode toggle. `flex-wrap`, not a fixed row: at the site's "larger"
          text setting (20px root) the three tabs measure 386px, which is wider
          than a 375px phone, and the page picked up a horizontal scroll — the
          setting exists for low-vision users, so it must not break the layout
          for them. Wrapping keeps every tab visible and tappable; a horizontal
          scroller would hide one behind a gesture nobody is told about. */}
      <div role="group" aria-label="View mode" className="inline-flex flex-wrap rounded-md border border-border p-0.5 bg-secondary/50 mb-8">
        {(
          [
            { id: 'hardware', label: 'Hardware' },
            { id: 'sensors', label: 'Sensors' },
            { id: 'commands', label: 'Commands' },
          ] as { id: Mode; label: string }[]
        ).map((m) => (
          <button
            key={m.id}
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'h-11 px-5 rounded-[5px] text-sm font-medium transition-colors active:scale-[0.98]',
              mode === m.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------ hardware -- */}
      {mode === 'hardware' && (
        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-start">
          <div>
            <RingExploded2D
              explode={explode / 100}
              selected={selected}
              onSelect={setSelected}
              className="w-full max-h-[440px] h-auto select-none text-foreground"
            />
            <p className="font-mono-label text-muted-foreground text-center mt-2" aria-hidden>
              Click a part to inspect it
            </p>

            {/* Assembly slider — the physical control of the page. */}
            <div className="mt-6">
              <div className="flex justify-between font-mono-label text-muted-foreground mb-1.5" aria-hidden>
                <span>ASSEMBLED</span>
                <span>EXPLODED</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={explode}
                onChange={(e) => setExplode(Number(e.target.value))}
                aria-label="Ring assembly. 0 is fully assembled, 100 is the full exploded engineering view."
                aria-valuetext={`${explode} percent exploded`}
                className="w-full accent-[var(--primary)] h-11 cursor-ew-resize"
              />
            </div>
          </div>

          {/* Component list — the model in text form; selection is shared. */}
          <div>
            <h2 className="text-xl mb-4">Inside the ring</h2>
            <ol className="border-y border-border divide-y divide-border">
              {RING_PARTS.map((part) => {
                const isSelected = selected === part.id;
                return (
                  <li key={part.id}>
                    <button
                      aria-expanded={isSelected}
                      onClick={() => setSelected(isSelected ? null : part.id)}
                      className={cn(
                        'w-full flex items-baseline gap-3.5 px-1.5 py-3 text-left transition-colors hover:bg-secondary/60',
                        isSelected && 'bg-primary/5',
                      )}
                    >
                      <span className="font-mono-label text-muted-foreground shrink-0">{part.number}</span>
                      <span className={cn('text-[0.95rem]', isSelected && 'font-medium text-primary-strong')}>
                        {part.label}
                      </span>
                    </button>
                    {isSelected && (
                      <div className="px-1.5 pb-4 pl-11">
                        <p className="text-[0.95rem] text-muted-foreground max-w-[46ch]">{part.fact}</p>
                        <ul className="flex flex-wrap gap-1.5 mt-2.5">
                          {part.pills.map((pill) => (
                            <li key={pill} className="font-mono-label text-muted-foreground border border-border rounded px-1.5 py-0.5">
                              {pill}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="text-sm text-muted-foreground mt-4 max-w-[48ch]">
              Slide towards <span className="font-mono-label">EXPLODED</span> and the shell
              lifts away first, then the sensing ring, then the electronics — the passive
              thumb magnet appears last, because it never lives inside the ring at all.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- sensors -- */}
      {mode === 'sensors' && (
        <div>
          <h2 className="text-xl mb-1">How the ring knows where you tapped</h2>
          <p className="text-muted-foreground mb-6 max-w-[58ch]">
            Wear a passive magnet on the thumb; three magnetometers in the band read its
            field. Drag the magnet — or focus it and use arrow keys — and watch the three
            channels change.
          </p>
          <SensorDemo mirrored={prefs.handPreference === 'left'} />
        </div>
      )}

      {/* ------------------------------------------------------ commands -- */}
      {mode === 'commands' && (
        <div className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-8 items-start">
          <SimHand
            mode="select"
            selectedId={selectedContact}
            onSelect={(id) => setSelectedContact(id)}
            mirrored={prefs.handPreference === 'left'}
            label="Command map: select a contact point to see its command."
          />
          <div>
            {contactDetail ? (
              <>
                <p className="font-mono-label text-muted-foreground">
                  {contactDetail.finger} · {contactDetail.position.toLowerCase()} ·{' '}
                  {KIND_LABEL[kindOf(contactDetail)]}
                </p>
                <h2 className="text-2xl mt-1 mb-3">{contactDetail.description.split('—')[0].trim()}</h2>
                <p className="text-muted-foreground max-w-[48ch] mb-5">{contactDetail.description}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl mb-2">{PRODUCT.commands} commands, one hand</h2>
                <p className="text-muted-foreground max-w-[48ch] mb-5">{PRODUCT.canonical}</p>
              </>
            )}
            <Link
              to="/dashboard/simulator"
              className="inline-flex items-center gap-2 px-5 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <Grip className="w-4 h-4" aria-hidden />
              Try it in the simulator
            </Link>
            <HandLegend className="mt-8" />
          </div>
        </div>
      )}
    </div>
  );
}
