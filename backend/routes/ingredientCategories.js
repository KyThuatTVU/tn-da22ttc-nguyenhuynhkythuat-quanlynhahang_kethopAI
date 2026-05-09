const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredientCategoryController');
const { requireAdminAuth } = require('../middleware/auth.middleware');

// Toàn bộ route yêu cầu quyền Admin
router.get('/', requireAdminAuth, controller.getAllCategories);
router.post('/', requireAdminAuth, controller.createCategory);
router.put('/:id', requireAdminAuth, controller.updateCategory);
router.delete('/:id', requireAdminAuth, controller.deleteCategory);

module.exports = router;
