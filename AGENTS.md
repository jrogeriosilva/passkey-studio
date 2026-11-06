# Repository Guidelines

## Estrutura e arquitetura

Passkey Studio é uma única SPA Vite/React/TypeScript, com `package.json` e lockfile na raiz. Não crie subaplicações ou servidores proxy.

- `src/main.tsx`: entrada; `src/App.tsx`: shell e navegação.
- `src/lib/`: utilitários compartilhados; `src/test-setup.ts`: ambiente de testes da SPA.
- `src/features/{learn,lab,inspector}/`: áreas e seus componentes, dados e utilitários.
- `public/`: assets estáticos; `docs/`: documentação e capturas atuais. O histórico anterior à consolidação está no Git.
- `src/features/inspector/index.css`: tema Tailwind compartilhado; `src/index.css`: shell. Mantenha estilos específicos de Learn e Lab dentro de CSS `@scope`.

## Comandos de desenvolvimento

Use Node.js 24 e execute na raiz:

- `npm ci`: instala dependências pelo lockfile.
- `npm run dev`: inicia Vite em `http://127.0.0.1:5173/`.
- `npm run lint`: executa ESLint.
- `npm test`: executa testes Node das cerimônias e Vitest.
- `npm run build`: verifica TypeScript, gera `dist/` e entradas das rotas estáticas.
- `npm run preview`: serve o build localmente.

## Estilo e nomenclatura

Use TypeScript estrito e indentação de dois espaços. Preserve aspas, ponto e vírgula e formatação do arquivo existente; os módulos possuem estilos diferentes. Use PascalCase para componentes React e camelCase para funções e variáveis; siga a nomenclatura local dos arquivos. ESLint configura regras de TypeScript e React Hooks. Preserve assets, idiomas e acessibilidade.

## Testes e validação

Testes de cerimônias ficam em `src/features/learn/tests/*.test.mjs`. Testes Vitest usam `*.test.ts` ou `*.test.tsx` junto ao código, com jsdom e Testing Library. Não há percentual mínimo de cobertura configurado; cubra mudanças de comportamento e regressões.

Para alterações de código, execute lint, testes e build. Para UI, verifique desktop e mobile, teclado, navegação e ausência de overflow. Valide manualmente os fluxos afetados do Lab; informe separadamente resultados de simulação e hardware.

## Commits e pull requests

Use Conventional Commits, como `feat:`, `fix(ui):` e `refactor:`, seguindo o histórico recente. Inclua apenas arquivos relacionados. PRs devem explicar problema, mudança, validações e limitações; vincule issues quando houver e inclua capturas para mudanças visuais.

## Rotas, publicação e segurança

Preserve `/fido2-demo/`, `/fido2-lab/` e `/webauthn-decoder/`. Use `appPath` para links e `routePath` para interpretar caminhos em `src/navigation.ts`; mantenha `scripts/pages-entries.mjs` alinhado às rotas. Valide publicação com `VITE_BASE_PATH=/passkey-studio/ npm run build`. O workflow `.github/workflows/ci.yml` valida PRs e publica `main`.

Learn é ilustrativo; Lab distingue simulação e hardware, armazenando chaves simuladas em localStorage apenas para desenvolvimento. Inspector processa payloads localmente. Nunca registre ou commite chaves privadas ou payloads sensíveis; use fixtures sintéticas.
