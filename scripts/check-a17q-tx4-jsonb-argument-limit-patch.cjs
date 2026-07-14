#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const root = process.cwd();
const failures = [];

const migration0028Path =
  "db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql";
const migration0029Path =
  "db/migrations/20260714_0029_a17q_tx4_jsonb_argument_limit_patch.sql";
const migration0029MirrorPath =
  "supabase/migrations/20260714_0029_a17q_tx4_jsonb_argument_limit_patch.sql";
const verifierPath =
  "db/checks/20260714_check_a17q_tx4_jsonb_argument_limit_patch.sql";

const migration0028Sha =
  "9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7";

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
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

function isGitTracked(relativePath) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", relativePath], {
      cwd: root,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function extractFunctionBody(sql) {
  const startToken =
    "create or replace function public.execute_admin_a17q_legacy_family_reconciliation(";
  const start = sql.indexOf(startToken);
  if (start < 0) {
    failures.push("function definition not found");
    return "";
  }
  const bodyStart = sql.indexOf("as $$", start);
  if (bodyStart < 0) {
    failures.push("function body start not found");
    return "";
  }
  const contentStart = sql.indexOf("\n", bodyStart);
  const bodyEnd = sql.indexOf("\n$$;", contentStart);
  if (bodyEnd < 0) {
    failures.push("function body end not found");
    return "";
  }
  return sql.slice(contentStart + 1, bodyEnd);
}

function isWordBoundary(text, index) {
  return index < 0 || index >= text.length || !/[A-Za-z0-9_.]/.test(text[index]);
}

function scanStateAdvance(text, i, state) {
  if (state.lineComment) {
    if (text[i] === "\n") state.lineComment = false;
    return i;
  }
  if (state.blockComment) {
    if (text[i] === "*" && text[i + 1] === "/") {
      state.blockComment = false;
      return i + 1;
    }
    return i;
  }
  if (state.singleQuote) {
    if (text[i] === "'" && text[i + 1] === "'") return i + 1;
    if (text[i] === "'") state.singleQuote = false;
    return i;
  }
  if (state.dollarQuote) {
    if (text.startsWith(state.dollarQuote, i)) {
      const end = i + state.dollarQuote.length - 1;
      state.dollarQuote = "";
      return end;
    }
    return i;
  }

  if (text[i] === "-" && text[i + 1] === "-") {
    state.lineComment = true;
    return i + 1;
  }
  if (text[i] === "/" && text[i + 1] === "*") {
    state.blockComment = true;
    return i + 1;
  }
  if (text[i] === "'") {
    state.singleQuote = true;
    return i;
  }
  if (text[i] === "$") {
    const match = text.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
    if (match) {
      state.dollarQuote = match[0];
      return i + match[0].length - 1;
    }
  }
  return i;
}

function cloneState() {
  return {
    lineComment: false,
    blockComment: false,
    singleQuote: false,
    dollarQuote: "",
  };
}

function findMatchingParen(text, openIndex) {
  let depth = 0;
  const state = cloneState();
  for (let i = openIndex; i < text.length; i += 1) {
    const beforeState = { ...state };
    const next = scanStateAdvance(text, i, state);
    if (
      beforeState.lineComment ||
      beforeState.blockComment ||
      beforeState.singleQuote ||
      beforeState.dollarQuote ||
      next !== i
    ) {
      i = next;
      continue;
    }
    if (text[i] === "(") depth += 1;
    if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`matching paren not found at ${openIndex}`);
}

