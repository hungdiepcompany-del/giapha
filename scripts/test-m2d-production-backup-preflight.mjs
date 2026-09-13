import assert from "node:assert/strict";
import { timingSafeEqual } from "node:crypto";

import backupServiceWorker from "../services/backup-service/src/index.ts";
import {
  PRODUCTION_BACKUP_MAX_PLAINTEXT_BYTES,
  canonicalBase64To32Bytes,
  createCanonicalProductionBackupAadPreimage,
  deriveOpaqueProductionObjectKey,
  encryptSingleProductionBackupChunk,
} from "../services/backup-service/src/production-crypto.ts";

const PREFIX = "[m2d:production-preflight]";
const key = btoa(String.fromCharCode(...Array.from({ length: 32 }, (_, index) => index + 1)));
const hmacKey = btoa(String.fromCharCode(...Array.from({ length: 32 }, (_, index) => 255 - index)));
const shortKey = btoa(String.fromCharCode(...Array.from({ length: 31 }, (_, index) => index + 1)));

if (typeof crypto.subtle.timingSafeEqual !== "function") {
  Object.defineProperty(crypto.subtle, "timingSafeEqual", {
    value: (first, second) => timingSafeEqual(Buffer.from(first), Buffer.from(second)),
  });
}

const r2Operations = [];
const markerOnlyBucket = new Proxy({}, {
  get(_target, property) {
    r2Operations.push(String(property));
    throw new Error("marker-only preflight must not use R2");
  },
});

function productionEnv(overrides = {}) {
  return {
    BACKUP_SERVICE_MODE: "production",
    BACKUP_ACTIVE_KEY_VERSION: "v1",
    BACKUP_SERVICE_INTERNAL_TOKEN: "m2d-internal-test-token",
    BACKUP_DATA_KEY_V1_B64: key,
    BACKUP_OBJECT_KEY_HMAC_V1_B64: hmacKey,
    BACKUP_BUCKET: markerOnlyBucket,
    ...overrides,
  };
}

function preflightRequest(token = "m2d-internal-test-token") {
  return new Request("https://private-binding.internal/internal/backup/production-preflight", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ marker: "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_ONLY" }),
  });
}

// M2D production preflight is marker-only: zero R2/data operations are allowed.
const success = await backupServiceWorker.fetch(preflightRequest(), productionEnv());
assert.equal(success.status, 200);
const successPayload = await success.json();
assert.deepEqual({ ...successPayload, requestId: "checked" }, {
  ok: true,
  code: "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_OK",
  message: "Production backup configuration preflight completed.",
  data: {
    marker: "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_ONLY",
    mode: "production",
    r2Binding: "BACKUP_BUCKET",
    activeKeyVersion: "v1",
  },
  requestId: "checked",
});
assert.equal(typeof successPayload.requestId, "string");
assert.equal(r2Operations.length, 0);

const missingKey = await backupServiceWorker.fetch(preflightRequest(), productionEnv({ BACKUP_DATA_KEY_V1_B64: "" }));
assert.equal(missingKey.status, 422);
assert.equal((await missingKey.json()).code, "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_FAILED");

const invalidDataKey = await backupServiceWorker.fetch(preflightRequest(), productionEnv({ BACKUP_DATA_KEY_V1_B64: shortKey }));
assert.equal(invalidDataKey.status, 422);
assert.equal((await invalidDataKey.json()).code, "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_FAILED");

const noncanonicalDataKey = await backupServiceWorker.fetch(preflightRequest(), productionEnv({ BACKUP_DATA_KEY_V1_B64: key.slice(0, -1) }));
assert.equal(noncanonicalDataKey.status, 422);
assert.equal((await noncanonicalDataKey.json()).code, "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_FAILED");

const invalidObjectKey = await backupServiceWorker.fetch(preflightRequest(), productionEnv({ BACKUP_OBJECT_KEY_HMAC_V1_B64: shortKey }));
assert.equal(invalidObjectKey.status, 422);
assert.equal((await invalidObjectKey.json()).code, "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_FAILED");

const noncanonicalObjectKey = await backupServiceWorker.fetch(preflightRequest(), productionEnv({ BACKUP_OBJECT_KEY_HMAC_V1_B64: hmacKey.slice(0, -1) }));
assert.equal(noncanonicalObjectKey.status, 422);
assert.equal((await noncanonicalObjectKey.json()).code, "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_FAILED");

const unauthenticated = await backupServiceWorker.fetch(preflightRequest("wrong-token"), productionEnv());
assert.equal(unauthenticated.status, 401);
assert.equal(r2Operations.length, 0);

assert.equal(canonicalBase64To32Bytes(key, "invalid").byteLength, 32);
assert.throws(() => canonicalBase64To32Bytes(key.slice(0, -1), "invalid"), /invalid/);
assert.throws(() => canonicalBase64To32Bytes(`${key.slice(0, -1)}A`, "invalid"), /invalid/);
assert.equal(new TextDecoder().decode(createCanonicalProductionBackupAadPreimage("opaque-operation", 0, 1)), "{\"protocolVersion\":\"M2D_PRODUCTION_BACKUP_V1\",\"dataKeyVersion\":\"v1\",\"opaqueOperationId\":\"opaque-operation\",\"chunkIndex\":0,\"totalChunks\":1}");
assert.throws(() => createCanonicalProductionBackupAadPreimage("opaque-operation", 1, 1), /PRODUCTION_SINGLE_CHUNK_REQUIRED/);

const plaintext = new TextEncoder().encode("single sequential production chunk");
const encryptedOne = await encryptSingleProductionBackupChunk(plaintext, key, "opaque-operation");
const encryptedTwo = await encryptSingleProductionBackupChunk(plaintext, key, "opaque-operation");
assert.equal(encryptedOne.iv.byteLength, 12);
assert.notDeepEqual(encryptedOne.iv, encryptedTwo.iv);
assert.ok(encryptedOne.ciphertext.byteLength > plaintext.byteLength);
await assert.rejects(() => encryptSingleProductionBackupChunk(new Uint8Array(PRODUCTION_BACKUP_MAX_PLAINTEXT_BYTES + 1), key, "opaque-operation"), /PRODUCTION_CHUNK_OVERSIZE/);
await assert.rejects(() => encryptSingleProductionBackupChunk(plaintext, key, "opaque-operation", 1, 1), /PRODUCTION_SINGLE_CHUNK_REQUIRED/);
assert.match(await deriveOpaqueProductionObjectKey(hmacKey, "opaque-operation"), /^[a-f0-9]{64}$/);

// Fixture isolation: M2A remains fixture-local and does not satisfy production mode.
const fixtureIsolation = await backupServiceWorker.fetch(preflightRequest(), productionEnv({ BACKUP_SERVICE_MODE: "fixture-local" }));
assert.equal(fixtureIsolation.status, 422);
assert.equal(r2Operations.length, 0);

console.log(`${PREFIX} M2D production preflight marker-only zero R2/data: PASS`);
console.log(`${PREFIX} strict data/HMAC keys, fresh IV, canonical AAD, single 8MiB chunk: PASS`);
console.log(`${PREFIX} fixture isolation and authenticated fail-closed behavior: PASS`);
console.log(`${PREFIX} Result: PASS`);
