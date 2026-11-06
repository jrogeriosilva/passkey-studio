import type { ReactNode } from 'react';
import type { Ceremony, Mode, Step } from '../data/types';
import type { Translations } from '../data/i18n';

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

function SceneDefs() {
    return (
        <defs>
            <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#465268"/>
                <stop offset="100%" stopColor="#323b4c"/>
            </linearGradient>
            <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#58657d"/>
                <stop offset="100%" stopColor="#3b4558"/>
            </linearGradient>
            <radialGradient id="scrAmbient" cx="50%" cy="38%" r="68%">
                <stop offset="0%" stopColor="#131f38"/>
                <stop offset="100%" stopColor="#0b1120"/>
            </radialGradient>
            <linearGradient id="keyMetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4dae4"/>
                <stop offset="100%" stopColor="#949dad"/>
            </linearGradient>
            <linearGradient id="keyBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#47536a"/>
                <stop offset="100%" stopColor="#2e3646"/>
            </linearGradient>
            <linearGradient id="irBeamGrad" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#84b0ff" stopOpacity=".28"/>
                <stop offset="72%" stopColor="#84b0ff" stopOpacity=".09"/>
                <stop offset="100%" stopColor="#84b0ff" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="irMatchGrad" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#5ed7a3" stopOpacity=".25"/>
                <stop offset="72%" stopColor="#5ed7a3" stopOpacity=".08"/>
                <stop offset="100%" stopColor="#5ed7a3" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="scanBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84b0ff" stopOpacity="0"/>
                <stop offset="50%" stopColor="#84b0ff" stopOpacity=".24"/>
                <stop offset="100%" stopColor="#84b0ff" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="qrScanCone" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#84b0ff" stopOpacity=".16"/>
                <stop offset="100%" stopColor="#84b0ff" stopOpacity=".02"/>
            </linearGradient>
            <linearGradient id="fingerFadeGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                <stop offset="68%" stopColor="#ffffff" stopOpacity="1"/>
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
            </linearGradient>
            <mask id="fingerFade">
                <rect x="-40" y="-125" width="80" height="150" fill="url(#fingerFadeGrad)"/>
            </mask>
            <clipPath id="helloScanClip">
                <rect x="-46" y="-50" width="92" height="100" rx="8"/>
            </clipPath>
        </defs>
    );
}

interface Props {
    T: Translations;
    mode: Mode;
    step: Step;
}

