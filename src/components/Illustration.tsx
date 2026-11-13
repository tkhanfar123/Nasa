import type { ReactElement } from 'react';
import type { IllustrationKey, SceneKey } from '../types';

/* Schematic spacecraft illustrations drawn for this project.
   They are clearly labelled as schematics wherever they appear. */

const T = '#2ec4b6'; // turquoise
const G = '#f4c95d'; // gold
const L = '#dfe7f2'; // light
const D = '#0b1a33'; // deep navy
const M = '#7d8fb0'; // muted

function Wheel({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={D} stroke={L} strokeWidth={3} />
      <circle cx={x} cy={y} r={r * 0.35} fill={M} />
    </g>
  );
}

function Ground() {
  return <path d="M0 196 Q80 186 160 194 T320 192 V220 H0 Z" fill="#1c2b4a" />;
}

const drawings: Record<IllustrationKey, ReactElement> = {
  'lunar-rover': (
    <g>
      <Ground />
      <rect x="70" y="142" width="180" height="18" rx="4" fill={M} stroke={L} strokeWidth={2} />
      <rect x="110" y="118" width="34" height="26" rx="4" fill={T} />
      <rect x="152" y="118" width="34" height="26" rx="4" fill={T} />
      <line x1="232" y1="142" x2="232" y2="78" stroke={L} strokeWidth={3} />
      <path d="M204 80 Q232 52 260 80 Z" fill={G} stroke={L} strokeWidth={2} />
      <rect x="78" y="122" width="22" height="16" rx="3" fill={G} />
      <line x1="89" y1="122" x2="89" y2="104" stroke={L} strokeWidth={3} />
      <Wheel x={92} y={172} r={18} />
      <Wheel x={228} y={172} r={18} />
    </g>
  ),
  surveyor: (
    <g>
      <Ground />
      <polygon points="160,70 112,150 208,150" fill="none" stroke={L} strokeWidth={4} />
      <line x1="112" y1="150" x2="84" y2="188" stroke={L} strokeWidth={4} />
      <line x1="208" y1="150" x2="236" y2="188" stroke={L} strokeWidth={4} />
      <line x1="160" y1="150" x2="160" y2="190" stroke={L} strokeWidth={4} />
      <ellipse cx="84" cy="190" rx="14" ry="4" fill={M} />
      <ellipse cx="236" cy="190" rx="14" ry="4" fill={M} />
      <ellipse cx="160" cy="192" rx="14" ry="4" fill={M} />
      <line x1="160" y1="70" x2="160" y2="30" stroke={L} strokeWidth={3} />
      <rect x="164" y="26" width="46" height="26" fill={T} stroke={L} strokeWidth={2} />
      <circle cx="140" cy="40" r="14" fill={G} />
      <path d="M200 140 L252 160 L262 182" fill="none" stroke={G} strokeWidth={4} />
      <rect x="254" y="178" width="16" height="10" rx="2" fill={G} />
      <rect x="132" y="112" width="20" height="18" fill={T} />
    </g>
  ),
  'small-rover': (
    <g>
      <Ground />
      <rect x="96" y="132" width="128" height="30" rx="5" fill={M} stroke={L} strokeWidth={2} />
      <rect x="90" y="120" width="140" height="12" fill={T} stroke={L} strokeWidth={2} />
      <line x1="110" y1="120" x2="110" y2="132" stroke={D} />
      <line x1="140" y1="120" x2="140" y2="132" stroke={D} />
      <line x1="170" y1="120" x2="170" y2="132" stroke={D} />
      <line x1="200" y1="120" x2="200" y2="132" stroke={D} />
      <rect x="222" y="140" width="12" height="12" fill={G} />
      <Wheel x={104} y={178} r={11} />
      <Wheel x={160} y={178} r={11} />
      <Wheel x={216} y={178} r={11} />
    </g>
  ),
  'mer-rover': (
    <g>
      <Ground />
      <path d="M50 120 L270 120 L250 136 L70 136 Z" fill={T} stroke={L} strokeWidth={2} />
      <rect x="110" y="136" width="100" height="26" rx="4" fill={M} stroke={L} strokeWidth={2} />
      <line x1="196" y1="120" x2="196" y2="62" stroke={L} strokeWidth={4} />
      <rect x="180" y="48" width="34" height="16" rx="4" fill={G} />
      <circle cx="188" cy="56" r="3" fill={D} />
      <circle cx="206" cy="56" r="3" fill={D} />
      <path d="M110 150 L84 164 L76 182" fill="none" stroke={G} strokeWidth={4} />
      <Wheel x={100} y={180} r={13} />
      <Wheel x={160} y={180} r={13} />
      <Wheel x={220} y={180} r={13} />
    </g>
  ),
  insight: (
    <g>
      <Ground />
      <polygon points="40,130 64,108 96,108 118,130 96,152 64,152" fill={T} stroke={L} strokeWidth={2} />
      <polygon points="202,130 226,108 258,108 280,130 258,152 226,152" fill={T} stroke={L} strokeWidth={2} />
      <rect x="118" y="118" width="84" height="26" rx="5" fill={M} stroke={L} strokeWidth={2} />
      <line x1="130" y1="144" x2="122" y2="188" stroke={L} strokeWidth={3} />
      <line x1="190" y1="144" x2="198" y2="188" stroke={L} strokeWidth={3} />
      <path d="M170 118 L188 84 L222 100" fill="none" stroke={G} strokeWidth={4} />
      <path d="M232 194 Q252 168 272 194 Z" fill={G} />
    </g>
  ),
  messenger: (
    <g>
      <rect x="128" y="86" width="64" height="58" rx="4" fill={M} stroke={L} strokeWidth={2} />
      <path d="M100 58 Q160 30 220 58 L220 70 Q160 44 100 70 Z" fill={L} stroke={G} strokeWidth={2} />
      <rect x="40" y="104" width="86" height="22" fill={T} stroke={L} strokeWidth={2} />
      <rect x="194" y="104" width="86" height="22" fill={T} stroke={L} strokeWidth={2} />
      <circle cx="160" cy="160" r="12" fill={G} />
      <circle cx="270" cy="36" r="18" fill={G} opacity={0.85} />
    </g>
  ),
  multiprobe: (
    <g>
      <rect x="120" y="54" width="80" height="44" rx="6" fill={M} stroke={L} strokeWidth={2} />
      <path d="M140 132 L180 132 L170 112 L150 112 Z" fill={G} stroke={L} strokeWidth={2} transform="translate(0 -6)" />
      <path d="M60 150 L84 150 L78 136 L66 136 Z" fill={T} stroke={L} strokeWidth={2} />
      <path d="M236 150 L260 150 L254 136 L242 136 Z" fill={T} stroke={L} strokeWidth={2} />
      <path d="M148 186 L172 186 L166 172 L154 172 Z" fill={T} stroke={L} strokeWidth={2} />
      <line x1="140" y1="98" x2="76" y2="134" stroke={L} strokeDasharray="4 6" />
      <line x1="180" y1="98" x2="248" y2="134" stroke={L} strokeDasharray="4 6" />
      <line x1="160" y1="124" x2="160" y2="170" stroke={L} strokeDasharray="4 6" />
    </g>
  ),
  galileo: (
    <g>
      <path d="M110 70 Q160 20 210 70 Z" fill={L} stroke={G} strokeWidth={2} />
      <line x1="160" y1="70" x2="160" y2="96" stroke={L} strokeWidth={4} />
      <rect x="136" y="96" width="48" height="40" rx="4" fill={M} stroke={L} strokeWidth={2} />
      <line x1="184" y1="112" x2="296" y2="96" stroke={L} strokeWidth={2} />
      <line x1="136" y1="112" x2="56" y2="134" stroke={L} strokeWidth={3} />
      <rect x="40" y="128" width="20" height="12" fill={G} />
      <path d="M148 168 L172 168 L166 150 L154 150 Z" fill={T} stroke={L} strokeWidth={2} />
    </g>
  ),
  cassini: (
    <g>
      <path d="M100 64 Q160 14 220 64 Z" fill={L} stroke={G} strokeWidth={2} />
      <rect x="134" y="64" width="52" height="96" rx="6" fill={M} stroke={L} strokeWidth={2} />
      <circle cx="204" cy="118" r="16" fill={G} stroke={L} strokeWidth={2} />
      <line x1="134" y1="90" x2="40" y2="58" stroke={L} strokeWidth={2} />
      <rect x="140" y="160" width="40" height="20" fill={T} />
    </g>
  ),
  voyager: (
    <g>
      <path d="M100 74 Q160 24 220 74 Z" fill={L} stroke={G} strokeWidth={2} />
      <polygon points="140,82 180,82 192,98 180,114 140,114 128,98" fill={M} stroke={L} strokeWidth={2} />
      <line x1="180" y1="98" x2="292" y2="150" stroke={L} strokeWidth={2} />
      <line x1="140" y1="98" x2="56" y2="138" stroke={L} strokeWidth={3} />
      <rect x="44" y="134" width="22" height="12" fill={G} />
      <line x1="160" y1="114" x2="160" y2="176" stroke={L} strokeWidth={2} />
      <rect x="150" y="160" width="20" height="24" rx="3" fill={T} />
    </g>
  ),
};

