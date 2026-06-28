#!/bin/bash

# Script kiểm tra cấu hình MoMo
# Sử dụng: bash check-momo-setup.sh

echo "🔍 Kiểm tra cấu hình MoMo Payment..."
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "❌ Không tìm thấy file .env"
    exit 1
fi

# Load .env
export $(cat .env | grep -v '^#' | xargs)

echo "📋 Thông tin cấu hình:"
echo "   Partner Code: $MOMO_PARTNER_CODE"
echo "   Access Key: $MOMO_ACCESS_KEY"
echo "   Secret Key: ${MOMO_SECRET_KEY:0:10}..."
echo "   Endpoint: $MOMO_ENDPOINT"
echo ""

# Check if using default credentials
ISSUES=0

if [ "$MOMO_PARTNER_CODE" = "MOMO" ] || [ "$MOMO_PARTNER_CODE" = "YOUR_PARTNER_CODE" ]; then
    echo "⚠️  Partner Code đang dùng giá trị mặc định"
    ISSUES=$((ISSUES + 1))
fi

if [ "$MOMO_ACCESS_KEY" = "F8BBA842ECF85" ] || [ "$MOMO_ACCESS_KEY" = "YOUR_ACCESS_KEY" ]; then
    echo "⚠️  Access Key đang dùng giá trị mặc định"
    ISSUES=$((ISSUES + 1))
fi

if [ "$MOMO_SECRET_KEY" = "K951B6PE1waDMi640xX08PD3vg6EkVlz" ] || [ "$MOMO_SECRET_KEY" = "YOUR_SECRET_KEY" ]; then
    echo "⚠️  Secret Key đang dùng giá trị mặc định"
    ISSUES=$((ISSUES + 1))
fi

if [[ "$MOMO_REDIRECT_URL" == *"localhost"* ]] || [[ "$MOMO_IPN_URL" == *"localhost"* ]]; then
    echo "ℹ️  Đang dùng localhost - cần ngrok để test"
    ISSUES=$((ISSUES + 1))
fi

echo ""

if [ $ISSUES -gt 0 ]; then
    echo "🚨 Tìm thấy $ISSUES vấn đề"
    echo ""
    echo "📖 Hướng dẫn khắc phục:"
    echo "   1. Đăng ký tài khoản: https://developers.momo.vn/"
    echo "   2. Tạo ứng dụng Sandbox"
    echo "   3. Cập nhật credentials trong file .env"
    echo "   4. Đọc file QUICK_FIX_MOMO.md"
    echo ""
    echo "🧪 Test kết nối: npm run test-momo"
else
    echo "✅ Cấu hình có vẻ OK"
    echo ""
    echo "🧪 Chạy test: npm run test-momo"
fi
