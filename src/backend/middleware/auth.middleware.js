/**
 * Authentication Middleware
 * Kiểm tra session cho Admin và Staff
 */

// Middleware kiểm tra admin đã đăng nhập
const requireAdminAuth = (req, res, next) => {
    console.log('🔍 Checking admin session...');
    console.log('📦 req.session.admin:', req.session?.admin);
    
    if (!req.session || !req.session.admin) {
        return res.status(401).json({
            success: false,
            message: 'Chưa đăng nhập admin'
        });
    }
    next();
};

// Middleware kiểm tra staff đã đăng nhập
const requireStaffAuth = (req, res, next) => {
    console.log('🔍 Checking staff session...');
    console.log('📦 req.session.staff:', req.session?.staff);
    
    if (!req.session || !req.session.staff) {
        return res.status(401).json({
            success: false,
            message: 'Chưa đăng nhập nhân viên'
        });
    }
    next();
};

// Middleware kiểm tra quyền superadmin
const requireSuperAdmin = (req, res, next) => {
    if (!req.session || !req.session.admin || req.session.admin.quyen !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Không có quyền thực hiện thao tác này'
        });
    }
    next();
};

// Middleware kiểm tra quyền manager
const requireManager = (req, res, next) => {
    if (!req.session || !req.session.staff || req.session.staff.vai_tro !== 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ quản lý mới có quyền thực hiện thao tác này'
        });
    }
    next();
};

module.exports = {
    requireAdminAuth,
    requireStaffAuth,
    requireSuperAdmin,
    requireManager
};
