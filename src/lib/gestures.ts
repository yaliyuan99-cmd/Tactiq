/**
 * THE product-configuration file — the single source of truth for Tactiq's
 * command system. Every public page and every dashboard page reads from here,
 * so the command model cannot drift between surfaces.
 *
 * The concept: one ring on the index finger of either hand. The thumb taps
 * eight contact points — the tips and bases of the four fingers — carrying nine
 * commands. Seven commands never move; only the two personal-shortcut points
 * are customisable. Emergency shares the pinky tip but is separated by
 * duration (a sustained 5-second hold — never a tap count) and can never be
 * remapped. Text entry is deliberately excluded, as is any clear-field or
 * delete gesture.
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
  MessageSquare,
  Mic,
  Navigation,
  Camera,
  Bot,
  NotebookPen,
  MapPin,
  Clock,
  BatteryCharging,
  ZoomIn,
  Eye,
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

/** The eight canonical contact points — the vocabulary of the whole system. */
export type ContactId =
  | 'index-tip'
  | 'index-base'
  | 'middle-tip'
  | 'middle-base'
  | 'ring-tip'
  | 'ring-base'
  | 'pinky-tip'
  | 'pinky-base';

export interface GesturePoint {
  id: ContactId;
  finger: string;
  position: string;
  x: string;
  y: string;
  type: GestureType;
  label: string;
  description: string;
  gestures?: string[];
  /** Whether this contact point's command is customisable. */
  editable: boolean;
  /**
   * Haptic confirmation pattern *specified* for this command.
   * DESIGN INTENT — no haptic hardware has been built, so no pattern here has
   * ever been felt or measured. Surfaces must not present these as behaviour.
   */
  haptic: string;
  /** Complete accessible name for screen readers. */
  srLabel: string;
  /** Number key that stands in for this contact in the simulator. */
  simKey: string;
}

/**
 * Product-level facts shared by every page.
 *
 * Everything in this file describes the design **as specified**. No wearable
 * ring exists; the bench rig is the only hardware. Nothing here is a measured
 * property, and no surface should render it in the present tense as though the
 * device were in someone's hand.
 */
export const PRODUCT = {
  contactPoints: 8,
  commands: 9,
  fixedCommands: 7,
  personalShortcuts: 2,
  /**
   * THE canonical arithmetic sentence — reuse this verbatim wherever the
   * command count is explained, so pages can never disagree about whether
   * Emergency is a tenth command (it is not).
   */
  canonical:
    'Eight contact points carry nine commands: seven fixed commands and two personal shortcuts. Emergency is not a tenth command — it is a sustained five-second hold on one shared point, an activation variation that can never be remapped.',
  activation:
    'By design the ring stays idle until a deliberate squeeze of the ring body opens a short command window. Design target: at most one false activation per hour — not yet measured.',
  emergency:
    'Emergency is specified as a sustained five-second hold on the pinky tip — never a tap count. It is the only shared contact point, separated by duration, and it can never be remapped.',
  /** Engagement-hold default from the PRD (GATE-2); tunable, placeholder until τ* is derived. */
  gateHoldMsDefault: 150,
  /** How long the command window stays open after a wake squeeze (design value for the simulator). */
  commandWindowMs: 4000,
  /** Emergency sustained-hold duration (GES-3 / P6). */
  emergencyHoldMs: 5000,
} as const;

