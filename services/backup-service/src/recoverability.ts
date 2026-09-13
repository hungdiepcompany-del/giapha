export const SAMPLE_FIXTURE_ONLY = "SAMPLE_FIXTURE_ONLY";
export const ALLOWED_FIXTURE_SHA256 = [
  "cd811bce7d5732f478e01ce40650fd01cbd4c78f220b74d3b611a5dba9de6786",
] as const;

const MAX_FIXTURE_BYTES = 8 * 1024;
const MAX_ARTIFACT_BYTES = 24 * 1024;
const AES_GCM_IV_BYTES = 12;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type RecoverabilityManifest = {
  artifact_format: "M2A_PRIVATE_R2_RECOVERABILITY_V1";
  checksum_algorithm: "sha256";
  ciphertext_sha256: string;
  contains_real_data: false;
  contains_secret: false;
  encryption: "AES-256-GCM";
  environment: "fixture";
  fixture_marker: typeof SAMPLE_FIXTURE_ONLY;
  iv_b64: string;
  plaintext_sha256: string;
};

type StoredArtifact = {
  ciphertext_b64: string;
  manifest: RecoverabilityManifest;
};

export type RecoverabilityResult = {
  artifact_sha256: string;
  ciphertext_sha256: string;
  people_count: number;
  plaintext_sha256: string;
  relationship_count: number;
};

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

async function sha256(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  return toHex(await crypto.subtle.digest("SHA-256", toArrayBuffer(bytes)));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  try {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new Error("RECOVERABILITY_INVALID_BASE64");
  }
}

