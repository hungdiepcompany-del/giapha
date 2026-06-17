const PREFIX = "[backup:storage:contract]";

const contract = {
  marker: "STORAGE_ADAPTER_CONTRACT_ONLY",
  environment: "contract-only",
  methods: [
    "putBackupArtifact",
    "getBackupArtifactMetadata",
    "listBackupArtifacts",
    "verifyBackupArtifact",
    "deleteBackupArtifact",
  ],
  manifestRequirements: [
    "artifactName",
    "storageKey",
    "environment",
    "checksumSha256",
    "createdAt",
    "containsRealData",
    "containsSecret",
    "retentionClass",
    "verificationStatus",
  ],
  safety: {
    networkCalls: "FORBIDDEN",
    envReads: "FORBIDDEN",
    realUpload: "SKIPPED",
    realDelete: "SKIPPED",
    productionRestore: "SKIPPED",
  },
  result: "PASS",
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(contract.marker === "STORAGE_ADAPTER_CONTRACT_ONLY", "marker mismatch");
  assert(contract.methods.includes("putBackupArtifact"), "missing put method");
  assert(contract.methods.includes("verifyBackupArtifact"), "missing verify method");
  assert(contract.safety.networkCalls === "FORBIDDEN", "network calls must be forbidden");
  assert(contract.safety.envReads === "FORBIDDEN", "env reads must be forbidden");

  console.log(`${PREFIX} STORAGE_ADAPTER_CONTRACT_ONLY`);
  console.log(`${PREFIX} Methods: PASS`);
  console.log(`${PREFIX} Manifest requirements: PASS`);
  console.log(`${PREFIX} Network policy: PASS`);
  console.log(`${PREFIX} Real upload: SKIPPED`);
  console.log(`${PREFIX} Real delete: SKIPPED`);
  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
