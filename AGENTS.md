# Passkey Studio

Uma aplicação Vite/React/TypeScript, com um package.json e lockfile na raiz.

- Use Node.js 24 e comandos na raiz: npm ci, npm run dev, npm run lint, npm test, npm run build.
- Entrada: src/main.tsx; shell e navegação: src/App.tsx.
- Áreas: src/features/learn, src/features/lab e src/features/inspector.
- Preserve os caminhos históricos como rotas da mesma SPA. Não criar subaplicações ou servidores proxy.
- Theme Tailwind compartilhado em src/features/inspector/index.css; estilos específicos de Learn e Lab usam CSS @scope. Estilos do shell em src/index.css.
- Preserve formatação local, assets, testes, idiomas e acessibilidade.
- Learn é ilustrativo; Lab distingue simulação e hardware. Chaves simuladas no localStorage destinam-se a desenvolvimento. Inspector processa payloads localmente.
- Nunca registrar ou commitar chaves privadas ou payloads sensíveis.
- Testes Node das cerimônias e Vitest para TS/TSX. Verificar UI em desktop e mobile, além de lint e build.
- Use Conventional Commits.