function splitTopLevelArgs(inner) {
  const args = [];
  let start = 0;
  let depth = 0;
  const state = cloneState();

  for (let i = 0; i < inner.length; i += 1) {
    const beforeState = { ...state };
    const next = scanStateAdvance(inner, i, state);
    if (
      beforeState.lineComment ||
      beforeState.blockComment ||
      beforeState.singleQuote ||
      beforeState.dollarQuote ||
      next !== i
    ) {
      i = next;
      continue;
    }
    if (inner[i] === "(") depth += 1;
    if (inner[i] === ")") depth -= 1;
    if (inner[i] === "," && depth === 0) {
      args.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }

  const tail = inner.slice(start).trim();
  if (tail) args.push(tail);
  return args;
}

function findJsonbBuildObjectCalls(body) {
  const calls = [];
  const state = cloneState();
  const needle = "jsonb_build_object";

  for (let i = 0; i < body.length; i += 1) {
    const beforeState = { ...state };
    const next = scanStateAdvance(body, i, state);
    if (
      beforeState.lineComment ||
      beforeState.blockComment ||
      beforeState.singleQuote ||
      beforeState.dollarQuote ||
      next !== i
    ) {
      i = next;
      continue;
    }

    if (
      body.slice(i, i + needle.length).toLowerCase() === needle &&
      isWordBoundary(body, i - 1) &&
      isWordBoundary(body, i + needle.length)
    ) {
      const openIndex = body.indexOf("(", i + needle.length);
      const closeIndex = findMatchingParen(body, openIndex);
      const inner = body.slice(openIndex + 1, closeIndex);
      const args = splitTopLevelArgs(inner);
      calls.push({
        start: i,
        end: closeIndex + 1,
        args,
        argCount: args.length,
        source: body.slice(i, closeIndex + 1),
      });
      i = closeIndex;
    }
  }
  return calls;
}

function stringLiteralValue(arg) {
  const trimmed = arg.trim();
  if (!trimmed.startsWith("'")) return null;
  let output = "";
  for (let i = 1; i < trimmed.length; i += 1) {
    if (trimmed[i] === "'" && trimmed[i + 1] === "'") {
      output += "'";
      i += 1;
      continue;
    }
    if (trimmed[i] === "'") return output;
    output += trimmed[i];
  }
  return null;
}

function normalizeExpression(value) {
  return value.replace(/\s+/g, " ").trim();
}

function keyValuePairsFromCalls(calls) {
  const pairs = [];
  for (const call of calls) {
    if (call.args.length % 2 !== 0) {
      failures.push(`jsonb_build_object has odd argument count at body offset ${call.start}`);
      continue;
    }
    for (let i = 0; i < call.args.length; i += 2) {
      const key = stringLiteralValue(call.args[i]);
      if (!key) {
        failures.push(`non-literal jsonb key at body offset ${call.start}: ${call.args[i]}`);
        continue;
      }
      pairs.push({
        key,
        value: normalizeExpression(call.args[i + 1]),
      });
    }
  }
  return pairs;
}

function segmentCalls(body, startNeedle, endNeedle) {
  const start = body.indexOf(startNeedle);
  if (start < 0) {
    failures.push(`segment start not found: ${startNeedle}`);
    return [];
  }
  const end = body.indexOf(endNeedle, start);
  if (end < 0) {
    failures.push(`segment end not found after ${startNeedle}: ${endNeedle}`);
    return [];
  }
  const segment = body.slice(start, end);
  return findJsonbBuildObjectCalls(segment);
}

function assertSamePairs(label, beforePairs, afterPairs) {
  const beforeKeys = beforePairs.map((pair) => pair.key);
  const afterKeys = afterPairs.map((pair) => pair.key);
  const duplicateAfterKeys = afterKeys.filter((key, index) => afterKeys.indexOf(key) !== index);
  if (duplicateAfterKeys.length > 0) {
    failures.push(`${label} duplicate patched keys: ${[...new Set(duplicateAfterKeys)].join(", ")}`);
  }
  if (beforeKeys.join("\n") !== afterKeys.join("\n")) {
    const missing = beforeKeys.filter((key) => !afterKeys.includes(key));
    const added = afterKeys.filter((key) => !beforeKeys.includes(key));
    failures.push(
      `${label} key set/order changed; missing=[${missing.join(", ")}] added=[${added.join(", ")}]`,
    );
  }
  for (let i = 0; i < Math.min(beforePairs.length, afterPairs.length); i += 1) {
    if (beforePairs[i].key !== afterPairs[i].key) continue;
    if (beforePairs[i].value !== afterPairs[i].value) {
      failures.push(`${label} value changed for key ${beforePairs[i].key}`);
    }
  }
}

function assertChunkLimit(label, calls) {
  for (const call of calls) {
    if (call.argCount > 80) {
      failures.push(`${label} patched chunk exceeds 80 args: ${call.argCount}`);
    }
  }
}

function stripSqlStringsAndComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/'(?:''|[^'])*'/g, "''");
}

const migration0028 = read(migration0028Path);
const migration0029 = read(migration0029Path);
const migration0029Mirror = read(migration0029MirrorPath);
const verifier = read(verifierPath);
const packageJson = JSON.parse(read("package.json") || "{}");

const body0028 = extractFunctionBody(migration0028);
const body0029 = extractFunctionBody(migration0029);
const calls0028 = findJsonbBuildObjectCalls(body0028);
const calls0029 = findJsonbBuildObjectCalls(body0029);

