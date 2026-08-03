# Tactiq — visual and interaction plan

**Status:** proposal, nothing built. Read [`PLAN.md`](./PLAN.md) first — every
number quoted here comes from its claims ledger.

---

## The idea

**Let people use the thing.**

> **Revised 3 August 2026.** An earlier version of this plan led with the
> physics — raymarched dipole fields, live Fisher information, Cramér–Rao
> ellipses. That is a demo built to impress an engineer, and it answers the
> wrong question. A visitor arrives asking *what is this, and what would it do
> for me?* The site's job is to answer that, convincingly and quickly.
>
> The rigour has a home: **the paper.** The ledger, the criteria table, the
> statistical design, the limitations — a judge who wants those goes there and
> finds them done properly. The site does not need to prove the physics in the
> hero. It needs to make someone want the product.

So the organising rule is:

> **The centrepiece is an interaction you can perform, not a simulation you can
> inspect.** Squeeze, tap, and watch a phone respond. Everything else supports
> that.

The physics still earns a place — one section, well told, because "a magnet and
three cheap sensors, no camera, no microphone, nothing leaves your hand" is a
genuinely good *product* story about privacy and cost. But it is a supporting
act, not the opening.

---

## The one thing to build if only one thing ships

**The interaction demo.** ✅ *Built — `src/app/home/TryIt.tsx`.*

A hand, a ring, and a phone side by side. Squeeze the ring; a short command
window opens and a bar shows it closing. Tap a point on the fingers; the phone
moves through a real task — an inbox — and a line shows what the screen reader
just said. A haptic panel names the pattern that confirmed it.

Tap *without* squeezing first and **nothing happens**, and the demo says so.
That single refusal is the most persuasive thing on the page: it is the answer
to "what stops it firing in my pocket", and you learn it by doing rather than by
reading a reliability figure.

Hold the pinky tip and a counter climbs to five seconds before Emergency fires —
so "it cannot go off by accident" is something you feel rather than a claim.

This demonstrates, in about fifteen seconds of play: the gating, the command
set, the screen-reader integration, one-handed operation, and the recoverability
of every action. No physics required.

---

## Entry experience

No logo fade, no scroll-jack, no "enter site" gate. Those read as agency
portfolio, and they put a wall between a visitor and the content.

Instead — **the cold open.** You land on the existing warm stone paper. Within
the hero, a field ignites:

1. A single point of light at the thumb position.
2. Out of it, a volumetric dipole field blooms over ~1.2 s, raymarched live,
   falling off as 1/r³ — a hot core, dissolving to nothing at the edges.
3. Three sensor positions ignite in sequence, 0.3 s apart. Each throws a thin
   isosurface shell.
4. The shells sweep inward. Their intersection collapses from a lens to a point.
5. The headline typesets over it: **"One passive magnet. Three scalar readings.
   1.7 mm."**
6. A hairline caption, inside the spectacle rather than apologising after it:
   *Live simulation — no ring has been built.*

Four seconds. A Skip control first in the tab order. Scrolling aborts it
instantly and it never replays. The page's real content is already in the DOM
underneath the whole time.

**Why this and not a dark cinematic intro:** the site keeps its audited
light theme and the WebGL layer *multiply-blends onto the paper*. Multiply
darkens — so contrast goes **up**, not down. A dark, bloomed, glowing aesthetic
would mean re-auditing the entire palette, and bloom on near-black is a
simulation of halation: the exact light-scatter artefact that people with
cataracts, glaucoma or uncorrected refraction already live with. On a site built
for low-vision users that is the one aesthetic we cannot adopt. This approach
gets the drama and keeps the contrast.

---

## The pieces that sell the product

**Ordered by product value, not by technical ambition.** Pieces 1–3 sell the
product. Pieces 4–6 are the physics and evidence layer — worth building, but
they are the supporting act and several belong on the research page rather than
the homepage.

### 1. The interaction demo ✅ built

Described above. The centrepiece.

**Next passes on it:** a guided first-run ("try Next") so a visitor knows where
to start; a scenario switcher — inbox, music, incoming call — so the value is
visible in more than one context; and a real haptic buzz on devices that support
`navigator.vibrate`, which makes the confirmation layer land properly on a phone.

### 2. The ring, shown properly

A concept render of the hardware that looks like something you would want to
wear: soft-touch shell, the band, the passive thumb magnet. Slow, controlled,
opt-in — never auto-rotating.

The existing 3D model is behind a "load the model" button, which is right for
performance and for motion sensitivity. What it needs is better material and
lighting work, and an exploded view that names the parts.

*Difficulty: medium — mostly asset work, not code.*

