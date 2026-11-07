import type { ReactNode } from 'react';

/**
 * True isometric projection (30° ground axes, 120° separation, parallel orthographic projection).
 * - x axis runs down-right (+30°): (+cos30, +sin30)
 * - y axis runs down-left (+150°): (-cos30, +sin30)
 * - z axis runs straight up (-90° screen Y): (0, -1)
 *
 * Fixed directional light from top-left-front:
 * - Top face (normal +Z): lightest (.iso-top)
 * - Left face (normal +Y / front-left): mid-tone (.iso-front)
 * - Right face (normal +X / front-right): darkest (.iso-side)
 */
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

/**
 * Extruded isometric rectangular block from (x0, y0, z0) to (x1, y1, z1)
 * with consistent per-face shading (top lightest, left mid, right darkest).
 */
export function IsoBlock({
    x0,
    y0,
    z0,
    x1,
    y1,
    z1,
    topClass = 'iso-top',
    leftClass = 'iso-front',
    rightClass = 'iso-side',
    className,
}: {
    x0: number;
    y0: number;
    z0: number;
    x1: number;
    y1: number;
    z1: number;
    topClass?: string;
    leftClass?: string;
    rightClass?: string;
    className?: string;
}) {
    return (
        <g className={className}>
            {/* Left face (x from x0..x1 at y = y1, z from z0..z1) */}
            <polygon
                points={isoPts([
                    [x0, y1, z1],
                    [x1, y1, z1],
                    [x1, y1, z0],
                    [x0, y1, z0],
                ])}
                className={leftClass}
            />
            {/* Right face (y from y0..y1 at x = x1, z from z0..z1) */}
            <polygon
                points={isoPts([
                    [x1, y1, z1],
                    [x1, y0, z1],
                    [x1, y0, z0],
                    [x1, y1, z0],
                ])}
                className={rightClass}
            />
            {/* Top face (z = z1) */}
            <polygon
                points={isoPts([
                    [x0, y0, z1],
                    [x1, y0, z1],
                    [x1, y1, z1],
                    [x0, y1, z1],
                ])}
                className={topClass}
            />
        </g>
    );
}

/** Ground plinth with soft drop shadow to anchor devices on the isometric plane. */
export function IsoPlinth({
    w = 64,
    d = 64,
    h = 6,
    active = false,
}: {
    w?: number;
    d?: number;
    h?: number;
    active?: boolean;
}) {
    const hw = w / 2;
    const hd = d / 2;
    return (
        <g className={`iso-plinth-group ${active ? 'iso-plinth-active' : ''}`}>
            <polygon
                points={isoPts([
                    [-hw - 6, -hd - 6, -2],
                    [hw + 6, -hd - 6, -2],
                    [hw + 6, hd + 6, -2],
                    [-hw - 6, hd + 6, -2],
                ])}
                className="iso-shadow"
            />
            <IsoBlock
                x0={-hw}
                y0={-hd}
                z0={0}
                x1={hw}
                y1={hd}
                z1={h}
                topClass="iso-plinth-top"
                leftClass="iso-plinth-left"
                rightClass="iso-plinth-right"
            />
        </g>
    );
}

/**
 * Hardware Security Key (USB-A + capacitive touch sensor)
 * Extruded with true side walls and Z-depth.
 */
