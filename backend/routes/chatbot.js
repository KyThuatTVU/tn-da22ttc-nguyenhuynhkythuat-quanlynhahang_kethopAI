const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const OpenAI = require('openai');
const { analyzeUserIntent, extractFoodSearchTerms, getCartByUserId } = require('../graphql');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Khá»Ÿi táº¡o Groq AI client
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

console.log('ðŸ¤– Chatbot using: Groq (Free) + GraphQL');
console.log('ðŸ”‘ Groq API Key:', process.env.GROQ_API_KEY ? 'âœ… Configured (***' + process.env.GROQ_API_KEY.slice(-8) + ')' : 'âŒ NOT SET');

// Cache
let settingsCache = { data: null, lastUpdate: 0 };

// ==================== HELPER FUNCTIONS ====================

function getUserFromToken(req) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded.ma_nguoi_dung;
        }
    } catch (error) { }
    return null;
}

async function saveChatHistory(ma_nguoi_dung, session_id, nguoi_gui, noi_dung) {
    try {
        await db.query(
            `INSERT INTO lich_su_chatbot (ma_nguoi_dung, session_id, nguoi_gui, noi_dung) VALUES (?, ?, ?, ?)`,
            [ma_nguoi_dung, session_id, nguoi_gui, noi_dung]
        );
    } catch (error) {
        console.error('Error saving chat history:', error.message);
    }
}

async function getRestaurantSettings() {
    const now = Date.now();
    if (settingsCache.data && (now - settingsCache.lastUpdate) < 30000) {
        return settingsCache.data;
    }
    try {
        const [settings] = await db.query('SELECT * FROM cai_dat');
        const settingsObj = {};
        settings.forEach(item => { settingsObj[item.setting_key] = item.setting_value; });
        settingsCache = { data: settingsObj, lastUpdate: now };
        return settingsObj;
    } catch (error) {
        console.error('Error getting settings:', error.message);
        return {};
    }
}

// ==================== GRAPHQL-POWERED CONTEXT ====================

async function getChatbotContextForMessage(message) {
    const intent = analyzeUserIntent(message);
    const context = {
        mon_an_lien_quan: [],
        danh_muc_lien_quan: [],
        top_ban_chay: [],
        has_food_data: false,
        intent: intent,
        compact_menu: ''
    };

    try {
        // 1. Há»i vá» mÃ³n Äƒn cá»¥ thá»ƒ
        if (intent.hoi_mon_an || intent.hoi_thuc_don || intent.hoi_danh_muc || intent.hoi_gia) {
            const searchTerms = extractFoodSearchTerms(message);
            
            if (searchTerms.length > 0) {
                for (const term of searchTerms) {
                    const [dishes] = await db.query(`
                        SELECT m.ma_mon, m.ten_mon, m.mo_ta_chi_tiet, m.gia_tien, m.don_vi_tinh, 
                               m.anh_mon, d.ten_danh_muc,
                               COALESCE(AVG(dg.so_sao), 0) as diem_danh_gia,
                               COUNT(DISTINCT dg.ma_danh_gia) as luot_danh_gia
                        FROM mon_an m
                        LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                        LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                        WHERE m.trang_thai = 1 AND (m.ten_mon LIKE ? OR m.mo_ta_chi_tiet LIKE ?)
                        GROUP BY m.ma_mon
                        ORDER BY CASE 
                            WHEN m.ten_mon LIKE ? THEN 1
                            WHEN m.ten_mon LIKE ? THEN 2
                            ELSE 3
                        END
                        LIMIT 6
                    `, [`%${term}%`, `%${term}%`, `${term}%`, `%${term}%`]);
                    
                    dishes.forEach(d => {
                        if (!context.mon_an_lien_quan.find(e => e.ma_mon === d.ma_mon)) {
                            context.mon_an_lien_quan.push({
                                ...d,
                                diem_danh_gia: parseFloat(d.diem_danh_gia) || 0,
                                luot_danh_gia: parseInt(d.luot_danh_gia) || 0
                            });
                        }
                    });
                }
            }

            // TÃ¬m theo danh má»¥c
            if (intent.hoi_danh_muc && intent.tu_khoa_danh_muc.length > 0) {
                for (const catKw of intent.tu_khoa_danh_muc) {
                    const [cats] = await db.query(
                        'SELECT * FROM danh_muc WHERE trang_thai = 1 AND ten_danh_muc LIKE ?',
                        [`%${catKw}%`]
                    );
                    for (const cat of cats) {
                        const [catDishes] = await db.query(`
                            SELECT m.ma_mon, m.ten_mon, m.gia_tien, m.don_vi_tinh, m.anh_mon, m.mo_ta_chi_tiet,
                                   d.ten_danh_muc
                            FROM mon_an m LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                            WHERE m.trang_thai = 1 AND m.ma_danh_muc = ?
                            LIMIT 8
                        `, [cat.ma_danh_muc]);
                        
                        context.danh_muc_lien_quan.push({ ...cat, mon_an: catDishes });
                        catDishes.forEach(d => {
                            if (!context.mon_an_lien_quan.find(e => e.ma_mon === d.ma_mon)) {
                                context.mon_an_lien_quan.push(d);
                            }
                        });
                    }
                }
            }

            // Thá»±c Ä‘Æ¡n tá»•ng quÃ¡t
            if (intent.hoi_thuc_don && context.mon_an_lien_quan.length === 0) {
                const [allCats] = await db.query('SELECT * FROM danh_muc WHERE trang_thai = 1');
                for (const cat of allCats) {
                    const [catDishes] = await db.query(`
                        SELECT m.ma_mon, m.ten_mon, m.gia_tien, m.don_vi_tinh, m.anh_mon, d.ten_danh_muc
                        FROM mon_an m LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                        WHERE m.trang_thai = 1 AND m.ma_danh_muc = ?
                        ORDER BY RAND() LIMIT 3
                    `, [cat.ma_danh_muc]);
                    context.danh_muc_lien_quan.push({ ...cat, mon_an: catDishes });
                    catDishes.forEach(d => context.mon_an_lien_quan.push(d));
                }
            }
        }

        // 2. Khoáº£ng giÃ¡
        if (intent.khoang_gia) {
            const [priceFiltered] = await db.query(`
                SELECT m.ma_mon, m.ten_mon, m.gia_tien, m.don_vi_tinh, m.anh_mon, m.mo_ta_chi_tiet, d.ten_danh_muc
                FROM mon_an m LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                WHERE m.trang_thai = 1 AND m.gia_tien BETWEEN ? AND ?
                ORDER BY m.gia_tien ASC LIMIT 8
            `, [intent.khoang_gia.min, intent.khoang_gia.max]);
            
            priceFiltered.forEach(d => {
                if (!context.mon_an_lien_quan.find(e => e.ma_mon === d.ma_mon)) {
                    context.mon_an_lien_quan.push(d);
                }
            });
        }

        // 3. Top bÃ¡n cháº¡y / Gá»£i Ã½
        if (intent.hoi_top_ban_chay || intent.hoi_goi_y) {
            const [topDishes] = await db.query(`
                SELECT m.ma_mon, m.ten_mon, m.anh_mon, m.gia_tien, m.don_vi_tinh, m.mo_ta_chi_tiet,
                       d.ten_danh_muc, SUM(ct.so_luong) as so_luong_ban
                FROM chi_tiet_don_hang ct
                JOIN mon_an m ON ct.ma_mon = m.ma_mon
                JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
                LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                WHERE dh.trang_thai = 'delivered' AND m.trang_thai = 1
                GROUP BY m.ma_mon
                ORDER BY so_luong_ban DESC LIMIT 6
            `);
            context.top_ban_chay = topDishes;
            topDishes.forEach(d => {
                if (!context.mon_an_lien_quan.find(e => e.ma_mon === d.ma_mon)) {
                    context.mon_an_lien_quan.push(d);
                }
            });
        }

        // Giá»›i háº¡n
        context.mon_an_lien_quan = context.mon_an_lien_quan.slice(0, 8);
        context.has_food_data = context.mon_an_lien_quan.length > 0;

        // Compact menu cho AI
        if (context.has_food_data) {
            context.compact_menu = context.mon_an_lien_quan.map(m => {
                const price = new Intl.NumberFormat('vi-VN').format(m.gia_tien);
                return `- ${m.ten_mon}: ${price}d/${m.don_vi_tinh || 'phan'} (${m.ten_danh_muc || ''})${m.diem_danh_gia ? ' *' + parseFloat(m.diem_danh_gia).toFixed(1) : ''}`;
            }).join('\n');
        }

    } catch (error) {
        console.error('Error getting chatbot context:', error.message);
    }

    return context;
}

