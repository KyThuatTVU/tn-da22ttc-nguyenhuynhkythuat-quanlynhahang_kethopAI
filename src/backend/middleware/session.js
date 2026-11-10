/**
 * Session Middleware Configuration
 * Cấu hình Express Session - TÁCH RIÊNG cho Admin và Staff
 */

const session = require('express-session');
const { sessionSecret } = require('../config/secrets');

// Session store chung
const sessionStore = new session.MemoryStore();

// Session middleware cho ADMIN
const adminSessionMiddleware = session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'admin.sid', // Cookie riêng cho admin
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    },
    rolling: true,
    proxy: process.env.NODE_ENV === 'production'
});

// Session middleware cho STAFF
const staffSessionMiddleware = session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'staff.sid', // Cookie riêng cho staff
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    },
    rolling: true,
    proxy: process.env.NODE_ENV === 'production'
});

console.log('📦 Session store initialized:', sessionStore.constructor.name);
console.log('🔐 Admin session cookie: admin.sid');
console.log('🔐 Staff session cookie: staff.sid');

module.exports = {
    adminSessionMiddleware,
    staffSessionMiddleware
};