### 3. Scenarios, dramatised

The three situations already on the site — cane in one hand, a call on a loud
platform, moving through a screen reader silently — currently illustrated with
small line figures. These are the emotional argument for the product and they
deserve real art direction: proper illustration, a scroll-linked reveal, maybe
ambient audio on the noisy-platform one so the "voice control fails here" point
lands without being stated.

*Difficulty: medium.*

---

## Supporting pieces — the physics and evidence layer

These belong mostly on the **research page**, not the homepage. They are how the
project shows its working to someone who asks — and the equatorial collapse in
particular is a genuinely good story about why the ring can be cheap and private.
But none of them is what makes a visitor want the product.

### S1. The equatorial collapse

The best idea in the project, currently one paragraph of prose.

**Phase one:** the thumb magnet tumbles freely. The shader colours space by the
angular factor √(1 + 3cos²θ). Field magnitude at a fixed sensor pulses across a
full 2× range as the moment rotates. The shells breathe in and out. The
trilateration solution smears into a blob.

**Phase two:** the mechanical constraint snaps in. The moment locks vertical.
The sensors drop into the equatorial plane. The angular term goes to **exactly
1** everywhere on that plane. The pulsing stops dead. The blob becomes a point.

That is the moment the problem becomes solvable, and it is currently invisible.

*Tech:* the angular factor is a single shader uniform, so unconstrained →
constrained is one animated float and both states are provably the same code
path. Dipole field lines satisfy `r = L·sin²θ` in closed form, so a vertex
shader places instanced tube geometry exactly on the true field lines — no
numerical integration, near-zero cost, and a defensible technical choice to
state in the caption. Equatorial slice rendered as **quantised isoline bands**,
not a smooth ramp: legible at low acuity, and it makes "exactly 1" unmistakable
as a single flat band.
*Difficulty: high.*

### S2. Three shells — trilateration you can grab

Drag the thumb anywhere in the hand volume. Three isosurfaces of constant |B| —
which, once the angular factor is 1, are exactly spheres of radius
`r = (k/B)^⅓` — track it live. Their triple intersection is the estimate.

Then switch on sensor noise. Each shell thickens, but not much, because
`δr/r = ⅓ · δB/B` — a 1% field error is only a 0.33% range error. The inverse
cube working in your favour. The three fuzzy shells intersect in a small glowing
lens, and **that lens is the 1.7 mm figure**, drawn beside an 11 mm
decision-radius wireframe for scale.

*Tech:* ray/sphere intersection is a closed-form quadratic — the shells are
exact and free. The lens is an SDF CSG of three spheres, sphere-traced, shaded
with a Fresnel rim so it reads as glass rather than fog.
*Difficulty: high.*

### S3. The Cramér–Rao ellipse, and the axis we are not allowed to draw

Walk the eight contact points. At each, compute the Fisher information live
(`J = Σ (1/σ²)·ggᵀ`, with `g = ∇|B| = −(3k/r⁴)·r̂`), invert it, render the 95%
confidence ellipse at true scale against the 11 mm decision radius.

Behind it, the volumetric fog is repurposed: instead of field strength it
renders `√trace(J⁻¹)` through the whole hand volume — a live map of the best
precision *any* estimator could achieve at every point in space, with geometric
dilution visible as bright haze where the sensor directions go nearly parallel.

And then the detail that does more work than any amount of bloom: the
out-of-plane third axis is drawn as a **dashed cage, labelled "assumed by the
mechanical constraint — not estimated."** A spectacular graphic whose main job
is to admit what it does not know.

*Difficulty: high.*

### S4. The σ_tap dial

Described above. Build it as a precomputed `Float32` lookup baked offline from
the seeded scripts, not a live Monte Carlo — instant, deterministic, and every
judge on every machine sees the identical number.

Expose the seed and value as URL parameters (`?sigma=4&seed=7`) so any figure in
the write-up is reproducible from a link. That is a rigour claim you can say out
loud at the judging table.

*Difficulty: medium — and the highest value-per-hour on this list.*

### S5. The capacity cliff — 8 points versus 16

Scroll-driven. The hand shows 8 well-spaced points; as you scroll, 16 crowd in.
A bit-counter climbs from 2.71 to 3.02 — **+0.31 bits, almost nothing** — while
the worst-command accuracy needle falls off a cliff from 87% to roughly 50%.

Two numbers moving in opposite directions is the entire argument for why there
are eight points and not more.

*Tech: pure SVG, scroll-linked. No WebGL at all.*
*Difficulty: low — **build this one first**. It degrades to a static two-panel
comparison with no second code path to maintain, and it proves the whole
fallback architecture end to end before a single shader is written.*

