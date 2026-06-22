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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const packageJson = readJson("package.json");

const files = {
  adminBackups: readFile("app/(admin)/admin/backups/page.tsx"),
  backupPanel: readFile("components/admin/backup-operator-dry-run-panel.tsx"),
  adminHome: readFile("app/(admin)/admin/page.tsx"),
  adminShell: readFile("components/layout/admin-shell.tsx"),
  coupleForm: readFile("components/relationships/couple-form.tsx"),
  doc: readFile("docs/UI_VN_01_VIETNAMESE_UI_COPY_NORMALIZATION.md"),
  exportsImportPage: readFile("app/(admin)/admin/exports/import/page.tsx"),
  exportsPage: readFile("app/(admin)/admin/exports/page.tsx"),
  familyToolbar: readFile("components/tree/family-tree-toolbar.tsx"),
  importForm: readFile("components/imports/json-import-preview-form.tsx"),
  lineageActions: readFile("app/(admin)/admin/genealogy/actions.ts"),
  lineageAdmin: readFile("components/genealogy/lineage-admin.tsx"),
  lineageService: readFile("lib/family/lineage-service.ts"),
  peopleForm: readFile("components/people/person-form.tsx"),
  peopleList: readFile("components/people/person-list.tsx"),
  peoplePage: readFile("app/(admin)/admin/people/page.tsx"),
  publicHome: readFile("components/public/public-home.tsx"),
  publicPerson: readFile("components/public/public-person-profile.tsx"),
  publicService: readFile("lib/family/public-family-service.ts"),
  publicTree: readFile("components/public/public-tree-shell.tsx"),
  relationshipForm: readFile("components/relationships/relationship-form.tsx"),
  relationshipSummary: readFile("components/relationships/relationship-summary.tsx"),
  relationshipsPage: readFile("app/(admin)/admin/relationships/page.tsx"),
  revisionsDetail: readFile("app/(admin)/admin/revisions/[id]/page.tsx"),
  revisionsPage: readFile("app/(admin)/admin/revisions/page.tsx"),
  systemStatus: readFile("app/(admin)/admin/system/status/page.tsx"),
  treeEditPage: readFile("app/(admin)/admin/tree/edit/page.tsx"),
  treeGraphBuilder: readFile("lib/family/tree-graph-builder.ts"),
  treeLayoutService: readFile("lib/family/tree-layout-service.ts"),
  treePage: readFile("app/(admin)/admin/tree/page.tsx"),
  treeSidePanel: readFile("components/tree/tree-editor-side-panel.tsx"),
  treeToolbar: readFile("components/tree/tree-editor-toolbar.tsx"),
  unauthorized: readFile("app/unauthorized/page.tsx"),
};

const combinedUi = Object.values(files).join("\n");

for (const token of [
  "Không đủ quyền",
  "Lý do:",
  "Trình sửa cây gia phả",
  "Vừa khung nhìn",
  "Tự xếp bố cục",
  "Đặt lại bố cục",
  "Bảng chi tiết",
  "Thẻ gia đình",
  "Phạm vi hiển thị",
  "Công khai",
  "Riêng tư",
  "Nội bộ gia đình",
  "Sao lưu / Xuất dữ liệu",
  "Trang công khai",
  "Cây gia phả công khai",
  "Hồ sơ công khai",
  "Tải lên family.json",
  "Xung đột DB",
  "Nền tảng quản lý quan hệ",
  "Nền tảng quản lý thành viên",
  "Nền tảng xem cây gia phả",
  "Nền tảng chỉnh sửa cây gia phả",
  "Đơn vị gia đình",
  "Chưa cấu hình Supabase.",
  "Không tìm thấy dòng họ.",
  "Trạng thái kiểm tra thử",
  "Chạy kiểm tra thử",
  "Trường thay đổi",
  "Trạng thái hệ thống",
]) {
  requireIncludes(combinedUi, token, `Vietnamese UI copy ${token}`);
}

