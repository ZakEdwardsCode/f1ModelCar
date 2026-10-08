// build-chassis.js - survival cell, nose, cockpit, halo, bodywork, floor,
// cameras.
//
// Every principal surface here is laid out in the FIA's own coordinates
// (millimetres, XF from the front axle, Z from the reference plane) and sits
// inside the Reference Volume that governs it in Appendix C2 of the 2026
// Technical Regulations. regs.js converts those numbers into viewer space.
// Where the regulations leave freedom, the shape follows launch photography
// of the W17 and is a modelling choice (EST), not a measured surface.
//
// The bodywork is built closed: survival cell, engine cover and sidepods
// overlap rather than butt together, so there is nowhere to see through the
// car from any angle. Internals are only revealed by the cutaway view.

import * as THREE from 'three';
import { loft, plate, resample, clamp, smooth } from '../../lib/geom.js';
import D, { TUB_PLAN, TUB_PLAN_MM } from './dims.js';
import { P, zX, yZ, XA, XC, XPU, XR, piecewise } from './regs.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const NSEC = 56;

/* ------------------------------------------------------------------ */
/* Body plan lookups                                                   */
/* ------------------------------------------------------------------ */

/** Interpolated survival cell section at an XF station, in mm. */
export function tubAt(xf) {
  const col = (i) => TUB_PLAN_MM.map((r) => [r[0], r[i]]);
  return {
    w: piecewise(col(1), xf),
    zBot: piecewise(col(2), xf),
    zTop: piecewise(col(3), xf),
  };
}

/* ------------------------------------------------------------------ */
/* Section helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Survival cell cross-section: a rounded trapezoid, narrower at the floor
 * than at the crown, with fairly flat flanks. C3.7.2 forbids convex radii
 * under 45 mm here, which is why the corners stay soft.
 */
function tubSection({ z, w, yBot, yTop, botScale = 0.72, n = NSEC }) {
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

/**
 * Engine cover section. Wide where it meets the floor and the sidepods,
 * pinched to a narrow spine at the top, because RV-EC (§17) only allows
 * height near the centreline: the airbox and spine may reach Z = 970 inside
 * Y = 400, while the shoulders are capped by a plane falling from Z = 600.
 */
function coverSection({ z, wBot, wTop, yBot, yTop, n = NSEC }) {
  const yc = (yBot + yTop) / 2;
  const h = (yTop - yBot) / 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const y = yc + h * Math.sign(st) * Math.pow(Math.abs(st), 2 / (st >= 0 ? 2.2 : 4.0));
    const f = clamp((y - yBot) / (yTop - yBot), 0, 1);
    // Width falls slowly at first, then quickly into the spine: a convex
    // shoulder rather than a straight-sided tent.
    const w = wBot + (wTop - wBot) * Math.pow(f, 1.25);
    pts.push(V(w * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / 3.2), y, z));
  }
  return pts;
}

/**
 * Sidepod section with an undercut: the lower flank tucks inboard, and the
 * inner edge is buried inside the survival cell or engine cover so the pod
 * never leaves a gap against the body.
 */
function podSection({ z, xc, w, wBot, yBot, yTop, n = NSEC, sign = 1 }) {
  const yc = (yBot + yTop) / 2;
  const h = (yTop - yBot) / 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const up = st >= 0;
    // Only the OUTER lower quadrant is undercut; the inner side is buried.
    const ww = (!up && ct > 0) ? wBot : w;
    const e = up ? 4.2 : 2.2;
    pts.push(V(
      sign * (xc + ww * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / 4.6)),
      yc + h * Math.sign(st) * Math.pow(Math.abs(st), 2 / e),
      z
    ));
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Floor (RV-FLOOR-BODY, Appendix C2 §4)                               */
/* ------------------------------------------------------------------ */

// Central region that may reach down to Z = 0 (§4.1), half-width by XF.
const KEEL = [
  [350, 25], [1250, 340], [1400, 390], [XR - 1050, 390], [XR - 775, 350],
  [XR - 625, 300], [XR - 475, 240], [XR + 300, 75],
];

// Plan outline (§4.9, with the corner cut-out of §4.17-4.19 and the
// diffuser sidewall line of §5).
function floorHalfWidthMM(xf) {
  if (xf < 1100) return piecewise(KEEL, xf);
  return piecewise([
    [1100, 770], [XR - 825, 716], [XR - 600, 690], [XR - 335, 400],
    [XR - 150, 365], [XR + 300, 365],
  ], xf);
}

// Underside height outside the keel. Z = 50 is the floor proper. It rises
// at the front into the tunnel inlets and at the rear into the diffuser,
// always staying under the §4.11 sheet that caps the volume.
function floorOuterZ(xf) {
  return piecewise([
    [1100, 150], [1450, 88], [1775, 52], [XR - 600, 50],
    [XR - 350, 140], [XR + 300, 228],
  ], xf);
}

