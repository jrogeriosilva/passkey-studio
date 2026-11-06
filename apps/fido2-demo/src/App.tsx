import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { I18N, detectLanguage } from './data/i18n';
import type { Actor, Ceremony, Language, Mode } from './data/types';
import { createCeremonies } from './data/ceremonies';
import { CeremonyScene } from './components/CeremonyScene';
import { EducationalContent } from './components/EducationalContent';
import { EcosystemNav } from './components/EcosystemNav';
import { AuthenticatorIcon } from './components/AuthenticatorIcon';

const positions: Record<Actor, number> = { rp: 14, client: 50, auth: 86 };
const lanePositions: Record<Actor, number> = { rp: 0, client: 0.5, auth: 1 };

const authenticators = [
    ['usb', 'tabUsb', 'tabUsbSub'], ['nfc', 'tabNfc', 'tabNfcSub'],
    ['hello', 'tabHello', 'tabHelloSub'], ['phone', 'tabPhone', 'tabPhoneSub'],
] as const;

function RailNodeIcon({ actor, ceremony }: {
    actor: Actor;
    ceremony: Ceremony;
}) {
    if (actor === 'rp') {
        return (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="2.5" width="11" height="4.5" rx="1"/>
                <rect x="2.5" y="9" width="11" height="4.5" rx="1"/>
                <circle cx="5" cy="4.75" r=".7" fill="currentColor" stroke="none"/>
                <circle cx="5" cy="11.25" r=".7" fill="currentColor" stroke="none"/>
            </svg>
        );
    }
    if (actor === 'client') {
        return (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2.5" width="12" height="11" rx="1.8"/>
                <path d="M2 6h12"/>
                <circle cx="4.3" cy="4.25" r=".55" fill="currentColor" stroke="none"/>
                <circle cx="6.2" cy="4.25" r=".55" fill="currentColor" stroke="none"/>
            </svg>
        );
    }
    return <AuthenticatorIcon ceremony={ceremony}/>;
}

