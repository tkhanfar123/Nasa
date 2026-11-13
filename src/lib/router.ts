import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'map' }
  | { name: 'destination'; id: string }
  | { name: 'equipment'; id: string }
  | { name: 'badges' }
  | { name: 'sources' }
  | { name: 'about' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case 'map':
      return { name: 'map' };
    case 'destination':
      return parts[1] ? { name: 'destination', id: parts[1] } : { name: 'map' };
    case 'equipment':
      return parts[1] ? { name: 'equipment', id: parts[1] } : { name: 'map' };
    case 'badges':
      return { name: 'badges' };
    case 'sources':
      return { name: 'sources' };
    case 'about':
      return { name: 'about' };
    default:
      return { name: 'home' };
  }
}

export function href(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'destination':
      return `#/destination/${encodeURIComponent(route.id)}`;
    case 'equipment':
      return `#/equipment/${encodeURIComponent(route.id)}`;
    default:
      return `#/${route.name}`;
  }
}

export function navigate(route: Route) {
  window.location.hash = href(route);
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
