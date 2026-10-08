// build-aero.js - front wing, rear wing, active elements, rear structures.
//
// Two things drive the 2026 front wing geometry, and both are specific:
//
//  1. The elements span far less than the car. They stop at Y = 675, the
//     endplate sits just inboard of the front tyre, and only the footplate
//     reaches out to Y = 900 (RV-FW-PROFILES, RV-FWEP-BODY, RV-FWEP-OFP).
//  2. On the W17 the support pylons pick up on the SECOND plane, not the
//     mainplane. That leaves the second plane fixed and makes the third
//     plane the only movable one, and its central panel stays static too.
//     Almost every rival moves two elements instead.
//
// Aerofoil convention: these are inverted wings, so the trailing edge sits
// ABOVE the leading edge and the angle of attack is positive. Opening an
// element toward straight-line mode flattens it, which is a negative
// rotation about X.
//
// Both wings are laid out in FIA millimetres inside their Reference Volumes
// from Appendix C2 of the 2026 Technical Regulations; see regs.js.

import * as THREE from 'three';
import { wingElement, plate, loft } from '../../lib/geom.js';
import D from './dims.js';
import { P, zX, yZ, XR, XDIF, piecewise } from './regs.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rad = (d) => (d * Math.PI) / 180;
const sind = (d) => Math.sin(rad(d));
const cosd = (d) => Math.cos(rad(d));

/* ------------------------------------------------------------------ */
/* Front wing (C3.10, RV-FW-PROFILES §21-22)                           */
/* ------------------------------------------------------------------ */
//
// Up to three elements, inside a box that runs XF -1250..-475 and
// Y 0..675, with its leading-edge limit swept back by RS-FW-SECTION and its
// floor and roof given by the §22.1 polygon:
//   Y 0: Z 60..200     Y 400: Z ~89..300     Y 675: Z 115..275
// Everything here is laid out in that frame (mm) and converted at the end.

const FW_SPAN = D.fwElementSpan * 1000;      // 675

const fwLEmin = (y) => -1250 + Math.max(0, y - 100) * 225 / 600;
const fwZlow = (y) => piecewise([[0, 60], [100, 60], [675, 115]], y);

/**
 * Each element is described by its leading edge [XF, Z], chord and angle,
 * all as functions of span Y. The next element starts just behind and above
 * the trailing edge of the one ahead, leaving the slot gap that keeps flow
 * attached on the flap. Inverted wing: trailing edge ABOVE leading edge.
 */
function fwElements(y) {
  const t = Math.min(1, Math.abs(y) / FW_SPAN);
  const main = {
    x: fwLEmin(Math.abs(y)) + 8, z: fwZlow(Math.abs(y)) + 22,
    c: 236 - 26 * t, a: 3 + 7 * Math.pow(t, 1.4),
  };
  main.tx = main.x + main.c * cosd(main.a);
  main.tz = main.z + main.c * sind(main.a);
  const second = {
    x: main.tx - 28, z: main.tz + 12,
    c: 172 - 8 * t, a: 10 + 6 * Math.pow(t, 1.2),
  };
  second.tx = second.x + second.c * cosd(second.a);
  second.tz = second.z + second.c * sind(second.a);
  const third = {
    x: second.tx - 24, z: second.tz + 9,
    c: 132 - 22 * t, a: 16 + 6 * t,
  };
  return { main, second, third };
}

/** Viewer-space wing stations for one element between two spans (mm). */
function fwStations(key, y0, y1, n, origin = null) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const y = y0 + (y1 - y0) * (i / n);
    const e = fwElements(y)[key];
    // Quarter-chord point, which foilRing treats as the section origin.
    const qx = e.x + 0.25 * e.c * cosd(e.a);
    const qz = e.z + 0.25 * e.c * sind(e.a);
    const s = {
      x: y / 1000, chord: e.c / 1000, aoa: rad(e.a),
      y: yZ(qz), z: zX(qx),
      t: key === 'main' ? 0.090 : 0.082, m: key === 'main' ? -0.070 : -0.085,
    };
    if (origin) { s.y -= origin.y; s.z -= origin.z; }
    out.push(s);
  }
  return out;
}