export default function App() {
    const [language, setLanguage] = useState<Language>(detectLanguage);
    const [ceremony, setCeremony] = useState<Ceremony>('usb');
    const [mode, setMode] = useState<Mode>('login');
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const T = I18N[language];
    const definition = useMemo(() => createCeremonies(T)[ceremony], [T, ceremony]);
    const steps = useMemo(() => definition.steps(mode), [definition, mode]);
    const step = steps[index];
    const M = T[ceremony];
    const stepDuration = step.dur ?? 2800;

    useEffect(() => {
        document.documentElement.lang = T.htmlLang;
        try {
            localStorage.setItem('fido2demo.lang', language);
        }
        catch { /* Storage is optional. */ }
    }, [language, T]);

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
        const onKey = (event: KeyboardEvent) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
                return;
            if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable="true"]'))
                return;
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                go(index + 1);
            }
            else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                go(index - 1);
            }
            else if (event.key === ' ') {
                event.preventDefault();
                togglePlayback();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [index, go, togglePlayback]);

    const pktKey = `${ceremony}-${mode}-${language}-${index}`;
    const pktMeta = step.pkt ? (() => {
        const from = lanePositions[step.pkt.from];
        const to = lanePositions[step.pkt.to];
        const forward = to >= from;
        return {
            fromPct: `${from * 100}%`,
            toPct: `${to * 100}%`,
            segLeft: `${Math.min(from, to) * 100}%`,
            segWidth: `${Math.abs(to - from) * 100}%`,
            dirClass: forward ? 'fwd' : 'rev',
        };
    })() : null;

    return <>
    <header className="suite-header"><div className="suite-header-inner">
      <a className="suite-brand" href="#top"><span className="suite-mark" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg></span><span className="suite-brand-copy"><span className="suite-title">FIDO2 Demo</span><span className="suite-subtitle">FIDO2 · WebAuthn</span></span></a>
      <div className="suite-actions">      <div className="lang">
        <svg className="globe" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13"/></svg>
        <div className="seg" role="group" aria-label={T.ariaLang}>
          {(['pt', 'en'] as const).map(lang => <button key={lang} aria-pressed={language === lang} lang={lang === 'pt' ? 'pt-BR' : 'en'} title={lang === 'pt' ? 'Português' : 'English'} onClick={() => { setPlaying(false); setLanguage(lang); }}>{lang.toUpperCase()}</button>)}
        </div>
      </div>
      <a className="suite-github" href="https://github.com/jrogeriosilva/fido2-demo" target="_blank" rel="noopener noreferrer" aria-label={language === 'pt' ? 'Ver código no GitHub' : 'View source on GitHub'} title={language === 'pt' ? 'Ver código no GitHub' : 'View source on GitHub'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
      </a></div>
    </div></header>
    <div className="wrap" id="top">
    <title>{T.title}</title>
    <meta name="description" content={T.metaDesc}/>
    <EcosystemNav portuguese={language === 'pt'}/>
    <header>
      <div className="head-text">
        <h1>{T.h1}</h1>
        <p className="lede">{T.lede}</p>
      </div>
    </header>
    <div className="selector">
      <div className="tabs" role="group" aria-label={T.ariaAuth}>
        {authenticators.map(([id, title, subtitle]) => <button key={id} className="tab" aria-pressed={ceremony === id} onClick={() => { go(0); setCeremony(id); }}>
          <AuthenticatorIcon ceremony={id}/>
          <span><span>{T[title]}</span><span className="tab-sub">{T[subtitle]}</span></span>
        </button>)}
      </div>
      <div className="seg" role="group" aria-label={T.ariaMode}>
        {(['login', 'register'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => { go(0); setMode(value); }}>{value === 'login' ? T.modeLogin : T.modeRegister}</button>)}
      </div>
    </div>
    <main className="main" style={{ '--step-dur': `${stepDuration}ms` } as CSSProperties}>
      <section className={`stage ${playing ? 'is-playing' : ''}`} aria-label={T.ariaStage}>
        <div className="rail">
          <div className="track">
            {pktMeta && <i key={pktKey} className={`track-seg ${pktMeta.dirClass}`} style={{ left: pktMeta.segLeft, width: pktMeta.segWidth }}/>}
          </div>
          {(['rp', 'client', 'auth'] as const).map(actor => {
              const isOn = step.who === actor;
              const isSender = step.pkt?.from === actor;
              const isReceiver = step.pkt?.to === actor;
              const cls = ['node', isOn ? 'on' : '', isSender ? 'sending' : '', isReceiver ? 'receiving' : ''].filter(Boolean).join(' ');
              return (
                  <div key={actor} className={cls} style={{ left: `${positions[actor]}%` }}>
                    <i><RailNodeIcon actor={actor} ceremony={ceremony}/></i>
                    <span>{actor === 'rp' ? T.nodeRp : actor === 'client' ? T.nodeClient : M.auth}</span>
                  </div>
              );
          })}
          {step.pkt && pktMeta && (
              <div className="pkt-lane" aria-hidden="true">
                <div key={pktKey} className={`pkt-runner ${pktMeta.dirClass}`} style={{ '--from-x': pktMeta.fromPct, '--to-x': pktMeta.toPct } as CSSProperties}>
                  <div className="pkt show">
                    <i className="pkt-tail"/>
                    <i className="pkt-dot"/>
                    <span className="pkt-label">{step.pkt.label}</span>
                  </div>
                </div>
              </div>
          )}
        </div>
        <div className="scene-box">
          <div key={ceremony} className="scene-stage">
            <CeremonyScene ceremony={ceremony} T={T} mode={mode} step={step} states={definition.states[step.st] ?? []}/>
          </div>
          <div className="note">{M.note}</div>
        </div>
        <div className="current-step" aria-live="polite" aria-atomic="true">
          <div key={`${ceremony}-${mode}-${index}`} className="current-step-body">
            <span>{index + 1} / {steps.length} · {T.tags[step.tag]}</span>
            <h2>{step.t}</h2><p>{step.d}</p>
          </div>
        </div>
        <div className="controls">
          <button className="btn" onClick={() => go(0)}>{T.reset}</button>
          <button className="btn" disabled={index === 0} onClick={() => go(index - 1)}>{T.prev}</button>
          <button className="btn primary" onClick={togglePlayback}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{playing ? <><rect x="3" y="2.5" width="3.5" height="11" rx="1"/><rect x="9.5" y="2.5" width="3.5" height="11" rx="1"/></> : <path d="M4 2.5v11l9-5.5z"/>}</svg>
            {playing ? T.pause : T.play}
          </button>
          <button className="btn" disabled={index === steps.length - 1} onClick={() => go(index + 1)}>{T.next}</button>
          <div className="progress" aria-hidden="true">
            <i className="progress-fill" style={{ transform: `scaleX(${(index + 1) / steps.length})` }}/>
            {playing && <b key={`play-${ceremony}-${mode}-${index}`} className="progress-timer"/>}
          </div>
          <span className="counter" role="status">{index + 1} / {steps.length}</span>
        </div>
      </section>
      <aside className="side">
        <section className="steps" aria-labelledby="steps-title">
          <h2 id="steps-title">{T.stepsTitle(mode, M.name)}</h2>
          <p className="h-sub">{T.stepsSub(steps.length)}</p>
          <ol className="list">{steps.map((item, i) => <li key={i} className={i === index ? 'active' : i < index ? 'done' : ''}>
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
        <section className="data" aria-labelledby="data-title">
          <h3 id="data-title">{step.tag === 'rp' ? T.dataRp : step.tag === 'auth' ? T.dataAuth : T.dataTransit}</h3>
          <pre key={`${ceremony}-${mode}-${index}`} className="data-pre">{step.data}</pre>
        </section>
      </aside>
    </main>
    <EducationalContent T={T}/>
  </div></>;
}
