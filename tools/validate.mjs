// validate.mjs - headless build check.
//
//   node tools/validate.mjs
//
// Builds the car geometry outside a browser and reports:
//   * whether every builder runs without throwing
//   * the model bounding box against the published dimensions
//   * annotated parts that have no geometry, and geometry with no annotation
//
// Uses a minimal canvas stub, since the material textures are drawn to a
// canvas at load time and there is no DOM here.

const ctxStub = new Proxy({}, {
  get(target, prop) {
    if (prop === 'measureText') return (t) => ({ width: String(t).length * 40 });
    if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
      return () => ({ addColorStop() {} });
    }
    if (prop === 'canvas') return { width: 512, height: 512 };
    if (prop in target) return target[prop];
    return () => {};
  },
  set(target, prop, value) { target[prop] = value; return true; },
});

globalThis.document = {
  createElement(tag) {
    if (tag !== 'canvas') return {};
    return { width: 0, height: 0, getContext: () => ctxStub, style: {} };
  },
};
globalThis.self = globalThis;

const { buildW17 } = await import('../src/cars/w17/model.js');
const { PARTS, GROUP_ORDER } = await import('../src/cars/w17/parts.js');
const { default: D } = await import('../src/cars/w17/dims.js');
const R = await import('../src/cars/w17/regs.js');
const THREE = await import('three');

let failed = false;
const ok = (label, pass, detail = '') => {
  console.log((pass ? '  PASS  ' : '  FAIL  ') + label + (detail ? '   ' + detail : ''));
  if (!pass) failed = true;
};

console.log('\nBuilding W17 geometry...\n');
const t0 = Date.now();
const model = buildW17();
const ms = Date.now() - t0;

/* --- Geometry -------------------------------------------------------- */

let meshCount = 0;
let triCount = 0;
let badGeo = [];
model.root.traverse((o) => {
  if (!o.isMesh) return;
  meshCount++;
  const pos = o.geometry.attributes.position;
  triCount += (o.geometry.index ? o.geometry.index.count : pos.count) / 3;
  for (let i = 0; i < pos.count; i++) {
    if (!Number.isFinite(pos.getX(i)) || !Number.isFinite(pos.getY(i)) || !Number.isFinite(pos.getZ(i))) {
      badGeo.push(o.userData.partId);
      break;
    }
  }
});

console.log('BUILD');
ok('builders ran without throwing', true, ms + ' ms');
ok('meshes created', meshCount > 300, meshCount + ' meshes, ' + Math.round(triCount).toLocaleString() + ' triangles');
ok('no NaN vertices', badGeo.length === 0, badGeo.length ? [...new Set(badGeo)].join(', ') : '');

/* --- Dimensions ------------------------------------------------------ */

model.root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(model.root);
const size = box.getSize(new THREE.Vector3());

const near = (a, b, tol) => Math.abs(a - b) <= tol;

console.log('\nDIMENSIONS   (published figures in brackets)');
// The Reference Volumes run from XF -1300 (RV-BODY-FRONT) to XDIF + 760
// (RV-TAIL), about 5.46 m. Mercedes quote "under 5505 mm".
ok('overall length', size.z <= D.length + 0.005 && size.z >= D.length - 0.08,
   size.z.toFixed(3) + ' m  [under ' + D.length + ']');
ok('overall width', near(size.x, D.width, 0.02),
   size.x.toFixed(3) + ' m  [' + D.width + ']');
// C2.3.2 and the RV heights are measured from the reference plane (Z = 0),
// not the ground, so the ride height is taken off first.
ok('overall height above the reference plane', box.max.y - D.yFloor <= D.height,
   (box.max.y - D.yFloor).toFixed(3) + ' m  [max ' + D.height + ']');
ok('sits on the ground plane', box.min.y >= -0.005 && box.min.y < 0.02,
   'lowest point ' + box.min.y.toFixed(4) + ' m');
