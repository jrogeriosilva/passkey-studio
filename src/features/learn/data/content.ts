import { createElement } from 'react';
import type { Mode } from './types.ts';

export const CONTENT = {
    htmlLang: 'en', title: 'FIDO2 Ceremonies',
    metaDesc: 'Interactive demonstration of the FIDO2/WebAuthn registration and authentication ceremonies.',
    h1: 'FIDO2 ceremonies, step by step',
    lede: ['Compare ', createElement('strong', { key: 0 }, 'four authenticators'), ' in registration and authentication. Choose a ceremony and play its steps.'],
    ariaAuth: 'Authenticator', ariaMode: 'Ceremony type', ariaStage: 'Animation stage',
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
    ctaLabBtn: 'Experiment · FIDO2 Lab',
    ctaDecP: ["Paste a ", createElement('code', { key: 0 }, "PublicKeyCredential"), ", ", createElement('code', { key: 1 }, "attestationObject"), ", ", createElement('code', { key: 2 }, "authenticatorData"), " or ", createElement('code', { key: 3 }, "clientDataJSON"), " and inspect every field in a navigable tree. Runs entirely in your browser: nothing is sent anywhere."],
    ctaDecBtn: 'Inspect · WebAuthn Decoder',
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
};
export type Translations = typeof CONTENT;
