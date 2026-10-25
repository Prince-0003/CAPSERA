import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

/*
 * Local, file-based account and session store (data/*.json, git-ignored). It works for a single
 * Node server; a deployed site needs a real database or auth provider in its place.
 */

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export type AccountRecord = {
  id: string;
  name: string;
  email: string;
  /** "scrypt$<salt hex>$<hash hex>", or a legacy unsalted SHA-256 hex digest that is upgraded on next sign-in. */
  passwordHash: string;
  createdAt: string;
};

type SessionRecord = {
  /** SHA-256 of the session token; the token itself only lives in the user's HttpOnly cookie. */
  tokenHash: string;
  accountId: string;
  expiresAt: string;
};

export type PublicAccount = { id: string; name: string; email: string; createdAt: string };

const dataDir = path.join(process.cwd(), "data");
const accountsPath = path.join(dataDir, "accounts.json");
const sessionsPath = path.join(dataDir, "sessions.json");
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const TRANSIENT_FS_ERRORS = new Set(["EPERM", "EBUSY", "EACCES"]);
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  await fs.mkdir(dataDir, { recursive: true });
  for (let attempt = 0; ; attempt++) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed: unknown = raw.trim() ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") return [];
      // Windows can briefly lock the file while another request replaces it.
      if (code && TRANSIENT_FS_ERRORS.has(code) && attempt < 8) {
        await pause(25 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
}

async function writeJsonArray(filePath: string, records: unknown[]) {
  await fs.mkdir(dataDir, { recursive: true });
  // Write then rename so a crash mid-write can't leave a truncated file.
  const tempPath = `${filePath}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(records, null, 2), "utf8");
  // Windows refuses to replace a file another request is reading at that instant; retry briefly.
  for (let attempt = 0; ; attempt++) {
    try {
      await fs.rename(tempPath, filePath);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (attempt >= 8 || !code || !TRANSIENT_FS_ERRORS.has(code)) {
        await fs.rm(tempPath, { force: true });
        throw error;
      }
      await pause(25 * (attempt + 1));
    }
  }
}

// Serialises read-modify-write changes within this server process so concurrent requests don't drop each other's updates.
let storeQueue: Promise<unknown> = Promise.resolve();
function withStoreLock<T>(task: () => Promise<T>): Promise<T> {
  const run = storeQueue.then(task, task);
  storeQueue = run.catch(() => undefined);
  return run;
}

const readAccounts = () => readJsonArray<AccountRecord>(accountsPath);
const writeAccounts = (accounts: AccountRecord[]) => writeJsonArray(accountsPath, accounts);

function toPublic(account: AccountRecord): PublicAccount {
  return { id: account.id, name: account.name, email: account.email, createdAt: account.createdAt };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** Returns whether the password matches, and whether the stored hash should be upgraded. */
async function verifyPassword(password: string, stored: string): Promise<{ ok: boolean; needsUpgrade: boolean }> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme === "scrypt" && saltHex && hashHex) {
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
    return { ok: actual.length === expected.length && timingSafeEqual(actual, expected), needsUpgrade: false };
  }
  if (/^[0-9a-f]{64}$/.test(stored)) {
    const legacy = createHash("sha256").update(password).digest();
    return { ok: timingSafeEqual(legacy, Buffer.from(stored, "hex")), needsUpgrade: true };
  }
  return { ok: false, needsUpgrade: false };
}

export async function createAccount(name: string, email: string, password: string): Promise<PublicAccount> {
  const passwordHash = await hashPassword(password);
  return withStoreLock(async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = await readAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error("An account with that email already exists.");
    }
    const record: AccountRecord = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    accounts.push(record);
    await writeAccounts(accounts);
    return toPublic(record);
  });
}

export async function authenticateAccount(email: string, password: string): Promise<PublicAccount | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await readAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);
  if (!account) return null;
  const { ok, needsUpgrade } = await verifyPassword(password, account.passwordHash);
  if (!ok) return null;
  if (needsUpgrade) {
    const upgraded = await hashPassword(password);
    await withStoreLock(async () => {
      const latest = await readAccounts();
      const record = latest.find((item) => item.id === account.id);
      if (record) {
        record.passwordHash = upgraded;
        await writeAccounts(latest);
      }
    });
  }
  return toPublic(account);
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(accountId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await withStoreLock(async () => {
    const now = Date.now();
    const sessions = (await readJsonArray<SessionRecord>(sessionsPath)).filter((session) => Date.parse(session.expiresAt) > now);
    sessions.push({ tokenHash: hashToken(token), accountId, expiresAt: new Date(now + SESSION_MAX_AGE_SECONDS * 1000).toISOString() });
    await writeJsonArray(sessionsPath, sessions);
  });
  return token;
}

export async function getAccountForSession(token: string | undefined): Promise<PublicAccount | null> {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = (await readJsonArray<SessionRecord>(sessionsPath)).find((item) => item.tokenHash === tokenHash);
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
  const account = (await readAccounts()).find((item) => item.id === session.accountId);
  return account ? toPublic(account) : null;
}

export async function deleteSession(token: string | undefined) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await withStoreLock(async () => {
    const sessions = await readJsonArray<SessionRecord>(sessionsPath);
    await writeJsonArray(sessionsPath, sessions.filter((item) => item.tokenHash !== tokenHash));
  });
}