function Laptop({ T, mode, step, dlgTitle, iconMarkup, extraScreen }: Props & {
    dlgTitle: string;
    iconMarkup: ReactNode;
    extraScreen?: ReactNode;
}) {
    return (
        <g className="laptop">
            <ellipse cx="370" cy="353" rx="250" ry="6.5" fill="#050811" opacity=".55"/>
            <rect x="170" y="60" width="400" height="260" rx="14" className="laptop-screen"/>
            <rect x="170" y="60" width="400" height="260" rx="14" fill="none" stroke="var(--device-edge)" strokeWidth="2"/>
            <rect x="172" y="62" width="396" height="256" rx="12.5" fill="none" stroke="#ffffff" strokeOpacity=".06"/>
            <rect x="184" y="74" width="372" height="224" rx="6" className="screen-bg"/>
            <circle cx="370" cy="67" r="3" className="cam" fill="var(--muted)"/>
            <circle cx="378" cy="67" r="1.7" className="ir-dot"/>
            <rect x="130" y="326" width="480" height="22" rx="6" className="laptop-base"/>
            <rect x="130" y="326" width="480" height="22" rx="6" fill="none" stroke="var(--device-edge)" strokeWidth="2"/>
            <line x1="136" y1="327.5" x2="604" y2="327.5" stroke="#ffffff" strokeOpacity=".12"/>
            <rect x="330" y="326" width="80" height="6" rx="3" fill="var(--device-edge)" opacity=".75"/>
            <rect x="598" y="331" width="12" height="10" rx="2" fill="#181f2c" stroke="var(--device-edge)"/>
            {/* browser chrome */}
            <rect x="192" y="81" width="356" height="18" rx="6" className="chrome"/>
            <circle cx="201" cy="90" r="2.1" fill="#4c5870"/>
            <circle cx="207.5" cy="90" r="2.1" fill="#4c5870"/>
            <circle cx="214" cy="90" r="2.1" fill="#4c5870"/>
            <rect x="223" y="83.5" width="319" height="13" rx="6.5" fill="#0d1526" opacity=".68"/>
            <g transform="translate(230,86.2)" fill="none" stroke="var(--ok)" strokeWidth="1.2" strokeLinecap="round">
                <rect x="0.5" y="3.2" width="5" height="4" rx="0.8"/>
                <path d="M1.5 3.2V2a1.5 1.5 0 0 1 3 0v1.2"/>
            </g>
            <text x="240" y="93" fontSize="8.5" className="mono s-muted">https://{T.domain}</text>

            {/* login / registration screen */}
            <g className="scr scr-login">
                <circle cx="370" cy="126" r="11" fill="var(--flow-soft)" stroke="var(--line)"/>
                <g transform="translate(364.5,120.5)" fill="none" stroke="var(--flow)" strokeWidth="1.4" strokeLinecap="round">
                    <circle cx="3.5" cy="5.5" r="2.2"/>
                    <path d="M5.7 5.5h4.5M8.5 5.5v2"/>
                </g>
                <text x="370" y="155" fontSize="17" textAnchor="middle" className="disp s-ink">{T.domain}</text>
                <text x="370" y="173" fontSize="10" textAnchor="middle" className="s-muted">{T.scrHello}</text>
                <g className="login-cta">
                    <rect x="292" y="191" width="156" height="28" rx="7" className="login-pulse-ring"/>
                    <rect x="292" y="191" width="156" height="28" rx="7" className="s-flow login-btn-bg"/>
                    <text x="370" y="209" fontSize="10.5" textAnchor="middle" fontWeight="600" className="login-btn">
                        {mode === 'login' ? T.loginBtn : T.registerBtn}
                    </text>
                </g>
            </g>

            {/* server / clientData loading screen */}
            <g className="scr scr-loading">
                <circle cx="370" cy="158" r="11" fill="none" stroke="var(--line)" strokeWidth="2"/>
                <circle cx="370" cy="158" r="11" pathLength="100" className="scr-spinner"/>
                <text x="370" y="188" fontSize="11" textAnchor="middle" className="s-muted loading-msg">{T.loadingMsg}</text>
                <g className="dots" fill="var(--flow)">
                    <circle cx="356" cy="207" r="3.2"/>
                    <circle cx="370" cy="207" r="3.2"/>
                    <circle cx="384" cy="207" r="3.2"/>
                </g>
            </g>

            {/* browser / OS security prompt */}
            <g className="scr scr-dialog">
                <rect x="184" y="101" width="372" height="197" rx="5" className="scr-backdrop"/>
                <g className="dlg-card">
                    <rect x="246" y="115" width="248" height="164" rx="12" fill="#050811" opacity=".55"/>
                    <rect x="246" y="110" width="248" height="164" rx="12" className="dlg"/>
                    <rect x="247" y="111" width="246" height="162" rx="11" fill="none" stroke="#ffffff" strokeOpacity=".05"/>
                    <circle cx="370" cy="147" r="22" className="dlg-icon-ring"/>
                    <g className="dlg-icon" transform="translate(352,128)">{iconMarkup}</g>
                    <text x="370" y="194" fontSize="11.5" textAnchor="middle" fontWeight="600" className="s-ink">{dlgTitle}</text>
                    <text key={step.screen.msg ?? ''} x="370" y="214" fontSize="10" textAnchor="middle" className="s-muted dlg-msg">
                        {step.screen.msg ?? '…'}
                    </text>
                    <g className="dots" fill="var(--flow)">
                        <circle cx="356" cy="250" r="3"/>
                        <circle cx="370" cy="250" r="3"/>
                        <circle cx="384" cy="250" r="3"/>
                    </g>
                </g>
            </g>

            {extraScreen}

            {/* verified screen */}
            <g className="scr scr-ok">
                <circle cx="370" cy="168" r="30" className="ok-burst"/>
                <circle cx="370" cy="168" r="30" pathLength="100" className="ok-ring" strokeWidth="2.5"/>
                <path d="M355 169 l10 10 l20 -22" pathLength="100" className="ok-check"/>
                <g className="ok-copy">
                    <text x="370" y="226" fontSize="13.5" textAnchor="middle" className="disp s-ink ok-label">
                        {mode === 'login' ? T.okLogin : T.okRegister}
                    </text>
                    <text x="370" y="245" fontSize="9.5" textAnchor="middle" className="s-muted">{T.okSub}</text>
                </g>
            </g>
        </g>
    );
}

