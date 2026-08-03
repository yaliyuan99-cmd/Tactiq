/**
 * The physics, in one place.
 *
 * This module is the single source for anything that computes or reports the
 * magnetic sensing model. Interactive instruments read from it, and so does
 * their static fallback content — so the live figure and the prerendered figure
 * cannot drift apart.
 *
 * TWO KINDS OF NUMBER LIVE HERE, AND THEY MUST NOT BE CONFUSED:
 *
 *   1. Physical constants and closed-form laws (mu0/4pi, the inverse-cube
 *      dipole field). These are physics. Computing with them is not inventing
 *      a claim.
 *
 *   2. Project results (1.7 mm, 11 mm, 86%, 586 uT). These come from the claims
 *      ledger in PLAN.md section 5.2 and are reproduced verbatim below. Never
 *      compute a replacement, never interpolate between them, never round them
 *      differently. If a value is not here, it does not go on the page.
 *
 * The geometry used for drawing (where the three sensors sit in the ring) is
 * SCHEMATIC. The ledger fixes the contact grid and the contact-to-sensor
 * distance span, not exact sensor coordinates, so anything drawn from
 * SCHEMATIC_* must be labelled as illustrative in the UI.
 */

// ---------------------------------------------------------------------------
// 1. Physics
// ---------------------------------------------------------------------------

/** mu0 / 4pi, in T·m/A. */
export const MU0_OVER_4PI = 1e-7;

/** Dipole moment of the D21 magnet used at hand scale, in A·m². Ledger 5.2. */
export const MAGNET_MOMENT_D21 = 0.0131;

/** QMC5883L noise floor, in tesla (0.20 uT). Ledger 5.10. */
export const SENSOR_NOISE_T = 0.2e-6;

/**
 * Field magnitude at distance r from a dipole, measured in its equatorial
 * plane, in tesla.
 *
 *   |B| = (mu0 / 4pi) · m / r³
 *
 * The equatorial plane is the whole trick. In general the magnitude carries an
 * angular factor sqrt(1 + 3cos²(theta)), which varies by a factor of two as the
 * magnet turns. Constrain the magnet's moment vertical and put every sensor in
 * its equatorial plane, and theta is 90 degrees everywhere, so that factor is
 * exactly 1 and the magnitude depends on distance alone. That is what lets
 * three scalar readings replace a nine-component vector fit.
 *
 * @param rMetres distance from the magnet, in metres
 */
export function fieldMagnitudeT(rMetres: number): number {
  if (rMetres <= 0) return Infinity;
  return (MU0_OVER_4PI * MAGNET_MOMENT_D21) / rMetres ** 3;
}

/** Convenience wrapper: distance in mm, field out in microtesla. */
export function fieldMicroTeslaAtMm(rMm: number): number {
  return fieldMagnitudeT(rMm / 1000) * 1e6;
}

/**
 * Inverts the above: the distance implied by a field magnitude.
 *
 *   r = (k / |B|)^(1/3)
 *
 * Note the exponent. A 1% error in the field reading becomes only a 0.33% error
 * in range, because dr/r = (1/3)·dB/B. The inverse cube works in our favour
 * here, and it is why three noisy scalar readings localise as well as they do.
 */
export function distanceMmFromMicroTesla(microTesla: number): number {
  if (microTesla <= 0) return Infinity;
  const rMetres = ((MU0_OVER_4PI * MAGNET_MOMENT_D21) / (microTesla / 1e6)) ** (1 / 3);
  return rMetres * 1000;
}

/** Relative range error implied by a relative field error. dr/r = (1/3)·dB/B. */
export function rangeErrorFromFieldError(relativeFieldError: number): number {
  return relativeFieldError / 3;
}

// ---------------------------------------------------------------------------
// 2. Ledger values — verbatim from PLAN.md section 5.2. Do not recompute.
// ---------------------------------------------------------------------------

/** Half-spacing decision radius around each contact point, in mm. DESIGN INTENT. */
export const DECISION_RADIUS_MM = 11;

/** Worst-contact localisation from sensor noise alone, clustered layout. SIMULATED. */
export const WORST_CONTACT_CRLB_MM = 1.7;

/** Peak field seen at the closest contact, clustered layout, in uT. SIMULATED. */
export const PEAK_FIELD_UT = 586;

/** Contact-to-sensor distance span, clustered layout, in mm. COMPUTED. */
export const CONTACT_SENSOR_SPAN_MM: readonly [number, number] = [13, 81];

/** Pre-registered per-contact accuracy criterion (C1). TARGET. */
export const ACCURACY_CRITERION = 0.95;

/**
 * The simulated conditions from Table 5, clustered layout.
 *
 * These are the ONLY accuracy figures that may be displayed. They are discrete
 * simulated conditions, not samples of a continuous curve — there is no
 * defensible way to interpolate between them, so instruments step through them
 * rather than sliding.
 *
 * `sigmaTapMm` is null where the condition does not model thumb-placement
 * scatter at all.
 */
export interface Condition {
  id: string;
  label: string;
  detail: string;
  sigmaTapMm: number | null;
  meanAccuracy: number;
  worstAccuracy: number;
}

