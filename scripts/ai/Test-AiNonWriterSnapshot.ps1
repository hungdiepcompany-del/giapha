[CmdletBinding()]
param([string]$SnapshotHelperPath = '')

$ErrorActionPreference = 'Stop'
$powershellExe = Join-Path $PSHOME 'powershell.exe'
$testRoot = $null
$snapshotPath = $null
$failures = [System.Collections.Generic.List[string]]::new()

function Add-Failure {
    param([string]$Code)
    $script:failures.Add($Code)
}
function Write-File {
    param([string]$Root, [string]$RelativePath, [string]$Value)
    $path = Join-Path $Root ($RelativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    [System.IO.Directory]::CreateDirectory((Split-Path -Parent $path)) | Out-Null
    [System.IO.File]::WriteAllText($path, $Value, [System.Text.UTF8Encoding]::new($false))
}
function Test-FileValue {
    param([string]$Root, [string]$RelativePath, [string]$ExpectedValue, [string]$FailureCode)
    $path = Join-Path $Root ($RelativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf) -or [System.IO.File]::ReadAllText($path) -ne $ExpectedValue) { Add-Failure $FailureCode }
}
function Test-FileAbsent {
    param([string]$Root, [string]$RelativePath, [string]$FailureCode)
    $path = Join-Path $Root ($RelativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    if (Test-Path -LiteralPath $path) { Add-Failure $FailureCode }
}
function Invoke-Git {
    param([string[]]$Arguments)
    $output = & git @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) { throw "GIT_FAILED:$($Arguments -join ' '):$($output -join ' ')" }
    return @($output)
}
function Get-Sha256Hex {
    param([byte[]]$Bytes)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { return (($sha.ComputeHash($Bytes) | ForEach-Object { $_.ToString('x2') }) -join '') }
    finally { $sha.Dispose() }
}
function Get-TextIdentity {
    param([string]$Text)
    return Get-Sha256Hex ([System.Text.Encoding]::UTF8.GetBytes($Text))
}
function Get-FileContentIdentity {
    param([string]$Root, [string[]]$RelativePaths)
    $entries = [System.Collections.Generic.List[string]]::new()
    foreach ($relativePath in @($RelativePaths | ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_ } | Where-Object { $_ } | Sort-Object -Unique)) {
        $path = Join-Path $Root ($relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        if (Test-Path -LiteralPath $path -PathType Leaf) {
            $entries.Add(($relativePath + [char]0 + (Get-Sha256Hex ([System.IO.File]::ReadAllBytes($path))) + [char]0))
        }
    }
    return Get-TextIdentity ($entries -join '')
}
function Get-SnapshotContentIdentity {
    param([string]$ContentRoot)
    $paths = @(
        Get-ChildItem -LiteralPath $ContentRoot -File -Recurse -Force |
        ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_.FullName.Substring($ContentRoot.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar) } |
        Where-Object { $_ -and $_ -ne '.ai-governance-snapshot.json' } | Sort-Object -Unique
    )
    return Get-FileContentIdentity $ContentRoot $paths
}
function Get-EvidenceEnvelopeIdentity {
    param($Manifest)
    $orderedNames = @('SourceHeadBefore', 'SourceHeadAfter', 'PrimaryStatusIdentityBefore', 'PrimaryStatusIdentityAfter', 'PrimaryIndexIdentityBefore', 'PrimaryIndexIdentityAfter', 'SnapshotBaselineHead', 'CandidatePathsIdentity', 'CandidateOverlayContentIdentity', 'SnapshotContentIdentity', 'DiffCheckStatus', 'DiffCheckExitCode', 'DiffCheckOutputIdentity')
    return Get-TextIdentity ((($orderedNames | ForEach-Object { "$_=$($Manifest.$_)" }) -join "`n") + "`n")
}
function Write-ValidActiveContract {
    param([string]$Root, [string]$Name = 'GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION.md')
    $content = @"
# Disposable active contract
TASK_ID=GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION
RISK_CLASS=MEDIUM
OWNER_GATE=OWNER_APPROVED_DISPOSABLE_SUCCESSOR_FIXTURE
COMMIT_ALLOWED=false
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
A16_EXECUTION_ALLOWED=false
"@
    Write-File $Root ("docs/exec-plans/active/" + $Name) ($content -replace "`r?`n", "`r`n")
}

