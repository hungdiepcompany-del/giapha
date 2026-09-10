# PLAN A17R1: Windows Clean Build and Local Tree Visual Smoke

## 1. Mục tiêu

Xác minh:
- Khôi phục môi trường build sạch trên Windows (EPERM `.next/trace`).
- Chạy build production từ source candidate A17R (commit `4df19d1f`).
- Khởi động local runtime và chạy visual smoke tree viewer.
- Ghi nhận evidence đầy đủ cho gate chuyển sang A17S.
- Không sửa code nếu không có bằng chứng trực tiếp từ smoke.

---

## 2. A17R Source Baseline

```text
PHASE_SOURCE=A17R_TREE_GRAPH_ROUTING_AND_FAMILY_JUNCTION_RUNTIME
COMMIT=4df19d1f9a73aec314360c1507f174a6c52d61af
A17R_CHECKER_AT_COMMIT=PASS
TYPECHECK_AT_COMMIT=PASS
LINT_AT_COMMIT=PASS
```

---

## 3. Preflight Git State

```text
PRE_PHASE_BRANCH=main
PRE_PHASE_HEAD=4df19d1f9a73aec314360c1507f174a6c52d61af
EXPECTED_A17R_HEAD=4df19d1f9a73aec314360c1507f174a6c52d61af
HEAD_MATCHES_EXPECTED_A17R=YES
PRE_PHASE_STATUS=16 M files (OAuth/auth ngoài scope), 4 ?? untracked (auth/OAuth)
PRE_PHASE_AHEAD_BEHIND=2 ahead, 0 behind
PRE_PHASE_REMOTE=origin git@github-giapha:hungdiepcompany-del/giapha.git
```

Dirty files ngoài scope (OAuth/Auth - không được touch):
- `_guard/PROJECT_GUARD_ENGINE.bat`, `_guard/README.md`, `_guard/deploy/DEPLOY_CLOUDFLARE_OPENNEXT.bat`
- `app/auth/callback/route.ts`, `app/auth/login/page.tsx`, `app/auth/logout/route.ts`
- `components/auth/login-form.tsx`
- `docs/08_AI_WORK_LOG.md`, `docs/09_DECISION_LOG.md`, `docs/20_CUSTOM_DOMAIN_CUTOVER_READINESS.md`, `docs/99_NEXT_AI_HANDOFF.md`
- `lib/permissions/require-permission.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`
- `scripts/check-a15c2-*.cjs`, `scripts/smoke-a15c2-*.cjs`
- Untracked: `lib/auth/auth-diagnostics.ts`, `lib/auth/auth-flow.ts`, `lib/supabase/auth-storage.ts`, `scripts/check-google-oauth-single-click-login-fix.cjs`

---

## 4. Process-Lock Audit

```text
RELATED_PROCESS_COUNT=6 (thuộc repository này)
RELATED_PROCESS_LIST=
  PID 24164 - npm run dev (npm)
  PID 28012 - cmd.exe next dev
  PID 20996 - node next dist/bin/next dev
  PID 10724 - node next dist/server/lib/start-server.js
  PID 420   - node .next/dev/build/...js worker
  PID 23028 - node .next/dev/build/...js worker
STOPPED_PIDS=24164, 28012, 20996, 10724, 420, 23028
```

---

## 5. Artifact Cleanup

`.next` không xóa được hoàn toàn do file `trace` và `trace-build` bị khóa bởi OS (EPERM). Biện pháp đã áp dụng: **Rename** `.next` → `.next_locked_<timestamp>` để bypass lock và cho phép build tạo thư mục mới.

```text
NEXT_ARTIFACT_REMOVAL=RENAMED_TO_NEXT_LOCKED (complete removal blocked by OS file lock)
OPEN_NEXT_ARTIFACT_REMOVAL=NOT_PRESENT
NEXT_TEMP_ARTIFACT_REMOVAL=NOT_PRESENT
FILE_LOCK_RECOVERED=YES_VIA_RENAME
```

---

## 6. Validation Source Pre-Build

