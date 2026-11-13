// Checks the editable JSON content for structural mistakes.
// Run: npm run validate:content
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');
const destinations = JSON.parse(fs.readFileSync(path.join(root, 'destinations.json'), 'utf8'));
const destIds = new Set(destinations.map((d) => d.id));
const dir = path.join(root, 'equipment');
const ENC = new Set(['surface-landing', 'orbit', 'flyby', 'atmospheric-entry', 'surface-impact']);
const STATUS = new Set(['active', 'inactive-on-surface', 'partially-returned', 'left-on-surface', 'destroyed']);
const KEYS = ['who', 'why', 'how', 'learn', 'fate'];
const REQUIRED = [
  'id', 'name', 'mission', 'equipmentType', 'destinations', 'encounterType', 'launchDate', 'arrivalDate',
  'lastContactDate', 'missionEndDate', 'status', 'finalFate', 'location', 'instruments', 'discoveries', 'timeline',
  'primaryStory', 'secondaryStory', 'primaryActivity', 'secondaryActivity', 'imageUrl', 'imageCredit', 'imageSourceUrl',
  'factSources', 'lastReviewedAt',
];
const words = (s) => s.split(/\s+/).filter((w) => /[؀-ۿA-Za-z0-9]/.test(w)).length;
const dateOk = (d) => d === null || /^\d{4}(-\d{2}(-\d{2})?)?$/.test(d);

let errors = 0;
let warnings = 0;
const err = (f, m) => { errors++; console.error(`✗ ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.warn(`! ${f}: ${m}`); };

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  for (const k of REQUIRED) if (!(k in r)) err(file, `missing field "${k}" (use null if unknown)`);
  for (const d of r.destinations ?? []) {
    if (!destIds.has(d.id)) err(file, `unknown destination "${d.id}"`);
    for (const t of d.encounterTypes ?? []) if (!ENC.has(t)) err(file, `bad encounter type "${t}"`);
  }
  if (r.status && !STATUS.has(r.status.code)) err(file, `bad status code "${r.status.code}"`);
  for (const k of ['launchDate', 'arrivalDate', 'lastContactDate', 'missionEndDate', 'lastReviewedAt']) {
    if (k in r && !dateOk(r[k])) err(file, `${k} must be YYYY, YYYY-MM, YYYY-MM-DD or null`);
  }
  for (const [name, min, max] of [['primaryStory', 80, 130], ['secondaryStory', 180, 250]]) {
    const s = r[name];
    if (!s) { warn(file, `${name} is null`); continue; }
    const keys = s.chapters.map((c) => c.key).join(',');
    if (keys !== KEYS.join(',')) err(file, `${name} chapters must be ${KEYS.join(',')} (got ${keys})`);
    const n = words(s.chapters.map((c) => c.text).join(' '));
    if (n < min || n > max) warn(file, `${name} has ${n} words (target ${min}–${max})`);
  }
  for (const [name, n] of [['primaryActivity', 2], ['secondaryActivity', 3]]) {
    const a = r[name];
    if (!a) { warn(file, `${name} is null`); continue; }
    if ((a.questions ?? []).length !== n) err(file, `${name} needs ${n} questions`);
    const qs = [...(a.questions ?? []), ...(a.task ? [a.task] : [])];
    for (const q of qs) if (q.correctIndex < 0 || q.correctIndex >= q.options.length) err(file, `correctIndex out of range in "${q.q}"`);
    if (name === 'primaryActivity' && !['matching', 'sequencing'].includes(a.type)) err(file, 'primary activity must be matching or sequencing');
    if (name === 'secondaryActivity' && a.type !== 'observation') err(file, 'secondary activity must be observation');
  }
  if (!r.factSources?.length) err(file, 'no fact sources');
  if (r.encounterType?.includes('flyby') && r.encounterType.length === 1 && r.status?.code !== 'active' && r.location?.coordinates) {
    warn(file, 'flyby-only record has surface coordinates');
  }
}
console.log(`\n${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
