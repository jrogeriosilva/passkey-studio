import type { Translations } from '../data/i18n';
export function EducationalContent({ T }: {
    T: Translations;
}) {
    return <>
  <div className="facts">
    <div className="fact"><b>{T.fact1t}</b><p>{T.fact1p}</p></div>
    <div className="fact"><b>{T.fact2t}</b><p>{T.fact2p}</p></div>
    <div className="fact"><b>{T.fact3t}</b><p>{T.fact3p}</p></div>
  </div>
  <section className="cta" aria-labelledby="ctaTitle">
    <h2 id="ctaTitle">{T.ctaTitle}</h2>
    <p className="cta-lede">{T.ctaLede}</p>
    <div className="cta-grid">
      <div className="cta-card">
        <h3>
          <svg className="cta-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 1.8v5.4L2.6 12.9A2 2 0 0 0 4.3 16h7.4a2 2 0 0 0 1.7-3.1L10 7.2V1.8"/><path d="M5 1.8h6"/><path d="M4.1 11h7.8"/></svg>
          FIDO2 Lab
        </h3>
        <p>{T.ctaLabP}</p>
        <a className="btn primary" href="https://jrogeriosilva.github.io/fido2-lab/">
          <span>{T.ctaLabBtn}</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h9"/><path d="M8.5 4.5 12 8l-3.5 3.5"/></svg>
        </a>
      </div>
      <div className="cta-card">
        <h3>
          <svg className="cta-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 1.5H5a2 2 0 0 0-2 2V6a2 2 0 0 1-2 2 2 2 0 0 1 2 2v2.5a2 2 0 0 0 2 2h1"/><path d="M10 1.5h1a2 2 0 0 1 2 2V6a2 2 0 0 0 2 2 2 2 0 0 0-2 2v2.5a2 2 0 0 1-2 2h-1"/></svg>
          WebAuthn Decoder
        </h3>
        <p>{T.ctaDecP}</p>
        <a className="btn" href="https://jrogeriosilva.github.io/webauthn-decoder/">
          <span>{T.ctaDecBtn}</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h9"/><path d="M8.5 4.5 12 8l-3.5 3.5"/></svg>
        </a>
      </div>
    </div>
  </section>

  <p className="disclaimer">{T.disclaimer}</p>
  </>;
}
