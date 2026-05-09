const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendVerificationEmail } = require('../config/email');
const passport = require('../config/passport');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Đăng nhập Admin
router.post('/login', async (req, res) => {
    try {
        const { tai_khoan, mat_khau } = req.body;

        // Validate
        if (!tai_khoan || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tài khoản và mật khẩu'
            });
        }

        // Tìm admin
        const [admins] = await db.query(
            'SELECT * FROM admin WHERE tai_khoan = ?',
            [tai_khoan]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản hoặc mật khẩu không đúng'
            });
        }

        const admin = admins[0];

        // Kiểm tra mật khẩu
        const isValidPassword = await bcrypt.compare(mat_khau, admin.mat_khau_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản hoặc mật khẩu không đúng'
            });
        }

        // Tạo JWT token với role admin
        const token = jwt.sign(
            {
                ma_admin: admin.ma_admin,
                tai_khoan: admin.tai_khoan,
                quyen: admin.quyen,
                role: 'admin'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Trả về thông tin admin (không bao gồm mật khẩu)
        const { mat_khau_hash, ...adminData } = admin;

        res.json({
            success: true,
            message: 'Đăng nhập admin thành công',
            data: {
                ...adminData,
                token,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Lỗi đăng nhập admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Middleware xác thực admin token
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Không có token xác thực'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        // Kiểm tra role admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập'
            });
        }

        req.admin = decoded;
        next();
    });
};

