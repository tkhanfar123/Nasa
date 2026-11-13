import { useEffect, useRef } from 'react';
import { EquipmentView } from './components/EquipmentView';
import { AboutPage, AgeChoice, BadgesPage, DestinationView, HomePage, MapPage, SourcesPage } from './components/Pages';
import { getEquipment } from './content';
import { useProgress } from './lib/progress';
import { href, useHashRoute, type Route } from './lib/router';
import type { AgeGroup } from './types';

function AgeSwitch() {
  const { age, setAge } = useProgress();
  const opts: [AgeGroup, string][] = [
    ['primary', '6–11'],
    ['secondary', '12–18'],
  ];
  return (
    <div className="age-switch" role="radiogroup" aria-label="Age group">
      <span className="age-switch-label" aria-hidden="true">Ages:</span>
      {opts.map(([v, label]) => (
        <button key={v} type="button" role="radio" aria-checked={age === v} className={age === v ? 'is-on' : ''} onClick={() => setAge(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function BadgeToast() {
  const { lastAwarded, clearLastAwarded } = useProgress();
  if (!lastAwarded) return null;
  const e = getEquipment(lastAwarded.equipmentId);
  return (
    <div className="toast" role="status">
      <span className="badge-emoji" aria-hidden="true">{e?.badge?.emoji ?? '🏅'}</span>
      <div>
        <strong>New badge!</strong>
        <p>{e?.badge?.name ?? 'Exploration badge'}</p>
      </div>
      <button type="button" className="icon-btn" onClick={clearLastAwarded} aria-label="Close notification">
        ✕
      </button>
    </div>
  );
}

function View({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'map':
      return <MapPage />;
    case 'destination':
      return <DestinationView id={route.id} />;
    case 'equipment':
      return <EquipmentView key={route.id} id={route.id} />;
    case 'badges':
      return <BadgesPage />;
    case 'sources':
      return <SourcesPage />;
    case 'about':
      return <AboutPage />;
  }
}

export default function App() {
  const route = useHashRoute();
  const { age, badges } = useProgress();
  const key = JSON.stringify(route);
  const prevKey = useRef(key);

  // Move focus to the page heading on navigation (not on first load) and scroll to top.
  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    window.scrollTo({ top: 0 });
    const h = document.getElementById('page-title');
    h?.focus({ preventScroll: true });
  }, [key]);

  useEffect(() => {
    document.body.classList.toggle('age-primary', age !== 'secondary');
    document.body.classList.toggle('age-secondary', age === 'secondary');
  }, [age]);

  const nav: [Route, string][] = [
    [{ name: 'map' }, 'Map'],
    [{ name: 'badges' }, `My badges (${badges.length})`],
    [{ name: 'sources' }, 'Sources'],
    [{ name: 'about' }, 'About'],
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="logo" href={href({ name: 'home' })}>
          <span className="logo-mark" aria-hidden="true">◉</span>
          <span>Explorer Echoes</span>
        </a>
        <nav aria-label="Main navigation">
          <ul>
            {nav.map(([r, label]) => (
              <li key={r.name}>
                <a href={href(r)} aria-current={route.name === r.name ? 'page' : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {age && <AgeSwitch />}
      </header>
      <main id="main" tabIndex={-1}>
        {!age && route.name !== 'home' && (
          <div className="card age-banner">
            <p>
              <strong>Choose your age group</strong> so we can show you the right stories and activities:
            </p>
            <AgeChoice compact />
          </div>
        )}
        <View route={route} />
      </main>
      <BadgeToast />
      <footer className="site-footer">
        <p>
          An educational project for the NASA Space Apps Challenge 2026, “Abandoned but not Forgotten”. Not an official NASA website. The stories are educational dramatizations based on documented facts.{' '}
          <a href={href({ name: 'sources' })}>Sources and image credits</a>
        </p>
      </footer>
    </>
  );
}
