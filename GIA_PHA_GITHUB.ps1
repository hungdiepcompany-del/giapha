#Requires -Version 5.1
# Version: 2.0 - Fix remote branch missing / first push detection
param(
  [ValidateSet("menu","check","pull","push","status","open","config")]
  [string]$Action = "menu"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [System.Text.UTF8Encoding]::new()
} catch {}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $ScriptDir "GIA_PHA_GITHUB.config.ps1"

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "Không tìm thấy file cấu hình: $ConfigPath"
}

. $ConfigPath

function Write-Title {
  param([string]$Text)
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Cyan
  Write-Host " $Text" -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}

function Write-Ok { param([string]$Text) Write-Host "[OK] $Text" -ForegroundColor Green }
function Write-Info { param([string]$Text) Write-Host "[INFO] $Text" -ForegroundColor Gray }
function Write-Warn { param([string]$Text) Write-Host "[CANH BAO] $Text" -ForegroundColor Yellow }
function Write-Bad { param([string]$Text) Write-Host "[LOI] $Text" -ForegroundColor Red }

function Pause-Menu {
  Write-Host ""
  Read-Host "Nhan Enter de tiep tuc"
}

function Require-Config {
  if ([string]::IsNullOrWhiteSpace($Script:RepoFolder)) {
    throw "RepoFolder đang trống. Hãy sửa GIA_PHA_GITHUB.config.ps1"
  }
  if ([string]::IsNullOrWhiteSpace($Script:RepoUrl) -or $Script:RepoUrl -like "*CHANGE_ME*") {
    throw "RepoUrl chưa được cấu hình. Hãy sửa GIA_PHA_GITHUB.config.ps1"
  }
  if ([string]::IsNullOrWhiteSpace($Script:Branch)) {
    throw "Branch đang trống. Hãy sửa GIA_PHA_GITHUB.config.ps1"
  }
}

