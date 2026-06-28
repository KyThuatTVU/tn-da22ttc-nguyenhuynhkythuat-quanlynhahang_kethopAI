const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function generateToken(ma_nguoi_dung) {
    if (!ma_nguoi_dung) return null;
    return jwt.sign({ ma_nguoi_dung }, JWT_SECRET, { expiresIn: '1d' });
}

async function testNewDishesApi(userId) {
    console.log(`\n--- Testing /new-dishes API for User: ${userId ? `#${userId}` : 'Guest/Admin'} ---`);
    const token = generateToken(userId);
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    try {
        const response = await axios.get('http://localhost:3000/api/recommendations/new-dishes?limit=5', { headers });
        console.log('Success:', response.data.success);
        if (response.data.success && response.data.data) {
            console.log(`Returned ${response.data.data.length} dishes:`);
            response.data.data.forEach((r, idx) => {
                console.log(`${idx + 1}. [#${r.ma_mon}] "${r.ten_mon}" | days_old: ${r.days_old} | reason: "${r.reason}"`);
            });
        }
    } catch (e) {
        console.error('API Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', e.response.data);
        }
    }
}

async function run() {
    await testNewDishesApi(null); // Guest or Admin token which decodes as null
    await testNewDishesApi(3);    // User with preferences
}

run();