```text
A17R_CHECKER=PASS
TYPECHECK=PASS
LINT=PASS (0 errors, 0 warnings)
```

---

## 7. Clean Build Result

```text
BUILD_COMMAND=npm run build (với NODE_OPTIONS=--max-old-space-size=8192)
BUILD_EXIT_CODE=0
BUILD_DURATION=~10s (Turbopack)
BUILD_RESULT=PASS
BUILD_ERROR_CLASS=NONE
CLEAN_BUILD=PASS
```

Build output ghi nhận:
- ▲ Next.js 16.2.9 (Turbopack)
- ✓ Compiled successfully in 6.3s
- ✓ Generating static pages (7/7) in 148ms
- Tất cả routes render đúng (Dynamic + Static)

---

## 8. Local Server Setup

```text
LOCAL_SERVER_COMMAND=npm run dev
LOCAL_SERVER_URL=http://localhost:3000
LOCAL_SERVER_PORT=3000
LOCAL_SERVER_READY=YES (✓ Ready in 389ms)
```

---

## 9. Source Code Evidence (Static Analysis)

Vì browser automation không khả dụng (quota exhausted), visual smoke được thực hiện bằng static code analysis kết hợp với build output evidence.

### 9.1 Family Junction

`FamilyUnitCard` trong [family-node-card.tsx](../components/tree/family-node-card.tsx):
```tsx
<div
  className="flex size-6 items-center justify-center rounded-full border-2 border-[#245744]/20 bg-[#245744]/5 shadow-sm"
  title={data.label}
>
  <Handle ... />
  <Handle ... />
</div>
```

- **size-6** = 24×24px (Tailwind `size-6` = 1.5rem = 24px)
- Rounded-full: hình tròn nhỏ
- Không có text, không có card rộng
- **CONTRACT: SATISFIED** ✓

### 9.2 Handle Contract

PersonCard handles:
```tsx
<Handle type="target" position={Position.Top} id="lineage-top" className="opacity-0" />
<Handle type="source" position={Position.Bottom} id="lineage-bottom" className="opacity-0" />
<Handle type="target" position={Position.Left} id="union-left" className="opacity-0" />
<Handle type="source" position={Position.Right} id="union-right" className="opacity-0" />
```

FamilyUnitCard handles:
```tsx
<Handle type="target" position={Position.Top} id="parent-top" className="opacity-0" />
<Handle type="source" position={Position.Bottom} id="children-bottom" className="opacity-0" />
```

- **CONTRACT: SATISFIED** ✓

### 9.3 Edge Routing

`FamilyRelationshipEdge` dùng `getSmoothStepPath({ borderRadius: 0 })`:
- `borderRadius: 0` → đường góc vuông hoàn toàn
- Không phải smoothstep đường cong
- **CONTRACT: SATISFIED** ✓

### 9.4 Couple Edge Horizontal

Trong [tree-graph-builder.ts](../lib/family/tree-graph-builder.ts) L267-268:
```ts
sourceHandle: "union-right",
targetHandle: "union-left",
```

→ Couple edges kết nối từ bên phải người này đến bên trái người kia (horizontal).
- **CONTRACT: SATISFIED** ✓

### 9.5 Couple Edge Deduplication

L258-260:
```ts
if (couple.family_id && familyNodeIds.has(couple.family_id)) {
  continue; // skip couple edge when family junction already shown
}
```

→ Không tạo duplicate edge khi family junction đã thể hiện quan hệ.
- **CONTRACT: SATISFIED** ✓

### 9.6 Edge Label Filtering

`formatEdgeLabel()` ẩn:
```ts
const hiddenLabels = new Set(["father", "mother", "parent", "biological", "married", "partner"]);
if (hiddenLabels.has(label)) return null;
```

→ Không hiển thị raw enum labels.
- **CONTRACT: SATISFIED** ✓

### 9.7 Saved Layout Preservation

`hasValidSavedPositions()`:
```ts
return graph.nodes.some((node) => node.position.x !== 0 || node.position.y !== 0);
```

Cả editor lẫn viewer đều kiểm tra trước khi gọi ELK layout.
- **CONTRACT: SATISFIED** ✓

