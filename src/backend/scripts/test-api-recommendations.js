/**
 * Script: Test API recommendations thực tế
 * Chạy: node backend/scripts/test-api-recommendations.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const API_URL = 'http://localhost:3000/api/recommendations';

async function testAPIRecommendations() {
    console.log('🧪 ====== TEST API RECOMMENDATIONS ======\n');

    try {
        const userId = 4;  // Đỗ Thiên Vũ
        const comChienId = 33;
        const khoLuId = 29;

        // 1. Tạo JWT token cho user
        const token = jwt.sign({ ma_nguoi_dung: userId }, JWT_SECRET, { expiresIn: '24h' });
        console.log(`👤 User ID: ${userId}`);
        console.log(`🔑 Token: ${token.substring(0, 30)}...\n`);

        // 2. Gọi API recommendations
        console.log('📡 Gọi API: GET /api/recommendations?limit=20');
        const response = await axios.get(`${API_URL}?limit=20&t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = response.data;
        
        if (!result.success) {
            console.log('❌ API trả về lỗi:', result.message);
            return;
        }

        console.log(`✅ API thành công! Tìm thấy ${result.data.length} món gợi ý\n`);

        // 3. Tìm 2 món trong kết quả
        const comChien = result.data.find(d => d.ma_mon === comChienId);
        const khoLu = result.data.find(d => d.ma_mon === khoLuId);

        console.log('=' .repeat(60));
        console.log('🎯 KẾT QUẢ KIỂM TRA:');
        console.log('='.repeat(60));
        
        if (comChien) {
            const position = result.data.indexOf(comChien) + 1;
            console.log(`✅ "Cơm chiên tỏi trứng" XUẤT HIỆN trong gợi ý!`);
            console.log(`   📍 Vị trí: #${position}/${result.data.length}`);
            console.log(`   🏷️  Loại: ${comChien.recommendation_type}`);
            console.log(`   📊 Score: ${comChien.score || 'N/A'}`);
            console.log(`   💬 Lý do: ${comChien.reason || 'N/A'}`);
        } else {
            console.log(`❌ "Cơm chiên tỏi trứng" KHÔNG XUẤT HIỆN!`);
        }
        
        console.log('');
        
        if (khoLu) {
            const position = result.data.indexOf(khoLu) + 1;
            console.log(`✅ "Khô lù đù 1 nắng" XUẤT HIỆN trong gợi ý!`);
            console.log(`   📍 Vị trí: #${position}/${result.data.length}`);
            console.log(`   🏷️  Loại: ${khoLu.recommendation_type}`);
            console.log(`   📊 Score: ${khoLu.score || 'N/A'}`);
            console.log(`   💬 Lý do: ${khoLu.reason || 'N/A'}`);
        } else {
            console.log(`❌ "Khô lù đù 1 nắng" KHÔNG XUẤT HIỆN!`);
        }

        // 4. Hiển thị breakdown
        if (result.meta && result.meta.breakdown) {
            console.log('\n📊 Breakdown theo loại:');
            console.log(`   - Content-based: ${result.meta.breakdown.content_based} món`);
            console.log(`   - Chat-based: ${result.meta.breakdown.chat_based} món`);
            console.log(`   - Collaborative: ${result.meta.breakdown.collaborative} món`);
            console.log(`   - Trending: ${result.meta.breakdown.trending} món`);
        }

        // 5. Hiển thị top 10
        console.log('\n📋 TOP 10 MÓN GỢI Ý:');
        console.log('='.repeat(60));
        result.data.slice(0, 10).forEach((dish, index) => {
            const isComChien = dish.ma_mon === comChienId ? ' 🎯' : '';
            const isKhoLu = dish.ma_mon === khoLuId ? ' 🎯' : '';
            const score = dish.score ? ` (Score: ${dish.score.toFixed(1)})` : '';
            console.log(`${index + 1}. ${dish.ten_mon}${isComChien}${isKhoLu}${score}`);
            console.log(`   ${dish.reason || 'N/A'}`);
        });

        console.log('\n✅ Test hoàn tất!');

    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('❌ Network Error: Không thể kết nối đến backend!');
            console.error('   → Đảm bảo backend đang chạy tại http://localhost:3000');
        } else {
            console.error('❌ Lỗi:', error.message);
        }
    }
}

testAPIRecommendations().catch(console.error);
