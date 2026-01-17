import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

/**
 * POST /api/cache/invalidate
 * Clears the in-memory cache to force fresh data fetch
 * 
 * Usage: POST /api/cache/invalidate
 * Body (optional): { "prefix": "products" } to clear only matching keys
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prefix = body.prefix as string | undefined;
    
    const statsBefore = cache.stats();
    cache.clear(prefix);
    const statsAfter = cache.stats();
    
    return NextResponse.json({
      success: true,
      message: prefix 
        ? `Cleared cache entries with prefix: ${prefix}`
        : 'All cache cleared',
      before: statsBefore.size,
      after: statsAfter.size,
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cache/invalidate
 * Returns cache stats
 */
export async function GET() {
  return NextResponse.json({
    ...cache.stats(),
  });
}
