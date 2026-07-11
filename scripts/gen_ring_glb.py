#!/usr/bin/env python3
"""Generate a realistic RAGNAR smart-ring GLB with no external deps.

Not a donut/torus — a proper wearable *band*: a rounded-rectangular cross-section
revolved around the Z axis so the ring stands vertically (hole facing the camera),
which is how model-viewer's default camera frames it and makes auto-rotate read as
a real product turn. A small dark sensor puck sits at the top to echo the poster.

Pure stdlib (struct + json + math). Writes public/models/ring.glb.
"""
import json
import math
import struct
import os

PI = math.pi
cos, sin = math.cos, math.sin


# --- helpers -----------------------------------------------------------------
def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def fix_winding(P, N, I):
    """Reorder each triangle so its face normal agrees with the analytic vertex
    normals — guarantees outward-facing winding regardless of how the source
    profile was ordered."""
    out = []
    for t in range(0, len(I), 3):
        a, b, c = I[t], I[t + 1], I[t + 2]
        g = cross(sub(P[b], P[a]), sub(P[c], P[a]))
        na = N[a]
        if g[0] * na[0] + g[1] * na[1] + g[2] * na[2] < 0:
            out += [a, c, b]
        else:
            out += [a, b, c]
    return out


# --- ring band: rounded-rect profile revolved about Z ------------------------
def ring_band(R_in, R_out, H, f, MAJ=192, arc_seg=8):
    rc = (R_in + R_out) / 2.0
    a = (R_out - R_in) / 2.0   # half radial thickness
    b = H / 2.0                # half band width (along Z / finger axis)

    prof = []  # (rho, z, n_rho, n_z)

    def add(lx, lz, nx, nz):
        prof.append((rc + lx, lz, nx, nz))

    # outer edge (bottom -> top)
    add(a, -(b - f), 1, 0)
    add(a, (b - f), 1, 0)
    # outer-top fillet 0..90
    for k in range(arc_seg + 1):
        p = (PI / 2) * k / arc_seg
        add(a - f + f * cos(p), (b - f) + f * sin(p), cos(p), sin(p))
    # top edge -> inner
    add(-(a - f), b, 0, 1)
    # inner-top fillet 90..180
    for k in range(arc_seg + 1):
        p = PI / 2 + (PI / 2) * k / arc_seg
        add(-(a - f) + f * cos(p), (b - f) + f * sin(p), cos(p), sin(p))
    # inner edge (top -> bottom)
    add(-a, -(b - f), -1, 0)
    # inner-bottom fillet 180..270
    for k in range(arc_seg + 1):
        p = PI + (PI / 2) * k / arc_seg
        add(-(a - f) + f * cos(p), -(b - f) + f * sin(p), cos(p), sin(p))
    # bottom edge -> outer
    add((a - f), -b, 0, -1)
    # outer-bottom fillet 270..360
    for k in range(arc_seg + 1):
        p = 3 * PI / 2 + (PI / 2) * k / arc_seg
        add((a - f) + f * cos(p), -(b - f) + f * sin(p), cos(p), sin(p))

    # dedupe consecutive (fillet endpoints repeat the straight-edge points)
    clean = []
    for pt in prof:
        if clean and abs(pt[0] - clean[-1][0]) < 1e-6 and abs(pt[1] - clean[-1][1]) < 1e-6:
            continue
        clean.append(pt)
    if (abs(clean[0][0] - clean[-1][0]) < 1e-6 and abs(clean[0][1] - clean[-1][1]) < 1e-6):
        clean.pop()
    prof = clean

    M = len(prof)
    P, N = [], []
    for (rho, z, nr, nz) in prof:
        for j in range(MAJ):
            th = 2 * PI * j / MAJ
            c, s = cos(th), sin(th)
            P.append((rho * c, rho * s, z))
            N.append((nr * c, nr * s, nz))

    I = []
    for i in range(M):
        i2 = (i + 1) % M
        for j in range(MAJ):
            j2 = (j + 1) % MAJ
            v00 = i * MAJ + j
            v10 = i2 * MAJ + j
            v01 = i * MAJ + j2
            v11 = i2 * MAJ + j2
            I += [v00, v10, v11, v00, v11, v01]
    return P, N, fix_winding(P, N, I)


