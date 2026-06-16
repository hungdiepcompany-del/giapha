#Requires -Version 5.1
param(
  [ValidateSet("menu","check","pull","push","status","open","fixpush")]
  [string]$Action = "menu"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptDir "GIA_PHA_GITHUB.config.ps1")

function Title {
  param([string]$Text)
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Cyan
  Write-Host " $Text" -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}
function Ok { param([string]$Text) Write-Host "[OK] $Text" -ForegroundColor Green }
function Info { param([string]$Text) Write-Host "[INFO] $Text" -ForegroundColor Gray }
function Warn { param([string]$Text) Write-Host "[WARN] $Text" -ForegroundColor Yellow }
function Bad { param([string]$Text) Write-Host "[ERROR] $Text" -ForegroundColor Red }
function PauseIt { Write-Host ""; Read-Host "Press Enter to continue" }

function Find-Exe {
  param([string]$Name)

  $cmds = @(Get-Command "$Name.exe" -CommandType Application -ErrorAction SilentlyContinue)
  if ($cmds.Count -gt 0) {
    return [string]$cmds[0].Source
  }

  if ($Name -eq "git") {
    $known = @(
      "$env:ProgramFiles\Git\cmd\git.exe",
      "$env:ProgramFiles\Git\bin\git.exe"
    )
  } elseif ($Name -eq "gh") {
    $known = @(
      "$env:ProgramFiles\GitHub CLI\gh.exe",
      "${env:ProgramFiles(x86)}\GitHub CLI\gh.exe"
    )
  } else {
    $known = @()
  }

  foreach ($PathItem in $known) {
    if ($PathItem -and (Test-Path -LiteralPath $PathItem)) {
      return [string]$PathItem
    }
  }
  return $null
}

$GitExe = Find-Exe "git"
$GhExe = Find-Exe "gh"

function Invoke-Git {
  param([string[]]$GitArgs)

  $OutputLines = & $GitExe @GitArgs 2>&1
  $ExitCode = $LASTEXITCODE
  $OutputText = ""
  if ($null -ne $OutputLines) {
    $OutputText = ($OutputLines | ForEach-Object { "$_" }) -join "`n"
  }

  return [pscustomobject]@{
    Code = $ExitCode
    Lines = $OutputLines
    Text = $OutputText
  }
}

function Git-FirstLine {
  param([string[]]$GitArgs)

  $Result = Invoke-Git -GitArgs $GitArgs
  if ($Result.Code -ne 0 -or $null -eq $Result.Lines) {
    return $null
  }

  $Line = @($Result.Lines)[0]
  if ($null -eq $Line) {
    return $null
  }

  $Text = "$Line".Trim()
  if ([string]::IsNullOrWhiteSpace($Text)) {
    return $null
  }

  return [string]$Text
}

function Require-Tools {
  Title "CHECK TOOLS"

  if ([string]::IsNullOrWhiteSpace($GitExe)) {
    throw "git.exe not found. Install Git first."
  }

  if ([string]::IsNullOrWhiteSpace($GhExe)) {
    throw "gh.exe not found. Install GitHub CLI first."
  }

  Ok "git: $GitExe"
  Ok "gh : $GhExe"

  $GitVersion = Invoke-Git -GitArgs @("--version")
  Info $GitVersion.Text

  $GhVersionLines = & $GhExe --version 2>&1
  Info "$(@($GhVersionLines)[0])"
}

function Ensure-Login {
  Title "CHECK GITHUB LOGIN"

  & $GhExe auth status -h github.com *> $null
  if ($LASTEXITCODE -ne 0) {
    Warn "GitHub CLI not logged in. Browser login will open."
    & $GhExe auth login -h github.com -p https --web -s repo,workflow
    if ($LASTEXITCODE -ne 0) {
      throw "GitHub login failed."
    }
  }

  Ok "GitHub CLI logged in."

  $UserName = & $GhExe api user --jq ".login" 2>$null
  if ($LASTEXITCODE -eq 0) {
    Info "Current GitHub account: $UserName"
  }
}