// Menu Ä‘áº§y Ä‘á»§ (fallback)
async function getCompactMenu() {
    try {
        const [categories] = await db.query('SELECT * FROM danh_muc WHERE trang_thai = 1 ORDER BY ma_danh_muc');
        const [dishes] = await db.query(`
            SELECT m.ten_mon, m.gia_tien, m.don_vi_tinh, d.ten_danh_muc, d.ma_danh_muc
            FROM mon_an m LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
            WHERE m.trang_thai = 1 ORDER BY d.ma_danh_muc, m.ten_mon
        `);

        let menuInfo = '';
        categories.forEach(cat => {
            const catDishes = dishes.filter(d => d.ma_danh_muc === cat.ma_danh_muc);
            if (catDishes.length > 0) {
                menuInfo += '\n' + cat.ten_danh_muc.toUpperCase() + ':\n';
                catDishes.forEach(dish => {
                    const price = new Intl.NumberFormat('vi-VN').format(dish.gia_tien);
                    menuInfo += '  - ' + dish.ten_mon + ': ' + price + 'd/' + (dish.don_vi_tinh || 'phan') + '\n';
                });
            }
        });
        return menuInfo;
    } catch (error) {
        console.error('Error getting compact menu:', error.message);
        return '';
    }
}

// ==================== CHATBOT ORDER AUTOMATION (GraphQL) ====================

// Táº¡o system prompt chuáº©n cho AI
function systemPromptBase(tenNhaHang, diaChi, soDienThoai, email, website, gioMoCuaT2T6, gioMoCuaT7CN, phiGiaoHang, mienPhiGiaoHangTu) {
    return 'Báº N LÃ€ TRÃ€ MY - trá»£ lÃ½ áº£o thÃ´ng minh cá»§a ' + tenNhaHang + '.\n\n'
        + '=== DANH TÃNH ===\n'
        + '- TÃªn: TRÃ€ MY - tiáº¿p viÃªn áº£o dá»… thÆ°Æ¡ng, ngá»t ngÃ o\n'
        + '- XÆ°ng "em", gá»i khÃ¡ch lÃ  "anh/chá»‹"\n'
        + '- NÃ³i ngáº¯n gá»n (2-4 cÃ¢u), trá»ng tÃ¢m, chÃ­nh xÃ¡c\n'
        + '- Emoji: ðŸŒ¸ ðŸ’• ðŸ˜Š ðŸœ âœ¨ ðŸ›’\n\n'
        + '=== THÃ”NG TIN NHÃ€ HÃ€NG ===\n'
        + 'ðŸ“ ' + tenNhaHang + ' - "PHÆ¯Æ NG NAM â€“ NGON NHÆ¯ Máº¸ Náº¤U"\n'
        + 'ðŸ“ Äá»‹a chá»‰: ' + diaChi + '\n'
        + 'ðŸ“ Hotline: ' + soDienThoai + ' | Email: ' + email + ' | Web: ' + website + '\n'
        + 'ðŸ“ Giá» má»Ÿ cá»­a: T2-T6: ' + gioMoCuaT2T6 + ' | T7-CN: ' + gioMoCuaT7CN + '\n'
        + 'ðŸ“ Giao hÃ ng: ' + new Intl.NumberFormat('vi-VN').format(phiGiaoHang) + 'Ä‘ | Miá»…n phÃ­ tá»« ' + new Intl.NumberFormat('vi-VN').format(mienPhiGiaoHangTu) + 'Ä‘\n'
        + 'ðŸ“ Miá»…n phÃ­ giao hÃ ng cho Ä‘Æ¡n tá»« ' + new Intl.NumberFormat('vi-VN').format(mienPhiGiaoHangTu) + 'Ä‘\n\n'
        + '=== CHá»¨C NÄ‚NG Äáº¶T HÃ€NG ===\n'
        + 'Báº¡n cÃ³ thá»ƒ giÃºp khÃ¡ch: thÃªm mÃ³n vÃ o giá» hÃ ng, xem giá» hÃ ng, Ä‘áº·t hÃ ng, xem Ä‘Æ¡n hÃ ng.\n'
        + 'Khi khÃ¡ch muá»‘n Ä‘áº·t mÃ³n, hÃ£y xÃ¡c nháº­n láº¡i mÃ³n vÃ  sá»‘ lÆ°á»£ng, rá»“i thÃªm vÃ o giá» hÃ ng.\n'
        + 'HÆ°á»›ng dáº«n khÃ¡ch: "Chá»‰ cáº§n nÃ³i: Ä‘áº·t 2 pháº§n phá»Ÿ bÃ², 1 cÆ¡m táº¥m"\n\n'
        + '=== Äá»˜I NGÅ¨ ===\n'
        + 'ðŸ‘©â€ðŸ’¼ Chá»§: HoÃ ng Thá»¥c Linh (10 nÄƒm KN)\n'
        + 'ðŸ‘¨â€ðŸ³ Báº¿p trÆ°á»Ÿng: Nguyá»…n Nháº­t TrÆ°á»ng (20 nÄƒm KN)\n'
        + 'ðŸ‘¨â€ðŸ³ PhÃ³ báº¿p: Nguyá»…n Huá»³nh Ká»³ Thuáº­t (12 nÄƒm KN)\n'
        + 'ðŸ‘©â€ðŸ’¼ Quáº£n lÃ½: Há»©a Thá»‹ Tháº£o Vy (8 nÄƒm KN)\n\n'
        + '=== QUY Táº®C (Báº®T BUá»˜C) ===\n'
        + '1. NGáº®N Gá»ŒN, TRá»ŒNG TÃ‚M (2-4 cÃ¢u), khÃ´ng lan man\n'
        + '2. Há»i mÃ³n Äƒn -> DÃ™NG tÃªn vÃ  giÃ¡ tá»« dá»¯ liá»‡u\n'
        + '3. ChÃ o/há»i tÃªn -> "Em lÃ  TrÃ  My, trá»£ lÃ½ áº£o cá»§a ' + tenNhaHang + '"\n'
        + '4. "TrÃ  My" lÃ  TÃŠN Báº N, KHÃ”NG pháº£i Ä‘á»“ uá»‘ng\n'
        + '5. Há»i Ä‘á»™i ngÅ© -> DÃ™NG tÃªn, chá»©c vá»¥\n'
        + '6. Há»i liÃªn há»‡ -> DÃ™NG SDT, Ä‘á»‹a chá»‰, giá»\n'
        + '7. KhÃ´ng biáº¿t -> Gá»i hotline ' + soDienThoai + '\n'
        + '8. KHÃ”NG bá»‹a Ä‘áº·t. Liá»‡t kÃª mÃ³n: TÃªn - GiÃ¡ rÃµ rÃ ng\n'
        + '9. Khi khÃ¡ch Ä‘áº·t hÃ ng -> xÃ¡c nháº­n mÃ³n, sá»‘ lÆ°á»£ng, tá»•ng tiá»n\n'
        + '10. Sau khi thÃªm giá» hÃ ng -> há»i muá»‘n Ä‘áº·t thÃªm hay thanh toÃ¡n\n'; 
}

// Xá»­ lÃ½ thÃªm mÃ³n vÃ o giá» hÃ ng qua chatbot
async function chatbotAddToCart(ma_nguoi_dung, items) {
    const results = { added: [], errors: [], gio_hang: null };

    for (const item of items) {
        try {
            let ma_mon = null;
            let dish = null;

            // TÃ¬m mÃ³n theo tÃªn
            if (item.ten_mon) {
                const [found] = await db.query(`
                    SELECT ma_mon, ten_mon, gia_tien, so_luong_ton, anh_mon, don_vi_tinh
                    FROM mon_an WHERE trang_thai = 1 AND ten_mon LIKE ?
                    ORDER BY CASE WHEN ten_mon LIKE ? THEN 1 WHEN ten_mon LIKE ? THEN 2 ELSE 3 END
                    LIMIT 1
                `, [`%${item.ten_mon}%`, `${item.ten_mon}`, `${item.ten_mon}%`]);

                if (found.length > 0) {
                    dish = found[0];
                    ma_mon = dish.ma_mon;
                } else {
                    results.errors.push(`KhÃ´ng tÃ¬m tháº¥y "${item.ten_mon}"`);
                    continue;
                }
            } else if (item.ma_mon) {
                const [found] = await db.query('SELECT * FROM mon_an WHERE ma_mon = ? AND trang_thai = 1', [item.ma_mon]);
                if (found.length > 0) {
                    dish = found[0];
                    ma_mon = dish.ma_mon;
                } else {
                    results.errors.push(`MÃ³n #${item.ma_mon} khÃ´ng tá»“n táº¡i`);
                    continue;
                }
            }

            if (!dish) continue;

            const soLuong = item.so_luong || 1;
            if (dish.so_luong_ton < soLuong) {
                results.errors.push(`"${dish.ten_mon}" háº¿t hÃ ng`);
                continue;
            }

            // Láº¥y/táº¡o giá» hÃ ng
            let [cartRows] = await db.query('SELECT * FROM gio_hang WHERE ma_nguoi_dung = ? AND trang_thai = "active"', [ma_nguoi_dung]);
            let ma_gio_hang;
            if (cartRows.length === 0) {
                const [result] = await db.query('INSERT INTO gio_hang (ma_nguoi_dung) VALUES (?)', [ma_nguoi_dung]);
                ma_gio_hang = result.insertId;
            } else {
                ma_gio_hang = cartRows[0].ma_gio_hang;
            }

            // Kiá»ƒm tra Ä‘Ã£ cÃ³ trong giá» chÆ°a
            const [existing] = await db.query('SELECT * FROM chi_tiet_gio_hang WHERE ma_gio_hang = ? AND ma_mon = ?', [ma_gio_hang, ma_mon]);
            if (existing.length > 0) {
                const newQty = Math.min(existing[0].so_luong + soLuong, 10);
                await db.query('UPDATE chi_tiet_gio_hang SET so_luong = ? WHERE ma_chi_tiet = ?', [newQty, existing[0].ma_chi_tiet]);
            } else {
                await db.query(
                    'INSERT INTO chi_tiet_gio_hang (ma_gio_hang, ma_mon, so_luong, gia_tai_thoi_diem) VALUES (?, ?, ?, ?)',
                    [ma_gio_hang, ma_mon, Math.min(soLuong, 10), dish.gia_tien]
                );
            }

            const price = new Intl.NumberFormat('vi-VN').format(dish.gia_tien);
            results.added.push({ ten_mon: dish.ten_mon, so_luong: soLuong, gia_tien: dish.gia_tien, price_formatted: price, anh_mon: dish.anh_mon, ma_mon: dish.ma_mon });
        } catch (error) {
            console.error('chatbotAddToCart item error:', error.message);
            results.errors.push(`Lá»—i thÃªm "${item.ten_mon || item.ma_mon}"`);
        }
    }

    // Láº¥y giá» hÃ ng cáº­p nháº­t
    results.gio_hang = await getCartByUserId(ma_nguoi_dung);
    return results;
}

