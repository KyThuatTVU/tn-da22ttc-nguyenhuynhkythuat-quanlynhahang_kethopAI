const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAdminAuth } = require('../middleware/auth.middleware');

// Lấy tất cả tri thức (cho cả admin và chatbot)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM chatbot_tri_thuc ORDER BY ngay_cap_nhat DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error getting chatbot knowledge list:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách tri thức' });
    }
});

// Lấy chi tiết một tri thức
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM chatbot_tri_thuc WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tri thức' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error getting chatbot knowledge detail:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết tri thức' });
    }
});

// Thêm tri thức mới
router.post('/', requireAdminAuth, async (req, res) => {
    try {
        const { tieu_de, noi_dung } = req.body;
        
        if (!tieu_de || !noi_dung) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tiêu đề và nội dung' });
        }
        
        const [result] = await db.query(
            'INSERT INTO chatbot_tri_thuc (tieu_de, noi_dung) VALUES (?, ?)',
            [tieu_de, noi_dung]
        );
        
        res.status(201).json({
            success: true,
            message: 'Thêm tri thức thành công',
            data: { id: result.insertId, tieu_de, noi_dung }
        });
    } catch (error) {
        console.error('Error creating chatbot knowledge:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi tạo tri thức mới' });
    }
});

// Cập nhật tri thức
router.put('/:id', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { tieu_de, noi_dung } = req.body;
        
        if (!tieu_de || !noi_dung) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tiêu đề và nội dung' });
        }
        
        const [result] = await db.query(
            'UPDATE chatbot_tri_thuc SET tieu_de = ?, noi_dung = ?, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE id = ?',
            [tieu_de, noi_dung, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tri thức cần cập nhật' });
        }
        
        res.json({
            success: true,
            message: 'Cập nhật tri thức thành công',
            data: { id, tieu_de, noi_dung }
        });
    } catch (error) {
        console.error('Error updating chatbot knowledge:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật tri thức' });
    }
});

// Xóa tri thức
router.delete('/:id', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM chatbot_tri_thuc WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tri thức cần xóa' });
        }
        
        res.json({ success: true, message: 'Xóa tri thức thành công' });
    } catch (error) {
        console.error('Error deleting chatbot knowledge:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi xóa tri thức' });
    }
});

module.exports = router;
