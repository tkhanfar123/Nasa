import { useState } from 'react';
import { destinations, equipmentForDestination } from '../content';
import { href, navigate } from '../lib/router';
import type { Destination } from '../types';
import { ENCOUNTER_LABELS } from '../lib/labels';

// Schematic x-positions (the Sun is on the left). NOT to scale.
const X: Record<string, number> = {
  mercury: 138,
  venus: 208,
  earth: 288,
  mars: 372,
  jupiter: 490,
  saturn: 620,
  uranus: 746,
  neptune: 864,
};
const SUN_X = -60;
const Y = 190;

function position(d: Destination): { x: number; y: number } {
  if (d.id === 'moon') return { x: X.earth + 30, y: Y - 40 };
  return { x: X[d.id] ?? 0, y: Y };
}

const plural = (n: number) => `${n} ${n === 1 ? 'story' : 'stories'}`;

export function SolarMap() {
  const [focus, setFocus] = useState<string | null>(null);
  const earth = { x: X.earth, y: Y };
  const focused = destinations.find((d) => d.id === focus && !d.isStart);

  return (
    <div className="solar-map">
      <p className="schematic-note" id="map-note">
        <strong>Note:</strong> sizes and distances on this map are <strong>schematic</strong>, for illustration only — not to scale.
      </p>
      <div className="map-scroll">
        <svg viewBox="0 0 1000 330" role="group" aria-labelledby="map-title" aria-describedby="map-note">
          <title id="map-title">Schematic map of the Solar System: the Sun on the left, the eight planets and the Moon</title>
          <defs>
            <radialGradient id="sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="60%" stopColor="#f4c95d" />
              <stop offset="100%" stopColor="#e08a1e" />
            </radialGradient>
          </defs>
          {Object.entries(X).map(([id, x]) => (
            <circle key={id} cx={SUN_X} cy={Y} r={x - SUN_X} fill="none" stroke="#2a3d66" strokeWidth={1} strokeDasharray="2 6" />
          ))}
          <circle cx={SUN_X} cy={Y} r={110} fill="url(#sun)" />
          <text x={24} y={Y + 5} className="map-label sun" textAnchor="middle">Sun</text>

          {focused && (
            <path
              className="journey-line"
              d={`M${earth.x} ${earth.y} Q ${(earth.x + position(focused).x) / 2} ${Y - 120} ${position(focused).x} ${position(focused).y}`}
              fill="none"
            />
          )}

          {destinations.map((d) => {
            const { x, y } = position(d);
            const count = equipmentForDestination(d.id).length;
            const isMoon = d.id === 'moon';
            const label = `${d.name}${d.isStart ? ' — starting point' : ''}${count ? ` — ${plural(count)}` : ''}`;
            return (
              <a
                key={d.id}
                href={href({ name: 'destination', id: d.id })}
                className={`planet ${d.isStart ? 'is-start' : ''} ${focus === d.id ? 'is-focus' : ''}`}
                aria-label={label}
                onMouseEnter={() => setFocus(d.id)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(d.id)}
                onBlur={() => setFocus(null)}
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ name: 'destination', id: d.id });
                }}
              >
                {d.id === 'saturn' && (
                  <ellipse cx={x} cy={y} rx={d.schematicRadius * 1.9} ry={d.schematicRadius * 0.55} fill="none" stroke="#e3cf8f" strokeWidth={3} opacity={0.8} />
                )}
                <circle className="planet-hit" cx={x} cy={y} r={Math.max(d.schematicRadius + 10, 22)} fill="transparent" />
                <circle className="planet-body" cx={x} cy={y} r={d.schematicRadius} fill={d.color} />
                {d.isStart && <circle cx={x} cy={y} r={d.schematicRadius + 7} fill="none" stroke="#2ec4b6" strokeWidth={2} strokeDasharray="4 3" />}
                {count > 0 && (
                  <g aria-hidden="true">
                    <circle cx={x + d.schematicRadius * 0.75} cy={y - d.schematicRadius * 0.75 - 4} r={9} fill="#f4c95d" />
                    <text x={x + d.schematicRadius * 0.75} y={y - d.schematicRadius * 0.75} className="map-count" textAnchor="middle">
                      {count}
                    </text>
                  </g>
                )}
                <text x={isMoon ? x + 4 : x} y={isMoon ? y - 22 : y + d.schematicRadius + 26} className="map-label" textAnchor="middle" aria-hidden="true">
                  {d.name}
                </text>
                {d.isStart && (
                  <text x={x} y={y + d.schematicRadius + 46} className="map-label start" textAnchor="middle" aria-hidden="true">
                    Start here
                  </text>
                )}
              </a>
            );
          })}
        </svg>
      </div>
      <p className="map-hint">Click a planet or the Moon, or use the list below. The gold number = number of stories.</p>
    </div>
  );
}

export function DestinationList() {
  return (
    <section aria-labelledby="dest-list-title" className="dest-list">
      <h2 id="dest-list-title">Destination list (map alternative)</h2>
      <ol>
        {destinations.map((d) => {
          const items = equipmentForDestination(d.id);
          const types = Array.from(new Set(items.flatMap((e) => e.destinations.find((x) => x.id === d.id)?.encounterTypes ?? [])));
          return (
            <li key={d.id}>
              <a href={href({ name: 'destination', id: d.id })} className="dest-row">
                <span className="dot" style={{ background: d.color }} aria-hidden="true" />
                <span className="dest-names">
                  <strong>{d.name}</strong>
                  <span className="kind">{d.kind}</span>
                </span>
                <span className="dest-meta">
                  {d.isStart ? 'Starting point' : items.length ? plural(items.length) : 'No stories yet'}
                  {types.length > 0 && <span className="types"> · {types.map((t) => ENCOUNTER_LABELS[t].label).join(', ')}</span>}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