ok('wheelbase', near(D.zFrontAxle - D.zRearAxle, D.wheelbase, 0.001),
   (D.zFrontAxle - D.zRearAxle).toFixed(3) + ' m  [' + D.wheelbase + ']');

/* --- Layout ---------------------------------------------------------- */

const bbox = (id) => {
  const b = new THREE.Box3();
  const t = new THREE.Box3();
  for (const m of model.meshes.get(id)) { t.setFromObject(m); b.union(t); }
  return b;
};

console.log('\nLAYOUT');

const ft = bbox('front-tyre');
const rt = bbox('rear-tyre');
ok('front tyres sit on the road', Math.abs(ft.min.y) < 0.004, 'contact at y=' + ft.min.y.toFixed(4));
ok('rear tyres sit on the road', Math.abs(rt.min.y) < 0.004, 'contact at y=' + rt.min.y.toFixed(4));
ok('front tyre diameter', near(ft.max.y - ft.min.y, D.tyreFrontDia, 0.004),
   ((ft.max.y - ft.min.y) * 1000).toFixed(0) + ' mm  [' + D.tyreFrontDia * 1000 + ']');
ok('rear tyre diameter', near(rt.max.y - rt.min.y, D.tyreRearDia, 0.004),
   ((rt.max.y - rt.min.y) * 1000).toFixed(0) + ' mm  [' + D.tyreRearDia * 1000 + ']');
ok('front tyre tread width', near((ft.max.x - ft.min.x - 2 * D.xFrontTyre), D.tyreFrontWidth, 0.004),
   (D.tyreFrontWidth * 1000) + ' mm each side');
ok('front wing is ahead of the front axle',
   bbox('front-wing-mainplane').max.z > D.zFrontAxle,
   'trailing edge z=' + bbox('front-wing-mainplane').min.z.toFixed(3));
ok('rear wing is behind the rear axle',
   bbox('rear-wing-mainplane').max.z < D.zRearAxle,
   'leading edge z=' + bbox('rear-wing-mainplane').max.z.toFixed(3));

const floorBox = bbox('floor');
ok('floor underside sits at the reference plane', near(floorBox.min.y, D.yFloor, 0.003),
   (floorBox.min.y * 1000).toFixed(0) + ' mm ride height');
ok('floor upper surface is above its underside', floorBox.max.y > floorBox.min.y + 0.02,
   'section depth ' + ((floorBox.max.y - floorBox.min.y) * 1000).toFixed(0) + ' mm at the diffuser');
ok('floor stays inside the regulated width', floorBox.max.x <= D.floorHalfWidth + 0.001,
   '+/- ' + (floorBox.max.x * 1000).toFixed(0) + ' mm');

ok('halo sits above the cockpit', bbox('halo').max.y > 0.66, 'crown at y=' + bbox('halo').max.y.toFixed(3));
ok('engine is on the centreline', Math.abs(bbox('engine-block').getCenter(new THREE.Vector3()).x) < 0.01);
ok('energy store is carried low', bbox('energy-store').max.y < 0.36,
   'top at y=' + bbox('energy-store').max.y.toFixed(3));

/* --- Regulations ----------------------------------------------------- */
// Article C2.3 positions, and every vertex of the principal surfaces tested
// against the Reference Volume that governs it (Appendix C2, Issue 16).

console.log('\nREGULATIONS   (2026 Technical Regulations, Section C)');

ok('C2.3.4 front axle 0-150 mm behind XA', -R.XA >= 0 && -R.XA <= 150, (-R.XA) + ' mm');
ok('C2.3.5 XA to XC 1830-2030 mm', R.XC - R.XA >= 1830 && R.XC - R.XA <= 2030, (R.XC - R.XA) + ' mm');
ok('C2.3.6 XC to XPU at least 360 mm', R.XPU - R.XC >= 360, (R.XPU - R.XC) + ' mm');
ok('C2.3.3 wheelbase at most 3400 mm', R.XR <= 3400, R.XR + ' mm');

