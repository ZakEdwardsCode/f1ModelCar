// build-chassis.js - survival cell, nose, cockpit, halo, bodywork, floor.
//
// Proportions follow the vertical layout in dims.js. The single most
// important one: the survival cell is a deep tub whose underside sits just
// above the floor and whose flanks rise past half the car's height. Getting
// that wrong makes the car read as a slab on stilts from every angle.

import * as THREE from 'three';
import { loft, plate, resample, clamp, smooth } from '../../lib/geom.js';
import D, { TUB_PLAN } from './dims.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const NSEC = 56;

/* ------------------------------------------------------------------ */
/* Section helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Survival cell cross-section: a rounded trapezoid, narrower at the floor
 * than at the cockpit rim, with fairly flat flanks.
 */
function tubSection({ z, w, yBot, yTop, botScale = 0.70, n = NSEC }) {
  const yc = (yBot + yTop) / 2;
  const h = (yTop - yBot) / 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const up = st >= 0;
    const ww = up ? w : w * botScale;
    const e = up ? 2.35 : 2.70;
    pts.push(V(
      ww * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / 3.0),
      yc + h * Math.sign(st) * Math.pow(Math.abs(st), 2 / e),
      z
    ));
  }
  return pts;
}

// Open the cockpit by pulling the crown of the section down between the
// flanks. The blend is steep because a real survival cell keeps tall,
// near-vertical sides either side of the driver for intrusion protection.
function scoop(pts, yc, halfInner, depth) {
  return pts.map((p) => {
    if (p.y <= yc + 0.005) return p;
    const a = Math.abs(p.x) / halfInner;
    if (a >= 1) return p;
    const t = Math.pow(1 - smooth(clamp(a, 0, 1)), 0.5);
    return V(p.x, p.y - depth * t, p.z);
  });
}

/** Sidepod section with an undercut: the lower flank tucks inboard. */
function podSection({ z, xc, w, wBot, yBot, yTop, n = NSEC, sign = 1 }) {
  const yc = (yBot + yTop) / 2;
  const h = (yTop - yBot) / 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const up = st >= 0;
    const ww = up ? w : wBot;
    const e = up ? 2.9 : 2.0;
    pts.push(V(
      sign * (xc + ww * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / 3.4)),
      yc + h * Math.sign(st) * Math.pow(Math.abs(st), 2 / e),
      z
    ));
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Floor cross-section with venturi tunnels                            */
/* ------------------------------------------------------------------ */

function tunnelDepth(z) {
  if (z > D.zFloorFront - 0.12) return 0.002;
  const tIn = clamp((D.zFloorFront - 0.12 - z) / 0.55, 0, 1);
  const ramp = smooth(tIn) * 0.052;
  if (z > -1.15) return ramp;
  const tOut = clamp((-1.15 - z) / 0.71, 0, 1);
  return ramp + smooth(tOut) * 0.105;
}

function floorHalfWidth(z) {
  const keys = [
    [D.zFloorFront, 0.420], [1.10, 0.575], [0.60, 0.715], [0.00, D.floorHalfWidth],
    [-0.80, D.floorHalfWidth], [-1.30, 0.685], [-1.60, 0.605], [D.zFloorRear, 0.555],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [z0, w0] = keys[i];
    const [z1, w1] = keys[i + 1];
    if (z <= z0 && z >= z1) return w0 + (w1 - w0) * smooth((z0 - z) / (z0 - z1));
  }
  return z > keys[0][0] ? keys[0][1] : keys[keys.length - 1][1];
}

function floorSection(z, nSide = 34) {
  const hw = floorHalfWidth(z);
  const depth = tunnelDepth(z);
  const thick = 0.022;
  const tunXc = hw * 0.55;
  const tunHw = hw * 0.36;

  // The floor is a constant-thickness shell moulded over the two tunnels,
  // so the upper surface follows the tunnel ceilings and the central keel
  // stays low. That keel is what leaves room for the engine to sit at its
  // regulated crankshaft height.
  const lift = (x) => {
    const d = Math.abs(Math.abs(x) - tunXc) / tunHw;
    return d < 1 ? depth * Math.pow(Math.cos((d * Math.PI) / 2), 1.5) : 0;
  };
  const xAt = (i) => -hw + 2 * hw * (i / nSide);

  const bottom = [];
  for (let i = 0; i <= nSide; i++) bottom.push(V(xAt(i), D.yFloor + lift(xAt(i)), z));
  const top = [];
  for (let i = nSide; i >= 0; i--) top.push(V(xAt(i), D.yFloor + lift(xAt(i)) + thick, z));
  return bottom.concat(top);
}

