import { appPath } from '../../navigation';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { CONTENT as T } from './data/content';
import type { Ceremony, Mode } from './data/types';
import { createCeremonies } from './data/ceremonies';
import { CeremonyScene } from './components/CeremonyScene';
import { EducationalContent } from './components/EducationalContent';
import { SequenceDiagram } from './components/SequenceDiagram';
import { Monitor, ListTree } from 'lucide-react';
import { PayloadGuide } from './components/PayloadGuide';
import { AuthenticatorIcon } from './components/AuthenticatorIcon';

const authenticators = [
    ['usb', 'tabUsb', 'tabUsbSub'],
    ['hello', 'tabHello', 'tabHelloSub'], ['phone', 'tabPhone', 'tabPhoneSub'],
] as const;

function onChoiceKey(event: React.KeyboardEvent<HTMLElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    const active = buttons.indexOf(event.target as HTMLButtonElement);
    if (active < 0) return;
    event.preventDefault(); event.stopPropagation();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (active + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : buttons.length - 1)) % buttons.length;
    buttons[next].focus(); buttons[next].click();
}

export default function App() {
    const [ceremony, setCeremony] = useState<Ceremony>(() => { const value = new URLSearchParams(window.location.search).get('ceremony'); return authenticators.some(([id]) => id === value) ? value as Ceremony : 'usb'; });
    const [mode, setMode] = useState<Mode>(() => new URLSearchParams(window.location.search).get('mode') === 'login' ? 'login' : 'register');
    const [position, setIndex] = useState(() => { const value = Number(new URLSearchParams(window.location.search).get('step')); return Number.isInteger(value) && value > 0 ? value - 1 : 0; });
    const lastQuery = useRef<string | null>(null);
    useEffect(() => {
        const readLocation = () => {
            const query = window.location.search;
            if (lastQuery.current === query) return;
            lastQuery.current = query;
            const params = new URLSearchParams(query);
            const chosen = params.get('ceremony');
            if (authenticators.some(([id]) => id === chosen)) setCeremony(chosen as Ceremony);
            const nextMode = params.get('mode');
            if (nextMode === 'register' || nextMode === 'login') setMode(nextMode);
            const step = Number(params.get('step'));
            if (params.has('step')) setIndex(Number.isInteger(step) && step > 0 ? step - 1 : 0);
            setPlaying(false);
        };
        readLocation();
        window.addEventListener('studio:location', readLocation);
        return () => window.removeEventListener('studio:location', readLocation);
    }, []);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<'world' | 'sequence'>('world');
    const [playing, setPlaying] = useState(false);
    const definition = useMemo(() => createCeremonies(T)[ceremony], [ceremony]);
    const steps = useMemo(() => definition.steps(mode), [definition, mode]);
    const index = Math.min(position, steps.length - 1);
    const safeIndex = index;
    const step = steps[safeIndex];
    const M = T[ceremony];
    const stepDuration = step.dur ?? 2800;

    const go = useCallback((next: number) => {
        setPlaying(false);
        setIndex(Math.max(0, Math.min(steps.length - 1, next)));
    }, [steps.length]);

    const togglePlayback = useCallback(() => {
        if (index === steps.length - 1)
            setIndex(0);
        setPlaying(value => !value);
    }, [index, steps.length]);

    useEffect(() => {
        if (!playing)
            return;
        const timer = window.setTimeout(() => {
            setIndex(current => Math.min(current + 1, steps.length - 1));
            if (index >= steps.length - 2)
                setPlaying(false);
        }, stepDuration);
        return () => window.clearTimeout(timer);
    }, [playing, index, stepDuration, steps.length]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isDefault = ceremony === 'usb' && mode === 'register' && safeIndex === 0;
        if (isDefault && !params.has('ceremony') && !params.has('mode') && !params.has('step')) return;
        if (isDefault && !params.has('t')) {
            params.delete('ceremony');
            params.delete('mode');
            params.delete('step');
        } else {
            params.set('ceremony', ceremony);
            params.set('mode', mode);
            params.set('step', String(safeIndex + 1));
        }
        const query = params.toString();
        const nextSearch = query ? `?${query}` : '';
        if (window.location.search !== nextSearch) {
            lastQuery.current = nextSearch;
            window.history.replaceState(window.history.state, '', `${window.location.pathname}${nextSearch}${window.location.hash}`);
        }
    }, [ceremony, mode, safeIndex]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
                return;
            if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], dialog'))
                return;
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                go(index + 1);
            }
            else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                go(index - 1);
            }
            else if (event.key === ' ' && !(event.target instanceof Element && event.target.closest('button, a'))) {
                event.preventDefault();
                togglePlayback();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [index, go, togglePlayback]);

    return <div lang={T.htmlLang}>
    <div className="wrap" id="top">


    <header>
      <div className="head-text">
        <h1>{T.h1}</h1>
        <p className="lede">{T.lede}</p>
      </div>
    </header>
    <div className="selector">
      <div className="tabs" role="radiogroup" onKeyDown={onChoiceKey} aria-label={T.ariaAuth}>
        {authenticators.map(([id, title, subtitle]) => <button key={id} className="tab" role="radio" tabIndex={ceremony === id ? 0 : -1} aria-checked={ceremony === id} onClick={() => { setPlaying(false); const next = createCeremonies(T)[id].steps(mode); setIndex(Math.round(safeIndex / Math.max(1, steps.length - 1) * (next.length - 1))); setCeremony(id); }}>
          <AuthenticatorIcon ceremony={id}/>
          <span><span>{T[title]}</span><span className="tab-sub">{T[subtitle]}</span></span>
        </button>)}
      </div>
      <div className="seg" role="radiogroup" onKeyDown={onChoiceKey} aria-label={T.ariaMode}>
        {(['register', 'login'] as const).map(value => <button key={value} role="radio" tabIndex={mode === value ? 0 : -1} aria-checked={mode === value} onClick={() => { setPlaying(false); const next = definition.steps(value); setIndex(Math.round(safeIndex / Math.max(1, steps.length - 1) * (next.length - 1))); setMode(value); }}>{value === 'login' ? T.modeLogin : T.modeRegister}</button>)}
      </div>
    </div>
    <main className="main" style={{ '--step-dur': `${stepDuration}ms` } as CSSProperties}>
      <div className="visual-column">
      <section className={`stage ${playing ? 'is-playing' : ''}`} aria-label={T.ariaStage}>
        <div className="controls" aria-label="Playback: arrows to navigate, space to play">
          <button className="btn" onClick={() => go(0)}>{T.reset}</button>
          <button className="btn" disabled={index === 0} aria-keyshortcuts="ArrowLeft" onClick={() => go(safeIndex - 1)}>{T.prev}</button>
          <button className="btn primary" aria-keyshortcuts="Space" onClick={togglePlayback}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{playing ? <><rect x="3" y="2.5" width="3.5" height="11" rx="1"/><rect x="9.5" y="2.5" width="3.5" height="11" rx="1"/></> : <path d="M4 2.5v11l9-5.5z"/>}</svg>
            {playing ? T.pause : safeIndex === steps.length - 1 ? 'Replay' : T.play}
          </button>
          <button className="btn" disabled={index === steps.length - 1} aria-keyshortcuts="ArrowRight" onClick={() => go(safeIndex + 1)}>{T.next}</button>
          <div className="progress" aria-hidden="true">
            <i className="progress-fill" style={{ transform: `scaleX(${(index + 1) / steps.length})` }}/>
            {playing && <b key={`play-${ceremony}-${mode}-${index}`} className="progress-timer"/>}
          </div>
          <span className="counter" role="status">{index + 1} / {steps.length}</span>
        </div>
        <div className="view-toolbar">
          <div className="view-switch" role="radiogroup" aria-label="Visualization" onKeyDown={onChoiceKey}>
            <button type="button" role="radio" aria-checked={view === 'world'} tabIndex={view === 'world' ? 0 : -1} onClick={() => setView('world')}><Monitor size={16} aria-hidden="true" />Real World</button>
            <button type="button" role="radio" aria-checked={view === 'sequence'} tabIndex={view === 'sequence' ? 0 : -1} onClick={() => setView('sequence')}><ListTree size={16} aria-hidden="true" />Sequence</button>
          </div>
          <p className="shortcuts">
            {view === 'sequence' ? (
              <span className="shortcuts-hint">{safeIndex === 0 ? 'Play or step forward to trace the exchange' : 'Select a revealed message to revisit'}</span>
            ) : (
              <span className="shortcuts-hint kbd-only">← → · Space: play/pause</span>
            )}
            {view === 'world' && <button type="button" className="scene-zoom" onClick={() => dialogRef.current?.showModal()}>Enlarge scene</button>}
          </p>
        </div>
        {view === 'sequence' ? <SequenceDiagram steps={steps} index={safeIndex} onSelect={go} playing={playing} name={M.auth} /> : <>
        <div className="scene-box">
          <div key={ceremony} className="scene-stage">
            <CeremonyScene ceremony={ceremony} T={T} mode={mode} step={step}/>
          </div>
          <div className="note">{M.note}</div>
        </div>
        </>}
        <div className="current-step">
          <div key={`${ceremony}-${mode}-${index}`} className="current-step-body">
            <span>{index + 1} / {steps.length} · {T.tags[step.tag]}</span>
            <h2>{step.t}</h2><p>{step.d}</p>
          </div>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{safeIndex + 1} / {steps.length}. {step.t}. {step.d}</p>

      </section>
        <section className="data" aria-labelledby="data-title">
          <h3 id="data-title">{step.tag === 'rp' ? T.dataRp : step.tag === 'auth' ? T.dataAuth : T.dataTransit}</h3>
          <div className="data-actions"><span>Illustrative</span><a href={appPath('/webauthn-decoder/') + '?sample=' + (mode === 'register' ? 'publickeycredential-json' : 'publickeycredential-authentication')}>Inspect complete sample</a></div>
          <pre key={`${ceremony}-${mode}-${index}`} className="data-pre">{step.data}</pre>
        </section>
      </div>
      <aside className="side">
        <section className="steps" aria-labelledby="steps-title">
          <h2 id="steps-title">{T.stepsTitle(mode, M.name)}</h2>
          <p className="h-sub">{T.stepsSub(steps.length)}</p>
          <ol className="list">{steps.map((item, i) => <li key={i} className={i === index ? 'active' : i < index ? 'done' : ''}>
            {(i === 0 || (i === 3) || i === steps.length - 2) && <p className="phase-label">{i === 0 ? 'Challenge' : i === 3 ? 'Authenticator' : 'Verification'}</p>}
            <button aria-current={i === index ? 'step' : undefined} onClick={() => go(i)}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span className="step-copy">
                <span className="t">{item.t}</span>
                <span className="d-wrap">
                  <span className="d-inner">
                    <span className="d">{item.d}<br /><span className={`tag ${item.tag}`}>{T.tags[item.tag]}</span></span>
                  </span>
                </span>
              </span>
            </button>
          </li>)}</ol>
        </section>

      </aside>
    </main>
    <PayloadGuide />
    <EducationalContent T={T}/>
    <dialog ref={dialogRef} aria-label="Enlarged scene" className="scene-dialog">
      <button className="btn" onClick={() => dialogRef.current?.close()}>Close</button>
      <div className="scene-zoom-scroll"><div><CeremonyScene ceremony={ceremony} T={T} mode={mode} step={step}/></div></div>
    </dialog>
  </div></div>;
}