const ICON_KEY = (
    <g fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,4)">
        <rect x="2" y="12" width="9" height="10" rx="1"/>
        <rect x="11" y="8" width="23" height="18" rx="4"/>
        <circle cx="26" cy="17" r="2.5" fill="var(--accent)"/>
    </g>
);

const ICON_NFC = (
    <g fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2,4)">
        <rect x="2" y="12" width="9" height="10" rx="1"/>
        <rect x="11" y="8" width="17" height="18" rx="4"/>
        <path d="M31 12.5a6 6 0 0 1 0 9M35.5 8.5a11 11 0 0 1 0 17"/>
    </g>
);

const ICON_FACE = (
    <g className="face-icon" transform="translate(0,2)">
        <path d="M3 10V6a3 3 0 0 1 3-3h4M26 3h4a3 3 0 0 1 3 3v4M36 26v4a3 3 0 0 1-3 3h-4M10 33H6a3 3 0 0 1-3-3v-4"/>
        <circle cx="13" cy="15" r="1.4" fill="var(--flow)"/>
        <circle cx="23" cy="15" r="1.4" fill="var(--flow)"/>
        <path d="M12 23c2 2.5 4.5 3.5 6 3.5s4-1 6-3.5"/>
    </g>
);

const ICON_PHONE = (
    <g fill="none" stroke="var(--flow)" strokeWidth="2.4" strokeLinecap="round" transform="translate(4,2)">
        <rect x="6" y="1" width="18" height="32" rx="4"/>
        <path d="M12 28h6"/>
    </g>
);

function UsbScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (
        <svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} data-st={step.st} data-pkt-from={step.pkt?.from ?? 'none'} role="img" aria-label={T.ariaUsb}>
            <SceneDefs/>
            <Laptop T={T} mode={mode} step={step} dlgTitle={T.usb.dlg} iconMarkup={ICON_KEY}/>

            {/* internal USB HID trace inside laptop chassis */}
            <path d="M526 336 H600" className="usb-bus"/>
            <path d="M526 336 H600" pathLength="100" className="usb-bus-pulse"/>

            {/* port insertion cue when prompting user to plug in */}
            <g className="usb-port-cue">
                <circle cx="606" cy="336" r="9" className="port-cue-ring"/>
                <path d="M636 336 h-14 m0 0 l5 -4 m-5 4 l5 4" className="port-cue-arrow"/>
            </g>

            {/* USB security key */}
            <g className="key">
                <g className="key-flex">
                    <ellipse cx="46" cy="24" rx="34" ry="4" fill="#050811" opacity=".42" className="key-shadow"/>
                    <rect x="0" y="0" width="22" height="14" rx="2" className="key-plug" strokeWidth="1.5"/>
                    <rect x="5" y="3.8" width="11" height="2" rx=".6" fill="#6d7584"/>
                    <rect x="5" y="8.2" width="11" height="2" rx=".6" fill="#6d7584"/>
                    <circle cx="51" cy="7" r="27" className="halo" fill="var(--ok)" opacity=".2"/>
                    <rect x="20" y="-6" width="66" height="26" rx="7" className="key-body" strokeWidth="2"/>
                    <rect x="21.5" y="-4.5" width="63" height="23" rx="5.8" fill="none" stroke="#ffffff" strokeOpacity=".07"/>
                    <circle cx="77" cy="7" r="3.8" className="key-ring"/>
                    <circle cx="51" cy="7" r="8" className="sensor-disc"/>
                    <circle cx="51" cy="7" r="5" className="led"/>
                    <text x="53" y="41" fontSize="10" textAnchor="middle" className="mono key-lbl" fill="var(--ok)">
                        {mode === 'login' ? T.keySigned : T.keyCreated}
                    </text>
                </g>
            </g>

            {/* user presence prompt & clean capacitive touch */}
            <circle cx="649" cy="336" r="10" className="tap-ring"/>
            <circle cx="649" cy="336" r="10" className="tap-ring tap-ring-2"/>
            <text x="651" y="370" fontSize="10" textAnchor="middle" className="mono key-hint" fill="var(--accent)">{T.keyHint}</text>
            <ellipse cx="649" cy="338" rx="13" ry="8" className="tap-shadow"/>

            <g className="finger">
                <g className="press">
                    <g transform="translate(649,336) rotate(42)" mask="url(#fingerFade)">
                        <path className="hand" d="M-11.5 0 a11.5 11.5 0 0 0 23 0 L13.5 -116 L-13.5 -116 Z"/>
                        <path className="hand-shade" d="M5 -116 L13.5 -116 L11.5 0 a11.5 11.5 0 0 1 -6.5 9.5 Z"/>
                        <path className="crease" d="M-7 -32 q7 2.5 14 0 M-7.5 -62 q7.5 2.5 15 0"/>
                        <ellipse className="nail" cx="0" cy="-1.5" rx="6.8" ry="8.2"/>
                    </g>
                </g>
            </g>

            <circle cx="649" cy="336" r="10" className="ripple"/>
            <circle cx="649" cy="336" r="10" className="ripple ripple-2"/>
            <text x="651" y="370" fontSize="10" textAnchor="middle" className="mono tap-lbl" fill="var(--ok)">{T.tapConfirmed}</text>
        </svg>
    );
}

function NfcScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (
        <svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} data-st={step.st} data-pkt-from={step.pkt?.from ?? 'none'} role="img" aria-label={T.ariaNfc}>
            <SceneDefs/>
            <Laptop T={T} mode={mode} step={step} dlgTitle={T.nfc.dlg} iconMarkup={ICON_NFC}/>

            {/* wired contactless NFC reader */}
            <path d="M610 336 C 621 336, 626 331, 638 331" className="cable"/>
            <path d="M610 336 C 621 336, 626 331, 638 331" pathLength="100" className="cable-pulse"/>

            <g className="reader">
                <ellipse cx="705" cy="352" rx="66" ry="4.5" fill="#050811" opacity=".48"/>
                <rect x="638" y="314" width="134" height="34" rx="8" className="pad-body" strokeWidth="2"/>
                <rect x="646" y="319" width="118" height="14" rx="4.5" className="pad-top"/>
                <ellipse cx="705" cy="326" rx="28" ry="3.8" className="nfc-key-shadow"/>
                <g className="pad-cl" transform="translate(658,326)">
                    <path d="M0 -1.3 a1.3 1.3 0 0 1 0 2.6"/>
                    <path d="M3.5 -3.6 a4.5 4.5 0 0 1 0 7.2"/>
                    <path d="M7 -6.6 a8.5 8.5 0 0 1 0 13.2"/>
                </g>
                <text x="745" y="329" fontSize="7.5" textAnchor="middle" className="mono" fill="var(--muted)" fontWeight="500" letterSpacing=".1em">NFC</text>
                <circle cx="759" cy="341" r="2.6" className="pad-led"/>
            </g>

            {/* 13.56 MHz inductive RF field + APDU exchange pulses */}
            <g className="waves">
                <path d="M696 313 a11 11 0 0 1 18 0"/>
                <path d="M688.5 308 a20 20 0 0 1 33 0"/>
                <path d="M681 303 a29 29 0 0 1 48 0"/>
            </g>
            <g className="apdu-exchange">
                <circle cx="701" cy="306" r="2" className="apdu-up"/>
                <circle cx="709" cy="290" r="2" className="apdu-down"/>
            </g>

            <circle cx="705" cy="326" r="10" className="pad-ring"/>
            <circle cx="705" cy="326" r="10" className="pad-ring pad-ring-2"/>
            <text x="696" y="370" fontSize="10" textAnchor="middle" className="mono pad-hint" fill="var(--accent)">{T.nfcHint}</text>
            <text x="696" y="370" fontSize="10" textAnchor="middle" className="mono up-lbl" fill="var(--ok)">{T.nfcUp}</text>
            <text x="696" y="370" fontSize="10" textAnchor="middle" className="mono hold-lbl" fill="var(--accent)">{T.nfcHold}</text>

            {/* contactless security key hovering in field */}
            <g className="key">
                <g className="key-bob">
                    <rect x="0" y="0" width="22" height="14" rx="2" className="key-plug" strokeWidth="1.5"/>
                    <rect x="5" y="3.8" width="11" height="2" rx=".6" fill="#6d7584"/>
                    <rect x="5" y="8.2" width="11" height="2" rx=".6" fill="#6d7584"/>
                    <circle cx="53" cy="7" r="27" className="halo" fill="var(--ok)" opacity=".2"/>
                    <rect x="20" y="-6" width="66" height="26" rx="7" className="key-body" strokeWidth="2"/>
                    <rect x="21.5" y="-4.5" width="63" height="23" rx="5.8" fill="none" stroke="#ffffff" strokeOpacity=".07"/>
                    <g className="key-cl" transform="translate(32,7)">
                        <path d="M0 -2.5 a3.2 3.2 0 0 1 0 5"/>
                        <path d="M3.5 -5.5 a7 7 0 0 1 0 11"/>
                    </g>
                    <circle cx="77" cy="7" r="3.8" className="key-ring"/>
                    <circle cx="56" cy="7" r="5.2" className="led"/>
                    <text x="53" y="-26" fontSize="10" textAnchor="middle" className="mono key-lbl" fill="var(--ok)">
                        {mode === 'login' ? T.keySigned : T.keyCreated}
                    </text>
                </g>
            </g>
        </svg>
    );
}

function HelloScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (
        <svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} data-st={step.st} data-pkt-from={step.pkt?.from ?? 'none'} role="img" aria-label={T.ariaHello}>
            <SceneDefs/>

            {/* IR camera projection cone & rays */}
            <polygon points="370,67 648,132 648,252" className="beam"/>
            <polygon points="370,67 648,132 648,252" className="beam-match"/>
            <g className="ir-rays">
                <line x1="370" y1="67" x2="646" y2="152" pathLength="100"/>
                <line x1="370" y1="67" x2="646" y2="192" pathLength="100"/>
                <line x1="370" y1="67" x2="646" y2="232" pathLength="100"/>
            </g>

            <Laptop T={T} mode={mode} step={step} dlgTitle={T.hello.dlg} iconMarkup={ICON_FACE}/>

            {/* OS -> TPM 2.0 authorization & signing trace */}
            <path d="M370 298 V317 L308 329" pathLength="100" className="tpm-trace"/>

            {/* embedded TPM 2.0 security chip */}
            <g className="tpm-g">
                <g className="tpm-pins" stroke="var(--line)" strokeWidth="1.4" strokeLinecap="round">
                    <line x1="294" y1="326" x2="294" y2="329"/><line x1="301" y1="326" x2="301" y2="329"/>
                    <line x1="308" y1="326" x2="308" y2="329"/><line x1="315" y1="326" x2="315" y2="329"/>
                    <line x1="322" y1="326" x2="322" y2="329"/>
                    <line x1="294" y1="344" x2="294" y2="347"/><line x1="301" y1="344" x2="301" y2="347"/>
                    <line x1="308" y1="344" x2="308" y2="347"/><line x1="315" y1="344" x2="315" y2="347"/>
                    <line x1="322" y1="344" x2="322" y2="347"/>
                </g>
                <rect x="288" y="329" width="40" height="15" rx="2.5" className="tpm"/>
                <rect x="281" y="322" width="54" height="29" rx="5" className="tpm-ring"/>
                <text x="308" y="339.5" fontSize="7" textAnchor="middle" className="mono tpm-text" fontWeight="600">TPM</text>
                <g className="tpm-lbl">
                    <path d="M308 351 v20" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3"/>
                    <text x="308" y="386" fontSize="10.5" textAnchor="middle" className="mono" fill="var(--accent)">{T.tpmLbl}</text>
                </g>
            </g>

            {/* biometric HUD frame & 3D depth constellation */}
            <g className="person" transform="translate(696,192)">
                <g className="hud-brackets">
                    <path d="M-46 -36 V-48 H-34"/>
                    <path d="M34 -48 H46 V-36"/>
                    <path d="M46 36 V48 H34"/>
                    <path d="M-34 48 H-46 V36"/>
                </g>
                <path d="M-46 90 C-44 52, -22 42, 0 42 C22 42, 44 52, 46 90" className="face"/>
                <ellipse cx="0" cy="-3" rx="29" ry="35" className="face"/>
                <g className="facemesh">
                    <path d="M0 -23 L-13 -8 L0 4 L13 -8 Z"/>
                    <path d="M-13 -8 L-21 4 L-10 16 L0 4 L10 16 L21 4 L13 -8"/>
                    <path d="M-10 16 L0 23 L10 16"/>
                </g>
                <g className="facepts">
                    <circle cx="0" cy="-23" r="1.7"/>
                    <circle cx="-13" cy="-8" r="2.1"/>
                    <circle cx="13" cy="-8" r="2.1"/>
                    <circle cx="-21" cy="4" r="1.6"/>
                    <circle cx="21" cy="4" r="1.6"/>
                    <circle cx="0" cy="4" r="2"/>
                    <circle cx="-10" cy="16" r="1.9"/>
                    <circle cx="10" cy="16" r="1.9"/>
                    <circle cx="0" cy="23" r="1.6"/>
                </g>
                <g clipPath="url(#helloScanClip)">
                    <g className="scan-sweep">
                        <rect x="-46" y="-16" width="92" height="32" fill="url(#scanBandGrad)"/>
                        <line x1="-44" y1="0" x2="44" y2="0" className="scanline"/>
                    </g>
                </g>
                <g className="match-badge" transform="translate(40,-42)">
                    <circle cx="0" cy="0" r="8.5" fill="var(--ok-soft)" stroke="var(--ok)" strokeWidth="1.6"/>
                    <path d="M-3.5 .2 l2.4 2.5 l5 -5.2" fill="none" stroke="var(--ok)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
            </g>
        </svg>
    );
}

function PhoneScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (
        <svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} data-st={step.st} data-phone={step.phone ?? 'off'} data-pkt-from={step.pkt?.from ?? 'none'} role="img" aria-label={T.ariaPhone}>
            <SceneDefs/>

            {/* end-to-end Noise-encrypted cloud tunnel (cleanly inside viewBox) */}
            <g className="tunnel">
                <path d="M380 58 C 448 6, 668 6, 738 114" className="tunnel-track"/>
                <path d="M380 58 C 448 6, 668 6, 738 114" pathLength="100" className="tunnel-pulse"/>
                <path d="M539 30 a8.5 8.5 0 0 1 2 -16.8 a11.5 11.5 0 0 1 21.5 -4 a9 9 0 0 1 16 6.2 a8 8 0 0 1 -1.5 14.6 z" className="cloud"/>
                <g transform="translate(555,16.5)" fill="none" stroke="var(--flow)" strokeWidth="1.4" strokeLinecap="round">
                    <rect x="0.5" y="4" width="7" height="5.5" rx="1.2" fill="var(--panel)"/>
                    <path d="M2 4V2.4a2 2 0 0 1 4 0V4"/>
                </g>
                <rect x="512" y="36" width="94" height="14" rx="7" fill="var(--panel)" opacity=".88"/>
                <text x="559" y="46.5" fontSize="10" textAnchor="middle" className="mono" fill="var(--flow)">{T.tunnelLbl}</text>
            </g>

            {/* optical camera sightline when scanning QR */}
            <polygon points="420,136 688,156 688,218 420,224" fill="url(#qrScanCone)" className="qr-cone"/>

            <Laptop
                T={T}
                mode={mode}
                step={step}
                dlgTitle={T.phone.dlg}
                iconMarkup={ICON_PHONE}
                extraScreen={
                    <g className="scr scr-qr">
                        <text x="370" y="121" fontSize="11.5" textAnchor="middle" fontWeight="600" className="s-ink">{T.qrTitle}</text>
                        <g className="qr-card">
                            <rect x="321" y="129" width="98" height="98" rx="7" fill="#fff" stroke="var(--line)"/>
                            <Qr x={328} y={136} cell={4}/>
                        </g>
                        <text x="370" y="246" fontSize="9.5" textAnchor="middle" className="s-muted">{T.qrHint}</text>
                    </g>
                }
            />

            {/* BLE proximity radio waves */}
            <g className="ble">
                <path d="M674 214 a44 44 0 0 0 0 72"/>
                <path d="M658 200 a62 62 0 0 0 0 100"/>
                <path d="M642 186 a80 80 0 0 0 0 128"/>
            </g>
            <text x="646" y="352" fontSize="10" textAnchor="middle" className="mono ble-lbl" fill="var(--flow)">{T.bleLbl}</text>

            {/* smartphone */}
            <g className="phone">
                <ellipse cx="50" cy="209" rx="44" ry="5" fill="#050811" opacity=".5"/>
                <rect x="-4" y="-4" width="108" height="208" rx="20" className="ph-halo"/>
                <rect x="0" y="0" width="100" height="200" rx="16" className="ph-body" strokeWidth="2"/>
                <rect x="1.5" y="1.5" width="97" height="197" rx="14.5" fill="none" stroke="#ffffff" strokeOpacity=".07"/>
                <rect x="6" y="8" width="88" height="184" rx="11" className="ph-screen"/>
                <rect x="37" y="12.5" width="26" height="4.5" rx="2.25" fill="var(--device-edge)"/>

                {/* camera scanning QR */}
                <g className="ph-scr ph-camera">
                    <rect x="6" y="8" width="88" height="184" rx="11" fill="#182030"/>
                    <rect x="37" y="12.5" width="26" height="4.5" rx="2.25" fill="#0d1320"/>
                    <g transform="translate(23,56)" opacity=".92">
                        <Qr x={0} y={0} cell={2.6} className="qr-mini"/>
                    </g>
                    <line x1="20" y1="56" x2="80" y2="56" className="ph-qr-scan"/>
                    <path d="M18 50 v-8 h8 M74 42 h8 v8 M82 110 v8 h-8 M26 118 h-8 v-8" className="vf"/>
                    <text x="50" y="150" fontSize="7.5" textAnchor="middle" fill="#fff" opacity=".88">{T.phCode}</text>
                    <circle cx="50" cy="172" r="8" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".7"/>
                </g>

                {/* biometric passkey prompt */}
                <g className="ph-scr ph-prompt">
                    <text x="50" y="44" fontSize="8.5" textAnchor="middle" fontWeight="600" className="s-ink">{T.domain}</text>
                    <text x="50" y="58" fontSize="7" textAnchor="middle" className="s-muted">{T.phLoginAs}</text>
                    <circle cx="50" cy="103" r="21" className="fp-ring"/>
                    <g className="fp" transform="translate(30,80)">
                        <path d="M6 22c0-9 6-15 14-15s14 6 14 15" pathLength="100"/>
                        <path d="M11 27c0-6 4-11 9-11s9 5 9 11v5" pathLength="100"/>
                        <path d="M16 31c0-4 1.5-7 4-7s4 3 4 7v7" pathLength="100"/>
                        <path d="M20 29v11" pathLength="100"/>
                    </g>
                    <text x="50" y="141" fontSize="7" textAnchor="middle" className="s-muted">{T.phTouch}</text>
                    <rect x="18" y="160" width="64" height="16" rx="4" className="s-flow"/>
                    <text x="50" y="171" fontSize="7" textAnchor="middle" fontWeight="600" className="ph-cta-txt">{T.phContinue}</text>
                </g>

                {/* passkey signed in secure element */}
                <g className="ph-scr ph-ok">
                    <circle cx="50" cy="86" r="20" pathLength="100" className="ok-ring ph-ok-ring" strokeWidth="2"/>
                    <path d="M40 87 l7 7 l14 -15" pathLength="100" className="ph-ok-check"/>
                    <text x="50" y="126" fontSize="8.5" textAnchor="middle" fontWeight="600" className="s-ink">{T.phSigned}</text>
                    <text x="50" y="140" fontSize="6.5" textAnchor="middle" className="s-muted">{T.phSignedSub}</text>
                </g>
            </g>
        </svg>
    );
}

const scenes = { usb: UsbScene, nfc: NfcScene, hello: HelloScene, phone: PhoneScene };

export function CeremonyScene({ ceremony, states, ...props }: Props & {
    ceremony: Ceremony;
    states: string[];
}) {
    const Scene = scenes[ceremony];
    return <Scene {...props} className={['scene', ceremony, ...states].join(' ')}/>;
}
