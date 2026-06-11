const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const PYTHON_API_URL = process.env.PYTHON_ML_URL || 'http://localhost:5000/api/ml/recommend/collaborative';
const PYTHON_APRIORI_URL = process.env.PYTHON_APRIORI_URL || 'http://localhost:5000/api/ml/recommend/apriori';

// ==================== ML RECOMMENDATION ENGINE ====================

/**
 * Hệ thống gợi ý món ăn sử dụng Machine Learning
 * - Content-based filtering: Dựa trên đặc điểm món ăn
 * - Collaborative filtering: Dựa trên hành vi người dùng tương tự
 * - Association rules: Quy tắc kết hợp món ăn (lẩu → nước)
 * - NLP analysis: Phân tích từ khóa từ chatbot
 */

// Cache cho recommendations
let recommendationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

// ==================== HELPER FUNCTIONS ====================

// Lấy user từ token
function getUserFromToken(req) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded.ma_nguoi_dung;
        }
    } catch (error) {}
    return null;
}

// Tính cosine similarity giữa 2 vectors
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ==================== QUY TẮC KẾT HỢP MÓN ĂN (Association Rules) ====================

const FOOD_PAIRING_RULES = {
    // Lẩu → Nước giải khát
    'lau': ['nuoc_uong', 'do_uong', 'trang_mieng'],
    'lau_mam': ['nuoc_uong', 'rau_song', 'bun'],
    'lau_thai': ['nuoc_uong', 'hai_san', 'mi'],
    
    // Món chính → Khai vị + Nước
    'mon_chinh': ['khai_vi', 'nuoc_uong', 'trang_mieng'],
    'com': ['canh', 'rau', 'nuoc_uong'],
    'bun': ['nem', 'cha_gio', 'nuoc_uong'],
    'pho': ['quay', 'nuoc_uong'],
    
    // Hải sản → Nước chấm + Rau
    'hai_san': ['nuoc_cham', 'rau_song', 'nuoc_uong'],
    'tom': ['nuoc_cham', 'rau', 'nuoc_uong'],
    'ca': ['canh_chua', 'rau', 'com'],
    
    // Đồ nướng → Nước + Rau
    'nuong': ['nuoc_uong', 'rau_song', 'banh_mi'],
    'bbq': ['bia', 'nuoc_ngot', 'salad'],
    
    // Tráng miệng → Đồ uống
    'trang_mieng': ['tra', 'ca_phe', 'nuoc_ep']
};

// Từ khóa mapping cho các loại món
const KEYWORD_CATEGORY_MAP = {
    // Lẩu
    'lẩu': 'lau', 'lau': 'lau', 'hotpot': 'lau', 'nồi lẩu': 'lau',
    'lẩu mắm': 'lau_mam', 'lẩu thái': 'lau_thai', 'lẩu hải sản': 'lau',
    
    // Món chính
    'cơm': 'com', 'com': 'com', 'rice': 'com',
    'bún': 'bun', 'bun': 'bun', 'noodle': 'bun',
    'phở': 'pho', 'pho': 'pho',
    'mì': 'mi', 'mi': 'mi',
    
    // Hải sản
    'tôm': 'tom', 'tom': 'tom', 'shrimp': 'tom',
    'cá': 'ca', 'ca': 'ca', 'fish': 'ca',
    'hải sản': 'hai_san', 'seafood': 'hai_san',
    'cua': 'hai_san', 'mực': 'hai_san',
    
    // Nướng
    'nướng': 'nuong', 'nuong': 'nuong', 'grill': 'nuong', 'bbq': 'bbq',
    
    // Tráng miệng
    'chè': 'trang_mieng', 'bánh': 'trang_mieng', 'kem': 'trang_mieng',
    'tráng miệng': 'trang_mieng', 'dessert': 'trang_mieng',
    
    // Đồ uống
    'nước': 'nuoc_uong', 'uống': 'nuoc_uong', 'drink': 'nuoc_uong',
    'trà': 'tra', 'cà phê': 'ca_phe', 'coffee': 'ca_phe',
    'bia': 'bia', 'beer': 'bia', 'nước ngọt': 'nuoc_ngot'
};


// ==================== PHÂN TÍCH CHAT (NLP) ====================

/**
 * Phân tích tin nhắn chat để trích xuất từ khóa và chủ đề
 */
function analyzeMessage(message) {
    const lowerMsg = message.toLowerCase();
    const keywords = [];
    const categories = new Set();
    
    // Tìm từ khóa trong tin nhắn
    for (const [keyword, category] of Object.entries(KEYWORD_CATEGORY_MAP)) {
        if (lowerMsg.includes(keyword)) {
            keywords.push(keyword);
            categories.add(category);
        }
    }
    
    // Phân tích intent
    const intents = {
        asking_menu: /thực đơn|menu|có gì|món gì|ăn gì/.test(lowerMsg),
        asking_price: /giá|bao nhiêu|tiền/.test(lowerMsg),
        asking_recommendation: /gợi ý|đề xuất|nên ăn|recommend/.test(lowerMsg),
        ordering: /đặt|order|mua|thêm vào/.test(lowerMsg),
        asking_combo: /combo|set|bộ|kèm/.test(lowerMsg)
    };
    
    return { keywords, categories: Array.from(categories), intents };
}

/**
 * Lấy lịch sử chat của user và phân tích
 */
async function getUserChatAnalysis(userId) {
    try {
        // Lấy 50 tin nhắn gần nhất của user
        const [messages] = await db.query(
            `SELECT noi_dung FROM lich_su_chatbot 
             WHERE ma_nguoi_dung = ? AND nguoi_gui = 'user'
             ORDER BY thoi_diem_chat DESC LIMIT 50`,
            [userId]
        );
        
        const allKeywords = [];
        const allCategories = new Set();
        const intentCounts = {
            asking_menu: 0,
            asking_price: 0,
            asking_recommendation: 0,
            ordering: 0,
            asking_combo: 0
        };
        
        for (const msg of messages) {
            const analysis = analyzeMessage(msg.noi_dung);
            allKeywords.push(...analysis.keywords);
            analysis.categories.forEach(c => allCategories.add(c));
            
            for (const [intent, value] of Object.entries(analysis.intents)) {
                if (value) intentCounts[intent]++;
            }
        }
        
        // Đếm tần suất từ khóa
        const keywordFrequency = {};
        for (const kw of allKeywords) {
            keywordFrequency[kw] = (keywordFrequency[kw] || 0) + 1;
        }
        
        // Sắp xếp theo tần suất
        const topKeywords = Object.entries(keywordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([kw, count]) => ({ keyword: kw, count }));
        
        return {
            topKeywords,
            categories: Array.from(allCategories),
            intents: intentCounts,
            totalMessages: messages.length
        };
    } catch (error) {
        console.error('Error analyzing user chat:', error.message);
        return null;
    }
}

// ==================== COLLABORATIVE FILTERING ====================

/**
 * Tìm người dùng tương tự dựa trên lịch sử mua hàng
 */
