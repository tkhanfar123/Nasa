import { useEffect, useMemo, useState } from 'react';
import type { Activity, AgeGroup, MatchingActivity, ObservationActivity, Question, SequencingActivity } from '../types';

/** Deterministic shuffle so a puzzle never starts already solved. */
function shuffled<T>(items: T[], seed: string): T[] {
  const arr = items.slice();
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const same = arr.every((v, i) => v === items[i]);
  if (same && arr.length > 1) arr.push(arr.shift() as T);
  return arr;
}

const PRAISE_PRIMARY = ['Well done! 🌟', 'Awesome! 🚀', 'Excellent! ⭐'];
const RETRY_PRIMARY = 'Good try! Think again — you are getting close 💪';
const PRAISE_SECONDARY = ['Correct.', 'Right.', 'Careful analysis — correct.'];
const RETRY_SECONDARY = 'Not the most accurate answer. Review the evidence and try again.';

function praise(age: AgeGroup, i: number) {
  const list = age === 'primary' ? PRAISE_PRIMARY : PRAISE_SECONDARY;
  return list[i % list.length];
}

/* ---------------- Multiple choice (quizzes and observation tasks) ---------------- */

export function MultipleChoice({
  q,
  index,
  age,
  idPrefix,
  onCorrect,
  solved,
}: {
  q: Question;
  index: number;
  age: AgeGroup;
  idPrefix: string;
  onCorrect: () => void;
  solved: boolean;
}) {
  const [choice, setChoice] = useState<number | null>(solved ? q.correctIndex : null);
  const [checked, setChecked] = useState(solved);
  const correct = checked && choice === q.correctIndex;
  const name = `${idPrefix}-q${index}`;

  return (
    <fieldset className={`mcq ${correct ? 'is-correct' : ''}`}>
      <legend>
        <span className="q-num">{index + 1}</span> {q.q}
      </legend>
      <div className="options">
        {q.options.map((opt, i) => (
          <label key={i} className={`option ${choice === i ? 'is-chosen' : ''}`}>
            <input
              type="radio"
              name={name}
              checked={choice === i}
              disabled={correct}
              onChange={() => {
                setChoice(i);
                setChecked(false);
              }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {!correct && (
        <button
          type="button"
          className="btn"
          disabled={choice === null}
          onClick={() => {
            setChecked(true);
            if (choice === q.correctIndex) onCorrect();
          }}
        >
          Check answer
        </button>
      )}
      <div aria-live="polite" className="feedback-slot">
        {checked && (
          <div className={`feedback ${correct ? 'good' : 'retry'}`}>
            <strong>{correct ? praise(age, index) : age === 'primary' ? RETRY_PRIMARY : RETRY_SECONDARY}</strong>
            {correct && <p>{q.explanation}</p>}
          </div>
        )}
      </div>
    </fieldset>
  );
}

export function Quiz({
  questions,
  age,
  idPrefix,
  done,
  onDone,
}: {
  questions: Question[];
  age: AgeGroup;
  idPrefix: string;
  done: boolean;
  onDone: () => void;
}) {
  const [solved, setSolved] = useState<Set<number>>(() => new Set(done ? questions.map((_, i) => i) : []));
  useEffect(() => {
    if (!done && questions.length > 0 && solved.size === questions.length) onDone();
  }, [solved, questions.length, done, onDone]);

  return (
    <div className="quiz">
      {questions.map((q, i) => (
        <MultipleChoice
          key={`${idPrefix}-${i}`}
          q={q}
          index={i}
          age={age}
          idPrefix={idPrefix}
          solved={done}
          onCorrect={() => setSolved((s) => new Set(s).add(i))}
        />
      ))}
      <p className="quiz-status" aria-live="polite">
        {done || solved.size === questions.length
          ? 'All questions answered ✓'
          : `${solved.size} of ${questions.length} answered correctly`}
      </p>
    </div>
  );
}

/* ---------------- Matching ---------------- */

function Matching({ a, age, done, onDone, seed }: { a: MatchingActivity; age: AgeGroup; done: boolean; onDone: () => void; seed: string }) {
  const rights = useMemo(() => shuffled(a.pairs.map((p) => p.right), seed), [a, seed]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, string>>(() =>
    done ? Object.fromEntries(a.pairs.map((p, i) => [i, p.right])) : {},
  );
  const [checked, setChecked] = useState(done);
  const allPlaced = Object.keys(matches).length === a.pairs.length;
  const allCorrect = a.pairs.every((p, i) => matches[i] === p.right);

  const assign = (right: string) => {
    if (selectedLeft === null) return;
    setMatches((m) => {
      const next: Record<number, string> = {};
      for (const [k, v] of Object.entries(m)) if (v !== right) next[Number(k)] = v;
      next[selectedLeft] = right;
      return next;
    });
    setSelectedLeft(null);
    setChecked(false);
  };

  return (
    <div className="matching">
      <div className="match-cols">
        <div>
          <h4>Item</h4>
          <ul className="match-list">
            {a.pairs.map((p, i) => {
              const state = checked ? (matches[i] === p.right ? 'ok' : 'bad') : '';
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`match-card ${selectedLeft === i ? 'is-selected' : ''} ${state}`}
                    aria-pressed={selectedLeft === i}
                    disabled={checked && allCorrect}
                    onClick={() => setSelectedLeft(selectedLeft === i ? null : i)}
                  >
                    <span className="match-left">{p.left}</span>
                    <span className="match-right">{matches[i] ? `→ ${matches[i]}` : '→ (choose)'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h4>{selectedLeft === null ? 'Choose an item first' : `Choose the match for “${a.pairs[selectedLeft].left}”`}</h4>
          <ul className="match-list">
            {rights.map((r) => {
              const used = Object.values(matches).includes(r);
              return (
                <li key={r}>
                  <button
                    type="button"
                    className={`match-card right ${used ? 'is-used' : ''}`}
                    disabled={selectedLeft === null || (checked && allCorrect)}
                    onClick={() => assign(r)}
                  >
                    {r}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {!(checked && allCorrect) && (
        <div className="row">
          <button
            type="button"
            className="btn"
            disabled={!allPlaced}
            onClick={() => {
              setChecked(true);
              if (allCorrect) onDone();
            }}
          >
            Check
          </button>
          <button type="button" className="btn ghost" onClick={() => { setMatches({}); setChecked(false); setSelectedLeft(null); }}>
            Start over
          </button>
        </div>
      )}
      <div aria-live="polite" className="feedback-slot">
        {checked && (
          <div className={`feedback ${allCorrect ? 'good' : 'retry'}`}>
            <strong>
              {allCorrect
                ? age === 'primary' ? 'Well done! You matched every card correctly 🌟' : 'All matches are correct.'
                : `${a.pairs.filter((p, i) => matches[i] === p.right).length} of ${a.pairs.length} correct. ${age === 'primary' ? 'The red cards need changing — try again!' : 'Change the matches marked in red.'}`}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Sequencing ---------------- */

function Sequencing({ a, age, done, onDone, seed }: { a: SequencingActivity; age: AgeGroup; done: boolean; onDone: () => void; seed: string }) {
  const [order, setOrder] = useState<string[]>(() => (done ? a.items.slice() : shuffled(a.items, seed)));
  const [checked, setChecked] = useState(done);
  const correct = order.every((v, i) => v === a.items[i]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setChecked(false);
  };

  return (
    <div className="sequencing">
      <ol className="seq-list">
        {order.map((item, i) => (
          <li key={item} className={checked ? (item === a.items[i] ? 'ok' : 'bad') : ''}>
            <span className="seq-num">{i + 1}</span>
            <span className="seq-text">{item}</span>
            <span className="seq-btns">
              <button type="button" className="icon-btn" aria-label={`Move “${item}” up`} disabled={i === 0 || (checked && correct)} onClick={() => move(i, -1)}>▲</button>
              <button type="button" className="icon-btn" aria-label={`Move “${item}” down`} disabled={i === order.length - 1 || (checked && correct)} onClick={() => move(i, 1)}>▼</button>
            </span>
          </li>
        ))}
      </ol>
      {!(checked && correct) && (
        <button
          type="button"
          className="btn"
          onClick={() => {
            setChecked(true);
            if (correct) onDone();
          }}
        >
          Check
        </button>
      )}
      <div aria-live="polite" className="feedback-slot">
        {checked && (
          <div className={`feedback ${correct ? 'good' : 'retry'}`}>
            <strong>
              {correct
                ? age === 'primary' ? 'Awesome! The order is exactly right 🚀' : 'The order is correct.'
                : age === 'primary' ? 'So close! The red events are in the wrong place — try moving them 💪' : 'Some events are out of place (marked in red).'}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Observation ---------------- */

function Observation({ a, age, done, onDone, idPrefix }: { a: ObservationActivity; age: AgeGroup; done: boolean; onDone: () => void; idPrefix: string }) {
  return (
    <div className="observation">
      <p className={`data-kind ${a.dataKind}`}>
        {a.dataKind === 'sourced' ? '📊 Simplified observation from documented sources' : '🧪 Educational example — partly hypothetical numbers'}
      </p>
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Data table">
        <table>
          <thead>
            <tr>{a.table.headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {a.table.rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="data-note">{a.dataNote}</p>
      <MultipleChoice q={a.task} index={0} age={age} idPrefix={`${idPrefix}-task`} solved={done} onCorrect={onDone} />
    </div>
  );
}

export function ActivityView({
  activity,
  age,
  done,
  onDone,
  idPrefix,
}: {
  activity: Activity;
  age: AgeGroup;
  done: boolean;
  onDone: () => void;
  idPrefix: string;
}) {
  return (
    <div className="activity">
      <h3>{activity.title}</h3>
      <p className="instructions">{activity.instructions}</p>
      {activity.type === 'matching' && <Matching a={activity} age={age} done={done} onDone={onDone} seed={idPrefix} />}
      {activity.type === 'sequencing' && <Sequencing a={activity} age={age} done={done} onDone={onDone} seed={idPrefix} />}
      {activity.type === 'observation' && <Observation a={activity} age={age} done={done} onDone={onDone} idPrefix={idPrefix} />}
      {done && <p className="done-tag">✓ Activity complete</p>}
    </div>
  );
}
