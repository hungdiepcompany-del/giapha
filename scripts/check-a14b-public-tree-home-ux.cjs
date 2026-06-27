const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "app/(public)/people/[slug]/page.tsx",
  "components/layout/public-shell.tsx",
  "components/public/public-home.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-tree-shell.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs",
  "docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md",
  "ui_ux_design_specification.md",
  "docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
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
  "app/(admin)/admin/page.tsx",
  "app/(admin)/admin/people/page.tsx",
  "components/layout/admin-shell.tsx",
  "components/people/person-form.tsx",
  "components/people/person-list.tsx",
  "components/ui/action-link.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/page-header.tsx",
  "components/ui/section-card.tsx",
  "components/ui/status-callout.tsx",
  "docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "docs/PLAN_A14E_MOBILE_UX_SWEEP.md",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md",
  "docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md",
  "scripts/check-a14g-public-browser-visual-smoke.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
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
const doc = readFile("docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

const files = {
  publicShell: readFile("components/layout/public-shell.tsx"),
  publicHome: readFile("components/public/public-home.tsx"),
  publicTree: readFile("components/public/public-tree-shell.tsx"),
  publicPerson: readFile("components/public/public-person-profile.tsx"),
  publicPersonPage: readFile("app/(public)/people/[slug]/page.tsx"),
  treeViewer: readFile("components/tree/family-tree-viewer.tsx"),
  treeToolbar: readFile("components/tree/family-tree-toolbar.tsx"),
  nodeCard: readFile("components/tree/family-node-card.tsx"),
  emptyState: readFile("components/tree/family-tree-empty-state.tsx"),
  errorState: readFile("components/tree/family-tree-error-state.tsx"),
  publicService: readFile("lib/family/public-family-service.ts"),
};

const publicUi = [
  files.publicShell,
  files.publicHome,
  files.publicTree,
  files.publicPerson,
  files.publicPersonPage,
  files.treeViewer,
  files.treeToolbar,
  files.nodeCard,
  files.emptyState,
  files.errorState,
].join("\n");

for (const token of [
  "Status: `PASS_LOCAL_STATIC`",
  "A-14B1 - Audit Public/Home UX",
  "A-14B2 - Public Visual System Polish",
  "A-14B3 - Home / Landing Page UX",
  "A-14B4 - Public Tree Viewer UX",
  "A-14B5 - Public Person Detail / Preview UX",
  "A-14B6 - Responsive / Accessibility",
  "A-14B7 - Vietnamese Copy Sweep",
  "A-14B8 - Checker",
  "A-14B9 - Docs / Decision / Handoff",
  "A-14B10 - Validation",
  "A-14B11 - Commit boundary",
  "cổ điển pha hiện đại",
  "DB chưa apply",
  "check SQL chưa chạy trên DB",
  "runtime merge/dedupe vẫn đóng",
  "permission runtime chưa đăng ký",
  "backup gate chưa bị bypass",
  "Không deploy trong phase này",
]) {
  requireIncludes(doc, token, `A-14B doc token ${token}`);
}

for (const token of [
  "PLAN_A14B_PUBLIC_TREE_HOME_UX.md",
  "A-14B - Public Tree / Home UX Classic Modern Polish",
]) {
  requireIncludes(index, token, `index token ${token}`);
  requireIncludes(workLog, token, `work log token ${token}`);
  requireIncludes(handoff, token, `handoff token ${token}`);
}

requireIncludes(
  decisionLog,
  "Decision 170 - A-14B public UX polish is UI-only",
  "Decision 170",
);
requireIncludes(
  `${doc}\n${handoff}\n${decisionLog}`,
  "BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION",
  "backup gate remains blocked",
);

for (const token of [
  "Lưu giữ ký ức gia đình",
  "Lưu giữ ký ức gia đình, kết nối các thế hệ",
  "Không gian gia phả cho cả gia đình",
  "Khám phá cây gia phả",
  "Đăng nhập quản trị",
  "Sổ gia phả công khai",
  "Lưu giữ dòng họ",
  "Xem cây trực quan",
  "Bảo vệ riêng tư",
  "Dữ liệu lâu dài",
  "Cách xem cây",
  "Kéo nền để di chuyển",
  "cuộn để phóng to hoặc thu nhỏ",
  "Tìm người trong cây",
  "Vừa màn hình",
  "Đưa cây về giữa",
  "Chưa có dữ liệu cây gia phả",
  "Không thể tải cây gia phả",
  "Thông tin này đang được gia đình cập nhật",
  "Bảo vệ thông tin người còn sống",
  "Công khai chỉ đọc",
]) {
  requireIncludes(publicUi, token, `public Vietnamese UX token ${token}`);
}

for (const token of [
  "bg-[#fbf4e8]",
  "bg-[#fffaf0]",
  "text-stone-950",
  "text-[#8a4b2a]",
  "rounded-md",
  "min-h-11",
  "title=\"Đưa toàn bộ cây vào khung nhìn\"",
  "title=\"Đưa cây về giữa và sắp xếp lại trong chế độ xem\"",
  "aria-live=\"polite\"",
]) {
  requireIncludes(publicUi, token, `classic modern/accessibility token ${token}`);
}

for (const token of [
  "notes_private",
  "source_note",
  "source_notes",
  "private_notes",
  "service_role",
  "sb_secret_",
  "eyJhbGci",
  "Bearer ",
]) {
  rejectIncludes(publicUi, token, `public secret/private token ${token}`);
}

for (const token of [
  "mergePerson",
  "dedupePerson",
  "people.merge.execute",
  "people.merge.rollback",
  "APPROVE_A13_MERGE_DEDUPE_DB_SCHEMA_VERIFIED",
]) {
  rejectIncludes(publicUi, token, `public merge/dedupe token ${token}`);
}

for (const token of [
  "sanitizePersonForMode",
  "sanitizeTreeGraphForMode",
  "visibility",
  "public",
]) {
  requireIncludes(files.publicService, token, `public privacy service token ${token}`);
}

if (
  packageJson?.scripts?.["check:a14b-public-tree-home-ux"] !==
  "node scripts/check-a14b-public-tree-home-ux.cjs"
) {
  failures.push("package.json missing check:a14b-public-tree-home-ux script");
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
    failures.push("dev dependencies changed");
  }
}

