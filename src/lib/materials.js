// materials.js - procedural textures and the W17 material palette.
//
// No external image assets: every texture is drawn to a canvas at load time,
// so the viewer runs from a single folder with no binary downloads.

import * as THREE from 'three';

function canvas(size = 512) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

function toTexture(c, repeat = 1) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ------------------------------------------------------------------ */
/* Carbon fibre 2x2 twill                                              */
/* ------------------------------------------------------------------ */

function carbonCanvas(size = 512, cell = 32, light = false) {
  const c = canvas(size);
  const g = c.getContext('2d');
  const base = light ? '#2a2e33' : '#101215';
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);

  // 2x2 twill: each cell is a tow bundle, stepped one across per row, which
  // is what gives carbon its diagonal weave.
  const n = size / cell;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const over = ((col + row) % 4) < 2;
      const x = col * cell;
      const y = row * cell;
      const grad = g.createLinearGradient(x, y, over ? x + cell : x, over ? y : y + cell);
      const a = light ? 62 : 38;
      const b = light ? 26 : 12;
      grad.addColorStop(0, 'rgb(' + b + ',' + (b + 2) + ',' + (b + 4) + ')');
      grad.addColorStop(0.5, 'rgb(' + a + ',' + (a + 3) + ',' + (a + 7) + ')');
      grad.addColorStop(1, 'rgb(' + b + ',' + (b + 2) + ',' + (b + 4) + ')');
      g.fillStyle = grad;
      g.fillRect(x, y, cell, cell);
      // Individual filament highlights along the tow.
      g.strokeStyle = 'rgba(255,255,255,0.045)';
      g.lineWidth = 1;
      for (let f = 2; f < cell; f += 4) {
        g.beginPath();
        if (over) {
          g.moveTo(x, y + f);
          g.lineTo(x + cell, y + f);
        } else {
          g.moveTo(x + f, y);
          g.lineTo(x + f, y + cell);
        }
        g.stroke();
      }
    }
  }
  return c;
}

function carbonNormalCanvas(size = 512, cell = 32) {
  const c = canvas(size);
  const g = c.getContext('2d');
  g.fillStyle = '#8080ff';
  g.fillRect(0, 0, size, size);
  const n = size / cell;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const over = ((col + row) % 4) < 2;
      const x = col * cell;
      const y = row * cell;
      const grad = g.createLinearGradient(x, y, over ? x : x + cell, over ? y + cell : y);
      grad.addColorStop(0, over ? '#8060ff' : '#6080ff');
      grad.addColorStop(0.5, '#8080ff');
      grad.addColorStop(1, over ? '#80a0ff' : '#a080ff');
      g.fillStyle = grad;
      g.fillRect(x, y, cell, cell);
    }
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Brake disc face - real 2026 hole pattern                            */
/* ------------------------------------------------------------------ */

/**
 * Brembo moved from roughly 1,050 holes of 3 mm in a honeycomb layout to
 * about 1,440 holes of 2.5 mm in a linear layout for 2026. This draws that
 * linear arrangement: holes in radial rows rather than staggered offsets.
 */
