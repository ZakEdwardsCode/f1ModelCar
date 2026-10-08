// parts-body.js - annotations for the chassis, aerodynamics and bodywork.
//
// Provenance tag on every entry:
//   official  Mercedes-AMG PETRONAS F1 Team published W17 specification
//   reg       2026 FIA technical regulations, via FIA and Formula 1 explainers
//   supplier  published by the named component supplier
//   observed  published technical analysis of this specific car
//   general   long-standing F1 engineering practice, NOT W17-specific
//
// tier controls when a marker appears as you zoom: 1 = whole-car, 4 = detail.

export const BODY_PARTS = {

  /* ================================================================== */
  /* FRONT WING ASSEMBLY                                                */
  /* ================================================================== */

  'front-wing-mainplane': {
    name: 'Front Wing Mainplane',
    group: 'Front Wing Assembly',
    tier: 1,
    src: 'reg',
    spec: [
      ['Planes permitted', '3 maximum'],
      ['Width change for 2026', '100 mm narrower'],
      ['Construction', 'Carbon fibre composite'],
      ['Function', 'Sets front axle load, conditions flow for the whole car'],
    ],
    text: 'The lowest and most forward aerofoil on the car, and the only fixed element of the three. Everything downstream depends on what the mainplane does with the air first, which is why it is the single most sensitive surface on an F1 car. For 2026 the front wing is 100 mm narrower than the outgoing generation and limited to three planes in total, cutting the elaborate multi-element cascades that defined the previous rule set. On the W17 the mainplane is fixed, and so is the second plane above it, because the support pylons land there. Only the outboard panels of the third plane move.',
  },



  'front-wing-endplate': {
    name: 'Front Wing Endplate',
    group: 'Front Wing Assembly',
    tier: 2,
    src: 'reg',
    spec: [
      ['Construction', 'Carbon fibre composite'],
      ['2026 intent', 'Reduced outwash'],
    ],
    text: 'Caps the end of the wing and controls how the tip vortex forms. The 2026 regulations deliberately restrict the aggressive outwash designs of the previous era, the ones that flung the front tyre wake wide around the car, because that wake is exactly what made following another car so difficult. The endplate is now a much plainer structure whose main job is turning flow around the front tyre rather than manufacturing a vortex.',
  },


  'front-wing-footplate': {
    name: 'Endplate Footplate',
    group: 'Front Wing Assembly',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'Base of the endplate'],
      ['Function', 'Seals the wing tip toward the ground'],
    ],
    text: 'The horizontal shelf at the bottom of the endplate. It helps seal the low-pressure region under the wing tip against the ground and starts turning flow outboard of the front tyre contact patch. Sitting only a few centimetres off the track surface, it is one of the first things damaged in any contact.',
  },

  'front-wing-pylon': {
    name: 'Front Wing Support Pylon',
    group: 'Front Wing Assembly',
    tier: 3,
    src: 'observed',
    spec: [
      ['Quantity', 'Two'],
      ['Mounting on W17', 'Picks up on the second element'],
    ],
    text: 'The twin struts carrying the front wing off the underside of the nose. On the W17 the pylons attach to the second element rather than the mainplane, which analysts flagged as an unusual choice at launch. Mounting higher leaves a clean slot beneath the nose so flow stays attached along the nose underside instead of separating where a conventional mainplane-mounted pylon would sit.',
  },

  'front-wing-flap-adjuster': {
    name: 'Flap Angle Adjuster Bracket',
    group: 'Front Wing Assembly',
    tier: 4,
    src: 'general',
    spec: [
      ['Location', 'Both ends of the wing'],
      ['Adjusted', 'On the grid and in the pit lane'],
    ],
    text: 'The slotted bracket that sets the static angle of the flaps, and the one aerodynamic setting a team is allowed to change in parc ferme conditions. Mechanics adjust it with a handheld driver in a few seconds, usually in fractions of a degree, to trim front grip between sessions or in response to a driver complaining of understeer on the formation lap.',
  },

  'flap-adjuster-screw': {
    name: 'Flap Adjuster Screw',
    group: 'Front Wing Assembly',
    tier: 4,
    src: 'general',
    spec: [
      ['Type', 'Threaded adjuster'],
      ['Access', 'Handheld driver, outboard face'],
    ],
    text: 'The screw itself. Turning it walks the flap trailing edge up or down against the slotted bracket. This is the smallest single component on the car with a direct, measurable effect on lap time, and it is the one adjustment a driver can request between the end of qualifying and the start of the race without breaking parc ferme.',
  },

  /* ================================================================== */
  /* NOSE AND FRONT STRUCTURES                                          */
  /* ================================================================== */

  'nose-cone': {
    name: 'Nose Cone',
    group: 'Nose & Front Structures',
    tier: 1,
    src: 'official',
    spec: [
      ['Construction', 'Carbon fibre composite'],
      ['Role', 'Aerodynamic fairing and impact structure housing'],
      ['Removal', 'Replaceable as an assembly with the front wing'],
    ],
    text: 'The detachable front section, bolted to the front bulkhead of the survival cell. It carries the front wing and houses the front impact structure. Because it is a single bolt-on assembly, a pit crew can change a damaged nose and wing together in roughly ten seconds. Aerodynamically it has to be as narrow as the crash structure inside it allows, so as much air as possible reaches the floor rather than being blocked at the front of the car.',
  },

  'front-impact-structure': {
    name: 'Front Impact Structure',
    group: 'Nose & Front Structures',
    tier: 3,
    src: 'general',
    spec: [
      ['Construction', 'Crushable carbon composite'],
      ['Test', 'FIA homologation crash test before the car may race'],
      ['Behaviour', 'Progressive crush, not elastic rebound'],
    ],
    text: 'The energy-absorbing cone inside the nose. It is engineered to fail in a controlled way, crushing progressively along its length and converting kinetic energy into the destruction of the laminate rather than passing it to the driver. Every car design must pass an FIA frontal impact test before it is allowed to run, and the structure is single-use: once it has crushed, that nose is scrap.',
  },

  'front-bulkhead': {
    name: 'Front Bulkhead',
    group: 'Nose & Front Structures',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'Forward face of the survival cell'],
      ['Function', 'Nose mounting and load path into the tub'],
    ],
    text: 'The forward face of the survival cell, where the nose assembly bolts on. It is one of the most heavily loaded single planes on the car: it reacts the entire front wing download, the nose weight, and in an accident the residual load coming back through the impact structure once that structure has crushed.',
  },

  'front-jack-point': {
    name: 'Front Jack Point',
    group: 'Nose & Front Structures',
    tier: 4,
    src: 'general',
    spec: [
      ['Location', 'Underside of the nose'],
      ['Used by', 'Front jack operator in the pit stop'],
    ],
    text: 'The socket the front jack engages during a pit stop. The jack man stands in the path of a car arriving at pit lane speed, hooks the jack in as it stops, and lifts. The point has to be stiff enough to take the whole front of the car, positioned so it can be found without looking, and low enough to clear a front wing that sits only centimetres off the ground.',
  },

  /* ================================================================== */
  /* SURVIVAL CELL AND COCKPIT                                          */
  /* ================================================================== */

  'survival-cell': {
    name: 'Survival Cell (Monocoque)',
    group: 'Survival Cell & Cockpit',
    tier: 1,
    src: 'official',
    spec: [
      ['Construction', 'Moulded carbon fibre and honeycomb composite structure'],
      ['Function', 'Primary structure and driver protection'],
      ['Integration', 'Nose forward, power unit aft, suspension either side'],
    ],
    text: 'The core of the car and the piece everything else bolts to. Mercedes describe it as a moulded carbon fibre and honeycomb composite structure: skins of carbon laid over an aluminium honeycomb or foam core, cured under pressure in an autoclave. It has to be stiff enough that the suspension has a rigid platform to work against, and strong enough to remain intact around the driver in an accident that destroys everything attached to it. For 2026 the whole package is 200 mm shorter in wheelbase and 100 mm narrower, so the same structural job is being done by a smaller box.',
  },

  'cockpit-opening': {
    name: 'Cockpit Opening',
    group: 'Survival Cell & Cockpit',
    tier: 2,
    src: 'general',
    spec: [
      ['Regulation', 'Minimum template size for driver extraction'],
      ['Extraction test', 'Driver must exit within a set time'],
    ],
    text: 'The aperture the driver climbs into. Its minimum size is fixed by an FIA template so that a driver can be lifted out without removing the steering wheel first, and teams must demonstrate the driver can get out unaided within a time limit. The tall flanks either side are not styling: they are the side-intrusion protection required around the driver torso.',
  },

  'cockpit-padding': {
    name: 'Cockpit Side Padding',
    group: 'Driver Safety',
    tier: 3,
    src: 'general',
    spec: [
      ['Standard', 'FIA-specified energy-absorbing foam'],
      ['Location', 'Either side of the driver head'],
    ],
    text: 'Energy-absorbing foam blocks flanking the driver head. They are made to an FIA specification that behaves differently at different temperatures and impact speeds: soft enough not to be punishing over kerbs, but stiffening under a sharp lateral impact so the head decelerates against foam rather than carbon. They are removable so marshals can take them out to extract an injured driver.',
  },

  'headrest': {
    name: 'Headrest',
    group: 'Driver Safety',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Rear head restraint'],
      ['Fitment', 'Quick-release for extraction'],
    ],
    text: 'The rear head restraint behind the helmet. It is a quick-release item: in an extraction, the headrest comes out first so marshals can get access behind the driver and fit a collar before the driver is moved.',
  },

  'driver-helmet': {
    name: 'Driver Helmet',
    group: 'Driver Safety',
    tier: 2,
    src: 'general',
    spec: [
      ['Standard', 'FIA 8860 series'],
      ['Construction', 'Carbon composite shell with ballistic visor'],
      ['Car 63', 'George Russell'],
      ['Car 12', 'Kimi Antonelli'],
    ],
    text: 'Shown here as a plain form to give the cockpit its true scale rather than as either driver livery. Race helmets are built to the FIA 8860 standard, which includes a ballistic test firing a projectile at the visor, introduced after a suspension spring struck a driver visor at Hungary in 2009. The W17 is raced by George Russell in car 63 and Kimi Antonelli in car 12.',
  },

  'helmet-visor': {
    name: 'Helmet Visor',
    group: 'Driver Safety',
    tier: 4,
    src: 'general',
    spec: [
      ['Standard', 'FIA 8860, includes ballistic impact test'],
      ['Tear-offs', 'Stacked film layers pulled off during the race'],
    ],
    text: 'The visor carries a stack of thin tear-off films. When the outer one is coated in rubber pickup, oil mist or insects, the driver pulls it away at low speed and the clean layer beneath takes over. A reinforcing strip above the eye port was added to the standard after the 2009 visor strike.',
  },

  'hans-device': {
    name: 'Head and Neck Support',
    group: 'Driver Safety',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Limits head travel relative to the torso'],
      ['Attachment', 'Tethers between the device and the helmet'],
      ['Mandatory in F1', 'Since 2003'],
    ],
    text: 'A carbon collar worn on the shoulders, under the harness, tethered to the helmet. In a frontal impact the harness stops the torso almost instantly while an unrestrained head keeps travelling, and the neck takes the difference. The device ties the head to the torso so they decelerate together. It has been mandatory in Formula 1 since 2003 and is among the most consequential safety changes the sport has made.',
  },

  'safety-harness': {
    name: 'Six-Point Safety Harness',
    group: 'Driver Safety',
    tier: 4,
    src: 'general',
    spec: [
      ['Type', 'Six-point'],
      ['Release', 'Single rotary buckle'],
    ],
    text: 'Two shoulder straps, two lap straps and two anti-submarine straps between the legs, all meeting at one buckle. The anti-submarine pair stop the driver sliding forward and down under the lap belt in a frontal impact. One turn of the central buckle releases everything at once, which is what makes an unaided exit possible in seconds.',
  },

  'electrical-cut-off-switch': {
    name: 'Electrical Cut-Off Switch',
    group: 'Driver Safety',
    tier: 4,
    src: 'general',
    spec: [
      ['Marking', 'Red spark inside a white-edged blue triangle'],
      ['Operable by', 'Driver and by marshals from outside'],
    ],
    text: 'The external kill switch, marked with the standard red spark on a blue triangle so a marshal can find it instantly on any car in the field. It isolates the electrical systems, which matters far more on a 2026 car than it used to: the high-voltage hybrid system carries enough energy that a marshal must know the car is safe before touching it.',
  },

  /* ================================================================== */
  /* HALO AND ROLL PROTECTION                                           */
  /* ================================================================== */

  'halo': {
    name: 'Halo',
    group: 'Driver Safety',
    tier: 1,
    src: 'supplier',
    spec: [
      ['Material', 'Titanium alloy Ti-6Al-4V Grade 5'],
      ['Mass', '7.0 kg, +0.05 / -0.15 kg'],
      ['Standard', 'FIA 8869-2018'],
      ['Static load test', '125 kN applied vertically'],
      ['Supply', 'FIA-designated manufacturers only'],
    ],
    text: 'The titanium hoop over the cockpit, mandatory on every Formula 1 car since 2018. It is not made by the teams: it is built to FIA standard 8869-2018 by approved manufacturers, in Ti-6Al-4V Grade 5 alloy, and its mass is controlled to within a hundred grams or so. It must survive 125 kN applied vertically, roughly the weight of a London double-decker bus resting on it, without failing. Teams may only add a thin aerodynamic fairing to the outside of the supplied structure.',
  },

  'halo-front-pillar': {
    name: 'Halo Front Pillar',
    group: 'Driver Safety',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'Cockpit centreline, ahead of the driver'],
      ['Concern raised pre-2018', 'Forward visibility'],
    ],
    text: 'The single central strut ahead of the driver. It was the most criticised part of the halo before its introduction, on the grounds that it would sit in the driver line of sight. In practice it falls between the eyes at a distance where the brain merges the two views, and drivers stopped noticing it within a season. It is also the member that takes the load in a wheel-first frontal strike.',
  },

  'halo-rear-mount': {
    name: 'Halo Rear Mounting',
    group: 'Driver Safety',
    tier: 4,
    src: 'general',
    spec: [
      ['Quantity', 'Two, one each side'],
      ['Load path', 'Directly into the survival cell'],
    ],
    text: 'One of three attachment points, taking load straight into reinforced pickups moulded into the survival cell. The mounts are part of why fitting a halo cost teams weight beyond the 7 kg of the structure itself: the tub had to be locally strengthened to react 125 kN without tearing out.',
  },

  'halo-mounting-bolt': {
    name: 'Halo Mounting Bolt',
    group: 'Driver Safety',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Secures the halo to the survival cell pickup'],
      ['Installation', 'Torqued to a specified value and recorded'],
    ],
    text: 'One of the bolts holding the halo down. Fasteners in this load path are controlled items: torqued to a specified figure, logged, and replaced on a schedule rather than reused indefinitely. The halo is only as good as the joint between it and the tub, and that joint is a handful of bolts.',
  },

  'roll-hoop': {
    name: 'Principal Roll Structure',
    group: 'Driver Safety',
    tier: 2,
    src: 'general',
    spec: [
      ['Function', 'Protects the driver in an inversion'],
      ['Test', 'Static load test to FIA requirement'],
      ['Change since 2022', 'Pointed tops banned after the Zhou accident'],
    ],
    text: 'The structure above and behind the driver head that keeps a space open if the car ends up inverted. After Zhou Guanyu was pitched upside down at Silverstone in 2022 and the roll structure dug into the gravel, the FIA required a rounded rather than pointed top so the hoop skids rather than digs, and raised the load test requirements. It sits alongside the halo: the hoop covers inversion, the halo covers intrusion.',
  },

  'roll-structure-blade': {
    name: 'Roll Structure Blade Fairing',
    group: 'Bodywork',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Aerodynamic fairing over the roll structure'],
    ],
    text: 'The slim carbon fairing wrapping the structural member, turning a blunt safety component into something the air can flow over on its way to the airbox and the rear wing.',
  },

  /* ================================================================== */
  /* CONTROLS                                                           */
  /* ================================================================== */

  'steering-wheel': {
    name: 'Steering Wheel',
    group: 'Controls',
    tier: 2,
    src: 'official',
    spec: [
      ['Construction', 'Carbon fibre construction'],
      ['Removal', 'Quick-release, required for driver entry and exit'],
      ['Cost', 'Among the most expensive single items on the car'],
    ],
    text: 'Mercedes list it simply as carbon fibre construction, which undersells it: it is the driver interface to every adjustable system on the car, moulded to that specific driver hands. It has to come off for the driver to get in or out, and under the rules it must be refitted before the driver leaves the car after a stoppage. On a 2026 car it also manages the energy deployment strategy, which is a far bigger part of the driver workload than it was under the previous power unit rules.',
  },

  'steering-wheel-display': {
    name: 'Steering Wheel Display',
    group: 'Controls',
    tier: 3,
    src: 'general',
    spec: [
      ['Type', 'Colour LCD'],
      ['Shows', 'Gear, delta, energy state, tyre and PU data'],
    ],
    text: 'The central screen, showing gear, lap delta, energy deployment state and whichever of dozens of data pages the driver has selected. Under the 2026 rules the energy pages matter more than ever: with electrical power at roughly half of total output, managing the state of charge across a lap is a continuous task rather than a button press.',
  },

  'steering-wheel-grip': {
    name: 'Steering Wheel Grip',
    group: 'Controls',
    tier: 4,
    src: 'general',
    spec: [
      ['Construction', 'Moulded to the individual driver hands'],
    ],
    text: 'Moulded from a cast of the driver own hands, so the fingers fall into the same place every time without being looked for. Each driver grips are unique and are remade if their preferences change.',
  },

  'shift-paddle': {
    name: 'Shift Paddle',
    group: 'Controls',
    tier: 4,
    src: 'official',
    spec: [
      ['Gears', 'Eight forward, one reverse'],
      ['Selection', 'Sequential, semi-automatic, hydraulic activation'],
      ['Shift time', 'Milliseconds'],
    ],
    text: 'Right paddle upshifts, left downshifts. The paddle is a request, not a mechanical linkage: it tells the control electronics to fire a hydraulic actuator that moves a selector barrel. The gearbox is sequential, so gears can only be taken one at a time in order, and on downshifts the system blips the throttle itself to match revs.',
  },

  'clutch-paddle': {
    name: 'Clutch Paddle',
    group: 'Controls',
    tier: 4,
    src: 'general',
    spec: [
      ['Quantity', 'Typically two, used together at the start'],
      ['Used for', 'Race starts and pit lane launches'],
    ],
    text: 'The clutch is only used by hand, and only at a standing start or leaving the pit box. Drivers pull both paddles in, release to a bite point found in practice, and modulate from there. The start is one of the few remaining moments where a driver can gain several places through pure feel, because the software cannot do it for them.',
  },

  'steering-wheel-rotary': {
    name: 'Rotary Switch',
    group: 'Controls',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Multi-position mode selection'],
      ['Typical uses', 'Differential, engine braking, brake balance, energy'],
    ],
    text: 'A multi-position dial. Different rotaries handle differential settings, engine braking, brake migration and energy modes, and a driver will move several of them on a single lap. They are detented so positions can be counted by feel through gloves at 300 km/h.',
  },

  'steering-wheel-button': {
    name: 'Steering Wheel Button',
    group: 'Controls',
    tier: 4,
    src: 'general',
    spec: [
      ['Typical functions', 'Radio, drink, pit limiter, neutral, mode confirm'],
    ],
    text: 'Momentary buttons for the things a driver needs instantly: radio, pit lane speed limiter, neutral, drinks pump. Placement is fixed by the driver during pre-season so muscle memory does the work. Under the 2026 rules one of these buttons is the overtaking energy request.',
  },

  'steering-column': {
    name: 'Steering Column',
    group: 'Controls',
    tier: 4,
    src: 'general',
    spec: [
      ['Feature', 'Collapsible section'],
      ['Carries', 'Steering torque plus all wheel data and power'],
    ],
    text: 'Connects the wheel to the rack and carries every electrical connection to the wheel through a single coupling. It includes a collapsible section designed to shorten in a frontal impact rather than drive the wheel into the driver chest.',
  },

  'steering-rack': {
    name: 'Steering Rack',
    group: 'Controls',
    tier: 3,
    src: 'official',
    spec: [
      ['Type', 'Power-assisted rack and pinion'],
      ['Output', 'Track rods to both front uprights'],
    ],
    text: 'Mercedes specify a power-assisted rack and pinion. Assistance is hydraulic and strictly limited by the regulations: it may reduce effort but must not add steering inputs of its own, so there is no active or variable-ratio behaviour. Even assisted, the loads are high enough that drivers train specifically for neck and forearm endurance.',
  },

  /* ================================================================== */
  /* BODYWORK AND INTAKES                                               */
  /* ================================================================== */

  'sidepod': {
    name: 'Sidepod',
    group: 'Bodywork',
    tier: 1,
    src: 'observed',
    spec: [
      ['Construction', 'Carbon fibre composite bodywork'],
      ['W17 architecture', 'Narrow high inlet, aggressive undercut'],
      ['Livery', 'Silver and black zebra pattern forming the AMG mark'],
      ['Contains', 'Radiators, coolers, side impact structures'],
    ],
    text: 'The volume either side of the driver holding the entire cooling system and the mandated side impact structures. Analysis of the W17 at launch noted an architecture that starts with a narrow inlet and rises again toward the rear, rather than tapering downward the way several rivals do. The high-set inlet buys room for a deep undercut beneath it, which is the point: air routed under the sidepod feeds the floor edge, and the floor is where a large share of the downforce is made. The launch livery carries a silver and black zebra pattern across this surface that resolves into the AMG mark.',
  },

  'sidepod-inlet': {
    name: 'Sidepod Radiator Inlet',
    group: 'Bodywork',
    tier: 2,
    src: 'observed',
    spec: [
      ['Position on W17', 'High-set and narrow'],
      ['Feeds', 'Water radiator, charge air cooler, ERS cooler'],
      ['Trade-off', 'Cooling capacity against drag'],
    ],
    text: 'Every square centimetre here is a compromise. Air taken in for cooling has to be slowed, heated and pushed back out, and all of that costs drag, so teams run the smallest inlet that will survive the hottest race on the calendar. Raising the inlet clears space underneath for the undercut. The 2026 power unit makes this harder rather than easier: the electrical side is three times more powerful than before and rejects heat that has to go somewhere.',
  },

  'sidepod-inlet-splitter': {
    name: 'Inlet Splitter Vane',
    group: 'Bodywork',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Divides incoming flow between coolers'],
    ],
    text: 'The vane dividing the inlet mouth. Behind it the duct splits, sending measured proportions of the incoming air to the water radiator, the charge air cooler and the electrical system cooler. Getting the split wrong means one system runs hot while another is over-cooled and only adding drag.',
  },

  'wheel-wake-control-board': {
    name: 'In-Washing Wheel Wake Control Board',
    group: 'Aerodynamics',
    tier: 2,
    src: 'reg',
    spec: [
      ['Introduced', '2026 regulations'],
      ['Location', 'Behind the front wheels, ahead of the sidepod'],
      ['Direction', 'In-washing rather than out-washing'],
    ],
    text: 'A 2026-specific device, and one whose name states the intent. Previous rule sets pushed the front tyre wake outward, away from the car, which worked beautifully in isolation and ruined the racing because the displaced air wrecked the car behind. These boards pull the wake inward instead, keeping it in a tighter, more predictable envelope. The trade is a car that is slightly less efficient alone and far more raceable in traffic.',
  },

  'bargeboard': {
    name: 'Bargeboard',
    group: 'Aerodynamics',
    tier: 2,
    src: 'reg',
    spec: [
      ['Status', 'Returned for 2026'],
      ['Location', 'Behind the front wheels'],
      ['Function', 'Manages front tyre wake before the floor'],
    ],
    text: 'Bargeboards were largely legislated away in 2022 and return under the 2026 rules, positioned behind the front wheels to manage the disturbed air coming off the front tyres. A rotating, deforming tyre throws out one of the messiest flow fields on the car, and what reaches the floor and sidepods behind it determines how much of the intended downforce actually appears. These surfaces sort that mess out before it does damage.',
  },

  'sidepod-cooling-louvre': {
    name: 'Sidepod Cooling Louvre',
    group: 'Bodywork',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Hot air exit from the radiator ducts'],
      ['Configuration', 'Changed race by race for ambient conditions'],
    ],
    text: 'Exit slots for air that has passed through the radiators. Teams carry a range of louvre panels and open more of them for hot races, closing them down where ambient temperatures allow, because every open slot costs a little aerodynamic performance. Counting open louvres in the pit lane is a standard way of reading how hard a team expects to run its cooling.',
  },

  'engine-cover': {
    name: 'Engine Cover',
    group: 'Bodywork',
    tier: 1,
    src: 'official',
    spec: [
      ['Construction', 'Carbon fibre composite'],
      ['Function', 'Encloses the power unit, feeds the rear wing'],
      ['Removal', 'Quick-release fasteners for PU access'],
    ],
    text: 'The upper shell over the power unit and gearbox. Its shape controls the quality of the air arriving at the rear wing, and the tighter it is pulled in around the engine, the better that air is and the more downforce the rear wing makes. That pressure to shrink-wrap the bodywork runs directly against the need to get cooling air out, which is the central packaging argument on every F1 car.',
  },

  'shark-fin': {
    name: 'Shark Fin',
    group: 'Bodywork',
    tier: 2,
    src: 'observed',
    spec: [
      ['Function', 'Stabilises the car in yaw, feeds the rear wing'],
      ['Carries', 'Car number and sponsor identification'],
    ],
    text: 'The vertical spine running back along the engine cover. In a straight line it does very little. In yaw, when the car is sliding, it acts like a weathervane, keeping flow attached to the rear wing at exactly the moment the driver most needs the rear to stay planted. It also carries the car number, which is the main way a viewer identifies cars from a helicopter shot.',
  },

  'engine-cover-louvre': {
    name: 'Engine Cover Louvre',
    group: 'Bodywork',
    tier: 4,
    src: 'observed',
    spec: [
      ['Location', 'Coke-bottle shoulder'],
      ['Purpose', 'Manages tyre squirt and vents PU heat'],
    ],
    text: 'Louvres on the shoulder of the coke-bottle region. Analysis of the W17 specifically noted louvres here working on tyre squirt, the jet of air flung inward by the rotating rear tyre that otherwise disrupts the diffuser exit. They vent power unit heat at the same time.',
  },

  'bodywork-quarter-turn-fastener': {
    name: 'Quarter-Turn Fastener',
    group: 'Bodywork',
    tier: 4,
    src: 'general',
    spec: [
      ['Action', 'Quarter turn to lock or release'],
      ['Tool', 'Flat driver or hex key'],
    ],
    text: 'The small captive fasteners holding bodywork panels on. A quarter turn locks or releases each one, so a mechanic can have an engine cover off in seconds during a session. They are captive, meaning the stud stays with the panel rather than dropping into the car, which matters when a loose fastener in the wrong place ends a race.',
  },

  'airbox-intake': {
    name: 'Airbox Intake',
    group: 'Bodywork',
    tier: 1,
    src: 'observed',
    spec: [
      ['Position', 'Above the driver head, behind the roll structure'],
      ['Feeds', 'Inlet plenum and the turbocharger compressor'],
      ['2026 sponsor', 'Microsoft, replacing Ineos'],
      ['W17 note', 'Shorter, slimmer feed than its predecessor'],
    ],
    text: 'The mouth above the driver head taking in the engine air. It sits there because it is the highest point of clean, undisturbed flow on the car, and because forward motion mildly pressurises the intake. Technical analysis of the W17 noted that while the opening looks familiar, the way the duct feeds down behind it is markedly shorter and slimmer than before. For 2026 the airbox carries Microsoft branding in place of Ineos.',
  },

  'airbox-lip': {
    name: 'Airbox Inlet Lip',
    group: 'Bodywork',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Keeps flow attached into the duct'],
    ],
    text: 'The rounded leading edge of the intake. Its radius is chosen so flow stays attached as it turns into the duct across the full range of yaw angles the car sees, rather than separating and starving the engine at exactly the moment the car is sliding.',
  },

  'airbox-auxiliary-inlet': {
    name: 'Auxiliary Airbox Inlet',
    group: 'Bodywork',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Cooling air for PU ancillaries and electronics'],
    ],
    text: 'Smaller ducts flanking the main intake, taking cooling air rather than combustion air, typically for electronics and power unit ancillaries. On a 2026 car the electrical system needs considerably more of this than its predecessor did.',
  },

  'central-cooling-exit': {
    name: 'Central Cooling Exit',
    group: 'Bodywork',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'Rear of the engine cover'],
      ['Function', 'Primary hot air outlet'],
    ],
    text: 'The main outlet where cooling air finally leaves the car, around the exhaust exit. Air leaving here is hot, slow and low-energy, which is why it is dumped in the region behind the engine cover where it does the least aerodynamic harm on its way past the rear wing.',
  },

  /* ================================================================== */
  /* FLOOR AND UNDERBODY                                                */
  /* ================================================================== */

  'floor': {
    name: 'Floor',
    group: 'Floor & Underbody',
    tier: 1,
    src: 'reg',
    spec: [
      ['Construction', 'Carbon fibre composite'],
      ['2026 change', 'Narrowed, partially flat, lower-powered diffuser'],
      ['Downforce target', 'About 30 per cent less than 2025 overall'],
      ['Feature', 'Laterally fed diffuser'],
    ],
    text: 'The largest single aerodynamic surface on the car and, under ground effect rules, the biggest single producer of downforce. The 2026 floor is deliberately weaker than its predecessor: narrowed, partially flat, with shallower tunnels and a lower-powered, laterally fed diffuser. That is a choice, not a compromise. The extreme floors of 2022 onward made cars that lost enormous downforce the moment they followed another car closely, and porpoised violently when run low. Backing the floor off and recovering performance through active wings gives a car that behaves more predictably in traffic.',
  },

  'floor-fence': {
    name: 'Floor Leading Edge Fence',
    group: 'Floor & Underbody',
    tier: 3,
    src: 'observed',
    spec: [
      ['Location', 'Underfloor leading edge'],
      ['W17 note', 'Much smaller than the 2025 equivalents'],
    ],
    text: 'The vertical splitters at the mouth of the underfloor tunnels, seeding the vortices that seal the floor edge against the ground. On the W17 these are noticeably smaller than last year, which follows directly from the 2026 floor being asked to do less: with lower ground effect demands, the sealing structures do not need to be as aggressive.',
  },

  'floor-edge-wing': {
    name: 'Floor Edge Wing',
    group: 'Floor & Underbody',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'Outer edge of the floor'],
      ['Function', 'Seals the low pressure region under the floor'],
    ],
    text: 'The turned-up strip along the floor edge. Its job is to stop high pressure air from outside the car leaking in underneath and destroying the low pressure the floor has worked to create. The whole ground effect principle depends on that seal, and the edge is where it is most fragile.',
  },

  'diffuser-strake': {
    name: 'Diffuser Strake',
    group: 'Floor & Underbody',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Keeps flow attached through the expansion'],
      ['Failure mode', 'Separation and sudden downforce loss'],
    ],
    text: 'Vertical fins inside the diffuser. As the underfloor expands upward toward the rear, the air slows and its pressure rises, and if that happens too abruptly the flow separates from the surface and the downforce collapses. The strakes divide the diffuser into channels so flow stays attached through a steeper expansion than a plain surface would tolerate.',
  },

  'diffuser-sidewall': {
    name: 'Diffuser Sidewall',
    group: 'Floor & Underbody',
    tier: 3,
    src: 'reg',
    spec: [
      ['2026 feature', 'Laterally fed diffuser'],
    ],
    text: 'The outer wall of the diffuser. The 2026 diffuser is described as laterally fed, meaning it draws a meaningful part of its flow in from the sides rather than purely from the tunnels ahead of it. That makes it less sensitive to ride height, and a diffuser that is less ride height sensitive is a car that is less likely to porpoise.',
  },

  'diffuser-gurney': {
    name: 'Diffuser Gurney Lip',
    group: 'Floor & Underbody',
    tier: 4,
    src: 'general',
    spec: [
      ['Height', 'A few millimetres'],
      ['Effect', 'Raises floor load disproportionately to its size'],
    ],
    text: 'A small lip at the trailing edge of the diffuser, named after Dan Gurney, who found in the 1970s that a tiny strip bent up at a wing trailing edge produced far more downforce than its size suggested. It works by fixing a small separation bubble behind the lip that raises the effective camber of the whole surface. Millimetres of height here are worth measurable lap time.',
  },

  'plank': {
    name: 'Plank',
    group: 'Floor & Underbody',
    tier: 2,
    src: 'general',
    spec: [
      ['Location', 'Reference plane, car centreline'],
      ['Function', 'Enforces minimum ride height by wear limit'],
      ['Penalty', 'Disqualification if worn beyond the limit'],
    ],
    text: 'A wear-measured strip along the underside, introduced after Imola in 1994 to stop teams running the floor on the ground. It is measured after the race at defined points, and if it has worn past its limit the car is disqualified regardless of where it finished. That rule has decided real results: two cars were excluded from the 2023 United States Grand Prix for exactly this.',
  },

  'titanium-skid-block': {
    name: 'Titanium Skid Block',
    group: 'Floor & Underbody',
    tier: 4,
    src: 'general',
    spec: [
      ['Material', 'Titanium'],
      ['Function', 'Wear surface set into the plank'],
      ['Side effect', 'The sparks visible at speed'],
    ],
    text: 'Titanium pucks set into the plank at the measurement points, taking the wear so the plank itself survives. Titanium was mandated partly for spectacle: it throws a bright shower of sparks when it grounds, which is where the modern sparking effect comes from. It was also chosen because titanium debris is less likely to puncture a following car tyre than the steel it replaced.',
  },

  /* ================================================================== */
  /* REAR WING AND ACTIVE AERO                                          */
  /* ================================================================== */

  'rear-wing-mainplane': {
    name: 'Rear Wing Mainplane',
    group: 'Rear Wing & Active Aero',
    tier: 1,
    src: 'reg',
    spec: [
      ['Elements in assembly', 'Three, two of them active'],
      ['This element', 'Fixed'],
      ['Beam wing', 'Removed for 2026'],
    ],
    text: 'The fixed lower element of the three-element rear wing. It balances the front wing: too much rear wing and the car understeers, too little and it is unstable under braking and on turn-in. A notable 2026 change sits below it, or rather does not: the lower beam wing that helped drive the diffuser has been removed, so the rear wing and the floor now work more independently of one another.',
  },

  'rear-wing-flap-1': {
    name: 'Rear Wing Flap (Lower Active)',
    group: 'Rear Wing & Active Aero',
    tier: 2,
    src: 'reg',
    movable: true,
    spec: [
      ['Type', 'Active element'],
      ['Corner mode', 'Closed, maximum downforce'],
      ['Straight mode', 'Opened, minimum drag'],
      ['Availability', 'Any straight longer than about three seconds'],
    ],
    text: 'One of the two movable rear elements that replace DRS. The difference from DRS matters: DRS was an overtaking aid, permitted only within one second of the car ahead and only in designated zones. This opens on any straight long enough to be worth it, for every car, all the time. It is an efficiency device first and a racing device second.',
  },

  'rear-wing-flap-2': {
    name: 'Rear Wing Flap (Upper Active)',
    group: 'Rear Wing & Active Aero',
    tier: 2,
    src: 'reg',
    movable: true,
    spec: [
      ['Type', 'Active element'],
      ['Drag reduction target', 'About 55 per cent versus 2025'],
    ],
    text: 'The uppermost active element, and the one that moves through the largest angle. Together the front and rear active surfaces are targeted at roughly 55 per cent less drag than the 2025 cars in their low-drag configuration, which is what allows a smaller, lighter car with a 50/50 hybrid power unit to reach competitive straight-line speeds without simply running less wing everywhere.',
  },

  'active-aero-actuator': {
    name: 'Active Aero Actuator',
    group: 'Rear Wing & Active Aero',
    tier: 3,
    src: 'general',
    spec: [
      ['Controls', 'Flap position between corner and straight mode'],
      ['Oversight', 'FIA-monitored, fail-safe to high downforce'],
    ],
    text: 'The mechanism that drives the flaps between positions. Its failure mode is the important part: it must default to the closed, high-downforce state, because a wing stuck open on corner entry would be uncontrollable. Under DRS the same principle applied, and the handful of failures that did occur were serious enough to make the fail-safe direction non-negotiable.',
  },

  'active-aero-linkage': {
    name: 'Active Aero Linkage',
    group: 'Rear Wing & Active Aero',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Transmits actuator motion to the flap'],
      ['Requirement', 'Both sides must move together'],
    ],
    text: 'The rod connecting actuator to flap. Both sides must move in unison: any asymmetry between left and right would produce a yaw moment at exactly the moment the car is at maximum speed, so linkage stiffness and synchronisation are treated as a safety matter rather than a performance one.',
  },

  'rear-wing-endplate': {
    name: 'Rear Wing Endplate',
    group: 'Rear Wing & Active Aero',
    tier: 2,
    src: 'general',
    spec: [
      ['Function', 'Limits tip losses, controls the wing tip vortex'],
      ['Carries', 'Auxiliary rain lights'],
    ],
    text: 'Caps the rear wing span. Without it, high pressure air above the wing spills around the tip into the low pressure below, cutting the wing effectiveness across a surprising fraction of its span. The endplate also carries the auxiliary rain lights required so a following driver can see the car in spray.',
  },

  'rear-wing-endplate-louvre': {
    name: 'Endplate Louvre',
    group: 'Rear Wing & Active Aero',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Bleeds pressure across the endplate'],
    ],
    text: 'Slots that bleed a controlled amount of air through the endplate, weakening the tip vortex rather than letting it roll up fully. A weaker tip vortex means less induced drag for the same downforce.',
  },

  'rear-wing-pylon': {
    name: 'Rear Wing Pylon',
    group: 'Rear Wing & Active Aero',
    tier: 3,
    src: 'reg',
    spec: [
      ['Quantity', 'Twin pylons'],
      ['Mounting', 'To the rear impact structure'],
    ],
    text: 'The 2026 rear wing is carried on twin pylons picking up on the crash structure. They have to react the full rear wing load, which acts through them in both directions as the active elements open and close, while blocking as little of the diffuser exit flow as possible.',
  },

  'rear-wing-brace': {
    name: 'Rear Wing Brace',
    group: 'Rear Wing & Active Aero',
    tier: 4,
    src: 'reg',
    spec: [
      ['Role', 'Structural'],
      ['Regulated', 'Aerodynamic value kept to a minimum'],
    ],
    text: 'A structural member spanning the wing, specified in the 2026 rules as carrying load with minimal aerodynamic value. Regulating it that way is deliberate: left open, teams would shape any structural element into an additional aerodynamic surface, so the rules define what it is allowed to be.',
  },

  /* ================================================================== */
  /* REAR STRUCTURES                                                    */
  /* ================================================================== */

  'rear-impact-structure': {
    name: 'Rear Impact Structure',
    group: 'Rear Structures',
    tier: 3,
    src: 'general',
    spec: [
      ['Construction', 'Crushable carbon composite'],
      ['Test', 'FIA rear impact test'],
      ['Also carries', 'Rear wing pylons and rain light'],
    ],
    text: 'The crash structure behind the gearbox, absorbing energy in a rearward impact and doubling as the mounting point for the rear wing and the rain light. Like the front structure it is designed to destroy itself in a controlled sequence, and it must pass an FIA impact test before the car can race.',
  },

  'rain-light': {
    name: 'Rain Light',
    group: 'Rear Structures',
    tier: 3,
    src: 'general',
    spec: [
      ['Colour', 'Red'],
      ['Mandatory', 'In wet running and when required by race control'],
      ['Also indicates', 'Energy harvesting on the previous PU generation'],
    ],
    text: 'The high-intensity red light in the crash structure. In spray, a following driver may have no other cue that there is a car ahead until they are on top of it, and visibility in modern F1 spray is genuinely close to zero. It has historically also flashed to signal energy harvesting, so that a driver closing rapidly on a car that is lifting and recovering knows why the closing speed has changed.',
  },

  'auxiliary-rain-light': {
    name: 'Auxiliary Rain Light',
    group: 'Rear Structures',
    tier: 4,
    src: 'general',
    spec: [
      ['Location', 'Rear wing endplates'],
      ['Reason', 'Wider visible signature in spray'],
    ],
    text: 'Additional rain lights on the endplates, added to the regulations because a single central light was found to be inadequate in heavy spray. Spreading the lights across the car width gives a following driver some sense of how far away the car ahead is, not just that it is there.',
  },

  'exhaust-tailpipe': {
    name: 'Exhaust Tailpipe',
    group: 'Rear Structures',
    tier: 2,
    src: 'general',
    spec: [
      ['Material', 'Nickel alloy'],
      ['Position', 'Single central exit, regulated'],
      ['Downstream of', 'Turbine'],
    ],
    text: 'The single central exit. Its position is fixed by the regulations specifically so teams cannot aim exhaust gas at aerodynamic surfaces, which was a major performance avenue until exhaust-blown diffusers were legislated out. Because the gas has already passed through the turbine, it leaves with far less energy and noise than a naturally aspirated engine would produce.',
  },

  'wastegate-pipe': {
    name: 'Wastegate Pipe',
    group: 'Rear Structures',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Vents exhaust gas bypassing the turbine'],
      ['Audible as', 'The characteristic turbo chatter on a lift'],
    ],
    text: 'Vents exhaust gas around the turbine when boost has to be limited. Without an MGU-H to absorb surplus turbine energy, the wastegate does more work in 2026 than it did on the previous generation of power unit, because there is no longer a motor generator on the turbo shaft to soak up what the engine does not need.',
  },

  'rear-towing-eye': {
    name: 'Rear Towing Eye',
    group: 'Rear Structures',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Recovery attachment point'],
      ['Required', 'Front and rear'],
    ],
    text: 'A mandated recovery point so a marshal can attach a line and drag a stranded car clear without lifting it. Every second a car sits in a dangerous place is a second of risk to marshals, so recovery hardware is required at both ends and must be reachable quickly.',
  },

  'front-towing-eye': {
    name: 'Front Towing Eye',
    group: 'Nose & Front Structures',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Recovery attachment point'],
    ],
    text: 'The front recovery point, mounted low in the nose. It has to take the load of dragging a full-weight car across gravel without tearing out of the structure it is bonded to.',
  },

  'rear-jack-point': {
    name: 'Rear Jack Point',
    group: 'Rear Structures',
    tier: 4,
    src: 'general',
    spec: [
      ['Used by', 'Rear jack operator'],
    ],
    text: 'Where the rear jack engages in a pit stop. The rear jack man works blind behind the car as it arrives and has to find this point by feel within about half a second of the car stopping.',
  },

  /* ================================================================== */
  /* SIDE IMPACT                                                        */
  /* ================================================================== */

  'side-impact-structure': {
    name: 'Side Impact Structure',
    group: 'Driver Safety',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'Inside the sidepod flanks'],
      ['Test', 'FIA lateral impact test'],
      ['Construction', 'Crushable carbon composite'],
    ],
    text: 'Crushable tubes inside the sidepods, at the driver hip and shoulder line. They are the reason sidepods have their minimum bulk: the structures have to be there whether the aerodynamicist wants the volume or not. In a side impact, which gives far less distance to work with than a frontal one, they are what stands between an intruding object and the survival cell.',
  },

  /* ================================================================== */
  /* MIRRORS, CAMERAS AND SENSORS                                       */
  /* ================================================================== */

  'mirror-housing': {
    name: 'Mirror Housing',
    group: 'Sensors & Cameras',
    tier: 3,
    src: 'general',
    spec: [
      ['Minimum size', 'Specified by regulation'],
      ['Secondary role', 'Aerodynamic surface'],
    ],
    text: 'Mirrors have a regulated minimum reflective area, enlarged in recent years after drivers repeatedly said they could not see cars alongside them. Teams treat the housing as an aerodynamic device as well, since it sits in useful flow ahead of the sidepod, and the rules have been tightened more than once to stop the mirror becoming a winglet with a mirror attached.',
  },

  'mirror-stalk': {
    name: 'Mirror Stalk',
    group: 'Sensors & Cameras',
    tier: 4,
    src: 'general',
    spec: [
      ['Requirement', 'Must hold the mirror steady at speed'],
    ],
    text: 'The arm carrying the mirror. Its real design problem is vibration: a mirror that blurs at 300 km/h is useless, so the stalk has to be stiff enough to keep the image stable while remaining slim enough not to spoil the flow behind it.',
  },

  'mirror-glass': {
    name: 'Mirror Glass',
    group: 'Sensors & Cameras',
    tier: 4,
    src: 'general',
    spec: [
      ['Area', 'Regulated minimum'],
    ],
    text: 'The reflective surface itself, with a regulated minimum area. Drivers still report blind spots, which is why hand signals from the pit wall and radio calls remain part of how a driver knows what is happening around them.',
  },

  'onboard-camera-pod': {
    name: 'Airbox Camera Pod (Position 3)',
    group: 'Sensors & Cameras',
    tier: 3,
    src: 'reg',
    spec: [
      ['Regulation', 'Article C8.16.8'],
      ['Forward-most point', 'Between XC and XC + 300 mm'],
      ['Height', 'Z 840 to 900 mm'],
      ['Inner face', 'Y 120 to 170 mm from the centreline'],
    ],
    text: 'The pair of camera pods either side of the airbox. Their position is fixed to the millimetre by the regulations, so every car carries the same aerodynamic penalty and the broadcast gets consistent angles. Teams cannot move them for performance. Where a camera is not installed a housing of identical size, shape and mass is fitted instead, so the car is the same whether or not it is being broadcast.',
  },

  'onboard-camera-lens': {
    name: 'Onboard Camera Lens',
    group: 'Sensors & Cameras',
    tier: 4,
    src: 'general',
    spec: [
      ['Type', 'Wide angle, gyro-stabilised in some positions'],
    ],
    text: 'The lens itself. Some positions are gyro-stabilised so the horizon stays level while the car moves beneath it, which is what produces the rotating-car onboard shot familiar from broadcasts.',
  },

  'nose-camera-pod': {
    name: 'Nose Camera Pods (Position 2)',
    group: 'Sensors & Cameras',
    tier: 3,
    src: 'reg',
    spec: [
      ['Regulation', 'Article C8.16.7, RV-CAMERA-2'],
      ['Volume', 'XF -450 to -150 mm, Z 325 to ~490 mm'],
      ['Left side', 'Camera'],
      ['Right side', 'Lightweight housing of the same shape'],
    ],
    text: 'The two pods standing off the nose flanks just ahead of the front axle. The camera is on the left; the right carries a matching lightweight housing, or an FIA diagnostic camera when one is requested. Both must sit entirely inside RV-CAMERA-2, and the camera has to be aimed so its line of sight does not cross any part of the car ahead of it, which is why the pods stand out from the bodywork on stalks.',
  },

  'pitot-tube': {
    name: 'Pitot Tube',
    group: 'Sensors & Cameras',
    tier: 4,
    src: 'general',
    spec: [
      ['Measures', 'Airspeed and static pressure'],
      ['Used for', 'Correlating track data with wind tunnel and CFD'],
    ],
    text: 'Measures the speed and pressure of air ahead of the car, out where the flow has not yet been disturbed. It gives true airspeed rather than ground speed, so the team can separate a headwind from a genuine performance change, and it anchors the correlation between what the car does on track and what the wind tunnel and simulations predicted.',
  },

  'gps-aerial': {
    name: 'GPS and Timing Aerial',
    group: 'Sensors & Cameras',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Car position for timing, TV and race control'],
      ['Mandatory', 'Standard FIA equipment'],
    ],
    text: 'Standard FIA equipment feeding car position to timing, race control and the broadcast. It is what produces the live track map, the gaps on the timing screens, and the marshalling system that tells race control exactly which cars are in a yellow flag sector.',
  },

  'marshalling-display': {
    name: 'Marshalling Display',
    group: 'Driver Safety',
    tier: 4,
    src: 'general',
    spec: [
      ['Location', 'Cockpit, in the driver line of sight'],
      ['Shows', 'Flag status transmitted by race control'],
    ],
    text: 'A cockpit light repeating flag status directly from race control, so a driver knows about a yellow flag without having to spot a marshal post. It was introduced because at modern speeds, and with modern cockpit sight lines, relying on a driver seeing a waved flag at the right instant is not good enough.',
  },

  'tyre-temperature-sensor': {
    name: 'Infrared Tyre Temperature Sensor',
    group: 'Sensors & Cameras',
    tier: 4,
    src: 'general',
    spec: [
      ['Type', 'Infrared array'],
      ['Measures', 'Tread surface temperature across the width'],
    ],
    text: 'An infrared array aimed at the tread, reading surface temperature across the tyre width. The spread across the tyre tells engineers about camber and pressure: a tyre hotter on its inner shoulder than its outer is running too much negative camber for those conditions, and that is visible in the data long before it shows up in lap time.',
  },
};