// Láº¥y thÃ´ng tin giá» hÃ ng Ä‘á»ƒ chatbot hiá»ƒn thá»‹
async function chatbotGetCart(ma_nguoi_dung) {
    const gioHang = await getCartByUserId(ma_nguoi_dung);
    if (!gioHang || gioHang.items.length === 0) {
        return { has_items: false, summary: 'Giá» hÃ ng hiá»‡n Ä‘ang trá»‘ng.', gio_hang: gioHang };
    }

    const summary = gioHang.items.map(i => {
        const price = new Intl.NumberFormat('vi-VN').format(i.gia_tai_thoi_diem);
        return `- ${i.ten_mon}: ${i.so_luong} x ${price}Ä‘ = ${new Intl.NumberFormat('vi-VN').format(i.thanh_tien)}Ä‘`;
    }).join('\n');

    const total = new Intl.NumberFormat('vi-VN').format(gioHang.tong_tien);
    return {
        has_items: true,
        summary: `GIá»Ž HÃ€NG HIá»†N Táº I (${gioHang.so_luong} mÃ³n):\n${summary}\n\nTá»•ng cá»™ng: ${total}Ä‘`,
        gio_hang: gioHang
    };
}

// Láº¥y lá»‹ch sá»­ Ä‘Æ¡n hÃ ng cho chatbot
async function chatbotGetOrders(ma_nguoi_dung, limit = 5) {
    try {
        const [orders] = await db.query(`
            SELECT dh.ma_don_hang, dh.tong_tien, dh.trang_thai, dh.thoi_gian_tao,
                   GROUP_CONCAT(CONCAT(ct.so_luong, 'x ', m.ten_mon) SEPARATOR ', ') as danh_sach_mon
            FROM don_hang dh
            LEFT JOIN chi_tiet_don_hang ct ON dh.ma_don_hang = ct.ma_don_hang
            LEFT JOIN mon_an m ON ct.ma_mon = m.ma_mon
            WHERE dh.ma_nguoi_dung = ?
            GROUP BY dh.ma_don_hang
            ORDER BY dh.thoi_gian_tao DESC
            LIMIT ?
        `, [ma_nguoi_dung, limit]);

        if (orders.length === 0) return { has_orders: false, summary: 'Báº¡n chÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o.' };

        const statusMap = {
            'pending': 'Chá» xÃ¡c nháº­n', 'confirmed': 'ÄÃ£ xÃ¡c nháº­n',
            'preparing': 'Äang chuáº©n bá»‹', 'delivered': 'HoÃ n thÃ nh', 'cancelled': 'ÄÃ£ há»§y'
        };

        const summary = orders.map(o => {
            const total = new Intl.NumberFormat('vi-VN').format(o.tong_tien);
            const status = statusMap[o.trang_thai] || o.trang_thai;
            return `#${o.ma_don_hang} - ${status} - ${total}Ä‘\n  MÃ³n: ${o.danh_sach_mon}`;
        }).join('\n\n');

        return { has_orders: true, summary: `ÄÆ N HÃ€NG Gáº¦N ÄÃ‚Y:\n\n${summary}`, orders };
    } catch (error) {
        console.error('chatbotGetOrders error:', error.message);
        return { has_orders: false, summary: 'KhÃ´ng thá»ƒ láº¥y thÃ´ng tin Ä‘Æ¡n hÃ ng.' };
    }
}

// ==================== API TEST ====================

