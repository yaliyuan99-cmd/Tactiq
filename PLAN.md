# Tactiq — project plan, claims ledger and findings register

**The single source of truth** for what this project is, what every number
means, what is still wrong, and what happens next. Both workstreams — the
website and the paper — read this file before doing anything and write back to
it afterwards. Sessions end; this file does not.

**Last updated:** 3 August 2026
**Submission deadline:** AUSSEF, 11 November 2026
**Source bundle:** rev. 4, 2 August 2026 — PRD, research paper *Beyond Screen
Readers*, 9-key typing study, engineering logbook, design portfolio §§1–25.
Not committed; see the de-identification note below.

> **The binding rule.** No number appears on the website or in the paper unless
> it appears in the claims ledger (§5) with a provenance and an evidence status.
> If you need a number that is not here, add it here first, with its source.
> The project has already had to retract three of its own statistics. Do not add
> a fourth.

> **De-identification.** This repository is public and AUSSEF requires
> de-identified submissions. Keep this file free of personal names, school
> names, and account handles. Do not commit the source document bundle — its
> logbook names team members and reserves fields for the school and supervising
> teacher. This file is the distilled, de-identified substitute.

---

## Contents

| § | Section |
| --- | --- |
| 1 | [Evidence status vocabulary](#1-evidence-status-vocabulary) |
| 2 | [The project in one page](#2-the-project-in-one-page) |
| 3 | [Design principles P1–P9](#3-design-principles-p1p9) |
| 4 | [Canonical command map](#4-canonical-command-map) |
| 5 | [Claims ledger](#5-claims-ledger) |
| 6 | [Prototype status](#6-prototype-status) |
| 7 | [Test program](#7-test-program) |
| 8 | [Redesign cycles](#8-redesign-cycles) |
| 9 | [Findings register](#9-findings-register) |
| 10 | [Open questions](#10-open-questions) |
| 11 | [The work plan](#11-the-work-plan) |
| 12 | [Decisions log](#12-decisions-log) |
| 13 | [Working agreements](#13-working-agreements) |

---

## 1. Evidence status vocabulary

Every claim carries exactly one of these. Binding on both tracks, and visible to
the reader on the website.

| Token | Meaning |
| --- | --- |
| `SIMULATED` | A completed computational result from the seeded scripts. Real, reproducible, but not a physical measurement. |
| `MEASURED` | A physical measurement from the bench rig. **Nothing currently holds this status.** |
| `DESIGN INTENT` | A property of the design as specified. Not built, not tested. |
| `TARGET` | A pre-registered acceptance threshold, fixed before testing. |
| `PENDING` | A slot reserved for data that does not exist yet. |
| `CITED` | An external published figure, with source. |
| `COMPUTED` | An analytic result derived from the model, not sampled by simulation. |

The distinction between `SIMULATED` and `TARGET` matters. Collapsing them
**undersells completed work** while simultaneously describing unbuilt features
as though they existed. Both directions are wrong.

The website's `EvidenceStatus` component defines four tokens (`confirmed` /
`simulation` / `target` / `future`). Since W1 no claim carries `confirmed`, and
the reader-facing "How to read the labels" block presents measured (nothing) /
simulation / target / design intent. Extending the component to the full
vocabulary — splitting `DESIGN INTENT` out of `future`, adding `CITED` and
`COMPUTED`, and retiring or redefining `confirmed` — is a W2 task.

---

## 2. The project in one page

**Problem.** Eyes-free *output* is solved and free — screen readers speak the
screen. Eyes-free *input* is not. Voice fails in noise, exposes private
business, and carries measured demographic disparity. Screen-reader gestures are
silent and free but strictly serial. Refreshable braille displays give full
direct control at US$799–US$15,500 and presume braille literacy that most people
who lose sight in adulthood never acquire.

**The reframing.** The binding constraint is not eyes-free operation, which is
common, but **discrimination precision**: how many anatomically distinct
contacts a low-power worn sensor package can tell apart at a trustworthy error
rate. What precision buys is **access cost** — fewer steps, less attention, less
social exposure — explicitly *not* navigation speed.

**The system.** One ring on the index finger plus a passive magnet worn flat on
the thumb. Squeeze the ring body to open a bounded command window; tap one of
eight contacts (tips and bases of the four fingers); a haptic class confirms.
Nine commands on eight points. Command tokens travel over BLE to an Android
AccessibilityService or, on iOS, as an HID keyboard emitting VoiceOver commands.
No text entry, no delete cluster, no field-clear: explicit non-goals.

**The physics.** Constrain the geometry so the magnet's moment is vertical and
everything is coplanar. Every sensor then sits in the equatorial plane, the
angular factor √(1+3cos²θ) collapses to exactly 1, and |B| = k/r³. Without that
constraint, field magnitude varies twofold with orientation alone. This single
mechanical constraint is what lets three scalar readings replace a
nine-component vector fit — and it is the intellectual core of the project.

**Where it stands.** Design and simulation complete and strong. **No wearable
ring exists. No bench data exist.** The bench rig's parts list was finalised
28 July 2026; construction is scheduled from early August 2026 and has not been
confirmed as started (Q2). Bench experiment August–October 2026; AUSSEF
submission 11 November 2026.

**The headline strategic finding.** The project is substantially stronger than
the website makes it look, on precisely the criteria AUSSEF weights most.
Criteria 2, 6, 7, 8 and 9 — measurable design criteria, reliability and
false-trigger analysis, evidence justifying modifications, redesign and retest,
limitations — are all well evidenced in the source documents and were largely
absent from the site.

---

## 3. Design principles P1–P9

Binding constraints. Any feature violating one requires a documented exception
decision.

| ID | Principle |
| --- | --- |
| P1 | Augment the screen reader, never replace it |
| P2 | Commands live at fixed positions found by proprioception |
| P3 | Tactile output for frequent low-density feedback |
| P4 | Respect the tactile channel's limit of a few distinguishable classes |
| P5 | Critical actions operable one-handed |
| P6 | Separate high-consequence actions in gesture space; duration, not confirmation, under stress |
| P7 | Bound the consequence of error, not just its rate |
| P8 | Affordability argued at system level |
| P9 | Explicit activation gating; a worn device is idle until deliberately woken |

---

## 4. Canonical command map

Authoritative. `src/lib/gestures.ts` is the single implementation of this table;
every page and dashboard surface reads from it, so the map cannot drift between
surfaces.

| Contact | Command | Class |
| --- | --- | --- |
| Index tip, brief tap | Confirm | Fixed |
| Index base, brief tap | Dismiss / Back | Fixed |
| Middle tip, brief tap | Undo | Fixed |
| Middle base, brief tap | Next | Fixed |
| Ring tip, brief tap | Read / Repeat | Fixed |
| Ring base, brief tap | Previous | Fixed |
| **Pinky tip, brief tap** | **Quick action 1** | Custom |
| **Pinky base, brief tap** | **Quick action 2** | Custom |
| Pinky tip, 5 s sustained hold | Emergency | Fixed |

Wake is a squeeze of the ring body, not a contact location. The pinky tip is the
only shared point, separated by **duration**, never by tap count (P6).

> **Easy to get wrong:** Quick action 1 is on the **tip** (sharing the point
> with Emergency); Quick action 2 is on the **base**. The site had these
> reversed until 3 August 2026 (F-2).

---

## 5. Claims ledger

### 5.1 Bench scale — 30 cm equilateral triangle, D82 magnet (m = 0.419 A·m²), σ_B = 0.20 µT

| Quantity | Value | Status | Provenance |
| --- | --- | --- | --- |
| Centroid DRMS | 1.65 mm | `SIMULATED` | sim_bench.py seed 20260720, 40,000 trials |
| Simulation-to-CRLB ratio at centroid | 1.0013 | `SIMULATED` | same |
| Interior spatial median (748 cells) | 4.6 mm | `SIMULATED` | same |
| Interior below 5 mm / below 10 mm | 55% / 97.5% | `SIMULATED` | same — **"interior", not "workspace"** |
| Worst interior cell / p90 | 11.6 mm / 8.5 mm | `SIMULATED` | same |
| Realistic error budget | ≈2.1 mm centroid, ≈4.4 mm off-centre | `SIMULATED` | Table 7 quadrature |
| — if gains left uncalibrated (±5%) | ≈3.3 mm / ≈4.5 mm | `SIMULATED` | Table 7 |
| — if tilt uncontrolled (10–30°) | 1.3–9.6 mm / 2.7–19.3 mm | `SIMULATED` | Table 7 |
| Tilt bias off-centre, worst azimuth | 0.69 / 2.7 / 10.0 / 19.3 mm at 5/10/20/30° | `SIMULATED` | Fig. 4, weighted estimator |
| Tilt crossover (bias exceeds random error) | φ ≈ 11–12° | `SIMULATED` | §11.2 |
| Cell-by-cell validation ratio | median 1.02; 90% of cells 0.95–1.27 | `SIMULATED` | 2,044 cells with all-sensor SNR ≥ 5 |
| Inverse-crime closure (exact field vs dipole) | 0.000 mm centroid / 0.138 mm off-centre | `SIMULATED` | surface-charge quadrature; on-axis check 5×10⁻¹⁴ |
| Front-end realism agreement | 0.1–0.3% | `SIMULATED` | full Sydney IGRF vector, 100-sample baselines |
| Out-of-plane bias at h = 5/10/20 mm | 0.12 / 1.9 / 29.5 µm | `SIMULATED` | fourth-order cancellation, App. A.5 |
| Saturation radii (±200 / ±800 µT) | 5.9 cm / 3.7 cm | `COMPUTED` | §8.2 |
| Workable annulus | ≈4–28 cm | `COMPUTED` | §11.1 |
| Single-reading SNR = 10 envelope | closes at 27.6 cm | `COMPUTED` | §8.4 |

> ⚠ **These are bench-scale figures on a 30 cm array. They must never be paired
> with hand-scale contact spacing.** Doing so was the site's flagship error
> (F-3), now fixed.

### 5.2 Hand scale — 22 × 45 mm modelled grid, D21 magnet (m = 0.0131 A·m²), 11 mm half-spacing

| Quantity | Value | Status | Provenance |
| --- | --- | --- | --- |
| Minimum pairwise field separation | 50σ clustered / 88σ distributed | `SIMULATED` | dwell-averaged; field-space Mahalanobis |
| Worst-contact CRLB (noise only) | 1.7 mm clustered / 5.5 mm distributed | `SIMULATED` | Fig. 6 |
| **Half-spacing decision radius** | **11 mm** | `DESIGN INTENT` | modelled grid |
| C2 noise only, dwell average | 100% / 100% both layouts | `SIMULATED` | Table 5 |
| C4 calibrated rig (tilt 10°, gain 1%) | clustered 100%/100%; distributed 99.5%/96.7% | `SIMULATED` | Table 5 |
| C5 uncalibrated gains ±5% | ≈100%/99.99%; ≈100%/99.97% | `SIMULATED` | Table 5 |
| **C6 worn (σ_tap = 4 mm, ring shift 2 mm)** | **clustered 90.5% mean / 86.0% worst; distributed 94.8% / 86.0%** | `SIMULATED` | Table 5 |
| C7 worn pessimistic (σ_tap = 6 mm, tilt 15°) | clustered 84.9%/80.3%; distributed 88.7%/78.6% | `SIMULATED` | Table 5 |
| Route B (field templates) under C6 | collapses to 40% worst contact | `SIMULATED` | §7.3 — the "wrong noise model" finding |
| Route C (Gaussian discriminant) under C6 | 88.3% worst | `SIMULATED` | §7.3 |
| Magnet sizing window, clustered | m ∈ [0.0024, 0.0179] A·m² | `COMPUTED` | App. A.7 |
| Magnet sizing window, distributed | m ∈ [0.0083, 0.0270] A·m² | `COMPUTED` | App. A.7 |
| Peak fields / weakest averaged SNR | 586 µT, SNR 54 (clustered); 388 µT, SNR 16 (distributed) | `SIMULATED` | §11.3 |
| Contact–sensor distance span | 13–81 mm clustered; 15–123 mm distributed | `COMPUTED` | §8.4 |

> **The headline scientific finding.** Sensor noise leaves orders of magnitude
> of margin. Per-contact accuracy is decided by **thumb-placement scatter σ_tap,
> which has never been measured.** σ_tap ≤ 3 mm → every contact clears 95%.
> σ_tap ≥ 5 mm → the grid needs redesign, not the physics.
>
> The honest headline is therefore **not** "≈2 mm against 20–25 mm targets". It
> is: *sensor noise is not the constraint; thumb aim is, and it is unmeasured.*

### 5.3 Capacity

| Quantity | Value | Status |
| --- | --- | --- |
| Noiseless ceiling, 9 commands | log₂9 = 3.17 bits | `COMPUTED` |
| Delivered bits at N = 8, worn (C6) | 2.71 bits | `SIMULATED` |
| N = 8 → 16 under worn conditions | +0.31 bits (2.71 → 3.02) | `SIMULATED` |
| Worst-command accuracy, N = 8 / 10 / 16 at σ_tap 4 mm | 87% / 65% / 50% | `SIMULATED` |
| N = 16 under jig precision | 3.87 bits | `SIMULATED` |
| 9 commands, one pair confused at 10% | 3.066 bits (96.7% of ceiling) | `COMPUTED` |
| 16 commands, 8 pairs at 30% | 3.119 bits — **above** the 9-command figure | `COMPUTED` |
| 16 commands, 8 pairs at 35% | 3.066 bits — break-even | `COMPUTED` |
| 16 commands, 10% to each of 3 neighbours | 2.643 bits | `COMPUTED` |

> A previous draft claimed the 16-command/30% example fell *below* the
> 9-command figure. That was an arithmetic error, since corrected. The surviving
> claim is narrower: dense vocabularies **can** deliver less, but it depends on
> error *structure* — multi-way errors are the killer, not pairwise ones.

### 5.4 Vector-fit control arm (H4)

| Quantity | Value | Status |
| --- | --- | --- |
| CRLB equality at operating point | 1.6524112 vs 1.6524106 mm | `SIMULATED` |
| Paired bench probes, scalar vs vector | 1.643/5.926/3.765 vs 1.645/5.964/3.780 mm | `SIMULATED` |
| Tilt 10°, off-centre, worst azimuth | scalar 4.73 mm vs vector 3.38 mm | `SIMULATED` |
| Tilt 20° | scalar 10.68 mm vs vector 2.66 mm | `SIMULATED` |
| Mounting-misalignment crossover | ε ≈ 4° | `SIMULATED` |
| Hand scale, clustered (deployment geometry) | mean 90.2 vs 90.4%; worst 86.5 vs 87.8%; Δ = +0.2 pp; discordance 2.7% | `SIMULATED` |
| Hand scale, distributed | worst 84.2 vs 94.7% | `SIMULATED` |
| Non-inferiority margin | 3 pp (exact McNemar upper 95% bound) | `TARGET` |

### 5.5 Estimator comparison (DRMS mm, 20,000 trials/point)

| Point | CRLB | Weighted GN | Field-domain NLS | Unweighted GN | Linear start only |
| --- | --- | --- | --- | --- | --- |
| Centroid | 1.652 | 1.646 | 1.648 | 1.651 | 1.651 |
| (0, 10) cm | 5.896 | 5.987 | 5.973 | 6.602 | 6.906 |
| (6, −4) cm | 3.733 | 3.741 | 3.749 | 4.212 | 4.350 |

### 5.6 Statistical design

| Quantity | Value | Status |
| --- | --- | --- |
| Taps per contact (adopted) | 200; pass at ≤ 4 errors | `TARGET` |
| Power at true 99% / 98% | 0.95 / 0.63 | `COMPUTED` |
| Total discrimination taps | 1,600 (≈1.5–2 h) | `TARGET` |
| n = 20 one-sided 95% lower bound at 20/20 | 0.861 — demonstrating ≥95% impossible | `COMPUTED` |
| Naive n = 20 rule, false-pass at true 90% | 39% | `COMPUTED` |
| Rule of three: idle wear for ≤1 false activation/h | 3.0 h at 0 events; 4.7 h at 1; 6.3 h at 2 | `COMPUTED` |
| Predicted discordant pairs / paired SE | ≈43 / ≈0.4 pp | `SIMULATED` |
| Primary criterion | worst contact (conservative under 8 comparisons) | `TARGET` |

### 5.7 Gate and error propagation

| Quantity | Value | Status |
| --- | --- | --- |
| τ* at α/β = 5 / 15 / 30 s | 220 / 308 / 363 ms | `SIMULATED` (f₀ = 30/h, τ₀ = 80 ms, λ = 120/h) |
| τ* range across f₀ = 10–100/h | 132–460 ms | `SIMULATED` |
| Current placeholder | 150 ms (implies α/β ≈ 2.6 s) | `DESIGN INTENT` |
| Likely shipped value | 200–350 ms | `SIMULATED` |
| Unrecovered error U at p_c = 0.95, p_u = 0.90 | 0.0048 ≈ 1 in 210 commands | `COMPUTED` — best case; undo coverage is app-dependent |

### 5.8 Design criteria C1–C8

| # | Criterion | Min acceptable | Ideal | Current status |
| --- | --- | --- | --- | --- |
| C1 | Per-contact discrimination | ≥95% per contact (≤4 errors in 200) | ≥98% | **Not yet achieved (untested).** Simulation 86–100% depending on σ_tap |
| C2 | False activations | ≤1 per hour | 0 events in ≥3 h | **Not yet achieved (untested)** |
| C3 | Localisation accuracy | centroid ≤2.5 mm; interior median ≤6 mm | centroid ≤2.0 mm | **Partially achieved (simulation only)** — 1.65 / 4.6 mm |
| C4 | Speed of access | ≤1.0 s | ≈0.5 s | **Not achieved — no integrated prototype** |
| C5 | One-handed operation | all 9 commands | all 9 | **Achieved by construction** |
| C6 | No sight or braille required | no step requires either | voice-guided end to end | **Partially achieved** — true of the design, untested with users |
| C7 | Component cost | ≤A$60 | ≈A$40 | **Achieved pending receipts** |
| C8 | Non-inferiority to vector fit | within 3 pp | statistically indistinguishable | **Partially achieved (simulation only)** — Δ = 0.2 pp |

### 5.9 Cost

| Quantity | Value | Status |
| --- | --- | --- |
| Bench BOM | ≈A$40 planned | `TARGET` — **receipts PENDING** |
| Bench BOM criterion (C7) | ≤A$60 | `TARGET` |
| Product retail | order of magnitude below mainstream braille displays | `DESIGN INTENT` — no cost model published |

### 5.10 External cited figures

| Claim | Value | Source |
| --- | --- | --- |
| Mobile screen-reader use | 91.3% of n = 1,539 | WebAIM Survey #10 |
| Braille output use | 38% | WebAIM Survey #10 |
| Global vision impairment | ≥2.2 billion near or distance | WHO fact sheet |
| Mainstream displacing dedicated devices | 87.4% of 466 | Martiniello et al. |
| AU smartphone-use rise | 365% over five years, n = 845 | Locke et al. |
| Voice WER disparity | 0.35 Black vs 0.19 white speakers, 5 commercial systems | ref [6] |
| Voice on **dysarthric** speech | 50–60% across Siri / Google Assistant / Alexa | ref [7] |
| Unadapted SOTA on disordered speech | ≈50% WER read, ≈71% conversational (2024) | ref [8] |
| Braille display price range | **US$**799 (Orbit Reader 20) – US$15,500 (APH Monarch) | refs [9], [10] |
| Mainstream 20–40 cell cluster | **US$**2,000–3,800 | refs [11], [12] |
| Braille literacy "sub-10%" | a **2009 NFB estimate**; a 2022 review found no valid current measurement | refs [13], [14] |
| Apple AssistiveTouch | 4 gestures | ref [15] |
| EFRing | 9 gestures, 89.5% within-user / 85.2% cross-user | ref [17] |
| Meta sEMG wristband | 9 gestures >90% on unseen users, **trained on thousands of participants** | ref [18] |
| STMG | 7 gestures, 95.1%; FP/hour methodology | ref [19] |
| DigiTouch | 16 WPM; pressure 93.3% (2 levels) → 64.0% (3 levels) | ref [20] |
| DigitSpace | 16 on-finger buttons discriminated eyes-free | ref [21] |
| picoRing | 99.7% press detection at good SNR | ref [22] |
| Slide Rule | 10 blind participants; faster than buttons; 0.20 vs 0 errors/trial | ref [5] |
| uTrack / Finexus / AuraRing | 4.84 mm / 1.33 mm / 4.4 mm at 2.3 mW | refs [24]–[26] |
| Pham & Aziz / Hall arrays / Qiu et al. | ≈5 mm / 1.3–10 mm / ≈±1 mm | refs [34]–[43] |
| Sydney geomagnetic field (IGRF-14) | 57.0 µT total; declination +12.8°; inclination −64.4° | ref [67] |
| Sensor noise floors | QMC5883L 0.20 µT; HMC5883L 0.2; LIS3MDL 0.32; RM3100 ≈0.015 | refs [63]–[66] |
| MCU gesture-classifier energy | 95.5% at <2.74 mJ/gesture | ref [51] |
| Pocket-retrieval baseline | 4.5–11 s | PRD G3 |

---

## 6. Prototype status

**Read this before writing anything about hardware.**

| Prototype | What it is | Status |
| --- | --- | --- |
| A | 17-part REST API specification | Complete (May 2026). **Assumes the abandoned two-ring architecture; awaits reconciliation** |
| B | Simulation stack, 5 seeded scripts, revisions 1–3 | Complete (July 2026) |
| C | Public concept website | Rebuilt 27 July 2026 after failing its own no-JS audit; redesigned 3 August 2026 |
| D | **Bench rig (physical)** | **Parts list finalised 28 July 2026. NOT ASSEMBLED as of that date. Construction from early August 2026.** Firmware under construction |

**Bench rig specification:** 3 × QMC5883L modules at the vertices of a 30 cm
equilateral triangle on a 3D-printed non-ferrous jig; printed calibration grid
(≤0.5 mm ground truth); D82 magnet moment-vertical on a plastic slider; D21
magnet for hand-scale trials; ESP32 sampling all three sensors over I²C at up to
200 Hz, logging CSV over USB. ≈A$40.

> **No wearable ring prototype exists.** Any description of ring behaviour,
> haptics, voice-guided setup, or screen-reader integration is `DESIGN INTENT`
> and must be written as such.

---

## 7. Test program

| Test | What | Status |
| --- | --- | --- |
| T1 | Simulation verification and validation | **Complete** |
| T2 | Website accessibility audit | **Complete — failed, rebuilt, passed.** Needs re-running against the React build (see W2) |
| T3 | Localisation map (≥9 interior positions × 30 repeats) | `PENDING` |
| T3b | Tilt sweep 0°/10°/20° with printed wedges | `PENDING` |
| T3c | Dipole residual at 7.6 cm | `PENDING` |
| T4 | **σ_tap at 3 felt landmarks, 200 aimed taps each** — the highest-value datum in the whole project | `PENDING` |
| T5 | Discrimination, 200 taps × 8 contacts | `PENDING` |
| T6 | False-activation wear, ≥3.0 h instrumented | `PENDING` |
| T7 | Vector-fit control arm (offline, zero extra bench hours) | `PENDING` |
| T8 | Gate sweep at 100/150/250/500 ms | `PENDING` |

**Named controls:** magnet-absent baselines are the blank control; the ≥3 h
idle-wear run is the system-level negative control.

---

## 8. Redesign cycles

The design-process evidence. AUSSEF criteria 7 and 8 are scored on exactly this.

| # | Date | Problem → modification → outcome |
| --- | --- | --- |
| 1 | 21 Jul 2026 | v1 claimed 60+ gestures → capacity computation showed 8→16 adds +0.31 bits while worst-command accuracy collapses 87%→50% → **single ring, 8 contacts, 9 commands** |
| 2 | 21 Jul 2026 | Wake gesture disagreed across documents; press-and-hold collided with index-tip Confirm → **squeeze standardised**; τ* derived |
| 3 | 21 Jul 2026 | Pinky delete cluster (1/2/3 taps = char/word/field) violated the project's own no-destructive-gestures principle → **removed entirely** |
| 4 | 20 Jul 2026 | Simulation rev 1 too idealised, risked the inverse crime → **realistic front end, exact-field truth data**; validation claim honestly weakened |
| 5 | — | Single-programmer risk → **independent from-scratch re-implementation**; reproduced 25 values, **found two real errors** |
| 6 | — | 20-tap protocol could not support its own criteria → **200 taps, exact-binomial pass rule, rule of three** |
| 7 | 27 Jul 2026 | JS-only site served an empty page without JavaScript → **static zero-JS rebuild** → retested, passed |
| 8 | 20 Jul 2026 | Three of the project's own statistics failed verification → **corrected**; "targets, not results" language policy adopted |

**Scope cut with evidence:** the 9-key typing study was researched and then used
to justify **removing text entry** from scope (portfolio §6.3) — the layer
augments a screen reader rather than competing with it.

Cycle 1 is now told interactively on the site (`ConceptV1Demo`), which is
unusually strong criteria 7–8 material. Cycles 2–8 are not yet represented.

---

## 9. Findings register

Findings from the 3 August 2026 audit, re-verified against the live React app
and updated after the W1 correctness pass.

### 9.1 Closed

**F-3, F-4, F-5, F-6, F-8, F-10, F-11, F-12, F-22, F-23, F-24, F-26, F-32 and
F-33** were closed by the W1 correctness pass on 3 August 2026. **F-2 and F-9**
were closed by W1 plus a follow-up sweep the same day, after verification found
the first pass had missed rendered surfaces. **F-7** was closed earlier the same
day in the re-verification pass, before W1 ran. **F-28** was resolved by
answering Q9. **F-30 and F-31 were not fixed** — they were withdrawn as
incorrect findings, and F-31 leaves the residual F-31r, open in §9.2.

| ID | Finding | Closed how |
| --- | --- | --- |
| F-2 | Quick actions swapped relative to paper and portfolio | Shortcut 1 moved to the pinky **tip** (sharing the point with Emergency), Shortcut 2 to the **base**, in `src/lib/gestures.ts`. **The first pass missed two rendered surfaces** that hard-coded the old order — `HandMap.tsx` (the accessible list alternative, live on `/` and `/how-it-works`) and `HistoryPage.tsx`. Both now derive the label from a new `shortcutNameFor()` helper instead of hard-coding it, so the numbering cannot be reversed at a call site again |
| F-3 | Headline paired a bench-scale error with hand-scale spacing | Every pairing removed. The site now states the hand-scale comparison: worst contact 1.7 mm from noise alone, inside an 11 mm decision radius |
| F-4 | Bench BOM given as "under $60", no currency, tagged as a *confirmed fact* | No claim is tagged `confirmed` any more — only the TypeScript union type and CSS token names retain the word. Reads "≈A$40 planned against a ≤A$60 design criterion, receipts pending" in `Prototype`, `FollowForm` (body and evidence label), `FaqSection` and `Timeline` — on the canonical site. `/showcase` still says "under $60"; see F-34 |
| F-5 | Braille prices unmarked as USD; US$2,000–3,800 cluster omitted | Marked **US$**799–US$15,500 and the cluster added — on the canonical site. `/showcase` still carries the unmarked figures and omits the cluster; see F-34 |
| F-6 | Voice figures flattened into one claim | Split into three sourced findings — noise/exposure, the 0.35-vs-0.19 demographic disparity, and dysarthric/disordered-speech rates with read vs conversational distinguished |
| F-7 | "97% of the workspace" should be "97.5% of the interior" | Claim no longer appears anywhere |
| F-8 | Meta sEMG count cited without its caveat | Now carries "trained on thousands of participants, a scale no student project can match" |
| F-9 | Present-tense descriptions of a device that does not exist | Rewritten as design intent in `Hero`, `Prototype` parts, all of `FaqSection`, and `gestures.ts`. **The first pass missed** the five-step `Sequence.tsx` "How it works" block — including a vibration-pattern claim that `gestures.ts` itself documents as never built — plus `Scenarios.tsx` and the `index.html` meta/og/twitter descriptions. All now hedged. "No wearable ring exists" appears verbatim in `Prototype`, `Timeline`, `Research` and `SiteFooter`, with a variant in `FaqSection` |
| F-10 | Modelled grid and spacing presented as measured fact | Labelled as modelled, with F-3 |
| F-11 | Only the flattering half of the simulation was shown | The C6 worn result is on the site: 86% worst contact against a 95% criterion, σ_tap named as never measured, and the 3 mm / 5 mm branch stated |
| F-12 | Disclaimer collapsed `SIMULATED` and `TARGET` | Footer rewritten, plus a "How to read the labels" block distinguishing measured (nothing) / simulation / target / design intent |
| F-22 | Status note not true on the day it is read | Timeline stage now "Bench-rig construction · from early Aug 2026", with the 28 July parts-list date |
| F-23 | "Full papers available on request", no mechanism | Replaced with a real contact address and an honest not-yet-published statement |
| F-24 | The equatorial constraint — the reason the method works — never explained | Now explained in the research section |
| F-26 | CRLB efficiency reduced to a half-clause | Stated at full strength, with the information-completeness corollary |
| F-30 | Alleged: a working device dashboard for a device that does not exist | **Withdrawn.** The dashboard is scrupulously honest — "No ring paired", "Physical rings do not exist outside the bench yet", history labelled sample data, pairing previews explicitly labelled, and `DevicePage` never fakes a successful connection. This is an asset |
| F-31 | Alleged: the restored 60-gesture demo reads as a current feature | **Substantially withdrawn.** Framed correctly as "Concept v1 · 2025 · superseded — interactive archive", and every point's accessible name ends "Concept v1, superseded". Residual noted below |
| F-32 | "targets barely 8 mm apart" had no ledger row | Unsourced figure removed |
| F-33 | Timeline said bench hardware was "built" while §6 records it as not assembled | Corrected. A follow-up sweep also removed the softer replacements ("assembly under way", "the rig is being built now"), which asserted progress the project cannot evidence while Q2 is open. Both now read "scheduled from early August 2026" |
| F-28 | The deploy target changed — `netlify.toml` publishes `dist/` from `npm run build`, so the React app is live and `site/` is not | Resolved 3 Aug 2026 with Q9: the React app is the AUSSEF artifact. See §12 |

### 9.2 Open

| ID | Finding | Where | Blocks / notes |
| --- | --- | --- | --- |
| **F-27** | **De-identification: the site footer links to a URL containing the repo owner's personal account handle, on every page of the live site** | `src/app/components/SiteFooter.tsx` | **Highest priority — live now.** AUSSEF requires de-identified submissions. Remove the link immediately; the choice between deleting it outright and repointing it at a neutral destination does not block removal |
| F-1 | Paper titles — *Beyond Screen Readers* is attached to the design study, but in the source it is the physics/engineering paper | `src/app/home/Research.tsx` | **Blocked on Q1.** The React app currently says only "Tactiq paper 1 / paper 2", so nothing is *wrong*; the titles are simply missing |
| F-13 | PRD §6.1/§6.3 specify flex + pressure + IMU sensing; the paper and portfolio select magnetic trilateration | source bundle | **Blocked on Q6.** Paper track, first task |
| F-14 | Superseded two-ring summary still in the repo, carrying every retracted claim | `src/imports/pasted_text/tactiq-project-summary.md` | Delete or quarantine |
| F-15 | Commerce routes for a device that does not exist | `src/app/checkout/`, `src/app/admin/` | **Blocked on Q7.** Narrowed — the dashboard is exonerated |
| F-16 | No full prototype page — AUSSEF criteria 3, 4, 5, 6, 8 under-represented | `/prototype` | **Partially closed.** Page exists with parts and evidence labels. Still missing: bench-rig spec, BOM, jig and firmware status, an explicit "no wearable ring exists", photo slots |
| F-17 | No redesign/retest record — AUSSEF criteria 7, 8 | `DesignEvolution.tsx` | **Partially closed.** Cycle 1 told interactively; cycles 2–8 absent |
| F-18 | No design-criteria table; C1–C8 absent from the site | — | W2 |
| F-19 | Route B collapse, clustered-vs-distributed, and the vector control arm all absent | — | W2 |
| F-20 | No reproducibility statement (five seeded scripts, deterministic regeneration) | — | W2 |
| F-21 | No AI-use disclosure, which ISEF/AUSSEF require and the paper carries | — | W2 |
| F-25 | The 50–88σ separation is not on the site at all — and when added it must state what it is a separation *of* (minimum pairwise field separation, dwell-averaged, field-space Mahalanobis; §5.2) | — | W2 — best placed on the testing page. Printing a bare number reintroduces the original defect |
| F-29 | `README.md` still claims `site/` is what Netlify publishes — false since commit `9a0ca12` | `README.md` | W4 |
| F-31r | Residual of F-31: the empty-state heading "Type with the 9-grid keypad" is a present-tense imperative, and the v1 stats block (9 / 26 / 1–4) reads like current product stats | `src/app/home/ConceptV1Demo.tsx` | Low priority |
| **F-35** | **The hand map's semantic-list alternative does not render without JavaScript.** `HandMap.tsx` gates it behind `useState(false)`, so with JS off the eight-point command map exists only as an SVG with no list equivalent — the word "Shortcut" appears nowhere in the prerendered HTML of `/` or `/how-it-works`. The file's own docstring names this list as the accessible path. This is the same failure class as redesign cycle 7 | `src/app/home/HandMap.tsx:84,121` | **OPEN — high priority.** Render the list unconditionally inside a `<details>`, or emit both and toggle with CSS. Add it to the W2 no-JS build guard |
| **F-34** | The `/showcase` archive still carries pre-W1 claims — "under $60", unmarked "$799 to $15,500". It is linked from every page footer, so it is live, and it was not part of the W1 sweep | `src/app/showcase/TactiqIntro.tsx` | Tied to Q7 — fix its numbers or drop the footer link |

---

## 10. Open questions

| # | Question | Blocks |
| --- | --- | --- |
| ~~Q9~~ | ~~Which site is the AUSSEF artifact?~~ | **ANSWERED 3 Aug 2026 — the React app.** See §12 |
| Q1 | Which title belongs to which study? Is *Beyond Screen Readers* the physics paper, the design study, or both? | F-1, the research page, the paper track |
| Q2 | Has the bench rig been assembled since 28 July? Any photographs? | Prototype page, F-16, W3 |
| Q3 | Confirmed BOM total and receipts? | C7; §5.9 "receipts PENDING" |
| Q4 | School review-board status? | Participation/recruitment content |
| Q5 | Does AUSSEF permit citing a live URL in a de-identified submission? | F-27, and whether the site is submitted at all |
| Q6 | Should the PRD be revised to the magnetic sensing route, or does it deliberately keep flex/pressure as primary with magnetic as the tested candidate? | F-13 |
| Q7 | Is the commerce surface (`checkout/`, `admin/`, `/showcase`) to be kept, archived, or deleted? | F-14, F-15, F-34 |
| Q8 | The second team member's actual role, for the logbook and acknowledgements | Logbook only, not the site |

---

## 11. The work plan

Two parallel tracks. They share one dependency: the **claims ledger** (§5).
Track P owns it — it defines the numbers. Track W consumes it — it quotes them.
Neither track invents a figure.

### Timeline

| Period | Milestone |
| --- | --- |
| Now – mid Aug 2026 | Bench rig assembly; W1 residuals (F-1) closed; P1 complete |
| Aug – Oct 2026 | Bench experiment T3–T8; results fill the `PENDING` slots |
| Oct – early Nov 2026 | Analysis, W3 and P3, final consistency pass |
| **11 Nov 2026** | **AUSSEF submission** |
| 2027 | Possible ISEF pathway |

**The structural constraint.** AUSSEF criteria 3, 4, 5, 6 and 8 — functional
prototype, testing under multiple conditions, quantitative data, false-trigger
analysis, redesign-and-retest — **cannot be satisfied by any amount of writing
until the bench experiment runs.** Both tracks therefore build the containers
now, with visibly empty, pre-registered result slots, and fill them in October.
A judge reading "this cell is empty because the experiment has not run, and here
is the criterion it must meet" gets a far better impression than a document that
quietly omits the gap.

### Track W — the website

**Scope: the React app in `src/`.** Settled 3 August 2026 (Q9). The static
`site/` directory is no longer deployed and should be archived or deleted.

**Guardrails:** content readable with JavaScript disabled, AAA body contrast,
Atkinson Hyperlegible, text alternative for every graphic, no trackers, no
cookie banners, recruitment gated on written approval. *(The typeface guardrail
is carried over from `WEBSITE-ROADMAP.md` and is not currently implemented
anywhere in `src/` — reinstating it is a W2 task.)*

#### W1 — Correctness pass ◐ mostly complete, 3 August 2026

Closed F-2, F-3, F-4, F-5, F-6, F-8, F-9, F-10, F-11, F-12, F-22, F-23, F-24,
F-26, F-32, F-33 — sixteen findings. See §9.1.

F-2 and F-9 needed a second sweep: the first pass fixed the canonical source but
missed rendered surfaces that hard-coded the old values. Adversarial
verification caught both. The lesson is recorded as working agreement 9.

Verified after the edits: `npm run build` clean (typecheck + client build + SSR
build + prerender of 15 routes); no-JS property intact.

Remaining in W1: **F-1**, blocked on Q1.

#### W2 — Structural pass (new pages)

Where the AUSSEF criteria gaps get fixed. Closes F-16 … F-21, F-25.

**Existing routes — extend these rather than adding parallel pages:**
`/`, `/how-it-works`, `/prototype`, `/research`, `/status`, `/faq`, `/help`.
Prerendered text at the 3 August baseline: 13,548 characters on `/`, 6,345 on
`/research`, 3,227 on `/prototype`.

| Page | Contents | Closes |
| --- | --- | --- |
| Criteria | Full C1–C8 table: criterion, rationale, measured-by, min acceptable, ideal, current status, evidence | F-18 |
| Prototype (extend) | Prototypes A–D; bench rig spec, parts, jig, firmware status; explicit "no wearable ring exists"; photo slots | F-16 |
| Testing | T1–T8, the power-analysis story (20 → 200 taps), named blank controls, rule of three, the 50–88σ separation | F-19, F-25 |
| Redesign | The eight cycles as problem → evidence → alternatives → modification → retest → outcome | F-17 |
| Limitations | The ten limitations, known failure conditions, future work in priority order | — |
| About | Reproducibility (five seeded scripts), AI-use disclosure, full source list | F-20, F-21 |

Also in W2:

- [ ] Add the design alternatives: two-rings-vs-one, the four-route sensing
      decision matrix, clustered vs distributed, Routes A/B/C and the
      "optimising against the wrong noise model" finding (F-19)
- [ ] Add the vector-fit control arm and what it establishes (F-19)
- [ ] Extend `EvidenceStatus` from four tokens to the full §1 vocabulary —
      split `DESIGN INTENT` out of `future`, add `CITED` and `COMPUTED`, retire
      or redefine the now-unused `confirmed`
- [ ] Reinstate the Atkinson Hyperlegible typeface guardrail, currently
      unimplemented
- [ ] **Add a build-time no-JS guard.** The zero-JS guarantee is now a property
      nothing enforces. Fail the build if any prerendered route falls below a
      text-content floor or contains `opacity:0`
- [ ] **Re-run the T2 accessibility audit against built `dist/`**, not the dev
      server, and record it as a redesign-cycle-7 retest
- [ ] Update sitemap and navigation for the new pages

**Definition of done:** Lighthouse accessibility 100, axe-core zero critical,
full keyboard pass, no horizontal scroll at 320–390 px, W3C-clean, readable with
CSS disabled, readable with JavaScript disabled.

#### W3 — Results pass (after the bench experiment)

- [ ] Fill the `PENDING` slots with measured data — pass **or fail**, reported plainly
- [ ] Update the C1–C8 status column
- [ ] Add bench-rig photographs and construction evidence
- [ ] Add the σ_tap result and what it decided
- [ ] Failed criteria stay visible, with what changed as a result

#### W4 — Repository hygiene (F-14, F-15, F-34 blocked on Q7; F-27 and F-29 are not)

- [ ] **Fix F-27** — the account handle in the footer. Not blocked on anything
- [ ] Delete or quarantine `src/imports/pasted_text/tactiq-project-summary.md` (F-14)
- [ ] Decide the fate of `checkout/`, `admin/` and `/showcase` (F-15, F-34)
- [ ] Update `README.md` to describe one canonical site (F-29)
- [ ] Archive or delete the unused static `site/` directory
- [ ] Full de-identification check before any URL is cited in the submission

### Track P — the paper

**Not blocked.** Working format is markdown in this repo under `paper/`, one
file per section. The source Doc stays as the drafting scratchpad; **the repo
becomes the source of truth** — that ordering is what P1 reconciles against.

**Why not the source Doc:** paper §15 records that AUSSEF **prohibits Google
Docs links** and requires de-identified PDFs. Versioned markdown also gives git
history as design-portfolio evidence and puts the text next to the seeded
scripts.

#### P1 — Reconcile the bundle

- [ ] **Resolve the sensing-route contradiction (F-13).** The PRD specifies
      flex + pressure + IMU; the paper and portfolio select magnetic
      trilateration with flex/pressure as documented fallbacks. Blocked on Q6
- [ ] **Close PRD §14's own action item** — replace the superseded two-ring
      Tab 2 summary with the reconciled single-ring version
- [ ] Reconcile the Meta gesture count between the paper (9) and portfolio
      Table 3 (~6)
- [ ] Resolve the paper-title question (Q1) and apply it consistently across the
      paper, portfolio, logbook and site
- [ ] Verify every ledger row against its cited source

#### P2 — Submission artifacts

- [ ] **The student authors all submitted artifacts personally.** ISEF 2027
      rules permit AI as a project resource but prohibit it authoring the
      research plan, official abstract, or poster. Repository drafts are source
      material, not submissions
- [ ] Official abstract ≤250 words, **written after experimentation**
- [ ] Design portfolio evidencing progression — revision log, seeded scripts,
      figure regeneration, bench photographs
- [ ] Figures 1–9 regenerated from the scripts for the poster
- [ ] AI-disclosure paperwork (ISEF Form 2A); Form 3 risk assessment recommended
- [ ] Full de-identification pass — no author, school, or supervising teacher
- [ ] Logbook completion: early fortnights written by the team; dates pinned from
      version history; second member's role confirmed (Q8)

#### P3 — Results integration (after the bench experiment)

- [ ] Fill Appendix D result shells and the 8 × 8 confusion matrix
- [ ] Report per-contact Wilson intervals; exact binomial tests against 0.95;
      worst contact as the primary criterion
- [ ] Exact Poisson intervals for false activations
- [ ] McNemar exact paired test for the H4 control arm
- [ ] Report deviations from the pre-registered plan **as deviations**
- [ ] Update §16 evaluation and Table 18 status column
- [ ] Push the reconciled numbers into the ledger, then hand to Track W

### How the two tracks stay in sync

1. **The ledger is the interface.** Track P changes a number → updates §5 →
   Track W picks it up. Track W never reads the paper directly for figures.
2. **Findings close in one place.** §9 is the shared to-do; both tracks mark
   their own F-numbers closed with a date.
3. **Open questions block explicitly.** Anything depending on Q1–Q8 is marked
   blocked rather than guessed.
4. **Separate branches**, with this file the one both may touch — append-only in
   the decisions log to minimise conflicts.
5. **Consistency pass before submission.** One final sweep checking every number
   on the site against the paper against the ledger. This is the check that
   would have caught F-1 through F-8.

### Immediate next actions

| Priority | Who | Action |
| --- | --- | --- |
| 1 | Anyone | **Fix F-27** — the account handle in the site footer. Live de-identification breach; independent of everything else |
| 2 | Team | Answer **Q1** — it is the last thing blocking W1 |
| 3 | Team | Answer **Q7** — unblocks F-14, F-15, F-34 and the rest of W4 |
| 4 | Team | Answer **Q2/Q3** — assemble the bench rig, photograph every stage, keep receipts |
| 5 | Track W | Start **W2** — the criteria table first; it is the single highest-value page for AUSSEF scoring |
| 6 | Track P | Start **P1** with the sensing-route contradiction (F-13) |

---

## 12. Decisions log

Append-only. Date every entry.

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08-03 | A single shared spine created for both workstreams | Prevents site/paper divergence — the root cause of F-1 through F-8 |
| 2026-08-03 | Six-token evidence vocabulary adopted (`SIMULATED` / `MEASURED` / `DESIGN INTENT` / `TARGET` / `PENDING` / `CITED`); `COMPUTED` added as a seventh the same day, after the audit found it already used throughout §5 but missing from the §1 table | The old one-line disclaimer both overstated feature existence and understated completed simulation work |
| 2026-08-03 | The source document bundle must **not** be committed — the repo is public and the logbook is not de-identified | AUSSEF de-identification requirement |
| 2026-08-03 | **Q9 answered: the React app is the AUSSEF artifact.** Track W retargeted to `src/` | The only argument for the static `site/` was its zero-JS guarantee. The React build prerenders every public route to static HTML — 13,548 characters of real text on the homepage with JavaScript off, zero `opacity:0`, native `<details>` accordions, opt-in 3D. Measured, not assumed. The React app additionally has a single source of truth for the command map, an evidence-status component, and section routes matching the W2 page plan |
| 2026-08-03 | Accepted cost of that choice: zero-JS becomes a property nothing enforces | Mitigation added to W2 — a build-time prerender guard and a T2 re-run against built output |
| 2026-08-03 | All findings re-verified against the React app; two withdrawn as incorrect (F-30, F-31) | Both turned out to be assets rather than liabilities. The dashboard is scrupulously honest and the concept-v1 archive is strong criteria 7–8 evidence |
| 2026-08-03 | **W1 correctness pass executed** — 16 findings closed (F-2, F-3, F-4, F-5, F-6, F-8, F-9, F-10, F-11, F-12, F-22, F-23, F-24, F-26, F-32, F-33) | Every figure on the site now traces to a ledger row |
| 2026-08-03 | The consolidated `PLAN.md` is committed to the repository, superseding the earlier rule that the working documents stay outside it | One de-identified spine in version control beats three files on a personal machine. The source bundle stays uncommitted |
| 2026-08-03 | W1 output put through adversarial verification before publication — four independent reviewers over numbers, de-identification, code claims and completeness | It found two overstated closures (F-2, F-9) that had been reported as complete. Both are now genuinely fixed, and working agreement 9 exists because of it |
| 2026-08-03 | The site now states the *unflattering* half — 86% worst-contact under worn conditions against a 95% criterion, σ_tap unmeasured | Omitting it was the "flattering half" problem. A pre-registered criterion the project might fail is stronger evidence of scientific honesty than a criterion it is certain to pass |
| 2026-08-03 | F-27 reclassified from "check before citing the URL" to a **live breach** | The handle is published on every page of the live site right now, independent of whether the URL is ever cited |

---

## 13. Working agreements

1. **Never invent a number.** If it is not in the ledger, it does not go on the
   page or in the paper. Add it to the ledger first, with provenance.
2. **Never state design intent in the present tense.** No wearable ring exists.
3. **Never pair a bench-scale figure with a hand-scale one.** They are different
   experiments, with different magnets and different sensor layouts. §5.1 and
   §5.2 are separated for exactly this reason.
4. **Report the unflattering half.** The honest headline is that thumb-placement
   scatter is unmeasured and decides everything. Say so.
5. **Close findings explicitly.** When a track fixes an F-number, mark it closed
   in §9.1 with the date **and the commit**. The commit link is the design-portfolio
   evidence AUSSEF criteria 7–8 are scored on.
6. **Write back before finishing.** Any new understanding goes into this file in
   the same session it was discovered, or it is lost.
7. **Keep the repository de-identified.** No names, no school, no personal
   account handles — this repo is public.
8. **Write access requires a local session.** Cloud sessions can read this
   public repo but cannot push — the Claude GitHub App is not installed on the
   owner's account. Run locally, or have the owner install the App. Agreement 6
   silently fails otherwise.
9. **A fix is not closed until every rendered surface is checked.** Correcting
   the canonical source is not enough: call sites hard-code values. Grep for the
   old string across all of `src/` and `index.html` before marking an F-number
   closed. F-2 and F-9 were both reported closed while still wrong on the live
   site, because only the source of truth had been fixed.
