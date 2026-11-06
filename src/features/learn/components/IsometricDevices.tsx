import type { ReactNode } from 'react';

/** Shared 30-degree projection: x travels down-right, y travels up-right. */
export function IsometricUsbKey({ touching = false, flipped = false }: { touching?: boolean; flipped?: boolean }) {
    return (
        <g transform="translate(-42 -16) scale(.85)">
            {/* The exposed USB-A plug is shorter than the body, with aligned five-unit walls. */}
            <g transform={`matrix(.866 .5 -.866 .5 0 ${flipped ? -5 : 5})`}>
                <rect x="28" y="0" width="106" height="44" rx="18" className="iso-side"/>
            </g>
            <g transform={`matrix(.866 .5 -.866 .5 0 ${flipped ? -5 : 5})`}>
                <rect x="0" y="7" width="36" height="30" rx="2" className="iso-side"/>
            </g>
            <g transform="matrix(.866 .5 -.866 .5 0 0)">
                <rect x="0" y="7" width="36" height="30" rx="2" className="iso-metal"/>
                <path d="M7 12H15V19H7ZM7 25H15V32H7Z" className="iso-side"/>
                <path d="M24 8V36" fill="none"/>
                <rect x="28" y="0" width="106" height="44" rx="18" className="iso-top"/>
                <rect x="33" y="5" width="96" height="34" rx="14" fill="none" opacity=".35"/>
                <circle cx="68" cy="22" r="13" className={touching ? 'iso-touch' : 'iso-sensor'}/>
                <circle cx="68" cy="22" r="8" fill="none" opacity=".5"/>
                <rect x="92" y="19" width="5" height="6" rx="2" className="iso-indicator"/>
                <circle cx="118" cy="22" r="6" className="iso-side"/>
            </g>
        </g>
    );
}

export function IsometricLaptop({ screen }: { screen?: ReactNode }) {
    return (
        <g>
            <path d="M-72-88L18-140L23-137V-37L-67 15L-72 12Z" className="iso-side"/>
            <path d="M-72-88L18-140V-40L-72 12Z" className="iso-front"/>
            <g transform="matrix(.866 -.5 0 1 -64 -82)">
                <rect width="86" height="81" rx="2" className="iso-side"/>
                <path d="M0 13H86" fill="none"/>
                <circle cx="7" cy="7" r="1.5" className="iso-indicator"/>
                <path d="M17 7H74" fill="none" opacity=".45"/>
                <rect x="23" y="29" width="40" height="29" rx="3" className="iso-detail"/>
                <path d="M35 41V37a8 8 0 0 1 16 0v4M33 41H53V53H33Z" fill="none"/>
                <path d="M23 68H63" fill="none" opacity=".5"/>
                {screen}
            </g>
            <path d="M-72 12L18-40L86-1V6L-4 58L-72 19Z" className="iso-side"/>
            <path d="M-72 12L18-40L86-1L-4 51Z" className="iso-top"/>
            <g transform="matrix(.866 -.5 .866 .5 -57 12)">
                <rect width="82" height="31" rx="2" className="iso-front"/>
                <path d="M0 8H82M0 16H82M0 24H82M10 0V24M20 0V24M30 0V24M40 0V24M50 0V24M60 0V24M70 0V24" fill="none" strokeWidth=".8" opacity=".55"/>
                <rect x="27" y="37" width="30" height="15" rx="2" className="iso-detail"/>
            </g>
        </g>
    );
}

export function IsometricServer() {
    return (
        <g>
            <path d="M-44-48L0-73L44-48L0-23Z" className="iso-top"/>
            <path d="M-44-48L0-23V61L-44 36Z" className="iso-front"/>
            <path d="M0-23L44-48V36L0 61Z" className="iso-side"/>
            <g transform="matrix(.866 .5 0 1 -37 -35)">
                {[0, 24, 48].map(y => <g key={y} transform={`translate(0 ${y})`}>
                    <rect width="34" height="18" rx="2" className="iso-detail"/>
                    <path d="M5 6H23M5 11H18" fill="none" strokeWidth="1"/>
                    <circle cx="28" cy="12" r="1.5" className="iso-indicator"/>
                </g>)}
            </g>
            <g transform="matrix(.866 -.5 0 1 10 -17)" fill="none" opacity=".5">
                <path d="M0 8H29M0 15H29M0 22H29M0 29H29M0 36H29M0 43H29M0 50H29M0 57H29"/>
            </g>
        </g>
    );
}

