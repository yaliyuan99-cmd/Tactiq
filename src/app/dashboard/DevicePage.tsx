/**
 * Device page — scrupulously honest. There is no production ring, so the
 * default state says exactly that. Pairing uses real Web Bluetooth when the
 * browser supports it (the bench firmware speaks the Nordic UART service);
 * every failure mode gets its own specific message, and success is never
 * faked. A separate, clearly-labelled interface preview shows what a
 * connected state will look like one day.
 */
import { useEffect, useState } from 'react';
import { Bluetooth, BluetoothOff, BluetoothSearching, CircleAlert, Eye, EyeOff, Vibrate } from 'lucide-react';

const NUS_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

type PairState =
  | 'idle'
  | 'unsupported'
  | 'searching'
  | 'pairing'
  | 'connected'
  | 'permission-denied'
  | 'not-found'
  | 'failed';

// Web Bluetooth is not in the standard TS lib; type the little we use.
interface BtDevice {
  name?: string;
  gatt?: { connect: () => Promise<unknown> };
  addEventListener?: (ev: string, cb: () => void) => void;
}

export default function DevicePage() {
  const [state, setState] = useState<PairState>('idle');
  const [deviceName, setDeviceName] = useState<string>('');
  const [preview, setPreview] = useState(false);
  const [hapticPlaying, setHapticPlaying] = useState(false);

  useEffect(() => {
    document.title = 'Device · Tactiq';
    const nav = navigator as Navigator & { bluetooth?: unknown };
    if (!nav.bluetooth) setState('unsupported');
  }, []);

  const pair = async () => {
    const nav = navigator as Navigator & {
      bluetooth?: { requestDevice: (opts: unknown) => Promise<BtDevice> };
    };
    if (!nav.bluetooth) {
      setState('unsupported');
      return;
    }
    setState('searching');
    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [NUS_SERVICE] }],
        optionalServices: [NUS_SERVICE],
      });
      setDeviceName(device.name || 'Tactiq bench prototype');
      setState('pairing');
      await device.gatt?.connect();
      setState('connected');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/cancel|user gesture|denied/i.test(msg)) setState('permission-denied');
      else if (/no devices|not found|chooser/i.test(msg)) setState('not-found');
      else setState('failed');
    }
  };

  const previewHaptic = () => {
    setHapticPlaying(true);
    if ('vibrate' in navigator) navigator.vibrate?.([60, 80, 60]);
    window.setTimeout(() => setHapticPlaying(false), 900);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl mb-1">Device</h1>
      <p className="text-muted-foreground mb-8 max-w-[60ch]">
        Tactiq rings exist only as a bench prototype right now. If you have one of the bench
        units (unlikely, but we like optimism), you can pair it below in a browser that
        supports Web Bluetooth. Everyone else can look at the labelled interface preview.
      </p>

      {/* Pairing */}
      <section className="border border-border rounded-lg p-5 mb-6" aria-live="polite">
        {state === 'unsupported' && (
          <div className="flex items-start gap-4">
            <BluetoothOff className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg mb-1">Bluetooth unavailable in this browser</h2>
              <p className="text-[0.95rem] text-muted-foreground">
                Web Bluetooth works in Chrome and Edge on desktop and Android. Safari does not
                support it. Nothing is wrong with your account — this is a browser limitation.
              </p>
            </div>
          </div>
        )}

        {state === 'idle' && (
          <div className="flex items-start gap-4">
            <Bluetooth className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg mb-1">No ring paired</h2>
              <p className="text-[0.95rem] text-muted-foreground mb-4">
                Pairing searches for a bench prototype advertising the Nordic UART service.
                Your browser will show a chooser; nothing connects without your confirmation.
              </p>
              <button
                onClick={pair}
                className="inline-flex items-center gap-2 px-4 h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                <Bluetooth className="w-4 h-4" aria-hidden />
                Pair a ring
              </button>
            </div>
          </div>
        )}

        {(state === 'searching' || state === 'pairing') && (
          <div className="flex items-start gap-4">
            <BluetoothSearching className="w-5 h-5 text-primary-strong mt-0.5 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg mb-1">{state === 'searching' ? 'Searching…' : 'Pairing…'}</h2>
              <p className="text-[0.95rem] text-muted-foreground">
                {state === 'searching'
                  ? 'Choose your device in the browser prompt. Make sure the bench unit is powered and nearby.'
                  : `Connecting to ${deviceName}…`}
              </p>
            </div>
          </div>
        )}

        {state === 'connected' && (
          <div className="flex items-start gap-4">
            <Bluetooth className="w-5 h-5 text-status-confirmed mt-0.5 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg mb-1">Connected: {deviceName}</h2>
              <p className="text-[0.95rem] text-muted-foreground mb-4">
                This is a live Bluetooth connection to a bench unit. Battery, calibration and
                firmware reporting are not implemented in the bench firmware yet, so nothing
                is shown rather than shown falsely.
              </p>
              <button
                onClick={() => {
                  setState('idle');
                  setDeviceName('');
                }}
                className="px-4 h-11 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {(state === 'permission-denied' || state === 'not-found' || state === 'failed') && (
          <div className="flex items-start gap-4">
            <CircleAlert className="w-5 h-5 text-destructive mt-0.5 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg mb-1">
                {state === 'permission-denied' && 'Pairing cancelled'}
                {state === 'not-found' && 'No ring found'}
                {state === 'failed' && 'Pairing failed'}
              </h2>
              <p className="text-[0.95rem] text-muted-foreground mb-4">
                {state === 'permission-denied' &&
                  'The browser chooser was closed before a device was selected. Nothing was connected.'}
                {state === 'not-found' &&
                  'No device advertising the Tactiq bench service was in range. Check the unit is powered, then try again.'}
                {state === 'failed' &&
                  'The connection was interrupted before pairing completed. The ring may be out of range or out of battery. Try again.'}
              </p>
              <button
                onClick={pair}
                className="px-4 h-11 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Interface preview — honest simulation */}
      <section className="border border-border rounded-lg p-5">
        {/* `flex-wrap`: the button is `shrink-0` (181px at the "larger" text
            setting) and the heading beside it does not shrink either, so on a
            320px screen the pair overflowed the page. Wrapping drops the button
            below the heading instead. */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-1">
          <h2 className="text-lg">Interface preview</h2>
          <button
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
            className="inline-flex items-center gap-2 px-3 h-11 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors shrink-0"
          >
            {preview ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
            {preview ? 'Hide preview' : 'Show preview'}
          </button>
        </div>
        <p className="text-[0.95rem] text-muted-foreground">
          What the device panel will show once real hardware reports real values.
        </p>

        {preview && (
          <div className="mt-5">
            <p className="font-mono-label text-status-target mb-4">
              Interface preview — every value below is an example, not a reading.
            </p>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[0.95rem] mb-5">
              {[
                ['Connection', 'Connected'],
                ['Battery', '82% (example)'],
                ['Last sync', '2 minutes ago (example)'],
                ['Calibration', 'Calibrated for right hand (example)'],
                ['Firmware', 'bench-0.4 (example)'],
                ['Device ID', 'TQ-BENCH-001 (example)'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <button
              onClick={previewHaptic}
              className="inline-flex items-center gap-2 px-4 h-11 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
            >
              <Vibrate className={`w-4 h-4 ${hapticPlaying ? 'text-primary-strong' : ''}`} aria-hidden />
              {hapticPlaying ? 'Playing pattern…' : 'Preview a haptic pattern'}
            </button>
            <p className="text-sm text-muted-foreground mt-2">
              On phones this plays the real vibration pattern; on computers it is visual only.
            </p>
          </div>
        )}
      </section>

      <p className="text-sm text-muted-foreground mt-6 max-w-[60ch]">
        Privacy: pairing runs entirely in your browser. Tap detection happens on the ring;
        no audio, no camera, and no location are involved at any point.
      </p>
    </div>
  );
}
