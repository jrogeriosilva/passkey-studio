# Validação do Passkey Studio

Limpeza pós-migração validada em 2026-11-06, com Node.js 24.20.0, npm 12.0.2 e Chromium via Playwright. O histórico anterior permanece no Git.

## Análise e remoções

A revisão cruzou imports TypeScript, consumidores de exports, referências a assets, seletores CSS, classes e variáveis usadas pelos componentes, documentação e conteúdo do build. Arquivos históricos não foram tratados como dependências da aplicação atual.

- **Projetos de origem:** removidos `MIGRATION.md` e `docs/origins/`, incluindo instruções antigas de Claude/Copilot, memórias Serena, críticas importadas e configuração shadcn com aliases e caminhos obsoletos.
- **Documentação:** removidos relatórios e capturas intermediários com fluxos, idioma e diagramas superados. README, PRODUCT e AGENTS agora descrevem os caminhos e capacidades atuais. As seis capturas abaixo foram renovadas no build de publicação.
- **Publicação:** removidos o `404.html` que redirecionava para o antigo Lab independente, `.nojekyll`, favicons não utilizados e logos de Vite/React. O favicon ativo passou a `public/favicon.svg`. As três entradas estáticas e os caminhos públicos foram preservados.
- **Dependências:** removidos `@base-ui-components/react`, `react-json-view-lite` e `shadcn`. O Lab usa primitivas locais; o Inspector usa `@base-ui/react` e sua própria árvore. O CSS importado de shadcn só oferecia utilitários sem consumidores. O lockfile perdeu 202 entradas, sem adicionar pacotes nem mudar as versões mantidas. Tailwind, animações, fontes, CBOR e Shiki continuam em uso.
- **Código:** removidos `CodeBlock`, o textarea órfão do Lab, `CardFooter`, `verifySignature`, `getGeneratedKeyById`, imports e exports sem consumidores. A função `cn` foi centralizada em `src/lib/utils.ts`, e o ambiente de testes em `src/test-setup.ts`.
- **Learn:** removidos os quatro SVGs substituídos pelos diagramas interativos, estilos e animações das antigas cenas, mapas de estados ignorados, metadados de telas que já não são renderizadas e textos sem consumidores. As mensagens exibidas pela cena atual foram preservadas em `Step.message`.
- **CSS:** removidos tokens de gráficos/sidebar sem uso, seletores abandonados e cópias dos tokens compartilhados no Lab. Mantidos o tema comum e o isolamento de Learn/Lab por `@scope`.
- **Prevenção:** o build TypeScript agora rejeita declarações e parâmetros não utilizados; a exceção ESLint para exportar variantes de componentes foi removida junto com esses exports.

A verificação final de alcançabilidade encontrou 96 arquivos TypeScript alcançáveis pela entrada da SPA ou pelos testes, sem módulos órfãos ou imports locais não resolvidos. Utilitários de protocolo e estruturas usados pela aplicação ou por verificações de regressão foram preservados.

## Verificações automatizadas

Passaram após uma instalação limpa com `npm ci`:

- `npm run lint`.
- `npm test`: 10 testes Node de cerimônias e 202 testes Vitest, em 23 arquivos.
- `npm run build`: TypeScript e build Vite padrão.
- `VITE_BASE_PATH=/passkey-studio/ npm run build`: build de publicação e geração das três entradas estáticas.

No build padrão, o CSS passou de **115,13 kB para 87,09 kB**, redução aproximada de **24%**. O JavaScript principal passou de 713,74 kB para 711,61 kB. Os valores são tamanhos minificados sem gzip, reportados pelo Vite.

## Navegador

- As três áreas foram abertas diretamente no preview sob `/passkey-studio/`, em larguras de 1440, 390 e 320 px: HTTP 200, sem overflow horizontal nem erros JavaScript.
- Comparação pixel a pixel das nove capturas iniciais anteriores à limpeza com o build final: **zero pixels diferentes**, usando Chromium com movimento reduzido e as mesmas dimensões.
- Navegação entre áreas e histórico preservaram um marcador em `window`, confirmando que a SPA não recarrega o documento e mantém a base de publicação.
- Comparação das 72 etapas com a versão anterior no Git: campos ativos, mensagens e dados de protocolo renderizados idênticos.
- Learn: 24 combinações de quatro autenticadores, dois modos e três larguras. Todas as etapas foram selecionadas, as cenas renderizaram e a sequência mostrou os eventos até a etapa ativa. Reinício, seleção por teclado e abertura/fechamento do zoom com Escape passaram.
- Inspect: conversão de texto UTF-8 para base64url e retorno via Swap, além da seleção de abas por teclado, passaram no build publicado.
- Lab: criação e assinatura simuladas, seleção da credencial e envio das duas respostas ao Inspect passaram. A assertion foi decodificada sem alertas.

| Área | Desktop: 1440 × 900 | Mobile: 390 × 900 |
| --- | --- | --- |
| Learn | [Captura](screenshots/Aprender-desktop.png) | [Captura](screenshots/Aprender-mobile.png) |
| Experiment | [Captura](screenshots/Experimentar-desktop.png) | [Captura](screenshots/Experimentar-mobile.png) |
| Inspect | [Captura](screenshots/Inspecionar-desktop.png) | [Captura](screenshots/Inspecionar-mobile.png) |

## Limites

Hardware físico, servidores externos e outros navegadores não foram testados. Mobile foi validado por viewport emulada. O build ainda informa um chunk principal acima de 500 kB. A instalação limpa reportou sete vulnerabilidades moderadas nas dependências mantidas, contra doze antes da limpeza; não foram aplicadas atualizações de versão nesta tarefa.
