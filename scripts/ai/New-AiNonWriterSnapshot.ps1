[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('Create', 'Cleanup', 'Inspect')]
    [string]$Action,
    [string]$SnapshotPath
)

$ErrorActionPreference = 'Stop'
$candidatePaths = @(
    'AGENTS.md', 'docs/00_INDEX.md', 'docs/08_AI_WORK_LOG.md', 'docs/09_DECISION_LOG.md', 'docs/99_NEXT_AI_HANDOFF.md',
    'docs/AI_WORKFLOW.md', 'docs/AI_EXECUTION_ROUTING.md', 'docs/exec-plans/README.md',
    'docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md', 'docs/exec-plans/completed/README.md',
    '.codex/config.toml', '.codex/agents/explorer.toml', '.codex/agents/coder.toml', '.codex/agents/reviewer.toml', '.codex/agents/verifier.toml',
    'scripts/ai/Invoke-AiWriterLease.ps1', 'scripts/ai/New-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiGovernanceInvariant.ps1',
    'scripts/ai/Test-AiWriterLeaseLifecycle.ps1'
)

function Write-Result {
    param([hashtable]$Result, [int]$ExitCode = 0)
    $Result | ConvertTo-Json -Compress
    exit $ExitCode
}
function Get-RepositoryRoot { return ((& git rev-parse --show-toplevel).Trim()) }
function Get-SnapshotRoot {
    $commonDirectory = (& git rev-parse --path-format=absolute --git-common-dir).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commonDirectory)) { throw 'GIT_COMMON_DIRECTORY_NOT_RESOLVED' }
    return (Join-Path $commonDirectory 'ai-governance\snapshots')
}
function ConvertTo-NormalizedRepositoryRelativePath {
    param([Parameter(Mandatory)][string]$RelativePath)
    $segments = [System.Collections.Generic.List[string]]::new()
    foreach ($segment in ($RelativePath -replace '\\', '/' -split '/')) {
        if ([string]::IsNullOrWhiteSpace($segment) -or $segment -eq '.') { continue }
        if ($segment -eq '..') { return $null }
        $segments.Add($segment)
    }
    return ($segments -join '/')
}
function Test-ExcludedPath {
    param([string]$RelativePath)
    $normalizedPath = ConvertTo-NormalizedRepositoryRelativePath -RelativePath $RelativePath
    if ([string]::IsNullOrWhiteSpace($normalizedPath)) { return $true }
    foreach ($segment in ($normalizedPath -split '/')) {
        if ($segment -like '.env*' -or $segment -like '.tmp*') { return $true }
        if ($segment -in @('node_modules', '.next', '.git', 'artifacts', '.phase_backups', 'secrets', 'tmp', 'temp')) { return $true }
    }
    return $false
}
function Get-ValidatedActiveContractPaths {
    param([Parameter(Mandatory)][string]$Root)
    $activeDirectory = Join-Path $Root 'docs/exec-plans/active'
    if (-not (Test-Path -LiteralPath $activeDirectory -PathType Container)) { throw 'ACTIVE_CONTRACT_DIRECTORY_MISSING' }
    $contracts = @(Get-ChildItem -LiteralPath $activeDirectory -File -Filter '*.md' -ErrorAction Stop | Sort-Object Name)
    if ($contracts.Count -ne 1) { throw "ACTIVE_CONTRACT_COUNT:$($contracts.Count)" }
    $contract = $contracts[0]
    if ($contract.Name -notmatch '^GOV-[A-Z0-9]+(?:-[A-Z0-9]+)*_[A-Z0-9][A-Z0-9_]*\.md$') { throw 'ACTIVE_CONTRACT_FILENAME_INVALID' }
    $content = Get-Content -LiteralPath $contract.FullName -Raw
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
        if ($content -notmatch $requiredPatterns[$name]) { throw "ACTIVE_CONTRACT_STRUCTURE_INVALID:$name" }
    }
    return @('docs/exec-plans/active/' + $contract.Name)
}
function Get-CanonicalCandidatePaths {
    param([Parameter(Mandatory)][string]$Root)
    $expectedStaticPaths = @(
        'AGENTS.md', 'docs/00_INDEX.md', 'docs/08_AI_WORK_LOG.md', 'docs/09_DECISION_LOG.md', 'docs/99_NEXT_AI_HANDOFF.md',
        'docs/AI_WORKFLOW.md', 'docs/AI_EXECUTION_ROUTING.md', 'docs/exec-plans/README.md',
        'docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md', 'docs/exec-plans/completed/README.md',
        '.codex/config.toml', '.codex/agents/explorer.toml', '.codex/agents/coder.toml', '.codex/agents/reviewer.toml', '.codex/agents/verifier.toml',
        'scripts/ai/Invoke-AiWriterLease.ps1', 'scripts/ai/New-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiNonWriterSnapshot.ps1', 'scripts/ai/Test-AiGovernanceInvariant.ps1',
        'scripts/ai/Test-AiWriterLeaseLifecycle.ps1'
    )
    $normalizedExpectedStaticPaths = @($expectedStaticPaths | ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_ } | Sort-Object -Unique)
    $normalizedStaticPaths = @($candidatePaths | ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_ } | Sort-Object -Unique)
    $duplicateCandidatePathCount = $candidatePaths.Count - $normalizedStaticPaths.Count
    $missingExpectedPaths = @($normalizedExpectedStaticPaths | Where-Object { $_ -notin $normalizedStaticPaths })
    $extraPaths = @($normalizedStaticPaths | Where-Object { $_ -notin $normalizedExpectedStaticPaths })
    if ($normalizedExpectedStaticPaths.Count -ne 20) { throw 'EXPECTED_STATIC_CANDIDATE_PATH_COUNT_INVALID' }
    if ($duplicateCandidatePathCount -ne 0) { throw "DUPLICATE_CANDIDATE_PATH_COUNT:$duplicateCandidatePathCount" }
    if ($missingExpectedPaths.Count -ne 0) { throw "MISSING_EXPECTED_CANDIDATE_PATH_COUNT:$($missingExpectedPaths.Count)" }
    if ($extraPaths.Count -ne 0) { throw "EXTRA_CANDIDATE_PATH_COUNT:$($extraPaths.Count)" }
    if ('docs/exec-plans/completed/GOV-GP1_GIA_PHA_AI_GOVERNANCE_BOOTSTRAP.md' -notin $normalizedStaticPaths) { throw 'COMPLETED_GP1_NOT_IN_CANONICAL_LIST' }
    $activeContractPaths = Get-ValidatedActiveContractPaths -Root $Root
    $canonicalPaths = @($normalizedStaticPaths + $activeContractPaths | ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_ } | Sort-Object -Unique)
    if ($canonicalPaths.Count -ne 21) { throw "CANONICAL_CANDIDATE_PATH_COUNT:$($canonicalPaths.Count)" }
    return $canonicalPaths
}
function Get-Sha256Hex {
    param([Parameter(Mandatory)][byte[]]$Bytes)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { return (($sha.ComputeHash($Bytes) | ForEach-Object { $_.ToString('x2') }) -join '') }
    finally { $sha.Dispose() }
}
function Get-TextIdentity {
    param([Parameter(Mandatory)][string]$Text)
    return Get-Sha256Hex -Bytes ([System.Text.Encoding]::UTF8.GetBytes($Text))
}
function Get-GitRawIdentity {
    param([Parameter(Mandatory)][string]$Arguments, [Parameter(Mandatory)][string]$WorkingDirectory)
    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = 'git'
    $startInfo.Arguments = $Arguments
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    [void]$process.Start()
    $outputStream = [System.IO.MemoryStream]::new()
    $process.StandardOutput.BaseStream.CopyTo($outputStream)
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) { throw "GIT_EVIDENCE_COMMAND_FAILED:${Arguments}:$stderr" }
    return Get-Sha256Hex -Bytes $outputStream.ToArray()
}
function Get-FileContentIdentity {
    param([Parameter(Mandatory)][string]$Root, [Parameter(Mandatory)][string[]]$RelativePaths)
    $entries = [System.Collections.Generic.List[string]]::new()
    foreach ($relativePath in @($RelativePaths | ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_ } | Where-Object { $_ } | Sort-Object -Unique)) {
        $path = Join-Path $Root ($relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        if (Test-Path -LiteralPath $path -PathType Leaf) {
            $entries.Add(($relativePath + [char]0 + (Get-Sha256Hex -Bytes ([System.IO.File]::ReadAllBytes($path))) + [char]0))
        }
    }
    return Get-TextIdentity -Text ($entries -join '')
}
function Get-SnapshotContentIdentity {
    param([Parameter(Mandatory)][string]$ContentRoot)
    $paths = @(
        Get-ChildItem -LiteralPath $ContentRoot -File -Recurse -Force |
        ForEach-Object { ConvertTo-NormalizedRepositoryRelativePath $_.FullName.Substring($ContentRoot.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar) } |
        Where-Object { $_ -and $_ -ne '.ai-governance-snapshot.json' } |
        Sort-Object -Unique
    )
    return Get-FileContentIdentity -Root $ContentRoot -RelativePaths $paths
}
function Get-EvidenceEnvelopeIdentity {
    param([Parameter(Mandatory)][hashtable]$Evidence)
    $orderedNames = @(
        'SourceHeadBefore', 'SourceHeadAfter', 'PrimaryStatusIdentityBefore', 'PrimaryStatusIdentityAfter',
        'PrimaryIndexIdentityBefore', 'PrimaryIndexIdentityAfter', 'SnapshotBaselineHead', 'CandidatePathsIdentity',
        'CandidateOverlayContentIdentity', 'SnapshotContentIdentity', 'DiffCheckStatus', 'DiffCheckExitCode', 'DiffCheckOutputIdentity'
    )
    $lines = foreach ($name in $orderedNames) { "$name=$($Evidence[$name])" }
    return Get-TextIdentity -Text (($lines -join "`n") + "`n")
}
function Invoke-DiffCheck {
    param([Parameter(Mandatory)][string]$BaselineRoot, [Parameter(Mandatory)][string]$ContentRoot)
    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = 'git'
    $startInfo.Arguments = ('diff --no-index --check -- "' + $BaselineRoot + '" "' + $ContentRoot + '"')
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    [void]$process.Start()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    $evidenceText = "STDOUT:`n$stdout`nSTDERR:`n$stderr"
    $hasWhitespaceDiagnostic = $evidenceText -match '(?im)(trailing whitespace|space before tab|blank line at end of file)'
    return [ordered]@{
        Status = if ($hasWhitespaceDiagnostic) { 'FAIL' } else { 'PASS' }
        ExitCode = $process.ExitCode
        OutputIdentity = Get-TextIdentity -Text $evidenceText
    }
}
function Test-OwnedSnapshot {
    param([string]$Path, [string]$Root)
    $resolvedPath = [System.IO.Path]::GetFullPath($Path)
    $resolvedRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $resolvedPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'SNAPSHOT_PATH_OUTSIDE_OWNED_ROOT' }
    $manifest = Join-Path $resolvedPath '.ai-governance-snapshot.json'
    if (-not (Test-Path -LiteralPath $manifest)) {
        $leaf = Split-Path -Leaf $resolvedPath
        $allowedPartialEntries = @('repository', 'baseline.index', 'baseline')
        $entries = @(Get-ChildItem -LiteralPath $resolvedPath -Force -ErrorAction Stop)
        $partialLayoutOwned = $leaf -match '^[0-9a-f]{32}$' -and (Test-Path -LiteralPath (Join-Path $resolvedPath 'repository') -PathType Container) -and @($entries | Where-Object { $_.Name -notin $allowedPartialEntries }).Count -eq 0
        if (-not $partialLayoutOwned) { throw 'SNAPSHOT_OWNERSHIP_MARKER_MISSING' }
    }
    return $resolvedPath
}

