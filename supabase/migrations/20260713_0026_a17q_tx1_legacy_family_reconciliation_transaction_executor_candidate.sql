-- A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_PRODUCTION_QUERY_BY_CODEX
-- NO_GENEALOGY_ROW_UPDATE_BY_CODEX
-- NO_FAMILY_RECONCILIATION_EXECUTION
-- NO_OFFICIAL_IMPORT_EXECUTION
-- ACTIVE_RUNTIME_CALLER_COUNT=0
--
-- Purpose:
-- Add a narrowly scoped SECURITY INVOKER transaction executor candidate for the
-- exact immutable A-17P-R owner decision pack only. This migration is not
-- applied by Codex and creates no trigger, no runtime caller and no automatic
-- execution path.
-- ROLE_CORRECTION_SUPERSEDED_BY_MEMBERSHIP_DEACTIVATION is the audit
-- disposition for the 20 owner-confirmed role corrections under families that
-- are voided/merged instead of receiving standalone role updates.

drop policy if exists a17q_tx1_revisions_insert_legacy_family_reconciliation
  on public.revisions;
create policy a17q_tx1_revisions_insert_legacy_family_reconciliation
on public.revisions
for insert
to authenticated
with check (
  public.has_permission('relationships.update')
  and public.has_permission('permissions.manage')
  and changed_by = public.current_profile_id()
  and action = 'update'
  and entity_type = 'families'
  and change_reason = 'A-17Q-TX1 legacy family reconciliation transaction executor'
  and before_json is null
  and jsonb_typeof(after_json) = 'object'
  and after_json ->> 'source' = 'A-17Q-TX1 legacy family reconciliation transaction executor'
  and after_json ->> 'owner_marker' = 'A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED'
  and after_json ->> 'decision_pack_sha256' = '777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0'
  and after_json ? 'idempotency_key'
  and after_json ? 'event_type'
);

comment on policy a17q_tx1_revisions_insert_legacy_family_reconciliation
on public.revisions is
  'A-17Q-TX1 candidate: narrow authenticated revision INSERT policy for the legacy family reconciliation transaction executor only.';