export function IsometricUsbKey({
    touching = false,
    blinking = false,
    signed = false,
    flipped = false,
}: {
    touching?: boolean;
    blinking?: boolean;
    signed?: boolean;
    flipped?: boolean;
}) {
    const dir = flipped ? -1 : 1;
    const pressZ = touching ? -2.5 : 0;
    return (
        <g transform={`translate(0 ${pressZ})`} className="iso-usb-unit">
            {/* Soft contact shadow */}
            <polygon
                points={isoPts([
                    [-36 * dir, -14, -4],
                    [38 * dir, -14, -4],
                    [38 * dir, 14, -4],
                    [-36 * dir, 14, -4],
                ])}
                className="iso-shadow"
            />
            {/* Metallic USB-A connector plug */}
            <IsoBlock
                x0={flipped ? 18 : -36}
                y0={-8}
                z0={1}
                x1={flipped ? 38 : -16}
                y1={8}
                z1={5}
                topClass="iso-metal-top"
                leftClass="iso-metal-left"
                rightClass="iso-metal-right"
            />
            {/* USB contact cutouts on top of plug */}
            <polygon
                points={isoPts([
                    [flipped ? 24 : -31, -5, 5.2],
                    [flipped ? 29 : -26, -5, 5.2],
                    [flipped ? 29 : -26, -1.5, 5.2],
                    [flipped ? 24 : -31, -1.5, 5.2],
                ])}
                className="iso-side"
            />
            <polygon
                points={isoPts([
                    [flipped ? 24 : -31, 1.5, 5.2],
                    [flipped ? 29 : -26, 1.5, 5.2],
                    [flipped ? 29 : -26, 5, 5.2],
                    [flipped ? 24 : -31, 5, 5.2],
                ])}
                className="iso-side"
            />

            {/* Main security key body (extruded block) */}
            <IsoBlock
                x0={flipped ? -34 : -16}
                y0={-13}
                z0={0}
                x1={flipped ? 18 : 36}
                y1={13}
                z1={7}
                topClass="iso-top"
                leftClass="iso-front"
                rightClass="iso-side"
            />

            {/* Inner inset frame on top face */}
            <polygon
                points={isoPts([
                    [flipped ? -29 : -12, -9.5, 7.2],
                    [flipped ? 14 : 31, -9.5, 7.2],
                    [flipped ? 14 : 31, 9.5, 7.2],
                    [flipped ? -29 : -12, 9.5, 7.2],
                ])}
                className="iso-detail"
            />

            {/* Capacitive touch sensor on the isometric top plane */}
            <g transform={`translate(${iso(flipped ? -4 : 6, 0, 7.5).join(' ')})`}>
                <g transform="matrix(.866 .5 -.866 .5 0 0)">
                    <circle
                        cx="0"
                        cy="0"
                        r="7.5"
                        className={
                            touching
                                ? 'iso-touch'
                                : signed
                                  ? 'iso-verified-fill'
                                  : blinking
                                    ? 'iso-sensor iso-sensor-blink'
                                    : 'iso-sensor'
                        }
                    />
                    <circle cx="0" cy="0" r="4.2" fill="none" className="iso-sensor-core" />
                </g>
                {/* Touch / blink expanding isometric rings lifting along Z */}
                {(touching || blinking) && (
                    <g className="iso-pulse-rings" fill="none">
                        <ellipse
                            cx="0"
                            cy="-4"
                            rx="11"
                            ry="6.4"
                            className={touching ? 'iso-ring-touch' : 'iso-ring-blink'}
                        />
                        <ellipse
                            cx="0"
                            cy="-9"
                            rx="16"
                            ry="9.2"
                            className={touching ? 'iso-ring-touch-outer' : 'iso-ring-blink-outer'}
                        />
                    </g>
                )}
            </g>

            {/* Status LED bar */}
            <polygon
                points={isoPts([
                    [flipped ? -18 : 18, -5, 7.5],
                    [flipped ? -15 : 21, -5, 7.5],
                    [flipped ? -15 : 21, 5, 7.5],
                    [flipped ? -18 : 18, 5, 7.5],
                ])}
                className={signed ? 'iso-indicator-ok' : touching || blinking ? 'iso-touch' : 'iso-indicator'}
            />
        </g>
    );
}

/**
 * Isometric Laptop (Client / Browser)
 * Extruded base chassis + recessed keyboard + non-overlapping trackpad + flush vertical display lid.
 */
