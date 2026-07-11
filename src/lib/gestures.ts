/**
 * Shared gesture model.
 *
 * Both the marketing hand demo (`InteractiveHandDemo`) and the in-account
 * keyboard customizer (`CustomizePage`) read from this single source of truth so
 * the two never drift apart.
 */
import {
  Play,
  SkipForward,
  SkipBack,
  Rewind,
  FastForward,
  Volume2,
  Volume1,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  MessageSquare,
  Mic,
  Navigation,
  Camera,
  Bot,
  NotebookPen,
  Siren,
  MapPin,
  Languages,
  ArrowBigUp,
  Delete,
  CornerDownLeft,
  Clock,
  BatteryCharging,
  ZoomIn,
  Eye,
  Type,
  Space,
  type LucideIcon,
} from 'lucide-react';
import type { GestureLayout } from './database.types';

export type GestureType =
  | 'modifier'
  | 'fixed'
  | 'letter'
  | 'custom'
  | 'palm'
  | 'return'
  | 'space';

export interface GesturePoint {
  id: string;
  finger: string;
  position: string;
  x: string;
  y: string;
  type: GestureType;
  label: string;
  description: string;
  gestures?: string[];
  /** Whether this slot can be remapped in the customizer. */
  editable: boolean;
}

export const gesturePoints: GesturePoint[] = [
  // Thumb (angled up-left)
  {
    id: 'thumb-top',
    finger: 'Thumb',
    position: 'Top',
    x: '14%',
    y: '53%',
    type: 'modifier',
    label: 'Shift/Caps',
    description: 'Modifier (thumb) - Hold for capitalization or shift input',
    gestures: ['Tap: Shift', 'Hold: Caps Lock'],
    editable: true,
  },
  {
    id: 'thumb-mid',
    finger: 'Thumb',
    position: 'Mid',
    x: '23%',
    y: '63%',
    type: 'modifier',
    label: 'Switch Lang',
    description: 'Switch language or input mode',
    gestures: ['Tap: Switch Language', 'Hold: Input Mode'],
    editable: true,
  },
  {
    id: 'space-bar',
    finger: 'Palm',
    position: 'Below fingers',
    x: '54%',
    y: '63%',
    type: 'space',
    label: 'Space',
    description:
      'Spacebar — a long bar resting across the palm beneath the fingers, just like a keyboard. Tap anywhere along it to insert a space.',
    gestures: ['Tap: Space', 'Hold: repeat space'],
    editable: true,
  },

  // 9-grid keypad — row 1 (matches a phone dialpad: 1 / ABC / DEF)
  {
    id: 'index-top',
    finger: 'Index',
    position: 'Top',
    x: '36%',
    y: '34%',
    type: 'letter',
    label: '.?!',
    description:
      '9-grid keypad key 1 — punctuation. Multi-tap to cycle, just like a phone dialpad.',
    gestures: ['Tap 1×: .', 'Tap 2×: ,', 'Tap 3×: ?', 'Tap 4×: !'],
    editable: true,
  },
  {
    id: 'middle-top',
    finger: 'Middle',
    position: 'Top',
    x: '50%',
    y: '30%',
    type: 'letter',
    label: 'ABC',
    description: '9-grid keypad key 2 — multi-tap to cycle A → B → C.',
    gestures: ['Tap 1×: A', 'Tap 2×: B', 'Tap 3×: C'],
    editable: true,
  },
  {
    id: 'ring-top',
    finger: 'Ring',
    position: 'Top',
    x: '64%',
    y: '34%',
    type: 'letter',
    label: 'DEF',
    description: '9-grid keypad key 3 — multi-tap to cycle D → E → F.',
    gestures: ['Tap 1×: D', 'Tap 2×: E', 'Tap 3×: F'],
    editable: true,
  },

  // 9-grid keypad — row 2 (GHI / JKL / MNO)
  {
    id: 'index-mid',
    finger: 'Index',
    position: 'Mid',
    x: '36%',
    y: '42%',
    type: 'letter',
    label: 'GHI',
    description: '9-grid keypad key 4 — multi-tap to cycle G → H → I.',
    gestures: ['Tap 1×: G', 'Tap 2×: H', 'Tap 3×: I'],
    editable: true,
  },
  {
    id: 'middle-mid',
    finger: 'Middle',
    position: 'Mid',
    x: '50%',
    y: '40%',
    type: 'letter',
    label: 'JKL',
    description: '9-grid keypad key 5 — multi-tap to cycle J → K → L.',
    gestures: ['Tap 1×: J', 'Tap 2×: K', 'Tap 3×: L'],
    editable: true,
  },
  {
    id: 'ring-mid',
    finger: 'Ring',
    position: 'Mid',
    x: '64%',
    y: '42%',
    type: 'letter',
    label: 'MNO',
    description: '9-grid keypad key 6 — multi-tap to cycle M → N → O.',
    gestures: ['Tap 1×: M', 'Tap 2×: N', 'Tap 3×: O'],
    editable: true,
  },

  // 9-grid keypad — row 3 (PQRS / TUV / WXYZ)
  {
    id: 'index-bottom',
    finger: 'Index',
    position: 'Bottom',
    x: '36%',
    y: '51%',
    type: 'letter',
    label: 'PQRS',
    description: '9-grid keypad key 7 — multi-tap to cycle P → Q → R → S.',
    gestures: ['Tap 1×: P', 'Tap 2×: Q', 'Tap 3×: R', 'Tap 4×: S'],
    editable: true,
  },
  {
    id: 'middle-bottom',
    finger: 'Middle',
    position: 'Bottom',
    x: '50%',
    y: '50%',
    type: 'letter',
    label: 'TUV',
    description: '9-grid keypad key 8 — multi-tap to cycle T → U → V.',
    gestures: ['Tap 1×: T', 'Tap 2×: U', 'Tap 3×: V'],
    editable: true,
  },
  {
    id: 'ring-bottom',
    finger: 'Ring',
    position: 'Bottom',
    x: '64%',
    y: '51%',
    type: 'letter',
    label: 'WXYZ',
    description: '9-grid keypad key 9 — multi-tap to cycle W → X → Y → Z.',
    gestures: ['Tap 1×: W', 'Tap 2×: X', 'Tap 3×: Y', 'Tap 4×: Z'],
    editable: true,
  },

  // Pinky
  {
    id: 'pinky-top',
    finger: 'Pinky',
    position: 'Top',
    x: '76%',
    y: '40%',
    type: 'fixed',
    label: 'Delete',
    description: 'Fixed: Delete cluster - tap variations',
    gestures: ['Tap 1x: Delete char', 'Tap 2x: Delete word', 'Tap 3x: Clear field'],
    editable: true,
  },
  {
    id: 'pinky-mid',
    finger: 'Pinky',
    position: 'Mid',
    x: '76%',
    y: '47%',
    type: 'custom',
    label: 'Custom',
    description: 'Customizable shortcut',
    gestures: ['Tap 1x: Custom', 'Tap 2x: Custom', 'Tap 3x: Custom'],
    editable: true,
  },
  {
    id: 'pinky-bottom',
    finger: 'Pinky',
    position: 'Bottom',
    x: '76%',
    y: '54%',
    type: 'custom',
    label: 'Custom',
    description: 'Customizable shortcut',
    gestures: ['Tap 1x: Custom', 'Tap 2x: Custom', 'Tap 3x: Custom'],
    editable: true,
  },

  // Palm
  {
    id: 'palm-return',
    finger: 'Palm',
    position: 'Side',
    x: '70%',
    y: '74%',
    type: 'return',
    label: 'Return',
    description: 'Palm (pinky side tap) - Sends Return/Enter command',
    gestures: ['Side tap: Return/Enter'],
    editable: true,
  },
];

