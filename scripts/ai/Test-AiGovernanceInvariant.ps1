[CmdletBinding()]
param(
    [string]$RepositoryRoot = ''
)

$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()

function Require-Path {
    param([string]$RelativePath)
    if (-not (Test-Path -LiteralPath (Join-Path $RepositoryRoot $RelativePath))) { $script:failures.Add("MISSING:$RelativePath") }
}
function Require-Text {
    param([string]$RelativePath, [string]$Pattern, [string]$Name)
    $path = Join-Path $RepositoryRoot $RelativePath
    if (-not (Test-Path -LiteralPath $path) -or -not ((Get-Content -LiteralPath $path -Raw) -match $Pattern)) { $script:failures.Add("MISSING_TEXT:$Name") }
}
function Require-NoText {
    param([string]$RelativePath, [string]$Pattern, [string]$Name)
    $path = Join-Path $RepositoryRoot $RelativePath
    if ((Test-Path -LiteralPath $path) -and ((Get-Content -LiteralPath $path -Raw) -match $Pattern)) { $script:failures.Add("FORBIDDEN_TEXT:$Name") }
}
function Test-ValidActiveContract {
    param([System.IO.FileInfo]$Contract)
    if ($Contract.Name -notmatch '^GOV-[A-Z0-9]+(?:-[A-Z0-9]+)*_[A-Z0-9][A-Z0-9_]*\.md$') { $script:failures.Add('ACTIVE_CONTRACT_FILENAME_INVALID'); return }
    $content = Get-Content -LiteralPath $Contract.FullName -Raw
    $requiredPatterns = [ordered]@{
        TASK_ID = '(?m)^TASK_ID=[A-Z0-9]+(?:-[A-Z0-9]+)*(?:_[A-Z0-9]+)*\r?$'
        RISK_CLASS = '(?m)^RISK_CLASS=(LOW|MEDIUM|HIGH|PRODUCTION)\r?$'
        OWNER_GATE = '(?m)^OWNER_GATE=OWNER_APPROVED_[A-Z0-9_]+\r?$'
        COMMIT_ALLOWED = '(?m)^COMMIT_ALLOWED=(true|false)\r?$'
        PUSH_ALLOWED = '(?m)^PUSH_ALLOWED=(true|false)\r?$'
        DEPLOY_ALLOWED = '(?m)^DEPLOY_ALLOWED=(true|false)\r?$'
        PRODUCTION_MUTATION_ALLOWED = '(?m)^PRODUCTION_MUTATION_ALLOWED=(true|false)\r?$'
        DATABASE_MUTATION_ALLOWED = '(?m)^DATABASE_MUTATION_ALLOWED=(true|false)\r?$'
        OFFICIAL_IMPORT_ALLOWED = '(?m)^OFFICIAL_IMPORT_ALLOWED=(true|false)\r?$'
        A16_EXECUTION_ALLOWED = '(?m)^A16_EXECUTION_ALLOWED=(true|false)\r?$'
    }
    foreach ($name in $requiredPatterns.Keys) {
        if ($content -notmatch $requiredPatterns[$name]) { $script:failures.Add("ACTIVE_CONTRACT_STRUCTURE_INVALID:$name") }
    }
}

