# Passkey Studio

<!-- impeccable:product-schema 1 -->

## Platform

web

## Escopo

Uma única aplicação Vite e React chamada Passkey Studio. As áreas Aprender, Experimentar e Inspecionar ficam em `src/features/learn/`, `src/features/lab/` e `src/features/inspector/`, com um ponto de entrada, uma árvore React, dependências e navegação compartilhadas.

## Usuários

Desenvolvedores e integradores FIDO2/WebAuthn que precisam compreender as cerimônias, testar registro e autenticação e investigar os dados do protocolo. Público e objetivo confirmados pelo responsável pelo produto.

## Propósito do produto

Oferecer ferramentas complementares para aprender, experimentar e inspecionar FIDO2/WebAuthn:

- **FIDO2 Demo:** compreender registro (attestation) e autenticação (assertion) por meio de uma demonstração gráfica com etapas e dados ilustrativos.
- **FIDO2 Lab:** criar credenciais e produzir respostas de registro e autenticação para testes, com autenticadores reais ou credenciais simuladas.
- **WebAuthn Decoder:** transformar payloads codificados em estruturas que possam ser examinadas e copiadas.

O resultado esperado é permitir que o usuário entenda uma cerimônia, produza dados para um teste ou interprete um payload, conforme a ferramenta escolhida. Métricas quantitativas de sucesso ainda não foram definidas.

## Contexto de uso

A aplicação usa React, TypeScript e Vite. Execute `npm run dev` na raiz. As rotas `/fido2-demo/`, `/fido2-lab/` e `/webauthn-decoder/` são áreas da mesma SPA, com navegação sem recarga e suporte ao histórico.

No Lab, o fluxo documentado consiste em obter um challenge do servidor em teste, informar os dados necessários, gerar a resposta e copiá-la para o endpoint do servidor. O Decoder recebe dados colados pelo usuário e permite inspecionar e copiar o resultado. O Demo permite selecionar autenticador e cerimônia e controlar a reprodução das etapas.

## Capacidades e restrições

### FIDO2 Demo

- Demonstra chave USB, chave NFC, Windows Hello/TPM e passkey no smartphone.
- Oferece cenas isométricas, diagrama de sequência, seleção de etapas, reprodução automática, pausa, avanço, retorno e reinício.
- Inclui guia de payloads com diagramas interativos; a interface usa inglês.
- Os bytes são ilustrativos; a demonstração não chama `navigator.credentials`.

### FIDO2 Lab

- Separa os modos simulado, com SubtleCrypto, e WebAuthn, com o autenticador ou provedor de passkeys selecionado pelo navegador (hardware, software ou passkeys sincronizadas).
- Permite criar credenciais e assinar challenges. No modo simulado, a seleção ES256/RS256 determina o novo par de chaves gerado durante cada registro. Os resultados podem ser enviados ao Inspect para inspeção.
- Mantém credenciais simuladas, chaves de teste e metadados WebAuthn em localStorage. Remover um registro WebAuthn local não exclui a credencial do autenticador ou provedor, nem revoga o registro no servidor RP.
- O modo simulado armazena chaves privadas no navegador e destina-se a desenvolvimento e testes. Não apresentar esse armazenamento como adequado para autenticação em produção.
- O modo WebAuthn depende do suporte do navegador e do autenticador disponível. A página não recebe a chave privada. As respostas geradas ainda precisam ser verificadas pelo servidor RP.

### WebAuthn Decoder

- Organiza o Inspect nas abas WebAuthn (padrão) e Base64url. A aba Base64url codifica texto e decodifica base64url em UTF-8/JSON ou hexadecimal para dados binários.
- Decodifica respostas de registro, assertions, `clientDataJSON` e CBOR, incluindo envelopes JSON `PublicKeyCredential`.
- Detecta formatos de entrada, interpreta rótulos COSE e consulta um registro de AAGUIDs incluído no projeto.
- O processamento de payloads ocorre no navegador; preservar essa propriedade em futuras mudanças.
- Entradas inválidas devem produzir erros estruturados com orientação quando disponível.

## Compromissos de marca e conteúdo

A marca do produto é Passkey Studio. As áreas são Aprender, Experimentar e Inspecionar. FIDO2 Demo, FIDO2 Lab e WebAuthn Decoder são as origens históricas. Preservar a terminologia técnica e distinguir claramente explicação ilustrativa, simulação e operação com autenticador real.

## Evidências disponíveis

- `src/features/learn/`: cenas, diagramas, conteúdo e testes das cerimônias.
- `src/features/lab/`: fluxos de registro e autenticação, persistência e testes dos modos simulado e WebAuthn.
- `src/features/inspector/`: formatos, decodificadores, registro de AAGUIDs e testes de inspeção.
- [README.md](README.md): desenvolvimento e publicação; [docs/VALIDATION.md](docs/VALIDATION.md): verificações e limites atuais.

Não há métricas de adoção, depoimentos ou comprovação de certificação fornecidos para uso em conteúdo do produto.

## Princípios do produto

1. Manter aprender, testar e inspecionar como tarefas complementares e reconhecíveis.
2. Explicitar se os dados são ilustrativos, simulados ou produzidos por um autenticador real.
3. Facilitar a inspeção e a cópia dos dados técnicos necessários ao trabalho de integração.
4. Preservar o processamento local dos payloads no Decoder e tornar compreensível a persistência local de credenciais no Lab.

## Acessibilidade e inclusão

Learn inclui atalhos de teclado, controles com rótulos acessíveis e respeito à preferência de movimento reduzido. Preservar esses recursos em todas as áreas. A interface atual é em inglês.

Um padrão formal de conformidade de acessibilidade para o conjunto ainda não foi definido.

## Decisões em aberto

- Posicionamento competitivo e alegações de diferenciação ainda não foram definidos.
- Requisitos adicionais de público, acessibilidade e idiomas para o Lab e o Decoder não foram informados.
- Não foram informadas novas restrições de produto ou compromissos de marca além dos existentes no projeto.
