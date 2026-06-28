/**
 * Routes cho Lương Tạm Tính Hàng Ngày
 */
const express = require('express');
const router = express.Router();
const dailySalaryController = require('../controllers/dailySalaryController');
const { requireAdminAuth, requireStaffAuth } = require('../middleware/auth.middleware');

// API cho Admin
router.get('/', requireAdminAuth, dailySalaryController.getDailySalary);
router.post('/recalculate', requireAdminAuth, dailySalaryController.recalculateDailySalary);
router.post('/generate-monthly', requireAdminAuth, dailySalaryController.generateMonthlyFromDaily);

// API cho Staff (xem lương của chính mình)
router.get('/my-salary', requireStaffAuth, dailySalaryController.getMyDailySalary);

module.exports = router;
