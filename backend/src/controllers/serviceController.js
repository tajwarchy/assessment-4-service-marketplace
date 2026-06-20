const prisma = require('../utils/prisma');

// GET /api/services?search=&categoryId=&minPrice=&maxPrice=
// Public marketplace catalog with search + filters.
async function listServices(req, res) {
  try {
    const { search, categoryId, minPrice, maxPrice } = req.query;

    const where = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      }),
    };

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        vendor: { select: { id: true, businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(services);
  } catch (err) {
    console.error('listServices error:', err);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
}

// GET /api/services/:id — public
async function getServiceById(req, res) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        vendor: { select: { id: true, businessName: true, description: true } },
      },
    });

    if (!service) return res.status(404).json({ error: 'Service not found' });
    return res.json(service);
  } catch (err) {
    console.error('getServiceById error:', err);
    return res.status(500).json({ error: 'Failed to fetch service' });
  }
}

// GET /api/services/mine — vendor only, list services owned by the logged-in vendor
async function getMyServices(req, res) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const services = await prisma.service.findMany({
      where: { vendorId: vendor.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(services);
  } catch (err) {
    console.error('getMyServices error:', err);
    return res.status(500).json({ error: 'Failed to fetch your services' });
  }
}

// POST /api/services — vendor only, create a new service listing
async function createService(req, res) {
  try {
    const { title, description, price, categoryId } = req.body;

    if (!title || !price || !categoryId) {
      return res.status(400).json({ error: 'title, price, and categoryId are required' });
    }

    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price,
        categoryId,
        vendorId: vendor.id,
      },
      include: { category: true },
    });

    return res.status(201).json(service);
  } catch (err) {
    console.error('createService error:', err);
    return res.status(500).json({ error: 'Failed to create service' });
  }
}

// PUT /api/services/:id — vendor only, must own the service
async function updateService(req, res) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'You do not own this service' });
    }

    const { title, description, price, categoryId } = req.body;

    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: { category: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error('updateService error:', err);
    return res.status(500).json({ error: 'Failed to update service' });
  }
}

// DELETE /api/services/:id — vendor only, must own the service
async function deleteService(req, res) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'You do not own this service' });
    }

    await prisma.service.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('deleteService error:', err);
    return res.status(500).json({ error: 'Failed to delete service' });
  }
}

module.exports = {
  listServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
};