/** Leading-edge hinge of the third element at a span, in viewer space. */
function fwHinge(y) {
  const e = fwElements(y).third;
  return { y: yZ(e.z), z: zX(e.x) };
}

/**
 * A flat plate whose outline is given in the FIA X-Z plane, with its
 * lateral position allowed to vary with height. Used for the endplates,
 * which on the 2026 car sweep inboard as they come down.
 */
function bentPlate(outline, yOf, thickness) {
  const half = thickness / 2000;
  const a = outline.map(([xf, z]) => P(xf, yOf(z), z).add(V(-half, 0, 0)));
  const b = outline.map(([xf, z]) => P(xf, yOf(z), z).add(V(half, 0, 0)));
  return loft([a, b], { capStart: true, capEnd: true });
}

/* ------------------------------------------------------------------ */

export function buildAero(ctx) {
  const { add, M, root, movables } = ctx;

  /* ================================================================== */
  /* FRONT WING                                                         */
  /* ================================================================== */

  const EP_Y = D.fwEndplateOuter * 1000 - 6;   // endplate centre plane
  const tipY = EP_Y - 2;                        // elements die into it

  // Plane 1: mainplane, fixed.
  add('front-wing-mainplane',
    wingElement(fwStations('main', -tipY, tipY, 26)), M.bodyBlack);

  // Plane 2: fixed on the W17, because the pylons land on it.
  add('front-wing-second-element',
    wingElement(fwStations('second', -tipY, tipY, 26)), M.bodyBlack);

  // Plane 3, central panel: static on this car.
  add('front-wing-upper-flap-centre',
    wingElement(fwStations('third', -225, 225, 10)), M.bodyBlack);

  // Plane 3, outboard panels: the only movable aerodynamic surfaces at the
  // front of this car. Hinged about the leading edge at mid-panel.
  for (const sx of [-1, 1]) {
    const hinge = fwHinge(440);
    const pivot = new THREE.Group();
    pivot.position.set(0, hinge.y, hinge.z);
    root.add(pivot);
    const geo = wingElement(fwStations('third', sx * 240, sx * tipY, 14, hinge));
    add('front-wing-upper-flap', geo, M.bodyBlack, {
      parent: pivot,
      anchor: [sx * 0.46, hinge.y + 0.05, hinge.z - 0.05],
    });
    movables.push({ obj: pivot, closed: 0, open: -rad(18), id: 'front-wing-upper-flap' });
  }

  // Endplates, RV-FWEP-BODY (§23): Y 575..680, front edge behind
  // RS-FW-SECTION, top under the §23.5 plane, rear edge clear of the
  // 925 mm cylinder around the front tyre.
  const EP = [
    [-1040, 78], [-1040, 240], [-900, 298], [-740, 352], [-580, 366],
    [-515, 334], [-488, 240], [-505, 140], [-545, 78],
  ];
  for (const sx of [-1, 1]) {
    add('front-wing-endplate', bentPlate(EP, () => sx * EP_Y, 10), M.bodyBlack);

    // Footplates, RV-FWEP-IFP and RV-FWEP-OFP: a shelf at the base of the
    // endplate running out to Y 900, turning flow around the front tyre.
    const foot = plate(
      [{ x: sx * 0.600, z: zX(-1030) }, { x: sx * 0.895, z: zX(-960) },
       { x: sx * 0.895, z: zX(-420) }, { x: sx * 0.600, z: zX(-470) }],
      0.014, 'y'
    );
    foot.translate(0, yZ(90), 0);
    add('front-wing-footplate', foot, M.carbonFine);

    // Strakes standing on the outer footplate.
    for (let i = 0; i < 2; i++) {
      const st = plate(
        [{ y: yZ(97), z: zX(-940 + i * 40) }, { y: yZ(150 - i * 14), z: zX(-900 + i * 40) },
         { y: yZ(140 - i * 14), z: zX(-560) }, { y: yZ(97), z: zX(-520) }],
        0.006, 'x'
      );
      st.translate(sx * (0.760 + i * 0.070), 0, 0);
      add('front-wing-strake', st, M.carbonFine);
    }

    // Diveplane on the outer face of the endplate.
    const dive = plate(
      [{ x: sx * (EP_Y / 1000 + 0.004), z: zX(-860) }, { x: sx * 0.735, z: zX(-840) },
       { x: sx * 0.735, z: zX(-700) }, { x: sx * (EP_Y / 1000 + 0.004), z: zX(-690) }],
      0.008, 'y'
    );
    dive.translate(0, yZ(250), 0);
    add('front-wing-diveplane', dive, M.carbonFine);

    // Flap adjuster at the outboard end of the movable element.
    const e3 = fwElements(600).third;
    const brk = plate(
      [{ y: yZ(e3.z - 20), z: zX(e3.x + 10) }, { y: yZ(e3.z + 60), z: zX(e3.x + 40) },
       { y: yZ(e3.z + 60), z: zX(e3.x + 90) }, { y: yZ(e3.z - 20), z: zX(e3.x + 60) }],
      0.006, 'x'
    );
    brk.translate(sx * 0.630, 0, 0);
    add('front-wing-flap-adjuster', brk, M.aluminium);

    const screw = new THREE.CylinderGeometry(0.0055, 0.0055, 0.020, 8);
    screw.rotateZ(Math.PI / 2);
    screw.translate(sx * 0.630, yZ(e3.z + 30), zX(e3.x + 55));
    add('flap-adjuster-screw', screw, M.fastener);
  }

  // Twin pylons, RV-FW-PYLON (XF -1200..-950, Y 50..150), picking up on
  // the second plane. The gap this leaves under the nose is the channel
  // feeding the underfloor.
  const s2 = fwElements(90).second;
  for (const sx of [-1, 1]) {
    const pyl = plate(
      [{ y: yZ(165), z: zX(-1180) }, { y: yZ(165), z: zX(-960) },
       { y: yZ(s2.z + 18), z: zX(s2.x + 70) }, { y: yZ(s2.z + 6), z: zX(s2.x + 8) }],
      0.018, 'x'
    );
    pyl.translate(sx * 0.090, 0, 0);
    add('front-wing-pylon', pyl, M.bodySilver);
  }

  /* ================================================================== */
  /* REAR WING (C3.11, RV-RW-PROFILES §30)                              */
  /* ================================================================== */
  //
  // Box XR+165..+630, Y <= 575, Z <= 880, with a floor that rises from
  // Z 725 inboard of Y 150 to Z 785 at the tip: the 2026 "spoon" that keeps
  // the outboard wing lower in the airflow than the centre.

  const RW_EP_Y = 556;                         // endplate centre plane at the top
  const RW = (RW_EP_Y - 4) / 1000;             // element half-span
  const rwZlow = (y) => (y <= 150 ? 725 : 725 + (y - 150) * 60 / 425);

  // [LE offset behind XR, LE clearance above the floor, chord, angle at
  //  centre, angle at tip], chained so each starts in the slot of the last.
  const rwElements = (y) => {
    const t = Math.min(1, Math.abs(y) / (RW * 1000));
    const k = 1 - 0.06 * t;
    const main = { x: XR + 175, z: rwZlow(Math.abs(y)) + 22, c: 228 * k, a: 6 - 3 * t };
    main.tx = main.x + main.c * cosd(main.a);
    main.tz = main.z + main.c * sind(main.a);
    const f1 = { x: main.tx - 24, z: main.tz + 10 - 3 * t, c: 150 * k, a: 19 - 9 * t };
    f1.tx = f1.x + f1.c * cosd(f1.a);
    f1.tz = f1.z + f1.c * sind(f1.a);
    const f2 = { x: f1.tx - 22, z: f1.tz + 8 - 3 * t, c: 104 * k, a: 24 - 13 * t };
    return { main, f1, f2 };
  };

  const rwStations = (key, origin = null) => {
    const out = [];
    for (let i = 0; i <= 16; i++) {
      const y = -RW * 1000 + (2 * RW * 1000 * i) / 16;
      const e = rwElements(y)[key];
      const qx = e.x + 0.25 * e.c * cosd(e.a);
      const qz = e.z + 0.25 * e.c * sind(e.a);
      const s = {
        x: y / 1000, chord: e.c / 1000, aoa: rad(e.a),
        y: yZ(qz), z: zX(qx), t: 0.090, m: -0.080,
      };
      if (origin) { s.y -= origin.y; s.z -= origin.z; }
      out.push(s);
    }
    return out;
  };

  add('rear-wing-mainplane', wingElement(rwStations('main')), M.bodyBlack);

  // The two flaps swing toward flat in straight-line mode, pivoting about
  // their leading edges at the centreline.
  const rwFlaps = [
    { id: 'rear-wing-flap-1', key: 'f1', open: -15 },
    { id: 'rear-wing-flap-2', key: 'f2', open: -20 },
  ];
  for (const f of rwFlaps) {
    const e = rwElements(0)[f.key];
    const hy = yZ(e.z);
    const hz = zX(e.x);
    const pivot = new THREE.Group();
    pivot.position.set(0, hy, hz);
    root.add(pivot);
    const geo = wingElement(rwStations(f.key, { y: hy, z: hz }));
    add(f.id, geo, M.bodyBlack, { parent: pivot, anchor: [0, hy + 0.03, hz - 0.05] });
    movables.push({ obj: pivot, closed: 0, open: rad(f.open), id: f.id });
  }

  // Endplates, RV-RWEP-BODY (§31): a band that runs at Y 345..375 low down
  // and sweeps outboard to Y 535..575 above Z 700, trimmed front and rear by
  // the §31.3 planes. Outline as [XF, Z], lateral position by height.
  const rwEpY = (z) => piecewise([[250, 360], [400, 360], [690, RW_EP_Y], [900, RW_EP_Y]], z);
  const RWEP = [
    [XR + 390, 262], [XR + 612, 262], [XR + 672, 400], [XR + 738, 600],
    [XR + 745, 878], [XR + 160, 878], [XR + 163, 700], [XR + 235, 550],
    [XR + 308, 400],
  ];
  for (const sx of [-1, 1]) {
    add('rear-wing-endplate', bentPlate(RWEP, (z) => sx * rwEpY(z), 12), M.bodyBlack);

    for (let i = 0; i < 3; i++) {
      const lv = new THREE.BoxGeometry(0.016, 0.034, 0.004);
      lv.rotateX(0.3);
      lv.translate(sx * (RW_EP_Y / 1000 + 0.004), yZ(840 - i * 46), zX(XR + 640 + i * 26));
      add('rear-wing-endplate-louvre', lv, M.structureBlack);
    }

    // Twin pylons, RV-RW-PYLON (§32): Y 50..110, from the gearbox up to
    // the underside of the mainplane.
    const pyl = plate(
      [{ y: yZ(310), z: zX(XR + 10) }, { y: yZ(450), z: zX(XR + 10) },
       { y: yZ(735), z: zX(XR + 190) }, { y: yZ(742), z: zX(XR + 400) },
       { y: yZ(310), z: zX(XDIF + 380) }],
      0.024, 'x'
    );
    pyl.translate(sx * 0.080, 0, 0);
    add('rear-wing-pylon', pyl, M.bodySilver);

    // Straight-line mode actuation, inside RV-RW-SLM-FAIRING on the
    // centreline above the flaps.
    const f1 = rwElements(0).f1;
    const act = new THREE.CylinderGeometry(0.018, 0.018, 0.085, 14);
    act.rotateX(Math.PI / 2);
    act.translate(sx * 0.020, yZ(f1.tz + 40), zX(f1.x + 60));
    add('active-aero-actuator', act, M.aluminium);

    const link = new THREE.CylinderGeometry(0.005, 0.005, 0.080, 8);
    link.rotateX(0.75);
    link.translate(sx * 0.020, yZ(f1.tz + 10), zX(f1.tx - 10));
    add('active-aero-linkage', link, M.aluminium);
  }

  // Lower brace between the endplates, RV-RW-BRACE: XR+375..+625,
  // Y <= 375, Z 310..350.
  const brace = new THREE.CylinderGeometry(0.010, 0.010, 0.720, 10);
  brace.rotateZ(Math.PI / 2);
  brace.translate(0, yZ(330), zX(XR + 500));
  add('rear-wing-brace', brace, M.carbonFine);

  /* ================================================================== */
  /* REAR STRUCTURES                                                    */
  /* ================================================================== */

  // Rear impact structure inside RV-TAIL (§19): XDIF-110..+760,
  // Y <= 145, Z 175..380 at its tail.
  const risLen = 0.500;
  const ris = new THREE.CylinderGeometry(0.050, 0.078, risLen, 18);
  ris.rotateX(Math.PI / 2);
  ris.translate(0, yZ(280), zX(XDIF + 760) + risLen / 2);
  add('rear-impact-structure', ris, M.carbonFine);

  const light = new THREE.BoxGeometry(0.072, 0.040, 0.020);
  light.translate(0, yZ(262), zX(XDIF + 760) - 0.004);
  add('rain-light', light, M.rainLight);

  // Camera position 6: in the rear impact structure, looking backwards.
  const rcam = new THREE.CylinderGeometry(0.012, 0.012, 0.012, 14);
  rcam.rotateX(Math.PI / 2);
  rcam.translate(0, yZ(305), zX(XDIF + 760) - 0.002);
  add('rear-facing-camera', rcam, M.glass);
  const rcamBody = new THREE.BoxGeometry(0.036, 0.030, 0.040);
  rcamBody.translate(0, yZ(305), zX(XDIF + 760) + 0.022);
  add('rear-facing-camera', rcamBody, M.structureBlack);

  for (const sx of [-1, 1]) {
    const l2 = new THREE.BoxGeometry(0.012, 0.042, 0.016);
    l2.translate(sx * 0.556, yZ(700), zX(XR + 740));
    add('auxiliary-rain-light', l2, M.rainLight);
  }

  // Tailpipe, RV-TAILPIPE (§20): XR-55..+400, Y <= 75, Z 350..550.
  const pipe = new THREE.CylinderGeometry(0.046, 0.050, 0.220, 18, 1, true);
  pipe.rotateX(Math.PI / 2 - 0.10);
  pipe.translate(0, yZ(440), zX(XR + 270));
  add('exhaust-tailpipe', pipe, M.inconel);

  for (const sx of [-1, 1]) {
    const wg = new THREE.CylinderGeometry(0.017, 0.018, 0.150, 12, 1, true);
    wg.rotateX(Math.PI / 2 - 0.12);
    wg.translate(sx * 0.064, yZ(425), zX(XR + 240));
    add('wastegate-pipe', wg, M.inconel);
  }

  const towF = new THREE.TorusGeometry(0.022, 0.006, 8, 16);
  towF.rotateY(Math.PI / 2);
  towF.translate(0, yZ(122), zX(-1220));
  add('front-towing-eye', towF, M.aluminium);

  const towR = new THREE.TorusGeometry(0.024, 0.007, 8, 16);
  towR.rotateY(Math.PI / 2);
  towR.translate(0, yZ(215), zX(XDIF + 640));
  add('rear-towing-eye', towR, M.aluminium);
}