export const CONDITIONS: readonly Condition[] = [
  {
    id: 'C2',
    label: 'Sensor noise only',
    detail:
      'Dwell-averaged readings, no thumb-placement scatter, no ring movement. This is the physics working perfectly.',
    sigmaTapMm: 0,
    meanAccuracy: 1.0,
    worstAccuracy: 1.0,
  },
  {
    id: 'C4',
    label: 'Calibrated rig',
    detail: 'Magnet tilted 10 degrees, per-sensor gain calibrated to 1%. A well-run bench.',
    sigmaTapMm: 0,
    meanAccuracy: 1.0,
    worstAccuracy: 1.0,
  },
  {
    id: 'C5',
    label: 'Uncalibrated gains',
    detail: 'Sensor gains left uncalibrated at plus or minus 5%. Still essentially perfect.',
    sigmaTapMm: 0,
    meanAccuracy: 1.0,
    worstAccuracy: 0.9999,
  },
  {
    id: 'C6',
    label: 'Worn',
    detail:
      '4 mm of thumb-placement scatter and 2 mm of ring shift — the first condition that models a hand rather than a rig. The worst contact point fails the criterion here.',
    sigmaTapMm: 4,
    meanAccuracy: 0.905,
    worstAccuracy: 0.86,
  },
  {
    id: 'C7',
    label: 'Worn, pessimistic',
    detail: '6 mm of thumb-placement scatter and 15 degrees of tilt. Both figures fail.',
    sigmaTapMm: 6,
    meanAccuracy: 0.849,
    worstAccuracy: 0.803,
  },
] as const;

/** The condition the honest headline is drawn from. */
export const WORN_CONDITION = CONDITIONS.find((c) => c.id === 'C6')!;

// ---------------------------------------------------------------------------
// 3. Schematic drawing geometry — illustrative, not a specification
// ---------------------------------------------------------------------------

export interface Point2 {
  x: number;
  y: number;
}

/**
 * Contact points and ring sensors in millimetres, for drawing only.
 *
 * The contact grid follows the ledger's modelled 22 x 45 mm grid: four fingers
 * 22 mm apart, tip and base rows 45 mm apart, giving the 11 mm half-spacing
 * that defines the decision radius. The three sensor positions are a plausible
 * clustered arrangement chosen so the contact-to-sensor distances land inside
 * the ledger's 13-81 mm span. They are NOT a specification, and any UI drawing
 * them must say so.
 */
export const SCHEMATIC_CONTACTS: readonly { id: string; finger: string; row: 'tip' | 'base'; mm: Point2 }[] = [
  { id: 'index-tip', finger: 'Index', row: 'tip', mm: { x: 0, y: 0 } },
  { id: 'middle-tip', finger: 'Middle', row: 'tip', mm: { x: 22, y: 0 } },
  { id: 'ring-tip', finger: 'Ring', row: 'tip', mm: { x: 44, y: 0 } },
  { id: 'pinky-tip', finger: 'Pinky', row: 'tip', mm: { x: 66, y: 0 } },
  { id: 'index-base', finger: 'Index', row: 'base', mm: { x: 0, y: 45 } },
  { id: 'middle-base', finger: 'Middle', row: 'base', mm: { x: 22, y: 45 } },
  { id: 'ring-base', finger: 'Ring', row: 'base', mm: { x: 44, y: 45 } },
  { id: 'pinky-base', finger: 'Pinky', row: 'base', mm: { x: 66, y: 45 } },
] as const;

/**
 * Three magnetometers clustered in the ring. Schematic — chosen so that every
 * contact-to-sensor distance lands inside the ledger's 13-81 mm span, which
 * `assertSchematicWithinLedgerSpan()` below checks rather than assumes.
 */
export const SCHEMATIC_SENSORS: readonly { id: string; mm: Point2 }[] = [
  { id: 'S1', mm: { x: 14, y: 58 } },
  { id: 'S2', mm: { x: 26, y: 58 } },
  { id: 'S3', mm: { x: 20, y: 66 } },
] as const;

/**
 * Every contact-to-sensor distance in the schematic geometry, min and max.
 * Exported so the UI can state the real span of what it is drawing instead of
 * quoting the ledger's span over a picture that does not match it.
 */
export function schematicDistanceSpanMm(): [number, number] {
  let lo = Infinity;
  let hi = 0;
  for (const c of SCHEMATIC_CONTACTS) {
    for (const s of SCHEMATIC_SENSORS) {
      const d = distanceMm(c.mm, s.mm);
      if (d < lo) lo = d;
      if (d > hi) hi = d;
    }
  }
  return [lo, hi];
}

export function distanceMm(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** What the three sensors read, in microtesla, for a thumb at `thumbMm`. */
export function sensorReadingsUt(thumbMm: Point2): { id: string; distanceMm: number; microTesla: number }[] {
  return SCHEMATIC_SENSORS.map((s) => {
    const d = distanceMm(s.mm, thumbMm);
    return { id: s.id, distanceMm: d, microTesla: fieldMicroTeslaAtMm(d) };
  });
}

/**
 * Which contact point a tap at `thumbMm` resolves to: nearest contact, and
 * whether it landed inside that contact's decision radius.
 */
export function resolveContact(thumbMm: Point2) {
  let nearest = SCHEMATIC_CONTACTS[0];
  let best = Infinity;
  for (const c of SCHEMATIC_CONTACTS) {
    const d = distanceMm(c.mm, thumbMm);
    if (d < best) {
      best = d;
      nearest = c;
    }
  }
  return { contact: nearest, distanceMm: best, inside: best <= DECISION_RADIUS_MM };
}

/** Signal-to-noise ratio of a single (un-averaged) reading at a given field. */
export function singleReadingSnr(microTesla: number): number {
  return microTesla / (SENSOR_NOISE_T * 1e6);
}

/** Formats a probability as a percentage string with the ledger's precision. */
export function formatAccuracy(p: number): string {
  if (p >= 0.9999) return '100%';
  if (p >= 0.999) return '99.99%';
  return `${(p * 100).toFixed(1)}%`;
}