function Test-CommandExists {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

function Install-ToolIfMissing {
  param(
    [string]$CommandName,
    [string]$WingetId,
    [string]$DisplayName,
    [string]$FallbackUrl
  )

  if (Test-CommandExists $CommandName) {
    return $true
  }

  Write-Warn "Chưa có $DisplayName."

  if ($Script:AllowWingetInstall -and (Test-CommandExists "winget")) {
    Write-Info "Đang cài $DisplayName bằng winget..."
    $args = @(
      "install",
      "--id", $WingetId,
      "-e",
      "--source", "winget",
      "--accept-source-agreements",
      "--accept-package-agreements"
    )

    $p = Start-Process -FilePath "winget" -ArgumentList $args -Wait -PassThru
    if ($p.ExitCode -eq 0) {
      Write-Ok "Đã cài $DisplayName. Nếu terminal chưa nhận lệnh, hãy đóng mở lại cửa sổ."
      return $true
    }

    Write-Warn "winget cài $DisplayName không thành công. ExitCode=$($p.ExitCode)"
  }

  Write-Warn "Không tự cài được $DisplayName. Đang mở trang tải chính thức..."
  Start-Process $FallbackUrl
  return $false
}

function Ensure-Tools {
  Write-Title "CHECK TOOL BẮT BUỘC"

  Install-ToolIfMissing -CommandName "git" -WingetId "Git.Git" -DisplayName "Git" -FallbackUrl "https://git-scm.com/download/win" | Out-Null
  Install-ToolIfMissing -CommandName "gh" -WingetId "GitHub.cli" -DisplayName "GitHub CLI" -FallbackUrl "https://cli.github.com/" | Out-Null

  if (-not (Test-CommandExists "git")) {
    throw "Chưa có Git. Hãy cài Git xong chạy lại script."
  }
  if (-not (Test-CommandExists "gh")) {
    throw "Chưa có GitHub CLI. Hãy cài GitHub CLI xong chạy lại script."
  }

  Write-Ok "git OK: $((Get-Command git).Source)"
  Write-Ok "gh OK: $((Get-Command gh).Source)"

  $gitVersion = (& git --version) -join " "
  $ghVersion = (& gh --version | Select-Object -First 1) -join " "
  Write-Info $gitVersion
  Write-Info $ghVersion
}

function Ensure-GitHubLogin {
  Write-Title "CHECK ĐĂNG NHẬP GITHUB"

  $authOk = $false
  try {
    & gh auth status -h github.com *> $null
    if ($LASTEXITCODE -eq 0) { $authOk = $true }
  } catch {
    $authOk = $false
  }

  if (-not $authOk) {
    Write-Warn "GitHub CLI chưa đăng nhập. Script sẽ mở trình duyệt để đăng nhập."
    Write-Info "Chọn: GitHub.com -> HTTPS -> Login with a web browser."
    & gh auth login -h github.com -p https --web -s "repo,workflow"
    if ($LASTEXITCODE -ne 0) {
      throw "Đăng nhập GitHub CLI chưa thành công."
    }
  }

  Write-Ok "GitHub CLI đã đăng nhập."

  $currentUser = ""
  try {
    $currentUser = (& gh api user --jq ".login" 2>$null).Trim()
  } catch {}

  if (-not [string]::IsNullOrWhiteSpace($currentUser)) {
    Write-Info "Tài khoản GitHub CLI hiện tại: $currentUser"
    if (-not [string]::IsNullOrWhiteSpace($Script:ExpectedGitHubUser) -and $currentUser -ne $Script:ExpectedGitHubUser) {
      Write-Warn "Tài khoản hiện tại khác ExpectedGitHubUser trong config."
      Write-Warn "Hiện tại : $currentUser"
      Write-Warn "Mong muốn: $Script:ExpectedGitHubUser"
    }
  }
}

function Ensure-RepoFolder {
  Require-Config

  Write-Title "CHECK THƯ MỤC REPO"
  Write-Info "RepoFolder: $Script:RepoFolder"
  Write-Info "RepoUrl   : $Script:RepoUrl"
  Write-Info "Branch    : $Script:Branch"

  if (-not (Test-Path -LiteralPath $Script:RepoFolder)) {
    Write-Warn "Thư mục chưa tồn tại. Tạo mới: $Script:RepoFolder"
    New-Item -ItemType Directory -Path $Script:RepoFolder -Force | Out-Null
  }

  Push-Location -LiteralPath $Script:RepoFolder
  try {
    $isRepo = $false
    try {
      & git rev-parse --is-inside-work-tree *> $null
      if ($LASTEXITCODE -eq 0) { $isRepo = $true }
    } catch {}

    if (-not $isRepo) {
      if ($Script:AutoInitRepoIfMissing) {
        Write-Warn "Thư mục chưa phải git repo. Đang git init..."
        & git init
        if ($LASTEXITCODE -ne 0) { throw "git init thất bại." }
      } else {
        throw "Thư mục chưa phải git repo."
      }
    }

    Write-Ok "Folder repo OK."

    if (-not [string]::IsNullOrWhiteSpace($Script:GitUserName)) {
      & git config user.name "$Script:GitUserName"
      if ($LASTEXITCODE -ne 0) { throw "Set git user.name thất bại." }
      Write-Ok "git user.name = $Script:GitUserName"
    }

    if (-not [string]::IsNullOrWhiteSpace($Script:GitUserEmail)) {
      & git config user.email "$Script:GitUserEmail"
      if ($LASTEXITCODE -ne 0) { throw "Set git user.email thất bại." }
      Write-Ok "git user.email = $Script:GitUserEmail"
    }

    $origin = ""
    try {
      $origin = (& git remote get-url origin 2>$null).Trim()
    } catch {}

    if ([string]::IsNullOrWhiteSpace($origin)) {
      if ($Script:AutoSetOriginIfMissing) {
        Write-Warn "Chưa có remote origin. Đang thêm origin..."
        & git remote add origin "$Script:RepoUrl"
        if ($LASTEXITCODE -ne 0) { throw "git remote add origin thất bại." }
        Write-Ok "Đã thêm origin: $Script:RepoUrl"
      } else {
        throw "Chưa có remote origin."
      }
    } elseif ($origin -ne $Script:RepoUrl) {
      Write-Warn "origin hiện tại khác RepoUrl config."
      Write-Warn "origin hiện tại: $origin"
      Write-Warn "RepoUrl config : $Script:RepoUrl"
      if ($Script:AutoFixOriginUrl) {
        & git remote set-url origin "$Script:RepoUrl"
        if ($LASTEXITCODE -ne 0) { throw "git remote set-url origin thất bại." }
        Write-Ok "Đã đổi origin sang RepoUrl config."
      }
    } else {
      Write-Ok "origin OK: $origin"
    }

    $currentBranch = ""
    try {
      $currentBranch = (& git branch --show-current).Trim()
    } catch {}

    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
      Write-Warn "Chưa có branch hiện tại. Đang tạo/switch sang $Script:Branch"
      & git checkout -B "$Script:Branch"
      if ($LASTEXITCODE -ne 0) { throw "checkout branch thất bại." }
    } elseif ($currentBranch -ne $Script:Branch) {
      Write-Warn "Đang ở branch '$currentBranch', không phải '$Script:Branch'."
      $ans = Read-Host "Có switch sang '$Script:Branch' không? (Y/N)"
      if ($ans -match "^(Y|y)$") {
        & git checkout "$Script:Branch"
        if ($LASTEXITCODE -ne 0) {
          Write-Warn "Branch chưa tồn tại local. Đang checkout -B $Script:Branch"
          & git checkout -B "$Script:Branch"
          if ($LASTEXITCODE -ne 0) { throw "checkout branch thất bại." }
        }
      }
    } else {
      Write-Ok "branch OK: $currentBranch"
    }
  } finally {
    Pop-Location
  }
}

