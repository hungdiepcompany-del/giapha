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

function readRuntimeFiles() {
  const roots = ["app", "components", "lib", "server"];
  const files = [];

  for (const folder of roots) {
    const absolute = path.join(root, folder);
    if (!fs.existsSync(absolute)) continue;
    const output = childProcess.execFileSync("git", ["ls-files", folder], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    files.push(...output.split(/\r?\n/).filter(Boolean));
  }

  const stagedOutput = childProcess.execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--", "app", "components", "lib", "server"],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  files.push(...stagedOutput.split(/\r?\n/).filter(Boolean));

  return [...new Set(files)].map((file) => ({
    file,
    content: readFile(file),
  }));
}

const packageJson = readJson("package.json");
const doc = readFile("docs/114_117_VIETNAMESE_GENEALOGY_DOMAIN_UI_INTEGRATION.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const index = readFile("docs/00_INDEX.md");
const lineageService = readFile("lib/family/lineage-service.ts");
const lineageTypes = readFile("lib/family/lineage-types.ts");
const lineageAdmin = readFile("components/genealogy/lineage-admin.tsx");
const genealogyActions = readFile("app/(admin)/admin/genealogy/actions.ts");
const genealogyPage = readFile("app/(admin)/admin/genealogy/page.tsx");
const personPage = readFile("app/(admin)/admin/people/[id]/page.tsx");
const treeService = readFile("lib/family/tree-service.ts");
const privacyService = readFile("lib/privacy/privacy-service.ts");

for (const token of [
  "Phase 114 service result",
  "Phase 115 admin UI result",
  "Phase 116 membership integration result",
  "Phase 117 privacy/tree/public result",
  "Permissions used",
  "Privacy/RLS notes",
  "Export/import deferred",
  "Worker/runtime impact",
  "No migration created",
]) {
  requireIncludes(doc, token, `Phase 114-117 doc token ${token}`);
}

for (const token of [
  "clans",
  "clan_branches",
  "generation_rules",
  "person_branch_memberships",
  "people.view",
  "tree.view",
  "people.update",
  "relationships.update",
  "tree.edit_layout",
  "settings.manage",
  "listPublicLineageMembershipsForPeople",
]) {
  requireIncludes(lineageService, token, `lineage service token ${token}`);
}

for (const token of [
  "Clan",
  "ClanBranch",
  "GenerationRule",
  "PersonBranchMembership",
  "PublicLineageMembership",
]) {
  requireIncludes(lineageTypes, token, `lineage type token ${token}`);
}

for (const token of [
  "ClanForm",
  "BranchForm",
  "GenerationRuleForm",
  "MembershipForm",
  "MembershipSummary",
]) {
  requireIncludes(lineageAdmin, token, `lineage admin token ${token}`);
}

for (const token of [
  "createClanAction",
  "createClanBranchAction",
  "createGenerationRuleAction",
  "createPersonBranchMembershipAction",
]) {
  requireIncludes(genealogyActions, token, `genealogy action token ${token}`);
}

for (const token of [
  "/admin/genealogy/clans",
  "/admin/genealogy/branches",
  "/admin/genealogy/generation-rules",
  "/admin/genealogy/memberships",
]) {
  requireIncludes(genealogyPage, token, `genealogy route token ${token}`);
}

requireIncludes(personPage, "MembershipForm", "person detail membership form");
requireIncludes(personPage, "MembershipSummary", "person detail membership summary");
requireIncludes(treeService, "person_branch_memberships", "tree service lineage query");
requireIncludes(privacyService, "lineageVisibility", "privacy lineage filtering");
requireIncludes(index, "114_117_VIETNAMESE_GENEALOGY_DOMAIN_UI_INTEGRATION.md", "index entry");
requireIncludes(workLog, "Phase 114-117 Vietnamese Genealogy Domain UI Integration", "work log entry");
requireIncludes(decisionLog, "Decision 138", "decision log entry");
requireIncludes(handoff, "Phase 114-117 Vietnamese Genealogy Domain UI Integration completed", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-domain-ui"] !==
    "node scripts/check-vietnamese-genealogy-domain-ui.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-domain-ui script");
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

for (const { file, content } of readRuntimeFiles()) {
  for (const forbidden of [
    "person_names",
    "person_life_events",
    "person_burials",
    "person_media",
  ]) {
    if (content.includes(forbidden)) {
      failures.push(`runtime file ${file} references forbidden table ${forbidden}`);
    }
  }
}

const migrationStatus = gitStatus("db/migrations");
if (migrationStatus.trim()) failures.push(`migration files changed: ${migrationStatus.trim()}`);

const workerStatuses = [
  gitStatus("wrangler.toml"),
  gitStatus("open-next.config.ts"),
  gitStatus("next.config.ts"),
  gitStatus("services"),
].join("");
if (workerStatuses.trim()) failures.push(`worker/config surface changed: ${workerStatuses.trim()}`);

const stagedPlanning = childProcess.execFileSync("git", ["diff", "--cached", "--name-only", "--", "PLANNING.MD"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (stagedPlanning.trim()) failures.push("PLANNING.MD is staged");

for (const token of ["wrangler deploy", "opennextjs-cloudflare deploy", "supabase db push", "supabase db reset"]) {
  rejectIncludes(lineageService, token, `unsafe runtime token ${token}`);
  rejectIncludes(genealogyActions, token, `unsafe action token ${token}`);
}

if (failures.length > 0) {
  console.error("Vietnamese genealogy domain UI check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy domain UI check passed.");
