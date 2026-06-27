const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "components/public/public-tree-shell.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "docs/PLAN_A14E_MOBILE_UX_SWEEP.md",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md",
  "components/ui/section-card.tsx",
  "components/ui/page-header.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/action-link.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-home.tsx",
  "components/people/person-list.tsx",
  "components/people/person-form.tsx",
  "components/layout/public-shell.tsx",
  "components/layout/admin-shell.tsx",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
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
const doc = readFile("docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const viewer = readFile("components/tree/family-tree-viewer.tsx");
const toolbar = readFile("components/tree/family-tree-toolbar.tsx");
const editor = readFile("components/tree/family-tree-editor.tsx");
const editorToolbar = readFile("components/tree/tree-editor-toolbar.tsx");
const nodeCard = readFile("components/tree/family-node-card.tsx");
const emptyState = readFile("components/tree/family-tree-empty-state.tsx");
const errorState = readFile("components/tree/family-tree-error-state.tsx");

for (const heading of [
  "## A-14D1 - Audit Tree Interaction UX",
  "## A-14D2 - Tree Toolbar Interaction Polish",
  "## A-14D3 - Mini Help / First-use Guidance",
  "## A-14D4 - Node / Person Card Polish",
  "## A-14D5 - Selected Person Panel / Preview Polish",
  "## A-14D6 - Empty / Loading / Error State Polish",
  "## A-14D7 - Mobile / Touch UX",
  "## A-14D8 - Public/Admin Boundary Guard",
  "## A-14D9 - Vietnamese Copy / Accessibility Sweep",
  "## A-14D10 - Checker",
  "## A-14D11 - Docs / Decision / Handoff",
  "## A-14D12 - Validation",
  "## A-14D13 - Commit",
]) {
  requireIncludes(doc, heading, `A-14D doc section ${heading}`);
}

for (const token of [
  "classic modern genealogy",
  "cổ điển pha hiện đại",
  "Tree Viewer Interaction Polish",
  "Public tree vẫn read-only",
  "Không schema change",
  "Không DB apply",
  "Không check SQL trên DB",
  "Không merge/dedupe runtime",
  "Không permission runtime",
  "Không deploy",
  "BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION",
]) {
  requireIncludes(doc, token, `A-14D doc token ${token}`);
}

for (const token of [
  "Kéo để di chuyển cây",
  "cuộn để phóng to hoặc thu nhỏ",
  "bấm vào một",
  "Vừa màn hình",
  "Phóng to",
  "Thu nhỏ",
  "Đưa cây về giữa",
  "aria-label",
  "title=",
]) {
  requireIncludes(toolbar, token, `viewer toolbar token ${token}`);
}

for (const token of [
  "SelectedPersonPreview",
  "Đang chọn",
  "Chọn một người trên cây",
  "Xem hồ sơ công khai",
  "Mở hồ sơ quản trị",
  "onNodeClick",
  "onPaneClick",
]) {
  requireIncludes(viewer, token, `selected preview token ${token}`);
}

for (const token of [
  "Chế độ chỉnh sửa",
  "Kéo thẻ chỉ đổi bố cục",
  "Lưu bố cục",
  "Vừa màn hình",
  "Phóng to",
  "Thu nhỏ",
  "Đưa cây về giữa",
  "aria-label",
  "title=",
]) {
  requireIncludes(editorToolbar, token, `editor toolbar token ${token}`);
}

for (const token of [
  "bg-[#f7efe1]",
  "color=\"#d8c8ad\"",
]) {
  requireIncludes(editor, token, `editor warm canvas token ${token}`);
}

for (const token of [
  "tabIndex={0}",
  "focus-visible:ring-[#245744]",
  "Đang chọn",
  "Còn sống",
  "Đã mất",
  "Dòng họ:",
  "Chi nhánh:",
]) {
  requireIncludes(nodeCard, token, `node card token ${token}`);
}

for (const token of [
  "Gia phả này chưa có dữ liệu công khai",
  "Hãy thêm thành viên đầu tiên",
]) {
  requireIncludes(emptyState, token, `empty state token ${token}`);
}

for (const token of [
  "Bạn chưa có quyền xem cây gia phả này",
  "Hãy thử tải lại trang",
  "Cây gia phả chưa sẵn sàng hiển thị",
]) {
  requireIncludes(errorState, token, `error state token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md", "index entry"],
  [workLog, "A-14D - Tree Viewer Interaction Polish", "work log entry"],
  [handoff, "A-14D - Tree Viewer Interaction Polish", "handoff entry"],
  [decisionLog, "Decision 172 - A-14D tree interaction polish is UI-only", "Decision 172"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a14d-tree-viewer-interaction-ux"] !==
  "node scripts/check-a14d-tree-viewer-interaction-ux.cjs"
) {
  failures.push("package.json missing check:a14d-tree-viewer-interaction-ux script");
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

for (const [content, label] of [
  [viewer, "viewer"],
  [toolbar, "toolbar"],
  [editor, "editor"],
  [editorToolbar, "editor toolbar"],
  [nodeCard, "node card"],
]) {
  for (const token of [
    "notes_private",
    "source_note",
    "source_notes",
    "private_notes",
    "service_role",
    "sb_secret_",
    "Bearer ",
  ]) {
    rejectIncludes(content, token, `${label} private/secret token ${token}`);
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
  "services",
]);
for (const [label, pattern] of [
  ["mergePersons", /\bmergePersons\b/],
  ["executeMerge", /\bexecuteMerge\b/],
  ["rollbackMerge", /\brollbackMerge\b/],
  ["dedupePersons", /\bdedupePersons\b/],
  ["deleteDuplicatePerson", /\bdeleteDuplicatePerson\b/],
  ["merge route", /\/api\/[^\s]+\/merge\b/],
  ["dedupe route", /\/api\/[^\s]+\/dedupe\b/],
  ["permission runtime registration", /people\.merge\.execute/],
]) {
  if (pattern.test(runtimeDiff)) failures.push(`forbidden runtime pattern ${label}`);
}

const status = gitOutput(["status", "--short", "--untracked-files=all"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();

  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
  if (lowerFile.endsWith(".sql")) failures.push(`SQL file changed: ${file}`);
  if (file.startsWith("db/")) failures.push(`db file changed: ${file}`);
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
    failures.push(`unexpected changed file for A-14D: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-14D tree viewer interaction UX check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-14D tree viewer interaction UX check passed.");
