const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { requireManagerOrAdmin } = require('../middleware/auth.middleware');

router.use(requireManagerOrAdmin);

// Quản lý lương
router.get('/', payrollController.getPayrollReports);
router.post('/generate', payrollController.generatePayroll);
router.put('/:id', payrollController.updatePayrollReport);
router.delete('/:id', payrollController.deletePayrollReport);

module.exports = router;
