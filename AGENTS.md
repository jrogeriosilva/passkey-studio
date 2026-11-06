# Passkey Studio

Monorepositório com entrada estática e três módulos React/TypeScript/Vite em `apps/`.

- Use Node.js 24. `npm ci` instala a raiz e os módulos usando seus lockfiles.
- Comandos na raiz: `npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run preview`.
- Preserve `/fido2-demo/`, `/fido2-lab/` e `/webauthn-decoder/`.
- Preserve o estilo de cada módulo: Demo quatro espaços e ponto e vírgula; Lab dois espaços sem ponto e vírgula; Decoder conforme o entorno.
- Preserve assets, testes, idiomas, acessibilidade e a distinção entre ilustração, simulação e hardware.
- Decoder processa payloads no navegador. Nunca registrar payloads sensíveis ou chaves privadas.
- Lab guarda chaves simuladas no localStorage apenas para desenvolvimento.
- Demo usa testes Node; Decoder usa Vitest; Lab requer validação manual.
- Verifique UI no navegador em desktop e mobile. Execute lint, testes pertinentes e build.
- Use Conventional Commits.
- Workflows em `apps/*/.github/` são históricos e inativos neste layout. O workflow ativo fica na raiz.
