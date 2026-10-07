# Geometry plan: making the W17 look like the W17

The parts list, annotations and provenance system are in good shape. The
geometry is not. This plan covers what is wrong, what public data and
open-source tools actually exist (checked, not assumed), and the order to fix
things in.

---

## 1. What is wrong today

Rendered headlessly from side, front, rear, top and three-quarter views:

| Area | Problem |
| --- | --- |
| Front wing | Reads as one curved scoop. A 2026 FW is up to three distinct, stacked elements inside a defined box (C3.10.1), with tall, flat endplates. |
| Nose | A long silver cone. A 2026 nose has a defined plan shape: tangent sides, no concave curvature, minimum radii (C3.7.1). |
| Sidepods / engine cover | Tubes that stop short. No continuous engine cover, no airbox shoulder, no downwash ramp, no undercut matching the W17. |
| Floor | Visible only as a texture strip. No floor edge, board, bib or fences. |
| Rear wing | Endplates at Y = 500 mm; the legal box runs to 575 mm. The wing is too small and too low. |
| Proportions | Some built stations break the regulations (see §3). This is why the car looks "off" even before surface detail. |

Root cause: every shape is a hand-tuned superellipse placed at guessed
stations (`TUB_PLAN`, `floorHalfWidth`, `podSection`), with no hard external
constraint. Nothing ties a surface to anything measurable.

---

## 2. What public information exists

Ranked by how much it can be trusted.

### 2.1 FIA 2026 Technical Regulations, Section C (primary source, numeric)

- Issue 16 (27 Feb 2026) is mirrored at `github.com/TracingInsights/26Regs`,
  which can be cloned from this environment. Issue 17 (28 Apr 2026) is on
  fia.com.
- **Appendix C2 defines 31 Reference Volumes as coordinate recipes in plain
  text**: polygons with mm vertices, extrusions, plane trims and unions. These
  can be rebuilt exactly without the FIA's teams-only CAD portal.

  Text-defined, so we can build them:

  ```
  RV-PU-ERS  RV-FLOOR-BODY  RV-FLOOR-SIDEWALL  RV-FLOOR-FOOT  RV-FLOOR-BOARD
  RV-FLOOR-BIB  RV-FLOOR-LED  RV-FLOOR-CORNER  RV-PLANK  RV-BODY-FRONT
  RV-CH-FRONT-MIN  RV-MIRROR-BODY  RV-DRI-COOL  RV-SIDEPOD  RV-EC
  RV-BW-APERTURE  RV-TAIL  RV-TAILPIPE  RS-FW-SECTION  RV-FW-PROFILES
  RV-FWEP-BODY  RV-FWEP-OFP  RV-FWEP-IFP  RV-FWEP-DIVEPLANE  RV-FW-STRAKE
  RV-FW-SENSOR  RV-CAMERA-2  RV-RW-PROFILES  RV-RWEP-BODY  RV-RW-PYLON
  RS-INTSN-LAM-FWD/RWD
  ```

  CAD-only, available to teams only, so these must be approximated:
  `RV-PU-ICE/OT/TC`, `RV-HALO`, `RV-COCKPIT-*`, `RV-CH-MID-MIN`, all wheel
  bodywork volumes (`RV-FWH-*`, `RV-RWH-*`), rim volumes, skids,
  `RV-FLOOR-WINGLET`, `RV-DIFF`.

- **Fundamental positions (C2.2, C2.3)**, all in mm. Car frame: X rearward,
  Y right, Z up. Z = 0 is the bottom of the sprung car.
  - Wheelbase XF→XR ≤ 3400.
  - Front axle XF = 0 lies 0–150 behind the survival cell front XA = 0.
  - Cockpit rear XC is 1830–2030 behind XA.
  - ICE mounting face XPU is ≥ 360 behind XC.
  - Width limit 950 from Y = 0, except tyres and rims.
- Rules for each component, for example:
  - **Front wing (C3.10.1):** ≤ 3 elements, ≤ 3 sections per Y-plane, no
    concave curvature seen from below, overlap rules for the slots.
  - **Nose (C3.7.1):** convex only, tangent sides, R ≥ 45 mm at XA.
  - **Forward chassis (C3.7.2):** convex R ≥ 45, concave R ≥ 500.