if (sha256(migration0028Path) !== migration0028Sha) {
  failures.push(`migration 0028 SHA changed: ${sha256(migration0028Path)}`);
}
if (migration0029 !== migration0029Mirror) failures.push("0029 db/supabase mirrors differ");
if (!isGitTracked(migration0029MirrorPath)) failures.push("0029 Supabase mirror is not tracked");

for (const dir of ["db/migrations", "supabase/migrations"]) {
  for (const entry of fs.readdirSync(path.join(root, dir))) {
    if (/_0030_/.test(entry)) failures.push(`unexpected migration 0030 exists: ${dir}/${entry}`);
  }
}

const oversized0028 = calls0028.filter((call) => call.argCount > 100);
const oversized0029 = calls0029.filter((call) => call.argCount > 100);
if (oversized0028.length !== 2) failures.push(`expected 2 oversized 0028 calls, found ${oversized0028.length}`);
if (oversized0029.length !== 0) failures.push(`0029 oversized jsonb_build_object calls: ${oversized0029.length}`);

const postAudit0028Calls = segmentCalls(
  body0028,
  "jsonb_build_object(\n      'event_type', 'A17Q_LEGACY_FAMILY_RECONCILIATION_COMPLETED'",
  ",\n    v_profile_id,",
);
const postAudit0029Calls = segmentCalls(
  body0029,
  "jsonb_build_object(\n      'event_type', 'A17Q_LEGACY_FAMILY_RECONCILIATION_COMPLETED'",
  ",\n    v_profile_id,",
);
const finalResult0028Calls = segmentCalls(
  body0028,
  "v_result := jsonb_build_object(\n    'status', 'RECONCILIATION_COMPLETED'",
  "\n\n  -- FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION.",
);
const finalResult0029Calls = segmentCalls(
  body0029,
  "v_result := jsonb_build_object(\n    'status', 'RECONCILIATION_COMPLETED'",
  "\n\n  -- FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION.",
);

if (postAudit0028Calls.length !== 1) failures.push(`expected original post-audit builder count 1, found ${postAudit0028Calls.length}`);
if (finalResult0028Calls.length !== 1) failures.push(`expected original final-result builder count 1, found ${finalResult0028Calls.length}`);
if (postAudit0029Calls.length < 2) failures.push(`expected patched post-audit builder chunks, found ${postAudit0029Calls.length}`);
if (finalResult0029Calls.length < 2) failures.push(`expected patched final-result builder chunks, found ${finalResult0029Calls.length}`);

assertChunkLimit("post-mutation audit", postAudit0029Calls);
assertChunkLimit("final success result", finalResult0029Calls);
assertSamePairs(
  "post-mutation audit",
  keyValuePairsFromCalls(postAudit0028Calls),
  keyValuePairsFromCalls(postAudit0029Calls),
);
assertSamePairs(
  "final success result",
  keyValuePairsFromCalls(finalResult0028Calls),
  keyValuePairsFromCalls(finalResult0029Calls),
);

if (postAudit0028Calls[0]?.argCount !== 108) {
  failures.push(`post audit original argument count ${postAudit0028Calls[0]?.argCount}`);
}
if (finalResult0028Calls[0]?.argCount !== 152) {
  failures.push(`final success result original argument count ${finalResult0028Calls[0]?.argCount}`);
}

const compactSignature = `public.execute_admin_a17q_legacy_family_reconciliation(
  text,text,text,text,text,text,text,
  boolean,boolean,boolean,boolean,boolean
)`;
const multilineSignature = `public.execute_admin_a17q_legacy_family_reconciliation(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
)`;

for (const token of [
  "-- A-17Q-TX4: jsonb_build_object argument-limit patch.",
  "create or replace function public.execute_admin_a17q_legacy_family_reconciliation(",
  "p_owner_approval_marker text",
  "p_dry_run_only boolean",
  "returns jsonb",
  "language plpgsql",
  "security definer",
  "set search_path = public, auth, pg_temp",
  `alter function ${multilineSignature} owner to postgres;`,
  `revoke all on function ${compactSignature} from public;`,
  `revoke all on function ${compactSignature} from anon;`,
  `grant execute on function ${compactSignature} to authenticated;`,
  "if auth.uid() is null or v_profile_id is null then",
  "public.has_permission('relationships.update')",
  "public.has_permission('permissions.manage')",
  "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
  "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
  "p_idempotency_key",
  "if p_dry_run_only is true then",
  "insert into public.family_reconciliation_rollback_manifests",
  "insert into public.revisions (",
  "success_result = v_result",
  "success_result_sha256 = v_success_result_sha256",
]) {
  requireIncludes(migration0029, token, `0029 ${token}`);
}

