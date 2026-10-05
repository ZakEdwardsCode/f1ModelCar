// livery.js - W17 livery colours, procedural textures and decals.
//
// The 2026 Mercedes livery is a predominantly black car with a silver nose,
// Petronas turquoise accents and a silver-and-black striped panel on top of
// the sidepods. Everything here is drawn to a canvas at load time, so the
// project still ships with no binary assets.

import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

export const COLOURS = {
  // The 2026 car is predominantly black. These are deliberately dark: a
  // glossy black under a bright studio environment reads as mid grey unless
  // both the base colour and the environment contribution are held down.
  black: 0x08090b,        // base bodywork
  blackDeep: 0x050607,    // shadowed panels, floor
  silver: 0x9aa2ab,       // nose, a metallic grey rather than white
  silverDark: 0x6e767e,
  teal: 0x00d2be,         // Petronas turquoise
  tealDeep: 0x00a19b,
  white: 0xeef2f5,
};

const hex = (n) => '#' + n.toString(16).padStart(6, '0');

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function tex(c, { repeat = null, flipY = true, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.flipY = flipY;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  } else {
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  }
  return t;
}

const NUM_FONT = '900 {S}px "Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif';
const TXT_FONT = '700 {S}px "Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif';
const font = (tpl, size) => tpl.replace('{S}', String(size));

/* ------------------------------------------------------------------ */
/* Car number                                                          */
/* ------------------------------------------------------------------ */

/**
 * Race number on a transparent background, for the shark fin and nose.
 * Drawn with a heavy condensed sans, the closest reliable stand-in for the
 * team's own numeral face without shipping a font file.
 */
export function numberTexture(number, {
  w = 512, h = 512, colour = COLOURS.white, outline = COLOURS.teal, size = 380,
} = {}) {
  const c = canvas(w, h);
  const g = c.getContext('2d');
  g.clearRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = font(NUM_FONT, size);

  const label = String(number);
  g.save();
  g.translate(w / 2, h / 2);
  g.transform(1, 0, -0.10, 1, 0, 0); // slight forward lean, as run on the car

  g.lineJoin = 'round';
  g.strokeStyle = hex(outline);
  g.lineWidth = size * 0.085;
  g.strokeText(label, 0, 0);

  g.fillStyle = hex(colour);
  g.fillText(label, 0, 0);
  g.restore();

  return tex(c);
}

/* ------------------------------------------------------------------ */
/* Sidepod stripe panel                                                */
/* ------------------------------------------------------------------ */

/**
 * The striped panel across the top of the sidepods. Tapered bars of silver
 * on black, tightening toward the rear.
 */
export function stripeTexture({ w = 1024, h = 256 } = {}) {
  const c = canvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = hex(COLOURS.black);
  g.fillRect(0, 0, w, h);

  const n = 26;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = Math.pow(t, 1.35) * w;
    const bw = (1 - t) * (w / n) * 0.62 + 2;
    const shade = i % 2 === 0 ? COLOURS.silver : COLOURS.silverDark;
    g.fillStyle = hex(shade);
    g.globalAlpha = 0.28 + (1 - t) * 0.62;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + bw, 0);
    g.lineTo(x + bw * 0.45, h);
    g.lineTo(x - bw * 0.15, h);
    g.closePath();
    g.fill();
  }
  g.globalAlpha = 1;

  // Turquoise hairline along the lower edge of the panel.
  g.fillStyle = hex(COLOURS.teal);
  g.fillRect(0, h - 10, w, 6);

  return tex(c, { repeat: [1, 1] });
}

/* ------------------------------------------------------------------ */
/* Body paint with a turquoise flash                                   */
/* ------------------------------------------------------------------ */

/**
 * Base bodywork: black with a Petronas turquoise flash running along it.
 * The loft UVs run u around the section and v along the car, so the flash is
 * drawn as a horizontal band and lands along the flank.
 */
export function flankTexture({ w = 1024, h = 512, flash = true } = {}) {
  const c = canvas(w, h);
  const g = c.getContext('2d');

  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#040506');
  grad.addColorStop(0.42, '#0a0b0d');
  grad.addColorStop(0.58, '#0a0b0d');
  grad.addColorStop(1, '#040506');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);

  if (flash) {
    // Turquoise sweep, thickest at the front and fading out rearward.
    g.save();
    const fg = g.createLinearGradient(0, 0, w, 0);
    fg.addColorStop(0, 'rgba(0,210,190,0.00)');
    fg.addColorStop(0.18, 'rgba(0,210,190,0.85)');
    fg.addColorStop(0.55, 'rgba(0,161,155,0.45)');
    fg.addColorStop(1, 'rgba(0,161,155,0.00)');
    g.fillStyle = fg;
    g.beginPath();
    g.moveTo(0, h * 0.26);
    g.bezierCurveTo(w * 0.35, h * 0.20, w * 0.62, h * 0.30, w, h * 0.34);
    g.lineTo(w, h * 0.40);
    g.bezierCurveTo(w * 0.62, h * 0.37, w * 0.35, h * 0.28, 0, h * 0.34);
    g.closePath();
    g.fill();
    g.restore();
  }

  return tex(c, { repeat: [1, 1] });
}