export function IsometricLaptop({
    screen,
    active = false,
}: {
    screen?: ReactNode;
    active?: boolean;
}) {
    return (
        <g>
            {/* Plinth under laptop */}
            <IsoPlinth w={116} d={96} h={5} active={active} />

            {/* Extruded laptop base deck: x in [-42, 42] (front-right), y in [-32, 34] (front-left), z in [5, 12] */}
            <IsoBlock
                x0={-42}
                y0={-32}
                z0={5}
                x1={42}
                y1={34}
                z1={12}
                topClass="iso-top"
                leftClass="iso-front"
                rightClass="iso-side"
            />

            {/* USB-C / USB-A ports on the right side face (x = 42) */}
            <polygon
                points={isoPts([
                    [42.2, -16, 9.5],
                    [42.2, -6, 9.5],
                    [42.2, -6, 7],
                    [42.2, -16, 7],
                ])}
                className="iso-detail"
            />
            <polygon
                points={isoPts([
                    [42.2, 2, 9.5],
                    [42.2, 10, 9.5],
                    [42.2, 10, 7],
                    [42.2, 2, 7],
                ])}
                className="iso-detail"
            />

            {/* Recessed keyboard well on top face (z = 12.2): x in [-32, 8], y in [-26, 28] */}
            <polygon
                points={isoPts([
                    [-32, -26, 12.2],
                    [8, -26, 12.2],
                    [8, 28, 12.2],
                    [-32, 28, 12.2],
                ])}
                className="iso-side"
            />
            {/* Keyboard key rows */}
            {[-24, -16, -8, 0].map(kx => (
                <line
                    key={`kr-${kx}`}
                    x1={iso(kx, -23, 12.3)[0]}
                    y1={iso(kx, -23, 12.3)[1]}
                    x2={iso(kx, 25, 12.3)[0]}
                    y2={iso(kx, 25, 12.3)[1]}
                    className="iso-key-grid"
                />
            ))}
            {[-16, -6, 4, 14].map(ky => (
                <line
                    key={`kc-${ky}`}
                    x1={iso(-30, ky, 12.3)[0]}
                    y1={iso(-30, ky, 12.3)[1]}
                    x2={iso(6, ky, 12.3)[0]}
                    y2={iso(6, ky, 12.3)[1]}
                    className="iso-key-grid"
                />
            ))}

            {/* Trackpad on palmrest (x in [15, 34], y in [-11, 11], z = 12.2) */}
            <polygon
                points={isoPts([
                    [15, -11, 12.2],
                    [34, -11, 12.2],
                    [34, 11, 12.2],
                    [15, 11, 12.2],
                ])}
                className="iso-detail"
            />

            {/* Extruded vertical display lid along back edge x in [-42, -37], y in [-32, 34], z in [12, 86] */}
            <IsoBlock
                x0={-42}
                y0={-32}
                z0={12}
                x1={-37}
                y1={34}
                z1={86}
                topClass="iso-top"
                leftClass="iso-front"
                rightClass="iso-screen-bezel"
            />

            {/* Screen glass surface flush on the front-right face of the lid (x = -37, y in 31..-29, z in 83..15) */}
            {/* Top-left corner (-37, 31, 83) -> sx = (-37-31)*0.866 = -58.89, sy = (-37+31)*0.5 - 83 = -86 */}
            <g transform="matrix(.866 -.5 0 1 -58.9 -86)">
                <rect width="60" height="68" rx="2" className="iso-side" />
                {/* Browser chrome header */}
                <path d="M0 11H60" fill="none" className="iso-chrome-line" />
                <circle cx="5.5" cy="5.5" r="1.4" className="iso-indicator" />
                <circle cx="10" cy="5.5" r="1.4" className="iso-indicator-subtle" />
                <rect x="15" y="3.5" width="38" height="4" rx="1.5" className="iso-detail" />
                {/* Default WebAuthn security dialog card */}
                <rect x="12" y="19" width="36" height="31" rx="3" className="iso-detail" />
                <path d="M24 31V27.5a6 6 0 0 1 12 0V31M22 31H38V43H22Z" fill="none" className="iso-lock-glyph" />
                <path d="M16 58H44" fill="none" opacity=".45" />
                {screen}
            </g>
        </g>
    );
}

/**
 * Isometric Server (Relying Party)
 * Stacked 3-blade extruded server rack on an isometric plinth.
 */
