/**
 * Session Middleware Configuration
 * Cấu hình Express Session - TÁCH RIÊNG cho Admin và Staff
 */

const session = require('express-session');

// Session store chung
const sessionStore = new session.MemoryStore();

// Session middleware cho ADMIN
const adminSessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'admin-session-secret-change-this',
    resave: false,
    saveUninitialized: false,
    name: 'admin.sid', // Cookie riêng cho admin
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    },
    rolling: true,
    proxy: false
});

// Session middleware cho STAFF
const staffSessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'staff-session-secret-change-this',
    resave: false,
    saveUninitialized: false,
    name: 'staff.sid', // Cookie riêng cho staff
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    },
    rolling: true,
    proxy: false
});

console.log('📦 Session store initialized:', sessionStore.constructor.name);
console.log('🔐 Admin session cookie: admin.sid');
console.log('🔐 Staff session cookie: staff.sid');

module.exports = {
    adminSessionMiddleware,
    staffSessionMiddleware
};
