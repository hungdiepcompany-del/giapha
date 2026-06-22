# Plan A-11 - Merge/Dedupe Schema Candidate Readiness

Status: `PASS_LOCAL_STATIC_CANDIDATE_NOT_APPLIED`

## Summary

Owner đã cấp `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN`, vì vậy A-11 được mở
cho schema candidate/docs/checker. A-11 không mở runtime merge/dedupe, không
apply DB, không seed/backfill, không đăng ký permission runtime và không tạo
route/action/service.

SQL draft nằm tại `scripts/merge-dedupe-schema-candidate.sql.draft`, ngoài
`db/migrations`. Đây là artifact để review, không phải migration thật.

## A-11A - Schema candidate design

Candidate dùng sáu bảng additive:

### `merge_dedupe_candidates`

Lưu cặp người nghi trùng theo thứ tự canonical `person_a_id < person_b_id`, mức
`strong`/`medium`/`weak`, evidence, detection version và trạng thái review.
Unique pair ngăn cùng một cặp bị tạo lặp. Candidate chỉ là gợi ý; không block
người dùng tạo người trùng tên và không tự mở session hay merge.

### `merge_dedupe_sessions`

Lưu `merge_id`, candidate, `source_person_id`, `target_person_id`, reason,
confidence, trạng thái và idempotency key. Session chứa:

- actor/timestamp request, approval và execution;
- `source_person_updated_at`, `target_person_updated_at` và version tokens;
- version check status/actor/time;
- conflict review status/checksum/actor/time;
- graph validation status/result/actor/time;
- impact checksum và owner approval marker metadata.

Schema chỉ lưu state cần thiết. All-or-nothing transaction, locking, stale
check và post-merge validation phải được triển khai trong một runtime phase
riêng sau approval; A-11 không tạo function/procedure thực thi.

### `merge_dedupe_field_decisions`

Lưu source/target value, resolution, selected value, provenance, conflict flag
và reviewer actor/time theo từng field. `unresolved` không được coi là quyết
định. Private/source notes phải dùng `keep_both_separate` hoặc manual review,
không tự hợp nhất.

### `merge_dedupe_impact_snapshots`

Một bảng typed snapshot dùng `impact_scope` để bao phủ:

- `relationship`
- `layout`
- `membership_lineage`
- `visibility_privacy`
- `export`

Mỗi entity có key/version, before/proposed-after, decision, validation result và
errors. Layout vẫn tách khỏi relationship; privacy conflict không được tự nâng
mức công khai.

### `merge_dedupe_audit_events`

Audit append-oriented theo session/sequence với actor, timestamp, event type,
reason và các impact JSON riêng cho field, relationship, layout,
membership/lineage, visibility/privacy và export. Audit event không thay thế
revision; merge/rollback tương lai vẫn phải tạo revision tương ứng.

### `merge_dedupe_rollback_manifests`

Lưu snapshot source person, target person, relationships, layout,
membership/lineage, visibility/privacy, revisions và export mapping; có version,
checksum, creator/verifier và rollback actor/time. Session chỉ có một manifest
canonical. Runtime tương lai không được execute nếu manifest chưa verified.

## Referential integrity and deletion policy

- Source/target/candidate person dùng `on delete restrict`.
- Child artifacts dùng `session_id ... on delete restrict`.
- Không cascade-delete audit, impact, field decision hoặc rollback evidence.
- Source và target phải khác nhau.
- Candidate pair canonical và unique.
- Actor/timestamp constraints ngăn trạng thái nửa actor/nửa thời gian.
- Status, confidence, impact scope và resolution đều có check constraint.
- Approved/executed states chỉ hợp lệ khi version, conflict, graph, impact
  checksum, marker và actor gates đầy đủ.
- Audit/rollback dùng composite `(session_id, merge_id)` foreign key để không
  thể gắn evidence vào sai merge session.
- Manifest `verified`/`used` yêu cầu verifier; trạng thái `used` còn yêu cầu
  rollback actor/time và rollback revision.

Không hard-delete person hoặc relationship. Candidate không thêm foreign key
vào bảng relationship vì một session có thể ảnh hưởng nhiều loại entity; typed
impact snapshot giữ stable entity key và before state để rollback/review.

## Privacy and RLS candidate

