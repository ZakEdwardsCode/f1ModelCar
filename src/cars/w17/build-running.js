// build-running.js - suspension, uprights, wheels, tyres and brakes.
//
// The W17 keeps pushrod-actuated springs and dampers at both ends, carried
// over from the W16. Wishbone legs use a flattened elliptical section because
// they are aerodynamic members as much as structural ones.

import * as THREE from 'three';
import D from './dims.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = new THREE.Vector3(0, 1, 0);

/** A structural link: chord runs longitudinally, thickness vertically. */
function link(a, b, thick, chord, seg = 12) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(1, 1, len, seg);
  g.scale(thick / 2, 1, chord / 2);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
}

/**
 * Slick tyre cross-section. An F1 slick is close to square: the sidewall
 * flares out to full width quickly and the widest point sits high, just
 * under a flat tread with a modest shoulder radius. Modelling it as a
 * rounded torus is what makes a racing tyre look like a road tyre.
 */
function tyreGeometry(R, width, rimR) {
  const hw = width / 2;
  const pts = [
    [rimR, -hw * 0.60],
    [rimR + 0.028, -hw * 0.86],
    [rimR + 0.072, -hw * 0.985],
    [R * 0.86, -hw],
    [R - 0.032, -hw],
    [R - 0.011, -hw * 0.935],
    [R, -hw * 0.80],
    [R, hw * 0.80],
    [R - 0.011, hw * 0.935],
    [R - 0.032, hw],
    [R * 0.86, hw],
    [rimR + 0.072, hw * 0.985],
    [rimR + 0.028, hw * 0.86],
    [rimR, hw * 0.60],
  ].map(([r, a]) => new THREE.Vector2(r, a));

  const g = new THREE.LatheGeometry(pts, 52);
  g.rotateZ(Math.PI / 2); // spin axis from Y to X
  return g;
}

