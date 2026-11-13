import { useState } from 'react';
import { CORE_IDS, destinations, equipment, equipmentForDestination, getDestination, getEquipment } from '../content';
import { ENCOUNTER_LABELS, STATUS_STYLE, formatDate } from '../lib/labels';
import { useProgress } from '../lib/progress';
import { href, navigate } from '../lib/router';
import type { AgeGroup } from '../types';
import { SpacecraftIllustration } from './Illustration';
import { DestinationList, SolarMap } from './SolarMap';

export function AgeChoice({ compact = false }: { compact?: boolean }) {
  const { age, setAge } = useProgress();
  const choose = (a: AgeGroup) => {
    setAge(a);
    if (!compact) navigate({ name: 'map' });
  };
  return (
    <div className={`age-choice ${compact ? 'compact' : ''}`} role="group" aria-label="Choose your age group">
      <button type="button" className={`age-card ${age === 'primary' ? 'is-on' : ''}`} aria-pressed={age === 'primary'} onClick={() => choose('primary')}>
        <span className="age-emoji" aria-hidden="true">🧒</span>
        <span className="age-title">Young Explorer</span>
        <span className="age-range">Ages 6–11</span>
        {!compact && <span className="age-desc">Short stories in illustrated scenes, explained words, matching and ordering games.</span>}
      </button>
      <button type="button" className={`age-card ${age === 'secondary' ? 'is-on' : ''}`} aria-pressed={age === 'secondary'} onClick={() => choose('secondary')}>
        <span className="age-emoji" aria-hidden="true">🧑‍🚀</span>
        <span className="age-title">Research Explorer</span>
        <span className="age-range">Ages 12–18</span>
        {!compact && <span className="age-desc">Deeper stories, engineering challenges, instruments and measurements, and evidence reasoning.</span>}
      </button>
    </div>
  );
}

export function HomePage() {
  const { age } = useProgress();
  return (
    <div className="home">
      <section className="hero-intro">
        <h1 tabIndex={-1} id="page-title">
          Explorer Echoes
        </h1>
        <p className="lead">
          Spacecraft and equipment that NASA sent to the Moon, Mars and other planets tell you their own stories: why they were sent, how they worked, what we learned from them, and what happened to them. Abandoned — but not forgotten.
        </p>
      </section>
      <section aria-labelledby="choose-title" className="card">
        <h2 id="choose-title">{age ? 'Change your age group or continue' : 'Start: choose your age group'}</h2>
        <p className="muted">No account and no date of birth needed. Your choice and progress are saved on this device only.</p>
        <AgeChoice />
        {age && (
          <p>
            <a className="btn big primary" href={href({ name: 'map' })}>
              Continue to the Solar System map →
            </a>
          </p>
        )}
      </section>
      <section className="card journey" aria-labelledby="journey-title">
        <h2 id="journey-title">How the journey works</h2>
        <ol className="steps">
          <li>Choose your age group</li>
          <li>Start from Earth on the map</li>
          <li>Pick a destination</li>
          <li>Pick a spacecraft or instrument</li>
          <li>Read or listen to its story</li>
          <li>Complete the activity and questions</li>
          <li>Earn an exploration badge</li>
        </ol>
      </section>
    </div>
  );
}

export function MapPage() {
  return (
    <div className="map-page">
      <h1 tabIndex={-1} id="page-title">Journey map</h1>
      <p className="lead">
        We start from <strong>Earth</strong>. Pick a destination to see which spacecraft visited it and how they met it.
      </p>
      <SolarMap />
      <div className="legend card">
        <h2>Encounter types</h2>
        <ul className="legend-list">
          {Object.values(ENCOUNTER_LABELS).map((l) => (
            <li key={l.label}>
              <span aria-hidden="true">{l.icon}</span> <strong>{l.label}</strong>: {l.hint}
            </li>
          ))}
        </ul>
      </div>
      <DestinationList />
    </div>
  );
}

