// Server-only auth core, redesigned around OAuth 2.0 bearer tokens.
//
// Model (RFC 6749/6750/7009-style, opaque tokens):
//   * POST /api/oauth/token  grant_type=password       -> access + refresh pair
//   * POST /api/oauth/token  grant_type=refresh_token  -> rotated pair
//   * POST /api/oauth/revoke                           -> revoke token family
//   * Every protected API accepts `Authorization: Bearer <access_token>`.
// The browser is just another OAuth client: the same tokens ride httpOnly
// cookies (ji_access / ji_refresh) so the web app works without JS token
// storage. Refresh tokens ROTATE on every use; presenting a revoked refresh
// token revokes its whole family (reuse detection).
import { db, type Db } from "./db.server";

export const ACCESS_COOKIE = "ji_access";
export const REFRESH_COOKIE = "ji_refresh";
export const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TTL_SECONDS = 14 * 86_400; // 14 days
export const AUTH_CODE_TTL_SECONDS = 60; // authorization codes are single-use and short
const PBKDF2_ITERATIONS = 100_000;

// Scope catalog. First-party sign-in (password grant / the site's own login
// form) receives the full scope; third-party clients get only what they
// requested, capped by their registration.
export const SCOPES: Record<string, string> = {
  "profile:read": "See your name, contact details, and communication preferences",
  "profile:write": "Update your contact details and communication preferences",
  "enrollments:read": "See your enrollments, statuses, and payment history",
  "enrollments:write": "Enroll, pay, cancel, and reinstate coverage for you",
};
export const FULL_SCOPE = Object.keys(SCOPES).join(" ");
// Back-compat alias used by the token response builders.
export const TOKEN_SCOPE = FULL_SCOPE;

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  pref_email: number;
  pref_sms: number;
  pref_mail: number;
  pref_paperless: number;
  created_at: string;
};

