const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const marker = "A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI";

const allowedChangedFiles = new Set([
  "app/(admin)/admin/genealogy/page.tsx",
  "app/(admin)/admin/page.tsx",
  "components/genealogy/lineage-admin.tsx",
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/people/person-list.tsx",
  "components/public/public-home.tsx",
  "components/public/public-tree-shell.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/tree/edit/page.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "docs/PLAN_A15A2_MODERN_VIETNAMESE_GENEALOGY_TREE_EDITOR_UI.md",
  "components/ui/section-card.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI.md",
  "docs/PLAN_A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI.md",
  "docs/PLAN_A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI.md",
  "package.json",
  "scripts/check-a14-ui-ux-overhaul.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "scripts/check-a14g-public-browser-visual-smoke.cjs",
  "scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs",
  "scripts/check-a15a1-public-home-modern-heritage-ui.cjs",
  "scripts/check-a15a2-modern-vietnamese-genealogy-tree-editor-ui.cjs",
  "scripts/check-a15a2-vietnamese-traditional-genealogy-ui.cjs",
  "scripts/check-a15a3-vietnamese-heritage-public-tree-view-ui.cjs",
  "scripts/check-a15a4-vietnamese-heritage-family-list-admin-dashboard-ui.cjs",
  "scripts/check-tree-polish-dedupe-readiness-data-quality.cjs",
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
const doc = readFile("docs/PLAN_A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

const uiFiles = [
  "app/(admin)/admin/genealogy/page.tsx",
  "app/(admin)/admin/page.tsx",
  "components/genealogy/lineage-admin.tsx",
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/people/person-list.tsx",
  "components/public/public-home.tsx",
  "components/public/public-tree-shell.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-editor.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/ui/section-card.tsx",
];
const ui = uiFiles.map(readFile).join("\n");

for (const token of [
  "A-15A2 - Vietnamese Traditional Genealogy UI Reference Polish",
  marker,
  "UI/UX only",
  "nền giấy cổ",
  "banner công khai",
  "Xem phả đồ",
  "Danh sách thành viên",
  "Dòng họ",
  "Phả đồ",
  "Website",
  "Quản trị",
  "không mở",
  "database/schema/migration",
  "Worker/OpenNext/Wrangler",
  "external asset/logo/image",
]) {
  requireIncludes(doc, token, `A-15A2 doc token ${token}`);
}

for (const token of [
  marker,
  "Không gian từ đường số của dòng họ",
  "Gia phả dòng họ Việt Nam",
  "Bìa sổ phả hệ",
  "Xem phả đồ",
  "Cách xem phả đồ",
  "Tìm trong phả đồ",
  "Chào mừng trở lại. Hôm nay bạn muốn cập nhật thông tin nào?",
  "Danh sách gia phả",
  "Danh sách thành viên",
  "bg-[#f5eddf]",
  "bg-[#fff8e8]",
  "bg-[#f2dfbd]",
  "text-[#7a2f24]",
  "bg-[#245744]",
]) {
  requireIncludes(ui, token, `UI/copy token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI.md", "index entry"],
  [workLog, "A-15A2 - Vietnamese Traditional Genealogy UI Reference Polish", "work log entry"],
  [
    decisionLog,
    "Decision 179 - A-15A2 applies Vietnamese traditional genealogy UI polish",
    "decision log entry",
  ],
  [handoff, "A-15A2 - Vietnamese Traditional Genealogy UI Reference Polish completed", "handoff entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15a2:vietnamese-traditional-genealogy-ui"] !==
  "node scripts/check-a15a2-vietnamese-traditional-genealogy-ui.cjs"
) {
  failures.push("missing package script check:a15a2:vietnamese-traditional-genealogy-ui");
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
  if (/schema|migration/i.test(file) && !file.startsWith("docs/")) {
    failures.push(`schema/migration-like file changed ${file}`);
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
  /refresh_token["'\s:=]+[A-Za-z0-9._-]{12,}/i,
  /access_token["'\s:=]+[A-Za-z0-9._-]{12,}/i,
  /Cookie:\s*[^,\n]{12,}/i,
  /https?:\/\/(?!localhost|127\.0\.0\.1)/i,
  /<img\s/i,
  /backgroundImage\s*:/i,
  /url\(["']?https?:/i,
]) {
  rejectPattern(ui, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15A2 Vietnamese traditional genealogy UI check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15A2 Vietnamese traditional genealogy UI check passed.");
