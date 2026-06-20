const express = require('express');
const router = express.Router();
const { listUsers, getStats } = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/users', requireAuth, requireRole('ADMIN'), listUsers);
router.get('/stats', requireAuth, requireRole('ADMIN'), getStats);

module.exports = router;