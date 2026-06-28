#!/bin/bash

# Script để tự động thêm auth-check.js vào tất cả các trang admin
# Trừ các trang login

# Danh sách các trang không cần auth
EXCLUDE_PAGES=("dang-nhap-admin.html" "dang-nhap-nhan-vien.html")

# Dòng cần thêm
AUTH_LINE='    <!-- Auth Check Script - Kiểm tra đăng nhập -->\n    <script src="js/auth-check.js"></script>'

# Tìm tất cả file HTML
for file in *.html; do
    # Kiểm tra xem file có trong danh sách exclude không
    skip=false
    for exclude in "${EXCLUDE_PAGES[@]}"; do
        if [ "$file" == "$exclude" ]; then
            skip=true
            break
        fi
    done
    
    if [ "$skip" == true ]; then
        echo "Bỏ qua: $file"
        continue
    fi
    
    # Kiểm tra xem file đã có auth-check.js chưa
    if grep -q "auth-check.js" "$file"; then
        echo "Đã có auth-check: $file"
        continue
    fi
    
    # Tìm dòng có admin-responsive.css và thêm auth-check sau nó
    if grep -q "admin-responsive.css" "$file"; then
        # Sử dụng sed để thêm dòng sau admin-responsive.css
        sed -i "/admin-responsive.css/a\\    <!-- Auth Check Script - Kiểm tra đăng nhập -->\\n    <script src=\"js/auth-check.js\"></script>" "$file"
        echo "Đã thêm auth-check vào: $file"
    else
        echo "Không tìm thấy admin-responsive.css trong: $file"
    fi
done

echo "Hoàn thành!"
