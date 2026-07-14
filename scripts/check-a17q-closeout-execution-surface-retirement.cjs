#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = process.cwd();
const failures = [];

const files = {
  page: "app/(admin)/admin/reconciliation/a17q/execute/page.tsx",
  route: "app/api/admin/a17q/reconciliation-execute/route.ts",
  nav: "components/layout/admin-shell.tsx",
  service: "lib/reconciliation/a17q-authenticated-execution.ts",
  migration0028:
    "db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql",
  migration0029:
    "db/migrations/20260714_0029_a17q_tx4_jsonb_argument_limit_patch.sql",
  finalVerifier:
    "db/checks/20260714_check_a17q_exec2_final_post_reconciliation_verification.sql",
};

const expectedSha = {
  migration0028:
    "9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7",
  migration0029:
    "F73DB2848156306A03975C7CA8918087673E7BF3380A4D94FF0B1DC403D9DA7C",
};

const knownHashes = [
  "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
  "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function sha256(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest("hex")
    .toUpperCase();
}

function gitHeadContent(relativePath) {
  try {
    return execFileSync("git", ["show", `HEAD:${relativePath}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    failures.push(`unable to read HEAD:${relativePath}`);
    return "";
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function countMatches(content, pattern) {
  return content.match(pattern)?.length ?? 0;
}

function stripCommentsAndStrings(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/"(?:\\"|[^"])*"/g, '""');
}

const page = read(files.page);
const route = read(files.route);
const nav = read(files.nav);
const service = read(files.service);
const finalVerifier = read(files.finalVerifier);
const packageJson = JSON.parse(read("package.json") || "{}");

for (const token of [
  "A-17Q đã hoàn tất",
  "21 nhóm gia đình trùng lặp đã được đối soát và hợp nhất thành công.",
  "38 gia đình đang hoạt động",
  "68 quan hệ cha/mẹ đang hoạt động",
  "73 quan hệ con đang hoạt động",
  "Không mất quan hệ con",
  "Không phát hiện chu trình tổ tiên",
  "Bằng chứng thực thi và hoàn tác đã được lưu",
  "Hoàn tất ngày 14/07/2026.",
]) {
  requireIncludes(page, token, `completion page ${token}`);
}

for (const token of [
  "Quay lại trang quản trị",
  "Xem cây gia phả",
  "Xem lịch sử đối soát",
]) {
  requireIncludes(page, token, `read-only navigation ${token}`);
}

for (const hash of knownHashes) {
  rejectPattern(page, new RegExp(hash, "i"), `rendered immutable hash ${hash}`);
}

for (const forbidden of [
  /A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES/,
  /A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE/,
  /A17Q_AUTHENTICATED_EXECUTION_IDEMPOTENCY_KEY/,
  /A17Q_AUTHENTICATED_EXECUTION_OWNER_APPROVAL_MARKER/,
  /A17Q_AUTHENTICATED_EXECUTION_ROUTE/,
  /A17Q_AUTHENTICATED_EXECUTION_RPC_NAME/,
  /A17QAuthenticatedExecutionClient/,
  /EXECUTE_A17Q_21_GROUP_RECONCILIATION/,
  /A17Q_EXEC1_SINGLE_EXECUTION_20260714_FBBF24C_001/,
  /execute_admin_a17q_legacy_family_reconciliation/,
  /OWNER_APPROVAL_MARKER/,
  /DECISION_PACK_SHA256/,
  /APPROVED_GROUP_PLAN_SHA256/,
  /ROLE_CORRECTION_PLAN_SHA256/,
  /EXCLUDED_SCOPE_SHA256/,
  /FORECAST_SHA256/,
  /P_DRY_RUN_ONLY/,
  /PERMISSION_COUNT/,
  /REQUIRED_PERMISSIONS_PRESENT/,
  /RPC=/,
  /ROUTE=/,
  /raw JSON/i,
]) {
  rejectPattern(page, forbidden, `page debug/operation token ${forbidden}`);
}

for (const forbidden of [
  /<form\b/i,
  /<input\b/i,
  /type="checkbox"/i,
  /<button\b/i,
  /onClick=/,
  /fetch\(/,
  /method:\s*"POST"/,
]) {
  rejectPattern(page, forbidden, `page execution control ${forbidden}`);
}

requireIncludes(route, "status: \"RETIRED\"", "retired status");
requireIncludes(route, "A17Q_RECONCILIATION_ALREADY_COMPLETED", "retired code");
requireIncludes(route, "rpcCalled: false", "rpcCalled false");
requireIncludes(route, "{ status: 410 }", "HTTP 410 response");
requireIncludes(route, "export async function POST()", "POST retired handler");
requireIncludes(route, "export async function GET()", "GET retired handler");
requireIncludes(route, "export async function PUT()", "PUT retired handler");
requireIncludes(route, "export async function PATCH()", "PATCH retired handler");
requireIncludes(route, "export async function DELETE()", "DELETE retired handler");
rejectPattern(route, /executeA17QAuthenticatedSingleExecution/, "execution helper import/call");
rejectPattern(route, /A17QAuthenticatedExecutionRequest/, "execution request type import");
rejectPattern(route, /request\.json\(|confirmationPhrase|confirmBackupReviewed|confirmRollbackReviewed|confirmAuditReviewed|confirmExcludedScopeReviewed/, "request body reactivation path");
rejectPattern(route, /\.rpc\s*\(/, "Supabase RPC call");
rejectPattern(route, /createServerSupabaseClient|createAdminSupabaseClient|SUPABASE_SERVICE_ROLE/i, "Supabase client in retired route");

rejectPattern(nav, /href:\s*"\/admin\/reconciliation\/a17q\/execute"/, "active nav to execution page");
rejectPattern(nav, /A-17Q execute|Execute A-17Q|Authenticated reconciliation execution|single reconciliation execution/i, "mutation-oriented navigation label");
rejectPattern(nav, /\/api\/admin\/a17q\/reconciliation-execute/, "navigation link to mutation API");

for (const [key, relativePath] of Object.entries({
  migration0028: files.migration0028,
  migration0029: files.migration0029,
})) {
  const actual = sha256(relativePath);
  if (actual !== expectedSha[key]) failures.push(`${relativePath} SHA changed: ${actual}`);
}

if (finalVerifier !== gitHeadContent(files.finalVerifier)) {
  failures.push("final SELECT-only verifier changed during closeout");
}
rejectPattern(finalVerifier, /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i, "final verifier executor call");

for (const dir of ["db/migrations", "supabase/migrations"]) {
  for (const entry of fs.readdirSync(path.join(root, dir))) {
    if (/_0030_/.test(entry)) failures.push(`unexpected new migration exists: ${dir}/${entry}`);
  }
}

const routeCode = stripCommentsAndStrings(route);
if (countMatches(routeCode, /executeA17QAuthenticatedSingleExecution/g) !== 0) {
  failures.push("EXECUTION_HELPER_CALL_COUNT is not 0");
}
if (countMatches(routeCode, /\.rpc\s*\(/g) !== 0) {
  failures.push("SUPABASE_RPC_CALL_COUNT is not 0");
}
requireIncludes(service, "p_dry_run_only: false", "historical execution helper unchanged");
requireIncludes(service, ".rpc(A17Q_AUTHENTICATED_EXECUTION_RPC_NAME", "historical RPC helper retained for audit source history");

if (
  packageJson.scripts?.["check:a17q-closeout-execution-surface-retirement"] !==
  "node scripts/check-a17q-closeout-execution-surface-retirement.cjs"
) {
  failures.push("missing package script check:a17q-closeout-execution-surface-retirement");
}

if (failures.length > 0) {
  console.error("A17Q closeout execution surface retirement check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A17Q_CLOSEOUT_STATUS=PASS_SOURCE_EXECUTION_SURFACE_RETIRED_NOT_DEPLOYED");
console.log("EXECUTION_PAGE_RETIRED=YES");
console.log("READ_ONLY_COMPLETION_SCREEN_VISIBLE=YES");
console.log("DEBUG_CONTRACT_REMOVED=YES");
console.log("CONFIRMATION_PHRASE_REMOVED=YES");
console.log("REVIEW_CHECKBOXES_REMOVED=YES");
console.log("EXECUTE_BUTTON_REMOVED=YES");
console.log("INTERNAL_HASHES_REMOVED_FROM_UI=YES");
console.log("IDEMPOTENCY_KEY_REMOVED_FROM_UI=YES");
console.log("EXECUTION_API_RETIRED=YES");
console.log("API_HTTP_STATUS=410");
console.log("API_STATUS=RETIRED");
console.log("API_CODE=A17Q_RECONCILIATION_ALREADY_COMPLETED");
console.log("API_RPC_CALLED=false");
console.log("EXECUTION_HELPER_CALL_COUNT=0");
console.log("SUPABASE_RPC_CALL_COUNT=0");
console.log("EXECUTION_NAVIGATION_REMOVED=YES");
console.log("READ_ONLY_HISTORY_PRESERVED=YES");