const forbiddenByFile = [
  ["app/unauthorized/page.tsx", files.unauthorized, ["Permission denied", "Reason:"]],
  [
    "components/tree/tree-editor-toolbar.tsx",
    files.treeToolbar,
    ["Tree editor", "Fit view", "Auto layout", "Reset layout"],
  ],
  [
    "components/tree/family-tree-toolbar.tsx",
    files.familyToolbar,
    ["Fit view", "Reset layout"],
  ],
  [
    "components/tree/tree-editor-side-panel.tsx",
    files.treeSidePanel,
    ["Side panel", "Family node", "person node", "family node"],
  ],
  [
    "components/people/person-list.tsx",
    files.peopleList,
    ['return "Public";', 'return "Private";', 'return "Family";', ">Visibility<"],
  ],
  [
    "components/people/person-form.tsx",
    files.peopleForm,
    ["Family - chỉ nội bộ", "Private -", "Public -", ">Visibility<"],
  ],
  [
    "components/layout/admin-shell.tsx",
    files.adminShell,
    ['label: "Genealogy"', 'label: "Backup / Export"', ">Public<", "User:", "Roles:", "Permissions:"],
  ],
  [
    "components/imports/json-import-preview-form.tsx",
    files.importForm,
    [
      '"Exported at"',
      '"People"',
      '"Families"',
      '"Family parents"',
      '"Family children"',
      '"Tree layouts"',
      '"Tree nodes"',
      "Upload family.json",
      "preview và validate",
      "Xác nhận import",
      ">Validation<",
      ">Conflict DB<",
      "conflict DB",
    ],
  ],
  [
    "app/(admin)/admin/exports/page.tsx",
    files.exportsPage,
    ["Export/backup foundation", 'title="Backup / Export"', "Import foundation", "Import hiện chỉ preview", "conflict"],
  ],
  [
    "app/(admin)/admin/exports/import/page.tsx",
    files.exportsImportPage,
    ["Import JSON foundation", "Upload hoặc paste", "Import confirm vẫn disabled", "Quay lại Backup / Export", "Preview không ghi"],
  ],
  [
    "app/(admin)/admin/revisions/page.tsx",
    files.revisionsPage,
    ["Revision history foundation", ">Entity<", ">Action<", ">Entity ID<"],
  ],
  [
    "app/(admin)/admin/revisions/[id]/page.tsx",
    files.revisionsDetail,
    ["Revision detail", "Diff field", "Revision items", "Before JSON", "After JSON", ">Action<", ">Entity<"],
  ],
  [
    "app/(admin)/admin/backups/page.tsx",
    files.adminBackups,
    ["Backup operator dry-run", "Backup dry-run", "Operator panel", "Dry-run only", "real worker call"],
  ],
  [
    "components/admin/backup-operator-dry-run-panel.tsx",
    files.backupPanel,
    ["Dry-run only", "No production backup", "No storage upload", "No restore", "No real worker call", "Operator dry-run status", "Run dry-run check", "Checking..."],
  ],
  [
    "lib/family/lineage-service.ts",
    files.lineageService,
    ["Supabase is not configured.", "You need to sign in.", "Missing one of:", "Clan not found.", "Branch not found.", "Generation rule not found.", "Membership not found.", "Could not create", "Could not update"],
  ],
];

for (const [relativePath, content, tokens] of forbiddenByFile) {
  for (const token of tokens) {
    rejectIncludes(content, token, `${relativePath} contains ${token}`);
  }
}

if (
  packageJson?.scripts?.["check:vietnamese-ui-copy"] !==
  "node scripts/check-vietnamese-ui-copy.cjs"
) {
  failures.push("package.json missing check:vietnamese-ui-copy script");
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

for (const token of [
  "Status: `PASS_LOCAL_STATIC`",
  "Summary",
  "UI Text Normalized",
  "Textfield And Placeholder Normalized",
  "Combobox And Dropdown Normalized",
  "Code/Internal Values Unchanged",
  "Checker Result",
  "Validation Results",
  "Explicitly Not Done",
  "No migration.",
  "No `.sql` file.",
  "No DB apply.",
  "No SQL mutation.",
  "No seed/backfill.",
  "No runtime dependency added.",
  "No Worker created.",
  "No OpenNext/Wrangler config change.",
  "No deploy.",
  "No push.",
]) {
  requireIncludes(files.doc, token, `doc token ${token}`);
}

const changedFiles = gitOutput(["status", "--short"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const changedFile of changedFiles) {
  if (changedFile === "PLANNING.MD" || changedFile.endsWith("/PLANNING.MD")) {
    failures.push("PLANNING.MD is modified or staged");
  }
  if (changedFile.endsWith(".sql") || changedFile.startsWith("db/migrations/")) {
    failures.push(`SQL/migration file changed: ${changedFile}`);
  }
}

if (failures.length > 0) {
  console.error("Vietnamese UI copy check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Vietnamese UI copy check passed.");
