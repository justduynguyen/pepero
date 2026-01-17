'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OrderNotification() {
  const [orderCount, setOrderCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const updateOrderCount = () => {
      try {
        const saved = localStorage.getItem('pepero_orders') || '[]';
        const savedOrders = JSON.parse(saved);
        const pending = Array.isArray(savedOrders)
          ? savedOrders.filter((o: any) => o.status === 'pending')
          : [];
        setOrderCount(pending.length);
      } catch (err) {
        console.error('Error loading orders:', err);
      }
    };

    updateOrderCount();

    const onStorage = () => updateOrderCount();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', updateOrderCount);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', updateOrderCount);
    };
  }, []);

  // Hide on order detail pages
  if (pathname?.startsWith('/my-order')) return null;

  // Don't show if no orders
  if (orderCount === 0) return null;

  return (
    <Link
      href="/my-orders"
      style={{ background: 'linear-gradient(90deg,#6A5ACD,#8A2BE2)', color: '#fff' }}
      className="block sticky top-0 z-50 w-full text-center text-sm py-1.5 shadow-lg hover:opacity-90 transition-opacity"
    >
      <span className="text-lg">📦</span> Bạn có {orderCount} đơn hàng <span className="hidden sm:inline">→</span> <span className="underline">Click vào đây để xem lại</span>
    </Link>
  );
}
