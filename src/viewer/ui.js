// ui.js - detail panel, part browser, search and the control bar.

import { TIER_LABELS } from './hotspots.js';

const $ = (sel, root = document) => root.querySelector(sel);

export class UI {
  constructor({ car, parts, sources, groupOrder, tours, handlers }) {
    this.car = car;
    this.parts = parts;
    this.sources = sources;
    this.groupOrder = groupOrder;
    this.tours = tours;
    this.h = handlers;
    this.selected = null;

    this.elPanel = $('#panel');
    this.elBrowser = $('#browser-list');
    this.elSearch = $('#search');
    this.elResults = $('#search-results');
    this.elTier = $('#tier-meter');
    this.elTierName = $('#tier-name');
    this.elReadout = $('#readout');
    this.elTours = $('#tours');
    this.elLegend = $('#legend');

    this._buildHeader();
    this._buildBrowser();
    this._buildTours();
    this._buildLegend();
    this._wireSearch();
    this._wireControls();
    this.showIntro();
  }

  /* ---------------------------------------------------------------- */

  _buildHeader() {
    $('#car-name').textContent = this.car.name;
    $('#car-sub').textContent =
      this.car.team + '  /  ' + this.car.season + '  /  ' +
      this.car.drivers.map((d) => '#' + d.number + ' ' + d.name).join('   ');
    $('#part-count').textContent = String(Object.keys(this.parts).length);
  }

