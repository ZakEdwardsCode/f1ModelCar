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

export const D = {
  // --- Overall envelope ------------------------------------------------
  length: 5.505,      // PUB  under 5505 mm
  width: 1.900,       // PUB  1900 mm
  height: 0.970,      // PUB  970 mm
  wheelbase: 3.400,   // REG  3400 mm, shortened 200 mm for 2026
  massKg: 772,        // PUB  772 kg

  // --- Longitudinal stations ------------------------------------------
  zNose: 2.900,       // EST  nose tip
  zFrontAxle: 1.700,  // derived: wheelbase centred on the axle pair
  zRearAxle: -1.700,
  zTail: -2.605,      // derived: zNose - length

  zFrontBulkhead: 1.560,
  zCockpitFront: 1.080,
  zCockpitRear: 0.120,
  zRollHoop: 0.060,
  zEngineFront: -0.560,
  zEngineRear: -1.260,
  zGearboxRear: -1.980,
  zRearWing: -2.265,

  // --- Vertical layout -------------------------------------------------
  // An F1 car is a deep tub sitting almost on its own floor, not a shallow
  // body on stilts. These are the heights that set that proportion.
  yFloor: 0.030,        // EST  floor reference plane, ride height
  yPlank: 0.020,
  yTubBottom: 0.060,    // EST  survival cell underside at the cockpit
  yCockpitRim: 0.572,   // EST  top of the survival cell flanks
  yDriverHip: 0.175,
  yDriverShoulder: 0.430,
  yHelmetCentre: 0.655, // EST  helmet top lands near 0.795
  yHaloCrown: 0.755,    // EST  ring sits level, just under the helmet crown
  yRollHoopTop: 0.950,  // REG  inside the 970 mm height limit
  yAirboxTop: 0.940,
  yCrank: 0.090,        // REG  crankshaft centreline above the reference plane
  ySidepodTop: 0.500,
  ySidepodBottom: 0.130,

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
  // For 2026 the wing ELEMENTS span much less than the car, and wide
  // endplates carry the assembly out to the full permitted width.
  fwElementSpan: 0.800,    // EST  half-span of the three planes
  fwEndplateOuter: 0.950,  // REG  assembly reaches maximum width
  frontWingLE: 2.855,
  rearWingSpan: 0.500,
  floorHalfWidth: 0.740,   // REG  floor narrowed for 2026
  zFloorFront: 1.420,
  zFloorRear: -1.860,

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
 * Survival cell body plan: half-width and the underside and upper surface
 * heights at each longitudinal station. The nose grows from a slim tip into
 * a deep tub, which is the single proportion that makes the car read
 * correctly from any angle.
 */
export const TUB_PLAN = [
  // z,      w,     yBot,  yTop
  [2.900, 0.042, 0.205, 0.268],  // nose tip
  [2.760, 0.058, 0.196, 0.278],
  [2.560, 0.081, 0.180, 0.296],
  [2.300, 0.111, 0.158, 0.322],
  [2.020, 0.149, 0.132, 0.356],
  [1.780, 0.192, 0.108, 0.392],
  [1.560, 0.235, 0.088, 0.428],  // front bulkhead
  [1.340, 0.262, 0.074, 0.468],
  [1.080, 0.286, 0.066, 0.516],  // dash bulkhead
  [0.860, 0.300, 0.062, 0.548],
  [0.560, 0.312, 0.060, 0.566],
  [0.240, 0.318, 0.060, 0.572],
  [-0.060, 0.316, 0.062, 0.568],
  [-0.320, 0.302, 0.066, 0.552],
  [-0.560, 0.288, 0.072, 0.530],  // engine front face
];

export default D;
