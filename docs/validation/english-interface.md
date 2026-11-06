# English interface and Learn payload guide

Validated on 2026-11-06 with Node.js 24.20.0.

- Learn uses English exclusively, including when the browser retains a previous Portuguese preference. The language selector and preference handling were removed.
- Navigation, Lab tools, Inspector, sample descriptions, validation messages, confirmations, accessibility labels and metadata use English. Dates and number formatting use the English locale.
- “Understanding FIDO2 and WebAuthn Payloads” and its four diagrams now belong to Learn. The guide links to Inspect for decoding; Inspect no longer renders the guide.
- `npm run lint`, `npm test` (10 Node ceremony tests and 196 Vitest tests), `npm run build`, and `VITE_BASE_PATH=/passkey-studio/ npm run build` passed.
- Chromium: all three routes checked at 1440, 390 and 320 px, with no horizontal page overflow. The expanded guide was also checked at all three widths. English packet labels wrap within their mobile width.
- Keyboard: authenticator selection using arrow keys, ceremony step controls, diagram opening and Escape to close were checked.
- Lab simulation: credential creation, challenge signing and transfer of the generated assertion to Inspect passed. Inspector decoded the response without alerts.
- Preview of the build under `/passkey-studio/`: direct entry to each route returned HTTP 200; navigation retained the base path and all four guide diagrams loaded.
- Impeccable's mechanical detector reported no findings on the changed UI. Fresh browser navigation produced no JavaScript page errors.

Guide screenshots: [desktop](../screenshots/learn-payload-guide-desktop.png) and [mobile](../screenshots/learn-payload-guide-mobile.png).

Physical hardware and external server integration were not tested. The production build continues to report the existing warning about a chunk larger than 500 kB.