router.get('/test-data', async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM cai_dat');
        const settingsObj = {};
        settings.forEach(item => { settingsObj[item.setting_key] = item.setting_value; });
        const [categories] = await db.query('SELECT * FROM danh_muc WHERE trang_thai = 1');
        const [dishes] = await db.query('SELECT ma_mon, ten_mon, gia_tien, anh_mon FROM mon_an WHERE trang_thai = 1 LIMIT 10');
        
        res.json({
            success: true,
            data: {
                groq_api_key: process.env.GROQ_API_KEY ? 'Configured' : 'NOT SET',
                graphql: 'Enabled',
                settings: settingsObj,
                categories: categories.map(c => c.ten_danh_muc),
                dishes_sample: dishes.slice(0, 5).map(d => ({ ten: d.ten_mon, gia: d.gia_tien, anh: d.anh_mon }))
            }
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ==================== MAIN CHAT API (GraphQL-powered) ====================

async function generateLocalFallbackResponse(graphqlContext, message, settings, ma_nguoi_dung, cartResult = null) {
    const intent = graphqlContext.intent;
    
    const tenNhaHang = settings.ten_nha_hang || 'Nhà hàng Ẩm thực Phương Nam';
    const diaChi = settings.dia_chi || '123 Đường ABC, Phường 1, TP. Vĩnh Long';
    const soDienThoai = settings.so_dien_thoai || '0123 456 789';
    const email = settings.email || 'info@phuongnam.vn';
    const website = settings.website || 'phuongnam.vn';
    const gioMoCuaT2T6 = settings.gio_mo_cua_t2_t6 || '08:00-22:00';
    const gioMoCuaT7CN = settings.gio_mo_cua_t7_cn || '07:00-23:00';
    const phiGiaoHang = settings.phi_giao_hang || '20000';
    const mienPhiGiaoHangTu = settings.mien_phi_giao_hang_tu || '200000';

    const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

    // 1. Xem giỏ hàng
    if (intent.muon_xem_gio_hang) {
        if (!ma_nguoi_dung) {
            return 'Dạ để xem giỏ hàng của mình, anh/chị vui lòng đăng nhập trước giúp em nhé! 🌸';
        }
        const cartInfo = await chatbotGetCart(ma_nguoi_dung);
        if (cartInfo && cartInfo.has_items) {
            return `Giỏ hàng hiện tại của anh/chị gồm có:\n${cartInfo.summary}\n\nAnh/chị muốn đặt hàng luôn hay muốn thêm món gì khác không ạ? 💕`;
        }
        return 'Giỏ hàng của anh/chị hiện tại đang trống ạ! 🌸 Anh/chị có muốn tham khảo menu các món ngon bán chạy của nhà hàng không ạ?';
    }

    // 2. Xem đơn hàng
    if (intent.muon_xem_don_hang) {
        if (!ma_nguoi_dung) {
            return 'Dạ anh/chị vui lòng đăng nhập để xem lịch sử đơn hàng của mình nhé! 🌸';
        }
        const orderInfo = await chatbotGetOrders(ma_nguoi_dung);
        if (orderInfo && orderInfo.has_orders) {
            return `Lịch sử đơn hàng gần đây của anh/chị đây ạ:\n\n${orderInfo.summary}\n\nAnh/chị cần em kiểm tra chi tiết đơn hàng nào không ạ? 💕`;
        }
        return 'Dạ anh/chị chưa có đơn hàng nào tại hệ thống ạ. Hãy chọn món ngon và lên đơn ngay nhé, em sẽ hỗ trợ đắc lực ạ! 💕';
    }

    // 3. Thêm món vào giỏ hàng
    if ((intent.muon_them_gio_hang || intent.muon_dat_hang) && intent.mon_an_dat_hang.length > 0) {
        if (!ma_nguoi_dung) {
            return 'Dạ để đặt hàng hoặc thêm món vào giỏ, anh/chị vui lòng đăng nhập trước giúp em nhé! 🌸 Sau khi đăng nhập, anh/chị chỉ cần nói "đặt 2 phần phở bò, 1 cơm tấm" là em làm được ngay ạ! 💕';
        }
        const result = cartResult || await chatbotAddToCart(ma_nguoi_dung, intent.mon_an_dat_hang);
        if (result) {
            let response = '';
            if (result.added && result.added.length > 0) {
                const addedStr = result.added.map(a => `${a.so_luong}x ${a.ten_mon}`).join(', ');
                response += `Dạ em đã thêm **${addedStr}** vào giỏ hàng của anh/chị rồi ạ! 🛒\n\n`;
            }
            if (result.errors && result.errors.length > 0) {
                response += `Lưu ý nhỏ: ${result.errors.join(', ')} ạ.\n\n`;
            }
            if (result.gio_hang && result.gio_hang.items && result.gio_hang.items.length > 0) {
                const total = formatPrice(result.gio_hang.tong_tien);
                const gioHangSummary = result.gio_hang.items.map(i => `- ${i.ten_mon}: ${i.so_luong} phần`).join('\n');
                response += `GIỎ HÀNG HIỆN TẠI:\n${gioHangSummary}\nTổng cộng: ${total}. Anh/chị muốn đặt thêm món gì nữa hay thanh toán luôn ạ? 💕`;
            } else {
                response += `Anh/chị muốn chọn thêm món gì nữa không ạ?`;
            }
            return response;
        }
    }

    // 4. Muốn đặt hàng nhưng chưa chọn món
    if ((intent.muon_dat_hang || intent.muon_them_gio_hang) && intent.mon_an_dat_hang.length === 0) {
        if (!ma_nguoi_dung) {
            return 'Dạ anh/chị ơi, để đặt hàng qua chatbot, anh/chị vui lòng đăng nhập trước giúp em nhé! 🌸 Sau đó anh/chị chỉ cần gõ "Đặt 1 lẩu cá, 2 trà đá" là em lên đơn liền ạ! 💕';
        }
        let response = 'Dạ anh/chị muốn đặt món gì thế ạ? Anh/chị chỉ cần gõ tên món kèm số lượng (Ví dụ: "Đặt 1 phần cá tai tượng chiên xù") là em thêm vào giỏ hàng ngay ạ! 🍽️\n\n';
        if (graphqlContext.top_ban_chay && graphqlContext.top_ban_chay.length > 0) {
            response += 'Gợi ý các món bán chạy nhất của nhà hàng cho anh/chị:\n' + 
                graphqlContext.top_ban_chay.slice(0, 3).map((m, i) => `${i+1}. ${m.ten_mon} (${formatPrice(m.gia_tien)})`).join('\n');
        }
        return response;
    }

    // 5. Hỏi giờ mở cửa
    if (message.toLowerCase().includes('gio mo cua') || message.toLowerCase().includes('mo cua') || message.toLowerCase().includes('may gio')) {
        return `Dạ nhà hàng ${tenNhaHang} mở cửa phục vụ anh/chị vào các khung giờ sau ạ:\n` +
            `- Thứ 2 - Thứ 6: từ ${gioMoCuaT2T6} hàng ngày.\n` +
            `- Thứ 7 - Chủ Nhật: từ ${gioMoCuaT7CN} hàng ngày.\n\n` +
            `Rất mong được tiếp đón và phục vụ anh/chị tại quán ạ! 🌸💕`;
    }

    // 6. Hỏi thông tin địa chỉ, liên hệ
    if (intent.hoi_thong_tin || message.toLowerCase().includes('dia chi') || message.toLowerCase().includes('o dau') || message.toLowerCase().includes('sdt') || message.toLowerCase().includes('hotline')) {
        return `Dạ em xin gửi anh/chị thông tin liên hệ chính thức của nhà hàng ${tenNhaHang} ạ:\n` +
            `📍 Địa chỉ: ${diaChi}\n` +
            `📞 Hotline đặt bàn: ${soDienThoai}\n` +
            `📧 Email hỗ trợ: ${email}\n` +
            `🌐 Website: ${website}\n\n` +
            `Anh/chị có thể gọi hotline để đặt bàn trước hoặc đặt trực tiếp qua em nhé! 💕🌸`;
    }

    // 7. Hỏi giao hàng / phí giao hàng
    if (intent.hoi_giao_hang || message.toLowerCase().includes('giao hang') || message.toLowerCase().includes('ship')) {
        return `Dạ bên em có dịch vụ giao hàng tận nơi cho anh/chị đấy ạ! 🛵\n` +
            `- Phí giao hàng: ${formatPrice(phiGiaoHang)} đồng toàn khu vực.\n` +
            `- Đặc biệt: Miễn phí giao hàng hoàn toàn cho đơn hàng từ ${formatPrice(mienPhiGiaoHangTu)} đồng trở lên ạ!\n\n` +
            `Anh/chị chỉ cần chọn món và điền địa chỉ giao hàng lúc thanh toán nhé! 💕`;
    }

    // 8. Hỏi đặt bàn
    if (intent.hoi_dat_ban) {
        return `Dạ để đặt bàn trước tại nhà hàng, anh/chị vui lòng nhấn vào mục **Đặt Bàn** trên thanh menu hoặc gọi trực tiếp đến Hotline: **${soDienThoai}** để bên em chuẩn bị chỗ ngồi đẹp nhất cho mình ạ! 📞 Cảm ơn anh/chị rất nhiều! 💕`;
    }

    // 9. Hỏi khuyến mãi
    if (intent.hoi_khuyen_mai) {
        return `Dạ hiện tại nhà hàng ${tenNhaHang} đang có chương trình khuyến mãi vô cùng hấp dẫn đấy ạ! 🎉\n` +
            `- Miễn phí giao hàng cho đơn hàng đạt giá trị tối thiểu ${formatPrice(mienPhiGiaoHangTu)} đồng.\n` +
            `- Tích điểm thành viên đổi quà cho khách hàng thân thiết.\n\n` +
            `Anh/chị hãy đặt món ngay để được hưởng các ưu đãi tốt nhất nhé! 🎁💕`;
    }

    // 10. Tìm thấy món ăn cụ thể phù hợp
    if (graphqlContext.has_food_data) {
        let response = `Dạ em tìm thấy các món ăn vô cùng hấp dẫn phù hợp với yêu cầu của anh/chị đây ạ: 🍽️\n\n`;
        response += graphqlContext.mon_an_lien_quan.slice(0, 5).map(m => {
            return `- **${m.ten_mon}**: ${formatPrice(m.gia_tien)}/${m.don_vi_tinh || 'phần'} ${m.diem_danh_gia ? `(⭐ ${parseFloat(m.diem_danh_gia).toFixed(1)})` : ''}`;
        }).join('\n');
        response += `\n\nAnh/chị muốn đặt món nào không ạ? Chỉ cần nói "Đặt 1 phần [Tên món]" là em thêm vào giỏ hàng ngay ạ! 💕`;
        return response;
    }

    // 11. Hỏi thực đơn / menu nói chung
    if (intent.hoi_thuc_don || intent.hoi_mon_an) {
        let response = `Dạ nhà hàng em có thực đơn phong phú với rất nhiều món ngon đậm đà hương vị Phương Nam! 🌾 Em xin gợi ý các món nổi bật nhất:\n\n`;
        if (graphqlContext.top_ban_chay && graphqlContext.top_ban_chay.length > 0) {
            response += graphqlContext.top_ban_chay.slice(0, 5).map(m => {
                return `- **${m.ten_mon}**: ${formatPrice(m.gia_tien)} (${m.ten_danh_muc || 'Món chính'})`;
            }).join('\n');
        } else {
            response += `- Cá lóc nướng trui\n- Gà đốt ô thum\n- Lẩu mắm miền Tây\n- Cá tai tượng chiên xù`;
        }
        response += `\n\nAnh/chị có thể xem thực đơn đầy đủ trên trang web hoặc gõ tên món để em tìm kiếm và đặt món giúp mình nhé! 💕🌸`;
        return response;
    }

    // 12. Fallback mặc định
    return `Dạ Trà My xin chào anh/chị ạ! 🌸 Em là trợ lý ảo hỗ trợ đặt món và giải đáp mọi thông tin của nhà hàng ${tenNhaHang}.\n\n` +
        `Hiện tại do lượt truy cập AI đang quá tải, em xin phép trả lời nhanh một số thông tin:\n` +
        `📍 Địa chỉ nhà hàng: ${diaChi}\n` +
        `📞 Hotline: ${soDienThoai}\n` +
        `🕐 Giờ mở cửa: ${gioMoCuaT2T6} (T2-T6) và ${gioMoCuaT7CN} (T7-CN).\n\n` +
        `Anh/chị có thể gõ "Xem thực đơn", "Đặt bàn", "Giờ mở cửa", hoặc gõ tên món ăn để em tư vấn trực tiếp nhé! 💕🌸`;
}

router.post('/chat', async (req, res) => {
    let graphqlContext = null;
    let settings = null;
    let ma_nguoi_dung = null;
    let chatSessionId = null;
    let cartResult = null;
    
    try {
        const { message, session_id } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui long nhap tin nhan' });
        }
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY_NOT_SET');
        }

        ma_nguoi_dung = getUserFromToken(req);
        chatSessionId = session_id || 'guest_' + Date.now();

        await saveChatHistory(ma_nguoi_dung, chatSessionId, 'user', message.trim());

        // GraphQL: Lay context chinh xac
        console.log('GraphQL: Analyzing message...');
        graphqlContext = await getChatbotContextForMessage(message);
        settings = await getRestaurantSettings();

        const tenNhaHang = settings.ten_nha_hang || 'Nha hang Am thuc Phuong Nam';
        const diaChi = settings.dia_chi || '123 Duong ABC, Phuong 1, TP. Vinh Long';
        const soDienThoai = settings.so_dien_thoai || '0123 456 789';
        const email = settings.email || 'info@phuongnam.vn';
        const website = settings.website || 'phuongnam.vn';
        const gioMoCuaT2T6 = settings.gio_mo_cua_t2_t6 || '08:00-22:00';
        const gioMoCuaT7CN = settings.gio_mo_cua_t7_cn || '07:00-23:00';
        const phiGiaoHang = settings.phi_giao_hang || '20000';
        const mienPhiGiaoHangTu = settings.mien_phi_giao_hang_tu || '200000';

        console.log('Intent:', JSON.stringify({
            food: graphqlContext.intent.hoi_mon_an,
            menu: graphqlContext.intent.hoi_thuc_don,
            price: graphqlContext.intent.hoi_gia,
            top: graphqlContext.intent.hoi_top_ban_chay,
            info: graphqlContext.intent.hoi_thong_tin,
            dishes_found: graphqlContext.mon_an_lien_quan.length,
            order: graphqlContext.intent.muon_dat_hang,
            add_cart: graphqlContext.intent.muon_them_gio_hang,
            view_cart: graphqlContext.intent.muon_xem_gio_hang,
            view_orders: graphqlContext.intent.muon_xem_don_hang,
            order_items: graphqlContext.intent.mon_an_dat_hang
        }));

        // ==================== Xá»¬ LÃ Äáº¶T HÃ€NG QUA CHATBOT ====================
        
        // 1. Xem giá» hÃ ng
        if (graphqlContext.intent.muon_xem_gio_hang && ma_nguoi_dung) {
            const cartInfo = await chatbotGetCart(ma_nguoi_dung);
            
            const cartPrompt = cartInfo.has_items 
                ? `\n=== GIá»Ž HÃ€NG HIá»†N Táº I ===\n${cartInfo.summary}\n\nHÃ£y tÃ³m táº¯t giá» hÃ ng cho khÃ¡ch vÃ  há»i khÃ¡ch muá»‘n Ä‘áº·t hÃ ng hay thÃªm mÃ³n gÃ¬ khÃ¡c.`
                : `\nGiá» hÃ ng cá»§a khÃ¡ch Ä‘ang trá»‘ng. HÃ£y gá»£i Ã½ má»™t vÃ i mÃ³n Äƒn ngon cho khÃ¡ch.`;
            
            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPromptBase(tenNhaHang, diaChi, soDienThoai, email, website, gioMoCuaT2T6, gioMoCuaT7CN, phiGiaoHang, mienPhiGiaoHangTu) + cartPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.6
            });

            const botResponse = completion.choices[0]?.message?.content || 'Em khÃ´ng láº¥y Ä‘Æ°á»£c thÃ´ng tin giá» hÃ ng áº¡!';
            await saveChatHistory(ma_nguoi_dung, chatSessionId, 'bot', botResponse);

            return res.json({
                success: true,
                data: {
                    response: botResponse,
                    source: 'groq+graphql+cart',
                    action: 'view_cart',
                    gio_hang: cartInfo.gio_hang
                }
            });
        }

        // 2. Xem Ä‘Æ¡n hÃ ng
        if (graphqlContext.intent.muon_xem_don_hang && ma_nguoi_dung) {
            const orderInfo = await chatbotGetOrders(ma_nguoi_dung);
            
            const orderPrompt = orderInfo.has_orders
                ? `\n=== ÄÆ N HÃ€NG Cá»¦A KHÃCH ===\n${orderInfo.summary}\n\nHÃ£y tÃ³m táº¯t cÃ¡c Ä‘Æ¡n hÃ ng cho khÃ¡ch.`
                : `\nKhÃ¡ch chÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o. Gá»£i Ã½ khÃ¡ch xem thá»±c Ä‘Æ¡n vÃ  Ä‘áº·t hÃ ng.`;

            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPromptBase(tenNhaHang, diaChi, soDienThoai, email, website, gioMoCuaT2T6, gioMoCuaT7CN, phiGiaoHang, mienPhiGiaoHangTu) + orderPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.6
            });

            const botResponse = completion.choices[0]?.message?.content || 'Em khÃ´ng láº¥y Ä‘Æ°á»£c thÃ´ng tin Ä‘Æ¡n hÃ ng áº¡!';
            await saveChatHistory(ma_nguoi_dung, chatSessionId, 'bot', botResponse);

            return res.json({
                success: true,
                data: {
                    response: botResponse,
                    source: 'groq+graphql+orders',
                    action: 'view_orders',
                    orders: orderInfo.orders || []
                }
            });
        }

        // 3. ThÃªm mÃ³n vÃ o giá» hÃ ng
        if ((graphqlContext.intent.muon_them_gio_hang || graphqlContext.intent.muon_dat_hang) 
            && graphqlContext.intent.mon_an_dat_hang.length > 0 && ma_nguoi_dung) {
            
            console.log('ðŸ›’ Chatbot: Adding to cart:', graphqlContext.intent.mon_an_dat_hang);
            cartResult = await chatbotAddToCart(ma_nguoi_dung, graphqlContext.intent.mon_an_dat_hang);
            
            let actionPrompt = '';
            if (cartResult.added.length > 0) {
                const addedList = cartResult.added.map(a => `${a.so_luong}x ${a.ten_mon} (${a.price_formatted}Ä‘)`).join(', ');
                actionPrompt += `\n=== ÄÃƒ THÃŠM VÃ€O GIá»Ž HÃ€NG ===\n${addedList}\n`;
            }
            if (cartResult.errors.length > 0) {
                actionPrompt += `\nLá»—i: ${cartResult.errors.join(', ')}\n`;
            }
            if (cartResult.gio_hang && cartResult.gio_hang.items.length > 0) {
                const gioHangSummary = cartResult.gio_hang.items.map(i => `- ${i.ten_mon}: ${i.so_luong} pháº§n`).join('\n');
                const total = new Intl.NumberFormat('vi-VN').format(cartResult.gio_hang.tong_tien);
                actionPrompt += `\nGIá»Ž HÃ€NG HIá»†N Táº I:\n${gioHangSummary}\nTá»•ng cá»™ng: ${total}Ä‘\n`;
            }
            actionPrompt += `\nHÃ£y xÃ¡c nháº­n Ä‘Ã£ thÃªm mÃ³n vÃ o giá» hÃ ng vÃ  há»i khÃ¡ch muá»‘n Ä‘áº·t hÃ ng hay thÃªm mÃ³n gÃ¬ khÃ¡c. Ngáº¯n gá»n, thÃ¢n thiá»‡n.`;

            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPromptBase(tenNhaHang, diaChi, soDienThoai, email, website, gioMoCuaT2T6, gioMoCuaT7CN, phiGiaoHang, mienPhiGiaoHangTu) + actionPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.6
            });

            const botResponse = completion.choices[0]?.message?.content || 'Em Ä‘Ã£ thÃªm mÃ³n vÃ o giá» hÃ ng rá»“i áº¡! ðŸ›’';
            await saveChatHistory(ma_nguoi_dung, chatSessionId, 'bot', botResponse);

            return res.json({
                success: true,
                data: {
                    response: botResponse,
                    source: 'groq+graphql+cart',
                    action: 'add_to_cart',
                    added_items: cartResult.added,
                    errors: cartResult.errors,
                    gio_hang: cartResult.gio_hang,
                    dishes: cartResult.added.map(a => ({
                        ma_mon: a.ma_mon,
                        ten_mon: a.ten_mon,
                        gia_tien: a.gia_tien,
                        anh_mon: a.anh_mon,
                        so_luong: a.so_luong
                    }))
                }
            });
        }

        // 4. YÃªu cáº§u Ä‘áº·t hÃ ng nhÆ°ng chÆ°a chá»n mÃ³n (hÆ°á»›ng dáº«n)
        if ((graphqlContext.intent.muon_dat_hang || graphqlContext.intent.muon_them_gio_hang) 
            && graphqlContext.intent.mon_an_dat_hang.length === 0) {
            
            // CÃ³ thá»ƒ user chÆ°a Ä‘Äƒng nháº­p
            if (!ma_nguoi_dung) {
                const botResponse = 'Anh/chá»‹ Æ¡i, Ä‘á»ƒ Ä‘áº·t hÃ ng qua chatbot, anh/chá»‹ cáº§n Ä‘Äƒng nháº­p trÆ°á»›c áº¡! ðŸŒ¸ Sau khi Ä‘Äƒng nháº­p, anh/chá»‹ chá»‰ cáº§n nÃ³i: "Äáº·t 2 pháº§n phá»Ÿ bÃ², 1 cÆ¡m táº¥m" lÃ  em xá»­ lÃ½ ngay áº¡! ðŸ’•';
                await saveChatHistory(ma_nguoi_dung, chatSessionId, 'bot', botResponse);
                return res.json({
                    success: true,
                    data: {
                        response: botResponse,
                        source: 'groq+graphql',
                        action: 'require_login'
                    }
                });
            }
            
            // ÄÃ£ Ä‘Äƒng nháº­p nhÆ°ng chÆ°a chá»n mÃ³n -> gá»£i Ã½
            let suggestPrompt = '\nKhÃ¡ch muá»‘n Ä‘áº·t hÃ ng nhÆ°ng chÆ°a chá»n mÃ³n cá»¥ thá»ƒ. HÃ£y há»i khÃ¡ch muá»‘n Ä‘áº·t mÃ³n gÃ¬ vÃ  gá»£i Ã½ top mÃ³n bÃ¡n cháº¡y.';
            if (graphqlContext.top_ban_chay.length > 0) {
                suggestPrompt += '\n=== Gá»¢I Ã ===\n' + graphqlContext.top_ban_chay.map((p, i) => (i + 1) + '. ' + p.ten_mon + ' - ' + new Intl.NumberFormat('vi-VN').format(p.gia_tien) + 'Ä‘').join('\n');
            }
            suggestPrompt += '\n\nHÆ°á»›ng dáº«n: "Chá»‰ cáº§n nÃ³i: Ä‘áº·t 2 pháº§n phá»Ÿ bÃ², 1 cÆ¡m táº¥m lÃ  em thÃªm vÃ o giá» hÃ ng liá»n áº¡!"';

            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPromptBase(tenNhaHang, diaChi, soDienThoai, email, website, gioMoCuaT2T6, gioMoCuaT7CN, phiGiaoHang, mienPhiGiaoHangTu) + suggestPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.6
            });

            const botResponse = completion.choices[0]?.message?.content || 'Anh/chá»‹ muá»‘n Ä‘áº·t mÃ³n gÃ¬ áº¡? ðŸœ';
            await saveChatHistory(ma_nguoi_dung, chatSessionId, 'bot', botResponse);

            const responseData = {
                response: botResponse,
                source: 'groq+graphql',
                action: 'suggest_order'
            };
            if (graphqlContext.top_ban_chay.length > 0) {
                responseData.dishes = graphqlContext.top_ban_chay.map(m => ({
                    ma_mon: m.ma_mon, ten_mon: m.ten_mon, gia_tien: m.gia_tien,
                    anh_mon: m.anh_mon, ten_danh_muc: m.ten_danh_muc
                }));
            }

            return res.json({ success: true, data: responseData });
        }

        // ==================== Xá»¬ LÃ BÃŒNH THÆ¯á»œNG (há»i Ä‘Ã¡p) ====================

        // System Prompt toi uu
        let foodContextPrompt = '';
        
        if (graphqlContext.has_food_data) {
            foodContextPrompt = '\n=== MÃ“N Ä‚N LIÃŠN QUAN (GraphQL) ===\n' + graphqlContext.compact_menu + '\n\nQUA TRá»ŒNG: Tráº£ lá»i Dá»°A TRÃŠN dá»¯ liá»‡u trÃªn, kÃ¨m giÃ¡ chÃ­nh xÃ¡c. Ngáº¯n gá»n, trá»ng tÃ¢m.\n';
        } else if (graphqlContext.intent.hoi_mon_an || graphqlContext.intent.hoi_thuc_don) {
            const fullMenu = await getCompactMenu();
            foodContextPrompt = '\n=== THá»°C ÄÆ N ===\n' + fullMenu + '\n';
        }

        let topDishesPrompt = '';
        if (graphqlContext.top_ban_chay.length > 0) {
            topDishesPrompt = '\n=== TOP BÃN CHáº Y ===\n' + graphqlContext.top_ban_chay.map((p, i) => (i + 1) + '. ' + p.ten_mon + ' - ' + new Intl.NumberFormat('vi-VN').format(p.gia_tien) + 'Ä‘ (' + p.so_luong_ban + ' pháº§n)').join('\n') + '\n';
        }

        const systemPrompt = systemPromptBase(tenNhaHang, diaChi, soDienThoai, email, website, gioMoCuaT2T6, gioMoCuaT7CN, phiGiaoHang, mienPhiGiaoHangTu) + foodContextPrompt + topDishesPrompt;

        // Goi Groq AI
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 400,
            temperature: 0.6
        });
        
        if (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
            const botResponse = completion.choices[0].message.content;
            await saveChatHistory(ma_nguoi_dung, chatSessionId, 'bot', botResponse);
            
            const responseData = {
                response: botResponse,
                source: 'groq+graphql'
            };

            // Gui kem du lieu mon an (co anh) tu GraphQL
            if (graphqlContext.has_food_data) {
                responseData.dishes = graphqlContext.mon_an_lien_quan.map(m => ({
                    ma_mon: m.ma_mon,
                    ten_mon: m.ten_mon,
                    gia_tien: m.gia_tien,
                    don_vi_tinh: m.don_vi_tinh || 'phan',
                    anh_mon: m.anh_mon,
                    ten_danh_muc: m.ten_danh_muc,
                    mo_ta: m.mo_ta_chi_tiet ? m.mo_ta_chi_tiet.substring(0, 80) : '',
                    diem_danh_gia: m.diem_danh_gia || 0
                }));
            }

            if (graphqlContext.top_ban_chay.length > 0 && !graphqlContext.has_food_data) {
                responseData.dishes = graphqlContext.top_ban_chay.map(m => ({
                    ma_mon: m.ma_mon,
                    ten_mon: m.ten_mon,
                    gia_tien: m.gia_tien,
                    don_vi_tinh: m.don_vi_tinh || 'phan',
                    anh_mon: m.anh_mon,
                    ten_danh_muc: m.ten_danh_muc,
                    so_luong_ban: m.so_luong_ban
                }));
            }
            
            return res.json({ success: true, data: responseData });
        }

        return res.json({ success: false, message: 'KhÃ´ng nháº­n Ä‘Æ°á»£c pháº£n há»“i tá»« AI' });

    } catch (error) {
        console.warn('⚠️ Chatbot error occurred, triggering local DB fallback agent:', error.message);
        
        try {
            // Re-fetch context if not defined
            const fallbackContext = graphqlContext || await getChatbotContextForMessage(message);
            const fallbackSettings = settings || await getRestaurantSettings();
            
            const activeUserId = ma_nguoi_dung || getUserFromToken(req);
            const activeSessionId = chatSessionId || (req.body.session_id || 'guest_' + Date.now());
            
            // Build fallback response
            const botResponse = await generateLocalFallbackResponse(fallbackContext, message, fallbackSettings, activeUserId, cartResult);
            
            // Save to chat history
            await saveChatHistory(activeUserId, activeSessionId, 'bot', botResponse);
            
            const responseData = {
                response: botResponse,
                source: 'local_fallback_agent'
            };
            
            // Add dishes to UI just like normal flow!
            if (fallbackContext.has_food_data) {
                responseData.dishes = fallbackContext.mon_an_lien_quan.map(m => ({
                    ma_mon: m.ma_mon,
                    ten_mon: m.ten_mon,
                    gia_tien: m.gia_tien,
                    don_vi_tinh: m.don_vi_tinh || 'phan',
                    anh_mon: m.anh_mon,
                    ten_danh_muc: m.ten_danh_muc,
                    mo_ta: m.mo_ta_chi_tiet ? m.mo_ta_chi_tiet.substring(0, 80) : '',
                    diem_danh_gia: m.diem_danh_gia || 0
                }));
            } else if (fallbackContext.top_ban_chay && fallbackContext.top_ban_chay.length > 0) {
                responseData.dishes = fallbackContext.top_ban_chay.map(m => ({
                    ma_mon: m.ma_mon,
                    ten_mon: m.ten_mon,
                    gia_tien: m.gia_tien,
                    don_vi_tinh: m.don_vi_tinh || 'phan',
                    anh_mon: m.anh_mon,
                    ten_danh_muc: m.ten_danh_muc,
                    so_luong_ban: m.so_luong_ban
                }));
            }
            
            return res.json({ success: true, data: responseData });
            
        } catch (fallbackError) {
            console.error('Fatal fallback error:', fallbackError);
            return res.json({ success: false, message: 'Lỗi hệ thống: ' + error.message });
        }
    }
});