function Ensure-RemoteAccess {
  Write-Title "CHECK QUYỀN TRUY CẬP REMOTE"
  Push-Location -LiteralPath $Script:RepoFolder
  try {
    & git ls-remote --exit-code origin *> $null
    if ($LASTEXITCODE -eq 0) {
      Write-Ok "Có quyền truy cập remote origin."
    } else {
      Write-Warn "Chưa truy cập được origin bằng git."
      Write-Info "Có thể repo chưa tồn tại, URL sai, repo private chưa cấp quyền, hoặc đang login sai account."
    }
  } finally {
    Pop-Location
  }
}

function Full-Check {
  Require-Config
  Ensure-Tools
  Ensure-GitHubLogin
  Ensure-RepoFolder
  Ensure-RemoteAccess
  Show-Status -NoTitle
}

function Show-Status {
  param([switch]$NoTitle)
  if (-not $NoTitle) { Write-Title "GIT STATUS" }
  Push-Location -LiteralPath $Script:RepoFolder
  try {
    Write-Info "Remote:"
    & git remote -v
    Write-Host ""

    Write-Info "Branch:"
    & git branch -vv
    Write-Host ""

    Write-Info "Status ngắn:"
    & git status --short
    Write-Host ""

    Write-Info "Status đầy đủ:"
    & git status
  } finally {
    Pop-Location
  }
}

function Test-WorkingTreeClean {
  $changes = (& git status --porcelain)
  return [string]::IsNullOrWhiteSpace(($changes -join "`n"))
}

function Get-GitFirstLineOrNull {
  param([string[]]$GitArgs)

  $output = & git @GitArgs 2>$null
  if ($LASTEXITCODE -ne 0) {
    return $null
  }

  if ($null -eq $output) {
    return $null
  }

  $line = ($output | Select-Object -First 1)
  if ($null -eq $line) {
    return $null
  }

  $text = "$line".Trim()
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }

  return $text
}

