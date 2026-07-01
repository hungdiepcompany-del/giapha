# PLAN A-16Q - Session-specific Official Import Execution Approval Blocked

Marker: `A-16Q`

Status: `A16Q_STATUS=BLOCKED_MISSING_MARKER_OR_SESSION_ID`

## Ket qua phase

A-16Q khong duoc mo approval vi prompt hien tai khong co day du 2 thong tin bat
buoc cho mot import session cu the:

- Missing owner marker record:
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.
- Missing session id:
  `A16Q_IMPORT_SESSION_ID=<uuid>`.

Chuoi marker `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION` co xuat hien trong
phan mo ta dieu kien cua prompt, nhung khong di kem session id cu the va khong
duoc ghi nhu mot approval record cho mot session. Vi vay A-16Q phai giu trang
thai blocked.

## Context da san sang nhung chua du de approve

- A-16P commit:
  `9fa0043 runtime: add locked Gia Pha 4 official import candidate`.
- A-16P-TX commit:
  `e86efb0 db: add official Gia Pha 4 import transaction helper candidate`.
- A-16P-TX-APPLY-VERIFY commit:
  `04b1517 docs: record A-16P-TX manual apply verification`.
- RPC `public.a16p_tx_execute_giapha4_official_import` da duoc owner apply thu
  cong va verification PASS.
- RPC van fail-closed.
- Official import van locked.
- UI button disabled.

## Staging evidence

Owner manual UI staging evidence da duoc ghi nhan tu cac phase truoc:

- Sheet `Thanh vien` detected.
- 102 staged members.
- 134 parent relationship candidates.
- Data remains staging-only.

## Approval checklist bat buoc cho lan sau

A-16Q chi duoc ghi approval khi prompt tuong lai co du marker va session id cu
the. Checklist bat buoc:

- Exact session id.
- Validation errors = 0.
- Blockers = 0.
- Unresolved parent references = 0.
- Duplicate/conflict unresolved = 0.
- Rollback reviewed.
- Audit reviewed.
- Dry-run/review pack current.
- Owner accepts 102 staged people and 134 parent relationships.
- Owner understands import is irreversible unless rollback works.
- Owner understands A-16R will be the phase that may actually mutate data.
- A-16R must not deploy/push unless separately approved.

## Trang thai official import

- Official import van chua chay.
- `canRunOfficialImport=false`.
- UI button disabled.
- No RPC call.
- No POST official import call.
- No real genealogy writes.
- Khong ghi people/person that.
- Khong ghi relationships/families that.
- Khong ghi layout/tree/revision/profile that.

## Guardrails

- Khong chay import that.
- Khong goi RPC.
- Khong goi POST `/official-import`.
- Khong migration moi.
- Khong chay SQL.
- Khong DB push.
- Khong migration repair.
- Khong seed.
- Khong sua RLS.
- Khong grant anon/public.
- Khong deploy.
- Khong push.
- Khong commit Excel that, secret, env, storage state, cookie hoac token.
- Khong log raw personal rows.
- Khong bat UI button nhap chinh thuc active.

## Required next phase

Required next phase:

`A-16R - Official Import Execution Run`

Required future marker:

`APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`

A-16R chi duoc mo khi owner cap marker session-specific cho dung session id.
A-16Q blocker nay khong cho phep chay A-16R.
