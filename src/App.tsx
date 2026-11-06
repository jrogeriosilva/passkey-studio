import { useEffect, useState, type MouseEvent } from 'react';
import Learn from './features/learn/App';
import Lab from './features/lab/App';
import Inspector from './features/inspector/App';

const areas = [
  { path: '/fido2-demo/', label: 'Aprender', description: 'Cerimônias FIDO2', Component: Learn, style: 'learn' },
  { path: '/fido2-lab/', label: 'Experimentar', description: 'Credenciais e challenges', Component: Lab, style: 'lab' },
  { path: '/webauthn-decoder/', label: 'Inspecionar', description: 'Payloads WebAuthn', Component: Inspector, style: 'inspector' },
];

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const area = areas.find(item => item.path === path || item.path.slice(0, -1) === path) ?? areas[0];
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => { document.title = `${area.label} · Passkey Studio`; }, [area]);
  function navigate(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || url.hash || !['/', ...areas.map(item => item.path)].includes(url.pathname)) return;
    event.preventDefault();
    window.history.pushState(null, '', url.pathname);
    setPath(url.pathname);
    window.scrollTo(0, 0);
  }
  const Feature = area.Component;
  return <div className="studio" onClick={navigate}>
    <a className="studio-skip" href="#studio-content">Pular para o conteúdo</a>
    <header className="studio-header">
      <div className="studio-top"><a className="studio-brand" href="/">Passkey Studio</a><span>FIDO2 / WebAuthn</span></div>
      <nav className="studio-nav" aria-label="Áreas do Passkey Studio">
        {areas.map(item => <a key={item.path} href={item.path} aria-current={area === item ? 'page' : undefined}><strong>{item.label}</strong><span>{item.description}</span></a>)}
      </nav>
    </header>
    <div id="studio-content" className={`${area.style}-feature`}><Feature /></div>
    <footer className="studio-footer"><p>Passkey Studio · Aprenda, experimente e inspecione WebAuthn</p><p>Payloads processados no navegador. Chaves simuladas são armazenadas localmente para desenvolvimento.</p><nav aria-label="Referências"><a href="https://www.w3.org/TR/webauthn-3/" target="_blank" rel="noopener noreferrer">WebAuthn</a><a href="https://fidoalliance.org/specifications/" target="_blank" rel="noopener noreferrer">FIDO Alliance</a></nav></footer>
  </div>;
}