### S6. Listening mode

Site-wide opt-in sonification. Three oscillators map log|B| for the three
sensors. Accuracy renders as noise density against a clean reference tone
sitting at the 95% criterion — so as you drag σ_tap past 4 mm, the tone
*dirties* and you hear the criterion fail.

Nothing makes a sound until the toggle is pressed.

An accessibility project whose showpiece is sighted-only is self-refuting. This
gives a blind judge the same discovery sequence, in the same order, as a sighted
one — including the "watch it collapse" moment. And no judge will have seen it
before, so it *earns* spectacle credit rather than spending it.

*Difficulty: medium.*

---

## Rendering stack

| Layer | Choice |
| --- | --- |
| Core | `three` + `@react-three/fiber` (React 18-safe) |
| Shaders | Custom `RawShaderMaterial`, GLSL3 |
| Volumetrics | Fixed-step raymarch, 48–64 steps, front-to-back premultiplied compositing, early-out at α > 0.97 |
| Anti-banding | Interleaved-gradient-noise ray jitter + 8-frame temporal accumulation in a ping-pong RGBA16F target |
| Performance | Half-resolution render, joint-bilateral upsample against depth so silhouettes stay crisp |
| Tonemapping | ACES filmic |
| Bloom | Dual-Kawase down/up chain, Karis-average first downsample to kill fireflies, tinted through a 1D LUT onto the existing accent so it stays in-brand |
| Transparency | Weighted-blended OIT for overlapping shells |
| Compositing | **Multiply onto the paper background** — darkens, raising contrast |

Also: depth of field, subtle chromatic dispersion *on the field only, never on
text*, and instanced tube geometry for field lines.

**Typography upgrade** (cheap, high return): every measured value in mono with
`font-variant-numeric: tabular-nums slashed-zero`, units at 0.7em and tracked.
`1.7 mm` then renders identically everywhere and becomes the identity device for
free. Cut the six loaded font families to three.

---

## How this stays safe: three layers

This is the part that makes the ambition affordable. Every piece ships in three
layers, and **deleting the top layer must lose beauty and nothing else.**

| Layer | What it is | Who gets it |
| --- | --- | --- |
| **L0** | Prerendered prose, a build-generated SVG poster, and a data table | Everyone, including JS-off, crawlers, and the prerender |
| **L1** | Real form controls — `input`, `button`, `fieldset` — driving that SVG. Keyboard-primary | Anyone with JS |
| **L2** | The WebGL skin, `aria-hidden`, painted over the L1 result | Capable devices that haven't opted out |

**One physics module** (`src/lib/field.ts`) generates *both* the shader uniforms
*and* the build-time posters and data tables. This is the whole difference
between progressive enhancement and a disclaimer. The failure mode that already
burned this project is not the canvas breaking — it is **drift**: a shader gains
a parameter, the poster does not, and six weeks later the static page describes
a different simulation. Shared-source generation makes that impossible rather
than merely discouraged.

### Interaction rules that make it work non-visually

- **Eight "jump to contact point" buttons plus paired X/Y sliders** as the
  primary way to move the thumb. Never a keyboard cursor roaming a continuous 2D
  canvas — there is no feedback loop telling you where you are. Discretising to
  the eight states that matter puts every meaningful configuration one keystroke
  away.
- **No `role="application"`.** It traps the virtual cursor and is unnecessary
  once jump buttons exist.
- **`aria-valuetext` carries the finding, not the number:** *"four point zero
  millimetres — worst contact point 86 percent, below the 95 percent
  criterion."* One string, and the σ_tap dial becomes the most informative
  control on the site for a blind visitor who never touches a canvas.
- **A "Read this instrument" button** per figure that speaks the full current
  state as one sentence — alongside, not instead of, a debounced live region. A
  dragged slider machine-guns the speech buffer; an explicit on-demand read
  gives control back.

### Art-direction prohibitions

Not disclaimers — rules about what the renderer is allowed to draw, which a
beautiful frame cannot override:

1. **The 3D layer may render only coordinate frames, sensors, field and
   probability.** Never skin, never a product, never anything worn. The hand
   stays a flat schematic outline. This is the real answer to "no wearable ring
   exists" — a "concept render" chip is a caption on an image that says the
   opposite, and images win.
2. **No meaningful mark below 24 CSS px**; re-render the canvas backing store at
   capped DPR on resize so 400% zoom survives.
3. **No more than one luminance transition per second** over any 10% of the
   viewport (WCAG 2.3.1). Three of the four proposals reviewed had ignition
   sequences that nobody had checked against this.
