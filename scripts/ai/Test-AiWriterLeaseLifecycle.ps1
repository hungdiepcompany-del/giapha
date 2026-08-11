[CmdletBinding()]
param(
    [string]$LeaseScriptPath = ''
)

$ErrorActionPreference = 'Stop'
$harnessRoot = $null

function Assert-Condition {
    param([bool]$Condition, [string]$Name)
    if (-not $Condition) { throw "ASSERTION_FAILED:$Name" }
}

function Invoke-LeaseProcess {
    param(
        [string]$Action,
        [string]$TaskId = '',
        [string]$WriterId = '',
        [string]$LeaseToken = ''
    )
    $arguments = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $LeaseScriptPath, '-Action', $Action)
    if ($TaskId) { $arguments += @('-TaskId', $TaskId) }
    if ($WriterId) { $arguments += @('-WriterId', $WriterId) }
    if ($LeaseToken) { $arguments += @('-LeaseToken', $LeaseToken) }
    $raw = & $script:powerShellExecutable @arguments 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    try { $result = $raw.Trim() | ConvertFrom-Json } catch { throw "LEASE_RESULT_UNREADABLE:${Action}:$raw" }
    return [pscustomobject]@{ ExitCode = $exitCode; Result = $result }
}

function Assert-LeaseResult {
    param($Invocation, [int]$ExpectedExitCode, [string]$ExpectedStatus, [string]$Name)
    Assert-Condition ($Invocation.ExitCode -eq $ExpectedExitCode) "$Name`:EXIT_CODE"
    Assert-Condition ($Invocation.Result.Status -eq $ExpectedStatus) "$Name`:STATUS"
}

