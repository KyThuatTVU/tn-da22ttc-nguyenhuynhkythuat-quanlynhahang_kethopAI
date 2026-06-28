const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function generateToken(ma_nguoi_dung) {
    return jwt.sign({ ma_nguoi_dung }, JWT_SECRET, { expiresIn: '1d' });
}

async function testRecApi(userId) {
    console.log(`\n--- Testing recommendations API for User #${userId} ---`);
    const token = generateToken(userId);
    try {
        const response = await axios.get('http://localhost:3000/api/recommendations?limit=8', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Success:', response.data.success);
        if (response.data.success && response.data.data) {
            console.log(`Returned ${response.data.data.length} recommendations:`);
            response.data.data.forEach((r, idx) => {
                console.log(`${idx + 1}. [#${r.ma_mon}] "${r.ten_mon}" | Score: ${r.score} | Reason: "${r.reason}"`);
            });
        }
    } catch (e) {
        console.error('API Error:', e.message);
    }
}

async function run() {
    await testRecApi(4); // Thiên Vũ Đỗ (ma_nguoi_dung: 4)
    await testRecApi(7); // Đỗ Thiên Vũ (ma_nguoi_dung: 7)
}

run();
