/**
 * The simulated ring — a faithful stand-in for the bench prototype so the
 * whole companion experience can be demonstrated without hardware. It follows
 * the same event contract the Web Bluetooth transport uses, drains its battery
 * slowly while connected, wobbles its signal quality, and (matching the
 * paper's signal model) misclassifies mostly within-finger when calibration
 * quality is low.
 */
import { CONTACTS_BY_ID, type ContactId } from '../../lib/gestures';
import { clamp, sleep, uid } from '../../lib/utils';
import type {
  DeviceEvent,
  DeviceEventListener,
  DeviceIdentity,
  TactiqDevice,
} from './types';

export interface MockDeviceSeed {
  id?: string;
  name?: string;
  serial?: string;
  firmware?: string;
  batteryLevel?: number;
}

/** Within-finger neighbour (tip↔base) — where real confusion would cluster. */
function withinFingerNeighbour(contactId: ContactId): ContactId {
  const point = CONTACTS_BY_ID[contactId];
  const swapped = point.position === 'Tip' ? 'base' : 'tip';
  return `${point.finger.toLowerCase()}-${swapped}` as ContactId;
}

export function makeMockSerial(): string {
  return `TQ-B0-${Math.floor(1000 + Math.random() * 9000)}`;
}

export class MockTactiqDevice implements TactiqDevice {
  readonly identity: DeviceIdentity;
  private listeners = new Set<DeviceEventListener>();
  private battery: number;
  private connected = false;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  /** Per-contact recognition accuracy, set from the user's calibration. */
  private accuracy: Partial<Record<ContactId, number>> = {};
  private baseAccuracy = 0.94; // uncalibrated default, per worn-model simulations

  constructor(seed: MockDeviceSeed = {}) {
    this.identity = {
      id: seed.id ?? uid('mock'),
      name: seed.name ?? 'Tactiq Ring',
      serial: seed.serial ?? makeMockSerial(),
      firmware: seed.firmware ?? '0.4.2-bench',
      model: 'Bench prototype (simulated)',
      transport: 'mock',
    };
    this.battery = seed.batteryLevel ?? 68;
  }

  setCalibration(perContact: Partial<Record<ContactId, number>>, base?: number) {
    this.accuracy = perContact;
    if (base !== undefined) this.baseAccuracy = base;
  }

  /** Force the battery to a level (used by the low-battery demo control). */
  setBattery(level: number) {
    this.battery = clamp(level, 0, 100);
    this.emit({ type: 'battery', level: this.battery });
  }

  async connect(): Promise<void> {
    await sleep(900 + Math.random() * 700);
    this.connected = true;
    this.emit({ type: 'connection', state: 'connected' });
    this.emit({ type: 'battery', level: this.battery });
    // Slow drain + gentle signal wobble while connected.
    this.tickTimer = setInterval(() => {
      if (!this.connected) return;
      // ≈1% every 4–5 minutes — a plausible all-day wearable budget.
      if (Math.random() < 0.01) {
        this.battery = clamp(this.battery - 1, 0, 100);
        this.emit({ type: 'battery', level: this.battery });
      }
      const quality = clamp(84 + Math.sin(Date.now() / 9000) * 9 + (Math.random() * 10 - 5), 35, 100);
      this.emit({ type: 'signal', quality: Math.round(quality) });
    }, 2500);
  }

  async disconnect(): Promise<void> {
    this.stopTicks();
    this.connected = false;
    this.emit({ type: 'connection', state: 'disconnected' });
  }

  /** Simulate an unexpected link drop (for demonstrating failure states). */
  dropLink() {
    this.stopTicks();
    this.connected = false;
    this.emit({
      type: 'connection',
      state: 'failed',
      detail: 'Bluetooth link lost (simulated drop)',
    });
  }

  async getBatteryLevel(): Promise<number> {
    return this.battery;
  }

  async getDeviceInfo(): Promise<DeviceIdentity> {
    return this.identity;
  }

  async identify(): Promise<void> {
    // The real ring would fire its "confirm" haptic effect; here we just take
    // the time the pattern would take.
    await sleep(700);
  }

  async rename(name: string): Promise<void> {
    this.identity.name = name;
  }

  subscribe(listener: DeviceEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get isConnected() {
    return this.connected;
  }

  /**
   * Drive a thumb-tap through the simulated classifier. `windowOpen=false`
   * models a tap outside the command window: the gate drops it (P9).
   */
  simulateTap(
    intended: ContactId,
    opts: { hold?: boolean; windowOpen?: boolean } = {},
  ) {
    const { hold = false, windowOpen = true } = opts;
    const accuracy = this.accuracy[intended] ?? this.baseAccuracy;
    const correct = Math.random() < accuracy;
    // Misclassification clusters within-finger (tip↔base share flex features).
    const recognized = correct
      ? intended
      : Math.random() < 0.8
        ? withinFingerNeighbour(intended)
        : intended === 'pinky-base'
          ? 'ring-base'
          : 'pinky-base';
    const confidence = correct
      ? 0.86 + Math.random() * 0.13
      : 0.48 + Math.random() * 0.3;
    this.emit({
      type: 'gesture',
      gesture: {
        intendedContactId: intended,
        contactId: recognized,
        hold,
        confidence: Math.round(confidence * 100) / 100,
        latencyMs: Math.round(230 + Math.random() * 160),
        gated: !windowOpen,
        source: 'mock-device',
      },
    });
  }

  private stopTicks() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  private emit(event: DeviceEvent) {
    this.listeners.forEach((l) => l(event));
  }
}
