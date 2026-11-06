# Validação da aplicação única

Node.js 24.20.0, Linux. Validação em 2026-11-05 (America/Sao_Paulo).

- `npm run lint`: passou.
- `npm test`: 19 testes Node das cerimônias e 175 testes Vitest passaram, totalizando 194. Dois testes novos cobrem navegação SPA, entrada direta, histórico e links com modificadores.
- `npm run build`: TypeScript e build Vite passaram. O build possui um único index.html e entrada JavaScript, além de assets e chunks auxiliares.
- Há apenas um package.json, lockfile e createRoot no projeto. Não há proxies ou servidores internos.
- Browser real em desenvolvimento: navegação pelas três áreas conserva um marcador no objeto window, comprovando ausência de recarga do documento. Voltar também funciona.
- Browser real no build final: entrada direta nas três rotas, em 1440 e 390 px, retornou HTTP 200, sem overflow horizontal e sem erros de página JavaScript.
- Lab: geração ES256, criação de credencial simulada e assinatura de challenge passaram na aplicação integrada. Dados temporários removidos após o teste.
- Capturas atualizadas em `docs/screenshots/`, para as três áreas em desktop e mobile.

Limites: hardware físico e integração com servidores externos não foram testados. A consolidação reportou 12 vulnerabilidades nas dependências (2 baixas e 10 moderadas). O build aponta um chunk principal acima de 500 kB; a divisão adicional por área pode ser feita separadamente. Os campos não persistidos reiniciam ao trocar de área.

Os históricos Git de origem permanecem preservados e os repositórios originais não foram alterados. Estilos específicos são contidos por CSS @scope; os navegadores de destino precisam suportar esse recurso.

## Preparação do GitHub Pages

- Build com `VITE_BASE_PATH=/passkey-studio/`.
- Teste adicional da navegação e histórico sob a base do projeto: total de 195 testes (19 Node e 176 Vitest).
- Entradas estáticas das três rotas contêm o mesmo HTML e referências ao bundle compartilhado. Não dependem de fallback SPA ou redirecionamento por 404.
- Workflow com validação em pull requests e publicação apenas de `main`, usando artefato Pages e autenticação OIDC.