async function findSimilarUsers(userId, limit = 5) {
    try {
        // Lấy các món user đã mua
        const [userOrders] = await db.query(
            `SELECT DISTINCT ct.ma_mon 
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );
        
        if (userOrders.length === 0) return [];
        
        const userDishes = userOrders.map(o => o.ma_mon);
        
        // Tìm users khác đã mua các món tương tự
        const [similarUsers] = await db.query(
            `SELECT dh.ma_nguoi_dung, COUNT(DISTINCT ct.ma_mon) as common_dishes
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             WHERE ct.ma_mon IN (?) AND dh.ma_nguoi_dung != ? AND dh.ma_nguoi_dung IS NOT NULL
             GROUP BY dh.ma_nguoi_dung
             ORDER BY common_dishes DESC
             LIMIT ?`,
            [userDishes, userId, limit]
        );
        
        return similarUsers;
    } catch (error) {
        console.error('Error finding similar users:', error.message);
        return [];
    }
}

/**
 * Gợi ý món từ người dùng tương tự (Collaborative Filtering - HYBRID WITH PYTHON)
 * CẢI TIẾN: Đưa số sao vào vector sở thích để tăng độ chính xác
 */
async function getCollaborativeRecommendations(userId, limit = 5) {
    try {
        // [Cải tiến] Cố gắng gọi API qua mô hình Python SVD để tăng độ học sâu thay vì SQL đơn thuần
        try {
            const pythonResponse = await axios.get(PYTHON_API_URL, {
                params: { user_id: userId, limit: limit },
                timeout: 3000 // Tối đa 3 giây gọi API 
            });

            if (pythonResponse.data && pythonResponse.data.success && pythonResponse.data.data.length > 0) {
                // Parse IDs do Python trả về ([101, 204, ...])
                const recommendedItemIds = pythonResponse.data.data.map(i => i.item_id);
                console.log(`🤖 [Python ML] Hybrid Recommendation success cho User: ${userId}`, recommendedItemIds);
                
                // Fetch thông tin chi tiết các id này từ database MySQL 
                // CẢI TIẾN: Lọc theo số sao trung bình >= 3.0
                const query = `
                    SELECT m.*, d.ten_danh_muc, COALESCE(AVG(dg.so_sao), 4.0) as avg_rating
                    FROM mon_an m
                    LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                    LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                    WHERE m.ma_mon IN (?) AND m.trang_thai = 1
                    GROUP BY m.ma_mon
                    HAVING avg_rating >= 3.0
                    ORDER BY avg_rating DESC
                `;
                const [mlRecommendations] = await db.query(query, [recommendedItemIds]);
                
                // Format lại payload cho thẻ card HTML (index.html) như SQL logic truyền thống
                if (mlRecommendations.length > 0) {
                    return mlRecommendations.map(r => ({
                        ...r,
                        recommendation_type: 'collaborative',
                        reason: 'Được nhiều khách hàng có sở thích giống bạn yêu thích'
                    }));
                }
            } 
        } catch (pyErr) {
            console.log("⚠️ [Node.js] Không kết nối được đến Python ML Service. Tự động dùng fallback SQL Database.");
        }

        // --- FALLBACK (Chế độ dự phòng SQL Truyền thống do bạn viết) ---
        return await getSQLCollaborativeRecommendations(userId, limit);

    } catch (error) {
        console.error('Error getting collaborative recommendations:', error.message);
        return [];
    }
}

/**
 * Gợi ý SQL gốc nếu Python tạch (Fall-back plan)
 * CẢI TIẾN: 
 * - Tích hợp đánh giá số sao vào vector sở thích
 * - Lọc món có số sao >= 3.0 hoặc chưa đánh giá
 */
async function getSQLCollaborativeRecommendations(userId, limit = 5) {
    try {
        // 1. Tìm người dùng tương tự dựa trên hành vi mua hàng VÀ đánh giá
        const similarUsers = await findSimilarUsersWithRatings(userId);
        
        console.log(`🤝 [Collaborative] User ${userId}: Found ${similarUsers.length} similar users`);
        if (similarUsers.length > 0) {
            console.log(`   Top similar users:`, similarUsers.slice(0, 3).map(u => 
                `User ${u.ma_nguoi_dung} (similarity: ${(u.similarity * 100).toFixed(1)}%, common: ${u.common_dishes})`
            ).join(', '));
        }
        
        if (similarUsers.length === 0) {
            console.log(`   ⚠️ No similar users found, returning empty recommendations`);
            return [];
        }
        
        const similarUserIds = similarUsers.map(u => u.ma_nguoi_dung);
        
        // 2. Lấy các món user chưa mua nhưng users tương tự đã mua
        const [userOrders] = await db.query(
            `SELECT DISTINCT ct.ma_mon 
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );
        const userDishes = userOrders.map(o => o.ma_mon);
        console.log(`   User already purchased ${userDishes.length} dishes: [${userDishes.slice(0, 5).join(', ')}...]`);
        
        let query = `
            SELECT m.*, d.ten_danh_muc, COUNT(DISTINCT dh.ma_don_hang) as purchase_count,
                   COALESCE(AVG(dg.so_sao), 4.0) as avg_rating,
                   COUNT(dg.ma_danh_gia) as review_count
            FROM chi_tiet_don_hang ct
            JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
            JOIN mon_an m ON ct.ma_mon = m.ma_mon
            LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
            LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
            WHERE dh.ma_nguoi_dung IN (?) AND m.trang_thai = 1
        `;
        const params = [similarUserIds];
        
        if (userDishes.length > 0) {
            query += ` AND ct.ma_mon NOT IN (?)`;
            params.push(userDishes);
        }
        
        // CẢI TIẾN: Lọc món có đánh giá >= 3.0 hoặc chưa đánh giá (NULL)
        // COALESCE đã xử lý NULL thành 4.0, nên chỉ cần filter >= 3.0
        query += ` 
            GROUP BY m.ma_mon, m.ten_mon, d.ten_danh_muc, m.gia_tien, m.gia_khuyen_mai, m.don_vi_tinh, 
                     m.anh_mon, m.trang_thai, m.ma_danh_muc, m.so_luong_ton, m.mo_ta_chi_tiet, m.tu_khoa
            HAVING COUNT(DISTINCT dh.ma_nguoi_dung) >= 1 AND avg_rating >= 3.0
            ORDER BY avg_rating DESC, purchase_count DESC
            LIMIT ?
        `;
        params.push(limit);
        
        const [recommendations] = await db.query(query, params);
        
        console.log(`   ✅ Found ${recommendations.length} collaborative recommendations (filtered by rating >= 3.0)`);
        if (recommendations.length > 0) {
            console.log(`   Top dishes:`, recommendations.slice(0, 3).map(r => 
                `"${r.ten_mon}" (⭐${parseFloat(r.avg_rating).toFixed(1)}, ${r.purchase_count} orders)`
            ).join(', '));
        }
        
        return recommendations.map(r => ({
            ...r,
            recommendation_type: 'collaborative',
            reason: 'Món ngon bán chạy được các thực khách thân quen lựa chọn'
        }));
    } catch (error) {
        console.error('Error getting collaborative SQL recommendations:', error.message);
        return [];
    }
}

/**
 * Tìm người dùng tương tự dựa trên lịch sử mua hàng VÀ đánh giá số sao
 * CẢI TIẾN: Đưa số sao vào vector sở thích
 */
async function findSimilarUsersWithRatings(userId, limit = 5) {
    try {
        // Lấy vector sở thích của user (món ăn + đánh giá)
        const [userVector] = await db.query(
            `SELECT 
                ct.ma_mon,
                COALESCE(dg.so_sao, 3) as rating
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             LEFT JOIN danh_gia_san_pham dg ON dg.ma_mon = ct.ma_mon AND dg.ma_nguoi_dung = ?
             WHERE dh.ma_nguoi_dung = ?`,
            [userId, userId]
        );
        
        if (userVector.length === 0) return [];
        
        // Tạo map điểm số sở thích: >=4 sao = +1, <=2 sao = -1
        const userPreferenceMap = {};
        userVector.forEach(item => {
            const rating = Number(item.rating);
            if (rating >= 4) {
                userPreferenceMap[item.ma_mon] = 1.5;
            } else if (rating <= 2) {
                userPreferenceMap[item.ma_mon] = -1.5;
            } else {
                userPreferenceMap[item.ma_mon] = 0.25;
            }
        });
        
        const userDishes = Object.keys(userPreferenceMap).map(Number);
        
        // Tìm users khác có món tương tự
        const [similarUsers] = await db.query(
            `SELECT 
                dh.ma_nguoi_dung, 
                ct.ma_mon,
                COALESCE(dg.so_sao, 3) as rating
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             LEFT JOIN danh_gia_san_pham dg ON dg.ma_mon = ct.ma_mon AND dg.ma_nguoi_dung = dh.ma_nguoi_dung
             WHERE ct.ma_mon IN (?) AND dh.ma_nguoi_dung != ? AND dh.ma_nguoi_dung IS NOT NULL
             GROUP BY dh.ma_nguoi_dung, ct.ma_mon, dg.so_sao`,
            [userDishes, userId]
        );
        
        // Tính cosine similarity dựa trên sở thích (rating-weighted)
        const userSimilarities = {};
        similarUsers.forEach(row => {
            const otherId = row.ma_nguoi_dung;
            if (!userSimilarities[otherId]) {
                userSimilarities[otherId] = { dotProduct: 0, normOther: 0, count: 0 };
            }
            
            const rating = Number(row.rating);
            let otherScore = 0.25;
            if (rating >= 4) {
                otherScore = 1.5;
            } else if (rating <= 2) {
                otherScore = -1.5;
            }
            
            const userScore = userPreferenceMap[row.ma_mon] || 0;
            userSimilarities[otherId].dotProduct += userScore * otherScore;
            userSimilarities[otherId].normOther += otherScore * otherScore;
            userSimilarities[otherId].count++;
        });
        
        // Tính norm của user vector
        let normUser = 0;
        Object.values(userPreferenceMap).forEach(score => {
            normUser += score * score;
        });
        normUser = Math.sqrt(normUser);
        
        // Tính similarity score
        const results = [];
        Object.entries(userSimilarities).forEach(([otherId, data]) => {
            const normOther = Math.sqrt(data.normOther);
            const similarity = normUser === 0 || normOther === 0 ? 0 : data.dotProduct / (normUser * normOther);
            if (similarity > 0) {
                results.push({
                    ma_nguoi_dung: parseInt(otherId),
                    similarity: similarity,
                    common_dishes: data.count
                });
            }
        });
        
        results.sort((a, b) => b.similarity - a.similarity);
        return results.slice(0, limit);
    } catch (error) {
        console.error('Error finding similar users with ratings:', error.message);
        return [];
    }
}


// ==================== CONTENT-BASED FILTERING ====================

/**
 * Gợi ý món dựa trên nội dung (danh mục, giá, đặc điểm)
 * CẢI TIẾN: 
 * - Ưu tiên sở thích khẩu vị từ bảng so_thich_khau_vi_nguoi_dung
 * - Sắp xếp ưu tiên món có đánh giá cao (>=3.0 sao)
 * - Ưu tiên món có giá gần với giá trung bình user thường mua
 */
async function getContentBasedRecommendations(userId, limit = 5, preferredFlavorIds = null) {
    try {
        let favoriteFlavors = preferredFlavorIds;
        
        if (!favoriteFlavors || favoriteFlavors.length === 0) {
            // 1. Lấy sở thích khẩu vị từ bảng so_thich_khau_vi_nguoi_dung (ưu tiên cao nhất)
            const [explicitPrefs] = await db.query(
                `SELECT id_thuoc_tinh FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?`,
                [userId]
            );
            favoriteFlavors = explicitPrefs.map(p => p.id_thuoc_tinh);
        }
        
        // 2. Nếu không có sở thích rõ ràng, phân tích từ lịch sử mua hàng
        if (favoriteFlavors.length === 0) {
            // Lấy các khẩu vị từ món đã mua nhiều nhất
            const [userPreferences] = await db.query(
                `SELECT mk.id_thuoc_tinh, COUNT(*) as purchase_count
                 FROM chi_tiet_don_hang ct
                 JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
                 JOIN mon_an_khau_vi mk ON ct.ma_mon = mk.ma_mon
                 WHERE dh.ma_nguoi_dung = ?
                 GROUP BY mk.id_thuoc_tinh
                 ORDER BY purchase_count DESC`,
                [userId]
            );
            favoriteFlavors = userPreferences.slice(0, 3).map(p => p.id_thuoc_tinh);
        }
        
        // 3. Lấy giá trung bình người dùng hay mua
        const [priceStats] = await db.query(
            `SELECT AVG(m.gia_tien) as avg_price
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             JOIN mon_an m ON ct.ma_mon = m.ma_mon
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );
        const avgPrice = priceStats[0]?.avg_price || 150000; // Default 150k
        
        // 4. Lấy các món user chưa mua
        const [userOrders] = await db.query(
            `SELECT DISTINCT ct.ma_mon 
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );
        const userDishes = userOrders.map(o => o.ma_mon);
        
        let recommendations = [];
        if (favoriteFlavors.length > 0) {
            let query = `
                SELECT m.*, d.ten_danh_muc, AVG(dg.so_sao) as avg_rating,
                       COUNT(dg.ma_danh_gia) as review_count,
                       GROUP_CONCAT(DISTINCT f.ten_thuoc_tinh SEPARATOR ', ') as flavor_names
                FROM mon_an m
                LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
                LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
                LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                WHERE m.trang_thai = 1 AND mk.id_thuoc_tinh IN (?)
            `;
            const params = [favoriteFlavors];
            
            if (userDishes.length > 0) {
                query += ` AND m.ma_mon NOT IN (?)`;
                params.push(userDishes);
            }
            
            // CẢI TIẾN: Sắp xếp ưu tiên đánh giá cao trước, sau đó đến giá phù hợp
            query += ` GROUP BY m.ma_mon 
                       HAVING avg_rating IS NULL OR avg_rating >= 3.0
                       ORDER BY COALESCE(avg_rating, 4.0) DESC, ABS(m.gia_tien - ?) ASC
                       LIMIT ?`;
            params.push(avgPrice, limit * 2);
            
            const [res] = await db.query(query, params);
            recommendations = res;
        }
        
        // Nếu không đủ món, lấy thêm món chung
        if (recommendations.length < limit) {
            const excludedIds = [...userDishes, ...recommendations.map(r => r.ma_mon)];
            let query = `
                SELECT m.*, d.ten_danh_muc, AVG(dg.so_sao) as avg_rating
                FROM mon_an m
                LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                WHERE m.trang_thai = 1
            `;
            const params = [];
            if (excludedIds.length > 0) {
                query += ` AND m.ma_mon NOT IN (?)`;
                params.push(excludedIds);
            }
            // CẢI TIẾN: Lọc món có đánh giá >= 3.0 hoặc chưa đánh giá
            query += ` GROUP BY m.ma_mon 
                       HAVING avg_rating IS NULL OR avg_rating >= 3.0
                       ORDER BY COALESCE(avg_rating, 4.0) DESC 
                       LIMIT ?`;
            params.push(limit - recommendations.length);
            
            const [extra] = await db.query(query, params);
            recommendations.push(...extra);
        }
        
        return recommendations.slice(0, limit).map(r => {
            const reason = r.flavor_names 
                ? `Hợp khẩu vị của bạn (${r.flavor_names})` 
                : (r.ten_danh_muc ? `Món ngon từ danh mục ${r.ten_danh_muc}` : 'Đề xuất cho bạn');
            return {
                ...r,
                recommendation_type: 'content_based',
                reason: reason
            };
        });
    } catch (error) {
        console.error('Error getting content-based recommendations:', error.message);
        return [];
    }
}