function Get-RemoteBranchExists {
  # Không dùng `git rev-parse origin/main` trực tiếp vì repo mới/remote rỗng
  # sẽ báo "fatal: Needed a single revision".
  $remoteRef = "refs/remotes/origin/$($Script:Branch)"
  & git show-ref --verify --quiet "$remoteRef"
  return ($LASTEXITCODE -eq 0)
}

function Get-BranchRelation {
  # Return: no_local_commit, no_remote, same, local_ahead, local_behind, diverged, unknown
  $local = Get-GitFirstLineOrNull -GitArgs @("rev-parse", "--verify", "HEAD")
  if ($null -eq $local) {
    return "no_local_commit"
  }

  $remoteExists = Get-RemoteBranchExists
  if (-not $remoteExists) {
    return "no_remote"
  }

  $remoteRef = "refs/remotes/origin/$($Script:Branch)^{commit}"
  $remote = Get-GitFirstLineOrNull -GitArgs @("rev-parse", "--verify", "$remoteRef")
  if ($null -eq $remote) {
    return "no_remote"
  }

  $base = Get-GitFirstLineOrNull -GitArgs @("merge-base", "HEAD", "refs/remotes/origin/$($Script:Branch)")
  if ($null -eq $base) {
    return "unknown"
  }

  if ($local -eq $remote) { return "same" }
  if ($base -eq $remote) { return "local_ahead" }
  if ($base -eq $local) { return "local_behind" }
  return "diverged"
}

function Pull-Rebase {
  Write-Info "Đang pull --rebase origin $Script:Branch ..."
  & git pull --rebase origin "$Script:Branch"
  if ($LASTEXITCODE -ne 0) {
    Write-Bad "Pull rebase bị lỗi hoặc conflict."
    Write-Info "Hãy mở VS Code/Git để resolve conflict, sau đó chạy:"
    Write-Info "  git rebase --continue"
    Write-Info "Hoặc nếu muốn hủy rebase:"
    Write-Info "  git rebase --abort"
    return $false
  }
  return $true
}

function Pull-Merge {
  Write-Info "Đang pull --no-rebase origin $Script:Branch ..."
  & git pull --no-rebase origin "$Script:Branch"
  if ($LASTEXITCODE -ne 0) {
    Write-Bad "Pull merge bị lỗi hoặc conflict."
    Write-Info "Hãy mở VS Code/Git để resolve conflict, sau đó commit merge."
    return $false
  }
  return $true
}

function Safe-Pull {
  Require-Config
  Ensure-Tools
  Ensure-GitHubLogin
  Ensure-RepoFolder

  Write-Title "SAFE PULL TỪ GITHUB VỀ MÁY"

  Push-Location -LiteralPath $Script:RepoFolder
  try {
    $clean = Test-WorkingTreeClean
    if (-not $clean) {
      Write-Warn "Đang có thay đổi local chưa commit. Pull sẽ dừng để tránh ghi đè."
      & git status --short
      Write-Host ""
      Write-Info "Cách an toàn: commit hoặc stash thay đổi local trước, rồi pull lại."
      return
    }

    Write-Info "Đang fetch origin..."
    & git fetch origin
    if ($LASTEXITCODE -ne 0) { throw "git fetch thất bại." }

    $relation = Get-BranchRelation
    Write-Info "Quan hệ local/remote: $relation"

    switch ($relation) {
      "no_local_commit" {
        Write-Warn "Local chưa có commit nào. Không có gì để pull."
      }
      "no_remote" {
        Write-Warn "Remote chưa có branch $Script:Branch. Không có gì để pull."
      }
      "same" {
        Write-Ok "Local đã giống GitHub. Không cần pull."
      }
      "local_ahead" {
        Write-Ok "Local đang có commit mới hơn GitHub. Có thể push."
      }
      "local_behind" {
        Pull-Rebase | Out-Null
      }
      "diverged" {
        Write-Warn "Local và GitHub đều có commit riêng. Cần ghép lịch sử."
        $choice = Read-Host "Chọn R = rebase, M = merge, B = bỏ qua"
        if ($choice -match "^(R|r)$") { Pull-Rebase | Out-Null }
        elseif ($choice -match "^(M|m)$") { Pull-Merge | Out-Null }
        else { Write-Warn "Đã bỏ qua pull." }
      }
      default {
        Write-Warn "Không xác định được trạng thái branch. Không tự pull."
      }
    }

    & git status --short
  } finally {
    Pop-Location
  }
}

