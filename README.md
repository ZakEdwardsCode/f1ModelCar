# W17 Teardown

An interactive, annotated 3D teardown of the **Mercedes-AMG F1 W17 E PERFORMANCE**,
the team's 2026 car. One page, no start screen: it loads straight into the model.

Zoom in and the annotation density increases. Pulled back you see major
assemblies. Push in and subsystems appear, then individual components, then
fasteners, sensors and valves. 183 parts are annotated, each with its own
specification table, written explanation and a tag saying where the
information came from.

## Running it

```
node server.js
```

Then open <http://localhost:3002>.

ES modules need a real HTTP origin, so opening `index.html` directly from the
file system will not work. The server is Node built-ins only, no packages.

To view it on your phone or another device, pair it with a quick tunnel the
same way the other projects in this folder do:

```
cloudflared.exe tunnel --url http://localhost:3002
```

## Controls

| Action | How |
| --- | --- |
| Orbit | Drag |
| Zoom | Scroll or pinch |
| Pan | Right-drag or two-finger drag |
| Select a part | Click it on the car, or click its marker. It glows teal and stays solid |
| Find a part | `/` then type, matches names, specs and body text |
| Part browser | `B` |
| Cutaway | `C`, ghosts the bodywork to expose the power unit. Also opens on its own while an internal part is selected |
| Active aero | `X`, swings the wings between corner and straight mode |
| Reset view | `R` |

Clicking a **marker** flies the camera to that part. Clicking the **car itself**
selects without moving, so you can inspect an area without losing your framing.

The car is **solid**, as it is in real life. Nothing turns see-through unless
you ask for it: either press `C`, or select a part that sits inside the
bodywork (the engine, the gearbox internals, the energy store and so on).
In that case only the outer bodywork ghosts, and it turns solid again as soon
as you select something on the outside of the car or deselect.

The `Explode` slider pulls the whole car apart along radial lines. Markers
follow their parts as it opens.

## Performance

Quality is picked from the device on load: phones and machines reporting four
or fewer cores start on **low**, which drops shadows, area lights, clearcoat
shaders and texture sizes. The render loop then measures frame rate once a
second and scales render resolution between 1.0 and 0.55 before giving up
anything else, because resolution is the cheapest thing to lose and the
easiest to give back. Frame rate and tier are shown bottom right.

Power unit internals are not drawn at all until cutaway is on. They sit inside
opaque bodywork, so hiding them keeps 106 of the 454 meshes out of the render
and shadow passes for no visible difference.

A quality choice is remembered per browser, so if you set one on your phone it
sticks.

## Where the information comes from

Every part panel carries a coloured provenance tag. This is the point of the
project: a specification figure and a piece of general background are not the
same kind of claim, and the interface never lets them look the same.

| Tag | Meaning |
| --- | --- |
| `SPEC` | Published by Mercedes-AMG PETRONAS in the W17 technical specification |
| `REG` | From the 2026 FIA technical regulations, via FIA and Formula 1 explainers |
| `SUPP` | Published by the named supplier: Brembo, Pirelli, OZ, Carbone Industries, PETRONAS |
| `ANLY` | From published technical analysis of this specific car after its reveal |
| `GEN` | Established Formula 1 engineering practice, **not** a claim about this car |

Current distribution: 26 `SPEC`, 17 `REG`, 7 `SUPP`, 20 `ANLY`, 113 `GEN`.

Most fastener-level and ancillary parts are `GEN`, because nobody publishes the
specification of a Mercedes flap adjuster screw. Those entries describe what
the component does and why it exists, and are labelled so you know they are not
sourced to the W17 in particular.

## What is accurate, and what is a reconstruction

**Accurate and sourced.** All principal dimensions, the power unit
architecture and figures, brake and tyre specifications, materials, suppliers,
the 2026 regulation changes, and the parts list. The validator checks the built
geometry against the published numbers on every run:

```
overall length  5.465 m   [under 5505 mm]
overall width   1.900 m   [1900 mm]
overall height  0.954 m   [max 970 mm above the reference plane]
wheelbase       3.400 m   [3400 mm]
front tyre      705 mm diameter, 280 mm tread
rear tyre       710 mm diameter, 375 mm tread
brake discs     330 mm front, 280 mm rear, 34 mm thick
```

**Laid out on the 2026 regulations.** The body is built in the FIA's own
coordinate system (`src/cars/w17/regs.js`), on the planes Article C2.3 fixes:
the survival cell front 75 mm ahead of the front axle, the cockpit rear 1930 mm
behind that, the engine face 400 mm behind the cockpit. Appendix C2 of the
Technical Regulations defines most Reference Volumes as coordinate recipes in
plain text, and the principal surfaces are built inside them:

| Surface | Reference Volume |
| --- | --- |
| Nose and forward chassis | RV-BODY-FRONT crown arc and underside line, RV-CH-FRONT-MIN |
| Front wing elements | RV-FW-PROFILES, swept by RS-FW-SECTION |
| Front wing endplates and footplates | RV-FWEP-BODY, RV-FWEP-IFP, RV-FWEP-OFP |
| Sidepods and engine cover | RV-SIDEPOD, RV-EC, RV-TAIL |
| Floor, keel and diffuser | RV-FLOOR-BODY, RV-FLOOR-SIDEWALL, RV-FLOOR-BOARD, RV-FLOOR-BIB |
| Rear wing, endplates, pylons, brace | RV-RW-PROFILES, RV-RWEP-BODY, RV-RW-PYLON, RV-RW-BRACE |
| Mirrors, roll hoop, tailpipe | RV-MIRROR-BODY, RV-ROLL-HOOP, RV-TAILPIPE |
| Cameras | Article C8.16 positions 1 to 6, RV-CAMERA-2 |

