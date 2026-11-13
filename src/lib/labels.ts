import type { EncounterType, SceneKey, StatusCode } from '../types';

export const ENCOUNTER_LABELS: Record<EncounterType, { label: string; icon: string; hint: string }> = {
  'surface-landing': { label: 'Surface landing', icon: '⬇️', hint: 'The spacecraft came down to the surface in a controlled way.' },
  orbit: { label: 'Orbital exploration', icon: '🔄', hint: 'The spacecraft circled the world for a long time.' },
  flyby: { label: 'Flyby', icon: '↗️', hint: 'The spacecraft passed close by and kept going; it left nothing there.' },
  'atmospheric-entry': { label: 'Atmospheric entry', icon: '🔥', hint: 'The spacecraft or its probe entered the atmosphere.' },
  'surface-impact': { label: 'Surface impact', icon: '💥', hint: 'It struck the surface without a landing designed for survival.' },
};

export const STATUS_STYLE: Record<StatusCode, { label: string; tone: 'active' | 'silent' | 'destroyed' | 'returned' }> = {
  active: { label: 'Operating', tone: 'active' },
  'inactive-on-surface': { label: 'Silent on the surface', tone: 'silent' },
  'left-on-surface': { label: 'Left on the surface', tone: 'silent' },
  'partially-returned': { label: 'Partly returned to Earth', tone: 'returned' },
  destroyed: { label: 'No longer exists', tone: 'destroyed' },
};

export const CHAPTER_TITLES: Record<SceneKey, string> = {
  who: 'Who am I?',
  why: 'Why was I sent?',
  how: 'How did I work?',
  learn: 'What did I help scientists learn?',
  fate: 'What happened to me?',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Formats ISO-like dates (YYYY, YYYY-MM, YYYY-MM-DD). Other strings pass through. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not available';
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value.trim());
  if (!m) return value.replace('2018-11/12', 'November–December 2018');
  const [, y, mo, d] = m;
  if (!mo) return y;
  const month = MONTHS[Number(mo) - 1] ?? mo;
  if (!d) return `${month} ${y}`;
  return `${month} ${Number(d)}, ${y}`;
}

export const AGE_LABEL = { primary: 'ages 6–11', secondary: 'ages 12–18' } as const;
