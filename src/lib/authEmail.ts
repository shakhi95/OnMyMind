const EMAIL_DOMAIN = 'onmymind.local';

/** Username shown in the UI → Supabase Auth email. */
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

/** Normalize and validate a username before auth. */
export function normalizeUsername(raw: string): string | null {
  const username = raw.trim().toLowerCase();
  if (!/^[a-z0-9._-]{2,32}$/.test(username)) return null;
  return username;
}
