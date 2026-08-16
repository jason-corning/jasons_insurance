// Server-only auth core: password hashing (PBKDF2 via Web Crypto), session
// tokens in Postgres, and cookie helpers. Sessions ride an httpOnly cookie.
import { db, type Db } from "./db.server";

const SESSION_COOKIE = "ji_session";
const SESSION_TTL_DAYS = 14;
const PBKDF2_ITERATIONS = 100_000;

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

export async function createSession(userId: number): Promise<{ token: string; cookie: string }> {
  const db = requireDb();
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await db
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?1, ?2, ?3)")
    .bind(token, userId, expires.toISOString())
    .run();
  const cookie = `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_DAYS * 86_400}`;
  return { token, cookie };
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return rest.join("=") || null;
  }
  return null;
}

export async function destroySession(request: Request): Promise<void> {
  const token = readSessionToken(request);
  if (!token) return;
  await requireDb().prepare("DELETE FROM sessions WHERE token = ?1").bind(token).run();
}

export async function currentUser(request: Request): Promise<SessionUser | null> {
  const token = readSessionToken(request);
  if (!token) return null;
  const db = requireDb();
  const row = await db
    .prepare(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.date_of_birth, u.phone,
              u.address_street, u.address_city, u.address_state, u.address_zip,
              u.pref_email, u.pref_sms, u.pref_mail, u.pref_paperless, u.created_at,
              s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token = ?1`,
    )
    .bind(token)
    .first<SessionUser & { expires_at: string }>();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.prepare("DELETE FROM sessions WHERE token = ?1").bind(token).run();
    return null;
  }
  const { expires_at: _expires, ...user } = row;
  return user as SessionUser;
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

export function json(data: unknown, init: number | ResponseInit = 200): Response {
  const base: ResponseInit = typeof init === "number" ? { status: init } : init;
  return new Response(JSON.stringify(data), {
    ...base,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...(base.headers ?? {}) },
  });
}

export function errorJson(status: number, code: string, message: string): Response {
  return json({ ok: false, error: { code, message } }, status);
}

export async function requireUser(request: Request): Promise<{ user: SessionUser } | { response: Response }> {
  const user = await currentUser(request);
  if (!user) return { response: errorJson(401, "unauthorized", "You must be signed in to do this.") };
  return { user };
}