try {
    if ([string]::IsNullOrWhiteSpace($SnapshotHelperPath)) { $SnapshotHelperPath = Join-Path $PSScriptRoot 'New-AiNonWriterSnapshot.ps1' }
    if (-not (Test-Path -LiteralPath $SnapshotHelperPath -PathType Leaf)) { throw 'SNAPSHOT_HELPER_MISSING' }
    $helperAst = [System.Management.Automation.Language.Parser]::ParseFile($SnapshotHelperPath, [ref]$null, [ref]$null)
    $excludedFunction = @($helperAst.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Test-ExcludedPath' }, $true))[0]
    $normalizerFunction = @($helperAst.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'ConvertTo-NormalizedRepositoryRelativePath' }, $true))[0]
    if ($null -eq $excludedFunction -or $null -eq $normalizerFunction) { throw 'EXCLUSION_FUNCTION_MISSING' }
    . ([scriptblock]::Create($normalizerFunction.Extent.Text + [Environment]::NewLine + $excludedFunction.Extent.Text))
    $pathCases = @(
        @{ Path = 'SeCrEtS\\item'; Excluded = $true }, @{ Path = 'nested/TeMp/item'; Excluded = $true }, @{ Path = 'nested\\TMP\\item'; Excluded = $true },
        @{ Path = '.ENV.local'; Excluded = $true }, @{ Path = 'nested/.tmp-scratch/item'; Excluded = $true }, @{ Path = 'node_modules/pkg/item'; Excluded = $true },
        @{ Path = 'nested\\.NEXT\\item'; Excluded = $true }, @{ Path = 'artifacts/item'; Excluded = $true }, @{ Path = '.phase_backups/item'; Excluded = $true },
        @{ Path = 'src/secret/item'; Excluded = $false }, @{ Path = 'src/logs/item'; Excluded = $false }, @{ Path = '.\\src\\normal.txt'; Excluded = $false }, @{ Path = 'src/../secrets/item'; Excluded = $true }
    )
    foreach ($case in $pathCases) {
        if ((Test-ExcludedPath -RelativePath $case.Path) -ne $case.Excluded) { Add-Failure 'PATH_NORMALIZATION_OR_SEGMENT_MATCHING' }
    }

    $testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('ai-non-writer-snapshot-' + [guid]::NewGuid().ToString('N'))
    [System.IO.Directory]::CreateDirectory($testRoot) | Out-Null
    Push-Location $testRoot
    try {
        Invoke-Git @('init', '--quiet') | Out-Null
        Invoke-Git @('config', 'user.email', 'snapshot-harness@example.invalid') | Out-Null
        Invoke-Git @('config', 'user.name', 'Snapshot Harness') | Out-Null
        $trackedProtected = @('secrets/tracked.txt', 'tmp/tracked.txt', 'temp/tracked.txt', 'nested/SeCrEtS/tracked.txt', '.env.test')
        foreach ($path in $trackedProtected) { Write-File $testRoot $path 'protected-baseline' }
        Write-File $testRoot 'src/normal-source.txt' 'normal-baseline'
        Write-File $testRoot 'unrelated/tracked.txt' 'unrelated-baseline'
        Write-File $testRoot 'AGENTS.md' 'candidate-baseline'
        Write-ValidActiveContract $testRoot
        Invoke-Git @('add', '--all') | Out-Null
        Invoke-Git @('commit', '--quiet', '-m', 'baseline') | Out-Null

        [System.IO.Directory]::CreateDirectory((Join-Path $testRoot 'scripts/ai')) | Out-Null
        Copy-Item -LiteralPath $SnapshotHelperPath -Destination (Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1') -Force
        foreach ($path in @('secrets/untracked.txt', 'tmp/untracked.txt', 'temp/untracked.txt', 'nested/Temp/untracked.txt', '.env.local')) { Write-File $testRoot $path 'protected-untracked' }
        Write-File $testRoot 'AGENTS.md' 'candidate-dirty'
        Write-File $testRoot 'docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md' 'completed-gp1-untracked-overlay'
        Write-File $testRoot 'unrelated/tracked.txt' 'unrelated-dirty'
        Write-File $testRoot 'unrelated/untracked.txt' 'unrelated-untracked'
        $commonDirectory = (@(Invoke-Git @('rev-parse', '--path-format=absolute', '--git-common-dir')))[0].Trim()
        $indexHashBefore = (Get-FileHash -LiteralPath (Join-Path $commonDirectory 'index') -Algorithm SHA256).Hash
        $indexIdentityBefore = (Invoke-Git @('ls-files', '--stage')) -join "`n"
        $statusBefore = (Invoke-Git @('status', '--porcelain=v1')) -join "`n"
        $createResult = & $powershellExe -NoLogo -NoProfile -File (Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1') -Action Create | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or $createResult.Status -ne 'SNAPSHOT_CREATED') { throw "SNAPSHOT_CREATE_FAILED:$($createResult.Error)" }
        $snapshotPath = [string]$createResult.SnapshotPath
        $repositoryPath = [string]$createResult.RepositoryPath
        $manifestPath = Join-Path $snapshotPath '.ai-governance-snapshot.json'
        $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

        foreach ($path in ($trackedProtected + @('secrets/untracked.txt', 'tmp/untracked.txt', 'temp/untracked.txt', 'nested/Temp/untracked.txt', '.env.local'))) { Test-FileAbsent $repositoryPath $path 'PROTECTED_PATH_PRESENT' }
        Test-FileValue $repositoryPath 'src/normal-source.txt' 'normal-baseline' 'NORMAL_SOURCE_MISSING'
        Test-FileValue $repositoryPath 'AGENTS.md' 'candidate-dirty' 'TRACKED_DIRTY_CANDIDATE_NOT_OVERLAID'
        Test-FileValue $repositoryPath 'scripts/ai/New-AiNonWriterSnapshot.ps1' ([System.IO.File]::ReadAllText((Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1'))) 'UNTRACKED_CANDIDATE_NOT_OVERLAID'
        Test-FileValue $repositoryPath 'docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md' 'completed-gp1-untracked-overlay' 'COMPLETED_GP1_UNTRACKED_CANDIDATE_NOT_OVERLAID'
        Test-FileValue $repositoryPath 'docs/exec-plans/active/GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION.md' ([System.IO.File]::ReadAllText((Join-Path $testRoot 'docs/exec-plans/active/GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION.md'))) 'ACTIVE_CONTRACT_CANDIDATE_NOT_OVERLAID'
        Test-FileValue $repositoryPath 'unrelated/tracked.txt' 'unrelated-baseline' 'UNRELATED_TRACKED_DIRT_OVERLAID'
        Test-FileAbsent $repositoryPath 'unrelated/untracked.txt' 'UNRELATED_UNTRACKED_DIRT_PRESENT'
        $indexHashAfter = (Get-FileHash -LiteralPath (Join-Path $commonDirectory 'index') -Algorithm SHA256).Hash
        $statusAfter = (Invoke-Git @('status', '--porcelain=v1')) -join "`n"
        if ($indexHashBefore -ne $indexHashAfter -or $statusBefore -ne $statusAfter) { Add-Failure 'PRIMARY_WORKTREE_OR_INDEX_CHANGED' }
        if ($manifest.SchemaVersion -lt 2) { Add-Failure 'TEST_MANIFEST_SCHEMA_V2_OR_NEWER_VALID' }
        if ($manifest.SourceHeadBefore -ne $manifest.SourceHeadAfter -or $manifest.SourceHeadBefore -ne (@(Invoke-Git @('rev-parse', 'HEAD')))[0].Trim()) { Add-Failure 'TEST_SOURCE_HEAD_BEFORE_AFTER_MATCH' }
        if ($manifest.PrimaryStatusIdentityBefore -ne $manifest.PrimaryStatusIdentityAfter) { Add-Failure 'TEST_PRIMARY_STATUS_IDENTITY_BEFORE_AFTER_MATCH' }
        if ($manifest.PrimaryIndexIdentityBefore -ne $manifest.PrimaryIndexIdentityAfter) { Add-Failure 'TEST_PRIMARY_INDEX_IDENTITY_BEFORE_AFTER_MATCH' }
        if ($manifest.SnapshotBaselineHead -ne $manifest.SourceHeadBefore) { Add-Failure 'TEST_SNAPSHOT_BASELINE_HEAD_RECORDED' }
        $expectedCandidatePaths = @('AGENTS.md', 'docs/00_INDEX.md', 'docs/08_AI_WORK_LOG.md', 'docs/09_DECISION_LOG.md', 'docs/99_NEXT_AI_HANDOFF.md', 'docs/AI_WORKFLOW.md', 'docs/AI_EXECUTION_ROUTING.md', 'docs/exec-plans/README.md', 'docs/exec-plans/active/GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION.md', 'docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md', 'docs/exec-plans/completed/README.md', '.codex/config.toml', '.codex/agents/explorer.toml', '.codex/agents/coder.toml', '.codex/agents/reviewer.toml', '.codex/agents/verifier.toml', 'scripts/ai/Invoke-AiWriterLease.ps1', 'scripts/ai/New-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiGovernanceInvariant.ps1', 'scripts/ai/Test-AiWriterLeaseLifecycle.ps1' | ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_ } | Sort-Object -Unique)
        $expectedFixtureMaterializedPaths = @('AGENTS.md', 'docs/exec-plans/active/GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION.md', 'docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md', 'scripts/ai/New-AiNonWriterSnapshot.ps1' | ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_ } | Sort-Object -Unique)
        $expectedCandidatePathsIdentity = Get-TextIdentity (($expectedCandidatePaths -join ([char]0)) + [char]0)
        if ($expectedCandidatePaths.Count -ne 21) { Add-Failure 'EXPECTED_CANDIDATE_PATH_COUNT_NOT_21' }
        if ($manifest.CandidatePathsIdentity -ne $expectedCandidatePathsIdentity -or (@($manifest.CandidatePaths) -join "`n") -ne ($expectedCandidatePaths -join "`n")) { Add-Failure 'TEST_CANDIDATE_PATHS_IDENTITY_VALID' }
        if (@($manifest.CandidatePaths).Count -ne 21) { Add-Failure 'TEST_CANONICAL_CANDIDATE_PATH_COUNT_NOT_21' }
        if ($expectedFixtureMaterializedPaths.Count -ne 4 -or @($manifest.CandidateMaterializedPaths).Count -ne 4) { Add-Failure 'TEST_FIXTURE_MATERIALIZED_CANDIDATE_PATH_COUNT_NOT_4' }
        if ((@($manifest.CandidateMaterializedPaths) -join "`n") -ne ($expectedFixtureMaterializedPaths -join "`n")) { Add-Failure 'TEST_FIXTURE_MATERIALIZED_CANDIDATE_PATH_MEMBERSHIP_VALID' }
        $completedGp1Path = 'docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md'
        if ($completedGp1Path -notin @(Invoke-Git @('ls-files', '--others', '--exclude-standard'))) { Add-Failure 'COMPLETED_GP1_FIXTURE_NOT_UNTRACKED' }
        if ($completedGp1Path -notin @($manifest.CandidatePaths)) { Add-Failure 'COMPLETED_GP1_NOT_REQUESTED' }
        if ($completedGp1Path -notin @($manifest.CandidateMaterializedPaths)) { Add-Failure 'COMPLETED_GP1_NOT_MATERIALIZED' }
        foreach ($path in $expectedFixtureMaterializedPaths) {
            $sourceIdentity = Get-Sha256Hex ([System.IO.File]::ReadAllBytes((Join-Path $testRoot ($path -replace '/', [System.IO.Path]::DirectorySeparatorChar))))
            $snapshotIdentity = Get-Sha256Hex ([System.IO.File]::ReadAllBytes((Join-Path $repositoryPath ($path -replace '/', [System.IO.Path]::DirectorySeparatorChar))))
            if ($sourceIdentity -ne $snapshotIdentity) { Add-Failure 'FIXTURE_MATERIALIZED_CONTENT_IDENTITY_MISMATCH' }
        }
        $completedGp1SourceIdentity = Get-Sha256Hex ([System.IO.File]::ReadAllBytes((Join-Path $testRoot ($completedGp1Path -replace '/', [System.IO.Path]::DirectorySeparatorChar))))
        $completedGp1SnapshotIdentity = Get-Sha256Hex ([System.IO.File]::ReadAllBytes((Join-Path $repositoryPath ($completedGp1Path -replace '/', [System.IO.Path]::DirectorySeparatorChar))))
        if ($completedGp1SourceIdentity -ne $completedGp1SnapshotIdentity) { Add-Failure 'COMPLETED_GP1_CONTENT_IDENTITY_MISMATCH' }
        if ($manifest.CandidateOverlayContentIdentity -ne (Get-FileContentIdentity $repositoryPath @($manifest.CandidateMaterializedPaths))) { Add-Failure 'TEST_CANDIDATE_CONTENT_IDENTITY_VALID' }
        if ($manifest.SnapshotContentIdentity -ne (Get-SnapshotContentIdentity $repositoryPath)) { Add-Failure 'TEST_SNAPSHOT_CONTENT_IDENTITY_VALID' }
        if ($manifest.DiffCheckStatus -ne 'PASS' -or [string]::IsNullOrWhiteSpace($manifest.DiffCheckOutputIdentity) -or $manifest.EvidenceEnvelopeHash -ne (Get-EvidenceEnvelopeIdentity $manifest)) { Add-Failure 'TEST_DIFF_CHECK_EVIDENCE_PRESENT' }
        if ($manifest.DiffCheckStatus -ne 'PASS') { Add-Failure 'TEST_DIFF_CHECK_PASS_FOR_VALID_CANDIDATE' }
        if (Test-Path -LiteralPath (Join-Path $repositoryPath '.git')) { Add-Failure 'SNAPSHOT_GIT_METADATA_PRESENT' }
        Write-File $repositoryPath 'AGENTS.md' 'tampered-content'
        if ($manifest.SnapshotContentIdentity -eq (Get-SnapshotContentIdentity $repositoryPath)) { Add-Failure 'TEST_MANIFEST_TAMPER_DETECTED' }

        $activeContractPath = Join-Path $testRoot 'docs/exec-plans/active/GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION.md'
        Remove-Item -LiteralPath $activeContractPath -Force
        $zeroContractResult = & $powershellExe -NoLogo -NoProfile -File (Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1') -Action Create | ConvertFrom-Json
        if ($LASTEXITCODE -eq 0 -or $zeroContractResult.Status -ne 'FAIL_CLOSED' -or $zeroContractResult.Error -notmatch '^ACTIVE_CONTRACT_COUNT:0$') { Add-Failure 'TEST_ZERO_ACTIVE_CONTRACT_REJECTED' }
        Write-ValidActiveContract $testRoot
        Write-ValidActiveContract $testRoot 'GOV-GP5_DISPOSABLE_SECOND_CONTRACT.md'
        $twoContractResult = & $powershellExe -NoLogo -NoProfile -File (Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1') -Action Create | ConvertFrom-Json
        if ($LASTEXITCODE -eq 0 -or $twoContractResult.Status -ne 'FAIL_CLOSED' -or $twoContractResult.Error -notmatch '^ACTIVE_CONTRACT_COUNT:2$') { Add-Failure 'TEST_TWO_ACTIVE_CONTRACT_REJECTED' }
        Remove-Item -LiteralPath (Join-Path $testRoot 'docs/exec-plans/active/GOV-GP5_DISPOSABLE_SECOND_CONTRACT.md') -Force

        $snapshotRoot = Split-Path -Parent $snapshotPath
        $nonOwnedPath = Join-Path $snapshotRoot 'non-owned-harness-sentinel'
        [System.IO.Directory]::CreateDirectory($nonOwnedPath) | Out-Null
        [System.IO.File]::WriteAllText((Join-Path $nonOwnedPath 'sentinel'), 'owned-by-harness', [System.Text.UTF8Encoding]::new($false))
        $cleanupResult = & $powershellExe -NoLogo -NoProfile -File (Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1') -Action Cleanup -SnapshotPath $snapshotPath | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or $cleanupResult.Status -ne 'SNAPSHOT_CLEANED' -or (Test-Path -LiteralPath $snapshotPath)) { Add-Failure 'OWNED_SNAPSHOT_CLEANUP_FAILED' }
        if (-not (Test-Path -LiteralPath (Join-Path $nonOwnedPath 'sentinel'))) { Add-Failure 'CLEANUP_TOUCHED_NON_OWNED_PATH' }
        Remove-Item -LiteralPath $nonOwnedPath -Recurse -Force
        $snapshotPath = $null
        Write-File $testRoot 'AGENTS.md' "candidate with trailing whitespace  `n"
        $badWhitespaceResult = & $powershellExe -NoLogo -NoProfile -File (Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1') -Action Create | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or $badWhitespaceResult.Status -ne 'SNAPSHOT_CREATED' -or $badWhitespaceResult.DiffCheckStatus -ne 'FAIL') { Add-Failure 'TEST_DIFF_CHECK_FAILS_OR_REPORTS_FOR_BAD_WHITESPACE_FIXTURE' }
        if ($badWhitespaceResult.SnapshotPath) {
            $badCleanupResult = & $powershellExe -NoLogo -NoProfile -File (Join-Path $testRoot 'scripts/ai/New-AiNonWriterSnapshot.ps1') -Action Cleanup -SnapshotPath ([string]$badWhitespaceResult.SnapshotPath) | ConvertFrom-Json
            if ($LASTEXITCODE -ne 0 -or $badCleanupResult.Status -ne 'SNAPSHOT_CLEANED') { Add-Failure 'BAD_WHITESPACE_SNAPSHOT_CLEANUP_FAILED' }
        }
        $indexIdentityFinal = (Invoke-Git @('ls-files', '--stage')) -join "`n"
        $statusFinal = (Invoke-Git @('status', '--porcelain=v1')) -join "`n"
        if ($indexIdentityBefore -ne $indexIdentityFinal) { Add-Failure 'PRIMARY_INDEX_CHANGED_FINAL' }
        if ($statusBefore -ne $statusFinal) { Add-Failure 'PRIMARY_STATUS_CHANGED_FINAL' }
    } finally {
        Pop-Location
    }
    if ($failures.Count -gt 0) {
        @{ SnapshotHarness = 'FAIL'; FailureCount = $failures.Count; Failures = @($failures) } | ConvertTo-Json -Compress
        exit 1
    }
    @{ SnapshotHarness = 'PASS'; ExpectedCandidatePathCount = 21; CanonicalCandidatePathCount = 21; ManifestCandidatePathCount = 21; ExpectedMaterializedCandidatePathCount = 4; MaterializedCandidatePathCount = 4; MissingRequiredMaterializedPathCount = 0; ExtraMaterializedPathCount = 0; CompletedGp1FixtureUntracked = 'PASS'; CompletedGp1Requested = 'PASS'; CompletedGp1Materialized = 'PASS'; CompletedGp1ContentIdentity = 'PASS'; UnrelatedUntrackedExcluded = 'PASS'; ProtectedPathCaseCount = 10; PathNormalizationCaseCount = $pathCases.Count; CandidateFidelity = 'PASS'; PrimaryWorktreeAndIndex = 'PASS'; OwnedCleanup = 'PASS'; ManifestSchema = 'PASS'; GitMetadataEvidence = 'PASS'; DiffCheckEvidence = 'PASS'; TamperDetection = 'PASS'; SuccessorContractCompatibility = 'PASS'; ZeroActiveContractRejected = 'PASS'; TwoActiveContractsRejected = 'PASS' } | ConvertTo-Json -Compress
} catch {
    @{ SnapshotHarness = 'FAIL'; Failures = @("UNEXPECTED:$($_.Exception.Message)") } | ConvertTo-Json -Compress
    exit 1
} finally {
    if ($snapshotPath -and (Test-Path -LiteralPath $snapshotPath)) {
        & $powershellExe -NoLogo -NoProfile -File $SnapshotHelperPath -Action Cleanup -SnapshotPath $snapshotPath | Out-Null
    }
    if ($testRoot -and (Test-Path -LiteralPath $testRoot)) { Remove-Item -LiteralPath $testRoot -Recurse -Force }
}
