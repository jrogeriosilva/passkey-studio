import {
    IsometricLaptop,
    IsometricServer,
    IsometricUsbKey,
    IsometricTpm,
    IsometricHello,
    IsometricPhone,
    IsoPlinth,
} from './IsometricDevices';
import { useEffect, useId } from 'react';
import type { Ceremony, Mode, Step } from '../data/types';
import type { Translations } from '../data/content';

const COS30 = 0.8660254;
const SIN30 = 0.5;

function iso(x: number, y: number, z = 0, ox = 0, oy = 0): [number, number] {
    return [
        Math.round((ox + (x - y) * COS30) * 100) / 100,
        Math.round((oy + (x + y) * SIN30 - z) * 100) / 100,
    ];
}

function isoPts(pts: Array<[number, number, number?]>, ox = 0, oy = 0): string {
    return pts
        .map(([x, y, z = 0]) => {
            const [sx, sy] = iso(x, y, z, ox, oy);
            return `${sx},${sy}`;
        })
        .join(' ');
}

declare global {
    interface Window {
        __ready?: boolean;
        __isoDuration?: number;
    }
}

function seeded(n: number) {
    let s = n >>> 0;
    return () => {
        s ^= s << 13;
        s >>>= 0;
        s ^= s >>> 17;
        s ^= s << 5;
        s >>>= 0;
        return (s >>> 0) / 4294967296;
    };
}

function qrPattern() {
    const N = 21,
        g: boolean[][] = [],
        r = seeded(20260903);
    for (let y = 0; y < N; y++) {
        g[y] = [];
        for (let x = 0; x < N; x++) g[y][x] = r() < 0.45;
    }
    const finder = (ox: number, oy: number) => {
        for (let y = 0; y < 7; y++)
            for (let x = 0; x < 7; x++) {
                const edge = x === 0 || y === 0 || x === 6 || y === 6;
                const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
                g[oy + y][ox + x] = edge || core;
            }
        for (let i = -1; i < 8; i++) {
            if (g[oy + i] && g[oy + i][ox - 1] !== undefined && ox - 1 >= 0) g[oy + i][ox - 1] = false;
            if (g[oy + i] && ox + 7 < N) g[oy + i][ox + 7] = false;
            if (oy - 1 >= 0 && g[oy - 1][ox + i] !== undefined && ox + i >= 0 && ox + i < N)
                g[oy - 1][ox + i] = false;
            if (oy + 7 < N && ox + i >= 0 && ox + i < N) g[oy + 7][ox + i] = false;
        }
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
    return g;
}

const QR = qrPattern();

function Qr({
    x,
    y,
    cell,
    className = 'qr',
}: {
    x: number;
    y: number;
    cell: number;
    className?: string;
}) {
    return (
        <g className={className} transform={`translate(${x},${y})`}>
            {QR.flatMap((row, r) =>
                row.map((on, c) =>
                    on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} /> : null,
                ),
            )}
        </g>
    );
}

/** Easing helpers for deterministic bottom-up isometric layer build */
function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

