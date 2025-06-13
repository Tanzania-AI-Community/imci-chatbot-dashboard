import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";
import { env } from "@/env.mjs";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For GCM, this is always 16
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Derives a key from the encryption key and salt using SHA-256
 */
function deriveKey(encryptionKey: string, salt: Buffer): Buffer {
  return createHash("sha256")
    .update(encryptionKey + salt.toString("hex"))
    .digest();
}

/**
 * Encrypts an API key for storage
 */
export function encryptApiKey(apiKey: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(env.API_ENCRYPTION_KEY, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: salt:iv:authTag:encrypted
  return [
    salt.toString("hex"),
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted,
  ].join(":");
}

/**
 * Decrypts an API key from storage
 */
export function decryptApiKey(encryptedApiKey: string): string {
  const parts = encryptedApiKey.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted API key format");
  }

  const [saltHex, ivHex, authTagHex, encrypted] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = deriveKey(env.API_ENCRYPTION_KEY, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Validates an API key against the stored encrypted version
 */
export function validateApiKey(
  providedKey: string,
  storedEncryptedKey: string
): boolean {
  try {
    const decryptedKey = decryptApiKey(storedEncryptedKey);
    return providedKey === decryptedKey;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
}

/**
 * Hashes an API key for comparison (alternative method if encryption is not needed)
 */
export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Validates an API key against a hash
 */
export function validateApiKeyHash(
  providedKey: string,
  storedHash: string
): boolean {
  const providedHash = hashApiKey(providedKey);
  return providedHash === storedHash;
}