// ==================== ASSOCIATION RULES (Kết hợp món) ====================

/**
 * Gợi ý món kèm theo dựa trên quy tắc kết hợp (Apriori AI Service + Fallback rules)
 */
async function getPairingRecommendations(dishIds, limit = 4) {
    try {
        if (!dishIds || dishIds.length === 0) return [];
        
        let aiRecommendedIds = [];
        
        // Gọi Apriori API từ Python
        try {
            const response = await axios.get(PYTHON_APRIORI_URL, {
                params: {
                    cart: dishIds.join(','),
                    limit: limit
                },
                timeout: 3000
            });
            
            if (response.data && response.data.success && response.data.data.length > 0) {
                // response.data.data looks like: [{ item_id: 101, score: 0.8 }, ...]
                aiRecommendedIds = response.data.data.map(item => item.item_id);
            }
        } catch (apiError) {
            console.error('Python Apriori API Error - Fallback to hardcoded rules:', apiError.message);
        }

        let recommendations = [];

        // Nếu có kết quả từ AI, fetch thông tin các món đó
        if (aiRecommendedIds.length > 0) {
            const [aiFoods] = await db.query(
                `SELECT m.*, d.ten_danh_muc 
                 FROM mon_an m 
                 LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                 WHERE m.ma_mon IN (?) AND m.trang_thai = 1`,
                [aiRecommendedIds]
            );
            
            recommendations.push(...aiFoods.map(d => ({
                ...d,
                recommendation_type: 'apriori_pairing',
                reason: '💡 Món kèm thường được đặt chung!'
            })));
        }

        // Nếu số lượng AI gợi ý chưa đủ limit, bù thêm từ hardcoded Rules
        if (recommendations.length < limit) {
        
            // Lấy thông tin các món trong giỏ hàng
            const [cartDishes] = await db.query(
                `SELECT m.*, d.ten_danh_muc 
                 FROM mon_an m 
                 LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                 WHERE m.ma_mon IN (?)`,
                [dishIds]
            );
        
        // Phân tích các món trong giỏ để tìm category
        const cartCategories = new Set();
        for (const dish of cartDishes) {
            const dishName = dish.ten_mon.toLowerCase();
            for (const [keyword, category] of Object.entries(KEYWORD_CATEGORY_MAP)) {
                if (dishName.includes(keyword)) {
                    cartCategories.add(category);
                }
            }
            // Thêm category từ danh mục
            if (dish.ten_danh_muc) {
                const catName = dish.ten_danh_muc.toLowerCase();
                if (catName.includes('lẩu')) cartCategories.add('lau');
                if (catName.includes('uống') || catName.includes('nước')) cartCategories.add('nuoc_uong');
                if (catName.includes('tráng miệng')) cartCategories.add('trang_mieng');
                if (catName.includes('khai vị')) cartCategories.add('khai_vi');
            }
        }
        
        // Tìm các category nên kết hợp
        const suggestedCategories = new Set();
        for (const cat of cartCategories) {
            const pairings = FOOD_PAIRING_RULES[cat] || [];
            pairings.forEach(p => suggestedCategories.add(p));
        }
        
        // Nếu có lẩu, ưu tiên gợi ý nước uống
        const hasLau = Array.from(cartCategories).some(c => c.includes('lau'));
        
        // Lấy món từ các category được gợi ý
        let remainingLimit = limit - recommendations.length;
        
        // Ưu tiên đồ uống nếu có lẩu
        if (remainingLimit > 0 && (hasLau || suggestedCategories.has('nuoc_uong'))) {
            const [drinks] = await db.query(
                `SELECT m.*, d.ten_danh_muc, 'Kết hợp hoàn hảo với món lẩu' as reason
                 FROM mon_an m
                 LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                 WHERE m.trang_thai = 1 
                 AND (d.ten_danh_muc LIKE '%uống%' OR d.ten_danh_muc LIKE '%nước%' 
                      OR m.ten_mon LIKE '%nước%' OR m.ten_mon LIKE '%trà%' 
                      OR m.ten_mon LIKE '%cà phê%' OR m.ten_mon LIKE '%sinh tố%')
                 AND m.ma_mon NOT IN (?)
                 ORDER BY RAND() LIMIT ?`,
                [dishIds, Math.min(2, remainingLimit)]
            );
            recommendations.push(...drinks.map(d => ({
                ...d,
                recommendation_type: 'pairing',
                reason: hasLau ? '🍲 Kết hợp hoàn hảo với món lẩu!' : '🥤 Thêm đồ uống cho bữa ăn'
            })));
            remainingLimit -= drinks.length;
        }
        
        // Gợi ý món tráng miệng
        if (remainingLimit > 0 && suggestedCategories.has('trang_mieng')) {
            const [desserts] = await db.query(
                `SELECT m.*, d.ten_danh_muc
                 FROM mon_an m
                 LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                 WHERE m.trang_thai = 1 
                 AND (d.ten_danh_muc LIKE '%tráng miệng%' OR m.ten_mon LIKE '%chè%' 
                      OR m.ten_mon LIKE '%bánh%' OR m.ten_mon LIKE '%kem%')
                 AND m.ma_mon NOT IN (?)
                 ORDER BY RAND() LIMIT ?`,
                [dishIds, Math.min(2, remainingLimit)]
            );
            recommendations.push(...desserts.map(d => ({
                ...d,
                recommendation_type: 'pairing',
                reason: '🍮 Tráng miệng hoàn hảo sau bữa ăn'
            })));
            remainingLimit -= desserts.length;
        }
        
        // Gợi ý khai vị nếu chưa có
        if (remainingLimit > 0 && suggestedCategories.has('khai_vi')) {
            const [appetizers] = await db.query(
                `SELECT m.*, d.ten_danh_muc
                 FROM mon_an m
                 LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                 WHERE m.trang_thai = 1 
                 AND (d.ten_danh_muc LIKE '%khai vị%' OR m.ten_mon LIKE '%gỏi%' 
                      OR m.ten_mon LIKE '%cuốn%' OR m.ten_mon LIKE '%nem%')
                 AND m.ma_mon NOT IN (?)
                 ORDER BY RAND() LIMIT ?`,
                [dishIds, Math.min(2, remainingLimit)]
            );
            recommendations.push(...appetizers.map(d => ({
                ...d,
                recommendation_type: 'pairing',
                reason: '🥗 Khai vị ngon miệng'
            })));
        }
        
        } // Hết khối Fallback

        return recommendations.slice(0, limit);
    } catch (error) {
        console.error('Error getting pairing recommendations:', error.message);
        return [];
    }
}


// ==================== CHAT-BASED RECOMMENDATIONS ====================

/**
 * Gợi ý món dựa trên phân tích chat của user
 */
async function getChatBasedRecommendations(userId, limit = 5) {
    try {
        const chatAnalysis = await getUserChatAnalysis(userId);
        if (!chatAnalysis || chatAnalysis.topKeywords.length === 0) return [];
        
        // Lấy categories từ chat analysis
        const categories = chatAnalysis.categories;
        if (categories.length === 0) return [];
        
        // Map categories sang danh mục trong DB
        const categoryMapping = {
            'lau': '%lẩu%',
            'lau_mam': '%lẩu%',
            'lau_thai': '%lẩu%',
            'com': '%chính%',
            'bun': '%chính%',
            'pho': '%chính%',
            'mi': '%chính%',
            'tom': '%hải sản%',
            'ca': '%hải sản%',
            'hai_san': '%hải sản%',
            'nuong': '%nướng%',
            'trang_mieng': '%tráng miệng%',
            'nuoc_uong': '%uống%',
            'tra': '%uống%',
            'ca_phe': '%uống%'
        };
        
        // Tạo điều kiện tìm kiếm
        const searchPatterns = categories
            .map(c => categoryMapping[c])
            .filter(Boolean);
        
        if (searchPatterns.length === 0) return [];
        
        // Tìm món phù hợp với từ khóa chat
        const keywordPatterns = chatAnalysis.topKeywords
            .slice(0, 5)
            .map(k => `%${k.keyword}%`);
        
        let query = `
            SELECT DISTINCT m.*, d.ten_danh_muc, 
                   AVG(dg.so_sao) as avg_rating,
                   COUNT(dg.ma_danh_gia) as review_count
            FROM mon_an m
            LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
            LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
            WHERE m.trang_thai = 1 AND (
        `;
        
        const conditions = [];
        const params = [];
        
        // Tìm theo danh mục
        for (const pattern of searchPatterns) {
            conditions.push(`d.ten_danh_muc LIKE ?`);
            params.push(pattern);
        }
        
        // Tìm theo tên món
        for (const pattern of keywordPatterns) {
            conditions.push(`m.ten_mon LIKE ?`);
            params.push(pattern);
        }
        
        query += conditions.join(' OR ') + `)
            GROUP BY m.ma_mon
            ORDER BY avg_rating DESC, review_count DESC
            LIMIT ?`;
        params.push(limit);
        
        const [recommendations] = await db.query(query, params);
        
        // Thêm lý do gợi ý
        const topKeyword = chatAnalysis.topKeywords[0]?.keyword || 'sở thích';
        return recommendations.map(r => ({
            ...r,
            recommendation_type: 'chat_based',
            reason: `💬 Dựa trên cuộc trò chuyện của bạn về "${topKeyword}"`
        }));
    } catch (error) {
        console.error('Error getting chat-based recommendations:', error.message);
        return [];
    }
}

