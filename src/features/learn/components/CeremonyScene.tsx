import { IsometricLaptop, IsometricServer, IsometricUsbKey, IsometricNfcReader, IsometricTpm, IsometricHello, IsometricPhone } from './IsometricDevices';
import { useId } from 'react';
import type { Ceremony, Mode, Step } from '../data/types';
import type { Translations } from '../data/content';

function seeded(n: number) {
    let s = n >>> 0;
    return () => {
        s ^= s << 13; s >>>= 0;
        s ^= s >>> 17;
        s ^= s << 5; s >>>= 0;
        return (s >>> 0) / 4294967296;
    };
}

function qrPattern() {
    const N = 21, g: boolean[][] = [], r = seeded(20260903);
    for (let y = 0; y < N; y++) {
        g[y] = [];
        for (let x = 0; x < N; x++)
            g[y][x] = r() < 0.45;
    }
    const finder = (ox: number, oy: number) => {
        for (let y = 0; y < 7; y++)
            for (let x = 0; x < 7; x++) {
                const edge = x === 0 || y === 0 || x === 6 || y === 6;
                const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
                g[oy + y][ox + x] = edge || core;
            }
        for (let i = -1; i < 8; i++) {
            if (g[oy + i] && g[oy + i][ox - 1] !== undefined && ox - 1 >= 0)
                g[oy + i][ox - 1] = false;
            if (g[oy + i] && ox + 7 < N)
                g[oy + i][ox + 7] = false;
            if (oy - 1 >= 0 && g[oy - 1][ox + i] !== undefined && ox + i >= 0 && ox + i < N)
                g[oy - 1][ox + i] = false;
            if (oy + 7 < N && ox + i >= 0 && ox + i < N)
                g[oy + 7][ox + i] = false;
        }
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
    return g;
}

const QR = qrPattern();

function Qr({ x, y, cell, className = 'qr' }: {
    x: number;
    y: number;
    cell: number;
    className?: string;
}) {
    return (
        <g className={className} transform={`translate(${x},${y})`}>
            {QR.flatMap((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell}/> : null))}
        </g>
    );
}

interface Props {
    T: Translations;
    mode: Mode;
    step: Step;
}

