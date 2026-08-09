/**
 * Web Bluetooth transport for the bench firmware.
 *
 * This implements the real wire protocol from the tactiq-ring repo
 * (docs/PROTOCOL.md): Nordic UART Service, newline-terminated ASCII lines —
 * `TOK,<token>,<contact_key>,<t_ms>,<dur_ms>`, `STA,battery,<pct>`,
 * `GATE,armed|idle`, `STA,hello,<fw>`. It has NOT yet been exercised against
 * physical hardware (none exists); it exists so the companion experience is
 * ready the day the bench rig powers on. Chrome/Edge only — Safari and
 * Firefox do not ship Web Bluetooth.
 */
import { uid } from '../../lib/utils';
import {
  NUS_RX_UUID,
  NUS_SERVICE_UUID,
  NUS_TX_UUID,
  WIRE_CONTACT_MAP,
  type DeviceEvent,
  type DeviceEventListener,
  type DeviceIdentity,
  type TactiqDevice,
} from './types';

/* Minimal Web Bluetooth typings — lib.dom omits them without the types package. */
interface BTCharacteristic extends EventTarget {
  startNotifications(): Promise<BTCharacteristic>;
  writeValue(data: BufferSource): Promise<void>;
  value?: DataView;
}
interface BTRemoteGATTService {
  getCharacteristic(uuid: string): Promise<BTCharacteristic>;
}
interface BTRemoteGATTServer {
  connect(): Promise<BTRemoteGATTServer>;
  disconnect(): void;
  connected: boolean;
  getPrimaryService(uuid: string): Promise<BTRemoteGATTService>;
}
interface BTDevice extends EventTarget {
  name?: string;
  id: string;
  gatt?: BTRemoteGATTServer;
}
interface BluetoothLike {
  requestDevice(options: {
    filters: Array<{ namePrefix?: string; services?: string[] }>;
    optionalServices?: string[];
  }): Promise<BTDevice>;
}

export function isWebBluetoothAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/**
 * Opens the browser's device chooser. Must be called from a user gesture.
 * Throws DOMException "NotFoundError" when the user cancels the chooser.
 */
export async function requestRealRing(): Promise<WebBluetoothTactiqDevice> {
  const bluetooth = (navigator as unknown as { bluetooth: BluetoothLike }).bluetooth;
  const device = await bluetooth.requestDevice({
    filters: [{ namePrefix: 'Tactiq' }],
    optionalServices: [NUS_SERVICE_UUID],
  });
  return new WebBluetoothTactiqDevice(device);
}

export class WebBluetoothTactiqDevice implements TactiqDevice {
  readonly identity: DeviceIdentity;
  private listeners = new Set<DeviceEventListener>();
  private device: BTDevice;
  private rx: BTCharacteristic | null = null;
  private buffer = '';
  private battery = 100;

  constructor(device: BTDevice) {
    this.device = device;
    this.identity = {
      id: device.id || uid('ble'),
      name: device.name ?? 'Tactiq Ring',
      serial: device.id?.slice(0, 12) ?? 'unknown',
      firmware: 'awaiting hello',
      model: 'Bench prototype (Web Bluetooth)',
      transport: 'web-bluetooth',
    };
  }

  async connect(): Promise<void> {
    if (!this.device.gatt) throw new Error('Device has no GATT server');
    const server = await this.device.gatt.connect();
    const service = await server.getPrimaryService(NUS_SERVICE_UUID);
    const tx = await service.getCharacteristic(NUS_TX_UUID);
    this.rx = await service.getCharacteristic(NUS_RX_UUID);
    await tx.startNotifications();
    tx.addEventListener('characteristicvaluechanged', this.onNotify);
    this.device.addEventListener('gattserverdisconnected', this.onDisconnect);
    this.emit({ type: 'connection', state: 'connected' });
  }

  async disconnect(): Promise<void> {
    this.device.removeEventListener('gattserverdisconnected', this.onDisconnect);
    this.device.gatt?.disconnect();
    this.emit({ type: 'connection', state: 'disconnected' });
  }

  async getBatteryLevel(): Promise<number> {
    return this.battery; // pushed by STA,battery lines
  }

  async getDeviceInfo(): Promise<DeviceIdentity> {
    return this.identity;
  }

  async identify(): Promise<void> {
    // Liveness ping; the bench firmware answers STA,pong. A future firmware
    // revision could map an IDENTIFY line to a haptic effect.
    await this.write('PING\n');
  }

  async rename(name: string): Promise<void> {
    // BLE peripherals own their advertised name; we keep the friendly name
    // app-side only.
    this.identity.name = name;
  }

  subscribe(listener: DeviceEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private onDisconnect = () => {
    this.emit({ type: 'connection', state: 'failed', detail: 'Bluetooth link lost' });
  };

  private onNotify = (e: Event) => {
    const value = (e.target as BTCharacteristic).value;
    if (!value) return;
    this.buffer += new TextDecoder().decode(value);
    let idx: number;
    while ((idx = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (line) this.handleLine(line);
    }
  };

  private handleLine(line: string) {
    const parts = line.split(',');
    if (parts[0] === 'TOK' && parts.length >= 5) {
      const contactId = WIRE_CONTACT_MAP[parts[2]];
      if (!contactId) return;
      const duration = Number(parts[4]) || 0;
      this.emit({
        type: 'gesture',
        gesture: {
          intendedContactId: contactId, // firmware reports recognition only
          contactId,
          hold: parts[1] === 'emergency',
          confidence: 1, // bench firmware does not stream confidence yet
          latencyMs: duration,
          gated: false,
          source: 'web-bluetooth',
        },
      });
    } else if (parts[0] === 'STA' && parts[1] === 'battery') {
      this.battery = Number(parts[2]) || this.battery;
      this.emit({ type: 'battery', level: this.battery });
    } else if (parts[0] === 'STA' && parts[1] === 'hello') {
      this.identity.firmware = parts[2] ?? this.identity.firmware;
    } else if (parts[0] === 'GATE') {
      this.emit({ type: 'gate', armed: parts[1] === 'armed' });
    }
  }

  private async write(text: string) {
    await this.rx?.writeValue(new TextEncoder().encode(text));
  }

  private emit(event: DeviceEvent) {
    this.listeners.forEach((l) => l(event));
  }
}