// ==================== TRENDING & POPULAR ====================

/**
 * Lấy món ăn đang trending (bán chạy gần đây)
 */
async function getTrendingDishes(limit = 5) {
    try {
        const [trending] = await db.query(
            `SELECT m.*, d.ten_danh_muc, 
                    COUNT(ct.ma_ct_don) as order_count,
                    AVG(dg.so_sao) as avg_rating
             FROM mon_an m
             LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
             LEFT JOIN chi_tiet_don_hang ct ON m.ma_mon = ct.ma_mon
             LEFT JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang 
                   AND dh.thoi_gian_tao >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
             WHERE m.trang_thai = 1
             GROUP BY m.ma_mon
             ORDER BY order_count DESC, avg_rating DESC
             LIMIT ?`,
            [limit]
        );
        
        return trending.map(t => ({
            ...t,
            recommendation_type: 'trending',
            reason: '🔥 Đang được nhiều người đặt trong tuần này'
        }));
    } catch (error) {
        console.error('Error getting trending dishes:', error.message);
        return [];
    }
}

/**
 * Lấy món được đánh giá cao nhất
 */
async function getTopRatedDishes(limit = 5) {
    try {
        const [topRated] = await db.query(
            `SELECT m.*, d.ten_danh_muc,
                    AVG(dg.so_sao) as avg_rating,
                    COUNT(dg.ma_danh_gia) as review_count
             FROM mon_an m
             LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
             LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
             WHERE m.trang_thai = 1
             GROUP BY m.ma_mon
             HAVING review_count >= 1
             ORDER BY avg_rating DESC, review_count DESC
             LIMIT ?`,
            [limit]
        );
        
        return topRated.map(t => ({
            ...t,
            recommendation_type: 'top_rated',
            reason: `⭐ Được đánh giá ${parseFloat(t.avg_rating || 0).toFixed(1)}/5 sao`
        }));
    } catch (error) {
        console.error('Error getting top rated dishes:', error.message);
        return [];
    }
}


// ==================== API ENDPOINTS ====================

/**
 * API: Gợi ý tổng hợp cho user (trang chủ, thực đơn)
 * GET /api/recommendations
 */
