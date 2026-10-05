// smoke-ui.mjs - exercises the browser-side modules against a minimal DOM
// stub, so selector typos and runtime errors surface without a browser.
//
//   node tools/smoke-ui.mjs

/* ------------------------------------------------------------------ */
/* Minimal DOM                                                         */
/* ------------------------------------------------------------------ */

class ClassList {
  constructor() { this.s = new Set(); }
  add(...c) { c.forEach((x) => this.s.add(x)); }
  remove(...c) { c.forEach((x) => this.s.delete(x)); }
  toggle(c, force) {
    const on = force === undefined ? !this.s.has(c) : force;
    if (on) this.s.add(c); else this.s.delete(c);
    return on;
  }
  contains(c) { return this.s.has(c); }
}

const ALL = [];

class El {
  constructor(tag = 'div') {
    this.tagName = (tag || 'div').toUpperCase();
    this.children = [];
    this.classList = new ClassList();
    this.dataset = {};
    this.style = { setProperty() {}, removeProperty() {} };
    this.attrs = {};
    this._html = '';
    this.textContent = '';
    this.value = '';
    this.scrollTop = 0;
    this.offsetWidth = 140;
    this.offsetHeight = 22;
    this.listeners = {};
    this.parent = null;
    ALL.push(this);
  }
  get className() { return [...this.classList.s].join(' '); }
  set className(v) { this.classList = new ClassList(); String(v).split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c)); }
  get innerHTML() { return this._html; }
  set innerHTML(v) {
    this._html = String(v);
    // Crudely materialise [data-goto] children so panel links can be found.
    this.children = [];
    for (const m of this._html.matchAll(/data-goto="([^"]+)"/g)) {
      const c = new El('button');
      c.dataset.goto = m[1];
      c.parent = this;
      this.children.push(c);
    }
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  append(...cs) { cs.forEach((c) => this.appendChild(c)); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this); }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  dispatch(t, ev = {}) { (this.listeners[t] || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {}, currentTarget: this, target: this, ...ev })); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  focus() {} blur() {}
  closest(sel) {
    const key = sel.replace(/[[\]]/g, '');
    let n = this;
    while (n) { if (n.dataset[key.split('=')[0]] !== undefined) return n; n = n.parent; }
    return null;
  }
  _walk(out = []) { out.push(this); this.children.forEach((c) => c._walk(out)); return out; }
  querySelectorAll(sel) {
    const cls = sel.replace(/^\./, '');
    return this._walk().filter((e) => e.classList.contains(cls));
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

const byId = {};
const ids = [
  'panel', 'panel-close', 'browser-list', 'search', 'search-results', 'tier-meter',
  'tier-name', 'readout', 'tours', 'legend', 'car-name', 'car-sub', 'part-count',
  'btn-cutaway', 'btn-aero', 'btn-spin', 'explode', 'btn-reset', 'btn-browser',
  'btn-legend', 'hotspot-layer', 'gl', 'loader',
];
for (const id of ids) { byId[id] = new El(id.startsWith('btn') ? 'button' : 'div'); byId[id].dataset.id = id; }

// Detail-level meter has four segments.
for (let i = 1; i <= 4; i++) {
  const seg = new El('i');
  seg.dataset.t = String(i);
  byId['tier-meter'].appendChild(seg);
}

const ctxStub = new Proxy({}, {
  get(t, p) {
    if (p === 'measureText') return (t) => ({ width: String(t).length * 40 });
    if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (p in t) return t[p];
    return () => {};
  },
  set(t, p, v) { t[p] = v; return true; },
});

globalThis.document = {
  body: new El('body'),
  createElement: (tag) => (tag === 'canvas'
    ? { width: 0, height: 0, style: {}, getContext: () => ctxStub }
    : new El(tag)),
  createDocumentFragment: () => new El('fragment'),
  querySelector: (sel) => byId[sel.replace(/^#/, '')] || null,
  getElementById: (id) => byId[id] || null,
  addEventListener() {},
};
globalThis.innerWidth = 1600;
globalThis.innerHeight = 900;
globalThis.addEventListener = () => {};
globalThis.devicePixelRatio = 1;
globalThis.requestAnimationFrame = (fn) => { fn(0); return 1; };
globalThis.self = globalThis;

/* ------------------------------------------------------------------ */
/* Exercise                                                            */
/* ------------------------------------------------------------------ */

const THREE = await import('three');
const { buildW17 } = await import('../src/cars/w17/model.js');
const { PARTS, SOURCES, CAR, GROUP_ORDER, TOURS } = await import('../src/cars/w17/parts.js');
const { Hotspots, tierForDistance } = await import('../src/viewer/hotspots.js');
const { UI } = await import('../src/viewer/ui.js');

let failed = false;
const ok = (label, pass, detail = '') => {
  console.log((pass ? '  PASS  ' : '  FAIL  ') + label + (detail ? '   ' + detail : ''));
  if (!pass) failed = true;
};
const attempt = (label, fn) => {
  try { const d = fn(); ok(label, true, d || ''); }
  catch (e) { ok(label, false, e.message + '\n' + (e.stack || '').split('\n')[1]); }
};

console.log('\nUI SMOKE TEST\n');

const model = buildW17();
for (const [id, list] of model.meshes) {
  if (PARTS[id] && list[0].userData.internal) PARTS[id].internal = true;
}

let selectedId = null;
let hotspots;

attempt('Hotspots constructs', () => {
  hotspots = new Hotspots({
    layer: byId['hotspot-layer'],
    parts: PARTS,
    anchors: model.anchors,
    sources: SOURCES,
    onSelect: (id) => { selectedId = id; },
  });
  return hotspots.items.length + ' markers';
});

let ui;
attempt('UI constructs', () => {
  ui = new UI({
    car: CAR, parts: PARTS, sources: SOURCES,
    groupOrder: GROUP_ORDER, tours: TOURS,
    handlers: {
      onSelect: (id) => { selectedId = id; },
      onCutaway() {}, onAero() {}, onExplode() {}, onSpin() {}, onTour() {}, onReset() {},
    },
  });
  return byId['browser-list'].querySelectorAll('item').length + ' browser rows';
});

attempt('intro panel renders', () => {
  ui.showIntro();
  const h = byId['panel'].innerHTML;
  if (!h.includes(CAR.name)) throw new Error('car name missing from intro');
  if (!h.includes('772 kg')) throw new Error('published weight missing');
  return h.length + ' chars';
});

attempt('every part renders a panel', () => {
  for (const id of Object.keys(PARTS)) {
    ui.showPart(id);
    const h = byId['panel'].innerHTML;
    if (!h.includes(PARTS[id].name)) throw new Error('name missing for ' + id);
    if (h.includes('undefined')) throw new Error('undefined leaked into panel for ' + id);
  }
  return Object.keys(PARTS).length + ' panels';
});

attempt('source legend renders', () => {
  const n = byId['legend'].children.length;
  if (n !== Object.keys(SOURCES).length) throw new Error('legend rows ' + n);
  return n + ' rows';
});

attempt('tour buttons render and resolve to real parts', () => {
  const n = byId['tours'].children.length;
  if (n !== TOURS.length) throw new Error('tour buttons ' + n);
  const bad = TOURS.filter((t) => t.part && !PARTS[t.part]);
  if (bad.length) throw new Error('unknown part: ' + bad.map((t) => t.part).join(', '));
  return n + ' tours';
});

attempt('search finds parts by name and by spec text', () => {
  const cases = [['halo', 'halo'], ['sidepod', 'sidepod'], ['350 kw', 'mgu-k'], ['brembo', null]];
  for (const [q] of cases) {
    byId['search'].value = q;
    byId['search'].dispatch('input');
    if (!byId['search-results'].children.length) throw new Error('no results for "' + q + '"');
  }
  return cases.length + ' queries';
});

attempt('readout updates', () => {
  ui.setReadout({ tier: 3, dist: 1.84, shown: 12 });
  if (!byId['readout'].textContent.includes('1.84')) throw new Error('distance missing');
  if (byId['tier-name'].textContent !== 'Components') throw new Error('tier name ' + byId['tier-name'].textContent);
  return byId['readout'].textContent.trim();
});

attempt('detail tier bands are ordered', () => {
  const t = [12, 5, 2, 0.5].map(tierForDistance);
  if (String(t) !== '1,2,3,4') throw new Error('got ' + t);
  return 'far ' + t[0] + ' -> close ' + t[3];
});

attempt('pushing in reveals progressively finer detail', () => {
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.01, 260);
  const controls = { target: new THREE.Vector3() };
  // Orbit around the whole car, then close in on the front wing.
  const focus = [
    { at: [0, 0.45, 0.1], d: 9.0, label: 'whole car' },
    { at: [0, 0.45, 0.1], d: 4.6, label: 'three-quarter' },
    { at: [0.55, 0.15, 2.65], d: 1.9, label: 'front wing' },
    { at: [0.86, 0.15, 2.65], d: 0.55, label: 'flap adjuster' },
  ];
  const out = [];
  const seenTiers = new Set();
  for (const f of focus) {
    controls.target.set(...f.at);
    const dir = new THREE.Vector3(0.62, 0.42, 0.66).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, f.d);
    camera.lookAt(controls.target);
    camera.updateMatrixWorld(true);
    let r;
    for (let i = 0; i < 7; i++) r = hotspots.update(camera, controls, model.root, 0.016);
    if (r.shown < 1) throw new Error('no markers at ' + f.label);
    seenTiers.add(r.tier);
    out.push(f.label + ': tier ' + r.tier + ', ' + r.shown + ' labelled');
  }
  if (seenTiers.size < 4) throw new Error('did not pass through all four tiers: ' + [...seenTiers]);
  return out.join('   |   ');
});

attempt('finest tier exposes fastener-level parts', () => {
  const t4 = Object.entries(PARTS).filter(([, p]) => p.tier === 4).map(([id]) => id);
  const expected = ['flap-adjuster-screw', 'halo-mounting-bolt', 'wheel-nut-retainer',
                    'tyre-valve', 'bodywork-quarter-turn-fastener'];
  const missing = expected.filter((id) => !t4.includes(id));
  if (missing.length) throw new Error('missing from tier 4: ' + missing.join(', '));
  return t4.length + ' detail-level parts';
});

attempt('selection highlights a marker', () => {
  hotspots.setSelected('halo');
  const sel = hotspots.items.filter((i) => i.el.classList.contains('is-selected'));
  if (sel.length !== 1) throw new Error('selected markers: ' + sel.length);
  return 'halo';
});

attempt('exploded view offsets markers', () => {
  const before = hotspots.items[0].pos.clone();
  hotspots.setExplode(1, new THREE.Vector3(0, 0.45, 0));
  const after = hotspots.items[0].pos.clone();
  if (before.distanceTo(after) < 1e-6) throw new Error('marker did not move');
  hotspots.setExplode(0, new THREE.Vector3(0, 0.45, 0));
  return 'offset ' + before.distanceTo(after).toFixed(3) + ' m';
});

attempt('internal parts hide until cutaway', () => {
  const internals = hotspots.items.filter((i) => i.internal).length;
  if (internals < 20) throw new Error('only ' + internals + ' internal markers');
  hotspots.setInternalVisible(true);
  return internals + ' internal markers';
});

console.log('\n' + (failed ? 'SMOKE TEST FAILED' : 'All checks passed') + '\n');
process.exit(failed ? 1 : 0);
