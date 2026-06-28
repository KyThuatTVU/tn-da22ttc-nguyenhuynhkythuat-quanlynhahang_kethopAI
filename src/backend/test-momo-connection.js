/**
 * Test MoMo Payment Connection
 * Kiểm tra kết nối và cấu hình MoMo
 */

require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const momoConfig = require('./config/momo');

console.log('🔧 Testing MoMo Configuration...\n');

// Kiểm tra config
console.log('📋 Current Configuration:');
console.log('Partner Code:', momoConfig.partnerCode);
console.log('Access Key:', momoConfig.accessKey);
console.log('Secret Key:', momoConfig.secretKey ? `${momoConfig.secretKey.substring(0, 10)}...` : 'MISSING');
console.log('Endpoint:', momoConfig.endpoint);
console.log('Redirect URL:', momoConfig.redirectUrl);
console.log('IPN URL:', momoConfig.ipnUrl);
console.log('Request Type:', momoConfig.requestType);
console.log('\n');

// Validate config
const issues = [];
if (momoConfig.partnerCode === 'YOUR_PARTNER_CODE' || momoConfig.partnerCode === 'MOMO') {
    issues.push('⚠️  Partner Code có vẻ là giá trị mặc định. Cần credentials thật từ MoMo Developer Portal.');
}
if (momoConfig.accessKey === 'YOUR_ACCESS_KEY' || momoConfig.accessKey === 'F8BBA842ECF85') {
    issues.push('⚠️  Access Key có vẻ là giá trị mặc định. Cần credentials thật từ MoMo Developer Portal.');
}
if (momoConfig.secretKey === 'YOUR_SECRET_KEY' || momoConfig.secretKey === 'K951B6PE1waDMi640xX08PD3vg6EkVlz') {
    issues.push('⚠️  Secret Key có vẻ là giá trị mặc định. Cần credentials thật từ MoMo Developer Portal.');
}
if (momoConfig.redirectUrl.includes('localhost') || momoConfig.ipnUrl.includes('localhost')) {
    issues.push('ℹ️  Đang dùng localhost. Cần dùng ngrok hoặc domain công khai để MoMo callback được.');
}

if (issues.length > 0) {
    console.log('🚨 Issues Found:\n');
    issues.forEach(issue => console.log(issue));
    console.log('\n📖 Đọc file MOMO_SETUP_GUIDE.md để biết cách khắc phục.\n');
}

// Test payment request
async function testPayment() {
    try {
        console.log('🧪 Testing Payment Creation...\n');
        
        const orderId = `TEST_${Date.now()}`;
        const requestId = orderId;
        const amount = 50000; // 50,000 VND
        const orderInfo = 'Test payment';
        
        // Tạo raw signature
        const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;
        
        console.log('🔐 Raw Signature:', rawSignature);
        
        // Tạo chữ ký
        const signature = crypto
            .createHmac('sha256', momoConfig.secretKey)
            .update(rawSignature)
            .digest('hex');
        
        console.log('🔐 Signature:', signature);
        console.log('\n');
        
        // Request body
        const requestBody = {
            partnerCode: momoConfig.partnerCode,
            accessKey: momoConfig.accessKey,
            requestId: requestId,
            amount: amount,
            orderId: requestId,
            orderInfo: orderInfo,
            redirectUrl: momoConfig.redirectUrl,
            ipnUrl: momoConfig.ipnUrl,
            requestType: momoConfig.requestType,
            extraData: '',
            lang: momoConfig.lang,
            signature: signature
        };
        
        console.log('📤 Request Body:');
        console.log(JSON.stringify(requestBody, null, 2));
        console.log('\n');
        
        // Gửi request
        console.log('📡 Sending request to MoMo...\n');
        const response = await axios.post(momoConfig.endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('📥 MoMo Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n');
        
        if (response.data.resultCode === 0) {
            console.log('✅ SUCCESS! MoMo connection is working!');
            console.log(`🔗 Payment URL: ${response.data.payUrl}`);
            console.log('\nBạn có thể test thanh toán bằng cách truy cập URL trên.');
        } else {
            console.log('❌ FAILED! MoMo returned error:');
            console.log(`   Code: ${response.data.resultCode}`);
            console.log(`   Message: ${response.data.message}`);
            console.log(`   Local Message: ${response.data.localMessage || 'N/A'}`);
            
            // Gợi ý khắc phục
            console.log('\n💡 Suggestions:');
            if (response.data.resultCode === 9002) {
                console.log('   - Chữ ký không hợp lệ. Kiểm tra Secret Key trong .env');
            } else if (response.data.resultCode === 1002) {
                console.log('   - Giao dịch bị từ chối. Kiểm tra:');
                console.log('     + Credentials có đúng không?');
                console.log('     + Tài khoản sandbox có hoạt động không?');
                console.log('     + Số tiền có hợp lệ không? (1,000 - 50,000,000 VND)');
            } else if (response.data.resultCode === 9004) {
                console.log('   - URL không hợp lệ. Nếu dùng localhost, cần dùng ngrok');
            }
        }
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Không thể kết nối đến MoMo endpoint.');
            console.log('   Kiểm tra kết nối internet và endpoint URL.');
        } else if (error.response) {
            console.log('\n📥 Error Response from MoMo:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run test
testPayment();