function easeOutBack(x: number, overshoot = 1.45): number {
    const t = clamp01(x);
    const c1 = overshoot;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutCubic(x: number): number {
    const t = clamp01(x);
    return 1 - Math.pow(1 - t, 3);
}

function readPinnedTime(): number | null {
    if (typeof window === 'undefined') return null;
    const raw = new URLSearchParams(window.location.search).get('t');
    if (raw === null || raw.trim() === '') return null;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const GRID_STEPS = [-180, -140, -100, -60, -20, 20, 60, 100, 140, 180];
const MASTER_DURATION = 2.4;

interface Props {
    T: Translations;
    mode: Mode;
    step: Step;
}

export function CeremonyScene({ T, mode, step, ceremony }: Props & { ceremony: Ceremony }) {
    const id = useId();
    const pinned = readPinnedTime();
    const reduced = prefersReducedMotion();
    const isPinned = pinned !== null || reduced;
    const clock = pinned !== null ? pinned : 1.25;

    useEffect(() => {
        window.__isoDuration = MASTER_DURATION;
        window.__ready = true;
    }, [ceremony, pinned]);

    // Staggered bottom-up build progress (physical Z order: ground grid -> base devices -> upper Z layers)
    const gridProgress = easeOutCubic(clock / 0.32);
    const clientBuild = easeOutBack((clock - 0.08) / 0.42, 1.4);
    const rpBuild = easeOutBack((clock - 0.16) / 0.42, 1.4);
    const authBuild = easeOutBack((clock - 0.24) / 0.44, 1.45);
    const upperLayerBuild = easeOutBack((clock - 0.34) / 0.44, 1.35);

    const clientOpacity = clamp01((clock - 0.05) / 0.22);
    const rpOpacity = clamp01((clock - 0.12) / 0.22);
    const authOpacity = clamp01((clock - 0.2) / 0.24);
    const upperOpacity = clamp01((clock - 0.3) / 0.25);

    // Active Z-lift (lift along Z = negative screen Y, never scale)
    const rpLift = step.who === 'rp' ? -6 : 0;
    const clientLift = step.who === 'client' ? -6 : 0;
    const authLift = step.who === 'auth' ? -6 : 0;

    // Deterministic packet progress (0..1) along active conduit
    const packetProgress = clamp01((clock - 0.5) / 1.2 || 0.55);

    // True isometric node coordinates (every connecting vector runs at exact ±30° iso angle):
    // - Client at (340, 254)
    // - Server at (582, 114) -> dx = +242, dy = -140 (242/140 = 1.7286 ≈ √3, exact 30° -Y iso axis)
    const clientPos: [number, number] = [340, 254];
    const rpPos: [number, number] = [582, 114];

    // Authenticator positions on true 30° axes relative to Client (340, 254):
    // - USB: down-right along +X iso axis at (482, 336) -> dx = +142, dy = +82 (142/82 = 1.7317 ≈ √3)
    // - Hello: biometric enclave up-left along -X iso axis at (156, 148) + TPM stacked along +Z above laptop
    // - Phone: up-left along -X iso axis at (150, 144)
    const usbInserted = ['inserted', 'blink', 'touch', 'signed', 'done'].includes(step.st);
    const usbSlideOffset: [number, number] = usbInserted ? [0, 0] : [21, 12]; // Slides along exact +30° iso X-axis
    const usbPos: [number, number] = [482 + usbSlideOffset[0], 336 + usbSlideOffset[1]];
    const helloPos: [number, number] = [156, 148];
    const phonePos: [number, number] = [150, 144];

    // Windows Hello + TPM exploded Z-stack height
    const tpmUnlocked = ['match', 'sign', 'done'].includes(step.st);
    const tpmActive = ['prompt', 'scan', 'match', 'sign'].includes(step.st);
    const tpmLiftZ = tpmActive || tpmUnlocked ? -46 : -30;

    // Phone hybrid tunnel state
    const phoneTunnel = ceremony === 'phone' && ['ble', 'prompt', 'sign', 'return'].includes(step.st);
    const packet = step.pkt;

    // Compute true isometric packet path & interpolated packet coordinates
    let transferPath: string | null = null;
    let packetCoord: [number, number] | null = null;

    if (packet) {
        if (ceremony === 'phone' && (packet.from === 'auth' || packet.to === 'auth')) {
            // 3D isometric elevated sky-bridge tunnel:
            // From Phone (150, 62) -> up-right along -Y iso axis to Relay (228, 17)
            // -> down-right along +X iso axis to (322, 71) -> vertical -Z drop into Laptop (322, 165)
            const pts: Array<[number, number]> =
                packet.from === 'auth'
                    ? [
                          [150, 62],
                          [228, 17],
                          [322, 71],
                          [322, 165],
                      ]
                    : [
                          [322, 165],
                          [322, 71],
                          [228, 17],
                          [150, 62],
                      ];
            transferPath = `M${pts.map(p => `${p[0]} ${p[1]}`).join('L')}`;
            const seg = packetProgress * 3;
            const idx = Math.min(2, Math.floor(seg));
            const f = seg - idx;
            packetCoord = [
                pts[idx][0] + (pts[idx + 1][0] - pts[idx][0]) * f,
                pts[idx][1] + (pts[idx + 1][1] - pts[idx][1]) * f,
            ];
        } else {
            const nodeMap: Record<'rp' | 'client' | 'auth', [number, number]> = {
                rp: [rpPos[0], rpPos[1] + 10],
                client: [clientPos[0], clientPos[1] + 6],
                auth:
                    ceremony === 'usb'
                        ? [482, 336]
                        : ceremony === 'hello'
                          ? [helloPos[0], helloPos[1] - 10]
                          : [phonePos[0], phonePos[1]],
            };
            const fromPt = nodeMap[packet.from];
            const toPt = nodeMap[packet.to];
            transferPath = `M${fromPt[0]} ${fromPt[1]}L${toPt[0]} ${toPt[1]}`;
            packetCoord = [
                fromPt[0] + (toPt[0] - fromPt[0]) * packetProgress,
                fromPt[1] + (toPt[1] - fromPt[1]) * packetProgress,
            ];
        }
    }

    return (
        <svg
            viewBox="30 0 740 415"
            className={`scene isometric-scene ${isPinned ? 'iso-pinned' : ''}`}
            role="img"
            aria-label={`${T.nodeRp}, ${T.nodeClient}, ${T[ceremony].auth}. ${step.t}`}
        >
            <defs>
                <linearGradient id={`${id}-floor-glow`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e325c" stopOpacity="0.36" />
                    <stop offset="100%" stopColor="#0b1120" stopOpacity="0.06" />
                </linearGradient>
                <marker
                    id={`${id}-arrow`}
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >
                    <path d="M0 1.5L8 5L0 8.5" fill="none" stroke="var(--flow)" strokeWidth="1.6" />
                </marker>
            </defs>

            <g className="iso-camera-rig">
                {/* LAYER 0: True 30-degree Isometric Floor Plane & Grid (builds first) */}
                <g className="iso-floor-layer" opacity={gridProgress}>
                    <polygon
                        points={isoPts(
                            [
                                [-210, -210, 0],
                                [210, -210, 0],
                                [210, 210, 0],
                                [-210, 210, 0],
                            ],
                            400,
                            210,
                        )}
                        fill={`url(#${id}-floor-glow)`}
                        stroke="var(--line-2)"
                        strokeWidth="1"
                    />
                    <g className="iso-grid-lines" stroke="var(--line)" strokeWidth="0.65" opacity="0.55">
                        {GRID_STEPS.map(g => {
                            const [x1, y1] = iso(-210, g, 0, 400, 210);
                            const [x2, y2] = iso(210, g, 0, 400, 210);
                            const [x3, y3] = iso(g, -210, 0, 400, 210);
                            const [x4, y4] = iso(g, 210, 0, 400, 210);
                            return (
                                <g
                                    key={g}
                                    pathLength={1}
                                    strokeDasharray={1}
                                    strokeDashoffset={1 - gridProgress}
                                >
                                    <line x1={x1} y1={y1} x2={x2} y2={y2} />
                                    <line x1={x3} y1={y3} x2={x4} y2={y4} />
                                </g>
                            );
                        })}
                    </g>
                </g>

                {/* LAYER 1: Isometric Ground Conduits (strictly aligned to ±30° isometric axes) */}
                <g className="iso-build-upper" opacity={upperOpacity}>
                    {/* HTTPS · WebAuthn conduit along -Y iso axis: Client (340, 254) -> Server (582, 114) */}
                    <line
                        x1={clientPos[0]}
                        y1={clientPos[1] + 6}
                        x2={rpPos[0]}
                        y2={rpPos[1] + 10}
                        className="iso-conduit"
                    />
                    <text x="528" y="210" className="iso-protocol">
                        HTTPS · WebAuthn
                    </text>

                    {/* Ceremony-specific ground bus conduits */}
                    {ceremony === 'usb' && (
                        <>
                            <line
                                x1={clientPos[0] + 36}
                                y1={clientPos[1] + 21}
                                x2={482}
                                y2={336}
                                className="iso-conduit"
                            />
                            <text x="536" y="298" className="iso-protocol">
                                CTAP2 · USB HID
                            </text>
                        </>
                    )}

                    {ceremony === 'hello' && (
                        <line
                            x1={clientPos[0] - 32}
                            y1={clientPos[1] - 24}
                            x2={helloPos[0] + 24}
                            y2={helloPos[1] + 8}
                            className="iso-conduit"
                        />
                    )}
                </g>

                {/* LAYER 2: Active Data Transfer Packet & Isometric Signal Trail */}
                {transferPath && packetCoord && (
                    <g
                        key={`${packet?.from}-${packet?.to}-${packet?.label}`}
                        className="iso-transfer-group"
                        opacity={upperOpacity}
                    >
                        <path
                            d={transferPath}
                            className="iso-transfer"
                            markerEnd={`url(#${id}-arrow)`}
                        />
                        {isPinned ? (
                            <>
                                <circle cx={packetCoord[0]} cy={packetCoord[1]} r="8" className="iso-packet-halo" />
                                <circle cx={packetCoord[0]} cy={packetCoord[1]} r="4.5" className="iso-packet-dot" />
                            </>
                        ) : (
                            <g className="iso-packet" style={{ offsetPath: `path('${transferPath}')` }}>
                                <circle r="8" className="iso-packet-halo" />
                                <circle r="4.5" className="iso-packet-dot" />
                            </g>
                        )}
                    </g>
                )}

                {/* LAYER 3: Server (Relying Party) at (582, 114) */}
                <g
                    className={`iso-device iso-build-rp ${step.who === 'rp' ? 'iso-active' : ''}`}
                    transform={`translate(${rpPos[0]} ${rpPos[1] + rpLift + (1 - rpBuild) * 42})`}
                    opacity={rpOpacity}
                >
                    <IsometricServer active={step.who === 'rp'} verified={step.st === 'done'} />
                    <text x="0" y="62">
                        {T.nodeRp}
                    </text>
                    <text x="0" y="80" className="iso-sub">
                        {T.domain}
                    </text>
                </g>

                {/* LAYER 4: Ceremony Authenticator Nodes (Back-to-Front isometric painter's order) */}
                {ceremony === 'hello' && (
                    <g
                        className={`iso-device ${step.who === 'auth' ? 'iso-active' : ''}`}
                        transform={`translate(${helloPos[0]} ${helloPos[1] + authLift + (1 - authBuild) * 44})`}
                        opacity={authOpacity}
                    >
                        <IsoPlinth w={72} d={72} h={5} active={step.who === 'auth'} />
                        <g transform="translate(0 -8)">
                            <IsometricHello
                                scanning={step.st === 'scan' || step.st === 'prompt'}
                                verified={tpmUnlocked}
                            />
                        </g>
                        <text x="0" y="60">
                            Windows Hello
                        </text>
                        <text x="0" y="78" className="iso-sub">
                            {step.st === 'scan' ? T.helloSteps.sensorVal : 'Biometric UV'}
                        </text>
                    </g>
                )}

                {ceremony === 'phone' && (
                    <>
                        {/* Isometric Optical QR Scan Frustum during phone-in */}
                        {step.st === 'phone-in' && (
                            <g className="iso-qr-frustum" opacity={upperOpacity}>
                                <polygon
                                    points="170,112 296,178 296,214 170,132"
                                    className="iso-scan-cone"
                                />
                                <line
                                    x1="170"
                                    y1="122"
                                    x2="296"
                                    y2="196"
                                    stroke="var(--flow)"
                                    strokeDasharray="4 4"
                                    strokeWidth="1.5"
                                />
                            </g>
                        )}

                        <g
                            className={`iso-device ${step.who === 'auth' ? 'iso-active' : ''}`}
                            transform={`translate(${phonePos[0]} ${phonePos[1] + authLift + (1 - authBuild) * 44})`}
                            opacity={authOpacity}
                        >
                            <IsometricPhone state={step.phone ?? 'off'} active={step.who === 'auth'} />
                            <text x="0" y="60">
                                {T.phone.auth}
                            </text>
                            <text x="0" y="78" className="iso-sub">
                                {step.phone === 'ok'
                                    ? T.phSigned
                                    : step.phone === 'prompt'
                                      ? T.phTouch
                                      : 'CTAP2 · Hybrid'}
                            </text>
                        </g>

                        {/* Isometric BLE Waves & 3D Sky-Bridge Encrypted Tunnel */}
                        {phoneTunnel && (
                            <g opacity={upperOpacity}>
                                <path
                                    d="M150 62L228 17L322 71L322 165"
                                    fill="none"
                                    stroke="var(--flow)"
                                    strokeDasharray="5 5"
                                    strokeWidth="1.6"
                                />
                                {/* Elevated isometric relay node on the tunnel apex (228, 17) */}
                                <polygon
                                    points={isoPts(
                                        [
                                            [-10, -10, 0],
                                            [10, -10, 0],
                                            [10, 10, 0],
                                            [-10, 10, 0],
                                        ],
                                        228,
                                        17,
                                    )}
                                    className="iso-top"
                                    stroke="var(--flow)"
                                />
                                <text x="308" y="24" className="iso-protocol">
                                    {T.tunnelLbl}
                                </text>
                                {/* Isometric BLE proximity arcs between Phone and Laptop */}
                                <path
                                    d="M210 176Q236 166 242 192M220 168Q250 156 256 188"
                                    fill="none"
                                    stroke="var(--flow)"
                                    strokeWidth="1.5"
                                    className="iso-ble-waves"
                                />
                                <text x="248" y="152" className="iso-protocol">
                                    {T.bleLbl}
                                </text>
                            </g>
                        )}
                    </>
                )}

                {/* LAYER 5: Browser (Client Laptop) at (340, 254) */}
                <g
                    className={`iso-device ${step.who === 'client' ? 'iso-active' : ''}`}
                    transform={`translate(${clientPos[0]} ${clientPos[1] + clientLift + (1 - clientBuild) * 40})`}
                    opacity={clientOpacity}
                >
                    <IsometricLaptop
                        active={step.who === 'client'}
                        screen={
                            ceremony === 'phone' && ['qr', 'phone-in'].includes(step.st) ? (
                                <g>
                                    <rect x="10" y="15" width="40" height="40" rx="2" fill="var(--ink)" stroke="none" />
                                    <g fill="var(--bg)" stroke="none">
                                        <Qr x={13.2} y={18.2} cell={1.6} />
                                    </g>
                                </g>
                            ) : undefined
                        }
                    />

                    {/* Exploded Z-Stack Layer for TPM 2.0 above Laptop Chassis in Windows Hello ceremony */}
                    {ceremony === 'hello' && (
                        <g
                            className={`iso-tpm-stack ${step.who === 'auth' ? 'iso-active' : ''}`}
                            opacity={upperOpacity}
                        >
                            {/* Vertical Z-axis riser from motherboard socket (12, 4) to floating TPM chip */}
                            <line
                                x1="12"
                                y1="4"
                                x2="12"
                                y2={tpmLiftZ}
                                stroke={tpmUnlocked ? 'var(--ok)' : 'var(--flow)'}
                                strokeDasharray="3 3"
                                strokeWidth="1.5"
                            />
                            <g transform={`translate(12 ${tpmLiftZ + (1 - upperLayerBuild) * 20})`}>
                                <IsometricTpm
                                    active={step.st === 'sign' || step.st === 'match'}
                                    unlocked={tpmUnlocked}
                                />
                            </g>
                            {/* Isometric callout line along front-right (+X) to TPM 2.0 label (clear of HTTPS conduit) */}
                            <path
                                d={`M28 ${tpmLiftZ + 4}L82 ${tpmLiftZ + 35}H116`}
                                fill="none"
                                stroke="var(--muted)"
                                strokeDasharray="3 3"
                            />
                            <text x="150" y={tpmLiftZ + 39}>
                                TPM 2.0
                            </text>
                        </g>
                    )}

                    <text x="-20" y="68">
                        {T.nodeClient}
                    </text>
                    <text x="-20" y="86" className="iso-sub">
                        navigator.credentials.{mode === 'login' ? 'get' : 'create'}()
                    </text>
                </g>

                {/* LAYER 6: Foreground USB Security Key Node at (482, 336) along +X iso axis */}
                {ceremony === 'usb' && (
                    <g
                        className={`iso-device ${step.who === 'auth' ? 'iso-active' : ''}`}
                        transform={`translate(${usbPos[0]} ${usbPos[1] + authLift + (1 - authBuild) * 42})`}
                        opacity={authOpacity}
                    >
                        <IsoPlinth w={84} d={54} h={5} active={step.who === 'auth'} />
                        <g transform="translate(0 -9) scale(.92)">
                            <IsometricUsbKey
                                touching={step.st === 'touch'}
                                blinking={step.st === 'blink'}
                                signed={step.st === 'signed' || step.st === 'done'}
                            />
                        </g>
                        <text x="18" y="46">
                            {T.usb.auth}
                        </text>
                        <text x="18" y="64" className="iso-sub">
                            {step.st === 'blink'
                                ? T.keyHint
                                : step.st === 'touch'
                                  ? T.tapConfirmed
                                  : step.st === 'signed'
                                    ? mode === 'login'
                                        ? T.keySigned
                                        : T.keyCreated
                                    : 'CTAP2'}
                        </text>
                    </g>
                )}
            </g>

            {/* Bottom status readout bar */}
            <text x="400" y="400" className="iso-message">
                {packet?.label ?? step.message ?? step.t}
            </text>
        </svg>
    );
}
