// build-aero.js - front wing, rear wing, active elements, rear structures.
//
// Two things drive the 2026 front wing geometry, and both are specific:
//
//  1. The elements span far less than the car. Wide endplates carry the
//     assembly out to the full permitted width, so the wing tips sit well
//     inboard of the front tyres.
//  2. On the W17 the support pylons pick up on the SECOND plane, not the
//     mainplane. That leaves the second plane fixed and makes the third
//     plane the only movable one, and its central panel stays static too.
//     Almost every rival moves two elements instead.
//
// Aerofoil convention: these are inverted wings, so the trailing edge sits
// ABOVE the leading edge and the angle of attack is positive. Opening an
// element toward straight-line mode flattens it, which is a negative
// rotation about X.

import * as THREE from 'three';
import { wingElement, plate, loft, resample } from '../../lib/geom.js';
import D from './dims.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rad = (d) => (d * Math.PI) / 180;

const FW_SPAN = D.fwElementSpan;       // 0.800 half-span of the planes
const FW_EP = D.fwEndplateOuter;       // 0.950 outer face of the endplate

/* ------------------------------------------------------------------ */
/* Front wing element definitions                                      */
/* ------------------------------------------------------------------ */
//
// Each plane is defined as a function of normalised span a = |x| / span.
// The elements cascade upward and rearward, each leading edge sitting just
// behind and above the trailing edge of the one ahead, and every element
// rises strongly toward the tip.

const PLANES = {
  mainplane: {
    yc: (a) => 0.045 + 0.090 * Math.pow(a, 2.2),
    chord: (a) => 0.215 + 0.050 * a - 0.035 * Math.pow(a, 5),
    aoa: (a) => rad(7 + 5 * Math.pow(a, 1.5)),
    zc: (a) => 2.800 - 0.028 * a * a,
    t: 0.095, m: -0.075,
  },
  second: {
    yc: (a) => 0.0922 + 0.100 * Math.pow(a, 2.15),
    chord: (a) => 0.140 + 0.034 * a,
    aoa: (a) => rad(17 + 6 * Math.pow(a, 1.4)),
    zc: (a) => 2.5985 - 0.030 * a * a,
    t: 0.085, m: -0.085,
  },
  third: {
    yc: (a) => 0.1518 + 0.098 * Math.pow(a, 2.1),
    chord: (a) => 0.108 + 0.028 * a,
    aoa: (a) => rad(26 + 7 * Math.pow(a, 1.3)),
    zc: (a) => 2.4657 - 0.026 * a * a,
    t: 0.080, m: -0.090,
  },
};

/** Spanwise stations for one plane between two x limits. */
function planeStations(p, x0, x1, n, origin = null) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * (i / n);
    const a = Math.min(1, Math.abs(x) / FW_SPAN);
    const s = {
      x, chord: p.chord(a), aoa: p.aoa(a),
      y: p.yc(a), z: p.zc(a), t: p.t, m: p.m,
    };
    if (origin) { s.y -= origin.y; s.z -= origin.z; }
    out.push(s);
  }
  return out;
}

/** Leading-edge point of a plane at a given normalised span. */
function leadingEdge(p, a) {
  const c = p.chord(a);
  const u = -0.25 * c;
  return {
    y: p.yc(a) + u * Math.sin(p.aoa(a)),
    z: p.zc(a) - u * Math.cos(p.aoa(a)),
  };
}

/* ------------------------------------------------------------------ */
/* Endplate                                                            */
/* ------------------------------------------------------------------ */
// Outline in the z-y plane, inboard face to outboard face. Much deeper
// front-to-back and much thicker than a 2025 endplate, because for 2026 the
// endplate is what carries the assembly out to maximum width.

const EP_IN = [
  [2.845, 0.030], [2.780, 0.132], [2.706, 0.252], [2.560, 0.318],
  [2.418, 0.320], [2.372, 0.250], [2.390, 0.036],
];
const EP_OUT = [
  [2.796, 0.042], [2.742, 0.140], [2.684, 0.244], [2.556, 0.298],
  [2.436, 0.296], [2.400, 0.236], [2.414, 0.050],
];

function endplateSection(x, t) {
  const pts = EP_IN.map((p, i) => {
    const q = EP_OUT[i];
    // Slight outward bow through the middle of the endplate thickness.
    const bow = Math.sin(Math.PI * t) * 0.006;
    return V(x, p[1] + (q[1] - p[1]) * t + bow, p[0] + (q[0] - p[0]) * t);
  });
  return resample(pts, 40);
}

/* ------------------------------------------------------------------ */