export function CeremonyScene({ T, mode, step, ceremony }: Props & { ceremony: Ceremony }) {
    const id = useId();
    const authPoint = ceremony === 'phone' ? [155, 240] : ceremony === 'nfc' ? [160, 250] : ceremony === 'hello' ? [330, 267] : [414, 216];
    const points = { rp: [610, 140], client: [330, 300], auth: authPoint };
    const phoneTunnel = ceremony === 'phone' && ['ble', 'prompt', 'sign', 'return'].includes(step.st);
    const packet = step.pkt;
    const phonePacketPath = ceremony === 'phone' && packet && (packet.from === 'auth' || packet.to === 'auth')
        ? packet.from === 'auth' ? 'M155 130V70H390V190' : 'M390 190V70H155V130'
        : null;
    const from = packet ? points[packet.from] : null;
    const to = packet ? points[packet.to] : null;
    return (
        <svg viewBox="0 0 800 400" className="scene isometric-scene" role="img" aria-label={`${T.nodeRp}, ${T.nodeClient}, ${T[ceremony].auth}. ${step.t}`}>
            <defs>
                <pattern id={`${id}-grid`} width="80" height="46" patternUnits="userSpaceOnUse">
                    <path d="M0 0L80 46M80 0L0 46" fill="none" stroke="var(--line)" strokeWidth=".6"/>
                </pattern>
                <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0 1L8 5L0 9" fill="none" stroke="var(--flow)" strokeWidth="1.5"/>
                </marker>
            </defs>
            <path d="M20 180L400 0L780 180L400 400Z" fill={`url(#${id}-grid)`} opacity=".45"/>
            <g fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="5 6">
                <path d="M330 300L610 140"/>
            </g>
            {ceremony === 'usb' && <text x="450" y="165" className="iso-protocol">CTAP2 · USB HID</text>}
            <text x="495" y="260" className="iso-protocol">HTTPS · WebAuthn</text>
            {from && to && !phonePacketPath && !(ceremony === 'hello' && packet?.to === 'auth') && <g key={`${packet?.from}-${packet?.to}-${packet?.label}`}>
                <path d={`M${from[0]} ${from[1]}L${from[0] + (to[0] - from[0]) * 0.65} ${from[1] + (to[1] - from[1]) * 0.65}`} className="iso-transfer" markerEnd={`url(#${id}-arrow)`}/>
                <circle r="5" className="iso-packet" style={{ offsetPath: `path('M${from[0]} ${from[1]}L${to[0]} ${to[1]}')` }}/>
            </g>}
            <g className={`iso-device ${step.who === 'rp' ? 'iso-active' : ''}`} transform="translate(610 110)">
                <IsometricServer/>
                <text x="0" y="91">{T.nodeRp}</text>
                <text x="0" y="111" className="iso-sub">{T.domain}</text>
            </g>
            {ceremony === 'usb' && <>
            <g className={`iso-device ${step.who === 'auth' ? 'iso-active' : ''}`}>
                <g transform="translate(401 226) scale(.4 -.4)">
                    <IsometricUsbKey flipped touching={step.st === 'blink' || step.st === 'touch'}/>
                </g>
                <text x="450" y="125">{T.usb.auth}</text>
                <text x="450" y="145" className="iso-sub">{step.st === 'blink' ? T.keyHint : step.st === 'touch' ? T.tapConfirmed : step.st === 'signed' ? (mode === 'login' ? T.keySigned : T.keyCreated) : 'CTAP2'}</text>
            </g>
            </>}
            {ceremony === 'nfc' && <>
                <path d="M275 271L224 300L158 262" fill="none" stroke="var(--muted)" strokeWidth="2"/>
                <g className={`iso-device ${step.who === 'auth' ? 'iso-active' : ''}`} transform="translate(155 239)">
                    <IsometricNfcReader active={step.who === 'auth'}/>
                    <g transform="translate(8 -32) scale(.45)"><IsometricUsbKey touching={step.st === 'tap' || step.st === 'sign'}/></g>
                    <text x="0" y="73">{T.nfc.auth}</text>
                    <text x="0" y="93" className="iso-sub">CTAP2 · NFC</text>
                </g>
            </>}
            <g className={`iso-device ${step.who === 'client' ? 'iso-active' : ''}`} transform="translate(330 243)">
                <IsometricLaptop screen={ceremony === 'phone' && ['qr', 'phone-in'].includes(step.st) ? <g>
                    <rect x="17" y="18" width="52" height="52" fill="var(--ink)" stroke="none"/>
                    <g fill="var(--bg)" stroke="none"><Qr x={22} y={23} cell={2}/></g>
                </g> : undefined}/>
                {ceremony === 'hello' && <g className={step.who === 'auth' ? 'iso-active' : ''}>
                    <g transform="matrix(.866 -.5 .866 .5 -5 19)"><IsometricTpm active={step.st === 'sign' || step.st === 'match'}/></g>
                    <path d="M20 26L92 68H131" fill="none" strokeDasharray="3 4"/>
                    <text x="173" y="72">TPM 2.0</text>
                </g>}
                <text x="0" y="88">{T.nodeClient}</text>
                <text x="0" y="108" className="iso-sub">navigator.credentials.{mode === 'login' ? 'get' : 'create'}()</text>
            </g>
            {ceremony === 'hello' && <g className={`iso-device ${step.who === 'auth' ? 'iso-active' : ''}`}>
                <path d="M260 148L181 112" fill="none" strokeDasharray="4 5"/>
                <g transform="translate(140 109)"><IsometricHello verified={['match', 'sign', 'done'].includes(step.st)}/></g>
                <text x="140" y="186">Windows Hello</text>
            </g>}
            {ceremony === 'hello' && packet?.to === 'auth' && <g>
                <path d="M303 236L330 257" className="iso-transfer" markerEnd={`url(#${id}-arrow)`}/>
                <circle r="3" className="iso-packet" style={{ offsetPath: "path('M303 236L330 267')" }}/>
            </g>}
            {ceremony === 'phone' && <>
                {step.st === 'phone-in' && <path d="M173 166L287 177" fill="none" stroke="var(--flow)" strokeDasharray="3 5"/>}
                {phoneTunnel && <>
                    <path d="M155 145V70H390V190" fill="none" stroke="var(--flow)" strokeDasharray="5 5"/>
                    <text x="270" y="55" className="iso-protocol">{T.tunnelLbl}</text>
                    <path d="M195 239Q211 226 227 239M190 246Q211 225 232 246" fill="none" stroke="var(--flow)"/>
                    <text x="200" y="281" className="iso-protocol">{T.bleLbl}</text>
                </>}
                {phonePacketPath && <g key={phonePacketPath}>
                    <path d={phonePacketPath} className="iso-transfer" markerEnd={`url(#${id}-arrow)`}/>
                    <circle r="4" className="iso-packet" style={{ offsetPath: `path('${phonePacketPath}')` }}/>
                </g>}
                <g className={`iso-device ${step.who === 'auth' ? 'iso-active' : ''}`} transform="translate(150 189)">
                    <IsometricPhone state={step.phone ?? 'off'}/>
                    <text x="0" y="121">{T.phone.auth}</text>
                    <text x="0" y="141" className="iso-sub">{step.phone === 'ok' ? T.phSigned : step.phone === 'prompt' ? T.phTouch : 'CTAP2 · Hybrid'}</text>
                </g>
            </>}
            <text x="400" y="385" className="iso-message">{packet?.label ?? step.message ?? step.t}</text>
        </svg>
    );
}