function discCanvas(size = 1024, rows = 30, perRow = 48) {
  const c = canvas(size);
  const g = c.getContext('2d');
  const R = size / 2;
  g.fillStyle = '#17181a';
  g.beginPath();
  g.arc(R, R, R * 0.995, 0, Math.PI * 2);
  g.fill();

  // Faint turned finish from the machining pass.
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = 'rgba(255,255,255,' + (0.008 + Math.random() * 0.012) + ')';
    g.lineWidth = 0.6;
    g.beginPath();
    g.arc(R, R, R * (0.36 + Math.random() * 0.62), 0, Math.PI * 2);
    g.stroke();
  }

  const rIn = R * 0.40;
  const rOut = R * 0.95;
  const holeR = R * 0.0115; // 2.5 mm on a 330 mm disc, to scale
  for (let row = 0; row < rows; row++) {
    const rr = rIn + ((rOut - rIn) * (row + 0.5)) / rows;
    // Linear pattern: rows share angular phase instead of staggering.
    for (let k = 0; k < perRow; k++) {
      const a = (k / perRow) * Math.PI * 2;
      const x = R + rr * Math.cos(a);
      const y = R + rr * Math.sin(a);
      g.fillStyle = '#050506';
      g.beginPath();
      g.arc(x, y, holeR, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(190,190,195,0.30)';
      g.lineWidth = 0.7;
      g.stroke();
    }
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Tyre sidewall and tread                                             */
/* ------------------------------------------------------------------ */

function tyreCanvas(size = 512) {
  const c = canvas(size);
  const g = c.getContext('2d');
  g.fillStyle = '#131314';
  g.fillRect(0, 0, size, size);
  // Fine circumferential mould grain.
  for (let i = 0; i < 400; i++) {
    g.fillStyle = 'rgba(255,255,255,' + Math.random() * 0.02 + ')';
    g.fillRect(0, Math.random() * size, size, 1);
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

export function buildMaterials(quality = 'high') {
  const lowQ = quality === 'low';
  // On low quality these become MeshStandardMaterial, which has no clearcoat
  // or transmission, so those properties are stripped rather than passed and
  // warned about.
  const Painted = (props) => {
    if (!lowQ) return new THREE.MeshPhysicalMaterial(props);
    const p = { ...props };
    delete p.clearcoat; delete p.clearcoatRoughness;
    delete p.transmission; delete p.thickness; delete p.sheen; delete p.iridescence;
    return new THREE.MeshStandardMaterial(p);
  };
  const TEX = lowQ ? 256 : 512;
  const carbonMap = toTexture(carbonCanvas(TEX, lowQ ? 32 : 48), 2.5);
  const carbonNrm = new THREE.CanvasTexture(carbonNormalCanvas(TEX, lowQ ? 32 : 48));
  carbonNrm.wrapS = carbonNrm.wrapT = THREE.RepeatWrapping;
  carbonNrm.repeat.set(2.5, 2.5);

  const carbonMapFine = toTexture(carbonCanvas(TEX, lowQ ? 24 : 32), 6);

  const M = {};

  // Exposed structural carbon: monocoque, wings, floor, bodywork substrate.
  M.carbon = Painted({
    color: 0xffffff,
    map: carbonMap,
    normalMap: carbonNrm,
    normalScale: new THREE.Vector2(1.15, 1.15),
    roughness: 0.40,
    metalness: 0.06,
    envMapIntensity: 0.45,
    clearcoat: 0.85,
    clearcoatRoughness: 0.14,
    side: THREE.FrontSide,
  });

  M.carbonFine = M.carbon.clone();
  M.carbonFine.map = carbonMapFine;
  M.carbonFine.roughness = 0.3;

  // Matte black bodywork panels.
  M.satinBlack = Painted({
    color: 0x14161a, roughness: 0.46, metalness: 0.12,
    clearcoat: 0.5, clearcoatRoughness: 0.35, side: THREE.FrontSide,
  });

  // Mercedes silver.
  M.silver = Painted({
    color: 0xb9c0c6, roughness: 0.28, metalness: 0.35,
    clearcoat: 1.0, clearcoatRoughness: 0.08, side: THREE.FrontSide,
  });

  // Petronas teal accent.
  M.teal = Painted({
    color: 0x00a19b, roughness: 0.3, metalness: 0.2,
    clearcoat: 1.0, clearcoatRoughness: 0.1, side: THREE.FrontSide,
  });

  // Titanium: halo, roll structure, some fasteners.
  M.titanium = new THREE.MeshStandardMaterial({
    color: 0x9a9ea6, roughness: 0.38, metalness: 0.95,
  });

  // Machined aluminium: uprights, brackets.
  M.aluminium = new THREE.MeshStandardMaterial({
    color: 0xc2c6cc, roughness: 0.3, metalness: 0.92,
  });

  // Anodised / nickel-plated caliper body.
  M.caliper = new THREE.MeshStandardMaterial({
    color: 0x8d9299, roughness: 0.29, metalness: 0.95,
  });

  // Forged magnesium wheel.
  M.magnesium = new THREE.MeshStandardMaterial({
    color: 0x2b2d31, roughness: 0.4, metalness: 0.85,
  });

  // Gold heat-reflective foil around the turbo and exhaust.
  M.goldFoil = new THREE.MeshStandardMaterial({
    color: 0xcfa23c, roughness: 0.32, metalness: 1.0,
  });

  // Inconel exhaust primaries.
  M.inconel = new THREE.MeshStandardMaterial({
    color: 0x6e6257, roughness: 0.48, metalness: 0.9,
  });

  // Engine block casting.
  M.engineAlloy = new THREE.MeshStandardMaterial({
    color: 0x5c6066, roughness: 0.55, metalness: 0.8,
  });

  // Copper windings in the MGU-K.
  M.copper = new THREE.MeshStandardMaterial({
    color: 0xb2703a, roughness: 0.38, metalness: 0.95,
  });

  // Radiator core.
  M.radiator = new THREE.MeshStandardMaterial({
    color: 0x3a3f45, roughness: 0.75, metalness: 0.6,
  });

  // Tyre rubber.
  const tyreMap = toTexture(tyreCanvas(), 1);
  M.rubber = new THREE.MeshStandardMaterial({
    color: 0x16171a, map: tyreMap, roughness: 0.92, metalness: 0.0,
  });

  // Brake disc with the real 2026 drilling pattern.
  const discMap = new THREE.CanvasTexture(discCanvas(lowQ ? 512 : 1024, lowQ ? 18 : 30, lowQ ? 30 : 48));
  discMap.colorSpace = THREE.SRGBColorSpace;
  discMap.anisotropy = 8;
  M.brakeDisc = new THREE.MeshStandardMaterial({
    color: 0xffffff, map: discMap, roughness: 0.62, metalness: 0.28,
  });
  M.discEdge = new THREE.MeshStandardMaterial({
    color: 0x1b1c1e, roughness: 0.66, metalness: 0.25,
  });

  // Glass for the halo-mounted camera lenses and mirrors.
  M.glass = Painted({
    color: 0x0d1418, roughness: 0.06, metalness: 0.0,
    transmission: 0.55, thickness: 0.01, clearcoat: 1,
  });
  M.mirror = new THREE.MeshStandardMaterial({
    color: 0xdfe4e8, roughness: 0.06, metalness: 1.0,
  });

  // Rain light lens.
  M.rainLight = new THREE.MeshStandardMaterial({
    color: 0xc0140c, emissive: 0x7a0a05, emissiveIntensity: 0.6,
    roughness: 0.3, metalness: 0.1,
  });

  // Driver helmet and race suit stand-ins.
  M.helmet = Painted({
    color: 0x1a1d22, roughness: 0.18, metalness: 0.2, clearcoat: 1,
  });
  M.visor = Painted({
    color: 0x14181c, roughness: 0.08, metalness: 0.6,
  });
  M.nomex = new THREE.MeshStandardMaterial({
    color: 0x202329, roughness: 0.88, metalness: 0.0,
  });

  // Fasteners: titanium hardware throughout the car.
  M.fastener = new THREE.MeshStandardMaterial({
    color: 0xa8adb4, roughness: 0.3, metalness: 1.0,
  });

  return M;
}
