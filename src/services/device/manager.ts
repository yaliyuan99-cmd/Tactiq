/**
 * Device manager — the one store the UI talks to about rings. It owns the
 * connection state machine, the paired-device list (persisted per user), and
 * a unified event stream that pages subscribe to. Transports (mock today,
 * Web Bluetooth for the bench rig) plug in underneath; nothing above this
 * file knows which one is active.
 */
import type { ContactId } from '../../lib/gestures';
import { sleep, uid } from '../../lib/utils';
import { MockTactiqDevice, makeMockSerial } from './mockDevice';
import {
  isWebBluetoothAvailable,
  requestRealRing,
} from './webBluetoothDevice';
import type {
  ConnectionState,
  DeviceEvent,
  DeviceGestureEvent,
  TactiqDevice,
} from './types';

export interface PairedDevice {
  id: string;
  name: string;
  serial: string;
  firmware: string;
  transport: 'mock' | 'web-bluetooth';
  batteryLevel: number;
  addedAt: string;
  lastConnectedAt: string | null;
}

export interface DeviceSnapshot {
  state: ConnectionState;
  /** The device the state refers to (connected / pairing / failed…). */
  active: PairedDevice | null;
  /** Scan result waiting for the user's pair decision. */
  discovered: { name: string; serial: string } | null;
  battery: number | null;
  signal: number | null;
  gateArmed: boolean;
  paired: PairedDevice[];
  error: string | null;
  webBluetoothAvailable: boolean;
}

type SnapshotListener = () => void;
type EventListener = (event: DeviceEvent) => void;

const EMPTY: DeviceSnapshot = {
  state: 'idle',
  active: null,
  discovered: null,
  battery: null,
  signal: null,
  gateArmed: false,
  paired: [],
  error: null,
  webBluetoothAvailable: false,
};

class DeviceManager {
  private snapshot: DeviceSnapshot = EMPTY;
  private snapshotListeners = new Set<SnapshotListener>();
  private eventListeners = new Set<EventListener>();
  private namespace: string | null = null;
  private transport: TactiqDevice | null = null;
  private transportUnsub: (() => void) | null = null;
  private scanTimer: ReturnType<typeof setTimeout> | null = null;
  private lowBatteryFlagged = false;

  // ----- store plumbing ----------------------------------------------------

  getSnapshot = (): DeviceSnapshot => this.snapshot;

  subscribe = (listener: SnapshotListener): (() => void) => {
    this.snapshotListeners.add(listener);
    return () => this.snapshotListeners.delete(listener);
  };

  /** Gesture/battery/connection events, for live views. */
  subscribeEvents = (listener: EventListener): (() => void) => {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  };

  private set(patch: Partial<DeviceSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.snapshotListeners.forEach((l) => l());
  }

  private emitEvent(event: DeviceEvent) {
    this.eventListeners.forEach((l) => l(event));
  }

  // ----- lifecycle ---------------------------------------------------------

  /** Point the manager at a user's paired-device list (null on sign-out). */
  setNamespace(userId: string | null) {
    if (this.namespace === userId) return;
    this.teardownTransport();
    this.namespace = userId;
    this.lowBatteryFlagged = false;
    const paired = userId ? this.loadPaired() : [];
    this.snapshot = {
      ...EMPTY,
      paired,
      webBluetoothAvailable: isWebBluetoothAvailable(),
      state: paired.length > 0 ? 'disconnected' : 'idle',
    };
    this.snapshotListeners.forEach((l) => l());
  }

  private storageKey() {
    return `tactiq:${this.namespace}:paired`;
  }

