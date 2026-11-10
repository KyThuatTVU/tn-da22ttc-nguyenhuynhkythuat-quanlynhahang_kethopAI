/**
 * Authentication Middleware
 * Kiểm tra session cho Admin và Staff
 */

const hasAdmin = (req) => Boolean(req.session && req.session.admin);
const hasStaff = (req) => Boolean(req.session && req.session.staff);
const staffRole = (req) => String(req.session?.staff?.vai_tro || '').toLowerCase();

// Middleware kiểm tra admin đã đăng nhập
const requireAdminAuth = (req, res, next) => {
    if (!hasAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Chưa đăng nhập admin'
        });
    }
    next();
};

// Middleware kiểm tra staff đã đăng nhập
const requireStaffAuth = (req, res, next) => {
    if (!hasStaff(req)) {
        return res.status(401).json({
            success: false,
            message: 'Chưa đăng nhập nhân viên'
        });
    }
    next();
};

// Cho phép cả admin và staff đã đăng nhập
const requireStaffOrAdmin = (req, res, next) => {
    if (hasAdmin(req) || hasStaff(req)) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
    });
};

// Chỉ admin hoặc nhân viên vai trò manager
const requireManagerOrAdmin = (req, res, next) => {
    if (hasAdmin(req)) {
        return next();
    }
    if (hasStaff(req) && staffRole(req) === 'manager') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Chỉ quản lý mới có quyền thực hiện thao tác này'
    });
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
    requireStaffOrAdmin,
    requireManagerOrAdmin,
    requireSuperAdmin,
    requireManager
};