export function IsometricServer({
    active = false,
    verified = false,
}: {
    active?: boolean;
    verified?: boolean;
}) {
    return (
        <g>
            <IsoPlinth w={76} d={76} h={6} active={active || verified} />

            {/* Server rack cabinet extruded block: x in [-28, 28], y in [-28, 28], z in [6, 76] */}
            <IsoBlock
                x0={-28}
                y0={-28}
                z0={6}
                x1={28}
                y1={28}
                z1={76}
                topClass="iso-top"
                leftClass="iso-front"
                rightClass="iso-side"
            />

            {/* Top telemetry cap */}
            <polygon
                points={isoPts([
                    [-19, -19, 76.3],
                    [19, -19, 76.3],
                    [19, 19, 76.3],
                    [-19, 19, 76.3],
                ])}
                className={verified ? 'iso-verified-fill' : 'iso-detail'}
            />

            {/* Three stacked server blade bays flush on left-front face (y = 28, x in -21..21, z in 68..14) */}
            <g transform="matrix(.866 .5 0 1 -42.4 -64.5)">
                {[0, 19, 38].map((y, idx) => (
                    <g key={y} transform={`translate(0 ${y})`}>
                        <rect width="42" height="15" rx="2" className="iso-detail" />
                        <path d="M5 5H24M5 10H18" fill="none" strokeWidth="1.1" />
                        <circle
                            cx="34"
                            cy="7.5"
                            r="2"
                            className={
                                verified
                                    ? 'iso-indicator-ok'
                                    : active && idx === 0
                                      ? 'iso-touch'
                                      : 'iso-indicator'
                            }
                        />
                    </g>
                ))}
            </g>

            {/* Right-face cooling louvres flush on x = 28 */}
            <g transform="matrix(.866 -.5 0 1 8.7 -43)" fill="none" opacity=".55">
                {[4, 11, 18, 25, 32, 39, 46, 53].map(ly => (
                    <path key={ly} d={`M0 ${ly}H36`} />
                ))}
            </g>

            {/* Verification check badge floating above server on completion */}
            {verified && (
                <g transform="translate(0 -92)" className="iso-float-badge">
                    <polygon points="0,-13 12,-6.5 12,6.5 0,13 -12,6.5 -12,-6.5" className="iso-verified-badge" />
                    <path d="M-4.5 0L-1 3.5L5.5 -3.5" fill="none" stroke="var(--ok)" strokeWidth="2.2" />
                </g>
            )}
        </g>
    );
}

/**
 * Extruded TPM 2.0 Secure Crypto-Processor Module
 * Designed as an isometric hardware layer with pins and extruded silicon package.
 */
export function IsometricTpm({
    active,
    unlocked = false,
}: {
    active: boolean;
    unlocked?: boolean;
}) {
    return (
        <g className="iso-tpm-chip">
            {/* Motherboard socket shadow */}
            <polygon
                points={isoPts([
                    [-18, -18, 0],
                    [18, -18, 0],
                    [18, 18, 0],
                    [-18, 18, 0],
                ])}
                className="iso-shadow"
            />
            {/* Silicon package extruded block */}
            <IsoBlock
                x0={-15}
                y0={-15}
                z0={2}
                x1={15}
                y1={15}
                z1={8}
                topClass={active ? 'iso-touch-surface' : unlocked ? 'iso-verified-surface' : 'iso-top'}
                leftClass="iso-front"
                rightClass="iso-side"
            />
            {/* Gull-wing IC pins along isometric edges */}
            {[-9, -3, 3, 9].map(p => (
                <g key={p} className="iso-chip-pins">
                    <line
                        x1={iso(p, 15, 4)[0]}
                        y1={iso(p, 15, 4)[1]}
                        x2={iso(p, 20, 2)[0]}
                        y2={iso(p, 20, 2)[1]}
                    />
                    <line
                        x1={iso(15, p, 4)[0]}
                        y1={iso(15, p, 4)[1]}
                        x2={iso(20, p, 2)[0]}
                        y2={iso(20, p, 2)[1]}
                    />
                    <line
                        x1={iso(p, -15, 4)[0]}
                        y1={iso(p, -15, 4)[1]}
                        x2={iso(p, -19, 2)[0]}
                        y2={iso(p, -19, 2)[1]}
                    />
                    <line
                        x1={iso(-15, p, 4)[0]}
                        y1={iso(-15, p, 4)[1]}
                        x2={iso(-19, p, 2)[0]}
                        y2={iso(-19, p, 2)[1]}
                    />
                </g>
            ))}
            {/* Die core & lock icon on top of TPM package */}
            <g transform="translate(0 -7) matrix(.866 -.5 .866 .5 0 0)">
                <rect x="-8" y="-8" width="16" height="16" rx="2" className="iso-detail" />
                <path
                    d="M-3 -1V-3a3 3 0 0 1 6 0v2M-4.5 -1H4.5V5H-4.5Z"
                    fill="none"
                    stroke={unlocked ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--flow)'}
                    strokeWidth="1.4"
                />
            </g>
        </g>
    );
}

/**
 * Isometric Windows Hello Biometric Enclave Panel
 * Extruded vertical isometric glass slab with IR scanning laser and verification checkmark.
 */
