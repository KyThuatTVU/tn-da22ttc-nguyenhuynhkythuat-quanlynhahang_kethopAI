const required = (name) => {
    const value = process.env[name];
    if (!value || !String(value).trim()) {
        throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
    }
    return value;
};

module.exports = {
    jwtSecret: required('JWT_SECRET'),
    sessionSecret: required('SESSION_SECRET')
};