export function buildRunningGear(ctx) {
  const { add, M } = ctx;

  /* ================================================================== */
  /* FRONT CORNER                                                       */
  /* ================================================================== */
  const zF = D.zFrontAxle;
  const yF = D.tyreFrontR;

  for (const sx of [-1, 1]) {
    const xT = sx * D.xFrontTyre;

    // Upper wishbone. The forward leg picks up higher on the chassis than
    // the rearward leg: that inclination is the anti-dive geometry.
    add('front-upper-wishbone',
      link(V(sx * 0.165, 0.475, 1.918), V(sx * 0.690, 0.462, zF + 0.012), 0.030, 0.085),
      M.carbonFine);
    add('front-upper-wishbone',
      link(V(sx * 0.198, 0.455, 1.452), V(sx * 0.690, 0.462, zF + 0.012), 0.030, 0.082),
      M.carbonFine);

    add('front-lower-wishbone',
      link(V(sx * 0.150, 0.240, 1.930), V(sx * 0.742, 0.158, zF - 0.006), 0.034, 0.096),
      M.carbonFine);
    add('front-lower-wishbone',
      link(V(sx * 0.188, 0.252, 1.442), V(sx * 0.742, 0.158, zF - 0.006), 0.034, 0.092),
      M.carbonFine);

    add('front-pushrod',
      link(V(sx * 0.706, 0.186, zF - 0.010), V(sx * 0.150, 0.372, 1.500), 0.026, 0.050),
      M.carbonFine);

    add('front-track-rod',
      link(V(sx * 0.170, 0.300, 1.352), V(sx * 0.712, 0.278, 1.512), 0.022, 0.048),
      M.carbonFine);

    const up = new THREE.BoxGeometry(0.058, 0.330, 0.108);
    up.translate(sx * 0.716, yF + 0.012, zF);
    add('front-upright', up, M.aluminium);

    const hub = new THREE.CylinderGeometry(0.052, 0.058, 0.096, 20);
    hub.rotateZ(Math.PI / 2);
    hub.translate(sx * 0.760, yF, zF);
    add('front-wheel-hub', hub, M.aluminium);

    // Brake disc: 330 mm diameter, 34 mm thick for 2026.
    const disc = new THREE.CylinderGeometry(D.discFrontDia / 2, D.discFrontDia / 2, D.discThickness, 56);
    disc.rotateZ(Math.PI / 2);
    disc.translate(xT, yF, zF);
    add('front-brake-disc', disc, M.brakeDisc);

    const bell = new THREE.CylinderGeometry(0.072, 0.072, 0.052, 22, 1, true);
    bell.rotateZ(Math.PI / 2);
    bell.translate(sx * (D.xFrontTyre - 0.040), yF, zF);
    add('brake-disc-bell', bell, M.titanium);

    // Brembo monobloc caliper, up to eight pistons and four pads for 2026.
    const cal = new THREE.BoxGeometry(0.086, 0.132, 0.080);
    cal.rotateX(-0.42);
    cal.translate(xT, yF + 0.146, zF - 0.080);
    add('front-brake-caliper', cal, M.caliper);

    for (let p = 0; p < 4; p++) {
      const pist = new THREE.CylinderGeometry(0.014, 0.014, 0.020, 12);
      pist.rotateZ(Math.PI / 2);
      pist.translate(xT + (p % 2 ? 0.030 : -0.030), yF + 0.148 - Math.floor(p / 2) * 0.034,
                     zF - 0.068 - Math.floor(p / 2) * 0.016);
      add('brake-caliper-piston', pist, M.aluminium);
    }

    const pad = new THREE.BoxGeometry(0.014, 0.060, 0.058);
    pad.rotateX(-0.42);
    pad.translate(xT - 0.024, yF + 0.140, zF - 0.076);
    add('brake-pad', pad, M.discEdge);
    const pad2 = pad.clone();
    pad2.translate(0.048, 0, 0);
    add('brake-pad', pad2, M.discEdge);

    // The W17 runs no conventional front inlet scoop: cooling air is caught
    // between this end fence and the tyre sidewall.
    const fence = new THREE.CylinderGeometry(0.168, 0.168, 0.010, 30);
    fence.rotateZ(Math.PI / 2);
    fence.translate(sx * (D.xFrontOuter - 0.024), yF, zF);
    add('front-brake-duct-fence', fence, M.carbonFine);

    const duct = new THREE.CylinderGeometry(0.104, 0.116, 0.072, 22, 1, true);
    duct.rotateZ(Math.PI / 2);
    duct.translate(sx * (D.xFrontTyre - 0.052), yF, zF);
    add('front-brake-duct', duct, M.carbonFine);

    buildWheel(ctx, sx, xT, yF, zF, D.tyreFrontWidth, D.tyreFrontR, 'front');
  }

  // Inboard front suspension, on top of the survival cell.
  for (const sx of [-1, 1]) {
    const rocker = new THREE.BoxGeometry(0.020, 0.088, 0.120);
    rocker.rotateX(0.2);
    rocker.translate(sx * 0.146, 0.382, 1.494);
    add('front-rocker', rocker, M.aluminium);

    const damper = new THREE.CylinderGeometry(0.026, 0.026, 0.150, 14);
    damper.rotateZ(Math.PI / 2 - 0.25);
    damper.translate(sx * 0.082, 0.372, 1.566);
    add('front-damper', damper, M.aluminium);

    const tbar = new THREE.CylinderGeometry(0.013, 0.013, 0.240, 12);
    tbar.rotateZ(Math.PI / 2);
    tbar.translate(sx * 0.118, 0.344, 1.432);
    add('front-torsion-bar', tbar, M.titanium);
  }

  const farb = new THREE.CylinderGeometry(0.011, 0.011, 0.230, 12);
  farb.rotateZ(Math.PI / 2);
  farb.translate(0, 0.404, 1.400);
  add('front-anti-roll-bar', farb, M.titanium);

  const heave = new THREE.CylinderGeometry(0.024, 0.024, 0.115, 14);
  heave.rotateX(Math.PI / 2);
  heave.translate(0, 0.372, 1.526);
  add('front-heave-element', heave, M.aluminium);

  /* ================================================================== */
  /* REAR CORNER                                                        */
  /* ================================================================== */
  const zR = D.zRearAxle;
  const yR = D.tyreRearR;

  for (const sx of [-1, 1]) {
    const xT = sx * D.xRearTyre;

    add('rear-upper-wishbone',
      link(V(sx * 0.150, 0.420, -1.452), V(sx * 0.612, 0.462, zR + 0.010), 0.030, 0.088),
      M.carbonFine);
    add('rear-upper-wishbone',
      link(V(sx * 0.145, 0.392, -1.930), V(sx * 0.612, 0.462, zR + 0.010), 0.030, 0.084),
      M.carbonFine);

    add('rear-lower-wishbone',
      link(V(sx * 0.140, 0.150, -1.448), V(sx * 0.648, 0.168, zR - 0.008), 0.034, 0.098),
      M.carbonFine);
    add('rear-lower-wishbone',
      link(V(sx * 0.136, 0.140, -1.942), V(sx * 0.648, 0.168, zR - 0.008), 0.034, 0.094),
      M.carbonFine);

    add('rear-pushrod',
      link(V(sx * 0.610, 0.192, zR - 0.010), V(sx * 0.126, 0.430, -1.412), 0.026, 0.050),
      M.carbonFine);

    add('rear-toe-link',
      link(V(sx * 0.132, 0.226, -1.968), V(sx * 0.626, 0.248, -1.868), 0.020, 0.044),
      M.carbonFine);

    add('driveshaft',
      link(V(sx * 0.115, yR, zR), V(sx * 0.640, yR, zR), 0.044, 0.044, 14),
      M.aluminium);

    const upR = new THREE.BoxGeometry(0.060, 0.330, 0.112);
    upR.translate(sx * 0.660, yR + 0.010, zR);
    add('rear-upright', upR, M.aluminium);

    const rdisc = new THREE.CylinderGeometry(D.discRearDia / 2, D.discRearDia / 2, D.discThickness, 56);
    rdisc.rotateZ(Math.PI / 2);
    rdisc.translate(xT, yR, zR);
    add('rear-brake-disc', rdisc, M.brakeDisc);

    const rcal = new THREE.BoxGeometry(0.082, 0.120, 0.076);
    rcal.rotateX(0.40);
    rcal.translate(xT, yR + 0.126, zR + 0.076);
    add('rear-brake-caliper', rcal, M.caliper);

    const rfence = new THREE.CylinderGeometry(0.150, 0.150, 0.010, 30);
    rfence.rotateZ(Math.PI / 2);
    rfence.translate(sx * (D.xRearOuter - 0.024), yR, zR);
    add('rear-brake-duct-fence', rfence, M.carbonFine);

    const rduct = new THREE.CylinderGeometry(0.096, 0.110, 0.080, 22, 1, true);
    rduct.rotateZ(Math.PI / 2);
    rduct.translate(sx * (D.xRearTyre - 0.060), yR, zR);
    add('rear-brake-duct', rduct, M.carbonFine);

    buildWheel(ctx, sx, xT, yR, zR, D.tyreRearWidth, D.tyreRearR, 'rear');
  }

  for (const sx of [-1, 1]) {
    const rocker = new THREE.BoxGeometry(0.020, 0.084, 0.115);
    rocker.rotateX(-0.2);
    rocker.translate(sx * 0.120, 0.442, -1.408);
    add('rear-rocker', rocker, M.aluminium);

    const rdamp = new THREE.CylinderGeometry(0.025, 0.025, 0.140, 14);
    rdamp.rotateZ(Math.PI / 2 - 0.3);
    rdamp.translate(sx * 0.070, 0.426, -1.340);
    add('rear-damper', rdamp, M.aluminium);
  }

  const rarb = new THREE.CylinderGeometry(0.011, 0.011, 0.180, 12);
  rarb.rotateZ(Math.PI / 2);
  rarb.translate(0, 0.452, -1.300);
  add('rear-anti-roll-bar', rarb, M.titanium);
}

