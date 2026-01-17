// import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Pepero components (What's Inside)
const peperoComponents = [
  { icon: '🥢', label: '15 Que Bánh' },
  { icon: '🍬', label: '3 Charm Decor' },
  { icon: '◀', label: '3 Túi Bắt Kem' },
  { icon: '▐', label: '15 Túi Đựng' },
  { icon: '📦', label: 'Hộp + Rơm' },
  { icon: '📜', label: 'Giấy Nến' },
];

// Cakepop components (What's Inside)
const cakepopComponents = [
  { icon: '🍰', label: '1 Bánh bông lan' },
  { icon: '📦', label: '1 Hộp Trắng' },
  { icon: '◀', label: '3 Túi Bắt Kem' },
  { icon: '🧁', label: '12 Cupcake' },
  { icon: '📜', label: 'Giấy Nến' },
  { icon: '🍬', label: '3 Charm Decor' },
];

// Charm data for sets
const charmSetsData = {
  'set-a': [
    { emoji: '🌸', name: 'Hoa' },
    { emoji: '⚪', name: 'Ngọc Trai' },
    { emoji: '💗', name: 'Tim Hồng' },
  ],
  'set-b': [
    { emoji: '💜', name: 'Ngọc Tím' },
    { emoji: '🎀', name: 'Nơ Hồng' },
    { emoji: '💗', name: 'Tim Hồng' },
  ],
};

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.charm.deleteMany();
  await prisma.product.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.category.deleteMany();

  // Create categories with fixed IDs
  const pepero = await prisma.category.create({
    data: {
      id: 'cat-pepero-001',
      slug: 'pepero',
      name: 'Pepero',
      image: '/imgs/Set-1.jpg',
    },
  });

  const cakepop = await prisma.category.create({
    data: {
      id: 'cat-cakepop-002',
      slug: 'cakepop',
      name: 'Cakepop',
      image: '/imgs/Set-1.jpg',
    },
  });

  // Create Pepero products with fixed IDs
  const peperoSetA = await prisma.product.create({
    data: {
      id: 'prod-pepero-set-a',
      name: 'Set A',
      price: 60000,
      image: '/imgs/Set-1.jpg',
      categoryId: pepero.id,
      components: peperoComponents,
      charms: {
        create: charmSetsData['set-a'],
      },
    },
  });

  const peperoSetB = await prisma.product.create({
    data: {
      id: 'prod-pepero-set-b',
      name: 'Set B',
      price: 60000,
      image: '/imgs/Set-2.jpg',
      categoryId: pepero.id,
      components: peperoComponents,
      charms: {
        create: charmSetsData['set-b'],
      },
    },
  });

  // Create Cakepop products with fixed IDs
  const cakepopSetA = await prisma.product.create({
    data: {
      id: 'prod-cakepop-set-a',
      name: 'Set A',
      price: 71000,
      image: '/imgs/Set-1.jpg',
      categoryId: cakepop.id,
      components: cakepopComponents,
      charms: {
        create: charmSetsData['set-a'],
      },
    },
  });

  const cakepopSetB = await prisma.product.create({
    data: {
      id: 'prod-cakepop-set-b',
      name: 'Set B',
      price: 71000,
      image: '/imgs/Set-2.jpg',
      categoryId: cakepop.id,
      components: cakepopComponents,
      charms: {
        create: charmSetsData['set-b'],
      },
    },
  });

  // Create global AddOns with fixed IDs
  const addonsData = [
    { id: 'addon-banh-pepero', name: 'Bánh thêm', price: 1000, unit: 'que' },
    { id: 'addon-socola', name: 'Socola thêm', price: 10000, unit: 'túi' },
    { id: 'addon-tui-pepero', name: 'Túi thêm', price: 500, unit: 'túi' },
    { id: 'addon-charm', name: 'Charm thêm', price: 5000, unit: 'túi' },
    { id: 'addon-banh-cakepop', name: 'Bánh bông lan thêm', price: 18000, unit: 'cái' },
    { id: 'addon-cupcake', name: 'Cupcake thêm', price: 500, unit: 'cái' },
    { id: 'addon-hop-cakepop', name: 'Hộp đựng cakepop thêm', price: 5000, unit: 'cái' },
  ];

  for (const addon of addonsData) {
    await prisma.addOn.create({ data: addon });
  }

  console.log('✅ Seeding completed!');
  console.log(`   Categories: ${pepero.name}, ${cakepop.name}`);
  console.log(`   Products: Pepero Set A/B, Cakepop Set A/B`);
  console.log(`   AddOns: 4`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
