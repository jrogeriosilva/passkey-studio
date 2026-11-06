# FIDO2 Demo

Demonstração interativa das cerimônias FIDO2/WebAuthn de **registro** (attestation) e **autenticação** (assertion), construída com **React 19, TypeScript e Vite**, seguindo a organização do FIDO2 Lab e do WebAuthn Decoder.

## Demo

https://jrogeriosilva.github.io/fido2-demo/

## Uso local

Requer Node.js 24 e npm.

```bash
npm ci
npm run dev
```

Abra a URL indicada pelo Vite, normalmente `http://localhost:5173/fido2-demo/`.

```bash
npm run lint
npm test
npm run build
npm run preview
```

O build é gerado em `dist/`. A aplicação precisa ser servida via HTTP; abrir `index.html` diretamente não executa os módulos React.

## Funcionalidades

- Animações de chave USB, chave NFC, Windows Hello/TPM e passkey no smartphone.
- Registro e autenticação com passos selecionáveis e dados ilustrativos por etapa.
- Reprodução automática, pausa, avanço, retorno e reinício.
- Atalhos: setas esquerda/direita para navegar e espaço para reproduzir/pausar quando o foco está fora dos controles.
- Português e inglês, com preferência persistida no navegador.
- Layout responsivo, tema escuro e respeito à preferência de movimento reduzido.

Esta é uma demonstração gráfica: os bytes são ilustrativos e nenhuma chamada real a `navigator.credentials` é feita.

## Organização

- `src/App.tsx`: estado e controles da demonstração.
- `src/components/`: cenas SVG React, ícones e conteúdo educativo.
- `src/data/`: traduções, tipos e sequências das cerimônias.
- `src/index.css`: tema, layout e animações.
- `tests/`: verificação das sequências nos dois idiomas e modos, e da seleção de idioma.

## Deploy

O workflow `.github/workflows/deploy.yml` instala as dependências, executa lint/testes/build e publica `dist/` no GitHub Pages. Em **Settings → Pages → Source**, selecione **GitHub Actions**. A base `/fido2-demo/` está configurada em `vite.config.ts`.
