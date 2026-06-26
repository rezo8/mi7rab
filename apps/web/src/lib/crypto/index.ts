import { entropyToMnemonic, mnemonicToEntropy, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

/**
 * Generate a fresh AES-256-GCM encryption key.
 *
 * Returns a 24-word BIP39 recovery phrase (shown once — user must write it down)
 * and a non-extractable CryptoKey for immediate use. The raw entropy bytes are
 * wiped from memory after import so they exist only in the phrase the user keeps.
 */
export async function generateWritingKey(): Promise<{ phrase: string[]; key: CryptoKey }> {
  const entropy = crypto.getRandomValues(new Uint8Array(32)); // 256 bits
  const phrase = entropyToMnemonic(entropy, wordlist).split(" ");

  // Re-import as non-extractable — exportKey() will throw NotSupportedError after this.
  const key = await crypto.subtle.importKey(
    "raw",
    entropy,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable
    ["encrypt", "decrypt"],
  );

  entropy.fill(0); // best-effort wipe
  return { phrase, key };
}

/**
 * Restore a key from a 24-word recovery phrase.
 * Throws if the phrase is invalid or the checksum doesn't match.
 */
export async function restoreKeyFromPhrase(words: string[]): Promise<CryptoKey> {
  const mnemonic = words.join(" ");
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error("Invalid recovery phrase.");
  }
  const entropy = mnemonicToEntropy(mnemonic, wordlist);
  return crypto.subtle.importKey(
    "raw",
    entropy,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypt a string with AES-256-GCM. Returns base64-encoded ciphertext and IV. */
export async function encryptPage(
  text: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(text);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    ciphertext: toBase64(new Uint8Array(cipherBuffer)),
    iv: toBase64(iv),
  };
}

function toBase64(buf: Uint8Array): string {
  let str = "";
  for (let i = 0; i < buf.length; i++) str += String.fromCharCode(buf[i]!);
  return btoa(str);
}

function fromBase64(str: string): ArrayBuffer {
  const binary = atob(str);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer as ArrayBuffer;
}

/** Decrypt an AES-256-GCM page. Throws if the key is wrong or data is corrupt. */
export async function decryptPage(
  ciphertext: string,
  iv: string,
  key: CryptoKey,
): Promise<string> {
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    key,
    fromBase64(ciphertext),
  );
  return new TextDecoder().decode(plainBuffer);
}
