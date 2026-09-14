#!/usr/bin/env node
const fs = require("node:fs");

const SHA = /^[a-f0-9]{40}$/;
const WORKER_TAG = "workers/tag";
const fail = (message) => { throw new Error(message); };
const json = (value, label) => {
  try { return typeof value === "string" ? JSON.parse(value) : value; }
  catch { fail(`${label} must be JSON`); }
};
const list = (value, label) => {
  const parsed = json(value, label);
  const entries = Array.isArray(parsed) ? parsed : (parsed?.items || parsed?.result);
  if (!Array.isArray(entries)) fail(`${label} must contain an array`);
  return entries;
};
const versionId = (version) => version?.id || version?.version_id;
const deploymentId = (deployment) => deployment?.id || deployment?.deployment_id;
const routedVersionId = (route) => route?.version_id || route?.id || route?.version?.id;
const workerTag = (version) => version?.annotations?.[WORKER_TAG];

function assertSourceIdentity({ expectedSourceSha, ref, sha }) {
  if (!SHA.test(expectedSourceSha || "")) fail("expected_source_sha must be 40 lowercase hex");
  if (ref !== "refs/heads/main") fail("github.ref must be refs/heads/main");
  if (sha !== expectedSourceSha) fail("github.sha must equal expected_source_sha");
}

function assertPrivateConfig(value) {
  const config = json(value, "config");
  const production = config?.env?.production;
  const check = (entry, label, requireBucket) => {
    if (!entry || entry.workers_dev !== false || entry.preview_urls !== false) fail(`${label} must disable workers_dev and preview_urls`);
    for (const key of ["route", "routes", "domain", "domains", "triggers", "crons"]) {
      if (Object.hasOwn(entry, key)) fail(`${label} public configuration forbidden`);
    }
    if (requireBucket) {
      const buckets = entry.r2_buckets;
      if (!Array.isArray(buckets) || buckets.length !== 1 || buckets[0].binding !== "BACKUP_BUCKET" || buckets[0].bucket_name !== "gia-pha-prod-backups-apac-v1") {
        fail(`${label} exact R2 bucket required`);
      }
    }
  };
  if (config?.name !== "web-gia-pha-backup-service") fail("top-level worker name drift");
  check(config, "top-level", false);
  check(production, "production", true);
  if (production.name && production.name !== "web-gia-pha-backup-service-production") fail("production worker name drift");
  if (`${config.name}-production` !== "web-gia-pha-backup-service-production") fail("production name resolution drift");
}

function assertBucket(value) {
  if (json(value, "bucket").name !== "gia-pha-prod-backups-apac-v1") fail("wrong bucket");
}

function exactErrorCodePayload(value) {
  if (value?.code === 10007 && !Array.isArray(value?.errors)) return true;
  const errors = value?.errors;
  return Array.isArray(errors) && errors.length === 1 && errors[0]?.code === 10007;
}

function isExact10007(value) {
  if (typeof value !== "string") return exactErrorCodePayload(value);
  try { return exactErrorCodePayload(JSON.parse(value)); } catch { /* Wrangler writes human error text. */ }
  const codes = [...value.matchAll(/\[code:\s*([0-9]+)\]/g)].map((match) => match[1]);
  return codes.length === 1 && codes[0] === "10007";
}

function assertVersion(value, id, tag) {
  const matches = list(value, "versions").filter((version) => versionId(version) === id && workerTag(version) === tag);
  if (matches.length !== 1) fail("exact version id/workers-tag missing");
}

function assertTargetVersion(value, id) {
  const matches = list(value, "versions").filter((version) => versionId(version) === id);
  if (matches.length !== 1) fail("exact target version missing");
}

function assertDeployment(value, id, version) {
  const deployment = list(value, "deployments").find((entry) => deploymentId(entry) === id);
  const routes = deployment?.versions;
  if (!deployment || !Array.isArray(routes) || routes.length !== 1 || routes[0].percentage !== 100 || routedVersionId(routes[0]) !== version) {
    fail("exact 100 percent deployment missing");
  }
}

const routing = (value) => list(value, "deployments").map((deployment) => ({
  id: deploymentId(deployment),
  versions: (deployment.versions || []).map((route) => ({ id: routedVersionId(route), percentage: route.percentage })).sort((a, b) => String(a.id).localeCompare(String(b.id))),
})).sort((a, b) => String(a.id).localeCompare(String(b.id)));

function assertRoutingEqual(before, after) {
  if (JSON.stringify(routing(before)) !== JSON.stringify(routing(after))) fail("routing drift");
}

function normalizeMainSnapshot(value) {
  const snapshot = json(value, "main snapshot");
  for (const key of ["deployments", "versions", "activeDeploymentId", "activeVersionId", "versionView"]) {
    if (!(key in snapshot)) fail("main snapshot incomplete");
  }
  assertDeployment(snapshot.deployments, snapshot.activeDeploymentId, snapshot.activeVersionId);
  assertTargetVersion(snapshot.versions, snapshot.activeVersionId);
  const versionView = json(snapshot.versionView, "main active version view");
  if (versionId(versionView) && versionId(versionView) !== snapshot.activeVersionId) fail("main active version view identity drift");
  return JSON.stringify({
    routing: routing(snapshot.deployments),
    versions: list(snapshot.versions, "versions").map((version) => [versionId(version), workerTag(version)]).sort(),
    activeDeploymentId: snapshot.activeDeploymentId,
    activeVersionId: snapshot.activeVersionId,
    versionView,
  });
}

function assertMainUnchanged(before, after) {
  if (normalizeMainSnapshot(before) !== normalizeMainSnapshot(after)) fail("main deployment/version/remote-binding drift");
}

function run([command, ...args]) {
  if (command === "source") assertSourceIdentity({ expectedSourceSha: args[0], ref: args[1], sha: args[2] });
  else if (command === "config") assertPrivateConfig(fs.readFileSync(args[0], "utf8"));
  else if (command === "bucket") assertBucket(fs.readFileSync(args[0], "utf8"));
  else if (command === "absence") { if (!isExact10007(fs.readFileSync(args[0], "utf8"))) fail("only exact 10007 absence accepted"); }
  else if (command === "version") assertVersion(fs.readFileSync(args[0], "utf8"), args[1], args[2]);
  else if (command === "target-version") assertTargetVersion(fs.readFileSync(args[0], "utf8"), args[1]);
  else if (command === "deployment") assertDeployment(fs.readFileSync(args[0], "utf8"), args[1], args[2]);
  else if (command === "routing") assertRoutingEqual(fs.readFileSync(args[0], "utf8"), fs.readFileSync(args[1], "utf8"));
  else if (command === "main") assertMainUnchanged(fs.readFileSync(args[0], "utf8"), fs.readFileSync(args[1], "utf8"));
  else fail("unknown command");
  console.log("M2F evidence PASS");
}

if (require.main === module) {
  try { run(process.argv.slice(2)); }
  catch (error) { console.error(`M2F evidence FAIL: ${error.message}`); process.exit(1); }
}

module.exports = { assertSourceIdentity, assertPrivateConfig, assertBucket, isExact10007, assertVersion, assertTargetVersion, assertDeployment, assertRoutingEqual, assertMainUnchanged };
