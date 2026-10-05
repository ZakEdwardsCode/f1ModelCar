// parts-mech.js - annotations for suspension, wheels, brakes, power unit,
// energy systems and transmission. Same provenance tags as parts-body.js.

export const MECH_PARTS = {

  /* ================================================================== */
  /* FRONT SUSPENSION                                                   */
  /* ================================================================== */

  'front-upper-wishbone': {
    name: 'Front Upper Wishbone',
    group: 'Front Suspension',
    tier: 2,
    src: 'observed',
    spec: [
      ['Construction', 'Carbon fibre wishbone'],
      ['Geometry', 'Anti-dive, forward leg mounted higher'],
      ['Legs', 'Forward and rearward, meeting at the upright'],
    ],
    text: 'Mercedes list the front suspension as carbon fibre wishbone with pushrod-activated springs and dampers. Analysis of the W17 identified anti-dive geometry built into this upper wishbone, achieved by mounting the forward leg higher on the chassis than the rearward one. Under braking that inclination generates a force resisting the nose diving, which keeps the floor closer to its designed ride height when the car is decelerating hard, exactly when aerodynamic platform control matters most. The legs are also aerodynamic members, shaped to direct flow rather than simply carry load.',
  },

  'front-lower-wishbone': {
    name: 'Front Lower Wishbone',
    group: 'Front Suspension',
    tier: 2,
    src: 'official',
    spec: [
      ['Construction', 'Carbon fibre wishbone'],
      ['Carries', 'Pushrod pickup, main lateral loads'],
    ],
    text: 'The lower link controlling the bottom of the upright, and the member carrying the pushrod pickup. It takes the largest lateral loads of any suspension element under cornering. Like the upper wishbone it is carbon composite, which gives the stiffness required at a fraction of the mass of a steel equivalent, and it is shaped as an aerofoil because it sits in flow heading for the sidepod and floor.',
  },

  'front-pushrod': {
    name: 'Front Pushrod',
    group: 'Front Suspension',
    tier: 2,
    src: 'observed',
    spec: [
      ['Layout', 'Pushrod, carried over from the W16'],
      ['Action', 'Outboard low to inboard high, working a rocker'],
      ['Reason for choice', 'Lower mass for the same strength'],
    ],
    text: 'The W17 keeps pushrod actuation at both ends, carried over from the W16 rather than switching to pullrod. The reported reasoning is mass: a pushrod carries its load in compression and gives the same structural strength for less weight, which matters when the field is chasing a minimum weight limit that dropped to 768 kg for 2026. The rod runs from a low outboard pickup up to a rocker inside the chassis, converting wheel movement into rotation of the rocker.',
  },

  'front-track-rod': {
    name: 'Front Track Rod',
    group: 'Front Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Transmits steering movement to the upright'],
      ['Position', 'Height chosen to control bump steer'],
    ],
    text: 'The steering link between rack and upright. Its exact height is a significant geometry decision: place it wrong and the wheels steer themselves as the suspension moves, a behaviour called bump steer that makes a car feel unpredictable over kerbs and under braking. It is also positioned to work as an aerodynamic surface, since it sits in flow that ends up at the sidepod inlet.',
  },

  'front-upright': {
    name: 'Front Upright',
    group: 'Front Suspension',
    tier: 2,
    src: 'general',
    spec: [
      ['Material', 'Machined aluminium alloy or titanium'],
      ['Carries', 'Hub, bearings, brake caliper, steering arm'],
    ],
    text: 'The component every front corner load passes through. It holds the wheel bearings, carries the brake caliper, and provides the pickups for both wishbones, the pushrod and the track rod. It has to be extremely stiff, because any deflection here changes the wheel camber and toe under load, and it sits right next to a brake disc running at several hundred degrees.',
  },

  'front-wheel-hub': {
    name: 'Front Wheel Hub',
    group: 'Front Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Rotating interface between upright and wheel'],
      ['Retention', 'Single centre-lock nut'],
    ],
    text: 'The rotating assembly the wheel mounts to, running on bearings inside the upright. It has drive pegs that engage the wheel so torque is carried by the pegs rather than by friction from the nut alone, which is what allows a single centre nut to be safe. Hubs are life-limited items, replaced on a schedule regardless of apparent condition.',
  },

  'front-rocker': {
    name: 'Front Rocker',
    group: 'Front Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Converts pushrod motion to spring and damper travel'],
      ['Sets', 'Motion ratio between wheel and spring'],
    ],
    text: 'The bellcrank inside the chassis that the pushrod works against. It translates the rod pushing inward into rotation, which then compresses the torsion bar and moves the damper. Its geometry sets the motion ratio, and changing that ratio changes effective wheel rate without touching the spring, which is one of the levers engineers use to tune a car between circuits.',
  },

  'front-damper': {
    name: 'Front Damper',
    group: 'Front Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'Inboard, inside the chassis'],
      ['Adjustment', 'Bump and rebound, high and low speed'],
      ['Restriction', 'Active suspension remains banned'],
    ],
    text: 'Controls the rate at which the suspension moves, as distinct from how far it moves, which is the spring job. Dampers are tuned separately for low-speed movement, meaning body roll and pitch, and high-speed movement, meaning kerbs and surface bumps. They are mounted inboard where they are out of the airflow. Active suspension stays banned under the 2026 rules, so everything here is purely mechanical.',
  },

  'front-torsion-bar': {
    name: 'Front Torsion Bar',
    group: 'Front Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Type', 'Torsion bar in place of a coil spring'],
      ['Material', 'Typically titanium alloy'],
      ['Changed', 'To alter spring rate between sessions'],
    ],
    text: 'F1 cars use torsion bars rather than coil springs because a bar twisted along its length stores the same energy in a far smaller package, and packaging inside the chassis is desperately tight. Teams carry bars of different diameters and swap them to change spring rate, which is one of the main mechanical setup changes made between sessions.',
  },

  'front-anti-roll-bar': {
    name: 'Front Anti-Roll Bar',
    group: 'Front Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Links the two sides in roll only'],
      ['Effect', 'Shifts lateral load transfer balance front to rear'],
    ],
    text: 'Ties the left and right suspensions together so that they resist rolling against each other, without affecting what happens when both wheels move together. Stiffening the front bar relative to the rear pushes the car toward understeer and softening it toward oversteer, which makes the bars one of the most direct handling balance adjustments available.',
  },

  'front-heave-element': {
    name: 'Front Heave Element',
    group: 'Front Suspension',
    tier: 4,
    src: 'general',
    spec: [
      ['Responds to', 'Both wheels moving together'],
      ['Controls', 'Ride height under aerodynamic load'],
    ],
    text: 'A third spring and damper that only sees movement when both wheels move together, as they do when aerodynamic load compresses the car at speed. That separation lets engineers set a soft rate for kerbs and a stiff rate for aero load independently, which is the only way to keep a ground effect floor at a usable ride height without making the car undrivable over bumps.',
  },

  /* ================================================================== */
  /* REAR SUSPENSION                                                    */
  /* ================================================================== */

  'rear-upper-wishbone': {
    name: 'Rear Upper Wishbone',
    group: 'Rear Suspension',
    tier: 2,
    src: 'observed',
    spec: [
      ['Construction', 'Carbon fibre wishbone'],
      ['Geometry', 'Increased anti-lift'],
    ],
    text: 'Mercedes specify carbon fibre wishbones with pushrod-activated inboard springs and dampers at the rear. Analysis of the W17 noted increased anti-lift geometry here, resisting the rear of the car rising under braking. That is directly connected to the 2026 power unit: with the MGU-K harvesting at 350 kW through the rear axle, braking loads arrive at the rear suspension differently than before, described as producing more horizontal load rather than the torsional pattern of the previous generation.',
  },

  'rear-lower-wishbone': {
    name: 'Rear Lower Wishbone',
    group: 'Rear Suspension',
    tier: 2,
    src: 'official',
    spec: [
      ['Construction', 'Carbon fibre wishbone'],
      ['Mounting', 'Picks up on the gearbox casing'],
    ],
    text: 'The lower rear link, picking up on the gearbox casing rather than the survival cell. That is why the gearbox is a structural component on an F1 car: it carries the entire rear suspension and, through it, all the rear tyre loads plus the rear wing download.',
  },

  'rear-pushrod': {
    name: 'Rear Pushrod',
    group: 'Rear Suspension',
    tier: 2,
    src: 'official',
    spec: [
      ['Layout', 'Pushrod-activated inboard springs and dampers'],
      ['Carried over', 'From the W16'],
    ],
    text: 'The rear pushrod, working the inboard rockers on top of the gearbox. Mercedes retained the pushrod layout at both ends for the W17 where some rivals run pullrod at the rear, and the stated reasoning is the same: for equal strength, a compression member weighs less.',
  },

  'rear-toe-link': {
    name: 'Rear Toe Link',
    group: 'Rear Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Sets and holds rear wheel toe angle'],
      ['Adjusted', 'Setup change between sessions'],
    ],
    text: 'The rear equivalent of a track rod, except it does not steer: it holds the wheel at a fixed toe angle and stops it rotating about the upright under load. Small changes to rear toe have a large effect on stability under braking and on tyre temperature, so it is a routine setup adjustment.',
  },

  'rear-upright': {
    name: 'Rear Upright',
    group: 'Rear Suspension',
    tier: 2,
    src: 'general',
    spec: [
      ['Carries', 'Hub, bearings, caliper, driveshaft outer joint'],
      ['Environment', 'Adjacent to brake disc and exhaust heat'],
    ],
    text: 'Carries the rear hub and bearings, the brake caliper and the outer end of the driveshaft. It works in a harsher thermal environment than the front, sitting between brake heat, exhaust heat and the heat rejected by the rear brake ducts, while taking full traction and braking torque.',
  },

  'rear-rocker': {
    name: 'Rear Rocker',
    group: 'Rear Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'On top of the gearbox casing'],
    ],
    text: 'The rear bellcrank, mounted on top of the gearbox where it is out of the airflow feeding the rear wing and diffuser. Keeping the suspension hardware inboard and buried is as much an aerodynamic decision as a mechanical one.',
  },

  'rear-damper': {
    name: 'Rear Damper',
    group: 'Rear Suspension',
    tier: 3,
    src: 'official',
    spec: [
      ['Location', 'Inboard'],
      ['Tuning', 'Traction and rear platform control'],
    ],
    text: 'Rear damping is tuned around traction: a rear that settles too slowly out of a slow corner will spin the inside wheel, while one that is too stiff skates over bumps and loses grip. With a 350 kW electrical contribution available on corner exit, the traction demands on the 2026 rear end are considerable.',
  },

  'rear-anti-roll-bar': {
    name: 'Rear Anti-Roll Bar',
    group: 'Rear Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Controls rear roll stiffness'],
    ],
    text: 'Sets how much the rear resists roll relative to the front. It is the other half of the balance adjustment made at the front bar: engineers choose the pair together, because only the ratio between them determines handling balance.',
  },

  'driveshaft': {
    name: 'Driveshaft',
    group: 'Rear Suspension',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Transmits torque from differential to wheel'],
      ['Joints', 'Plunging constant-velocity joints at both ends'],
      ['Also carries', 'Regenerative braking torque'],
    ],
    text: 'Takes drive from the differential to the wheel through joints that both articulate and slide, since the distance changes as the suspension moves. On a 2026 car the driveshaft works in both directions far harder than before: under braking the MGU-K harvests up to 350 kW back through this same path, so the shaft sees substantial reverse torque on every corner entry.',
  },

  /* ================================================================== */
  /* WHEELS AND TYRES                                                   */
  /* ================================================================== */

  'front-tyre': {
    name: 'Front Tyre',
    group: 'Wheels & Tyres',
    tier: 1,
    src: 'supplier',
    spec: [
      ['Supplier', 'Pirelli'],
      ['Tread width', '280 mm, reduced 25 mm for 2026'],
      ['Diameter', 'Reduced 15 mm for 2026'],
      ['Dry range', 'P Zero, compounds C1 to C5'],
      ['Wet', 'Cinturato intermediate and full wet'],
    ],
    text: 'The only part of the car that touches the road, and the component every other system is ultimately serving. For 2026 the fronts are 25 mm narrower and 15 mm smaller in diameter, part of the overall reduction in car size. The dry range runs from C1 to C5, with the very soft C6 introduced in 2025 dropped for this season. Getting a tyre into its working temperature window, and keeping it there, is frequently the difference between a competitive car and an uncompetitive one.',
  },

  'rear-tyre': {
    name: 'Rear Tyre',
    group: 'Wheels & Tyres',
    tier: 1,
    src: 'supplier',
    spec: [
      ['Supplier', 'Pirelli'],
      ['Tread width', '375 mm, reduced 30 mm for 2026'],
      ['Diameter', 'Reduced 10 mm for 2026'],
      ['Set mass saving', 'About 5 kg per set versus 2025'],
    ],
    text: 'The rears lose 30 mm of width for 2026, the larger of the two reductions, and about 5 kg comes off a complete set. That mass matters twice over: it counts against the minimum weight, and it is unsprung and rotating, so reducing it improves how quickly the suspension can respond and how quickly the car changes direction. The rears have to handle both the traction demands of a 50/50 hybrid power unit and the regenerative braking torque coming back through the axle.',
  },

  'front-wheel-rim': {
    name: 'Front Wheel Rim',
    group: 'Wheels & Tyres',
    tier: 2,
    src: 'official',
    spec: [
      ['Supplier and material', 'OZ forged magnesium'],
      ['Diameter', '18 inch, retained for 2026'],
    ],
    text: 'Mercedes specify OZ forged magnesium wheels. Magnesium is used because it is the lightest structural metal available, and every gram saved here is unsprung and rotating, which is the most valuable place on a car to remove mass. Forging rather than casting aligns the grain structure and gives far better fatigue strength. The 18-inch diameter introduced in 2022 carries over unchanged into 2026.',
  },

  'rear-wheel-rim': {
    name: 'Rear Wheel Rim',
    group: 'Wheels & Tyres',
    tier: 2,
    src: 'official',
    spec: [
      ['Supplier and material', 'OZ forged magnesium'],
      ['Diameter', '18 inch'],
      ['Width', 'Wider than front, matching the 375 mm tyre'],
    ],
    text: 'Same construction as the front but wider, to carry the 375 mm rear tyre. Rim design also matters thermally: the rim is a large metal mass in direct contact with the tyre bead, so how heat moves out of the brakes and into or away from the rim affects tyre temperature, and teams manage that deliberately.',
  },

  'wheel-cover': {
    name: 'Wheel Cover',
    group: 'Wheels & Tyres',
    tier: 3,
    src: 'general',
    spec: [
      ['Mandated', 'Since 2022'],
      ['Purpose', 'Prevents aerodynamic exploitation of the wheel face'],
    ],
    text: 'Mandatory covers over the wheel face, introduced in 2022. Before them, teams used elaborate blown axles and rim designs to control the wake coming off a rotating wheel, which was a significant performance area and one of the things that made cars so hard to follow. Standardising the face removed that avenue entirely.',
  },

  'wheel-spoke': {
    name: 'Wheel Spoke',
    group: 'Wheels & Tyres',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Carries load between rim barrel and centre'],
    ],
    text: 'Connects the rim barrel to the centre. Spoke design is a pure structural optimisation within the constraints of the standardised outer face: carry the cornering and braking loads, survive kerb strikes, weigh as little as possible.',
  },

  'wheel-nut': {
    name: 'Centre-Lock Wheel Nut',
    group: 'Wheels & Tyres',
    tier: 3,
    src: 'general',
    spec: [
      ['Type', 'Single centre-lock'],
      ['Tool', 'Pneumatic wheel gun'],
      ['Pit stop', 'Removed and refitted in under a second'],
    ],
    text: 'A single nut retains each wheel. During a pit stop a mechanic engages a pneumatic gun, spins the nut off, another removes the wheel, a third fits the new one, and the gun spins the nut back on and torques it, all in well under a second per corner. The nut is captive in the wheel so it cannot be dropped, and sensors confirm to the lollipop system that every corner is properly torqued before the car is released.',
  },

  'wheel-nut-retainer': {
    name: 'Wheel Nut Retainer',
    group: 'Wheels & Tyres',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Keeps the nut captive in the wheel'],
    ],
    text: 'Holds the nut in the wheel so it cannot fall out when the wheel is off the car. It exists because a dropped wheel nut in a pit box costs several seconds to find, and because a wheel leaving a car at speed is one of the most dangerous failures in the sport.',
  },

  'tyre-valve': {
    name: 'Tyre Inflation Valve',
    group: 'Wheels & Tyres',
    tier: 4,
    src: 'general',
    spec: [
      ['Gas', 'Nitrogen rather than air'],
      ['Pressure', 'Minimum set by Pirelli for each event'],
    ],
    text: 'Tyres are filled with dry nitrogen, not air, because nitrogen carries no moisture and so its pressure rises far more predictably as the tyre heats. Pirelli set minimum starting pressures for every event and the FIA checks them, since running below the specified pressure would give more grip while overloading the carcass.',
  },

  /* ================================================================== */
  /* BRAKING SYSTEM                                                     */
  /* ================================================================== */

  'front-brake-disc': {
    name: 'Front Brake Disc',
    group: 'Braking System',
    tier: 1,
    src: 'supplier',
    spec: [
      ['Supplier', 'Carbone Industries carbon / carbon'],
      ['Diameter 2026', '330 mm minimum, up to 345 mm permitted'],
      ['Thickness', '34 mm, up from 32 mm'],
      ['Cooling holes', 'About 1,440 at 2.5 mm, in a linear pattern'],
      ['Previous generation', 'About 1,050 holes at 3 mm, honeycomb pattern'],
    ],
    text: 'Carbon-carbon composite: carbon fibre in a carbon matrix, a material that works better as it gets hotter and is useless when cold. For 2026 the front discs grew in both diameter and thickness, and the drilling changed substantially, going from roughly 1,050 three-millimetre holes in a honeycomb layout to around 1,440 holes of 2.5 mm arranged linearly. Those holes are not decoration: they are the cooling system, hugely increasing the surface area through which the disc sheds heat. The 2026 discs got larger because the braking task changed, with a 350 kW MGU-K now recovering energy at the same time the friction brakes are working.',
  },

  'rear-brake-disc': {
    name: 'Rear Brake Disc',
    group: 'Braking System',
    tier: 2,
    src: 'supplier',
    spec: [
      ['Diameter', '260 mm minimum, 280 mm maximum'],
      ['Thickness', '34 mm maximum, up from 32 mm'],
      ['Hole diameter', '2.5 mm minimum, reduced from 3 mm'],
      ['Control', 'Rear brake-by-wire'],
    ],
    text: 'The rear discs can now be run smaller, with a minimum of 260 mm, because the MGU-K takes a far larger share of the rear braking effort than the 120 kW unit it replaces. Less friction braking at the rear means less heat, which means a smaller disc, which means less weight and less aerodynamic blockage. The rules still require the rear brakes to produce 2,500 Nm per wheel without any power unit assistance, so the friction system must be able to stop the car entirely on its own if the hybrid system fails.',
  },

  'front-brake-caliper': {
    name: 'Front Brake Caliper',
    group: 'Braking System',
    tier: 2,
    src: 'official',
    spec: [
      ['Supplier', 'Brembo monobloc'],
      ['Material', 'Nickel-plated aluminium alloy, machined from solid'],
      ['Pistons permitted 2026', 'Up to eight, previously up to six'],
      ['Pads permitted', 'Up to four'],
      ['Mounting points', 'Up to three'],
    ],
    text: 'Mercedes specify Brembo monobloc calipers in nickel-plated aluminium alloy machined from solid block. Monobloc means the body is cut from one piece of metal rather than bolted together from halves, which makes it far stiffer: any flex in a caliper goes into pedal travel instead of into clamping the disc. For 2026 the rules allow up to eight pistons and four pads, more than before, letting Brembo spread clamping load more evenly over a larger pad area.',
  },

  'rear-brake-caliper': {
    name: 'Rear Brake Caliper',
    group: 'Braking System',
    tier: 3,
    src: 'supplier',
    spec: [
      ['Maximum pressure', '150 bar'],
      ['Control', 'Rear brake-by-wire'],
      ['Hydraulic limit', 'No more than 1.2 times driver-applied pressure'],
    ],
    text: 'The rear caliper is regulated more tightly than the front because the rear brakes are blended electronically with energy recovery. Rear line pressure is capped at 150 bar, and the system may not multiply the driver input by more than 1.2 times, which prevents brake-by-wire being used as a hidden performance device rather than a blending tool.',
  },

  'brake-caliper-piston': {
    name: 'Brake Caliper Piston',
    group: 'Braking System',
    tier: 4,
    src: 'supplier',
    spec: [
      ['Count per caliper', 'Up to eight from 2026'],
      ['Function', 'Converts hydraulic pressure into pad clamping force'],
    ],
    text: 'Hydraulic pressure acts on these pistons to squeeze the pads against the disc. More, smaller pistons spread the load more evenly across a long pad, which keeps pad wear uniform and stops the centre of the pad doing all the work. The allowance went up to eight for 2026.',
  },

  'brake-pad': {
    name: 'Brake Pad',
    group: 'Braking System',
    tier: 3,
    src: 'official',
    spec: [
      ['Material', 'Carbon, matched to the carbon disc'],
      ['Supplier', 'Carbone Industries'],
      ['Working temperature', 'Only effective when hot'],
    ],
    text: 'Carbon pads running against carbon discs, both from Carbone Industries. The pairing is deliberate: matching materials means the friction coefficient behaves predictably as temperature climbs. Cold carbon brakes barely work at all, which is why drivers weave on formation and out-laps, and why the first braking event of any stint is the one most likely to be missed.',
  },

  'brake-disc-bell': {
    name: 'Brake Disc Bell',
    group: 'Braking System',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Mounts the disc to the hub'],
      ['Requirement', 'Allows thermal expansion of the disc'],
    ],
    text: 'The hat connecting disc to hub. It has to let the disc grow as it heats through several hundred degrees without either binding or rattling, so the drive is taken through a floating arrangement rather than rigid bolts. It also acts as a thermal barrier, limiting how much brake heat reaches the hub bearings.',
  },

  'front-brake-duct': {
    name: 'Front Brake Duct',
    group: 'Braking System',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Feeds cooling air to disc and caliper'],
      ['Configuration', 'Changed for circuit and ambient conditions'],
    ],
    text: 'Directs air onto the disc and caliper. Teams size the ducts for each circuit, because too little cooling destroys the brakes and too much keeps them below their working temperature while adding drag. Ducts also influence tyre temperature through the rim, which teams use deliberately to manage tyre warm-up.',
  },

  'front-brake-duct-fence': {
    name: 'Brake Duct End Fence',
    group: 'Braking System',
    tier: 3,
    src: 'observed',
    spec: [
      ['W17 feature', 'No conventional front inlet scoop'],
      ['Cooling path', 'Air captured between fence and tyre sidewall'],
    ],
    text: 'On the W17 this is more interesting than it looks. Technical analysis noted that the car runs no conventional front brake duct inlet scoop: cooling air appears to be captured entirely in the gap between this end fence and the tyre sidewall. Removing the scoop removes a blunt object from the flow around the front wheel, so the fence is doing an aerodynamic job and a cooling job at once.',
  },

  'rear-brake-duct': {
    name: 'Rear Brake Duct',
    group: 'Braking System',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Cools rear disc and caliper'],
      ['2026 note', 'Reduced friction braking heat at the rear'],
    ],
    text: 'Cools the rear brakes, which have an easier thermal job in 2026 than they used to because the MGU-K is taking a much larger share of the retardation. Less heat to reject means smaller ducts, and smaller ducts mean less drag and cleaner flow toward the diffuser.',
  },

  'rear-brake-duct-fence': {
    name: 'Rear Brake Duct End Fence',
    group: 'Braking System',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Contains duct flow, shapes wheel wake'],
    ],
    text: 'Contains the duct flow and shapes the wake coming off the rear wheel before it reaches the diffuser exit. Like the front, it is a component the regulations treat carefully because brake ducts sit in one of the most aerodynamically valuable regions on the car.',
  },

  /* ================================================================== */
  /* INTERNAL COMBUSTION ENGINE                                         */
  /* ================================================================== */

  'engine-block': {
    name: 'Engine Block',
    group: 'Internal Combustion Engine',
    tier: 1,
    src: 'official',
    spec: [
      ['Power unit', 'Mercedes-AMG F1 M17 E PERFORMANCE'],
      ['Displacement', '1.6 litres'],
      ['Configuration', 'Six cylinders at 90 degree bank angle'],
      ['Maximum ICE speed', '15,000 rpm'],
      ['Split with electrical', 'Approximately 50:50'],
      ['Role', 'Fully structural member of the car'],
    ],
    text: 'The M17 E PERFORMANCE is a 1.6-litre V6 with a 90-degree included angle between the banks, running to 15,000 rpm. It is a stressed member: the survival cell bolts to its front face and the gearbox to its rear, so the block is part of the car primary structure and carries suspension and aerodynamic loads through itself. The headline change for 2026 is the balance of the package. Where the outgoing unit was roughly 80:20 between combustion and electrical power, the M17 is close to 50:50, and total peak output stays above 700 kW.',
  },

  'cylinder-bank': {
    name: 'Cylinder Bank',
    group: 'Internal Combustion Engine',
    tier: 2,
    src: 'official',
    spec: [
      ['Cylinders', 'Six, three per bank'],
      ['Bank angle', '90 degrees'],
      ['Valves', '24 in total'],
    ],
    text: 'Three cylinders per bank, six in total, set at 90 degrees. The wide angle lowers the centre of gravity and leaves a large vee between the banks for the inlet plenum and turbo plumbing. The engine runs direct injection at very high pressure into the cylinder, which is what makes the lean, high-efficiency combustion of a modern F1 engine possible.',
  },

  'cylinder-head': {
    name: 'Cylinder Head',
    group: 'Internal Combustion Engine',
    tier: 2,
    src: 'official',
    spec: [
      ['Valves', '24 total, four per cylinder'],
      ['Valve actuation', 'Pneumatic return, not metal springs'],
    ],
    text: 'Four valves per cylinder, 24 across the engine, as listed in the car specification. The valves are closed by compressed nitrogen rather than metal springs, because at 15,000 rpm a conventional spring cannot close a valve fast enough and will float. The pneumatic system is why an F1 car carries a small high-pressure gas bottle, and why running out of that gas ends an engine.',
  },

  'camshaft-cover': {
    name: 'Camshaft Cover',
    group: 'Internal Combustion Engine',
    tier: 4,
    src: 'general',
    spec: [
      ['Covers', 'Camshafts and valve train'],
    ],
    text: 'Encloses the camshafts and valve gear, sealing in oil and the pneumatic valve system. The covers are also structural to a degree, since a modern F1 engine uses almost every part of its external surface to carry some load.',
  },

  'crankshaft': {
    name: 'Crankshaft',
    group: 'Internal Combustion Engine',
    tier: 3,
    src: 'general',
    spec: [
      ['Maximum speed', '15,000 rpm'],
      ['Also drives', 'MGU-K through a gear train'],
    ],
    text: 'Converts the reciprocating motion of six pistons into rotation, at up to 15,000 rpm. On a hybrid power unit it has a second job: the MGU-K is geared to the crankshaft, so this shaft carries both the combustion torque outward and up to 350 kW of electrical torque in either direction, adding power on deployment and absorbing it during recovery.',
  },

  'oil-sump': {
    name: 'Oil Sump',
    group: 'Internal Combustion Engine',
    tier: 4,
    src: 'official',
    spec: [
      ['Lubricant', 'PETRONAS Syntium'],
      ['System', 'Dry sump'],
    ],
    text: 'F1 engines run a dry sump: oil is scavenged out of the engine by pumps into a separate tank rather than sitting in a pan under the crankshaft. That lets the engine be mounted lower, and it stops oil surging away from the pickup under the enormous lateral loads of a corner. Mercedes run PETRONAS Syntium lubricants, developed alongside the power unit itself.',
  },

  'inlet-plenum': {
    name: 'Inlet Plenum',
    group: 'Internal Combustion Engine',
    tier: 3,
    src: 'general',
    spec: [
      ['Location', 'In the vee between the banks'],
      ['Fed by', 'Airbox and turbocharger compressor'],
    ],
    text: 'The pressurised chamber sitting in the vee, holding a reservoir of compressed air so that each cylinder gets a consistent charge as the inlet valves open in sequence. Its volume is tuned against engine speed: get it right and pressure waves inside the plenum help fill the cylinders, get it wrong and they fight the process.',
  },

  'inlet-trumpet': {
    name: 'Inlet Trumpet',
    group: 'Internal Combustion Engine',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Tuned inlet tract into each cylinder'],
      ['Shape', 'Bell mouth to keep flow attached'],
    ],
    text: 'The bell mouth at the entry to each inlet tract. Its flared shape lets air turn into the port without separating, and its length tunes the pressure wave that arrives back at the valve. Length is a compromise across the rev range, chosen for where the engine actually spends its time.',
  },

  'fuel-injector': {
    name: 'Fuel Injector',
    group: 'Internal Combustion Engine',
    tier: 4,
    src: 'general',
    spec: [
      ['Type', 'Direct injection into the cylinder'],
      ['Pressure', 'Very high, regulated maximum'],
    ],
    text: 'Sprays fuel straight into the combustion chamber at extremely high pressure, with timing controlled to within fractions of a crank degree. Direct injection at these pressures is the foundation of the lean, pre-chamber-assisted combustion that made this generation of F1 engine the most thermally efficient road-relevant engine ever raced.',
  },

  'fuel-rail': {
    name: 'Fuel Rail',
    group: 'Internal Combustion Engine',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Distributes high-pressure fuel to the injectors'],
    ],
    text: 'The manifold holding high-pressure fuel ready for each injector to draw from, keeping supply pressure stable as injectors fire in sequence thousands of times a second.',
  },

  'exhaust-primary': {
    name: 'Exhaust Primary',
    group: 'Internal Combustion Engine',
    tier: 3,
    src: 'general',
    spec: [
      ['Material', 'Nickel alloy such as Inconel'],
      ['Feeds', 'Turbine'],
      ['Design factor', 'Equal length for even pulse timing'],
    ],
    text: 'The individual pipes from each cylinder, collecting into the turbine feed. They are made of nickel superalloy because ordinary steel would not survive the temperatures, and they are routed to equal lengths so exhaust pulses arrive at the turbine evenly spaced. Uneven pulses would make the turbo surge and the engine lose response.',
  },

  /* ================================================================== */
  /* TURBOCHARGING                                                      */
  /* ================================================================== */

  'turbine': {
    name: 'Turbine',
    group: 'Turbocharging',
    tier: 2,
    src: 'official',
    spec: [
      ['Maximum turbo speed', '150,000 rpm'],
      ['Driven by', 'Exhaust gas'],
      ['2026 change', 'No MGU-H on the shaft'],
    ],
    text: 'Exhaust gas spins the turbine, which drives the compressor through a common shaft at up to 150,000 rpm. The defining 2026 change is what is no longer here: the MGU-H, the motor generator that used to sit on this shaft harvesting surplus energy and spinning the turbo up to eliminate lag. It was removed from the rules because it was extraordinarily complex, expensive, and had no application outside racing, and its absence was one of the main reasons new manufacturers were willing to enter the sport for 2026.',
  },

  'compressor': {
    name: 'Compressor',
    group: 'Turbocharging',
    tier: 3,
    src: 'general',
    spec: [
      ['Driven by', 'Turbine, via the shared shaft'],
      ['Output', 'Compressed charge air to the intercooler'],
    ],
    text: 'Compresses incoming air so that far more oxygen fits into each cylinder than atmospheric pressure would allow. Without an MGU-H to spin it up electrically, response now depends on turbine sizing and on the MGU-K filling the torque gap while boost builds, which is a different engineering problem from the one teams solved for the previous generation.',
  },

  'turbo-shaft': {
    name: 'Turbo Shaft',
    group: 'Turbocharging',
    tier: 4,
    src: 'official',
    spec: [
      ['Maximum speed', '150,000 rpm'],
      ['2026', 'Carries no motor generator'],
    ],
    text: 'Connects turbine to compressor, turning at up to 150,000 rpm, around 2,500 revolutions every second. For 2026 it is a plain shaft again: with the MGU-H gone there is no motor generator between the two wheels, which simplifies the bearing and cooling problem considerably.',
  },

  'turbine-housing': {
    name: 'Turbine Housing',
    group: 'Turbocharging',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Directs exhaust gas into the turbine wheel'],
      ['Insulation', 'Gold heat-reflective shielding'],
    ],
    text: 'The scroll guiding exhaust gas onto the turbine blades. It runs hot enough that surrounding components need reflective shielding, which is why gold foil appears around this area: gold is an exceptionally good reflector of infrared radiation, and a very thin layer is enough.',
  },

  'wastegate': {
    name: 'Wastegate',
    group: 'Turbocharging',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Bypasses exhaust gas around the turbine'],
      ['2026 workload', 'Higher without an MGU-H'],
    ],
    text: 'A valve that lets exhaust gas bypass the turbine when the engine does not need more boost. It works harder on a 2026 power unit than on its predecessor, because there is no longer an MGU-H able to absorb surplus turbine energy and convert it into electricity instead of simply dumping it.',
  },

  'charge-air-pipe': {
    name: 'Charge Air Pipe',
    group: 'Turbocharging',
    tier: 4,
    src: 'general',
    spec: [
      ['Route', 'Compressor to intercooler to plenum'],
    ],
    text: 'Carries compressed air from the compressor forward to the intercooler and back to the plenum. The pipework volume is a real performance factor: a large volume takes longer to pressurise, so every unnecessary litre between compressor and inlet valve shows up as throttle lag.',
  },

  'plenum-feed-duct': {
    name: 'Plenum Feed Duct',
    group: 'Turbocharging',
    tier: 4,
    src: 'general',
    spec: [
      ['Route', 'Airbox to compressor inlet'],
    ],
    text: 'Takes air from the airbox above the driver down to the compressor inlet. On the W17 the way this duct feeds down behind the airbox was noted as being notably shorter and slimmer than the previous car.',
  },

  /* ================================================================== */
  /* HYBRID AND ELECTRICAL                                              */
  /* ================================================================== */

  'mgu-k': {
    name: 'MGU-K',
    group: 'Hybrid & Electrical',
    tier: 1,
    src: 'official',
    spec: [
      ['Power 2026', '350 kW'],
      ['Power 2025', '120 kW'],
      ['Energy recovered per lap', '9 MJ, up from 2 MJ'],
      ['Role', 'Sole recovery device after the MGU-H was removed'],
      ['Overtaking allowance', 'Additional 0.5 MJ within one second of a rival'],
      ['Full deployment', 'Up to 337 km/h for the attacking car'],
    ],
    text: 'The Motor Generator Unit - Kinetic, and the single biggest change on the 2026 car. Its output nearly triples from 120 kW to 350 kW, and with the MGU-H gone it is now the only device recovering energy, harvesting under braking through the rear axle. Energy recovered per lap rises from 2 MJ to 9 MJ. It also delivers the sport replacement for DRS: a driver within one second of the car ahead unlocks an extra 0.5 MJ and keeps full 350 kW deployment up to 337 km/h, where the car in front cannot. The engineering challenge was fitting roughly three times the power into a unit that could not be three times larger or heavier.',
  },

  'mgu-k-stator': {
    name: 'MGU-K Stator',
    group: 'Hybrid & Electrical',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Stationary windings of the motor generator'],
      ['Design driver', 'Power density'],
    ],
    text: 'The stationary windings. Tripling output without tripling size or mass came down to power density: better magnetic materials, better winding geometry and much more aggressive cooling. This is the part that gets hot, and the reason a 2026 car needs a dedicated electrical system cooler that its predecessor did not.',
  },

  'mgu-k-drive-gear': {
    name: 'MGU-K Drive Gear',
    group: 'Hybrid & Electrical',
    tier: 4,
    src: 'general',
    spec: [
      ['Connects', 'MGU-K to the crankshaft'],
      ['Torque direction', 'Both, deploying and harvesting'],
    ],
    text: 'Couples the motor generator to the crankshaft. Torque passes both ways through these gears, adding drive on deployment and absorbing it during recovery, and at 350 kW the loads are roughly three times what the equivalent gear train carried on the previous power unit.',
  },

  'energy-store': {
    name: 'Energy Store',
    group: 'Hybrid & Electrical',
    tier: 1,
    src: 'official',
    spec: [
      ['Usable capacity', '4.0 MJ'],
      ['Location', 'Low in the survival cell, beneath the fuel cell'],
      ['Cycled per lap', 'Recovers up to 9 MJ'],
    ],
    text: 'The battery, listed at 4.0 MJ usable. Note the gap between that and the 9 MJ recovered per lap: the store is not a reservoir that fills once and drains, it is cycled repeatedly around the circuit, charging under braking and discharging on the exits. It sits as low and as central as possible because it is one of the heaviest single items on the car, so its position dominates the centre of gravity. Under a 50:50 hybrid split, managing its state of charge across a lap is now a core part of both driver and strategy work.',
  },

  'battery-cell-module': {
    name: 'Battery Cell Module',
    group: 'Hybrid & Electrical',
    tier: 3,
    src: 'general',
    spec: [
      ['Construction', 'Lithium-ion cells in modules'],
      ['Requirement', 'Very high power density, tight thermal control'],
    ],
    text: 'Individual cell modules making up the store. An F1 battery is optimised for power rather than capacity: it must accept and release energy extremely fast, many times a lap, which is a different design problem from a road car battery built to hold as much energy as possible. Cell temperature has to be held in a narrow band, because cells that get hot lose both power and life.',
  },

  'inverter': {
    name: 'Inverter',
    group: 'Hybrid & Electrical',
    tier: 3,
    src: 'general',
    spec: [
      ['Function', 'Converts between DC store and AC motor'],
      ['2026 demand', 'Must handle 350 kW in both directions'],
    ],
    text: 'Converts the direct current of the battery into the alternating current the motor generator needs, and back again during recovery. It has to handle 350 kW flowing in both directions with very low losses, because every percent lost here becomes heat that the cooling system has to reject. Inverter efficiency is one of the quieter but more decisive areas of 2026 power unit performance.',
  },

  'control-electronics': {
    name: 'Control Electronics',
    group: 'Hybrid & Electrical',
    tier: 2,
    src: 'general',
    spec: [
      ['ECU', 'Standard FIA-homologated unit, common to all teams'],
      ['Controls', 'Engine, energy deployment, gearshift, differential'],
    ],
    text: 'The brain of the car. The core electronic control unit is a standard part, identical across the grid and homologated by the FIA, which is how the governing body verifies that nobody is running illegal driver aids such as traction control. Teams write their own software within it. On a 2026 car its most demanding job is deciding, continuously, how to split the power demand between combustion and electrical sources.',
  },

  'high-voltage-cable': {
    name: 'High Voltage Cable',
    group: 'Hybrid & Electrical',
    tier: 4,
    src: 'general',
    spec: [
      ['Marking', 'Orange, by convention'],
      ['Safety', 'Isolated by the electrical cut-off'],
    ],
    text: 'Carries high voltage between the store, the inverter and the motor generator. Marked in orange by convention so that anyone working on or recovering the car can identify it instantly. Marshals are trained never to touch a car until the high-voltage system is confirmed isolated, and the status lights on the car exist for exactly that reason.',
  },

  /* ================================================================== */
  /* FUEL SYSTEM                                                        */
  /* ================================================================== */

  'fuel-cell': {
    name: 'Fuel Cell',
    group: 'Fuel System',
    tier: 2,
    src: 'official',
    spec: [
      ['Fuel', 'PETRONAS Primax, advanced sustainable fuel'],
      ['Fuel flow limit 2026', '3,000 megajoules per hour'],
      ['Approximate mass flow', 'About 75 kg/h, down from 100 kg/h'],
      ['Construction', 'Flexible rubber bladder inside the survival cell'],
    ],
    text: 'Not a rigid tank but a flexible Kevlar-reinforced rubber bladder inside the survival cell, built to deform rather than split in an impact. It sits directly behind the driver, the most protected volume on the car. The fuel itself is fully sustainable for 2026, made from sources such as non-food biomass, municipal waste or captured carbon. The regulation change underneath is subtle and important: fuel is now limited by energy rather than mass, at 3,000 MJ per hour, so a team that develops a more energy-dense fuel cannot simply burn more of it.',
  },

  'fuel-collector': {
    name: 'Fuel Collector',
    group: 'Fuel System',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Guarantees pickup under cornering loads'],
    ],
    text: 'A small reservoir kept full so the engine never loses fuel pressure when the bladder contents surge under lateral load. Without it, a car low on fuel could starve in a long corner, which was a routine problem in earlier eras of the sport.',
  },

  'high-pressure-fuel-pump': {
    name: 'High Pressure Fuel Pump',
    group: 'Fuel System',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Raises fuel to direct injection pressure'],
      ['Drive', 'Mechanically driven off the engine'],
    ],
    text: 'Raises fuel from feed pressure to the very high pressure direct injection requires. It is driven mechanically by the engine, and it absorbs a genuinely measurable amount of power to do its job.',
  },

  'refuelling-connector': {
    name: 'Fuel Filler Connector',
    group: 'Fuel System',
    tier: 4,
    src: 'general',
    spec: [
      ['Used', 'Before the race only'],
      ['Refuelling in races', 'Banned since 2010'],
    ],
    text: 'Refuelling during a race has been banned since 2010, so this connector is used only to fill the car before it goes out. That ban is why races are run with a full fuel load from the start, and why fuel saving is a routine part of race management rather than something teams solve with an extra stop.',
  },

  /* ================================================================== */
  /* COOLING                                                            */
  /* ================================================================== */

  'water-radiator': {
    name: 'Water Radiator',
    group: 'Cooling System',
    tier: 2,
    src: 'general',
    spec: [
      ['Location', 'Both sidepods'],
      ['Cools', 'Internal combustion engine coolant'],
    ],
    text: 'The main engine coolant radiators, one in each sidepod. Sizing them is a season-long compromise: they must cope with the hottest race of the year, yet every extra square centimetre of core costs drag at every other race. Teams often run reduced cooling in cooler conditions by blanking part of the inlet.',
  },

  'charge-air-cooler': {
    name: 'Charge Air Cooler',
    group: 'Cooling System',
    tier: 3,
    src: 'general',
    spec: [
      ['Cools', 'Compressed intake air before the plenum'],
      ['Benefit', 'Denser charge, lower knock risk'],
    ],
    text: 'Compressing air heats it, and hot air is less dense and far more prone to detonation. The intercooler removes that heat between compressor and plenum, so each cylinder receives a denser charge and the engine can run more aggressive timing without knocking.',
  },

  'ers-cooler': {
    name: 'ERS Cooler',
    group: 'Cooling System',
    tier: 2,
    src: 'general',
    spec: [
      ['Cools', 'MGU-K, inverter and energy store'],
      ['2026 significance', 'Far greater heat load than 2025'],
    ],
    text: 'A dedicated cooling circuit for the electrical system, and one of the defining packaging problems of the 2026 car. A 350 kW motor generator, its inverter and a battery being cycled hard reject far more heat than the 120 kW system they replace. Every watt of inefficiency in that chain becomes heat, and every extra cooling surface costs aerodynamic performance, so this circuit is a major reason 2026 cars look the way they do.',
  },

  'oil-cooler': {
    name: 'Oil Cooler',
    group: 'Cooling System',
    tier: 4,
    src: 'general',
    spec: [
      ['Cools', 'Engine and gearbox lubricant'],
      ['Lubricant', 'PETRONAS Syntium'],
    ],
    text: 'Oil does more than lubricate: it is a significant part of how heat leaves the engine internals, particularly from the pistons and bearings. Oil temperature is held in a tight band, because oil that is too cool is thick and wastes power, while oil that is too hot stops protecting the surfaces it separates.',
  },

  'water-pump': {
    name: 'Water Pump',
    group: 'Cooling System',
    tier: 4,
    src: 'general',
    spec: [
      ['Drive', 'Mechanically driven by the engine'],
    ],
    text: 'Circulates coolant between engine and radiators. It is driven off the engine, so its flow rate rises with engine speed, which conveniently matches the moments when heat rejection is highest.',
  },

  'coolant-header-tank': {
    name: 'Coolant Header Tank',
    group: 'Cooling System',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Accommodates expansion, separates air'],
    ],
    text: 'Takes up the expansion of coolant as it heats and separates air from the system. Air in a cooling circuit creates hot spots where there is no liquid contact, which is why the system is filled and bled carefully rather than simply topped up.',
  },

  /* ================================================================== */
  /* TRANSMISSION                                                       */
  /* ================================================================== */

  'gearbox-casing': {
    name: 'Gearbox Casing',
    group: 'Transmission',
    tier: 1,
    src: 'official',
    spec: [
      ['Gears', 'Eight speed forward, one reverse'],
      ['Construction', 'Carbon fibre main case'],
      ['Selection', 'Sequential, semi-automatic, hydraulic activation'],
      ['Structural role', 'Carries rear suspension and rear wing loads'],
    ],
    text: 'Mercedes specify eight forward speeds and one reverse in a carbon fibre main case. Carbon rather than metal saves considerable weight, but the case is fully structural: the rear suspension mounts to it and the rear wing loads pass through it, so it must stay rigid while containing gears at operating temperature. Reverse is required by the regulations even though it is almost never used, because a driver must be able to reverse out of a run-off area unaided.',
  },

  'gear-cluster': {
    name: 'Gear Cluster',
    group: 'Transmission',
    tier: 3,
    src: 'general',
    spec: [
      ['Ratios', 'Eight forward'],
      ['Homologation', 'Ratios fixed for the season'],
    ],
    text: 'The eight forward ratios. Teams must nominate their ratios and then use them all season, so the set is a compromise chosen against the whole calendar rather than tuned circuit by circuit. Gears are cut from hardened steel with tooth profiles designed to survive shifts measured in milliseconds without the engine torque ever being fully interrupted.',
  },

  'clutch': {
    name: 'Clutch',
    group: 'Transmission',
    tier: 3,
    src: 'official',
    spec: [
      ['Type', 'Carbon plate'],
      ['Diameter', 'Small, to reduce inertia'],
      ['Used', 'Standing starts and pit lane launches only'],
    ],
    text: 'A multi-plate carbon clutch, listed in the car specification simply as carbon plate. It is tiny by road car standards because a small diameter means low rotational inertia and faster engine response, and it can be small because it only needs to work fully at a standing start. Everywhere else the gearbox shifts without it.',
  },

  'differential': {
    name: 'Differential',
    group: 'Transmission',
    tier: 2,
    src: 'general',
    spec: [
      ['Type', 'Limited slip'],
      ['Adjustable', 'From the steering wheel, corner by corner'],
    ],
    text: 'Allows the rear wheels to turn at different speeds in a corner while still driving both. Its locking behaviour is adjustable from the cockpit, and drivers change it constantly: more locking gives traction on exit but resists turning in, less helps the car rotate but spins the inside wheel. Different settings for entry, mid-corner and exit are one of the reasons a modern steering wheel has so many rotaries on it.',
  },

  'selector-barrel': {
    name: 'Selector Barrel',
    group: 'Transmission',
    tier: 4,
    src: 'general',
    spec: [
      ['Function', 'Translates rotation into gear selection'],
      ['Actuation', 'Hydraulic'],
    ],
    text: 'A rotating drum with machined tracks that push selector forks as it turns, which is what makes the gearbox sequential: the barrel can only move to an adjacent position, so gears must be taken in order. A hydraulic actuator indexes it on each paddle pull.',
  },

  'hydraulic-accumulator': {
    name: 'Hydraulic Accumulator',
    group: 'Transmission',
    tier: 4,
    src: 'general',
    spec: [
      ['Stores', 'Pressurised hydraulic fluid'],
      ['Serves', 'Gearshift, differential, clutch, power steering'],
    ],
    text: 'Holds pressurised fluid ready for instant use. Gearshifts and differential changes need large flows for a few milliseconds, far faster than a pump could supply on demand, so the accumulator stores pressure between events. A hydraulic failure on an F1 car typically takes the gearshift, differential and power steering with it at once, which is why it usually means retirement.',
  },

  'gearbox-bellhousing': {
    name: 'Gearbox Bellhousing',
    group: 'Transmission',
    tier: 4,
    src: 'general',
    spec: [
      ['Joins', 'Engine rear face to gearbox'],
    ],
    text: 'The junction between engine and gearbox, and one of the most important structural joints on the car. Every load reaching the rear suspension and rear wing passes through this interface on its way into the engine and then the survival cell.',
  },
};
