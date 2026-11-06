import type { Ceremony } from '../data/types';
export function AuthenticatorIcon({ ceremony }: {
    ceremony: Ceremony;
}) {
    const icons = {
        usb: (<svg aria-hidden="true" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="9" width="8" height="8" rx="1"/><rect x="10" y="6" width="13" height="14" rx="3"/><circle cx="18" cy="13" r="1.5" fill="currentColor"/></svg>),
        nfc: (<svg aria-hidden="true" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="9" width="7" height="8" rx="1"/><rect x="9" y="6" width="9" height="14" rx="3"/><path d="M20 9.5a5 5 0 0 1 0 7M23 7a8 8 0 0 1 0 12" opacity=".6"/></svg>),
        hello: (<svg aria-hidden="true" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3M18 3h3a2 2 0 0 1 2 2v3M23 18v3a2 2 0 0 1-2 2h-3M8 23H5a2 2 0 0 1-2-2v-3"/><circle cx="9.5" cy="10.5" r="1" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor"/><path d="M9 16c1 1.3 2.4 2 4 2s3-.7 4-2"/></svg>),
        phone: (<svg aria-hidden="true" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="12" height="22" rx="3"/><path d="M11 20h4"/><path d="M3 9a5 5 0 0 1 0 8M23 9a5 5 0 0 1 0 8" opacity=".6"/></svg>),
    };
    return icons[ceremony];
}