- Example extents taken straight from the text:
  - `RV-FW-PROFILES`: XF −1250 to −475, Y ≤ 675, Z 60–300.
  - `RV-RW-PROFILES`: XR 165–630, Y ≤ 575, Z 725–880.
  - `RV-SIDEPOD`: inlet zone XF 900–1300, Z 125–600, Y ≤ 715.
  - `RV-EC`: engine cover to Y 715, airbox to Z 970 at XC +320–500.
  - `RV-FLOOR-BODY`: Y ≤ 770 at XF 1100, narrowing to 700 at XR −335.
  - `RV-BODY-FRONT`: the nose and front bodywork envelope, defined by an
    11 m radius arc.
- Appendix C3 and the figures through the document are vector drawings
  (`pdfimages`/`pdftoppm` can extract them) that show the volume shapes for
  cross-checking.

### 2.2 Mercedes-AMG published material (authoritative, but images only)

- W17 technical specification. Already used for `SPEC` tags.
- Official launch renders, including straight **top and side views**, on
  mercedes-amg.com/en/w17 and in the 22 Jan F1.com first-look article. These
  are the best source for W17-specific shapes (sidepod plan, inlet, cover,
  nose). They are copyrighted. Use them **only as a measurement reference on
  your own machine**; never commit or ship them.

### 2.3 Track photography and technical press (qualitative)

- Silverstone filming day and Barcelona shakedown galleries (Autosport,
  Motorsport.com), F1.com tech analysis, The Race and PlanetF1 pieces already
  cited.
- Good for details such as inlet shape, cover cut-outs, floor edge and the
  front wing in each mode. Perspective photos are not scale-accurate without
  camera matching (see §4).

### 2.4 What does not exist publicly

- Any team CAD or scan of the W17.
- Any open, accurate 2026 F1 car model. SimScale community projects and paid
  CGTrader "2026 F1" meshes are generic guesses under unclear licences.
  Don't use them.

---

## 3. Measured disagreements with the regulations

Converting `dims.js` to the FIA frame (XF = 1700 mm − z):

| Constraint | Regulation | Model now | Verdict |
| --- | --- | --- | --- |
| Front axle vs survival-cell front | XF 0–150 mm behind XA | XA (`zFrontBulkhead` 1.560) is 140 mm **behind** the axle | Wrong side. Move bulkhead forward ~200 mm. |
| Cockpit rear XC | 1830–2030 mm behind XA | 1440 mm | Cockpit/driver ~400 mm too far forward. |
| XPU behind XC | ≥ 360 mm | 680 mm | OK, but moves when XC moves. |
| Rear wing endplate | Y ≤ 575 | Y = 500 | Too narrow. |
| Rear wing elements | Z 725–880 above reference plane | check after re-frame | Verify. |
| Floor half-width | ≤ 770 at front, 700 at rear corner | 740 constant mid-section | Re-plan from the RV-FLOOR-BODY polygon. |
| Front wing elements | Y ≤ 675 | `fwElementSpan` 800 | Too wide. Elements must stop at 675 and the endplate bridges the rest. |

Fixing these is cheap and fixes most of the "it looks wrong" impression before
any surface work.

---

## 4. Open-source tools

### Verified working in this cloud environment

Only `git clone` from GitHub is reachable. npm, PyPI, CDNs, Hugging Face,
Wikimedia, fia.com and GitHub release binaries are all blocked.

| Tool | Use | Status |
| --- | --- | --- |
| **three-bvh-csg** v0.0.16 + **three-mesh-bvh** v0.7.8 (MIT) | Build FIA Reference Volumes with CSG in Node and the browser, same three.js as the viewer | **Proven.** `RV-FW-PROFILES` built from the text, bbox [−1250, 0, 60]→[−475, 675, 300] mm, exactly as specified. mesh-bvh needs its `*.template.js` files pre-processed. |
| three.js r169 (git) | Headless validator and renders | Works (`validate.mjs` passes) |
| Playwright + Chromium (preinstalled) | Orthographic screenshot / silhouette harness | Works (SwiftShader WebGL) |
| poppler (`pdftotext`, `pdfimages`) | Pull RV recipes and drawings from the regs PDF | Works |
| Python numpy + Pillow | Silhouette IoU, contour extraction | Works |

