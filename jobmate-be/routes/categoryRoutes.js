const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const requireLogin = require('../middlewares/auth');

// CRUD category (có thể chỉ admin hoặc client mới được phép tạo/update/delete)
router.get('/', categoryController.getCategories);
router.get('/name/:name', categoryController.getCategoryByName);

router.post('/', requireLogin, categoryController.createCategory);
router.put('/:id', requireLogin, categoryController.updateCategory);
router.delete('/:id', requireLogin, categoryController.deleteCategory);

module.exports = router;