function floorSection(xf, nSide = 44) {
  const hw = floorHalfWidthMM(xf);
  const kw = Math.min(piecewise(KEEL, xf), hw);
  const zo = xf < 1100 ? 0 : floorOuterZ(xf);
  const thick = 20;
  // Blend from keel to outer level over 30 mm so the step reads as a
  // moulded radius rather than a knife edge.
  const under = (y) => {
    const t = smooth(clamp((Math.abs(y) - kw) / 30, 0, 1));
    return zo * t;
  };
  const yAt = (i) => -hw + 2 * hw * (i / nSide);

  const bottom = [];
  for (let i = 0; i <= nSide; i++) bottom.push(P(xf, yAt(i), under(yAt(i))));
  const top = [];
  for (let i = nSide; i >= 0; i--) top.push(P(xf, yAt(i), under(yAt(i)) + thick));
  return bottom.concat(top);
}

/* ------------------------------------------------------------------ */
/* Main build                                                          */
/* ------------------------------------------------------------------ */

export function buildChassis(ctx) {
  const { add, M } = ctx;

  // The cockpit cluster (driver, wheel, halo, mirrors) was first laid out
  // around a cockpit 275 mm further forward. Rather than retype every
  // coordinate, those parts are authored in that frame and moved as a group
  // onto the regulation position of XC.
  const DZ = zX(XC) - 0.120;
  const ck = (geo, dy = 0) => { geo.translate(0, dy, DZ); return geo; };

  /* --- Survival cell and nose --------------------------------------- */
  const cockpitFront = zX(XC - 800);
  const cockpitRear = zX(XC);
  const tubRings = TUB_PLAN.map(([z, w, yBot, yTop]) => {
    let ring = tubSection({ z, w, yBot, yTop });
    if (z <= cockpitFront + 0.02 && z >= cockpitRear - 0.02) {
      const yc = (yBot + yTop) / 2;
      const t = smooth(clamp((cockpitFront + 0.02 - z) / 0.26, 0, 1)) *
                smooth(clamp((z - cockpitRear + 0.02) / 0.20, 0, 1));
      ring = scoop(ring, yc, w * 0.80, 0.270 * t + 0.010);
    }
    return ring;
  });

  // Nose and tub meet on a shared ring at XA, so there are no coincident
  // surfaces to z-fight along the joint.
  const iXA = TUB_PLAN_MM.findIndex((r) => r[0] === XA);
  add('nose-cone', loft(tubRings.slice(0, iXA + 1), { capStart: true }), M.bodySilver);
  add('survival-cell', loft(tubRings.slice(iXA), { capEnd: true }), M.bodyFlank);

  // Channel moulded into the underside of the nose. On the W17 the front
  // wing pylons pick up on the second plane specifically to open this path,
  // feeding the underfloor and the bib behind it.
  const chanRings = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const xf = -1000 + t * 780;
    const s = tubAt(xf);
    const w = 0.030 + t * 0.070;
    const y = yZ(s.zBot) + 0.012;
    const ring = [];
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      ring.push(V(w * Math.cos(a), y + 0.022 * Math.sin(a), zX(xf)));
    }
    chanRings.push(ring);
  }
  add('nose-underfloor-channel', loft(chanRings), M.structureBlack);

  const fisS = tubAt(-700);
  const fis = new THREE.CylinderGeometry(0.060, 0.034, 0.420, 20, 1, true);
  fis.rotateX(Math.PI / 2);
  fis.translate(0, yZ((fisS.zBot + fisS.zTop) / 2), zX(-760));
  add('front-impact-structure', fis, M.carbonFine);

  const xaS = tubAt(XA);
  const fbh = plate(
    [{ x: -0.13, y: yZ(xaS.zBot + 12) }, { x: 0.13, y: yZ(xaS.zBot + 12) },
     { x: 0.13, y: yZ(xaS.zTop - 20) }, { x: -0.13, y: yZ(xaS.zTop - 20) }],
    0.016, 'z'
  );
  fbh.translate(0, 0, D.zFrontBulkhead - 0.02);
  add('front-bulkhead', fbh, M.carbonFine);

  /* --- Cockpit ------------------------------------------------------- */
  // Dark interior volume filling the scooped crown of the survival cell.
  const openings = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const xf = XC - 800 + t * 800;
    const s = tubAt(xf);
    const w = (s.w * 0.80) * Math.sin(Math.PI * clamp(0.10 + t * 0.86, 0, 1)) + 0.030 * 1000;
    const yTop = yZ(s.zTop) - 0.030;
    const ring = [];
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      ring.push(V((w / 1000) * Math.cos(a) * 0.86, yTop - 0.11 + 0.10 * Math.sin(a), zX(xf)));
    }
    openings.push(ring);
  }
  add('cockpit-opening', loft(openings, { capStart: true, capEnd: true }), M.structureBlack);

  for (const sx of [-1, 1]) {
    const pad = new THREE.BoxGeometry(0.070, 0.150, 0.300);
    pad.translate(sx * 0.252, 0.520, 0.300);
    add('cockpit-padding', ck(pad, 0.130), M.nomex);
  }

  const headrest = new THREE.BoxGeometry(0.360, 0.150, 0.110);
  headrest.translate(0, 0.545, 0.150);
  add('headrest', ck(headrest, 0.120), M.nomex);

  // Driver stand-in, so the cockpit reads at the right scale. Only the top
  // half of the helmet shows above the cockpit rim, as on the real car.
  const DRV = 0.060;
  const torso = new THREE.BoxGeometry(0.290, 0.230, 0.330);
  torso.translate(0, 0.425, 0.315);
  add('driver-torso', ck(torso, DRV), M.nomex);

  const helmet = new THREE.SphereGeometry(0.126, 26, 20);
  helmet.scale(1, 1.10, 1.14);
  helmet.translate(0, 0.655, 0.420);
  add('driver-helmet', ck(helmet, DRV), M.helmet);

  const visor = new THREE.SphereGeometry(0.127, 26, 20, 0, Math.PI * 2, 0.95, 0.40);
  visor.scale(1, 1.10, 1.14);
  visor.translate(0, 0.655, 0.420);
  add('helmet-visor', ck(visor, DRV), M.visor);

  const hans = new THREE.TorusGeometry(0.115, 0.028, 10, 20, Math.PI);
  hans.rotateY(Math.PI / 2);
  hans.rotateZ(-Math.PI / 2);
  hans.translate(0, 0.500, 0.335);
  add('hans-device', ck(hans, DRV), M.carbonFine);

  for (const sx of [-1, 1]) {
    const strap = new THREE.BoxGeometry(0.055, 0.005, 0.240);
    strap.rotateX(-0.60);
    strap.translate(sx * 0.085, 0.455, 0.410);
    add('safety-harness', ck(strap, DRV), M.nomex);
  }

  /* --- Steering ------------------------------------------------------ */
  const SW = 0.075;
  const swY = 0.472;
  const swZ = 0.742;
  const swBody = new THREE.BoxGeometry(0.272, 0.112, 0.030);
  swBody.rotateX(-0.44);
  swBody.translate(0, swY, swZ);
  add('steering-wheel', ck(swBody, SW), M.carbonFine);

  const swDisplay = new THREE.BoxGeometry(0.114, 0.056, 0.006);
  swDisplay.rotateX(-0.44);
  swDisplay.translate(0, swY + 0.007, swZ + 0.015);
  add('steering-wheel-display', ck(swDisplay, SW), M.glass);

  for (const sx of [-1, 1]) {
    const grip = new THREE.CylinderGeometry(0.021, 0.021, 0.100, 12);
    grip.rotateZ(0.20 * sx);
    grip.rotateX(-0.44);
    grip.translate(sx * 0.117, swY - 0.010, swZ + 0.006);
    add('steering-wheel-grip', ck(grip, SW), M.nomex);

    const shift = new THREE.BoxGeometry(0.012, 0.062, 0.006);
    shift.rotateX(-0.44);
    shift.translate(sx * 0.097, swY - 0.018, swZ - 0.030);
    add('shift-paddle', ck(shift, SW), M.carbonFine);

    const clutch = new THREE.BoxGeometry(0.010, 0.044, 0.005);
    clutch.rotateX(-0.44);
    clutch.translate(sx * 0.062, swY - 0.033, swZ - 0.026);
    add('clutch-paddle', ck(clutch, SW), M.aluminium);

    for (let r = 0; r < 2; r++) {
      const rot = new THREE.CylinderGeometry(0.017, 0.017, 0.012, 14);
      rot.rotateX(Math.PI / 2 - 0.44);
      rot.translate(sx * (0.070 + r * 0.044), swY + 0.024 - r * 0.028, swZ + 0.013);
      add('steering-wheel-rotary', ck(rot, SW), M.aluminium);
    }
    for (let b = 0; b < 3; b++) {
      const btn = new THREE.CylinderGeometry(0.0075, 0.0075, 0.008, 10);
      btn.rotateX(Math.PI / 2 - 0.44);
      btn.translate(sx * (0.045 + b * 0.028), swY - 0.024, swZ + 0.008);
      add('steering-wheel-button', ck(btn, SW), M.aluminium);
    }
  }

  // Column runs from the wheel forward and down to the rack.
  const colA = V(0, swY + SW - 0.020, swZ + DZ + 0.030);
  const colB = V(0, 0.300, 1.300);
  const colLen = colA.distanceTo(colB);
  const column = new THREE.CylinderGeometry(0.022, 0.026, colLen, 14);
  column.translate(0, colLen / 2, 0);
  column.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(
    V(0, 1, 0), colB.clone().sub(colA).normalize()));
  column.translate(colA.x, colA.y, colA.z);
  add('steering-column', column, M.carbonFine);

  const rack = new THREE.BoxGeometry(0.330, 0.055, 0.072);
  rack.translate(0, 0.300, 1.330);
  add('steering-rack', rack, M.aluminium);

  /* --- Halo ---------------------------------------------------------- */
  // A near-level ring around the cockpit, not an arch. Rear mounts sit on
  // the survival cell rim, the ring runs forward at roughly constant height
  // to a junction ahead of the driver, where the single central pillar
  // drops to the chassis. FIA standard part (RV-HALO is CAD-only), so the
  // shape here is EST from photographs.
  const HALO_HALF = [
    P(XC - 60, 296, 700),
    P(XC - 300, 312, 770),
    P(XC - 560, 300, 806),
    P(XC - 760, 252, 820),
    P(XC - 940, 150, 826),
    P(XC - 1015, 58, 826),
    P(XC - 1035, 0, 824),
  ];
  const haloPts = [
    ...HALO_HALF.slice().reverse().map((p) => V(-p.x, p.y, p.z)),
    ...HALO_HALF.slice(1),
  ];
  const halo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(haloPts), 96, 0.0185, 10, false);
  add('halo', halo, M.structureBlack);

  // Front pillar from the ring junction down to the chassis crown.
  const pTop = P(XC - 1035, 0, 824);
  const pBot = P(XC - 990, 0, tubAt(XC - 990).zTop - 10);
  const pLen = pTop.distanceTo(pBot);
  const pillar = new THREE.CylinderGeometry(0.019, 0.025, pLen, 14);
  pillar.translate(0, pLen / 2, 0);
  pillar.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(
    V(0, 1, 0), pTop.clone().sub(pBot).normalize()));
  pillar.translate(pBot.x, pBot.y, pBot.z);
  add('halo-front-pillar', pillar, M.structureBlack);

  for (const sx of [-1, 1]) {
    const m = P(XC - 60, sx * 296, 690);
    const mount = new THREE.CylinderGeometry(0.030, 0.034, 0.060, 12);
    mount.translate(m.x, m.y, m.z);
    add('halo-rear-mount', mount, M.titanium);
    for (let b = 0; b < 3; b++) {
      const bolt = new THREE.CylinderGeometry(0.0055, 0.0055, 0.018, 6);
      const a = (b / 3) * Math.PI * 2;
      bolt.translate(m.x + Math.cos(a) * 0.021, m.y - 0.026, m.z + Math.sin(a) * 0.021);
      add('halo-mounting-bolt', bolt, M.fastener);
    }
  }

  /* --- Mirrors (RV-MIRROR-BODY §14, RV-MIRROR-ISTAY) ----------------- */
  for (const sx of [-1, 1]) {
    // Housing inside XC-830..-650, Y 470..680, Z 640..720.
    const hc = P(XC - 740, sx * 575, 680);
    const housing = new THREE.BoxGeometry(0.180, 0.066, 0.080);
    housing.rotateY(sx * -0.20);
    housing.translate(hc.x, hc.y, hc.z);
    add('mirror-housing', housing, M.bodyBlack);

    const glass = new THREE.BoxGeometry(0.168, 0.054, 0.004);
    glass.rotateY(sx * -0.20);
    glass.translate(hc.x - sx * 0.008, hc.y, hc.z - 0.042);
    add('mirror-glass', glass, M.mirror);

    // Inner stay from the cockpit rim out to the housing.
    const sA = P(XC - 780, sx * 230, 615);
    const sB = P(XC - 760, sx * 495, 668);
    const sLen = sA.distanceTo(sB);
    const stalk = new THREE.CylinderGeometry(0.011, 0.013, sLen, 10);
    stalk.translate(0, sLen / 2, 0);
    stalk.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(
      V(0, 1, 0), sB.clone().sub(sA).normalize()));
    stalk.translate(sA.x, sA.y, sA.z);
    add('mirror-stalk', stalk, M.carbonFine);
  }

  /* --- Roll structure and airbox (RV-ROLL-HOOP, RV-EC §17) ----------- */
  // Inside XC..XC+320, Y <= 170, Z 680..970.
  const hoopZ = zX(XC + 150);
  const hoopPts = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const a = Math.PI * t;
    hoopPts.push(V(
      Math.cos(a) * 0.150,
      yZ(690) + Math.sin(a) * (D.yRollHoopTop - 0.030 - yZ(690)),
      hoopZ + 0.040 - Math.abs(Math.cos(a)) * 0.040
    ));
  }
  const hoop = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hoopPts), 52, 0.030, 10, false);
  add('roll-hoop', hoop, M.titanium);

  const hoopBlade = plate(
    [{ x: -0.022, y: yZ(690) }, { x: 0.022, y: yZ(690) }, { x: 0.016, y: D.yRollHoopTop - 0.012 },
     { x: -0.016, y: D.yRollHoopTop - 0.012 }],
    0.110, 'z'
  );
  hoopBlade.translate(0, 0, hoopZ + 0.010);
  add('roll-structure-blade', hoopBlade, M.bodyBlack);

  // Airbox plenum inlet above the driver's head, inside the hoop.
  const abFront = zX(XC + 30);
  const abRings = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const z = abFront - t * 0.300;
    const w = 0.108 - t * 0.026;
    const h = 0.084 - t * 0.016;
    const y = D.yAirboxTop - 0.090 - t * 0.050;
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

  const abLip = new THREE.TorusGeometry(0.099, 0.011, 8, 26);
  abLip.scale(1.0, 0.84, 1.0);
  abLip.translate(0, D.yAirboxTop - 0.090, abFront + 0.002);
  add('airbox-lip', abLip, M.bodySilver);

  for (const sx of [-1, 1]) {
    const aux = new THREE.CylinderGeometry(0.026, 0.022, 0.080, 12);
    aux.rotateX(Math.PI / 2);
    aux.translate(sx * 0.118, yZ(745), zX(XC + 70));
    add('airbox-auxiliary-inlet', aux, M.structureBlack);
  }

  /* --- Engine cover (RV-EC §17, RV-TAIL §19) ------------------------- */
  // [XF, wBot, wTop, zBot, zTop]. The spine stays under the §17.4 line
  // from Z 970 at XC+500 to Z 600 at XR-50, and inside Y 145 behind XR-50.
  const COVER = [
    [XC - 90, 210, 150, 60, 700],
    [XC + 40, 222, 104, 60, 790],
    [XC + 160, 236, 100, 60, 918],
    [XC + 360, 240, 92, 60, 902],
    [XC + 600, 236, 78, 60, 852],
    [2700, 222, 64, 60, 788],
    [2950, 196, 56, 60, 700],
    [3150, 164, 48, 60, 612],
    [3300, 126, 42, 60, 522],
    [3420, 92, 34, 70, 438],
  ];
  const coverRings = COVER.map(([xf, wB, wT, zB, zT]) =>
    coverSection({ z: zX(xf), wBot: wB / 1000, wTop: wT / 1000, yBot: yZ(zB), yTop: yZ(zT) })
  );
  add('engine-cover', loft(coverRings, { capStart: true, capEnd: true }), M.bodyBlack);

  // Shark fin along the spine (RV-EC §17.7, Y <= 25), carrying the number.
  const finPts = [
    { z: zX(XC + 420), y: yZ(915) }, { z: zX(2700), y: yZ(880) },
    { z: zX(3000), y: yZ(838) }, { z: zX(3250), y: yZ(796) },
    { z: zX(3250), y: yZ(560) }, { z: zX(3000), y: yZ(650) },
    { z: zX(2700), y: yZ(740) }, { z: zX(XC + 420), y: yZ(850) },
  ];
  add('shark-fin', plate(finPts, 0.012, 'x'), M.bodyBlack);

  for (const sx of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const lv = new THREE.BoxGeometry(0.004, 0.030, 0.085);
      lv.rotateX(0.22);
      lv.rotateY(sx * 0.18);
      lv.translate(sx * (0.225 - i * 0.008), yZ(560) - i * 0.026, zX(2480) - i * 0.034);
      add('engine-cover-louvre', lv, M.structureBlack);
    }
    for (let i = 0; i < 6; i++) {
      const f = new THREE.CylinderGeometry(0.009, 0.009, 0.006, 12);
      f.rotateZ(Math.PI / 2);
      const xf = XC + 120 + i * 230;
      const w = piecewise(COVER.map((r) => [r[0], r[1]]), xf);
      f.translate(sx * (w / 1000 + 0.001), yZ(120), zX(xf));
      add('bodywork-quarter-turn-fastener', f, M.fastener);
    }
  }

  /* --- Sidepods (RV-SIDEPOD §16, RV-EC §17) -------------------------- */
  // [XF, outer Y, inner Y, zBot, zTop, undercut]. The inlet face starts at
  // XF 1150 so it clears the §16.1 line from [900, 275] to [1200, 715].
  // Outer Y stays inside the §17.1 plan (715, tapering to 575 at XR-500,
  // then 350); the top stays under the §17.3 plane where Y > 400.
  const POD = [
    [1150, 640, 230, 240, 540, 0.80],
    [1250, 680, 230, 190, 556, 0.62],
    [1450, 703, 230, 155, 562, 0.55],
    [1700, 706, 230, 148, 556, 0.55],
    [1950, 690, 220, 148, 532, 0.58],
    [2200, 655, 210, 152, 498, 0.62],
    [2450, 592, 195, 160, 456, 0.68],
    [2700, 505, 180, 168, 404, 0.74],
    [2880, 420, 165, 175, 362, 0.80],
    [3040, 330, 150, 182, 322, 0.86],
    [3200, 255, 130, 190, 288, 0.90],
  ];
  const podRing = ([xf, yo, yi, zb, zt, uc], sx, k = 1) => {
    const xc = (yo + yi) / 2000;
    const w = ((yo - yi) / 2000) * k;
    return podSection({
      z: zX(xf), xc, w, wBot: w * uc, yBot: yZ(zb), yTop: yZ(zt), sign: sx,
    });
  };

  for (const sx of [-1, 1]) {
    const rings = POD.map((r) => podRing(r, sx));
    add('sidepod', loft(rings, { capStart: true, capEnd: true }), M.bodyBlack);

    // Striped panel across the top of the sidepod, the signature detail of
    // the 2026 livery.
    const stripeRings = POD.slice(0, 8).map(([xf, yo, yi, zb, zt]) => {
      const xc = (yo + yi) / 2000;
      const w = (yo - yi) / 2000;
      const yc = yZ((zb + zt) / 2);
      const h = (zt - zb) / 2000;
      const ring = [];
      for (let k = 0; k <= 14; k++) {
        const a = Math.PI * (0.10 + (k / 14) * 0.42);
        ring.push(V(
          sx * (xc + w * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 2 / 4.6) * 1.006),
          yc + h * Math.pow(Math.abs(Math.sin(a)), 2 / 4.2) * 1.006,
          zX(xf)
        ));
      }
      return ring;
    });
    add('sidepod-stripe-panel', loft(stripeRings, { closed: false }), M.stripePanel);

    // Radiator inlet: a dark mouth set into the front face of the pod.
    const mouth = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      mouth.push(podRing([1140 + t * 120, 628, 300, 270, 528, 0.9], sx, 0.94 - t * 0.12));
    }
    add('sidepod-inlet', loft(mouth, { capStart: true, capEnd: true }), M.structureBlack);

    const vane = plate(
      [{ y: yZ(280), z: zX(1138) }, { y: yZ(520), z: zX(1138) },
       { y: yZ(510), z: zX(1240) }, { y: yZ(290), z: zX(1240) }],
      0.006, 'x'
    );
    vane.translate(sx * 0.470, 0, 0);
    add('sidepod-inlet-splitter', vane, M.carbonFine);

    // In-washing wheel wake control boards ahead of the sidepod, standing
    // on RV-FLOOR-FOOT (XF 650..1350, Y 625..890).
    const board = plate(
      [{ y: yZ(55), z: zX(660) }, { y: yZ(300), z: zX(700) },
       { y: yZ(300), z: zX(1000) }, { y: yZ(55), z: zX(1040) }],
      0.008, 'x'
    );
    board.translate(sx * 0.655, 0, 0);
    add('wheel-wake-control-board', board, M.carbonFine);

    const board2 = plate(
      [{ y: yZ(55), z: zX(700) }, { y: yZ(250), z: zX(730) },
       { y: yZ(250), z: zX(980) }, { y: yZ(55), z: zX(1010) }],
      0.007, 'x'
    );
    board2.translate(sx * 0.565, 0, 0);
    add('wheel-wake-control-board', board2, M.carbonFine);

    for (let i = 0; i < 5; i++) {
      const lv = new THREE.BoxGeometry(0.052, 0.004, 0.030);
      lv.rotateX(0.35);
      lv.translate(sx * (0.500 - i * 0.016), yZ(493) - i * 0.010, zX(2240) - i * 0.044);
      add('sidepod-cooling-louvre', lv, M.structureBlack);
    }

    for (let k = 0; k < 2; k++) {
      const sis = new THREE.CylinderGeometry(0.044, 0.056, 0.420, 14);
      sis.rotateZ(Math.PI / 2);
      sis.rotateY(0.10 * sx);
      sis.translate(sx * 0.400, yZ(250 + k * 140), zX(1400 + k * 130));
      add('side-impact-structure', sis, M.carbonFine);
    }
  }

  /* --- Floor, tunnels and diffuser ----------------------------------- */
  const floorRings = [];
  const FX0 = 350;
  const FX1 = XR + 300;
  for (let i = 0; i <= 64; i++) floorRings.push(floorSection(FX0 + (FX1 - FX0) * (i / 64)));
  add('floor', loft(floorRings, { capStart: true, capEnd: true }), M.carbon);

  // Plank (RV-PLANK) hangs below the reference plane on the centreline.
  const plankLen = (XR - 300 - 500) / 1000;
  const plank = new THREE.BoxGeometry(0.300, 0.010, plankLen);
  plank.translate(0, D.yFloor - 0.005, zX(500) - plankLen / 2);
  add('plank', plank, M.nomex);

  for (const xf of [650, 1600, 2500, 2950]) {
    const skid = new THREE.CylinderGeometry(0.038, 0.038, 0.011, 16);
    skid.translate(0, D.yFloor - 0.0045, zX(xf));
    add('titanium-skid-block', skid, M.titanium);
  }

  for (const sx of [-1, 1]) {
    // Fences at the mouth of the tunnels, under the raised floor front.
    for (let i = 0; i < 4; i++) {
      const y = 430 + i * 90;
      const fence = plate(
        [{ y: yZ(floorOuterZ(1110)), z: zX(1110) }, { y: yZ(floorOuterZ(1110)) - 0.060 + i * 0.008, z: zX(1150) },
         { y: yZ(floorOuterZ(1700)) - 0.004, z: zX(1700) }, { y: yZ(floorOuterZ(1700)), z: zX(1720) }],
        0.006, 'x'
      );
      fence.translate(sx * y / 1000, 0, 0);
      add('floor-fence', fence, M.carbonFine);
    }

    // Turned-up lip along the floor edge.
    const edgeY = floorHalfWidthMM(2000) - 18;
    const edge = plate(
      [{ y: yZ(45), z: zX(1300) }, { y: yZ(95), z: zX(1500) },
       { y: yZ(100), z: zX(2500) }, { y: yZ(70), z: zX(2650) },
       { y: yZ(45), z: zX(2600) }],
      0.008, 'x'
    );
    edge.translate(sx * edgeY / 1000, 0, 0);
    add('floor-edge-wing', edge, M.carbonFine);

    // Diffuser strakes hang from the diffuser roof, between keel and wall.
    for (let i = 0; i < 2; i++) {
      const y = 140 + i * 110;
      const strake = plate(
        [{ y: yZ(50), z: zX(XR - 450) }, { y: yZ(floorOuterZ(XR - 200)), z: zX(XR - 200) },
         { y: yZ(floorOuterZ(XR + 300)), z: zX(XR + 300) }, { y: yZ(40), z: zX(XR + 300) }],
        0.006, 'x'
      );
      strake.translate(sx * y / 1000, 0, 0);
      add('diffuser-strake', strake, M.carbonFine);
    }

    // Diffuser sidewall, RV-FLOOR-SIDEWALL: Y 345..400 from XR-335 back.
    const dsw = plate(
      [{ y: yZ(35), z: zX(XR - 335) }, { y: yZ(floorOuterZ(XR - 335) + 40), z: zX(XR - 335) },
       { y: yZ(floorOuterZ(XR + 300) + 30), z: zX(XR + 300) }, { y: yZ(35), z: zX(XR + 300) }],
      0.009, 'x'
    );
    dsw.translate(sx * 0.372, 0, 0);
    add('diffuser-sidewall', dsw, M.carbonFine);

    // Floor boards behind the front wheels, RV-FLOOR-BOARD:
    // XF 650..1350, Y 710..890, Z 70..~400.
    for (let i = 0; i < 3; i++) {
      const y = 735 + i * 60;
      const bb = plate(
        [{ y: yZ(70), z: zX(680 + i * 40) }, { y: yZ(330 - i * 50), z: zX(720 + i * 40) },
         { y: yZ(300 - i * 50), z: zX(1250 - i * 60) }, { y: yZ(70), z: zX(1300 - i * 60) }],
        0.006, 'x'
      );
      bb.translate(sx * y / 1000, 0, 0);
      add('bargeboard', bb, M.carbonFine);
    }

    // Vanes on the floor bib under the nose (RV-FLOOR-BIB, XF 425..1200).
    for (let i = 0; i < 2; i++) {
      const y = 90 + i * 70;
      const tt = plate(
        [{ y: yZ(10), z: zX(480 + i * 60) }, { y: yZ(150 - i * 20), z: zX(520 + i * 60) },
         { y: yZ(140 - i * 20), z: zX(900) }, { y: yZ(10), z: zX(940) }],
        0.006, 'x'
      );
      tt.translate(sx * y / 1000, 0, 0);
      add('t-tray-vane', tt, M.carbonFine);
    }
  }

  const gurney = new THREE.BoxGeometry(0.730, 0.020, 0.006);
  gurney.translate(0, yZ(floorOuterZ(XR + 300) + 20) + 0.010, zX(XR + 300) + 0.003);
  add('diffuser-gurney', gurney, M.carbonFine);

  const exitDuct = new THREE.CylinderGeometry(0.044, 0.036, 0.100, 16, 1, true);
  exitDuct.rotateX(Math.PI / 2);
  exitDuct.translate(0, yZ(330), zX(3440));
  add('central-cooling-exit', exitDuct, M.structureBlack);

  /* --- Cameras (Article C8.16, Appendix C3 Drawing 2) ---------------- */
  // Position 3: either side of the airbox. Forward-most point between XC
  // and XC+300, Z 840..900, inner face at Y 120..170.
  for (const sx of [-1, 1]) {
    const pod = new THREE.BoxGeometry(0.046, 0.052, 0.110);
    pod.translate(sx * 0.173, yZ(870), zX(XC + 120));
    add('onboard-camera-pod', pod, M.structureBlack);
    const lens = new THREE.CylinderGeometry(0.013, 0.013, 0.006, 14);
    lens.rotateX(Math.PI / 2);
    lens.translate(sx * 0.173, yZ(872), zX(XC + 64));
    add('onboard-camera-lens', lens, M.glass);
  }

  // Position 4: the T-camera across the top of the roll hoop, forward-most
  // point ahead of XC+80.
  const tBar = new THREE.BoxGeometry(0.150, 0.026, 0.052);
  tBar.translate(0, D.yRollHoopTop + 0.016, zX(XC + 120));
  add('t-camera', tBar, M.structureBlack);
  const tPost = new THREE.BoxGeometry(0.030, 0.026, 0.040);
  tPost.translate(0, D.yRollHoopTop - 0.006, zX(XC + 125));
  add('t-camera', tPost, M.structureBlack);
  for (const sx of [-1, 1]) {
    const tLens = new THREE.CylinderGeometry(0.009, 0.009, 0.005, 12);
    tLens.rotateX(Math.PI / 2);
    tLens.translate(sx * 0.050, D.yRollHoopTop + 0.016, zX(XC + 120) + 0.028);
    add('onboard-camera-lens', tLens, M.glass);
  }

  // Position 2: the camera pods on the nose flanks, inside RV-CAMERA-2
  // (XF -450..-150, Y 135..330, Z 325..~490). Camera on the left, housing
  // of the same shape on the right.
  for (const sx of [-1, 1]) {
    const c = P(-300, sx * 228, 430);
    const pod = new THREE.BoxGeometry(0.060, 0.046, 0.150);
    pod.translate(c.x, c.y, c.z);
    add('nose-camera-pod', pod, M.structureBlack);
    const s = tubAt(-300);
    const stA = P(-300, sx * (s.w - 10), 425);
    const stB = P(-300, sx * 200, 425);
    const stalk = new THREE.BoxGeometry(Math.abs(stB.x - stA.x), 0.014, 0.050);
    stalk.translate((stA.x + stB.x) / 2, stA.y, stA.z);
    add('nose-camera-pod', stalk, M.structureBlack);
    if (sx < 0) {
      const lens = new THREE.CylinderGeometry(0.012, 0.012, 0.006, 14);
      lens.rotateX(Math.PI / 2);
      lens.translate(c.x, c.y, c.z + 0.076);
      add('onboard-camera-lens', lens, M.glass);
    }
  }

  // Position 1: on the survival cell ahead of the cockpit, behind the halo
  // pillar, on the centreline, looking back at the driver.
  const dfc = tubAt(XC - 900);
  const dCam = new THREE.BoxGeometry(0.048, 0.034, 0.060);
  dCam.translate(0, yZ(dfc.zTop) + 0.014, zX(XC - 900));
  add('driver-facing-camera', dCam, M.structureBlack);
  const dLens = new THREE.CylinderGeometry(0.010, 0.010, 0.005, 12);
  dLens.rotateX(Math.PI / 2);
  dLens.translate(0, yZ(dfc.zTop) + 0.016, zX(XC - 900) - 0.032);
  add('onboard-camera-lens', dLens, M.glass);

  // Position 5: the 360-degree camera, on the centreline with its lens
  // centre ahead of XC-1250.
  const c360 = tubAt(XC - 1300);
  const base360 = new THREE.CylinderGeometry(0.024, 0.030, 0.022, 18);
  base360.translate(0, yZ(c360.zTop) + 0.008, zX(XC - 1300));
  add('360-camera', base360, M.structureBlack);
  const dome = new THREE.SphereGeometry(0.022, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.translate(0, yZ(c360.zTop) + 0.019, zX(XC - 1300));
  add('360-camera', dome, M.glass);

  /* --- Sensors and safety -------------------------------------------- */
  const pit = tubAt(-1150);
  const pitot = new THREE.CylinderGeometry(0.005, 0.005, 0.110, 8);
  pitot.rotateX(Math.PI / 2);
  pitot.translate(0, yZ(pit.zTop) + 0.012, zX(-1180));
  add('pitot-tube', pitot, M.aluminium);

  const aerial = new THREE.BoxGeometry(0.050, 0.014, 0.070);
  aerial.translate(0, yZ(895), zX(XC + 1010));
  add('gps-aerial', aerial, M.structureBlack);

  const md = tubAt(XC - 880);
  const marshal = new THREE.CylinderGeometry(0.018, 0.018, 0.010, 14);
  marshal.translate(-0.140, yZ(md.zTop) - 0.012, zX(XC - 880));
  add('marshalling-display', marshal, M.rainLight);

  const cutoff = new THREE.CylinderGeometry(0.016, 0.016, 0.010, 12);
  cutoff.rotateZ(Math.PI / 2);
  cutoff.translate(tubAt(XC - 760).w / 1000 + 0.004, yZ(560), zX(XC - 760));
  add('electrical-cut-off-switch', cutoff, M.aluminium);

  const fj = tubAt(-1250);
  const frontJack = new THREE.BoxGeometry(0.030, 0.030, 0.050);
  frontJack.translate(0, yZ(fj.zBot) - 0.005, zX(-1250));
  add('front-jack-point', frontJack, M.carbonFine);

  const rearJack = new THREE.BoxGeometry(0.035, 0.035, 0.060);
  rearJack.translate(0, yZ(205), zX(XR + 735));
  add('rear-jack-point', rearJack, M.carbonFine);
}
