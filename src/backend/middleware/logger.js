/**
 * Logger/Debug Middleware
 * Log thông tin request và session
 */

const loggerMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
};

module.exports = loggerMiddleware;
