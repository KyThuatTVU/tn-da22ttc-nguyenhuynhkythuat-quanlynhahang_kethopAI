/**
 * CORS Middleware Configuration
 * Chỉ cho phép các origin được cấu hình.
 */

const cors = require('cors');

const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

const configuredOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

const corsMiddleware = cors({
    origin: function (origin, callback) {
        // Request không có Origin (cùng origin, curl, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        console.warn('🚫 CORS blocked origin:', origin);
        return callback(null, false);
    },
    credentials: true
});

module.exports = corsMiddleware;