export function SpacecraftIllustration({
  kind,
  label,
  ghost = false,
  size = 'large',
}: {
  kind: IllustrationKey;
  label: string;
  ghost?: boolean;
  size?: 'large' | 'small';
}) {
  return (
    <svg
      className={`illustration ${ghost ? 'is-ghost' : ''} ${size}`}
      viewBox="0 0 320 220"
      role="img"
      aria-label={label}
    >
      <rect width="320" height="220" fill="#0e2142" />
      {[...Array(14)].map((_, i) => (
        <circle key={i} cx={(i * 73) % 320} cy={(i * 37) % 110} r={i % 3 === 0 ? 1.6 : 1} fill="#ffffff" opacity={0.6} />
      ))}
      {drawings[kind] ?? drawings['small-rover']}
    </svg>
  );
}

const sceneIcons: Record<SceneKey, ReactElement> = {
  who: (
    <g>
      <circle cx="40" cy="40" r="22" fill={T} />
      <circle cx="40" cy="34" r="8" fill={D} />
      <path d="M26 54 Q40 40 54 54" fill={D} />
    </g>
  ),
  why: (
    <g>
      <circle cx="40" cy="40" r="24" fill="none" stroke={G} strokeWidth={5} />
      <circle cx="40" cy="40" r="13" fill="none" stroke={T} strokeWidth={5} />
      <circle cx="40" cy="40" r="4" fill={G} />
    </g>
  ),
  how: (
    <g>
      <circle cx="40" cy="40" r="14" fill="none" stroke={T} strokeWidth={8} strokeDasharray="7 4" />
      <circle cx="40" cy="40" r="6" fill={G} />
    </g>
  ),
  learn: (
    <g>
      <path d="M40 14 a18 18 0 0 1 10 33 v7 h-20 v-7 a18 18 0 0 1 10 -33 z" fill={G} />
      <rect x="31" y="58" width="18" height="6" rx="2" fill={T} />
    </g>
  ),
  fate: (
    <g>
      <line x1="28" y1="14" x2="28" y2="66" stroke={L} strokeWidth={4} />
      <path d="M30 16 L58 24 L30 34 Z" fill={T} />
      <ellipse cx="40" cy="66" rx="24" ry="5" fill={M} />
    </g>
  ),
};

export function SceneIcon({ scene }: { scene: SceneKey }) {
  return (
    <svg className="scene-icon" viewBox="0 0 80 80" aria-hidden="true">
      {sceneIcons[scene]}
    </svg>
  );
}
