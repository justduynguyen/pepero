"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const pool = new pg_1.default.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
    // Create categories
    const pepero = await prisma.category.create({
        data: {
            slug: 'pepero',
            name: 'Pepero',
            image: '/imgs/Set-1.jpg',
        },
    });
    const cakepop = await prisma.category.create({
        data: {
            slug: 'cakepop',
            name: 'Cakepop',
            image: '/imgs/Set-1.jpg',
        },
    });
    // Create Pepero products (Set A & Set B)
    const peperoSetA = await prisma.product.create({
        data: {
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
    // Create Cakepop products (Set A & Set B)
    const cakepopSetA = await prisma.product.create({
        data: {
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
    // Create global AddOns
    await prisma.addOn.createMany({
        data: [
            { name: 'Bánh thêm', price: 2000, unit: 'que' },
            { name: 'Socola thêm', price: 10000, unit: 'túi' },
            { name: 'Túi thêm', price: 1000, unit: 'túi' },
            { name: 'Charm thêm', price: 5000, unit: 'túi' },
            { name: 'Bánh bông lan thêm', price: 18000, unit: 'cái' },
            { name: 'Cupcake thêm', price: 500, unit: 'cái' },
            { name: 'Hộp đựng cakepop thêm', price: 5000, unit: 'cái' },
        ],
    });
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
