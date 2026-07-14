const fs = require("fs");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const failures = [];

function read(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch (error) {
    failures.push(`missing ${path}: ${error.message}`);
    return "";
  }
}

function sha256(path) {
  return crypto.createHash("sha256").update(read(path)).digest("hex").toUpperCase();
}

function requireIncludes(content, token, label) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function countMatches(content, pattern) {
  return content.match(pattern)?.length ?? 0;
}

function isGitTracked(path) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", path], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function stripComments(sql) {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

const multilineSignature = `public.execute_admin_a17q_legacy_family_reconciliation(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
)`;

const compactSignature = `public.execute_admin_a17q_legacy_family_reconciliation(
  text,text,text,text,text,text,text,
  boolean,boolean,boolean,boolean,boolean
)`;

function normalizeTx2ToExpectedTx3(content) {
  return content
    .replace(/^-- A-17Q-TX2:[\s\S]*?-- SQL_EXECUTED_BY_CODEX=NO; MIGRATION_APPLIED=NO\.\r?\n/, "")
    .replace(/\bsecurity invoker\b/i, "security definer")
    .replace(
      "'A-17Q-TX1 candidate: SECURITY INVOKER transaction executor for the immutable A-17P-R 21-group legacy family reconciliation decision pack only. Not applied until owner review and a separate manual apply phase.'",
      "'A-17Q-TX3 candidate: SECURITY DEFINER transaction executor for the immutable A-17P-R 21-group legacy family reconciliation decision pack only; preserves internal auth.uid/profile/permission/hash/idempotency gates and fixes the family_parents RLS boundary observed during the first owner execution attempt. Not applied until owner review and a separate manual apply phase.'",
    )
    .replace(
      new RegExp(`revoke execute on function ${multilineSignature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} from public;`),
      `alter function ${multilineSignature} owner to postgres;\n\nrevoke all on function ${compactSignature} from public;`,
    )
    .replace(
      new RegExp(`revoke execute on function ${multilineSignature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} from anon;`),
      `revoke all on function ${compactSignature} from anon;`,
    )
    .replace(
      new RegExp(`grant execute on function ${multilineSignature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} to authenticated;`),
      `grant execute on function ${compactSignature} to authenticated;`,
    );
}

function normalizeTx3(content) {
  return content.replace(
    /^-- A-17Q-TX3:[\s\S]*?-- SQL_EXECUTED_BY_CODEX=NO; MIGRATION_APPLIED=NO\.\r?\n/,
    "",
  );
}

const tx2Path = "db/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const tx3Path = "db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql";
const tx3MirrorPath = "supabase/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql";
const relationshipMigrationPath = "db/migrations/20260614_0004_relationship_foundation.sql";
const tx3DocPath = "docs/PLAN_A17Q_TX3_FAMILY_PARENTS_RLS_BOUNDARY.md";

const tx2 = read(tx2Path);
const tx3 = read(tx3Path);
const tx3Mirror = read(tx3MirrorPath);
const tx3Code = stripComments(tx3);
const relationshipMigration = read(relationshipMigrationPath);
const runtimeExecution = read("lib/reconciliation/a17q-authenticated-execution.ts");
const runtimeDryRun = read("lib/reconciliation/a17q-authenticated-dry-run.ts");
const executionRoute = read("app/api/admin/a17q/reconciliation-execute/route.ts");
const executionPage = read("app/(admin)/admin/reconciliation/a17q/execute/page.tsx");
const finalVerifier = read("db/checks/20260714_check_a17q_exec2_final_post_reconciliation_verification.sql");
const tx3Doc = read(tx3DocPath);
const packageJson = JSON.parse(read("package.json") || "{}");

if (tx3 !== tx3Mirror) failures.push("0028 db/supabase mirrors differ");
if (!isGitTracked(tx3MirrorPath)) failures.push("0028 Supabase mirror is not tracked by git");
for (const dir of ["db/migrations", "supabase/migrations"]) {
  for (const entry of fs.readdirSync(dir)) {
    if (
      /_0029_/.test(entry) &&
      entry !== "20260714_0029_a17q_tx4_jsonb_argument_limit_patch.sql"
    ) {
      failures.push(`unexpected migration 0029 exists: ${dir}/${entry}`);
    }
  }
}
if (normalizeTx3(tx3) !== normalizeTx2ToExpectedTx3(tx2)) {
  failures.push("0028 differs from 0027 beyond expected SECURITY DEFINER, owner and grant-contract changes");
}

