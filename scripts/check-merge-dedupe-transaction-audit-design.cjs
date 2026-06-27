const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function gitOutput(args) {
  try {
    return childProcess.execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`git ${args.join(" ")} failed`);
    return "";
  }
}

function gitShowHead(relativePath) {
  try {
    return childProcess.execFileSync("git", ["show", `HEAD:${relativePath}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

const allowedChangedFiles = new Set([
  "docs/PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md",
  "docs/PLAN_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_READINESS.md",
  "docs/PLAN_A12_MERGE_DEDUPE_REAL_MIGRATION_APPLY_PLAN.md",
  "docs/PLAN_A13_MERGE_DEDUPE_DB_APPLY_VERIFICATION.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "app/(admin)/admin/people/page.tsx",
  "app/(admin)/admin/relationships/page.tsx",
  "app/(admin)/admin/revisions/page.tsx",
  "app/(admin)/admin/system/status/page.tsx",
  "app/(admin)/admin/tree/edit/actions.ts",
  "app/(public)/people/[slug]/page.tsx",
  "app/auth/login/page.tsx",
  "app/globals.css",
  "components/auth/login-form.tsx",
  "components/imports/json-import-preview-form.tsx",
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/people/person-form.tsx",
  "components/people/person-list.tsx",
  "components/public/public-home.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-tree-shell.tsx",
  "components/relationships/couple-form.tsx",
  "components/relationships/relationship-form.tsx",
  "components/relationships/relationship-summary.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/ui/action-link.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/page-header.tsx",
  "components/ui/section-card.tsx",
  "docs/PLAN_A14_UI_UX_OVERHAUL.md",
  "docs/PLAN_A14A_RELATED_MEMBER_ADD_UX.md",
  "docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-merge-dedupe-transaction-audit-design.cjs",
  "scripts/check-merge-dedupe-schema-candidate-readiness.cjs",
  "scripts/check-merge-dedupe-real-migration-readiness.cjs",
  "scripts/merge-dedupe-schema-candidate.sql.draft",
  "db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql",
  "db/checks/check_merge_dedupe_schema.sql",
  "scripts/check-tree-editor-auth-browser-smoke.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
  "scripts/check-tree-duplicate-suggestion-ux.cjs",
  "scripts/check-tree-inline-create-person-ux.cjs",
  "scripts/check-tree-relationship-picker-ux.cjs",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
  "scripts/check-vietnamese-ui-copy.cjs",
  "scripts/check-routine-production-monitoring-snapshot.cjs",
  "scripts/check-production-monitoring-auth-smoke-prep.cjs",
  "scripts/check-authenticated-smoke-result.cjs",
  "scripts/check-post-runtime-ui-deploy-readiness.cjs",
  "scripts/check-inline-admin-warning-ui.cjs",
  "scripts/check-small-json-export-smoke.cjs",
  "scripts/check-small-json-export-hardening.cjs",
  "scripts/check-export-import-final-readiness.cjs",
  "scripts/check-vietnamese-genealogy-schema-candidate.cjs",
  "scripts/check-vietnamese-genealogy-first-migration-scope.cjs",
  "scripts/check-vietnamese-genealogy-real-migration-file.cjs",
]);

const docPath = "docs/PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md";
const doc = readFile(docPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const heading of [
  "## Summary",
  "## User problem",
  "## Data objects impacted",
  "## Candidate detection design",
  "## Merge policy",
  "## Audit design",
  "## Rollback design",
  "## Permission and approval gate",
  "## Future UI design",
  "## Deferred items",
  "## Owner review result",
]) {
  requireIncludes(doc, heading, `A-10 section ${heading}`);
}

for (const token of [
  "Không auto merge",
  "Không tự xóa thành viên",
  "Không runtime merge",
  "Không DB apply",
  "Không migration",
  "### Strong match",
  "### Medium match",
  "### Weak match",
  "Strong/medium/weak chỉ là gợi ý",
  "không được block người dùng tạo mới",
  "APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN",
  "APPROVE_A11_MERGE_DEDUPE_SCHEMA",
  "APPROVE_A12_MERGE_DEDUPE_RUNTIME",
  "source_person",
  "target_person",
  "merge_id",
  "rollback_snapshot_manifest",
  "all-or-nothing",
  "lock/version check",
  "Mọi conflict phải hiển thị cho người duyệt",
  "graph trước và sau",
  "requested_by",
  "approved_by",
  "executed_by",
  "requested_at",
  "approved_at",
  "executed_at",
  "field_changes",
  "relationship_changes",
  "layout_changes",
  "export_impact",
  "Khôi phục source person",
  "Khôi phục relationships",
  "Khôi phục layout references",
  "Khôi phục branch/generation memberships",
  "Khôi phục public/private visibility",
  "Ghi revision rollback event",
  "people.merge.suggest",
  "people.merge.review",
  "people.merge.approve",
  "people.merge.execute",
  "people.merge.rollback",
  "Nghi trùng thành viên",
  "So sánh thành viên",
  "Giữ thông tin này",
  "Xung đột dữ liệu",
  "Quan hệ bị ảnh hưởng",
  "Yêu cầu gộp",
  "Phê duyệt gộp",
  "Thực hiện gộp",
  "Hoàn tác gộp",
  "Owner review result: `APPROVED`",
  "Marker status: `NOT_GRANTED_BY_THIS_REVIEW`",
]) {
  requireIncludes(doc, token, `A-10 design token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A10_MERGE_DEDUPE_TRANSACTION_AUDIT_DESIGN.md", "index entry"],
  [workLog, "Plan A-10 - Merge/Dedupe Transaction & Audit Design", "work log entry"],
  [handoff, "Plan A-10 - Merge/Dedupe Transaction & Audit Design", "handoff entry"],
  [decisionLog, "Decision 161 - Merge/dedupe runtime remains closed", "Decision 161"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:merge-dedupe-transaction-audit-design"] !==
  "node scripts/check-merge-dedupe-transaction-audit-design.cjs"
) {
  failures.push(
    "package.json missing check:merge-dedupe-transaction-audit-design script",
  );
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  if (
    JSON.stringify(previousPackage.dependencies || {}) !==
    JSON.stringify(packageJson.dependencies || {})
  ) {
    failures.push("runtime dependencies changed");
  }
  if (
    JSON.stringify(previousPackage.devDependencies || {}) !==
    JSON.stringify(packageJson.devDependencies || {})
  ) {
    failures.push("devDependencies changed");
  }
}

const status = gitOutput(["status", "--short", "--untracked-files=all"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();
  const isApprovedA12SqlArtifact =
    file === "db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql" ||
    file === "db/checks/check_merge_dedupe_schema.sql";
  const isApprovedMigrationCompatibilityChecker =
    file === "scripts/check-vietnamese-genealogy-schema-candidate.cjs" ||
    file === "scripts/check-vietnamese-genealogy-first-migration-scope.cjs" ||
    file === "scripts/check-vietnamese-genealogy-real-migration-file.cjs";

  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
  if (lowerFile.endsWith(".sql") && !isApprovedA12SqlArtifact) {
    failures.push(`SQL file changed: ${file}`);
  }
  const isA11CandidateArtifact =
    file === "docs/PLAN_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_READINESS.md" ||
    file === "scripts/check-merge-dedupe-schema-candidate-readiness.cjs" ||
    file === "scripts/merge-dedupe-schema-candidate.sql.draft";
  if (
    (file.startsWith("db/") && !isApprovedA12SqlArtifact) ||
    (
      file.includes("schema") &&
      !isA11CandidateArtifact &&
      !isApprovedA12SqlArtifact &&
      !isApprovedMigrationCompatibilityChecker
    )
  ) {
    failures.push(`database/schema drift: ${file}`);
  }
  if (
    file === "wrangler.toml" ||
    file.includes("open-next") ||
    file.includes("opennext") ||
    file.startsWith("services/") ||
    file.startsWith(".github/workflows/")
  ) {
    failures.push(`Worker/OpenNext/Wrangler/deploy drift: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for Plan A-10: ${file}`);
  }
}

const runtimeDiff = gitOutput([
  "diff",
  "HEAD",
  "--",
  "app",
  "components",
  "lib",
  "server",
]);
const forbiddenRuntimePatterns = [
  ["mergePersons", /\bmergePersons\b/],
  ["executeMerge", /\bexecuteMerge\b/],
  ["rollbackMerge", /\brollbackMerge\b/],
  ["dedupePersons", /\bdedupePersons\b/],
  ["deleteDuplicatePerson", /\bdeleteDuplicatePerson\b/],
  ["merge API route", /\/api\/[^\s]+\/merge\b/],
  ["dedupe API route", /\/api\/[^\s]+\/dedupe\b/],
  ["runtime merge permission registration", /people\.merge\.execute/],
];
for (const [label, pattern] of forbiddenRuntimePatterns) {
  if (pattern.test(runtimeDiff)) failures.push(`forbidden runtime pattern ${label}`);
}

const runtimeChangedFiles = gitOutput([
  "status",
  "--short",
  "--",
  "app",
  "components",
  "lib",
  "server",
])
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.slice(3).trim().replaceAll("\\", "/"))
  .filter((file) => !allowedChangedFiles.has(file));
if (runtimeChangedFiles.length > 0) {
  failures.push(
    `runtime, permission or schema source changed in Plan A-10: ${runtimeChangedFiles.join("; ")}`,
  );
}

if (failures.length > 0) {
  console.error("Merge/dedupe transaction and audit design check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Merge/dedupe transaction and audit design check passed.");
