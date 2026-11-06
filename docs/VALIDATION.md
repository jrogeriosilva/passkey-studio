# Validação da aplicação única

## Reorganização de Lab e Inspect — 2026-11-06

- Node.js 24.20.0. Lint, 10 testes Node e 200 testes Vitest passaram. TypeScript e builds padrão e com `VITE_BASE_PATH=/passkey-studio/` passaram. O aviso de chunk principal acima de 500 kB permanece.
- Chromium no build com a base de publicação, em 1440, 390 e 320 px: navegação entre áreas, histórico, abas com teclado, cópia, rascunhos preservados e entradas longas, sem overflow horizontal nem erros de página.
- Inspect abre WebAuthn por padrão. Payloads enviados pelo Lab e links de amostras ativam WebAuthn, mesmo com Base64url previamente selecionada. A amostra sintética de attestation foi decodificada.
- Conversor: texto UTF-8 com espaços e quebras de linha, JSON formatado, bytes binários em hexadecimal, troca de entrada/saída, erros para entradas inválidas e descarte de resultados obsoletos ao editar.
- Lab: criação de credencial e assinatura simuladas, com inspeção das duas respostas completas. Hardware físico e servidores externos não foram testados nesta alteração.
- Capturas atualizadas de [Lab desktop](screenshots/Experimentar-desktop.png), [Lab mobile](screenshots/Experimentar-mobile.png), [WebAuthn desktop](screenshots/Inspecionar-desktop.png), [WebAuthn mobile](screenshots/Inspecionar-mobile.png), [Base64url desktop](screenshots/Inspecionar-base64url-desktop.png) e [Base64url mobile](screenshots/Inspecionar-base64url-mobile.png).

## Consolidação inicial

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
