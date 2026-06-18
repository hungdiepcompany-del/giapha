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

function allowsOnlyApprovedPhase111Migration(status) {
  const lines = status.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return true;

  const allowedPath = "db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql";
  return lines.every((line) => {
    const statusPath = line.slice(3).replaceAll("\\", "/");
    if (statusPath !== allowedPath) return false;

    const content = readFile(allowedPath);
    return (
      content.includes("VIETNAMESE_GENEALOGY_PHASE_111_REAL_MIGRATION") &&
      content.includes("OWNER_APPROVED_FILE_CREATION_ONLY") &&
      content.includes("DO_NOT_APPLY_WITHOUT_SEPARATE_PHASE_113_APPROVAL")
    );
  });
}

const docPath = "docs/103_107_VIETNAMESE_GENEALOGY_DOMAIN_MODEL_READINESS.md";
const doc = readFile(docPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "# Phase 103-107 - Vietnamese Genealogy Domain Model Readiness",
  "## Phase 103 - Vietnamese Genealogy Domain Model Readiness",
  "## Phase 104 - Existing Data Model Gap Analysis",
  "## Phase 105 - Person Profile Field Specification",
  "## Phase 106 - Relationship Rule Specification",
  "## Phase 107 - Branch, Generation, Clan Structure Specification",
  "Required Now",
  "Recommended Next",
  "Later",
  "Biological father",
  "Adoptive father/mother",
  "Step father/mother",
  "Death date is before birth date",
  "family.json",
  "GEDCOM",
  "Do not create or apply migrations",
]) {
  requireIncludes(doc, token, `domain doc token ${token}`);
}

for (const token of [
  "dong_ho",
  "chi",
  "nhanh",
  "doi",
  "the_he",
  "nguoi_khoi_to",
  "truong_ho",
  "truong_chi",
]) {
  requireIncludes(doc, token, `Vietnamese genealogy concept ${token}`);
}

for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bwrangler\s+deploy\b/i,
  /\bopennextjs-cloudflare\s+deploy\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bCREATE\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+public\./i,
  /\bDELETE\s+FROM\b/i,
]) {
  rejectPattern(doc, pattern, `migration/runtime instruction ${pattern}`);
}

for (const pattern of [
  /sb_secret_[A-Za-z0-9_-]+/i,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
  /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
]) {
  rejectPattern(doc, pattern, `possible secret ${pattern}`);
}

requireIncludes(index, "103_107_VIETNAMESE_GENEALOGY_DOMAIN_MODEL_READINESS.md", "index entry");
requireIncludes(workLog, "Phase 103-107 Vietnamese Genealogy Domain Model Readiness", "work log entry");
requireIncludes(handoff, "Phase 103-107 Vietnamese Genealogy Domain Model Readiness completed", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-domain"] !==
    "node scripts/check-vietnamese-genealogy-domain-readiness.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-domain script");
  }
}

const migrationStatus = gitStatus("db/migrations");
if (!allowsOnlyApprovedPhase111Migration(migrationStatus)) {
  failures.push(`db/migrations has changed in this docs-only phase: ${migrationStatus.trim()}`);
}

const runtimeStatuses = [
  gitStatus("app"),
  gitStatus("components"),
  gitStatus("lib"),
  gitStatus("server"),
  gitStatus("services"),
].join("");

if (runtimeStatuses.trim()) {
  failures.push(`runtime surface changed in this docs-only phase: ${runtimeStatuses.trim()}`);
}

if (failures.length > 0) {
  console.error("Vietnamese genealogy domain readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy domain readiness check passed.");
