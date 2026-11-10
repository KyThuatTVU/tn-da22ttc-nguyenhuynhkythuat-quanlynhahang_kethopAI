const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const db = require('../config/database');
const momoConfig = require('../config/momo');

function signaturesMatch(received, calculated) {
    const a = Buffer.from(String(received || ''));
    const b = Buffer.from(String(calculated || ''));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getRealOrderId(requestId) {
    const match = String(requestId || '').match(/^(\d+)_/);
    return match ? Number(match[1]) : null;
}

async function getOrderAmount(orderId) {
    if (!orderId) return null;
    const [rows] = await db.query('SELECT tong_tien FROM don_hang WHERE ma_don_hang = ?', [orderId]);
    if (rows.length === 0) return null;
    return Math.round(Number(rows[0].tong_tien));
}

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Không có token xác thực'
        });
    }

    try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = require('../config/secrets').jwtSecret;
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Token không hợp lệ'
                });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực token'
        });
    }
};

// Tạo payment request MoMo
router.post('/momo/create-payment', authenticateToken, async (req, res) => {
    try {
        const { orderId, amount: rawAmount, orderInfo } = req.body;

        // Validate
        if (!orderId || !rawAmount) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin đơn hàng'
            });
        }

        // Kiểm tra đơn hàng
        const [orderRows] = await db.query(
            'SELECT * FROM don_hang WHERE ma_don_hang = ? AND ma_nguoi_dung = ?',
            [orderId, req.user.ma_nguoi_dung]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        const order = orderRows[0];

        if (['cancelled', 'delivered'].includes(order.trang_thai)) {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng không thể thanh toán ở trạng thái hiện tại'
            });
        }

        // Số tiền luôn lấy từ đơn hàng trong database, không tin client
        const amount = Math.round(Number(order.tong_tien));

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng có số tiền không hợp lệ'
            });
        }

        if (rawAmount !== undefined && Math.round(Number(rawAmount)) !== amount) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền thanh toán không khớp với đơn hàng'
            });
        }

        // Tạo request ID và order ID
        const requestId = `${orderId}_${Date.now()}`;
        const momoOrderId = `DH${String(orderId).padStart(6, '0')}`;

        // Tạo raw signature
        const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo || `Thanh toan don hang ${orderId}`}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;

        console.log('🔐 MoMo Raw Signature:', rawSignature);

        // Tạo chữ ký HMAC SHA256
        const signature = crypto
            .createHmac('sha256', momoConfig.secretKey)
            .update(rawSignature)
            .digest('hex');

        console.log('🔐 MoMo Signature:', signature);

        // Tạo request body - amount phải là số nguyên
        const requestBody = {
            partnerCode: momoConfig.partnerCode,
            accessKey: momoConfig.accessKey,
            requestId: requestId,
            amount: amount,
            orderId: requestId,
            orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
            redirectUrl: momoConfig.redirectUrl,
            ipnUrl: momoConfig.ipnUrl,
            requestType: momoConfig.requestType,
            extraData: '',
            lang: momoConfig.lang,
            signature: signature
        };

        console.log('📤 MoMo Request:', requestBody);

        // Gửi request đến MoMo
        const response = await axios.post(momoConfig.endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📥 MoMo Response:', response.data);

        if (response.data.resultCode === 0) {
            // Cập nhật thông tin giao dịch
            await db.query(
                `UPDATE thanh_toan 
                 SET ma_giao_dich = ?, phuong_thuc = 'momo', trang_thai = 'pending'
                 WHERE ma_don_hang = ?`,
                [requestId, orderId]
            );

            res.json({
                success: true,
                data: {
                    paymentUrl: response.data.payUrl,
                    requestId: requestId,
                    qrCodeUrl: response.data.qrCodeUrl
                }
            });
        } else {
            // Chi tiết lỗi từ MoMo
            const errorDetails = {
                resultCode: response.data.resultCode,
                message: response.data.message,
                localMessage: response.data.localMessage || response.data.message
            };
            
            console.error('❌ MoMo Error:', errorDetails);
            
            // Map các mã lỗi phổ biến
            const errorMessages = {
                1000: 'Giao dịch đã được khởi tạo, chờ người dùng xác nhận thanh toán',
                1001: 'Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền',
                1002: 'Giao dịch bị từ chối bởi nhà phát hành tài khoản thanh toán',
                1003: 'Giao dịch bị hủy',
                1004: 'Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức thanh toán của người dùng',
                1005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
                1006: 'Giao dịch thất bại do người dùng đã từ chối xác nhận thanh toán',
                1007: 'Giao dịch bị từ chối vì tài khoản người dùng đang bị tạm khóa',
                9000: 'Giao dịch được khởi tạo thành công, chờ xử lý thanh toán',
                9001: 'Tài khoản chưa được kích hoạt',
                9002: 'Chữ ký không hợp lệ',
                9003: 'Số dư không đủ',
                9004: 'URL không hợp lệ'
            };
            
            return res.status(400).json({
                success: false,
                message: errorMessages[response.data.resultCode] || response.data.localMessage || response.data.message || 'Không thể tạo thanh toán MoMo',
                errorCode: response.data.resultCode,
                details: errorDetails
            });
        }

    } catch (error) {
        console.error('❌ Lỗi tạo thanh toán MoMo:', error);
        
        // Nếu là lỗi từ axios (response từ MoMo)
        if (error.response) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi kết nối với MoMo',
                error: error.response.data?.message || error.message,
                details: error.response.data
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xử lý thanh toán',
            error: error.message
        });
    }
});

