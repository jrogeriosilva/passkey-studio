import type { ReactNode } from 'react';
export type Ceremony = 'usb' | 'hello' | 'phone';
export type Mode = 'login' | 'register';
export type Actor = 'rp' | 'client' | 'auth';
export interface Step {
    who: Actor;
    tag: Actor | 'user';
    t: string;
    d: string;
    st: string;
    message?: string;
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
}