$createdSnapshotTarget = $null
try {
    $repositoryRoot = Get-RepositoryRoot
    $snapshotRoot = Get-SnapshotRoot
    [System.IO.Directory]::CreateDirectory($snapshotRoot) | Out-Null
    switch ($Action) {
        'Create' {
            $normalizedCandidates = Get-CanonicalCandidatePaths -Root $repositoryRoot
            $sourceHeadBefore = (& git rev-parse HEAD).Trim()
            $statusBefore = Get-GitRawIdentity -Arguments 'status --porcelain=v2 -z --untracked-files=all' -WorkingDirectory $repositoryRoot
            $indexBefore = Get-GitRawIdentity -Arguments 'ls-files --stage -z' -WorkingDirectory $repositoryRoot
            $snapshotId = [guid]::NewGuid().ToString('N')
            $target = Join-Path $snapshotRoot $snapshotId
            $createdSnapshotTarget = $target
            $contentRoot = Join-Path $target 'repository'
            $baselineRoot = Join-Path $target 'baseline'
            [System.IO.Directory]::CreateDirectory($contentRoot) | Out-Null
            [System.IO.Directory]::CreateDirectory($baselineRoot) | Out-Null
            $temporaryIndex = Join-Path $target 'baseline.index'
            $baselinePaths = @(& git ls-tree -r --name-only HEAD | ForEach-Object { ($_ -replace "`r", '').TrimEnd("`n") } | Where-Object { -not (Test-ExcludedPath $_) })
            $priorIndex = $env:GIT_INDEX_FILE
            try {
                $env:GIT_INDEX_FILE = $temporaryIndex
                & git read-tree HEAD
                if ($LASTEXITCODE -ne 0) { throw 'BASELINE_INDEX_BUILD_FAILED' }
                foreach ($checkoutRoot in @($contentRoot, $baselineRoot)) {
                    $prefixArgument = '--prefix="' + ($checkoutRoot.Replace('\', '/') + '/') + '"'
                    $processStartInfo = [System.Diagnostics.ProcessStartInfo]::new()
                    $processStartInfo.FileName = 'git'
                    $processStartInfo.Arguments = "checkout-index --stdin -z $prefixArgument"
                    $processStartInfo.UseShellExecute = $false
                    $processStartInfo.RedirectStandardInput = $true
                    $processStartInfo.RedirectStandardError = $true
                    $process = [System.Diagnostics.Process]::new()
                    $process.StartInfo = $processStartInfo
                    [void]$process.Start()
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes(($baselinePaths -join [char]0) + [char]0)
                    $process.StandardInput.BaseStream.Write($bytes, 0, $bytes.Length)
                    $process.StandardInput.Close()
                    $stderr = $process.StandardError.ReadToEnd()
                    $process.WaitForExit()
                    if ($process.ExitCode -ne 0) { throw "BASELINE_CHECKOUT_FAILED:$stderr" }
                }
            } finally {
                $env:GIT_INDEX_FILE = $priorIndex
                if (Test-Path -LiteralPath $temporaryIndex) { Remove-Item -LiteralPath $temporaryIndex -Force }
            }
            foreach ($relativePath in $normalizedCandidates) {
                if (Test-ExcludedPath $relativePath) { throw 'CANDIDATE_PATH_EXCLUSION_VIOLATION' }
                $source = Join-Path $repositoryRoot ($relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
                if (Test-Path -LiteralPath $source -PathType Leaf) {
                    $destination = Join-Path $contentRoot ($relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
                    [System.IO.Directory]::CreateDirectory((Split-Path -Parent $destination)) | Out-Null
                    Copy-Item -LiteralPath $source -Destination $destination -Force
                }
            }
            $materializedCandidates = @($normalizedCandidates | Where-Object { Test-Path -LiteralPath (Join-Path $contentRoot ($_ -replace '/', [System.IO.Path]::DirectorySeparatorChar)) -PathType Leaf })
            if (Test-Path -LiteralPath (Join-Path $contentRoot '.git')) { throw 'SNAPSHOT_METADATA_FORBIDDEN' }
            $diffCheck = Invoke-DiffCheck -BaselineRoot $baselineRoot -ContentRoot $contentRoot
            Remove-Item -LiteralPath $baselineRoot -Recurse -Force
            $sourceHeadAfter = (& git rev-parse HEAD).Trim()
            $statusAfter = Get-GitRawIdentity -Arguments 'status --porcelain=v2 -z --untracked-files=all' -WorkingDirectory $repositoryRoot
            $indexAfter = Get-GitRawIdentity -Arguments 'ls-files --stage -z' -WorkingDirectory $repositoryRoot
            if ($sourceHeadBefore -ne $sourceHeadAfter) { throw 'PRIMARY_HEAD_CHANGED_DURING_SNAPSHOT' }
            if ($statusBefore -ne $statusAfter) { throw 'PRIMARY_STATUS_CHANGED_DURING_SNAPSHOT' }
            if ($indexBefore -ne $indexAfter) { throw 'PRIMARY_INDEX_CHANGED_DURING_SNAPSHOT' }
            $evidence = [ordered]@{
                SourceHeadBefore = $sourceHeadBefore; SourceHeadAfter = $sourceHeadAfter; PrimaryStatusIdentityBefore = $statusBefore; PrimaryStatusIdentityAfter = $statusAfter
                PrimaryIndexIdentityBefore = $indexBefore; PrimaryIndexIdentityAfter = $indexAfter; SnapshotBaselineHead = $sourceHeadBefore
                CandidatePathsIdentity = Get-TextIdentity -Text (($normalizedCandidates -join ([char]0)) + [char]0)
                CandidateOverlayContentIdentity = Get-FileContentIdentity -Root $contentRoot -RelativePaths $materializedCandidates
                SnapshotContentIdentity = Get-SnapshotContentIdentity -ContentRoot $contentRoot
                DiffCheckStatus = $diffCheck.Status; DiffCheckExitCode = $diffCheck.ExitCode; DiffCheckOutputIdentity = $diffCheck.OutputIdentity
            }
            $manifest = [ordered]@{
                SchemaVersion = 2; SnapshotId = $snapshotId; CreatedUtc = [DateTime]::UtcNow.ToString('o'); CandidatePaths = $normalizedCandidates; CandidateMaterializedPaths = $materializedCandidates
                SourceHeadBefore = $evidence.SourceHeadBefore; SourceHeadAfter = $evidence.SourceHeadAfter; PrimaryStatusIdentityBefore = $evidence.PrimaryStatusIdentityBefore; PrimaryStatusIdentityAfter = $evidence.PrimaryStatusIdentityAfter
                PrimaryIndexIdentityBefore = $evidence.PrimaryIndexIdentityBefore; PrimaryIndexIdentityAfter = $evidence.PrimaryIndexIdentityAfter; SnapshotBaselineHead = $evidence.SnapshotBaselineHead
                CandidatePathsIdentity = $evidence.CandidatePathsIdentity; CandidateOverlayContentIdentity = $evidence.CandidateOverlayContentIdentity; SnapshotContentIdentity = $evidence.SnapshotContentIdentity
                DiffCheckStatus = $evidence.DiffCheckStatus; DiffCheckExitCode = $evidence.DiffCheckExitCode; DiffCheckOutputIdentity = $evidence.DiffCheckOutputIdentity
                EvidenceEnvelopeHash = Get-EvidenceEnvelopeIdentity -Evidence $evidence
            }
            $manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $target '.ai-governance-snapshot.json') -Encoding utf8
            Write-Result @{ Status = 'SNAPSHOT_CREATED'; SnapshotPath = $target; RepositoryPath = $contentRoot; ActiveIsolationCount = 1; ManifestSchemaVersion = 2; DiffCheckStatus = $diffCheck.Status }
        }
        'Inspect' {
            $entries = @(Get-ChildItem -LiteralPath $snapshotRoot -Directory -ErrorAction SilentlyContinue | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName '.ai-governance-snapshot.json') })
            Write-Result @{ Status = 'SNAPSHOT_INSPECTED'; ActiveIsolationCount = $entries.Count; SnapshotPaths = @($entries.FullName) }
        }
        'Cleanup' {
            if ([string]::IsNullOrWhiteSpace($SnapshotPath)) { throw 'SNAPSHOT_PATH_REQUIRED' }
            $ownedPath = Test-OwnedSnapshot $SnapshotPath $snapshotRoot
            Remove-Item -LiteralPath $ownedPath -Recurse -Force
            Write-Result @{ Status = 'SNAPSHOT_CLEANED'; SnapshotPath = $ownedPath; ActiveIsolationCount = 0 }
        }
    }
} catch {
    if ($Action -eq 'Create' -and $createdSnapshotTarget -and (Test-Path -LiteralPath $createdSnapshotTarget)) {
        $ownedPath = Test-OwnedSnapshot $createdSnapshotTarget $snapshotRoot
        Remove-Item -LiteralPath $ownedPath -Recurse -Force
    }
    Write-Result @{ Status = 'FAIL_CLOSED'; Error = $_.Exception.Message } 1
}
