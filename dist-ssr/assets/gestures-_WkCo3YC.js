import { Play, SkipForward, SkipBack, Rewind, FastForward, Volume2, Volume1, PhoneCall, MessageSquare, Mic, Navigation, Camera, Bot, NotebookPen, MapPin, Clock, BatteryCharging, ZoomIn, Eye } from "lucide-react";
const gesturePoints = [
  // Index finger — Confirm / Dismiss
  {
    id: "index-tip",
    finger: "Index",
    position: "Tip",
    x: "36%",
    y: "28%",
    type: "fixed",
    label: "OK",
    description: 'Confirm — activate the focused item, answer a call, accept a suggestion. The "yes" of the whole system, on the finger wearing the ring.',
    gestures: ["Brief tap: Confirm"],
    editable: false
  },
  {
    id: "index-base",
    finger: "Index",
    position: "Base",
    x: "36%",
    y: "56%",
    type: "fixed",
    label: "Back",
    description: 'Dismiss / Back — decline a call, go back a screen, silence an alarm. The "no" that mirrors Confirm on the same finger.',
    gestures: ["Brief tap: Dismiss / Back"],
    editable: false
  },
  // Middle finger — Undo / Next
  {
    id: "middle-tip",
    finger: "Middle",
    position: "Tip",
    x: "50%",
    y: "24%",
    type: "fixed",
    label: "Undo",
    description: "Undo — reverse the last action and recover from a mis-tap. Every Tactiq command is recoverable; that is why there is no delete or clear-field gesture at all.",
    gestures: ["Brief tap: Undo"],
    editable: false
  },
  {
    id: "middle-base",
    finger: "Middle",
    position: "Base",
    x: "50%",
    y: "55%",
    type: "fixed",
    label: "Next",
    description: "Next — move to the next item, element, or track. Paired with Previous on the ring finger for symmetric navigation.",
    gestures: ["Brief tap: Next"],
    editable: false
  },
  // Ring finger — Read/Repeat / Previous
  {
    id: "ring-tip",
    finger: "Ring",
    position: "Tip",
    x: "64%",
    y: "28%",
    type: "fixed",
    label: "Read",
    description: "Read / Repeat — speak the current item again or repeat the last announcement through VoiceOver or TalkBack.",
    gestures: ["Brief tap: Read / Repeat"],
    editable: false
  },
  {
    id: "ring-base",
    finger: "Ring",
    position: "Base",
    x: "64%",
    y: "56%",
    type: "fixed",
    label: "Prev",
    description: "Previous — move to the previous item, element, or track. Paired with Next on the middle finger.",
    gestures: ["Brief tap: Previous"],
    editable: false
  },
  // Pinky — the personal points
  {
    id: "pinky-base",
    finger: "Pinky",
    position: "Base",
    x: "76%",
    y: "58%",
    type: "custom",
    label: "S1",
    description: "Shortcut 1 — one of the two points that are yours to map: speak the time, call a favourite, play a podcast, share your location…",
    gestures: ["Brief tap: your chosen shortcut"],
    editable: true
  },
  {
    id: "pinky-tip",
    finger: "Pinky",
    position: "Tip",
    x: "76%",
    y: "35%",
    type: "return",
    label: "S2·SOS",
    description: "Shortcut 2 and Emergency share this point, separated by duration — the only shared point in the system. A brief tap fires your second shortcut; Emergency requires a sustained 5-second hold, never a tap count, so it cannot fire by accident.",
    gestures: [
      "Brief tap: Shortcut 2 (yours to map)",
      "Sustained 5-second hold: Emergency"
    ],
    editable: true
  }
];
const colorMap = {
  modifier: { bg: "bg-blue-500", border: "border-blue-400", text: "text-blue-600", glow: "shadow-blue-500/50" },
  fixed: { bg: "bg-green-500", border: "border-green-400", text: "text-green-600", glow: "shadow-green-500/50" },
  letter: { bg: "bg-yellow-500", border: "border-yellow-400", text: "text-yellow-600", glow: "shadow-yellow-500/50" },
  custom: { bg: "bg-purple-500", border: "border-purple-400", text: "text-purple-600", glow: "shadow-purple-500/50" },
  palm: { bg: "bg-purple-500", border: "border-purple-400", text: "text-purple-600", glow: "shadow-purple-500/50" },
  return: { bg: "bg-red-500", border: "border-red-400", text: "text-red-600", glow: "shadow-red-500/50" },
  space: { bg: "bg-slate-600", border: "border-slate-400", text: "text-slate-600", glow: "shadow-slate-500/50" }
};
const editableGesturePoints = gesturePoints.filter((p) => p.editable);
const COMMAND_LIBRARY = [
  // Media
  { id: "media-playpause", label: "Play / Pause", category: "Media", icon: Play },
  { id: "media-next", label: "Next track", category: "Media", icon: SkipForward },
  { id: "media-prev", label: "Previous track", category: "Media", icon: SkipBack },
  { id: "rewind-10", label: "Rewind 10 seconds", category: "Media", icon: Rewind },
  { id: "forward-30", label: "Forward 30 seconds", category: "Media", icon: FastForward },
  { id: "volume-up", label: "Volume up", category: "Media", icon: Volume2 },
  { id: "volume-down", label: "Volume down", category: "Media", icon: Volume1 },
  // Phone & messages
  { id: "call-favorite", label: "Call favourite contact", category: "Phone", icon: PhoneCall },
  { id: "read-last-message", label: "Read last message", category: "Messages", icon: MessageSquare },
  { id: "reply-voice", label: "Reply by voice", category: "Messages", icon: Mic },
  // Apps
  { id: "open-navigation", label: "Open navigation", category: "Apps", icon: Navigation },
  { id: "open-camera", label: "Open camera", category: "Apps", icon: Camera },
  { id: "open-assistant", label: "Open voice assistant", category: "Apps", icon: Bot },
  { id: "open-notes", label: "New note", category: "Apps", icon: NotebookPen },
  // Utility & accessibility
  { id: "share-location", label: "Share my location", category: "Utility", icon: MapPin },
  { id: "announce-time", label: "Announce time", category: "Utility", icon: Clock },
  { id: "announce-battery", label: "Announce battery", category: "Utility", icon: BatteryCharging },
  { id: "magnifier", label: "Toggle magnifier", category: "Utility", icon: ZoomIn },
  { id: "screen-reader", label: "Toggle screen reader", category: "Utility", icon: Eye }
];
const COMMANDS_BY_ID = Object.fromEntries(
  COMMAND_LIBRARY.map((c) => [c.id, c])
);
const COMMAND_CATEGORIES = Array.from(
  new Set(COMMAND_LIBRARY.map((c) => c.category))
);
const DEFAULT_LAYOUT = {
  "pinky-base": "announce-time",
  "pinky-tip": "media-playpause"
};
function commandLabelFor(layout, slotId) {
  var _a;
  const cmdId = layout[slotId] ?? DEFAULT_LAYOUT[slotId];
  return cmdId ? ((_a = COMMANDS_BY_ID[cmdId]) == null ? void 0 : _a.label) ?? "Unassigned" : "Unassigned";
}
export {
  COMMANDS_BY_ID as C,
  DEFAULT_LAYOUT as D,
  COMMAND_CATEGORIES as a,
  COMMAND_LIBRARY as b,
  commandLabelFor as c,
  colorMap as d,
  editableGesturePoints as e,
  gesturePoints as g
};
