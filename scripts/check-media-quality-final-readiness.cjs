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
const doc = readFile("docs/118D_120D_MEDIA_QUALITY_FINAL_READINESS_REVIEW.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Status: `FINAL_REVIEW_DOCS_ONLY`",
  "Phase 118D Media Review",
  "What Is Ready",
  "What Is Not Ready",
  "Missing Decisions Before Media Migration",
  "Missing Decisions Before Media-Service Worker",
  "Phase 119D Data-Quality Review",
  "Checks Suitable For Inline-Only Without DB Schema",
  "Checks Requiring A Persistent Warning Table",
  "Checks Requiring A Quality-Service Worker Or Offline Boundary",
  "Phase 120D Admin Warning UX Review",
  "UX That Can Be Implemented Without Schema",
  "UX That Must Wait For Persistent Warnings",
  "UX That Must Wait For Import/Export Readiness",
  "Privacy No-Go Conditions",
  "Decision Matrix",
  "A. Defer all implementation; keep docs/contracts only",
  "B. Start media schema candidate phase",
  "C. Start data-quality persistent warning schema candidate phase",
  "D. Start inline admin warning UI only, no schema",
  "E. Start media-service Worker design phase",
  "F. Start quality-service Worker design phase",
  "Recommended Next Path",
  "Required Owner Approvals Before",
  "Media Migration",
  "Media-Service Worker",
  "Persistent Warning Migration",
  "Quality-Service Worker",
  "Runtime Warning UI",
  "Export/Import/GEDCOM/ZIP Expansion",
  "No-Go Conditions",
  "Privacy And Security Notes",
  "Worker And Runtime Impact",
  "Explicitly Not Implemented",
  "No migration.",
  "No `.sql` file.",
  "No DB apply.",
  "No Worker created.",
  "No runtime warning UI.",
]) {
  requireIncludes(doc, token, `final readiness token ${token}`);
}

requireIncludes(index, "118D_120D_MEDIA_QUALITY_FINAL_READINESS_REVIEW.md", "index entry");
requireIncludes(workLog, "Phase 118D-120D Vietnamese Genealogy Media/Data Quality Final Readiness", "work log entry");
requireIncludes(decisionLog, "Decision 142", "decision log entry");
requireIncludes(
  decisionLog,
  "Default implementation decision remains defer; inline hints need separate approval",
  "decision summary",
);
requireIncludes(
  handoff,
  "Phase 118D-120D Vietnamese Genealogy Media/Data Quality Final Readiness completed",
  "handoff entry",
);

if (
  packageJson?.scripts?.["check:media-quality-final-readiness"] !==
  "node scripts/check-media-quality-final-readiness.cjs"
) {
  failures.push("package.json missing check:media-quality-final-readiness script");
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
const runtimeStatus = gitStatus("app", "components", "lib", "server");
if (runtimeStatus.trim() && !allowsPhase121ARuntimeStatus(runtimeStatus)) {
  failures.push("runtime app surface changed");
}
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
    "fullTreeScan",
    "runQualityScan",
  ]) {
    if (content.includes(token)) failures.push(`forbidden runtime token ${token} in ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Media/data-quality final readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Media/data-quality final readiness check passed.");
