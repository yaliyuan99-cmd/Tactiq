/** React bindings for the device manager store. */
import { useEffect, useSyncExternalStore } from 'react';
import { deviceManager, type DeviceSnapshot } from './manager';
import type { DeviceEvent } from './types';

/** Live device snapshot; re-renders on every state change. */
export function useDeviceSnapshot(): DeviceSnapshot {
  return useSyncExternalStore(deviceManager.subscribe, deviceManager.getSnapshot);
}

/** Subscribe to the raw device event stream (gestures, battery, gate…). */
export function useDeviceEvents(listener: (event: DeviceEvent) => void) {
  useEffect(() => deviceManager.subscribeEvents(listener), [listener]);
}
