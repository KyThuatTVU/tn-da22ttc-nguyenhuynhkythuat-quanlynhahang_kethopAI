/**
 * CORS Middleware Configuration
 * Cấu hình Cross-Origin Resource Sharing
 */

const cors = require('cors');

const corsMiddleware = cors({
    origin: function (origin, callback) {
        // Cho phép tất cả origins trong development
        console.log('🌐 CORS Origin:', origin);
        callback(null, true);
    },
    credentials: true, // QUAN TRỌNG: Cho phép gửi cookies
    exposedHeaders: ['set-cookie'] // Cho phép client đọc Set-Cookie header
});

module.exports = corsMiddleware;
