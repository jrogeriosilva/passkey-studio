# Migração para Passkey Studio

Data: 2026-11-05. Repositório local: `/home/joser/dev/fido/passkey-studio`.

| Origem local | Commit importado | Destino |
| --- | --- | --- |
| `/home/joser/dev/fido/fido2-demo` | `ccab625` | `apps/fido2-demo` |
| `/home/joser/dev/fido/fido2-lab` | `83306df` | `apps/fido2-lab` |
| `/home/joser/dev/fido/webauthn-decoder` | `bfedb5c` | `apps/webauthn-decoder` |

Os históricos foram importados com `git subtree add` sem squash. Os arquivos do workspace foram copiados por cima da importação, incluindo o contexto local `.impeccable/` do Lab. `node_modules`, `dist`, `.git` e capturas temporárias `.playwright-mcp` não foram copiados. Dependências são reinstaladas pelos lockfiles e builds são gerados novamente.

Os diretórios originais não foram alterados. O histórico importado conserva autores e commits. Os assets, testes e documentação dos módulos foram mantidos. Os links entre ferramentas agora apontam para caminhos locais e a navegação inclui a entrada Passkey Studio.

A integração utiliza uma entrada comum e mantém as aplicações como módulos separados, cada um com seu ciclo de vida React e seu CSS. O build final é um site único; transições entre módulos carregam uma nova página. Não há backend novo ou transferência automática de dados entre origens.

As referências GitHub dos módulos continuam apontando para seus repositórios de origem, pois o novo repositório ainda é local. Não houve push ou publicação.
