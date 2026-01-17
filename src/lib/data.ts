import prisma from './db';
import { cache, CACHE_KEYS } from './cache';

/**
 * Get all categories with their products
 * Cached for 5 minutes
 */
export async function getCategories() {
  return cache.getOrFetch(CACHE_KEYS.CATEGORIES, async () => {
    return prisma.category.findMany({
      include: {
        products: {
          include: {
            charms: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  });
}

/**
 * Get a single category by slug with its products
 */
export async function getCategoryBySlug(slug: string) {
  return cache.getOrFetch(CACHE_KEYS.CATEGORY(slug), async () => {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            charms: true,
          },
        },
      },
    });
  });
}

/**
 * Get all products (optionally filtered by category)
 */
export async function getProducts(categoryId?: string) {
  const cacheKey = categoryId 
    ? CACHE_KEYS.PRODUCTS_BY_CATEGORY(categoryId) 
    : CACHE_KEYS.PRODUCTS;
    
  return cache.getOrFetch(cacheKey, async () => {
    return prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        charms: true,
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  });
}

/**
 * Get all addons
 * Cached for 5 minutes
 */
export async function getAddons() {
  return cache.getOrFetch(CACHE_KEYS.ADDONS, async () => {
    return prisma.addOn.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' },
    });
  });
}

/**
 * Invalidate all product-related caches
 * Call this after updating products, categories, or addons
 */
export function invalidateProductCache() {
  cache.clear(); // Clear everything for simplicity
}
