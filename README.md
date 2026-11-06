# Passkey Studio

Ferramentas para aprender, experimentar e inspecionar FIDO2 e WebAuthn.

## Executar

Use Node.js 24:

```sh
npm ci
npm run dev
```

Abra **http://127.0.0.1:5173/**. O comando inicia o Studio e as três ferramentas na mesma origem. As portas 5181–5183 são reservadas aos servidores internos. Ctrl+C encerra todos os servidores.

| Ferramenta | Caminho | Código |
| --- | --- | --- |
| Aprender — FIDO2 Demo | `/fido2-demo/` | `apps/fido2-demo/` |
| Experimentar — FIDO2 Lab | `/fido2-lab/` | `apps/fido2-lab/` |
| Inspecionar — WebAuthn Decoder | `/webauthn-decoder/` | `apps/webauthn-decoder/` |

A instalação também executa `npm ci` em cada módulo, preservando seus lockfiles e versões de dependências.

## Validar e distribuir

```sh
npm run lint
npm test
npm run build
npm run preview
```

O build gera **um diretório `dist/`** com o Studio e todas as ferramentas. Sirva esse diretório na raiz do domínio. Hospedagem em um subdiretório exige ajustar bases e links. A publicação remota não foi configurada.

Os testes executam as suítes Node do Demo e Vitest do Decoder. O Lab requer validação manual de criação e assinatura simuladas e, com autenticador disponível, de registro e autenticação com hardware.

## Dados

O Demo usa bytes ilustrativos. O Lab armazena chaves simuladas no localStorage apenas para desenvolvimento. O Decoder processa payloads no navegador. A migração do código não transfere dados de outras origens: localStorage depende da origem e credenciais WebAuthn dependem do RP ID. Os nomes das chaves existentes foram preservados.

## Migração

Veja [MIGRATION.md](MIGRATION.md) para origens e commits importados. Os históricos completos foram preservados sem squash. Os repositórios originais continuam intactos. Os módulos mantêm seus READMEs e referências históricas aos repositórios de origem. O Passkey Studio ainda não possui remote.

As verificações e os limites da validação estão em [docs/VALIDATION.md](docs/VALIDATION.md).