export function requireDb(): Db {
  return db;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await pbkdf2(password, salt);
  return `${toHex(salt)}:${digest}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, digest] = stored.split(":");
  if (!saltHex || !digest) return false;
  const candidate = await pbkdf2(password, fromHex(saltHex));
  if (candidate.length !== digest.length) return false;
  let diff = 0;
  for (let i = 0; i < digest.length; i++) diff |= candidate.charCodeAt(i) ^ digest.charCodeAt(i);
  return diff === 0;
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toHex(bytes);
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return toHex(new Uint8Array(digest));
}

/** base64url(SHA-256(input)) — the PKCE S256 transform (RFC 7636). */
export async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const bytes = new Uint8Array(digest);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// ---------------------------------------------------------------------------
// Token issuance / rotation / revocation
// ---------------------------------------------------------------------------

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  familyId: string;
  scope: string;
};

function isoIn(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function issueTokenPair(
  userId: number,
  familyId?: string,
  scope: string = FULL_SCOPE,
): Promise<TokenPair> {
  const database = requireDb();
  const family = familyId ?? crypto.randomUUID();
  const accessToken = `at_${newToken()}`;
  const refreshToken = `rt_${newToken()}`;
  await database
    .prepare(
      "INSERT INTO oauth_tokens (user_id, kind, token, family_id, scope, expires_at) VALUES (?1, 'access', ?2, ?3, ?4, ?5)",
    )
    .bind(userId, accessToken, family, scope, isoIn(ACCESS_TTL_SECONDS))
    .run();
  await database
    .prepare(
      "INSERT INTO oauth_tokens (user_id, kind, token, family_id, scope, expires_at) VALUES (?1, 'refresh', ?2, ?3, ?4, ?5)",
    )
    .bind(userId, refreshToken, family, scope, isoIn(REFRESH_TTL_SECONDS))
    .run();
  // Opportunistic cleanup of long-expired rows for this user.
  await database
    .prepare("DELETE FROM oauth_tokens WHERE user_id = ?1 AND expires_at < ?2")
    .bind(userId, new Date(Date.now() - 86_400_000).toISOString())
    .run();
  return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS, familyId: family, scope };
}

export async function revokeFamily(familyId: string): Promise<void> {
  await requireDb()
    .prepare("UPDATE oauth_tokens SET revoked = 1 WHERE family_id = ?1")
    .bind(familyId)
    .run();
}

export async function revokeAllForUser(userId: number): Promise<void> {
  await requireDb()
    .prepare("UPDATE oauth_tokens SET revoked = 1 WHERE user_id = ?1")
    .bind(userId)
    .run();
}

type TokenRow = {
  id: number;
  user_id: number;
  kind: string;
  token: string;
  family_id: string;
  scope: string;
  revoked: number;
  expires_at: string;
};

export async function lookupToken(token: string): Promise<TokenRow | null> {
  if (!token) return null;
  const row = await requireDb()
    .prepare("SELECT * FROM oauth_tokens WHERE token = ?1")
    .bind(token)
    .first<TokenRow>();
  return row ?? null;
}

/**
 * Rotate a refresh token: revoke it, issue a fresh pair in the same family.
 * Reuse of an already-revoked refresh token revokes the entire family.
 */
export async function rotateRefreshToken(
  refreshToken: string,
): Promise<{ ok: true; pair: TokenPair; userId: number } | { ok: false; code: string; message: string }> {
  const row = await lookupToken(refreshToken);
  if (!row || row.kind !== "refresh")
    return { ok: false, code: "invalid_grant", message: "Unknown refresh token." };
  if (row.revoked) {
    // Reuse detection: someone is replaying an old token — kill the family.
    await revokeFamily(row.family_id);
    return { ok: false, code: "invalid_grant", message: "Refresh token was already used; session revoked." };
  }
  if (new Date(row.expires_at).getTime() < Date.now())
    return { ok: false, code: "invalid_grant", message: "Refresh token has expired. Sign in again." };
  await requireDb()
    .prepare("UPDATE oauth_tokens SET revoked = 1 WHERE id = ?1")
    .bind(row.id)
    .run();
  const pair = await issueTokenPair(row.user_id, row.family_id, row.scope);
  return { ok: true, pair, userId: row.user_id };
}

// ---------------------------------------------------------------------------
// Registered OAuth clients + authorization codes (authorization-code flow)
// ---------------------------------------------------------------------------

export type OauthClient = {
  client_id: string;
  name: string;
  secret_hash: string | null;
  redirect_uris: string;
  allowed_scopes: string;
  confidential: number;
};

export async function getOauthClient(clientId: string): Promise<OauthClient | null> {
  if (!clientId) return null;
  const row = await requireDb()
    .prepare("SELECT * FROM oauth_clients WHERE client_id = ?1")
    .bind(clientId)
    .first<OauthClient>();
  return row ?? null;
}

export function clientRedirectUris(client: OauthClient): string[] {
  try {
    return JSON.parse(client.redirect_uris) as string[];
  } catch {
    return [];
  }
}

/** Filter a requested scope string down to scopes that exist AND are allowed for the client. */
export function resolveScopes(client: OauthClient, requested: string | null): string[] {
  const allowed = client.allowed_scopes.split(" ").filter(Boolean);
  if (!requested) return allowed;
  return requested
    .split(/[\s+]+/)
    .filter(Boolean)
    .filter((scope) => scope in SCOPES && allowed.includes(scope));
}

export async function issueAuthCode(args: {
  clientId: string;
  userId: number;
  redirectUri: string;
  scope: string;
  codeChallenge: string | null;
  codeChallengeMethod: string | null;
}): Promise<string> {
  const code = `ac_${newToken()}`;
  await requireDb()
    .prepare(
      `INSERT INTO oauth_codes (code, client_id, user_id, redirect_uri, scope, code_challenge, code_challenge_method, expires_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    )
    .bind(
      code,
      args.clientId,
      args.userId,
      args.redirectUri,
      args.scope,
      args.codeChallenge,
      args.codeChallengeMethod,
      isoIn(AUTH_CODE_TTL_SECONDS),
    )
    .run();
  return code;
}

export type AuthCodeRow = {
  code: string;
  client_id: string;
  user_id: number;
  redirect_uri: string;
  scope: string;
  code_challenge: string | null;
  code_challenge_method: string | null;
  used: number;
  expires_at: string;
};

export async function consumeAuthCode(code: string): Promise<AuthCodeRow | null> {
  const row = await requireDb()
    .prepare("SELECT * FROM oauth_codes WHERE code = ?1")
    .bind(code)
    .first<AuthCodeRow>();
  if (!row) return null;
  await requireDb().prepare("UPDATE oauth_codes SET used = 1 WHERE code = ?1").bind(code).run();
  return row;
}

// ---------------------------------------------------------------------------
// Request-side resolution (Bearer header first, cookie fallback)
// ---------------------------------------------------------------------------

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [cookieName, ...rest] = part.trim().split("=");
    if (cookieName === name) return rest.join("=") || null;
  }
  return null;
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

export function readAccessToken(request: Request): string | null {
  return readBearerToken(request) ?? readCookie(request, ACCESS_COOKIE);
}

