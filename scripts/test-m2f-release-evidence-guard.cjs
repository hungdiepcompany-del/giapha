const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const YAML = require("yaml");
const guard = require("./m2f-release-evidence-guard.cjs");

const root = path.resolve(__dirname, "..");
const nodePrograms = [];
const collectRuns = (value) => {
  if (Array.isArray(value)) return value.forEach(collectRuns);
  if (!value || typeof value !== "object") return;
  if (typeof value.run === "string") {
    for (const match of value.run.matchAll(/node -e "([^"]*)"|node -e '([^']*)'/g)) {
      nodePrograms.push(match[1] || match[2]);
    }
  }
  Object.values(value).forEach(collectRuns);
};
for (const workflow of [".github/workflows/backup-service-deploy.yml", ".github/workflows/cloudflare-deploy.yml"]) {
  collectRuns(YAML.parse(fs.readFileSync(path.join(root, workflow), "utf8")));
}
assert.ok(nodePrograms.length >= 14, "all embedded workflow node programs discovered");
for (const program of nodePrograms) assert.doesNotThrow(() => new vm.Script(program), `inline node program parses: ${program}`);

const runSnapshotProgram = (name) => {
  const program = nodePrograms.find((candidate) => candidate.includes(`writeFileSync('${name}.json'`));
  assert.ok(program, `${name} snapshot program present`);
  const current = { id: "d", versions: [{ version_id: "v", percentage: 100 }] };
  const input = {
    [`main-deployments-${name === "main-before" ? "before" : "after"}.json`]: JSON.stringify(current),
    [`main-versions-${name === "main-before" ? "before" : "after"}.json`]: JSON.stringify(name === "main-before" ? { result: [{ id: "v", annotations: { "workers/tag": sha } }] } : [{ id: "v", annotations: { "workers/tag": sha } }]),
    [`main-version-${name === "main-before" ? "before" : "after"}.json`]: JSON.stringify({ id: "v", bindings: [] }),
  };
  let output = "";
  new vm.Script(program).runInNewContext({
    require: (module) => { assert.equal(module, "node:fs"); return { readFileSync: (file) => input[file], writeFileSync: (file, value) => { assert.equal(file, `${name}.json`); output = value; } }; },
    process: { argv: ["node", "d", "v"], exit: () => { throw new Error("snapshot unexpectedly rejected valid current state"); } },
    JSON,
    Array,
  });
  const snapshotOutput = JSON.parse(output);
  assert.equal(snapshotOutput.activeDeploymentId, "d");
  assert.equal(snapshotOutput.activeVersionId, "v");
  assert.equal(snapshotOutput.currentDeployment.id, "d");
  assert.equal(snapshotOutput.currentVersion.id, "v");
};

const sha = "1a07401dec7172f76c3575b4bfc4c0e6a9c03397";
const config = {
  name: "web-gia-pha-backup-service",
  workers_dev: false,
  preview_urls: false,
  env: { production: { workers_dev: false, preview_urls: false, r2_buckets: [{ binding: "BACKUP_BUCKET", bucket_name: "gia-pha-prod-backups-apac-v1" }] } },
};
const versions = [{ id: "v", annotations: { "workers/tag": sha } }];
const currentDeployment = { id: "d", versions: [{ version_id: "v", percentage: 100 }] };
const historicalDeployments = Array.from({ length: 10 }, (_, index) => ({ id: `historical-${index}`, versions: [{ version_id: `historical-version-${index}`, percentage: 100 }] }));
const snapshot = { currentDeployment, currentVersion: versions[0], activeDeploymentId: "d", activeVersionId: "v", versionView: { id: "v", bindings: [{ name: "BACKUP_SERVICE_PRODUCTION", type: "service" }] } };

runSnapshotProgram("main-before");
runSnapshotProgram("main-after");

