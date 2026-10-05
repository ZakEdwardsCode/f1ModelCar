// parts.js - the W17 annotation database, assembled from its two halves,
// plus car-level metadata and the provenance legend.

import { BODY_PARTS } from './parts-body.js';
import { MECH_PARTS } from './parts-mech.js';
import { EXTRA_PARTS } from './parts-extra.js';

export const PARTS = { ...BODY_PARTS, ...MECH_PARTS, ...EXTRA_PARTS };

/** Provenance legend. Shown on every part panel so nothing is presented as
 *  more certain than it is. */
export const SOURCES = {
  official: {
    label: 'Team specification',
    short: 'SPEC',
    detail: 'Published by Mercedes-AMG PETRONAS F1 Team for the W17.',
    colour: '#00d2be',
  },
  reg: {
    label: '2026 regulations',
    short: 'REG',
    detail: 'From the 2026 FIA technical regulations as published by the FIA and Formula 1.',
    colour: '#5b8dd9',
  },
  supplier: {
    label: 'Supplier data',
    short: 'SUPP',
    detail: 'Published by the named supplier: Brembo, Pirelli, OZ, Carbone Industries or PETRONAS.',
    colour: '#c9a227',
  },
  observed: {
    label: 'Published analysis',
    short: 'ANLY',
    detail: 'From published technical analysis of this specific car following its reveal.',
    colour: '#b06fd0',
  },
  general: {
    label: 'General F1 practice',
    short: 'GEN',
    detail: 'Established Formula 1 engineering practice. Not specific to the W17, and not a claim about this car in particular.',
    colour: '#8a929b',
  },
};

export const CAR = {
  id: 'w17',
  name: 'Mercedes-AMG F1 W17 E PERFORMANCE',
  shortName: 'W17',
  team: 'Mercedes-AMG PETRONAS Formula One Team',
  season: 2026,
  revealed: 'First images 22 January 2026, digital season launch 2 February 2026',
  drivers: [
    { number: 63, name: 'George Russell' },
    { number: 12, name: 'Kimi Antonelli' },
  ],
  people: [
    ['Technical Director', 'James Allison'],
    ['Deputy Technical Director', 'Simone Resta'],
    ['Car Design Director', 'John Owen'],
    ['Aerodynamics Director', 'Jarrod Murphy'],
    ['Performance Director', 'David Nelson'],
  ],
  headline: [
    ['Length', 'Under 5505 mm'],
    ['Width', '1900 mm'],
    ['Height', '970 mm'],
    ['Wheelbase', '3400 mm'],
    ['Weight', '772 kg'],
    ['Power unit', 'Mercedes-AMG F1 M17 E PERFORMANCE'],
    ['Displacement', '1.6 litres, V6 at 90 degrees'],
    ['Valves', '24'],
    ['Maximum ICE speed', '15,000 rpm'],
    ['Maximum turbo speed', '150,000 rpm'],
    ['MGU-K', '350 kW'],
    ['Energy store', '4.0 MJ usable'],
    ['Fuel flow', '3000 MJ per hour'],
    ['Gearbox', 'Eight forward, one reverse, carbon fibre case'],
    ['Fuel', 'PETRONAS Primax'],
    ['Lubricants', 'PETRONAS Syntium'],
    ['Tyres', 'Pirelli'],
    ['Wheels', 'OZ forged magnesium'],
    ['Brakes', 'Carbone Industries carbon / carbon, rear brake-by-wire'],
    ['Calipers', 'Brembo monobloc, nickel-plated aluminium'],
  ],
  intro:
    'The first Mercedes designed to the 2026 regulations: 200 mm shorter in wheelbase, 100 mm narrower and around 30 kg lighter than the car it replaces, with active front and rear wings in place of DRS and a power unit split roughly evenly between combustion and electrical power.',
};

/** Groups, in the order the browser lists them. */
export const GROUP_ORDER = [
  'Front Wing Assembly',
  'Nose & Front Structures',
  'Survival Cell & Cockpit',
  'Driver Safety',
  'Controls',
  'Bodywork',
  'Aerodynamics',
  'Floor & Underbody',
  'Rear Wing & Active Aero',
  'Rear Structures',
  'Front Suspension',
  'Rear Suspension',
  'Wheels & Tyres',
  'Braking System',
  'Internal Combustion Engine',
  'Turbocharging',
  'Hybrid & Electrical',
  'Fuel System',
  'Cooling System',
  'Transmission',
  'Sensors & Cameras',
  'Livery & Identity',
];

/** Named viewpoints offered in the UI. */
export const TOURS = [
  { id: 'overview', label: 'Whole car', part: null, pos: [4.6, 2.0, 5.2], target: [0, 0.45, 0.1] },
  { id: 'frontwing', label: 'Front wing', part: 'front-wing-second-element' },
  { id: 'livery', label: 'Livery', part: 'sidepod-stripe-panel' },
  { id: 'cockpit', label: 'Cockpit', part: 'steering-wheel' },
  { id: 'halo', label: 'Halo', part: 'halo' },
  { id: 'sidepod', label: 'Sidepod', part: 'sidepod-inlet' },
  { id: 'floor', label: 'Floor and diffuser', part: 'diffuser-strake' },
  { id: 'rearwing', label: 'Rear wing', part: 'rear-wing-flap-2' },
  { id: 'brakes', label: 'Front brakes', part: 'front-brake-disc' },
  { id: 'pu', label: 'Power unit', part: 'engine-block', cutaway: true },
  { id: 'hybrid', label: 'Hybrid system', part: 'mgu-k', cutaway: true },
  { id: 'gearbox', label: 'Transmission', part: 'gearbox-casing', cutaway: true },
];

export default PARTS;