function Ensure-Repo {
  Title "CHECK REPO"
  Info "Folder: $RepoFolder"
  Info "Repo  : $RepoUrl"
  Info "Branch: $BranchName"

  if (-not (Test-Path -LiteralPath $RepoFolder)) {
    New-Item -ItemType Directory -Path $RepoFolder -Force | Out-Null
    Warn "Folder created."
  }

  Push-Location -LiteralPath $RepoFolder
  try {
    $Inside = Invoke-Git -GitArgs @("rev-parse","--is-inside-work-tree")
    if ($Inside.Code -ne 0) {
      Warn "Not a git repo. Running git init."
      $Init = Invoke-Git -GitArgs @("init","-b",$BranchName)
      if ($Init.Code -ne 0) {
        $Init2 = Invoke-Git -GitArgs @("init")
        if ($Init2.Code -ne 0) {
          Bad $Init2.Text
          throw "git init failed."
        }
        $CheckoutInit = Invoke-Git -GitArgs @("checkout","-B",$BranchName)
        if ($CheckoutInit.Code -ne 0) {
          Bad $CheckoutInit.Text
          throw "checkout branch failed after init."
        }
      }
      Ok "git init OK."
    } else {
      Ok "local git repo OK."
    }

    $Origin = Git-FirstLine -GitArgs @("remote","get-url","origin")
    if ($null -eq $Origin) {
      Warn "origin missing. Adding origin."
      $AddOrigin = Invoke-Git -GitArgs @("remote","add","origin",$RepoUrl)
      if ($AddOrigin.Code -ne 0) {
        Bad $AddOrigin.Text
        throw "add origin failed."
      }
      Ok "origin added."
    } elseif ($Origin -ne $RepoUrl) {
      Warn "origin differs."
      Warn "Current: $Origin"
      Warn "Config : $RepoUrl"
      $Answer = Read-Host "Fix origin? (Y/N)"
      if ($Answer -match "^(Y|y)$") {
        $SetOrigin = Invoke-Git -GitArgs @("remote","set-url","origin",$RepoUrl)
        if ($SetOrigin.Code -ne 0) {
          Bad $SetOrigin.Text
          throw "set origin failed."
        }
        Ok "origin fixed."
      } else {
        throw "Stopped because origin differs."
      }
    } else {
      Ok "origin OK."
    }

    $CurrentBranch = Git-FirstLine -GitArgs @("branch","--show-current")
    if ($CurrentBranch -ne $BranchName) {
      Warn "Current branch is '$CurrentBranch', expected '$BranchName'."
      $Answer = Read-Host "Switch/create '$BranchName'? (Y/N)"
      if ($Answer -notmatch "^(Y|y)$") {
        throw "Stopped because branch differs."
      }

      $Checkout = Invoke-Git -GitArgs @("checkout",$BranchName)
      if ($Checkout.Code -ne 0) {
        $Checkout2 = Invoke-Git -GitArgs @("checkout","-B",$BranchName)
        if ($Checkout2.Code -ne 0) {
          Bad $Checkout2.Text
          throw "checkout branch failed."
        }
      }
    }
    Ok "branch OK."
  } finally {
    Pop-Location
  }
}

function Check-Operation {
  $GitDir = Git-FirstLine -GitArgs @("rev-parse","--git-dir")
  if ($null -eq $GitDir) {
    return
  }

  foreach ($Item in @("MERGE_HEAD","rebase-merge","rebase-apply","CHERRY_PICK_HEAD","REVERT_HEAD")) {
    if (Test-Path -LiteralPath (Join-Path $GitDir $Item)) {
      throw "Git operation is in progress: $Item. Resolve it in VS Code/Git first."
    }
  }
}

function Has-LocalCommit {
  return $null -ne (Git-FirstLine -GitArgs @("rev-parse","--verify","HEAD"))
}

function Fetch-Origin {
  Info "Fetching origin..."
  $Fetch = Invoke-Git -GitArgs @("fetch","origin","--prune")
  if ($Fetch.Code -ne 0) {
    Bad $Fetch.Text
    throw "fetch failed."
  }
}

function Has-RemoteBranch {
  $RemoteRef = "refs/remotes/origin/$BranchName"
  $Result = Invoke-Git -GitArgs @("show-ref","--verify","--quiet",$RemoteRef)
  return $Result.Code -eq 0
}