4. **Colour never carries meaning alone** — pass/fail always gets a glyph and a
   word.
5. **Under reduced motion: render one full-fidelity frame and stop the loop.**
   Never a degraded image, never a blank panel. Reduced motion must not mean
   reduced information.

---

## Five things in the repo that block this today

Verified, not assumed:

1. **Reduced motion cannot stop WebGL.** `src/styles/theme.css:231` only zeroes
   CSS `animation-duration` and `transition-duration`. That has *no effect
   whatsoever* on a `requestAnimationFrame` loop inside a canvas. A JS-level
   gate is mandatory and does not exist.
2. **`src/lib/a11yPrefs.ts` never reads `matchMedia`** — 45 lines, stored
   boolean only. Meanwhile four components hand-roll their own checks
   (`TactiqIntro.tsx:291,438`, `VelorahHero.tsx:32`, `JackPortfolio.tsx:196`).
   Add one exported `shouldAnimate()` combining the media query and the class,
   and gate every canvas mount on it — or ship a fifth divergent implementation.
3. **No `forced-colors` or `prefers-contrast` support anywhere in
   `src/styles/`.** Windows High Contrast is heavily used by low-vision users.
   Under `forced-colors`, drop the WebGL layer entirely.
4. **No test tooling in `package.json` at all.** Every "axe-core in CI" claim is
   currently zero lines of code — which makes it the first thing cut under
   deadline pressure, which is exactly how the empty-page incident recurs.
5. **`prerender.mjs` emits 15 routes, not 7.** Any gate must cover all of them.

### Two CI gates, landed before the first shader

- **Content gate:** grep every built route for the canonical numbers (1.7 mm,
  11 mm, 86%, 95%, 0.31 bits, 87%, 50%). Catches content regressions.
- **Structural gate:** fail the build if any registered canvas id lacks a
  matching prerendered `<figure>` and data table. Catches a new canvas shipping
  without a fallback.

Neither catches the other's failure. `prerender.mjs` already exits non-zero, so
the precedent for a build-failing gate exists in the repo today.

Plus: **automatic silent downgrade to the static tier** when frame deltas exceed
32 ms for two consecutive seconds. The fair's borrowed hardware is exactly where
a jank-locked laptop will happen.

---

## Phasing

Sequenced so that value lands early and nothing half-built is ever live.

| Phase | Contents | Status |
| --- | --- | --- |
| **V0 — Foundations** | `shouldAnimate()` motion gate; `field.ts` physics module; **F-35 fix** — the hand map's command list now renders without JavaScript | ✅ **done** |
| **V1 — The demo** | `TryIt` — squeeze, tap, watch the phone respond, with the gating and the emergency hold both playable | ✅ **done** |
| **V2 — Make it look like a product** | Scenario art direction; the ring render with materials and an exploded view; typography upgrade; a guided first run and scenario switcher for the demo; real `navigator.vibrate` on phones | **next** — this is the phase that actually answers "make it stylish" |
| **V3 — Show the working** | Research page: the equatorial collapse, the capacity cliff, the σ_tap dial. `forced-colors` support and the two CI gates | After V2. Doubles as W2 content |
| **V4 — Spectacle** | `field.ts` → GPU: the cold open, volumetric field, three shells, CRLB ellipse | Only if time allows after the bench experiment. Genuinely optional |
| **V5 — Polish** | Postprocessing, listening mode, the audio-described cut, `/showcase` retirement | Last |

**Scheduling reality:** this competes directly with W2 in `PLAN.md` — the
criteria table, testing page and redesign pages that AUSSEF actually scores, and
with the bench experiment itself (Aug–Oct) and the paper. V0 and V1 are a
realistic pre-bench block. V2 is a substantial piece of graphics work and should
follow the experiment, not precede it.

The good news: V1's two pieces and V3's audio-described cut are not decoration —
they *are* W2 content. The σ_tap dial is the testing page's headline. The
Capacity Cliff is the redesign-cycle-1 record. Built this way the visual work
and the AUSSEF work are the same work.

---

## The summary

The site's job is to make someone understand Tactiq and want it. The demo does
the persuading: you squeeze, you tap, the phone responds, and when you tap
without squeezing first, nothing happens — which teaches the reliability story
better than any figure could.

The physics is a supporting act on the research page, and the full apparatus —
ledger, criteria, statistics, limitations — lives in the paper, where a judge
who wants rigour will go looking and find it done properly.

Honesty on the site is one visible label per section, not a hedge in every
sentence. The design is real, the simulation work is real, and the site should
carry itself that way.