/* ------------------------------------------------------------------ */
/* Main build                                                          */
/* ------------------------------------------------------------------ */

export function buildChassis(ctx) {
  const { add, M } = ctx;

  /* --- Survival cell and nose --------------------------------------- */
  const tubRings = TUB_PLAN.map(([z, w, yBot, yTop]) => {
    let ring = tubSection({ z, w, yBot, yTop });
    if (z <= D.zCockpitFront && z >= D.zCockpitRear) {
      const yc = (yBot + yTop) / 2;
      const t = smooth(clamp((D.zCockpitFront - z) / 0.30, 0, 1)) *
                smooth(clamp((z - D.zCockpitRear) / 0.26, 0, 1));
      ring = scoop(ring, yc, w * 0.80, 0.215 * t + 0.015);
    }
    return ring;
  });

  // Nose and tub meet on a shared ring, so there are no coincident surfaces
  // to z-fight along the joint.
  add('nose-cone', loft(tubRings.slice(0, 7), { capStart: true }), M.bodySilver);
  add('survival-cell', loft(tubRings.slice(6), { capEnd: true }), M.bodyFlank);

  // Channel moulded into the underside of the nose. On the W17 the front
  // wing pylons pick up on the second plane specifically to open this path,
  // feeding the underfloor and the T-tray behind it.
  const chanRings = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const z = 2.70 - t * 0.78;
    const w = 0.034 + t * 0.075;
    const y = 0.196 - t * 0.058;
    const ring = [];
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      ring.push(V(w * Math.cos(a), y + 0.028 * Math.sin(a) - 0.010, z));
    }
    chanRings.push(ring);
  }
  add('nose-underfloor-channel', loft(chanRings), M.structureBlack);

  const fis = new THREE.CylinderGeometry(0.048, 0.028, 0.34, 20, 1, true);
  fis.rotateX(Math.PI / 2);
  fis.translate(0, 0.238, 2.72);
  add('front-impact-structure', fis, M.carbonFine);

  const fbh = plate(
    [{ x: -0.20, y: 0.088 }, { x: 0.20, y: 0.088 }, { x: 0.20, y: 0.428 }, { x: -0.20, y: 0.428 }],
    0.016, 'z'
  );
  fbh.translate(0, 0, D.zFrontBulkhead);
  add('front-bulkhead', fbh, M.carbonFine);

  /* --- Cockpit ------------------------------------------------------- */
  const openings = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const z = 1.060 - t * 0.960;
    const w = 0.232 * Math.sin(Math.PI * clamp(0.16 + t * 0.80, 0, 1)) + 0.062;
    const y = 0.330 + 0.070 * Math.sin(Math.PI * t);
    const ring = [];
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      ring.push(V(w * Math.cos(a) * 0.88, y + 0.055 * Math.sin(a), z));
    }
    openings.push(ring);
  }
  add('cockpit-opening', loft(openings, { capStart: true, capEnd: true }), M.structureBlack);

  for (const sx of [-1, 1]) {
    const pad = new THREE.BoxGeometry(0.070, 0.150, 0.300);
    pad.translate(sx * 0.212, 0.520, 0.330);
    add('cockpit-padding', pad, M.nomex);
  }

  const headrest = new THREE.BoxGeometry(0.300, 0.150, 0.110);
  headrest.translate(0, 0.545, 0.148);
  add('headrest', headrest, M.nomex);

  // Driver stand-in, so the cockpit reads at the right scale.
  const torso = new THREE.BoxGeometry(0.290, 0.230, 0.330);
  torso.translate(0, D.yDriverShoulder - 0.045, 0.315);
  add('driver-torso', torso, M.nomex);

  const helmet = new THREE.SphereGeometry(0.126, 26, 20);
  helmet.scale(1, 1.10, 1.14);
  helmet.translate(0, D.yHelmetCentre, 0.420);
  add('driver-helmet', helmet, M.helmet);

  const visor = new THREE.SphereGeometry(0.127, 26, 20, 0, Math.PI * 2, 0.95, 0.40);
  visor.scale(1, 1.10, 1.14);
  visor.translate(0, D.yHelmetCentre, 0.420);
  add('helmet-visor', visor, M.visor);

  const hans = new THREE.TorusGeometry(0.115, 0.028, 10, 20, Math.PI);
  hans.rotateY(Math.PI / 2);
  hans.rotateZ(-Math.PI / 2);
  hans.translate(0, 0.500, 0.335);
  add('hans-device', hans, M.carbonFine);

  for (const sx of [-1, 1]) {
    const strap = new THREE.BoxGeometry(0.055, 0.005, 0.240);
    strap.rotateX(-0.60);
    strap.translate(sx * 0.085, 0.455, 0.410);
    add('safety-harness', strap, M.nomex);
  }

  /* --- Steering ------------------------------------------------------ */
  const swY = 0.472;
  const swZ = 0.742;
  const swBody = new THREE.BoxGeometry(0.272, 0.112, 0.030);
  swBody.rotateX(-0.44);
  swBody.translate(0, swY, swZ);
  add('steering-wheel', swBody, M.carbonFine);

  const swDisplay = new THREE.BoxGeometry(0.114, 0.056, 0.006);
  swDisplay.rotateX(-0.44);
  swDisplay.translate(0, swY + 0.007, swZ + 0.015);
  add('steering-wheel-display', swDisplay, M.glass);

  for (const sx of [-1, 1]) {
    const grip = new THREE.CylinderGeometry(0.021, 0.021, 0.100, 12);
    grip.rotateZ(0.20 * sx);
    grip.rotateX(-0.44);
    grip.translate(sx * 0.117, swY - 0.010, swZ + 0.006);
    add('steering-wheel-grip', grip, M.nomex);

    const shift = new THREE.BoxGeometry(0.012, 0.062, 0.006);
    shift.rotateX(-0.44);
    shift.translate(sx * 0.097, swY - 0.018, swZ - 0.030);
    add('shift-paddle', shift, M.carbonFine);

    const clutch = new THREE.BoxGeometry(0.010, 0.044, 0.005);
    clutch.rotateX(-0.44);
    clutch.translate(sx * 0.062, swY - 0.033, swZ - 0.026);
    add('clutch-paddle', clutch, M.aluminium);

    for (let r = 0; r < 2; r++) {
      const rot = new THREE.CylinderGeometry(0.017, 0.017, 0.012, 14);
      rot.rotateX(Math.PI / 2 - 0.44);
      rot.translate(sx * (0.070 + r * 0.044), swY + 0.024 - r * 0.028, swZ + 0.013);
      add('steering-wheel-rotary', rot, M.aluminium);
    }
    for (let b = 0; b < 3; b++) {
      const btn = new THREE.CylinderGeometry(0.0075, 0.0075, 0.008, 10);
      btn.rotateX(Math.PI / 2 - 0.44);
      btn.translate(sx * (0.045 + b * 0.028), swY - 0.024, swZ + 0.008);
      add('steering-wheel-button', btn, M.aluminium);
    }
  }

  const column = new THREE.CylinderGeometry(0.022, 0.026, 0.320, 14);
  column.rotateX(Math.PI / 2 - 0.44);
  column.translate(0, 0.400, 0.600);
  add('steering-column', column, M.carbonFine);

  const rack = new THREE.BoxGeometry(0.330, 0.055, 0.072);
  rack.translate(0, 0.262, 1.330);
  add('steering-rack', rack, M.aluminium);

  /* --- Halo ---------------------------------------------------------- */
  // Rear mounts sit on the cockpit rim, the ring arcs up over the driver's
  // head and meets the central front pillar ahead of the cockpit.
  // A halo is a near-level ring around the cockpit, not an arch. It runs
  // from the two rear mounts on the cockpit rim, forward and slightly
  // inboard at roughly constant height, to a junction ahead of the driver
  // where the single central pillar drops down to the chassis.
  const HALO_HALF = [
    V(0.300, 0.556, 0.075),
    V(0.316, 0.664, 0.330),
    V(0.306, 0.716, 0.600),
    V(0.262, 0.740, 0.830),
    V(0.158, 0.750, 1.028),
    V(0.062, 0.750, 1.108),
    V(0.000, 0.746, 1.130),
  ];
  const haloPts = [
    ...HALO_HALF.slice().reverse().map((p) => V(-p.x, p.y, p.z)),
    ...HALO_HALF.slice(1),
  ];
  const halo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(haloPts), 96, 0.0185, 10, false);
  add('halo', halo, M.structureBlack);

  const pillar = new THREE.CylinderGeometry(0.019, 0.023, 0.232, 14);
  pillar.rotateX(-0.09);
  pillar.translate(0, 0.632, 1.122);
  add('halo-front-pillar', pillar, M.structureBlack);

  for (const sx of [-1, 1]) {
    const mount = new THREE.CylinderGeometry(0.030, 0.034, 0.060, 12);
    mount.translate(sx * 0.300, 0.556, 0.075);
    add('halo-rear-mount', mount, M.titanium);
    for (let b = 0; b < 3; b++) {
      const bolt = new THREE.CylinderGeometry(0.0055, 0.0055, 0.018, 6);
      const a = (b / 3) * Math.PI * 2;
      bolt.translate(sx * 0.300 + Math.cos(a) * 0.021, 0.530, 0.075 + Math.sin(a) * 0.021);
      add('halo-mounting-bolt', bolt, M.fastener);
    }
  }

  /* --- Mirrors ------------------------------------------------------- */
  for (const sx of [-1, 1]) {
    const stalk = new THREE.CylinderGeometry(0.011, 0.013, 0.130, 10);
    stalk.rotateZ(Math.PI / 2 - 0.30);
    stalk.translate(sx * 0.340, 0.498, 0.790);
    add('mirror-stalk', stalk, M.carbonFine);

    const housing = new THREE.BoxGeometry(0.030, 0.062, 0.100);
    housing.translate(sx * 0.408, 0.512, 0.790);
    add('mirror-housing', housing, M.bodyBlack);

    const glass = new THREE.BoxGeometry(0.005, 0.052, 0.088);
    glass.translate(sx * 0.394, 0.512, 0.790);
    add('mirror-glass', glass, M.mirror);
  }

  /* --- Roll structure and airbox ------------------------------------- */
  const hoopPts = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const a = Math.PI * t;
    hoopPts.push(V(
      Math.cos(a) * 0.158,
      0.560 + Math.sin(a) * (D.yRollHoopTop - 0.030 - 0.560),
      0.060 - Math.abs(Math.cos(a)) * 0.040
    ));
  }
  const hoop = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hoopPts), 52, 0.030, 10, false);
  add('roll-hoop', hoop, M.titanium);

  const hoopBlade = plate(
    [{ x: -0.022, y: 0.560 }, { x: 0.022, y: 0.560 }, { x: 0.016, y: 0.930 }, { x: -0.016, y: 0.930 }],
    0.110, 'z'
  );
  hoopBlade.translate(0, 0, 0.035);
  add('roll-structure-blade', hoopBlade, M.bodyBlack);

  // Airbox plenum inlet above the driver.
  const abRings = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const z = 0.185 - t * 0.300;
    const w = 0.112 - t * 0.024;
    const h = 0.088 - t * 0.016;
    const y = D.yAirboxTop - 0.088 - t * 0.048;
    const ring = [];
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2;
      ring.push(V(
        w * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.7),
        y + h * Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.7),
        z
      ));
    }
    abRings.push(ring);
  }
  add('airbox-intake', loft(abRings, { capEnd: true }), M.structureBlack);

  const abLip = new THREE.TorusGeometry(0.102, 0.011, 8, 26);
  abLip.scale(1.0, 0.84, 1.0);
  abLip.translate(0, D.yAirboxTop - 0.088, 0.187);
  add('airbox-lip', abLip, M.bodySilver);

  for (const sx of [-1, 1]) {
    const aux = new THREE.CylinderGeometry(0.030, 0.026, 0.090, 12);
    aux.rotateX(Math.PI / 2);
    aux.translate(sx * 0.132, D.yAirboxTop - 0.130, 0.145);
    add('airbox-auxiliary-inlet', aux, M.structureBlack);
  }

  /* --- Engine cover -------------------------------------------------- */
  // Pulls in hard behind the sidepods: the coke-bottle taper is what makes
  // the rear of an F1 car read correctly.
  const coverPlan = [
    [0.150, 0.175, 0.480, 0.940],
    [-0.060, 0.215, 0.430, 0.870],
    [-0.360, 0.232, 0.390, 0.790],
    [-0.700, 0.225, 0.350, 0.700],
    [-1.040, 0.195, 0.320, 0.610],
    [-1.380, 0.148, 0.300, 0.530],
    [-1.660, 0.105, 0.290, 0.470],
    [-1.880, 0.070, 0.285, 0.430],
    [-2.020, 0.045, 0.285, 0.400],
  ];
  const coverRings = coverPlan.map(([z, w, yBot, yTop]) =>
    tubSection({ z, w, yBot, yTop, botScale: 0.96 })
  );
  add('engine-cover', loft(coverRings, { capEnd: true }), M.bodyBlack);

  // Shark fin along the spine, carrying the car number.
  const finPts = [
    { z: -0.30, y: 0.800 }, { z: -0.80, y: 0.688 }, { z: -1.30, y: 0.556 },
    { z: -1.75, y: 0.455 }, { z: -2.02, y: 0.400 }, { z: -2.02, y: 0.372 },
    { z: -1.75, y: 0.420 }, { z: -1.30, y: 0.512 }, { z: -0.80, y: 0.645 },
    { z: -0.30, y: 0.762 },
  ];
  add('shark-fin', plate(finPts, 0.013, 'x'), M.bodyBlack);

  for (const sx of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const lv = new THREE.BoxGeometry(0.004, 0.030, 0.085);
      lv.rotateX(0.22);
      lv.rotateY(sx * 0.18);
      lv.translate(sx * (0.196 - i * 0.006), 0.560 - i * 0.026, -0.560 - i * 0.030);
      add('engine-cover-louvre', lv, M.structureBlack);
    }
    for (let i = 0; i < 6; i++) {
      const f = new THREE.CylinderGeometry(0.009, 0.009, 0.006, 12);
      f.rotateZ(Math.PI / 2);
      f.translate(sx * (0.222 - i * 0.026), 0.500 - i * 0.032, -0.100 - i * 0.300);
      add('bodywork-quarter-turn-fastener', f, M.fastener);
    }
  }

  /* --- Sidepods ------------------------------------------------------ */
  const podPlan = [
    // z,     xc,    w,     wBot,  yBot,  yTop
    [0.985, 0.430, 0.085, 0.055, 0.215, 0.470],
    [0.840, 0.470, 0.120, 0.078, 0.185, 0.492],
    [0.560, 0.515, 0.175, 0.112, 0.150, 0.502],
    [0.180, 0.533, 0.203, 0.130, 0.132, 0.500],
    [-0.180, 0.530, 0.205, 0.132, 0.130, 0.492],
    [-0.520, 0.495, 0.183, 0.118, 0.135, 0.470],
    [-0.820, 0.428, 0.145, 0.092, 0.145, 0.435],
    [-1.100, 0.348, 0.105, 0.068, 0.160, 0.395],
    [-1.340, 0.272, 0.068, 0.045, 0.175, 0.360],
  ];

  for (const sx of [-1, 1]) {
    const rings = podPlan.map(([z, xc, w, wBot, yBot, yTop]) =>
      podSection({ z, xc, w, wBot, yBot, yTop, sign: sx })
    );
    add('sidepod', loft(rings, { capStart: true, capEnd: true }), M.bodyBlack);

    // Striped panel across the top of the sidepod, the signature detail of
    // the 2026 livery.
    const stripeRings = podPlan.slice(0, 8).map(([z, xc, w, wBot, yBot, yTop]) => {
      const yc = (yBot + yTop) / 2;
      const h = (yTop - yBot) / 2;
      const ring = [];
      for (let k = 0; k <= 14; k++) {
        const a = Math.PI * (0.12 + (k / 14) * 0.76);
        ring.push(V(
          sx * (xc + w * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 2 / 3.4) * 0.985),
          yc + h * Math.pow(Math.abs(Math.sin(a)), 2 / 2.9) * 0.985,
          z
        ));
      }
      return ring;
    });
    add('sidepod-stripe-panel', loft(stripeRings, { closed: false }), M.stripePanel);

    // Radiator inlet: high-set and narrow, with the undercut beneath.
    const mouth = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      const z = 0.998 - t * 0.150;
      const ring = [];
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        const w = (0.070 - t * 0.012) * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.55);
        const h = (0.098 - t * 0.014) * Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.55);
        ring.push(V(sx * (0.432 + w), 0.352 + h, z));
      }
      mouth.push(ring);
    }
    add('sidepod-inlet', loft(mouth, { capEnd: true }), M.structureBlack);

    const vane = plate(
      [{ y: 0.268, z: 0.995 }, { y: 0.440, z: 0.995 }, { y: 0.432, z: 0.905 }, { y: 0.272, z: 0.905 }],
      0.006, 'x'
    );
    vane.translate(sx * 0.432, 0, 0);
    add('sidepod-inlet-splitter', vane, M.carbonFine);

    // In-washing wheel wake control boards ahead of the sidepod.
    const board = plate(
      [{ y: 0.062, z: 1.190 }, { y: 0.268, z: 1.158 }, { y: 0.278, z: 0.962 }, { y: 0.072, z: 0.930 }],
      0.008, 'x'
    );
    board.translate(sx * 0.505, 0, 0);
    add('wheel-wake-control-board', board, M.carbonFine);

    const board2 = plate(
      [{ y: 0.058, z: 1.128 }, { y: 0.218, z: 1.100 }, { y: 0.226, z: 0.956 }, { y: 0.066, z: 0.930 }],
      0.007, 'x'
    );
    board2.translate(sx * 0.612, 0, 0);
    add('wheel-wake-control-board', board2, M.carbonFine);

    for (let i = 0; i < 5; i++) {
      const lv = new THREE.BoxGeometry(0.052, 0.004, 0.030);
      lv.rotateX(0.35);
      lv.translate(sx * (0.468 - i * 0.014), 0.452 - i * 0.008, -0.420 - i * 0.042);
      add('sidepod-cooling-louvre', lv, M.structureBlack);
    }

    for (let k = 0; k < 2; k++) {
      const sis = new THREE.CylinderGeometry(0.044, 0.056, 0.420, 14);
      sis.rotateZ(Math.PI / 2);
      sis.rotateY(0.10 * sx);
      sis.translate(sx * 0.330, 0.230 + k * 0.120, 0.620 - k * 0.120);
      add('side-impact-structure', sis, M.carbonFine);
    }
  }

  /* --- Floor, tunnels and diffuser ----------------------------------- */
  const floorRings = [];
  for (let i = 0; i <= 44; i++) {
    floorRings.push(floorSection(D.zFloorFront + (D.zFloorRear - D.zFloorFront) * (i / 44)));
  }
  add('floor', loft(floorRings, { capStart: true, capEnd: true }), M.carbon);

  const plank = new THREE.BoxGeometry(0.300, 0.010, 2.900);
  plank.translate(0, D.yFloor - 0.005, -0.150);
  add('plank', plank, M.nomex);

  for (const pz of [1.05, 0.10, -0.90, -1.45]) {
    const skid = new THREE.CylinderGeometry(0.038, 0.038, 0.011, 16);
    skid.translate(0, D.yFloor - 0.0045, pz);
    add('titanium-skid-block', skid, M.titanium);
  }

  for (const sx of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const h = 0.062 - i * 0.008;
      const fence = plate(
        [{ y: D.yFloor, z: 1.415 - i * 0.02 }, { y: D.yFloor + h, z: 1.395 - i * 0.03 },
         { y: D.yFloor + h * 0.8, z: 1.145 - i * 0.02 }, { y: D.yFloor, z: 1.130 }],
        0.006, 'x'
      );
      fence.translate(sx * (0.175 + i * 0.105), 0, 0);
      add('floor-fence', fence, M.carbonFine);
    }

    const edge = plate(
      [{ y: D.yFloor + 0.004, z: 0.60 }, { y: D.yFloor + 0.050, z: 0.30 },
       { y: D.yFloor + 0.056, z: -0.90 }, { y: D.yFloor + 0.010, z: -1.30 },
       { y: D.yFloor - 0.004, z: -1.20 }, { y: D.yFloor - 0.002, z: 0.40 }],
      0.008, 'x'
    );
    edge.translate(sx * 0.735, 0, 0);
    add('floor-edge-wing', edge, M.carbonFine);

    for (let i = 0; i < 3; i++) {
      const strake = plate(
        [{ y: D.yFloor, z: -1.30 }, { y: D.yFloor + 0.072 + i * 0.010, z: -1.55 },
         { y: D.yFloor + 0.130 + i * 0.012, z: -1.86 }, { y: D.yFloor, z: -1.86 }],
        0.006, 'x'
      );
      strake.translate(sx * (0.185 + i * 0.145), 0, 0);
      add('diffuser-strake', strake, M.carbonFine);
    }

    const dsw = plate(
      [{ y: D.yFloor, z: -1.30 }, { y: D.yFloor + 0.068, z: -1.58 },
       { y: D.yFloor + 0.157, z: -1.86 }, { y: D.yFloor, z: -1.86 }],
      0.009, 'x'
    );
    dsw.translate(sx * 0.552, 0, 0);
    add('diffuser-sidewall', dsw, M.carbonFine);

    // Bargeboards behind the front wheels.
    for (let i = 0; i < 3; i++) {
      const bb = plate(
        [{ y: 0.056, z: 1.320 - i * 0.03 }, { y: 0.206 - i * 0.022, z: 1.300 - i * 0.03 },
         { y: 0.200 - i * 0.022, z: 1.080 }, { y: 0.050, z: 1.060 }],
        0.006, 'x'
      );
      bb.translate(sx * (0.560 + i * 0.058), 0, 0);
      add('bargeboard', bb, M.carbonFine);
    }

    // T-tray vanes under the nose, working the channel above them.
    for (let i = 0; i < 2; i++) {
      const tt = plate(
        [{ y: 0.052, z: 2.020 - i * 0.10 }, { y: 0.130 - i * 0.016, z: 2.000 - i * 0.10 },
         { y: 0.124 - i * 0.016, z: 1.760 }, { y: 0.048, z: 1.740 }],
        0.006, 'x'
      );
      tt.translate(sx * (0.086 + i * 0.062), 0, 0);
      add('t-tray-vane', tt, M.carbonFine);
    }
  }

  const gurney = new THREE.BoxGeometry(1.060, 0.020, 0.006);
  gurney.translate(0, D.yFloor + 0.157 + 0.030, -1.862);
  add('diffuser-gurney', gurney, M.carbonFine);

  const exitDuct = new THREE.CylinderGeometry(0.048, 0.038, 0.100, 16, 1, true);
  exitDuct.rotateX(Math.PI / 2);
  exitDuct.translate(0, 0.335, -2.020);
  add('central-cooling-exit', exitDuct, M.structureBlack);

  /* --- Cameras and sensors ------------------------------------------- */
  for (const sx of [-1, 1]) {
    const pod = new THREE.BoxGeometry(0.052, 0.040, 0.085);
    pod.translate(sx * 0.126, 0.792, 0.250);
    add('onboard-camera-pod', pod, M.structureBlack);
    const lens = new THREE.CylinderGeometry(0.014, 0.014, 0.006, 14);
    lens.rotateX(Math.PI / 2);
    lens.translate(sx * 0.126, 0.792, 0.294);
    add('onboard-camera-lens', lens, M.glass);
  }

  const noseCam = new THREE.BoxGeometry(0.040, 0.032, 0.062);
  noseCam.translate(0, 0.318, 2.260);
  add('nose-camera-pod', noseCam, M.structureBlack);

  const pitot = new THREE.CylinderGeometry(0.005, 0.005, 0.110, 8);
  pitot.rotateX(Math.PI / 2);
  pitot.translate(0, 0.300, 2.490);
  add('pitot-tube', pitot, M.aluminium);

  const aerial = new THREE.BoxGeometry(0.050, 0.014, 0.070);
  aerial.translate(0, 0.905, 0.010);
  add('gps-aerial', aerial, M.structureBlack);

  const marshal = new THREE.CylinderGeometry(0.018, 0.018, 0.010, 14);
  marshal.rotateX(Math.PI / 2);
  marshal.translate(-0.148, 0.478, 0.960);
  add('marshalling-display', marshal, M.rainLight);

  const cutoff = new THREE.CylinderGeometry(0.016, 0.016, 0.010, 12);
  cutoff.rotateZ(Math.PI / 2);
  cutoff.translate(0.300, 0.505, 0.900);
  add('electrical-cut-off-switch', cutoff, M.aluminium);

  const frontJack = new THREE.BoxGeometry(0.030, 0.030, 0.050);
  frontJack.translate(0, 0.170, 2.700);
  add('front-jack-point', frontJack, M.carbonFine);

  const rearJack = new THREE.BoxGeometry(0.035, 0.035, 0.060);
  rearJack.translate(0, 0.300, -2.080);
  add('rear-jack-point', rearJack, M.carbonFine);
}
