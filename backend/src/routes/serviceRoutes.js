const express = require('express');
const router = express.Router();
const {
  listServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { requireAuth, requireRole } = require('../middleware/auth');

// IMPORTANT: /mine must come before /:id or Express will try to
// treat "mine" as an :id parameter.
router.get('/mine', requireAuth, requireRole('VENDOR'), getMyServices);

router.get('/', listServices);
router.get('/:id', getServiceById);

router.post('/', requireAuth, requireRole('VENDOR'), createService);
router.put('/:id', requireAuth, requireRole('VENDOR'), updateService);
router.delete('/:id', requireAuth, requireRole('VENDOR'), deleteService);

module.exports = router;