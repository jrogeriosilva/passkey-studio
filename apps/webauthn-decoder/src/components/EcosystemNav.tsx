export function EcosystemNav() {
  const links = [
    ['studio', '', 'Passkey Studio', 'Home'],
    ['demo', 'fido2-demo', 'Understand', 'FIDO2 Demo'],
    ['lab', 'fido2-lab', 'Experiment', 'FIDO2 Lab'],
    ['decoder', 'webauthn-decoder', 'Inspect', 'WebAuthn Decoder'],
  ]
  return <nav className="ecosystem-nav" aria-label="Passkey Studio">
    {links.map(([id, path, action, name]) => <a key={id}
      href={path ? `/${path}/` : "/"}
      aria-current={id === 'decoder' ? 'page' : undefined}>
      <span>{action}</span><span>{name}</span>
    </a>)}
  </nav>
}