### For your own machine (binaries/GPU/model weights)

| Tool | Use | Value |
| --- | --- | --- |
| **Blender** | Reference-image setup, check lofted shapes, export GLB | High |
| **fSpy** + Blender importer | Camera-match a single perspective photo using known wheelbase (3400) and tyre diameters (705/710) as scale. Turns press photos into measurements. | High |
| **SAM 2** (Meta) | Clean car silhouettes from official renders and photos | High |
| **Inkscape** | Manual outline tracing to SVG → numeric section tables | Medium (simple, reliable) |
| FreeCAD / CadQuery / OpenSCAD / Manifold | Alternative exact CSG of RVs, STEP export | Optional; three-bvh-csg already covers this |
| COLMAP / Meshroom / nerfstudio | Multi-view reconstruction | Low: no calibrated multi-view set of one car exists publicly. Shakedown video frames are possible but noisy. |
| Hunyuan3D-2 / TRELLIS (image-to-3D) | Rough mesh from a launch render | Low: plausible shapes, not measurements. At most a blocking reference, never shipped. |

---

## 5. The plan

Each phase ends with `node tools/validate.mjs` green and a before/after render
set.

### Phase 0: Measurement harness (½ day)

- `tools/render.mjs`: Playwright renders fixed **orthographic** side, top,
  front and rear views plus two three-quarter views to `out/renders/`. Also
  writes a flat-shaded silhouette mask for each view.
- `reference/` (git-ignored): you drop official top and side renders there,
  plus a small JSON giving two known points per image (front and rear axle
  centres) for scale.
- `tools/compare.py`: silhouette IoU and outline deviation per view against
  `reference/`, as an overlay PNG plus a number.

### Phase 1: Regulation coordinate frame (½ day)

- `src/cars/w17/regs.js` converts between viewer coordinates (m, +Z forward,
  Y up) and FIA coordinates (mm, X rearward). It exposes the principal planes
  XA, XF, XC, XPU, XR and XDIF.
- Re-anchor `dims.js` on those planes. Keep XF − XA = 75 and XC − XA = 1930
  (mid-range), then derive the cockpit, roll hoop and engine stations from
  them. This fixes rows 1–3 of the §3 table.
- Validator: assert every C2.3 constraint.

### Phase 2: Build the Reference Volumes (1–2 days)

- `tools/rv/recipes.js` transcribes App. C2 §3–36 as **data**: polygon,
  extrude, trim-by-plane (keep side), union, subtract, cuboid, cylinder.
  Transcribing as data keeps each step auditable against the PDF.
- `tools/rv/build.mjs` evaluates them with three-bvh-csg (vendored copy,
  same as `node_modules/three`). It writes `src/cars/w17/rv.json` with
  simplified meshes and bounding boxes.
- Validator: every component mesh must lie inside its RV (vertex containment
  via BVH point-in-mesh), with a 2 mm tolerance. For example, `front-wing-*`
  sits inside `RV-FW-PROFILES` and the nose inside `RV-BODY-FRONT`.
- Viewer feature: a **"FIA volumes"** toggle (`V`) ghosts the legal envelopes
  over the car, tagged `REG`. It is a natural fit for the project's provenance
  theme and makes the reconstruction honest by showing where the real car must
  sit.

### Phase 3: Rebuild components inside the envelopes (3–5 days)

In order of visual impact:

1. **Front wing and nose.** Three elements inside `RV-FW-PROFILES`, sections
   following the Y-Z polygon (low and flat inboard, rising outboard to Y 675).
   Respect C3.10.1 overlap and slot rules. Endplate inside `RV-FWEP-BODY`, with
   footplates and diveplane from their RVs. Nose plan follows C3.7.1 radii, and
   its tip and underside follow the W17 photos.