try {
    if ([string]::IsNullOrWhiteSpace($LeaseScriptPath)) { $LeaseScriptPath = Join-Path $PSScriptRoot 'Invoke-AiWriterLease.ps1' }
    $LeaseScriptPath = (Resolve-Path -LiteralPath $LeaseScriptPath).Path
    $powerShellExecutable = Join-Path $PSHOME 'powershell.exe'
    if (-not (Test-Path -LiteralPath $powerShellExecutable)) { throw 'POWERSHELL_EXECUTABLE_NOT_FOUND' }
    $harnessRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("ai-writer-lease-harness-" + [guid]::NewGuid().ToString('N'))
    [System.IO.Directory]::CreateDirectory($harnessRoot) | Out-Null
    & git init --quiet $harnessRoot
    if ($LASTEXITCODE -ne 0) { throw 'HARNESS_GIT_INIT_FAILED' }

    Push-Location -LiteralPath $harnessRoot
    try {
        $reservedAcquire = Invoke-LeaseProcess -Action Acquire -TaskId 'reserved-release' -WriterId 'harness-writer'
        Assert-LeaseResult $reservedAcquire 0 'RESERVED' 'RESERVED_ACQUIRE'
        $reservedRelease = Invoke-LeaseProcess -Action Release -TaskId 'reserved-release' -WriterId 'harness-writer' -LeaseToken $reservedAcquire.Result.LeaseToken
        Assert-LeaseResult $reservedRelease 1 'FAIL_CLOSED' 'RESERVED_RELEASE_REJECTED'
        Assert-Condition ($reservedRelease.Result.Error -eq 'RELEASE_REQUIRES_COMPLETED_LEASE') 'RESERVED_RELEASE_ERROR'
        $reservedInspect = Invoke-LeaseProcess -Action Inspect
        Assert-LeaseResult $reservedInspect 0 'LEASE_PRESENT' 'RESERVED_RELEASE_PRESERVED'
        Assert-Condition ($reservedInspect.Result.LeaseState -eq 'RESERVED' -and $reservedInspect.Result.TaskId -eq 'reserved-release' -and $reservedInspect.Result.WriterId -eq 'harness-writer' -and $reservedInspect.Result.ActiveWriterLeaseCount -eq 1) 'RESERVED_RELEASE_STATE_PRESERVED'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Verify -TaskId 'reserved-release' -WriterId 'harness-writer' -LeaseToken $reservedAcquire.Result.LeaseToken) 0 'VERIFIED' 'RESERVED_CLEANUP_VERIFY'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Complete -TaskId 'reserved-release' -WriterId 'harness-writer' -LeaseToken $reservedAcquire.Result.LeaseToken) 0 'COMPLETED' 'RESERVED_CLEANUP_COMPLETE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Release -TaskId 'reserved-release' -WriterId 'harness-writer' -LeaseToken $reservedAcquire.Result.LeaseToken) 0 'RELEASED' 'RESERVED_CLEANUP_RELEASE'

        $activeAcquire = Invoke-LeaseProcess -Action Acquire -TaskId 'active-release' -WriterId 'harness-writer'
        Assert-LeaseResult $activeAcquire 0 'RESERVED' 'ACTIVE_ACQUIRE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Verify -TaskId 'active-release' -WriterId 'harness-writer' -LeaseToken $activeAcquire.Result.LeaseToken) 0 'VERIFIED' 'ACTIVE_VERIFY'
        $activeRelease = Invoke-LeaseProcess -Action Release -TaskId 'active-release' -WriterId 'harness-writer' -LeaseToken $activeAcquire.Result.LeaseToken
        Assert-LeaseResult $activeRelease 1 'FAIL_CLOSED' 'ACTIVE_RELEASE_REJECTED'
        Assert-Condition ($activeRelease.Result.Error -eq 'RELEASE_REQUIRES_COMPLETED_LEASE') 'ACTIVE_RELEASE_ERROR'
        $activeInspect = Invoke-LeaseProcess -Action Inspect
        Assert-LeaseResult $activeInspect 0 'LEASE_PRESENT' 'ACTIVE_RELEASE_PRESERVED'
        Assert-Condition ($activeInspect.Result.LeaseState -eq 'ACTIVE' -and $activeInspect.Result.TaskId -eq 'active-release' -and $activeInspect.Result.WriterId -eq 'harness-writer' -and $activeInspect.Result.ActiveWriterLeaseCount -eq 1) 'ACTIVE_RELEASE_STATE_PRESERVED'
        $secondAcquire = Invoke-LeaseProcess -Action Acquire -TaskId 'second-after-active-rejection' -WriterId 'second-writer'
        Assert-LeaseResult $secondAcquire 1 'FAIL_CLOSED_ACTIVE_LEASE_PRESENT' 'SECOND_ACQUIRE_REJECTED'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Complete -TaskId 'active-release' -WriterId 'harness-writer' -LeaseToken $activeAcquire.Result.LeaseToken) 0 'COMPLETED' 'ACTIVE_CLEANUP_COMPLETE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Release -TaskId 'active-release' -WriterId 'harness-writer' -LeaseToken $activeAcquire.Result.LeaseToken) 0 'RELEASED' 'ACTIVE_CLEANUP_RELEASE'

        $normalAcquire = Invoke-LeaseProcess -Action Acquire -TaskId 'normal-lifecycle' -WriterId 'harness-writer'
        Assert-LeaseResult $normalAcquire 0 'RESERVED' 'NORMAL_ACQUIRE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Verify -TaskId 'normal-lifecycle' -WriterId 'harness-writer' -LeaseToken $normalAcquire.Result.LeaseToken) 0 'VERIFIED' 'NORMAL_VERIFY'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Complete -TaskId 'normal-lifecycle' -WriterId 'harness-writer' -LeaseToken $normalAcquire.Result.LeaseToken) 0 'COMPLETED' 'NORMAL_COMPLETE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Release -TaskId 'normal-lifecycle' -WriterId 'harness-writer' -LeaseToken $normalAcquire.Result.LeaseToken) 0 'RELEASED' 'NORMAL_RELEASE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Inspect) 0 'NO_ACTIVE_LEASE' 'NORMAL_NO_ACTIVE_LEASE'

        $identityAcquire = Invoke-LeaseProcess -Action Acquire -TaskId 'wrong-identity' -WriterId 'harness-writer'
        Assert-LeaseResult $identityAcquire 0 'RESERVED' 'IDENTITY_ACQUIRE'
        $wrongIdentity = Invoke-LeaseProcess -Action Verify -TaskId 'wrong-identity' -WriterId 'wrong-writer' -LeaseToken $identityAcquire.Result.LeaseToken
        Assert-LeaseResult $wrongIdentity 1 'FAIL_CLOSED' 'WRONG_IDENTITY_REJECTED'
        Assert-Condition ($wrongIdentity.Result.Error -eq 'LEASE_IDENTITY_MISMATCH') 'WRONG_IDENTITY_ERROR'
        $identityInspect = Invoke-LeaseProcess -Action Inspect
        Assert-LeaseResult $identityInspect 0 'LEASE_PRESENT' 'WRONG_IDENTITY_PRESERVED'
        Assert-Condition ($identityInspect.Result.LeaseState -eq 'RESERVED' -and $identityInspect.Result.TaskId -eq 'wrong-identity' -and $identityInspect.Result.WriterId -eq 'harness-writer' -and $identityInspect.Result.ActiveWriterLeaseCount -eq 1) 'WRONG_IDENTITY_STATE_PRESERVED'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Verify -TaskId 'wrong-identity' -WriterId 'harness-writer' -LeaseToken $identityAcquire.Result.LeaseToken) 0 'VERIFIED' 'IDENTITY_CLEANUP_VERIFY'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Complete -TaskId 'wrong-identity' -WriterId 'harness-writer' -LeaseToken $identityAcquire.Result.LeaseToken) 0 'COMPLETED' 'IDENTITY_CLEANUP_COMPLETE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Release -TaskId 'wrong-identity' -WriterId 'harness-writer' -LeaseToken $identityAcquire.Result.LeaseToken) 0 'RELEASED' 'IDENTITY_CLEANUP_RELEASE'
        Assert-LeaseResult (Invoke-LeaseProcess -Action Inspect) 0 'NO_ACTIVE_LEASE' 'FINAL_NO_ACTIVE_LEASE'
    } finally {
        Pop-Location
    }

    @{ WriterLeaseLifecycle = 'PASS'; HarnessRepository = $harnessRoot; Checks = @('RESERVED_RELEASE_REJECTED', 'ACTIVE_RELEASE_REJECTED', 'SECOND_ACQUIRE_REJECTED', 'NORMAL_LIFECYCLE', 'WRONG_IDENTITY_REJECTED') } | ConvertTo-Json -Compress
} catch {
    @{ WriterLeaseLifecycle = 'FAIL'; Error = $_.Exception.Message } | ConvertTo-Json -Compress
    exit 1
} finally {
    if ($harnessRoot -and (Test-Path -LiteralPath $harnessRoot)) { Remove-Item -LiteralPath $harnessRoot -Recurse -Force }
}