const status = gitOutput(["status", "--short", "--untracked-files=all"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const lowerFile = file.toLowerCase();
  if (file === "PLANNING.MD") failures.push("PLANNING.MD changed or staged");
  if (lowerFile.endsWith(".sql")) failures.push(`SQL file changed: ${file}`);
  if (file.startsWith("db/migrations/")) {
    failures.push(`migration changed: ${file}`);
  }
  if (
    /(^|\/)(wrangler\.toml|wrangler\.jsonc|open-next\.config\.ts|next\.config\.ts)$/.test(
      file,
    ) ||
    file.startsWith(".github/workflows/") ||
    file.startsWith("services/")
  ) {
    failures.push(`Worker/OpenNext/Wrangler/deploy drift: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected changed file for A-14B: ${file}`);
  }
}

const runtimeDiff = gitOutput(["diff", "--", "app", "components", "lib", "server"]);
for (const pattern of [
  /\bmergePerson\b/,
  /\bdedupePerson\b/,
  /\bdeleteDuplicatePerson\b/,
  /\bpeople\.merge\.(?:execute|rollback|approve)\b/,
  /\bsupabase\.from\(["']people["']\)\.delete\b/,
  /\bsupabase\.from\(["']people["']\)\.update\b/,
]) {
  rejectPattern(runtimeDiff, pattern, `runtime mutation pattern ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-14B public tree/home UX check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-14B public tree/home UX check passed.");
