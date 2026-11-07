import { createElement, Fragment } from 'react';
import type { ReactNode } from 'react';
import type { Ceremony, CeremonyDefinition, Mode, Step } from './types.ts';
import type { Translations } from './content.ts';
// Template interpolation produces React children, never an HTML string.
function code(strings: TemplateStringsArray, ...values: ReactNode[]): ReactNode {
    return createElement(Fragment, null, ...strings.flatMap((text, i) => [text, values[i]]));
}
export function createCeremonies(T: Translations) {
    const HEX = {
        challenge: '7f3a 91c2 0be4 5d76 a8f0 13c9 4e2b 6d81\n          c517 fa60 2e9d 4b3c 08d2 77a1 e5f4 9b06',
        chB64: 'fzqRwgvkXXao8BPJTittgcUX-mAunUs8CNJ3oeX0mwY',
        credId: 'a1b2 c3d4 e5f6 0718 2930 4a5b 6c7d 8e9f',
        sig: '3045 0221 00e7 4c19 8fa2 … 0220 5a1c 9b30 dd47 …',
        pub: '{ 1: 2 (EC2), 3: -7 (ES256), -1: 1 (P-256),\n  -2: x = 65a3 9f0c …, -3: y = d2e8 1b44 … }'
    };
    // Keep the illustrative values consistent across each ceremony's exchanges.
    const examples = {
        usb: { alg: -7, algorithm: 'ES256', publicKey: HEX.pub, signature: HEX.sig, fmt: 'packed', uv: 0, signCount: 42 },
        hello: { alg: -257, algorithm: 'RS256', publicKey: '{ 1: 3 (RSA), 3: -257 (RS256),\n  -1: n = c47a 51d2 … (256 bytes), -2: e = 010001 }', signature: '9f31 7a0c 62d4 … (256-byte RS256 signature)', fmt: 'tpm', uv: 1, signCount: 42 },
        phone: { alg: -7, algorithm: 'ES256', publicKey: HEX.pub, signature: HEX.sig, fmt: 'none', uv: 1, signCount: 0 }
    };
    const rpHash = () => '05be 55af 508c 5555 …  (' + T.rpHashNote + ')';
    const k = (text: string) => createElement('span', { className: 'k' }, text);
    const v = (text: string) => createElement('span', { className: 'v' }, text);
    const ok = (text: string) => createElement('span', { className: 'ok' }, text);
    const acc = (text: string) => createElement('span', { className: 'acc' }, text);
    /* ---------- shared steps ---------- */
    function stepRequest(mode: Mode): Step {
        const S = T.request, L = mode === 'login';
        return {
            who: 'client', tag: 'user',
            t: L ? S.tLogin : S.tReg,
            d: L ? S.dLogin : S.dReg,
            pkt: { from: 'client', to: 'rp', label: L ? S.pktLogin : S.pktReg },
            st: 'idle',
            data: code `${k('POST')} ${v(L ? '/webauthn/login/options' : '/webauthn/register/options')}\n{ ${k('"username"')}: ${v('"ana"')} }`
        };
    }
    function stepChallenge(mode: Mode, ceremony: Ceremony): Step {
        const S = T.challenge, L = mode === 'login';
        const example = examples[ceremony];
        const extra = L
            ? code `${k('rpId')}: ${v('"' + T.domain + '"')}\n${k('allowCredentials')}: [ { type: "public-key", id: ${v(HEX.credId)} } ]\n${k('userVerification')}: ${v(example.uv ? '"required"' : '"preferred"')}`
            : code `${k('rp')}: { id: ${v('"' + T.domain + '"')}, name: "Example Bank" }\n${k('user')}: { id: ${v('e9 2f …')}, name: "ana", displayName: "Ana" }\n${k('pubKeyCredParams')}: [ { type: "public-key", alg: ${v(String(example.alg))} } ]\n${k('authenticatorSelection')}: {\n  residentKey: ${v(ceremony === 'usb' ? '"discouraged"' : '"required"')},\n  userVerification: ${v(example.uv ? '"required"' : '"preferred"')}\n}\n${k('attestation')}: ${v(ceremony === 'phone' ? '"none"' : '"direct"')}`;
        return {
            who: 'rp', tag: 'rp',
            t: S.t,
            d: S.d + (L ? S.dLogin : S.dReg),
            pkt: { from: 'rp', to: 'client', label: 'WebAuthn options' },
            st: 'idle',
            data: code `${k('challenge')}: ${acc(HEX.challenge)}\n${extra}`
        };
    }
    function stepClientData(mode: Mode, message?: string): Step {
        const S = T.clientData, L = mode === 'login';
        return {
            who: 'client', tag: 'client',
            t: S.t,
            d: S.d(mode),
            pkt: null, st: 'idle', message,
            data: code `${k('clientDataJSON')} = {\n  ${k('"type"')}: ${v(L ? '"webauthn.get"' : '"webauthn.create"')},\n  ${k('"challenge"')}: ${acc('"' + HEX.chB64 + '"')},\n  ${k('"origin"')}: ${v('"https://' + T.domain + '"')},\n  ${k('"crossOrigin"')}: false\n}`
        };
    }
    function stepSend(mode: Mode, ceremony: Ceremony, st: string, message?: string): Step {
        const S = T.send, L = mode === 'login';
        const example = examples[ceremony];
        return {
            who: 'client', tag: 'client',
            t: L ? S.tLogin : S.tReg,
            d: L ? S.dLogin : S.dReg,
            pkt: { from: 'client', to: 'rp', label: L ? 'assertion' : 'attestation' },
            st, message,
            data: L
                ? code `${k('POST')} ${v('/webauthn/login/verify')}\n${k('credentialId')}: ${v(HEX.credId)}\n${k('authenticatorData')}: rpIdHash ‖ flags ‖ signCount\n${k('clientDataJSON')}: …\n${k('signature')}: ${acc(example.signature)}\n${k('userHandle')}: ${v(ceremony === 'usb' ? 'null' : 'e9 2f …')}`
                : code `${k('POST')} ${v('/webauthn/register/verify')}\n${k('credentialId')}: ${v(HEX.credId)}\n${k('attestationObject')}: { fmt, authData, attStmt }\n${k('clientDataJSON')}: …`
        };
    }
    function stepVerify(mode: Mode, ceremony: Ceremony, st: string): Step {
        const S = T.verify, L = mode === 'login';
        const example = examples[ceremony];
        const backup = ceremony === 'phone' ? 'BE=1 BS=1' : 'BE=0 BS=0';
        const counter = example.signCount === 0 ? '0 → 0 (counter not supported)' : `${example.signCount - 1} → ${example.signCount}`;
        return {
            who: 'rp', tag: 'rp',
            t: L ? S.tLogin : S.tReg,
            d: L ? S.dLogin : S.dReg,
            pkt: null, st,
            data: L
                ? code `${k('credentialId / userHandle')}: match account ${ok('✔')}\n${k('type')}: webauthn.get ${ok('✔')}\n${k('challenge')} == ${S.expected}, fresh and unused ${ok('✔')}\n${k('origin')} == https://${T.domain} ${ok('✔')}\n${k('crossOrigin')}: false ${ok('✔')}\n${k('rpIdHash')} == SHA-256(rpId) ${ok('✔')}\n${k('flags')}: UP=1 UV=${example.uv}, ${backup} ${ok('✔')}\n${k('UV policy')}: ${example.uv ? 'required and verified' : 'preferred; presence-only example'}\n${k('verify')}(pubKey, sig, authData ‖ SHA-256(clientDataJSON)) → ${ok('true')}\n${k('signCount')}: ${counter} ${ok('✔')}\n${k('extensions')}: checked under RP policy ${ok('✔')}\n${k('challenge')}: consumed\n${ok('Authentication complete; session after all required factors')}`
                : code `${k('type')}: webauthn.create ${ok('✔')}\n${k('challenge')} == ${S.expected}, fresh and unused ${ok('✔')}\n${k('origin')} == https://${T.domain} ${ok('✔')}\n${k('crossOrigin')}: false ${ok('✔')}\n${k('rpIdHash')} == SHA-256(rp.id) ${ok('✔')}\n${k('flags')}: UP=1 UV=${example.uv} AT=1, ${backup} ${ok('✔')}\n${k('alg')}: ${example.alg} (${example.algorithm}), offered ${ok('✔')}\n${k('credentialId')}: not already registered ${ok('✔')}\n${k('fmt')}: ${v('"' + example.fmt + '"')}\n${k(S.attest)}: ${example.fmt === 'none' ? 'attStmt: {} (no attestation statement)' : 'statement verified; trust path accepted by RP policy'}\n${k('extensions')}: checked under RP policy ${ok('✔')}\n${k(S.saved)}: { user: ana, credentialId,\n  publicKey: ${acc('COSE ' + example.algorithm)},\n  signCount: authData.signCount (0), ${backup} }\n${k('challenge')}: consumed`
        };
    }
    /* ---------- ceremonies ---------- */
    const CEREMONIES: Record<Ceremony, CeremonyDefinition> = {
        usb: {
            steps(mode) {
                const S = T.usbSteps, W = T.words, L = mode === 'login', example = examples.usb;
                return [
                    stepRequest(mode), stepChallenge(mode, 'usb'),
                    stepClientData(mode, S.dlgInsert),
                    { who: 'auth', tag: 'user', t: S.s4t,
                        d: S.s4d(mode),
                        pkt: { from: 'client', to: 'auth', label: L ? 'getAssertion' : 'makeCredential' }, st: 'inserted', message: S.dlgTouch,
                        data: code `${k('CTAP2')} ${v(L ? 'authenticatorGetAssertion' : 'authenticatorMakeCredential')}\n${k('clientDataHash')}: SHA-256(clientDataJSON)\n${L ? code `${k('rpId')}: ${v('"' + T.domain + '"')}\n${k('allowList')}: [ { type: "public-key", id: ${v(HEX.credId)} } ]` : code `${k('rp')}: { id: ${v('"' + T.domain + '"')}, name: "Example Bank" }\n${k('user')}: { id, name: "ana", displayName: "Ana" }\n${k('pubKeyCredParams')}: [ { type: "public-key", alg: -7 } ]\n${k('options')}: { rk: false }`}` },
                    { who: 'auth', tag: 'auth', t: S.s5t,
                        d: S.s5d,
                        pkt: null, st: 'blink', message: S.dlgTouch, dur: 3200,
                        data: code `${k('status')}: ${acc(S.s5status)}\n${k('LED')}: ${S.s5led}` },
                    { who: 'auth', tag: 'user', t: L ? S.s6tLogin : S.s6tReg,
                        d: L ? S.s6dLogin : S.s6dReg,
                        pkt: null, st: 'touch', message: S.dlgVerifying, dur: 3400,
                        data: L
                            ? code `${k('authenticatorData')}:\n  rpIdHash ${v(rpHash())}\n  flags    ${v('0x01')} (UP=1, UV=0)\n  signCount ${v(String(example.signCount))}\n${k('signature')}: ${acc(example.signature)}`
                            : code `${k(W.newPair)}: ES256 (P-256)\n${k('credentialId')}: ${v(HEX.credId)}\n${k('publicKey')} (COSE):\n${acc(example.publicKey)}\n${k('privateKey')}: ${ok(W.staysChip)}\n${k('authData')}: flags 0x41 (UP=1, UV=0, AT=1), signCount 0\n${k('fmt')}: ${v('"' + example.fmt + '"')}` },
                    stepSend(mode, 'usb', 'signed', W.sending),
                    stepVerify(mode, 'usb', 'done')
                ];
            }
        },
        hello: {
            steps(mode) {
                const S = T.helloSteps, W = T.words, L = mode === 'login', example = examples.hello;
                return [
                    stepRequest(mode), stepChallenge(mode, 'hello'),
                    stepClientData(mode),
                    { who: 'auth', tag: 'client', t: S.s4t,
                        d: S.s4d,
                        pkt: { from: 'client', to: 'auth', label: L ? 'getAssertion' : 'makeCredential' }, st: 'prompt', message: S.dlgIdentity,
                        data: code `${k(S.authenticator)}: ${v(S.platform)}\n${k(S.transport)}: ${v('"internal"')}\n${k('userVerification')}: ${acc(S.required)}` },
                    { who: 'auth', tag: 'user', t: S.s5t,
                        d: S.s5d,
                        pkt: null, st: 'scan', message: S.dlgLooking, dur: 3400,
                        data: code `${k(S.sensor)}: ${S.sensorVal}\n${k(S.faceModel)}: ${ok(S.onlyPc)}\n${k(S.sentToSite)}: ${ok(S.nothing)}` },
                    { who: 'auth', tag: 'auth', t: S.s6t,
                        d: S.s6d,
                        pkt: null, st: 'match', message: S.dlgRecognized,
                        data: code `${k('match')}: ${ok('true')}\n${k('flags')}: UP=1 ${acc('UV=1')}\n${k('TPM 2.0')}: ${S.unlocked}` },
                    { who: 'auth', tag: 'auth', t: L ? S.s7tLogin : S.s7tReg,
                        d: L ? S.s7dLogin : S.s7dReg,
                        pkt: null, st: 'sign', message: S.dlgSigning, dur: 3200,
                        data: L
                            ? code `${k('authenticatorData')}:\n  rpIdHash ${v(rpHash())}\n  flags    ${v('0x05')} (UP=1, UV=1)\n  signCount ${v(String(example.signCount))}\n${k('signature')}: ${acc(example.signature)}`
                            : code `${k(W.newPair)}: ${example.algorithm}, ${S.genTpm}\n${k('credentialId')}: ${v(HEX.credId)}\n${k('publicKey')} (COSE):\n${acc(example.publicKey)}\n${k('authData')}: flags 0x45 (UP=1, UV=1, AT=1), signCount 0\n${k('fmt')}: ${v('"' + example.fmt + '"')} (${S.chipAttest})` },
                    stepSend(mode, 'hello', 'sign', W.sending),
                    stepVerify(mode, 'hello', 'done')
                ];
            }
        },
        phone: {
            steps(mode) {
                const S = T.phoneSteps, W = T.words, L = mode === 'login', example = examples.phone;
                return [
                    stepRequest(mode), stepChallenge(mode, 'phone'),
                    stepClientData(mode),
                    { who: 'client', tag: 'client', t: S.s4t,
                        d: S.s4d,
                        pkt: null, st: 'qr',
                        data: code `${k('QR')}: ${v('FIDO:/0648…')}\n${k(S.contains)}: ${S.containsVal}\n${k(S.validity)}: ${S.thisSession}` },
                    { who: 'auth', tag: 'user', t: S.s5t,
                        d: S.s5d,
                        pkt: null, st: 'phone-in', phone: 'camera',
                        data: code `${k(S.read)}: ${v('FIDO:/0648…')}\n${k(S.phone)}: ${S.derived}` },
                    { who: 'auth', tag: 'auth', t: S.s6t,
                        d: S.s6d,
                        pkt: { from: 'client', to: 'auth', label: L ? 'getAssertion' : 'makeCredential' }, st: 'ble', message: S.dlgConnecting, phone: 'camera', dur: 3400,
                        data: code `${k('BLE advert')}: ${acc(S.bleHeard)}\n${k(S.tunnel)}: ${v('wss://cable.…/connect')}\n${k(S.cipher)}: ${S.cipherVal}\n${k('CTAP2')} ${v(L ? 'getAssertion' : 'makeCredential')} ${S.toPhone}\n${k('clientDataHash')}: SHA-256(clientDataJSON)` },
                    { who: 'auth', tag: 'user', t: S.s7t,
                        d: S.s7d,
                        pkt: null, st: 'prompt', message: S.dlgContinue, phone: 'prompt', dur: 3200,
                        data: code `${k('rpId')}: ${v('"' + T.domain + '"')}\n${k(S.account)}: ana\n${k('userVerification')}: ${v('"required"')}\n${k('local verification')}: ${acc(S.fpSensor)}` },
                    { who: 'auth', tag: 'auth', t: L ? S.s8tLogin : S.s8tReg,
                        d: L ? S.s8dLogin : S.s8dReg,
                        pkt: null, st: 'sign', message: S.dlgContinue, phone: 'ok', dur: 3000,
                        data: L
                            ? code `${k('flags')}: 0x1d (UP=1 UV=1 BE=1 BS=1)\n${k('signCount')}: ${v(String(example.signCount))} ${S.synced}\n${k('signature')}: ${acc(example.signature)}`
                            : code `${k(W.newPair)}: ES256\n${k('credentialId')}: ${v(HEX.credId)}\n${k('publicKey')} (COSE):\n${acc(example.publicKey)}\n${k('authData')}: flags 0x5d (UP=1 UV=1 BE=1 BS=1 AT=1), signCount 0\n${k(S.backup)}: ${v('BE=1, BS=1')} ${S.syncable}\n${k('fmt')}: ${v('"none"')}, attStmt: {}` },
                    { who: 'client', tag: 'auth', t: S.s9t,
                        d: S.s9d,
                        pkt: { from: 'auth', to: 'client', label: L ? 'assertion' : 'attestation' }, st: 'return', message: S.dlgReceived, phone: 'ok',
                        data: code `${k(S.tunnel)} ${S.toBrowser}\n${k(S.content)}: ${v(L ? 'credential, authData, signature, user' : 'fmt, authData, attStmt')}\n${k('clientDataJSON')}: retained by the browser, not sent over CTAP2` },
                    stepSend(mode, 'phone', 'return'),
                    stepVerify(mode, 'phone', 'done')
                ];
            }
        }
    };
    return CEREMONIES;
}
