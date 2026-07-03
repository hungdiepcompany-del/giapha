const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE.md";
const pagePath = "app/(admin)/admin/exports/import/page.tsx";
const uploadFormPath = "components/imports/giapha4-manifest-upload-form.tsx";
const uploadRoutePath = "app/api/admin/import-sessions/upload/route.ts";
const officialRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const officialServicePath = "lib/import/giapha4/official-import-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const deployWorkflowPath = ".github/workflows/cloudflare-deploy.yml";
const packagePath = "package.json";

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const page = readFile(pagePath);
const uploadForm = readFile(uploadFormPath);
const uploadRoute = readFile(uploadRoutePath);
const officialRoute = readFile(officialRoutePath);
const officialService = readFile(officialServicePath);
const panel = readFile(panelPath);
const deployWorkflow = readFile(deployWorkflowPath);
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16U-PRODUCTION-IMPORT-UI-DEPLOY-SMOKE",
  "PRODUCTION_IMPORT_UI_STATUS=BLOCKED_NOT_DEPLOYED_AFTER_PUSH",
  "A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE_RESULT=BLOCKED",
  "A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE_BLOCKER=BLOCKED_NOT_DEPLOYED_AFTER_PUSH",
  "8c39f685731fa558155fa710ed495a9491c815e2",
  "1215bb6 yyyyy",
  "/admin/exports/import",
  "POST /api/admin/import-sessions/upload",
  "workflow_dispatch",
  "GitHub push khong dong nghia production deploy",
  "Bạn cần đăng nhập để kiểm tra nhập dữ liệu.",
  "Bạn chưa có quyền imports.create.",
  "A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
  "canRunOfficialImport=false",
  "officialImportButtonDisabled=true",
  "Khong POST `/official-import`",
  "Khong ghi people/relationships/families/layout/tree/revision/profile that",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "GiaPha4ManifestUploadForm",
  "getPermissionContext",
  "Bạn cần đăng nhập để kiểm tra nhập dữ liệu.",
  "Bạn chưa có quyền imports.create.",
]) {
  requireIncludes(page, token, `admin import page token ${token}`);
}

for (const token of [
  'accept=".xlsx,.xls"',
  'fetch("/api/admin/import-sessions/upload"',
  "Tải lên file Gia Phả 4",
  "Chỉ ghi vào vùng staging, chưa nhập vào cây gia phả thật.",
  "Xác nhận nhập chính thức",
  "disabled",
]) {
  requireIncludes(uploadForm, token, `upload form token ${token}`);
}

for (const token of [
  "export async function POST",
  "uploadGiaPha4ManifestStaging",
  "NextResponse.json",
]) {
  requireIncludes(uploadRoute, token, `upload route token ${token}`);
}

for (const token of [
  "workflow_dispatch:",
  "run: npm run deploy",
]) {
  requireIncludes(deployWorkflow, token, `deploy workflow token ${token}`);
}
rejectIncludes(deployWorkflow, "push:", "Cloudflare Deploy auto deploy on push");
rejectIncludes(deployWorkflow, "pull_request:", "Cloudflare Deploy pull request trigger");

for (const token of [
  "canRunOfficialImport: false",
  "A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
]) {
  requireIncludes(officialService, token, `official service token ${token}`);
}

for (const token of [
  "canRunOfficialImport: false",
  "lockedResponse",
]) {
  requireIncludes(officialRoute, token, `official route lock token ${token}`);
}

for (const token of [
  "aria-disabled=\"true\"",
  "Xác nhận nhập chính thức",
]) {
  requireIncludes(panel, token, `manifest panel disabled token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE.md", "index entry"],
  [workLog, "PRODUCTION_IMPORT_UI_STATUS=BLOCKED_NOT_DEPLOYED_AFTER_PUSH", "work log status"],
  [decisionLog, "Decision 241", "decision log entry"],
  [handoff, "PRODUCTION_IMPORT_UI_STATUS=BLOCKED_NOT_DEPLOYED_AFTER_PUSH", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16u-production-import-ui-deploy-smoke"] !==
  "node scripts/check-a16u-production-import-ui-deploy-smoke.cjs"
) {
  failures.push("missing package script check:a16u-production-import-ui-deploy-smoke");
}

for (const [label, content] of [
  [uploadFormPath, uploadForm],
  [pagePath, page],
  [panelPath, panel],
  [docPath, doc],
]) {
  rejectPattern(content, /fetch\s*\([\s\S]{0,240}\/official-import/i, `${label} must not call official import`);
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

rejectPattern(
  doc + uploadForm + page + uploadRoute + panel,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (file === "CHECK_CLOUDFLARE_ACCOUNT.bat" || file === "GUARD.bat") {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(`forbidden staged env file ${file}`);
  }
  if (/\.(xls|xlsx|csv)$/i.test(file)) {
    failures.push(`forbidden staged spreadsheet/csv ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden staged SQL/check file ${file}`);
  }
  if (file === ".github/workflows/cloudflare-deploy.yml") {
    failures.push("deploy workflow must not change in this phase");
  }
}

if (failures.length > 0) {
  console.error("A-16U production import UI deploy smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16U production import UI deploy smoke check passed.");
