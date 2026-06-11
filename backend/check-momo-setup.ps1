# Script kiểm tra cấu hình MoMo Payment (PowerShell)
# Sử dụng: .\check-momo-setup.ps1

Write-Host "🔍 Kiểm tra cấu hình MoMo Payment..." -ForegroundColor Cyan
Write-Host ""

# Check .env file
if (-Not (Test-Path .env)) {
    Write-Host "❌ Không tìm thấy file .env" -ForegroundColor Red
    exit 1
}

# Load .env
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^#].+?)=(.*)$") {
        $name = $matches[1]
        $value = $matches[2]
        Set-Variable -Name $name -Value $value -Scope Script
    }
}

Write-Host "📋 Thông tin cấu hình:" -ForegroundColor Yellow
Write-Host "   Partner Code: $MOMO_PARTNER_CODE"
Write-Host "   Access Key: $MOMO_ACCESS_KEY"
Write-Host "   Secret Key: $($MOMO_SECRET_KEY.Substring(0, [Math]::Min(10, $MOMO_SECRET_KEY.Length)))..."
Write-Host "   Endpoint: $MOMO_ENDPOINT"
Write-Host ""

# Check if using default credentials
$ISSUES = 0

if ($MOMO_PARTNER_CODE -eq "MOMO" -or $MOMO_PARTNER_CODE -eq "YOUR_PARTNER_CODE") {
    Write-Host "⚠️  Partner Code đang dùng giá trị mặc định" -ForegroundColor Yellow
    $ISSUES++
}

if ($MOMO_ACCESS_KEY -eq "F8BBA842ECF85" -or $MOMO_ACCESS_KEY -eq "YOUR_ACCESS_KEY") {
    Write-Host "⚠️  Access Key đang dùng giá trị mặc định" -ForegroundColor Yellow
    $ISSUES++
}

if ($MOMO_SECRET_KEY -eq "K951B6PE1waDMi640xX08PD3vg6EkVlz" -or $MOMO_SECRET_KEY -eq "YOUR_SECRET_KEY") {
    Write-Host "⚠️  Secret Key đang dùng giá trị mặc định" -ForegroundColor Yellow
    $ISSUES++
}

if ($MOMO_REDIRECT_URL -like "*localhost*" -or $MOMO_IPN_URL -like "*localhost*") {
    Write-Host "ℹ️  Đang dùng localhost - cần ngrok để test" -ForegroundColor Cyan
    $ISSUES++
}

Write-Host ""

if ($ISSUES -gt 0) {
    Write-Host "🚨 Tìm thấy $ISSUES vấn đề" -ForegroundColor Red
    Write-Host ""
    Write-Host "📖 Hướng dẫn khắc phục:" -ForegroundColor Yellow
    Write-Host "   1. Đăng ký tài khoản: https://developers.momo.vn/"
    Write-Host "   2. Tạo ứng dụng Sandbox"
    Write-Host "   3. Cập nhật credentials trong file .env"
    Write-Host "   4. Đọc file QUICK_FIX_MOMO.md"
    Write-Host ""
    Write-Host "🧪 Test kết nối: npm run test-momo" -ForegroundColor Cyan
} else {
    Write-Host "✅ Cấu hình có vẻ OK" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Chạy test: npm run test-momo" -ForegroundColor Cyan
}
