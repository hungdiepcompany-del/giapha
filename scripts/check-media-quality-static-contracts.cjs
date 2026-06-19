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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
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

function gitStatus(...pathspecs) {
  return gitOutput(["status", "--short", "--", ...pathspecs]);
}

function allowsPhase121ARuntimeStatus(status) {
  const docPath = path.join(root, "docs/121A_INLINE_ADMIN_WARNING_UI.md");
  if (!fs.existsSync(docPath)) return false;
  const doc = fs.readFileSync(docPath, "utf8");
  if (
    !doc.includes("Status: `COMPLETED_LOCAL_STATIC_VALIDATED`") ||
    !doc.includes("Owner approval: `OPTION_D_INLINE_ADMIN_WARNING_UI_ONLY`")
  ) {
    return false;
  }
  const allowed = new Set([
    "app/(admin)/admin/people/[id]/page.tsx",
    "app/(admin)/admin/genealogy/page.tsx",
    "app/(admin)/admin/genealogy/memberships/page.tsx",
    "components/tree/tree-editor-side-panel.tsx",
    "components/genealogy/admin-warning-badge.tsx",
    "components/genealogy/admin-warning-list.tsx",
    "lib/family/inline-warning-types.ts",
    "lib/family/inline-warning-rules.ts",
  ]);
  return status
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .every((line) => allowed.has(line.slice(3).trim().replaceAll("\\", "/")));
}

const packageJson = readJson("package.json");
const mediaDoc = readFile("docs/118B_MEDIA_STATIC_CONTRACT_AND_APPROVAL_GATE.md");
const qualityDoc = readFile("docs/119B_DATA_QUALITY_STATIC_CONTRACT_AND_APPROVAL_GATE.md");
const uxDoc = readFile("docs/120B_ADMIN_WARNING_UX_STATIC_CONTRACT.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Static media contract status: `DESIGN_ONLY`",
  "Proposed Future Metadata Entities",
  "Person media",
  "Family media",
  "Clan media",
  "Branch media",
  "Memorial/grave media",
  "Proposed Future Storage Contract",
  "Storage provider",
  "Bucket/container",
  "Object key",
  "Content type",
  "File size",
  "Checksum",
  "Visibility",
  "Thumbnail key",
  "Upload owner",
  "Privacy Contract",
  "No direct public bucket leakage",
  "signed URL",
  "Media-Service Boundary",
  "Approval Gate Before Future Media Migration",
  "Approval Gate Before Media-Service Worker",
  "Explicitly Not Implemented",
  "No migration.",
  "No `.sql` file.",
  "No DB apply.",
  "No media upload.",
  "No thumbnail generation.",
]) {
  requireIncludes(mediaDoc, token, `Phase 118B token ${token}`);
}

for (const token of [
  "Static data-quality contract status: `DESIGN_ONLY`",
  "Missing required identity fields",
  "Impossible dates",
  "Duplicate candidate",
  "Missing parent/child link",
  "Multiple primary branch memberships",
  "Branch/generation conflict",
  "Privacy visibility conflict",
  "Orphan layout node",
  "Relationship cycle risk",
  "Severity Contract",
  "`info`",
  "`warning`",
  "`blocking`",
  "Suggested Future Warning Shape",
  "`id`",
  "`target_type`",
  "`target_id`",
  "`code`",
  "`severity`",
  "`title`",
  "`message`",
  "`privacy_level`",
  "`source`",
  "`created_at`",
  "`resolved_at`",
  "Persistent warning table requires a migration",
  "full-tree scan requires separate approval",
  "quality-service requires a service boundary",
  "Approval Gate Before Future Persistent Warning Migration",
  "Approval Gate Before Future Quality-Service Worker",
  "No persistent warning table.",
  "No full-tree runtime scan.",
]) {
  requireIncludes(qualityDoc, token, `Phase 119B token ${token}`);
}

for (const token of [
  "Static UX contract status: `DESIGN_ONLY`",
  "Warning Locations",
  "Admin people",
  "Admin genealogy",
  "Admin tree editor",
  "Import preview later",
  "Export readiness later",
  "`Thông tin`",
  "`Cảnh báo`",
  "`Cần xử lý`",
  "UX States",
  "No warnings",
  "Warning list",
  "Grouped warnings",
  "Blocking warning",
  "Dismissed/resolved warning later",
  "Privacy-Safe Copy Rules",
  "Accessibility And Basic UI Rules",
  "What Can Be Done Without DB Schema",
  "What Requires Future Schema Or Service",
  "No warning table query.",
  "No fake runtime warning data.",
]) {
  requireIncludes(uxDoc, token, `Phase 120B token ${token}`);
}

