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
const mediaDoc = readFile("docs/118A_MEDIA_DOMAIN_STORAGE_BOUNDARY_DESIGN.md");
const qualityDoc = readFile("docs/119A_DATA_QUALITY_BOUNDARY_WARNING_DESIGN.md");
const uxDoc = readFile("docs/120A_ADMIN_WARNING_UX_PLANNING.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`",
  "Why Media Must Not Be Added Directly To The Main Worker Yet",
  "Person portrait",
  "Grave or tombstone photo",
  "Family document or photo",
  "Storage key",
  "Thumbnail reference",
  "Supabase Storage",
  "Cloudflare R2",
  "Future media-service Worker",
  "Living-person media is private by default",
  "docs/RUNTIME_WORKER_GUARDRAIL.md",
  "docs/SERVICE_BOUNDARY_ROADMAP.md",
  "Required Future Migration Gates",
  "Required Future Worker And Service Gates",
  "Recommended Phase 118B Scope",
  "Main Worker touched: NO",
  "Storage bucket created: NO",
  "Media upload implemented: NO",
  "Thumbnail or image processing implemented: NO",
  "Migration created: NO",
  "SQL file created: NO",
  "DB apply: NO",
]) {
  requireIncludes(mediaDoc, token, `Phase 118A token ${token}`);
}

for (const token of [
  "Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`",
  "Missing birth date or death date",
  "Impossible dates",
  "Duplicate person suspicion",
  "Missing parent link",
  "Multiple primary memberships",
  "Branch or generation conflict",
  "Spouse or child relationship inconsistency",
  "Private/public visibility conflict",
  "`info`",
  "`warning`",
  "`blocking`",
  "Admin people",
  "Admin genealogy",
  "Tree editor",
  "Import preview later",
  "docs/RUNTIME_WORKER_GUARDRAIL.md",
  "docs/SERVICE_BOUNDARY_ROADMAP.md",
  "Future Persistent Warning Requirements",
  "Recommended Phase 119B Scope",
  "Persistent warning table created: NO",
  "Full DB or full-tree scan implemented: NO",
]) {
  requireIncludes(qualityDoc, token, `Phase 119A token ${token}`);
}

for (const token of [
  "Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`",
  "Admin Warning UX Principles",
  "Suggested Locations",
  "Vietnamese Severity Labels",
  "`Thông tin`",
  "`Cần chú ý`",
  "`Cần xử lý trước khi tiếp tục`",
  "Empty State Copy",
  "Privacy-Safe Behavior",
  "What Is Deferred",
  "Next Phase Recommendation",
  "Runtime UI implemented: NO",
  "Mock runtime data added: NO",
]) {
  requireIncludes(uxDoc, token, `Phase 120A token ${token}`);
}

for (const token of [
  "118A_MEDIA_DOMAIN_STORAGE_BOUNDARY_DESIGN.md",
  "119A_DATA_QUALITY_BOUNDARY_WARNING_DESIGN.md",
  "120A_ADMIN_WARNING_UX_PLANNING.md",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

for (const token of [
  "Phase 118A-120A Vietnamese Genealogy Media/Data Quality Boundary Design",
  "No migration",
  "No DB apply",
  "No SQL mutation",
  "No media upload/storage bucket",
  "No Worker created",
]) {
  requireIncludes(workLog, token, `work log token ${token}`);
}

requireIncludes(decisionLog, "Decision 139", "decision log Phase 118A-120A entry");
requireIncludes(
  decisionLog,
  "Media and data-quality work remain boundary design before schema/runtime",
  "decision summary",
);
requireIncludes(
  handoff,
  "Phase 118A-120A Vietnamese Genealogy Media/Data Quality Boundary Design completed",
  "handoff Phase 118A-120A entry",
);

if (packageJson) {
  const expectedScript = "node scripts/check-media-quality-boundary-design.cjs";
  if (packageJson.scripts?.["check:media-quality-boundary-design"] !== expectedScript) {
    failures.push("package.json missing check:media-quality-boundary-design script");
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

const forbiddenRuntimeTokens = [
  "person_media",
  "person_life_events",
  "person_burials",
  "person_names",
  "data_quality_warnings",
  "quality_warnings",
];

const runtimeFiles = gitOutput(["ls-files", "app", "components", "lib", "server"])
  .split(/\r?\n/)
  .filter(Boolean);

for (const file of runtimeFiles) {
  const content = readFile(file);
  for (const token of forbiddenRuntimeTokens) {
    if (content.includes(token)) failures.push(`forbidden runtime token ${token} in ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Media/data-quality boundary design check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Media/data-quality boundary design check passed.");
