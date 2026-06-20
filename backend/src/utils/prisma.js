const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient instance across the app (avoids exhausting
// the connection pool when nodemon hot-reloads in development).
const prisma = new PrismaClient();

module.exports = prisma;