for (const doc of [mediaDoc, qualityDoc, uxDoc]) {
  for (const token of [
    "No migration.",
    "No `.sql` file.",
    "No DB apply.",
    "No SQL mutation.",
    "No seed/backfill.",
    "No Worker",
    "No runtime dependency.",
    "No deploy.",
    "No push.",
  ]) {
    requireIncludes(doc, token, `explicit no-go token ${token}`);
  }
}

for (const token of [
  "118B_MEDIA_STATIC_CONTRACT_AND_APPROVAL_GATE.md",
  "119B_DATA_QUALITY_STATIC_CONTRACT_AND_APPROVAL_GATE.md",
  "120B_ADMIN_WARNING_UX_STATIC_CONTRACT.md",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(workLog, "Phase 118B-120B Vietnamese Genealogy Media/Data Quality Static Contracts", "work log entry");
requireIncludes(decisionLog, "Decision 140", "decision log Phase 118B-120B entry");
requireIncludes(decisionLog, "Media/data-quality static contracts require approval gates before schema or service work", "decision summary");
requireIncludes(handoff, "Phase 118B-120B Vietnamese Genealogy Media/Data Quality Static Contracts completed", "handoff entry");

if (packageJson) {
  const expectedScript = "node scripts/check-media-quality-static-contracts.cjs";
  if (packageJson.scripts?.["check:media-quality-static-contracts"] !== expectedScript) {
    failures.push("package.json missing check:media-quality-static-contracts script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  if (JSON.stringify(previousPackage.dependencies || {}) !== JSON.stringify(packageJson.dependencies || {})) {
    failures.push("runtime dependencies changed");
  }
  if (JSON.stringify(previousPackage.devDependencies || {}) !== JSON.stringify(packageJson.devDependencies || {})) {
    failures.push("devDependencies changed");
  }
}

const status = gitOutput(["status", "--short"]);
const changedFiles = status
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim().replace(/\\/g, "/"))
  .filter(Boolean);

for (const file of changedFiles) {
  if (file.toLowerCase().endsWith(".sql")) {
    failures.push(`SQL file changed or added: ${file}`);
  }
}

const migrationStatus = gitStatus("db/migrations");
if (migrationStatus.trim()) failures.push(`migration files changed: ${migrationStatus.trim()}`);

const runtimeStatus = gitStatus("app", "components", "lib", "server");
if (runtimeStatus.trim() && !allowsPhase121ARuntimeStatus(runtimeStatus)) {
  failures.push(`runtime app surface changed: ${runtimeStatus.trim()}`);
}

const workerConfigStatus = gitStatus(
  "services",
  "wrangler.toml",
  "open-next.config.ts",
  "next.config.ts",
  ".github/workflows",
);
if (workerConfigStatus.trim()) failures.push(`Worker/config/deploy surface changed: ${workerConfigStatus.trim()}`);

const planningStatus = gitStatus("PLANNING.MD");
if (planningStatus.trim()) failures.push(`PLANNING.MD touched: ${planningStatus.trim()}`);

const runtimeFiles = gitOutput(["ls-files", "app", "components", "lib", "server"])
  .split(/\r?\n/)
  .filter(Boolean);

for (const file of runtimeFiles) {
  const content = readFile(file);
  for (const token of [
    "person_media",
    "person_life_events",
    "person_burials",
    "person_names",
    "data_quality_warnings",
    "quality_warnings",
    "createBucket",
    ".storage.from(",
    "generateThumbnail",
    "sharp",
    "imagemagick",
    "fullTreeScan",
    "runQualityScan",
  ]) {
    if (content.includes(token)) failures.push(`forbidden runtime token ${token} in ${file}`);
  }
}

for (const content of [mediaDoc, qualityDoc, uxDoc]) {
  rejectIncludes(content, "Status: `IMPLEMENTED`", "implemented status");
  rejectIncludes(content, "Status: `READY_FOR_DB_APPLY`", "DB apply readiness status");
}

if (failures.length > 0) {
  console.error("Media/data-quality static contracts check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Media/data-quality static contracts check passed.");
