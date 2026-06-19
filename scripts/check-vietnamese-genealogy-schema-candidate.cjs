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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function gitStatus(pathspec) {
  try {
    return childProcess.execFileSync("git", ["status", "--short", "--", pathspec], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`git status failed for ${pathspec}`);
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

function allowsOnlyApprovedPhase111Migration(status) {
  const lines = status.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return true;

  const allowedPath = "db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql";
  return lines.every((line) => {
    const statusPath = line.slice(2).trim().replaceAll("\\", "/");
    if (statusPath !== allowedPath) return false;

    const content = readFile(allowedPath);
    return (
      content.includes("VIETNAMESE_GENEALOGY_PHASE_111_REAL_MIGRATION") &&
      content.includes("OWNER_APPROVED_FILE_CREATION_ONLY") &&
      content.includes("DO_NOT_APPLY_WITHOUT_SEPARATE_PHASE_113_APPROVAL")
    );
  });
}

function listFiles(dir, predicate) {
  const absoluteDir = path.join(root, dir);
  if (!fs.existsSync(absoluteDir)) return [];

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(dir, entry.name).replaceAll(path.sep, "/");
    if (entry.isDirectory()) {
      files.push(...listFiles(relativePath, predicate));
    } else if (predicate(relativePath)) {
      files.push(relativePath);
    }
  }

  return files;
}

const docPath = "docs/108_110_VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE.md";
const doc = readFile(docPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
function allowsPhase114RuntimeStatus(status) {
  const lines = status.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return true;

  const phase114Doc = path.join(root, "docs/114_117_VIETNAMESE_GENEALOGY_DOMAIN_UI_INTEGRATION.md");
  if (!fs.existsSync(phase114Doc)) return false;

  const doc = fs.readFileSync(phase114Doc, "utf8");
  if (
    !doc.includes("Status: `COMPLETED_LOCAL_STATIC_VALIDATED`") ||
    !doc.includes("No migration created") ||
    !doc.includes("Worker/runtime impact")
  ) {
    return false;
  }

  const allowedFiles = new Set([
    "app/(admin)/admin/people/[id]/page.tsx",
    "components/layout/admin-shell.tsx",
    "components/tree/family-node-card.tsx",
    "lib/family/tree-graph-builder.ts",
    "lib/family/tree-service.ts",
    "lib/family/tree-types.ts",
    "lib/privacy/privacy-service.ts",
  ]);
  const allowedPrefixes = [
    "app/(admin)/admin/genealogy/",
    "components/genealogy/",
    "lib/family/lineage-",
  ];

  return lines.every((line) => {
    const statusPath = line.slice(2).trim().replaceAll("\\", "/");
    return allowedFiles.has(statusPath) || allowedPrefixes.some((prefix) => statusPath.startsWith(prefix));
  });
}

const packageJson = readJson("package.json");

for (const token of [
  "# Phase 108-110 - Vietnamese Genealogy Schema Candidate Gate",
  "VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE_ONLY",
  "DO_NOT_RUN_ON_PRODUCTION",
  "NOT_A_REAL_MIGRATION",
  "## Phase 108 - Schema Candidate Design",
  "## Phase 109 - Schema Candidate Static Safety Check",
  "## Phase 110 - Real Migration File Approval Gate",
  "additive-only",
  "Privacy impact",
  "Export/import impact",
  "Runtime/Worker impact",
  "Owner approval required before real migration file creation",
  "No DB apply without separate explicit approval",
  "Phase 110 does not create a real migration file",
  "Phase 111 may create a real migration file only after owner approval",
  "Phase 113 may apply DB only after separate apply approval",
]) {
  requireIncludes(doc, token, `schema candidate doc token ${token}`);
}

for (const token of [
  "clans",
  "clan_branches",
  "generation_rules",
  "person_branch_memberships",
  "person_names",
  "person_life_events",
  "person_burials",
  "person_media",
  "people",
  "families",
  "family_parents",
  "family_children",
  "couple_relationships",
  "tree_layouts",
  "tree_layout_nodes",
  "revisions",
  "family.json",
  "GEDCOM",
  "ZIP",
  "docs/RUNTIME_WORKER_GUARDRAIL.md",
  "docs/SERVICE_BOUNDARY_ROADMAP.md",
]) {
  requireIncludes(doc, token, `schema compatibility token ${token}`);
}

const destructiveSqlPatterns = [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bALTER\s+TYPE\b/i,
  /\bALTER\s+TABLE\b[^;\n]*(?:DROP|ALTER\s+COLUMN|RENAME\s+COLUMN|RENAME\s+TO|TYPE)\b/i,
  /\bCREATE\s+EXTENSION\b/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bpsql\b/i,
];

for (const pattern of destructiveSqlPatterns) {
  rejectPattern(doc, pattern, `destructive SQL or execution instruction in schema doc ${pattern}`);
}

const sqlDrafts = [
  ...listFiles("docs", (file) => /vietnamese.*genealogy.*schema.*\.(sql|md)$/i.test(file)),
  ...listFiles("scripts", (file) => /vietnamese.*genealogy.*schema.*\.(sql|cjs|js|md)$/i.test(file)),
].filter((file) => file !== docPath && file !== "scripts/check-vietnamese-genealogy-schema-candidate.cjs");

for (const file of sqlDrafts) {
  const content = readFile(file);
  if (!content) continue;

  for (const marker of [
    "VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE_ONLY",
    "DO_NOT_RUN_ON_PRODUCTION",
    "NOT_A_REAL_MIGRATION",
  ]) {
    requireIncludes(content, marker, `${file} marker ${marker}`);
  }

  for (const pattern of destructiveSqlPatterns) {
    rejectPattern(content, pattern, `destructive SQL or execution instruction in ${file} ${pattern}`);
  }
}

requireIncludes(index, "108_110_VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE.md", "index entry");
requireIncludes(workLog, "Phase 108-110 Vietnamese Genealogy Schema Candidate Gate", "work log entry");
requireIncludes(decisionLog, "Decision 128", "decision log entry");
requireIncludes(handoff, "Phase 108-110 Vietnamese Genealogy Schema Candidate Gate completed", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-schema-candidate"] !==
    "node scripts/check-vietnamese-genealogy-schema-candidate.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-schema-candidate script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead) {
  const previousPackage = JSON.parse(packageHead);
  const previousDeps = JSON.stringify(previousPackage.dependencies || {});
  const previousDevDeps = JSON.stringify(previousPackage.devDependencies || {});
  const currentDeps = JSON.stringify((packageJson && packageJson.dependencies) || {});
  const currentDevDeps = JSON.stringify((packageJson && packageJson.devDependencies) || {});

  if (previousDeps !== currentDeps) failures.push("runtime dependencies changed in schema candidate phase");
  if (previousDevDeps !== currentDevDeps) failures.push("devDependencies changed in schema candidate phase");
}

const migrationStatus = gitStatus("db/migrations");
if (!allowsOnlyApprovedPhase111Migration(migrationStatus)) {
  failures.push(`db/migrations changed in schema candidate phase: ${migrationStatus.trim()}`);
}

const runtimeStatuses = [
  gitStatus("app"),
  gitStatus("components"),
  gitStatus("lib"),
  gitStatus("server"),
  gitStatus("services"),
  gitStatus("wrangler.toml"),
  gitStatus("open-next.config.ts"),
  gitStatus("next.config.ts"),
].join("");

if (runtimeStatuses.trim() && !allowsPhase114RuntimeStatus(runtimeStatuses)) {
  failures.push(`runtime or deploy surface changed in schema candidate phase: ${runtimeStatuses.trim()}`);
}

if (failures.length > 0) {
  console.error("Vietnamese genealogy schema candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy schema candidate check passed.");
