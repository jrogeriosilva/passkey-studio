# Correções das críticas do Passkey Studio

Implementação na branch `fix/critique-complete`, na worktree `/home/joser/.codex/worktrees/2a15/passkey-studio`. A checkout original foi preservada. Escopo: os quatro snapshots de 6 de novembro de 2026 indicados pelo responsável pelo produto, incluindo observações menores. O relatório não atribui uma nova nota heurística.

## Cobertura dos 15 itens do backlog mestre

| Item original | Situação nesta branch | Implementação e evidência |
| --- | --- | --- |
| 1 · Inspector P0 | Corrigido | `decodeFullCredential` usa o parser binário, preserva signature/userHandle e reporta clientDataJSON inválido. JSON tem bytes UTF-8 reais; authenticatorData isolado exige consumo exato; BE/BS aparecem; Base64 padrão recebe orientação; primitivos CBOR são renderizáveis. Quatro regressões falharam antes da correção e passaram depois. |
| 2 · Lab: fronteira de segurança | Corrigido | Simulação amarela, hardware com semântica própria; aviso contextual de SubtleCrypto/localStorage; cópia e exportação públicas omitem chaves privadas. Backup privado exige ação e confirmação explícitas, é identificado como material de teste e não passa pelo clipboard. |
| 3 · Lab: contrato funcional | Corrigido | Geração automática de par exclusivo, consumo de chave pré-gerada após salvar, opções hardware preservadas com conversão binária, validação de RP ID, contador persistido após cada assinatura. Testes de opções e simulação criptográfica; percurso real do navegador com autenticador virtual. |
| 4 · Lab: cópia e fluxo | Corrigido | Strings são copiadas sem aspas; todas as abas mantêm estado; criar → assinar → inspecionar funciona com transferência em memória. Rótulos de cópia identificam os campos e falhas recebem feedback. |
| 5 · Learn: cabeçalho sobreposto | Corrigido | Cabeçalho legado removido, idioma junto ao título e CSS morto eliminado. Não há elemento sticky transparente. |
| 6 · Lab: cabeçalho e cards | Corrigido | Seletor nativo de modo no cabeçalho do painel; badge redundante removido; gerador e seções de armazenamento/atestação sem molduras concêntricas. Campos de código mantêm suas bordas de entrada. |
| 7 · Learn: hierarquia e mobile | Corrigido | Cena, controles e dados formam uma coluna; dados precedem a lista no mobile; fases Desafio/Autenticador/Verificação; descrição ativa não é duplicada. Em 1280×800, o painel inicial de dados termina em aproximadamente y=791. |
| 8 · Inspector: árvore touch e menu | Corrigido | Botões participam do fluxo das linhas; 31 alvos medidos com mínimo de 44×44 px e nenhuma sobreposição no estado expandido. Menu limitado à viewport, agrupado em seções de até quatro exemplos. |
| 9 · Learn: teclado e acessibilidade | Corrigido | Setas continuam funcionando após clique em controles; região viva independente do layout; descrições recolhidas usam visibility; foco não é cortado. Seleções exclusivas têm radiogroup/radio, roving tabindex e setas/Home/End. |
| 10 · Learn: narrativa e pontes | Corrigido | Registro como abertura; etapa proporcional ao comparar modos/autenticadores; selo Ilustrativo; link para exemplo completo de registro/autenticação no Inspector; nomes Aprender/Experimentar/Inspecionar. |
| 11 · Inspector: idioma | UI corrigida; arte parcialmente localizada | UI, exemplos, diagnósticos e guia em português; termos WebAuthn canônicos preservados; formatação pt-BR; kicker e apresentação de produto avulso removidos. Diagramas históricos preservados com descrições em português indicando o idioma da arte. |
| 12 · Lab: idioma e binários | Corrigido | Interface em português; todas as abas aparecem em mobile; bytes não UTF-8 são mostrados como hex com informação de formato, sem mojibake; Uint8Array vira hex na árvore e na cópia JSON. O parser de atestação é compartilhado com o Inspector. |
| 13 · Learn: tipografia e lang | Mitigado com ampliação | Geist Mono compartilhada; tags acima de 11 px; SVG tem ampliação acessível e rótulos mínimos de 10 unidades; pseudocódigo quebra linhas; contador permanece em uma linha; rótulo móvel do pacote permanece dentro da cena. Idioma de Learn é local e não altera html/shell. |
| 14 · Inspector: ruído e estados | Corrigido | Cabeçalho compacto e aviso local único; erros coerentes na entrada e no resultado; guia com medida de leitura e definições; foco e alvos de toque específicos do Inspector escopados. |
| 15 · Inspector: preservação e eficiência | Corrigido | Estado preservado ao alternar áreas, sem persistência de payloads; expandir/recolher tudo, hex/base64url e cópia de subárvores; rawEntries/rawJSON/x5c recolhidos inicialmente; desfazer exemplo; Ctrl/Cmd+Enter; override do formato de entrada. |

## Costuras transversais e observações menores

