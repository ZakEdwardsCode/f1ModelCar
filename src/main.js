// main.js - application entry point.

import * as THREE from 'three';
import { createScene, CameraFlight, detectQuality, qualitySettings } from './viewer/scene.js';
import { Hotspots } from './viewer/hotspots.js';
import { UI } from './viewer/ui.js';
import { buildW17 } from './cars/w17/model.js';
import { PARTS, SOURCES, CAR, GROUP_ORDER, TOURS } from './cars/w17/parts.js';

const canvas = document.getElementById('gl');

// Quality is chosen from the device, then adapted from measured frame time.
const stored = (() => { try { return localStorage.getItem('w17-quality'); } catch { return null; } })();
let quality = stored || detectQuality();
const Q = qualitySettings(quality);
const { renderer, scene, camera, controls } = createScene(canvas, quality);
if (quality === 'low') document.body.classList.add('perf-low');
const flight = new CameraFlight(camera, controls);

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

const model = buildW17({ quality, carNumber: 12 });
scene.add(model.root);

// Mark internal parts in the annotation data so the hotspot layer can hide
// them until the cutaway view is on.
for (const [id, list] of model.meshes) {
  if (PARTS[id] && list[0].userData.internal) PARTS[id].internal = true;
}

const centre = new THREE.Vector3(0, 0.45, 0);

/* --- Materials: solid by default ------------------------------------ */
// The car is opaque, as it is in real life. A material is only swapped while
// a part is selected (an opaque tint, never a see-through overlay) or while
// the cutaway is on, and is always rebuilt from the original, so the two
// states compose and undo cleanly.
const HIGHLIGHT = new THREE.Color(0x00e5d0);
const tintCache = new Map();
const ghostCache = new Map();

function tintMaterialFor(mat) {
  if (!tintCache.has(mat)) {
    const t = mat.clone();
    if (t.emissive) {
      t.emissive = HIGHLIGHT.clone();
      t.emissiveIntensity = 0.38;
    } else if (t.color) {
      t.color = t.color.clone().lerp(HIGHLIGHT, 0.45);
    }
    tintCache.set(mat, t);
  }
  return tintCache.get(mat);
}

function ghostMaterialFor(mat) {
  if (!ghostCache.has(mat)) {
    const g = mat.clone();
    g.transparent = true;
    g.opacity = 0.18;
    g.depthWrite = false;
    g.side = THREE.DoubleSide;
    ghostCache.set(mat, g);
  }
  return ghostCache.get(mat);
}

model.root.traverse((o) => {
  if (o.isMesh) o.userData.baseMaterial = o.material;
});

let highlighted = null;  // part id
let cutaway = false;     // effective state
let userCutaway = false; // the Cutaway button / C key
let autoCutaway = false; // an internal part is selected

function applyMaterial(o) {
  let m = o.userData.baseMaterial;
  const ghost = cutaway && o.userData.shell;
  if (ghost) m = ghostMaterialFor(m);
  if (highlighted && o.userData.partId === highlighted) m = tintMaterialFor(m);
  o.material = m;
  o.castShadow = !ghost && !o.material.transparent;
}

function highlight(id) {
  const prev = highlighted;
  highlighted = id && model.meshes.has(id) ? id : null;
  for (const pid of [prev, highlighted]) {
    if (!pid || !model.meshes.has(pid)) continue;
    for (const mesh of model.meshes.get(pid)) applyMaterial(mesh);
  }
}

/* --- Cutaway -------------------------------------------------------- */
function refreshCutaway() {
  const on = userCutaway || autoCutaway;
  if (on === cutaway) return;
  cutaway = on;
  model.root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.userData.internal) { o.visible = on; return; }
    if (o.userData.shell) applyMaterial(o);
  });
  hotspots.setInternalVisible(on);
}

function setCutaway(on) {
  userCutaway = on;
  refreshCutaway();
}

/* --- Active aero ---------------------------------------------------- */
let aeroTarget = 0;   // 0 = corner mode, 1 = straight-line mode
let aeroNow = 0;

function setAero(on) {
  aeroTarget = on ? 1 : 0;
}

/* --- Exploded view -------------------------------------------------- */
let explodeT = 0;

function setExplode(t) {
  explodeT = t;
  const dir = new THREE.Vector3();
  for (const [id, list] of model.meshes) {
    const anchor = model.anchors.get(id);
    if (!anchor) continue;
    dir.subVectors(anchor, centre);
    const len = dir.length() || 1;
    dir.multiplyScalar((t * 0.55) / len);
    for (const m of list) m.position.copy(dir);
  }
  hotspots.setExplode(t, centre);
}

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

let selected = null;

function select(id, opts = {}) {
  if (id && !PARTS[id]) id = null;
  selected = id;
  // Internal parts can only be seen through the bodywork, so selecting one
  // opens the cutaway for as long as it stays selected. Selecting anything
  // else, or nothing, puts the bodywork back.
  autoCutaway = !!(id && PARTS[id].internal);
  refreshCutaway();
  highlight(id);
  hotspots.setSelected(id);
  ui.showPart(id);

  if (id && opts.fly !== false) {
    const anchor = model.anchors.get(id).clone();
    if (explodeT > 0) {
      const d = anchor.clone().sub(centre);
      anchor.addScaledVector(d, (explodeT * 0.55) / (d.length() || 1));
    }
    const r = model.radii.get(id) || 0.2;
    flight.to(anchor, r, { zoom: r < 0.12 ? 5.2 : 3.0 });
  }
}