function Get-Relation {
  if (-not (Has-LocalCommit)) {
    if (Has-RemoteBranch) {
      return "no_local_commit"
    }
    return "empty"
  }

  if (-not (Has-RemoteBranch)) {
    return "no_remote"
  }

  $Local = Git-FirstLine -GitArgs @("rev-parse","HEAD")
  $Remote = Git-FirstLine -GitArgs @("rev-parse","refs/remotes/origin/$BranchName")
  if ($Local -eq $Remote) {
    return "same"
  }

  $RemoteAncestor = Invoke-Git -GitArgs @("merge-base","--is-ancestor","refs/remotes/origin/$BranchName","HEAD")
  if ($RemoteAncestor.Code -eq 0) {
    return "local_ahead"
  }

  $LocalAncestor = Invoke-Git -GitArgs @("merge-base","--is-ancestor","HEAD","refs/remotes/origin/$BranchName")
  if ($LocalAncestor.Code -eq 0) {
    return "local_behind"
  }

  $MergeBase = Invoke-Git -GitArgs @("merge-base","HEAD","refs/remotes/origin/$BranchName")
  if ($MergeBase.Code -ne 0) {
    return "unrelated"
  }

  return "diverged"
}

function Show-Status {
  Title "STATUS"
  Push-Location -LiteralPath $RepoFolder
  try {
    & $GitExe status --short
    Write-Host ""
    & $GitExe branch -vv
    Write-Host ""
    & $GitExe status
  } finally {
    Pop-Location
  }
}

function Commit-IfNeeded {
  $Dirty = Invoke-Git -GitArgs @("status","--porcelain")
  if ([string]::IsNullOrWhiteSpace($Dirty.Text)) {
    Ok "No local changes to commit."
    return $true
  }

  Warn "Local changes found:"
  & $GitExe status --short

  $Answer = Read-Host "Commit ALL local changes? (Y/N)"
  if ($Answer -notmatch "^(Y|y)$") {
    return $false
  }

  $Msg = Read-Host "Commit message"
  if ([string]::IsNullOrWhiteSpace($Msg)) {
    $Msg = $DefaultCommitMessage
  }

  $Add = Invoke-Git -GitArgs @("add","-A")
  if ($Add.Code -ne 0) {
    Bad $Add.Text
    throw "git add failed."
  }

  $Commit = Invoke-Git -GitArgs @("commit","-m",$Msg)
  if ($Commit.Code -ne 0) {
    Warn $Commit.Text
    $DirtyAfter = Invoke-Git -GitArgs @("status","--porcelain")
    if (-not [string]::IsNullOrWhiteSpace($DirtyAfter.Text)) {
      throw "commit failed."
    }
  } else {
    Ok "Committed."
  }

  return $true
}

function Merge-Remote {
  param([bool]$AllowUnrelated)

  if ($AllowUnrelated) {
    Warn "Local and GitHub have unrelated histories."
    Warn "Will merge remote safely with --allow-unrelated-histories."
    Warn "This is NOT force-push."
    $Answer = Read-Host "Continue merge? (Y/N)"
    if ($Answer -notmatch "^(Y|y)$") {
      return $false
    }
    $Merge = Invoke-Git -GitArgs @("merge","--no-edit","--allow-unrelated-histories","refs/remotes/origin/$BranchName")
  } else {
    $Merge = Invoke-Git -GitArgs @("merge","--no-edit","refs/remotes/origin/$BranchName")
  }

  if ($Merge.Code -ne 0) {
    Bad $Merge.Text
    Warn "Resolve conflicts in VS Code, then commit and run PUSH again."
    return $false
  }

  Ok "Merge completed."
  return $true
}

function Safe-Pull {
  Require-Tools
  Ensure-Login
  Ensure-Repo

  Title "SAFE PULL"
  Push-Location -LiteralPath $RepoFolder
  try {
    Check-Operation

    $Dirty = Invoke-Git -GitArgs @("status","--porcelain")
    if (-not [string]::IsNullOrWhiteSpace($Dirty.Text)) {
      Warn "Local uncommitted changes exist. Pull stopped."
      & $GitExe status --short
      return
    }

    Fetch-Origin
    $Relation = Get-Relation
    Info "Relation: $Relation"

    if ($Relation -eq "same") {
      Ok "Already up to date."
    } elseif ($Relation -eq "local_ahead") {
      Ok "Local is ahead. No pull needed."
    } elseif ($Relation -eq "local_behind") {
      $Pull = Invoke-Git -GitArgs @("pull","--ff-only","origin",$BranchName)
      if ($Pull.Code -ne 0) {
        Bad $Pull.Text
        throw "pull failed."
      }
      Ok "Pulled."
    } elseif ($Relation -eq "no_remote") {
      Warn "Remote branch missing. Nothing to pull."
    } elseif ($Relation -eq "empty") {
      Warn "Empty repo. Nothing to pull."
    } elseif ($Relation -eq "no_local_commit") {
      $CheckoutRemote = Invoke-Git -GitArgs @("checkout","-B",$BranchName,"refs/remotes/origin/$BranchName")
      if ($CheckoutRemote.Code -ne 0) {
        Bad $CheckoutRemote.Text
        throw "checkout remote failed."
      }
      Ok "Checked out remote branch."
    } elseif ($Relation -eq "unrelated") {
      Merge-Remote -AllowUnrelated $true | Out-Null
    } elseif ($Relation -eq "diverged") {
      Merge-Remote -AllowUnrelated $false | Out-Null
    } else {
      Warn "Unknown relation. Pull stopped."
    }

    Show-Status
  } finally {
    Pop-Location
  }
}