export const gesturePoints: GesturePoint[] = [
  // Index finger — Confirm / Dismiss
  {
    id: 'index-tip',
    finger: 'Index',
    position: 'Tip',
    x: '36%',
    y: '28%',
    type: 'fixed',
    label: 'OK',
    description:
      'Confirm — activate the focused item, answer a call, accept a suggestion. The "yes" of the whole system, on the finger wearing the ring.',
    gestures: ['Brief tap: Confirm'],
    editable: false,
    haptic: 'One short pulse',
    srLabel: 'Index finger tip: Confirm. Fixed command. Haptic: one short pulse.',
    simKey: '1',
  },
  {
    id: 'index-base',
    finger: 'Index',
    position: 'Base',
    x: '36%',
    y: '56%',
    type: 'fixed',
    label: 'Back',
    description:
      'Dismiss / Back — decline a call, go back a screen, silence an alarm. The "no" that mirrors Confirm on the same finger.',
    gestures: ['Brief tap: Dismiss / Back'],
    editable: false,
    haptic: 'Two short pulses',
    srLabel: 'Index finger base: Dismiss or Back. Fixed command. Haptic: two short pulses.',
    simKey: '2',
  },

  // Middle finger — Undo / Next
  {
    id: 'middle-tip',
    finger: 'Middle',
    position: 'Tip',
    x: '50%',
    y: '24%',
    type: 'fixed',
    label: 'Undo',
    description:
      'Undo — reverse the last action and recover from a mis-tap. Every Tactiq command is recoverable; that is why there is no delete or clear-field gesture at all.',
    gestures: ['Brief tap: Undo'],
    editable: false,
    haptic: 'Long then short pulse',
    srLabel: 'Middle finger tip: Undo. Fixed command. Haptic: a long then short pulse.',
    simKey: '3',
  },
  {
    id: 'middle-base',
    finger: 'Middle',
    position: 'Base',
    x: '50%',
    y: '55%',
    type: 'fixed',
    label: 'Next',
    description:
      'Next — move to the next item, element, or track. Paired with Previous on the ring finger for symmetric navigation.',
    gestures: ['Brief tap: Next'],
    editable: false,
    haptic: 'Rising double pulse',
    srLabel: 'Middle finger base: Next. Fixed command. Haptic: rising double pulse.',
    simKey: '4',
  },

  // Ring finger — Read/Repeat / Previous
  {
    id: 'ring-tip',
    finger: 'Ring',
    position: 'Tip',
    x: '64%',
    y: '28%',
    type: 'fixed',
    label: 'Read',
    description:
      'Read / Repeat — speak the current item again or repeat the last announcement through VoiceOver or TalkBack.',
    gestures: ['Brief tap: Read / Repeat'],
    editable: false,
    haptic: 'Soft sustained pulse',
    srLabel: 'Ring finger tip: Read or Repeat. Fixed command. Haptic: soft sustained pulse.',
    simKey: '5',
  },
  {
    id: 'ring-base',
    finger: 'Ring',
    position: 'Base',
    x: '64%',
    y: '56%',
    type: 'fixed',
    label: 'Prev',
    description:
      'Previous — move to the previous item, element, or track. Paired with Next on the middle finger.',
    gestures: ['Brief tap: Previous'],
    editable: false,
    haptic: 'Falling double pulse',
    srLabel: 'Ring finger base: Previous. Fixed command. Haptic: falling double pulse.',
    simKey: '6',
  },

  // Pinky — the personal points.
  // Order matters and is easy to get wrong: Shortcut 1 is on the TIP (sharing
  // the point with Emergency), Shortcut 2 is on the BASE. This matches the
  // paper and the design portfolio; an earlier version of this file had them
  // the other way round.
  {
    id: 'pinky-tip',
    finger: 'Pinky',
    position: 'Tip',
    x: '76%',
    y: '35%',
    type: 'return',
    label: 'S1·SOS',
    description:
      'Shortcut 1 and Emergency share this point, separated by duration — the only shared point in the system. A brief tap fires your first shortcut; Emergency requires a sustained 5-second hold, never a tap count, so it cannot fire by accident.',
    gestures: [
      'Brief tap: Shortcut 1 (yours to map)',
      'Sustained 5-second hold: Emergency',
    ],
    editable: true,
    haptic: 'Three short pulses; continuous strong pulse for emergency',
    srLabel: 'Pinky tip: Personal shortcut one on a brief tap; Emergency on a sustained five-second hold. Shortcut is customisable, Emergency is not. Haptic: three short pulses, or a continuous strong pulse for emergency.',
    simKey: '7',
  },
  {
    id: 'pinky-base',
    finger: 'Pinky',
    position: 'Base',
    x: '76%',
    y: '58%',
    type: 'custom',
    label: 'S2',
    description:
      'Shortcut 2 — the second of the two points that are yours to map: speak the time, call a favourite, play a podcast, share your location…',
    gestures: ['Brief tap: your chosen shortcut'],
    editable: true,
    haptic: 'Three short pulses',
    srLabel: 'Pinky base: Personal shortcut two. Customisable. Haptic: three short pulses.',
    simKey: '8',
  },
];

