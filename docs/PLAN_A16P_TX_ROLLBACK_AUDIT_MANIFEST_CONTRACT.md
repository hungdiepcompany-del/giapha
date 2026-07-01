# PLAN A-16P-TX Rollback / Audit Manifest Contract

Marker: `A-16P-TX2`

Status: `A16P_TX_ROLLBACK_AUDIT_CONTRACT_READY_NOT_APPLIED`

## Mục Tiêu

A-16P-TX2 chuẩn hóa contract rollback/audit cho Gia Phả 4 official import
trước khi có bất kỳ phase nào chạy nhập chính thức. Contract này chỉ là tài
liệu readiness; không chạy SQL, không gọi RPC, không ghi dữ liệu thật.

## Rollback Manifest Contract

Rollback manifest phải có tối thiểu:

- `import_session_id`.
- `actor_profile_id`.
- `source_file_hash` hoặc `manifest_hash` nếu có.
- `review_pack_hash` nếu schema/runtime có thể tính ổn định.
- `created_people_ids`.
- `created_relationship_ids`.
- `created_family_ids` nếu có.
- `created_revision_ids` nếu có.
- `skipped_candidates`.
- `blocked_candidates`.
- `timestamp`.
- `import_marker`.
- `rollback_instructions`.
- ghi chú: không xóa person existing nếu future import chỉ link/update.
- `before_snapshot` nếu future update existing person được mở.
- `graph_layout_impact` nếu có layout/tree impact.

Trong schema hiện tại, nơi phù hợp nhất để lưu rollback manifest là
`import_write_manifests.rollback_plan` và `import_write_manifests.created_record_ids`,
nhưng A-16P-TX không ghi các cột này. Nếu future runtime cần persistence mạnh
hơn, phải có phase schema riêng.

## Audit Manifest Contract

Audit manifest phải có tối thiểu:

- actor.
- timestamp.
- session id.
- file/source hash.
- counts.
- created ids.
- validation summary.
- dry-run summary.
- review decision summary.
- no-go checks result.
- rollback manifest id/location.
- reason: `Gia Phả 4 official import`.

## Revision/Audit Mapping Hiện Có

Repo hiện có `revisions` và `revision_items`, nhưng `revisions.action` chỉ cho:

- `create`.
- `update`.
- `delete`.
- `restore`.

Vì chưa có action riêng cho official import batch/audit, A-16P-TX không fake
audit và ghi blocker:

`A16P_TX_AUDIT_TABLE_OR_SERVICE_MISSING`

`A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING`

## Không Làm Trong Phase Này

- Không apply DB.
- Không chạy SQL.
- Không gọi RPC.
- Không gọi POST official import.
- Không ghi people/person thật.
- Không ghi relationships/families thật.
- Không ghi layout/tree/revision thật.
- Không seed.
- Không deploy.
- Không push.
