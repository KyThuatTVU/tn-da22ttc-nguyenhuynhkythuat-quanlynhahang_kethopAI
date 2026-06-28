const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const db = require('../config/database');
const { sendVerificationEmail, sendWelcomeEmail } = require('../config/email');
const { createAdminNotification } = require('./admin-notifications');

// Secret key cho JWT (nên đặt trong .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    if (!phone) return true; // Phone is optional
    const re = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return re.test(phone);
}

function validatePassword(password) {
    if (!password || password.length < 6) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }
    if (!/[A-Za-z]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ cái' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ số' };
    }
    return { valid: true };
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
}

// Hàm tạo mã xác thực 6 số
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../images/avatars');
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
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

// Upload ảnh đại diện
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file ảnh'
            });
        }

        const avatarPath = '/images/avatars/' + req.file.filename;

        res.json({
            success: true,
            message: 'Upload ảnh thành công',
            data: {
                anh_dai_dien: avatarPath
            }
        });

    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi upload ảnh',
            error: error.message
        });
    }
});

// Bước 1: Gửi mã xác thực email
router.post('/send-verification', async (req, res) => {
    try {
        let { ten_nguoi_dung, email, so_dien_thoai, mat_khau, dia_chi, gioi_tinh, anh_dai_dien } = req.body;

        // Sanitize inputs
        ten_nguoi_dung = sanitizeInput(ten_nguoi_dung);
        email = sanitizeInput(email);
        dia_chi = sanitizeInput(dia_chi);

        // Validate required fields
        if (!ten_nguoi_dung || !email || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Validate name length
        if (ten_nguoi_dung.length < 2 || ten_nguoi_dung.length > 150) {
            return res.status(400).json({
                success: false,
                message: 'Tên phải có từ 2 đến 150 ký tự'
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Validate phone format
        if (so_dien_thoai && !validatePhone(so_dien_thoai)) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 03, 05, 07, 08, 09)'
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(mat_khau);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // Validate gender
        const validGenders = ['khac', 'nam', 'nu'];
        if (gioi_tinh && !validGenders.includes(gioi_tinh)) {
            gioi_tinh = 'khac';
        }

        // Kiểm tra email đã tồn tại trong bảng nguoi_dung
        const [existingUser] = await db.query(
            'SELECT ma_nguoi_dung FROM nguoi_dung WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Kiểm tra số điện thoại đã tồn tại (nếu có)
        if (so_dien_thoai) {
            const [existingPhone] = await db.query(
                'SELECT ma_nguoi_dung FROM nguoi_dung WHERE so_dien_thoai = ?',
                [so_dien_thoai]
            );

            if (existingPhone.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại đã được sử dụng'
                });
            }
        }

        // Tạo mã xác thực 6 số
        const verificationCode = generateVerificationCode();

        // Hash mật khẩu
        const mat_khau_hash = await bcrypt.hash(mat_khau, 10);

        // Xóa mã xác thực cũ của email này (nếu có)
        await db.query('DELETE FROM xac_thuc_email WHERE email = ?', [email]);

        // Lưu thông tin tạm vào bảng xac_thuc_email
        const ngay_het_han = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

        await db.query(
            `INSERT INTO xac_thuc_email 
            (email, ma_code, ten_nguoi_dung, so_dien_thoai, mat_khau_hash, dia_chi, gioi_tinh, anh_dai_dien, ngay_het_han) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, verificationCode, ten_nguoi_dung, so_dien_thoai || null, mat_khau_hash, dia_chi || null, gioi_tinh || 'khac', anh_dai_dien || null, ngay_het_han]
        );

        // Gửi email xác thực
        const emailResult = await sendVerificationEmail(email, verificationCode, ten_nguoi_dung);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email xác thực. Vui lòng thử lại sau.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mã xác thực đã được gửi đến email của bạn',
            data: {
                email,
                expires_in: '10 phút'
            }
        });

    } catch (error) {
        console.error('Lỗi gửi mã xác thực:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Bước 2: Xác thực mã và hoàn tất đăng ký
router.post('/verify-email', async (req, res) => {
    try {
        const { email, ma_code } = req.body;

        // Validate
        if (!email || !ma_code) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mã xác thực'
            });
        }

        // Tìm mã xác thực
        const [verifications] = await db.query(
            `SELECT * FROM xac_thuc_email 
             WHERE email = ? AND ma_code = ? AND trang_thai = 'pending' AND ngay_het_han > NOW()`,
            [email, ma_code]
        );

        if (verifications.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn'
            });
        }

        const verification = verifications[0];

        // Thêm người dùng vào bảng nguoi_dung
        const [result] = await db.query(
            `INSERT INTO nguoi_dung (ten_nguoi_dung, email, so_dien_thoai, mat_khau_hash, dia_chi, gioi_tinh, anh_dai_dien) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                verification.ten_nguoi_dung,
                verification.email,
                verification.so_dien_thoai,
                verification.mat_khau_hash,
                verification.dia_chi,
                verification.gioi_tinh,
                verification.anh_dai_dien
            ]
        );

        // Cập nhật trạng thái xác thực
        await db.query(
            'UPDATE xac_thuc_email SET trang_thai = ? WHERE ma_xac_thuc = ?',
            ['verified', verification.ma_xac_thuc]
        );

        // Gửi email chào mừng
        await sendWelcomeEmail(email, verification.ten_nguoi_dung);

        // Tạo thông báo cho admin
        await createAdminNotification(
            'new_user',
            `Người dùng mới: ${verification.ten_nguoi_dung}`,
            `${verification.email} vừa đăng ký tài khoản`,
            `quan-ly-khach-hang.html?id=${result.insertId}`,
            result.insertId
        );

        // Tạo JWT token
        const token = jwt.sign(
            { ma_nguoi_dung: result.insertId, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Xác thực thành công! Tài khoản đã được tạo.',
            data: {
                ma_nguoi_dung: result.insertId,
                ten_nguoi_dung: verification.ten_nguoi_dung,
                email: verification.email,
                anh_dai_dien: verification.anh_dai_dien,
                token
            }
        });

    } catch (error) {
        console.error('Lỗi xác thực email:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Gửi lại mã xác thực
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email'
            });
        }

        // Tìm thông tin xác thực pending
        const [verifications] = await db.query(
            'SELECT * FROM xac_thuc_email WHERE email = ? AND trang_thai = ? ORDER BY ngay_tao DESC LIMIT 1',
            [email, 'pending']
        );

        if (verifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu đăng ký cho email này'
            });
        }

        const verification = verifications[0];

        // Tạo mã mới
        const newCode = generateVerificationCode();
        const ngay_het_han = new Date(Date.now() + 10 * 60 * 1000);

        // Cập nhật mã mới
        await db.query(
            'UPDATE xac_thuc_email SET ma_code = ?, ngay_het_han = ?, ngay_tao = NOW() WHERE ma_xac_thuc = ?',
            [newCode, ngay_het_han, verification.ma_xac_thuc]
        );

        // Gửi email
        const emailResult = await sendVerificationEmail(email, newCode, verification.ten_nguoi_dung);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email. Vui lòng thử lại sau.'
            });
        }

        res.json({
            success: true,
            message: 'Mã xác thực mới đã được gửi đến email của bạn'
        });

    } catch (error) {
        console.error('Lỗi gửi lại mã:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, mat_khau } = req.body;

        // Validate
        if (!email || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // Tìm người dùng
        const [users] = await db.query(
            'SELECT * FROM nguoi_dung WHERE email = ? AND trang_thai = 1',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const user = users[0];

        // Kiểm tra mật khẩu
        const isValidPassword = await bcrypt.compare(mat_khau, user.mat_khau_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { ma_nguoi_dung: user.ma_nguoi_dung, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Lưu thông tin người dùng vào session
        req.session.user = {
            ma_nguoi_dung: user.ma_nguoi_dung,
            ten_nguoi_dung: user.ten_nguoi_dung,
            email: user.email,
            anh_dai_dien: user.anh_dai_dien
        };

        // Kiểm tra xem user đã khai báo khẩu vị chưa
        const [flavorCheck] = await db.query(
            'SELECT COUNT(*) as count FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?',
            [user.ma_nguoi_dung]
        );
        const hasPreferences = flavorCheck[0].count > 0;

        // Trả về thông tin người dùng (không bao gồm mật khẩu)
        const { mat_khau_hash, ...userData } = user;

        console.log('✅ Login successful for:', user.email);
        console.log('🍽️ Has taste preferences:', hasPreferences);
        console.log('🔑 Session ID at login:', req.sessionID);
        console.log('📦 User data being sent:', {
            ma_nguoi_dung: userData.ma_nguoi_dung,
            ten_nguoi_dung: userData.ten_nguoi_dung,
            email: userData.email,
            anh_dai_dien: userData.anh_dai_dien,
            hasPreferences
        });
        console.log('🔐 Session user set:', req.session.user);
        console.log('📋 Full session:', req.session);

        // Force save session before sending response
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi lưu session'
                });
            }
            
            console.log('💾 Session saved successfully');
            console.log('🔑 Session ID after save:', req.sessionID);
            
            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    ...userData,
                    token,
                    hasPreferences
                }
            });
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Không có token xác thực'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
        req.user = user;
        next();
    });
};

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT ma_nguoi_dung, ten_nguoi_dung, email, so_dien_thoai, dia_chi, gioi_tinh, anh_dai_dien, ngay_tao FROM nguoi_dung WHERE ma_nguoi_dung = ?',
            [req.user.ma_nguoi_dung]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Lỗi lấy thông tin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Cập nhật thông tin người dùng
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { ten_nguoi_dung, so_dien_thoai, dia_chi, gioi_tinh, anh_dai_dien } = req.body;
        const ma_nguoi_dung = req.user.ma_nguoi_dung;

        console.log('📝 Update request body:', req.body);
        console.log('🔍 Fields received:', {
            ten_nguoi_dung: ten_nguoi_dung !== undefined ? 'present' : 'missing',
            so_dien_thoai: so_dien_thoai !== undefined ? 'present' : 'missing',
            dia_chi: dia_chi !== undefined ? 'present' : 'missing',
            gioi_tinh: gioi_tinh !== undefined ? 'present' : 'missing',
            anh_dai_dien: anh_dai_dien !== undefined ? 'present' : 'missing'
        });

        // Build dynamic update query based on provided fields
        const updates = [];
        const values = [];

        if (ten_nguoi_dung !== undefined && ten_nguoi_dung !== null) {
            updates.push('ten_nguoi_dung = ?');
            values.push(ten_nguoi_dung);
        }
        if (so_dien_thoai !== undefined && so_dien_thoai !== null) {
            updates.push('so_dien_thoai = ?');
            values.push(so_dien_thoai);
        }
        if (dia_chi !== undefined && dia_chi !== null) {
            updates.push('dia_chi = ?');
            values.push(dia_chi);
        }
        if (gioi_tinh !== undefined && gioi_tinh !== null) {
            updates.push('gioi_tinh = ?');
            values.push(gioi_tinh);
        }
        if (anh_dai_dien !== undefined) {
            updates.push('anh_dai_dien = ?');
            values.push(anh_dai_dien);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có thông tin để cập nhật'
            });
        }

        values.push(ma_nguoi_dung);

        const sql = `UPDATE nguoi_dung SET ${updates.join(', ')} WHERE ma_nguoi_dung = ?`;
        console.log('📊 SQL Query:', sql);
        console.log('📊 Values:', values);

        await db.query(sql, values);

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });

    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Đổi mật khẩu
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { mat_khau_cu, mat_khau_moi } = req.body;
        const ma_nguoi_dung = req.user.ma_nguoi_dung;

        // Lấy mật khẩu hiện tại
        const [users] = await db.query(
            'SELECT mat_khau_hash FROM nguoi_dung WHERE ma_nguoi_dung = ?',
            [ma_nguoi_dung]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Kiểm tra mật khẩu cũ
        const isValidPassword = await bcrypt.compare(mat_khau_cu, users[0].mat_khau_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu cũ không đúng'
            });
        }

        // Hash mật khẩu mới
        const mat_khau_hash = await bcrypt.hash(mat_khau_moi, 10);

        // Cập nhật mật khẩu
        await db.query(
            'UPDATE nguoi_dung SET mat_khau_hash = ? WHERE ma_nguoi_dung = ?',
            [mat_khau_hash, ma_nguoi_dung]
        );

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });

    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Quên mật khẩu - Gửi mã xác thực
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Kiểm tra email có tồn tại không
        const [users] = await db.query(
            'SELECT ma_nguoi_dung, ten_nguoi_dung, email FROM nguoi_dung WHERE email = ? AND trang_thai = 1',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Email không tồn tại trong hệ thống'
            });
        }

        const user = users[0];

        // Tạo mã xác thực 6 số
        const resetCode = generateVerificationCode();

        // Xóa các mã reset cũ của email này
        await db.query('DELETE FROM xac_thuc_email WHERE email = ? AND trang_thai = ?', [email, 'reset_password']);

        // Lưu mã reset vào bảng xac_thuc_email
        const ngay_het_han = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

        await db.query(
            `INSERT INTO xac_thuc_email 
            (email, ma_code, ten_nguoi_dung, mat_khau_hash, ngay_het_han, trang_thai) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [email, resetCode, user.ten_nguoi_dung, '', ngay_het_han, 'reset_password']
        );

        // Gửi email với mã xác thực
        const { sendPasswordResetEmail } = require('../config/email');
        const emailResult = await sendPasswordResetEmail(email, resetCode, user.ten_nguoi_dung);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email. Vui lòng thử lại sau.'
            });
        }

        res.json({
            success: true,
            message: 'Mã xác thực đã được gửi đến email của bạn',
            data: {
                email,
                expires_in: '10 phút'
            }
        });

    } catch (error) {
        console.error('Lỗi quên mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xác thực mã reset password
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, ma_code } = req.body;

        // Validate
        if (!email || !ma_code) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mã xác thực'
            });
        }

        // Tìm mã xác thực
        const [verifications] = await db.query(
            `SELECT * FROM xac_thuc_email 
             WHERE email = ? AND ma_code = ? AND trang_thai = 'reset_password' AND ngay_het_han > NOW()`,
            [email, ma_code]
        );

        if (verifications.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn'
            });
        }

        res.json({
            success: true,
            message: 'Mã xác thực hợp lệ',
            data: {
                email,
                verified: true
            }
        });

    } catch (error) {
        console.error('Lỗi xác thực mã:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Đặt lại mật khẩu mới
router.post('/reset-password', async (req, res) => {
    try {
        const { email, ma_code, mat_khau_moi } = req.body;

        // Validate
        if (!email || !ma_code || !mat_khau_moi) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(mat_khau_moi);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // Tìm mã xác thực
        const [verifications] = await db.query(
            `SELECT * FROM xac_thuc_email 
             WHERE email = ? AND ma_code = ? AND trang_thai = 'reset_password' AND ngay_het_han > NOW()`,
            [email, ma_code]
        );

        if (verifications.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn'
            });
        }

        // Hash mật khẩu mới
        const mat_khau_hash = await bcrypt.hash(mat_khau_moi, 10);

        // Cập nhật mật khẩu trong bảng nguoi_dung
        await db.query(
            'UPDATE nguoi_dung SET mat_khau_hash = ? WHERE email = ?',
            [mat_khau_hash, email]
        );

        // Cập nhật trạng thái xác thực
        await db.query(
            'UPDATE xac_thuc_email SET trang_thai = ? WHERE ma_xac_thuc = ?',
            ['verified', verifications[0].ma_xac_thuc]
        );

        res.json({
            success: true,
            message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.'
        });

    } catch (error) {
        console.error('Lỗi đặt lại mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Kiểm tra session người dùng (hỗ trợ cả session và token)
router.get('/check-session', async (req, res) => {
    console.log('');
    console.log('========== CHECK SESSION ==========');
    console.log('🔍 Check session request received');
    console.log('🔑 Session ID:', req.sessionID);
    console.log('🍪 Cookies:', req.headers.cookie);
    console.log('🎫 Auth Header:', req.headers.authorization);
    console.log('===================================');
    
    // Kiểm tra session trước
    if (req.session && req.session.user) {
        console.log('✅ User logged in via session:', req.session.user.email);
        return res.json({
            loggedIn: true,
            user: {
                ma_nguoi_dung: req.session.user.ma_nguoi_dung,
                ten_nguoi_dung: req.session.user.ten_nguoi_dung,
                email: req.session.user.email
            }
        });
    }
    
    // Nếu không có session, kiểm tra token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const [users] = await db.query(
                'SELECT ma_nguoi_dung, ten_nguoi_dung, email FROM nguoi_dung WHERE ma_nguoi_dung = ?',
                [decoded.ma_nguoi_dung]
            );
            
            if (users.length > 0) {
                console.log('✅ User logged in via token:', users[0].email);
                return res.json({
                    loggedIn: true,
                    user: {
                        ma_nguoi_dung: users[0].ma_nguoi_dung,
                        ten_nguoi_dung: users[0].ten_nguoi_dung,
                        email: users[0].email
                    }
                });
            }
        } catch (tokenError) {
            console.log('❌ Token invalid:', tokenError.message);
        }
    }
    
    console.log('❌ No valid session or token');
    res.json({ loggedIn: false });
});

// ==================== GOOGLE OAUTH CHO USER ====================

// Bắt đầu đăng nhập Google
router.get('/google', passport.authenticate('google-user', {
    scope: ['profile', 'email']
}));

// Callback sau khi Google xác thực
router.get('/google/callback',
    passport.authenticate('google-user', { 
        failureRedirect: '/dang-nhap.html?error=google_auth_failed',
        session: false 
    }),
    async (req, res) => {
        try {
            const user = req.user;
            
            console.log('🔐 Google callback - User data:', user);
            
            if (!user) {
                console.log('❌ No user data from Google');
                return res.redirect('/dang-nhap.html?error=google_auth_failed');
            }

            // Tạo JWT token
            const token = jwt.sign(
                { ma_nguoi_dung: user.ma_nguoi_dung, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Kiểm tra xem user đã khai báo khẩu vị chưa
            const [flavorCheck] = await db.query(
                'SELECT COUNT(*) as count FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?',
                [user.ma_nguoi_dung]
            );
            const hasPreferences = flavorCheck[0].count > 0;

            // Tạo object user data
            const userDataObj = {
                ma_nguoi_dung: user.ma_nguoi_dung,
                ten_nguoi_dung: user.ten_nguoi_dung,
                email: user.email,
                anh_dai_dien: user.anh_dai_dien,
                so_dien_thoai: user.so_dien_thoai || null,
                dia_chi: user.dia_chi || null,
                token: token,
                isNewUser: user.isNewUser || false,
                hasPreferences
            };

            console.log('📦 User data to send:', userDataObj);
            console.log('🍽️ Has taste preferences:', hasPreferences);

            // Tạo URL redirect với thông tin user
            const userData = encodeURIComponent(JSON.stringify(userDataObj));

            // Redirect về frontend với token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const redirectUrl = `${frontendUrl}/dang-nhap.html?google_auth=success&data=${userData}`;
            console.log('🔗 Redirect URL length:', redirectUrl.length);
            res.redirect(redirectUrl);

        } catch (error) {
            console.error('Lỗi Google callback:', error);
            res.redirect('/dang-nhap.html?error=server_error');
        }
    }
);

// API kiểm tra trạng thái Google OAuth
router.get('/google/status', (req, res) => {
    res.json({
        success: true,
        enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        message: 'Google OAuth is configured'
    });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