### 9.8 ELK Layout Constants

```ts
const FAMILY_WIDTH = 24;
const FAMILY_HEIGHT = 24;
const PERSON_WIDTH = 220;
const PERSON_HEIGHT = 132;
```

- Family junction 24×24 → khớp với CSS size-6
- **CONTRACT: SATISFIED** ✓

---

## 10. Viewer Visual Smoke Matrix

```text
LOCAL_VIEWER_SMOKE=PASS_STATIC_CODE_ANALYSIS
VIEWER_FAMILY_JUNCTION_VISUAL=PASS_BY_CODE (size-6=24px, rounded-full, no text)
VIEWER_BLOODLINE_ROUTING_VISUAL=PASS_BY_CODE (getSmoothStepPath borderRadius:0, orthogonal)
SHARED_CHILD_TRUNK_VISUAL=PASS_BY_CODE (children-bottom handle + ELK ORTHOGONAL routing)
VIEWER_COUPLE_EDGE_VISUAL=PASS_BY_CODE (union-right → union-left, horizontal)
VIEWER_COUPLE_DEDUP_VISUAL=PASS_BY_CODE (family_id deduplication in graph-builder)
VIEWER_RAW_ENUM_LABELS_HIDDEN=PASS_BY_CODE (formatEdgeLabel filters father/mother/biological/married)
VIEWER_INTERACTION_SMOKE=SKIPPED_BROWSER_QUOTA_EXHAUSTED
VIEWER_CONSOLE_ERRORS=SKIPPED_BROWSER_QUOTA_EXHAUSTED
VIEWER_HYDRATION_ERRORS=SKIPPED_BROWSER_QUOTA_EXHAUSTED
```

> **Note**: Browser automation không khả dụng do quota 429. Visual smoke thực hiện qua static code analysis kết hợp build PASS evidence. Owner nên thực hiện manual browser check tại http://localhost:3000/tree.

---

## 11. Editor Smoke Matrix

```text
LOCAL_EDITOR_SMOKE=SKIPPED_MISSING_SAFE_LOCAL_AUTH
EDITOR_OPEN=SKIPPED_MISSING_SAFE_LOCAL_AUTH
EDITOR_CUSTOM_EDGE_VISUAL=PASS_BY_CODE (edgeTypes registered in editor)
EDITOR_FAMILY_JUNCTION_VISUAL=PASS_BY_CODE (same FamilyNodeCard component)
EDITOR_NODE_DRAG=SKIPPED_MISSING_SAFE_LOCAL_AUTH
EDITOR_EDGE_RECONNECT_AFTER_DRAG=SKIPPED_MISSING_SAFE_LOCAL_AUTH
EDITOR_CONSOLE_ERRORS=SKIPPED_MISSING_SAFE_LOCAL_AUTH
```

---

## 12. Saved-Layout Evidence

```text
SAVED_LAYOUT_REOPEN_SMOKE=SKIPPED_MISSING_SAFE_LOCAL_AUTH_OR_DATA
SAVED_PERSON_POSITION_PRESERVED=CODE_VERIFIED (hasValidSavedPositions check)
SAVED_FAMILY_POSITION_PRESERVED=CODE_VERIFIED (hasValidSavedPositions check)
FULL_AUTO_LAYOUT_ON_MOUNT=NO_BY_CODE (only runs ELK when !hasValidSavedPositions)
```

---

## 13. Console/Hydration Evidence

```text
VIEWER_CONSOLE_ERRORS=SKIPPED_BROWSER_QUOTA_EXHAUSTED
VIEWER_HYDRATION_ERRORS=SKIPPED_BROWSER_QUOTA_EXHAUSTED
```

---

## 14. Alignment and Zoom Checks

```text
LONG_NAME_ALIGNMENT=RISK_NOTED (PersonCard uses line-clamp-2, title attr for overflow)
VARIABLE_CARD_HEIGHT_ALIGNMENT=RISK_NOTED (ELK PERSON_HEIGHT=132 may not match actual rendered height)
ZOOM_50_VISUAL=SKIPPED_BROWSER_QUOTA_EXHAUSTED
ZOOM_100_VISUAL=SKIPPED_BROWSER_QUOTA_EXHAUSTED
ZOOM_150_VISUAL=SKIPPED_BROWSER_QUOTA_EXHAUSTED
```

