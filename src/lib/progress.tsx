import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AgeGroup } from '../types';

const STORAGE_KEY = 'explorer-echoes:v1';

export interface ItemProgress {
  storyRead?: boolean;
  activityDone?: boolean;
  quizDone?: boolean;
}

export interface Badge {
  equipmentId: string;
  age: AgeGroup;
  earnedAt: string;
}

interface Saved {
  age: AgeGroup | null;
  /** key: `${age}:${equipmentId}` */
  items: Record<string, ItemProgress>;
  badges: Badge[];
}

const EMPTY: Saved = { age: null, items: {}, badges: [] };

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    return {
      age: parsed.age === 'primary' || parsed.age === 'secondary' ? parsed.age : null,
      items: parsed.items && typeof parsed.items === 'object' ? parsed.items : {},
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
    };
  } catch {
    return EMPTY;
  }
}

function save(state: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode); progress then lasts for this visit only */
  }
}

interface ProgressApi {
  age: AgeGroup | null;
  setAge: (age: AgeGroup) => void;
  getItem: (id: string) => ItemProgress;
  mark: (id: string, patch: Partial<ItemProgress>) => void;
  badges: Badge[];
  hasBadge: (id: string, age?: AgeGroup) => boolean;
  lastAwarded: Badge | null;
  clearLastAwarded: () => void;
  reset: () => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Saved>(load);
  const [lastAwarded, setLastAwarded] = useState<Badge | null>(null);

  useEffect(() => save(state), [state]);

  const setAge = useCallback((age: AgeGroup) => setState((s) => ({ ...s, age })), []);

  const mark = useCallback((id: string, patch: Partial<ItemProgress>) => {
    setState((s) => {
      if (!s.age) return s;
      const key = `${s.age}:${id}`;
      const next = { ...(s.items[key] ?? {}), ...patch };
      const items = { ...s.items, [key]: next };
      let badges = s.badges;
      const complete = next.storyRead && next.activityDone && next.quizDone;
      if (complete && !s.badges.some((b) => b.equipmentId === id && b.age === s.age)) {
        const badge: Badge = { equipmentId: id, age: s.age, earnedAt: new Date().toISOString() };
        badges = [...s.badges, badge];
        // Defer so that we don't set state inside another setState updater.
        queueMicrotask(() => setLastAwarded(badge));
      }
      return { ...s, items, badges };
    });
  }, []);

  const api = useMemo<ProgressApi>(
    () => ({
      age: state.age,
      setAge,
      getItem: (id) => (state.age ? state.items[`${state.age}:${id}`] ?? {} : {}),
      mark,
      badges: state.badges,
      hasBadge: (id, age) => state.badges.some((b) => b.equipmentId === id && (!age || b.age === age)),
      lastAwarded,
      clearLastAwarded: () => setLastAwarded(null),
      reset: () => {
        setState((s) => ({ ...EMPTY, age: s.age }));
        setLastAwarded(null);
      },
    }),
    [state, setAge, mark, lastAwarded],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress must be used inside ProgressProvider');
  return v;
}
