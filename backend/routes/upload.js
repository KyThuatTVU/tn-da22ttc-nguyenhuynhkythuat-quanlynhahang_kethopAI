/**
 * Upload Route - Xử lý upload ảnh nhân viên (avatar, CCCD)
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Đảm bảo thư mục uploads/staff tồn tại
const uploadDir = path.join(__dirname, '../uploads/staff');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer - lưu file vào thư mục uploads/staff
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `staff-${uniqueSuffix}${ext}`);
    }
});

// Chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Tối đa 5MB
});

// POST /api/upload/staff - Upload ảnh nhân viên (avatar hoặc cccd)
router.post('/staff', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được tải lên!' });
        }
        // Trả về đường dẫn có thể truy cập từ frontend
        const url = `/uploads/staff/${req.file.filename}`;
        res.json({ success: true, url, filename: req.file.filename });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/upload/crop-face - Upload ảnh và trích chọn khuôn mặt chuẩn làm avatar
router.post('/crop-face', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được tải lên!' });
        }

        const imagePath = req.file.path;

        // Gọi Python AI Service để trích chọn & căn chỉnh khuôn mặt
        try {
            const aiResponse = await axios.post('http://localhost:5000/api/ml/face/crop', {
                image_path: imagePath
            });

            // Xóa file ảnh gốc tạm thời sau khi trích chọn xong
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            if (aiResponse.data.success) {
                res.json({
                    success: true,
                    url: aiResponse.data.url,
                    message: aiResponse.data.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: aiResponse.data.message || 'Không thể trích chọn khuôn mặt!'
                });
            }
        } catch (error) {
            console.error('Call AI face crop error:', error.message);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            const msg = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : 'Lỗi kết nối đến dịch vụ AI trích xuất khuôn mặt!';

            res.status(500).json({
                success: false,
                message: msg
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
