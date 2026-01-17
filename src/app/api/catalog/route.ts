import { NextResponse } from 'next/server';
import { getCategories, getProducts, getAddons } from '@/lib/data';

/**
 * GET /api/catalog
 * Returns all catalog data (categories, products, addons) in a single request
 * Data is cached for 5 minutes in memory
 */
export async function GET() {
  try {
    const [categories, addons] = await Promise.all([
      getCategories(),
      getAddons(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        addons,
      },
    });
  } catch (error) {
    console.error('Catalog fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}
