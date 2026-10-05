// hotspots.js - projected annotation markers with zoom-driven level of detail.
//
// Markers are HTML, positioned each frame from a projected 3D anchor. Which
// ones appear depends on how far in the camera is: pull back and only the
// major assemblies are marked, push in and progressively finer detail
// appears, down to individual fasteners.

import * as THREE from 'three';

export const TIER_LABELS = [
  '', 'Assemblies', 'Subsystems', 'Components', 'Detail',
];

/** Camera distance thresholds between detail tiers, in metres. */
const TIER_BANDS = [7.0, 3.2, 1.3];

export function tierForDistance(d) {
  if (d >= TIER_BANDS[0]) return 1;
  if (d >= TIER_BANDS[1]) return 2;
  if (d >= TIER_BANDS[2]) return 3;
  return 4;
}

export class Hotspots {
  constructor({ layer, parts, anchors, sources, onSelect, budget = {} }) {
    this.budget = { maxMarkers: budget.maxMarkers ?? 34, occlusion: budget.occlusion ?? true };
    this.layer = layer;
    this.parts = parts;
    this.anchors = anchors;
    this.sources = sources;
    this.onSelect = onSelect;

    this.items = [];
    this.selected = null;
    this.hovered = null;
    this.tier = 1;
    this.showInternal = false;
    this.frame = 0;
    this.raycaster = new THREE.Raycaster();
    this._v = new THREE.Vector3();

    for (const [id, data] of Object.entries(parts)) {
      const anchor = anchors.get(id);
      if (!anchor) continue;

      const el = document.createElement('button');
      el.className = 'hotspot';
      el.type = 'button';
      el.dataset.partId = id;
      el.setAttribute('aria-label', data.name);

      const dot = document.createElement('span');
      dot.className = 'hotspot-dot';

      const label = document.createElement('span');
      label.className = 'hotspot-label';
      const src = sources[data.src];
      label.innerHTML =
        '<span class="hotspot-tag" style="--tag:' + (src ? src.colour : '#888') + '">' +
        (src ? src.short : '') + '</span>' + data.name;

      el.append(dot, label);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelect(id);
      });
      el.addEventListener('pointerenter', () => { this.hovered = id; });
      el.addEventListener('pointerleave', () => {
        if (this.hovered === id) this.hovered = null;
      });

      this.layer.appendChild(el);
      this.items.push({
        id, el, label, data,
        pos: anchor.clone(),
        tier: data.tier || 3,
        internal: !!data.internal,
        visible: false,
        occluded: false,
        w: 0, h: 0,
      });
    }

    // Widths are needed for decluttering. Measure once, after layout.
    requestAnimationFrame(() => {
      for (const it of this.items) {
        it.el.classList.add('measuring');
        it.w = it.el.offsetWidth || 150;
        it.h = it.el.offsetHeight || 22;
        it.el.classList.remove('measuring');
      }
    });
  }

  setInternalVisible(v) {
    this.showInternal = v;
  }

  setSelected(id) {
    this.selected = id;
    for (const it of this.items) it.el.classList.toggle('is-selected', it.id === id);
  }

  /** Offset every marker to follow an exploded view. */
  setExplode(t, centre) {
    for (const it of this.items) {
      const base = this.anchors.get(it.id);
      if (!base) continue;
      this._v.subVectors(base, centre);
      const len = this._v.length() || 1;
      it.pos.copy(base).addScaledVector(this._v, (t * 0.55) / len);
    }
  }

  update(camera, controls, model, dt) {
    this.frame++;
    const dist = camera.position.distanceTo(controls.target);
    this.tier = tierForDistance(dist);

    const w = innerWidth;
    const h = innerHeight;
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    // Project and cull.
    const candidates = [];
    for (const it of this.items) {
      const inTier = it.tier <= this.tier;
      const internalOk = this.showInternal || !it.internal;
      if ((!inTier || !internalOk) && it.id !== this.selected) {
        this._hide(it);
        continue;
      }

      this._v.copy(it.pos);
      const toPart = this._v.clone().sub(camera.position);
      if (toPart.dot(camDir) <= 0) { this._hide(it); continue; } // behind camera

      this._v.project(camera);
      const sx = (this._v.x * 0.5 + 0.5) * w;
      const sy = (-this._v.y * 0.5 + 0.5) * h;
      if (sx < -80 || sx > w + 80 || sy < -40 || sy > h + 40) { this._hide(it); continue; }

      it.sx = sx;
      it.sy = sy;
      it.dist = toPart.length();
      candidates.push(it);
    }

    // Coarsest and nearest first: that ordering drives both the occlusion
    // budget and the declutter pass below.
    candidates.sort((a, b) => {
      if (a.id === this.selected) return -1;
      if (b.id === this.selected) return 1;
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.dist - b.dist;
    });

    // Occlusion, throttled and capped: markers behind bodywork are dimmed
    // rather than removed, so you can still tell something is there.
    if (this.budget.occlusion && this.frame % 6 === 0 && model) {
      const budget = Math.min(candidates.length, 40);
      for (let i = 0; i < budget; i++) {
        const it = candidates[i];
        const dir = this._v.copy(it.pos).sub(camera.position);
        const len = dir.length();
        this.raycaster.set(camera.position, dir.normalize());
        this.raycaster.far = len - 0.02;
        const hits = this.raycaster.intersectObject(model, true);
        it.occluded = hits.length > 0 && hits[0].distance < len - 0.05;
      }
      for (let i = budget; i < candidates.length; i++) candidates[i].occluded = false;
    }

    const placed = [];
    const limit = this.budget.maxMarkers;
    let shown = 0;

    for (const it of candidates) {
      const isSel = it.id === this.selected || it.id === this.hovered;
      let clash = false;
      if (!isSel) {
        if (shown >= limit) clash = true;
        else {
          for (const p of placed) {
            if (Math.abs(p.sx - it.sx) < (p.w + it.w) * 0.5 + 8 &&
                Math.abs(p.sy - it.sy) < (p.h + it.h) * 0.5 + 6) {
              clash = true;
              break;
            }
          }
        }
      }

      if (clash) {
        // Keep a bare dot where the label would not fit.
        this._show(it, true);
        continue;
      }
      this._show(it, false);
      placed.push(it);
      shown++;
    }

    return { tier: this.tier, dist, shown };
  }

  _show(it, dotOnly) {
    const el = it.el;
    if (!it.visible) { el.style.display = ''; it.visible = true; }
    el.style.transform = 'translate(' + it.sx.toFixed(1) + 'px,' + it.sy.toFixed(1) + 'px)';
    el.classList.toggle('dot-only', dotOnly);
    el.classList.toggle('is-occluded', it.occluded);
    el.style.zIndex = String(2000 - Math.round(it.dist * 40));
  }

  _hide(it) {
    if (it.visible) { it.el.style.display = 'none'; it.visible = false; }
  }
}
