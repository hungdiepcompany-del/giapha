const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "components/layout/public-shell.tsx",
  "components/public/public-home.tsx",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A15A1_PUBLIC_HOME_MODERN_HERITAGE_UI.md",
  "package.json",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "scripts/check-a14g-public-browser-visual-smoke.cjs",
  "scripts/check-vietnamese-cultural-ui-ux.cjs",
  "scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs",
  "scripts/check-a15a1-public-home-modern-heritage-ui.cjs",
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
const doc = readFile("docs/PLAN_A15A1_PUBLIC_HOME_MODERN_HERITAGE_UI.md");
const designSpec = readFile("docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const publicHome = readFile("components/public/public-home.tsx");
const publicShell = readFile("components/layout/public-shell.tsx");
const publicUi = `${publicHome}\n${publicShell}`;

for (const token of [
  "A-15A1 - Public Home Modern Heritage UI",
  "Public Home UI only",
  "PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md",
  "Gemini Modern Heritage",
  "UI-only",
  "No DB/schema/migration",
  "No API/action/service logic change",
  "No auth/permission",
  "No route change",
  "No Worker/OpenNext/Wrangler change",
  "No dependency",
  "`PLANNING.MD` not read or committed",
]) {
  requireIncludes(doc, token, `A-15A1 doc token ${token}`);
}

for (const token of [
  "Modern Heritage",
  "Design direction",
  "PublicHome",
]) {
  requireIncludes(designSpec, token, `A-15A0 source token ${token}`);
}

for (const token of [
  "bg-stone-50",
  "text-stone-900",
  "text-stone-600",
  "bg-teal-700",
  "hover:bg-teal-800",
  "bg-amber-50",
  "text-amber-800",
  "border-stone-200",
  "rounded-xl",
  "rounded-2xl",
  "rounded-full",
  "shadow-sm",
  "shadow-md",
  "min-h-11",
  "Lưu giữ ký ức, kết nối các thế hệ.",
  "Cội nguồn yêu thương của dòng họ",
  "Xem cây gia phả",
  "Không gian gia phả cho cả gia đình",
  "Sổ gia phả công khai",
]) {
  requireIncludes(publicUi, token, `Public Home style/copy token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15A1_PUBLIC_HOME_MODERN_HERITAGE_UI.md", "index entry"],
  [workLog, "A-15A1 - Public Home Modern Heritage UI", "work log entry"],
  [
    decisionLog,
    "Decision 178 - A-15A1 applies Modern Heritage to Public Home only",
    "decision log entry",
  ],
  [handoff, "A-15A1 - Public Home Modern Heritage UI completed", "handoff entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15a1-public-home-modern-heritage-ui"] !==
  "node scripts/check-a15a1-public-home-modern-heritage-ui.cjs"
) {
  failures.push("missing package script check:a15a1-public-home-modern-heritage-ui");
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
  if (/wrangler|open-next|opennext/i.test(file)) {
    failures.push(`Worker/OpenNext/Wrangler file changed ${file}`);
  }
  if (
    file.startsWith("app/") ||
    file.startsWith("lib/") ||
    file.startsWith("server/") ||
    file.startsWith("services/") ||
    file.startsWith("pages/")
  ) {
    failures.push(`route/API/service/runtime file changed ${file}`);
  }
  if (
    file.startsWith("components/") &&
    ![
      "components/layout/public-shell.tsx",
      "components/public/public-home.tsx",
    ].includes(file)
  ) {
    failures.push(`non-Public Home component changed ${file}`);
  }
  if (/storage-state|storage_state|session|cookie|token|secret|\.png$|\.jpg$|\.jpeg$/i.test(file)) {
    failures.push(`possible secret/session/evidence artifact changed ${file}`);
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
  /\bTRUNCATE\b/i,
  /\bCREATE\s+POLICY\b/i,
  /\bALTER\s+POLICY\b/i,
  /\bservice_role\b/i,
  /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{12,}/,
  /refresh_token["'\s:=]+[A-Za-z0-9._-]{12,}/i,
  /access_token["'\s:=]+[A-Za-z0-9._-]{12,}/i,
  /Cookie:\s*[^,\n]{12,}/i,
  /mergePerson|dedupePerson|people\.merge\./i,
]) {
  rejectPattern(publicUi, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15A1 Public Home Modern Heritage UI check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15A1 Public Home Modern Heritage UI check passed.");
