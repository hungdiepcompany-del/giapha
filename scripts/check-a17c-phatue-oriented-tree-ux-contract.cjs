#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
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

const doc = read("docs/PLAN_A17C_PHATUE_ORIENTED_TREE_UX_CONTRACT.md");
const summary = read("docs/PLAN_A17AD_TREE_ARCHITECTURE_FOUNDATION_BUNDLE.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17C_STATUS=PHATUE_ORIENTED_UX_CONTRACT_READY_FOR_OWNER_REVIEW",
  "A17C_PHATUE_INSPIRATION_BOUNDARY=STRUCTURAL_PRINCIPLES_ONLY",
  "A17C_INITIAL_VIEW_FOCUS_PERSON_REQUIRED=YES",
  "A17C_VIETNAMESE_SEARCH_NORMALIZATION_REQUIRED=YES",
  "A17C_MODE_LABELS_VIETNAMESE_WITH_DIACRITICS=YES",
  "A17C_FOCUS_PERSON_CONTEXT_DEFINED=YES",
  "A17C_CONNECTED_COMPONENT_BEHAVIOR_DEFINED=YES",
  "A17C_COMPACT_FAMILY_UNIT_VISUAL_DEFINED=YES",
  "A17C_EDITOR_ACTION_LABELS_DEFINED=YES",
  "A17C_SEARCH_NORMALIZATION_CONTRACT_DEFINED=YES",
  "A17C_PUBLIC_PRIVACY_BOUNDARY_PRESERVED=YES",
  "Gia đình trực tiếp",
  "Tổ tiên",
  "Hậu duệ",
  "Toàn bộ cây",
  "Theo chi/nhánh",
  "Người chưa kết nối",
  "Thêm cha",
  "Thêm mẹ",
  "Thêm phối ngẫu",
  "Thêm con",
  "Liên kết người có sẵn",
  "Xem đơn vị gia đình",
  "Chuyển quan hệ sang đơn vị gia đình phù hợp",
  "Có đơn vị gia đình phù hợp",
  "Cần kiểm tra trước khi gộp",
]) {
  requireIncludes(doc, token, `A17C doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17C_PHATUE_ORIENTED_TREE_UX_CONTRACT.md", "index A17C entry"],
  [workLog, "A17C_STATUS=PHATUE_ORIENTED_UX_CONTRACT_READY_FOR_OWNER_REVIEW", "work log A17C status"],
  [decisionLog, "Decision 328 - A-17 canonical family tree foundation accepted for owner review", "decision A17 entry"],
  [handoff, "A17C_STATUS=PHATUE_ORIENTED_UX_CONTRACT_READY_FOR_OWNER_REVIEW", "handoff A17C status"],
  [summary, "A17C_STATUS=PHATUE_ORIENTED_UX_CONTRACT_READY_FOR_OWNER_REVIEW", "summary A17C status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17c-phatue-oriented-tree-ux-contract"] !==
  "node scripts/check-a17c-phatue-oriented-tree-ux-contract.cjs"
) {
  failures.push("missing package script check:a17c-phatue-oriented-tree-ux-contract");
}

rejectPattern(
  doc,
  /COPIED_PROPRIETARY_(CODE|ASSETS|STYLING|SCHEMA)=YES/i,
  "proprietary-copy approval drift",
);
rejectPattern(
  doc + summary,
  /IMPORT_RPC_CALLED=YES|OFFICIAL_IMPORT_RETRY=YES|DEPLOY=YES|PUSH=YES/i,
  "closed safety boundary drift",
);
rejectPattern(
  doc + summary,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);

if (failures.length > 0) {
  console.error("A-17C Phả Tuệ-oriented tree UX contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17C Phả Tuệ-oriented tree UX contract check passed.");
