const prisma = require('../utils/prisma');

// GET /api/categories — public
async function listCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(categories);
  } catch (err) {
    console.error('listCategories error:', err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

// POST /api/categories — admin only
async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const category = await prisma.category.create({ data: { name } });
    return res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    console.error('createCategory error:', err);
    return res.status(500).json({ error: 'Failed to create category' });
  }
}

module.exports = { listCategories, createCategory };