assert.doesNotThrow(() => guard.assertSourceIdentity({ expectedSourceSha: sha, ref: "refs/heads/main", sha }));
assert.throws(() => guard.assertSourceIdentity({ expectedSourceSha: sha, ref: "refs/heads/x", sha }));
assert.throws(() => guard.assertSourceIdentity({ expectedSourceSha: sha.toUpperCase(), ref: "refs/heads/main", sha }));
assert.doesNotThrow(() => guard.assertPrivateConfig(config));
const publicConfig = structuredClone(config); publicConfig.env.production.routes = ["x"]; assert.throws(() => guard.assertPrivateConfig(publicConfig));
assert.doesNotThrow(() => guard.assertBucket({ name: "gia-pha-prod-backups-apac-v1" }));
assert.equal(guard.isExact10007({ errors: [{ code: 10007 }] }), true);
assert.equal(guard.isExact10007("wrangler: worker absent [code: 10007]"), true);
assert.equal(guard.isExact10007("wrangler: worker absent [code: 10007] then retry [code: 10007]"), false);
assert.equal(guard.isExact10007("wrangler: worker absent [code: 10007] with bucket disabled [code: 10042]"), false);
assert.equal(guard.isExact10007("auth failure"), false);
assert.doesNotThrow(() => guard.assertVersion(versions, "v", sha));
assert.throws(() => guard.assertVersion([{ id: "v", tag: sha }], "v", sha));
assert.doesNotThrow(() => guard.assertTargetVersion(versions, "v"));
assert.throws(() => guard.assertTargetVersion(versions, "missing"));
assert.doesNotThrow(() => guard.assertCurrentDeployment(currentDeployment, "d", "v"));
const validResultWrapper = { result: structuredClone(currentDeployment) };
assert.doesNotThrow(() => guard.assertCurrentDeployment(validResultWrapper, "d", "v"));
const nestedResultWithMalformedOuter = { result: { id: " ", versions: [{ version_id: " ", percentage: 100 }], result: structuredClone(currentDeployment) } };
assert.throws(() => guard.assertCurrentDeployment(nestedResultWithMalformedOuter, " ", " "));
assert.throws(() => guard.assertCurrentDeployment(nestedResultWithMalformedOuter, "d", "v"));
assert.throws(() => guard.assertCurrentDeployment({ id: "d", versions: [{ version_id: "v", percentage: 50 }, { version_id: "x", percentage: 50 }] }, "d", "v"));
assert.throws(() => guard.assertCurrentDeployment(historicalDeployments, "historical-0", "historical-version-0"));
assert.doesNotThrow(() => guard.assertRoutingEqual(currentDeployment, structuredClone(currentDeployment)));
assert.throws(() => guard.assertRoutingEqual(currentDeployment, historicalDeployments));
const weightedRouting = { id: "weighted", versions: [{ version_id: "v2", percentage: 25 }, { version_id: "v1", percentage: 75 }] };
assert.doesNotThrow(() => guard.assertRoutingEqual(weightedRouting, structuredClone(weightedRouting)));
const changedTraffic = structuredClone(weightedRouting); changedTraffic.versions[0].percentage = 30; changedTraffic.versions[1].percentage = 70;
assert.throws(() => guard.assertRoutingEqual(weightedRouting, changedTraffic));
const invalidRoutingFixtures = [
  ["missing deployment id", { versions: [{ version_id: "v", percentage: 100 }] }],
  ["blank deployment id", { id: " ", versions: [{ version_id: "v", percentage: 100 }] }],
  ["missing routes", { id: "d" }],
  ["empty routes", { id: "d", versions: [] }],
  ["missing version id", { id: "d", versions: [{ percentage: 100 }] }],
  ["blank version id", { id: "d", versions: [{ version_id: " ", percentage: 100 }] }],
  ["duplicate version ids", { id: "d", versions: [{ version_id: "v", percentage: 50 }, { version_id: "v", percentage: 50 }] }],
  ["invalid percentage", { id: "d", versions: [{ version_id: "v", percentage: "100" }] }],
  ["out of range percentage", { id: "d", versions: [{ version_id: "v", percentage: 101 }] }],
  ["nonfinite percentage", { id: "d", versions: [{ version_id: "v", percentage: NaN }] }],
  ["incomplete percentage total", { id: "d", versions: [{ version_id: "v", percentage: 99 }] }],
];
for (const [label, invalid] of invalidRoutingFixtures) {
  assert.throws(() => guard.assertRoutingEqual(invalid, structuredClone(invalid)), undefined, `equal invalid ${label}`);
  assert.throws(() => guard.assertRoutingEqual(invalid, currentDeployment), undefined, `invalid before ${label}`);
  assert.throws(() => guard.assertRoutingEqual(currentDeployment, invalid), undefined, `invalid after ${label}`);
}
const stalePair = structuredClone(currentDeployment); stalePair.id = "current-d"; stalePair.versions[0].version_id = "current-v";
assert.throws(() => guard.assertCurrentDeployment(stalePair, "d", "v"));
assert.doesNotThrow(() => guard.assertMainUnchanged(snapshot, structuredClone(snapshot)));
const bindingDrift = structuredClone(snapshot); bindingDrift.versionView.bindings[0].name = "WRONG"; assert.throws(() => guard.assertMainUnchanged(snapshot, bindingDrift));
const currentVersionDrift = structuredClone(snapshot); currentVersionDrift.currentVersion.id = "stale-v"; assert.throws(() => guard.assertMainUnchanged(snapshot, currentVersionDrift));
console.log("M2F evidence fixture tests PASS");