router.get('/', async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        const limit = parseInt(req.query.limit) || 50; // Tăng limit để có đủ món cho trang thực đơn
        
        let recommendations = [];
        
        if (userId) {
            // 1. Lấy sở thích khẩu vị rõ ràng của người dùng (từ khảo sát/cold start)
            const [explicitPrefs] = await db.query(
                `SELECT id_thuoc_tinh FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?`,
                [userId]
            );
            const explicitFlavorIds = explicitPrefs.map(p => p.id_thuoc_tinh);

            // 2. Thống kê hành vi click chuột từ DB (học ngầm sở thích dài hạn - Shopee style)
            let implicitFlavorIds = [];
            try {
                const [implicitPrefs] = await db.query(`
                    SELECT mk.id_thuoc_tinh, COUNT(h.id) as click_count
                    FROM hanh_vi_nguoi_dung h
                    JOIN mon_an_khau_vi mk ON h.ma_mon = mk.ma_mon
                    WHERE h.ma_nguoi_dung = ? AND h.hanh_vi IN ('click', 'view')
                    GROUP BY mk.id_thuoc_tinh
                    HAVING click_count >= 5
                `, [userId]);
                implicitFlavorIds = implicitPrefs.map(p => p.id_thuoc_tinh);
            } catch (dbErr) {
                console.error('Error learning implicit flavor preferences:', dbErr.message);
            }

            // Gộp cả 2 nguồn sở thích (Khao sát + Học ngầm từ click DB)
            const preferredFlavorIds = [...new Set([...explicitFlavorIds, ...implicitFlavorIds])];
            console.log(`🎯 [ML Preference Profile] User ${userId}: Explicit=[${explicitFlavorIds.join(',')}], Implicit Clicks=[${implicitFlavorIds.join(',')}]`);

            // User đã đăng nhập - sử dụng ML recommendations
            const [contentBased, chatBased, collaborative] = await Promise.all([
                getContentBasedRecommendations(userId, Math.ceil(limit * 0.4), preferredFlavorIds), // 40% từ sở thích (giảm từ 50%)
                getChatBasedRecommendations(userId, Math.ceil(limit * 0.2)),    // 20% từ chat
                getCollaborativeRecommendations(userId, Math.ceil(limit * 0.4)) // 40% từ collaborative (tăng từ 30%)
            ]);
            
            // Gán điểm ưu tiên (score) cho từng loại gợi ý
            contentBased.forEach((item, index) => {
                item.score = 100 - index;
            });
            
            chatBased.forEach((item, index) => {
                item.score = 89 - index;
            });
            
            // CẢI TIẾN: Tăng score của collaborative để cạnh tranh với content-based
            collaborative.forEach((item, index) => {
                item.score = 95 - index;  // Tăng từ 79 → 95 (gần bằng content-based)
            });

            // ================================================================
            // XỬ LÝ BOOST KHẨU VỊ THEO PHIÊN TRUY CẬP (SESSION CLICK DETECT >= 5)
            // ================================================================
            let sessionBoostFlavors = [];
            if (req.query.session_boost_flavors) {
                sessionBoostFlavors = req.query.session_boost_flavors.split(',')
                    .map(id => parseInt(id.trim()))
                    .filter(id => !isNaN(id));
            }

            let directBoostedDishes = [];
            if (sessionBoostFlavors.length > 0) {
                try {
                    // 1. Lấy tất cả món ăn tương ứng với các khẩu vị được xem nhiều
                    const [boostedDishes] = await db.query(
                        `SELECT DISTINCT ma_mon FROM mon_an_khau_vi WHERE id_thuoc_tinh IN (?)`,
                        [sessionBoostFlavors]
                    );
                    const boostedDishSet = new Set(boostedDishes.map(d => d.ma_mon));
                    
                    contentBased.forEach(item => {
                        if (boostedDishSet.has(item.ma_mon)) {
                            item.score = (item.score || 0) + 200;
                            item.reason = `🔥 Phù hợp với món ăn bạn đang quan tâm lúc này`;
                        }
                    });
                    chatBased.forEach(item => {
                        if (boostedDishSet.has(item.ma_mon)) {
                            item.score = (item.score || 0) + 200;
                            item.reason = `🔥 Phù hợp với món ăn bạn đang quan tâm lúc này`;
                        }
                    });
                    collaborative.forEach(item => {
                        if (boostedDishSet.has(item.ma_mon)) {
                            item.score = (item.score || 0) + 200;
                            item.reason = `🔥 Phù hợp với món ăn bạn đang quan tâm lúc này`;
                        }
                    });

                    // 2. Truy vấn trực tiếp các món tiêu biểu của nhóm khẩu vị này để đưa trực tiếp vào
                    const [directDishes] = await db.query(`
                        SELECT m.*, d.ten_danh_muc, COALESCE(AVG(dg.so_sao), 5) as avg_rating,
                               GROUP_CONCAT(DISTINCT f.ten_thuoc_tinh SEPARATOR ', ') as flavor_names
                        FROM mon_an m
                        LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                        JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
                        LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
                        LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                        WHERE m.trang_thai = 1 AND mk.id_thuoc_tinh IN (?)
                        GROUP BY m.ma_mon
                        ORDER BY avg_rating DESC
                        LIMIT 10
                    `, [sessionBoostFlavors]);

                    directDishes.forEach((item, index) => {
                        item.score = 300 - index; // Điểm tuyệt đối cao nhất
                        item.recommendation_type = 'content_based';
                        item.reason = `🔥 Phù hợp với món ăn bạn đang quan tâm lúc này`;
                    });
                    directBoostedDishes = directDishes;
                } catch (boostErr) {
                    console.error('Error applying session flavor boost:', boostErr.message);
                }
            }
            
            // Lọc các đề xuất theo khẩu vị (kết hợp Khảo sát + Session Boost)
            const allowedFilterFlavors = [...new Set([...preferredFlavorIds, ...sessionBoostFlavors])];
            if (allowedFilterFlavors.length > 0) {
                // Lấy các món ăn có chứa khẩu vị được chọn
                const [flavorDishes] = await db.query(
                    `SELECT DISTINCT ma_mon FROM mon_an_khau_vi WHERE id_thuoc_tinh IN (?)`,
                    [allowedFilterFlavors]
                );
                const matchingDishIds = new Set(flavorDishes.map(fd => fd.ma_mon));
                
                const filteredContent = contentBased.filter(r => matchingDishIds.has(r.ma_mon));
                const filteredChat = chatBased.filter(r => matchingDishIds.has(r.ma_mon));
                
                // CẢI TIẾN: Nếu sau khi lọc không còn đủ món, bổ sung thêm các món khác với score thấp hơn
                const filteredCount = filteredContent.length + filteredChat.length + collaborative.length;
                console.log(`🎯 [Filter Debug] User ${userId}: filteredContent=${filteredContent.length}, filteredChat=${filteredChat.length}, collaborative=${collaborative.length}, total=${filteredCount}`);
                
                if (filteredCount < 15) {  // Giảm từ 20 → 15 để vừa đủ
                    console.log(`⚠️ [Recommendation] Chỉ có ${filteredCount} món sau khi lọc khẩu vị. Bổ sung thêm các món khác...`);
                    // Bổ sung các món không match khẩu vị nhưng có score cao (giảm score xuống 75% thay vì 60%)
                    const nonMatchedContent = contentBased
                        .filter(r => !matchingDishIds.has(r.ma_mon))
                        .map(r => ({ ...r, score: (r.score || 0) * 0.75, reason: r.reason + ' (Gợi ý đa dạng)' }));
                    const nonMatchedChat = chatBased
                        .filter(r => !matchingDishIds.has(r.ma_mon))
                        .map(r => ({ ...r, score: (r.score || 0) * 0.75, reason: r.reason + ' (Gợi ý đa dạng)' }));
                    
                    recommendations = [
                        ...directBoostedDishes, 
                        ...filteredContent, 
                        ...filteredChat, 
                        ...collaborative,
                        ...nonMatchedContent.slice(0, 8),  // Giảm từ 10 → 8 món
                        ...nonMatchedChat.slice(0, 8)
                    ];
                } else {
                    recommendations = [...directBoostedDishes, ...filteredContent, ...filteredChat, ...collaborative];
                }
            } else {
                recommendations = [...directBoostedDishes, ...contentBased, ...chatBased, ...collaborative];
            }
            
            // Loại trùng lặp (giữ item có score cao nhất)
            const seen = new Set();
            recommendations = recommendations.filter(r => {
                if (seen.has(r.ma_mon)) return false;
                seen.add(r.ma_mon);
                return true;
            });
            
            console.log(`✨ [Recommendation] User ${userId}: ${contentBased.length} content-based, ${chatBased.length} chat-based, ${collaborative.length} collaborative. Total (deduped): ${recommendations.length} recommendations.`);
            
            // Nếu không đủ, bổ sung các món khác phù hợp khẩu vị của người dùng
            if (recommendations.length < limit && preferredFlavorIds.length > 0) {
                const excludedIds = recommendations.map(r => r.ma_mon);
                const query = `
                    SELECT m.*, d.ten_danh_muc, AVG(dg.so_sao) as avg_rating,
                           GROUP_CONCAT(DISTINCT f.ten_thuoc_tinh SEPARATOR ', ') as flavor_names
                    FROM mon_an m
                    LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                    JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
                    LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
                    LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                    WHERE m.trang_thai = 1 AND mk.id_thuoc_tinh IN (?) ${excludedIds.length > 0 ? 'AND m.ma_mon NOT IN (?)' : ''}
                    GROUP BY m.ma_mon
                    ORDER BY avg_rating DESC
                    LIMIT ?
                `;
                const params = excludedIds.length > 0 
                    ? [preferredFlavorIds, excludedIds, limit - recommendations.length]
                    : [preferredFlavorIds, limit - recommendations.length];
                
                const [extraDishes] = await db.query(query, params);
                if (extraDishes.length > 0) {
                    extraDishes.forEach((item, index) => {
                        item.score = 69 - index;
                        item.recommendation_type = 'content_based';
                        item.reason = `Phù hợp với khẩu vị của bạn (${item.flavor_names || 'Khẩu vị yêu thích'})`;
                    });
                    recommendations.push(...extraDishes);
                }
            }

            // Nếu vẫn không đủ (hoặc không có sở thích rõ ràng), bổ sung trending
            if (recommendations.length < limit) {
                const excludedIds = recommendations.map(r => r.ma_mon);
                const trendingLimit = limit - recommendations.length;
                
                let trending = [];
                if (preferredFlavorIds.length > 0) {
                    const query = `
                        SELECT m.*, d.ten_danh_muc, COUNT(ct.ma_ct_don) as order_count, AVG(dg.so_sao) as avg_rating,
                               GROUP_CONCAT(DISTINCT f.ten_thuoc_tinh SEPARATOR ', ') as flavor_names
                        FROM mon_an m
                        LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                        JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
                        LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
                        LEFT JOIN chi_tiet_don_hang ct ON m.ma_mon = ct.ma_mon
                        LEFT JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang AND dh.thoi_gian_tao >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                        LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                        WHERE m.trang_thai = 1 AND mk.id_thuoc_tinh IN (?) ${excludedIds.length > 0 ? 'AND m.ma_mon NOT IN (?)' : ''}
                        GROUP BY m.ma_mon
                        ORDER BY order_count DESC, avg_rating DESC
                        LIMIT ?
                    `;
                    const params = excludedIds.length > 0 ? [preferredFlavorIds, excludedIds, trendingLimit] : [preferredFlavorIds, trendingLimit];
                    const [res] = await db.query(query, params);
                    trending = res.map(t => ({
                        ...t,
                        reason: `Phù hợp với khẩu vị của bạn (${t.flavor_names || 'Khẩu vị yêu thích'})`
                    }));
                }
                
                // Nếu vẫn thiếu, lấy trending chung
                if (trending.length < trendingLimit) {
                    const finalTrendingLimit = trendingLimit - trending.length;
                    const finalExcludedIds = [...excludedIds, ...trending.map(t => t.ma_mon)];
                    const query = `
                        SELECT m.*, d.ten_danh_muc, COUNT(ct.ma_ct_don) as order_count, AVG(dg.so_sao) as avg_rating
                        FROM mon_an m
                        LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                        LEFT JOIN chi_tiet_don_hang ct ON m.ma_mon = ct.ma_mon
                        LEFT JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang AND dh.thoi_gian_tao >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                        LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                        WHERE m.trang_thai = 1 ${finalExcludedIds.length > 0 ? 'AND m.ma_mon NOT IN (?)' : ''}
                        GROUP BY m.ma_mon
                        ORDER BY order_count DESC, avg_rating DESC
                        LIMIT ?
                    `;
                    const params = finalExcludedIds.length > 0 ? [finalExcludedIds, finalTrendingLimit] : [finalTrendingLimit];
                    const [res] = await db.query(query, params);
                    trending.push(...res);
                }

                trending.forEach((item, index) => {
                    item.score = 59 - index;
                    if (!item.recommendation_type) {
                        item.recommendation_type = 'trending';
                        item.reason = '🔥 Đang được nhiều người đặt trong tuần này';
                    }
                });
                recommendations.push(...trending);
            }
        } else {
            // Guest - chỉ hiển thị trending và top rated
            const [trending, topRated] = await Promise.all([
                getTrendingDishes(Math.ceil(limit / 2)),
                getTopRatedDishes(Math.floor(limit / 2))
            ]);
            
            trending.forEach((item, index) => {
                item.score = 50 - index;
            });
            
            topRated.forEach((item, index) => {
                item.score = 30 - index;
            });
            
            recommendations = [...trending, ...topRated];
        }
        
        // Loại bỏ trùng lặp (giữ món có score cao hơn)
        const uniqueRecommendations = [];
        const seenIds = new Map();
        for (const rec of recommendations) {
            const existingScore = seenIds.get(rec.ma_mon);
            if (!existingScore || rec.score > existingScore) {
                if (existingScore) {
                    // Xóa món cũ có score thấp hơn
                    const index = uniqueRecommendations.findIndex(r => r.ma_mon === rec.ma_mon);
                    if (index !== -1) uniqueRecommendations.splice(index, 1);
                }
                seenIds.set(rec.ma_mon, rec.score);
                uniqueRecommendations.push(rec);
            }
        }
        
        // Sắp xếp theo score giảm dần
        uniqueRecommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        res.json({
            success: true,
            data: uniqueRecommendations.slice(0, limit),
            meta: {
                user_logged_in: !!userId,
                total: uniqueRecommendations.length,
                breakdown: {
                    content_based: recommendations.filter(r => r.recommendation_type === 'content_based').length,
                    chat_based: recommendations.filter(r => r.recommendation_type === 'chat_based').length,
                    collaborative: recommendations.filter(r => r.recommendation_type === 'collaborative').length,
                    trending: recommendations.filter(r => r.recommendation_type === 'trending').length
                }
            }
        });
    } catch (error) {
        console.error('Error getting recommendations:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy gợi ý' });
    }
});

/**
 * API: Lưu sở thích người dùng (Cold Start)
 * POST /api/recommendations/preferences
 */
// API: Lưu cấu hình sở thích (sau khi sửa popup -> Lưu Khẩu Vị)
router.post('/preferences', async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { flavorIds } = req.body; 
        
        // 1. Lưu khẩu vị
        if (flavorIds && Array.isArray(flavorIds) && flavorIds.length > 0) {
            await db.query('DELETE FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?', [userId]);
            const values = flavorIds.map(fid => [userId, fid]);
            await db.query('INSERT IGNORE INTO so_thich_khau_vi_nguoi_dung (ma_nguoi_dung, id_thuoc_tinh) VALUES ?', [values]);
        }

        res.json({ success: true, message: 'Lưu cấu hình cá nhân hóa thành công' });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * API: Kiểm tra xem người dùng đã thiết lập sở thích chưa
 * GET /api/recommendations/check-preferences
 */
router.get('/check-preferences', async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        if (!userId) return res.json({ success: true, hasPreferences: false }); // Guest

        // BẮT BUỘC TẤT CẢ USER LÀM LẠI KHẢO SÁT THEO KHẨU VỊ (Check bảng mới)
        const [flavorRows] = await db.query(
            'SELECT COUNT(*) as count FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?',
            [userId]
        );
        
        const hasPrefs = flavorRows[0].count > 0;
        res.json({ success: true, hasPreferences: hasPrefs });
    } catch (error) {
        console.error('Error checking preferences:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * API: Gợi ý món kèm theo (cho giỏ hàng, thanh toán)
 * POST /api/recommendations/pairing
 * Body: { dish_ids: [1, 2, 3] }
 */
router.post('/pairing', async (req, res) => {
    try {
        const { dish_ids } = req.body;
        
        if (!dish_ids || !Array.isArray(dish_ids) || dish_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách món ăn'
            });
        }
        
        const recommendations = await getPairingRecommendations(dish_ids, 4);
        
        res.json({
            success: true,
            data: recommendations,
            meta: {
                cart_items: dish_ids.length,
                suggestions: recommendations.length
            }
        });
    } catch (error) {
        console.error('Error getting pairing recommendations:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy gợi ý kết hợp' });
    }
});

