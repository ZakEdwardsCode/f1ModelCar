// scene.js - renderer, lighting, environment, camera movement.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

// Area lights need their lookup tables loaded before first use, otherwise
// they contribute nothing to the render.
RectAreaLightUniformsLib.init();

/**
 * Pick a starting quality tier. Phones and low-core machines start low; the
 * render loop then adapts from measured frame time either way.
 */
export function detectQuality() {
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
                 (navigator.maxTouchPoints > 1 && innerWidth < 1100);
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  if (mobile || cores <= 4 || mem <= 4) return 'low';
  if (cores <= 8 || mem <= 8) return 'medium';
  return 'high';
}

const QUALITY = {
  low:    { pixelRatio: 1.0, shadows: false, areaLights: false, envRes: 0.08, occlusion: false, maxMarkers: 16 },
  medium: { pixelRatio: 1.4, shadows: true,  shadowMap: 1024, areaLights: false, envRes: 0.06, occlusion: true, maxMarkers: 24 },
  high:   { pixelRatio: 2.0, shadows: true,  shadowMap: 2048, areaLights: true,  envRes: 0.04, occlusion: true, maxMarkers: 34 },
};
export const qualitySettings = (q) => QUALITY[q] || QUALITY.medium;

export function createScene(canvas, quality = 'high') {
  const Q = qualitySettings(quality);
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, Q.pixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = Q.shadows;
  renderer.shadowMap.type = quality === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c0f);
  scene.fog = new THREE.Fog(0x0a0c0f, 16, 46);

  // Image-based lighting from a generated room, so carbon and metal read
  // correctly without shipping an HDR file.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), Q.envRes);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.01, 260);
  camera.position.set(4.6, 2.0, 5.2);

  /* --- Lighting ----------------------------------------------------- */
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(5.5, 8.5, 5.0);
  key.castShadow = Q.shadows;
  key.shadow.mapSize.set(Q.shadowMap || 1024, Q.shadowMap || 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  const s = 5.2;
  key.shadow.camera.left = -s;
  key.shadow.camera.right = s;
  key.shadow.camera.top = s;
  key.shadow.camera.bottom = -s;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9fc4de, 0.42);
  fill.position.set(-6.5, 3.2, -2.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x00d2be, 0.50);
  rim.position.set(-1.5, 2.0, -8.0);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0x8fa6b8, 0x0c0e11, 0.28));

  // Overhead strip lights, the way a garage or a launch stand is lit.
  // Area lights are the single most expensive light type here, so below the
  // top tier they are swapped for cheap directional stand-ins.
  for (const x of [-3.2, 3.2]) {
    if (!Q.areaLights && quality === 'low') continue;
    if (Q.areaLights) {
      const strip = new THREE.RectAreaLight(0xffffff, 3.0, 1.1, 7.0);
      strip.position.set(x, 4.4, 0);
      strip.lookAt(0, 0.4, 0);
      scene.add(strip);
    } else {
      const d = new THREE.DirectionalLight(0xffffff, 0.45);
      d.position.set(x, 4.4, 0.2);
      scene.add(d);
    }
  }

  /* --- Ground ------------------------------------------------------- */
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0e1115, roughness: 0.44, metalness: 0.36,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 72), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = Q.shadows;
  scene.add(ground);

  const grid = new THREE.GridHelper(30, 60, 0x1d262e, 0x141a20);
  grid.position.y = 0.001;
  grid.material.opacity = 0.55;
  grid.material.transparent = true;
  scene.add(grid);

  /* --- Controls ----------------------------------------------------- */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.target.set(0, 0.45, 0.1);
  controls.minDistance = 0.10;
  controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI * 0.497;
  controls.zoomSpeed = 0.85;
  controls.rotateSpeed = 0.8;
  controls.panSpeed = 0.7;
  controls.screenSpacePanning = true;

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { renderer, scene, camera, controls, ground, Q };
}

/* ------------------------------------------------------------------ */
/* Camera movement                                                     */
/* ------------------------------------------------------------------ */

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class CameraFlight {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.active = null;
  }

  /** Fly to a point, framing something of the given radius. */
  to(target, radius, opts = {}) {
    const { duration = 1100, azimuth = null, elevation = null } = opts;
    const dist = Math.max(0.16, radius * (opts.zoom ?? 3.1));

    // Keep the current viewing direction unless one is specified, so the
    // camera does not swing wildly when moving between nearby parts.
    const current = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const sph = new THREE.Spherical().setFromVector3(current);
    if (azimuth !== null) sph.theta = azimuth;
    if (elevation !== null) sph.phi = elevation;
    sph.radius = dist;
    sph.phi = THREE.MathUtils.clamp(sph.phi, 0.18, Math.PI * 0.49);

    const endPos = new THREE.Vector3().setFromSpherical(sph).add(target);

    this.active = {
      t: 0,
      duration,
      fromPos: this.camera.position.clone(),
      toPos: endPos,
      fromTarget: this.controls.target.clone(),
      toTarget: target.clone(),
    };
  }

  update(dt) {
    if (!this.active) return;
    const a = this.active;
    a.t = Math.min(1, a.t + (dt * 1000) / a.duration);
    const e = easeInOut(a.t);
    this.camera.position.lerpVectors(a.fromPos, a.toPos, e);
    this.controls.target.lerpVectors(a.fromTarget, a.toTarget, e);
    if (a.t >= 1) this.active = null;
  }

  cancel() {
    this.active = null;
  }
}
