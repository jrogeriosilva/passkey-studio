import { createElement } from 'react';
import type { Mode } from './types.ts';

export const CONTENT = {
    htmlLang: 'en',
    h1: 'FIDO2 ceremonies, step by step',
    lede: ['Compare ', createElement('strong', { key: 0 }, 'three authenticators'), ' in registration and authentication. Choose a ceremony and play its steps.'],
    ariaAuth: 'Authenticator', ariaMode: 'Ceremony type', ariaStage: 'Animation stage',
    tabUsb: 'USB key', tabUsbSub: 'Physical touch · CTAP2 over USB',
    tabHello: 'Windows Hello', tabHelloSub: 'Face or PIN · key in the TPM',
    tabPhone: 'Smartphone', tabPhoneSub: 'QR + Bluetooth · passkey',
    modeLogin: 'Authentication', modeRegister: 'Registration',
    nodeRp: 'Server (Relying Party)', nodeClient: 'Browser (client)',
    reset: 'Restart', prev: 'Previous', play: 'Play', pause: 'Pause', next: 'Next',
    stepsTitle: (mode: Mode, name: string) => (mode === 'login' ? 'Authentication with ' : 'Registration with ') + name,
    stepsSub: (n: number) => n + ' steps · click a step to jump to it',
    dataTransit: 'Data in transit', dataRp: 'On the server', dataAuth: 'On the authenticator',
    tags: { user: 'user action', rp: 'server', client: 'browser', auth: 'authenticator' },
    fact1t: 'Each attempt gets a fresh challenge', fact1p: 'This example uses 32 random bytes; WebAuthn recommends at least 16 with sufficient entropy. The server checks freshness, expiry and single use to prevent replay.',
    fact2t: 'The relying party never receives the private key', fact2p: 'Device-bound credentials stay with their authenticator. Synced passkeys can be backed up and synchronized as encrypted credential material by a passkey provider.',
    fact3t: 'Credentials are scoped to the relying party', fact3p: 'The browser enforces RP ID restrictions. Assertions bind the full origin in clientDataJSON to the signature; the server must check that origin against its expected origins.',
    ctaTitle: 'Now with real bytes',
    ctaLede: 'This page is illustrative: the values shown are made up. To watch the same ceremonies produce real credentials — and to open the fields of a WebAuthn response byte by byte — use the two tools below.',
    ctaLabP: 'In-browser test client for FIDO2 servers. Run registration and authentication with a real hardware authenticator or with fully simulated credentials — no physical key required.',
    ctaLabBtn: 'Experiment · FIDO2 Lab',
    ctaDecP: ["Paste a ", createElement('code', { key: 0 }, "PublicKeyCredential"), ", ", createElement('code', { key: 1 }, "attestationObject"), ", ", createElement('code', { key: 2 }, "authenticatorData"), " or ", createElement('code', { key: 3 }, "clientDataJSON"), " and inspect every field in a navigable tree. Runs entirely in your browser: nothing is sent anywhere."],
    ctaDecBtn: 'Inspect · WebAuthn Decoder',
    disclaimer: ["This page is a purely graphical demonstration. No real call to ", createElement('code', { key: 0 }, "navigator.credentials"), " is made. Bytes and field lists are illustrative and abbreviated, not executable requests or complete server verification algorithms. The steps follow the structure of WebAuthn (W3C) and CTAP2 (FIDO Alliance)."],
    /* scene */
    domain: 'bank.example', rpHashNote: 'SHA-256 of "bank.example"',

    keySigned: 'signed', keyCreated: 'key created', tunnelLbl: 'encrypted tunnel',
    keyHint: 'touch the key', tapConfirmed: 'presence confirmed · UP=1',
    bleLbl: 'BLE proximity check',
    phTouch: 'Touch the sensor', phSigned: 'Signed',
    /* ceremonies */
    usb: { name: 'a USB key', auth: 'USB key', note: 'CTAP2 over USB HID · non-discoverable credential · presence only' },
    hello: { name: 'Windows Hello', auth: 'Windows Hello · TPM', note: 'TPM-backed example · device-bound passkey · local user verification' },
    phone: { name: 'a smartphone', auth: 'Smartphone', note: 'Hybrid transport · QR + Bluetooth LE + encrypted tunnel' },
    /* shared steps */
    request: {
        tLogin: 'User asks to authenticate', tReg: 'User asks to register a credential',
        dLogin: 'At bank.example, Ana asks to authenticate. The site requests fresh options from the server. The USB example uses a username and a presence-only credential; Hello and phone use passkeys with user verification.',
        dReg: 'Already signed in, Ana registers a credential in the account settings. The USB example creates a non-discoverable FIDO2 credential; Hello and phone create discoverable passkeys.',
        pktLogin: 'login request', pktReg: 'registration request'
    },
    challenge: {
        t: 'Server generates the challenge',
        d: 'In this example, the server generates a 32-byte random challenge, binds it to this attempt and sets an expiry. The RP ID scopes the credential to the relying party; it has no scheme or port. ',
        dLogin: 'The options include an allowed credential list and the user verification policy. Discoverable sign-in can omit this list.', dReg: 'The options include RP and user data, accepted algorithms, discoverability, user verification and attestation preferences.'
    },
    clientData: {
        t: 'Browser builds the clientDataJSON',
        d: (m: Mode) => 'The site calls navigator.credentials.' + (m === 'login' ? 'get' : 'create') + '(). The browser checks RP ID scope and records the type, challenge and full origin in clientDataJSON. It sends only SHA-256(clientDataJSON) to the CTAP2 authenticator. ' + (m === 'login' ? 'The assertion signature binds this hash to authenticatorData; the server must still validate the origin and challenge.' : 'An attestation statement may bind this hash to authenticatorData. With fmt: none there is no attestation signature.'),
    },
    send: {
        tLogin: 'Browser sends the signature (assertion)', tReg: 'Browser sends the attestationObject',
        dLogin: 'The browser combines the authenticator response with its own clientDataJSON and sends the credential identifier, authenticatorData, signature and userHandle when present to the server. It never sends the private key.',
        dReg: 'The browser sends the credential identifier and attestationObject, including authData and the credential public key, together with its own clientDataJSON. The returned attestation depends on the preference, authenticator and browser policy.',
    },
    verify: {
        tLogin: 'Server verifies and signs the user in', tReg: 'Server stores the public key',
        dLogin: 'The server checks credential ownership, the type, challenge, origin, RP ID hash, UP and required UV, then verifies the signature. A non-increasing counter is a risk signal when either value is nonzero; 0 → 0 is valid without counter support. On success it consumes the challenge and creates a session after all required factors.',
        dReg: 'The server checks the type, fresh challenge, origin, RP ID hash, UP, required UV, offered algorithm and duplicate credential ID. It processes attestation and extensions under its policy, then stores the public key, returned signCount and backup flags with Ana’s account and consumes the challenge.',
        expected: 'expected', attest: 'attestation', saved: 'saved'
    },
    words: { newPair: 'new pair', staysChip: 'stays in the chip', sending: 'Sending response…' },
    usbSteps: {
        dlgInsert: 'Insert your security key', dlgTouch: 'Touch the key when it blinks', dlgVerifying: 'Verifying…',
        s4t: 'Key inserted into the USB port',
        s4d: (m: Mode) => 'Ana plugs in the key. The browser talks to it over CTAP2 on USB HID, with no special driver, and sends the ' + (m === 'login' ? 'authenticatorGetAssertion command.' : 'authenticatorMakeCredential command.'),
        s5t: 'The key asks for user presence',
        s5d: 'The LED blinks. A touch confirms user presence (UP), not the person’s identity (UV). This presence-only example can serve as a second factor; a UV-required policy would also need a supported PIN or biometric.',
        s5status: 'waiting for user presence (UP)', s5led: 'blinking',
        s6tLogin: 'Touch the key: it signs the assertion', s6tReg: 'Touch the key: it creates a new key pair',
        s6dLogin: 'The finger touches the sensor. The key looks up the private key tied to the rpId and credentialId and signs authenticatorData ‖ SHA-256(clientDataJSON) with it.',
        s6dReg: 'The finger touches the sensor. This key creates a non-discoverable ES256 credential scoped to bank.example and returns its public key, new credentialId and packed attestation data. The credential private key is not disclosed to the relying party.'
    },
    helloSteps: {
        s4t: 'Windows takes over the operation',
        s4d: 'The browser hands the operation to Windows Hello. This example uses a TPM-backed, device-bound passkey. Windows Hello can also use software-backed keys depending on the device and policy; TPM storage is not a WebAuthn guarantee.',
        dlgIdentity: 'Verifying your identity',
        authenticator: 'authenticator', platform: 'platform (Windows Hello)', transport: 'transport', required: 'required',
        s5t: 'The infrared camera looks for the face',
        s5d: 'A compatible near-infrared camera captures facial features for local matching. IR imaging and anti-spoofing measures help resist photographs; they do not guarantee immunity to every attack. A fingerprint or PIN can also provide local user verification.',
        dlgLooking: 'Looking for you…',
        sensor: 'sensor', sensorVal: 'near-IR camera', faceModel: 'face model', onlyPc: 'exists only on this PC', sentToSite: 'biometric data sent to the site', nothing: 'nothing',
        s6t: 'Face recognized: operation authorized',
        s6d: 'The comparison happens locally; biometric data is not sent to the site. Successful user verification authorizes credential creation or use. In this TPM-backed example, the private key is protected by the TPM and is not exported in plaintext.',
        dlgRecognized: 'Recognized', unlocked: 'operation authorized',
        s7tLogin: 'TPM signs the assertion', s7tReg: 'TPM creates the key pair',
        s7dLogin: 'Inside the TPM, the private key signs authenticatorData ‖ SHA-256(clientDataJSON). Only the signature leaves the chip.',
        s7dReg: 'This example creates a discoverable RS256 credential protected by the TPM. With direct attestation requested and allowed here, the response uses fmt: tpm. Supported algorithms and attestation availability depend on the implementation.',
        dlgSigning: 'Signing…', genTpm: 'generated in the TPM', chipAttest: 'chip attestation'
    },
    phoneSteps: {
        s4t: 'Browser shows a QR code',
        s4d: 'Ana chooses “use a phone”. The browser displays a FIDO:/ URI containing digit-encoded CBOR: a client public key, a QR secret, the count of known tunnel server domains and additional metadata. It does not contain a tunnel address or tunnel ID.',
        contains: 'contains', containsVal: 'P-256 client public key, QR secret,\n         known tunnel-domain count, metadata', validity: 'valid for', thisSession: 'this session',
        s5t: 'Ana points the phone camera',
        s5d: 'The phone reads the QR and learns how to talk to this particular browser. Nothing has been sent yet: just an invitation.',
        read: 'read', phone: 'phone', derived: 'read public key and QR secret',
        s6t: 'Proximity check over Bluetooth',
        s6d: 'The phone broadcasts an encrypted BLE advertisement, matched using a key derived from the QR secret. Reception supports a proximity check, not an exact distance or room boundary. In this WebSocket hybrid example, the devices establish an end-to-end encrypted tunnel and carry CTAP2 messages through it.',
        dlgConnecting: 'Connecting to your phone…',
        bleHeard: 'encrypted advert ✔ matched by the PC', tunnel: 'tunnel', cipher: 'cipher', cipherVal: 'Noise, end to end', toPhone: '→ phone',
        s7t: 'Phone asks for the fingerprint',
        s7d: 'The phone shows which site the operation is for and asks for a fingerprint, face or lock code. Verification is local and never leaves the device.',
        dlgContinue: 'Continue on your phone', account: 'account', fpSensor: 'fingerprint sensor',
        s8tLogin: 'Passkey signs on the phone', s8tReg: 'Phone creates the passkey',
        s8dLogin: 'The phone’s passkey provider authorizes use of the credential key and signs authenticatorData ‖ SHA-256(clientDataJSON). Storage and hardware protection depend on the provider. Synced passkeys can be transferred as encrypted credential material; the relying party never receives the private key.',
        s8dReg: 'The provider creates a discoverable ES256 passkey. This example is backed up (BE=1, BS=1); other passkeys may be eligible but not yet backed up (BE=1, BS=0). With attestation: none, no attestation statement is conveyed.',
        synced: '(this synced passkey has no counter)', backup: 'backup', syncable: '(eligible and currently backed up)',
        s9t: 'The response comes back through the tunnel',
        s9d: 'The CTAP2 response travels through the encrypted tunnel back to the browser. The phone never received clientDataJSON, only its hash. The browser combines the response with the clientDataJSON it retained and returns a PublicKeyCredential to the site.',
        dlgReceived: 'Response received', toBrowser: '→ browser', content: 'content'
    }
};
export type Translations = typeof CONTENT;