try {
    if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
        $RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
    }
    $requiredPaths = @(
        'AGENTS.md', 'docs/AI_WORKFLOW.md', 'docs/AI_EXECUTION_ROUTING.md', 'docs/exec-plans/README.md',
        'docs/exec-plans/completed/README.md', '.codex/config.toml', '.codex/agents/explorer.toml', '.codex/agents/coder.toml',
        '.codex/agents/reviewer.toml', '.codex/agents/verifier.toml', 'scripts/ai/Invoke-AiWriterLease.ps1',
        'scripts/ai/New-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiGovernanceInvariant.ps1',
        'scripts/ai/Test-AiWriterLeaseLifecycle.ps1'
    )
    foreach ($path in $requiredPaths) { Require-Path $path }

    $activeDirectory = Join-Path $RepositoryRoot 'docs/exec-plans/active'
    $activeContracts = @(Get-ChildItem -LiteralPath $activeDirectory -File -Filter '*.md' -ErrorAction SilentlyContinue)
    if ($activeContracts.Count -ne 1) { $failures.Add("ACTIVE_CONTRACT_COUNT:$($activeContracts.Count)") }
    if ($activeContracts.Count -eq 1) { Test-ValidActiveContract $activeContracts[0] }

    Require-Text 'AGENTS.md' 'AI_WORKFLOW\.md' 'AGENTS_WORKFLOW_STARTUP'
    Require-Text 'AGENTS.md' 'AI_EXECUTION_ROUTING\.md' 'AGENTS_ROUTING_STARTUP'
    Require-Text 'AGENTS.md' 'exactly one (real )?active contract' 'AGENTS_ACTIVE_CONTRACT_STARTUP'
    Require-Text 'docs/AI_WORKFLOW.md' 'one application-source writer' 'WORKFLOW_ONE_WRITER'
    Require-Text 'docs/AI_WORKFLOW.md' 'isolated snapshot' 'WORKFLOW_ISOLATION'
    Require-Text 'docs/AI_WORKFLOW.md' 'Never use broad staging' 'WORKFLOW_GIT_GATE'
    Require-Text 'docs/AI_WORKFLOW.md' 'Supabase production writes' 'WORKFLOW_PRODUCTION_GATE'
    Require-Text 'docs/AI_WORKFLOW.md' 'schema changes or migrations' 'WORKFLOW_DATABASE_GATE'
    Require-Text 'docs/AI_WORKFLOW.md' 'official Gia Phả import' 'WORKFLOW_IMPORT_GATE'
    Require-Text 'docs/AI_EXECUTION_ROUTING.md' 'CHEAPEST_CAPABLE' 'ROUTING_COST_POLICY'
    Require-Text 'docs/AI_EXECUTION_ROUTING.md' 'Owner \+ ChatGPT' 'ROUTING_RESPONSIBILITY_BOUNDARY'
    Require-Text '.codex/agents/coder.toml' 'application_source_writer = true' 'CODER_SOLE_WRITER'
    foreach ($role in @('explorer','reviewer','verifier')) {
        Require-Text ".codex/agents/$role.toml" 'write_permission = false' "$role_WRITE_DENIED"
        Require-Text ".codex/agents/$role.toml" 'main_worktree_access = false' "$role_MAIN_WORKTREE_DENIED"
        Require-Text ".codex/agents/$role.toml" 'isolation_required = true' "$role_ISOLATION_REQUIRED"
    }
    Require-Text 'docs/AI_WORKFLOW.md' 'PASS never implies permission to commit, push, deploy' 'WORKFLOW_PASS_NOT_PERMISSION'
    Require-Text 'scripts/ai/Invoke-AiWriterLease.ps1' 'if \(\$lease\.State -ne ''COMPLETED''\) \{ throw ''RELEASE_REQUIRES_COMPLETED_LEASE'' \}' 'LEASE_RELEASE_COMPLETED_ONLY'
    Require-NoText 'scripts/ai/Invoke-AiWriterLease.ps1' '(?i)\b(recover|recovery)\b' 'LEASE_NO_RECOVERY'
    Require-Text 'scripts/ai/Test-AiWriterLeaseLifecycle.ps1' 'RESERVED_RELEASE_REJECTED' 'LEASE_HARNESS_RESERVED_RELEASE_REJECTION'
    Require-Text 'scripts/ai/Test-AiWriterLeaseLifecycle.ps1' 'ACTIVE_RELEASE_REJECTED' 'LEASE_HARNESS_ACTIVE_RELEASE_REJECTION'
    Require-Text 'scripts/ai/Test-AiWriterLeaseLifecycle.ps1' 'SECOND_ACQUIRE_REJECTED' 'LEASE_HARNESS_SECOND_ACQUIRE_REJECTION'
    Require-Text 'scripts/ai/Test-AiWriterLeaseLifecycle.ps1' 'WRONG_IDENTITY_REJECTED' 'LEASE_HARNESS_WRONG_IDENTITY_REJECTION'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'ConvertTo-NormalizedRepositoryRelativePath' 'SNAPSHOT_NORMALIZED_RELATIVE_PATHS'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' "'secrets', 'tmp', 'temp'" 'SNAPSHOT_PROTECTED_SEGMENTS'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' "-like '\.env\*'" 'SNAPSHOT_ENV_EXCLUSION'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'if \(Test-ExcludedPath \$relativePath\) \{ throw ''CANDIDATE_PATH_EXCLUSION_VIOLATION'' \}' 'SNAPSHOT_CANDIDATE_EXCLUSION_WINS'
    Require-NoText 'scripts/ai/New-AiNonWriterSnapshot.ps1' "'secret', 'logs'" 'SNAPSHOT_NO_UNPROVEN_PROTECTED_SEGMENTS'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'SchemaVersion = 2' 'SNAPSHOT_MANIFEST_SCHEMA_V2'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'PrimaryStatusIdentityBefore' 'SNAPSHOT_PRIMARY_STATUS_EVIDENCE'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'PrimaryIndexIdentityBefore' 'SNAPSHOT_PRIMARY_INDEX_EVIDENCE'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'CandidateOverlayContentIdentity' 'SNAPSHOT_CANDIDATE_CONTENT_EVIDENCE'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'SnapshotContentIdentity' 'SNAPSHOT_CONTENT_EVIDENCE'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'DiffCheckOutputIdentity' 'SNAPSHOT_DIFF_CHECK_EVIDENCE'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'EvidenceEnvelopeHash' 'SNAPSHOT_EVIDENCE_ENVELOPE'
    Require-Text 'scripts/ai/New-AiNonWriterSnapshot.ps1' 'SNAPSHOT_METADATA_FORBIDDEN' 'SNAPSHOT_METADATA_FREE_ENFORCED'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'PROTECTED_PATH_PRESENT' 'SNAPSHOT_HARNESS_PROTECTED_PATHS'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TRACKED_DIRTY_CANDIDATE_NOT_OVERLAID' 'SNAPSHOT_HARNESS_TRACKED_CANDIDATE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'UNTRACKED_CANDIDATE_NOT_OVERLAID' 'SNAPSHOT_HARNESS_UNTRACKED_CANDIDATE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'PRIMARY_WORKTREE_OR_INDEX_CHANGED' 'SNAPSHOT_HARNESS_PRIMARY_INTEGRITY'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'CLEANUP_TOUCHED_NON_OWNED_PATH' 'SNAPSHOT_HARNESS_OWNED_CLEANUP'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_SOURCE_HEAD_BEFORE_AFTER_MATCH' 'SNAPSHOT_HARNESS_SOURCE_HEAD_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_PRIMARY_STATUS_IDENTITY_BEFORE_AFTER_MATCH' 'SNAPSHOT_HARNESS_STATUS_IDENTITY_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_PRIMARY_INDEX_IDENTITY_BEFORE_AFTER_MATCH' 'SNAPSHOT_HARNESS_INDEX_IDENTITY_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_CANDIDATE_PATHS_IDENTITY_VALID' 'SNAPSHOT_HARNESS_CANDIDATE_PATH_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_CANDIDATE_CONTENT_IDENTITY_VALID' 'SNAPSHOT_HARNESS_CANDIDATE_CONTENT_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_SNAPSHOT_CONTENT_IDENTITY_VALID' 'SNAPSHOT_HARNESS_CONTENT_IDENTITY_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_DIFF_CHECK_FAILS_OR_REPORTS_FOR_BAD_WHITESPACE_FIXTURE' 'SNAPSHOT_HARNESS_DIFF_CHECK_FAILURE_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_MANIFEST_TAMPER_DETECTED' 'SNAPSHOT_HARNESS_MANIFEST_TAMPER_EVIDENCE'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_ZERO_ACTIVE_CONTRACT_REJECTED' 'SNAPSHOT_HARNESS_ZERO_ACTIVE_CONTRACT_REJECTION'
    Require-Text 'scripts/ai/Test-AiNonWriterSnapshot.ps1' 'TEST_TWO_ACTIVE_CONTRACT_REJECTED' 'SNAPSHOT_HARNESS_TWO_ACTIVE_CONTRACT_REJECTION'

    if ($failures.Count -gt 0) {
        @{ GovernanceInvariant = 'FAIL'; FailureCount = $failures.Count; Failures = @($failures) } | ConvertTo-Json -Compress
        exit 1
    }
    @{ GovernanceInvariant = 'PASS'; ActiveContractCount = 1; ActiveContract = "docs/exec-plans/active/$($activeContracts[0].Name)" } | ConvertTo-Json -Compress
} catch {
    @{ GovernanceInvariant = 'FAIL'; Failures = @("UNEXPECTED:$($_.Exception.Message)") } | ConvertTo-Json -Compress
    exit 1
}
