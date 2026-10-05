// parts-extra.js - annotations for the rebuilt 2026 front wing, the livery
// and the remaining bodywork details. Same provenance tags as parts-body.js.

export const EXTRA_PARTS = {

  /* ================================================================== */
  /* FRONT WING - 2026 ARCHITECTURE                                     */
  /* ================================================================== */

  'front-wing-second-element': {
    name: 'Front Wing Second Plane',
    group: 'Front Wing Assembly',
    tier: 1,
    src: 'observed',
    spec: [
      ['Status on the W17', 'Fixed, does not rotate'],
      ['Carries', 'Both front wing support pylons'],
      ['Rivals', 'Most teams mount pylons on the mainplane'],
      ['Consequence', 'Only the third plane is active'],
    ],
    text: 'This is the element that makes the W17 front wing unlike anything else on the 2026 grid. Almost every rival bolts the support pylons to the mainplane and then rotates two elements for active aero. Mercedes attaches the pylons here, to the second of the three permitted planes, which pins this element in place and leaves only the third plane free to move. The second plane therefore runs at a fixed incidence chosen differently from its rivals, and the pylon position opens a channel under the nose that feeds air back to the underfloor and the T-tray. Aston Martin took the same basic route with the AMR26.',
  },

  'front-wing-upper-flap': {
    name: 'Front Wing Upper Flap (Outboard)',
    group: 'Front Wing Assembly',
    tier: 1,
    src: 'observed',
    movable: true,
    spec: [
      ['Status', 'The only movable front surface on this car'],
      ['Corner mode', 'Closed, maximum camber'],
      ['Straight mode', 'Flattened, low drag'],
      ['Panels', 'Two, one each side of a static centre section'],
    ],
    text: 'The outboard panels of the third plane, and the only part of the front of this car that moves. Because the pylons pin the second plane, all of the front-end active aero authority has to come from here. Published analysis of the W17 notes that the flap carries a central panel which stays static throughout, so the rotating sections are the outboard spans either side of it. Drivers use straight-line mode on any straight worth the change, not only when attacking, because it is an efficiency device before it is an overtaking one.',
  },

  'front-wing-upper-flap-centre': {
    name: 'Upper Flap Static Centre Panel',
    group: 'Front Wing Assembly',
    tier: 2,
    src: 'observed',
    spec: [
      ['Status', 'Static, does not rotate'],
      ['Location', 'Centre span of the third plane'],
    ],
    text: 'A section in the middle of the upper flap that stays put while the panels either side of it rotate. Analysis of the car after its reveal picked this out as a Mercedes-specific detail. Leaving the centre fixed keeps the flow feeding the nose underside and the car centreline stable no matter which aero mode the driver has selected, so the balance shift between modes is smaller than it would otherwise be.',
  },

  'front-wing-strake': {
    name: 'Front Wing Strake',
    group: 'Front Wing Assembly',
    tier: 3,
    src: 'observed',
    spec: [
      ['Location', 'Standing on the footplate, under the wing'],
      ['Function', 'Seeds vortices that steer the front tyre wake'],
    ],
    text: 'Vertical fins beneath the wing, standing on the footplate. They shed controlled vortices that help steer the front tyre wake outboard and keep the flow under the wing attached. They vary noticeably between 2026 cars, and Alpine drew attention for exposing theirs rather than shrouding it.',
  },

  'front-wing-diveplane': {
    name: 'Endplate Diveplane',
    group: 'Front Wing Assembly',
    tier: 4,
    src: 'general',
    spec: [
      ['Location', 'Outer face of the endplate'],
      ['Function', 'Adds local load and turns flow around the tyre'],
    ],
    text: 'A small horizontal vane on the outer face of the endplate. It makes a little extra front downforce, but its more useful job is throwing a vortex outboard that helps the wake pass cleanly around the rotating front tyre. Teams differ widely in how they arrange these for 2026, and there is no common approach across the grid.',
  },

  /* ================================================================== */
  /* NOSE                                                               */
  /* ================================================================== */

  'nose-underfloor-channel': {
    name: 'Nose Underfloor Channel',
    group: 'Nose & Front Structures',
    tier: 2,
    src: 'observed',
    spec: [
      ['Created by', 'Mounting the pylons on the second plane'],
      ['Feeds', 'The underfloor and the T-tray area'],
    ],
    text: 'The path moulded into the lower part of the nose. Published analysis of the W17 describes the pylon placement as being chosen specifically to open this channel, directing airflow back toward the underfloor and all the way to the T-tray. A conventional mainplane-mounted pylon would sit in the middle of this path and spoil it. This is the payoff Mercedes bought in exchange for giving up one of its two movable front elements.',
  },

  't-tray-vane': {
    name: 'T-Tray Vane',
    group: 'Floor & Underbody',
    tier: 3,
    src: 'observed',
    spec: [
      ['Location', 'Under the nose, ahead of the floor'],
      ['Function', 'Conditions flow entering the underfloor'],
    ],
    text: 'Small appendages under the nose where it meets the leading edge of the floor. Analysis of the W17 notes vanes here dedicated to managing the direction and quality of the airflow arriving from the nose channel. Whatever reaches the floor in poor condition cannot be recovered further back, so this handful of small surfaces has an effect out of proportion to its size.',
  },

  /* ================================================================== */
  /* BODYWORK                                                           */
  /* ================================================================== */

  'sidepod-stripe-panel': {
    name: 'Sidepod Stripe Panel',
    group: 'Livery & Identity',
    tier: 2,
    src: 'observed',
    spec: [
      ['Design', 'Silver and black striped detail'],
      ['Location', 'Top surface of both sidepods'],
      ['Reception', 'Drew mixed reaction at the reveal'],
    ],
    text: 'The striped detail across the top of the sidepods, and the most talked-about part of the 2026 livery when the car was shown on 22 January. Mercedes kept its black base with silver and Petronas turquoise accents, then added this striped treatment on the sidepod tops. Reaction among fans was divided, though the combination of a silver nose against black flanks drew praise for bringing the Silver Arrows identity back to the front of the car.',
  },

  'car-number': {
    name: 'Car Number',
    group: 'Livery & Identity',
    tier: 2,
    src: 'official',
    spec: [
      ['Car 12', 'Kimi Antonelli'],
      ['Car 63', 'George Russell'],
      ['Carried on', 'Shark fin and nose flanks'],
      ['Requirement', 'Must be clearly legible to officials and broadcast'],
    ],
    text: 'The race number, shown here as 12 for Kimi Antonelli. Numbers are placed where they can be read from a helicopter and from trackside, which is why the shark fin carries the largest one. Drivers choose a permanent number when they enter Formula 1 and keep it for their career, with 1 reserved for the reigning champion. Antonelli took a maiden win at the Chinese Grand Prix in this car, becoming the youngest driver to take pole, win and fastest lap at the same event.',
  },

  'sponsor-marking': {
    name: 'Sponsor Marking',
    group: 'Livery & Identity',
    tier: 3,
    src: 'observed',
    spec: [
      ['Title partner', 'PETRONAS'],
      ['Airbox 2026', 'Microsoft, replacing Ineos'],
      ['Fuel and lubricants', 'PETRONAS Primax and Syntium'],
    ],
    text: 'Partner identification across the bodywork. PETRONAS is more than a decal here: the fuel and lubricants are developed with the team and are named in the car specification, and for 2026 that means a fully sustainable fuel. The most visible change to the 2026 car is on the airbox, where Microsoft replaced Ineos.',
  },

  'team-marque': {
    name: 'Three-Pointed Star',
    group: 'Livery & Identity',
    tier: 3,
    src: 'observed',
    spec: [
      ['Location', 'Nose crown'],
      ['2026', 'Flattened, minimalist redesign'],
    ],
    text: 'The Mercedes marque on the nose. For 2026 the team moved to a flatter, more minimal treatment of its identity across the car and its branding, in keeping with a livery that leans on a silver nose against black flanks rather than on heavy detailing.',
  },

  /* ================================================================== */
  /* DRIVER                                                             */
  /* ================================================================== */

  'driver-torso': {
    name: 'Driver Seating Position',
    group: 'Driver Safety',
    tier: 2,
    src: 'general',
    spec: [
      ['Posture', 'Reclined, legs raised ahead of the hips'],
      ['Seat', 'Moulded to the individual driver'],
      ['Minimum weight', 'Driver and seat are weighed together'],
    ],
    text: 'Shown as a plain form to set the scale of the cockpit. An F1 driver lies almost flat with their feet above their hips, which is why the survival cell is deep at the cockpit and shallow ahead of it. The seat is moulded around the individual driver and lifts out with them in an extraction. Driver and seat have a combined minimum weight, so lighter drivers carry ballast rather than gaining an advantage.',
  },
};
