# Passkey Studio

<!-- impeccable:product-schema 1 -->

## Platform

web

## Escopo

Contexto compartilhado das três aplicações deste workspace: `apps/fido2-demo/`, `apps/fido2-lab/` e `apps/webauthn-decoder/`. As três ferramentas pertencem ao repositório Passkey Studio, com entrada e comandos comuns na raiz. Cada módulo preserva seu código e dependências.

## Usuários

Desenvolvedores e integradores FIDO2/WebAuthn que precisam compreender as cerimônias, testar registro e autenticação e investigar os dados do protocolo. Público e objetivo confirmados pelo responsável pelo produto.

## Propósito do produto

Oferecer ferramentas complementares para aprender, experimentar e inspecionar FIDO2/WebAuthn:

- **FIDO2 Demo:** compreender registro (attestation) e autenticação (assertion) por meio de uma demonstração gráfica com etapas e dados ilustrativos.
- **FIDO2 Lab:** criar credenciais e produzir respostas de registro e autenticação para testes, com autenticadores reais ou credenciais simuladas.
- **WebAuthn Decoder:** transformar payloads codificados em estruturas que possam ser examinadas e copiadas.

O resultado esperado é permitir que o usuário entenda uma cerimônia, produza dados para um teste ou interprete um payload, conforme a ferramenta escolhida. Métricas quantitativas de sucesso ainda não foram definidas.

## Contexto de uso

As aplicações são ferramentas web em React, TypeScript e Vite. O usuário pode executar cada uma localmente com `npm run dev` no diretório correspondente. As bases configuradas são `/fido2-demo/`, `/fido2-lab/` e `/webauthn-decoder/`.

No Lab, o fluxo documentado consiste em obter um challenge do servidor em teste, informar os dados necessários, gerar a resposta e copiá-la para o endpoint do servidor. O Decoder recebe dados colados pelo usuário e permite inspecionar e copiar o resultado. O Demo permite selecionar autenticador e cerimônia e controlar a reprodução das etapas.

## Capacidades e restrições

### FIDO2 Demo

- Demonstra chave USB, chave NFC, Windows Hello/TPM e passkey no smartphone.
- Oferece seleção de etapas, reprodução automática, pausa, avanço, retorno e reinício.
- Possui português e inglês, com preferência persistida no navegador.
- Os bytes são ilustrativos; a demonstração não chama `navigator.credentials`.

### FIDO2 Lab

- Separa os modos simulado, com SubtleCrypto, e hardware, com a API WebAuthn.
- Permite criar credenciais, assinar challenges, gerar pares de chaves ES256/RS256, inspecionar attestation e codificar/decodificar base64url.
- Mantém credenciais e chaves em localStorage e permite sua inspeção e exclusão.
- O modo simulado armazena chaves privadas no navegador e destina-se a desenvolvimento e testes. Não apresentar esse armazenamento como adequado para autenticação em produção.
- O modo hardware depende do suporte WebAuthn do navegador e do autenticador disponível.

### WebAuthn Decoder

- Decodifica respostas de registro, assertions, `clientDataJSON` e CBOR, incluindo envelopes JSON `PublicKeyCredential`.
- Detecta formatos de entrada, interpreta rótulos COSE e consulta um registro de AAGUIDs incluído no projeto.
- O processamento de payloads ocorre no navegador; preservar essa propriedade em futuras mudanças.
- Entradas inválidas devem produzir erros estruturados com orientação quando disponível.

## Compromissos de marca e conteúdo

Os nomes existentes são FIDO2 Demo, FIDO2 Lab e WebAuthn Decoder. Preservar a terminologia técnica e distinguir claramente explicação ilustrativa, simulação e operação com autenticador real.

## Evidências disponíveis

- `fido2-demo/README.md`, `src/App.tsx`, `src/data/` e `tests/`, dentro dessa aplicação: documentação, cerimônias, traduções e testes da demonstração.
- `fido2-lab/README.md` e `src/utils/`, dentro dessa aplicação: fluxo de testes, persistência e implementação dos modos simulado e hardware.
- `webauthn-decoder/README.md`, `src/lib/` e `src/data/aaguid-registry.json`, dentro dessa aplicação: formatos, decodificadores e registro de autenticadores.

As capacidades acima foram identificadas na documentação e no código existente; esta inicialização não executou testes funcionais nem validou compatibilidade com servidores externos. Não há métricas de adoção, depoimentos ou comprovação de certificação fornecidos para uso em conteúdo do produto.

## Princípios do produto

1. Manter aprender, testar e inspecionar como tarefas complementares e reconhecíveis.
2. Explicitar se os dados são ilustrativos, simulados ou produzidos por um autenticador real.
3. Facilitar a inspeção e a cópia dos dados técnicos necessários ao trabalho de integração.
4. Preservar o processamento local dos payloads no Decoder e tornar compreensível a persistência local de credenciais no Lab.

## Acessibilidade e inclusão

O Demo já inclui atalhos de teclado, controles com rótulos acessíveis e respeito à preferência de movimento reduzido. Preservar esses recursos. Português e inglês estão disponíveis no Demo; não presumir que a mesma cobertura de idiomas exista nas demais aplicações.

Um padrão formal de conformidade de acessibilidade para o conjunto ainda não foi definido.

## Decisões em aberto

- Posicionamento competitivo e alegações de diferenciação ainda não foram definidos.
- Requisitos adicionais de público, acessibilidade e idiomas para o Lab e o Decoder não foram informados.
- Não foram informadas novas restrições de produto ou compromissos de marca além dos existentes no projeto.
