export const PRODUCTION_BACKUP_PROTOCOL_VERSION = "M2D_PRODUCTION_BACKUP_V1" as const;
export const PRODUCTION_BACKUP_DATA_KEY_VERSION = "v1" as const;
export const PRODUCTION_BACKUP_MAX_PLAINTEXT_BYTES = 8 * 1024 * 1024;
export const PRODUCTION_BACKUP_IV_BYTES = 12;

const encoder = new TextEncoder();

export type ProductionBackupAad = {
  protocolVersion: typeof PRODUCTION_BACKUP_PROTOCOL_VERSION;
  dataKeyVersion: typeof PRODUCTION_BACKUP_DATA_KEY_VERSION;
  opaqueOperationId: string;
  chunkIndex: 0;
  totalChunks: 1;
};

export type EncryptedProductionBackupChunk = {
  ciphertext: Uint8Array;
  iv: Uint8Array;
};

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function canonicalBase64To32Bytes(value: string, errorCode: string): Uint8Array {
  assert(typeof value === "string" && /^[A-Za-z0-9+/]{43}=$/.test(value), errorCode);
  let binary: string;
  try {
    binary = atob(value);
  } catch {
    throw new Error(errorCode);
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  assert(bytes.byteLength === 32 && bytesToBase64(bytes) === value, errorCode);
  return bytes;
}

export async function importProductionDataKey(keyB64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(canonicalBase64To32Bytes(keyB64, "PRODUCTION_DATA_KEY_INVALID")),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
}

export async function importProductionObjectKeyHmacKey(keyB64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(canonicalBase64To32Bytes(keyB64, "PRODUCTION_OBJECT_KEY_HMAC_INVALID")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export function createFreshProductionBackupIv(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(PRODUCTION_BACKUP_IV_BYTES));
}

export function createCanonicalProductionBackupAadPreimage(
  opaqueOperationId: string,
  chunkIndex: number,
  totalChunks: number,
): Uint8Array {
  assert(typeof opaqueOperationId === "string" && opaqueOperationId.length > 0, "PRODUCTION_OPERATION_ID_INVALID");
  assert(chunkIndex === 0 && totalChunks === 1, "PRODUCTION_SINGLE_CHUNK_REQUIRED");
  return encoder.encode(JSON.stringify({
    protocolVersion: PRODUCTION_BACKUP_PROTOCOL_VERSION,
    dataKeyVersion: PRODUCTION_BACKUP_DATA_KEY_VERSION,
    opaqueOperationId,
    chunkIndex: 0,
    totalChunks: 1,
  } satisfies ProductionBackupAad));
}

export async function encryptSingleProductionBackupChunk(
  plaintext: Uint8Array,
  dataKeyB64: string,
  opaqueOperationId: string,
  chunkIndex = 0,
  totalChunks = 1,
): Promise<EncryptedProductionBackupChunk> {
  assert(plaintext.byteLength <= PRODUCTION_BACKUP_MAX_PLAINTEXT_BYTES, "PRODUCTION_CHUNK_OVERSIZE");
  const additionalData = createCanonicalProductionBackupAadPreimage(opaqueOperationId, chunkIndex, totalChunks);
  const iv = createFreshProductionBackupIv();
  const key = await importProductionDataKey(dataKeyB64);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({
    name: "AES-GCM",
    iv: toArrayBuffer(iv),
    additionalData: toArrayBuffer(additionalData),
  }, key, toArrayBuffer(plaintext)));
  return { ciphertext, iv };
}

export async function deriveOpaqueProductionObjectKey(
  objectKeyHmacB64: string,
  opaqueOperationId: string,
): Promise<string> {
  assert(typeof opaqueOperationId === "string" && opaqueOperationId.length > 0, "PRODUCTION_OPERATION_ID_INVALID");
  const key = await importProductionObjectKeyHmacKey(objectKeyHmacB64);
  const signature = new Uint8Array(await crypto.subtle.sign(
    "HMAC",
    key,
    toArrayBuffer(encoder.encode(`M2D_OBJECT_KEY_V1|${PRODUCTION_BACKUP_DATA_KEY_VERSION}|${opaqueOperationId}`)),
  ));
  return Array.from(signature, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