// Xử lý callback từ MoMo (redirect)
router.get('/momo-return', async (req, res) => {
    try {
        console.log('📥 MoMo Return:', req.query);

        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.query;

        // Verify signature
        const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const calculatedSignature = crypto
            .createHmac('sha256', momoConfig.secretKey)
            .update(rawSignature)
            .digest('hex');

        if (signaturesMatch(signature, calculatedSignature)) {
            const realOrderId = getRealOrderId(requestId);
            const orderAmount = await getOrderAmount(realOrderId);

            if (orderAmount === null) {
                return res.redirect(`/don-hang-cua-toi/?payment_failed=true&message=${encodeURIComponent('Không tìm thấy đơn hàng')}`);
            }

            if (Math.round(Number(amount)) !== orderAmount) {
                console.error('❌ MoMo amount mismatch:', { orderId, amount, orderAmount });
                return res.redirect(`/don-hang-cua-toi/?payment_failed=true&message=${encodeURIComponent('Số tiền thanh toán không khớp')}`);
            }

            if (resultCode === '0') {
                // Thanh toán thành công (idempotent: chỉ cập nhật khi chưa success)
                const [paymentResult] = await db.query(
                    `UPDATE thanh_toan 
                     SET trang_thai = 'success', 
                         thoi_gian_thanh_toan = NOW(),
                         thong_tin_them = ?
                     WHERE ma_giao_dich = ? AND trang_thai <> 'success'`,
                    [JSON.stringify({ transId, payType, message }), requestId]
                );

                if (paymentResult.affectedRows > 0) {
                    await db.query(
                        `UPDATE don_hang SET trang_thai = 'confirmed' WHERE ma_don_hang = ?`,
                        [realOrderId]
                    );
                }

                res.redirect(`/dat-hang-thanh-cong/?orderId=${realOrderId}&payment=momo&status=success`);
            } else {
                // Thanh toán thất bại
                await db.query(
                    `UPDATE thanh_toan 
                     SET trang_thai = 'failed',
                         thong_tin_them = ?
                     WHERE ma_giao_dich = ?`,
                    [JSON.stringify({ resultCode, message }), requestId]
                );

                res.redirect(`/don-hang-cua-toi/?payment_failed=true&orderId=${realOrderId}&message=${encodeURIComponent(message || 'Thanh toán không thành công')}`);
            }
        } else {
            res.redirect(`/don-hang-cua-toi/?payment_failed=true&message=${encodeURIComponent('Chữ ký không hợp lệ')}`);
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý callback MoMo:', error);
        res.redirect(`/don-hang-cua-toi/?payment_failed=true&message=${encodeURIComponent('Lỗi xử lý thanh toán')}`);
    }
});

// Retry payment MoMo
router.post('/momo/retry-payment/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;

        // Kiểm tra đơn hàng
        const [orderRows] = await db.query(
            'SELECT * FROM don_hang WHERE ma_don_hang = ? AND ma_nguoi_dung = ?',
            [orderId, req.user.ma_nguoi_dung]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        const order = orderRows[0];

        // Kiểm tra đơn hàng chưa thanh toán và chưa bị hủy
        if (order.trang_thai === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã bị hủy, không thể thanh toán'
            });
        }

        // Tạo request ID mới
        const requestId = `${orderId}_${Date.now()}`;
        const amount = Math.round(parseFloat(order.tong_tien)); // MoMo yêu cầu số nguyên
        const orderInfo = `Thanh toan lai don hang ${orderId}`;

        // Tạo raw signature
        const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;

        // Tạo chữ ký
        const signature = crypto
            .createHmac('sha256', momoConfig.secretKey)
            .update(rawSignature)
            .digest('hex');

        // Tạo request body
        const requestBody = {
            partnerCode: momoConfig.partnerCode,
            accessKey: momoConfig.accessKey,
            requestId: requestId,
            amount: amount, // MoMo yêu cầu số nguyên, không phải string
            orderId: requestId,
            orderInfo: orderInfo,
            redirectUrl: momoConfig.redirectUrl,
            ipnUrl: momoConfig.ipnUrl,
            requestType: momoConfig.requestType,
            extraData: '',
            lang: momoConfig.lang,
            signature: signature
        };

        // Gửi request đến MoMo
        const response = await axios.post(momoConfig.endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.resultCode === 0) {
            // Cập nhật thông tin giao dịch
            await db.query(
                `UPDATE thanh_toan 
                 SET ma_giao_dich = ?, phuong_thuc = 'momo', trang_thai = 'pending', thoi_gian_thanh_toan = NULL
                 WHERE ma_don_hang = ?`,
                [requestId, orderId]
            );

            res.json({
                success: true,
                data: {
                    paymentUrl: response.data.payUrl,
                    requestId: requestId
                }
            });
        } else {
            // Chi tiết lỗi từ MoMo
            const errorDetails = {
                resultCode: response.data.resultCode,
                message: response.data.message,
                localMessage: response.data.localMessage || response.data.message
            };
            
            console.error('❌ MoMo Retry Error:', errorDetails);
            
            // Map các mã lỗi phổ biến
            const errorMessages = {
                1002: 'Giao dịch bị từ chối bởi nhà phát hành tài khoản thanh toán',
                9002: 'Chữ ký không hợp lệ - Vui lòng kiểm tra cấu hình MoMo',
                9003: 'Số dư không đủ',
                9004: 'URL không hợp lệ'
            };
            
            return res.status(400).json({
                success: false,
                message: errorMessages[response.data.resultCode] || response.data.localMessage || response.data.message || 'Không thể tạo thanh toán MoMo',
                errorCode: response.data.resultCode,
                details: errorDetails
            });
        }

    } catch (error) {
        console.error('❌ Lỗi thanh toán lại MoMo:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// IPN (Instant Payment Notification) từ MoMo
router.post('/momo-ipn', async (req, res) => {
    try {
        console.log('📥 MoMo IPN:', req.body);

        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.body;

        // Verify signature
        const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const calculatedSignature = crypto
            .createHmac('sha256', momoConfig.secretKey)
            .update(rawSignature)
            .digest('hex');

        if (!signaturesMatch(signature, calculatedSignature)) {
            return res.status(200).json({ resultCode: 97, message: 'Invalid signature' });
        }

        if (resultCode === 0) {
            const realOrderId = getRealOrderId(requestId);
            const orderAmount = await getOrderAmount(realOrderId);

            if (orderAmount === null || Math.round(Number(amount)) !== orderAmount) {
                console.error('❌ MoMo IPN amount mismatch:', { orderId, requestId, amount, orderAmount });
                return res.status(200).json({ resultCode: 97, message: 'Amount mismatch' });
            }

            // Idempotent: IPN có thể được gọi lặp lại
            const [paymentResult] = await db.query(
                `UPDATE thanh_toan 
                 SET trang_thai = 'success', 
                     thoi_gian_thanh_toan = NOW()
                 WHERE ma_giao_dich = ? AND trang_thai <> 'success'`,
                [requestId]
            );

            if (paymentResult.affectedRows > 0) {
                await db.query(
                    `UPDATE don_hang SET trang_thai = 'confirmed' WHERE ma_don_hang = ?`,
                    [realOrderId]
                );
            }

            res.status(200).json({ resultCode: 0, message: 'Success' });
        } else {
            res.status(200).json({ resultCode: 0, message: 'Acknowledged' });
        }
    } catch (error) {
        console.error('❌ Lỗi IPN MoMo:', error);
        res.status(200).json({ resultCode: 99, message: 'Unknown error' });
    }
});

module.exports = router;
