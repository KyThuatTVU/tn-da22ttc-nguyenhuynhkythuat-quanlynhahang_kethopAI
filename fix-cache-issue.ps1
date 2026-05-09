# Script tự động fix cache issue

Write-Host "🔧 FIX CACHE ISSUE - AUTO SCRIPT" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# 1. Kiểm tra server đang chạy
Write-Host "1️⃣ Kiểm tra server..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ✅ Server đang chạy (PID: $($nodeProcesses.Id -join ', '))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Server không chạy!" -ForegroundColor Red
    Write-Host "   Hãy chạy: cd backend && npm start" -ForegroundColor Yellow
    exit
}

# 2. Kiểm tra file đã được fix chưa
Write-Host ""
Write-Host "2️⃣ Kiểm tra file đã được fix..." -ForegroundColor Yellow

$dashboardFile = "frontend/admin/dashboard.html"
$serverFile = "backend/server.js"

# Check dashboard.html
$dashboardContent = Get-Content $dashboardFile -Raw
if ($dashboardContent -match "// const API_BASE = API_URL; // Đã comment") {
    Write-Host "   ✅ dashboard.html đã được fix" -ForegroundColor Green
} else {
    Write-Host "   ❌ dashboard.html chưa được fix!" -ForegroundColor Red
    Write-Host "   Cần comment dòng: const API_BASE = API_URL;" -ForegroundColor Yellow
}

# Check server.js
$serverContent = Get-Content $serverFile -Raw
if ($serverContent -match "// const adminsRoutes = require\('./routes/admins'\);") {
    Write-Host "   ✅ server.js đã được fix" -ForegroundColor Green
} else {
    Write-Host "   ❌ server.js chưa được fix!" -ForegroundColor Red
    Write-Host "   Cần comment dòng: const adminsRoutes = require('./routes/admins');" -ForegroundColor Yellow
}

# 3. Tạo file test nếu chưa có
Write-Host ""
Write-Host "3️⃣ Kiểm tra file test..." -ForegroundColor Yellow
$testFile = "frontend/admin/test-session-simple.html"
if (Test-Path $testFile) {
    Write-Host "   ✅ File test đã tồn tại" -ForegroundColor Green
} else {
    Write-Host "   ❌ File test không tồn tại!" -ForegroundColor Red
}

# 4. Hướng dẫn clear cache
Write-Host ""
Write-Host "4️⃣ HƯỚNG DẪN CLEAR CACHE" -ForegroundColor Yellow
Write-Host "   =================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Cách 1: Hard Refresh (Khuyến nghị)" -ForegroundColor White
Write-Host "   - Mở: http://localhost:3000/admin/dashboard.html" -ForegroundColor Gray
Write-Host "   - Nhấn: Ctrl + Shift + R" -ForegroundColor Gray
Write-Host ""
Write-Host "   Cách 2: DevTools" -ForegroundColor White
Write-Host "   - Mở DevTools (F12)" -ForegroundColor Gray
Write-Host "   - Click chuột phải vào nút Refresh" -ForegroundColor Gray
Write-Host "   - Chọn 'Empty Cache and Hard Reload'" -ForegroundColor Gray
Write-Host ""
Write-Host "   Cách 3: Clear All" -ForegroundColor White
Write-Host "   - F12 → Application → Storage → Clear site data" -ForegroundColor Gray
Write-Host ""

# 5. Test URLs
Write-Host "5️⃣ TEST URLs" -ForegroundColor Yellow
Write-Host "   =================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🧪 Test Session:" -ForegroundColor White
Write-Host "   http://localhost:3000/admin/test-session-simple.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🔐 Login Nhân Viên:" -ForegroundColor White
Write-Host "   http://localhost:3000/admin/dang-nhap-nhan-vien.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "   📊 Dashboard:" -ForegroundColor White
Write-Host "   http://localhost:3000/admin/dashboard.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "   📦 Orders:" -ForegroundColor White
Write-Host "   http://localhost:3000/admin/orders.html" -ForegroundColor Cyan
Write-Host ""

# 6. Checklist
Write-Host "6️⃣ CHECKLIST" -ForegroundColor Yellow
Write-Host "   =================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   [ ] Server chạy không lỗi" -ForegroundColor Gray
Write-Host "   [ ] Clear cache (Ctrl + Shift + R)" -ForegroundColor Gray
Write-Host "   [ ] Mở test-session-simple.html" -ForegroundColor Gray
Write-Host "   [ ] Test login nhân viên" -ForegroundColor Gray
Write-Host "   [ ] Check session thành công" -ForegroundColor Gray
Write-Host "   [ ] Cookie admin.sid được set" -ForegroundColor Gray
Write-Host "   [ ] Redirect đến dashboard/orders" -ForegroundColor Gray
Write-Host "   [ ] Console không có lỗi" -ForegroundColor Gray
Write-Host ""

# 7. Mở browser tự động
Write-Host "7️⃣ MỞ BROWSER TỰ ĐỘNG?" -ForegroundColor Yellow
$openBrowser = Read-Host "   Bạn có muốn mở test page? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Write-Host "   🌐 Đang mở browser..." -ForegroundColor Green
    Start-Process "http://localhost:3000/admin/test-session-simple.html"
}

Write-Host ""
Write-Host "✅ HOÀN TẤT!" -ForegroundColor Green
Write-Host "Đọc file HUONG_DAN_FIX_LOI_DANG_NHAP.md để biết thêm chi tiết" -ForegroundColor Yellow
