const prisma = require('../utils/prisma');

// GET /api/admin/users — admin only
async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: { vendorProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      vendorProfile: u.vendorProfile,
    }));

    return res.json(safeUsers);
  } catch (err) {
    console.error('listUsers error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// GET /api/admin/stats — admin only, simple dashboard counters
async function getStats(req, res) {
  try {
    const [userCount, vendorCount, serviceCount, bookingCount, paidCount] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'VENDOR' } }),
      prisma.service.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PAID' } }),
    ]);

    return res.json({ userCount, vendorCount, serviceCount, bookingCount, paidCount });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

module.exports = { listUsers, getStats };