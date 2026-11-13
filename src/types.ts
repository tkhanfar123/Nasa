// Content types for Explorer Echoes. All content lives in src/content/*.json.
// Any field may be null or missing; the interface must degrade gracefully.

export type AgeGroup = 'primary' | 'secondary';

export type EncounterType =
  | 'surface-landing'
  | 'orbit'
  | 'flyby'
  | 'atmospheric-entry'
  | 'surface-impact';

export type StatusCode =
  | 'active'
  | 'inactive-on-surface'
  | 'partially-returned'
  | 'left-on-surface'
  | 'destroyed';

export type IllustrationKey =
  | 'lunar-rover'
  | 'surveyor'
  | 'small-rover'
  | 'mer-rover'
  | 'insight'
  | 'messenger'
  | 'multiprobe'
  | 'galileo'
  | 'cassini'
  | 'voyager';

export type SceneKey = 'who' | 'why' | 'how' | 'learn' | 'fate';

export interface Destination {
  id: string;
  name: string;
  kind: string;
  order: number;
  color: string;
  schematicRadius: number;
  isStart?: boolean;
  primary: string;
  secondary: string;
}

export interface DestinationLink {
  id: string;
  encounterTypes: EncounterType[];
  note?: string | null;
}

export interface Chapter {
  key: SceneKey;
  text: string;
}

export interface GlossaryItem {
  term: string;
  meaning: string;
}

export interface Story {
  chapters: Chapter[];
  glossary?: GlossaryItem[];
}

export interface Question {
  q: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MatchingActivity {
  type: 'matching';
  title: string;
  instructions: string;
  pairs: { left: string; right: string }[];
  questions: Question[];
}

export interface SequencingActivity {
  type: 'sequencing';
  title: string;
  instructions: string;
  /** Items in the CORRECT order. The interface shuffles them. */
  items: string[];
  questions: Question[];
}

export interface ObservationActivity {
  type: 'observation';
  title: string;
  instructions: string;
  /** "sourced" = simplified from cited sources; "example" = invented educational numbers. */
  dataKind: 'sourced' | 'example';
  dataNote: string;
  table: { headers: string[]; rows: string[][] };
  task: Question;
  questions: Question[];
}

export type Activity = MatchingActivity | SequencingActivity | ObservationActivity;

export interface Instrument {
  name: string;
  role: string;
}

export interface Spotlight {
  title: string;
  howItWorks: string;
  knowledge: string;
}

export interface Discovery {
  text: string;
  kind: 'outcome' | 'interpretation';
}

export interface TimelineEvent {
  date: string;
  text: string;
}

export interface FactSource {
  title: string;
  publisher: string;
  url: string;
  primary: boolean;
  supports: string;
}

export interface Equipment {
  id: string;
  name: string;
  mission: { name: string; partners?: string[] | null };
  equipmentType: string;
  illustration: IllustrationKey;
  destinations: DestinationLink[];
  encounterType: EncounterType[];
  launchDate: string | null;
  arrivalDate: string | null;
  lastContactDate: string | null;
  missionEndDate: string | null;
  dateNotes?: string[] | null;
  status: { code: StatusCode; text: string };
  finalFate: string | null;
  location: {
    description: string | null;
    coordinates: { lat: number; lon: number; kind: string } | null;
  } | null;
  instruments: Instrument[];
  spotlight: { primary: Spotlight; secondary: Spotlight } | null;
  engineeringChallenge: { challenge: string; solution: string } | null;
  discoveries: Discovery[];
  timeline: TimelineEvent[];
  primaryStory: Story | null;
  secondaryStory: Story | null;
  primaryActivity: Activity | null;
  secondaryActivity: Activity | null;
  badge: { name: string; emoji: string } | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageCredit: string | null;
  imageSourceUrl: string | null;
  factSources: FactSource[];
  lastReviewedAt: string | null;
  verificationNotes?: string[] | null;
}
