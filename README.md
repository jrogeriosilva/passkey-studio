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

`npm test` executa os testes Node das cerimônias e os testes Vitest dos decodificadores e da navegação. O Lab também exige validação manual de seus fluxos. O build gera um único site em `dist/`. Configure o servidor estático para devolver `index.html` nas rotas da aplicação. A hospedagem é na raiz do domínio; subdiretórios exigem configurar base e rotas.

O Demo usa bytes ilustrativos. O Lab mantém chaves simuladas em localStorage apenas para desenvolvimento. O Inspector processa payloads no navegador. Dados de outras origens não são transferidos: localStorage depende da origem e credenciais WebAuthn dependem do RP ID.

Histórico e documentação original: [MIGRATION.md](MIGRATION.md), [docs/origins](docs/origins). Validação: [docs/VALIDATION.md](docs/VALIDATION.md). Os repositórios originais permanecem intactos. O repositório é local, sem remote configurado.
