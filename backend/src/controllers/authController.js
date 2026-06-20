const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { signToken } = require('../utils/token');

const ALLOWED_SELF_SIGNUP_ROLES = ['USER', 'VENDOR'];

// POST /api/auth/register
// Public end-users and vendors can self-register. Admin accounts are
// NOT creatable through this endpoint — they must be seeded/created
// directly in the database for security.
async function register(req, res) {
  try {
    const { name, email, password, role, businessName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const safeRole = ALLOWED_SELF_SIGNUP_ROLES.includes(role) ? role : 'USER';

    if (safeRole === 'VENDOR' && !businessName) {
      return res.status(400).json({ error: 'businessName is required for vendor signup' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: safeRole,
        ...(safeRole === 'VENDOR' && {
          vendorProfile: {
            create: { businessName },
          },
        }),
      },
      include: { vendorProfile: true },
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorProfile: user.vendorProfile || null,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Something went wrong during registration' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { vendorProfile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorProfile: user.vendorProfile || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Something went wrong during login' });
  }
}

// GET /api/auth/me
// Returns the currently authenticated user's profile. Used by the
// frontend to restore session state on page reload.
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { vendorProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorProfile: user.vendorProfile || null,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { register, login, getMe };