The validator tests every vertex of the wings, sidepods, engine cover, floor,
nose and camera pods against those volumes, with a 3 mm tolerance.

**Livery.** Black base with a silver nose, Petronas turquoise accents and the
striped panel across the sidepod tops, matching the car shown on 22 January.
Car 12 for Kimi Antonelli. All lettering, numerals, stripes and the carbon
weave are drawn to a canvas at load time, so the project still ships with no
binary assets.

**A reconstruction.** Inside those legal envelopes, the *surface shapes* are
built procedurally from published photography and published technical
analysis. This is not a scan, and it is not the team's CAD. Sidepod curvature,
wing element camber and bodywork blending are informed reconstructions, not
measured surfaces. The halo, cockpit and wheel bodywork volumes are published
to teams only as CAD, so those shapes are estimates. Anything in the dimension table marked `EST` is a modelling
choice rather than a claim about the real car.

No part in the model is given a name it does not have.

## Checks

```
node tools/validate.mjs     # geometry, dimensions, annotation coverage
node tools/smoke-ui.mjs     # interface wiring against a DOM stub
```

`validate.mjs` confirms the model builds, matches the published dimensions,
sits on the ground, stays inside the width limit, meets the Article C2.3
positions, keeps its principal surfaces inside their Reference Volumes, has no
degenerate or NaN geometry, and that every mesh has an annotation and every
annotation has geometry. `smoke-ui.mjs` builds the interface against a stub DOM, renders all
183 panels looking for anything undefined, and walks the camera from a
whole-car view down to a single screw to confirm the detail tiers behave.

Both need `node_modules/three`, which holds a single downloaded copy of
three.js for headless use. The browser loads three.js from a CDN and does not
need it.

## Layout

```
index.html              page shell
style.css               interface
server.js               static server, Node built-ins only
src/
  main.js               entry point, picking, cutaway, explode, render loop
  lib/
    geom.js             lofting, NACA aerofoil sections, plates
    materials.js        procedural carbon weave, drilled disc, tyre textures
  viewer/
    scene.js            renderer, lighting, environment, camera flight
    hotspots.js         projected markers, detail tiers, declutter, occlusion
    ui.js               panel, browser, search, controls
  cars/
    w17/
      regs.js           FIA coordinate frame, regulation planes, Reference Volumes
      dims.js           dimension table, the single source of truth
      build-chassis.js  survival cell, nose, cockpit, halo, bodywork, floor, cameras
      build-aero.js     front wing, rear wing, active elements
      build-running.js  suspension, uprights, wheels, tyres, brakes
      build-power.js    V6, turbo, MGU-K, energy store, cooling, gearbox
      parts-body.js     annotations, chassis and aero
      parts-mech.js     annotations, mechanical and power unit
      parts-extra.js    annotations, 2026 front wing and livery
      livery.js         colours, procedural number and stripe textures
      parts.js          merges the above, car metadata, provenance legend
      model.js          runs the builders, collects meshes and anchors
tools/
  validate.mjs
  smoke-ui.mjs
docs/
  GEOMETRY-PLAN.md      what public data exists, and the plan for the geometry
```

## Adding another car

The viewer knows nothing about the W17 specifically. To add a car, create
`src/cars/<id>/` with the same five pieces: a `dims.js`, one or more build
modules, a parts database, and a `model.js` exporting a build function that
returns `{ root, meshes, anchors, radii, movables, materials, dims }`. Then
point `src/main.js` at it.

The geometry helpers in `src/lib/geom.js` are car-agnostic. `loft()` skins a
series of cross-sections into bodywork and `wingElement()` builds a wing from
spanwise stations, which between them cover most of a modern single-seater.

## Sources

- [FIA 2026 F1 Regulations, Section C (Technical), Issue 16](https://www.fia.com/regulation/category/110), Article C2, Article C8.16 and Appendix C2

- [Mercedes-AMG PETRONAS F1, W17 2026 technical specification](https://www.mercedesamgf1.com/f1-w17-2026-technical-specifications)
- [Mercedes-AMG PETRONAS F1, power unit regulation changes](https://www.mercedesamgf1.com/facts-and-stats-power-unit-regulation-changes)
- [Formula 1, 2026 aerodynamic regulations explained](https://www.formula1.com/en/latest/article/explained-2026-aerodynamic-regulations-fia-x-mode-z-mode-.26c1CtOzCmN3GfLMywrgb2)
- [Red Bull Racing, guide to the 2026 technical regulations](https://www.redbullracing.com/int-en/projects/bulls-guide-to-the-f1-2026-regulations/technical-regulations)
- [Brembo, how the 2026 rules change F1 braking](https://www.brembo.com/en/motorsport/formula1/f1-rules-2026)
- [The Race, Gary Anderson's technical verdict on the W17](https://www.the-race.com/formula-1/mercedes-f1-2026-car-w17-gary-anderson-verdict/)
- [PlanetF1, W17 shakedown technical analysis](https://www.planetf1.com/features/mercedes-w17-reveal-raises-first-technical-puzzle-of-f1-2026)
- [Pirelli, 2026 F1 tyre range](https://press.pirelli.com/pirelli-reveals-2026-f1-tyres-a-fresh-logo-design-and-new-compounds/)
- [Wikipedia, Mercedes W17](https://en.wikipedia.org/wiki/Mercedes_W17)

Unofficial and not affiliated with Mercedes-AMG PETRONAS Formula One Team.
