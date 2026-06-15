# ============================================================
# GIA PHẢ - GITHUB SAFE SYNC CONFIG
# Sửa các biến dưới đây cho đúng repo / máy của bạn.
# ============================================================

# Thư mục code local.
# Ví dụ đúng với dự án Gia Phả hiện tại:
$Script:RepoFolder = "D:\CODE\GIA PHẢ"

# Link repo GitHub.
# Ví dụ:
#   https://github.com/hungpham-code/gia-pha.git
#   https://github.com/hungdiepcompany-del/gia-pha.git
#   git@github.com:hungpham-code/gia-pha.git
$Script:RepoUrl = "https://github.com/hungdiepcompany-del/giapha.git"

# Branch chính.
$Script:Branch = "main"

# Tài khoản GitHub mong muốn. Để trống nếu không cần cảnh báo sai tài khoản.
# Ví dụ: "hungdiepcompany-del" hoặc "hungpham-code"
$Script:ExpectedGitHubUser = ""

# Cấu hình tên/email commit riêng cho repo này.
# Để trống nếu muốn dùng git config global hiện có.
$Script:GitUserName = ""
$Script:GitUserEmail = ""

# Nếu thư mục chưa phải git repo thì tự git init.
$Script:AutoInitRepoIfMissing = $true

# Nếu chưa có remote origin thì tự thêm origin theo RepoUrl.
$Script:AutoSetOriginIfMissing = $true

# Nếu remote origin khác RepoUrl:
# $true  = tự đổi origin sang RepoUrl.
# $false = chỉ cảnh báo.
$Script:AutoFixOriginUrl = $false

# Cho phép menu PUSH hỏi commit toàn bộ thay đổi local trước khi push.
$Script:AllowCommitFromMenu = $true

# Cài Git/GitHub CLI bằng winget nếu máy chưa có.
# Nếu không có winget, script sẽ mở trang tải chính thức.
$Script:AllowWingetInstall = $true

# Cách xử lý khi PUSH mà GitHub có commit mới từ máy khác:
# "ask"    = hỏi Rebase / Merge / Block
# "rebase" = tự pull --rebase
# "merge"  = tự pull --no-rebase
# "block"  = dừng, không push
$Script:PushRemoteSyncMode = "ask"

# Khuyến nghị giữ false. Script tuyệt đối không force-push.
$Script:AllowForcePush = $false
