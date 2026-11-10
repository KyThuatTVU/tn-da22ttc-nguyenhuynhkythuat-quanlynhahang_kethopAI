const rateLimit = require('express-rate-limit');

const message = (text) => ({
    success: false,
    message: text
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: message('Quá nhiều yêu cầu, vui lòng thử lại sau')
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: message('Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút')
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: message('Quá nhiều yêu cầu xác thực, vui lòng thử lại sau')
});

const publicWriteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: message('Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau')
});

module.exports = {
    apiLimiter,
    authLimiter,
    otpLimiter,
    publicWriteLimiter
};
