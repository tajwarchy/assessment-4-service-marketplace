const express = require('express');
const router = express.Router();
const { listCategories, createCategory } = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', listCategories);
router.post('/', requireAuth, requireRole('ADMIN'), createCategory);

module.exports = router;