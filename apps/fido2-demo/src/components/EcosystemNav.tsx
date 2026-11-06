export function EcosystemNav({ portuguese = false }: { portuguese?: boolean }) {
  const links = [
    ['demo', 'fido2-demo', portuguese ? 'Entender' : 'Understand', 'FIDO2 Demo'],
    ['lab', 'fido2-lab', portuguese ? 'Experimentar' : 'Experiment', 'FIDO2 Lab'],
    ['decoder', 'webauthn-decoder', portuguese ? 'Inspecionar' : 'Inspect', 'WebAuthn Decoder'],
  ]
  return <nav className="ecosystem-nav" aria-label="FIDO2 ecosystem">
    {links.map(([id, path, action, name]) => <a key={id}
      href={`https://jrogeriosilva.github.io/${path}/`}
      aria-current={id === 'demo' ? 'page' : undefined}>
      <span>{action}</span><span>{name}</span>
    </a>)}
  </nav>
}
