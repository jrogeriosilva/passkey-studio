# Passkey Studio

Uma aplicação React/TypeScript/Vite para aprender, experimentar e inspecionar FIDO2 e WebAuthn.

```sh
npm ci
npm run dev
```

Use Node.js 24. Abra **http://127.0.0.1:5173/**.

| Área | Recursos | Código |
| --- | --- | --- |
| Aprender | Cerimônias ilustradas, quatro autenticadores, português e inglês | `src/features/learn/` |
| Experimentar | Criação e assinatura, simulação e hardware, chaves, base64 e attestation | `src/features/lab/` |
| Inspecionar | Payloads WebAuthn, CBOR, envelopes JSON e registro AAGUID | `src/features/inspector/` |

Existe um único `package.json`, lockfile, servidor Vite, ponto de entrada React e build. O cabeçalho e a navegação são compartilhados. As rotas históricas `/fido2-demo/`, `/fido2-lab/` e `/webauthn-decoder/` agora abrem áreas da mesma SPA. A troca de área e os botões Voltar/Avançar não recarregam o documento. Campos não persistidos são reinicializados ao trocar de área.

```sh
npm run lint
npm test
npm run build
npm run preview
```

`npm test` executa os testes Node das cerimônias e os testes Vitest dos decodificadores e da navegação. O Lab também exige validação manual de seus fluxos. O build gera um único site em `dist/`. As três rotas recebem cópias do mesmo HTML de entrada para permitir acesso direto e atualização da página em servidores estáticos, incluindo GitHub Pages. Isso mantém uma única aplicação React e um único bundle compartilhado.

O Demo usa bytes ilustrativos. O Lab mantém chaves simuladas em localStorage apenas para desenvolvimento. O Inspector processa payloads no navegador. Dados de outras origens não são transferidos: localStorage depende da origem e credenciais WebAuthn dependem do RP ID.

Histórico e documentação original: [MIGRATION.md](MIGRATION.md), [docs/origins](docs/origins). Validação: [docs/VALIDATION.md](docs/VALIDATION.md). Os repositórios originais permanecem intactos. Repositório: https://github.com/jrogeriosilva/passkey-studio.

## GitHub Pages

Site: **https://jrogeriosilva.github.io/passkey-studio/**.

O workflow `.github/workflows/ci.yml` valida pushes em `main` e pull requests. Em `main`, publica automaticamente pelo ambiente `github-pages`, após lint, testes e build. Também aceita execução manual por `workflow_dispatch`. Pages usa a origem **GitHub Actions**, sem branch `gh-pages`.

O build de publicação define `VITE_BASE_PATH=/passkey-studio/`. Os assets, links internos e rotas usam essa base. Em desenvolvimento a base continua `/`, na porta 5173.

Para reproduzir o build de publicação:

```sh
VITE_BASE_PATH=/passkey-studio/ npm run build
VITE_BASE_PATH=/passkey-studio/ npm run preview
```

Acesse o prefixo `/passkey-studio/` no preview. As rotas públicas são `/passkey-studio/fido2-demo/`, `/passkey-studio/fido2-lab/` e `/passkey-studio/webauthn-decoder/`. As três abrem a mesma SPA.