Tất cả sáu bảng bật RLS. Draft cố ý không tạo policy vì năm permission
`people.merge.*` chưa được đăng ký runtime. Nếu schema thật được duyệt sau này,
RLS phải fail-closed cho tới phase permission/policy riêng; không tái sử dụng
quyền rộng để bypass gate.

Audit, field values, evidence và rollback snapshots có thể chứa dữ liệu riêng
tư. Chúng không public và phải có policy ít nhất chặt bằng dữ liệu gốc.

## Approval metadata

Session có `approval_marker_code`, `approval_granted_by`,
`approval_granted_at` và `approval_metadata`. Constraint yêu cầu marker/actor/
timestamp cùng có hoặc cùng trống. Metadata chỉ ghi bằng chứng approval của một
request tương lai, không đăng ký permission và không tự mở runtime.

Gate hiện tại:

- `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN`: `GRANTED_FOR_A11_CANDIDATE_ONLY`.
- `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE`: `NOT_GRANTED`.
- `APPROVE_A12_MERGE_DEDUPE_RUNTIME`: `NOT_GRANTED`.

## A-11B - SQL draft

Draft là additive `create table/index`, constraints và `enable row level
security`. Draft không có seed/backfill/DML, function/procedure, policy,
permission registration, destructive SQL hoặc apply instruction.

Không đặt draft trong `db/migrations`; `npm run check:migrations` không coi đây
là migration có thể apply. Một phase riêng chỉ được tạo migration thật sau khi
owner cấp `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE`.

## A-11C - Static checker

`scripts/check-merge-dedupe-schema-candidate-readiness.cjs` kiểm:

- markers candidate/not-applied/runtime-closed;
- đủ sáu bảng và source/target/candidate coverage;
- strong/medium/weak, canonical pair và non-self merge constraints;
- field conflict, relationship/layout/lineage/privacy/export impacts;
- audit actors/timestamps và impact fields;
- version/conflict/graph validation fields;
- rollback person/relationship/layout/membership/visibility/revision/export;
- RLS cho mọi bảng và không có policy/permission registration;
- không DML, destructive SQL, function/procedure/trigger hoặc apply command;
- không drift runtime, Worker/config, dependency hoặc real migration.

## A-11D - Decision and handoff

Decision 163 ghi A-11 chỉ là schema candidate/readiness. DB chưa apply, runtime
merge/dedupe vẫn đóng, không route/action/service, không permission runtime.
Apply DB hoặc runtime cần owner approval riêng tuần tự.

## A-11E - Validation

Validation command/result được ghi trong work log và handoff. A-09 safe-skip
do thiếu explicit auth session là expected safe-skip, không phải FAIL.

## A-11F - Commit boundary

Chỉ commit một lần khi checker, migration order, typecheck, lint, build và diff
checks PASS. Không push.

## Explicitly deferred

- Real migration file in `db/migrations`.
- DB apply.
- Seed/backfill.
- RLS policies and `people.merge.*` permission registration.
- Merge/dedupe runtime, transaction function or stored procedure.
- API route, server action, service or UI thật.
- Person/relationship mutation or deletion.
- Worker/OpenNext/Wrangler/dependency/deploy/push.

Runtime merge/dedupe remains closed.

## Owner review result

A-11 Review result: `APPROVED`.

Review xác nhận đủ sáu bảng, coverage và safety boundary. Trong review, draft
được siết thêm để:

- status approved/executed bắt buộc version/conflict/graph actor và timestamp;
- version token, idempotency key, impact checksum và approval marker không thể
  dùng chuỗi rỗng để vượt gate;
- approved state yêu cầu checksum của conflict-decision manifest;
- graph trạng thái `passed` phải có result khác object rỗng;
- audit event luôn có reason khác rỗng;
- checker cấm cả function/procedure và trigger runtime;
- marker canonical cho bước kế tiếp là
  `APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE`.

Owner có thể cấp marker trên để mở một phase riêng tạo real migration/check SQL/
apply plan. Marker status: `NOT_GRANTED_BY_THIS_REVIEW`. Marker này không cho
apply DB và không mở A-12 runtime merge.

## Recommended next phase

Owner review A-11 schema candidate. Chỉ sau khi owner cấp
`APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE` mới được tạo real migration file ở phase
riêng; việc apply DB vẫn cần approval riêng và không tự mở A-12 runtime.
