import type { ReactNode } from 'react';
export type Ceremony = 'usb' | 'nfc' | 'hello' | 'phone';
export type Mode = 'login' | 'register';
export type Actor = 'rp' | 'client' | 'auth';
export interface Screen {
    type: 'login' | 'loading' | 'dialog' | 'qr' | 'ok';
    msg?: string;
}
export interface Step {
    who: Actor;
    tag: Actor | 'user';
    t: string;
    d: string;
    st: string;
    screen: Screen;
    phone?: string;
    dur?: number;
    data: ReactNode;
    pkt: {
        from: Actor;
        to: Actor;
        label: string;
    } | null;
}
export interface CeremonyDefinition {
    steps: (mode: Mode) => Step[];
    states: Record<string, string[]>;
}
