const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const marker = "A15A2_MODERN_VIETNAMESE_TREE_EDITOR_UI";

const allowedChangedFiles = new Set([
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "app/(admin)/admin/people/[id]/page.tsx",
  "app/(admin)/admin/people/new/page.tsx",
  "app/(admin)/admin/relationships/page.tsx",
  "app/(public)/people/[slug]/page.tsx",
  "app/(admin)/admin/page.tsx",
  "app/(admin)/admin/genealogy/page.tsx",
  "components/genealogy/lineage-admin.tsx",
  "components/people/person-form.tsx",
  "components/relationships/couple-form.tsx",
  "components/relationships/relationship-form.tsx",
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-tree-shell.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/ui/form-submit-button.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A15A2_MODERN_VIETNAMESE_GENEALOGY_TREE_EDITOR_UI.md",
  "docs/PLAN_A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI.md",
  "docs/PLAN_A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI.md",
  "docs/PLAN_A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI.md",
  "docs/PLAN_A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX.md",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a2-vietnamese-traditional-genealogy-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-a15a5-member-profile-person-detail-vietnamese-heritage-ui.cjs",
  "scripts/check-a15a6-add-edit-member-form-vietnamese-heritage-ux.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
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

function rejectPattern(content, pattern, label = String(pattern)) {
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
const doc = readFile("docs/PLAN_A15A2_MODERN_VIETNAMESE_GENEALOGY_TREE_EDITOR_UI.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

const uiFiles = [
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
];
const ui = uiFiles.map(readFile).join("\n");

for (const token of [
  "A-15A2 - Modern Vietnamese Genealogy Tree Editor UI",
  marker,
  "Phạm vi UI-only",
  "không copy code, asset, logo",
  "màn xem/chỉnh sửa cây gia phả",
  "Không đụng",
  "database, migration, seed, schema",
  "API contract, server action contract, service runtime",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  marker,
  "Công cụ chỉnh sửa phả đồ",
  "Chỉnh sửa cây gia phả",
  "Căn giữa",
  "Phóng to",
  "Thu nhỏ",
  "Sắp xếp lại",
  "Lưu bố cục",
  "Thông tin cơ bản",
  "Quan hệ gia đình",
  "Ghi chú",
  "Quyền riêng tư",
  "Thêm người thân",
  "Thêm cha",
  "Thêm mẹ",
  "Thêm vợ/chồng",
  "Thêm con",
  "Sửa / xóa mềm hồ sơ",
  "Thêm người đầu tiên",
  "Người liên quan",
]) {
  requireIncludes(ui, token, `UI token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15A2_MODERN_VIETNAMESE_GENEALOGY_TREE_EDITOR_UI.md", "index entry"],
  [workLog, "A-15A2 - Modern Vietnamese Genealogy Tree Editor UI", "work log entry"],
  [
    decisionLog,
    "Decision 180 - A-15A2 modern Vietnamese tree editor UI is UI-only",
    "decision log entry",
  ],
  [handoff, "A-15A2 - Modern Vietnamese Genealogy Tree Editor UI completed", "handoff entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15a2:modern-vietnamese-genealogy-tree-editor-ui"] !==
  "node scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs"
) {
  failures.push("missing package script check:a15a2:modern-vietnamese-genealogy-tree-editor-ui");
}

const changedFiles = gitOutput(["diff", "--name-only"])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file.startsWith("db/") || file.endsWith(".sql")) {
    failures.push(`database/sql file changed ${file}`);
  }
  if (/schema|migration|seed/i.test(file) && !file.startsWith("docs/")) {
    failures.push(`schema/migration/seed-like file changed ${file}`);
  }
  if (/wrangler|open-next|opennext|cloudflare-env|middleware|next\.config/i.test(file)) {
    failures.push(`Worker/OpenNext/Wrangler/runtime config file changed ${file}`);
  }
  if (
    file.startsWith("app/api/") ||
    file.startsWith("lib/") ||
    file.startsWith("server/") ||
    file.startsWith("services/") ||
    file.startsWith("pages/")
  ) {
    failures.push(`API/service/runtime file changed ${file}`);
  }
  if (/storage-state|storage_state|session|cookie|token|secret|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(file)) {
    failures.push(`possible secret/session/evidence/external asset artifact changed ${file}`);
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

for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\bTRUNCATE\s+TABLE\b/i,
  /\bCREATE\s+POLICY\b/i,
  /\bALTER\s+POLICY\b/i,
  /\bservice_role\b/i,
  /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{12,}/,
  /https?:\/\/(?!localhost|127\.0\.0\.1)/i,
  /phatue|phả\s*tuệ/i,
  /<img\s/i,
  /backgroundImage\s*:/i,
  /url\(["']?https?:/i,
]) {
  rejectPattern(ui, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15A2 Modern Vietnamese Genealogy Tree Editor UI check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15A2 Modern Vietnamese Genealogy Tree Editor UI check passed.");
