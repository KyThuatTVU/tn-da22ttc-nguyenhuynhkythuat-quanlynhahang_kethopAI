# Script PowerShell để tự động thêm auth-check.js vào tất cả các trang admin
# Trừ các trang login

# Danh sách các trang không cần auth
$excludePages = @("dang-nhap-admin.html", "dang-nhap-nhan-vien.html")

# Dòng cần thêm
$authCheckLine = "    <!-- Auth Check Script - Kiểm tra đăng nhập -->`n    <script src=`"js/auth-check.js`"></script>"

# Lấy tất cả file HTML trong thư mục hiện tại
$htmlFiles = Get-ChildItem -Path . -Filter "*.html"

foreach ($file in $htmlFiles) {
    $fileName = $file.Name
    
    # Kiểm tra xem file có trong danh sách exclude không
    if ($excludePages -contains $fileName) {
        Write-Host "Bỏ qua: $fileName" -ForegroundColor Yellow
        continue
    }
    
    # Đọc nội dung file
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Kiểm tra xem file đã có auth-check.js chưa
    if ($content -match "auth-check\.js") {
        Write-Host "Đã có auth-check: $fileName" -ForegroundColor Green
        continue
    }
    
    # Kiểm tra xem có admin-responsive.css không
    if ($content -match "admin-responsive\.css") {
        # Thêm auth-check sau dòng admin-responsive.css
        $newContent = $content -replace "(admin-responsive\.css`">)", "`$1`n$authCheckLine"
        
        # Ghi lại file
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Đã thêm auth-check vào: $fileName" -ForegroundColor Cyan
    } else {
        Write-Host "Không tìm thấy admin-responsive.css trong: $fileName" -ForegroundColor Red
    }
}

Write-Host "`nHoàn thành!" -ForegroundColor Green