function Ensure-CommitIfNeeded {
  $changes = (& git status --porcelain)
  if ([string]::IsNullOrWhiteSpace(($changes -join "`n"))) {
    Write-Ok "Không có thay đổi local cần commit."
    return $true
  }

  Write-Warn "Có thay đổi local:"
  & git status --short

  if (-not $Script:AllowCommitFromMenu) {
    Write-Warn "AllowCommitFromMenu=false. Không tự commit."
    return $false
  }

  $ans = Read-Host "Có commit TOÀN BỘ thay đổi này không? (Y/N)"
  if ($ans -notmatch "^(Y|y)$") {
    Write-Warn "Đã hủy commit."
    return $false
  }

  $message = Read-Host "Nhập commit message"
  if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "chore: update project files"
  }

  & git add -A
  if ($LASTEXITCODE -ne 0) { throw "git add thất bại." }

  & git commit -m "$message"
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "git commit không tạo commit mới. Có thể không có thay đổi hợp lệ."
  } else {
    Write-Ok "Đã commit: $message"
  }

  return $true
}

function Sync-RemoteBeforePush {
  Write-Info "Đang fetch GitHub để kiểm tra máy khác có đẩy code mới không..."
  & git fetch origin
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "Fetch remote không thành công. Dừng push để tránh lỗi."
    return $false
  }

  $relation = Get-BranchRelation
  Write-Info "Quan hệ local/remote: $relation"

  switch ($relation) {
    "no_local_commit" {
      Write-Warn "Local chưa có commit nào. Hãy commit trước khi push."
      return $false
    }
    "no_remote" {
      Write-Ok "Remote chưa có branch $Script:Branch. Có thể push lần đầu."
      return $true
    }
    "same" {
      Write-Ok "Local đã đồng bộ với GitHub. Có thể push nếu có commit mới."
      return $true
    }
    "local_ahead" {
      Write-Ok "Local đang đi trước GitHub. Có thể push."
      return $true
    }
    "local_behind" {
      Write-Warn "GitHub có commit mới từ máy khác. Cần kéo về trước khi push."
    }
    "diverged" {
      Write-Warn "Local và GitHub đều có commit mới riêng. Cần ghép trước khi push."
    }
    default {
      Write-Warn "Không xác định được trạng thái local/remote. Không push."
      return $false
    }
  }

  $mode = $Script:PushRemoteSyncMode
  if ([string]::IsNullOrWhiteSpace($mode)) { $mode = "ask" }

  if ($mode -eq "ask") {
    Write-Host ""
    Write-Host "Chọn cách đồng bộ trước khi push:"
    Write-Host "  R = Rebase: lịch sử gọn, khuyến nghị cho code cá nhân/nhiều máy"
    Write-Host "  M = Merge : tạo merge commit, dễ hiểu hơn nếu không quen rebase"
    Write-Host "  B = Block : dừng, không push"
    $choice = Read-Host "Lựa chọn"
    if ($choice -match "^(R|r)$") { $mode = "rebase" }
    elseif ($choice -match "^(M|m)$") { $mode = "merge" }
    else { $mode = "block" }
  }

  if ($mode -eq "rebase") {
    return (Pull-Rebase)
  }

  if ($mode -eq "merge") {
    return (Pull-Merge)
  }

  Write-Warn "Đã dừng push. Không có thay đổi nào bị ghi đè."
  return $false
}

