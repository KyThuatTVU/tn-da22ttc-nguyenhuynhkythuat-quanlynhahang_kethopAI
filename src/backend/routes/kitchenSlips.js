const express = require('express');
const router = express.Router();
const controller = require('../controllers/kitchenSlipController');
const { requireStaffOrAdmin } = require('../middleware/auth.middleware');

router.use(requireStaffOrAdmin);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id/approve', controller.approve);
router.delete('/:id', controller.delete);

module.exports = router;