  _buildBrowser() {
    const byGroup = new Map();
    for (const [id, p] of Object.entries(this.parts)) {
      if (!byGroup.has(p.group)) byGroup.set(p.group, []);
      byGroup.get(p.group).push({ id, ...p });
    }

    const order = [...this.groupOrder.filter((g) => byGroup.has(g)),
                   ...[...byGroup.keys()].filter((g) => !this.groupOrder.includes(g))];

    const frag = document.createDocumentFragment();
    for (const g of order) {
      const list = byGroup.get(g).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
      const sec = document.createElement('section');
      sec.className = 'grp';

      const head = document.createElement('button');
      head.className = 'grp-head';
      head.type = 'button';
      head.innerHTML = '<span class="grp-name">' + g + '</span>' +
                       '<span class="grp-n">' + list.length + '</span>';
      head.addEventListener('click', () => sec.classList.toggle('open'));

      const ul = document.createElement('ul');
      ul.className = 'grp-items';
      for (const p of list) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'item';
        b.dataset.partId = p.id;
        const src = this.sources[p.src];
        b.innerHTML =
          '<i class="tier-pip t' + p.tier + '" title="Detail tier ' + p.tier + '"></i>' +
          '<span class="item-name">' + p.name + '</span>' +
          '<span class="item-src" style="--tag:' + src.colour + '">' + src.short + '</span>';
        b.addEventListener('click', () => this.h.onSelect(p.id));
        li.appendChild(b);
        ul.appendChild(li);
      }

      sec.append(head, ul);
      frag.appendChild(sec);
    }
    this.elBrowser.appendChild(frag);
  }

  _buildTours() {
    for (const t of this.tours) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tour';
      b.textContent = t.label;
      b.addEventListener('click', () => this.h.onTour(t));
      this.elTours.appendChild(b);
    }
  }

  _buildLegend() {
    for (const [key, s] of Object.entries(this.sources)) {
      const row = document.createElement('div');
      row.className = 'legend-row';
      row.innerHTML =
        '<span class="legend-tag" style="--tag:' + s.colour + '">' + s.short + '</span>' +
        '<span class="legend-text"><b>' + s.label + '</b>' + s.detail + '</span>';
      this.elLegend.appendChild(row);
    }
  }

  _wireSearch() {
    const index = Object.entries(this.parts).map(([id, p]) => ({
      id, name: p.name, group: p.group,
      hay: (p.name + ' ' + p.group + ' ' + p.text + ' ' +
            p.spec.map((s) => s.join(' ')).join(' ')).toLowerCase(),
    }));

    const run = () => {
      const q = this.elSearch.value.trim().toLowerCase();
      this.elResults.innerHTML = '';
      if (q.length < 2) {
        this.elResults.classList.remove('open');
        return;
      }
      const hits = index
        .map((r) => {
          const inName = r.name.toLowerCase().includes(q);
          if (!inName && !r.hay.includes(q)) return null;
          return { r, score: inName ? 0 : 1 };
        })
        .filter(Boolean)
        .sort((a, b) => a.score - b.score || a.r.name.localeCompare(b.r.name))
        .slice(0, 12);

      if (!hits.length) {
        this.elResults.innerHTML = '<div class="no-hit">No part matches that</div>';
        this.elResults.classList.add('open');
        return;
      }
      for (const { r } of hits) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'result';
        b.innerHTML = '<span>' + r.name + '</span><em>' + r.group + '</em>';
        b.addEventListener('click', () => {
          this.h.onSelect(r.id);
          this.elSearch.value = '';
          this.elResults.classList.remove('open');
        });
        this.elResults.appendChild(b);
      }
      this.elResults.classList.add('open');
    };

    this.elSearch.addEventListener('input', run);
    this.elSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.elSearch.value = '';
        this.elResults.classList.remove('open');
        this.elSearch.blur();
      }
      if (e.key === 'Enter') {
        const first = this.elResults.querySelector('.result');
        if (first) first.click();
      }
    });
  }

  _wireControls() {
    $('#btn-cutaway').addEventListener('click', (e) => {
      const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
      e.currentTarget.setAttribute('aria-pressed', String(on));
      this.h.onCutaway(on);
    });

    $('#btn-aero').addEventListener('click', (e) => {
      const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
      e.currentTarget.setAttribute('aria-pressed', String(on));
      e.currentTarget.querySelector('.btn-state').textContent = on ? 'Straight' : 'Corner';
      this.h.onAero(on);
    });

    $('#btn-spin').addEventListener('click', (e) => {
      const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
      e.currentTarget.setAttribute('aria-pressed', String(on));
      this.h.onSpin(on);
    });

    $('#explode').addEventListener('input', (e) => {
      this.h.onExplode(Number(e.target.value) / 100);
    });

    $('#btn-reset').addEventListener('click', () => this.h.onReset());

    $('#panel-close').addEventListener('click', () => {
      document.body.classList.remove('panel-open');
      this.h.onSelect(null);
    });

    $('#btn-browser').addEventListener('click', () => {
      document.body.classList.toggle('browser-open');
    });

    $('#btn-legend').addEventListener('click', () => {
      document.body.classList.toggle('legend-open');
    });

    addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === '/') { e.preventDefault(); this.elSearch.focus(); }
      if (e.key === 'Escape') this.h.onSelect(null);
      if (e.key.toLowerCase() === 'c') $('#btn-cutaway').click();
      if (e.key.toLowerCase() === 'x') $('#btn-aero').click();
      if (e.key.toLowerCase() === 'b') $('#btn-browser').click();
      if (e.key.toLowerCase() === 'r') this.h.onReset();
    });
  }

  /* ---------------------------------------------------------------- */

  showIntro() {
    const rows = this.car.headline
      .map(([k, v]) => '<tr><th>' + k + '</th><td>' + v + '</td></tr>')
      .join('');
    const people = this.car.people
      .map(([k, v]) => '<tr><th>' + k + '</th><td>' + v + '</td></tr>')
      .join('');

    this.elPanel.innerHTML =
      '<div class="panel-inner">' +
      '<div class="panel-kicker">Car</div>' +
      '<h1 class="panel-title">' + this.car.name + '</h1>' +
      '<p class="panel-lead">' + this.car.intro + '</p>' +
      '<div class="panel-hint">Click any marker on the car, or any part in the browser. ' +
      'Zoom in and more markers appear: assemblies first, then subsystems, ' +
      'components, and finally individual fasteners and sensors.</div>' +
      '<h2 class="sec">Published specification</h2>' +
      '<table class="spec">' + rows + '</table>' +
      '<h2 class="sec">Design leadership</h2>' +
      '<table class="spec">' + people + '</table>' +
      '<h2 class="sec">Reveal</h2>' +
      '<p class="panel-text">' + this.car.revealed + '</p>' +
      '</div>';
    this.elPanel.classList.add('is-intro');
    // Deliberately does not force the panel open: dismissing the panel and
    // then clicking empty space should not pull it back out.
  }

  showPart(id) {
    this.selected = id;
    for (const b of this.elBrowser.querySelectorAll('.item')) {
      b.classList.toggle('is-active', b.dataset.partId === id);
    }
    if (!id) { this.showIntro(); return; }

    const p = this.parts[id];
    const src = this.sources[p.src];

    const specRows = p.spec
      .map(([k, v]) => '<tr><th>' + k + '</th><td>' + v + '</td></tr>')
      .join('');

    this.elPanel.innerHTML =
      '<div class="panel-inner">' +
      '<div class="panel-kicker">' + p.group +
      '<span class="tier-badge">Tier ' + p.tier + ' / ' + TIER_LABELS[p.tier] + '</span></div>' +
      '<h1 class="panel-title">' + p.name + '</h1>' +
      '<div class="prov" style="--tag:' + src.colour + '">' +
      '<span class="prov-tag">' + src.short + '</span>' +
      '<span class="prov-body"><b>' + src.label + '</b>' + src.detail + '</span>' +
      '</div>' +
      (p.movable ? '<div class="movable-note">Movable element. ' +
        'Toggle straight-line mode to watch it operate.</div>' : '') +
      '<table class="spec">' + specRows + '</table>' +
      '<p class="panel-text">' + p.text + '</p>' +
      this._related(p, id) +
      '</div>';

    this.elPanel.classList.remove('is-intro');
    document.body.classList.add('panel-open');
    this.elPanel.scrollTop = 0;
  }

  _related(part, id) {
    const sibs = Object.entries(this.parts)
      .filter(([sid, p]) => p.group === part.group && sid !== id)
      .slice(0, 8);
    if (!sibs.length) return '';
    return '<h2 class="sec">Also in ' + part.group + '</h2><div class="rel">' +
      sibs.map(([sid, p]) =>
        '<button type="button" class="rel-item" data-goto="' + sid + '">' + p.name + '</button>'
      ).join('') + '</div>';
  }

  bindPanelLinks(onSelect) {
    this.elPanel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-goto]');
      if (b) onSelect(b.dataset.goto);
    });
  }

  setReadout({ tier, dist, shown }) {
    this.elTier.style.setProperty('--t', String(tier));
    for (const el of this.elTier.children) {
      el.classList.toggle('on', Number(el.dataset.t) <= tier);
    }
    this.elTierName.textContent = TIER_LABELS[tier];
    this.elReadout.textContent =
      dist.toFixed(2) + ' m   /   ' + shown + ' marked';
  }
}
