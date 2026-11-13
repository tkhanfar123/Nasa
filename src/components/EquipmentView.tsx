import { useEffect, useMemo, useState } from 'react';
import { getDestination, getEquipment } from '../content';
import { AGE_LABEL, CHAPTER_TITLES, ENCOUNTER_LABELS, STATUS_STYLE, formatDate } from '../lib/labels';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';
import { useNarration } from '../lib/speech';
import type { AgeGroup, Equipment, Story } from '../types';
import { ActivityView, Quiz } from './Activities';
import { SceneIcon, SpacecraftIllustration } from './Illustration';
import { NarrationControls } from './Narration';

function Hero({ e }: { e: Equipment }) {
  const [imgFailed, setImgFailed] = useState(false);
  const status = e.status ? STATUS_STYLE[e.status.code] : null;
  const ghost = e.status?.code === 'destroyed';
  const showImg = !!e.imageUrl && !imgFailed;
  return (
    <header className="eq-hero">
      <figure className="eq-figure">
        {showImg ? (
          <img src={e.imageUrl!} alt={e.imageAlt ?? `Image of ${e.name}`} onError={() => setImgFailed(true)} />
        ) : (
          <SpacecraftIllustration kind={e.illustration} label={e.imageAlt ?? `Schematic drawing of ${e.name}`} ghost={ghost} />
        )}
        <figcaption>
          <span className="tag schematic">{showImg ? 'Image' : 'Schematic illustration'}</span>{' '}
          {e.imageCredit ?? 'No image credit available.'}
          {imgFailed && <span> (The image could not load, so the schematic is shown.)</span>}
          {e.imageSourceUrl && (
            <>
              {' '}
              <a href={e.imageSourceUrl} target="_blank" rel="noreferrer">
                Real images and source page at NASA ↗
              </a>
            </>
          )}
        </figcaption>
      </figure>
      <div className="eq-titles">
        <p className="eyebrow">{e.equipmentType}</p>
        <h1 tabIndex={-1} id="page-title">
          {e.name}
        </h1>
        <p className="mission">
          Mission: <strong>{e.mission?.name}</strong>
        </p>
        {e.mission?.partners && e.mission.partners.length > 0 && <p className="partners">Partners: {e.mission.partners.join(', ')}</p>}
        <div className="chips">
          {status && <span className={`chip status ${status.tone}`}>{status.label}</span>}
          {(e.encounterType ?? []).map((t) => (
            <span key={t} className="chip enc" title={ENCOUNTER_LABELS[t].hint}>
              {ENCOUNTER_LABELS[t].icon} {ENCOUNTER_LABELS[t].label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

function FactsPanel({ e, age }: { e: Equipment; age: AgeGroup }) {
  const active = e.status?.code === 'active';
  const rows: [string, string][] = [
    ['Launch', formatDate(e.launchDate)],
    ['Arrival', formatDate(e.arrivalDate)],
    ['Last contact', active ? 'Still in contact (as of last review)' : formatDate(e.lastContactDate)],
    ['Official mission end', active ? 'Not ended (as of last review)' : formatDate(e.missionEndDate)],
  ];
  const c = e.location?.coordinates;
  return (
    <section className="card facts" aria-labelledby="facts-title">
      <h2 id="facts-title">{age === 'primary' ? 'Fact card' : 'Key facts and status'}</h2>
      <dl className="facts-grid">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div className="wide">
          <dt>Destination and encounter type</dt>
          <dd>
            <ul className="plain">
              {(e.destinations ?? []).map((d) => {
                const dest = getDestination(d.id);
                return (
                  <li key={d.id}>
                    <a href={href({ name: 'destination', id: d.id })}>{dest?.name ?? d.id}</a>:{' '}
                    {d.encounterTypes.map((t) => ENCOUNTER_LABELS[t].label).join(' → ')}
                    {d.note && <span className="muted"> — {d.note}</span>}
                  </li>
                );
              })}
            </ul>
          </dd>
        </div>
        <div className="wide">
          <dt>Operational status</dt>
          <dd>{e.status?.text ?? 'Unknown'}</dd>
        </div>
        <div className="wide">
          <dt>Final fate</dt>
          <dd>{e.finalFate ?? (active ? 'Not applicable yet: the mission continues.' : 'Not documented.')}</dd>
        </div>
        <div className="wide">
          <dt>Where it is now</dt>
          <dd>
            {e.location?.description ?? 'Unknown'}
            {c && (
              <span className="coords">
                {' '}
                ({Math.abs(c.lat)}°{c.lat >= 0 ? 'N' : 'S'}, {Math.abs(c.lon)}°{c.lon >= 0 ? 'E' : 'W'} — {c.kind})
              </span>
            )}
          </dd>
        </div>
      </dl>
      {e.dateNotes && e.dateNotes.length > 0 && (
        <details className="notes">
          <summary>Notes on the dates</summary>
          <ul>
            {e.dateNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function PrimaryScenes({ story, current, onFinish, read, kind, name }: { story: Story; current: number; onFinish: () => void; read: boolean; kind: Equipment['illustration']; name: string }) {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    if (current >= 0) setScene(current);
  }, [current]);
  const ch = story.chapters[scene];
  const last = scene === story.chapters.length - 1;
  return (
    <div className="scenes">
      <ol className="scene-dots" aria-label="Story scenes">
        {story.chapters.map((c, i) => (
          <li key={c.key}>
            <button
              type="button"
              className={`dot-btn ${i === scene ? 'is-current' : ''}`}
              aria-current={i === scene ? 'step' : undefined}
              aria-label={`Scene ${i + 1}: ${CHAPTER_TITLES[c.key]}`}
              onClick={() => setScene(i)}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>
      <article className={`scene ${current === scene ? 'is-reading' : ''}`} aria-live="polite">
        <div className="scene-art">
          {ch.key === 'who' ? <SpacecraftIllustration kind={kind} label={`Schematic drawing of ${name}`} size="small" /> : <SceneIcon scene={ch.key} />}
        </div>
        <div>
          <h3>
            Scene {scene + 1}: {CHAPTER_TITLES[ch.key]}
          </h3>
          <p className="scene-text">{ch.text}</p>
        </div>
      </article>
      <div className="row scene-nav">
        <button type="button" className="btn big" disabled={scene === 0} onClick={() => setScene((s) => s - 1)}>
          ← Back
        </button>
        {!last ? (
          <button type="button" className="btn big primary" onClick={() => setScene((s) => s + 1)}>
            Next →
          </button>
        ) : (
          <button type="button" className="btn big primary" onClick={onFinish} disabled={read}>
            {read ? '✓ You read the story' : 'I finished the story ✓'}
          </button>
        )}
      </div>
    </div>
  );
}

function SecondaryChapters({ story, current, onFinish, read }: { story: Story; current: number; onFinish: () => void; read: boolean }) {
  return (
    <div className="chapters">
      {story.chapters.map((c, i) => (
        <article key={c.key} className={`chapter ${current === i ? 'is-reading' : ''}`}>
          <h3>
            <span className="ch-num">{i + 1}</span> {CHAPTER_TITLES[c.key]}
          </h3>
          <p>{c.text}</p>
        </article>
      ))}
      <button type="button" className="btn primary" onClick={onFinish} disabled={read}>
        {read ? '✓ You read the story' : 'I finished reading the story ✓'}
      </button>
    </div>
  );
}

export function EquipmentView({ id }: { id: string }) {
  const e = getEquipment(id);
  const { age, getItem, mark, hasBadge } = useProgress();
  const a: AgeGroup = age ?? 'primary';
  const story = e ? (a === 'primary' ? e.primaryStory : e.secondaryStory) : null;
  const activity = e ? (a === 'primary' ? e.primaryActivity : e.secondaryActivity) : null;
  const chunks = useMemo(() => (story?.chapters ?? []).map((c) => `${CHAPTER_TITLES[c.key]} ${c.text}`), [story]);
  const narration = useNarration(chunks, `${id}:${a}`);

  if (!e) {
    return (
      <div className="card">
        <h1 tabIndex={-1} id="page-title">Story not found</h1>
        <p>
          <a href={href({ name: 'map' })}>Back to the map</a>
        </p>
      </div>
    );
  }

  const p = getItem(e.id);
  const spot = e.spotlight ? (a === 'primary' ? e.spotlight.primary : e.spotlight.secondary) : null;
  const earned = hasBadge(e.id, a);
  const firstDest = e.destinations?.[0];

  return (
    <div className="equipment">
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href={href({ name: 'map' })}>Map</a> ›{' '}
        {firstDest && (
          <>
            <a href={href({ name: 'destination', id: firstDest.id })}>{getDestination(firstDest.id)?.name}</a> ›{' '}
          </>
        )}
        <span aria-current="page">{e.name}</span>
      </nav>

      <Hero e={e} />

      <section className="card story" aria-labelledby="story-title">
        <h2 id="story-title">My story ({AGE_LABEL[a]})</h2>
        <p className="dramatization" role="note">
          📜 <strong>Educational dramatization:</strong> this story is written in the first person based on documented facts. The spacecraft did not write or send it, and it is not a real message from the spacecraft.
        </p>
        <NarrationControls n={narration} age={a} />
        {story ? (
          a === 'primary' ? (
            <PrimaryScenes
              story={story}
              current={narration.currentIndex}
              read={!!p.storyRead}
              onFinish={() => mark(e.id, { storyRead: true })}
              kind={e.illustration}
              name={e.name}
            />
          ) : (
            <SecondaryChapters story={story} current={narration.currentIndex} read={!!p.storyRead} onFinish={() => mark(e.id, { storyRead: true })} />
          )
        ) : (
          <p>The story for this age group is not available yet.</p>
        )}
        {story?.glossary && story.glossary.length > 0 && (
          <aside className="glossary" aria-labelledby="glossary-title">
            <h3 id="glossary-title">{a === 'primary' ? '📖 Tricky words' : '📖 Key terms'}</h3>
            <dl>
              {story.glossary.map((g) => (
                <div key={g.term}>
                  <dt>{g.term}</dt>
                  <dd>{g.meaning}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </section>

      {spot && (
        <section className="card spotlight" aria-labelledby="spot-title">
          <h2 id="spot-title">🔧 {a === 'primary' ? 'Meet one of my parts' : 'Instrument or component under the microscope'}</h2>
          <h3>{spot.title}</h3>
          <div className="spot-grid">
            <div>
              <h4>How does it work?</h4>
              <p>{spot.howItWorks}</p>
            </div>
            <div className="arrow" aria-hidden="true">→</div>
            <div>
              <h4>{a === 'primary' ? 'What did we learn thanks to it?' : 'From hardware to knowledge'}</h4>
              <p>{spot.knowledge}</p>
            </div>
          </div>
          {a === 'secondary' && e.instruments?.length > 0 && (
            <details>
              <summary>All instruments and components mentioned</summary>
              <ul>
                {e.instruments.map((ins) => (
                  <li key={ins.name}>
                    <strong>{ins.name}</strong>: {ins.role}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {a === 'secondary' && e.engineeringChallenge && (
        <section className="card engineering" aria-labelledby="eng-title">
          <h2 id="eng-title">⚙️ An engineering challenge and how it was handled</h2>
          <div className="spot-grid">
            <div>
              <h4>The challenge</h4>
              <p>{e.engineeringChallenge.challenge}</p>
            </div>
            <div className="arrow" aria-hidden="true">→</div>
            <div>
              <h4>The solution</h4>
              <p>{e.engineeringChallenge.solution}</p>
            </div>
          </div>
        </section>
      )}

      {a === 'secondary' && e.discoveries?.length > 0 && (
        <section className="card discoveries" aria-labelledby="disc-title">
          <h2 id="disc-title">🔭 Results and interpretations</h2>
          <p className="muted">
            We separate an <span className="tag outcome">outcome/observation</span> from the <span className="tag interpretation">scientific interpretation</span> built on it.
          </p>
          <ul className="disc-list">
            {e.discoveries.map((d) => (
              <li key={d.text}>
                <span className={`tag ${d.kind}`}>{d.kind === 'outcome' ? 'Outcome' : 'Interpretation'}</span> {d.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card timeline" aria-labelledby="tl-title">
        <h2 id="tl-title">🕰️ Timeline of documented events</h2>
        <ol className="tl">
          {(e.timeline ?? []).map((t, i) => (
            <li key={i}>
              <time>{formatDate(t.date)}</time>
              <span>{t.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <FactsPanel e={e} age={a} />

      <section className="card" aria-labelledby="act-title">
        <h2 id="act-title">🧩 Activity</h2>
        {activity ? (
          <ActivityView
            key={`${e.id}-${a}-act`}
            activity={activity}
            age={a}
            idPrefix={`${e.id}-${a}`}
            done={!!p.activityDone}
            onDone={() => mark(e.id, { activityDone: true })}
          />
        ) : (
          <p>The activity is not available yet.</p>
        )}
      </section>

      <section className="card" aria-labelledby="quiz-title">
        <h2 id="quiz-title">❓ {a === 'primary' ? 'Two quick questions' : 'Three questions to think about'}</h2>
        {activity?.questions?.length ? (
          <Quiz
            key={`${e.id}-${a}-quiz`}
            questions={activity.questions}
            age={a}
            idPrefix={`${e.id}-${a}-quiz`}
            done={!!p.quizDone}
            onDone={() => mark(e.id, { quizDone: true })}
          />
        ) : (
          <p>The questions are not available yet.</p>
        )}
      </section>

      <section className="card progress-card" aria-labelledby="prog-title">
        <h2 id="prog-title">🏅 Your path to the badge</h2>
        <ul className="checklist">
          <li className={p.storyRead ? 'done' : ''}>{p.storyRead ? '✓' : '○'} Read or listen to the story, then press “I finished”</li>
          <li className={p.activityDone ? 'done' : ''}>{p.activityDone ? '✓' : '○'} Complete the activity</li>
          <li className={p.quizDone ? 'done' : ''}>{p.quizDone ? '✓' : '○'} Answer every question correctly</li>
        </ul>
        {earned && e.badge && (
          <p className="badge-earned">
            <span className="badge-emoji" aria-hidden="true">{e.badge.emoji}</span> You earned the <strong>{e.badge.name}</strong>!{' '}
            <a href={href({ name: 'badges' })}>See your badges</a>
          </p>
        )}
      </section>

      <section className="card sources" aria-labelledby="src-title">
        <h2 id="src-title">📚 Fact sources and image credit</h2>
        <ul>
          {(e.factSources ?? []).map((s) => (
            <li key={s.url}>
              <span className={`tag ${s.primary ? 'primary-src' : 'secondary-src'}`}>{s.primary ? 'Primary source' : 'Secondary source'}</span>{' '}
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>{' '}
              — {s.publisher}
              <div className="muted small">Supports: {s.supports}</div>
            </li>
          ))}
        </ul>
        <p className="small">
          <strong>Image:</strong> {e.imageCredit ?? 'Not available'}
        </p>
        <p className="small muted">{e.lastReviewedAt ? `Facts last reviewed: ${formatDate(e.lastReviewedAt)}` : 'No fact review recorded yet.'}</p>
        {e.verificationNotes && e.verificationNotes.length > 0 && (
          <details className="notes">
            <summary>Verification limits for this record</summary>
            <ul>
              {e.verificationNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
