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

function gitStatus(...pathspecs) {
  return gitOutput(["status", "--short", "--", ...pathspecs]);
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

const packageJson = readJson("package.json");
const mediaDoc = readFile("docs/118C_MEDIA_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md");
const qualityDoc = readFile("docs/119C_DATA_QUALITY_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md");
const uxDoc = readFile("docs/120C_ADMIN_WARNING_UX_ACCEPTANCE_CHECKLIST.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Static examples status: `DESIGN_ONLY`",
  "Portrait Photo",
  "Grave/Tomb Photo",
  "Family Document",
  "Clan/Branch Archive Photo",
  "Event Photo",
  "Example Visibility Cases",
  "Living-person-sensitive",
  "Example Storage Contract Cases",
  "Original object",
  "Thumbnail object",
  "Checksum",
  "Content type",
  "File size",
  "Owner/uploader",
  "Retention/deletion state",
  "Unsafe Examples That Must Be Rejected",
  "Public direct bucket URL for private media",
  "Missing visibility",
  "Missing owner/source",
  "Unsupported content type",
  "Oversized file",
  "Unscanned executable-like file",
  "Future Media Migration Acceptance Checklist",
  "Future Media-Service Worker Acceptance Checklist",
  "Future Export/Backup Media Acceptance Checklist",
  "No-Go Conditions Before Any Media Runtime Implementation",
]) {
  requireIncludes(mediaDoc, token, `Phase 118C token ${token}`);
}

for (const token of [
  "Static examples status: `DESIGN_ONLY`",
  "PERSON_IDENTITY_INCOMPLETE",
  "PERSON_DATE_ORDER_INVALID",
  "PERSON_DUPLICATE_CANDIDATE",
  "RELATIONSHIP_PARENT_LINK_MISSING",
  "BRANCH_PRIMARY_MEMBERSHIP_MULTIPLE",
  "LINEAGE_GENERATION_CONFLICT",
  "PRIVACY_VISIBILITY_CONFLICT",
  "TREE_LAYOUT_NODE_ORPHANED",
  "RELATIONSHIP_CYCLE_RISK",
  "Code.",
  "Severity.",
  "Target type.",
  "User-facing Vietnamese copy.",
  "Admin-only detail.",
  "Privacy-safe public behavior.",
  "Expected resolution path.",
  "Warning Acceptance Checklist",
  "Deterministic code",
  "No private leakage",
  "No false blocking",
  "Persistent warnings require a future migration",
  "Quality-Service Worker Acceptance Checklist",
  "No-Go Conditions Before Runtime Scan Implementation",
]) {
  requireIncludes(qualityDoc, token, `Phase 119C token ${token}`);
}

for (const token of [
  "Static UX acceptance status: `DESIGN_ONLY`",
  "People Page",
  "Genealogy Page",
  "Tree Editor",
  "Import Preview Later",
  "Export Readiness Later",
  "No warnings:",
  "Info:",
  "Warning:",
  "Blocking:",
  "Resolved later:",
  "Accessibility And Clarity Checklist",
  "Color not only signal",
  "Clear labels",
  "No raw technical error leakage",
  "Actionable next step",
  "Safe empty state",
  "Privacy-Safe Checklist",
  "No hidden relationship facts on public routes",
  "No private note leakage",
  "No living-person sensitive detail leakage",
  "What Can Be Implemented Without DB Schema",
  "What Requires Future Schema Or Service",
]) {
  requireIncludes(uxDoc, token, `Phase 120C token ${token}`);
}

for (const doc of [mediaDoc, qualityDoc, uxDoc]) {
  for (const token of [
    "No migration.",
    "No `.sql` file.",
    "No DB apply.",
    "No SQL mutation.",
    "No seed/backfill.",
    "No runtime dependency added.",
    "No deploy.",
    "No push.",
  ]) {
    requireIncludes(doc, token, `explicit boundary token ${token}`);
  }
}

for (const token of [
  "118C_MEDIA_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md",
  "119C_DATA_QUALITY_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md",
  "120C_ADMIN_WARNING_UX_ACCEPTANCE_CHECKLIST.md",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(workLog, "Phase 118C-120C Vietnamese Genealogy Media/Data Quality Acceptance Examples", "work log entry");
requireIncludes(decisionLog, "Decision 141", "decision log entry");
requireIncludes(
  decisionLog,
  "Static examples are acceptance evidence, not runtime or schema authorization",
  "decision summary",
);
requireIncludes(
  handoff,
  "Phase 118C-120C Vietnamese Genealogy Media/Data Quality Acceptance Examples completed",
  "handoff entry",
);

if (packageJson?.scripts?.["check:media-quality-static-examples"] !== "node scripts/check-media-quality-static-examples.cjs") {
  failures.push("package.json missing check:media-quality-static-examples script");
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
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replace(/\\/g, "/");
  if (file.toLowerCase().endsWith(".sql")) failures.push(`SQL file changed or added: ${file}`);
}

if (gitStatus("db/migrations").trim()) failures.push("migration files changed");
if (gitStatus("app", "components", "lib", "server").trim()) failures.push("runtime app surface changed");
if (
  gitStatus("services", "wrangler.toml", "open-next.config.ts", "next.config.ts", ".github/workflows").trim()
) {
  failures.push("Worker/config/deploy surface changed");
}
if (gitStatus("PLANNING.MD").trim()) failures.push("PLANNING.MD touched");

const runtimeFiles = gitOutput(["ls-files", "app", "components", "lib", "server"])
  .split(/\r?\n/)
  .filter(Boolean);

for (const file of runtimeFiles) {
  const content = readFile(file);
  for (const token of [
    "person_media",
    "data_quality_warnings",
    "quality_warnings",
    "createBucket",
    ".storage.from(",
    "generateThumbnail",
    "sharp",
    "imagemagick",
    "fullTreeScan",
    "runQualityScan",
    "WarningPanel",
    "RuntimeWarning",
  ]) {
    if (content.includes(token)) failures.push(`forbidden runtime token ${token} in ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Media/data-quality static examples check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Media/data-quality static examples check passed.");