export const CONTACTS_BY_ID: Record<string, GesturePoint> = Object.fromEntries(
  gesturePoints.map((p) => [p.id, p]),
);

/** Visual/semantic kind of a contact point — fixed, shortcut, or the shared
 * shortcut+emergency point. */
export type PointKind = 'fixed' | 'shortcut' | 'emergency';

export function kindOf(p: GesturePoint): PointKind {
  if (p.id === 'pinky-tip') return 'emergency';
  return p.editable ? 'shortcut' : 'fixed';
}

export const KIND_LABEL: Record<PointKind, string> = {
  fixed: 'Fixed command',
  shortcut: 'Personal shortcut',
  emergency: 'Shortcut + emergency hold',
};

/**
 * What the phone's screen reader would say when each fixed command lands.
 * Used only by the simulator's simulated VoiceOver/TalkBack response line.
 */
export const FIXED_COMMAND_RESPONSES: Record<string, string> = {
  'index-tip': 'Selected.',
  'index-base': 'Back.',
  'middle-tip': 'Action undone.',
  'middle-base': 'Next item.',
  'ring-tip': 'Reading current item.',
  'ring-base': 'Previous item.',
};

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

/** Slots a user is allowed to remap — only the two shortcut points. */
export const editableGesturePoints = gesturePoints.filter((p) => p.editable);

/**
 * Display name for a shortcut slot ("Shortcut 1" / "Shortcut 2"), derived from
 * the order of `gesturePoints` above.
 *
 * Always call this instead of hard-coding the number at a call site. Shortcut 1
 * is on the pinky **tip** and Shortcut 2 on the **base**; hard-coded labels had
 * these reversed on two surfaces even after the canonical map was corrected.
 */
export function shortcutNameFor(slotId: string): string {
  const index = editableGesturePoints.findIndex((p) => p.id === slotId);
  return index === -1 ? 'Shortcut' : `Shortcut ${index + 1}`;
}

// ---------------------------------------------------------------------------
// Command library — what a shortcut slot can be mapped to.
// Deliberately excludes text entry and any delete/clear-field command, and
// Emergency is never remappable (it is fixed to the sustained pinky-tip hold).
// ---------------------------------------------------------------------------

export interface CommandDef {
  id: string;
  label: string;
  category: string;
  icon: LucideIcon;
  /** Simulated phone response used by the simulator and training pages. */
  response: string;
}

