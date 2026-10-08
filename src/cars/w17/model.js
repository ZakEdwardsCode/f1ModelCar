// model.js - assembles the W17 from its builder modules.
//
// Every mesh carries userData.partId. The viewer uses that to raycast, to
// highlight, and to look the part up in the annotation database.

import * as THREE from 'three';
import { buildMaterials } from '../../lib/materials.js';
import { buildLiveryMaterials, buildDecalMaterials } from './livery.js';
import { buildChassis } from './build-chassis.js';
import { buildAero } from './build-aero.js';
import { buildRunningGear } from './build-running.js';
import { buildPowertrain } from './build-power.js';
import D from './dims.js';
import { tubAt } from './build-chassis.js';
import { zX, yZ } from './regs.js';

// Parts in these groups are internal and hidden until cutaway view is on.
const INTERNAL = new Set([
  'engine-block', 'oil-sump', 'crankshaft', 'cylinder-bank', 'cylinder-head',
  'camshaft-cover', 'exhaust-primary', 'fuel-rail', 'fuel-injector',
  'inlet-plenum', 'inlet-trumpet', 'plenum-feed-duct', 'turbine', 'compressor',
  'turbo-shaft', 'turbine-housing', 'wastegate', 'charge-air-pipe', 'mgu-k',
  'mgu-k-stator', 'mgu-k-drive-gear', 'energy-store', 'battery-cell-module',
  'control-electronics', 'inverter', 'high-voltage-cable', 'fuel-cell',
  'fuel-collector', 'high-pressure-fuel-pump', 'refuelling-connector',
  'water-radiator', 'charge-air-cooler', 'ers-cooler', 'oil-cooler',
  'water-pump', 'coolant-header-tank', 'gear-cluster',
  'clutch', 'differential', 'selector-barrel', 'hydraulic-accumulator',
  'gearbox-bellhousing', 'front-rocker', 'front-damper', 'front-torsion-bar',
  'front-anti-roll-bar', 'front-heave-element', 'rear-rocker', 'rear-damper',
  'rear-anti-roll-bar', 'side-impact-structure', 'front-impact-structure',
  'front-bulkhead', 'steering-column', 'steering-rack', 'safety-harness',
  'hans-device',
]);

// Bodywork that turns translucent in the cutaway view. Everything else stays
// opaque at all times: the car only goes see-through when the cutaway is
// switched on, or while an internal part is selected.
const SHELL = new Set([
  'engine-cover', 'sidepod', 'nose-cone', 'shark-fin', 'survival-cell',
  'sidepod-stripe-panel', 'sidepod-inlet', 'sidepod-inlet-splitter',
  'engine-cover-louvre', 'sidepod-cooling-louvre', 'bodywork-quarter-turn-fastener',
]);

export function buildW17(opts = {}) {
  const { quality = 'high', carNumber = 12 } = opts;
  const M = Object.assign(buildMaterials(quality), buildLiveryMaterials(quality));
  const DEC = buildDecalMaterials(carNumber);
  const root = new THREE.Group();
  root.name = 'W17';

  const meshes = new Map();   // partId -> Mesh[]
  const anchors = new Map();  // partId -> Vector3
  const movables = [];

  function add(id, geometry, material, opts = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.partId = id;
    mesh.userData.internal = INTERNAL.has(id);
    // Internals are inside opaque bodywork. Leaving them out of the render
    // and shadow passes until cutaway is on removes roughly a third of the
    // draw calls for no visible difference.
    if (mesh.userData.internal) mesh.visible = false;
    mesh.userData.shell = SHELL.has(id);
    (opts.parent || root).add(mesh);

    if (!meshes.has(id)) meshes.set(id, []);
    meshes.get(id).push(mesh);

    if (opts.anchor) {
      anchors.set(id, new THREE.Vector3(...opts.anchor));
    }
    return mesh;
  }

  const ctx = { add, M, root, movables, D };

  buildChassis(ctx);
  buildAero(ctx);
  buildRunningGear(ctx);
  buildPowertrain(ctx);

  /* --- Livery decals ------------------------------------------------- */
  // Alpha-mapped planes sitting just off the surface. Cheap, and the only
  // practical way to put lettering on a procedurally lofted body.
  const decal = (id, mat, w, h, pos, rot = [0, 0, 0]) => {
    const g = new THREE.PlaneGeometry(w, h);
    const m = add(id, g, mat, { anchor: pos });
    m.position.set(pos[0], pos[1], pos[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    m.castShadow = false;
    m.receiveShadow = false;
    return m;
  };

  // Positions are taken from the same body plan the surfaces are lofted
  // from, so the lettering always sits on the paint rather than in the air.
  const nose = tubAt(-600);
  const crownStar = tubAt(-900);
  const crownWord = tubAt(-350);
  for (const sx of [-1, 1]) {
    // Race number on the shark fin, the way it is read from a helicopter.
    decal('car-number', DEC.number, 0.135, 0.135,
      [sx * 0.0095, yZ(790), zX(2880)], [0, sx * Math.PI / 2, 0]);
    // Smaller number on the nose flank.
    decal('car-number', DEC.numberSmall, 0.120, 0.120,
      [sx * (nose.w / 1000 + 0.004), yZ((nose.zBot + nose.zTop) / 2 + 10), zX(-600)],
      [0, sx * Math.PI / 2, 0]);
    // Petronas wordmark along the sidepod flank, at its widest point.
    decal('sponsor-marking', DEC.petronas, 0.40, 0.062,
      [sx * 0.7095, yZ(372), zX(1650)], [0, sx * Math.PI / 2, 0]);
    decal('sponsor-marking', DEC.amg, 0.13, 0.055,
      [sx * 0.6705, yZ(340), zX(2120)], [0, sx * Math.PI / 2 - sx * 0.12, 0]);
  }
  // Three-pointed star and wordmark on the nose crown.
  decal('team-marque', DEC.star, 0.085, 0.085,
    [0, yZ(crownStar.zTop) + 0.0015, zX(-900)], [-Math.PI / 2, 0, 0]);
  decal('sponsor-marking', DEC.mercedes, 0.19, 0.031,
    [0, yZ(crownWord.zTop) + 0.0015, zX(-350)], [-Math.PI / 2, 0, 0]);

  // Derive an anchor for every part that did not declare one, from the
  // combined bounding box of its meshes.
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for (const [id, list] of meshes) {
    if (anchors.has(id)) continue;
    box.makeEmpty();
    for (const m of list) {
      tmp.setFromObject(m);
      box.union(tmp);
    }
    // For symmetric parts the centroid lands on the centreline, which is not
    // a useful place to point a camera. Bias toward the right-hand instance.
    const c = box.getCenter(new THREE.Vector3());
    if (list.length > 1 && Math.abs(c.x) < 0.02 && box.max.x > 0.15) {
      tmp.setFromObject(list[list.length - 1]);
      tmp.getCenter(c);
    }
    anchors.set(id, c);
  }

  // Radius of each part, used to choose a sensible camera distance.
  const radii = new Map();
  for (const [id, list] of meshes) {
    box.makeEmpty();
    for (const m of list) {
      tmp.setFromObject(m);
      box.union(tmp);
    }
    radii.set(id, Math.max(0.05, box.getSize(new THREE.Vector3()).length() * 0.5));
  }

  return { root, meshes, anchors, radii, movables, materials: M, dims: D };
}
