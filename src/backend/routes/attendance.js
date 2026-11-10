const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { requireStaffOrAdmin, requireManagerOrAdmin } = require('../middleware/auth.middleware');

// Quản lý chấm công (Admin/Manager)
router.get('/', requireStaffOrAdmin, attendanceController.getAttendanceRecords);
router.post('/check-in-out', requireStaffOrAdmin, attendanceController.checkInOut);
router.post('/manual', requireManagerOrAdmin, attendanceController.createManualAttendance);
router.put('/:id', requireManagerOrAdmin, attendanceController.updateAttendanceRecord);
router.delete('/:id', requireManagerOrAdmin, attendanceController.deleteAttendanceRecord);

// Chấm công với ảnh (Staff - có auth)
router.post('/checkin', attendanceController.upload.single('image'), attendanceController.checkInWithPhoto);

// Chấm công tự động (Public - không cần auth)
router.post('/check-in', attendanceController.autoCheckIn);
router.post('/check-out', attendanceController.autoCheckOut);
router.post('/face-checkin', attendanceController.upload.single('image'), attendanceController.faceCheckIn);
router.post('/face-checkout', attendanceController.upload.single('image'), attendanceController.faceCheckOut);
router.get('/today/:ma_nv_code', attendanceController.getTodayAttendance);

module.exports = router;