const v = new THREE.Vector3();
// Worst violation, in mm, over every vertex of a part. test() returns how
// far outside the volume a point [XF, |Y|, Z] lies (0 when inside).
function worst(id, test) {
  let w = 0;
  let at = null;
  for (const m of model.meshes.get(id)) {
    m.updateWorldMatrix(true, false);
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      const [xf, y, z] = R.toFIA(v);
      const d = test(xf, Math.abs(y), z);
      if (d > w) { w = d; at = [xf, y, z].map(Math.round); }
    }
  }
  return { w, at };
}
const outside = (val, lo, hi) => Math.max(0, lo - val, val - hi);
const TOL = 3;
const inRV = (label, ids, test) => {
  let w = 0;
  let at = null;
  for (const id of ids) {
    const r = worst(id, test);
    if (r.w > w) { w = r.w; at = id + ' at ' + r.at.join(', '); }
  }
  ok(label, w <= TOL, w <= TOL ? 'inside' : w.toFixed(1) + ' mm outside, ' + at);
};

const fw = R.RV['RV-FW-PROFILES'];
inRV('front wing elements inside RV-FW-PROFILES',
  ['front-wing-mainplane', 'front-wing-second-element', 'front-wing-upper-flap-centre', 'front-wing-upper-flap'],
  (xf, y, z) => {
    const [x0, x1] = fw.xAt(y);
    const [z0, z1] = fw.zAt(y);
    return Math.max(outside(xf, x0, x1), outside(y, ...fw.y), outside(z, z0, z1));
  });

const rw = R.RV['RV-RW-PROFILES'];
inRV('rear wing elements inside RV-RW-PROFILES',
  ['rear-wing-mainplane', 'rear-wing-flap-1', 'rear-wing-flap-2'],
  (xf, y, z) => {
    const [z0, z1] = rw.zAt(y);
    return Math.max(outside(xf, ...rw.x), outside(y, ...rw.y), outside(z, z0, z1));
  });

const ec = R.RV['RV-EC'];
inRV('sidepods inside RV-SIDEPOD and RV-EC plan',
  ['sidepod'],
  (xf, y, z) => {
    if (xf < 1300) {
      // §16.1: inlet face behind the line [900, 275] - [1200, 715].
      const xMin = y <= 275 ? 900 : 900 + (y - 275) * 300 / 440;
      return Math.max(outside(xf, xMin, 1300), outside(y, 0, 715), outside(z, 125, 600));
    }
    // §17.3: above Y 400 the top falls from Z 600 at XC to Z 350 at XR-50.
    const zMax = y > 400 ? Math.min(600, 600 - 250 * (xf - R.XC) / (R.XR - 50 - R.XC)) : 970;
    return Math.max(outside(y, 0, ec.yMaxAt(xf)), outside(z, 50, zMax));
  });

inRV('engine cover inside RV-EC and RV-TAIL',
  ['engine-cover'],
  (xf, y, z) => {
    if (xf > R.XR - 50) return Math.max(outside(y, 0, 145), outside(z, 0, 500));
    const spine = xf < R.XC + 500 ? 970 : 970 - 370 * (xf - R.XC - 500) / (R.XR - 50 - R.XC - 500);
    return Math.max(outside(y, 0, ec.yMaxAt(Math.max(1300, xf))), outside(z, 50, spine));
  });

const fl = R.RV['RV-FLOOR-BODY'];
inRV('floor inside RV-FLOOR-BODY plan',
  ['floor'],
  (xf, y, z) => Math.max(outside(xf, ...fl.x), outside(y, 0, fl.yMaxAt(xf) + 1), outside(z, -1, 275)));

inRV('nose under the RV-BODY-FRONT crown and above its underside line',
  ['nose-cone'],
  (xf, y, z) => Math.max(
    outside(xf, -1300, R.XA + 1),
    Math.max(0, z - R.noseCrownLimit(xf)),
    Math.max(0, R.noseUndersideLimit(xf) - z)));

