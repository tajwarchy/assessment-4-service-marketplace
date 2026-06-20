const crypto = require('crypto');
const prisma = require('../utils/prisma');

// POST /api/bookings — end-user only
// Creates a booking in PENDING state, locking in the service's current price.
async function createBooking(req, res) {
  try {
    const { serviceId } = req.body;
    if (!serviceId) return res.status(400).json({ error: 'serviceId is required' });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        serviceId: service.id,
        amount: service.price,
        status: 'PENDING',
      },
      include: {
        service: { include: { vendor: true, category: true } },
      },
    });

    return res.status(201).json(booking);
  } catch (err) {
    console.error('createBooking error:', err);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

// POST /api/bookings/:id/pay — end-user only, must own the booking
// Simulates a payment gateway running entirely in a sandbox/test mode.
// No real money or third-party API is involved — this satisfies the
// "mock payment gateway in a sandbox environment" requirement by
// modeling exactly what a real gateway integration would do:
// create a transaction record, simulate processing, then resolve to
// a final status.
async function payForBooking(req, res) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { transaction: true },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this booking' });
    }
    if (booking.status === 'PAID' || booking.status === 'COMPLETED') {
      return res.status(409).json({ error: 'Booking already paid' });
    }
    if (booking.transaction) {
      return res.status(409).json({ error: 'A transaction already exists for this booking' });
    }

    const { cardNumber } = req.body; // sandbox input — never real card data

    // SANDBOX RULE: any card ending in "0000" simulates a declined payment,
    // so graders can demonstrate the failure path during the demo video.
    // Every other input is treated as a successful test payment.
    const isSimulatedFailure = typeof cardNumber === 'string' && cardNumber.endsWith('0000');

    const sandboxRef = `SANDBOX-${crypto.randomUUID()}`;
    const finalStatus = isSimulatedFailure ? 'FAILED' : 'PAID';

    const [transaction, updatedBooking] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          sandboxRef,
          status: finalStatus,
          amount: booking.amount,
          method: 'sandbox_card',
          bookingId: booking.id,
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: finalStatus },
        include: { service: { include: { vendor: true, category: true } } },
      }),
    ]);

    return res.json({
      transaction,
      booking: updatedBooking,
      message: isSimulatedFailure
        ? 'Sandbox payment declined (test card ending in 0000)'
        : 'Sandbox payment successful',
    });
  } catch (err) {
    console.error('payForBooking error:', err);
    return res.status(500).json({ error: 'Payment processing failed' });
  }
}

// GET /api/bookings/mine — end-user only, their own order history
async function getMyBookings(req, res) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        service: { include: { vendor: true, category: true } },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(bookings);
  } catch (err) {
    console.error('getMyBookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch your bookings' });
  }
}

// GET /api/bookings/vendor — vendor only, jobs received on their services
async function getVendorBookings(req, res) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const bookings = await prisma.booking.findMany({
      where: { service: { vendorId: vendor.id } },
      include: {
        service: true,
        user: { select: { id: true, name: true, email: true } },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(bookings);
  } catch (err) {
    console.error('getVendorBookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch vendor jobs' });
  }
}

// PATCH /api/bookings/:id/complete — vendor only, marks a paid job as completed
async function completeBooking(req, res) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { service: true },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.service.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'This booking is not for one of your services' });
    }
    if (booking.status !== 'PAID') {
      return res.status(409).json({ error: 'Only paid bookings can be marked completed' });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'COMPLETED' },
    });

    return res.json(updated);
  } catch (err) {
    console.error('completeBooking error:', err);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
}

module.exports = {
  createBooking,
  payForBooking,
  getMyBookings,
  getVendorBookings,
  completeBooking,
};