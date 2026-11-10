const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const { createAdminNotification } = require('./admin-notifications');

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../images'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'));
        }
    }
});

// Middleware kiểm tra admin
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

// API cho Admin - Lấy tất cả tin tức (bao gồm cả ẩn)
router.get('/admin/all', requireAdmin, async (req, res) => {
    try {
        const [news] = await db.query(`
            SELECT 
                t.ma_tin_tuc,
                t.tieu_de,
                t.tom_tat,
                t.noi_dung,
                t.anh_dai_dien,
                t.ngay_dang,
                t.luot_xem,
                t.trang_thai,
                a.ten_hien_thi as tac_gia
            FROM tin_tuc t
            LEFT JOIN admin a ON t.ma_admin_dang = a.ma_admin
            ORDER BY t.ngay_dang DESC
        `);

        res.json({
            success: true,
            data: news
        });

    } catch (error) {
        console.error('Lỗi lấy tin tức admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// ===== ADMIN - QUẢN LÝ REACTIONS TIN TỨC (đặt trước /:id) =====

// Lấy tất cả reactions (Admin)
router.get('/admin/reactions/all', requireAdmin, async (req, res) => {
    try {
        const [reactions] = await db.query(`
            SELECT 
                cx.ma_cam_xuc,
                cx.ma_tin_tuc,
                cx.ma_nguoi_dung,
                cx.loai_cam_xuc,
                cx.ngay_tao,
                t.tieu_de,
                nd.ten_nguoi_dung,
                nd.email,
                nd.anh_dai_dien
            FROM cam_xuc_tin_tuc cx
            LEFT JOIN tin_tuc t ON cx.ma_tin_tuc = t.ma_tin_tuc
            LEFT JOIN nguoi_dung nd ON cx.ma_nguoi_dung = nd.ma_nguoi_dung
            ORDER BY cx.ngay_tao DESC
        `);
        res.json({ success: true, data: reactions });
    } catch (error) {
        console.error('Lỗi lấy reactions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Cập nhật reaction (Admin)
router.put('/admin/reactions/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { loai_cam_xuc } = req.body;
        const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
        if (!validReactions.includes(loai_cam_xuc)) {
            return res.status(400).json({ success: false, message: 'Loại reaction không hợp lệ' });
        }
        const [result] = await db.query('UPDATE cam_xuc_tin_tuc SET loai_cam_xuc = ? WHERE ma_cam_xuc = ?', [loai_cam_xuc, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy reaction' });
        }
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật reaction:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Xóa reaction (Admin)
router.delete('/admin/reactions/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM cam_xuc_tin_tuc WHERE ma_cam_xuc = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy reaction' });
        }
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.error('Lỗi xóa reaction:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Xóa nhiều reactions (Admin)
router.post('/admin/reactions/bulk-delete', requireAdmin, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách ID không hợp lệ' });
        }
        const [result] = await db.query('DELETE FROM cam_xuc_tin_tuc WHERE ma_cam_xuc IN (?)', [ids]);
        res.json({ success: true, message: `Đã xóa ${result.affectedRows} reactions` });
    } catch (error) {
        console.error('Lỗi xóa reactions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Xóa tất cả reactions của một tin tức (Admin)
router.delete('/admin/reactions/news/:newsId', requireAdmin, async (req, res) => {
    try {
        const { newsId } = req.params;
        const [result] = await db.query('DELETE FROM cam_xuc_tin_tuc WHERE ma_tin_tuc = ?', [newsId]);
        res.json({ success: true, message: `Đã xóa ${result.affectedRows} reactions` });
    } catch (error) {
        console.error('Lỗi xóa reactions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Lấy tất cả tin tức (có phân trang) - chỉ tin đã đăng
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Đếm tổng số tin tức
        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM tin_tuc WHERE trang_thai = 1'
        );
        const total = countResult[0].total;

        // Lấy danh sách tin tức với thông tin admin
        const [news] = await db.query(`
            SELECT 
                t.ma_tin_tuc,
                t.tieu_de,
                t.tom_tat,
                t.anh_dai_dien,
                t.ngay_dang,
                t.luot_xem,
                a.ten_hien_thi as tac_gia
            FROM tin_tuc t
            LEFT JOIN admin a ON t.ma_admin_dang = a.ma_admin
            WHERE t.trang_thai = 1
            ORDER BY t.ngay_dang DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);

        res.json({
            success: true,
            data: news,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Lỗi lấy tin tức:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Lấy tin tức nổi bật (mới nhất)
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;

        const [news] = await db.query(
            `SELECT 
                t.ma_tin_tuc,
                t.tieu_de,
                t.tom_tat,
                t.anh_dai_dien,
                t.ngay_dang,
                t.luot_xem,
                a.ten_hien_thi as tac_gia
            FROM tin_tuc t
            LEFT JOIN admin a ON t.ma_admin_dang = a.ma_admin
            WHERE t.trang_thai = 1
            ORDER BY t.ngay_dang DESC
            LIMIT ?`,
            [limit]
        );

        res.json({
            success: true,
            data: news
        });

    } catch (error) {
        console.error('Lỗi lấy tin nổi bật:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Lấy tin tức phổ biến (nhiều lượt xem nhất)
router.get('/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const [news] = await db.query(
            `SELECT 
                t.ma_tin_tuc,
                t.tieu_de,
                t.tom_tat,
                t.anh_dai_dien,
                t.ngay_dang,
                t.luot_xem
            FROM tin_tuc t
            WHERE t.trang_thai = 1
            ORDER BY t.luot_xem DESC, t.ngay_dang DESC
            LIMIT ?`,
            [limit]
        );

        res.json({
            success: true,
            data: news
        });

    } catch (error) {
        console.error('Lỗi lấy tin phổ biến:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Lấy chi tiết tin tức theo ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin tin tức
        const [news] = await db.query(
            `SELECT 
                t.ma_tin_tuc,
                t.tieu_de,
                t.tom_tat,
                t.noi_dung,
                t.anh_dai_dien,
                t.ngay_dang,
                t.luot_xem,
                a.ten_hien_thi as tac_gia
            FROM tin_tuc t
            LEFT JOIN admin a ON t.ma_admin_dang = a.ma_admin
            WHERE t.ma_tin_tuc = ? AND t.trang_thai = 1`,
            [id]
        );

        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Tăng lượt xem
        await db.query(
            'UPDATE tin_tuc SET luot_xem = luot_xem + 1 WHERE ma_tin_tuc = ?',
            [id]
        );

        // Lấy tin liên quan (cùng thời gian hoặc cùng tác giả)
        const [relatedNews] = await db.query(
            `SELECT 
                t.ma_tin_tuc,
                t.tieu_de,
                t.tom_tat,
                t.anh_dai_dien,
                t.ngay_dang,
                t.luot_xem
            FROM tin_tuc t
            WHERE t.ma_tin_tuc != ? AND t.trang_thai = 1
            ORDER BY t.ngay_dang DESC
            LIMIT 3`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...news[0],
                luot_xem: news[0].luot_xem + 1, // Cập nhật luôn số lượt xem
                related: relatedNews
            }
        });

    } catch (error) {
        console.error('Lỗi lấy chi tiết tin tức:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Tìm kiếm tin tức
router.get('/search/query', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm'
            });
        }

        const searchTerm = `%${q}%`;

        const [news] = await db.query(
            `SELECT 
                t.ma_tin_tuc,
                t.tieu_de,
                t.tom_tat,
                t.anh_dai_dien,
                t.ngay_dang,
                t.luot_xem,
                a.ten_hien_thi as tac_gia
            FROM tin_tuc t
            LEFT JOIN admin a ON t.ma_admin_dang = a.ma_admin
            WHERE t.trang_thai = 1 
            AND (t.tieu_de LIKE ? OR t.tom_tat LIKE ? OR t.noi_dung LIKE ?)
            ORDER BY t.ngay_dang DESC
            LIMIT 20`,
            [searchTerm, searchTerm, searchTerm]
        );

        res.json({
            success: true,
            data: news,
            count: news.length
        });

    } catch (error) {
        console.error('Lỗi tìm kiếm tin tức:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Thêm tin tức mới (Admin)
router.post('/', requireAdmin, upload.single('anh_dai_dien'), async (req, res) => {
    try {
        const { tieu_de, tom_tat, noi_dung, trang_thai } = req.body;
        const ma_admin_dang = req.session.admin?.ma_admin || null;
        const anh_dai_dien = req.file ? `images/${req.file.filename}` : null;
        
        const [result] = await db.query(
            `INSERT INTO tin_tuc (tieu_de, tom_tat, noi_dung, anh_dai_dien, ma_admin_dang, trang_thai, ngay_dang, luot_xem) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)`,
            [tieu_de, tom_tat || '', noi_dung, anh_dai_dien, ma_admin_dang, trang_thai || 1]
        );
        
        // Gửi thông báo cho tất cả users nếu tin tức được đăng (trang_thai = 1)
        if (trang_thai == 1 || trang_thai === '1') {
            try {
                const [users] = await db.query('SELECT ma_nguoi_dung FROM nguoi_dung WHERE trang_thai = 1');
                for (const user of users) {
                    await db.query(`
                        INSERT INTO thong_bao (ma_nguoi_dung, loai, tieu_de, noi_dung, duong_dan, ma_lien_quan)
                        VALUES (?, 'news', ?, ?, ?, ?)
                    `, [user.ma_nguoi_dung, `Bài viết mới: ${tieu_de}`, tom_tat || 'Xem ngay bài viết mới từ Phương Nam!', `/tin-tuc-chi-tiet/?id=${result.insertId}`, result.insertId]);
                }
                console.log(`📢 Đã gửi thông báo tin tức mới cho ${users.length} users`);
            } catch (notifError) {
                console.error('Lỗi gửi thông báo:', notifError.message);
            }
        }
        
        res.json({ success: true, message: 'Thêm tin tức thành công', id: result.insertId });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cập nhật tin tức (Admin)
router.put('/:id', requireAdmin, upload.single('anh_dai_dien'), async (req, res) => {
    try {
        const { tieu_de, tom_tat, noi_dung, trang_thai } = req.body;
        const anh_dai_dien = req.file ? `images/${req.file.filename}` : null;
        
        let query, params;
        if (anh_dai_dien) {
            query = `UPDATE tin_tuc 
                     SET tieu_de = ?, tom_tat = ?, noi_dung = ?, 
                         anh_dai_dien = ?, trang_thai = ?
                     WHERE ma_tin_tuc = ?`;
            params = [tieu_de, tom_tat, noi_dung, anh_dai_dien, trang_thai, req.params.id];
        } else {
            query = `UPDATE tin_tuc 
                     SET tieu_de = ?, tom_tat = ?, noi_dung = ?, trang_thai = ?
                     WHERE ma_tin_tuc = ?`;
            params = [tieu_de, tom_tat, noi_dung, trang_thai, req.params.id];
        }
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
        }
        
        res.json({ success: true, message: 'Cập nhật tin tức thành công' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Xóa tin tức (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM tin_tuc WHERE ma_tin_tuc = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
        }
        
        res.json({ success: true, message: 'Xóa tin tức thành công' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===== BÌNH LUẬN TIN TỨC =====

// Lấy bình luận của tin tức (bao gồm replies và reactions)
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy user hiện tại nếu có
        let currentUserId = null;
        if (req.session && req.session.user) {
            currentUserId = req.session.user.ma_nguoi_dung;
        } else {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                try {
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
                    currentUserId = decoded.ma_nguoi_dung;
                } catch (e) {}
            }
        }

        // Lấy tất cả bình luận (cả cha và con)
        const [allComments] = await db.query(
            `SELECT 
                bl.ma_binh_luan,
                bl.ma_binh_luan_cha,
                bl.noi_dung,
                bl.so_sao,
                bl.ngay_binh_luan,
                bl.ten_nguoi_binh_luan,
                bl.email_nguoi_binh_luan,
                bl.ma_nguoi_dung,
                nd.anh_dai_dien
            FROM binh_luan_tin_tuc bl
            LEFT JOIN nguoi_dung nd ON bl.ma_nguoi_dung = nd.ma_nguoi_dung
            WHERE bl.ma_tin_tuc = ? AND bl.trang_thai = 'approved'
            ORDER BY bl.ngay_binh_luan ASC`,
            [id]
        );

        // Lấy reactions cho tất cả bình luận
        const commentIds = allComments.map(c => c.ma_binh_luan);
        let reactionsMap = {};
        let userReactionsMap = {};

        if (commentIds.length > 0) {
            const [reactions] = await db.query(
                `SELECT ma_binh_luan, loai_cam_xuc, COUNT(*) as count
                 FROM cam_xuc_binh_luan
                 WHERE ma_binh_luan IN (?)
                 GROUP BY ma_binh_luan, loai_cam_xuc`,
                [commentIds]
            );

            reactions.forEach(r => {
                if (!reactionsMap[r.ma_binh_luan]) {
                    reactionsMap[r.ma_binh_luan] = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
                }
                reactionsMap[r.ma_binh_luan][r.loai_cam_xuc] = r.count;
            });

            // Lấy reaction của user hiện tại
            if (currentUserId) {
                const [userReactions] = await db.query(
                    `SELECT ma_binh_luan, loai_cam_xuc FROM cam_xuc_binh_luan
                     WHERE ma_binh_luan IN (?) AND ma_nguoi_dung = ?`,
                    [commentIds, currentUserId]
                );
                userReactions.forEach(r => {
                    userReactionsMap[r.ma_binh_luan] = r.loai_cam_xuc;
                });
            }
        }

        // Tổ chức comments theo cấu trúc cha-con
        const commentsWithData = allComments.map(comment => ({
            ...comment,
            reactions: reactionsMap[comment.ma_binh_luan] || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
            userReaction: userReactionsMap[comment.ma_binh_luan] || null,
            replies: []
        }));

        // Tạo map và tổ chức replies
        const commentMap = {};
        const rootComments = [];

        commentsWithData.forEach(comment => {
            commentMap[comment.ma_binh_luan] = comment;
        });

        commentsWithData.forEach(comment => {
            if (comment.ma_binh_luan_cha && commentMap[comment.ma_binh_luan_cha]) {
                commentMap[comment.ma_binh_luan_cha].replies.push(comment);
            } else if (!comment.ma_binh_luan_cha) {
                rootComments.push(comment);
            }
        });

        // Sắp xếp: mới nhất lên đầu
        rootComments.reverse();

        // Tính trung bình đánh giá
        const [avgRating] = await db.query(
            `SELECT 
                AVG(so_sao) as avg_rating,
                COUNT(CASE WHEN so_sao IS NOT NULL THEN 1 END) as total_ratings
            FROM binh_luan_tin_tuc
            WHERE ma_tin_tuc = ? AND trang_thai = 'approved' AND so_sao IS NOT NULL`,
            [id]
        );

        res.json({
            success: true,
            data: rootComments,
            total: allComments.length,
            rating: {
                average: avgRating[0].avg_rating ? parseFloat(avgRating[0].avg_rating).toFixed(1) : 0,
                total: avgRating[0].total_ratings
            }
        });

    } catch (error) {
        console.error('Lỗi lấy bình luận:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Admin trả lời bình luận tin tức (Cho phép nhiều replies)
router.post('/comments/:commentId/reply', async (req, res) => {
    try {
        // Kiểm tra admin đăng nhập
        if (!req.session || !req.session.admin) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Admin only'
            });
        }

        const { commentId } = req.params;
        const { noi_dung } = req.body;
        const adminName = req.session.admin.ten_hien_thi || 'Admin';

        if (!noi_dung) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung trả lời'
            });
        }

        // Kiểm tra bình luận cha có tồn tại không và lấy thông tin user
        const [parentComment] = await db.query(
            'SELECT ma_tin_tuc, ma_nguoi_dung FROM binh_luan_tin_tuc WHERE ma_binh_luan = ?',
            [commentId]
        );

        if (parentComment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        // Tạo reply mới (cho phép nhiều replies)
        const [result] = await db.query(
            `INSERT INTO binh_luan_tin_tuc 
            (ma_tin_tuc, ma_binh_luan_cha, ten_nguoi_binh_luan, email_nguoi_binh_luan, noi_dung, trang_thai) 
            VALUES (?, ?, ?, ?, ?, 'approved')`,
            [parentComment[0].ma_tin_tuc, commentId, adminName, 'admin@phuongnam.vn', noi_dung]
        );

        // Gửi thông báo cho người viết bình luận gốc
        if (parentComment[0].ma_nguoi_dung) {
            try {
                await db.query(`
                    INSERT INTO thong_bao (ma_nguoi_dung, loai, tieu_de, noi_dung, duong_dan, ma_lien_quan)
                    VALUES (?, 'comment_reply', ?, ?, ?, ?)
                `, [
                    parentComment[0].ma_nguoi_dung,
                    `Admin đã trả lời bình luận của bạn`,
                    noi_dung.substring(0, 100) + (noi_dung.length > 100 ? '...' : ''),
                    `/tin-tuc-chi-tiet/?id=${parentComment[0].ma_tin_tuc}`,
                    commentId
                ]);
                console.log(`📢 Đã gửi thông báo trả lời bình luận cho user ${parentComment[0].ma_nguoi_dung}`);
            } catch (notifError) {
                console.error('Lỗi gửi thông báo:', notifError.message);
            }
        }

        res.json({
            success: true,
            message: 'Trả lời bình luận thành công',
            data: {
                ma_binh_luan: result.insertId,
                is_update: false
            }
        });
    } catch (error) {
        console.error('Error replying to comment:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Thêm bình luận mới (Yêu cầu đăng nhập - hỗ trợ cả session và token)
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { noi_dung } = req.body;

        let ma_nguoi_dung, ten_nguoi_binh_luan, email_nguoi_binh_luan;

        // Kiểm tra đăng nhập qua session trước
        if (req.session && req.session.user) {
            ma_nguoi_dung = req.session.user.ma_nguoi_dung;
            ten_nguoi_binh_luan = req.session.user.ten_nguoi_dung;
            email_nguoi_binh_luan = req.session.user.email;
            console.log('✅ Auth via session:', email_nguoi_binh_luan);
        } 
        // Nếu không có session, kiểm tra token
        else {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập để bình luận'
                });
            }

            try {
                const jwt = require('jsonwebtoken');
                const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
                const decoded = jwt.verify(token, JWT_SECRET);
                
                // Lấy thông tin user từ database
                const [users] = await db.query(
                    'SELECT ma_nguoi_dung, ten_nguoi_dung, email FROM nguoi_dung WHERE ma_nguoi_dung = ?',
                    [decoded.ma_nguoi_dung]
                );
                
                if (users.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Token không hợp lệ'
                    });
                }
                
                ma_nguoi_dung = users[0].ma_nguoi_dung;
                ten_nguoi_binh_luan = users[0].ten_nguoi_dung;
                email_nguoi_binh_luan = users[0].email;
                console.log('✅ Auth via token:', email_nguoi_binh_luan);
            } catch (tokenError) {
                console.error('❌ Token error:', tokenError.message);
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ hoặc đã hết hạn'
                });
            }
        }

        if (!noi_dung) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung bình luận'
            });
        }

        // Kiểm tra tin tức có tồn tại không
        const [news] = await db.query(
            'SELECT ma_tin_tuc FROM tin_tuc WHERE ma_tin_tuc = ? AND trang_thai = 1',
            [id]
        );

        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Thêm bình luận
        const [result] = await db.query(
            `INSERT INTO binh_luan_tin_tuc 
            (ma_tin_tuc, ma_nguoi_dung, ten_nguoi_binh_luan, email_nguoi_binh_luan, noi_dung, trang_thai) 
            VALUES (?, ?, ?, ?, ?, 'approved')`,
            [id, ma_nguoi_dung, ten_nguoi_binh_luan, email_nguoi_binh_luan, noi_dung]
        );

        // Tạo thông báo cho admin
        const [newsInfo] = await db.query('SELECT tieu_de FROM tin_tuc WHERE ma_tin_tuc = ?', [id]);
        const newsTitle = newsInfo[0]?.tieu_de || 'tin tức';
        
        await createAdminNotification(
            'new_comment',
            `Bình luận mới từ ${ten_nguoi_binh_luan}`,
            `"${noi_dung.substring(0, 100)}${noi_dung.length > 100 ? '...' : ''}" - Tin tức: ${newsTitle}`,
            `/tin-tuc-chi-tiet/?id=${id}`,
            result.insertId
        );

        res.json({
            success: true,
            message: 'Bình luận đã được gửi thành công',
            data: {
                ma_binh_luan: result.insertId
            }
        });

    } catch (error) {
        console.error('Lỗi thêm bình luận:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// ===== CẢM XÚC TIN TỨC (REACTIONS) =====

// Lấy thống kê cảm xúc của tin tức
router.get('/:id/reactions', async (req, res) => {
    try {
        const { id } = req.params;
        const ma_nguoi_dung = req.session?.user?.ma_nguoi_dung;

        // Đếm số lượng mỗi loại cảm xúc
        const [reactions] = await db.query(
            `SELECT 
                loai_cam_xuc,
                COUNT(*) as count
            FROM cam_xuc_tin_tuc
            WHERE ma_tin_tuc = ?
            GROUP BY loai_cam_xuc`,
            [id]
        );

        // Tổng số cảm xúc
        const [total] = await db.query(
            'SELECT COUNT(*) as total FROM cam_xuc_tin_tuc WHERE ma_tin_tuc = ?',
            [id]
        );

        // Kiểm tra người dùng hiện tại đã thả cảm xúc chưa
        let userReaction = null;
        if (ma_nguoi_dung) {
            const [user] = await db.query(
                'SELECT loai_cam_xuc FROM cam_xuc_tin_tuc WHERE ma_tin_tuc = ? AND ma_nguoi_dung = ?',
                [id, ma_nguoi_dung]
            );
            userReaction = user.length > 0 ? user[0].loai_cam_xuc : null;
        }

        // Format kết quả
        const reactionCounts = {
            like: 0,
            love: 0,
            haha: 0,
            wow: 0,
            sad: 0,
            angry: 0
        };

        reactions.forEach(r => {
            reactionCounts[r.loai_cam_xuc] = r.count;
        });

        res.json({
            success: true,
            data: {
                reactions: reactionCounts,
                total: total[0].total,
                userReaction: userReaction
            }
        });

    } catch (error) {
        console.error('Lỗi lấy cảm xúc:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Thêm/Cập nhật cảm xúc (Yêu cầu đăng nhập - hỗ trợ cả session và token)
router.post('/:id/reactions', async (req, res) => {
    try {
        const { id } = req.params;
        const { loai_cam_xuc } = req.body;
        
        // Debug log
        console.log('📥 Reaction request:', { 
            id, 
            body: req.body, 
            loai_cam_xuc,
            contentType: req.headers['content-type'],
            bodyType: typeof req.body
        });

        let ma_nguoi_dung;

        // Kiểm tra đăng nhập qua session trước
        if (req.session && req.session.user) {
            ma_nguoi_dung = req.session.user.ma_nguoi_dung;
            console.log('✅ Reaction auth via session');
        } 
        // Nếu không có session, kiểm tra token
        else {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập để thả cảm xúc'
                });
            }

            try {
                const jwt = require('jsonwebtoken');
                const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
                const decoded = jwt.verify(token, JWT_SECRET);
                ma_nguoi_dung = decoded.ma_nguoi_dung;
                console.log('✅ Reaction auth via token');
            } catch (tokenError) {
                console.error('❌ Token error:', tokenError.message);
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ hoặc đã hết hạn'
                });
            }
        }

        // Validate loại cảm xúc
        const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
        if (!loai_cam_xuc) {
            console.error('❌ loai_cam_xuc is missing or undefined');
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn loại cảm xúc'
            });
        }
        if (!validReactions.includes(loai_cam_xuc)) {
            console.error('❌ Invalid loai_cam_xuc:', loai_cam_xuc);
            return res.status(400).json({
                success: false,
                message: `Loại cảm xúc không hợp lệ: ${loai_cam_xuc}`
            });
        }

        // Kiểm tra tin tức có tồn tại không
        const [news] = await db.query(
            'SELECT ma_tin_tuc FROM tin_tuc WHERE ma_tin_tuc = ? AND trang_thai = 1',
            [id]
        );

        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Kiểm tra đã thả cảm xúc chưa
        const [existing] = await db.query(
            'SELECT ma_cam_xuc, loai_cam_xuc FROM cam_xuc_tin_tuc WHERE ma_tin_tuc = ? AND ma_nguoi_dung = ?',
            [id, ma_nguoi_dung]
        );

        if (existing.length > 0) {
            // Nếu cùng loại cảm xúc thì xóa (unlike)
            if (existing[0].loai_cam_xuc === loai_cam_xuc) {
                await db.query(
                    'DELETE FROM cam_xuc_tin_tuc WHERE ma_cam_xuc = ?',
                    [existing[0].ma_cam_xuc]
                );
                return res.json({
                    success: true,
                    message: 'Đã bỏ cảm xúc',
                    action: 'removed'
                });
            } else {
                // Nếu khác loại thì cập nhật
                await db.query(
                    'UPDATE cam_xuc_tin_tuc SET loai_cam_xuc = ? WHERE ma_cam_xuc = ?',
                    [loai_cam_xuc, existing[0].ma_cam_xuc]
                );
                return res.json({
                    success: true,
                    message: 'Đã thay đổi cảm xúc',
                    action: 'updated'
                });
            }
        } else {
            // Thêm mới
            await db.query(
                'INSERT INTO cam_xuc_tin_tuc (ma_tin_tuc, ma_nguoi_dung, loai_cam_xuc) VALUES (?, ?, ?)',
                [id, ma_nguoi_dung, loai_cam_xuc]
            );
            
            // Tạo thông báo cho admin
            const [user] = await db.query('SELECT ten_nguoi_dung FROM nguoi_dung WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
            const [newsInfo] = await db.query('SELECT tieu_de FROM tin_tuc WHERE ma_tin_tuc = ?', [id]);
            const userName = user[0]?.ten_nguoi_dung || 'Người dùng';
            const newsTitle = newsInfo[0]?.tieu_de || 'tin tức';
            
            // Map emoji cho từng loại cảm xúc
            const emojiMap = {
                'like': '👍',
                'love': '❤️',
                'haha': '😂',
                'wow': '😮',
                'sad': '😢',
                'angry': '😠'
            };
            const emoji = emojiMap[loai_cam_xuc] || '👍';
            
            await createAdminNotification(
                'comment_like',
                `${userName} thả ${emoji} vào bài viết`,
                `Tin tức: "${newsTitle}"`,
                `/tin-tuc-chi-tiet/?id=${id}`,
                id
            );
            
            return res.json({
                success: true,
                message: 'Đã thả cảm xúc',
                action: 'added'
            });
        }

    } catch (error) {
        console.error('Lỗi thêm cảm xúc:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// ===== ADMIN - QUẢN LÝ BÌNH LUẬN =====

// Lấy tất cả bình luận (Admin) - bao gồm cả replies
router.get('/admin/comments/all', requireAdmin, async (req, res) => {
    try {
        const [comments] = await db.query(
            `SELECT 
                bl.ma_binh_luan,
                bl.ma_binh_luan_cha,
                bl.ma_tin_tuc,
                t.tieu_de as tieu_de_tin_tuc,
                bl.ten_nguoi_binh_luan,
                bl.email_nguoi_binh_luan,
                bl.noi_dung,
                bl.ngay_binh_luan,
                bl.trang_thai,
                nd.anh_dai_dien
            FROM binh_luan_tin_tuc bl
            LEFT JOIN tin_tuc t ON bl.ma_tin_tuc = t.ma_tin_tuc
            LEFT JOIN nguoi_dung nd ON bl.ma_nguoi_dung = nd.ma_nguoi_dung
            ORDER BY bl.ngay_binh_luan DESC`
        );

        res.json({
            success: true,
            data: comments
        });

    } catch (error) {
        console.error('Lỗi lấy bình luận admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Cập nhật trạng thái bình luận (Admin)
router.put('/admin/comments/:id/status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(trang_thai)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const [result] = await db.query(
            'UPDATE binh_luan_tin_tuc SET trang_thai = ? WHERE ma_binh_luan = ?',
            [trang_thai, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công'
        });

    } catch (error) {
        console.error('Lỗi cập nhật trạng thái:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xóa bình luận (Admin)
router.delete('/admin/comments/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM binh_luan_tin_tuc WHERE ma_binh_luan = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        res.json({
            success: true,
            message: 'Xóa bình luận thành công'
        });

    } catch (error) {
        console.error('Lỗi xóa bình luận:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// ===== REACTIONS CHO BÌNH LUẬN =====

// Lấy reactions của một bình luận
router.get('/comments/:commentId/reactions', async (req, res) => {
    try {
        const { commentId } = req.params;
        
        const [reactions] = await db.query(
            `SELECT loai_cam_xuc, COUNT(*) as count
             FROM cam_xuc_binh_luan
             WHERE ma_binh_luan = ?
             GROUP BY loai_cam_xuc`,
            [commentId]
        );

        const reactionCounts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
        reactions.forEach(r => { reactionCounts[r.loai_cam_xuc] = r.count; });

        const [total] = await db.query(
            'SELECT COUNT(*) as total FROM cam_xuc_binh_luan WHERE ma_binh_luan = ?',
            [commentId]
        );

        res.json({
            success: true,
            data: {
                reactions: reactionCounts,
                total: total[0].total
            }
        });
    } catch (error) {
        console.error('Lỗi lấy reactions bình luận:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Thêm/Cập nhật reaction cho bình luận
router.post('/comments/:commentId/reactions', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { loai_cam_xuc } = req.body;

        // Xác thực người dùng (session hoặc token)
        let ma_nguoi_dung, ten_nguoi_dung;
        if (req.session && req.session.user) {
            ma_nguoi_dung = req.session.user.ma_nguoi_dung;
            ten_nguoi_dung = req.session.user.ten_nguoi_dung;
        } else {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
            }
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
                ma_nguoi_dung = decoded.ma_nguoi_dung;
                // Lấy tên người dùng
                const [users] = await db.query('SELECT ten_nguoi_dung FROM nguoi_dung WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
                ten_nguoi_dung = users.length > 0 ? users[0].ten_nguoi_dung : 'Người dùng';
            } catch (e) {
                return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
            }
        }

        const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
        if (!validReactions.includes(loai_cam_xuc)) {
            return res.status(400).json({ success: false, message: 'Loại cảm xúc không hợp lệ' });
        }

        // Lấy thông tin bình luận và chủ bình luận
        const [commentInfo] = await db.query(
            'SELECT ma_nguoi_dung, ma_tin_tuc FROM binh_luan_tin_tuc WHERE ma_binh_luan = ?',
            [commentId]
        );

        // Kiểm tra đã có reaction chưa
        const [existing] = await db.query(
            'SELECT ma_cam_xuc, loai_cam_xuc FROM cam_xuc_binh_luan WHERE ma_binh_luan = ? AND ma_nguoi_dung = ?',
            [commentId, ma_nguoi_dung]
        );

        if (existing.length > 0) {
            if (existing[0].loai_cam_xuc === loai_cam_xuc) {
                // Xóa nếu cùng loại
                await db.query('DELETE FROM cam_xuc_binh_luan WHERE ma_cam_xuc = ?', [existing[0].ma_cam_xuc]);
                return res.json({ success: true, message: 'Đã bỏ cảm xúc', action: 'removed' });
            } else {
                // Cập nhật nếu khác loại
                await db.query('UPDATE cam_xuc_binh_luan SET loai_cam_xuc = ? WHERE ma_cam_xuc = ?', [loai_cam_xuc, existing[0].ma_cam_xuc]);
                return res.json({ success: true, message: 'Đã thay đổi cảm xúc', action: 'updated' });
            }
        } else {
            // Thêm mới
            await db.query(
                'INSERT INTO cam_xuc_binh_luan (ma_binh_luan, ma_nguoi_dung, loai_cam_xuc) VALUES (?, ?, ?)',
                [commentId, ma_nguoi_dung, loai_cam_xuc]
            );

            // Gửi thông báo cho chủ bình luận (nếu không phải chính mình)
            if (commentInfo.length > 0 && commentInfo[0].ma_nguoi_dung && commentInfo[0].ma_nguoi_dung !== ma_nguoi_dung) {
                const reactionEmoji = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😠' };
                try {
                    await db.query(`
                        INSERT INTO thong_bao (ma_nguoi_dung, loai, tieu_de, noi_dung, duong_dan, ma_lien_quan)
                        VALUES (?, 'comment_like', ?, ?, ?, ?)
                    `, [
                        commentInfo[0].ma_nguoi_dung,
                        `${ten_nguoi_dung} đã ${reactionEmoji[loai_cam_xuc]} bình luận của bạn`,
                        'Xem bình luận của bạn',
                        `/tin-tuc-chi-tiet/?id=${commentInfo[0].ma_tin_tuc}`,
                        commentId
                    ]);
                } catch (notifError) {
                    console.error('Lỗi gửi thông báo like:', notifError.message);
                }
            }
            
            // Tạo thông báo cho admin
            if (commentInfo.length > 0) {
                const reactionEmoji = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😠' };
                const [newsInfo] = await db.query('SELECT tieu_de FROM tin_tuc WHERE ma_tin_tuc = ?', [commentInfo[0].ma_tin_tuc]);
                const newsTitle = newsInfo[0]?.tieu_de || 'tin tức';
                
                await createAdminNotification(
                    'comment_like',
                    `${ten_nguoi_dung} thả ${reactionEmoji[loai_cam_xuc]} vào bình luận`,
                    `Tin tức: "${newsTitle}"`,
                    `/tin-tuc-chi-tiet/?id=${commentInfo[0].ma_tin_tuc}`,
                    commentId
                );
            }

            return res.json({ success: true, message: 'Đã thả cảm xúc', action: 'added' });
        }
    } catch (error) {
        console.error('Lỗi reaction bình luận:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ===== TRẢ LỜI BÌNH LUẬN =====

// Thêm reply cho bình luận
router.post('/comments/:commentId/replies', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { noi_dung } = req.body;

        // Xác thực người dùng
        let ma_nguoi_dung, ten_nguoi_binh_luan, email_nguoi_binh_luan;
        if (req.session && req.session.user) {
            ma_nguoi_dung = req.session.user.ma_nguoi_dung;
            ten_nguoi_binh_luan = req.session.user.ten_nguoi_dung;
            email_nguoi_binh_luan = req.session.user.email;
        } else {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để trả lời' });
            }
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
                const [users] = await db.query(
                    'SELECT ma_nguoi_dung, ten_nguoi_dung, email FROM nguoi_dung WHERE ma_nguoi_dung = ?',
                    [decoded.ma_nguoi_dung]
                );
                if (users.length === 0) {
                    return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
                }
                ma_nguoi_dung = users[0].ma_nguoi_dung;
                ten_nguoi_binh_luan = users[0].ten_nguoi_dung;
                email_nguoi_binh_luan = users[0].email;
            } catch (e) {
                return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
            }
        }

        if (!noi_dung || !noi_dung.trim()) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung trả lời' });
        }

        // Lấy ma_tin_tuc và ma_nguoi_dung từ bình luận cha
        const [parentComment] = await db.query(
            'SELECT ma_tin_tuc, ma_nguoi_dung FROM binh_luan_tin_tuc WHERE ma_binh_luan = ?',
            [commentId]
        );

        if (parentComment.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
        }

        // Thêm reply
        const [result] = await db.query(
            `INSERT INTO binh_luan_tin_tuc 
            (ma_tin_tuc, ma_nguoi_dung, ma_binh_luan_cha, ten_nguoi_binh_luan, email_nguoi_binh_luan, noi_dung, trang_thai) 
            VALUES (?, ?, ?, ?, ?, ?, 'approved')`,
            [parentComment[0].ma_tin_tuc, ma_nguoi_dung, commentId, ten_nguoi_binh_luan, email_nguoi_binh_luan, noi_dung.trim()]
        );

        // Gửi thông báo cho chủ bình luận gốc (nếu không phải chính mình)
        if (parentComment[0].ma_nguoi_dung && parentComment[0].ma_nguoi_dung !== ma_nguoi_dung) {
            try {
                await db.query(`
                    INSERT INTO thong_bao (ma_nguoi_dung, loai, tieu_de, noi_dung, duong_dan, ma_lien_quan)
                    VALUES (?, 'comment_reply', ?, ?, ?, ?)
                `, [
                    parentComment[0].ma_nguoi_dung,
                    `${ten_nguoi_binh_luan} đã trả lời bình luận của bạn`,
                    noi_dung.trim().substring(0, 100) + (noi_dung.length > 100 ? '...' : ''),
                    `/tin-tuc-chi-tiet/?id=${parentComment[0].ma_tin_tuc}`,
                    commentId
                ]);
                console.log(`📢 Đã gửi thông báo trả lời bình luận cho user ${parentComment[0].ma_nguoi_dung}`);
            } catch (notifError) {
                console.error('Lỗi gửi thông báo:', notifError.message);
            }
        }

        res.json({
            success: true,
            message: 'Đã trả lời bình luận',
            data: { ma_binh_luan: result.insertId }
        });
    } catch (error) {
        console.error('Lỗi trả lời bình luận:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
