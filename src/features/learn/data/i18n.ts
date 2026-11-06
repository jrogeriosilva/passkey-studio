import { createElement } from 'react';
import type { Language, Mode } from './types.ts';
export const I18N = {
    pt: {
        htmlLang: 'pt-BR', title: 'Cerimônias FIDO2',
        metaDesc: 'Demonstração interativa das cerimônias de registro e autenticação FIDO2/WebAuthn.',
        h1: 'Cerimônias FIDO2, passo a passo',
        lede: ["Quatro formas de provar quem você é sem senha: uma ", createElement('strong', { key: 0 }, "chave USB"), ", uma ", createElement('strong', { key: 1 }, "chave NFC"), " por aproximação, o ", createElement('strong', { key: 2 }, "Windows Hello"), " com a chave guardada no TPM, e uma ", createElement('strong', { key: 3 }, "passkey no smartphone"), ". Escolha a cerimônia, aperte reproduzir e acompanhe o desafio ir e voltar."],
        ariaLang: 'Idioma', ariaAuth: 'Autenticador', ariaMode: 'Tipo de cerimônia', ariaStage: 'Palco da animação',
        tabUsb: 'Chave USB', tabUsbSub: 'Toque físico · CTAP2 sobre USB',
        tabNfc: 'Chave NFC', tabNfcSub: 'Aproximação · CTAP2 sobre NFC',
        tabHello: 'Windows Hello', tabHelloSub: 'Rosto ou PIN · chave no TPM',
        tabPhone: 'Smartphone', tabPhoneSub: 'QR + Bluetooth · passkey',
        modeLogin: 'Autenticação', modeRegister: 'Registro',
        nodeRp: 'Servidor (Relying Party)', nodeClient: 'Navegador (cliente)',
        reset: 'Reiniciar', prev: 'Anterior', play: 'Reproduzir', pause: 'Pausar', next: 'Próximo',
        stepsTitle: (mode: Mode, name: string) => (mode === 'login' ? 'Autenticação com ' : 'Registro com ') + name,
        stepsSub: (n: number) => n + ' passos · clique em um passo para ir até ele',
        dataTransit: 'Dados em trânsito', dataRp: 'No servidor', dataAuth: 'No autenticador',
        tags: { user: 'ação do usuário', rp: 'servidor', client: 'navegador', auth: 'autenticador' },
        fact1t: 'O desafio nunca se repete', fact1p: 'Cada tentativa recebe 32 bytes aleatórios novos. Uma resposta gravada ontem não serve hoje.',
        fact2t: 'A chave privada não sai do autenticador', fact2p: 'Chip da chave USB ou NFC, TPM do computador ou elemento seguro do celular: só a assinatura viaja.',
        fact3t: 'A origem vai dentro da assinatura', fact3p: 'O navegador grava o domínio real no clientDataJSON. Um site clonado recebe uma assinatura que não bate.',
        ctaTitle: 'Agora com bytes de verdade',
        ctaLede: 'Esta página é ilustrativa: os valores mostrados são inventados. Para ver as mesmas cerimônias produzindo credenciais reais — e para abrir os campos de uma resposta WebAuthn byte a byte — use as duas ferramentas abaixo.',
        ctaLabP: 'Cliente de testes no navegador para servidores FIDO2. Execute registro e autenticação com um autenticador de hardware real ou com credenciais totalmente simuladas — sem precisar de chave física.',
        ctaLabBtn: 'Abrir o FIDO2 Lab',
        ctaDecP: ["Cole um ", createElement('code', { key: 0 }, "PublicKeyCredential"), ", ", createElement('code', { key: 1 }, "attestationObject"), ", ", createElement('code', { key: 2 }, "authenticatorData"), " ou ", createElement('code', { key: 3 }, "clientDataJSON"), " e inspecione cada campo em uma árvore navegável. Roda inteiramente no seu navegador: nada é enviado para fora."],
        ctaDecBtn: 'Abrir o Decoder',
        disclaimer: ["Esta página é uma demonstração puramente gráfica. Nenhuma chamada real a ", createElement('code', { key: 0 }, "navigator.credentials"), " é feita, e os bytes exibidos são ilustrativos. Os passos seguem a estrutura das especificações WebAuthn (W3C) e CTAP2 (FIDO Alliance)."],
        /* scene */
        domain: 'banco.exemplo', rpHashNote: 'SHA-256 de "banco.exemplo"',
        scrHello: 'Olá, Ana. Acesse sua conta com segurança.',
        loginBtn: 'Entrar com passkey', registerBtn: 'Cadastrar passkey',
        loadingMsg: 'Aguardando o servidor',
        okLogin: 'Autenticado', okRegister: 'Passkey cadastrada', okSub: 'Bem-vinda de volta, Ana',
        keySigned: 'assinado', keyCreated: 'chave criada', tpmLbl: 'chave privada: nunca sai do TPM 2.0', tunnelLbl: 'túnel cifrado',
        keyHint: 'toque na chave', tapConfirmed: 'presença confirmada · UP=1',
        nfcHint: 'aproxime a chave do leitor', nfcHold: 'mantenha a chave sobre o leitor', nfcUp: 'presença pela aproximação · UP=1',
        qrTitle: 'Use seu telefone', qrHint: 'Aponte a câmera do celular para o código', bleLbl: 'BLE: mesmo ambiente',
        phCode: 'Código detectado', phLoginAs: 'Entrar como ana?', phTouch: 'Toque no sensor', phContinue: 'Continuar', phSigned: 'Assinado', phSignedSub: 'a chave não saiu do celular',
        ariaUsb: 'Chave USB sendo inserida em um notebook', ariaNfc: 'Chave de segurança aproximada de um leitor NFC ligado a um notebook', ariaHello: 'Windows Hello reconhecendo um rosto com a chave no TPM', ariaPhone: 'Smartphone lendo o QR code de um notebook',
        /* ceremonies */
        usb: { name: 'chave USB', auth: 'Chave USB', dlg: 'Chave de segurança', note: 'CTAP2 sobre USB HID · presença do usuário por toque' },
        nfc: { name: 'chave NFC', auth: 'Chave NFC', dlg: 'Chave de segurança', note: 'CTAP2 sobre NFC · APDUs ISO 7816-4 · presença pela aproximação' },
        hello: { name: 'Windows Hello', auth: 'Windows Hello · TPM', dlg: 'Windows Hello', note: 'Autenticador de plataforma · verificação biométrica local' },
        phone: { name: 'smartphone', auth: 'Smartphone', dlg: 'Usar um telefone', note: 'Transporte híbrido · QR + Bluetooth LE + túnel cifrado' },
        /* shared steps */
        request: {
            tLogin: 'Usuário pede para entrar', tReg: 'Usuário pede para cadastrar uma passkey',
            dLogin: 'Em banco.exemplo, Ana clica em “Entrar com passkey”. O navegador pede ao servidor um desafio exclusivo para esta tentativa.',
            dReg: 'Já autenticada, Ana escolhe “Cadastrar passkey” nas configurações da conta. O navegador pede ao servidor as opções de criação.',
            pktLogin: 'pedido de login', pktReg: 'pedido de registro'
        },
        challenge: {
            t: 'Servidor gera o desafio',
            d: 'O servidor sorteia 32 bytes aleatórios (o challenge), guarda-os para esta sessão e devolve junto com o rpId, o domínio dono da conta. ',
            dLogin: 'Também lista quais credenciais aceita.', dReg: 'Também informa quais algoritmos de assinatura aceita.'
        },
        clientData: {
            t: 'Navegador monta o clientDataJSON',
            d: (m: Mode) => 'O site chama navigator.credentials.' + (m === 'login' ? 'get' : 'create') + '(). O navegador registra o tipo da operação, o challenge e a origin real da página. Como esse registro entra na assinatura, um site falso não consegue reaproveitar o desafio.'
        },
        send: {
            tLogin: 'Navegador envia a assinatura (assertion)', tReg: 'Navegador envia o attestationObject',
            dLogin: 'A chave privada não saiu do autenticador. O navegador repassa ao servidor apenas o credentialId, o authenticatorData, o clientDataJSON e a assinatura.',
            dReg: 'O navegador repassa ao servidor o attestationObject (chave pública, credentialId e dados de atestação) junto com o clientDataJSON.'
        },
        verify: {
            tLogin: 'Servidor verifica e autentica', tReg: 'Servidor guarda a chave pública',
            dLogin: 'Com a chave pública guardada no registro, o servidor confere a assinatura, o hash do rpId, a origin, o tipo e se o contador aumentou. Tudo certo: a sessão é criada.',
            dReg: 'O servidor confere o challenge e a origin, opcionalmente valida o certificado de atestação do fabricante e associa credentialId + chave pública à conta de Ana. A partir daqui essa credencial pode autenticar.',
            expected: 'esperado', dataWord: 'dados', attest: 'atestação', saved: 'salvo'
        },
        words: { newPair: 'novo par', staysChip: 'fica no chip', sending: 'Enviando resposta…' },
        usbSteps: {
            dlgInsert: 'Insira sua chave de segurança', dlgTouch: 'Toque na chave quando ela piscar', dlgVerifying: 'Verificando…',
            s4t: 'Chave inserida na porta USB',
            s4d: (m: Mode) => 'Ana conecta a chave. O navegador conversa com ela pelo protocolo CTAP2 sobre USB HID, sem driver especial, e envia o comando ' + (m === 'login' ? 'authenticatorGetAssertion.' : 'authenticatorMakeCredential.'),
            s5t: 'A chave pede presença do usuário',
            s5d: 'O LED pisca. A chave só assina depois de um toque físico: é a prova de que há uma pessoa presente, e não um programa remoto tentando usar a chave às escondidas.',
            s5status: 'aguardando presença do usuário (UP)', s5led: 'piscando',
            s6tLogin: 'Toque na chave: ela assina o desafio', s6tReg: 'Toque na chave: ela cria um novo par de chaves',
            s6dLogin: 'O dedo encosta no sensor. A chave localiza a chave privada ligada ao rpId e ao credentialId e assina authenticatorData ‖ SHA-256(clientDataJSON) com ela.',
            s6dReg: 'O dedo encosta no sensor. A chave gera um par ES256 exclusivo para banco.exemplo: a privada fica gravada no chip seguro, a pública sai dentro de um attestationObject com um credentialId novo.'
        },
        nfcSteps: {
            dlgTap: 'Encoste sua chave de segurança no leitor', dlgDetected: 'Chave detectada. Mantenha-a sobre o leitor', dlgVerifying: 'Verificando…',
            s4t: 'Chave aproximada do leitor NFC',
            s4d: 'Ana encosta a chave no leitor. A poucos centímetros, o campo de 13,56 MHz do leitor alimenta a chave, que não tem bateria. O navegador seleciona o applet FIDO com um comando SELECT e a chave responde “FIDO_2_0”.',
            fieldK: 'campo', fieldV: 'chave alimentada pelo leitor', replyK: 'resposta',
            s5t: 'Comando CTAP2 embrulhado em APDU',
            s5d: (m: Mode) => 'Pelo NFC o CTAP2 viaja dentro de APDUs ISO 7816-4 (NFCCTAP_MSG). O navegador envia ' + (m === 'login' ? 'authenticatorGetAssertion' : 'authenticatorMakeCredential') + '. Não há botão para apertar: trazer a chave até o leitor é o próprio gesto de presença (UP=1).',
            presenceK: 'presença', presenceV: 'a própria aproximação (sem botão)',
            s6tLogin: 'Ainda no campo, a chave assina o desafio', s6tReg: 'Ainda no campo, a chave cria um novo par de chaves',
            s6dLogin: 'Alimentada só pelo campo, a chave localiza a chave privada ligada ao rpId e ao credentialId e assina authenticatorData ‖ SHA-256(clientDataJSON). Se precisa de mais tempo, responde 0x9100 e o navegador insiste com NFCCTAP_GETRESPONSE até receber 0x9000.',
            s6dReg: 'Alimentada só pelo campo, a chave gera um par ES256 exclusivo para banco.exemplo: a privada fica gravada no chip seguro, a pública sai dentro de um attestationObject com um credentialId novo. Enquanto isso, a chave precisa continuar sobre o leitor.',
            processing: 'processando'
        },
        helloSteps: {
            s4t: 'Windows assume a operação',
            s4d: 'O navegador entrega a operação ao autenticador de plataforma. O Windows abre a janela do Windows Hello: a credencial mora no TPM deste computador e não em um acessório.',
            dlgIdentity: 'Verificando sua identidade',
            authenticator: 'autenticador', platform: 'plataforma (Windows Hello)', transport: 'transporte', required: 'obrigatória',
            s5t: 'A câmera infravermelha procura o rosto',
            s5d: 'A câmera IR projeta luz invisível e lê o relevo do rosto, então uma foto não engana o sensor. Impressão digital ou PIN funcionam do mesmo jeito: tudo é conferido só neste aparelho.',
            dlgLooking: 'Olhando para você…',
            sensor: 'sensor', sensorVal: 'câmera IR + RGB', faceModel: 'modelo facial', onlyPc: 'só existe neste PC', sentToSite: 'enviado ao site', nothing: 'nada',
            s6t: 'Rosto reconhecido: TPM libera a chave',
            s6d: 'A comparação acontece localmente; o rosto nunca viaja. Com a verificação feita (UV=1), o Windows autoriza o TPM a usar a chave privada, que foi gerada lá dentro e não pode ser lida nem exportada.',
            dlgRecognized: 'Reconhecido', unlocked: 'chave desbloqueada para uso',
            s7tLogin: 'TPM assina o desafio', s7tReg: 'TPM cria o par de chaves',
            s7dLogin: 'Dentro do TPM, a chave privada assina authenticatorData ‖ SHA-256(clientDataJSON). Só a assinatura sai do chip.',
            s7dReg: 'O TPM gera um par ES256 novo. A chave privada nasce e fica dentro do chip; a pública sai com um credentialId e a atestação do TPM.',
            dlgSigning: 'Assinando…', genTpm: 'gerado no TPM', chipAttest: 'atestação do chip'
        },
        phoneSteps: {
            s4t: 'Navegador exibe um código QR',
            s4d: 'Não há passkey neste computador, então o navegador oferece “usar um telefone”. O QR carrega uma URL FIDO:/ com uma chave de sessão temporária e o endereço de um serviço de túnel.',
            contains: 'contém', containsVal: 'chave pública efêmera,\n         segredo do QR, id do túnel', validity: 'validade', thisSession: 'esta sessão',
            s5t: 'Ana aponta a câmera do celular',
            s5d: 'O celular lê o QR e descobre como falar com este navegador em particular. Nada foi enviado ainda: só um convite.',
            read: 'lido', phone: 'celular', derived: 'derivou a chave da sessão',
            s6t: 'Prova de proximidade por Bluetooth',
            s6d: 'O celular anuncia por BLE um segredo derivado do QR. O computador precisa ouvir esse anúncio, o que prova que os dois estão no mesmo lugar. Os dados em si passam por um túnel na internet, cifrado de ponta a ponta.',
            dlgConnecting: 'Conectando ao seu telefone…',
            bleHeard: 'segredo(QR) ✔ ouvido pelo PC', tunnel: 'túnel', cipher: 'cifra', cipherVal: 'Noise, ponta a ponta', toPhone: '→ celular',
            s7t: 'Celular pede a digital',
            s7d: 'O celular mostra para qual site é a operação e pede a impressão digital, o rosto ou o código de bloqueio. A verificação é local e nunca sai do aparelho.',
            dlgContinue: 'Continue no seu telefone', account: 'conta', fpSensor: 'sensor de digital',
            s8tLogin: 'Passkey assina no celular', s8tReg: 'Celular cria a passkey',
            s8dLogin: 'A chave privada está no elemento seguro do celular (ou sincronizada no cofre da conta, sempre cifrada). O celular assina authenticatorData ‖ SHA-256(clientDataJSON); a chave não sai do aparelho.',
            s8dReg: 'O celular gera um par ES256 novo e guarda a privada no elemento seguro, podendo sincronizá-la cifrada com o cofre da conta. A pública sai com um credentialId.',
            synced: '(passkey sincronizada)', backup: 'backup', syncable: '(sincronizável)',
            s9t: 'A resposta volta pelo túnel',
            s9d: 'A resposta assinada percorre o mesmo túnel cifrado até o navegador, que a entrega ao site como se tivesse vindo de um autenticador local.',
            dlgReceived: 'Resposta recebida', toBrowser: '→ navegador', content: 'conteúdo'
        }
    },
    en: {
        htmlLang: 'en', title: 'FIDO2 Ceremonies',
        metaDesc: 'Interactive demonstration of the FIDO2/WebAuthn registration and authentication ceremonies.',
        h1: 'FIDO2 ceremonies, step by step',
        lede: ["Four ways to prove who you are without a password: a ", createElement('strong', { key: 0 }, "USB security key"), ", an ", createElement('strong', { key: 1 }, "NFC key"), " tapped on a reader, ", createElement('strong', { key: 2 }, "Windows Hello"), " with the key stored in the TPM, and a ", createElement('strong', { key: 3 }, "passkey on your smartphone"), ". Pick a ceremony, press play and follow the challenge on its round trip."],
        ariaLang: 'Language', ariaAuth: 'Authenticator', ariaMode: 'Ceremony type', ariaStage: 'Animation stage',
        tabUsb: 'USB key', tabUsbSub: 'Physical touch · CTAP2 over USB',
        tabNfc: 'NFC key', tabNfcSub: 'Tap on a reader · CTAP2 over NFC',
        tabHello: 'Windows Hello', tabHelloSub: 'Face or PIN · key in the TPM',
        tabPhone: 'Smartphone', tabPhoneSub: 'QR + Bluetooth · passkey',
        modeLogin: 'Authentication', modeRegister: 'Registration',
        nodeRp: 'Server (Relying Party)', nodeClient: 'Browser (client)',
        reset: 'Restart', prev: 'Previous', play: 'Play', pause: 'Pause', next: 'Next',
        stepsTitle: (mode: Mode, name: string) => (mode === 'login' ? 'Authentication with ' : 'Registration with ') + name,
        stepsSub: (n: number) => n + ' steps · click a step to jump to it',
        dataTransit: 'Data in transit', dataRp: 'On the server', dataAuth: 'On the authenticator',
        tags: { user: 'user action', rp: 'server', client: 'browser', auth: 'authenticator' },
        fact1t: 'The challenge never repeats', fact1p: 'Every attempt gets 32 fresh random bytes. A response recorded yesterday is useless today.',
        fact2t: 'The private key never leaves the authenticator', fact2p: 'USB or NFC key chip, computer TPM or phone secure element: only the signature travels.',
        fact3t: 'The origin is baked into the signature', fact3p: 'The browser writes the real domain into clientDataJSON. A cloned site gets a signature that does not match.',
        ctaTitle: 'Now with real bytes',
        ctaLede: 'This page is illustrative: the values shown are made up. To watch the same ceremonies produce real credentials — and to open the fields of a WebAuthn response byte by byte — use the two tools below.',
        ctaLabP: 'In-browser test client for FIDO2 servers. Run registration and authentication with a real hardware authenticator or with fully simulated credentials — no physical key required.',
        ctaLabBtn: 'Open FIDO2 Lab',
        ctaDecP: ["Paste a ", createElement('code', { key: 0 }, "PublicKeyCredential"), ", ", createElement('code', { key: 1 }, "attestationObject"), ", ", createElement('code', { key: 2 }, "authenticatorData"), " or ", createElement('code', { key: 3 }, "clientDataJSON"), " and inspect every field in a navigable tree. Runs entirely in your browser: nothing is sent anywhere."],
        ctaDecBtn: 'Open the Decoder',
        disclaimer: ["This page is a purely graphical demonstration. No real call to ", createElement('code', { key: 0 }, "navigator.credentials"), " is made, and the bytes shown are illustrative. The steps follow the structure of the WebAuthn (W3C) and CTAP2 (FIDO Alliance) specifications."],
        /* scene */
        domain: 'bank.example', rpHashNote: 'SHA-256 of "bank.example"',
        scrHello: 'Hi, Ana. Sign in to your account securely.',
        loginBtn: 'Sign in with passkey', registerBtn: 'Create passkey',
        loadingMsg: 'Waiting for the server',
        okLogin: 'Signed in', okRegister: 'Passkey created', okSub: 'Welcome back, Ana',
        keySigned: 'signed', keyCreated: 'key created', tpmLbl: 'private key: never leaves the TPM 2.0', tunnelLbl: 'encrypted tunnel',
        keyHint: 'touch the key', tapConfirmed: 'presence confirmed · UP=1',
        nfcHint: 'hold the key near the reader', nfcHold: 'keep the key over the reader', nfcUp: 'presence by tapping · UP=1',
        qrTitle: 'Use your phone', qrHint: 'Point your phone camera at the code', bleLbl: 'BLE: same room',
        phCode: 'Code detected', phLoginAs: 'Sign in as ana?', phTouch: 'Touch the sensor', phContinue: 'Continue', phSigned: 'Signed', phSignedSub: 'the key never left the phone',
        ariaUsb: 'USB key being inserted into a laptop', ariaNfc: 'Security key held over an NFC reader wired to a laptop', ariaHello: 'Windows Hello recognizing a face with the key in the TPM', ariaPhone: 'Smartphone scanning the QR code on a laptop',
        /* ceremonies */
        usb: { name: 'a USB key', auth: 'USB key', dlg: 'Security key', note: 'CTAP2 over USB HID · user presence by touch' },
        nfc: { name: 'an NFC key', auth: 'NFC key', dlg: 'Security key', note: 'CTAP2 over NFC · ISO 7816-4 APDUs · user presence by tapping' },
        hello: { name: 'Windows Hello', auth: 'Windows Hello · TPM', dlg: 'Windows Hello', note: 'Platform authenticator · local biometric verification' },
        phone: { name: 'a smartphone', auth: 'Smartphone', dlg: 'Use a phone', note: 'Hybrid transport · QR + Bluetooth LE + encrypted tunnel' },
        /* shared steps */
        request: {
            tLogin: 'User asks to sign in', tReg: 'User asks to create a passkey',
            dLogin: 'At bank.example, Ana clicks “Sign in with passkey”. The browser asks the server for a challenge unique to this attempt.',
            dReg: 'Already signed in, Ana picks “Create passkey” in the account settings. The browser asks the server for the creation options.',
            pktLogin: 'login request', pktReg: 'registration request'
        },
        challenge: {
            t: 'Server generates the challenge',
            d: 'The server draws 32 random bytes (the challenge), stores them for this session and returns them along with the rpId, the domain that owns the account. ',
            dLogin: 'It also lists which credentials it accepts.', dReg: 'It also states which signature algorithms it accepts.'
        },
        clientData: {
            t: 'Browser builds the clientDataJSON',
            d: (m: Mode) => 'The site calls navigator.credentials.' + (m === 'login' ? 'get' : 'create') + '(). The browser records the operation type, the challenge and the real origin of the page. Because this record goes into the signature, a fake site cannot reuse the challenge.'
        },
        send: {
            tLogin: 'Browser sends the signature (assertion)', tReg: 'Browser sends the attestationObject',
            dLogin: 'The private key never left the authenticator. The browser forwards to the server only the credentialId, the authenticatorData, the clientDataJSON and the signature.',
            dReg: 'The browser forwards to the server the attestationObject (public key, credentialId and attestation data) together with the clientDataJSON.'
        },
        verify: {
            tLogin: 'Server verifies and signs the user in', tReg: 'Server stores the public key',
            dLogin: 'Using the public key stored at registration, the server checks the signature, the rpId hash, the origin, the type and that the counter increased. All good: the session is created.',
            dReg: 'The server checks the challenge and the origin, optionally validates the manufacturer attestation certificate and links credentialId + public key to Ana’s account. From now on this credential can authenticate.',
            expected: 'expected', dataWord: 'data', attest: 'attestation', saved: 'saved'
        },
        words: { newPair: 'new pair', staysChip: 'stays in the chip', sending: 'Sending response…' },
        usbSteps: {
            dlgInsert: 'Insert your security key', dlgTouch: 'Touch the key when it blinks', dlgVerifying: 'Verifying…',
            s4t: 'Key inserted into the USB port',
            s4d: (m: Mode) => 'Ana plugs in the key. The browser talks to it over CTAP2 on USB HID, with no special driver, and sends the ' + (m === 'login' ? 'authenticatorGetAssertion command.' : 'authenticatorMakeCredential command.'),
            s5t: 'The key asks for user presence',
            s5d: 'The LED blinks. The key only signs after a physical touch: proof that a person is present, not a remote program trying to use the key behind their back.',
            s5status: 'waiting for user presence (UP)', s5led: 'blinking',
            s6tLogin: 'Touch the key: it signs the challenge', s6tReg: 'Touch the key: it creates a new key pair',
            s6dLogin: 'The finger touches the sensor. The key looks up the private key tied to the rpId and credentialId and signs authenticatorData ‖ SHA-256(clientDataJSON) with it.',
            s6dReg: 'The finger touches the sensor. The key generates an ES256 pair exclusive to bank.example: the private key stays in the secure chip, the public key leaves inside an attestationObject with a new credentialId.'
        },
        nfcSteps: {
            dlgTap: 'Tap your security key on the reader', dlgDetected: 'Key detected. Keep it over the reader', dlgVerifying: 'Verifying…',
            s4t: 'Key tapped on the NFC reader',
            s4d: 'Ana taps the key on the reader. A few centimetres away, the reader’s 13.56 MHz field powers the key, which has no battery. The browser selects the FIDO applet with a SELECT command and the key answers “FIDO_2_0”.',
            fieldK: 'field', fieldV: 'key powered by the reader', replyK: 'reply',
            s5t: 'CTAP2 command wrapped in an APDU',
            s5d: (m: Mode) => 'Over NFC, CTAP2 travels inside ISO 7816-4 APDUs (NFCCTAP_MSG). The browser sends ' + (m === 'login' ? 'authenticatorGetAssertion' : 'authenticatorMakeCredential') + '. There is no button to press: bringing the key to the reader is the presence gesture itself (UP=1).',
            presenceK: 'presence', presenceV: 'the tap itself (no button)',
            s6tLogin: 'Still in the field, the key signs the challenge', s6tReg: 'Still in the field, the key creates a new key pair',
            s6dLogin: 'Powered only by the field, the key looks up the private key tied to the rpId and credentialId and signs authenticatorData ‖ SHA-256(clientDataJSON). If it needs more time it answers 0x9100 and the browser keeps asking with NFCCTAP_GETRESPONSE until 0x9000 comes back.',
            s6dReg: 'Powered only by the field, the key generates an ES256 pair exclusive to bank.example: the private key stays in the secure chip, the public key leaves inside an attestationObject with a new credentialId. Meanwhile the key has to stay over the reader.',
            processing: 'processing'
        },
        helloSteps: {
            s4t: 'Windows takes over the operation',
            s4d: 'The browser hands the operation to the platform authenticator. Windows opens the Windows Hello window: the credential lives in this computer’s TPM, not in an accessory.',
            dlgIdentity: 'Verifying your identity',
            authenticator: 'authenticator', platform: 'platform (Windows Hello)', transport: 'transport', required: 'required',
            s5t: 'The infrared camera looks for the face',
            s5d: 'The IR camera projects invisible light and reads the relief of the face, so a photo does not fool the sensor. Fingerprint or PIN work the same way: everything is checked only on this device.',
            dlgLooking: 'Looking for you…',
            sensor: 'sensor', sensorVal: 'IR + RGB camera', faceModel: 'face model', onlyPc: 'exists only on this PC', sentToSite: 'sent to the site', nothing: 'nothing',
            s6t: 'Face recognized: TPM releases the key',
            s6d: 'The comparison happens locally; the face never travels. With verification done (UV=1), Windows authorizes the TPM to use the private key, which was generated inside it and cannot be read or exported.',
            dlgRecognized: 'Recognized', unlocked: 'key unlocked for use',
            s7tLogin: 'TPM signs the challenge', s7tReg: 'TPM creates the key pair',
            s7dLogin: 'Inside the TPM, the private key signs authenticatorData ‖ SHA-256(clientDataJSON). Only the signature leaves the chip.',
            s7dReg: 'The TPM generates a new ES256 pair. The private key is born and stays inside the chip; the public key leaves with a credentialId and the TPM attestation.',
            dlgSigning: 'Signing…', genTpm: 'generated in the TPM', chipAttest: 'chip attestation'
        },
        phoneSteps: {
            s4t: 'Browser shows a QR code',
            s4d: 'There is no passkey on this computer, so the browser offers “use a phone”. The QR carries a FIDO:/ URL with a temporary session key and the address of a tunnel service.',
            contains: 'contains', containsVal: 'ephemeral public key,\n         QR secret, tunnel id', validity: 'valid for', thisSession: 'this session',
            s5t: 'Ana points the phone camera',
            s5d: 'The phone reads the QR and learns how to talk to this particular browser. Nothing has been sent yet: just an invitation.',
            read: 'read', phone: 'phone', derived: 'derived the session key',
            s6t: 'Proximity proof over Bluetooth',
            s6d: 'The phone advertises over BLE a secret derived from the QR. The computer must hear that advertisement, which proves both are in the same place. The data itself goes through a tunnel on the internet, encrypted end to end.',
            dlgConnecting: 'Connecting to your phone…',
            bleHeard: 'secret(QR) ✔ heard by the PC', tunnel: 'tunnel', cipher: 'cipher', cipherVal: 'Noise, end to end', toPhone: '→ phone',
            s7t: 'Phone asks for the fingerprint',
            s7d: 'The phone shows which site the operation is for and asks for a fingerprint, face or lock code. Verification is local and never leaves the device.',
            dlgContinue: 'Continue on your phone', account: 'account', fpSensor: 'fingerprint sensor',
            s8tLogin: 'Passkey signs on the phone', s8tReg: 'Phone creates the passkey',
            s8dLogin: 'The private key is in the phone’s secure element (or synced to the account vault, always encrypted). The phone signs authenticatorData ‖ SHA-256(clientDataJSON); the key does not leave the device.',
            s8dReg: 'The phone generates a new ES256 pair and keeps the private key in the secure element, optionally syncing it encrypted to the account vault. The public key leaves with a credentialId.',
            synced: '(synced passkey)', backup: 'backup', syncable: '(syncable)',
            s9t: 'The response comes back through the tunnel',
            s9d: 'The signed response travels the same encrypted tunnel back to the browser, which hands it to the site as if it had come from a local authenticator.',
            dlgReceived: 'Response received', toBrowser: '→ browser', content: 'content'
        }
    }
};
export type Translations = typeof I18N.pt;
export function detectLanguage(): Language {
    try {
        const saved = localStorage.getItem('fido2demo.lang');
        if (saved === 'pt' || saved === 'en')
            return saved;
    }
    catch { /* Browser storage can be unavailable. */ }
    return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}