export const colorMap: Record<
  GestureType,
  { bg: string; border: string; text: string; glow: string }
> = {
  modifier: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-600', glow: 'shadow-blue-500/50' },
  fixed: { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-600', glow: 'shadow-green-500/50' },
  letter: { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-600', glow: 'shadow-yellow-500/50' },
  custom: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-600', glow: 'shadow-purple-500/50' },
  palm: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-600', glow: 'shadow-purple-500/50' },
  return: { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-600', glow: 'shadow-red-500/50' },
  space: { bg: 'bg-slate-600', border: 'border-slate-400', text: 'text-slate-600', glow: 'shadow-slate-500/50' },
};

/** Slots a user is allowed to remap. */
export const editableGesturePoints = gesturePoints.filter((p) => p.editable);

// ---------------------------------------------------------------------------
// Command library — what an editable slot can be mapped to.
// ---------------------------------------------------------------------------

export interface CommandDef {
  id: string;
  label: string;
  category: string;
  icon: LucideIcon;
}

export const COMMAND_LIBRARY: CommandDef[] = [
  // Typing & system
  { id: 'shift', label: 'Shift / Caps Lock', category: 'Typing', icon: ArrowBigUp },
  { id: 'switch-lang', label: 'Switch language', category: 'Typing', icon: Languages },
  { id: 'delete', label: 'Delete', category: 'Typing', icon: Delete },
  { id: 'return', label: 'Return / Enter', category: 'Typing', icon: CornerDownLeft },
  // Keypad — the 9-grid letter keys + spacebar (defaults for the typing slots).
  // Re-assign these to put letters back on a slot you previously remapped.
  { id: 'key-punct', label: '.?! — punctuation', category: 'Keypad', icon: Type },
  { id: 'key-abc', label: 'ABC', category: 'Keypad', icon: Type },
  { id: 'key-def', label: 'DEF', category: 'Keypad', icon: Type },
  { id: 'key-ghi', label: 'GHI', category: 'Keypad', icon: Type },
  { id: 'key-jkl', label: 'JKL', category: 'Keypad', icon: Type },
  { id: 'key-mno', label: 'MNO', category: 'Keypad', icon: Type },
  { id: 'key-pqrs', label: 'PQRS', category: 'Keypad', icon: Type },
  { id: 'key-tuv', label: 'TUV', category: 'Keypad', icon: Type },
  { id: 'key-wxyz', label: 'WXYZ', category: 'Keypad', icon: Type },
  { id: 'space', label: 'Space', category: 'Keypad', icon: Space },
  // Media
  { id: 'media-playpause', label: 'Play / Pause', category: 'Media', icon: Play },
  { id: 'media-next', label: 'Next track', category: 'Media', icon: SkipForward },
  { id: 'media-prev', label: 'Previous track', category: 'Media', icon: SkipBack },
  { id: 'rewind-10', label: 'Rewind 10 seconds', category: 'Media', icon: Rewind },
  { id: 'forward-30', label: 'Forward 30 seconds', category: 'Media', icon: FastForward },
  { id: 'volume-up', label: 'Volume up', category: 'Media', icon: Volume2 },
  { id: 'volume-down', label: 'Volume down', category: 'Media', icon: Volume1 },
  // Phone & messages
  { id: 'call-favorite', label: 'Call favourite contact', category: 'Phone', icon: PhoneCall },
  { id: 'answer-call', label: 'Answer call', category: 'Phone', icon: PhoneIncoming },
  { id: 'end-call', label: 'End call', category: 'Phone', icon: PhoneOff },
  { id: 'read-last-message', label: 'Read last message', category: 'Messages', icon: MessageSquare },
  { id: 'reply-voice', label: 'Reply by voice', category: 'Messages', icon: Mic },
  // Apps
  { id: 'open-navigation', label: 'Open navigation', category: 'Apps', icon: Navigation },
  { id: 'open-camera', label: 'Open camera', category: 'Apps', icon: Camera },
  { id: 'open-assistant', label: 'Open voice assistant', category: 'Apps', icon: Bot },
  { id: 'open-notes', label: 'New note', category: 'Apps', icon: NotebookPen },
  // Safety
  { id: 'sos', label: 'Emergency SOS', category: 'Safety', icon: Siren },
  { id: 'share-location', label: 'Share my location', category: 'Safety', icon: MapPin },
  // Accessibility
  { id: 'announce-time', label: 'Announce time', category: 'Accessibility', icon: Clock },
  { id: 'announce-battery', label: 'Announce battery', category: 'Accessibility', icon: BatteryCharging },
  { id: 'magnifier', label: 'Toggle magnifier', category: 'Accessibility', icon: ZoomIn },
  { id: 'screen-reader', label: 'Toggle screen reader', category: 'Accessibility', icon: Eye },
];

export const COMMANDS_BY_ID: Record<string, CommandDef> = Object.fromEntries(
  COMMAND_LIBRARY.map((c) => [c.id, c]),
);

export const COMMAND_CATEGORIES = Array.from(
  new Set(COMMAND_LIBRARY.map((c) => c.category)),
);

/** The factory-default mapping for every editable slot. */
export const DEFAULT_LAYOUT: GestureLayout = {
  // Thumb / pinky / palm — the quick-action slots.
  'thumb-top': 'shift',
  'thumb-mid': 'switch-lang',
  'pinky-top': 'delete',
  'pinky-mid': 'media-playpause',
  'pinky-bottom': 'sos',
  'palm-return': 'return',
  // 9-grid keypad + spacebar — editable too, but default to the typing keys so
  // text input works out of the box.
  'index-top': 'key-punct',
  'middle-top': 'key-abc',
  'ring-top': 'key-def',
  'index-mid': 'key-ghi',
  'middle-mid': 'key-jkl',
  'ring-mid': 'key-mno',
  'index-bottom': 'key-pqrs',
  'middle-bottom': 'key-tuv',
  'ring-bottom': 'key-wxyz',
  'space-bar': 'space',
};

/** Human-readable command name for a slot in a layout (falls back to default). */
export function commandLabelFor(layout: GestureLayout, slotId: string): string {
  const cmdId = layout[slotId] ?? DEFAULT_LAYOUT[slotId];
  return cmdId ? (COMMANDS_BY_ID[cmdId]?.label ?? 'Unassigned') : 'Unassigned';
}