/* ------------------------------------------------------------------ */
/* Wheel assembly                                                      */
/* ------------------------------------------------------------------ */

function buildWheel(ctx, sx, xT, y, z, width, tyreR, end) {
  const { add, M } = ctx;
  const rimR = D.rimR;
  const rimId = end === 'front' ? 'front-wheel-rim' : 'rear-wheel-rim';

  const tyre = tyreGeometry(tyreR, width, rimR);
  tyre.translate(xT, y, z);
  add(end === 'front' ? 'front-tyre' : 'rear-tyre', tyre, M.rubber);

  const barrel = new THREE.CylinderGeometry(rimR, rimR, width - 0.016, 36, 1, true);
  barrel.rotateZ(Math.PI / 2);
  barrel.translate(xT, y, z);
  add(rimId, barrel, M.magnesium);

  // Mandatory wheel cover, an annulus so the centre nut stays reachable.
  const coverX = Math.abs(xT) + width / 2 - 0.014;
  const cover = new THREE.RingGeometry(0.058, rimR - 0.004, 40, 1);
  cover.rotateY(Math.PI / 2);
  cover.translate(sx * coverX, y, z);
  add('wheel-cover', cover, M.structureBlack);

  for (let i = 0; i < 10; i++) {
    const spoke = new THREE.BoxGeometry(0.020, rimR * 0.78, 0.016);
    spoke.translate(0, rimR * 0.45, 0);
    spoke.rotateX((i / 10) * Math.PI * 2);
    spoke.translate(sx * (Math.abs(xT) - width * 0.12), y, z);
    add('wheel-spoke', spoke, M.magnesium);
  }

  const nut = new THREE.CylinderGeometry(0.038, 0.040, 0.034, 6);
  nut.rotateZ(Math.PI / 2);
  nut.translate(sx * (coverX - 0.006), y, z);
  add('wheel-nut', nut, M.titanium);

  const nutRet = new THREE.TorusGeometry(0.048, 0.005, 8, 20);
  nutRet.rotateY(Math.PI / 2);
  nutRet.translate(sx * (coverX - 0.002), y, z);
  add('wheel-nut-retainer', nutRet, M.aluminium);

  const valve = new THREE.CylinderGeometry(0.005, 0.005, 0.026, 8);
  valve.rotateZ(Math.PI / 2);
  valve.translate(sx * coverX, y + rimR * 0.66, z);
  add('tyre-valve', valve, M.aluminium);

  const ir = new THREE.BoxGeometry(0.022, 0.018, 0.026);
  ir.translate(sx * (Math.abs(xT) - width / 2 - 0.030), y + tyreR * 0.72, z + 0.05);
  add('tyre-temperature-sensor', ir, M.structureBlack);
}
