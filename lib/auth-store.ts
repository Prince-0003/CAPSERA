import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type AccountRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const authStorePath = path.join(process.cwd(), "data", "accounts.json");

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

async function ensureStore() {
  await fs.mkdir(path.dirname(authStorePath), { recursive: true });
  try {
    await fs.access(authStorePath);
  } catch {
    await fs.writeFile(authStorePath, "[]", "utf8");
  }
}

export async function readAccounts(): Promise<AccountRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(authStorePath, "utf8");
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as AccountRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeAccounts(accounts: AccountRecord[]) {
  await ensureStore();
  await fs.writeFile(authStorePath, JSON.stringify(accounts, null, 2), "utf8");
}

export async function createAccount(name: string, email: string, password: string) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await readAccounts();
  const existing = accounts.find((account) => account.email === normalizedEmail);
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const record: AccountRecord = {
    id: randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  accounts.push(record);
  await writeAccounts(accounts);

  return {
    id: record.id,
    name: record.name,
    email: record.email,
  };
}

export async function authenticateAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await readAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);
  if (!account) return null;

  const matches = hashPassword(password) === account.passwordHash;
  if (!matches) return null;

  return {
    id: account.id,
    name: account.name,
    email: account.email,
  };
}