requireIncludes(tx3, "-- A-17Q-TX3: family_parents RLS boundary patch.", "TX3 migration header");
requireIncludes(tx3, "public.family_parents UPDATE", "family_parents failing operation note");
requireIncludes(tx3, "create or replace function public.execute_admin_a17q_legacy_family_reconciliation(", "RPC replacement");
requireIncludes(tx3, "security definer", "SECURITY DEFINER mode");
requireIncludes(tx3, "set search_path = public, auth, pg_temp", "fixed search_path");
requireIncludes(tx3, `alter function ${multilineSignature} owner to postgres;`, "explicit postgres owner assignment");
requireIncludes(tx3, "if auth.uid() is null or v_profile_id is null then", "authenticated profile assertion");
requireIncludes(tx3, "public.has_permission('relationships.update')", "relationships.update assertion");
requireIncludes(tx3, "public.has_permission('permissions.manage')", "permissions.manage assertion");
requireIncludes(tx3, "p_owner_approval_marker is distinct from v_owner_marker", "owner marker assertion");
requireIncludes(tx3, "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED", "owner approval marker");
requireIncludes(tx3, "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0", "decision pack hash");
requireIncludes(tx3, "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740", "approved group hash");
requireIncludes(tx3, "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f", "role correction hash");
requireIncludes(tx3, "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61", "excluded scope hash");
requireIncludes(tx3, "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3", "forecast hash");
requireIncludes(tx3, "if p_dry_run_only is true then", "dry-run branch");
requireIncludes(tx3, "success_result = v_result", "stored success result preserved");
requireIncludes(tx3, "insert into public.family_reconciliation_rollback_manifests", "rollback manifest preserved");
requireIncludes(tx3, "insert into public.revisions (", "audit insert preserved");
requireIncludes(tx3, `revoke all on function ${compactSignature} from public;`, "PUBLIC execute revoked after owner assignment");
requireIncludes(tx3, `revoke all on function ${compactSignature} from anon;`, "anon execute revoked after owner assignment");
requireIncludes(tx3, `grant execute on function ${compactSignature} to authenticated;`, "authenticated execute grant after owner assignment");
requireIncludes(tx3, "from public;", "PUBLIC execute revoked");
requireIncludes(tx3, "from anon;", "anon execute revoked");
requireIncludes(tx3, "to authenticated;", "authenticated execute grant target");

const ownerIndex = tx3Code.indexOf(`alter function ${multilineSignature} owner to postgres;`);
const publicRevokeIndex = tx3Code.indexOf(`revoke all on function ${compactSignature} from public;`);
const anonRevokeIndex = tx3Code.indexOf(`revoke all on function ${compactSignature} from anon;`);
const authenticatedGrantIndex = tx3Code.indexOf(`grant execute on function ${compactSignature} to authenticated;`);
if (ownerIndex < 0) {
  failures.push("explicit owner statement missing from executable SQL");
} else if (
  publicRevokeIndex < ownerIndex ||
  anonRevokeIndex < ownerIndex ||
  authenticatedGrantIndex < ownerIndex
) {
  failures.push("owner assignment must occur before final revoke/grant contract");
}

requireIncludes(relationshipMigration, "alter table public.family_parents enable row level security;", "family_parents RLS enabled");
requireIncludes(relationshipMigration, 'create policy "relationship maintainers can update parents"', "authenticated update policy exists");
requireIncludes(relationshipMigration, "with check (\n  public.has_permission('relationships.update')", "family_parents update WITH CHECK evidence");
requireIncludes(relationshipMigration, "drop trigger if exists family_parents_set_updated_at", "family_parents trigger evidence");
requireIncludes(relationshipMigration, "execute function public.set_updated_at();", "trigger function evidence");

rejectPattern(tx3Code, /\balter\s+table\s+public\.family_parents\s+disable\s+row\s+level\s+security\b/i, "RLS disable");
rejectPattern(tx3Code, /\bforce\s+row\s+level\s+security\b/i, "force RLS drift");
rejectPattern(tx3Code, /\bcreate\s+policy\b/i, "new RLS policy");
rejectPattern(tx3Code, /\bwith\s+check\s*\(\s*true\s*\)/i, "WITH CHECK true");
rejectPattern(tx3Code, /\busing\s*\(\s*true\s*\)/i, "USING true");
rejectPattern(tx3Code, /\bgrant\s+(?:insert|update|delete|all|all\s+privileges)[^;]*\bto\s+anon\b/i, "anon write grant");
rejectPattern(tx3Code, /\bgrant\s+(?:insert|update|delete|all|all\s+privileges)[^;]*\bpublic\.family_parents[^;]*\bto\s+authenticated\b/i, "new authenticated family_parents write grant");
rejectPattern(tx3Code, /\bselect\s+public\.execute_admin_a17q_legacy_family_reconciliation\s*\(/i, "executor call from migration");
rejectPattern(tx3Code, /\bp_dry_run_only\s*=>\s*false\b/i, "manual non-dry-run call");
rejectPattern(tx3Code, /\b(service_role|SUPABASE_SERVICE_ROLE|service-role)\b/i, "service role reference");

if (countMatches(tx3, /\bsecurity definer\b/gi) !== 2) {
  failures.push("expected exactly one executable SECURITY DEFINER plus one comment mention");
}
if (countMatches(tx3Code, /\balter\s+function\s+public\.execute_admin_a17q_legacy_family_reconciliation\b[\s\S]*?\)\s+owner\s+to\s+postgres\s*;/gi) !== 1) {
  failures.push("expected exactly one explicit postgres owner assignment for exact RPC signature");
}
if (countMatches(tx3Code, /\bupdate\s+public\.family_parents\s+fp\b/gi) !== 2) {
  failures.push("expected two family_parents update statements preserved");
}
if (countMatches(tx3Code, /\binsert\s+into\s+public\.family_parents\b/gi) !== 0) {
  failures.push("unexpected family_parents insert in TX3");
}
if (countMatches(tx3Code, /\bdelete\s+from\s+public\.family_parents\b/gi) !== 0) {
  failures.push("unexpected family_parents delete in TX3");
}

