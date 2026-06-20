const express = require('express');
const router = express.Router();
const {
  createBooking,
  payForBooking,
  getMyBookings,
  getVendorBookings,
  completeBooking,
} = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, requireRole('USER'), createBooking);
router.post('/:id/pay', requireAuth, requireRole('USER'), payForBooking);
router.get('/mine', requireAuth, requireRole('USER'), getMyBookings);
router.get('/vendor', requireAuth, requireRole('VENDOR'), getVendorBookings);
router.patch('/:id/complete', requireAuth, requireRole('VENDOR'), completeBooking);

module.exports = router;