// Lấy thông tin admin hiện tại
router.get('/me', authenticateAdmin, async (req, res) => {
    try {
        const [admins] = await db.query(
            'SELECT ma_admin, tai_khoan, ten_hien_thi, email, quyen, ngay_tao FROM admin WHERE ma_admin = ?',
            [req.admin.ma_admin]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy admin'
            });
        }

        res.json({
            success: true,
            data: admins[0]
        });

    } catch (error) {
        console.error('Lỗi lấy thông tin admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Đổi mật khẩu admin
router.post('/change-password', authenticateAdmin, async (req, res) => {
    try {
        const { mat_khau_cu, mat_khau_moi } = req.body;
        const ma_admin = req.admin.ma_admin;

        if (!mat_khau_cu || !mat_khau_moi) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        // Lấy mật khẩu hiện tại
        const [admins] = await db.query(
            'SELECT mat_khau_hash FROM admin WHERE ma_admin = ?',
            [ma_admin]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy admin'
            });
        }

        // Kiểm tra mật khẩu cũ
        const isValidPassword = await bcrypt.compare(mat_khau_cu, admins[0].mat_khau_hash);

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
            'UPDATE admin SET mat_khau_hash = ? WHERE ma_admin = ?',
            [mat_khau_hash, ma_admin]
        );

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });

    } catch (error) {
        console.error('Lỗi đổi mật khẩu admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// ============================================
// GOOGLE OAUTH ROUTES FOR ADMIN
// ============================================

// Khởi tạo đăng nhập Google cho Admin
router.get('/google',
    passport.authenticate('google-admin', {
        scope: ['profile', 'email'],
        session: true, // Dùng session thay vì JWT
        prompt: 'select_account', // Bắt buộc chọn tài khoản mỗi lần đăng nhập
        accessType: 'online' // Không lưu refresh token
    })
);

// Callback từ Google cho Admin
router.get('/google/callback',
    passport.authenticate('google-admin', {
        session: true, // Dùng session
        failureRedirect: '/admin/dang-nhap-admin.html?error=google_auth_failed'
    }),
    async (req, res) => {
        try {
            console.log('🔐 Google OAuth callback - User object:', req.user);
            console.log('🔐 Session before save:', req.session);

            const email = req.user.email;
            const googleDisplayName = req.user.ten_hien_thi;
            const googleAvatar = req.user.anh_dai_dien;

            console.log('🔍 Google login data:', { email, googleDisplayName, googleAvatar });

            // Kiểm tra xem email này có phải là admin không
            const [admins] = await db.query(
                'SELECT * FROM admin WHERE email = ?',
                [email]
            );

            if (admins.length === 0) {
                console.log('❌ Email không phải admin:', email);
                // Email không phải admin, từ chối đăng nhập
                req.logout(() => {
                    res.redirect('/admin/dang-nhap-admin.html?error=not_admin');
                });
                return;
            }

            const admin = admins[0];
            console.log('✅ Admin found in database:', admin.email);

            // Cập nhật thông tin Google vào database (tên hiển thị và avatar)
            const updateFields = [];
            const updateValues = [];

            // Cập nhật tên hiển thị nếu chưa có hoặc khác với Google
            if (googleDisplayName && (!admin.ten_hien_thi || admin.ten_hien_thi !== googleDisplayName)) {
                updateFields.push('ten_hien_thi = ?');
                updateValues.push(googleDisplayName);
            }

            // Cập nhật avatar nếu có từ Google
            if (googleAvatar && admin.anh_dai_dien !== googleAvatar) {
                updateFields.push('anh_dai_dien = ?');
                updateValues.push(googleAvatar);
            }

            // Thực hiện update nếu có thay đổi
            if (updateFields.length > 0) {
                updateValues.push(admin.ma_admin);
                const updateQuery = `UPDATE admin SET ${updateFields.join(', ')} WHERE ma_admin = ?`;
                await db.query(updateQuery, updateValues);
                console.log('✅ Updated admin info from Google:', { googleDisplayName, googleAvatar });
            }

            // QUAN TRỌNG: Lưu thông tin admin vào req.session.admin
            // Passport đã lưu vào req.session.passport.user, nhưng ta cũng cần lưu vào req.session.admin
            // để check-session endpoint có thể đọc được
            req.session.admin = {
                ma_admin: admin.ma_admin,
                tai_khoan: admin.tai_khoan,
                email: admin.email,
                ten_hien_thi: googleDisplayName || admin.ten_hien_thi,
                anh_dai_dien: googleAvatar || admin.anh_dai_dien,
                quyen: admin.quyen,
                role: 'admin'
            };

            console.log('📦 Session admin data set:', req.session.admin);
            console.log('📦 Passport session:', req.session.passport);

            // Lưu session trước khi redirect
            req.session.save((err) => {
                if (err) {
                    console.error('❌ Lỗi lưu session:', err);
                    res.redirect('/admin/dang-nhap-admin.html?error=session_save_failed');
                    return;
                }

                console.log('✅ Session đã được lưu thành công');
                console.log('🔐 Session after save:', req.session);
                
                // Redirect về dashboard với query param để frontend biết đã login thành công
                res.redirect('/admin/dashboard.html?login=success');
            });

        } catch (error) {
            console.error('❌ Lỗi Google callback admin:', error);
            res.redirect('/admin/dang-nhap-admin.html?error=google_callback_failed');
        }
    }
);

// Kiểm tra session admin
router.get('/check-session', (req, res) => {
    if (req.session && req.session.admin) {
        res.json({
            success: true,
            isAuthenticated: true,
            data: req.session.admin
        });
    } else {
        res.json({
            success: false,
            isAuthenticated: false,
            message: 'Chưa đăng nhập'
        });
    }
});

// Đăng xuất admin
router.post('/logout', (req, res) => {
    console.log('🚪 Admin logout request');
    console.log('📦 Session before logout:', req.session);
    
    // Xóa cookie khỏi trình duyệt cực kì triệt để
    res.clearCookie('admin.sid', { path: '/' });
    res.clearCookie('connect.sid', { path: '/' });

    // Xóa thông tin admin khỏi session
    if (req.session) {
        delete req.session.admin;
    }
    
    req.logout((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi đăng xuất'
            });
        }

        // Xóa toàn bộ session
        if (req.session && req.session.destroy) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('❌ Session destroy error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Lỗi xóa session'
                    });
                }

                console.log('✅ Admin logged out successfully');
                res.json({
                    success: true,
                    message: 'Đăng xuất thành công'
                });
            });
        } else {
            console.log('✅ Admin logged out successfully (No session)');
            res.json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        }
    });
});

module.exports = router;
module.exports.authenticateAdmin = authenticateAdmin;