export function IsometricHello({
    scanning = false,
    verified = false,
}: {
    scanning?: boolean;
    verified?: boolean;
}) {
    return (
        <g>
            {/* Extruded vertical biometric frame: x in [-4, 4], y in [-32, 32], z in [0, 68] */}
            <IsoBlock
                x0={-4}
                y0={-32}
                z0={0}
                x1={4}
                y1={32}
                z1={68}
                topClass="iso-top"
                leftClass="iso-front"
                rightClass="iso-side"
            />
            {/* Front glass panel flush on x = 4 (u in 3..61 -> width 58, v in 3..65 -> height 62) */}
            <g transform="matrix(.866 -.5 0 1 -21.6 -48.5)">
                <rect width="58" height="62" rx="4" className="iso-detail" />
                {/* Biometric viewfinder brackets */}
                <path
                    d="M8 20V9H19M39 9H50V20M50 42V53H39M19 53H8V42"
                    fill="none"
                    stroke={verified ? 'var(--ok)' : scanning ? 'var(--flow)' : 'var(--muted)'}
                    strokeWidth="1.6"
                />
                {/* User silhouette */}
                <circle cx="29" cy="24" r="8.5" className="iso-side" />
                <path d="M15 47Q15 34 29 34Q43 34 43 47" fill="none" strokeWidth="1.6" />
                {/* Animated IR scan laser line during scan step */}
                {scanning && <line x1="8" y1="14" x2="50" y2="14" className="iso-scan-beam" />}
                {/* Verified checkmark */}
                {verified && (
                    <g className="iso-verified-check">
                        <circle cx="41" cy="43" r="9" fill="var(--ok-soft)" stroke="var(--ok)" strokeWidth="1.6" />
                        <path d="M36.5 43L39.8 46.2L46 39.5" fill="none" stroke="var(--ok)" strokeWidth="2.4" />
                    </g>
                )}
            </g>
        </g>
    );
}

/**
 * Isometric Smartphone (Hybrid Authenticator)
 * True 3D extruded slab with seamless side/top walls and camera/prompt/ok screen states.
 */
export function IsometricPhone({
    state,
    active = false,
}: {
    state: string;
    active?: boolean;
}) {
    return (
        <g>
            <IsoPlinth w={68} d={68} h={5} active={active} />

            {/* Extruded smartphone slab standing upright: x in [-4, 4], y in [-26, 26], z in [6, 94] */}
            <IsoBlock
                x0={-4}
                y0={-26}
                z0={6}
                x1={4}
                y1={26}
                z1={94}
                topClass="iso-top"
                leftClass="iso-front"
                rightClass="iso-side"
            />

            {/* Front display surface flush on right-facing plane (x = 4, u in 3..49 -> width 46, v in 3..85 -> height 82) */}
            <g transform="matrix(.866 -.5 0 1 -16.5 -77.5)">
                <rect width="46" height="82" rx="4" className="iso-side" />
                <rect x="3.5" y="5.5" width="39" height="71" rx="2.5" className="iso-detail" />
                {/* Speaker pill & home bar */}
                <path d="M17 9.5H29M16 73H30" fill="none" strokeWidth="1.4" />

                {state === 'camera' ? (
                    <g fill="none">
                        <path
                            d="M10 33V25H18M28 25H36V33M36 49V57H28M18 57H10V49"
                            stroke="var(--flow)"
                            strokeWidth="1.6"
                        />
                        <line x1="11" y1="41" x2="35" y2="41" className="iso-scan-beam-phone" />
                    </g>
                ) : state === 'ok' ? (
                    <g fill="none" stroke="var(--ok)">
                        <circle cx="23" cy="41" r="12.5" fill="var(--ok-soft)" strokeWidth="1.8" />
                        <path d="M16.5 41L21 45.5L30 35.5" strokeWidth="2.4" />
                    </g>
                ) : (
                    <g
                        fill="none"
                        stroke={state === 'prompt' ? 'var(--accent)' : 'var(--muted)'}
                        className={state === 'prompt' ? 'iso-fp-pulse' : undefined}
                    >
                        <path d="M11.5 44V39a11.5 11.5 0 0 1 23 0v7M16 48V39a7 7 0 0 1 14 0v11M20.5 51V39a2.5 2.5 0 0 1 5 0v14" />
                        {state === 'prompt' && (
                            <circle cx="23" cy="42" r="14.5" stroke="var(--accent)" strokeOpacity=".45" />
                        )}
                    </g>
                )}
            </g>
        </g>
    );
}
