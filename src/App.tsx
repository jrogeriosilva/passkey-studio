import { Activity, useEffect, useState, type MouseEvent } from 'react';
import Learn from './features/learn/App';
import Lab from './features/lab/App';
import Inspector from './features/inspector/App';
import { appPath, routePath } from './navigation';

const areas = [
  { path: '/fido2-demo/', label: 'Aprender', description: 'Cerimônias FIDO2', Component: Learn, style: 'learn' },
  { path: '/fido2-lab/', label: 'Experimentar', description: 'Credenciais e challenges', Component: Lab, style: 'lab' },
  { path: '/webauthn-decoder/', label: 'Inspecionar', description: 'Payloads WebAuthn', Component: Inspector, style: 'inspector' },
];

export default function App() {
  const [path, setPath] = useState(routePath(window.location.pathname));
  const [inspection, setInspection] = useState<{ value: string; key: number }>();
  const area = areas.find(item => item.path === path || item.path.slice(0, -1) === path) ?? areas[0];
  useEffect(() => {
    const onPopState = () => { setPath(routePath(window.location.pathname)); window.dispatchEvent(new Event('studio:location')); };
    const inspect = (event: Event) => {
      setInspection({ value: (event as CustomEvent<string>).detail, key: Date.now() });
      window.history.pushState(null, '', appPath('/webauthn-decoder/'));
      setPath('/webauthn-decoder/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('studio:inspect', inspect);
    window.addEventListener('popstate', onPopState);
    return () => { window.removeEventListener('popstate', onPopState); window.removeEventListener('studio:inspect', inspect); };
  }, []);
  useEffect(() => { document.title = `${area.label} · Passkey Studio`; }, [area]);
  function navigate(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || !['/', ...areas.map(item => item.path)].some(path => path.replace(/\/$/, '') === routePath(url.pathname).replace(/\/$/, ''))) return;
    if (url.pathname === window.location.pathname && url.hash && !url.search) return;
    event.preventDefault();
    window.history.pushState(null, '', url.pathname + url.search + url.hash);
    if (url.searchParams.has('sample')) setInspection(undefined);
    setPath(routePath(url.pathname));
    window.dispatchEvent(new Event('studio:location'));
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (url.hash) requestAnimationFrame(() => document.getElementById(url.hash.slice(1))?.scrollIntoView());
  }
  const known = areas.some(item => item.path.replace(/\/$/, '') === path.replace(/\/$/, '')) || path === '/';
  return <div className="studio" lang="pt-BR" onClick={navigate}>
    <a className="studio-skip" href="#studio-content">Pular para o conteúdo</a>
    <header className="studio-header">
      <div className="studio-top"><a className="studio-brand" href={appPath()}>Passkey Studio</a><span>FIDO2 / WebAuthn</span></div>
      <nav className="studio-nav" aria-label="Áreas do Passkey Studio">
        {areas.map(item => <a key={item.path} href={appPath(item.path)} aria-current={area === item ? 'page' : undefined}><strong>{item.label}</strong><span>{item.description}</span></a>)}
      </nav>
    </header>
    <div id="studio-content" tabIndex={-1}>
      {!known && <p role="status" className="studio-route-notice">Área não encontrada. Você está em Aprender. <a href={appPath('/fido2-demo/')}>Abrir a rota Aprender</a></p>}
      {areas.map(item => <Activity key={item.path} mode={area === item ? 'visible' : 'hidden'}><div className={`${item.style}-feature`}>
        {item.style === 'inspector' ? <Inspector incomingInput={inspection} /> : item.style === 'learn' ? <Learn /> : <Lab />}
      </div></Activity>)}
    </div>
    <footer className="studio-footer"><p>Passkey Studio · Aprenda, experimente e inspecione WebAuthn</p><p>Payloads processados no navegador. Chaves simuladas são armazenadas localmente para desenvolvimento.</p><nav aria-label="Referências"><a href="https://www.w3.org/TR/webauthn-3/" target="_blank" rel="noopener noreferrer">WebAuthn</a><a href="https://fidoalliance.org/specifications/" target="_blank" rel="noopener noreferrer">FIDO Alliance</a></nav></footer>
  </div>;
}
