/** Transfers stay in memory; payloads never enter URLs, storage or network requests. */
export function openInspector(value: unknown) {
  const payload = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  window.dispatchEvent(new CustomEvent('studio:inspect', { detail: payload }));
}