// ==================== GraphQL REST wrapper ====================

router.get('/graphql/search', async (req, res) => {
    try {
        const { q, category, min_price, max_price, sort, limit } = req.query;
        let query = 'SELECT m.ma_mon, m.ten_mon, m.mo_ta_chi_tiet, m.gia_tien, m.don_vi_tinh, m.anh_mon, d.ten_danh_muc, COALESCE(AVG(dg.so_sao), 0) as diem_danh_gia FROM mon_an m LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = \'approved\' WHERE m.trang_thai = 1';
        const params = [];

        if (q) { query += ' AND (m.ten_mon LIKE ? OR m.mo_ta_chi_tiet LIKE ?)'; params.push('%' + q + '%', '%' + q + '%'); }
        if (category) { query += ' AND d.ma_danh_muc = ?'; params.push(category); }
        if (min_price) { query += ' AND m.gia_tien >= ?'; params.push(parseFloat(min_price)); }
        if (max_price) { query += ' AND m.gia_tien <= ?'; params.push(parseFloat(max_price)); }

        query += ' GROUP BY m.ma_mon';
        switch (sort) {
            case 'price_asc': query += ' ORDER BY m.gia_tien ASC'; break;
            case 'price_desc': query += ' ORDER BY m.gia_tien DESC'; break;
            case 'rating': query += ' ORDER BY diem_danh_gia DESC'; break;
            default: query += ' ORDER BY m.ten_mon ASC';
        }
        query += ' LIMIT ' + (parseInt(limit) || 10);

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows.map(r => ({ ...r, diem_danh_gia: parseFloat(r.diem_danh_gia) || 0 })) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== CHATBOT ORDER API (GraphQL-powered) ====================

// API: ThÃªm mÃ³n vÃ o giá» hÃ ng qua chatbot
router.post('/order/add-to-cart', async (req, res) => {
    try {
        const ma_nguoi_dung = getUserFromToken(req);
        if (!ma_nguoi_dung) {
            return res.status(401).json({ success: false, message: 'Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ Ä‘áº·t hÃ ng' });
        }

        const { items } = req.body; // [{ten_mon, so_luong, ma_mon}]
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lÃ²ng chá»n mÃ³n Äƒn' });
        }

        const result = await chatbotAddToCart(ma_nguoi_dung, items);
        
        res.json({
            success: result.added.length > 0,
            data: {
                added: result.added,
                errors: result.errors,
                gio_hang: result.gio_hang
            },
            message: result.added.length > 0 
                ? `ÄÃ£ thÃªm ${result.added.length} mÃ³n vÃ o giá» hÃ ng`
                : 'KhÃ´ng thÃªm Ä‘Æ°á»£c mÃ³n nÃ o'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: Xem giá» hÃ ng qua chatbot
router.get('/order/cart', async (req, res) => {
    try {
        const ma_nguoi_dung = getUserFromToken(req);
        if (!ma_nguoi_dung) {
            return res.status(401).json({ success: false, message: 'Vui lÃ²ng Ä‘Äƒng nháº­p' });
        }

        const cartInfo = await chatbotGetCart(ma_nguoi_dung);
        res.json({ success: true, data: cartInfo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: Äáº·t hÃ ng tá»« giá» hÃ ng qua chatbot
router.post('/order/checkout', async (req, res) => {
    try {
        const ma_nguoi_dung = getUserFromToken(req);
        if (!ma_nguoi_dung) {
            return res.status(401).json({ success: false, message: 'Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ Ä‘áº·t hÃ ng' });
        }

        const { ten_nguoi_nhan, so_dien_thoai, dia_chi, tinh_thanh, quan_huyen, phuong_xa, ghi_chu, phuong_thuc_thanh_toan } = req.body;

        if (!ten_nguoi_nhan || !so_dien_thoai || !dia_chi) {
            return res.status(400).json({ success: false, message: 'Vui lÃ²ng cung cáº¥p thÃ´ng tin giao hÃ ng (tÃªn, SÄT, Ä‘á»‹a chá»‰)' });
        }

        // Láº¥y giá» hÃ ng
        const [cartRows] = await db.query('SELECT * FROM gio_hang WHERE ma_nguoi_dung = ? AND trang_thai = "active"', [ma_nguoi_dung]);
        if (cartRows.length === 0) {
            return res.status(400).json({ success: false, message: 'Giá» hÃ ng trá»‘ng' });
        }

        const ma_gio_hang = cartRows[0].ma_gio_hang;
        const [cartItems] = await db.query(`
            SELECT ct.ma_mon, ct.so_luong, ct.gia_tai_thoi_diem,
                   (ct.so_luong * ct.gia_tai_thoi_diem) as thanh_tien,
                   m.ten_mon, m.anh_mon, m.so_luong_ton
            FROM chi_tiet_gio_hang ct
            JOIN mon_an m ON ct.ma_mon = m.ma_mon
            WHERE ct.ma_gio_hang = ?
        `, [ma_gio_hang]);

        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Giá» hÃ ng trá»‘ng' });
        }

        // Kiá»ƒm tra tá»“n kho
        for (const item of cartItems) {
            if (item.so_luong_ton < item.so_luong) {
                return res.status(400).json({ success: false, message: `"${item.ten_mon}" khÃ´ng Ä‘á»§ sá»‘ lÆ°á»£ng (cÃ²n ${item.so_luong_ton})` });
            }
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const tong_tien_hang = cartItems.reduce((sum, item) => sum + parseFloat(item.thanh_tien), 0);
            const phi_giao_hang = tong_tien_hang >= 150000 ? 0 : 30000;
            const tong_tien = tong_tien_hang + phi_giao_hang;
            const dia_chi_day_du = [dia_chi, phuong_xa, quan_huyen, tinh_thanh].filter(Boolean).join(', ');

            // Táº¡o Ä‘Æ¡n hÃ ng
            const [orderResult] = await connection.query(
                `INSERT INTO don_hang (ma_nguoi_dung, ten_khach_vang_lai, so_dt_khach, dia_chi_giao, tong_tien, trang_thai, ghi_chu)
                 VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
                [ma_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, tong_tien, ghi_chu || null]
            );
            const ma_don_hang = orderResult.insertId;

            // Chi tiáº¿t + giáº£m tá»“n kho
            for (const item of cartItems) {
                await connection.query(
                    'INSERT INTO chi_tiet_don_hang (ma_don_hang, ma_mon, so_luong, gia_tai_thoi_diem) VALUES (?, ?, ?, ?)',
                    [ma_don_hang, item.ma_mon, item.so_luong, item.gia_tai_thoi_diem]
                );
                await connection.query('UPDATE mon_an SET so_luong_ton = so_luong_ton - ? WHERE ma_mon = ?', [item.so_luong, item.ma_mon]);
            }

            // Thanh toÃ¡n
            await connection.query(
                'INSERT INTO thanh_toan (ma_don_hang, so_tien, phuong_thuc, trang_thai) VALUES (?, ?, ?, ?)',
                [ma_don_hang, tong_tien, phuong_thuc_thanh_toan || 'cod', 'pending']
            );

            // ÄÃ¡nh dáº¥u giá» hÃ ng
            await connection.query('UPDATE gio_hang SET trang_thai = "ordered" WHERE ma_gio_hang = ?', [ma_gio_hang]);
            await connection.query('INSERT INTO gio_hang (ma_nguoi_dung, trang_thai) VALUES (?, "active")', [ma_nguoi_dung]);

            await connection.commit();

            res.json({
                success: true,
                message: `Äáº·t hÃ ng thÃ nh cÃ´ng! MÃ£ Ä‘Æ¡n: #${ma_don_hang}`,
                data: {
                    ma_don_hang,
                    tong_tien,
                    phi_giao_hang,
                    tong_tien_hang,
                    dia_chi_giao: dia_chi_day_du,
                    chi_tiet: cartItems.map(i => ({
                        ten_mon: i.ten_mon, so_luong: i.so_luong,
                        gia_tai_thoi_diem: i.gia_tai_thoi_diem, thanh_tien: i.thanh_tien
                    }))
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Chatbot checkout error:', error.message);
        res.status(500).json({ success: false, message: 'Lá»—i Ä‘áº·t hÃ ng: ' + error.message });
    }
});

// API: Äáº·t hÃ ng nhanh (chá»n mÃ³n + Ä‘áº·t luÃ´n khÃ´ng qua giá»)
router.post('/order/quick', async (req, res) => {
    try {
        const ma_nguoi_dung = getUserFromToken(req);
        if (!ma_nguoi_dung) {
            return res.status(401).json({ success: false, message: 'Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ Ä‘áº·t hÃ ng' });
        }

        const { items, ten_nguoi_nhan, so_dien_thoai, dia_chi, tinh_thanh, quan_huyen, phuong_xa, ghi_chu, phuong_thuc_thanh_toan } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'ChÆ°a chá»n mÃ³n' });
        if (!ten_nguoi_nhan || !so_dien_thoai || !dia_chi) {
            return res.status(400).json({ success: false, message: 'Thiáº¿u thÃ´ng tin giao hÃ ng' });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const orderItems = [];
            for (const item of items) {
                let ma_mon = item.ma_mon;
                if (!ma_mon && item.ten_mon) {
                    const [found] = await connection.query(
                        'SELECT ma_mon, ten_mon, gia_tien, so_luong_ton FROM mon_an WHERE trang_thai = 1 AND ten_mon LIKE ? LIMIT 1',
                        [`%${item.ten_mon}%`]
                    );
                    if (found.length === 0) {
                        await connection.rollback();
                        return res.status(400).json({ success: false, message: `KhÃ´ng tÃ¬m tháº¥y "${item.ten_mon}"` });
                    }
                    ma_mon = found[0].ma_mon;
                }

                const [dish] = await connection.query('SELECT * FROM mon_an WHERE ma_mon = ? AND trang_thai = 1', [ma_mon]);
                if (dish.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: `MÃ³n #${ma_mon} khÃ´ng tá»“n táº¡i` });
                }

                const soLuong = item.so_luong || 1;
                if (dish[0].so_luong_ton < soLuong) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: `"${dish[0].ten_mon}" háº¿t hÃ ng` });
                }

                orderItems.push({
                    ma_mon: dish[0].ma_mon, ten_mon: dish[0].ten_mon,
                    so_luong: soLuong, gia_tai_thoi_diem: dish[0].gia_tien,
                    thanh_tien: soLuong * dish[0].gia_tien
                });
            }

            const tong_tien_hang = orderItems.reduce((sum, i) => sum + i.thanh_tien, 0);
            const phi_giao_hang = tong_tien_hang >= 150000 ? 0 : 30000;
            const tong_tien = tong_tien_hang + phi_giao_hang;
            const dia_chi_day_du = [dia_chi, phuong_xa, quan_huyen, tinh_thanh].filter(Boolean).join(', ');

            const [orderResult] = await connection.query(
                `INSERT INTO don_hang (ma_nguoi_dung, ten_khach_vang_lai, so_dt_khach, dia_chi_giao, tong_tien, trang_thai, ghi_chu)
                 VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
                [ma_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, tong_tien, ghi_chu || null]
            );
            const ma_don_hang = orderResult.insertId;

            for (const item of orderItems) {
                await connection.query(
                    'INSERT INTO chi_tiet_don_hang (ma_don_hang, ma_mon, so_luong, gia_tai_thoi_diem) VALUES (?, ?, ?, ?)',
                    [ma_don_hang, item.ma_mon, item.so_luong, item.gia_tai_thoi_diem]
                );
                await connection.query('UPDATE mon_an SET so_luong_ton = so_luong_ton - ? WHERE ma_mon = ?', [item.so_luong, item.ma_mon]);
            }

            await connection.query(
                'INSERT INTO thanh_toan (ma_don_hang, so_tien, phuong_thuc, trang_thai) VALUES (?, ?, ?, ?)',
                [ma_don_hang, tong_tien, phuong_thuc_thanh_toan || 'cod', 'pending']
            );

            await connection.commit();

            res.json({
                success: true,
                message: `Äáº·t hÃ ng nhanh thÃ nh cÃ´ng! MÃ£ Ä‘Æ¡n: #${ma_don_hang}`,
                data: {
                    ma_don_hang, tong_tien, phi_giao_hang, tong_tien_hang,
                    chi_tiet: orderItems
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Chatbot quick order error:', error.message);
        res.status(500).json({ success: false, message: 'LÃ¡Â»â€”i: ' + error.message });
    }
});

// API: Xem Ä‘Æ¡n hÃ ng cá»§a user
router.get('/order/history', async (req, res) => {
    try {
        const ma_nguoi_dung = getUserFromToken(req);
        if (!ma_nguoi_dung) {
            return res.status(401).json({ success: false, message: 'Vui lÃ²ng Ä‘Äƒng nháº­p' });
        }

        const orderInfo = await chatbotGetOrders(ma_nguoi_dung, parseInt(req.query.limit) || 5);
        res.json({ success: true, data: orderInfo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== SESSION & HISTORY ====================

router.get('/sessions', async (req, res) => {
    try {
        const ma_nguoi_dung = getUserFromToken(req);
        if (!ma_nguoi_dung) return res.status(401).json({ success: false, message: 'Vui long dang nhap' });

        const [sessions] = await db.query(
            'SELECT session_id, MIN(thoi_diem_chat) as thoi_diem_chat, COUNT(*) as message_count FROM lich_su_chatbot WHERE ma_nguoi_dung = ? AND session_id IS NOT NULL GROUP BY session_id ORDER BY MIN(thoi_diem_chat) DESC LIMIT 50',
            [ma_nguoi_dung]
        );

        for (let session of sessions) {
            const [firstMsg] = await db.query(
                'SELECT noi_dung FROM lich_su_chatbot WHERE session_id = ? AND nguoi_gui = \'user\' ORDER BY thoi_diem_chat ASC LIMIT 1',
                [session.session_id]
            );
            session.first_message = firstMsg.length > 0 ? firstMsg[0].noi_dung : 'Cuoc tro chuyen';
        }

        res.json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Loi lay sessions' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const ma_nguoi_dung = getUserFromToken(req);
        if (!ma_nguoi_dung) return res.status(401).json({ success: false, message: 'Vui long dang nhap' });

        const [history] = await db.query(
            'SELECT ma_tin_nhan, nguoi_gui, noi_dung, thoi_diem_chat FROM lich_su_chatbot WHERE ma_nguoi_dung = ? ORDER BY thoi_diem_chat DESC LIMIT 100',
            [ma_nguoi_dung]
        );
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Loi lay lich su' });
    }
});

router.get('/history/:session_id', async (req, res) => {
    try {
        const [history] = await db.query(
            'SELECT ma_tin_nhan, nguoi_gui, noi_dung, thoi_diem_chat FROM lich_su_chatbot WHERE session_id = ? ORDER BY thoi_diem_chat ASC',
            [req.params.session_id]
        );
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Loi' });
    }
});

// ==================== ADMIN ====================

router.get('/admin/stats', async (req, res) => {
    try {
        const [totalMsg] = await db.query('SELECT COUNT(*) as count FROM lich_su_chatbot');
        const [totalSessions] = await db.query('SELECT COUNT(DISTINCT session_id) as count FROM lich_su_chatbot WHERE session_id IS NOT NULL');
        const [loggedUsers] = await db.query('SELECT COUNT(DISTINCT ma_nguoi_dung) as count FROM lich_su_chatbot WHERE ma_nguoi_dung IS NOT NULL');
        const [guestSessions] = await db.query('SELECT COUNT(DISTINCT session_id) as count FROM lich_su_chatbot WHERE ma_nguoi_dung IS NULL AND session_id IS NOT NULL');
        const [userMessages] = await db.query("SELECT COUNT(*) as count FROM lich_su_chatbot WHERE nguoi_gui = 'user'");
        const [botMessages] = await db.query("SELECT COUNT(*) as count FROM lich_su_chatbot WHERE nguoi_gui = 'bot'");
        const [dailyStats] = await db.query('SELECT DATE(thoi_diem_chat) as ngay, COUNT(*) as so_tin_nhan FROM lich_su_chatbot WHERE thoi_diem_chat >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(thoi_diem_chat) ORDER BY ngay ASC');

        res.json({
            success: true,
            data: { total_messages: totalMsg[0].count, total_sessions: totalSessions[0].count, logged_users: loggedUsers[0].count, guest_sessions: guestSessions[0].count, user_messages: userMessages[0].count, bot_messages: botMessages[0].count, daily_stats: dailyStats }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Loi thong ke' });
    }
});

router.get('/admin/history', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const { search, user_type, nguoi_gui } = req.query;

        let whereClause = '1=1';
        const params = [];
        if (search) { whereClause += ' AND l.noi_dung LIKE ?'; params.push('%' + search + '%'); }
        if (user_type === 'logged') whereClause += ' AND l.ma_nguoi_dung IS NOT NULL';
        else if (user_type === 'guest') whereClause += ' AND l.ma_nguoi_dung IS NULL';
        if (nguoi_gui) { whereClause += ' AND l.nguoi_gui = ?'; params.push(nguoi_gui); }

        const [countResult] = await db.query('SELECT COUNT(*) as total FROM lich_su_chatbot l WHERE ' + whereClause, params);
        const [history] = await db.query(
            'SELECT l.*, n.ten_nguoi_dung, n.email FROM lich_su_chatbot l LEFT JOIN nguoi_dung n ON l.ma_nguoi_dung = n.ma_nguoi_dung WHERE ' + whereClause + ' ORDER BY l.thoi_diem_chat DESC LIMIT ? OFFSET ?',
            [...params, limit, offset]
        );

        res.json({ success: true, data: history, pagination: { page, limit, total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / limit) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Loi' });
    }
});

router.get('/admin/session/:session_id', async (req, res) => {
    try {
        const [messages] = await db.query(
            'SELECT l.*, n.ten_nguoi_dung, n.email FROM lich_su_chatbot l LEFT JOIN nguoi_dung n ON l.ma_nguoi_dung = n.ma_nguoi_dung WHERE l.session_id = ? ORDER BY l.thoi_diem_chat ASC',
            [req.params.session_id]
        );
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Loi' });
    }
});

// API cho user load lá»‹ch sá»­ chat cá»§a session hiá»‡n táº¡i (khÃ´ng cáº§n admin)
router.get('/history/:session_id', async (req, res) => {
    try {
        const sessionId = req.params.session_id;
        
        // Láº¥y lá»‹ch sá»­ chat cá»§a session nÃ y (giá»›i háº¡n 50 tin nháº¯n gáº§n nháº¥t)
        const [messages] = await db.query(
            `SELECT ma_tin_nhan, session_id, nguoi_gui, noi_dung, thoi_diem_chat 
             FROM lich_su_chatbot 
             WHERE session_id = ? 
             ORDER BY thoi_diem_chat ASC 
             LIMIT 50`,
            [sessionId]
        );
        
        console.log(`ðŸ“œ Loaded ${messages.length} messages for session: ${sessionId}`);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error loading chat history:', error);
        res.status(500).json({ success: false, message: 'Lá»—i táº£i lá»‹ch sá»­ chat' });
    }
});

router.delete('/admin/message/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM lich_su_chatbot WHERE ma_tin_nhan = ?', [req.params.id]);
        res.json({ success: true, message: 'Da xoa' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Loi xoa' });
    }
});

module.exports = router;



