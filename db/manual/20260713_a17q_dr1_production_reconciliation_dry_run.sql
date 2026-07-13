-- A17Q_DR1_PRODUCTION_RECONCILIATION_DRY_RUN
-- OWNER_MANUAL_ONLY
-- SQL_EXECUTED_BY_CODEX=NO
-- RPC_CALLED_BY_CODEX=NO
-- DRY_RUN_ONLY=YES

select public.execute_admin_a17q_legacy_family_reconciliation(
  p_owner_approval_marker => 'A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED',
  p_decision_pack_sha256 => '777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0',
  p_approved_group_plan_sha256 => '7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740',
  p_role_correction_plan_sha256 => 'ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f',
  p_excluded_scope_sha256 => '7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61',
  p_forecast_sha256 => '4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3',
  p_idempotency_key => 'A17Q_DR1_DRY_RUN_20260713_E04238C_001',
  p_confirm_backup_reviewed => true,
  p_confirm_rollback_reviewed => true,
  p_confirm_audit_reviewed => true,
  p_confirm_excluded_scope_reviewed => true,
  p_dry_run_only => true
) as a17q_dr1_dry_run_result;
