/**
 * Middleware Index
 * Export tất cả middleware từ một file
 */

const corsMiddleware = require('./cors');
const { adminSessionMiddleware, staffSessionMiddleware } = require('./session');
const loggerMiddleware = require('./logger');
const { notFoundHandler, errorHandler } = require('./errorHandler');
const { apiLimiter, authLimiter, otpLimiter, publicWriteLimiter } = require('./rateLimit');

module.exports = {
    corsMiddleware,
    adminSessionMiddleware,
    staffSessionMiddleware,
    loggerMiddleware,
    notFoundHandler,
    errorHandler,
    apiLimiter,
    authLimiter,
    otpLimiter,
    publicWriteLimiter
};