inRV('nose camera pods inside RV-CAMERA-2',
  ['nose-camera-pod'],
  (xf, y, z) => {
    // The stalk joining the pod to the nose is the alignment part C8.16.7
    // allows; test the pod body, which is everything outboard of Y 200.
    if (y < 199) return 0;
    const zMax = 220 + 330 * (xf + 1250) / (R.XA + 1250);
    return Math.max(outside(xf, -450, -150), outside(y, 0, 330), outside(z, 325, zMax));
  });

inRV('airbox camera pods at Position 3',
  ['onboard-camera-pod'],
  (xf, y, z) => Math.max(outside(xf, R.XC, R.XC + 300), outside(z, 840, 900),
    outside(y, 120, 330)));

let degenerate = [];
let tooWide = [];
for (const id of model.meshes.keys()) {
  const b = bbox(id);
  const sz = b.getSize(new THREE.Vector3());
  if (sz.x < 1e-5 && sz.y < 1e-5 && sz.z < 1e-5) degenerate.push(id);
  if (b.max.x > D.width / 2 + 0.002 || b.min.x < -D.width / 2 - 0.002) tooWide.push(id);
}
ok('no degenerate parts', degenerate.length === 0, degenerate.join(', '));
ok('no part exceeds the width limit', tooWide.length === 0, tooWide.join(', '));

/* --- Annotation coverage -------------------------------------------- */

const geoIds = new Set(model.meshes.keys());
const dataIds = new Set(Object.keys(PARTS));
const missingData = [...geoIds].filter((id) => !dataIds.has(id));
const missingGeo = [...dataIds].filter((id) => !geoIds.has(id));

console.log('\nANNOTATION');
ok('every mesh has an annotation', missingData.length === 0,
   missingData.length ? missingData.join(', ') : geoIds.size + ' part ids');
ok('every annotation has geometry', missingGeo.length === 0,
   missingGeo.length ? missingGeo.join(', ') : dataIds.size + ' entries');

const badGroup = Object.entries(PARTS).filter(([, p]) => !GROUP_ORDER.includes(p.group));
ok('every part is in a known group', badGroup.length === 0,
   badGroup.map(([id, p]) => id + ' -> ' + p.group).join(', '));

const badSrc = Object.entries(PARTS).filter(
  ([, p]) => !['official', 'reg', 'supplier', 'observed', 'general'].includes(p.src));
ok('every part has a valid provenance tag', badSrc.length === 0,
   badSrc.map(([id]) => id).join(', '));

const badTier = Object.entries(PARTS).filter(([, p]) => !(p.tier >= 1 && p.tier <= 4));
ok('every part has a detail tier', badTier.length === 0, badTier.map(([id]) => id).join(', '));

const noAnchor = [...dataIds].filter((id) => !model.anchors.has(id));
ok('every part has a camera anchor', noAnchor.length === 0, noAnchor.join(', '));

/* --- Tier distribution ---------------------------------------------- */

const tiers = [0, 0, 0, 0, 0];
for (const p of Object.values(PARTS)) tiers[p.tier]++;
console.log('\nDETAIL TIERS');
console.log('  1 assemblies  ' + tiers[1]);
console.log('  2 subsystems  ' + tiers[2]);
console.log('  3 components  ' + tiers[3]);
console.log('  4 detail      ' + tiers[4]);

const srcCount = {};
for (const p of Object.values(PARTS)) srcCount[p.src] = (srcCount[p.src] || 0) + 1;
console.log('\nPROVENANCE');
for (const [k, v] of Object.entries(srcCount)) console.log('  ' + k.padEnd(10) + v);

/* --- Movables -------------------------------------------------------- */
console.log('\nACTIVE AERO');
ok('movable elements registered', model.movables.length === 4,
   model.movables.map((m) => m.id).join(', '));

console.log('\n' + (failed ? 'VALIDATION FAILED' : 'All checks passed') + '\n');
process.exit(failed ? 1 : 0);