- **Navegação:** React Activity mantém o estado e desativa efeitos das áreas ocultas, inclusive timer e atalhos de Learn. Query/hash são preservados, scroll de troca de rota é imediato e a rota desconhecida exibe orientação e link canônico. Testes cobrem histórico, cliques modificados e base de publicação.
- **Deep links:** Learn aceita `ceremony`, `mode` e `step`, com validação e limites. Inspector aceita `sample` para fixtures sintéticas; payloads de trabalho não entram em URLs. Exemplo: `/fido2-demo/?ceremony=phone&mode=register&step=4`.
- **Taxonomia e idioma:** shell permanece pt-BR; Learn mantém PT/EN e preferência persistida. O padrão novo é português, inclusive quando o armazenamento está indisponível. A meta description duplicada em Learn foi removida.
- **Toque e foco do shell:** marca e links do rodapé têm área mínima de 44 px; skip link tem contraste, borda e alvo focalizável; rodapé usa text-wrap: pretty.
- **Learn:** controles de seleção usam cor menos luminosa; no último passo, reprodução vira Repetir/Replay; zoom da cena fecha com Escape; fatos, CTAs e rotas históricas foram preservados.
- **Lab:** exemplos sintéticos completos, restauração de opções, novo challenge criptograficamente aleatório e Ctrl/Cmd+Enter. O seletor de credencial permanece disponível após seleção automática. Exclusão de chaves e credenciais pede confirmação; falhas de armazenamento não produzem confirmação falsa. Importação valida a estrutura e tenta restaurar o estado anterior em falhas de gravação.
- **Hardware e origem:** o navegador rejeitou RP ID numérico em 127.0.0.1. O Lab orienta abrir a mesma aplicação em localhost no desenvolvimento; criação e assinatura com autenticador virtual passaram nessa origem. A política editada no JSON é respeitada; não é substituída pela credencial selecionada.
- **Inspector:** diagnóstico compacto de origem/cerimônia, contador e flags; legenda inline das flags e dos rótulos COSE em rawEntries; exemplo de autenticação JSON e AAGUID do catálogo público com bytes de credencial sintéticos. Diálogo tem botão de fechar identificável e cores de sucesso usam tokens.
- **Limpeza:** removidos CSS dos antigos cabeçalhos/navegações e módulos GithubIcon/links sem consumidores. Não foi criada dependência, subaplicação, proxy nem servidor de backend.
- **Persistência e privacidade:** preservação entre áreas ocorre em memória. Recarregar descarta o Inspector. Limpar remove a entrada e seu undo. O armazenamento de chaves simuladas continua restrito ao Lab e tem aviso contextual. Evidências contêm somente exemplos sintéticos e nenhum material privado.

As perguntas exploratórias dos relatórios foram usadas para orientar o fluxo integrado, a bancada lado a lado, o resumo de diagnóstico e o guia contextual. Não se adicionou um verificador de domínio remoto: a ferramenta permanece local, e decodificar não equivale a validar assinaturas, cadeia de certificados ou conformidade de um RP. A referência técnica é [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/).

## Validação

- Node.js 24.20.0.
- `npm run lint`: passou.
- `npm test`: passou: 19 testes Node das cerimônias e 192 testes Vitest (211 no total).
- `npm run build`: passou.
- `VITE_BASE_PATH=/passkey-studio/ npm run build`: passou; preview de produção em `/passkey-studio/` retornou HTTP 200 para as três rotas, com links sob a base correta e decodificação de exemplo de autenticação sem erros.
- `git diff --check`: passou.
- Detector Impeccable executado sobre `src`: um aviso de fonte Geist em `src/index.css`. Exceção deliberada e localizada: é a fonte incumbente do produto; uma troca de identidade visual não faz parte desta correção. Nenhuma supressão foi adicionada.
- Playwright/Chromium: três áreas em 1280×800, 768×1024 e 390×844, sem overflow horizontal ou alertas inesperados nos estados verificados; teclado, navegação, zoom, menu, undo e árvore expandida.
- **Simulação:** criação com chave automática, duas assinaturas sucessivas (contadores 1 e 2), transferência para Inspector e preservação após trocar de área. Também foram verificados pelo navegador: geração e consumo de chave pré-gerada, cópias públicas sem material privado, download de JSON público e decodificação manual de atestação. Teste usa WebCrypto para gerar e assinar com uma chave de teste efêmera.
- **API WebAuthn com autenticador virtual:** criação, assinatura e inspeção por Chromium/CDP, em localhost; não é simulação pelo código do Lab.
- **Hardware físico:** não executado. USB/NFC, biometria/TPM e telefone reais precisam de dispositivos e interação física. O resultado com autenticador virtual não comprova compatibilidade de hardware nem certificação.
- O build conserva o aviso de bundle acima de 500 kB; ele não impede a geração nem caracteriza conclusão de um trabalho de otimização de performance.

## Capturas finais

| Área | Desktop | Mobile |
| --- | --- | --- |
| Aprender | [1280 px](screenshots/fido2-demo-1280.png) | [390 px](screenshots/fido2-demo-390.png) |
| Experimentar | [1280 px](screenshots/fido2-lab-1280.png) | [390 px](screenshots/fido2-lab-390.png) |
| Inspecionar | [1280 px](screenshots/webauthn-decoder-1280.png) | [390 px](screenshots/webauthn-decoder-390.png) |

Os snapshots de origem permanecem históricos e intactos. A resolução acima se aplica à branch desta worktree; ela não declara que a checkout original ou a publicação em main já receberam as mudanças.

## Reconferência após a entrega

A afirmação de fechamento integral foi ampla demais. A reconferência encontrou e corrigiu três omissões: tamanho em bytes e formatação JSON no conversor Base64, nomes das coordenadas COSE no Lab e um CTA em inglês que ainda dizia Open the Decoder. Dois testes adicionais cobrem o conversor; lint, 211 testes e ambos os builds passaram novamente. Playwright confirmou o conversor em desktop/mobile sem overflow e os rótulos COSE; detector dos alvos do complemento sem achados.

Permanecem ressalvas explícitas: os diagramas históricos do Inspector ainda contêm texto em inglês, com descrição em português; os menores textos da cena Learn precisam do recurso Ampliar para leitura confortável, em vez de serem plenamente legíveis em repouso. Esses dois aspectos são parciais, não um fechamento visual integral. Hardware físico permanece sem validação; o resultado disponível é de autenticador virtual.