const code0029 = stripSqlStringsAndComments(migration0029);
rejectPattern(code0029, /\bselect\s+public\.execute_admin_a17q_legacy_family_reconciliation\s*\(/i, "executor call in migration 0029");
rejectPattern(code0029, /\balter\s+table\s+public\.\w+\s+disable\s+row\s+level\s+security\b/i, "RLS disable");
rejectPattern(code0029, /\bcreate\s+policy\b/i, "new RLS policy");
rejectPattern(code0029, /\bgrant\s+(?:insert|update|delete|all|all\s+privileges)[^;]*\bto\s+(?:anon|authenticated|public)\b/i, "table write grant expansion");
rejectPattern(code0029, /\bexecute\s*\(/i, "dynamic SQL EXECUTE");

for (const untouchedPath of [
  "lib/reconciliation/a17q-authenticated-execution.ts",
]) {
  if (read(untouchedPath) !== gitHeadContent(untouchedPath)) {
    failures.push(`${untouchedPath} changed unexpectedly`);
  }
}

for (const token of [
  "SELECT_ONLY_VERIFIER=YES",
  "DO_NOT_CALL_EXECUTOR",
  "jsonb_argument_limit_patch",
  "security_definer_enabled",
  "function_owner_postgres",
  "public_execute_grant_absent",
  "anon_execute_grant_absent",
  "authenticated_execute_grant_present",
  "active_family_count",
  "completed_batch_count",
  "rollback_manifest_count",
]) {
  requireIncludes(verifier, token, `verifier ${token}`);
}
rejectPattern(stripSqlStringsAndComments(verifier), /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i, "verifier executor call");
rejectPattern(stripSqlStringsAndComments(verifier), /\b(insert|update|delete|merge|truncate|alter|create|drop|grant|revoke)\b/i, "non-SELECT verifier mutation/DDL");

if (
  packageJson.scripts?.["check:a17q-tx4-jsonb-argument-limit-patch"] !==
  "node scripts/check-a17q-tx4-jsonb-argument-limit-patch.cjs"
) {
  failures.push("package script missing for TX4 checker");
}

if (failures.length > 0) {
  console.error("A17Q TX4 jsonb argument-limit patch check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A17Q_TX4_STATUS=PASS_JSONB_ARGUMENT_LIMIT_PATCH_READY_NOT_APPLIED");
console.log("ROOT_CAUSE_PROVEN=YES");
console.log("RPC_ERROR_MESSAGE=cannot pass more than 100 arguments to a function");
console.log(`POST_MUTATION_AUDIT_ORIGINAL_ARGUMENT_COUNT=${postAudit0028Calls[0].argCount}`);
console.log(`FINAL_SUCCESS_RESULT_ORIGINAL_ARGUMENT_COUNT=${finalResult0028Calls[0].argCount}`);
console.log(`MAX_PATCHED_JSONB_BUILD_OBJECT_ARGUMENT_COUNT=${Math.max(...calls0029.map((call) => call.argCount))}`);
console.log("ALL_JSONB_BUILD_OBJECT_CALLS_WITHIN_LIMIT=YES");
console.log(`PATCHED_POST_AUDIT_CHUNK_ARGUMENT_COUNTS=${postAudit0029Calls.map((call) => call.argCount).join("/")}`);
console.log(`PATCHED_FINAL_RESULT_CHUNK_ARGUMENT_COUNTS=${finalResult0029Calls.map((call) => call.argCount).join("/")}`);
console.log(`MIGRATION_0029_SHA256=${sha256(migration0029Path)}`);
console.log("MIRROR_MATCH=YES");
console.log("MIGRATION_0028_UNCHANGED=YES");
console.log("FUNCTION_SIGNATURE_PRESERVED=YES");
console.log("SECURITY_DEFINER_PRESERVED=YES");
console.log("FUNCTION_OWNER_POSTGRES_PRESERVED=YES");
console.log("FIXED_SEARCH_PATH_PRESERVED=YES");
console.log("GRANTS_PRESERVED=YES");
console.log("HASHES_PRESERVED=YES");
console.log("IDEMPOTENCY_PRESERVED=YES");
console.log("MUTATION_CONTRACT_PRESERVED=YES");
console.log("AUDIT_CONTRACT_PRESERVED=YES");
console.log("SUCCESS_RESULT_KEY_SET_PRESERVED=YES");