function Safe-Push {
  Require-Tools
  Ensure-Login
  Ensure-Repo

  Title "SAFE PUSH"
  Push-Location -LiteralPath $RepoFolder
  try {
    Check-Operation

    if (-not (Commit-IfNeeded)) {
      Warn "Push stopped because changes were not committed."
      return
    }

    Fetch-Origin
    $Relation = Get-Relation
    Info "Relation: $Relation"

    if ($Relation -eq "same") {
      Ok "No new commit to push."
      return
    }

    if ($Relation -eq "local_behind") {
      Warn "Remote is ahead. Pulling fast-forward first."
      $Pull = Invoke-Git -GitArgs @("pull","--ff-only","origin",$BranchName)
      if ($Pull.Code -ne 0) {
        Bad $Pull.Text
        throw "fast-forward pull failed."
      }
      $Relation = Get-Relation
    }

    if ($Relation -eq "unrelated") {
      if (-not (Merge-Remote -AllowUnrelated $true)) {
        return
      }
      $Relation = Get-Relation
    } elseif ($Relation -eq "diverged") {
      if (-not (Merge-Remote -AllowUnrelated $false)) {
        return
      }
      $Relation = Get-Relation
    }

    if ($Relation -notin @("local_ahead","no_remote")) {
      Warn "Not safe to push in state: $Relation"
      return
    }

    Info "Pushing to GitHub..."
    $Push = Invoke-Git -GitArgs @("push","-u","origin",$BranchName)
    if ($Push.Code -ne 0) {
      Bad $Push.Text
      return
    }

    Ok "Push completed."
    Show-Status
  } finally {
    Pop-Location
  }
}

function Full-Check {
  Require-Tools
  Ensure-Login
  Ensure-Repo

  Title "CHECK REMOTE"
  Push-Location -LiteralPath $RepoFolder
  try {
    $Remote = Invoke-Git -GitArgs @("ls-remote","origin")
    if ($Remote.Code -ne 0) {
      Bad $Remote.Text
      throw "remote access failed."
    }
    Ok "Remote access OK."
    Fetch-Origin
    Info "Relation: $(Get-Relation)"
    Show-Status
  } finally {
    Pop-Location
  }
}

function Open-Repo {
  Start-Process ($RepoUrl -replace "\.git$","")
}

function Menu {
  while ($true) {
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " GIA PHA - GITHUB SYNC V8 FIXED" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " Folder : $RepoFolder"
    Write-Host " Repo   : $RepoUrl"
    Write-Host " Branch : $BranchName"
    Write-Host ""
    Write-Host " [1] CHECK"
    Write-Host " [2] PULL"
    Write-Host " [3] PUSH"
    Write-Host " [4] STATUS"
    Write-Host " [5] OPEN REPO"
    Write-Host " [6] CONFIG"
    Write-Host " [0] EXIT"
    Write-Host ""
    $Choice = Read-Host "Choose"

    try {
      switch ($Choice) {
        "1" { Full-Check; PauseIt }
        "2" { Safe-Pull; PauseIt }
        "3" { Safe-Push; PauseIt }
        "4" { Require-Tools; Show-Status; PauseIt }
        "5" { Open-Repo; PauseIt }
        "6" { Start-Process notepad.exe (Join-Path $ScriptDir "GIA_PHA_GITHUB.config.ps1"); PauseIt }
        "0" { return }
        default { Warn "Invalid choice."; PauseIt }
      }
    } catch {
      Bad $_.Exception.Message
      PauseIt
    }
  }
}

switch ($Action) {
  "menu" { Menu }
  "check" { Full-Check }
  "pull" { Safe-Pull }
  "push" { Safe-Push }
  "status" { Require-Tools; Show-Status }
  "open" { Open-Repo }
  "fixpush" { Safe-Push }
}