export function tokenCookies(pair: TokenPair): string[] {
  const base = "Path=/; HttpOnly; Secure; SameSite=Lax";
  return [
    `${ACCESS_COOKIE}=${pair.accessToken}; ${base}; Max-Age=${ACCESS_TTL_SECONDS}`,
    `${REFRESH_COOKIE}=${pair.refreshToken}; ${base}; Max-Age=${REFRESH_TTL_SECONDS}`,
  ];
}

export function clearTokenCookies(): string[] {
  const base = "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
  return [`${ACCESS_COOKIE}=; ${base}`, `${REFRESH_COOKIE}=; ${base}`];
}

export async function currentUserWithScope(
  request: Request,
): Promise<{ user: SessionUser; scope: string } | null> {
  const token = readAccessToken(request);
  if (!token) return null;
  const row = await requireDb()
    .prepare(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.date_of_birth, u.phone,
              u.address_street, u.address_city, u.address_state, u.address_zip,
              u.pref_email, u.pref_sms, u.pref_mail, u.pref_paperless, u.created_at,
              t.expires_at AS token_expires_at, t.revoked AS token_revoked, t.kind AS token_kind,
              t.scope AS token_scope
         FROM oauth_tokens t JOIN users u ON u.id = t.user_id
        WHERE t.token = ?1`,
    )
    .bind(token)
    .first<
      SessionUser & { token_expires_at: string; token_revoked: number; token_kind: string; token_scope: string }
    >();
  if (!row || row.token_kind !== "access" || row.token_revoked) return null;
  if (new Date(row.token_expires_at).getTime() < Date.now()) return null;
  const { token_expires_at: _e, token_revoked: _r, token_kind: _k, token_scope, ...user } = row;
  return { user: user as SessionUser, scope: token_scope };
}

export async function currentUser(request: Request): Promise<SessionUser | null> {
  const resolved = await currentUserWithScope(request);
  return resolved?.user ?? null;
}

export function publicUser(user: SessionUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    dateOfBirth: user.date_of_birth,
    phone: user.phone,
    address: {
      street: user.address_street,
      city: user.address_city,
      state: user.address_state,
      zip: user.address_zip,
    },
    communicationPreferences: {
      email: !!user.pref_email,
      sms: !!user.pref_sms,
      mail: !!user.pref_mail,
      paperless: !!user.pref_paperless,
    },
    memberSince: user.created_at,
  };
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export function json(data: unknown, init: number | ResponseInit = 200): Response {
  const base: ResponseInit = typeof init === "number" ? { status: init } : init;
  return new Response(JSON.stringify(data), {
    ...base,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...(base.headers ?? {}) },
  });
}

export function jsonWithCookies(data: unknown, status: number, cookies: string[]): Response {
  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  for (const cookie of cookies) headers.append("set-cookie", cookie);
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorJson(status: number, code: string, message: string): Response {
  return json({ ok: false, error: { code, message } }, status);
}

/** RFC 6749-shaped error body for the OAuth endpoints. */
export function oauthError(status: number, error: string, description: string): Response {
  return json({ error, error_description: description }, status);
}

/**
 * Standard OAuth token response body. Cookies are attached only for
 * first-party transport (password/refresh grants); third-party
 * authorization-code exchanges get a pure JSON response.
 */
export function tokenResponse(
  pair: TokenPair,
  options: { withCookies?: boolean; extra?: Record<string, unknown> } = {},
): Response {
  const body = {
    access_token: pair.accessToken,
    token_type: "Bearer",
    expires_in: pair.expiresIn,
    refresh_token: pair.refreshToken,
    scope: pair.scope,
    ...(options.extra ?? {}),
  };
  if (options.withCookies === false) return json(body);
  return jsonWithCookies(body, 200, tokenCookies(pair));
}

function bearerChallenge(status: number, code: string, message: string, error: string): Response {
  return new Response(JSON.stringify({ ok: false, error: { code, message } }), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      // RFC 6750: advertise the Bearer challenge.
      "www-authenticate": `Bearer realm="jasons-insurance", error="${error}"`,
    },
  });
}

export async function requireUser(
  request: Request,
  requiredScope?: string,
): Promise<{ user: SessionUser; scope: string } | { response: Response }> {
  const resolved = await currentUserWithScope(request);
  if (!resolved)
    return {
      response: bearerChallenge(401, "unauthorized", "You must be signed in to do this.", "invalid_token"),
    };
  if (requiredScope && !resolved.scope.split(" ").includes(requiredScope))
    return {
      response: bearerChallenge(
        403,
        "insufficient_scope",
        `This action requires the "${requiredScope}" scope; the token only has "${resolved.scope}".`,
        "insufficient_scope",
      ),
    };
  return resolved;
}