2. **Sidepods and engine cover.** The inlet sits in `RV-SIDEPOD` (XF 900–1300).
   One continuous loft from inlet to `RV-TAIL` follows the `RV-EC` plan
   outline (Y 715 → 575 → 350 → 300). Add the airbox shoulder to Z 970 and
   the W17's undercut and top ramp from the side and top references.
3. **Floor.** Plan outline from `RV-FLOOR-BODY` (§4.9 polygon), edge from
   `RV-FLOOR-SIDEWALL`, plus foot, board, bib and LED volumes. The 2026 floor
   is flatter, so reduce tunnel depth. The floor edge is the strongest visible
   line in side view.
4. **Rear wing.** Two elements inside `RV-RW-PROFILES` (Y ≤ 575, Z 725–880),
   endplates from `RV-RWEP-BODY`, single pylon from `RV-RW-PYLON`. No beam wing
   in 2026.
5. **Survival cell and cockpit.** Re-loft `TUB_PLAN` on the new stations, with
   cockpit opening and headrest from `RV-BODY-FRONT` §12.5–12.7. Forward
   chassis radii per C3.7.2.
6. **Wheel bodywork and halo** (CAD-only RVs). Approximate from photos, tag
   `EST`.

### Phase 4: Make it the W17 specifically (2–3 days)

Inside the legal envelopes, match Mercedes' choices:

- Calibrate the official top and side renders: they are near-orthographic, so
  scale from wheelbase and tyre diameter. Calibrate 2–3 perspective press
  photos with fSpy.
- Trace outlines (SAM 2 or Inkscape) and sample them at each body station to
  get **numeric** half-widths and heights.
- Store the result as section tables in `dims.js`, tagged `ANLY` (measured from
  published images) or `EST`. Only numbers enter the repo, never the images.
- Target: silhouette IoU ≥ 0.92 in top and side views against the references.

### Phase 5: Surface quality (1–2 days)

- Replace linear station interpolation with centripetal Catmull-Rom between
  rings. Raise ring resolution where curvature is high (nose, inlet lip,
  cover shoulder).
- Add proper trailing edges and slot gaps on wing elements, and edge radii on
  bodywork boundaries, so lighting reads correctly.
- Check normals and remove seams (`loft` currently caps with fans; use
  welded caps).

### Phase 6: Regression

The validator gains RV containment, C2.3 positions and per-view IoU (when
`reference/` is present). The render harness produces before/after sheets for
review on every change.

---

## 6. Ground rules

- No copyrighted image, CAD file or third-party mesh enters the repository.
  Only numbers derived from them, each tagged with its provenance.
- Regulation-derived geometry is tagged `REG`, image measurements `ANLY`,
  modelling choices `EST`. The README's distribution table is updated to match.
- The regs PDF is cited by issue number. When Issue 17 changes a recipe,
  `recipes.js` notes it.

## Sources

- FIA 2026 F1 Regulations, Section C, Issue 16 (mirror: github.com/TracingInsights/26Regs) and Issue 17: https://api.fia.com/system/files/documents/fia_2026_f1_regulations_-_section_c_technical_-_iss_17_-_2026-04-28.pdf
- Mercedes-AMG W17 page (official renders): https://www.mercedes-amg.com/en/w17
- F1.com first look: https://www.formula1.com/en/latest/article/first-look-mercedes-reveal-first-images-of-the-w17-with-new-livery-design.3PiP6vnYUBcKolJt2v2CNI
- F1.com W17 tech analysis: https://www.formula1.com/en/latest/article/tech-analysis-have-mercedes-pioneered-a-left-field-solution-with-their-new.6fpytwTL29cap2mrQuAEdc
- Barcelona shakedown gallery: https://www.autosport.com/f1/galleries/barcelona-shakedown-in-photos/11502/
- three-bvh-csg: https://github.com/gkjohnson/three-bvh-csg, three-mesh-bvh: https://github.com/gkjohnson/three-mesh-bvh
- fSpy: https://github.com/stuffmatic/fSpy, SAM 2: https://github.com/facebookresearch/sam2
