// regs.js - the FIA 2026 car coordinate system, and the regulation planes the
// W17 is laid out on.
//
// The FIA writes every geometric rule in millimetres in its own frame:
//   X  longitudinal, increasing REARWARD
//   Y  lateral, increasing to the driver's right
//   Z  vertical, Z = 0 at the bottom of the sprung car (the reference plane)
// (2026 F1 Technical Regulations, Section C, Article C2.1.)
//
// The viewer works in metres with +Z forward and +Y up. Everything in this
// file converts between the two, so the builders can be written directly from
// the numbers in Appendix C2 and checked against them line by line.
//
// All longitudinal positions here are measured from XF = 0, the front axle.

import * as THREE from 'three';

/** Viewer z of the front axle (XF = 0). */
export const Z_FRONT_AXLE = 1.700;
/** Viewer y of the reference plane (Z = 0). The plank hangs below it. */
export const Y_REF = 0.030;

// --- Principal planes (Article C2.2 / C2.3), as XF millimetres ----------
//
// C2.3.4  XF = 0 must lie between XA = 0 and XA = 150. We sit mid-range.
// C2.3.5  XA to XC between 1830 and 2030 mm. We sit mid-range.
// C2.3.6  XC to XPU at least 360 mm.
// C2.3.3  wheelbase XF to XR at most 3400 mm.
export const XA = -75;            // forward limit of the survival cell
export const XC = XA + 1930;      // rear of the cockpit            (1855)
export const XPU = XC + 400;      // ICE mounting face              (2255)
export const XR = 3400;           // rear axle
export const XDIF = XR - 20;      // final drive axis, just ahead of the axle

/** Viewer z for an XF coordinate in mm. */
export const zX = (xf) => Z_FRONT_AXLE - xf / 1000;
/** Viewer y for a Z coordinate in mm. */
export const yZ = (z) => Y_REF + z / 1000;
/** Viewer x for a Y coordinate in mm. */
export const xY = (y) => y / 1000;

/** FIA point [XF, Y, Z] in mm to a viewer Vector3. */
export const P = (xf, y, z) => new THREE.Vector3(y / 1000, Y_REF + z / 1000, Z_FRONT_AXLE - xf / 1000);

/** Inverse: viewer Vector3 to FIA [XF, Y, Z] in mm. */
export const toFIA = (v) => [
  (Z_FRONT_AXLE - v.z) * 1000,
  v.x * 1000,
  (v.y - Y_REF) * 1000,
];

/** Piecewise-linear interpolation through [x, value] keys sorted by x. */
export function piecewise(keys, x) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [x0, v0] = keys[i];
    const [x1, v1] = keys[i + 1];
    if (x <= x1) return v0 + (v1 - v0) * ((x - x0) / (x1 - x0));
  }
  return keys[keys.length - 1][1];
}

/**
 * Upper limit of the front bodywork, Appendix C2 §12.1: a cylinder of
 * 11,000 mm diameter on the Y-aligned axis [XC = -1000, Z = -4853]. The nose
 * and forward chassis crown must stay under it.
 */
export function noseCrownLimit(xf) {
  const dx = xf - (XC - 1000);
  return -4853 + Math.sqrt(5500 * 5500 - dx * dx);
}

/**
 * Lower limit of the nose and forward chassis, Appendix C2 §12.2. Nothing
 * ahead of XC - 875 may sit below this line.
 */
export function noseUndersideLimit(xf) {
  return piecewise([[-1300, 125], [-1000, 125], [XC - 1830, 225], [XC - 875, 195]], xf);
}

/**
 * The Reference Volumes used by the validator, reduced to the axis-aligned
 * and planar limits that can be tested point by point. Values in mm,
 * transcribed from Appendix C2 (Issue 16). Each entry gives the XF range
 * and, as functions of XF and Y, the permitted Y and Z extents.
 */
export const RV = {
  // §22: three front wing elements.
  'RV-FW-PROFILES': {
    x: [-1250, -475],
    y: [0, 675],
    // RS-FW-SECTION (§21) sweeps the leading-edge limit back with span;
    // §22.4 sweeps the trailing-edge limit back with span.
    xAt: (y) => [-1250 + Math.max(0, (y - 100) * 225 / 600), Math.min(-475, -750 + y * 250 / 400)],
    zAt: (y) => [
      piecewise([[0, 60], [100, 60], [675, 115]], y),
      piecewise([[0, 200], [400, 300], [675, 275]], y),
    ],
  },
  // §30: rear wing elements.
  'RV-RW-PROFILES': {
    x: [XR + 165, XR + 630],
    y: [0, 575],
    zAt: (y) => [y <= 150 ? 725 : 725 + (y - 150) * 60 / 425, 880],
  },
  // §16: sidepod inlet region.
  'RV-SIDEPOD': {
    x: [900, 1300],
    y: [0, 715],
    zAt: () => [125, 600],
  },
  // §17.1: engine cover plan outline at its widest.
  'RV-EC': {
    x: [1300, XR - 50],
    yMaxAt: (xf) => piecewise([[1300, 715], [XR - 1500, 715], [XR - 500, 575], [XR - 499, 350], [XR - 50, 300]], xf),
  },
  // §4.9: floor plan outline.
  'RV-FLOOR-BODY': {
    x: [350, XR + 300],
    yMaxAt: (xf) => xf < 1100
      ? piecewise([[350, 25], [1250, 340], [1400, 390]], xf)
      : piecewise([[1100, 770], [XR - 335, 700]], xf),
  },
};