/* ------------------------------------------------------------------ */
/* Sponsor lettering strip                                             */
/* ------------------------------------------------------------------ */

export function textStrip(text, {
  w = 1024, h = 160, colour = COLOURS.white, bg = null, size = 96, track = 0.06,
} = {}) {
  const c = canvas(w, h);
  const g = c.getContext('2d');
  if (bg !== null) {
    g.fillStyle = hex(bg);
    g.fillRect(0, 0, w, h);
  } else {
    g.clearRect(0, 0, w, h);
  }
  g.font = font(TXT_FONT, size);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = hex(colour);

  // Manual letter spacing, since canvas letterSpacing is not universal.
  const chars = [...text];
  const widths = chars.map((ch) => g.measureText(ch).width);
  const gap = size * track;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let x = w / 2 - total / 2;
  for (let i = 0; i < chars.length; i++) {
    g.fillText(chars[i], x + widths[i] / 2, h / 2);
    x += widths[i] + gap;
  }
  return tex(c);
}

/* ------------------------------------------------------------------ */
/* Three-pointed star                                                  */
/* ------------------------------------------------------------------ */

export function starTexture({ s = 256, colour = COLOURS.white } = {}) {
  const c = canvas(s, s);
  const g = c.getContext('2d');
  g.clearRect(0, 0, s, s);
  const r = s * 0.40;
  const cx = s / 2;
  const cy = s / 2;

  g.strokeStyle = hex(colour);
  g.lineWidth = s * 0.045;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.stroke();

  g.lineWidth = s * 0.055;
  g.lineCap = 'butt';
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    g.stroke();
  }
  return tex(c);
}

/* ------------------------------------------------------------------ */
/* Material set                                                        */
/* ------------------------------------------------------------------ */

/**
 * Livery materials. On low quality these are MeshStandardMaterial with no
 * clearcoat, which is a markedly cheaper shader than MeshPhysicalMaterial.
 */
export function buildLiveryMaterials(quality = 'high') {
  const painted = quality === 'high' || quality === 'medium';
  const Mat = painted ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;

  const gloss = (extra) => {
    const base = {
      roughness: 0.30, metalness: 0.15,
      // envMapIntensity is the control that keeps black looking black. The
      // room environment is what was lifting every panel toward grey.
      envMapIntensity: 0.42,
      ...(painted ? { clearcoat: 1.0, clearcoatRoughness: 0.08 } : { roughness: 0.24 }),
      ...extra,
    };
    return new Mat(base);
  };

  const L = {};

  // Black bodywork, the dominant colour on the car.
  L.bodyBlack = gloss({ color: COLOURS.black });

  // Silver nose. The 2026 livery puts silver at the front and black down
  // the sides, which is what brings back the Silver Arrows read.
  L.bodySilver = gloss({ color: COLOURS.silver, roughness: 0.26, metalness: 0.62, envMapIntensity: 0.85 });

  // Turquoise accent surfaces.
  L.bodyTeal = gloss({ color: COLOURS.teal, roughness: 0.26, metalness: 0.08, envMapIntensity: 0.7 });

  // Flank paint carrying the turquoise sweep.
  L.bodyFlank = gloss({ color: 0xffffff, map: flankTexture() });

  // Striped sidepod top panel.
  L.stripePanel = gloss({ color: 0xffffff, map: stripeTexture(), roughness: 0.32, envMapIntensity: 0.55, side: THREE.DoubleSide });

  // Matte black for non-painted structure.
  L.structureBlack = new THREE.MeshStandardMaterial({
    color: COLOURS.blackDeep, roughness: 0.60, metalness: 0.10, envMapIntensity: 0.35,
  });

  return L;
}

/**
 * Decal materials. Alpha-mapped planes laid just off the surface.
 */
export function buildDecalMaterials(carNumber) {
  const decal = (map, opts = {}) => new THREE.MeshBasicMaterial({
    map, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    toneMapped: false, side: THREE.DoubleSide, ...opts,
  });

  return {
    number: decal(numberTexture(carNumber)),
    numberSmall: decal(numberTexture(carNumber, { size: 300, outline: COLOURS.teal })),
    star: decal(starTexture()),
    petronas: decal(textStrip('PETRONAS', { colour: COLOURS.teal, size: 104 })),
    amg: decal(textStrip('AMG', { colour: COLOURS.white, size: 120, track: 0.12 })),
    mercedes: decal(textStrip('MERCEDES', { colour: COLOURS.white, size: 88 })),
  };
}
