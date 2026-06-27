const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/people/person-form.tsx",
  "components/people/person-list.tsx",
  "components/public/public-home.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-tree-shell.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/ui/action-link.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/page-header.tsx",
  "components/ui/section-card.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A14E_MOBILE_UX_SWEEP.md",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "scripts/check-merge-dedupe-real-migration-readiness.cjs",
  "scripts/check-merge-dedupe-schema-candidate-readiness.cjs",
  "scripts/check-merge-dedupe-transaction-audit-design.cjs",
  "scripts/check-tree-duplicate-suggestion-ux.cjs",
  "scripts/check-tree-editor-auth-browser-smoke.cjs",
  "scripts/check-tree-inline-create-person-ux.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
  "scripts/check-tree-relationship-picker-ux.cjs",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
  "scripts/check-vietnamese-ui-copy.cjs",
]);

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

const packageJson = readJson("package.json");
const doc = readFile("docs/PLAN_A14E_MOBILE_UX_SWEEP.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const publicShell = readFile("components/layout/public-shell.tsx");
const adminShell = readFile("components/layout/admin-shell.tsx");
const publicHome = readFile("components/public/public-home.tsx");
const publicProfile = readFile("components/public/public-person-profile.tsx");
const publicTree = readFile("components/public/public-tree-shell.tsx");
const personList = readFile("components/people/person-list.tsx");
const personForm = readFile("components/people/person-form.tsx");
const toolbar = readFile("components/tree/family-tree-toolbar.tsx");
const viewer = readFile("components/tree/family-tree-viewer.tsx");
const nodeCard = readFile("components/tree/family-node-card.tsx");
const editor = readFile("components/tree/family-tree-editor.tsx");
const editorToolbar = readFile("components/tree/tree-editor-toolbar.tsx");
const sidePanel = readFile("components/tree/tree-editor-side-panel.tsx");
const actionLink = readFile("components/ui/action-link.tsx");
const pageHeader = readFile("components/ui/page-header.tsx");
const sectionCard = readFile("components/ui/section-card.tsx");
const emptyState = readFile("components/ui/empty-state.tsx");

for (const heading of [
  "## A-14E1 - Mobile UX Audit",
  "## A-14E2 - Responsive Layout Polish",
  "## A-14E3 - Touch Target / Button UX",
  "## A-14E4 - Mobile Tree Viewer / Tree Editor",
  "## A-14E5 - Mobile Forms / Inputs",
  "## A-14E6 - Mobile Empty / Loading / Error States",
  "## A-14E7 - Accessibility / Vietnamese Mobile Copy Sweep",
  "## A-14E8 - Public/Admin/Security Boundary Guard",
  "## A-14E9 - Checker",
  "## A-14E10 - Docs / Decision / Handoff",
  "## A-14E11 - Validation",
  "## A-14E12 - Commit",
]) {
  requireIncludes(doc, heading, `A-14E doc section ${heading}`);
}

for (const token of [
  "Mobile UX Sweep",
  "classic modern genealogy",
  "cổ điển pha hiện đại",
  "public/admin",
  "touch target",
  "responsive",
  "Tree Viewer",
  "Tree Editor",
  "form/input",
  "empty/loading/error",
  "accessibility",
  "Public tree remains read-only",
  "Không schema change",
  "Không DB apply",
  "Không check SQL trên DB",
  "Không merge/dedupe runtime",
  "Không permission runtime",
  "Không deploy",
  "BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION",
  "PLANNING.MD was not read or committed",
]) {
  requireIncludes(doc, token, `A-14E doc token ${token}`);
}

for (const [content, token, label] of [
  [publicShell, "grid w-full grid-cols-2", "public mobile nav grid"],
  [publicShell, "min-h-11", "public nav touch target"],
  [publicShell, "break-words", "public brand wraps"],
  [adminShell, "max-h-[52vh]", "admin mobile nav max height"],
  [adminShell, "overflow-y-auto", "admin mobile nav scroll"],
  [adminShell, "min-h-11", "admin nav touch target"],
  [publicHome, "text-3xl", "public home mobile hero size"],
  [publicHome, "grid gap-3 sm:flex", "public home mobile CTAs"],
  [publicProfile, "break-words", "public profile long text wrap"],
  [publicTree, "px-4 py-8", "public tree mobile spacing"],
  [personList, "min-[380px]:grid-cols-2", "people mobile cards narrow grid"],
  [personList, "min-h-11", "people action touch target"],
  [personForm, "text-base", "person form mobile input size"],
  [personForm, "grid gap-3 sm:flex", "person form mobile actions"],
  [toolbar, "grid gap-2 sm:flex", "tree toolbar mobile grid"],
  [viewer, "h-[58vh]", "tree viewer mobile height"],
  [viewer, "min-h-[420px]", "tree viewer mobile min height"],
  [nodeCard, "max-w-[78vw]", "node card mobile width cap"],
  [editor, "h-[62vh]", "tree editor mobile height"],
  [editorToolbar, "grid gap-2 sm:flex", "editor toolbar mobile grid"],
  [sidePanel, "min-[380px]:grid-cols-2", "related member mobile segmented controls"],
  [sidePanel, "text-base", "related member mobile inputs"],
  [actionLink, "max-w-full", "shared action max width"],
  [pageHeader, "break-words", "page header long title wrap"],
  [sectionCard, "sm:p-5", "section card mobile padding"],
  [emptyState, "grid gap-3 sm:flex", "empty state mobile actions"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, token, label] of [
  [publicTree, "không cho chỉnh sửa", "public tree read-only copy"],
  [viewer, "/people/${selectedNode.personId}", "public selected profile route"],
  [viewer, "/admin/people/${selectedNode.personId}", "admin selected profile route"],
  [sidePanel, "notes_private", "admin-only private note field remains admin form only"],
]) {
  requireIncludes(content, token, label);
}

for (const [content, token, label] of [
  [publicHome + publicTree + publicProfile + viewer + nodeCard, "notes_private", "public/private note leakage"],
  [publicHome + publicTree + publicProfile + viewer + nodeCard, "source_note", "public source note leakage"],
  [publicHome + publicTree + publicProfile + viewer + nodeCard, "source_notes", "public source notes leakage"],
  [publicHome + publicTree + publicProfile + viewer + nodeCard, "service_role", "service role in public UI"],
  [publicHome + publicTree + publicProfile + viewer + nodeCard, "sb_secret_", "secret literal in public UI"],
]) {
  rejectIncludes(content, token, label);
}

if (packageJson?.scripts?.["check:a14e-mobile-ux-sweep"] !== "node scripts/check-a14e-mobile-ux-sweep.cjs") {
  failures.push("missing package script check:a14e-mobile-ux-sweep");
}

const changedFiles = gitOutput(["diff", "--name-only"])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file ${file}`);
  }
}

for (const file of changedFiles) {
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file.startsWith("db/") || file.endsWith(".sql")) {
    failures.push(`database/sql file changed ${file}`);
  }
  if (/wrangler|open-next|opennext/i.test(file)) {
    failures.push(`Worker/OpenNext/Wrangler file changed ${file}`);
  }
  if (file.startsWith("services/") || file.startsWith("server/services/")) {
    failures.push(`service runtime file changed ${file}`);
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead) {
  const before = JSON.parse(packageHead);
  const beforeDeps = JSON.stringify(before.dependencies ?? {});
  const afterDeps = JSON.stringify(packageJson.dependencies ?? {});
  const beforeDevDeps = JSON.stringify(before.devDependencies ?? {});
  const afterDevDeps = JSON.stringify(packageJson.devDependencies ?? {});

  if (beforeDeps !== afterDeps || beforeDevDeps !== afterDevDeps) {
    failures.push("dependency drift detected");
  }
}

const changedRuntimeContent = changedFiles
  .filter((file) => /\.(tsx?|jsx?)$/.test(file))
  .map((file) => readFile(file))
  .join("\n");

for (const token of [
  "mergePersons",
  "executeMerge",
  "rollbackMerge",
  "dedupePersons",
  "deleteDuplicatePerson",
  "people.merge.execute",
  "service_role",
  "sb_secret_",
  "Bearer ",
  "APPROVE_A13_BACKUP_GATE_CONFIRMED",
]) {
  rejectIncludes(changedRuntimeContent, token, `runtime forbidden token ${token}`);
}

for (const token of [
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
  "INSERT INTO",
  "UPDATE ",
  "DELETE FROM",
  "TRUNCATE",
]) {
  rejectIncludes(changedRuntimeContent, token, `SQL mutation token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A14E_MOBILE_UX_SWEEP.md", "index entry"],
  [workLog, "A-14E - Mobile UX Sweep", "work log entry"],
  [decisionLog, "Decision 173 - A-14E mobile UX polish is UI-only", "decision log entry"],
  [handoff, "A-14E - Mobile UX Sweep completed", "handoff entry"],
]) {
  requireIncludes(content, token, label);
}

if (failures.length > 0) {
  console.error("A-14E mobile UX sweep check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-14E mobile UX sweep check passed.");
