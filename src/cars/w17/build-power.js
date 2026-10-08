// build-power.js - Mercedes-AMG F1 M17 E PERFORMANCE power unit, transmission,
// energy store and cooling. These sit inside the bodywork and are revealed by
// the cutaway view.
//
// Architecture follows the published W17 specification: 1.6-litre V6 with six
// cylinders at a 90-degree bank angle, 24 valves, a single turbocharger, a
// 350 kW MGU-K and a 4.0 MJ usable energy store. There is no MGU-H: it was
// removed from the regulations for 2026.
//
// The engine sits far lower than it looks from outside. The crankshaft
// centreline runs at 90 mm above the reference plane, which puts the whole
// V6 down between the floor tunnels rather than up in the bodywork.

import * as THREE from 'three';
import { loft } from '../../lib/geom.js';
import D from './dims.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function buildPowertrain(ctx) {
  const { add, M } = ctx;

  const crankY = D.yCrank;              // 0.090
  const zCyl = [-0.690, -0.900, -1.110];

  /* ================================================================== */
  /* INTERNAL COMBUSTION ENGINE                                         */
  /* ================================================================== */

  const block = new THREE.BoxGeometry(0.228, 0.140, 0.640);
  block.translate(0, crankY + 0.040, -0.900);
  add('engine-block', block, M.engineAlloy);

  // Dry sump, so the pan under the crank is shallow.
  const sump = new THREE.BoxGeometry(0.198, 0.038, 0.560);
  sump.translate(0, crankY - 0.034, -0.900);
  add('oil-sump', sump, M.engineAlloy);

  const crank = new THREE.CylinderGeometry(0.028, 0.028, 0.620, 16);
  crank.rotateX(Math.PI / 2);
  crank.translate(0, crankY, -0.900);
  add('crankshaft', crank, M.aluminium);

  // Cylinder banks at 45 degrees either side of vertical, giving the
  // 90-degree included angle quoted in the car's specification.
  for (const sx of [-1, 1]) {
    const dir = new THREE.Vector3(sx * Math.SQRT1_2, Math.SQRT1_2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    for (const cz of zCyl) {
      const cyl = new THREE.CylinderGeometry(0.044, 0.044, 0.148, 18);
      cyl.translate(0, 0.074, 0);
      cyl.applyQuaternion(q);
      cyl.translate(sx * 0.028, crankY + 0.022, cz);
      add('cylinder-bank', cyl, M.engineAlloy);
    }

    const head = new THREE.BoxGeometry(0.104, 0.086, 0.548);
    head.applyQuaternion(q);
    head.translate(sx * 0.134, crankY + 0.148, -0.900);
    add('cylinder-head', head, M.engineAlloy);

    const cam = new THREE.BoxGeometry(0.058, 0.040, 0.510);
    cam.applyQuaternion(q);
    cam.translate(sx * 0.182, crankY + 0.196, -0.900);
    add('camshaft-cover', cam, M.engineAlloy);

    // Exhaust primaries collecting into the turbine feed.
    for (let i = 0; i < 3; i++) {
      const path = new THREE.CatmullRomCurve3([
        V(sx * 0.188, crankY + 0.124, zCyl[i]),
        V(sx * 0.232, crankY + 0.170, zCyl[i] - 0.090),
        V(sx * 0.178, crankY + 0.210, -1.190),
        V(sx * 0.082, crankY + 0.176, -1.300),
      ]);
      add('exhaust-primary', new THREE.TubeGeometry(path, 22, 0.021, 10, false), M.inconel);
    }

    const rail = new THREE.CylinderGeometry(0.011, 0.011, 0.490, 10);
    rail.rotateX(Math.PI / 2);
    rail.translate(sx * 0.102, crankY + 0.198, -0.900);
    add('fuel-rail', rail, M.aluminium);

    for (const cz of zCyl) {
      const inj = new THREE.CylinderGeometry(0.008, 0.008, 0.046, 10);
      inj.applyQuaternion(q);
      inj.translate(sx * 0.092, crankY + 0.172, cz);
      add('fuel-injector', inj, M.aluminium);
    }
  }

  // Inlet plenum in the vee.
  const plenum = new THREE.BoxGeometry(0.146, 0.086, 0.520);
  plenum.translate(0, crankY + 0.208, -0.880);
  add('inlet-plenum', plenum, M.engineAlloy);

  for (const sx of [-1, 1]) {
    for (const cz of zCyl) {
      const tr = new THREE.CylinderGeometry(0.028, 0.032, 0.052, 14, 1, true);
      tr.translate(sx * 0.048, crankY + 0.182, cz);
      add('inlet-trumpet', tr, M.aluminium);
    }
  }

  // Airbox down to the plenum: a long run on this car, from 940 mm at the
  // intake to the top of the vee at around 300 mm.
  const feedPath = new THREE.CatmullRomCurve3([
    V(0, D.yAirboxTop - 0.150, 0.010),
    V(0, 0.700, -0.180),
    V(0, 0.480, -0.400),
    V(0, crankY + 0.280, -0.560),
  ]);
  add('plenum-feed-duct', new THREE.TubeGeometry(feedPath, 28, 0.072, 14, false), M.structureBlack);

  /* ================================================================== */
  /* TURBOCHARGER                                                       */
  /* ================================================================== */

  const turbine = new THREE.CylinderGeometry(0.080, 0.080, 0.070, 22);
  turbine.rotateX(Math.PI / 2);
  turbine.translate(0, crankY + 0.170, -1.336);
  add('turbine', turbine, M.goldFoil);

  const compressor = new THREE.CylinderGeometry(0.074, 0.074, 0.064, 22);
  compressor.rotateX(Math.PI / 2);
  compressor.translate(0, crankY + 0.170, -1.240);
  add('compressor', compressor, M.aluminium);

  const shaft = new THREE.CylinderGeometry(0.015, 0.015, 0.140, 12);
  shaft.rotateX(Math.PI / 2);
  shaft.translate(0, crankY + 0.170, -1.288);
  add('turbo-shaft', shaft, M.titanium);

  const scroll = new THREE.TorusGeometry(0.074, 0.030, 12, 26);
  scroll.translate(0, crankY + 0.170, -1.346);
  add('turbine-housing', scroll, M.goldFoil);

  const wastegate = new THREE.CylinderGeometry(0.023, 0.023, 0.068, 14);
  wastegate.rotateZ(0.6);
  wastegate.translate(0.084, crankY + 0.222, -1.336);
  add('wastegate', wastegate, M.inconel);

  for (const sx of [-1, 1]) {
    const path = new THREE.CatmullRomCurve3([
      V(sx * 0.056, crankY + 0.170, -1.218),
      V(sx * 0.280, crankY + 0.180, -1.000),
      V(sx * 0.440, crankY + 0.200, -0.400),
      V(sx * 0.420, crankY + 0.210, 0.180),
    ]);
    add('charge-air-pipe', new THREE.TubeGeometry(path, 26, 0.034, 12, false), M.aluminium);
  }

  /* ================================================================== */
  /* ELECTRICAL SYSTEM                                                  */
  /* ================================================================== */

  const mguk = new THREE.CylinderGeometry(0.078, 0.078, 0.200, 24);
  mguk.rotateZ(Math.PI / 2);
  mguk.translate(-0.168, crankY + 0.030, -0.640);
  add('mgu-k', mguk, M.engineAlloy);

  const windings = new THREE.CylinderGeometry(0.062, 0.062, 0.144, 24);
  windings.rotateZ(Math.PI / 2);
  windings.translate(-0.168, crankY + 0.030, -0.640);
  add('mgu-k-stator', windings, M.copper);

  const drive = new THREE.CylinderGeometry(0.030, 0.030, 0.120, 14);
  drive.rotateZ(Math.PI / 2);
  drive.translate(-0.058, crankY + 0.030, -0.640);
  add('mgu-k-drive-gear', drive, M.aluminium);

  // Energy store, carried as low in the survival cell as the tub allows.
  const es = new THREE.BoxGeometry(0.340, 0.098, 0.420);
  es.translate(0, 0.128, -0.300);
  add('energy-store', es, M.structureBlack);

  for (let i = 0; i < 6; i++) {
    const cellPack = new THREE.BoxGeometry(0.048, 0.076, 0.390);
    cellPack.translate(-0.140 + i * 0.056, 0.128, -0.300);
    add('battery-cell-module', cellPack, M.discEdge);
  }

  const ecu = new THREE.BoxGeometry(0.186, 0.056, 0.148);
  ecu.translate(0, 0.330, 0.010);
  add('control-electronics', ecu, M.aluminium);

  const inverter = new THREE.BoxGeometry(0.196, 0.070, 0.166);
  inverter.translate(0, 0.252, -0.590);
  add('inverter', inverter, M.aluminium);

  const hv = new THREE.CatmullRomCurve3([
    V(-0.120, 0.176, -0.470), V(-0.180, 0.210, -0.560), V(-0.178, 0.150, -0.640),
  ]);
  add('high-voltage-cable', new THREE.TubeGeometry(hv, 18, 0.015, 8, false), M.rainLight);

  /* ================================================================== */
  /* FUEL SYSTEM                                                        */
  /* ================================================================== */

  const cellGeo = new THREE.BoxGeometry(0.420, 0.172, 0.520);
  cellGeo.translate(0, 0.272, -0.270);
  add('fuel-cell', cellGeo, M.nomex);

  const collector = new THREE.CylinderGeometry(0.050, 0.050, 0.104, 16);
  collector.translate(0, 0.190, -0.520);
  add('fuel-collector', collector, M.aluminium);

  const hpPump = new THREE.CylinderGeometry(0.028, 0.028, 0.076, 14);
  hpPump.rotateX(Math.PI / 2);
  hpPump.translate(0.118, 0.200, -0.580);
  add('high-pressure-fuel-pump', hpPump, M.aluminium);

  const filler = new THREE.CylinderGeometry(0.038, 0.042, 0.068, 16);
  filler.rotateZ(0.5);
  filler.translate(0.286, 0.340, -0.180);
  add('refuelling-connector', filler, M.aluminium);

  /* ================================================================== */
  /* COOLING                                                            */
  /* ================================================================== */

  for (const sx of [-1, 1]) {
    const rad = new THREE.BoxGeometry(0.050, 0.238, 0.420);
    rad.rotateY(sx * 0.22);
    rad.rotateZ(sx * 0.14);
    rad.translate(sx * 0.468, 0.330, 0.300);
    add('water-radiator', rad, M.radiator);

    const cac = new THREE.BoxGeometry(0.044, 0.196, 0.330);
    cac.rotateY(sx * 0.18);
    cac.translate(sx * 0.518, 0.318, 0.070);
    add('charge-air-cooler', cac, M.radiator);

    const ers = new THREE.BoxGeometry(0.040, 0.148, 0.240);
    ers.rotateY(sx * 0.14);
    ers.translate(sx * 0.500, 0.300, -0.340);
    add('ers-cooler', ers, M.radiator);

    const oil = new THREE.BoxGeometry(0.036, 0.120, 0.180);
    oil.rotateY(sx * 0.12);
    oil.translate(sx * 0.430, 0.294, -0.640);
    add('oil-cooler', oil, M.radiator);
  }

  const waterPump = new THREE.CylinderGeometry(0.036, 0.036, 0.058, 16);
  waterPump.rotateX(Math.PI / 2);
  waterPump.translate(-0.126, crankY + 0.012, -0.560);
  add('water-pump', waterPump, M.aluminium);

  const header = new THREE.CylinderGeometry(0.042, 0.042, 0.126, 16);
  header.rotateZ(Math.PI / 2);
  header.translate(0, crankY + 0.272, -0.560);
  add('coolant-header-tank', header, M.aluminium);

  /* ================================================================== */
  /* TRANSMISSION                                                       */
  /* ================================================================== */
  // Eight forward speeds and one reverse in a carbon fibre main case. The
  // case is structural: the rear suspension and rear wing load into it.
  // Input comes in at crank height and steps up to the driveshafts at
  // wheel-centre height.

  const gbPlan = [
    [D.zEngineRear, 0.150, 0.072, 0.440],
    [-1.450, 0.140, 0.082, 0.452],
    [-1.650, 0.122, 0.102, 0.452],
    [-1.820, 0.100, 0.128, 0.436],
    [D.zGearboxRear, 0.078, 0.158, 0.410],
  ];
  const gbRings = gbPlan.map(([z, w, yBot, yTop]) => {
    const yc = (yBot + yTop) / 2;
    const h = (yTop - yBot) / 2;
    const ring = [];
    for (let k = 0; k < 30; k++) {
      const a = (k / 30) * Math.PI * 2;
      ring.push(V(
        w * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.62),
        yc + h * Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.62),
        z
      ));
    }
    return ring;
  });
  add('gearbox-casing', loft(gbRings, { capStart: true, capEnd: true }), M.carbonFine);

  for (let i = 0; i < 8; i++) {
    const r = 0.048 - Math.abs(i - 3.5) * 0.0035;
    const gear = new THREE.CylinderGeometry(r, r, 0.028, 20);
    gear.rotateX(Math.PI / 2);
    gear.translate(0, 0.186, -1.340 - i * 0.052);
    add('gear-cluster', gear, M.aluminium);
  }

  const clutch = new THREE.CylinderGeometry(0.054, 0.054, 0.038, 20);
  clutch.rotateX(Math.PI / 2);
  clutch.translate(0, crankY, -1.278);
  add('clutch', clutch, M.discEdge);

  const diff = new THREE.CylinderGeometry(0.070, 0.070, 0.126, 20);
  diff.rotateZ(Math.PI / 2);
  diff.translate(0, D.tyreRearR, D.zRearAxle);
  add('differential', diff, M.aluminium);

  const barrel = new THREE.CylinderGeometry(0.024, 0.024, 0.220, 14);
  barrel.rotateX(Math.PI / 2);
  barrel.translate(0.078, 0.280, -1.500);
  add('selector-barrel', barrel, M.aluminium);

  const hyd = new THREE.CylinderGeometry(0.028, 0.028, 0.132, 14);
  hyd.rotateX(Math.PI / 2);
  hyd.translate(-0.086, 0.300, -1.480);
  add('hydraulic-accumulator', hyd, M.aluminium);

  const bell = new THREE.BoxGeometry(0.240, 0.320, 0.022);
  bell.translate(0, 0.240, -1.268);
  add('gearbox-bellhousing', bell, M.carbonFine);
}
