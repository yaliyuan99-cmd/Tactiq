/**
 * The parametric part list for the stylised engineering view of the ring.
 * One definition drives everything: the 3D scene, the exploded-view
 * choreography, the numbered component list, and the info panel — so the
 * hardware story can never drift between the visual and the text.
 *
 * Geometry is a deliberate abstraction (the industrial design does not
 * exist yet); every fact string is written against the research paper /
 * PRD, and design-intent claims are labelled as such.
 */

export type PartId =
  | 'shell'
  | 'carrier'
  | 'mag-1'
  | 'mag-2'
  | 'mag-3'
  | 'squeeze'
  | 'haptic'
  | 'ble'
  | 'battery'
  | 'thumb-magnet';

export interface RingPart {
  id: PartId;
  /** Two-digit engineering label, e.g. "03". */
  number: string;
  label: string;
  /** One sentence, hardware-inspection register. */
  fact: string;
  /** Compact spec pills. */
  pills: string[];
  /** Where the part sits when assembled, [x, y, z]. */
  assembled: [number, number, number];
  /** Unit-ish direction it travels when exploding. */
  explodeDir: [number, number, number];
  /** How far it travels at 100%. */
  explodeDistance: number;
  /**
   * The slice of the global slider [start, end] this part moves within —
   * the staged choreography: shell first, electronics later.
   */
  window: [number, number];
  geometry:
    | { kind: 'torus'; radius: number; tube: number }
    | { kind: 'box'; size: [number, number, number] }
    | { kind: 'cylinder'; radius: number; height: number };
  color: string;
  /** Extra rotation so boxes sit tangent to the band. */
  rotationZ?: number;
  /** Hidden until the explode slider passes this point (thumb magnet). */
  appearsAt?: number;
}

/** Position on the band circle (radius 1) at a given angle in degrees. */
function onBand(deg: number, radius = 1): [number, number, number] {
  const rad = (deg * Math.PI) / 180;
  return [Math.cos(rad) * radius, Math.sin(rad) * radius, 0];
}

function radial(deg: number): [number, number, number] {
  const rad = (deg * Math.PI) / 180;
  return [Math.cos(rad), Math.sin(rad), 0];
}

export const RING_PARTS: RingPart[] = [
  {
    id: 'shell',
    number: '01',
    label: 'Outer shell',
    fact: '3D-printed for the bench rig; a soft-touch polymer band is the long-term aim.',
    pills: ['3D-printed', 'Bench prototype'],
    assembled: [0, 0, 0],
    explodeDir: [0, 0, 1],
    explodeDistance: 0.9,
    window: [0.0, 0.3],
    geometry: { kind: 'torus', radius: 1, tube: 0.17 },
    color: '#4a443b',
  },
  {
    id: 'carrier',
    number: '02',
    label: 'Inner carrier',
    fact: 'Holds every sensor in a fixed, repeatable position around the band.',
    pills: ['Structural', 'Fixed geometry'],
    assembled: [0, 0, 0],
    explodeDir: [0, 0, -1],
    explodeDistance: 0.5,
    window: [0.1, 0.4],
    geometry: { kind: 'torus', radius: 1, tube: 0.09 },
    color: '#211e1a',
  },
  {
    id: 'mag-1',
    number: '03',
    label: 'Magnetometer 1',
    fact: 'One of three magnetic-field sensors that estimate where the passive thumb magnet is.',
    pills: ['3× sensors', 'On-device localisation', 'No camera', 'No microphone'],
    assembled: onBand(90),
    explodeDir: radial(90),
    explodeDistance: 1.0,
    window: [0.35, 0.75],
    geometry: { kind: 'box', size: [0.16, 0.12, 0.12] },
    color: '#a63a0a',
    rotationZ: 0,
  },
  {
    id: 'mag-2',
    number: '04',
    label: 'Magnetometer 2',
    fact: 'Spacing the three sensors around the band is what makes triangulation possible.',
    pills: ['3× sensors', 'Spaced 120°'],
    assembled: onBand(210),
    explodeDir: radial(210),
    explodeDistance: 1.0,
    window: [0.4, 0.8],
    geometry: { kind: 'box', size: [0.16, 0.12, 0.12] },
    color: '#a63a0a',
    rotationZ: (210 - 90) * (Math.PI / 180),
  },
  {
    id: 'mag-3',
    number: '05',
    label: 'Magnetometer 3',
    fact: 'Three low-cost magnetometers replace cameras entirely — nothing watches the hand.',
    pills: ['3× sensors', 'Low-cost parts'],
    assembled: onBand(330),
    explodeDir: radial(330),
    explodeDistance: 1.0,
    window: [0.45, 0.85],
    geometry: { kind: 'box', size: [0.16, 0.12, 0.12] },
    color: '#a63a0a',
    rotationZ: (330 - 90) * (Math.PI / 180),
  },
  {
    id: 'squeeze',
    number: '06',
    label: 'Squeeze sensor',
    fact: 'A deliberate squeeze of the band wakes the ring and opens a short command window.',
    pills: ['Wake gate', '≥150 ms hold — design value'],
    assembled: onBand(150),
    explodeDir: radial(150),
    explodeDistance: 0.85,
    window: [0.3, 0.6],
    geometry: { kind: 'box', size: [0.34, 0.09, 0.1] },
    color: '#5f594e',
    rotationZ: (150 - 90) * (Math.PI / 180),
  },
  {
    id: 'haptic',
    number: '07',
    label: 'Haptic motor',
    fact: 'Confirms every command with one of four class-level patterns you can feel.',
    pills: ['4 feedback classes', 'Design intent — not yet felt'],
    assembled: onBand(270, 0.94),
    explodeDir: radial(270),
    explodeDistance: 0.95,
    window: [0.4, 0.7],
    geometry: { kind: 'cylinder', radius: 0.1, height: 0.12 },
    color: '#857d6f',
  },
  {
    id: 'ble',
    number: '08',
    label: 'BLE control board',
    fact: 'Bluetooth LE link to the phone — the bench firmware speaks the Nordic UART service.',
    pills: ['BLE', 'NUS protocol', 'Drives VoiceOver / TalkBack'],
    assembled: onBand(30),
    explodeDir: radial(30),
    explodeDistance: 1.15,
    window: [0.5, 0.85],
    geometry: { kind: 'box', size: [0.3, 0.14, 0.05] },
    color: '#2f5d43',
    rotationZ: (30 - 90) * (Math.PI / 180),
  },
  {
    id: 'battery',
    number: '09',
    label: 'Power',
    fact: 'The power budget targets all-day wear — a target, not yet a measurement.',
    pills: ['Design target', 'Not yet measured'],
    assembled: onBand(30, 0.82),
    explodeDir: radial(30),
    explodeDistance: 1.7,
    window: [0.6, 0.95],
    geometry: { kind: 'cylinder', radius: 0.11, height: 0.06 },
    color: '#44546e',
  },
  {
    id: 'thumb-magnet',
    number: '10',
    label: 'Thumb magnet',
    fact: 'Worn on the thumb, completely passive — no electronics, nothing to charge.',
    pills: ['Passive', 'No electronics', 'The other half of the system'],
    assembled: [1.7, -1.1, 0.2],
    explodeDir: [0.6, -0.4, 0.1],
    explodeDistance: 0.4,
    window: [0.75, 1],
    geometry: { kind: 'cylinder', radius: 0.09, height: 0.05 },
    color: '#26221d',
    appearsAt: 0.72,
  },
];

export const PARTS_BY_ID: Record<string, RingPart> = Object.fromEntries(
  RING_PARTS.map((p) => [p.id, p]),
);