function Safe-Push {
  Require-Config
  Ensure-Tools
  Ensure-GitHubLogin
  Ensure-RepoFolder

  Write-Title "SAFE PUSH LÊN GITHUB"

  Push-Location -LiteralPath $Script:RepoFolder
  try {
    $committed = Ensure-CommitIfNeeded
    if (-not $committed) {
      Write-Warn "Dừng push vì thay đổi local chưa được commit."
      return
    }

    $synced = Sync-RemoteBeforePush
    if (-not $synced) {
      Write-Warn "Dừng push vì chưa đồng bộ được với GitHub."
      return
    }

    Write-Info "Đang push origin $Script:Branch ..."
    if ($Script:AllowForcePush) {
      Write-Bad "AllowForcePush=true nhưng script này không hỗ trợ force-push để bảo vệ dữ liệu."
      return
    }

    & git push -u origin "$Script:Branch"
    if ($LASTEXITCODE -ne 0) {
      Write-Bad "Push thất bại."
      Write-Info "Nếu báo non-fast-forward, hãy chạy PULL hoặc PUSH lại và chọn rebase/merge."
      return
    }

    Write-Ok "Push thành công."
  } finally {
    Pop-Location
  }
}

function Open-Repo {
  Require-Config
  $url = $Script:RepoUrl
  if ($url -match "^git@github\.com:(.+?)/(.+?)(\.git)?$") {
    $url = "https://github.com/$($Matches[1])/$($Matches[2])"
  } elseif ($url -match "^https://github\.com/(.+?)/(.+?)(\.git)?$") {
    $url = "https://github.com/$($Matches[1])/$($Matches[2])"
  }

  Write-Title "OPEN REPO"
  Write-Info "Mở: $url"
  Start-Process $url
}

function Open-Config {
  Write-Title "OPEN CONFIG"
  Start-Process notepad.exe $ConfigPath
}

function Show-Menu {
  while ($true) {
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " GIA PHẢ - SAFE GITHUB SYNC" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " RepoFolder : $Script:RepoFolder"
    Write-Host " RepoUrl    : $Script:RepoUrl"
    Write-Host " Branch     : $Script:Branch"
    if (-not [string]::IsNullOrWhiteSpace($Script:ExpectedGitHubUser)) {
      Write-Host " Account    : $Script:ExpectedGitHubUser"
    }
    Write-Host ""
    Write-Host " [1] CHECK   - Kiểm tra Git, GitHub CLI, login, repo, remote, branch"
    Write-Host " [2] PULL    - Kéo code từ GitHub về máy an toàn"
    Write-Host " [3] PUSH    - Commit nếu cần, đồng bộ remote, rồi push an toàn"
    Write-Host " [4] STATUS  - Xem trạng thái Git hiện tại"
    Write-Host " [5] OPEN    - Mở repo trên trình duyệt"
    Write-Host " [6] CONFIG  - Mở file cấu hình"
    Write-Host " [0] EXIT"
    Write-Host ""

    $choice = Read-Host "Chọn thao tác"

    try {
      switch ($choice) {
        "1" { Full-Check; Pause-Menu }
        "2" { Safe-Pull; Pause-Menu }
        "3" { Safe-Push; Pause-Menu }
        "4" { Show-Status; Pause-Menu }
        "5" { Open-Repo; Pause-Menu }
        "6" { Open-Config; Pause-Menu }
        "0" { return }
        default { Write-Warn "Lựa chọn không hợp lệ."; Pause-Menu }
      }
    } catch {
      Write-Bad $_.Exception.Message
      Pause-Menu
    }
  }
}

switch ($Action) {
  "menu"   { Show-Menu }
  "check"  { Full-Check }
  "pull"   { Safe-Pull }
  "push"   { Safe-Push }
  "status" { Show-Status }
  "open"   { Open-Repo }
  "config" { Open-Config }
}

