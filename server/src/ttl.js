export const TTL_MS = 24 * 60 * 60 * 1000;

export function isExpired(uploadedAt, now = Date.now()) {
  const t = Date.parse(uploadedAt);
  if (Number.isNaN(t)) return true;
  return now - t >= TTL_MS;
}

export function formatFileSize(filesize) {
  const n = Number(filesize);
  if (!Number.isFinite(n) || n < 0) return '0.00 bytes';
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${n.toFixed(2)} bytes`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}