  private loadPaired(): PairedDevice[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey()) ?? '[]');
    } catch {
      return [];
    }
  }

  private persistPaired() {
    if (!this.namespace) return;
    localStorage.setItem(this.storageKey(), JSON.stringify(this.snapshot.paired));
  }

  // ----- scanning & pairing (simulated transport) --------------------------

  /**
   * Simulated Bluetooth scan. The mock ring answers after a realistic delay;
   * `options.outcome: "nothing"` demonstrates the no-device-found state.
   */
  startScan(options: { outcome?: 'found' | 'nothing' } = {}) {
    if (this.snapshot.state === 'scanning') return;
    this.set({ state: 'scanning', discovered: null, error: null });
    const delay = 2200 + Math.random() * 1400;
    this.scanTimer = setTimeout(() => {
      if (this.snapshot.state !== 'scanning') return;
      if (options.outcome === 'nothing') {
        this.set({
          state: this.snapshot.paired.length ? 'disconnected' : 'idle',
          error:
            'No Tactiq found nearby. Check the ring is charged and within a metre, then search again.',
        });
      } else {
        this.set({
          state: 'discovered',
          discovered: { name: 'Tactiq Ring', serial: makeMockSerial() },
        });
      }
    }, delay);
  }

  cancelScan() {
    if (this.scanTimer) clearTimeout(this.scanTimer);
    this.set({
      state: this.snapshot.paired.length ? 'disconnected' : 'idle',
      discovered: null,
    });
  }

  /**
   * Pair the discovered (simulated) ring. `options.fail` walks the honest
   * failure path so the pairing-failed state can be demonstrated.
   */
  async pairDiscovered(options: { fail?: boolean } = {}): Promise<boolean> {
    const found = this.snapshot.discovered;
    if (!found) return false;
    this.set({ state: 'pairing', error: null });
    await sleep(1600 + Math.random() * 900);
    if (options.fail) {
      this.set({
        state: 'failed',
        discovered: null,
        error:
          'Pairing failed — the ring stopped responding before the handshake finished. Move it closer and try again.',
      });
      this.emitEvent({ type: 'connection', state: 'failed', detail: 'Pairing failed' });
      return false;
    }
    const record: PairedDevice = {
      id: uid('ring'),
      name: found.name,
      serial: found.serial,
      firmware: '0.4.2-bench',
      transport: 'mock',
      batteryLevel: 55 + Math.round(Math.random() * 40),
      addedAt: new Date().toISOString(),
      lastConnectedAt: null,
    };
    this.set({ paired: [...this.snapshot.paired, record], discovered: null });
    this.persistPaired();
    await this.connectTo(record.id);
    return true;
  }

  /** Ask the browser for a real ring over Web Bluetooth (Chrome/Edge only). */
  async pairRealRing(): Promise<boolean> {
    if (!isWebBluetoothAvailable()) return false;
    try {
      this.set({ state: 'scanning', error: null });
      const device = await requestRealRing(); // browser chooser is the scan UI
      this.set({ state: 'pairing' });
      this.attachTransport(device);
      await device.connect();
      const info = await device.getDeviceInfo();
      const record: PairedDevice = {
        id: info.id,
        name: info.name,
        serial: info.serial,
        firmware: info.firmware,
        transport: 'web-bluetooth',
        batteryLevel: await device.getBatteryLevel(),
        addedAt: new Date().toISOString(),
        lastConnectedAt: new Date().toISOString(),
      };
      this.set({
        state: 'connected',
        active: record,
        paired: [...this.snapshot.paired.filter((p) => p.id !== record.id), record],
        battery: record.batteryLevel,
        error: null,
      });
      this.persistPaired();
      return true;
    } catch (err) {
      const cancelled = err instanceof DOMException && err.name === 'NotFoundError';
      this.teardownTransport();
      this.set({
        state: cancelled
          ? this.snapshot.paired.length
            ? 'disconnected'
            : 'idle'
          : 'failed',
        error: cancelled
          ? null
          : 'Could not reach the ring over Bluetooth. Check it is advertising and try again.',
      });
      return false;
    }
  }

  // ----- connect / disconnect ----------------------------------------------

  async connectTo(deviceId: string): Promise<boolean> {
    const record = this.snapshot.paired.find((p) => p.id === deviceId);
    if (!record) return false;
    if (record.transport === 'web-bluetooth') {
      // A BLE peripheral must be re-chosen through the browser after reload.
      return this.pairRealRing();
    }
    this.teardownTransport();
    this.set({
      state: record.lastConnectedAt ? 'reconnecting' : 'pairing',
      active: record,
      error: null,
    });
    const device = new MockTactiqDevice({
      id: record.id,
      name: record.name,
      serial: record.serial,
      firmware: record.firmware,
      batteryLevel: record.batteryLevel,
    });
    this.attachTransport(device);
    await device.connect();
    const now = new Date().toISOString();
    const updated = { ...record, lastConnectedAt: now };
    this.set({
      state: 'connected',
      active: updated,
      battery: record.batteryLevel,
      paired: this.snapshot.paired.map((p) => (p.id === record.id ? updated : p)),
    });
    this.persistPaired();
    return true;
  }

  async disconnect() {
    const active = this.snapshot.active;
    await this.transport?.disconnect();
    this.teardownTransport();
    this.rememberBattery();
    this.set({
      state: active ? 'disconnected' : 'idle',
      battery: null,
      signal: null,
      gateArmed: false,
    });
  }

  /** Remove a paired ring entirely. Disconnects first if it is active. */
  async forget(deviceId: string) {
    if (this.snapshot.active?.id === deviceId) await this.disconnect();
    this.set({
      paired: this.snapshot.paired.filter((p) => p.id !== deviceId),
      active: this.snapshot.active?.id === deviceId ? null : this.snapshot.active,
    });
    if (this.snapshot.paired.length === 0) this.set({ state: 'idle' });
    this.persistPaired();
  }

  async rename(name: string) {
    const active = this.snapshot.active;
    if (!active) return;
    await this.transport?.rename(name);
    const updated = { ...active, name };
    this.set({
      active: updated,
      paired: this.snapshot.paired.map((p) => (p.id === active.id ? updated : p)),
    });
    this.persistPaired();
  }

  async identify(): Promise<boolean> {
    if (!this.transport) return false;
    await this.transport.identify();
    return true;
  }

  /** Demonstrate an unexpected link drop (mock transport only). */
  simulateLinkDrop() {
    if (this.transport instanceof MockTactiqDevice) this.transport.dropLink();
  }

  /** Demonstrate the low-battery journey (mock transport only). */
  simulateLowBattery() {
    if (this.transport instanceof MockTactiqDevice) this.transport.setBattery(12);
  }

  // ----- gestures ----------------------------------------------------------

  /** Forward the user's calibration to the simulated classifier. */
  applyCalibration(perContact: Partial<Record<ContactId, number>>, base?: number) {
    if (this.transport instanceof MockTactiqDevice) {
      this.transport.setCalibration(perContact, base);
    }
    this.pendingCalibration = { perContact, base };
  }

  private pendingCalibration: {
    perContact: Partial<Record<ContactId, number>>;
    base?: number;
  } | null = null;

  /**
   * Drive a tap through the active simulated ring — or, with no ring
   * connected, synthesize a simulator-sourced event so gesture testing and
   * training still work (clearly labelled by `source`).
   */
  simulateTap(contactId: ContactId, opts: { hold?: boolean; windowOpen?: boolean } = {}) {
    if (this.transport instanceof MockTactiqDevice && this.transport.isConnected) {
      this.transport.simulateTap(contactId, opts);
      return;
    }
    const gesture: DeviceGestureEvent = {
      intendedContactId: contactId,
      contactId,
      hold: opts.hold ?? false,
      confidence: 0.9 + Math.random() * 0.09,
      latencyMs: Math.round(220 + Math.random() * 140),
      gated: opts.windowOpen === false,
      source: 'simulator',
    };
    this.emitEvent({ type: 'gesture', gesture });
  }

  /** The simulator's wake squeeze — mirrors GATE lines from the firmware. */
  setGateArmed(armed: boolean) {
    this.set({ gateArmed: armed });
    this.emitEvent({ type: 'gate', armed });
  }

  // ----- internals ---------------------------------------------------------

  private attachTransport(device: TactiqDevice) {
    this.transport = device;
    if (this.pendingCalibration && device instanceof MockTactiqDevice) {
      device.setCalibration(this.pendingCalibration.perContact, this.pendingCalibration.base);
    }
    this.transportUnsub = device.subscribe((event) => {
      if (event.type === 'battery') {
        const wasLow = this.lowBatteryFlagged;
        this.set({ battery: event.level });
        if (event.level <= 15 && !wasLow) {
          this.lowBatteryFlagged = true;
          this.emitEvent({ type: 'connection', state: 'connected', detail: 'low-battery' });
        }
        if (event.level > 20) this.lowBatteryFlagged = false;
        this.rememberBattery();
      } else if (event.type === 'signal') {
        this.set({ signal: event.quality });
      } else if (event.type === 'gate') {
        this.set({ gateArmed: event.armed });
      } else if (event.type === 'connection' && event.state === 'failed') {
        this.teardownTransport();
        this.set({
          state: 'failed',
          error: event.detail ?? 'The Bluetooth link dropped unexpectedly.',
          signal: null,
          gateArmed: false,
        });
      }
      this.emitEvent(event);
    });
  }

  private rememberBattery() {
    const { active, battery } = this.snapshot;
    if (!active || battery === null) return;
    this.set({
      paired: this.snapshot.paired.map((p) =>
        p.id === active.id ? { ...p, batteryLevel: battery } : p,
      ),
    });
    this.persistPaired();
  }

  private teardownTransport() {
    this.transportUnsub?.();
    this.transportUnsub = null;
    if (this.transport instanceof MockTactiqDevice) void this.transport.disconnect();
    this.transport = null;
  }
}

export const deviceManager = new DeviceManager();