export function DestinationView({ id }: { id: string }) {
  const d = getDestination(id);
  const { age, hasBadge } = useProgress();
  if (!d) {
    return (
      <div className="card">
        <h1 tabIndex={-1} id="page-title">Unknown destination</h1>
        <a href={href({ name: 'map' })}>Back to the map</a>
      </div>
    );
  }
  const items = equipmentForDestination(d.id);
  return (
    <div className="destination">
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href={href({ name: 'map' })}>Map</a> › <span aria-current="page">{d.name}</span>
      </nav>
      <header className="dest-header">
        <span className="dest-planet" style={{ background: d.color }} aria-hidden="true" />
        <div>
          <h1 tabIndex={-1} id="page-title">
            {d.name}
          </h1>
          <p className="kind-badge">{d.kind}</p>
          <p className="lead">{age === 'secondary' ? d.secondary : d.primary}</p>
        </div>
      </header>

      {d.isStart ? (
        <section className="card">
          <h2>Where would you like to go?</h2>
          <ul className="dest-buttons">
            {destinations
              .filter((x) => !x.isStart && equipmentForDestination(x.id).length > 0)
              .map((x) => (
                <li key={x.id}>
                  <a className="btn" href={href({ name: 'destination', id: x.id })}>
                    {x.name}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      ) : items.length === 0 ? (
        <p className="card">No stories for this destination yet.</p>
      ) : (
        <section aria-labelledby="eq-list-title">
          <h2 id="eq-list-title">Spacecraft and equipment ({items.length})</h2>
          <ul className="eq-grid">
            {items.map((e) => {
              const link = e.destinations.find((x) => x.id === d.id);
              const st = STATUS_STYLE[e.status.code];
              return (
                <li key={e.id}>
                  <a className="eq-card" href={href({ name: 'equipment', id: e.id })}>
                    <SpacecraftIllustration kind={e.illustration} label={`Schematic drawing of ${e.name}`} ghost={e.status.code === 'destroyed'} size="small" />
                    <span className="eq-card-body">
                      <strong className="eq-name">
                        {e.name} {hasBadge(e.id) && <span aria-label="badge earned">{e.badge?.emoji}</span>}
                      </strong>
                      <span className="chips">
                        {(link?.encounterTypes ?? []).map((t) => (
                          <span key={t} className="chip enc">
                            {ENCOUNTER_LABELS[t].icon} {ENCOUNTER_LABELS[t].label}
                          </span>
                        ))}
                      </span>
                      <span className={`chip status ${st.tone}`}>{st.label}</span>
                      <span className="muted small">{e.status.text}</span>
                      {CORE_IDS.includes(e.id) && <span className="core-tag">Core story</span>}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          {items.some((e) => e.encounterType.includes('flyby') && !e.encounterType.includes('orbit')) && (
            <p className="card note">
              ↗️ <strong>Remember:</strong> a spacecraft that made a flyby <strong>left no hardware</strong> on this planet; it passed by and kept going.
            </p>
          )}
          {items.some((e) => e.status.code === 'destroyed') && (
            <p className="card note">
              🔥 <strong>Remember:</strong> faded drawings show spacecraft that <strong>no longer exist</strong> after atmospheric entry or impact; the drawing shows them as they were during the mission.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export function BadgesPage() {
  const { badges, reset, age } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <div className="badges-page">
      <h1 tabIndex={-1} id="page-title">My badges</h1>
      <p className="lead">You earn a badge for each spacecraft when you read its story and complete its activity and questions. Each age group has its own badges.</p>
      <p className="muted">
        You have {badges.length} of {equipment.length * 2} possible badges ({equipment.length} per age group).
      </p>
      <ul className="badge-grid">
        {equipment.map((e) => {
          const p = badges.find((b) => b.equipmentId === e.id && b.age === 'primary');
          const s = badges.find((b) => b.equipmentId === e.id && b.age === 'secondary');
          return (
            <li key={e.id} className={`badge-tile ${p || s ? 'earned' : ''}`}>
              <span className="badge-emoji" aria-hidden="true">{e.badge?.emoji ?? '🏅'}</span>
              <a href={href({ name: 'equipment', id: e.id })}>{e.badge?.name ?? e.name}</a>
              <span className="small">{e.name}</span>
              <span className="small">
                Ages 6–11: {p ? `✓ ${formatDate(p.earnedAt.slice(0, 10))}` : 'not yet earned'}
                <br />
                Ages 12–18: {s ? `✓ ${formatDate(s.earnedAt.slice(0, 10))}` : 'not yet earned'}
              </span>
            </li>
          );
        })}
      </ul>
      <section className="card danger-zone" aria-labelledby="reset-title">
        <h2 id="reset-title">Reset progress</h2>
        <p>This deletes all badges and completed stories saved on this device. Your current age group ({age === 'secondary' ? '12–18' : '6–11'}) is kept.</p>
        {!confirming ? (
          <button type="button" className="btn danger" onClick={() => { setConfirming(true); setMessage(''); }}>
            Reset progress…
          </button>
        ) : (
          <div className="row" role="group" aria-label="Confirm reset">
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                reset();
                setConfirming(false);
                setMessage('Your progress has been reset.');
              }}
            >
              Yes, delete my progress
            </button>
            <button type="button" className="btn ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        )}
        <p aria-live="polite">{message}</p>
      </section>
    </div>
  );
}

export function SourcesPage() {
  return (
    <div className="sources-page">
      <h1 tabIndex={-1} id="page-title">Sources and image credits</h1>
      <section className="card">
        <h2>About the images</h2>
        <p>
          Every drawing in this version is a <strong>schematic illustration</strong> made for this project — not a photograph and not NASA artwork. Faded drawings show spacecraft that no longer exist, as they looked during their missions. Each record links to a NASA page with real images.
        </p>
        <p>
          NASA images are generally not copyrighted and may be used for educational purposes with credit, but some images belong to partners or third parties. Check NASA's media usage guidelines and each image's details before adding it to an <code>imageUrl</code> field.
        </p>
      </section>
      <section className="card">
        <h2>About the stories and narration</h2>
        <p>
          The first-person stories are an <strong>educational dramatization</strong> based on documented facts; they are not messages sent by the spacecraft. The narration is a synthetic browser voice, not a historical recording.
        </p>
      </section>
      {equipment.map((e) => (
        <section key={e.id} className="card" aria-labelledby={`src-${e.id}`}>
          <h2 id={`src-${e.id}`}>{e.name}</h2>
          <ul>
            {e.factSources.map((s) => (
              <li key={s.url}>
                <span className={`tag ${s.primary ? 'primary-src' : 'secondary-src'}`}>{s.primary ? 'Primary' : 'Secondary'}</span>{' '}
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>{' '}
                — {s.publisher}
              </li>
            ))}
          </ul>
          <p className="small">
            <strong>Image:</strong> {e.imageCredit}{' '}
            {e.imageSourceUrl && (
              <a href={e.imageSourceUrl} target="_blank" rel="noreferrer">
                (NASA image page)
              </a>
            )}
          </p>
          <p className="small muted">{e.lastReviewedAt ? `Last reviewed: ${formatDate(e.lastReviewedAt)}` : 'Not yet reviewed'}</p>
        </section>
      ))}
    </div>
  );
}

export function AboutPage() {
  const core = CORE_IDS.map((id) => getEquipment(id)?.name).filter(Boolean).join(', ');
  return (
    <div className="about-page">
      <h1 tabIndex={-1} id="page-title">About the project</h1>
      <section className="card">
        <h2>How this site answers the challenge</h2>
        <p>
          The NASA Space Apps Challenge 2026 “Abandoned but not Forgotten” asks for storytelling about NASA equipment left on the Moon and Mars. This site makes each spacecraft the narrator of its own story, always in five chapters: who I am, why I was sent, how I worked, what we learned, and what happened to me.
        </p>
        <ul>
          <li>The six core stories: {core}.</li>
          <li>Extra destinations show that “fate” differs: impact (MESSENGER), atmospheric entry (Galileo, Cassini, Pioneer Venus 2), and a continuing flyby journey (Voyager 2).</li>
          <li>Two age groups with genuinely different content: younger students focus on purpose and one discovery with scenes and games; older students analyze an instrument, its measurements, an engineering challenge, and the difference between observation and interpretation.</li>
          <li>Scientific accuracy: every record links facts to sources, separates last contact from official mission end, and leaves unconfirmed data empty.</li>
          <li>Works without accounts, a server or paid APIs; content lives in editable JSON files.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Limits of this version</h2>
        <ul>
          <li>No photographs are embedded; the drawings are schematics, with links to NASA image pages.</li>
          <li>Narration quality and availability depend on the voices installed on the user's device.</li>
          <li>Some facts come from secondary or archived sources; they are labeled “Secondary source” and listed under “Verification limits” for each record.</li>
          <li>Voyager 2's status changes over time; the information reflects the last review date only.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Privacy</h2>
        <p>The site collects no personal data. Your age group, progress and badges are stored only in your browser's local storage on this device.</p>
      </section>
    </div>
  );
}
