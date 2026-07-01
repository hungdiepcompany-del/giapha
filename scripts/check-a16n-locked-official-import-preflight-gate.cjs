const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath = "docs/PLAN_A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE.md";
const checkerPath = "scripts/check-a16n-locked-official-import-preflight-gate.cjs";
const servicePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

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

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const checker = readFile(checkerPath);
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16N",
  "official-import-gate",
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
  "APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE",
  "Cổng nhập chính thức",
  "Nhập chính thức chưa được mở",
  "Xác nhận nhập chính thức — chưa mở",
  "A16N_STATUS=LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_READY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE",
  "A16P_REQUIRED_OFFICIAL_IMPORT_MARKER",
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
  "getOfficialImportPreflightGate",
  "buildOfficialImportPreflightGateFromManifest",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of ["export async function GET", "getOfficialImportPreflightGate"]) {
  requireIncludes(route, token, `route token ${token}`);
}
rejectPattern(route, /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/, "non-GET route method");

for (const token of [
  "Cổng nhập chính thức",
  "Nhập chính thức chưa được mở",
  "officialImportGate.requiredFutureMarker",
  "Xác nhận nhập chính thức — chưa mở",
  "disabled",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16n-locked-official-import-preflight-gate"] !==
  "node scripts/check-a16n-locked-official-import-preflight-gate.cjs"
) {
  failures.push("missing package script check:a16n-locked-official-import-preflight-gate");
}

for (const [content, token, label] of [
  [index, "PLAN_A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE.md", "index entry"],
  [workLog, "A16N_STATUS=LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_READY", "work log marker"],
  [handoff, "A16N_STATUS=LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_READY", "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

const runtimePatch = gitOutput(["diff", "--", servicePath, routePath, panelPath]);
for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+[a-z_]/i,
  /\bDELETE\s+FROM\b/i,
  /\.from\(["']people["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_parents["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']family_children["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']couple_relationships["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']tree_layouts?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
  /\.from\(["']revisions?["']\)[\s\S]{0,240}\.(insert|update|delete|upsert)\(/i,
]) {
  rejectPattern(runtimePatch, pattern, `runtime patch ${pattern}`);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
for (const file of changedFiles) {
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration file changed ${file}`);
  }
  if (/\.(xls|xlsx|csv|png|jpg|jpeg|webp|zip)$/i.test(file)) {
    failures.push(`real data/storage/screenshot file changed ${file}`);
  }
}

for (const [file, content] of [
  [docPath, doc],
  [checkerPath, checker],
  [servicePath, service],
  [routePath, route],
  [panelPath, panel],
]) {
  for (const pattern of [
    /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /postgresql:\/\/[^`\s]+/i,
  ]) {
    rejectPattern(content, pattern, `${file} ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("A-16N locked official import preflight gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16N locked official import preflight gate check passed.");
