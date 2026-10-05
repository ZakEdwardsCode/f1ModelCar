// geom.js - procedural surface construction helpers.
//
// Everything here is modelled from primitives at real-world scale (metres).
// The two workhorses are:
//   * loft()  - skins a sequence of 3D rings into a closed surface
//   * naca()  - generates a cambered aerofoil section for wing elements
//
// Bodywork is built the way a real body plan is: define cross-sections at
// stations along the car, then skin between them. That gives continuous
// curved surfaces instead of the boxy look you get from stacked primitives.

import * as THREE from 'three';

const { Vector3, BufferGeometry, BufferAttribute } = THREE;

/* ------------------------------------------------------------------ */
/* Lofting                                                             */
/* ------------------------------------------------------------------ */

/**
 * Skin a sequence of rings into a surface.
 * @param {Vector3[][]} rings equal-length arrays of points, ordered
 *                            consistently around each section
 */
export function loft(rings, opts = {}) {
  const { capStart = false, capEnd = false, closed = true } = opts;
  const n = rings[0].length;
  const m = rings.length;

  const pos = [];
  const uv = [];
  for (let i = 0; i < m; i++) {
    if (rings[i].length !== n) {
      throw new Error('loft: ring ' + i + ' has ' + rings[i].length + ', expected ' + n);
    }
    for (let j = 0; j < n; j++) {
      const p = rings[i][j];
      pos.push(p.x, p.y, p.z);
      uv.push(j / (n - 1), i / (m - 1));
    }
  }

  const idx = [];
  const lastJ = closed ? n : n - 1;
  for (let i = 0; i < m - 1; i++) {
    for (let j = 0; j < lastJ; j++) {
      const j2 = (j + 1) % n;
      const a = i * n + j;
      const b = i * n + j2;
      const c = (i + 1) * n + j;
      const d = (i + 1) * n + j2;
      idx.push(a, c, b, b, c, d);
    }
  }

  // Triangle-fan caps around each end ring centroid.
  const addCap = (ringIndex, reverse) => {
    const ring = rings[ringIndex];
    const centre = new Vector3();
    ring.forEach((p) => centre.add(p));
    centre.multiplyScalar(1 / n);
    const ci = pos.length / 3;
    pos.push(centre.x, centre.y, centre.z);
    uv.push(0.5, 0.5);
    const base = ringIndex * n;
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      if (reverse) idx.push(ci, base + j2, base + j);
      else idx.push(ci, base + j, base + j2);
    }
  };
  if (capStart) addCap(0, false);
  if (capEnd) addCap(m - 1, true);

  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Cross-section generators                                            */
/* ------------------------------------------------------------------ */

/**
 * Superelliptic cross-section in the XY plane at a given z.
 * F1 bodywork sections are essentially superellipses: flat-ish flanks with a
 * rounded crown and a flatter underside. Higher exponent means squarer.
 */
export function sectionSuper({
  z = 0, w = 0.4, hTop = 0.2, hBot = 0.12, yc = 0,
  nSide = 2.6, nTop = 2.4, nBot = 3.0, n = 48, xc = 0,
}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const up = st >= 0;
    const h = up ? hTop : hBot;
    const e = up ? nTop : nBot;
    const x = xc + w * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / nSide);
    const y = yc + h * Math.sign(st) * Math.pow(Math.abs(st), 2 / e);
    pts.push(new Vector3(x, y, z));
  }
  return pts;
}

