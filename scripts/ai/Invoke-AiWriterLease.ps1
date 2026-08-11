[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('Acquire', 'Verify', 'Complete', 'Release', 'Inspect')]
    [string]$Action,
    [string]$TaskId,
    [string]$WriterId,
    [string]$LeaseToken
)

$ErrorActionPreference = 'Stop'

function Write-Result {
    param([hashtable]$Result, [int]$ExitCode = 0)
    $Result | ConvertTo-Json -Compress
    exit $ExitCode
}

function Get-LeasePath {
    $commonDirectory = (& git rev-parse --path-format=absolute --git-common-dir).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commonDirectory)) {
        throw 'GIT_COMMON_DIRECTORY_NOT_RESOLVED'
    }
    $root = Join-Path $commonDirectory 'ai-governance\writer-lease'
    [System.IO.Directory]::CreateDirectory($root) | Out-Null
    return (Join-Path $root 'active-lease.json')
}

function Read-Lease {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    try {
        return (Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json)
    } catch {
        throw 'LEASE_FILE_UNREADABLE_FAIL_CLOSED'
    }
}

function Require-Identity {
    param($Lease)
    if ([string]::IsNullOrWhiteSpace($TaskId) -or [string]::IsNullOrWhiteSpace($WriterId) -or [string]::IsNullOrWhiteSpace($LeaseToken)) {
        throw 'TASK_WRITER_AND_LEASE_TOKEN_REQUIRED'
    }
    if ($Lease.TaskId -ne $TaskId -or $Lease.WriterId -ne $WriterId -or $Lease.LeaseToken -ne $LeaseToken) {
        throw 'LEASE_IDENTITY_MISMATCH'
    }
    if ($Lease.Machine -ne $env:COMPUTERNAME -or $Lease.User -ne [Environment]::UserName) {
        throw 'LEASE_HOST_IDENTITY_MISMATCH'
    }
}

try {
    $leasePath = Get-LeasePath
    switch ($Action) {
        'Acquire' {
            if ([string]::IsNullOrWhiteSpace($TaskId) -or [string]::IsNullOrWhiteSpace($WriterId)) {
                throw 'TASK_AND_WRITER_REQUIRED'
            }
            $token = [guid]::NewGuid().ToString('N')
            $lease = [ordered]@{
                SchemaVersion = 1
                State = 'RESERVED'
                TaskId = $TaskId
                WriterId = $WriterId
                LeaseToken = $token
                Machine = $env:COMPUTERNAME
                User = [Environment]::UserName
                AcquisitionProcessId = $PID
                AcquiredUtc = [DateTime]::UtcNow.ToString('o')
                VerifiedUtc = $null
                CompletedUtc = $null
            }
            $payload = ($lease | ConvertTo-Json -Compress)
            try {
                $stream = [System.IO.File]::Open($leasePath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
            } catch [System.IO.IOException] {
                Write-Result @{ Status = 'FAIL_CLOSED_ACTIVE_LEASE_PRESENT'; LeasePath = $leasePath } 1
            }
            try {
                $writer = [System.IO.StreamWriter]::new($stream, [System.Text.UTF8Encoding]::new($false))
                $writer.Write($payload)
                $writer.Flush()
            } finally {
                if ($writer) { $writer.Dispose() } elseif ($stream) { $stream.Dispose() }
            }
            Write-Result @{ Status = 'RESERVED'; LeaseState = 'RESERVED'; TaskId = $TaskId; WriterId = $WriterId; LeaseToken = $token }
        }
        'Inspect' {
            $lease = Read-Lease $leasePath
            if ($null -eq $lease) { Write-Result @{ Status = 'NO_ACTIVE_LEASE'; ActiveWriterLeaseCount = 0 } }
            Write-Result @{ Status = 'LEASE_PRESENT'; ActiveWriterLeaseCount = $(if ($lease.State -in @('RESERVED','ACTIVE')) { 1 } else { 0 }); LeaseState = $lease.State; TaskId = $lease.TaskId; WriterId = $lease.WriterId; AcquiredUtc = $lease.AcquiredUtc }
        }
        default {
            $lease = Read-Lease $leasePath
            if ($null -eq $lease) { throw 'NO_LEASE_PRESENT' }
            Require-Identity $lease
            switch ($Action) {
                'Verify' {
                    if ($lease.State -ne 'RESERVED') { throw 'VERIFY_REQUIRES_RESERVED_LEASE' }
                    $lease.State = 'ACTIVE'
                    $lease.VerifiedUtc = [DateTime]::UtcNow.ToString('o')
                    $lease | ConvertTo-Json -Compress | Set-Content -LiteralPath $leasePath -NoNewline -Encoding utf8
                    Write-Result @{ Status = 'VERIFIED'; LeaseState = 'ACTIVE'; TaskId = $TaskId; WriterId = $WriterId }
                }
                'Complete' {
                    if ($lease.State -ne 'ACTIVE') { throw 'COMPLETE_REQUIRES_ACTIVE_LEASE' }
                    $lease.State = 'COMPLETED'
                    $lease.CompletedUtc = [DateTime]::UtcNow.ToString('o')
                    $lease | ConvertTo-Json -Compress | Set-Content -LiteralPath $leasePath -NoNewline -Encoding utf8
                    Write-Result @{ Status = 'COMPLETED'; LeaseState = 'COMPLETED'; TaskId = $TaskId; WriterId = $WriterId }
                }
                'Release' {
                    if ($lease.State -ne 'COMPLETED') { throw 'RELEASE_REQUIRES_COMPLETED_LEASE' }
                    Remove-Item -LiteralPath $leasePath -Force
                    Write-Result @{ Status = 'RELEASED'; ActiveWriterLeaseCount = 0 }
                }
            }
        }
    }
} catch {
    Write-Result @{ Status = 'FAIL_CLOSED'; Error = $_.Exception.Message } 1
}
