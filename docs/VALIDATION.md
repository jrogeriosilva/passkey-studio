# Validação da migração

Ambiente: Node.js 24.20.0, Linux, 2026-11-05 (America/Sao_Paulo).

- Instalação da raiz e dos três módulos concluída com os lockfiles.
- `npm run lint`: passou nos três módulos.
- `npm test`: 19 testes Node do Demo e 173 testes Vitest do Decoder passaram (192 no total).
- `npm run build`: gerou a entrada e os três módulos em `dist/`.
- Navegador real, desenvolvimento: entrada e três módulos carregados pela origem `http://127.0.0.1:5173`.
- Navegador real, build final: quatro páginas retornaram HTTP 200 nas larguras 1440 e 390, sem erros de página JavaScript e sem overflow horizontal.
- Lab simulado no build final: geração ES256, criação de credencial e assinatura de challenge executadas. Os dados temporários foram removidos da origem de teste.
- Capturas da entrada: [desktop](screenshots/studio-1440.png) e [mobile](screenshots/studio-390.png).
- Conferência de todos os arquivos rastreados nas três origens: nenhum ausente; diferenças restritas aos seis arquivos com links e navegação atualizados.
- Os três commits de origem são ancestrais do HEAD do novo repositório.
- `git diff --check`: passou.

Limites: operações com autenticador físico e integração com servidores externos não foram validadas. A instalação reportou vulnerabilidades nas dependências herdadas dos módulos; seus lockfiles foram preservados para evitar mudanças funcionais durante a migração. O pacote Vite novo da raiz foi atualizado para a correção indicada pelo npm audit.

O detector Impeccable reportou apenas o uso da fonte Geist. A fonte foi mantida para acompanhar a tipografia existente nas três ferramentas.

Também foram verificados o encerramento de todos os servidores internos com SIGTERM e a falha explícita quando uma porta de desenvolvimento está ocupada. O audit da raiz terminou com zero vulnerabilidades após a atualização; isso não inclui os pacotes independentes herdados em `apps/`.
