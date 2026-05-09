const express = require('express');
const router = express.Router();
const controller = require('../controllers/wastageController');
const { requireAdminAuth } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/wastage/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'wastage-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

router.get('/', requireAdminAuth, controller.getAllWastage);
router.post('/', requireAdminAuth, upload.single('hinh_anh'), controller.createWastageReport);

module.exports = router;