export function buildAero(ctx) {
  const { add, M, root, movables } = ctx;

  /* ================================================================== */
  /* FRONT WING                                                         */
  /* ================================================================== */

  // Plane 1: mainplane, fixed.
  add('front-wing-mainplane',
    wingElement(planeStations(PLANES.mainplane, -FW_SPAN, FW_SPAN, 22)),
    M.bodyBlack);

  // Plane 2: fixed on the W17, because the pylons land on it.
  add('front-wing-second-element',
    wingElement(planeStations(PLANES.second, -FW_SPAN, FW_SPAN, 22)),
    M.bodyBlack);

  // Plane 3, central panel: static on this car.
  add('front-wing-upper-flap-centre',
    wingElement(planeStations(PLANES.third, -0.225, 0.225, 10)),
    M.bodyBlack);

  // Plane 3, outboard panels: the only movable aerodynamic surfaces at the
  // front of this car. Hinged about the leading edge at mid-panel.
  const hinge = leadingEdge(PLANES.third, 0.65);
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0, hinge.y, hinge.z);
    root.add(pivot);
    const geo = wingElement(
      planeStations(PLANES.third, sx * 0.240, sx * FW_SPAN, 12, hinge)
    );
    add('front-wing-upper-flap', geo, M.bodyBlack, {
      parent: pivot,
      anchor: [sx * 0.52, hinge.y + 0.05, hinge.z - 0.05],
    });
    movables.push({ obj: pivot, closed: 0, open: -rad(22), id: 'front-wing-upper-flap' });
  }

  // Endplates.
  for (const sx of [-1, 1]) {
    const stations = [0, 0.34, 0.68, 1].map((t) =>
      endplateSection(sx * (FW_SPAN + t * (FW_EP - FW_SPAN)), t)
    );
    add('front-wing-endplate', loft(stations, { capStart: true, capEnd: true }), M.bodySilver);

    // Footplate shelf along the base, turning flow around the front tyre.
    const foot = plate(
      [{ x: sx * 0.744, z: 2.770 }, { x: sx * FW_EP, z: 2.726 },
       { x: sx * FW_EP, z: 2.412 }, { x: sx * 0.744, z: 2.392 }],
      0.013, 'y'
    );
    foot.translate(0, 0.036, 0);
    add('front-wing-footplate', foot, M.carbonFine);

    // Strakes standing on the footplate, inboard of the endplate.
    for (let i = 0; i < 2; i++) {
      const st = plate(
        [{ y: 0.042, z: 2.700 - i * 0.05 }, { y: 0.116 - i * 0.018, z: 2.676 - i * 0.05 },
         { y: 0.110 - i * 0.018, z: 2.470 }, { y: 0.040, z: 2.452 }],
        0.006, 'x'
      );
      st.translate(sx * (0.700 - i * 0.070), 0, 0);
      add('front-wing-strake', st, M.carbonFine);
    }

    // Diveplane on the outer face.
    const dive = plate(
      [{ x: sx * 0.884, z: 2.652 }, { x: sx * FW_EP, z: 2.634 },
       { x: sx * FW_EP, z: 2.506 }, { x: sx * 0.884, z: 2.512 }],
      0.008, 'y'
    );
    dive.translate(0, 0.238, 0);
    add('front-wing-diveplane', dive, M.carbonFine);

    // Flap adjuster at the outboard end of the movable element.
    const brk = plate(
      [{ y: 0.190, z: 2.508 }, { y: 0.286, z: 2.486 }, { y: 0.284, z: 2.436 }, { y: 0.188, z: 2.458 }],
      0.006, 'x'
    );
    brk.translate(sx * 0.786, 0, 0);
    add('front-wing-flap-adjuster', brk, M.aluminium);

    const screw = new THREE.CylinderGeometry(0.0055, 0.0055, 0.020, 8);
    screw.rotateZ(Math.PI / 2);
    screw.translate(sx * 0.786, 0.236, 2.472);
    add('flap-adjuster-screw', screw, M.fastener);
  }

  // Twin pylons, picking up on the second plane. The gap this leaves under
  // the nose is the channel feeding the underfloor.
  const p2le = leadingEdge(PLANES.second, 0.10);
  for (const sx of [-1, 1]) {
    const pyl = plate(
      [{ y: 0.200, z: 2.700 }, { y: 0.206, z: 2.596 },
       { y: p2le.y + 0.010, z: p2le.z - 0.020 }, { y: p2le.y + 0.004, z: p2le.z + 0.052 }],
      0.020, 'x'
    );
    pyl.translate(sx * 0.082, 0, 0);
    add('front-wing-pylon', pyl, M.bodySilver);
  }

  /* ================================================================== */
  /* REAR WING                                                          */
  /* ================================================================== */

  const RW = D.rearWingSpan;           // 0.470 element half-span
  const RW_EP = 0.500;                 // endplate outer face

  const rwStations = (yc, chord, aoaDeg, zc, rise) => {
    const out = [];
    for (let i = 0; i <= 14; i++) {
      const x = -RW + (2 * RW * i) / 14;
      const a = Math.abs(x) / RW;
      out.push({
        x, chord: chord - 0.014 * a * a, aoa: rad(aoaDeg),
        y: yc + rise * a * a, z: zc, t: 0.095, m: -0.080,
      });
    }
    return out;
  };

  add('rear-wing-mainplane',
    wingElement(rwStations(0.735, 0.200, 10, -2.265, 0.012)),
    M.bodyBlack);

  const rwFlaps = [
    { id: 'rear-wing-flap-1', yc: 0.7912, chord: 0.130, aoa: 24, zc: -2.4367, open: -38 },
    { id: 'rear-wing-flap-2', yc: 0.8610, chord: 0.095, aoa: 36, zc: -2.5400, open: -44 },
  ];

  for (const f of rwFlaps) {
    const u = -0.25 * f.chord;
    const hy = f.yc + u * Math.sin(rad(f.aoa));
    const hz = f.zc - u * Math.cos(rad(f.aoa));
    const pivot = new THREE.Group();
    pivot.position.set(0, hy, hz);
    root.add(pivot);
    const geo = wingElement(rwStations(f.yc - hy, f.chord, f.aoa, f.zc - hz, 0.010));
    add(f.id, geo, M.bodyBlack, { parent: pivot, anchor: [0, hy + 0.03, hz - 0.05] });
    movables.push({ obj: pivot, closed: 0, open: rad(f.open), id: f.id });
  }

  for (const sx of [-1, 1]) {
    const ep = plate(
      [{ y: 0.600, z: -2.200 }, { y: 0.935, z: -2.286 }, { y: 0.930, z: -2.584 },
       { y: 0.690, z: -2.596 }, { y: 0.592, z: -2.400 }],
      0.012, 'x'
    );
    ep.translate(sx * (RW_EP - 0.006), 0, 0);
    add('rear-wing-endplate', ep, M.bodySilver);

    for (let i = 0; i < 3; i++) {
      const lv = new THREE.BoxGeometry(0.016, 0.034, 0.004);
      lv.rotateX(0.3);
      lv.translate(sx * (RW_EP - 0.006), 0.870 - i * 0.046, -2.320 - i * 0.012);
      add('rear-wing-endplate-louvre', lv, M.structureBlack);
    }

    const pyl = plate(
      [{ y: 0.330, z: -2.100 }, { y: 0.730, z: -2.226 }, { y: 0.728, z: -2.330 },
       { y: 0.330, z: -2.226 }],
      0.024, 'x'
    );
    pyl.translate(sx * 0.096, 0, 0);
    add('rear-wing-pylon', pyl, M.bodySilver);

    const act = new THREE.CylinderGeometry(0.022, 0.022, 0.085, 14);
    act.rotateZ(Math.PI / 2);
    act.translate(sx * 0.100, 0.778, -2.407);
    add('active-aero-actuator', act, M.aluminium);

    const link = new THREE.CylinderGeometry(0.006, 0.006, 0.100, 8);
    link.rotateX(0.75);
    link.translate(sx * 0.148, 0.818, -2.462);
    add('active-aero-linkage', link, M.aluminium);
  }

  const brace = new THREE.CylinderGeometry(0.010, 0.010, 2 * RW * 0.88, 10);
  brace.rotateZ(Math.PI / 2);
  brace.translate(0, 0.712, -2.222);
  add('rear-wing-brace', brace, M.carbonFine);

  /* ================================================================== */
  /* REAR STRUCTURES                                                    */
  /* ================================================================== */

  const ris = new THREE.CylinderGeometry(0.052, 0.080, 0.360, 18);
  ris.rotateX(Math.PI / 2);
  ris.translate(0, 0.318, -2.140);
  add('rear-impact-structure', ris, M.carbonFine);

  const light = new THREE.BoxGeometry(0.072, 0.052, 0.020);
  light.translate(0, 0.318, -2.316);
  add('rain-light', light, M.rainLight);

  for (const sx of [-1, 1]) {
    const l2 = new THREE.BoxGeometry(0.012, 0.042, 0.016);
    l2.translate(sx * (RW_EP - 0.006), 0.710, -2.556);
    add('auxiliary-rain-light', l2, M.rainLight);
  }

  const pipe = new THREE.CylinderGeometry(0.046, 0.050, 0.200, 18, 1, true);
  pipe.rotateX(Math.PI / 2 - 0.10);
  pipe.translate(0, 0.392, -2.010);
  add('exhaust-tailpipe', pipe, M.inconel);

  for (const sx of [-1, 1]) {
    const wg = new THREE.CylinderGeometry(0.017, 0.018, 0.150, 12, 1, true);
    wg.rotateX(Math.PI / 2 - 0.12);
    wg.translate(sx * 0.060, 0.376, -1.985);
    add('wastegate-pipe', wg, M.inconel);
  }

  const towF = new THREE.TorusGeometry(0.022, 0.006, 8, 16);
  towF.rotateY(Math.PI / 2);
  towF.translate(0, 0.178, 2.560);
  add('front-towing-eye', towF, M.aluminium);

  const towR = new THREE.TorusGeometry(0.024, 0.007, 8, 16);
  towR.rotateY(Math.PI / 2);
  towR.translate(0, 0.262, -2.210);
  add('rear-towing-eye', towR, M.aluminium);
}
