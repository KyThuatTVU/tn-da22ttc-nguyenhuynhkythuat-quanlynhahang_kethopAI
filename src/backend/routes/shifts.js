const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { requireStaffOrAdmin, requireManagerOrAdmin } = require('../middleware/auth.middleware');

// Quản lý ca làm việc
router.get('/', requireStaffOrAdmin, shiftController.getAllShifts);
router.post('/', requireManagerOrAdmin, shiftController.createShift);
router.put('/:id', requireManagerOrAdmin, shiftController.updateShift);
router.delete('/:id', requireManagerOrAdmin, shiftController.deleteShift);

// Quản lý phân ca
router.get('/schedules', requireStaffOrAdmin, shiftController.getSchedules);
router.post('/schedules', requireManagerOrAdmin, shiftController.createSchedule);
router.delete('/schedules/:id', requireManagerOrAdmin, shiftController.deleteSchedule);

module.exports = router;
