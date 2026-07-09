const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath = "docs/PLAN_A16V_A16R_EXECUTION_RETRY_REQUIREMENTS.md";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const doc = fs.existsSync(path.join(root, docPath))
  ? fs.readFileSync(path.join(root, docPath), "utf8")
  : "";
const service = fs.existsSync(path.join(root, servicePath))
  ? fs.readFileSync(path.join(root, servicePath), "utf8")
  : "";
const a16ahPath = "docs/PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md";
const a16ah = fs.existsSync(path.join(root, a16ahPath))
  ? fs.readFileSync(path.join(root, a16ahPath), "utf8")
  : "";
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

if (!doc) failures.push(`missing ${docPath}`);

for (const token of [
  "A16V_A16R_EXECUTION_RETRY_REQUIREMENTS_STATUS=READY_FOR_FUTURE_RETRY_AFTER_APPLY_VERIFY",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "Staging people: 102",
  "Staging relationships: 134",
  "Validation errors: 0",
  "Dry-run blockers: 0",
  "Duplicate unresolved: 0",
  "Duplicate needs_review: 0",
  "Duplicate create_new: 8",
  "canRunOfficialImport=false",
  "Official import button disabled",
  "A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED",
  "No RPC call",
  "No `POST /official-import` call",
  "No real genealogy writes",
]) {
  if (!doc.includes(token)) failures.push(`missing retry token ${token}`);
}

if (!service.includes("A16V_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED_BLOCKER")) {
  failures.push("service missing A-16V blocker");
}
if (/\.rpc\s*\(/i.test(service)) {
  if (!a16ah.includes("A16AH_STATUS=PASS_SOURCE_BRANCH_CANDIDATE_NOT_EXECUTED")) {
    failures.push("service RPC branch requires later A-16AH evidence");
  }
  if (
    !service.includes(
      "if (!candidate.canRunOfficialImport || params.executionBranchEnabled !== true)",
    )
  ) {
    failures.push("service RPC branch must stay behind A-16AH same-run gate");
  }
}

if (
  packageJson.scripts?.["check:a16v-a16r-execution-retry-requirements"] !==
  "node scripts/check-a16v-a16r-execution-retry-requirements.cjs"
) {
  failures.push("missing package script check:a16v-a16r-execution-retry-requirements");
}

let staged = "";
try {
  staged = childProcess.execFileSync("git", ["diff", "--cached", "--name-only"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch {
  failures.push("git diff --cached --name-only failed");
}

for (const file of staged.split(/\r?\n/).filter(Boolean)) {
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16V A-16R execution retry requirements check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16V A-16R execution retry requirements check passed.");
