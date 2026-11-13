import { useCallback, useEffect, useRef, useState } from 'react';

export type NarrationState = 'idle' | 'speaking' | 'paused';
export type VoiceAvailability = 'checking' | 'available' | 'no-english-voice' | 'unsupported';

function getSynth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'));
  if (!en.length) return null;
  // Prefer local voices (work offline), then US/UK English, then the browser default.
  const score = (v: SpeechSynthesisVoice) =>
    (v.localService ? 4 : 0) + (/en-(US|GB)/i.test(v.lang) ? 2 : 0) + (v.default ? 1 : 0);
  return en.slice().sort((a, b) => score(b) - score(a))[0];
}

/**
 * Narrates a list of text chunks (one per chapter) with browser speech synthesis.
 * Narration only starts from an explicit user action (play()).
 * `resetKey` – when it changes (new story or new age group), narration stops.
 */
export function useNarration(chunks: string[], resetKey: string) {
  const [state, setState] = useState<NarrationState>('idle');
  const [availability, setAvailability] = useState<VoiceAvailability>(() => (getSynth() ? 'checking' : 'unsupported'));
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const runId = useRef(0);

  // Discover voices (they often load asynchronously).
  useEffect(() => {
    const synth = getSynth();
    if (!synth) return;
    let settled = false;
    const update = () => {
      const v = pickEnglishVoice(synth.getVoices());
      if (v) {
        settled = true;
        setVoice(v);
        setAvailability('available');
      } else if (synth.getVoices().length > 0) {
        setAvailability('no-english-voice');
      }
    };
    update();
    synth.addEventListener?.('voiceschanged', update);
    const timer = window.setTimeout(() => {
      if (!settled) {
        update();
        setAvailability((a) => (a === 'checking' ? 'no-english-voice' : a));
      }
    }, 2000);
    return () => {
      synth.removeEventListener?.('voiceschanged', update);
      window.clearTimeout(timer);
    };
  }, []);

  const stop = useCallback(() => {
    runId.current += 1;
    const synth = getSynth();
    if (synth) synth.cancel();
    setState('idle');
    setCurrentIndex(-1);
  }, []);

  // Stop when the story or age group changes, and when the component unmounts.
  useEffect(() => stop, [resetKey, stop]);

  const speakFrom = useCallback(
    (index: number, id: number) => {
      const synth = getSynth();
      if (!synth || id !== runId.current) return;
      if (index >= chunks.length) {
        setState('idle');
        setCurrentIndex(-1);
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[index]);
      u.lang = voice?.lang ?? 'en-US';
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.onstart = () => {
        if (id === runId.current) setCurrentIndex(index);
      };
      u.onend = () => speakFrom(index + 1, id);
      u.onerror = (e) => {
        // 'interrupted'/'canceled' happen on stop(); anything else ends narration gracefully.
        if (id !== runId.current) return;
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        setState('idle');
        setCurrentIndex(-1);
      };
      synth.speak(u);
    },
    [chunks, voice],
  );

  const play = useCallback(() => {
    const synth = getSynth();
    if (!synth || availability !== 'available') return;
    synth.cancel();
    runId.current += 1;
    const id = runId.current;
    setState('speaking');
    setCurrentIndex(0);
    speakFrom(0, id);
  }, [availability, speakFrom]);

  const pause = useCallback(() => {
    const synth = getSynth();
    if (!synth || state !== 'speaking') return;
    synth.pause();
    setState('paused');
  }, [state]);

  const resume = useCallback(() => {
    const synth = getSynth();
    if (!synth || state !== 'paused') return;
    synth.resume();
    setState('speaking');
  }, [state]);

  return { state, availability, voiceName: voice?.name ?? null, currentIndex, play, pause, resume, stop };
}