async function importEncryptionKey(keyB64: string): Promise<CryptoKey> {
  const keyBytes = base64ToBytes(keyB64);
  assert(keyBytes.byteLength === 32, "RECOVERABILITY_KEY_MUST_BE_AES_256");
  return crypto.subtle.importKey("raw", toArrayBuffer(keyBytes), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export function fixtureCounts(payload: unknown): Pick<RecoverabilityResult, "people_count" | "relationship_count"> {
  const record = payload as Record<string, unknown>;
  const people = record.people;
  const parents = record.family_parents;
  const children = record.family_children;
  assert(Array.isArray(people) && Array.isArray(parents) && Array.isArray(children), "RECOVERABILITY_FIXTURE_SHAPE_INVALID");
  return { people_count: people.length, relationship_count: parents.length + children.length };
}

export async function validateFixtureText(plaintext: string): Promise<Pick<RecoverabilityResult, "people_count" | "relationship_count" | "plaintext_sha256">> {
  const bytes = encoder.encode(plaintext);
  assert(bytes.byteLength > 0 && bytes.byteLength <= MAX_FIXTURE_BYTES, "RECOVERABILITY_FIXTURE_OVERSIZE");
  const digest = await sha256(bytes);
  assert(ALLOWED_FIXTURE_SHA256.includes(digest as (typeof ALLOWED_FIXTURE_SHA256)[number]), "RECOVERABILITY_FIXTURE_SHA256_NOT_ALLOWLISTED");
  let payload: unknown;
  try {
    payload = JSON.parse(plaintext);
  } catch {
    throw new Error("RECOVERABILITY_FIXTURE_JSON_INVALID");
  }
  const metadata = (payload as { metadata?: Record<string, unknown> }).metadata;
  assert(metadata?.environment === "fixture", "RECOVERABILITY_FIXTURE_ENVIRONMENT_INVALID");
  assert(metadata?.fixture_marker === SAMPLE_FIXTURE_ONLY, "RECOVERABILITY_FIXTURE_MARKER_INVALID");
  assert(metadata?.contains_real_data === false, "RECOVERABILITY_FIXTURE_REAL_DATA_FORBIDDEN");
  assert(metadata?.contains_secret === false, "RECOVERABILITY_FIXTURE_SECRET_FORBIDDEN");
  return { ...fixtureCounts(payload), plaintext_sha256: digest };
}

export async function createFixtureArtifact(plaintext: string, keyB64: string): Promise<{ artifact: string; result: RecoverabilityResult }> {
  const fixture = await validateFixtureText(plaintext);
  const key = await importEncryptionKey(keyB64);
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
  const plaintextBytes = encoder.encode(plaintext);
  const provisionalManifest = {
    artifact_format: "M2A_PRIVATE_R2_RECOVERABILITY_V1" as const,
    checksum_algorithm: "sha256" as const,
    contains_real_data: false as const,
    contains_secret: false as const,
    encryption: "AES-256-GCM" as const,
    environment: "fixture" as const,
    fixture_marker: SAMPLE_FIXTURE_ONLY as typeof SAMPLE_FIXTURE_ONLY,
    iv_b64: bytesToBase64(iv),
    plaintext_sha256: fixture.plaintext_sha256,
  };
  const aad = encoder.encode(stableJson(provisionalManifest));
  const ciphertextBytes = new Uint8Array(await crypto.subtle.encrypt({
    name: "AES-GCM",
    iv: toArrayBuffer(iv),
    additionalData: toArrayBuffer(aad),
  }, key, toArrayBuffer(plaintextBytes)));
  assert(ciphertextBytes.byteLength <= MAX_ARTIFACT_BYTES, "RECOVERABILITY_ARTIFACT_OVERSIZE");
  const manifest: RecoverabilityManifest = { ...provisionalManifest, ciphertext_sha256: await sha256(ciphertextBytes) };
  const artifact = stableJson({ ciphertext_b64: bytesToBase64(ciphertextBytes), manifest } satisfies StoredArtifact);
  assert(encoder.encode(artifact).byteLength <= MAX_ARTIFACT_BYTES, "RECOVERABILITY_ARTIFACT_OVERSIZE");
  return {
    artifact,
    result: {
      artifact_sha256: await sha256(artifact),
      ciphertext_sha256: manifest.ciphertext_sha256,
      plaintext_sha256: fixture.plaintext_sha256,
      ...fixtureCounts(JSON.parse(plaintext)),
    },
  };
}

export async function recoverFixtureArtifact(artifact: string, keyB64: string): Promise<RecoverabilityResult> {
  assert(encoder.encode(artifact).byteLength > 0 && encoder.encode(artifact).byteLength <= MAX_ARTIFACT_BYTES, "RECOVERABILITY_ARTIFACT_OVERSIZE");
  let stored: StoredArtifact;
  try {
    stored = JSON.parse(artifact) as StoredArtifact;
  } catch {
    throw new Error("RECOVERABILITY_ARTIFACT_JSON_INVALID");
  }
  const manifest = stored.manifest;
  assert(manifest?.artifact_format === "M2A_PRIVATE_R2_RECOVERABILITY_V1", "RECOVERABILITY_MANIFEST_INVALID");
  assert(manifest.checksum_algorithm === "sha256", "RECOVERABILITY_MANIFEST_INVALID");
  assert(manifest.encryption === "AES-256-GCM", "RECOVERABILITY_MANIFEST_INVALID");
  assert(manifest.environment === "fixture" && manifest.fixture_marker === SAMPLE_FIXTURE_ONLY, "RECOVERABILITY_MANIFEST_FIXTURE_INVALID");
  assert(manifest.contains_real_data === false && manifest.contains_secret === false, "RECOVERABILITY_MANIFEST_PRIVACY_INVALID");
  const ciphertext = base64ToBytes(stored.ciphertext_b64);
  assert(await sha256(ciphertext) === manifest.ciphertext_sha256, "RECOVERABILITY_CIPHERTEXT_CHECKSUM_INVALID");
  const aadManifest = {
    artifact_format: manifest.artifact_format,
    checksum_algorithm: manifest.checksum_algorithm,
    contains_real_data: manifest.contains_real_data,
    contains_secret: manifest.contains_secret,
    encryption: manifest.encryption,
    environment: manifest.environment,
    fixture_marker: manifest.fixture_marker,
    iv_b64: manifest.iv_b64,
    plaintext_sha256: manifest.plaintext_sha256,
  };
  const key = await importEncryptionKey(keyB64);
  let plaintext: string;
  try {
    plaintext = decoder.decode(await crypto.subtle.decrypt({
      name: "AES-GCM",
      iv: toArrayBuffer(base64ToBytes(manifest.iv_b64)),
      additionalData: toArrayBuffer(encoder.encode(stableJson(aadManifest))),
    }, key, toArrayBuffer(ciphertext)));
  } catch {
    throw new Error("RECOVERABILITY_DECRYPTION_FAILED");
  }
  const fixture = await validateFixtureText(plaintext);
  assert(fixture.plaintext_sha256 === manifest.plaintext_sha256, "RECOVERABILITY_PLAINTEXT_CHECKSUM_INVALID");
  return { artifact_sha256: await sha256(artifact), ciphertext_sha256: manifest.ciphertext_sha256, ...fixture };
}

export async function fixtureRoundTrip(bucket: R2Bucket, keyB64: string, plaintext: string): Promise<RecoverabilityResult> {
  const created = await createFixtureArtifact(plaintext, keyB64);
  const objectKey = `m2a-private-r2-recoverability/${created.result.artifact_sha256}.fixture.json`;
  await bucket.put(objectKey, created.artifact, {
    httpMetadata: { contentType: "application/json" },
    sha256: created.result.artifact_sha256,
    customMetadata: {
      m2a_artifact_format: "M2A_PRIVATE_R2_RECOVERABILITY_V1",
      m2a_artifact_sha256: created.result.artifact_sha256,
      m2a_ciphertext_sha256: created.result.ciphertext_sha256,
      m2a_plaintext_sha256: created.result.plaintext_sha256,
    },
  });
  const object = await bucket.get(objectKey);
  assert(object, "RECOVERABILITY_ARTIFACT_NOT_FOUND");
  assert(object.size > 0 && object.size <= MAX_ARTIFACT_BYTES, "RECOVERABILITY_ARTIFACT_OVERSIZE");
  assert(object.customMetadata?.m2a_artifact_format === "M2A_PRIVATE_R2_RECOVERABILITY_V1", "RECOVERABILITY_OBJECT_METADATA_INVALID");
  assert(object.customMetadata?.m2a_artifact_sha256 === created.result.artifact_sha256, "RECOVERABILITY_OBJECT_METADATA_INVALID");
  assert(object.customMetadata?.m2a_ciphertext_sha256 === created.result.ciphertext_sha256, "RECOVERABILITY_OBJECT_METADATA_INVALID");
  assert(object.customMetadata?.m2a_plaintext_sha256 === created.result.plaintext_sha256, "RECOVERABILITY_OBJECT_METADATA_INVALID");
  const recovered = await recoverFixtureArtifact(await object.text(), keyB64);
  assert(recovered.artifact_sha256 === created.result.artifact_sha256, "RECOVERABILITY_ARTIFACT_CHECKSUM_INVALID");
  return recovered;
}
