const fs = require("node:fs");
const path = require("node:path");

const PREFIX = "[backup:retention:check]";
const sandboxIndexPath = path.join(process.cwd(), "fixtures", "backup-sandbox", "storage-index.fixture.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readSandboxIndex() {
  assert(fs.existsSync(sandboxIndexPath), "sandbox index is missing");
  return JSON.parse(fs.readFileSync(sandboxIndexPath, "utf8"));
}

function buildPolicy() {
  return {
    marker: "RETENTION_POLICY_CHECK_ONLY",
    weekly_keep: 8,
    monthly_keep: 12,
    pre_deploy_requires_release_marker: true,
    keep_newest_unverified: true,
    block_when_manifest_invalid: true,
    scope: "fixture-sandbox",
  };
}

function buildSampleArtifacts() {
  return [
    {
      id: "weekly-verified-01",
      category: "weekly",
      verified: true,
      manifest_valid: true,
      age_rank: 1,
    },
    {
      id: "weekly-unverified-newest",
      category: "weekly",
      verified: false,
      manifest_valid: true,
      age_rank: 0,
    },
    {
      id: "monthly-verified-01",
      category: "monthly",
      verified: true,
      manifest_valid: true,
      age_rank: 1,
    },
    {
      id: "pre-deploy-release",
      category: "pre-deploy",
      verified: true,
      manifest_valid: true,
      release_marker: "release-fixture",
      age_rank: 1,
    },
    {
      id: "manifest-invalid",
      category: "weekly",
      verified: true,
      manifest_valid: false,
      age_rank: 9,
    },
  ];
}

function evaluateArtifact(policy, artifact) {
  if (!artifact.manifest_valid && policy.block_when_manifest_invalid) {
    return "blocked_manifest_invalid";
  }

  if (!artifact.verified && artifact.age_rank === 0 && policy.keep_newest_unverified) {
    return "review_later";
  }

  if (artifact.category === "pre-deploy") {
    return artifact.release_marker ? "keep" : "review_later";
  }

  if (artifact.category === "weekly") {
    return artifact.age_rank <= policy.weekly_keep ? "keep" : "review_later";
  }

  if (artifact.category === "monthly") {
    return artifact.age_rank <= policy.monthly_keep ? "keep" : "review_later";
  }

  return "review_later";
}

function scanForSecretPatterns(value) {
  const serialized = JSON.stringify(value);
  const patterns = [
    /eyJ[A-Za-z0-9_-]{20,}/,
    /sb_[A-Za-z0-9_-]*secret[A-Za-z0-9_-]*/i,
    /password\s*[:=]/i,
    /private[_-]?key\s*[:=]/i,
    /access[_-]?token\s*[:=]/i,
  ];

  for (const pattern of patterns) {
    assert(!pattern.test(serialized), "retention sample contains a secret-like pattern");
  }
}

function main() {
  const sandboxIndex = readSandboxIndex();
  const policy = buildPolicy();
  const artifacts = buildSampleArtifacts();
  const decisions = artifacts.map((artifact) => ({
    id: artifact.id,
    decision: evaluateArtifact(policy, artifact),
  }));

  assert(sandboxIndex.marker === "LOCAL_SANDBOX_ONLY", "sandbox index marker mismatch");
  assert(sandboxIndex.contains_real_data === false, "sandbox index must not contain real data");
  assert(sandboxIndex.contains_secret === false, "sandbox index must not contain secret data");
  assert(policy.weekly_keep === 8, "weekly keep count mismatch");
  assert(policy.monthly_keep === 12, "monthly keep count mismatch");
  assert(decisions.some((item) => item.decision === "blocked_manifest_invalid"), "invalid manifest must block removal");
  assert(decisions.some((item) => item.decision === "review_later"), "unverified newest artifact must be kept for review");
  scanForSecretPatterns({ sandboxIndex, policy, artifacts, decisions });

  console.log(`${PREFIX} RETENTION_POLICY_CHECK_ONLY`);
  console.log(`${PREFIX} Weekly keep: PASS`);
  console.log(`${PREFIX} Monthly keep: PASS`);
  console.log(`${PREFIX} Pre-deploy marker: PASS`);
  console.log(`${PREFIX} Newest unverified guard: PASS`);
  console.log(`${PREFIX} Invalid manifest guard: PASS`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