/** Resample a closed outline to exactly n evenly spaced points. */
export function resample(points, n) {
  const cum = [0];
  let total = 0;
  for (let i = 1; i <= points.length; i++) {
    const a = points[i - 1];
    const b = points[i % points.length];
    total += a.distanceTo(b);
    cum.push(total);
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const target = (i / n) * total;
    let k = 1;
    while (k < cum.length && cum[k] < target) k++;
    const t = (target - cum[k - 1]) / Math.max(1e-9, cum[k] - cum[k - 1]);
    const a = points[(k - 1) % points.length];
    const b = points[k % points.length];
    out.push(new Vector3().lerpVectors(a, b, t));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Aerofoils                                                           */
/* ------------------------------------------------------------------ */

/**
 * NACA 4-digit cambered aerofoil as a closed loop of {x,y}, unit chord.
 * @param m max camber as a fraction of chord (negative inverts for downforce)
 * @param p chordwise position of max camber
 * @param t max thickness as a fraction of chord
 */
export function naca(m, p, t, n = 24) {
  const upper = [];
  const lower = [];
  for (let i = 0; i <= n; i++) {
    // Cosine spacing clusters points at the leading and trailing edges,
    // where curvature is highest.
    const beta = (i / n) * Math.PI;
    const x = 0.5 * (1 - Math.cos(beta));
    const yt =
      5 * t *
      (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x +
        0.2843 * x * x * x - 0.1015 * x * x * x * x);
    let yc = 0;
    let dyc = 0;
    if (m !== 0) {
      if (x < p) {
        yc = (m / (p * p)) * (2 * p * x - x * x);
        dyc = ((2 * m) / (p * p)) * (p - x);
      } else {
        yc = (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * x - x * x);
        dyc = ((2 * m) / ((1 - p) * (1 - p))) * (p - x);
      }
    }
    const th = Math.atan(dyc);
    upper.push({ x: x - yt * Math.sin(th), y: yc + yt * Math.cos(th) });
    lower.push({ x: x + yt * Math.sin(th), y: yc - yt * Math.cos(th) });
  }
  lower.reverse();
  return upper.concat(lower.slice(1, -1));
}

/**
 * Place an aerofoil section in 3D as a spanwise ring.
 * Span runs along X, chord along Z, lift axis Y.
 */
export function foilRing({
  x, chord, aoa = 0, y = 0, z = 0, m = -0.06, p = 0.4, t = 0.11, n = 24,
}) {
  const sec = naca(m, p, t, n);
  const ca = Math.cos(aoa);
  const sa = Math.sin(aoa);
  return sec.map((q) => {
    // u runs from the leading edge (negative) to the trailing edge (positive),
    // measured from the quarter-chord, which is the pivot point.
    const u = (q.x - 0.25) * chord;
    const v = q.y * chord;
    // z is negated so the leading edge faces forward (+Z) and the trailing
    // edge sits rearward, which is the way round a real wing is fitted.
    return new Vector3(x, y + (u * sa + v * ca), z - (u * ca - v * sa));
  });
}

/**
 * Build a wing element from spanwise control stations.
 * @param stations array of {x, chord, aoa, y, z}
 */
export function wingElement(stations, opts = {}) {
  const { m = -0.06, p = 0.4, t = 0.11, n = 24 } = opts;
  const rings = stations.map((s) =>
    foilRing({
      x: s.x, chord: s.chord, aoa: s.aoa ?? 0, y: s.y ?? 0, z: s.z ?? 0,
      m: s.m ?? m, p: s.p ?? p, t: s.t ?? t, n,
    })
  );
  return loft(rings, { capStart: true, capEnd: true });
}

/* ------------------------------------------------------------------ */
/* Plates                                                              */
/* ------------------------------------------------------------------ */

/**
 * A flat plate swept from a 2D outline along one axis.
 * Used for endplates, fences, floor edges and winglets.
 * outline points are {y,z} for axis 'x', {x,y} for axis 'z'.
 */
export function plate(outline, thickness, axis = 'x') {
  const half = thickness / 2;
  const toV = (q, off) => {
    if (axis === 'x') return new Vector3(off, q.y, q.z);
    if (axis === 'y') return new Vector3(q.x, off, q.z);
    return new Vector3(q.x, q.y, off);
  };
  const a = outline.map((q) => toV(q, -half));
  const b = outline.map((q) => toV(q, half));
  return loft([a, b], { capStart: true, capEnd: true });
}

/** Rounded rectangle outline in a chosen plane. */
export function roundedOutline(w, h, r, n = 6, plane = 'yz', cz = 0, cy = 0) {
  const pts = [];
  const corners = [
    [w / 2 - r, h / 2 - r, 0],
    [-(w / 2 - r), h / 2 - r, Math.PI / 2],
    [-(w / 2 - r), -(h / 2 - r), Math.PI],
    [w / 2 - r, -(h / 2 - r), (Math.PI * 3) / 2],
  ];
  for (const [ux, uy, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      const u = ux + r * Math.cos(a);
      const v = uy + r * Math.sin(a);
      pts.push(plane === 'yz' ? { z: u + cz, y: v + cy } : { x: u + cz, y: v + cy });
    }
  }
  return pts;
}

/** Mirror a geometry across the car centreline. */
export function mirrorX(geo) {
  const g = geo.clone();
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, -p.getX(i));
  const idx = g.index.array;
  for (let i = 0; i < idx.length; i += 3) {
    const t = idx[i + 1];
    idx[i + 1] = idx[i + 2];
    idx[i + 2] = t;
  }
  g.index.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