export const COMMAND_LIBRARY: CommandDef[] = [
  // Media
  { id: 'media-playpause', label: 'Play / Pause', category: 'Media', icon: Play, response: 'Playing.' },
  { id: 'media-next', label: 'Next track', category: 'Media', icon: SkipForward, response: 'Next track.' },
  { id: 'media-prev', label: 'Previous track', category: 'Media', icon: SkipBack, response: 'Previous track.' },
  { id: 'rewind-10', label: 'Rewind 10 seconds', category: 'Media', icon: Rewind, response: 'Rewound 10 seconds.' },
  { id: 'forward-30', label: 'Forward 30 seconds', category: 'Media', icon: FastForward, response: 'Skipped forward 30 seconds.' },
  { id: 'volume-up', label: 'Volume up', category: 'Media', icon: Volume2, response: 'Volume up.' },
  { id: 'volume-down', label: 'Volume down', category: 'Media', icon: Volume1, response: 'Volume down.' },
  // Phone & messages
  { id: 'call-favorite', label: 'Call favourite contact', category: 'Phone', icon: PhoneCall, response: 'Calling your favourite contact.' },
  { id: 'read-last-message', label: 'Read last message', category: 'Messages', icon: MessageSquare, response: 'Reading your last message.' },
  { id: 'reply-voice', label: 'Reply by voice', category: 'Messages', icon: Mic, response: 'Reply by voice. Speak after the tone.' },
  // Apps
  { id: 'open-navigation', label: 'Open navigation', category: 'Apps', icon: Navigation, response: 'Navigation open.' },
  { id: 'open-camera', label: 'Open camera', category: 'Apps', icon: Camera, response: 'Camera open.' },
  { id: 'open-assistant', label: 'Open voice assistant', category: 'Apps', icon: Bot, response: 'Assistant listening.' },
  { id: 'open-notes', label: 'New note', category: 'Apps', icon: NotebookPen, response: 'New note. Recording.' },
  // Utility & accessibility
  { id: 'share-location', label: 'Share my location', category: 'Utility', icon: MapPin, response: 'Location shared with your chosen contact.' },
  { id: 'announce-time', label: 'Announce time', category: 'Utility', icon: Clock, response: 'It is currently the announced time.' },
  { id: 'announce-battery', label: 'Announce battery', category: 'Utility', icon: BatteryCharging, response: 'Phone battery announced.' },
  { id: 'magnifier', label: 'Toggle magnifier', category: 'Utility', icon: ZoomIn, response: 'Magnifier on.' },
  { id: 'screen-reader', label: 'Toggle screen reader', category: 'Utility', icon: Eye, response: 'Screen reader toggled.' },
];

export const COMMANDS_BY_ID: Record<string, CommandDef> = Object.fromEntries(
  COMMAND_LIBRARY.map((c) => [c.id, c]),
);

export const COMMAND_CATEGORIES = Array.from(
  new Set(COMMAND_LIBRARY.map((c) => c.category)),
);

/** The factory-default mapping for the two shortcut slots. */
export const DEFAULT_LAYOUT: GestureLayout = {
  'pinky-base': 'announce-time',
  'pinky-tip': 'media-playpause',
};

/** Human-readable command name for a slot in a layout (falls back to default). */
export function commandLabelFor(layout: GestureLayout, slotId: string): string {
  const cmdId = layout[slotId] ?? DEFAULT_LAYOUT[slotId];
  return cmdId ? (COMMANDS_BY_ID[cmdId]?.label ?? 'Unassigned') : 'Unassigned';
}

/**
 * The name a landed gesture displays, given the active layout: fixed commands
 * come from the point label; shortcut slots resolve through the layout.
 */
export function effectiveCommandFor(
  layout: GestureLayout,
  contactId: ContactId,
  hold = false,
): { name: string; response: string; kind: PointKind } {
  if (contactId === 'pinky-tip' && hold) {
    return {
      name: 'Emergency (platform SOS)',
      response: 'Emergency. Contacting the platform S O S pathway.',
      kind: 'emergency',
    };
  }
  const point = CONTACTS_BY_ID[contactId];
  if (point?.editable) {
    const cmdId = layout[contactId] ?? DEFAULT_LAYOUT[contactId];
    const cmd = cmdId ? COMMANDS_BY_ID[cmdId] : undefined;
    return {
      name: cmd?.label ?? 'Unassigned shortcut',
      response: cmd?.response ?? 'No command assigned to this shortcut.',
      kind: 'shortcut',
    };
  }
  const fixedNames: Record<string, string> = {
    'index-tip': 'Confirm',
    'index-base': 'Dismiss / Back',
    'middle-tip': 'Undo',
    'middle-base': 'Next',
    'ring-tip': 'Read / Repeat',
    'ring-base': 'Previous',
  };
  return {
    name: fixedNames[contactId] ?? point?.label ?? 'Command',
    response: FIXED_COMMAND_RESPONSES[contactId] ?? 'Done.',
    kind: 'fixed',
  };
}