export function IsometricNfcReader({ active }: { active: boolean }) {
    return (
        <g>
            <path d="M-51 0L0-29L51 0V12L0 41L-51 12Z" className="iso-side"/>
            <path d="M-51 0L0-29L51 0L0 29Z" className="iso-top"/>
            <g transform="matrix(.866 .5 -.866 .5 0 -21)" fill="none">
                <rect width="42" height="42" rx="7" opacity=".4"/>
                <path d="M13 14Q25 21 13 28M19 9Q38 21 19 33" stroke={active ? 'var(--flow)' : 'currentColor'}/>
            </g>
            <circle cx="0" cy="34" r="2" className="iso-indicator"/>
            {active && <path d="M-24-20Q0-42 24-20M-17-27Q0-43 17-27" fill="none" stroke="var(--flow)"/>}
        </g>
    );
}

export function IsometricTpm({ active }: { active: boolean }) {
    return (
        <g>
            <path d="M5-4V0M13-4V0M21-4V0M5 24V28M13 24V28M21 24V28M-4 5H0M-4 13H0M-4 21H0M28 5H32M28 13H32M28 21H32" fill="none"/>
            <rect width="28" height="24" rx="2" className={active ? 'iso-touch' : 'iso-detail'}/>
            <path d="M9 10V8a5 5 0 0 1 10 0v2M7 10H21V20H7Z" fill="none"/>
        </g>
    );
}

export function IsometricHello({ verified }: { verified: boolean }) {
    return (
        <g>
            <path d="M-30-25L25-57L32-53V18L-23 50L-30 46Z" className="iso-side"/>
            <g transform="matrix(.866 -.5 0 1 -30 -25)">
                <rect width="64" height="71" rx="4" className="iso-top"/>
                <path d="M9 22V10H21M43 10H55V22M55 49V61H43M21 61H9V49" fill="none"/>
                <circle cx="32" cy="28" r="10" className="iso-detail"/>
                <path d="M16 53Q16 38 32 38Q48 38 48 53" fill="none"/>
                {verified && <path d="M25 49L31 55L43 42" fill="none" stroke="var(--ok)" strokeWidth="3"/>}
            </g>
        </g>
    );
}

export function IsometricPhone({ state }: { state: string }) {
    return (
        <g>
            <g transform="matrix(.866 -.5 0 1 -19 -49)">
                <rect width="51" height="105" rx="8" className="iso-side"/>
            </g>
            <g transform="matrix(.866 -.5 0 1 -24 -52)">
                <rect width="51" height="105" rx="8" className="iso-front"/>
                <rect x="5" y="7" width="41" height="89" rx="4" className="iso-side"/>
                <path d="M19 12H32M19 91H32" fill="none"/>
                {state === 'camera' ? <g fill="none">
                    <path d="M12 40V32H20M32 32H40V40M40 60V68H32M20 68H12V60"/>
                    <path d="M13 50H39" stroke="var(--flow)"/>
                </g> : state === 'ok' ? <g fill="none" stroke="var(--ok)">
                    <circle cx="26" cy="51" r="15"/>
                    <path d="M17 51L23 57L35 44" strokeWidth="2"/>
                </g> : <g fill="none" stroke={state === 'prompt' ? 'var(--accent)' : undefined}>
                    <path d="M13 53V48a13 13 0 0 1 26 0v8M18 58V48a8 8 0 0 1 16 0v14M23 62V48a3 3 0 0 1 6 0v17"/>
                </g>}
            </g>
        </g>
    );
}
