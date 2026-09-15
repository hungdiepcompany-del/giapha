const assert = require("node:assert/strict");
const guard = require("./m2f-release-evidence-guard.cjs");

const sha = "1a07401dec7172f76c3575b4bfc4c0e6a9c03397";
const config = {
  name: "web-gia-pha-backup-service",
  workers_dev: false,
  preview_urls: false,
  env: { production: { workers_dev: false, preview_urls: false, r2_buckets: [{ binding: "BACKUP_BUCKET", bucket_name: "gia-pha-prod-backups-apac-v1" }] } },
};
const versions = [{ id: "v", annotations: { "workers/tag": sha } }];
const deployments = [{ id: "d", versions: [{ version_id: "v", percentage: 100 }] }];
const snapshot = { deployments, versions, activeDeploymentId: "d", activeVersionId: "v", versionView: { id: "v", bindings: [{ name: "BACKUP_SERVICE_PRODUCTION", type: "service" }] } };

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
assert.doesNotThrow(() => guard.assertDeployment(deployments, "d", "v"));
assert.throws(() => guard.assertDeployment([{ id: "d", versions: [{ version_id: "v", percentage: 50 }, { version_id: "x", percentage: 50 }] }], "d", "v"));
assert.doesNotThrow(() => guard.assertRoutingEqual(deployments, structuredClone(deployments)));
assert.throws(() => guard.assertRoutingEqual(deployments, []));
assert.doesNotThrow(() => guard.assertMainUnchanged(snapshot, structuredClone(snapshot)));
const bindingDrift = structuredClone(snapshot); bindingDrift.versionView.bindings[0].name = "WRONG"; assert.throws(() => guard.assertMainUnchanged(snapshot, bindingDrift));
console.log("M2F evidence fixture tests PASS");
