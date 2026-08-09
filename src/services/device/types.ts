/**
 * The hardware abstraction boundary. Everything above this file (UI, stores,
 * analytics) speaks only these types; everything below it is a transport —
 * today the mock transport, later the real ring over Web Bluetooth. The wire
 * vocabulary matches the bench firmware's protocol (tactiq-ring
 * docs/PROTOCOL.md): Nordic UART Service, newline-terminated ASCII lines.
 */
import type { ContactId } from '../../lib/gestures';

export type ConnectionState =
  | 'idle' // no device active, not scanning
  | 'scanning'
  | 'discovered' // a ring answered the scan but is not yet paired
  | 'pairing'
  | 'connected'
  | 'reconnecting'
  | 'disconnected' // paired but not currently connected
  | 'failed'; // last attempt failed — snapshot.error says why

export interface DeviceIdentity {
  id: string;
  name: string;
  serial: string;
  firmware: string;
  model: string;
  transport: 'mock' | 'web-bluetooth';
}

/** A recognised (or rejected) input coming up from a transport. */
export interface DeviceGestureEvent {
  /** The contact the wearer intended (known only in simulation transports). */
  intendedContactId: ContactId;
  /** The contact the classifier reported. */
  contactId: ContactId;
  /** True when the press was the sustained 5-second emergency hold. */
  hold: boolean;
  /** Classifier confidence 0–1. */
  confidence: number;
  /** Gesture-to-token latency in milliseconds. */
  latencyMs: number;
  /** True when the tap arrived outside an open command window (P9) and was dropped. */
  gated: boolean;
  source: 'simulator' | 'mock-device' | 'web-bluetooth';
}

export type DeviceEvent =
  | { type: 'gesture'; gesture: DeviceGestureEvent }
  | { type: 'battery'; level: number }
  | { type: 'gate'; armed: boolean }
  | { type: 'signal'; quality: number }
  | { type: 'connection'; state: 'connected' | 'disconnected' | 'failed'; detail?: string };

export type DeviceEventListener = (event: DeviceEvent) => void;

/**
 * One Tactiq ring, whatever the transport. `connect` resolves when the
 * hello handshake completes; events flow through `subscribe` afterwards.
 */
export interface TactiqDevice {
  readonly identity: DeviceIdentity;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getBatteryLevel(): Promise<number>;
  getDeviceInfo(): Promise<DeviceIdentity>;
  /** Ask the ring to pulse its haptic actuator so the wearer can find it. */
  identify(): Promise<void>;
  rename(name: string): Promise<void>;
  subscribe(listener: DeviceEventListener): () => void;
}

/** Wire tokens from the firmware protocol → app contact ids. */
export const WIRE_CONTACT_MAP: Record<string, ContactId> = {
  index_tip: 'index-tip',
  index_base: 'index-base',
  middle_tip: 'middle-tip',
  middle_base: 'middle-base',
  ring_tip: 'ring-tip',
  ring_base: 'ring-base',
  pinky_tip: 'pinky-tip',
  pinky_base: 'pinky-base',
};

/** Nordic UART Service identifiers used by the bench firmware. */
export const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const NUS_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
export const NUS_TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
