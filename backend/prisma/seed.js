const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@marketplace.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  // --- Vendor 1 ---
  const vendor1User = await prisma.user.upsert({
    where: { email: 'vendor1@marketplace.com' },
    update: {},
    create: {
      name: 'Rahim Cleaning Co.',
      email: 'vendor1@marketplace.com',
      password: passwordHash,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          businessName: 'Rahim Cleaning Co.',
          description: 'Professional home and office cleaning services.',
        },
      },
    },
    include: { vendorProfile: true },
  });

  // --- Vendor 2 ---
  const vendor2User = await prisma.user.upsert({
    where: { email: 'vendor2@marketplace.com' },
    update: {},
    create: {
      name: 'QuickFix Electricians',
      email: 'vendor2@marketplace.com',
      password: passwordHash,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          businessName: 'QuickFix Electricians',
          description: 'Licensed electrical repair and installation.',
        },
      },
    },
    include: { vendorProfile: true },
  });

  // --- End users ---
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@marketplace.com' },
    update: {},
    create: {
      name: 'Fahim Ahmed',
      email: 'user1@marketplace.com',
      password: passwordHash,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@marketplace.com' },
    update: {},
    create: {
      name: 'Nusrat Jahan',
      email: 'user2@marketplace.com',
      password: passwordHash,
      role: 'USER',
    },
  });

  // --- Categories ---
  const categoryNames = ['Home Cleaning', 'Electrical', 'Plumbing', 'AC Repair', 'Painting'];
  const categories = {};
  for (const name of categoryNames) {
    categories[name] = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Services ---
  const vendor1 = vendor1User.vendorProfile;
  const vendor2 = vendor2User.vendorProfile;

  await prisma.service.createMany({
    data: [
      {
        title: 'Deep Home Cleaning',
        description: 'Full home deep cleaning, 3-bedroom apartments.',
        price: 1500,
        vendorId: vendor1.id,
        categoryId: categories['Home Cleaning'].id,
      },
      {
        title: 'Office Cleaning (Monthly)',
        description: 'Recurring monthly office cleaning contract.',
        price: 5000,
        vendorId: vendor1.id,
        categoryId: categories['Home Cleaning'].id,
      },
      {
        title: 'Ceiling Fan Installation',
        description: 'Installation of up to 2 ceiling fans.',
        price: 800,
        vendorId: vendor2.id,
        categoryId: categories['Electrical'].id,
      },
      {
        title: 'Full House Wiring Check',
        description: 'Safety inspection and minor repairs.',
        price: 2000,
        vendorId: vendor2.id,
        categoryId: categories['Electrical'].id,
      },
      {
        title: 'AC Gas Refill & Service',
        description: 'Split AC gas refill and general servicing.',
        price: 1800,
        vendorId: vendor2.id,
        categoryId: categories['AC Repair'].id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.');
  console.log('Login credentials (all use password: Password123!):');
  console.log('  Admin:   admin@marketplace.com');
  console.log('  Vendor1: vendor1@marketplace.com');
  console.log('  Vendor2: vendor2@marketplace.com');
  console.log('  User1:   user1@marketplace.com');
  console.log('  User2:   user2@marketplace.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });