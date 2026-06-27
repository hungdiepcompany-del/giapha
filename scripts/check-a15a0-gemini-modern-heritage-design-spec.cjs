const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md",
  "package.json",
  "scripts/check-a14a-related-member-add-ux.cjs",
  "scripts/check-a14b-public-tree-home-ux.cjs",
  "scripts/check-a14c-admin-dashboard-layout-ux.cjs",
  "scripts/check-a14d-tree-viewer-interaction-ux.cjs",
  "scripts/check-a14e-mobile-ux-sweep.cjs",
  "scripts/check-a14f-browser-visual-smoke-readiness.cjs",
  "scripts/check-a14g-public-browser-visual-smoke.cjs",
  "scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs",
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

const docPath = "docs/PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md";
const doc = readFile(docPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "DESIGN_SPEC_ACCEPTED_FOR_UI_ONLY_IMPLEMENTATION",
  "Gemini UI/UX design output",
  "Modern Heritage",
  "Di sản Hiện đại",
  "Executive Design Summary",
  "Design Problems",
  "Proposed Visual System",
  "Screen-by-screen Redesign",
  "Tree Viewer / Tree Editor Detailed Redesign",
  "Mobile UX Rules",
  "Vietnamese UX Copy Pack",
  "Component Implementation Checklist For Codex",
  "Do-not-change Boundary",
  "Final Acceptance Criteria",
  "bg-stone-50",
  "text-stone-900",
  "bg-teal-700",
  "text-amber-800",
  "rounded-xl",
  "rounded-2xl",
  "shadow-sm",
  "DEFERRED_REQUIRES_INTERACTION_LOGIC_REVIEW",
  "slide-over selected person panel",
  "bottom navigation",
  "fixed mobile form action bar",
  "drawer/bottom sheet animation",
  "pinch zoom gesture",
  "new avatar/media behavior",
  "any new menu state",
  "any new mutation path",
]) {
  requireIncludes(doc, token, `A-15A0 doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15A0_GEMINI_MODERN_HERITAGE_UI_UX_DESIGN_SPEC.md", "index entry"],
  [workLog, "A-15A0 - Gemini Modern Heritage UI/UX Design Spec", "work log entry"],
  [
    decisionLog,
    "Decision 177 - Gemini Modern Heritage design spec is UI-only source",
    "decision log entry",
  ],
  [handoff, "A-15A0 - Gemini Modern Heritage UI/UX Design Spec completed", "handoff entry"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15a0-gemini-modern-heritage-design-spec"] !==
  "node scripts/check-a15a0-gemini-modern-heritage-design-spec.cjs"
) {
  failures.push("missing package script check:a15a0-gemini-modern-heritage-design-spec");
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
    file.startsWith("components/") ||
    file.startsWith("lib/") ||
    file.startsWith("server/") ||
    file.startsWith("services/") ||
    file.startsWith("pages/")
  ) {
    failures.push(`runtime/UI/API/route file changed ${file}`);
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

const guardedChangedContent = changedFiles
  .filter((file) => {
    if (
      file.startsWith("app/") ||
      file.startsWith("components/") ||
      file.startsWith("lib/") ||
      file.startsWith("server/") ||
      file.startsWith("services/") ||
      file.startsWith("pages/")
    ) {
      return /\.(tsx?|jsx?)$/.test(file);
    }
    return false;
  })
  .map((file) => readFile(file))
  .join("\n");

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
]) {
  rejectPattern(guardedChangedContent, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15A0 Gemini Modern Heritage design spec check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15A0 Gemini Modern Heritage design spec check passed.");