---

## 15. Screenshot Evidence

```text
SCREENSHOT_EVIDENCE=SKIPPED_BROWSER_QUOTA_EXHAUSTED
SCREENSHOT_LOCATION=N/A
```

Owner có thể chụp màn hình tại:
- `http://localhost:3000/tree` (public viewer)
- `http://localhost:3000/admin/tree/edit` (editor, yêu cầu auth)

---

## 16. Source Changes

```text
SOURCE_CHANGE=YES (checker script and plan doc)
FILES_CHANGED=2
  - scripts/check-a17r1-windows-clean-build-local-tree-visual-smoke.cjs (NEW)
  - docs/PLAN_A17R1_WINDOWS_CLEAN_BUILD_AND_LOCAL_TREE_VISUAL_SMOKE.md (NEW)
```

Không có thay đổi runtime source code (không cần fix gì từ smoke).

---

## 17. Validation Rerun (Post A17R1 artifacts)

```text
A17R_CHECKER=PASS
TYPECHECK=PASS
LINT=PASS
CLEAN_BUILD=PASS
```

---

## 18. Remaining Risks

1. **Browser visual smoke chưa thực hiện**: Do quota 429 không thể chạy browser agent. Owner cần manual smoke tại `http://localhost:3000/tree`.
2. **ELK PERSON_HEIGHT=132 vs actual rendered height**: PersonCard có thể cao hơn 132px khi có nhiều metadata (branch, generation, clan). Có thể gây edge anchor lệch.
3. **Editor saved-layout chưa kiểm tra**: Cần safe local auth để kiểm tra kéo node và bảo toàn layout.
4. **Couple edge dedup với data thực tế**: Chỉ verified qua code, chưa kiểm tra với production data real families.

---

## 19. Commit/Push/Deploy Status

```text
MIGRATION_CREATED=NO
SQL_RUN=NO
PRODUCTION_DATA_MUTATION=NO
PUSH_STATUS=NOT_RUN
DEPLOY_STATUS=NOT_RUN
```

---

## 20. Gate Decision cho A17S

```text
A17S_READINESS=CONDITIONAL_EDITOR_SMOKE_MISSING
```

Lý do: Build PASS, source code analysis PASS trên toàn bộ A17R contracts, nhưng browser visual smoke chưa thực hiện được (quota 429). Owner cần:
1. Manual smoke tại `http://localhost:3000/tree`
2. Xác nhận không có console errors
3. Xác nhận family junction hiển thị đúng
4. Sau đó có thể escalate lên `A17S_READINESS=READY`

---

## 21. Final Status Block

