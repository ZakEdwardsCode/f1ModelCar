// dims.js - the W17 dimension table. Single source of truth for the model.
//
// All values in metres. Coordinate system:
//   +X  car's right-hand side
//   +Y  up, with Y = 0 at the ground plane
//   +Z  forward, toward the nose
//
// Published figures (Mercedes-AMG PETRONAS F1 Team, W17 technical
// specification) are marked PUB. Figures from the 2026 FIA technical
// regulations are marked REG. Everything else is a proportion chosen to match
// published photography and is marked EST - those are modelling choices, not
// claims about the real car.
//
// Longitudinal stations are derived from the regulation planes in regs.js
// (XA, XC, XPU, XR), so the layout cannot drift away from Article C2.3.

import { zX, yZ, Z_FRONT_AXLE, Y_REF, XA, XC, XPU, XR, XDIF } from './regs.js';

export const D = {
  // --- Overall envelope ------------------------------------------------
  length: 5.505,      // PUB  under 5505 mm
  width: 1.900,       // PUB  1900 mm
  height: 0.970,      // PUB  970 mm
  wheelbase: 3.400,   // REG  3400 mm, shortened 200 mm for 2026
  massKg: 772,        // PUB  772 kg

  // --- Longitudinal stations ------------------------------------------
  // Viewer z, metres. XF is the FIA longitudinal coordinate from the front
  // axle in mm, increasing rearward; see regs.js.
  zNose: zX(-1300),            // REG  forward limit of RV-BODY-FRONT
  zFrontAxle: Z_FRONT_AXLE,    // XF = 0
  zRearAxle: zX(XR),           // XR = 0, 3400 mm behind
  zTail: zX(XDIF + 760),       // REG  rear limit of RV-TAIL

  zFrontBulkhead: zX(XA),      // REG  XA = 0, 75 mm ahead of the front axle
  zCockpitFront: zX(XC - 800), // EST  cockpit opening is ~800 mm long
  zCockpitRear: zX(XC),        // REG  XC = 0, 1930 mm behind XA
  zRollHoop: zX(XC + 160),     // REG  inside RV-ROLL-HOOP, XC to XC + 320
  zEngineFront: zX(XPU),       // REG  400 mm behind XC (minimum 360)
  zEngineRear: -1.260,
  zGearboxRear: -1.980,
  zRearWing: zX(XR + 400),     // REG  middle of RV-RW-PROFILES

  // --- Vertical layout -------------------------------------------------
  // y = 0 is the ground. The FIA reference plane (Z = 0) sits at yFloor.
  yFloor: Y_REF,        // EST  reference plane, i.e. ride height
  yPlank: 0.020,
  yTubBottom: yZ(60),   // EST  survival cell underside at the cockpit
  yCockpitRim: yZ(700), // REG  RV-BODY-FRONT allows 680-770 here
  yDriverHip: yZ(175),
  yDriverShoulder: yZ(470),
  yHelmetCentre: yZ(700), // EST  only the top half shows above the rim
  yHaloCrown: yZ(820),  // EST  ring sits level with the helmet's upper half
  yRollHoopTop: yZ(925),  // REG  inside the 970 mm limit of RV-ROLL-HOOP
  yAirboxTop: yZ(915),
  yCrank: 0.090,        // REG  crankshaft centreline above the reference plane
  ySidepodTop: yZ(560),
  ySidepodBottom: yZ(140),

  // --- Tyres (Pirelli 2026) -------------------------------------------
  // Fronts 25 mm narrower and 15 mm smaller in diameter than 2025,
  // rears 30 mm narrower and 10 mm smaller. 18-inch rims retained.
  tyreFrontWidth: 0.280,   // REG  280 mm tread, down from 305 mm
  tyreRearWidth: 0.375,    // REG  375 mm tread, down from 405 mm
  tyreFrontDia: 0.705,     // REG  720 mm - 15 mm
  tyreRearDia: 0.710,      // REG  720 mm - 10 mm
  rimDia: 0.4572,          // REG  18 in

  // --- Track -----------------------------------------------------------
  xFrontOuter: 0.950,      // REG  overall width limit
  xRearOuter: 0.930,       // EST  rear track slightly inside the fronts

  // --- Aero surfaces ---------------------------------------------------
  // For 2026 the wing ELEMENTS span much less than the car. The endplate
  // sits inboard of the front tyre and only the footplate reaches outboard.
  fwElementSpan: 0.675,    // REG  RV-FW-PROFILES, Y <= 675
  fwEndplateOuter: 0.660,  // REG  RV-FWEP-BODY, Y 575-680
  frontWingLE: zX(-1250),  // REG  forward limit of RV-FW-PROFILES
  rearWingSpan: 0.555,     // REG  RV-RW-PROFILES, Y <= 575, less the endplate
  floorHalfWidth: 0.770,   // REG  RV-FLOOR-BODY, Y <= 770
  zFloorFront: zX(350),    // REG  RV-FLOOR-BODY starts at XF = 350
  zFloorRear: zX(XR + 300),

  // --- Brakes (Brembo / Carbone Industries 2026) -----------------------
  discFrontDia: 0.330,     // supplier  330 mm, up to 345 mm permitted
  discRearDia: 0.280,      // supplier  280 mm maximum
  discThickness: 0.034,    // supplier  34 mm, up from 32 mm
  discHoleDia: 0.0025,     // supplier  2.5 mm minimum, down from 3 mm
  discHolesFront: 1440,    // supplier  linear pattern, up from ~1050
};

// Derived convenience values.
D.tyreFrontR = D.tyreFrontDia / 2;
D.tyreRearR = D.tyreRearDia / 2;
D.rimR = D.rimDia / 2;
D.xFrontTyre = D.xFrontOuter - D.tyreFrontWidth / 2;
D.xRearTyre = D.xRearOuter - D.tyreRearWidth / 2;

/**
 * Survival cell and nose body plan, in FIA millimetres:
 *   [XF, half-width, underside Z, crown Z]
 *
 * Every row is checked against the regulation envelope it has to live in:
 *   - crown under the 11 m arc of RV-BODY-FRONT (§12.1), see noseCrownLimit
 *   - underside above the §12.2 line ahead of XC - 875
 *   - plan width inside §12.9 (200 at XA + 100, 265 at XC - 1015, 400 at XC - 400)
 *   - and enclosing RV-CH-FRONT-MIN (§13): 268 to 490 mm wide, 300 to 415 tall
 * The nose tip and taper are EST, matched to launch photography.
 */
export const TUB_PLAN_MM = [
  // XF,    w,   zBot, zTop
  [-1300,  48,  150,  198],   // nose tip
  [-1180,  70,  140,  240],
  [-1000,  94,  138,  305],
  [-800,  114,  160,  370],
  [-520,  134,  186,  450],
  [-260,  148,  204,  515],
  [XA,    156,  218,  545],   // XA: survival cell front
  [250,   184,  222,  590],
  [525,   212,  214,  622],
  [840,   238,  200,  640],
  [XC - 875, 250, 196, 642],  // dash bulkhead, start of the cockpit
  [1150,  282,  100,  668],
  [1450,  320,   62,  690],
  [1700,  348,   60,  700],
  [XC,    356,   60,  700],   // XC: rear of the cockpit
  [2060,  338,   62,  640],
  [XPU,   300,   66,  580],   // XPU: engine mounting face
];

/** The same plan in viewer metres: [z, w, yBot, yTop]. */
export const TUB_PLAN = TUB_PLAN_MM.map(([xf, w, zb, zt]) => [zX(xf), w / 1000, yZ(zb), yZ(zt)]);

export default D;