create or replace function public.execute_admin_a17q_legacy_family_reconciliation(
  p_owner_approval_marker text,
  p_decision_pack_sha256 text,
  p_approved_group_plan_sha256 text,
  p_role_correction_plan_sha256 text,
  p_excluded_scope_sha256 text,
  p_forecast_sha256 text,
  p_idempotency_key text,
  p_confirm_backup_reviewed boolean,
  p_confirm_rollback_reviewed boolean,
  p_confirm_audit_reviewed boolean,
  p_confirm_excluded_scope_reviewed boolean,
  p_dry_run_only boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_now timestamptz := timezone('utc', now());
  v_owner_marker constant text := 'A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED';
  v_decision_pack_sha constant text := '777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0';
  v_approved_group_sha constant text := '7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740';
  v_role_correction_sha constant text := 'ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f';
  v_excluded_scope_sha constant text := '7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61';
  v_forecast_sha constant text := '4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3';
  v_pack constant jsonb := $a17q_pack${"schema_version":"a17p-owner-decision-pack:v1","status":"OWNER_APPROVED_NOT_EXECUTED","source":{"fix3_commit":"19c6cb0","owner_approval_evidence_commit":"1f30228","verified_source":"A17P_FIX3_OWNER_FACING_PRODUCTION_RESULT","source_manifest":"PHASE_A17P_R_USER_SUPPLIED_MANIFEST","production_queried_by_codex":false},"approval":{"owner_approval":"A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED","survivor_policy":"FAMILY_REVIEW_ORDER_1_FOR_EACH_OF_THE_21_APPROVED_GROUPS","survivor_policy_reason":"STRUCTURALLY_EQUIVALENT_CANDIDATES_WITH_NO_LAYOUT_OR_DOMAIN_CONFLICT","automatic_survivor_selection":false,"owner_explicitly_selected_policy":true,"total_reviewed_group_count":22,"approved_execution_group_count":21,"excluded_group_count":1,"blocked_data_conflict_count":0,"request_more_evidence_count":0,"decision_pack_finalized":true,"reconciliation_authorized_for_design_only":true,"reconciliation_execution_authorized":false},"baseline":{"active_family_count_before":74,"active_parent_membership_count_before":140,"active_child_membership_count_before":73,"approved_candidate_family_count":57,"approved_survivor_count":21,"approved_void_family_count":36,"approved_child_memberships_preserved":57,"role_correction_group_count":8,"role_correction_family_count":18,"role_correction_membership_count":36,"role_correction_distinct_person_count":16},"approved_groups":[{"group_review_order":2,"safe_group_ref":"9261a7bae41768b19bbb314c488a0c6d","survivor_family_id":"9115a4ee-1991-4ef0-a59b-d60d98cb72ab","survivor_safe_family_ref":"107adff1c2e92c147e8463da7db6b14d","void_families":[{"family_id":"af00f160-3480-43e1-a7c9-c0b7a7f51ed9","safe_family_ref":"16d8f11a762b72733617bc10c431221a"},{"family_id":"93f2c5d4-5d4f-4f99-bb60-0cd4e1d89c14","safe_family_ref":"20f2a3a5c6e18bdd25f8dc2b71fb5b20"},{"family_id":"96c6ef70-e42b-4b95-9d90-a26849a8dc1c","safe_family_ref":"77a21fcb5a9d2768262975eda7bd28c6"},{"family_id":"e790554f-e56c-400f-889f-fbbcd4c899ee","safe_family_ref":"ca71ec8c51ca5bc10d0ed34873acec7b"},{"family_id":"1a56c028-2ee6-4631-8539-81f6c8a76b20","safe_family_ref":"cc42e1cb3df2619901f065177c876008"},{"family_id":"7f5446cf-f9f8-4f3a-a58b-323f12ab947f","safe_family_ref":"db17d182fdef0100f05d6db6f6183c57"},{"family_id":"2e874c4a-a610-47a6-bde8-1de9ff007988","safe_family_ref":"fdbc296bbed6bf9ae3a7e5055b1efe6f"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":3,"safe_group_ref":"34b4cf0654cdd3c0dca4699e95298b7c","survivor_family_id":"8c28fe6c-d7ea-4aaa-93e3-48f325a3359d","survivor_safe_family_ref":"34051c849670f2122960336f8a6d2424","void_families":[{"family_id":"cf6119d6-94c4-4c47-90dd-cb1f84470275","safe_family_ref":"816f3ff821785374ca722f561e3ae743"},{"family_id":"40822e22-97c7-4b27-8fc5-e7f214c0b97d","safe_family_ref":"949e17e2b044c81c298e0e6bf63a7452"},{"family_id":"0fa0bb59-2584-466f-b9e9-b56fdd4457b1","safe_family_ref":"ab854643628100ba8146803634ad1c38"},{"family_id":"d6f8373e-38d5-4b1c-a70d-77f21aea6e17","safe_family_ref":"ba5d958cbbe10db0441a98c32ba1be52"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":4,"safe_group_ref":"2f2cf322acb9ed7ef02f0675e2306010","survivor_family_id":"fc7b2f7c-9340-4f2a-bd39-f694894e4456","survivor_safe_family_ref":"2ae1bf0b67d1c652d69d69f714751d43","void_families":[{"family_id":"a2eb7e4e-9b62-4607-b0cc-af9496fbde88","safe_family_ref":"a5f69df385cb99a1800b8b5f9049cd0e"},{"family_id":"833a5baf-b55c-471c-9ba0-44f1e9a04a6d","safe_family_ref":"b33029fbe44d788d48fcb49167219211"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":5,"safe_group_ref":"697e2ea051fc81496e186ce579ad0990","survivor_family_id":"71faf11a-f3a1-4779-89f6-cf58ad9db67d","survivor_safe_family_ref":"6f471a09685de3cc9fa68de17ca7eec8","void_families":[{"family_id":"af134021-2624-4e9c-a69d-947ac3e9e14a","safe_family_ref":"af934fac75fc35f11616aca5b8231230"},{"family_id":"a27dd00f-3467-43a3-b29f-1af4e7e636da","safe_family_ref":"de6b35285e7b76824ff3c4b0262257fc"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":6,"safe_group_ref":"9added9e6888d1a423fc9fd0246026dc","survivor_family_id":"18b8f12a-53e8-4e53-8e76-deb9e2a58615","survivor_safe_family_ref":"0616f5c413e63d422f218527d6cdf41f","void_families":[{"family_id":"d9834452-09b2-49d6-bc42-5aa577cdcc60","safe_family_ref":"3a64410a423b726028eddfefe87c9a5c"},{"family_id":"f4b736ac-ec68-41c1-83bb-157d337bd1b7","safe_family_ref":"6250e1c7e559844a7b1c6c68b1205836"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":7,"safe_group_ref":"d9ef9121fb71b9fa2644dcc90e79ac43","survivor_family_id":"a7ae7646-8918-403d-9081-e47963f1ddc6","survivor_safe_family_ref":"067e0afe16b5fb06b71152cabc3ae27b","void_families":[{"family_id":"abc39cf7-a0be-4aeb-8aa1-90ba38922733","safe_family_ref":"66f6bbe96f4610f64a0048dc7675afd0"},{"family_id":"e1d37bb9-2c66-43dc-8ebc-0b2d0fc045be","safe_family_ref":"928ae6eb746fe4cb2f7e3208ab251ea2"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":8,"safe_group_ref":"e13e33859bd6b658aae8dfb74c7d2227","survivor_family_id":"bdf3dcb9-1e62-45b8-8fb1-2dc12821301f","survivor_safe_family_ref":"23289e390c88aca83eedbea490bf5e42","void_families":[{"family_id":"e44d462e-854e-41e0-908b-a84f75f9758b","safe_family_ref":"2b1b48169964060a9371becaebd31189"},{"family_id":"2de98606-92c3-4ffe-898d-9495b22c215e","safe_family_ref":"729d2d644b1446181af5ec33ac1ff506"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":9,"safe_group_ref":"f8a4b569a15428f13eb7c7a633219d8a","survivor_family_id":"5e281e2b-88fd-421f-b96d-d879ee4b58ce","survivor_safe_family_ref":"7cf599382b53daa037df063c1bdaf46e","void_families":[{"family_id":"33e2ba5c-002b-4d28-a212-07b6ffd5dc9d","safe_family_ref":"837f7f7fbe0f0cab3144a97363a62d17"},{"family_id":"26f0ed8a-c45a-4c53-bdb2-0d0dab3e216f","safe_family_ref":"c7d9c0cb9e7f0795485ebf0376f0b7de"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":10,"safe_group_ref":"11fe7274792b192358ee1009e176ced5","survivor_family_id":"31ed174f-6a98-428e-a826-74326e4b6c98","survivor_safe_family_ref":"22653b78d4eeef601a94735c82fb57f7","void_families":[{"family_id":"4ce158bd-e9bc-42b4-be6d-d50ecfddd470","safe_family_ref":"2e9ed96f33444acbb3bef2c1083b6b29"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":11,"safe_group_ref":"41987dd8f898fa59599aa11fe3c6557d","survivor_family_id":"7e564f8e-0e63-4393-a047-6562d3c65649","survivor_safe_family_ref":"579908bb5b5358d32d71ff9ec7c243a7","void_families":[{"family_id":"28cd4546-a74a-4fab-97cb-4788a210035f","safe_family_ref":"84b20e4e58611c0772ce7ac331f7137d"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":12,"safe_group_ref":"49c4e437f3e2599f7d0bc309939975bb","survivor_family_id":"da5d5adb-ba18-41da-bcc8-5a18a29cc13f","survivor_safe_family_ref":"469bf93b59849f3754a8a1fe41226993","void_families":[{"family_id":"b0867171-1513-437b-a92e-0c01652dfd54","safe_family_ref":"8ec143cb0341b9a54db21f1a8880066c"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":13,"safe_group_ref":"5e9ca901f9514b192115dd1c4e018ceb","survivor_family_id":"fe6a9cf3-f7af-4f94-87e6-5ea03dee543a","survivor_safe_family_ref":"ecffbb775e0676f73a7483a4ab382918","void_families":[{"family_id":"d02587f0-b679-4ae0-aca0-5f9f78041bb7","safe_family_ref":"f6bf340ba9b8ef87bc8f764f3d51a315"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":14,"safe_group_ref":"64789b30db45a84accdabc85cc362cc6","survivor_family_id":"65abdbb6-a8e5-4748-ba95-475d7645a657","survivor_safe_family_ref":"45d406c6d96c5c85b768ef4abac93fe1","void_families":[{"family_id":"75e2f668-2596-4699-8a53-b08610df066f","safe_family_ref":"62bd5c798e1d578b4d5deb49ab0bd243"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":15,"safe_group_ref":"669d75955c5ed0e3616936f0beeea162","survivor_family_id":"2154fcca-4695-4802-bcaf-138045b7dd11","survivor_safe_family_ref":"4daeb26744b3a001ac5ac8b1b46b9a85","void_families":[{"family_id":"0932835e-32ea-4289-a349-77fa8b597f96","safe_family_ref":"c4568f4f46bd29678fa26168401e3ce7"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":16,"safe_group_ref":"6e3ab58476a5c3ca27b63fd740c55e56","survivor_family_id":"2fe13031-a521-460f-b773-bef292470a07","survivor_safe_family_ref":"2b08048787c354c37c3a7dea257cbe38","void_families":[{"family_id":"e626426b-0b21-4bbd-9d2f-c138156c823e","safe_family_ref":"aa63a6370a2584d113b54f6ab091691c"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":17,"safe_group_ref":"7102939f380d82811f9ed7221da642b5","survivor_family_id":"4a2aa1c3-5847-4ade-bbb8-304be9b09d2e","survivor_safe_family_ref":"78a551dd5a8f8ae7c6fb99cca994cbcd","void_families":[{"family_id":"f7377458-e110-4028-8533-ebbd6feb9413","safe_family_ref":"fcd1ec08e1b20d638673d0a0fe2d8d19"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":18,"safe_group_ref":"a33cc1f6470a638e2607615fe6959eb7","survivor_family_id":"e29d929b-6003-46f4-b0e8-50b149282f7a","survivor_safe_family_ref":"55ab3fab771a80cb8f1238e3ca0e1bca","void_families":[{"family_id":"5f069a5a-fef8-47af-829d-8c12d666cc57","safe_family_ref":"6fbe574147cb4cda30468130ce8f8b60"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":19,"safe_group_ref":"b34bbc4b9a7e5d3d71733d808c894e6c","survivor_family_id":"ec136320-7393-4276-ba69-414eb941a577","survivor_safe_family_ref":"69012ff659a0c36c993084a584e96984","void_families":[{"family_id":"7e128868-1406-4489-a288-6f7981e62dcf","safe_family_ref":"f9b43fb3ece80927cfc26c22111e8b52"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":20,"safe_group_ref":"c0d499673c250e0b883a899dc6a27101","survivor_family_id":"5deaf8b4-8a4d-469c-8306-30d257e83632","survivor_safe_family_ref":"057ad5c5de945f9b57f0e23025d73308","void_families":[{"family_id":"b126ad74-920e-4512-8f80-9f0b89568e60","safe_family_ref":"a9d492996e6bf03fa73d90ce833190e3"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":21,"safe_group_ref":"e309bb5c052bf74a4228b00e4146eda0","survivor_family_id":"a3d9d34b-487a-4554-8826-edfb5ff0f763","survivor_safe_family_ref":"9556c9662031a447b31f6d3fdb58d123","void_families":[{"family_id":"6da779ba-bad7-48ae-a9d1-b35671e55699","safe_family_ref":"a232aef9ed2f7effcf1892e471b9a37a"}],"owner_approved":true,"executable":true,"executed":false},{"group_review_order":22,"safe_group_ref":"f7f2cd5f36ee00678913a8e6245be5f7","survivor_family_id":"b483ebc3-e403-4e93-a35d-671568952011","survivor_safe_family_ref":"68a57d9dee8c0a2b4c2436a35fbb5e15","void_families":[{"family_id":"1d5f8cbc-8ec7-49c8-b3f6-91ed705a0f1a","safe_family_ref":"c348f7a7d7d8c589cbd0bf588b3cc6f0"}],"owner_approved":true,"executable":true,"executed":false}],"role_corrections":[{"safe_group_ref":"697e2ea051fc81496e186ce579ad0990","family_id":"71faf11a-f3a1-4779-89f6-cf58ad9db67d","membership_id":"a020c7f7-6c11-4582-94d5-0419990c95bc","person_id":"7ebe8c02-2cf1-458b-b62b-08ba3c4d5cc1","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"697e2ea051fc81496e186ce579ad0990","family_id":"71faf11a-f3a1-4779-89f6-cf58ad9db67d","membership_id":"03820637-7231-4af8-a342-5698c9ca6e22","person_id":"fd8cca3d-e087-404a-b3c1-71c5c94df400","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"697e2ea051fc81496e186ce579ad0990","family_id":"af134021-2624-4e9c-a69d-947ac3e9e14a","membership_id":"f3c2d8a1-549b-4e21-893f-0ee18cce4599","person_id":"fd8cca3d-e087-404a-b3c1-71c5c94df400","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"697e2ea051fc81496e186ce579ad0990","family_id":"af134021-2624-4e9c-a69d-947ac3e9e14a","membership_id":"2f09d165-64e2-4098-8939-644ced2c4e22","person_id":"7ebe8c02-2cf1-458b-b62b-08ba3c4d5cc1","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"697e2ea051fc81496e186ce579ad0990","family_id":"a27dd00f-3467-43a3-b29f-1af4e7e636da","membership_id":"fb67046b-66f9-442a-8d49-b784866853dd","person_id":"7ebe8c02-2cf1-458b-b62b-08ba3c4d5cc1","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"697e2ea051fc81496e186ce579ad0990","family_id":"a27dd00f-3467-43a3-b29f-1af4e7e636da","membership_id":"561434a9-4ba2-4efc-bca9-ec8da4a68a47","person_id":"fd8cca3d-e087-404a-b3c1-71c5c94df400","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"f8a4b569a15428f13eb7c7a633219d8a","family_id":"5e281e2b-88fd-421f-b96d-d879ee4b58ce","membership_id":"959c95d8-ac84-485e-9a2f-dd568c366c33","person_id":"aeaa0cca-0025-49a6-b4ba-dba85518b071","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"f8a4b569a15428f13eb7c7a633219d8a","family_id":"5e281e2b-88fd-421f-b96d-d879ee4b58ce","membership_id":"842830e6-7e9d-4d4e-ad07-8abe09ec7d62","person_id":"fd1a2f20-5d9e-4f2a-bddf-5f2bf028b65f","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"f8a4b569a15428f13eb7c7a633219d8a","family_id":"33e2ba5c-002b-4d28-a212-07b6ffd5dc9d","membership_id":"3189d091-f3f9-490d-b90c-95cc2f49c48e","person_id":"aeaa0cca-0025-49a6-b4ba-dba85518b071","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"f8a4b569a15428f13eb7c7a633219d8a","family_id":"33e2ba5c-002b-4d28-a212-07b6ffd5dc9d","membership_id":"0241f322-5544-410f-96bc-ef821268de26","person_id":"fd1a2f20-5d9e-4f2a-bddf-5f2bf028b65f","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"f8a4b569a15428f13eb7c7a633219d8a","family_id":"26f0ed8a-c45a-4c53-bdb2-0d0dab3e216f","membership_id":"c30ce3bf-e0e4-46c2-b187-fc52fe4563c9","person_id":"aeaa0cca-0025-49a6-b4ba-dba85518b071","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"f8a4b569a15428f13eb7c7a633219d8a","family_id":"26f0ed8a-c45a-4c53-bdb2-0d0dab3e216f","membership_id":"a7f89a12-9b8f-42e2-9b07-76c93f975977","person_id":"fd1a2f20-5d9e-4f2a-bddf-5f2bf028b65f","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"669d75955c5ed0e3616936f0beeea162","family_id":"2154fcca-4695-4802-bcaf-138045b7dd11","membership_id":"45f805c3-df0d-4be4-8748-62444fe84d2e","person_id":"acdbb520-71c7-44f1-8a7a-a6a575c170a6","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"669d75955c5ed0e3616936f0beeea162","family_id":"2154fcca-4695-4802-bcaf-138045b7dd11","membership_id":"06d3e8aa-b481-4419-93da-efc5dc2b7550","person_id":"6f4f4787-3745-4d77-8e4e-09176c9d644c","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"669d75955c5ed0e3616936f0beeea162","family_id":"0932835e-32ea-4289-a349-77fa8b597f96","membership_id":"bd41f660-54e1-4184-b956-d21e47d9e9b8","person_id":"acdbb520-71c7-44f1-8a7a-a6a575c170a6","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"669d75955c5ed0e3616936f0beeea162","family_id":"0932835e-32ea-4289-a349-77fa8b597f96","membership_id":"c06eb1f6-24a1-47e0-afd3-5f564ff8674e","person_id":"6f4f4787-3745-4d77-8e4e-09176c9d644c","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"6e3ab58476a5c3ca27b63fd740c55e56","family_id":"2fe13031-a521-460f-b773-bef292470a07","membership_id":"abb49823-2c93-4a0b-8c42-8e72a49381ca","person_id":"17e7e135-c213-4648-afc6-8cc339839eba","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"6e3ab58476a5c3ca27b63fd740c55e56","family_id":"2fe13031-a521-460f-b773-bef292470a07","membership_id":"561b6051-9bd1-4ffa-a5ee-7663f8b0b834","person_id":"7fb9f7fc-2887-4c5a-91a5-6222bf23bd29","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"6e3ab58476a5c3ca27b63fd740c55e56","family_id":"e626426b-0b21-4bbd-9d2f-c138156c823e","membership_id":"59432d56-daaf-492a-9fce-21dbd0305129","person_id":"17e7e135-c213-4648-afc6-8cc339839eba","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"6e3ab58476a5c3ca27b63fd740c55e56","family_id":"e626426b-0b21-4bbd-9d2f-c138156c823e","membership_id":"5eaf6aab-95c9-49b3-8391-be8b93691789","person_id":"7fb9f7fc-2887-4c5a-91a5-6222bf23bd29","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"a33cc1f6470a638e2607615fe6959eb7","family_id":"e29d929b-6003-46f4-b0e8-50b149282f7a","membership_id":"9bed5688-85dc-4470-9f10-adf621a4e800","person_id":"1776ba50-7ed9-4156-8205-9efcb0dbb86c","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"a33cc1f6470a638e2607615fe6959eb7","family_id":"e29d929b-6003-46f4-b0e8-50b149282f7a","membership_id":"92970869-877f-4e47-ae26-9330bd9b6a3a","person_id":"d89f0c4e-e27e-42b7-bb12-fc7e4c882713","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"a33cc1f6470a638e2607615fe6959eb7","family_id":"5f069a5a-fef8-47af-829d-8c12d666cc57","membership_id":"764034d8-0e8c-4820-9ec5-dadba7d4c45d","person_id":"1776ba50-7ed9-4156-8205-9efcb0dbb86c","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"a33cc1f6470a638e2607615fe6959eb7","family_id":"5f069a5a-fef8-47af-829d-8c12d666cc57","membership_id":"01d9e0bf-f3fa-4c39-bc42-b4c12fcdd4d1","person_id":"d89f0c4e-e27e-42b7-bb12-fc7e4c882713","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"b34bbc4b9a7e5d3d71733d808c894e6c","family_id":"ec136320-7393-4276-ba69-414eb941a577","membership_id":"a4a47187-b0c7-45b3-9799-84a0c8105bc8","person_id":"c0c356db-4365-4e56-868b-d6b1a8380b54","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"b34bbc4b9a7e5d3d71733d808c894e6c","family_id":"ec136320-7393-4276-ba69-414eb941a577","membership_id":"fbd4314a-fba7-4ff8-ac3b-e19c6be66060","person_id":"5c904f1e-a355-4a73-b670-9c878479f369","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"b34bbc4b9a7e5d3d71733d808c894e6c","family_id":"7e128868-1406-4489-a288-6f7981e62dcf","membership_id":"67b1e426-3fe9-4647-a51d-5d018f583b4c","person_id":"c0c356db-4365-4e56-868b-d6b1a8380b54","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"b34bbc4b9a7e5d3d71733d808c894e6c","family_id":"7e128868-1406-4489-a288-6f7981e62dcf","membership_id":"494d47f2-bd23-4c02-a232-886be61dc502","person_id":"5c904f1e-a355-4a73-b670-9c878479f369","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"c0d499673c250e0b883a899dc6a27101","family_id":"5deaf8b4-8a4d-469c-8306-30d257e83632","membership_id":"8de09859-2637-487f-9331-614e85a9d749","person_id":"ba24c1e4-0735-492c-8f9a-7d3d9db3b268","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"c0d499673c250e0b883a899dc6a27101","family_id":"5deaf8b4-8a4d-469c-8306-30d257e83632","membership_id":"a22fe1a8-9577-4c49-a213-c7eb9f92bf18","person_id":"a7a0caf8-027a-45ce-8e49-1b98e4b1e89f","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"c0d499673c250e0b883a899dc6a27101","family_id":"b126ad74-920e-4512-8f80-9f0b89568e60","membership_id":"c7ca0498-3dc0-445a-8c11-df00419fe82f","person_id":"a7a0caf8-027a-45ce-8e49-1b98e4b1e89f","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"c0d499673c250e0b883a899dc6a27101","family_id":"b126ad74-920e-4512-8f80-9f0b89568e60","membership_id":"a64d53d2-1b7d-4bc2-826a-6facaf2a7a6e","person_id":"ba24c1e4-0735-492c-8f9a-7d3d9db3b268","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"e309bb5c052bf74a4228b00e4146eda0","family_id":"a3d9d34b-487a-4554-8826-edfb5ff0f763","membership_id":"46c38ed4-404b-41b9-85cf-ff55242a662d","person_id":"a1f5bd54-6cb1-47f0-be0f-b3787aad2da3","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"e309bb5c052bf74a4228b00e4146eda0","family_id":"a3d9d34b-487a-4554-8826-edfb5ff0f763","membership_id":"76a9d711-e08c-4ec5-8e1c-85c013e1dfea","person_id":"786cae67-b916-44f1-81fb-46369ce829e1","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"e309bb5c052bf74a4228b00e4146eda0","family_id":"6da779ba-bad7-48ae-a9d1-b35671e55699","membership_id":"ecebef61-f5db-469b-9a41-680c5d3b9a1d","person_id":"786cae67-b916-44f1-81fb-46369ce829e1","expected_current_role":"mother","target_role":"father","relationship_type":"biological","owner_confirmed":true,"executed":false},{"safe_group_ref":"e309bb5c052bf74a4228b00e4146eda0","family_id":"6da779ba-bad7-48ae-a9d1-b35671e55699","membership_id":"c2f07191-d441-45da-9684-721fe7012325","person_id":"a1f5bd54-6cb1-47f0-be0f-b3787aad2da3","expected_current_role":"father","target_role":"mother","relationship_type":"biological","owner_confirmed":true,"executed":false}],"excluded_groups":[{"safe_group_ref":"721e2ae3d95dd418af40b6459531b870","decision":"EXCLUDE_GROUP","reason":"PENDING_ONE_PARENT_AND_DELETED_FAMILY_CONTEXT_RECONCILIATION","candidate_family_ids":["7e8e8b20-49ce-49f0-aba8-e55f441fc8cc","0dc5e67d-9f5e-4270-8783-3393fe3843a4","5b437738-e8a3-4fef-80de-9c8e5ff0839d"],"executable":false}],"deleted_family_advisories":[{"family_id":"990de69e-2239-4a00-995c-6292ce4a814a","safe_family_ref":"16ead1f516a885724a2bddd11e14472b","decision":"SEPARATE_RECONCILIATION_REQUIRED","active_parent_membership_count":2,"active_child_membership_count":0,"layout_reference_count":0,"revision_reference_count":6,"executable":false}],"forecast":{"status":"FORECAST_ONLY_NOT_EXECUTED","active_family_count_before":74,"family_void_count":36,"active_family_count_after":38,"active_parent_membership_count_before":140,"parent_membership_normalization_count":72,"active_parent_membership_count_after":68,"active_child_membership_count_before":73,"active_child_membership_count_after":73,"approved_child_memberships_preserved":57,"child_membership_lost_count":0,"people_row_change_count":0,"excluded_group_count":1,"deleted_family_action_count":0},"integrity":{"schema_version_correct":true,"owner_approval_marker_correct":true,"approved_group_count":21,"approved_survivor_count":21,"approved_void_family_count":36,"approved_candidate_family_count":57,"unique_group_ref_count":21,"unique_survivor_family_count":21,"unique_void_family_count":36,"unique_approved_family_count":57,"survivor_void_overlap_count":0,"cross_group_family_overlap_count":0,"excluded_family_overlap_count":0,"deleted_family_overlap_count":0,"role_correction_group_count":8,"role_correction_family_count":18,"role_correction_membership_count":36,"role_correction_distinct_person_count":16,"role_correction_membership_ids_unique":true,"role_correction_family_ids_in_approved_scope":true,"role_correction_group_refs_in_approved_scope":true,"role_targets_allowed":true,"role_before_after_different":true,"relationship_type_biological_only":true,"excluded_group_count":1,"excluded_group_candidate_count":3,"deleted_family_advisory_count":1,"child_memberships_lost_forecast":0,"people_rows_changed_forecast":0,"production_names_present":false,"automatic_execution_enabled":false,"reconciliation_executed":false},"hashes":{"approved_group_plan_sha256":"7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740","role_correction_plan_sha256":"ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f","excluded_scope_sha256":"7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61","forecast_sha256":"4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3","decision_pack_sha256":"777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0"}}$a17q_pack$::jsonb;
  v_expected_active_family_before constant integer := 74;
  v_expected_active_parent_before constant integer := 140;
  v_expected_active_child_before constant integer := 73;
  v_expected_active_family_after constant integer := 38;
  v_expected_active_parent_after constant integer := 68;
  v_expected_active_child_after constant integer := 73;
  v_batch public.family_reconciliation_batches%rowtype;
  v_batch_id uuid;
  v_rollback_manifest_id uuid;
  v_pre_family_count integer := 0;
  v_pre_parent_count integer := 0;
  v_pre_child_count integer := 0;
  v_approved_group_count integer := 0;
  v_approved_family_count integer := 0;
  v_survivor_count integer := 0;
  v_void_family_count integer := 0;
  v_role_plan_count integer := 0;
  v_role_survivor_count integer := 0;
  v_role_void_count integer := 0;
  v_precondition_failure_count integer := 0;
  v_precondition_check_count integer := 0;
  v_existing_batch public.family_reconciliation_batches%rowtype;
  v_replay_result jsonb;
  v_pre_mutation_audit_id uuid;
  v_post_mutation_audit_id uuid;
  v_survivor_role_update_count integer := 0;
  v_child_move_count integer := 0;
  v_parent_deactivation_count integer := 0;
  v_void_family_update_count integer := 0;
  v_merge_target_update_count integer := 0;
  v_survivor_canonicalization_count integer := 0;
  v_superseded_role_correction_count integer := 0;
  v_post_family_count integer := 0;
  v_post_parent_count integer := 0;
  v_post_child_count integer := 0;
  v_approved_post_child_count integer := 0;
  v_approved_post_distinct_child_count integer := 0;
  v_approved_survivor_parent_count integer := 0;
  v_approved_void_parent_count integer := 0;
  v_approved_active_survivor_count integer := 0;
  v_approved_active_void_count integer := 0;
  v_graph_validation_passed boolean := false;
  v_people_before_hash text;
  v_people_after_hash text;
  v_layout_before_hash text;
  v_layout_after_hash text;
  v_excluded_before_hash text;
  v_excluded_after_hash text;
  v_deleted_before_hash text;
  v_deleted_after_hash text;
  v_result jsonb;
begin
  if auth.uid() is null or v_profile_id is null then
    raise exception 'A17Q_TX1_AUTHENTICATED_PROFILE_REQUIRED';
  end if;

  if not public.has_permission('relationships.update')
    or not public.has_permission('permissions.manage') then
    raise exception 'A17Q_TX1_RELATIONSHIP_UPDATE_AND_PERMISSIONS_MANAGE_REQUIRED';
  end if;

  if nullif(btrim(coalesce(p_owner_approval_marker, '')), '') is null
    or p_owner_approval_marker is distinct from v_owner_marker then
    raise exception 'A17Q_TX1_OWNER_APPROVAL_MARKER_MISMATCH';
  end if;

  if lower(coalesce(p_decision_pack_sha256, '')) is distinct from v_decision_pack_sha
    or lower(coalesce(p_approved_group_plan_sha256, '')) is distinct from v_approved_group_sha
    or lower(coalesce(p_role_correction_plan_sha256, '')) is distinct from v_role_correction_sha
    or lower(coalesce(p_excluded_scope_sha256, '')) is distinct from v_excluded_scope_sha
    or lower(coalesce(p_forecast_sha256, '')) is distinct from v_forecast_sha then
    raise exception 'A17Q_TX1_DECISION_PACK_HASH_MISMATCH';
  end if;

  if p_dry_run_only is not true then
    if coalesce(p_confirm_backup_reviewed, false) is not true then
      raise exception 'A17Q_TX1_BACKUP_REVIEW_NOT_CONFIRMED';
    end if;
    if coalesce(p_confirm_rollback_reviewed, false) is not true then
      raise exception 'A17Q_TX1_ROLLBACK_REVIEW_NOT_CONFIRMED';
    end if;
    if coalesce(p_confirm_audit_reviewed, false) is not true then
      raise exception 'A17Q_TX1_AUDIT_REVIEW_NOT_CONFIRMED';
    end if;
    if coalesce(p_confirm_excluded_scope_reviewed, false) is not true then
      raise exception 'A17Q_TX1_EXCLUDED_SCOPE_REVIEW_NOT_CONFIRMED';
    end if;
    if p_idempotency_key is null
      or length(btrim(p_idempotency_key)) < 16
      or p_idempotency_key !~ '^[A-Za-z0-9:_-]+$' then
      raise exception 'A17Q_TX1_IDEMPOTENCY_KEY_REQUIRED';
    end if;
  end if;

  if not pg_try_advisory_xact_lock(hashtextextended('A17Q_TX1_LEGACY_FAMILY_RECONCILIATION', 0)) then
    raise exception 'A17Q_TX1_CONCURRENT_EXECUTION_REJECTED';
  end if;

  if v_pack #>> '{approval,reconciliation_execution_authorized}' is distinct from 'false'
    or v_pack #>> '{approval,reconciliation_authorized_for_design_only}' is distinct from 'true'
    or v_pack #>> '{approval,owner_approval}' is distinct from v_owner_marker
    or v_pack #>> '{hashes,decision_pack_sha256}' is distinct from v_decision_pack_sha then
    raise exception 'A17Q_TX1_EMBEDDED_MANIFEST_CONTRACT_INVALID';
  end if;

  create temporary table a17q_approved_groups (
    group_review_order integer primary key,
    safe_group_ref text not null unique,
    survivor_family_id uuid not null unique,
    survivor_safe_family_ref text not null,
    void_family_ids uuid[] not null,
    canonical_key text not null
  ) on commit drop;

  create temporary table a17q_approved_families (
    safe_group_ref text not null,
    family_id uuid not null primary key,
    is_survivor boolean not null,
    survivor_family_id uuid not null
  ) on commit drop;

  create temporary table a17q_role_corrections (
    safe_group_ref text not null,
    family_id uuid not null,
    membership_id uuid not null primary key,
    person_id uuid not null,
    expected_current_role text not null,
    target_role text not null,
    relationship_type text not null,
    applies_to_survivor boolean not null
  ) on commit drop;

  create temporary table a17q_excluded_families (
    safe_group_ref text not null,
    family_id uuid not null primary key
  ) on commit drop;

  create temporary table a17q_deleted_family_advisory (
    family_id uuid primary key,
    safe_family_ref text not null
  ) on commit drop;

  insert into a17q_approved_groups (
    group_review_order,
    safe_group_ref,
    survivor_family_id,
    survivor_safe_family_ref,
    void_family_ids,
    canonical_key
  )
  select
    (group_item ->> 'group_review_order')::integer,
    group_item ->> 'safe_group_ref',
    (group_item ->> 'survivor_family_id')::uuid,
    group_item ->> 'survivor_safe_family_ref',
    coalesce(
      array_agg((void_family ->> 'family_id')::uuid order by void_family ->> 'family_id')
        filter (where void_family is not null),
      array[]::uuid[]
    ),
    'canonical-family:v1:' || encode(
      digest(
        convert_to(
          jsonb_build_object(
            'version', 1,
            'parentIds', coalesce(
              (
                select jsonb_agg(parent_id order by parent_id)
                from (
                  select distinct fp.person_id::text as parent_id
                  from public.family_parents fp
                  where fp.family_id = (group_item ->> 'survivor_family_id')::uuid
                    and fp.deleted_at is null
                ) parent_ids
              ),
              '[]'::jsonb
            ),
            'relationshipPeriod', null,
            'unionIdentity', null
          )::text,
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    )
  from jsonb_array_elements(v_pack -> 'approved_groups') as group_source(group_item)
  left join lateral jsonb_array_elements(group_item -> 'void_families') as void_source(void_family) on true
  group by group_item;

  insert into a17q_approved_families (
    safe_group_ref,
    family_id,
    is_survivor,
    survivor_family_id
  )
  select safe_group_ref, survivor_family_id, true, survivor_family_id
  from a17q_approved_groups
  union all
  select groups.safe_group_ref, unnest(groups.void_family_ids), false, groups.survivor_family_id
  from a17q_approved_groups groups;

  insert into a17q_role_corrections (
    safe_group_ref,
    family_id,
    membership_id,
    person_id,
    expected_current_role,
    target_role,
    relationship_type,
    applies_to_survivor
  )
  select
    role_item ->> 'safe_group_ref',
    (role_item ->> 'family_id')::uuid,
    (role_item ->> 'membership_id')::uuid,
    (role_item ->> 'person_id')::uuid,
    role_item ->> 'expected_current_role',
    role_item ->> 'target_role',
    role_item ->> 'relationship_type',
    families.is_survivor
  from jsonb_array_elements(v_pack -> 'role_corrections') as role_source(role_item)
  join a17q_approved_families families
    on families.family_id = (role_item ->> 'family_id')::uuid;

  insert into a17q_excluded_families (safe_group_ref, family_id)
  select excluded_item ->> 'safe_group_ref', (family_id_item #>> '{}')::uuid
  from jsonb_array_elements(v_pack -> 'excluded_groups') as excluded_source(excluded_item)
  cross join lateral jsonb_array_elements(excluded_item -> 'candidate_family_ids') as family_source(family_id_item);

  insert into a17q_deleted_family_advisory (family_id, safe_family_ref)
  select (deleted_item ->> 'family_id')::uuid, deleted_item ->> 'safe_family_ref'
  from jsonb_array_elements(v_pack -> 'deleted_family_advisories') as deleted_source(deleted_item);

  select count(*) into v_approved_group_count from a17q_approved_groups;
  select count(*) into v_approved_family_count from a17q_approved_families;
  select count(*) into v_survivor_count from a17q_approved_families where is_survivor;
  select count(*) into v_void_family_count from a17q_approved_families where not is_survivor;
  select count(*) into v_role_plan_count from a17q_role_corrections;
  select count(*) into v_role_survivor_count from a17q_role_corrections where applies_to_survivor;
  select count(*) into v_role_void_count from a17q_role_corrections where not applies_to_survivor;

  if v_approved_group_count <> 21
    or v_approved_family_count <> 57
    or v_survivor_count <> 21
    or v_void_family_count <> 36
    or v_role_plan_count <> 36
    or v_role_survivor_count <> 16
    or v_role_void_count <> 20 then
    raise exception 'A17Q_TX1_MANIFEST_COUNT_MISMATCH';
  end if;

  if exists (
    select 1 from a17q_approved_families executable
    join a17q_excluded_families excluded using (family_id)
  ) or exists (
    select 1 from a17q_approved_families executable
    join a17q_deleted_family_advisory deleted using (family_id)
  ) then
    raise exception 'A17Q_TX1_EXCLUDED_OR_DELETED_FAMILY_IN_EXECUTABLE_SCOPE';
  end if;

  -- IDEMPOTENCY_STATE_CHECK: dry-run never consumes an execution record.
  if p_dry_run_only is not true then
    select *
    into v_existing_batch
    from public.family_reconciliation_batches batch_lock
    where batch_lock.idempotency_key = btrim(p_idempotency_key)
       or batch_lock.approved_audit_hash = v_decision_pack_sha
    order by
      case when batch_lock.idempotency_key = btrim(p_idempotency_key) then 0 else 1 end,
      batch_lock.created_at,
      batch_lock.id
    for update;

    if found then
      if v_existing_batch.idempotency_key = btrim(p_idempotency_key)
        and (
          v_existing_batch.approved_audit_hash is distinct from v_decision_pack_sha
          or v_existing_batch.owner_execution_marker is distinct from v_owner_marker
          or v_existing_batch.dry_run_hash is distinct from v_forecast_sha
        ) then
        raise exception 'A17Q_IDEMPOTENCY_KEY_CONFLICT';
      end if;

      if v_existing_batch.idempotency_key = btrim(p_idempotency_key)
        and v_existing_batch.approved_audit_hash = v_decision_pack_sha
        and v_existing_batch.owner_execution_marker = v_owner_marker
        and v_existing_batch.dry_run_hash = v_forecast_sha
        and v_existing_batch.status = 'completed' then
        v_replay_result := v_existing_batch.actual_counts;
        if jsonb_typeof(v_replay_result) <> 'object'
          or coalesce(v_replay_result ->> 'status', '') <> 'RECONCILIATION_COMPLETED'
          or coalesce(v_replay_result ->> 'idempotency_status', '') <> 'NEW_EXECUTION_COMPLETED' then
          raise exception 'A17Q_RECONCILIATION_BATCH_REQUIRES_RECOVERY';
        end if;

        return v_replay_result || jsonb_build_object(
          'idempotency_status', 'REPLAY_COMPLETED_SUCCESS',
          'replayed_successfully', true,
          'mutation_applied', false,
          'dry_run', false
        );
      end if;

      if v_existing_batch.approved_audit_hash = v_decision_pack_sha
        and v_existing_batch.idempotency_key is distinct from btrim(p_idempotency_key)
        and v_existing_batch.status = 'completed' then
        raise exception 'A17Q_DECISION_PACK_ALREADY_EXECUTED';
      end if;

      raise exception 'A17Q_RECONCILIATION_BATCH_REQUIRES_RECOVERY';
    end if;
  end if;

  perform 1
  from public.families f
  join a17q_approved_families approved on approved.family_id = f.id
  order by f.id
  for update;

  perform 1
  from public.family_parents fp
  join a17q_approved_families approved on approved.family_id = fp.family_id
  order by fp.family_id, fp.person_id, fp.id
  for update;

  perform 1
  from public.family_children fc
  join a17q_approved_families approved on approved.family_id = fc.family_id
  order by fc.family_id, fc.person_id, fc.id
  for update;

  select encode(digest(coalesce(jsonb_agg(to_jsonb(p) order by p.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_people_before_hash
  from public.people p
  join (
    select fp.person_id
    from public.family_parents fp
    join a17q_approved_families approved on approved.family_id = fp.family_id
    union
    select fc.person_id
    from public.family_children fc
    join a17q_approved_families approved on approved.family_id = fc.family_id
  ) touched_people on touched_people.person_id = p.id;

  select encode(digest(coalesce(jsonb_agg(to_jsonb(node) order by node.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_layout_before_hash
  from public.tree_layout_nodes node
  join a17q_approved_families approved on approved.family_id = node.family_id
  where node.deleted_at is null;

  select encode(digest(coalesce(jsonb_agg(to_jsonb(f) order by f.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_excluded_before_hash
  from public.families f
  join a17q_excluded_families excluded on excluded.family_id = f.id;

  select encode(digest(coalesce(jsonb_agg(to_jsonb(f) order by f.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_deleted_before_hash
  from public.families f
  join a17q_deleted_family_advisory deleted on deleted.family_id = f.id;

  -- FULL_PRECONDITION_VALIDATION: all checks below run before dry-run return and before execution batch insert.
  select count(*) into v_pre_family_count
  from public.families
  where deleted_at is null
    and coalesce(canonical_status, 'legacy_unreviewed') not in ('merged', 'voided');
  select count(*)
  into v_pre_parent_count
  from public.family_parents fp
  join public.families f on f.id = fp.family_id
  where fp.deleted_at is null
    and f.deleted_at is null
    and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided');
  select count(*)
  into v_pre_child_count
  from public.family_children fc
  join public.families f on f.id = fc.family_id
  where fc.deleted_at is null and f.deleted_at is null;

  if v_pre_family_count <> v_expected_active_family_before
    or v_pre_parent_count <> v_expected_active_parent_before
    or v_pre_child_count <> v_expected_active_child_before then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if (
    select count(*)
    from public.families f
    join a17q_approved_families approved on approved.family_id = f.id
    where f.deleted_at is null
      and coalesce(f.canonical_status, 'legacy_unreviewed') = 'legacy_unreviewed'
      and f.merged_into_family_id is null
      and not exists (
        select 1
        from public.tree_layout_nodes node
        where node.family_id = f.id
          and node.node_kind = 'family'
          and node.deleted_at is null
      )
  ) <> 57 then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if (
    select count(*)
    from public.family_parents fp
    join a17q_approved_families approved on approved.family_id = fp.family_id
    where fp.deleted_at is null
  ) <> 114 then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if (
    select count(*)
    from public.family_children fc
    join a17q_approved_families approved on approved.family_id = fc.family_id
    where fc.deleted_at is null
  ) <> 57 then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if (
    select count(distinct fc.person_id)
    from public.family_children fc
    join a17q_approved_families approved on approved.family_id = fc.family_id
    where fc.deleted_at is null
  ) <> 57 then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if exists (
    with per_family as (
      select
        groups.safe_group_ref,
        approved.family_id,
        approved.is_survivor,
        groups.survivor_family_id,
        groups.void_family_ids,
        count(distinct fp.person_id) filter (where fp.deleted_at is null) as parent_count,
        count(distinct fc.person_id) filter (where fc.deleted_at is null) as child_count,
        coalesce(array_agg(distinct fp.person_id order by fp.person_id) filter (where fp.deleted_at is null), array[]::uuid[]) as parent_set,
        count(node.id) filter (where node.deleted_at is null and node.node_kind = 'family') as layout_reference_count,
        bool_or(f.deleted_at is null) as family_active,
        bool_or(coalesce(f.canonical_status, 'legacy_unreviewed') = 'legacy_unreviewed') as legacy_status,
        bool_or(f.merged_into_family_id is not null) as has_merge_target
      from a17q_approved_groups groups
      join a17q_approved_families approved on approved.safe_group_ref = groups.safe_group_ref
      left join public.families f on f.id = approved.family_id
      left join public.family_parents fp on fp.family_id = approved.family_id
      left join public.family_children fc on fc.family_id = approved.family_id
      left join public.tree_layout_nodes node on node.family_id = approved.family_id
      group by groups.safe_group_ref, groups.survivor_family_id, groups.void_family_ids, approved.family_id, approved.is_survivor
    ),
    group_scope as (
      select
        safe_group_ref,
        count(*) as configured_family_count,
        count(*) filter (where is_survivor) as survivor_count,
        count(*) filter (where not is_survivor) as void_count,
        count(distinct parent_set) as normalized_parent_set_count,
        count(distinct parent_set) filter (where cardinality(parent_set) = 2) as two_parent_set_count,
        count(*) filter (where family_active and legacy_status and not has_merge_target) as active_legacy_count,
        count(*) filter (where parent_count = 2) as exact_parent_family_count,
        count(*) filter (where child_count = 1) as exact_child_family_count,
        count(*) filter (where layout_reference_count = 0) as no_layout_family_count
      from per_family
      group by safe_group_ref
    )
    select 1
    from group_scope scope
    join a17q_approved_groups groups using (safe_group_ref)
    where scope.configured_family_count <> cardinality(groups.void_family_ids) + 1
      or scope.survivor_count <> 1
      or scope.void_count <> cardinality(groups.void_family_ids)
      or scope.normalized_parent_set_count <> 1
      or scope.two_parent_set_count <> 1
      or scope.active_legacy_count <> scope.configured_family_count
      or scope.exact_parent_family_count <> scope.configured_family_count
      or scope.exact_child_family_count <> scope.configured_family_count
      or scope.no_layout_family_count <> scope.configured_family_count
  ) then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if exists (
    with approved_parent_sets as (
      select
        groups.safe_group_ref,
        coalesce(array_agg(distinct fp.person_id order by fp.person_id), array[]::uuid[]) as parent_set
      from a17q_approved_groups groups
      join a17q_approved_families approved on approved.safe_group_ref = groups.safe_group_ref
      join public.family_parents fp on fp.family_id = approved.family_id and fp.deleted_at is null
      group by groups.safe_group_ref
    ),
    all_active_family_parent_sets as (
      select
        f.id as family_id,
        coalesce(array_agg(distinct fp.person_id order by fp.person_id), array[]::uuid[]) as parent_set
      from public.families f
      join public.family_parents fp on fp.family_id = f.id and fp.deleted_at is null
      where f.deleted_at is null
        and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided')
      group by f.id
    )
    select 1
    from approved_parent_sets approved_set
    join all_active_family_parent_sets active_set on active_set.parent_set = approved_set.parent_set
    left join a17q_approved_families approved_family on approved_family.family_id = active_set.family_id
    where approved_family.family_id is null
  ) then
    raise exception 'A17Q_UNEXPECTED_FAMILY_IN_APPROVED_PARENT_SET';
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if exists (
    with approved_parent_sets as (
      select
        groups.safe_group_ref,
        coalesce(array_agg(distinct fp.person_id order by fp.person_id), array[]::uuid[]) as parent_set
      from a17q_approved_groups groups
      join a17q_approved_families approved on approved.safe_group_ref = groups.safe_group_ref
      join public.family_parents fp on fp.family_id = approved.family_id and fp.deleted_at is null
      group by groups.safe_group_ref
    )
    select parent_set
    from approved_parent_sets
    group by parent_set
    having count(*) > 1
  ) then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if exists (
    select 1
    from a17q_role_corrections role_plan
    left join public.family_parents fp
      on fp.id = role_plan.membership_id
     and fp.family_id = role_plan.family_id
     and fp.person_id = role_plan.person_id
     and fp.deleted_at is null
     and fp.parent_role = role_plan.expected_current_role
     and fp.relationship_type = role_plan.relationship_type
    where fp.id is null
      or role_plan.target_role not in ('father', 'mother')
      or role_plan.expected_current_role = role_plan.target_role
      or role_plan.relationship_type <> 'biological'
  ) then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if exists (
    select child_id
    from (
      select fc.person_id as child_id, count(*) as occurrence_count
      from public.family_children fc
      join a17q_approved_families approved on approved.family_id = fc.family_id
      where fc.deleted_at is null
      group by fc.person_id
    ) duplicate_children
    where occurrence_count <> 1
  ) then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if exists (
    select 1
    from public.family_parents fp
    join public.family_children fc
      on fc.family_id = fp.family_id
     and fc.person_id = fp.person_id
     and fc.deleted_at is null
    join a17q_approved_families approved on approved.family_id = fp.family_id
    where fp.deleted_at is null
  ) then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if exists (
    select 1
    from public.people person_row
    join (
      select fp.person_id from public.family_parents fp join a17q_approved_families approved on approved.family_id = fp.family_id
      union
      select fc.person_id from public.family_children fc join a17q_approved_families approved on approved.family_id = fc.family_id
    ) touched_people on touched_people.person_id = person_row.id
    where person_row.deleted_at is not null
  ) then
    v_precondition_failure_count := v_precondition_failure_count + 1;
  end if;
  v_precondition_check_count := v_precondition_check_count + 1;

  if v_precondition_failure_count > 0 then
    raise exception 'A17Q_TX1_PRECONDITION_DRIFT_DETECTED';
  end if;

  v_result := jsonb_build_object(
    'status', 'DRY_RUN_VALIDATED',
    'dry_run', true,
    'mutation_applied', false,
    'batch_id', null,
    'rollback_manifest_id', null,
    'audit_revision_ids', jsonb_build_array(),
    'idempotency_status', 'DRY_RUN_NOT_CONSUMED',
    'replayed_successfully', false,
    'decision_pack_sha256', v_decision_pack_sha,
    'owner_approval_marker', v_owner_marker,
    'approved_group_plan_sha256', v_approved_group_sha,
    'role_correction_plan_sha256', v_role_correction_sha,
    'excluded_scope_sha256', v_excluded_scope_sha,
    'forecast_sha256', v_forecast_sha,
    'approved_group_count', 21,
    'approved_family_count', 57,
    'survivor_count', 21,
    'void_family_count', 36,
    'child_membership_move_count', 36,
    'child_membership_preserved_count', 57,
    'child_membership_lost_count', 0,
    'parent_membership_deactivation_count', 72,
    'active_parent_membership_after', 68,
    'role_correction_plan_count', 36,
    'role_correction_applied_to_survivor_count', 16,
    'role_correction_superseded_by_void_count', 20,
    'excluded_group_count', 1,
    'excluded_family_count', 3,
    'deleted_family_count', 1,
    'expected_active_family_count_after', v_expected_active_family_after,
    'expected_active_parent_membership_count_after', v_expected_active_parent_after,
    'expected_active_child_membership_count_after', v_expected_active_child_after,
    'active_family_count_before', v_pre_family_count,
    'active_family_count_after', null,
    'active_parent_membership_count_before', v_pre_parent_count,
    'active_parent_membership_count_after', null,
    'active_child_membership_count_before', v_pre_child_count,
    'active_child_membership_count_after', null,
    'precondition_check_count', v_precondition_check_count,
    'precondition_failure_count', v_precondition_failure_count,
    'execution_allowed', v_precondition_failure_count = 0,
    'excluded_scope_unchanged', true,
    'deleted_family_unchanged', true,
    'graph_validation_status', 'NOT_RUN_DRY_RUN',
    'graph_validation_passed', false,
    'rollback_ready', false
  );

  if p_dry_run_only is true then
    return v_result;
  end if;

  -- RUNNING_BATCH_INSERT: execution records are created only after all preconditions pass.
  insert into public.family_reconciliation_batches (
    idempotency_key,
    status,
    owner_execution_marker,
    actor_profile_id,
    dry_run_hash,
    approved_audit_hash,
    expected_counts,
    blocker_summary,
    started_at,
    created_by,
    updated_by
  )
  values (
    btrim(p_idempotency_key),
    'running',
    v_owner_marker,
    v_profile_id,
    v_forecast_sha,
    v_decision_pack_sha,
    v_result || jsonb_build_object(
      'status', 'READY_FOR_EXECUTION',
      'dry_run', false,
      'idempotency_status', 'NEW_EXECUTION_STARTED'
    ),
    jsonb_build_object(
      'precondition_check_count', v_precondition_check_count,
      'precondition_failure_count', v_precondition_failure_count,
      'source', 'A-17Q-TX1 legacy family reconciliation transaction executor'
    ),
    v_now,
    v_profile_id,
    v_profile_id
  )
  returning * into v_batch;

  v_batch_id := v_batch.id;

  insert into public.family_reconciliation_rollback_manifests (
    reconciliation_batch_id,
    manifest_version,
    payload_hash,
    verification_status,
    rollback_status,
    affected_family_records_before,
    parent_memberships_before,
    child_memberships_before,
    layout_refs_before,
    canonical_family_choice,
    merged_family_ids,
    voided_family_ids,
    verification_details,
    created_by,
    updated_by
  )
  values (
    v_batch_id,
    1,
    v_decision_pack_sha,
    'verified',
    'ready',
    (
      select coalesce(jsonb_agg(to_jsonb(f) order by f.id), '[]'::jsonb)
      from public.families f
      join a17q_approved_families approved on approved.family_id = f.id
    ),
    (
      select coalesce(jsonb_agg(to_jsonb(fp) order by fp.family_id, fp.person_id, fp.id), '[]'::jsonb)
      from public.family_parents fp
      join a17q_approved_families approved on approved.family_id = fp.family_id
    ),
    (
      select coalesce(jsonb_agg(to_jsonb(fc) order by fc.family_id, fc.person_id, fc.id), '[]'::jsonb)
      from public.family_children fc
      join a17q_approved_families approved on approved.family_id = fc.family_id
    ),
    (
      select coalesce(jsonb_agg(to_jsonb(node) order by node.id), '[]'::jsonb)
      from public.tree_layout_nodes node
      join a17q_approved_families approved on approved.family_id = node.family_id
      where node.deleted_at is null
    ),
    jsonb_build_object(
      'source', 'A-17Q-TX1 legacy family reconciliation transaction executor',
      'owner_marker', v_owner_marker,
      'decision_pack_sha256', v_decision_pack_sha,
      'approved_groups', v_pack -> 'approved_groups',
      'role_corrections', v_pack -> 'role_corrections',
      'excluded_groups', v_pack -> 'excluded_groups',
      'deleted_family_advisories', v_pack -> 'deleted_family_advisories'
    ),
    (
      select coalesce(array_agg(family_id order by family_id), array[]::uuid[])
      from a17q_approved_families
      where not is_survivor
    ),
    (
      select coalesce(array_agg(family_id order by family_id), array[]::uuid[])
      from a17q_approved_families
      where not is_survivor
    ),
    jsonb_build_object(
      'excluded_scope_unchanged', true,
      'deleted_family_unchanged', true,
      'hashes', v_pack -> 'hashes',
      'idempotency_key', p_idempotency_key,
      'actor_profile_id', v_profile_id
    ),
    v_profile_id,
    v_profile_id
  )
  returning id into v_rollback_manifest_id;

  -- PRE_MUTATION_AUDIT_BEFORE_GENEALOGY_MUTATION.
  insert into public.revisions (
    entity_type,
    entity_id,
    action,
    before_json,
    after_json,
    changed_by,
    change_reason
  )
  values (
    'families',
    (select survivor_family_id from a17q_approved_groups order by group_review_order limit 1),
    'update',
    null,
    jsonb_build_object(
      'event_type', 'A17Q_LEGACY_FAMILY_RECONCILIATION_PRE_MUTATION',
      'source', 'A-17Q-TX1 legacy family reconciliation transaction executor',
      'batch_id', v_batch_id,
      'rollback_manifest_id', v_rollback_manifest_id,
      'owner_marker', v_owner_marker,
      'idempotency_key', btrim(p_idempotency_key),
      'decision_pack_sha256', v_decision_pack_sha,
      'approved_group_plan_sha256', v_approved_group_sha,
      'role_correction_plan_sha256', v_role_correction_sha,
      'excluded_scope_sha256', v_excluded_scope_sha,
      'forecast_sha256', v_forecast_sha,
      'active_family_count_before', v_pre_family_count,
      'active_parent_membership_count_before', v_pre_parent_count,
      'active_child_membership_count_before', v_pre_child_count,
      'people_before_hash', v_people_before_hash,
      'layout_before_hash', v_layout_before_hash,
      'excluded_before_hash', v_excluded_before_hash,
      'deleted_before_hash', v_deleted_before_hash,
      'precondition_check_count', v_precondition_check_count
    ),
    v_profile_id,
    'A-17Q-TX1 legacy family reconciliation transaction executor'
  )
  returning id into v_pre_mutation_audit_id;

  -- FIRST_GENEALOGY_MUTATION: no family/parent/child row is changed before the pre-mutation audit above.
  with survivor_role_updates as (
    update public.family_parents fp
    set parent_role = role_plan.target_role,
        updated_by = v_profile_id,
        updated_at = v_now
    from a17q_role_corrections role_plan
    where role_plan.applies_to_survivor
      and fp.id = role_plan.membership_id
      and fp.parent_role = role_plan.expected_current_role
      and fp.relationship_type = 'biological'
    returning fp.id, fp.family_id, fp.person_id, role_plan.expected_current_role, role_plan.target_role
  ),
  moved_children as (
    update public.family_children fc
    set family_id = approved.survivor_family_id,
        updated_by = v_profile_id,
        updated_at = v_now
    from a17q_approved_families approved
    where not approved.is_survivor
      and fc.family_id = approved.family_id
      and fc.deleted_at is null
    returning fc.id, approved.family_id as old_family_id, fc.family_id as new_family_id, fc.person_id
  ),
  deactivated_parents as (
    update public.family_parents fp
    set deleted_at = v_now,
        deleted_by = v_profile_id,
        delete_reason = 'A-17Q-TX1 legacy family reconciliation parent membership superseded by survivor family',
        updated_by = v_profile_id,
        updated_at = v_now
    from a17q_approved_families approved
    where not approved.is_survivor
      and fp.family_id = approved.family_id
      and fp.deleted_at is null
    returning fp.id, fp.family_id, fp.person_id
  ),
  canonicalized_survivors as (
    update public.families f
    set canonical_key = groups.canonical_key,
        canonical_status = 'canonical',
        canonicalized_at = v_now,
        canonicalized_by = v_profile_id,
        reconciliation_batch_id = v_batch_id,
        updated_by = v_profile_id,
        updated_at = v_now
    from a17q_approved_groups groups
    where f.id = groups.survivor_family_id
      and f.deleted_at is null
    returning f.id
  ),
  voided_families as (
    update public.families f
    set canonical_status = 'merged',
        merged_into_family_id = approved.survivor_family_id,
        reconciliation_batch_id = v_batch_id,
        updated_by = v_profile_id,
        updated_at = v_now
    from a17q_approved_families approved
    where not approved.is_survivor
      and f.id = approved.family_id
      and f.deleted_at is null
    returning f.id, approved.survivor_family_id
  )
  select
    (select count(*) from survivor_role_updates),
    (select count(*) from moved_children),
    (select count(*) from deactivated_parents),
    (select count(*) from canonicalized_survivors),
    (select count(*) from voided_families),
    (select count(*) from voided_families where survivor_family_id is not null),
    (select count(*) from a17q_role_corrections where not applies_to_survivor)
  into
    v_survivor_role_update_count,
    v_child_move_count,
    v_parent_deactivation_count,
    v_survivor_canonicalization_count,
    v_void_family_update_count,
    v_merge_target_update_count,
    v_superseded_role_correction_count;

  if v_survivor_role_update_count <> 16
    or v_child_move_count <> 36
    or v_parent_deactivation_count <> 72
    or v_survivor_canonicalization_count <> 21
    or v_void_family_update_count <> 36
    or v_merge_target_update_count <> 36
    or v_superseded_role_correction_count <> 20 then
    raise exception 'A17Q_MUTATION_ROW_COUNT_MISMATCH';
  end if;

  -- REAL_POST_STATE_VALIDATION: completed status is stored only after these checks pass.
  select count(*) into v_post_family_count
  from public.families f
  where f.deleted_at is null
    and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided');

  select count(*) into v_post_parent_count
  from public.family_parents fp
  join public.families f on f.id = fp.family_id
  where fp.deleted_at is null
    and f.deleted_at is null
    and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided');

  select count(*) into v_post_child_count
  from public.family_children fc
  join public.families f on f.id = fc.family_id
  where fc.deleted_at is null and f.deleted_at is null;

  select count(*), count(distinct fc.person_id)
  into v_approved_post_child_count, v_approved_post_distinct_child_count
  from public.family_children fc
  join (
    select distinct survivor_family_id as family_id
    from a17q_approved_groups
  ) survivor_families on survivor_families.family_id = fc.family_id
  where fc.deleted_at is null;

  select count(*) into v_approved_survivor_parent_count
  from public.family_parents fp
  join a17q_approved_families approved
    on approved.is_survivor
   and approved.family_id = fp.family_id
  where fp.deleted_at is null;

  select count(*) into v_approved_void_parent_count
  from public.family_parents fp
  join a17q_approved_families approved
    on not approved.is_survivor
   and approved.family_id = fp.family_id
  where fp.deleted_at is null;

  select count(*) into v_approved_active_survivor_count
  from public.families f
  join a17q_approved_families approved
    on approved.is_survivor
   and approved.family_id = f.id
  where f.deleted_at is null
    and f.canonical_status = 'canonical'
    and f.merged_into_family_id is null
    and f.reconciliation_batch_id = v_batch_id;

  select count(*) into v_approved_active_void_count
  from public.families f
  join a17q_approved_families approved
    on not approved.is_survivor
   and approved.family_id = f.id
  where f.deleted_at is null
    and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided');

  select encode(digest(coalesce(jsonb_agg(to_jsonb(p) order by p.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_people_after_hash
  from public.people p
  join (
    select fp.person_id
    from public.family_parents fp
    join a17q_approved_families approved on approved.family_id = fp.family_id
    union
    select fc.person_id
    from public.family_children fc
    join a17q_approved_groups groups on groups.survivor_family_id = fc.family_id
  ) touched_people on touched_people.person_id = p.id;

  select encode(digest(coalesce(jsonb_agg(to_jsonb(node) order by node.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_layout_after_hash
  from public.tree_layout_nodes node
  join a17q_approved_families approved on approved.family_id = node.family_id
  where node.deleted_at is null;

  select encode(digest(coalesce(jsonb_agg(to_jsonb(f) order by f.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_excluded_after_hash
  from public.families f
  join a17q_excluded_families excluded on excluded.family_id = f.id;

  select encode(digest(coalesce(jsonb_agg(to_jsonb(f) order by f.id), '[]'::jsonb)::text, 'sha256'), 'hex')
  into v_deleted_after_hash
  from public.families f
  join a17q_deleted_family_advisory deleted on deleted.family_id = f.id;

  if v_post_family_count <> v_expected_active_family_after
    or v_post_parent_count <> v_expected_active_parent_after
    or v_post_child_count <> v_expected_active_child_after
    or v_approved_post_child_count <> 57
    or v_approved_post_distinct_child_count <> 57
    or v_approved_survivor_parent_count <> 42
    or v_approved_void_parent_count <> 0
    or v_approved_active_survivor_count <> 21
    or v_approved_active_void_count <> 0
    or v_people_after_hash is distinct from v_people_before_hash
    or v_layout_after_hash is distinct from v_layout_before_hash
    or v_excluded_after_hash is distinct from v_excluded_before_hash
    or v_deleted_after_hash is distinct from v_deleted_before_hash then
    raise exception 'A17Q_POST_STATE_VALIDATION_FAILED';
  end if;

  if exists (
    select 1
    from public.family_parents fp
    join public.family_children fc
      on fc.family_id = fp.family_id
     and fc.person_id = fp.person_id
     and fc.deleted_at is null
    join public.families f on f.id = fp.family_id
    where fp.deleted_at is null
      and f.deleted_at is null
      and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided')
  ) or exists (
    select 1
    from public.family_parents fp
    join a17q_approved_families approved
      on approved.is_survivor
     and approved.family_id = fp.family_id
    where fp.deleted_at is null
    group by fp.family_id, fp.person_id
    having count(*) > 1
  ) or exists (
    select 1
    from public.family_children fc
    join a17q_approved_groups groups on groups.survivor_family_id = fc.family_id
    where fc.deleted_at is null
    group by fc.family_id, fc.person_id
    having count(*) > 1
  ) or exists (
    select 1
    from public.family_children fc
    join a17q_approved_families approved
      on not approved.is_survivor
     and approved.family_id = fc.family_id
    where fc.deleted_at is null
  ) or exists (
    select 1
    from public.family_parents fp
    join a17q_approved_families approved
      on approved.is_survivor
     and approved.family_id = fp.family_id
    where fp.deleted_at is null
    group by fp.family_id
    having count(*) <> 2
       or count(*) filter (where fp.parent_role = 'father') <> 1
       or count(*) filter (where fp.parent_role = 'mother') <> 1
  ) then
    raise exception 'A17Q_GRAPH_VALIDATION_FAILED';
  end if;

  v_graph_validation_passed := true;

  insert into public.revisions (
    entity_type,
    entity_id,
    action,
    before_json,
    after_json,
    changed_by,
    change_reason
  )
  values (
    'families',
    (select survivor_family_id from a17q_approved_groups order by group_review_order limit 1),
    'update',
    null,
    jsonb_build_object(
      'event_type', 'A17Q_LEGACY_FAMILY_RECONCILIATION_COMPLETED',
      'source', 'A-17Q-TX1 legacy family reconciliation transaction executor',
      'batch_id', v_batch_id,
      'rollback_manifest_id', v_rollback_manifest_id,
      'owner_marker', v_owner_marker,
      'idempotency_key', btrim(p_idempotency_key),
      'decision_pack_sha256', v_decision_pack_sha,
      'approved_group_plan_sha256', v_approved_group_sha,
      'role_correction_plan_sha256', v_role_correction_sha,
      'excluded_scope_sha256', v_excluded_scope_sha,
      'forecast_sha256', v_forecast_sha,
      'survivor_role_update_count', v_survivor_role_update_count,
      'role_correction_superseded_by_void_count', v_superseded_role_correction_count,
      'child_membership_move_count', v_child_move_count,
      'parent_membership_deactivation_count', v_parent_deactivation_count,
      'survivor_canonicalization_count', v_survivor_canonicalization_count,
      'void_family_update_count', v_void_family_update_count,
      'active_family_count_after', v_post_family_count,
      'active_parent_membership_count_after', v_post_parent_count,
      'active_child_membership_count_after', v_post_child_count,
      'people_after_hash', v_people_after_hash,
      'layout_after_hash', v_layout_after_hash,
      'excluded_after_hash', v_excluded_after_hash,
      'deleted_after_hash', v_deleted_after_hash,
      'excluded_scope_unchanged', true,
      'deleted_family_unchanged', true,
      'graph_validation_passed', v_graph_validation_passed
    ),
    v_profile_id,
    'A-17Q-TX1 legacy family reconciliation transaction executor'
  )
  returning id into v_post_mutation_audit_id;

  update public.family_reconciliation_rollback_manifests
  set audit_revision_ids = array[v_pre_mutation_audit_id, v_post_mutation_audit_id],
      verification_details = verification_details || jsonb_build_object(
        'pre_mutation_audit_revision_id', v_pre_mutation_audit_id,
        'post_mutation_audit_revision_id', v_post_mutation_audit_id,
        'post_state_verified', true
      ),
      updated_by = v_profile_id,
      updated_at = v_now
  where id = v_rollback_manifest_id;

  v_result := jsonb_build_object(
    'status', 'RECONCILIATION_COMPLETED',
    'dry_run', false,
    'mutation_applied', true,
    'batch_id', v_batch_id,
    'rollback_manifest_id', v_rollback_manifest_id,
    'audit_revision_ids', jsonb_build_array(v_pre_mutation_audit_id, v_post_mutation_audit_id),
    'pre_mutation_audit_revision_id', v_pre_mutation_audit_id,
    'post_mutation_audit_revision_id', v_post_mutation_audit_id,
    'idempotency_status', 'NEW_EXECUTION_COMPLETED',
    'replayed_successfully', false,
    'decision_pack_sha256', v_decision_pack_sha,
    'owner_approval_marker', v_owner_marker,
    'approved_group_plan_sha256', v_approved_group_sha,
    'role_correction_plan_sha256', v_role_correction_sha,
    'excluded_scope_sha256', v_excluded_scope_sha,
    'forecast_sha256', v_forecast_sha,
    'approved_group_count', 21,
    'approved_family_count', 57,
    'survivor_count', 21,
    'void_family_count', 36,
    'child_membership_move_count', v_child_move_count,
    'child_membership_preserved_count', v_approved_post_child_count,
    'child_membership_lost_count', 0,
    'parent_membership_deactivation_count', v_parent_deactivation_count,
    'active_parent_membership_after', v_post_parent_count,
    'role_correction_plan_count', 36,
    'role_correction_applied_to_survivor_count', v_survivor_role_update_count,
    'role_correction_superseded_by_void_count', v_superseded_role_correction_count,
    'excluded_group_count', 1,
    'excluded_family_count', 3,
    'deleted_family_count', 1,
    'expected_active_family_count_after', v_expected_active_family_after,
    'expected_active_parent_membership_count_after', v_expected_active_parent_after,
    'expected_active_child_membership_count_after', v_expected_active_child_after,
    'active_family_count_before', v_pre_family_count,
    'active_family_count_after', v_post_family_count,
    'active_parent_membership_count_before', v_pre_parent_count,
    'active_parent_membership_count_after', v_post_parent_count,
    'active_child_membership_count_before', v_pre_child_count,
    'active_child_membership_count_after', v_post_child_count,
    'precondition_check_count', v_precondition_check_count,
    'precondition_failure_count', v_precondition_failure_count,
    'post_state_verified', true,
    'excluded_scope_unchanged', true,
    'deleted_family_unchanged', true,
    'graph_validation_status', 'PASSED',
    'graph_validation_passed', v_graph_validation_passed,
    'rollback_ready', true
  );

  -- STORE_COMPLETE_SUCCESS_RESULT.
  update public.family_reconciliation_batches
  set status = 'completed',
      actual_counts = v_result,
      completed_at = v_now,
      updated_by = v_profile_id,
      updated_at = v_now
  where id = v_batch_id
  returning actual_counts into v_result;

  return v_result;
end;
$$;

comment on function public.execute_admin_a17q_legacy_family_reconciliation(
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
) is
  'A-17Q-TX1 candidate: SECURITY INVOKER transaction executor for the immutable A-17P-R 21-group legacy family reconciliation decision pack only. Not applied until owner review and a separate manual apply phase.';

revoke execute on function public.execute_admin_a17q_legacy_family_reconciliation(
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
) from public;

revoke execute on function public.execute_admin_a17q_legacy_family_reconciliation(
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
) from anon;

grant execute on function public.execute_admin_a17q_legacy_family_reconciliation(
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
) to authenticated;
