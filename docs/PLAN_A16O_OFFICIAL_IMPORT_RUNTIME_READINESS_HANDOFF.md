# PLAN A-16O - Official Import Runtime Readiness Handoff

Marker: `A-16O`

## Current Verified Evidence

- A-16SQL apply verify PASS theo owner evidence: RLS enabled, authenticated staging SELECT/INSERT policies, authenticated UPDATE only on `import_sessions`, no anon/public staging policy, `imports.create` exists, and no A-16SQL policy on real genealogy tables.
- A-16I3/I4/I5 completed in commit `78320f9 runtime: harden Gia Pha 4 staging import review`.
- Manual UI upload staging PASS:
  - `102` staged members.
  - `134` parent relationship candidates.
  - sheet `Thành viên` detected.
- Official import not opened.

## What Is Ready

- parser mapping;
- staging write;
- validation review;
- dry-run preview;
- review pack;
- locked official import gate.

## What Is Not Ready

- final owner review of warnings/errors;
- duplicate/conflict decisions;
- official import runtime implementation;
- transaction SQL/function/runtime;
- rollback execution;
- audit/revision write implementation;
- production deploy/push.

## Required Future Phase

A-16P — Official Import Runtime Candidate.

Required future marker:

`APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`

## A-16P Scope Proposal

- implement official import runtime candidate only if marker present.
- still can keep button disabled unless explicit runtime-open subphase.
- must include transaction/rollback/audit implementation.
- must include checker preventing partial import.
- must include no-go if validation errors remain.
- must include manual owner review of exact session id.
- must include backup/rollback readiness.
- must not deploy/push unless later approved.

## Hard No-Go

- no marker.
- validation errors.
- unresolved duplicates.
- unresolved parent references.
- current user lacks permission.
- session ownership mismatch.
- manifest changed after review.
- dry-run/review pack stale.
- rollback cannot be produced.
- audit cannot be written.

## Boundary Confirmation

- official import not opened.
- no migration.
- no DB push.
- no SQL apply.
- no seed.
- no people/relationship/layout/revision writes.
- no deploy.
- no push.

`A16O_STATUS=OFFICIAL_IMPORT_RUNTIME_READINESS_HANDOFF_BLOCKED_UNTIL_A16P_MARKER`