/**
 * API: Gợi ý cho chatbot (dựa trên tin nhắn hiện tại)
 * POST /api/recommendations/chat
 * Body: { message: "tôi muốn ăn lẩu" }
 */
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const userId = getUserFromToken(req);
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tin nhắn'
            });
        }
        
        // Phân tích tin nhắn
        const analysis = analyzeMessage(message);
        
        // Nếu không có từ khóa liên quan đến món ăn
        if (analysis.categories.length === 0 && !analysis.intents.asking_menu && !analysis.intents.asking_recommendation) {
            return res.json({
                success: true,
                data: [],
                meta: { has_food_intent: false }
            });
        }
        
        // Tìm món phù hợp với từ khóa
        let recommendations = [];
        
        if (analysis.keywords.length > 0) {
            const keywordPatterns = analysis.keywords.map(k => `%${k}%`);
            
            let query = `
                SELECT m.*, d.ten_danh_muc, AVG(dg.so_sao) as avg_rating
                FROM mon_an m
                LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon
                WHERE m.trang_thai = 1 AND (
            `;
            
            const conditions = keywordPatterns.map(() => `m.ten_mon LIKE ? OR d.ten_danh_muc LIKE ?`);
            query += conditions.join(' OR ') + `)
                GROUP BY m.ma_mon
                ORDER BY avg_rating DESC
                LIMIT 5`;
            
            const params = keywordPatterns.flatMap(p => [p, p]);
            const [dishes] = await db.query(query, params);
            
            recommendations = dishes.map(d => ({
                ...d,
                recommendation_type: 'chat_instant',
                reason: `Phù hợp với "${analysis.keywords[0]}"`
            }));
        }
        
        // Nếu không tìm thấy, gợi ý trending
        if (recommendations.length === 0) {
            recommendations = await getTrendingDishes(3);
        }
        
        res.json({
            success: true,
            data: recommendations,
            meta: {
                keywords: analysis.keywords,
                categories: analysis.categories,
                intents: analysis.intents,
                has_food_intent: true
            }
        });
    } catch (error) {
        console.error('Error getting chat recommendations:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy gợi ý' });
    }
});

/**
 * API: Phân tích sở thích user từ chat history
 * GET /api/recommendations/user-profile
 */
