// Content registry. To add a story: create a JSON file in ./equipment
// following src/types.ts, then add it to the list below.
import type { Destination, Equipment } from '../types';
import destinationsJson from './destinations.json';
import apollo15Lrv from './equipment/apollo15-lrv.json';
import surveyor3 from './equipment/surveyor-3.json';
import sojourner from './equipment/sojourner.json';
import spirit from './equipment/spirit.json';
import opportunity from './equipment/opportunity.json';
import insight from './equipment/insight.json';
import messenger from './equipment/messenger.json';
import pioneerVenus2 from './equipment/pioneer-venus-2.json';
import galileo from './equipment/galileo.json';
import cassini from './equipment/cassini.json';
import voyager2 from './equipment/voyager-2.json';

export const destinations = (destinationsJson as unknown as Destination[])
  .slice()
  .sort((a, b) => a.order - b.order);

/** The six core stories come first, then the additional destinations. */
export const equipment: Equipment[] = [
  apollo15Lrv,
  surveyor3,
  sojourner,
  spirit,
  opportunity,
  insight,
  messenger,
  pioneerVenus2,
  galileo,
  cassini,
  voyager2,
] as unknown as Equipment[];

export const CORE_IDS = ['apollo15-lrv', 'surveyor-3', 'sojourner', 'spirit', 'opportunity', 'insight'];

export function getDestination(id: string | undefined): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

export function getEquipment(id: string | undefined): Equipment | undefined {
  return equipment.find((e) => e.id === id);
}

export function equipmentForDestination(destId: string): Equipment[] {
  return equipment.filter((e) => (e.destinations ?? []).some((d) => d.id === destId));
}