# --- sensor puck: short cylinder standing on the outer band at the top -------
def sensor_puck(cy, y0, y1, pr, seg=36):
    P, N, I = [], [], []
    # side wall
    for k in range(seg):
        th = 2 * PI * k / seg
        c, s = cos(th), sin(th)
        P.append((pr * c, y0, pr * s)); N.append((c, 0, s))
        P.append((pr * c, y1, pr * s)); N.append((c, 0, s))
    for k in range(seg):
        a = 2 * k
        b = 2 * ((k + 1) % seg)
        I += [a, b, a + 1, a + 1, b, b + 1]
    # top cap
    base = len(P)
    P.append((0, y1, 0)); N.append((0, 1, 0))
    ctop = base
    for k in range(seg):
        th = 2 * PI * k / seg
        P.append((pr * cos(th), y1, pr * sin(th))); N.append((0, 1, 0))
    for k in range(seg):
        I += [ctop, ctop + 1 + k, ctop + 1 + (k + 1) % seg]
    # bottom cap
    base = len(P)
    P.append((0, y0, 0)); N.append((0, -1, 0))
    cbot = base
    for k in range(seg):
        th = 2 * PI * k / seg
        P.append((pr * cos(th), y0, pr * sin(th))); N.append((0, -1, 0))
    for k in range(seg):
        I += [cbot, cbot + 1 + (k + 1) % seg, cbot + 1 + k]
    _ = cy  # puck already centred at x=z=0; cy documents intent
    return P, N, fix_winding(P, N, I)


# --- geometry ----------------------------------------------------------------
R_IN, R_OUT, H, F = 1.0, 1.22, 0.62, 0.09
band_P, band_N, band_I = ring_band(R_IN, R_OUT, H, F)
# puck sits at the top (+Y), sunk slightly into the band and protruding a little
puck_P, puck_N, puck_I = sensor_puck(0, R_OUT - 0.05, R_OUT + 0.07, 0.17)

primitives = [
    (band_P, band_N, band_I, 0),  # titanium
    (puck_P, puck_N, puck_I, 1),  # dark sensor
]

# --- pack buffers ------------------------------------------------------------
buffer = b""
bufferViews = []
accessors = []


def pad4(bs):
    return bs + b"\x00" * ((4 - len(bs) % 4) % 4)


def add_view(data, target):
    global buffer
    off = len(buffer)
    buffer += pad4(data)
    bufferViews.append({"buffer": 0, "byteOffset": off, "byteLength": len(data), "target": target})
    return len(bufferViews) - 1


meshes = []
for (P, N, I, mat) in primitives:
    idx_b = b"".join(struct.pack("<H", k) for k in I)
    pos_b = b"".join(struct.pack("<fff", *p) for p in P)
    nrm_b = b"".join(struct.pack("<fff", *n) for n in N)

    iv = add_view(idx_b, 34963)
    pv = add_view(pos_b, 34962)
    nv = add_view(nrm_b, 34962)

    pmin = [min(p[k] for p in P) for k in range(3)]
    pmax = [max(p[k] for p in P) for k in range(3)]

    ia = len(accessors); accessors.append({"bufferView": iv, "componentType": 5123, "count": len(I), "type": "SCALAR"})
    pa = len(accessors); accessors.append({"bufferView": pv, "componentType": 5126, "count": len(P), "type": "VEC3", "min": pmin, "max": pmax})
    na = len(accessors); accessors.append({"bufferView": nv, "componentType": 5126, "count": len(N), "type": "VEC3"})

    meshes.append({"primitives": [{"attributes": {"POSITION": pa, "NORMAL": na}, "indices": ia, "material": mat}]})

gltf = {
    "asset": {"version": "2.0", "generator": "tactiq-ring-gen v2"},
    "scene": 0,
    "scenes": [{"nodes": [0, 1]}],
    "nodes": [
        {"mesh": 0, "name": "RAGNAR_band"},
        {"mesh": 1, "name": "RAGNAR_sensor"},
    ],
    "materials": [
        {"name": "titanium", "pbrMetallicRoughness": {
            "baseColorFactor": [0.72, 0.74, 0.79, 1.0], "metallicFactor": 1.0, "roughnessFactor": 0.30}},
        {"name": "sensor", "pbrMetallicRoughness": {
            "baseColorFactor": [0.07, 0.07, 0.10, 1.0], "metallicFactor": 0.4, "roughnessFactor": 0.45}},
    ],
    "meshes": meshes,
    "buffers": [{"byteLength": len(buffer)}],
    "bufferViews": bufferViews,
    "accessors": accessors,
}

# glTF spec: the JSON chunk is padded with trailing SPACES (0x20), not nulls.
json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
if len(json_bytes) % 4:
    json_bytes += b" " * (4 - len(json_bytes) % 4)


def chunk(data, ctype):
    return struct.pack("<I", len(data)) + struct.pack("<I", ctype) + data


json_chunk = chunk(json_bytes, 0x4E4F534A)
bin_chunk = chunk(buffer, 0x004E4942)
total = 12 + len(json_chunk) + len(bin_chunk)
header = struct.pack("<III", 0x46546C67, 2, total)

out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "models", "ring.glb"))
with open(out_path, "wb") as fh:
    fh.write(header + json_chunk + bin_chunk)

print(f"wrote {out_path} ({total} bytes) "
      f"band={len(band_I)//3} tris, puck={len(puck_I)//3} tris")