/* ------------------------------------------------------------------ */
/* Hotspots and UI                                                     */
/* ------------------------------------------------------------------ */

const hotspots = new Hotspots({
  layer: document.getElementById('hotspot-layer'),
  parts: PARTS,
  anchors: model.anchors,
  sources: SOURCES,
  onSelect: (id) => select(id),
  budget: { maxMarkers: Q.maxMarkers, occlusion: Q.occlusion },
});

let spin = false;

const ui = new UI({
  car: CAR,
  parts: PARTS,
  sources: SOURCES,
  groupOrder: GROUP_ORDER,
  tours: TOURS,
  handlers: {
    onSelect: (id) => select(id),
    onCutaway: setCutaway,
    onAero: setAero,
    onExplode: setExplode,
    onSpin: (v) => { spin = v; },
    onTour: (t) => {
      // Tours to internal systems open the cutaway through the selection
      // itself, and close it again when the next part is chosen.
      if (t.part) {
        select(t.part);
      } else {
        select(null);
        flight.cancel();
        controls.target.set(...t.target);
        camera.position.set(...t.pos);
      }
    },
    onReset: () => {
      select(null);
      setExplode(0);
      document.getElementById('explode').value = '0';
      flight.to(new THREE.Vector3(0, 0.45, 0.1), 2.35, { zoom: 2.9, duration: 900 });
    },
  },
});
ui.bindPanelLinks((id) => select(id));

/* ------------------------------------------------------------------ */
/* Picking on the model itself                                         */
/* ------------------------------------------------------------------ */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downAt = null;

renderer.domElement.addEventListener('pointerdown', (e) => {
  downAt = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 5) return; // that was a drag, not a click

  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  raycaster.far = 200;

  const hits = raycaster.intersectObject(model.root, true);
  for (const h of hits) {
    if (!h.object.visible) continue;
    // Ghosted bodywork is see-through, so clicks pass through it.
    if (cutaway && h.object.userData.shell) continue;
    const id = h.object.userData.partId;
    if (!id || !PARTS[id]) continue;
    if (PARTS[id].internal && !cutaway) continue;
    select(id, { fly: false });
    return;
  }
  select(null);
});

/* ------------------------------------------------------------------ */
/* Loading, then the render loop                                       */
/* ------------------------------------------------------------------ */

const clock = new THREE.Clock();

// Adaptive resolution. If frames get expensive the render target is scaled
// down before anything is removed from the scene, because resolution is the
// cheapest thing to give up and the easiest to give back.
let scale = 1;
let acc = 0;
let frames = 0;
function adapt(dt) {
  acc += dt;
  frames++;
  if (acc < 1) return;
  const fps = frames / acc;
  acc = 0;
  frames = 0;
  const before = scale;
  if (fps < 26 && scale > 0.55) scale = Math.max(0.55, scale - 0.12);
  else if (fps > 52 && scale < 1) scale = Math.min(1, scale + 0.08);
  if (scale !== before) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, Q.pixelRatio) * scale);
  }
  const el = document.getElementById('perf');
  // Persistent slowness drops the whole tier, not just resolution.
  if (fps < 20 && quality !== 'low') {
    try { localStorage.setItem('w17-quality', 'low'); } catch {}
    const n = document.getElementById('perf');
    if (n) n.innerHTML = Math.round(fps) + ' fps &mdash; <b>reload for low detail</b>';
    return;
  }
  if (el) el.textContent = Math.round(fps) + ' fps   ' + quality + (scale < 1 ? '   x' + scale.toFixed(2) : '');
}

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());

  if (spin && !flight.active) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
  } else {
    controls.autoRotate = false;
  }

  flight.update(dt);
  controls.update();

  // Active aero: ease the flaps toward the requested mode.
  if (Math.abs(aeroNow - aeroTarget) > 0.001) {
    aeroNow += (aeroTarget - aeroNow) * Math.min(1, dt * 5.5);
    for (const m of model.movables) {
      m.obj.rotation.x = m.closed + (m.open - m.closed) * aeroNow;
    }
  }

  adapt(dt);
  const readout = hotspots.update(camera, controls, model.root, dt);
  ui.setReadout(readout);

  renderer.render(scene, camera);
}

document.body.classList.remove('loading');
const loader = document.getElementById('loader');
loader.classList.add('done');
setTimeout(() => loader.remove(), 700);

frame();

// Opening move: a slow pull-in to the car so it is obvious the view is live.
camera.position.set(7.6, 3.4, 8.2);
controls.target.set(0, 0.45, 0.1);
flight.to(new THREE.Vector3(0, 0.45, 0.1), 2.35, { zoom: 2.9, duration: 2200 });