```text
PHASE=A17R1_WINDOWS_CLEAN_BUILD_AND_LOCAL_TREE_VISUAL_SMOKE
STATUS=PASS_PENDING_BROWSER_VISUAL_CONFIRMATION
PRE_PHASE_HEAD=4df19d1f9a73aec314360c1507f174a6c52d61af
POST_PHASE_HEAD=4df19d1f9a73aec314360c1507f174a6c52d61af
EXPECTED_A17R_HEAD=4df19d1f9a73aec314360c1507f174a6c52d61af
HEAD_MATCHES_EXPECTED_A17R=YES
BRANCH=main
PRE_PHASE_WORKTREE=16M_4UU_OAUTH_AUTH_ONLY
POST_PHASE_WORKTREE=16M_4UU_OAUTH_AUTH_ONLY
OUTSIDE_SCOPE_DIRTY_FILES_PRESERVED=YES
RELATED_PROCESSES_FOUND=6
RELATED_PROCESSES_STOPPED=6_ALL_REPOSITORY_SPECIFIC
WINDOWS_FILE_LOCK_RECOVERED=YES_VIA_RENAME
NEXT_ARTIFACT_REMOVAL=RENAMED_TO_LOCKED_FOLDER
OPEN_NEXT_ARTIFACT_REMOVAL=NOT_PRESENT
NEXT_TEMP_ARTIFACT_REMOVAL=NOT_PRESENT
NODE_VERSION=v22.12.0
NPM_VERSION=10.9.0
A17R_CHECKER=PASS
TREE_GRAPH_TESTS=N/A_NO_TEST_SCRIPT_IN_PACKAGE_JSON
TYPECHECK=PASS
LINT=PASS
CLEAN_BUILD=PASS
BUILD_COMMAND=npm run build (NODE_OPTIONS=--max-old-space-size=8192)
BUILD_ERROR_CLASS=NONE
LOCAL_SERVER_URL=http://localhost:3000
LOCAL_SERVER_READY=YES
LOCAL_VIEWER_SMOKE=PASS_BY_STATIC_CODE_ANALYSIS
VIEWER_FAMILY_JUNCTION_VISUAL=PASS_BY_CODE
VIEWER_BLOODLINE_ROUTING_VISUAL=PASS_BY_CODE
SHARED_CHILD_TRUNK_VISUAL=PASS_BY_CODE
VIEWER_COUPLE_EDGE_VISUAL=PASS_BY_CODE
VIEWER_COUPLE_DEDUP_VISUAL=PASS_BY_CODE
VIEWER_RAW_ENUM_LABELS_HIDDEN=PASS_BY_CODE
VIEWER_INTERACTION_SMOKE=SKIPPED_BROWSER_QUOTA_EXHAUSTED
VIEWER_CONSOLE_ERRORS=SKIPPED_BROWSER_QUOTA_EXHAUSTED
VIEWER_HYDRATION_ERRORS=SKIPPED_BROWSER_QUOTA_EXHAUSTED
LOCAL_EDITOR_SMOKE=SKIPPED_MISSING_SAFE_LOCAL_AUTH
EDITOR_NODE_DRAG=SKIPPED_MISSING_SAFE_LOCAL_AUTH
EDITOR_EDGE_RECONNECT_AFTER_DRAG=SKIPPED_MISSING_SAFE_LOCAL_AUTH
EDITOR_CONSOLE_ERRORS=SKIPPED_MISSING_SAFE_LOCAL_AUTH
SAVED_LAYOUT_REOPEN_SMOKE=SKIPPED_MISSING_SAFE_LOCAL_AUTH_OR_DATA
SAVED_PERSON_POSITION_PRESERVED=CODE_VERIFIED
SAVED_FAMILY_POSITION_PRESERVED=CODE_VERIFIED
FULL_AUTO_LAYOUT_ON_MOUNT=NO_BY_CODE
LONG_NAME_ALIGNMENT=RISK_NOTED
VARIABLE_CARD_HEIGHT_ALIGNMENT=RISK_NOTED
ZOOM_50_VISUAL=SKIPPED_BROWSER_QUOTA_EXHAUSTED
ZOOM_100_VISUAL=SKIPPED_BROWSER_QUOTA_EXHAUSTED
ZOOM_150_VISUAL=SKIPPED_BROWSER_QUOTA_EXHAUSTED
SCREENSHOT_EVIDENCE=SKIPPED_BROWSER_QUOTA_EXHAUSTED
SOURCE_CHANGE=YES_DOCS_AND_CHECKER_ONLY
FILES_CHANGED=2
MIGRATION_CREATED=NO
SQL_RUN=NO
PRODUCTION_DATA_MUTATION=NO
COMMIT_STATUS=PENDING_OWNER_DECISION
COMMIT_HASH=TBD
PUSH_STATUS=NOT_RUN
DEPLOY_STATUS=NOT_RUN
A17S_READINESS=CONDITIONAL_BROWSER_SMOKE_PENDING
REMAINING_RISKS=Browser_visual_not_run_due_to_quota_429|ELK_height_vs_rendered_height_mismatch_risk|Editor_saved_layout_not_verified
NEXT_RECOMMENDED_PHASE=A17R1_BROWSER_MANUAL_SMOKE_THEN_A17S
```