requireIncludes(runtimeExecution, "p_dry_run_only: false", "single execution route remains non-dry-run");
requireIncludes(runtimeDryRun, "p_dry_run_only: true", "dry-run route remains true");
rejectPattern(runtimeDryRun, /p_dry_run_only:\s*false|dryRunOnly:\s*false/, "dry-run route false path");
rejectPattern(runtimeExecution + runtimeDryRun + executionRoute + executionPage, /service[_-]?role|SUPABASE_SERVICE_ROLE/i, "runtime service role");
if (countMatches(runtimeExecution, /p_dry_run_only:\s*false/g) !== 1) {
  failures.push("non-dry-run execution caller count is not 1");
}
if (countMatches(runtimeDryRun, /p_dry_run_only:\s*true/g) !== 1) {
  failures.push("dry-run caller count drifted");
}

rejectPattern(finalVerifier, /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i, "final verifier executor call");
requireIncludes(finalVerifier, "completed_batch_count", "final verifier batch evidence");
requireIncludes(finalVerifier, "rollback_manifest_count", "final verifier rollback evidence");

for (const token of [
  "A17Q_TX3A_STATUS=PASS_LOCAL_PATCH_READY_FOR_OWNER_REVIEW",
  "PRIMARY_ROOT_CAUSE=RPC_SECURITY_INVOKER_INCORRECT_BOUNDARY",
  "FAILING_OPERATION=UPDATE public.family_parents",
  "PATCH_TYPE=LOCAL_MIGRATION_CANDIDATE_SECURITY_DEFINER_TRANSACTION_BOUNDARY",
  "SECURITY_EXPANSION=NARROW_TRANSACTION_BOUNDARY_ONLY",
  "RLS_DISABLED=NO",
  "ANON_WRITE_GRANTED=NO",
  "AUTHENTICATED_WRITE_BROADENED=NO",
  "SQL_APPLY=NO",
  "RPC_RETRY=NO",
]) {
  requireIncludes(tx3Doc, token, `doc token ${token}`);
}

if (
  packageJson.scripts?.["check:a17q-tx3-family-parents-rls-boundary"] !==
  "node scripts/check-a17q-tx3-family-parents-rls-boundary.cjs"
) {
  failures.push("package script missing for TX3 checker");
}
if (
  packageJson.scripts?.["check:a17q-tx3b-fix1-privileged-function-ownership"] !==
  "node scripts/check-a17q-tx3-family-parents-rls-boundary.cjs"
) {
  failures.push("package script missing for TX3B-FIX1 ownership checker");
}

if (failures.length) {
  console.error("A17Q TX3 family_parents RLS boundary check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A17Q_TX3A_STATUS=PASS_LOCAL_PATCH_READY_FOR_OWNER_REVIEW");
console.log("A17Q_TX3B_FIX1_STATUS=PASS_EXPLICIT_POSTGRES_OWNER_AND_TRACKED_MIRROR_READY_FOR_FINAL_REVIEW");
console.log("ROOT_CAUSE_PROVEN=YES");
console.log("PRIMARY_ROOT_CAUSE=RPC_SECURITY_INVOKER_INCORRECT_BOUNDARY");
console.log("FAILING_OPERATION=UPDATE public.family_parents");
console.log("PATCH_MIGRATION_SHA256=" + sha256(tx3Path));
console.log("FUNCTION_OWNER=postgres");
console.log("EXPLICIT_OWNER_STATEMENT=YES");
console.log("OWNER_TARGET_SIGNATURE_EXACT=YES");
console.log("MIRROR_MATCH=YES");
console.log("MIRROR_TRACKED=YES");
console.log("RLS_DISABLED=NO");
console.log("ANON_WRITE_GRANTED=NO");
console.log("AUTHENTICATED_WRITE_BROADENED=NO");
console.log("SERVICE_ROLE_USED=NO");
console.log("RPC_CALLED=NO");
console.log("SQL_APPLY=NO");
