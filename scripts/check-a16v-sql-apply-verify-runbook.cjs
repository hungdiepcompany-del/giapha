const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const docPath = "docs/PLAN_A16V_SQL_APPLY_VERIFY_RUNBOOK.md";
const doc = fs.existsSync(path.join(root, docPath))
  ? fs.readFileSync(path.join(root, docPath), "utf8")
  : "";
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

if (!doc) failures.push(`missing ${docPath}`);

for (const token of [
  "A16V_SQL_APPLY_VERIFY_RUNBOOK_STATUS=READY_FOR_OWNER_REVIEW_NOT_APPLIED",
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql",
  "byte-for-byte identical",
  "not `SECURITY DEFINER`",
  "search_path=public, pg_temp",
  "No anon/public EXECUTE grant",
  "official_import_batches",
  "official_import_rollback_manifests",
  "Idempotency unique guard",
  "No auto import trigger",
  "A16V_APPLY_VERIFY_STATUS=NOT_RUN_CANDIDATE_ONLY",
  "canRunOfficialImport=false",
  "official import button remains disabled",
]) {
  if (!doc.includes(token)) failures.push(`missing runbook token ${token}`);
}

if (
  packageJson.scripts?.["check:a16v-sql-apply-verify-runbook"] !==
  "node scripts/check-a16v-sql-apply-verify-runbook.cjs"
) {
  failures.push("missing package script check:a16v-sql-apply-verify-runbook");
}

if (failures.length > 0) {
  console.error("A-16V SQL apply verify runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16V SQL apply verify runbook check passed.");
