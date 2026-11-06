import { createElement, Fragment } from 'react';
import type { ReactNode } from 'react';
import type { Actor, Ceremony, CeremonyDefinition, Mode, Screen, Step } from './types.ts';
import type { Translations } from './i18n.ts';
// Template interpolation produces React children, never an HTML string.
function code(strings: TemplateStringsArray, ...values: ReactNode[]): ReactNode {
    return createElement(Fragment, null, ...strings.flatMap((text, i) => [text, values[i]]));
}
export function createCeremonies(T: Translations) {
    const HEX = {
        challenge: '7f3a 91c2 0be4 5d76 a8f0 13c9 4e2b 6d81\n          c517 fa60 2e9d 4b3c 08d2 77a1 e5f4 9b06',
        chB64: 'fzqRwgvkXXao8BPJTitugcUX-mAunUs8CNJ3oeX0mwY',
        credId: 'a1b2 c3d4 e5f6 0718 2930 4a5b 6c7d 8e9f',
        sig: '3045 0221 00e7 4c19 8fa2 … 0220 5a1c 9b30 dd47 …',
        pub: '{ 1: 2 (EC2), 3: -7 (ES256),\n  -2: x = 65a3 9f0c …, -3: y = d2e8 1b44 … }'
    };
    const rpHash = () => '8c1f 4e7a 9d02 b6c3 …  (' + T.rpHashNote + ')';
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
            st: 'idle', screen: { type: 'login' },
            data: code `${k('POST')} ${v(L ? '/webauthn/login/options' : '/webauthn/register/options')}\n{ ${k('"username"')}: ${v('"ana"')} }`
        };
    }
    function stepChallenge(mode: Mode): Step {
        const S = T.challenge, L = mode === 'login';
        const extra = L
            ? code `${k('allowCredentials')}: [ ${v(HEX.credId)} ]\n${k('userVerification')}: ${v('"preferred"')}`
            : code `${k('user')}: { id: ${v('e9 2f …')}, name: ${v('"ana"')} }\n${k('pubKeyCredParams')}: [ ${v('ES256 (-7)')}, ${v('RS256 (-257)')} ]`;
        return {
            who: 'rp', tag: 'rp',
            t: S.t,
            d: S.d + (L ? S.dLogin : S.dReg),
            pkt: { from: 'rp', to: 'client', label: 'challenge + rpId' },
            st: 'idle', screen: { type: 'loading' },
            data: code `${k('challenge')}: ${acc(HEX.challenge)}\n${k('rpId')}: ${v('"' + T.domain + '"')}\n${extra}`
        };
    }
    function stepClientData(mode: Mode, screen: Screen): Step {
        const S = T.clientData, L = mode === 'login';
        return {
            who: 'client', tag: 'client',
            t: S.t,
            d: S.d(mode),
            pkt: null, st: 'idle', screen,
            data: code `${k('clientDataJSON')} = {\n  ${k('"type"')}: ${v(L ? '"webauthn.get"' : '"webauthn.create"')},\n  ${k('"challenge"')}: ${acc('"' + HEX.chB64 + '"')},\n  ${k('"origin"')}: ${v('"https://' + T.domain + '"')}\n}`
        };
    }
    function stepSend(mode: Mode, st: string, screen: Screen, from?: Actor): Step {
        const S = T.send, L = mode === 'login';
        return {
            who: 'client', tag: 'client',
            t: L ? S.tLogin : S.tReg,
            d: L ? S.dLogin : S.dReg,
            pkt: { from: from || 'client', to: 'rp', label: L ? 'assertion' : 'attestation' },
            st, screen,
            data: L
                ? code `${k('POST')} ${v('/webauthn/login/verify')}\n${k('credentialId')}: ${v(HEX.credId)}\n${k('authenticatorData')}: rpIdHash ‖ flags ‖ counter\n${k('clientDataJSON')}: …\n${k('signature')}: ${acc(HEX.sig)}`
                : code `${k('POST')} ${v('/webauthn/register/verify')}\n${k('credentialId')}: ${v(HEX.credId)}\n${k('attestationObject')}: { fmt, authData, attStmt }\n${k('clientDataJSON')}: …`
        };
    }
    function stepVerify(mode: Mode, uv: number, st: string): Step {
        const S = T.verify, L = mode === 'login';
        return {
            who: 'rp', tag: 'rp',
            t: L ? S.tLogin : S.tReg,
            d: L ? S.dLogin : S.dReg,
            pkt: null, st, screen: { type: 'ok' },
            data: L
                ? code `${k('challenge')} == ${S.expected}        ${ok('✔')}\n${k('origin')} == https://${T.domain}  ${ok('✔')}\n${k('rpIdHash')} == SHA-256(rpId)  ${ok('✔')}\n${k('flags')}: UP=1 UV=${uv}             ${ok('✔')}\n${k('counter')}: 41 → 42             ${ok('✔')}\n${k('verify')}(pubKey, sig, ${S.dataWord}) → ${ok('true')}\n${ok('Set-Cookie: session=…')}`
                : code `${k('challenge')} == ${S.expected}   ${ok('✔')}\n${k('origin')} == ${S.expected}      ${ok('✔')}\n${k('fmt')}: ${v('"packed"')}  ${S.attest} ${ok('✔')}\n${k(S.saved)}: { user: ana,\n  credentialId: ${v(HEX.credId)},\n  publicKey: ${acc('COSE ES256')}, counter: 0 }`
        };
    }
    /* ---------- ceremonies ---------- */
    const CEREMONIES: Record<Ceremony, CeremonyDefinition> = {
        usb: {
            steps(mode) {
                const S = T.usbSteps, W = T.words, L = mode === 'login';
                const dlg = (m: string): Screen => ({ type: 'dialog', msg: m });
                return [
                    stepRequest(mode), stepChallenge(mode),
                    stepClientData(mode, dlg(S.dlgInsert)),
                    { who: 'auth', tag: 'user', t: S.s4t,
                        d: S.s4d(mode),
                        pkt: { from: 'client', to: 'auth', label: L ? 'getAssertion' : 'makeCredential' }, st: 'inserted', screen: dlg(S.dlgTouch),
                        data: code `${k('CTAP2')} ${v(L ? 'authenticatorGetAssertion' : 'authenticatorMakeCredential')}\n${k('rpId')}: ${v('"' + T.domain + '"')}\n${k('clientDataHash')}: SHA-256(clientDataJSON)\n${L ? code `${k('allowList')}: [ ${v(HEX.credId)} ]` : code `${k('user')}: { id, name: "ana" }`}` },
                    { who: 'auth', tag: 'auth', t: S.s5t,
                        d: S.s5d,
                        pkt: null, st: 'blink', screen: dlg(S.dlgTouch), dur: 3200,
                        data: code `${k('status')}: ${acc(S.s5status)}\n${k('LED')}: ${S.s5led}` },
                    { who: 'auth', tag: 'user', t: L ? S.s6tLogin : S.s6tReg,
                        d: L ? S.s6dLogin : S.s6dReg,
                        pkt: null, st: 'touch', screen: dlg(S.dlgVerifying), dur: 3400,
                        data: L
                            ? code `${k('authenticatorData')}:\n  rpIdHash ${v(rpHash())}\n  flags    ${v('0x01')} (UP=1, UV=0)\n  counter  ${v('42')}\n${k('signature')}: ${acc(HEX.sig)}`
                            : code `${k(W.newPair)}: ES256 (P-256)\n${k('credentialId')}: ${v(HEX.credId)}\n${k('publicKey')} (COSE):\n${acc(HEX.pub)}\n${k('privateKey')}: ${ok(W.staysChip)}` },
                    stepSend(mode, 'signed', dlg(W.sending)),
                    stepVerify(mode, 0, 'done')
                ];
            },
            states: { idle: [], inserted: ['in'], blink: ['in', 'blink'], touch: ['in', 'touch'], signed: ['in', 'glow'], done: ['in'] }
        },
        nfc: {
            steps(mode) {
                const S = T.nfcSteps, W = T.words, L = mode === 'login';
                const dlg = (m: string): Screen => ({ type: 'dialog', msg: m });
                const getResp = code `${k('SW')}: ${acc('91 00')} (${S.processing}) → ${v('NFCCTAP_GETRESPONSE')}`;
                return [
                    stepRequest(mode), stepChallenge(mode),
                    { ...stepClientData(mode, dlg(S.dlgTap)), st: 'poll' },
                    { who: 'auth', tag: 'user', t: S.s4t,
                        d: S.s4d,
                        pkt: { from: 'client', to: 'auth', label: 'SELECT AID' }, st: 'tap', screen: dlg(S.dlgDetected), dur: 3200,
                        data: code `${k('NFC')}: ${v('ISO/IEC 14443-A · 13,56 MHz')}\n${k(S.fieldK)}: ${ok(S.fieldV)}\n${k('SELECT AID')}: ${v('00 A4 04 00 08 A0 00 00 06 47 2F 00 01')}\n${k(S.replyK)}: ${acc('"FIDO_2_0"')} ${ok('90 00')}` },
                    { who: 'auth', tag: 'client', t: S.s5t,
                        d: S.s5d(mode),
                        pkt: { from: 'client', to: 'auth', label: L ? 'getAssertion' : 'makeCredential' }, st: 'cmd', screen: dlg(S.dlgDetected), dur: 3200,
                        data: code `${k('APDU NFCCTAP_MSG')}: ${v('80 10 00 00')} Lc …\n${k('CTAP2')} ${v(L ? 'authenticatorGetAssertion (0x02)' : 'authenticatorMakeCredential (0x01)')}\n${k('rpId')}: ${v('"' + T.domain + '"')}\n${k('clientDataHash')}: SHA-256(clientDataJSON)\n${L ? code `${k('allowList')}: [ ${v(HEX.credId)} ]` : code `${k('user')}: { id, name: "ana" }`}\n${k(S.presenceK)}: ${ok(S.presenceV)}` },
                    { who: 'auth', tag: 'auth', t: L ? S.s6tLogin : S.s6tReg,
                        d: L ? S.s6dLogin : S.s6dReg,
                        pkt: null, st: 'sign', screen: dlg(S.dlgVerifying), dur: 3600,
                        data: L
                            ? code `${getResp}\n${k('authenticatorData')}:\n  rpIdHash ${v(rpHash())}\n  flags    ${v('0x01')} (UP=1, UV=0)\n  counter  ${v('42')}\n${k('signature')}: ${acc(HEX.sig)}\n${k('SW')}: ${ok('90 00')}`
                            : code `${getResp}\n${k(W.newPair)}: ES256 (P-256)\n${k('credentialId')}: ${v(HEX.credId)}\n${k('publicKey')} (COSE):\n${acc(HEX.pub)}\n${k('privateKey')}: ${ok(W.staysChip)}\n${k('SW')}: ${ok('90 00')}` },
                    stepSend(mode, 'signed', dlg(W.sending)),
                    stepVerify(mode, 0, 'done')
                ];
            },
            states: { idle: [], poll: ['poll'], tap: ['in', 'field'], cmd: ['in', 'field', 'busy', 'up'], sign: ['in', 'field', 'busy', 'hold'], signed: ['in', 'field', 'glow'], done: ['in'] }
        },
        hello: {
            steps(mode) {
                const S = T.helloSteps, W = T.words, L = mode === 'login';
                const dlg = (m: string): Screen => ({ type: 'dialog', msg: m });
                return [
                    stepRequest(mode), stepChallenge(mode),
                    stepClientData(mode, { type: 'loading' }),
                    { who: 'auth', tag: 'client', t: S.s4t,
                        d: S.s4d,
                        pkt: { from: 'client', to: 'auth', label: L ? 'getAssertion' : 'makeCredential' }, st: 'prompt', screen: dlg(S.dlgIdentity),
                        data: code `${k(S.authenticator)}: ${v(S.platform)}\n${k(S.transport)}: ${v('"internal"')}\n${k('userVerification')}: ${acc(S.required)}` },
                    { who: 'auth', tag: 'user', t: S.s5t,
                        d: S.s5d,
                        pkt: null, st: 'scan', screen: dlg(S.dlgLooking), dur: 3400,
                        data: code `${k(S.sensor)}: ${S.sensorVal}\n${k(S.faceModel)}: ${ok(S.onlyPc)}\n${k(S.sentToSite)}: ${ok(S.nothing)}` },
                    { who: 'auth', tag: 'auth', t: S.s6t,
                        d: S.s6d,
                        pkt: null, st: 'match', screen: dlg(S.dlgRecognized),
                        data: code `${k('match')}: ${ok('true')}\n${k('flags')}: UP=1 ${acc('UV=1')}\n${k('TPM 2.0')}: ${S.unlocked}` },
                    { who: 'auth', tag: 'auth', t: L ? S.s7tLogin : S.s7tReg,
                        d: L ? S.s7dLogin : S.s7dReg,
                        pkt: null, st: 'sign', screen: dlg(S.dlgSigning), dur: 3200,
                        data: L
                            ? code `${k('authenticatorData')}:\n  rpIdHash ${v(rpHash())}\n  flags    ${v('0x05')} (UP=1, UV=1)\n  counter  ${v('42')}\n${k('signature')}: ${acc(HEX.sig)}`
                            : code `${k(W.newPair)}: ES256, ${S.genTpm}\n${k('credentialId')}: ${v(HEX.credId)}\n${k('publicKey')} (COSE):\n${acc(HEX.pub)}\n${k('fmt')}: ${v('"tpm"')} (${S.chipAttest})` },
                    stepSend(mode, 'sign', dlg(W.sending)),
                    stepVerify(mode, 1, 'done')
                ];
            },
            states: { idle: [], prompt: [], scan: ['beam', 'scan'], match: ['beam', 'match'], sign: ['match', 'tpm'], done: ['match'] }
        },
        phone: {
            steps(mode) {
                const S = T.phoneSteps, W = T.words, L = mode === 'login';
                return [
                    stepRequest(mode), stepChallenge(mode),
                    stepClientData(mode, { type: 'loading' }),
                    { who: 'client', tag: 'client', t: S.s4t,
                        d: S.s4d,
                        pkt: null, st: 'qr', screen: { type: 'qr' },
                        data: code `${k('QR')}: ${v('FIDO:/0648…')}\n${k(S.contains)}: ${S.containsVal}\n${k(S.validity)}: ${S.thisSession}` },
                    { who: 'auth', tag: 'user', t: S.s5t,
                        d: S.s5d,
                        pkt: null, st: 'phone-in', screen: { type: 'qr' }, phone: 'camera',
                        data: code `${k(S.read)}: ${v('FIDO:/0648…')}\n${k(S.phone)}: ${S.derived}` },
                    { who: 'auth', tag: 'auth', t: S.s6t,
                        d: S.s6d,
                        pkt: { from: 'client', to: 'auth', label: L ? 'getAssertion' : 'makeCredential' }, st: 'ble', screen: { type: 'dialog', msg: S.dlgConnecting }, phone: 'camera', dur: 3400,
                        data: code `${k('BLE advert')}: ${acc(S.bleHeard)}\n${k(S.tunnel)}: ${v('wss://cable.…/connect')}\n${k(S.cipher)}: ${S.cipherVal}\n${k('CTAP2')} ${v(L ? 'getAssertion' : 'makeCredential')} ${S.toPhone}` },
                    { who: 'auth', tag: 'user', t: S.s7t,
                        d: S.s7d,
                        pkt: null, st: 'prompt', screen: { type: 'dialog', msg: S.dlgContinue }, phone: 'prompt', dur: 3200,
                        data: code `${k('rpId')}: ${v('"' + T.domain + '"')}\n${k(S.account)}: ana\n${k('userVerification')}: ${acc(S.fpSensor)}` },
                    { who: 'auth', tag: 'auth', t: L ? S.s8tLogin : S.s8tReg,
                        d: L ? S.s8dLogin : S.s8dReg,
                        pkt: null, st: 'sign', screen: { type: 'dialog', msg: S.dlgContinue }, phone: 'ok', dur: 3000,
                        data: L
                            ? code `${k('flags')}: UP=1 ${acc('UV=1')}\n${k('counter')}: ${v('0')} ${S.synced}\n${k('signature')}: ${acc(HEX.sig)}`
                            : code `${k(W.newPair)}: ES256\n${k('credentialId')}: ${v(HEX.credId)}\n${k('publicKey')} (COSE):\n${acc(HEX.pub)}\n${k(S.backup)}: ${v('BE=1, BS=1')} ${S.syncable}` },
                    { who: 'client', tag: 'auth', t: S.s9t,
                        d: S.s9d,
                        pkt: { from: 'auth', to: 'client', label: L ? 'assertion' : 'attestation' }, st: 'return', screen: { type: 'dialog', msg: S.dlgReceived }, phone: 'ok',
                        data: code `${k(S.tunnel)} ${S.toBrowser}\n${k(S.content)}: ${v(L ? 'assertion' : 'attestationObject')} + clientDataJSON` },
                    stepSend(mode, 'return', { type: 'loading' }, 'client'),
                    stepVerify(mode, 1, 'done')
                ];
            },
            states: { idle: [], qr: [], 'phone-in': ['in'], ble: ['in', 'ble', 'tunnel'], prompt: ['in', 'tunnel'], sign: ['in', 'tunnel', 'sign'], 'return': ['in', 'tunnel', 'back'], done: ['in'] }
        }
    };
    return CEREMONIES;
}