router.get('/user-profile', async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }
        
        const chatAnalysis = await getUserChatAnalysis(userId);
        
        // Lấy thêm thông tin mua hàng
        const [purchaseStats] = await db.query(
            `SELECT d.ten_danh_muc, COUNT(*) as count, SUM(ct.so_luong) as total_qty
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             JOIN mon_an m ON ct.ma_mon = m.ma_mon
             LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
             WHERE dh.ma_nguoi_dung = ?
             GROUP BY d.ma_danh_muc
             ORDER BY count DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: {
                chat_analysis: chatAnalysis,
                purchase_preferences: purchaseStats,
                profile_summary: {
                    favorite_keywords: chatAnalysis?.topKeywords?.slice(0, 5) || [],
                    favorite_categories: purchaseStats.slice(0, 3).map(p => p.ten_danh_muc),
                    total_chat_messages: chatAnalysis?.totalMessages || 0
                }
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy thông tin' });
    }
});

/**
 * API: Lấy trending dishes
 * GET /api/recommendations/trending
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const trending = await getTrendingDishes(limit);
        
        res.json({
            success: true,
            data: trending
        });
    } catch (error) {
        console.error('Error getting trending:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy món trending' });
    }
});

/**
 * API: Lấy top rated dishes
 * GET /api/recommendations/top-rated
 */
router.get('/top-rated', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const topRated = await getTopRatedDishes(limit);
        
        res.json({
            success: true,
            data: topRated
        });
    } catch (error) {
        console.error('Error getting top rated:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy món đánh giá cao' });
    }
});

/**
 * API: Lưu interaction để cải thiện ML model
 * POST /api/recommendations/track
 * Body: { dish_id, action: 'view'|'add_cart'|'purchase'|'like' }
 */
router.post('/track', async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        const { dish_id, action } = req.body;
        
        if (!dish_id || !action) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin'
            });
        }
        
        // Lưu vào bảng hanh_vi_nguoi_dung để phân tích
        try {
            let dbAction = 'view';
            if (action === 'click' || action === 'like') {
                dbAction = 'click';
            } else if (action === 'add_cart' || action === 'add_to_cart') {
                dbAction = 'add_to_cart';
            } else if (action === 'purchase') {
                dbAction = 'purchase';
            }

            await db.query(
                `INSERT INTO hanh_vi_nguoi_dung (ma_nguoi_dung, ma_mon, hanh_vi, thoi_gian) VALUES (?, ?, ?, NOW())`,
                [userId || null, dish_id, dbAction]
            );
            console.log(`📊 [DB Track] Recorded interaction: user=${userId}, dish=${dish_id}, action=${dbAction}`);
        } catch (dbErr) {
            console.error('Error inserting click tracking to DB:', dbErr.message);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking:', error.message);
        res.status(500).json({ success: false });
    }
});

/**
 * API: Lấy thống kê sở thích người dùng (Admin)
 * GET /api/recommendations/admin/stats
 */
router.get('/admin/stats', async (req, res) => {
    try {
        // Kiểm tra quyền truy cập (Admin hoặc Staff)
        if ((!req.session || !req.session.admin) && (!req.session || !req.session.staff)) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Admin or Staff only'
            });
        }

        const preferenceService = require('../services/preferenceService');

        // 1. Thống kê Khẩu vị được yêu thích (Explicit)
        const [categories] = await db.query(`
            SELECT f.id as ma_danh_muc, f.ten_thuoc_tinh as ten_danh_muc, COUNT(s.ma_nguoi_dung) as total_users
            FROM thuoc_tinh_khau_vi f
            LEFT JOIN so_thich_khau_vi_nguoi_dung s ON f.id = s.id_thuoc_tinh
            GROUP BY f.id, f.ten_thuoc_tinh
            ORDER BY total_users DESC
        `);

        // 2. Thống kê Từ khóa / Khẩu vị phổ biến từ món đã đặt (Implicit)
        const [dishKeywords] = await db.query(`
            SELECT m.ten_mon, COUNT(ct.ma_ct_don) as total_orders
            FROM chi_tiet_don_hang ct
            JOIN mon_an m ON ct.ma_mon = m.ma_mon
            GROUP BY m.ma_mon, m.ten_mon
        `);

        const keywordStats = {};
        for (const row of dishKeywords) {
            for (const tag of preferenceService.TAG_DEFINITIONS) {
                const text = preferenceService.normalizeText(row.ten_mon);
                const synonyms = tag.synonyms.map(preferenceService.normalizeText).filter(Boolean);
                const isMatched = synonyms.some(phrase => {
                    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(text);
                });
                if (isMatched) {
                    keywordStats[tag.label] = (keywordStats[tag.label] || 0) + Number(row.total_orders || 0);
                }
            }
        }

        const keywordsList = Object.entries(keywordStats)
            .map(([keyword, total_orders]) => ({ keyword, total_orders }))
            .sort((a, b) => b.total_orders - a.total_orders)
            .slice(0, 10);

        // 3. Sở thích từ đánh giá (Positive & Negative Preference Tags)
        const { positiveTags, negativeTags } = await preferenceService.getAdminPreferenceStats(20);

        // 4. Danh sách hồ sơ Khẩu vị khách hàng
        const [users] = await db.query(`
            SELECT 
                n.ma_nguoi_dung, 
                n.ten_nguoi_dung as ho_ten, 
                n.so_dien_thoai,
                GROUP_CONCAT(DISTINCT f.ten_thuoc_tinh SEPARATOR ', ') as ten_danh_muc_thich,
                COUNT(DISTINCT dh.ma_don_hang) as total_orders,
                COALESCE(SUM(dh.tong_tien), 0) as total_spent
            FROM nguoi_dung n
            LEFT JOIN so_thich_khau_vi_nguoi_dung s ON n.ma_nguoi_dung = s.ma_nguoi_dung
            LEFT JOIN thuoc_tinh_khau_vi f ON s.id_thuoc_tinh = f.id
            LEFT JOIN don_hang dh ON n.ma_nguoi_dung = dh.ma_nguoi_dung AND dh.trang_thai = 'delivered'
            GROUP BY n.ma_nguoi_dung, n.ten_nguoi_dung, n.so_dien_thoai
            ORDER BY total_orders DESC, total_spent DESC
            LIMIT 50
        `);

        if (users.length > 0) {
            const userIds = users.map(u => u.ma_nguoi_dung);
            const profiles = await preferenceService.getProfilesForUsers(userIds);
            
            // Lấy món ăn được click nhiều nhất cho từng user
            let userTopDishes = {};
            let userTopFlavors = {};
            
            try {
                const [topDishClicksRows] = await db.query(`
                    SELECT h.ma_nguoi_dung, m.ten_mon, COUNT(h.id) as click_count
                    FROM hanh_vi_nguoi_dung h
                    JOIN mon_an m ON h.ma_mon = m.ma_mon
                    WHERE h.ma_nguoi_dung IN (?) AND h.hanh_vi IN ('click', 'view')
                    GROUP BY h.ma_nguoi_dung, m.ma_mon, m.ten_mon
                `, [userIds]);

                // Lấy khẩu vị được click nhiều nhất cho từng user
                const [topFlavorClicksRows] = await db.query(`
                    SELECT h.ma_nguoi_dung, f.ten_thuoc_tinh, COUNT(h.id) as click_count
                    FROM hanh_vi_nguoi_dung h
                    JOIN mon_an_khau_vi mk ON h.ma_mon = mk.ma_mon
                    JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
                    WHERE h.ma_nguoi_dung IN (?) AND h.hanh_vi IN ('click', 'view')
                    GROUP BY h.ma_nguoi_dung, f.id, f.ten_thuoc_tinh
                `, [userIds]);

                // Nhóm dữ liệu theo ma_nguoi_dung
                topDishClicksRows.forEach(row => {
                    if (!userTopDishes[row.ma_nguoi_dung] || row.click_count > userTopDishes[row.ma_nguoi_dung].click_count) {
                        userTopDishes[row.ma_nguoi_dung] = { ten_mon: row.ten_mon, click_count: row.click_count };
                    }
                });

                topFlavorClicksRows.forEach(row => {
                    if (!userTopFlavors[row.ma_nguoi_dung]) {
                        userTopFlavors[row.ma_nguoi_dung] = [];
                    }
                    userTopFlavors[row.ma_nguoi_dung].push(row);
                });

                // Sắp xếp giảm dần và lấy tối đa top 3 khẩu vị click nhiều nhất
                Object.keys(userTopFlavors).forEach(uId => {
                    userTopFlavors[uId] = userTopFlavors[uId]
                        .sort((a, b) => b.click_count - a.click_count)
                        .slice(0, 3);
                });
            } catch (dbErr) {
                console.error('Error fetching user-specific click analytics:', dbErr.message);
            }

            users.forEach(u => {
                u.preference_tags = profiles[u.ma_nguoi_dung] || [];
                u.top_dish_click = userTopDishes[u.ma_nguoi_dung] || null;
                u.top_flavors_click = userTopFlavors[u.ma_nguoi_dung] || [];
                
                // CẢI TIẾN: Lấy món ăn và khẩu vị học được từ chatbot
                u.chatbot_dishes = [];
            });
            
            // CẢI TIẾN: Lấy dữ liệu chatbot_preference_insights cho các user
            try {
                const [chatbotInsights] = await db.query(`
                    SELECT 
                        ci.ma_nguoi_dung,
                        ci.ten_mon,
                        ci.ma_mon,
                        GROUP_CONCAT(DISTINCT pt.ten_tag SEPARATOR ', ') as tags,
                        SUM(ci.score_delta) as total_score
                    FROM chatbot_preference_insights ci
                    LEFT JOIN preference_tags pt ON ci.tag_key = pt.tag_key
                    WHERE ci.ma_nguoi_dung IN (?)
                    GROUP BY ci.ma_nguoi_dung, ci.ten_mon, ci.ma_mon
                    HAVING total_score > 0
                    ORDER BY ci.ma_nguoi_dung, total_score DESC
                `, [userIds]);
                
                // Nhóm theo user
                const chatbotByUser = {};
                chatbotInsights.forEach(row => {
                    if (!chatbotByUser[row.ma_nguoi_dung]) {
                        chatbotByUser[row.ma_nguoi_dung] = [];
                    }
                    chatbotByUser[row.ma_nguoi_dung].push({
                        ten_mon: row.ten_mon || 'Từ khóa khẩu vị',
                        ma_mon: row.ma_mon,
                        tags: row.tags,
                        score: parseFloat(row.total_score || 0).toFixed(1)
                    });
                });
                
                users.forEach(u => {
                    u.chatbot_dishes = (chatbotByUser[u.ma_nguoi_dung] || []).slice(0, 5);
                });
            } catch (chatbotErr) {
                console.error('Error fetching chatbot preferences:', chatbotErr.message);
            }
        }

        // 5. Thống kê số lượt click chuột / xem món ăn (Dish Click/View Counts)
        const [dishClicks] = await db.query(`
            SELECT m.ma_mon, m.ten_mon, COUNT(h.id) as total_clicks
            FROM hanh_vi_nguoi_dung h
            JOIN mon_an m ON h.ma_mon = m.ma_mon
            WHERE h.hanh_vi IN ('click', 'view')
            GROUP BY m.ma_mon, m.ten_mon
            ORDER BY total_clicks DESC
            LIMIT 10
        `);

        // 6. Thống kê số lượt click chuột theo nhóm khẩu vị (Flavor Click/View Counts)
        const [flavorClicks] = await db.query(`
            SELECT f.id as id_thuoc_tinh, f.ten_thuoc_tinh as ten_khau_vi, COUNT(h.id) as total_clicks
            FROM hanh_vi_nguoi_dung h
            JOIN mon_an_khau_vi mk ON h.ma_mon = mk.ma_mon
            JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
            WHERE h.hanh_vi IN ('click', 'view')
            GROUP BY f.id, f.ten_thuoc_tinh
            ORDER BY total_clicks DESC
            LIMIT 10
        `);

        // 7. Tính độ đồng điệu giữa các khách hàng (Collaborative Filtering Similarity Groups)
        let similarityGroups = [];
        try {
            const [allUsersList] = await db.query('SELECT ma_nguoi_dung, ten_nguoi_dung, so_dien_thoai FROM nguoi_dung');
            const [allFlavorsList] = await db.query('SELECT id, ten_thuoc_tinh FROM thuoc_tinh_khau_vi');
            const [allExplicitPrefs] = await db.query('SELECT ma_nguoi_dung, id_thuoc_tinh FROM so_thich_khau_vi_nguoi_dung');
            const [allImplicitPrefs] = await db.query(`
                SELECT h.ma_nguoi_dung, mk.id_thuoc_tinh, COUNT(h.id) as click_count
                FROM hanh_vi_nguoi_dung h
                JOIN mon_an_khau_vi mk ON h.ma_mon = mk.ma_mon
                WHERE h.hanh_vi IN ('click', 'view')
                GROUP BY h.ma_nguoi_dung, mk.id_thuoc_tinh
            `);

            const [allReviews] = await db.query(`
                SELECT dg.ma_nguoi_dung, mk.id_thuoc_tinh, dg.so_sao
                FROM danh_gia_san_pham dg
                JOIN mon_an_khau_vi mk ON dg.ma_mon = mk.ma_mon
                WHERE dg.trang_thai = 'approved' AND dg.ma_nguoi_dung IS NOT NULL
            `);
            
            // Lịch sử mua hàng để tìm món đề xuất chéo (Collaborative Filtering)
            // - Lấy mọi đơn chưa hủy
            // - Nếu đơn không có ma_nguoi_dung (đơn POS / khách vãng lai), MAP NGƯỢC:
            //     + ưu tiên match theo số điện thoại
            //     + fallback theo tên khách (case-insensitive, trim)
            const [allOrders] = await db.query(`
                SELECT
                    COALESCE(dh.ma_nguoi_dung, nd_phone.ma_nguoi_dung, nd_name.ma_nguoi_dung) AS ma_nguoi_dung,
                    m.ma_mon,
                    m.ten_mon,
                    MAX(dh.thoi_gian_tao) AS latest_purchase
                FROM don_hang dh
                JOIN chi_tiet_don_hang ct ON dh.ma_don_hang = ct.ma_don_hang
                JOIN mon_an m ON ct.ma_mon = m.ma_mon
                LEFT JOIN nguoi_dung nd_phone
                       ON dh.ma_nguoi_dung IS NULL
                      AND dh.so_dt_khach IS NOT NULL
                      AND dh.so_dt_khach <> ''
                      AND nd_phone.so_dien_thoai = dh.so_dt_khach
                LEFT JOIN nguoi_dung nd_name
                       ON dh.ma_nguoi_dung IS NULL
                      AND nd_phone.ma_nguoi_dung IS NULL
                      AND dh.ten_khach_vang_lai IS NOT NULL
                      AND dh.ten_khach_vang_lai <> ''
                      AND LOWER(TRIM(nd_name.ten_nguoi_dung)) = LOWER(TRIM(dh.ten_khach_vang_lai))
                WHERE dh.trang_thai <> 'cancelled'
                  AND COALESCE(dh.ma_nguoi_dung, nd_phone.ma_nguoi_dung, nd_name.ma_nguoi_dung) IS NOT NULL
                GROUP BY COALESCE(dh.ma_nguoi_dung, nd_phone.ma_nguoi_dung, nd_name.ma_nguoi_dung), m.ma_mon, m.ten_mon
                ORDER BY latest_purchase DESC
            `);

            console.log(`🔍 [CF Debug] Tổng số bản ghi (user, mon) lấy được: ${allOrders.length}`);
            
            const userPurchases = {};
            allOrders.forEach(row => {
                if (!userPurchases[row.ma_nguoi_dung]) userPurchases[row.ma_nguoi_dung] = [];
                userPurchases[row.ma_nguoi_dung].push({ id: row.ma_mon, name: row.ten_mon });
            });

            // Log số món mỗi user đã mua (giúp debug khi không có gợi ý chéo)
            const purchaseSummary = allUsersList.map(u => ({
                ma: u.ma_nguoi_dung,
                ten: u.ten_nguoi_dung,
                so_dien_thoai: u.so_dien_thoai,
                so_mon_da_mua: (userPurchases[u.ma_nguoi_dung] || []).length,
                cac_mon: (userPurchases[u.ma_nguoi_dung] || []).map(x => x.name)
            }));
            console.log('🔍 [CF Debug] Lịch sử mua của từng user:', JSON.stringify(purchaseSummary, null, 2));

            const vectors = {};
            allUsersList.forEach(u => {
                vectors[u.ma_nguoi_dung] = {};
                allFlavorsList.forEach(f => {
                    vectors[u.ma_nguoi_dung][f.id] = 0;
                });
            });

            allExplicitPrefs.forEach(row => {
                if (vectors[row.ma_nguoi_dung]) {
                    vectors[row.ma_nguoi_dung][row.id_thuoc_tinh] += 3.0;
                }
            });

            allImplicitPrefs.forEach(row => {
                if (vectors[row.ma_nguoi_dung]) {
                    vectors[row.ma_nguoi_dung][row.id_thuoc_tinh] += Math.min(2.0, row.click_count * 0.2);
                }
            });

            allReviews.forEach(row => {
                if (vectors[row.ma_nguoi_dung]) {
                    const ratingWeight = row.so_sao >= 4 ? 2.5 : (row.so_sao <= 2 ? -2.5 : 0);
                    vectors[row.ma_nguoi_dung][row.id_thuoc_tinh] += ratingWeight;
                }
            });

            for (let i = 0; i < allUsersList.length; i++) {
                for (let j = i + 1; j < allUsersList.length; j++) {
                    const uA = allUsersList[i];
                    const uB = allUsersList[j];
                    
                    const vecA = vectors[uA.ma_nguoi_dung];
                    const vecB = vectors[uB.ma_nguoi_dung];
                    
                    let dotProduct = 0;
                    let normA = 0;
                    let normB = 0;
                    
                    allFlavorsList.forEach(f => {
                        const valA = vecA[f.id] || 0;
                        const valB = vecB[f.id] || 0;
                        dotProduct += valA * valB;
                        normA += valA * valA;
                        normB += valB * valB;
                    });
                    
                    const similarity = normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                    
                    if (similarity > 0.1) {
                        const sharedFlavors = allFlavorsList
                            .filter(f => (vecA[f.id] > 0) && (vecB[f.id] > 0))
                            .map(f => f.ten_thuoc_tinh);
                        
                        const purchasesA = userPurchases[uA.ma_nguoi_dung] || [];
                        const purchasesB = userPurchases[uB.ma_nguoi_dung] || [];
                        
                        // Tìm món Khách B đã mua nhưng Khách A chưa mua
                        const recForA = purchasesB.filter(pb => !purchasesA.some(pa => pa.id === pb.id)).slice(0, 2);
                        // Tìm món Khách A đã mua nhưng Khách B chưa mua
                        const recForB = purchasesA.filter(pa => !purchasesB.some(pb => pb.id === pa.id)).slice(0, 2);
                            
                        similarityGroups.push({
                            userA: { id: uA.ma_nguoi_dung, name: uA.ten_nguoi_dung, phone: uA.so_dien_thoai },
                            userB: { id: uB.ma_nguoi_dung, name: uB.ten_nguoi_dung, phone: uB.so_dien_thoai },
                            similarity: Math.round(similarity * 100),
                            sharedFlavors,
                            recForA,
                            recForB,
                            purchasesACount: purchasesA.length,
                            purchasesBCount: purchasesB.length
                        });
                    }
                }
            }
            similarityGroups.sort((a, b) => b.similarity - a.similarity);
            // Giới hạn hiển thị Top 10 cặp giống nhau nhất cho đỡ nặng giao diện
            similarityGroups = similarityGroups.slice(0, 10);
        } catch (simErr) {
            console.error('Error calculating collaborative similarity groups:', simErr.message);
        }

        res.json({
            success: true,
            data: {
                categories,
                keywords: keywordsList,
                preferenceTags: positiveTags,
                negativePreferenceTags: negativeTags,
                users,
                dishClicks,
                flavorClicks,
                similarityGroups
            }
        });
    } catch (error) {
        console.error('Error fetching admin preference stats:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * API: Huấn luyện lại / Cập nhật hồ sơ sở thích khách hàng từ đánh giá VÀ chatbot
 * POST /api/recommendations/admin/rebuild-preferences
 * CẢI TIẾN: Chạy cả rebuildAllChatbotPreferences() và rebuildAllReviewPreferences()
 */
router.post('/admin/rebuild-preferences', async (req, res) => {
    try {
        // Kiểm tra quyền truy cập (Admin hoặc Staff)
        if ((!req.session || !req.session.admin) && (!req.session || !req.session.staff)) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Admin or Staff only'
            });
        }

        const preferenceService = require('../services/preferenceService');
        
        console.log('🤖 Bắt đầu huấn luyện lại sở thích AI...');
        
        // 1. Huấn luyện từ chatbot
        console.log('📱 Phân tích lịch sử chatbot...');
        const chatbotCount = await preferenceService.rebuildAllChatbotPreferences();
        
        // 2. Huấn luyện từ review
        console.log('⭐ Phân tích đánh giá sản phẩm...');
        const reviewResult = await preferenceService.rebuildAllReviewPreferences();
        
        // 3. Tính toán lại toàn bộ profile (gộp cả 2 nguồn)
        console.log('🧮 Tính toán lại hồ sơ sở thích...');
        const profileCount = await preferenceService.rebuildAllProfiles();
        
        console.log('✅ Huấn luyện hoàn tất!');
        
        res.json({
            success: true,
            message: 'Đã huấn luyện lại sở thích từ chatbot và đánh giá thành công',
            data: {
                chatbot_insights: chatbotCount,
                review_insights: reviewResult.insight_count || 0,
                reviews_processed: reviewResult.review_count || 0,
                profiles_updated: profileCount
            }
        });
    } catch (error) {
        console.error('Error rebuilding preferences:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

/**
 * API: Lấy lịch sử click của người dùng
 * GET /api/recommendations/admin/user-click-history/:userId
 */
router.get('/admin/user-click-history/:userId', async (req, res) => {
    try {
        if ((!req.session || !req.session.admin) && (!req.session || !req.session.staff)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.params.userId;
        const [history] = await db.query(`
            SELECT m.ma_mon, m.ten_mon, m.anh_mon, m.gia_tien, COUNT(h.id) as click_count, MAX(h.thoi_gian) as last_clicked
            FROM hanh_vi_nguoi_dung h
            JOIN mon_an m ON h.ma_mon = m.ma_mon
            WHERE h.ma_nguoi_dung = ? AND h.hanh_vi IN ('click', 'view')
            GROUP BY m.ma_mon, m.ten_mon, m.anh_mon, m.gia_tien
            ORDER BY click_count DESC, last_clicked DESC
            LIMIT 50
        `, [userId]);
        res.json({ success: true, data: history });
    } catch (err) {
        console.error('Error fetching user click history:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * API: Lấy chi tiết từ khóa và món ăn từ chatbot của người dùng
 * GET /api/recommendations/admin/chatbot-keywords/:userId
 */
router.get('/admin/chatbot-keywords/:userId', async (req, res) => {
    try {
        if ((!req.session || !req.session.admin) && (!req.session || !req.session.staff)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const userId = req.params.userId;
        
        // 1. Lấy các món ăn được nhắc đến (có ma_mon)
        const [dishes] = await db.query(`
            SELECT 
                ci.ma_mon,
                ci.ten_mon,
                GROUP_CONCAT(DISTINCT pt.ten_tag ORDER BY pt.ten_tag SEPARATOR ', ') as tags,
                ci.sentiment,
                SUM(ci.score_delta) as score,
                MAX(ci.evidence) as evidence,
                MAX(ci.ngay_tao) as last_mentioned
            FROM chatbot_preference_insights ci
            LEFT JOIN preference_tags pt ON ci.tag_key = pt.tag_key
            WHERE ci.ma_nguoi_dung = ? AND ci.ma_mon IS NOT NULL
            GROUP BY ci.ma_mon, ci.ten_mon, ci.sentiment
            ORDER BY last_mentioned DESC, score DESC
        `, [userId]);
        
        // 2. Lấy các từ khóa khẩu vị (không có ma_mon)
        const [keywords] = await db.query(`
            SELECT 
                ci.tag_key,
                pt.ten_tag as tag_name,
                pt.nhom_tag,
                ci.sentiment,
                SUM(ci.score_delta) as score,
                MAX(ci.evidence) as evidence,
                MAX(ci.ngay_tao) as last_mentioned,
                COUNT(*) as mention_count
            FROM chatbot_preference_insights ci
            LEFT JOIN preference_tags pt ON ci.tag_key = pt.tag_key
            WHERE ci.ma_nguoi_dung = ? AND ci.ma_mon IS NULL
            GROUP BY ci.tag_key, pt.ten_tag, pt.nhom_tag, ci.sentiment
            ORDER BY last_mentioned DESC, score DESC
        `, [userId]);
        
        // 3. Lấy lịch sử tin nhắn gốc (chỉ lấy 50 tin nhắn gần nhất)
        const [messages] = await db.query(`
            SELECT 
                lc.thoi_diem_chat,
                lc.nguoi_gui,
                lc.noi_dung,
                (SELECT COUNT(*) 
                 FROM chatbot_preference_insights ci 
                 WHERE ci.ma_nguoi_dung = lc.ma_nguoi_dung 
                 AND DATE(ci.ngay_tao) = DATE(lc.thoi_diem_chat)
                 AND TIME(ci.ngay_tao) BETWEEN TIME(lc.thoi_diem_chat) AND ADDTIME(TIME(lc.thoi_diem_chat), '00:00:05')
                ) as insights_count
            FROM lich_su_chatbot lc
            WHERE lc.ma_nguoi_dung = ?
            ORDER BY lc.thoi_diem_chat DESC
            LIMIT 50
        `, [userId]);
        
        // 4. Tính thống kê tổng quan
        const stats = {
            total_keywords: keywords.length,
            total_dishes: dishes.length,
            total_score: [...dishes, ...keywords].reduce((sum, item) => sum + parseFloat(item.score || 0), 0)
        };
        
        res.json({
            success: true,
            data: {
                dishes,
                keywords,
                messages,
                stats
            }
        });
    } catch (err) {
        console.error('Error fetching chatbot keywords:', err);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
    }
});

// === DEBUG: kiểm tra dữ liệu CF cho 1 user (mở ngoài để soi nhanh) ===
// GET /api/recommendation/debug-cf?ten=Thuat
router.get('/debug-cf', async (req, res) => {
    try {
        const ten = req.query.ten || '';

        // 1. User trong nguoi_dung khớp tên
        const [usersByName] = await db.query(
            `SELECT ma_nguoi_dung, ten_nguoi_dung, so_dien_thoai
             FROM nguoi_dung
             WHERE LOWER(ten_nguoi_dung) LIKE LOWER(?)`,
            [`%${ten}%`]
        );

        // 2. Đơn hàng có ten_khach_vang_lai khớp tên
        const [ordersByName] = await db.query(
            `SELECT ma_don_hang, ma_nguoi_dung, ten_khach_vang_lai, so_dt_khach, trang_thai, thoi_gian_tao
             FROM don_hang
             WHERE LOWER(IFNULL(ten_khach_vang_lai,'')) LIKE LOWER(?)
                OR ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE LOWER(ten_nguoi_dung) LIKE LOWER(?))
             ORDER BY thoi_gian_tao DESC
             LIMIT 30`,
            [`%${ten}%`, `%${ten}%`]
        );

        // 3. Các món trong những đơn đó
        const orderIds = ordersByName.map(o => o.ma_don_hang);
        let items = [];
        if (orderIds.length > 0) {
            const [rows] = await db.query(
                `SELECT ct.ma_don_hang, ct.ma_mon, m.ten_mon, ct.so_luong
                 FROM chi_tiet_don_hang ct
                 JOIN mon_an m ON ct.ma_mon = m.ma_mon
                 WHERE ct.ma_don_hang IN (?)`,
                [orderIds]
            );
            items = rows;
        }

        // 4. Đơn nào KHÔNG link được về user (trống ma_nguoi_dung + không match phone/tên)
        const [orphanOrders] = await db.query(`
            SELECT dh.ma_don_hang, dh.ten_khach_vang_lai, dh.so_dt_khach, dh.trang_thai
            FROM don_hang dh
            LEFT JOIN nguoi_dung nd_phone
                   ON dh.so_dt_khach = nd_phone.so_dien_thoai
                  AND dh.so_dt_khach IS NOT NULL AND dh.so_dt_khach <> ''
            LEFT JOIN nguoi_dung nd_name
                   ON LOWER(TRIM(nd_name.ten_nguoi_dung)) = LOWER(TRIM(dh.ten_khach_vang_lai))
                  AND dh.ten_khach_vang_lai IS NOT NULL AND dh.ten_khach_vang_lai <> ''
            WHERE dh.ma_nguoi_dung IS NULL
              AND nd_phone.ma_nguoi_dung IS NULL
              AND nd_name.ma_nguoi_dung IS NULL
              AND dh.trang_thai <> 'cancelled'
            ORDER BY dh.thoi_gian_tao DESC
            LIMIT 20
        `);

        res.json({
            success: true,
            search: ten,
            users_match: usersByName,
            orders_match: ordersByName,
            items_in_those_orders: items,
            orphan_orders_cannot_link: orphanOrders
        });
    } catch (err) {
        console.error('debug-cf error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
