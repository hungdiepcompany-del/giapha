import assert from "node:assert/strict";
import { createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import backupServiceWorker from "../services/backup-service/src/index.ts";
import {
  ALLOWED_FIXTURE_SHA256,
  createFixtureArtifact,
  fixtureRoundTrip,
  recoverFixtureArtifact,
  validateFixtureText,
} from "../services/backup-service/src/recoverability.ts";

const PREFIX = "[m2a:private-r2-recoverability]";
const fixture = await readFile(new URL("../fixtures/backup/sample-family.fixture.json", import.meta.url), "utf8");
const fixtureSha256 = createHash("sha256").update(fixture).digest("hex");
const key = btoa(String.fromCharCode(...Array.from({ length: 32 }, (_, index) => index + 1)));
const wrongKey = btoa(String.fromCharCode(...Array.from({ length: 32 }, (_, index) => 255 - index)));

if (typeof crypto.subtle.timingSafeEqual !== "function") {
  Object.defineProperty(crypto.subtle, "timingSafeEqual", {
    value: (first, second) => timingSafeEqual(Buffer.from(first), Buffer.from(second)),
  });
}

class InMemoryR2Bucket {
  entries = new Map();
  putCount = 0;
  getCount = 0;
  getBarrier = null;

  async put(keyName, value, options) {
    this.putCount += 1;
    this.entries.set(keyName, { value: String(value), options });
  }

  async get(keyName) {
    this.getCount += 1;
    if (this.getBarrier) {
      if (this.getCount === this.getBarrier.expected) this.getBarrier.release();
      await this.getBarrier.ready;
    }
    const entry = this.entries.get(keyName);
    if (!entry) return null;
    return {
      size: new TextEncoder().encode(entry.value).byteLength,
      customMetadata: entry.options.customMetadata,
      text: async () => entry.value,
    };
  }

  waitForGets(expected) {
    let release;
    const ready = new Promise((resolve) => {
      release = resolve;
    });
    this.getBarrier = { expected, ready, release };
  }
}

async function rejects(label, operation) {
  await assert.rejects(operation, Error, label);
}

assert.equal(fixtureSha256, "cd811bce7d5732f478e01ce40650fd01cbd4c78f220b74d3b611a5dba9de6786");
assert.deepEqual(ALLOWED_FIXTURE_SHA256, [fixtureSha256]);

const bucket = new InMemoryR2Bucket();
const happy = await fixtureRoundTrip(bucket, key, fixture);
assert.equal(happy.plaintext_sha256, fixtureSha256);
assert.equal(bucket.putCount, 1);
assert.equal(bucket.getCount, 1);
const [happyObjectKey] = bucket.entries.keys();
assert.match(happyObjectKey, /^m2a-private-r2-recoverability\/[a-f0-9]{64}\.fixture\.json$/);
const stored = bucket.entries.get(happyObjectKey);
assert.equal(stored.options.sha256, happy.artifact_sha256);
assert.equal(stored.options.customMetadata.m2a_plaintext_sha256, fixtureSha256);
assert.equal(stored.options.customMetadata.m2a_artifact_format, "M2A_PRIVATE_R2_RECOVERABILITY_V1");

const concurrentBucket = new InMemoryR2Bucket();
concurrentBucket.waitForGets(2);
const concurrentResults = await Promise.all([
  fixtureRoundTrip(concurrentBucket, key, fixture),
  fixtureRoundTrip(concurrentBucket, key, fixture),
]);
assert.equal(concurrentResults.length, 2);
assert.equal(concurrentBucket.entries.size, 2);
assert.equal(new Set(concurrentResults.map((result) => result.artifact_sha256)).size, 2);
for (const objectKey of concurrentBucket.entries.keys()) {
  assert.match(objectKey, /^m2a-private-r2-recoverability\/[a-f0-9]{64}\.fixture\.json$/);
}

function fixtureEnv(mode, workerBucket) {
  return {
    BACKUP_SERVICE_MODE: mode,
    BACKUP_SERVICE_INTERNAL_TOKEN: "fixture-test-internal-token",
    BACKUP_ENCRYPTION_KEY_B64: key,
    BACKUP_BUCKET: workerBucket,
  };
}

async function fixtureRoute(env, token, body) {
  return backupServiceWorker.fetch(new Request("https://fixture.local/internal/backup/fixture-roundtrip", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body,
  }), env);
}

const scaffoldWrongAuthBucket = new InMemoryR2Bucket();
const scaffoldWrongAuth = await fixtureRoute(fixtureEnv("scaffold", scaffoldWrongAuthBucket), "wrong-token", fixture);
assert.equal(scaffoldWrongAuth.status, 401);
assert.equal(scaffoldWrongAuthBucket.putCount, 0);

const scaffoldValidAuthBucket = new InMemoryR2Bucket();
const scaffoldValidAuth = await fixtureRoute(fixtureEnv("scaffold", scaffoldValidAuthBucket), "fixture-test-internal-token", fixture);
assert.equal(scaffoldValidAuth.status, 403);
assert.equal(scaffoldValidAuthBucket.putCount, 0);

const fixtureRouteBucket = new InMemoryR2Bucket();
const fixtureRouteSuccess = await fixtureRoute(fixtureEnv("fixture-local", fixtureRouteBucket), "fixture-test-internal-token", fixture);
assert.equal(fixtureRouteSuccess.status, 200);
assert.equal((await fixtureRouteSuccess.json()).data.plaintext_sha256, fixtureSha256);
assert.equal(fixtureRouteBucket.putCount, 1);

const oversizeRouteBucket = new InMemoryR2Bucket();
const oversizeRoute = await fixtureRoute(fixtureEnv("fixture-local", oversizeRouteBucket), "fixture-test-internal-token", "x".repeat(8 * 1024 + 1));
assert.equal(oversizeRoute.status, 422);
assert.equal(oversizeRouteBucket.putCount, 0);

const created = await createFixtureArtifact(fixture, key);
await rejects("wrong key", () => recoverFixtureArtifact(created.artifact, wrongKey));

const tamperedCiphertext = JSON.parse(created.artifact);
tamperedCiphertext.ciphertext_b64 = `${tamperedCiphertext.ciphertext_b64.slice(0, -2)}AA`;
await rejects("tampered ciphertext", () => recoverFixtureArtifact(JSON.stringify(tamperedCiphertext), key));

const tamperedManifest = JSON.parse(created.artifact);
tamperedManifest.manifest.environment = "not-fixture";
await rejects("tampered manifest", () => recoverFixtureArtifact(JSON.stringify(tamperedManifest), key));

const tamperedChecksum = JSON.parse(created.artifact);
tamperedChecksum.manifest.plaintext_sha256 = "0".repeat(64);
await rejects("tampered checksum", () => recoverFixtureArtifact(JSON.stringify(tamperedChecksum), key));

const wrongMarker = JSON.parse(fixture);
wrongMarker.metadata.fixture_marker = "NOT_A_FIXTURE";
await rejects("wrong marker", () => validateFixtureText(`${JSON.stringify(wrongMarker, null, 2)}\n`));

const wrongFlags = JSON.parse(fixture);
wrongFlags.metadata.contains_real_data = true;
await rejects("wrong fixture flags", () => validateFixtureText(`${JSON.stringify(wrongFlags, null, 2)}\n`));

await rejects("oversize fixture", () => validateFixtureText("x".repeat(8 * 1024 + 1)));

console.log(`${PREFIX} exact fixture allowlist: PASS`);
console.log(`${PREFIX} in-memory R2 roundtrip: PASS`);
console.log(`${PREFIX} concurrent artifact-derived keys: PASS`);
console.log(`${PREFIX} Worker auth/mode/request-bound runtime: PASS`);
console.log(`${PREFIX} wrong key/tamper/nonfixture/oversize failures: PASS`);
console.log(`${PREFIX} Result: PASS`);
