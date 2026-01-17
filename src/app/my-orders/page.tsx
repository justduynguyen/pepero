'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/types';

interface Order {
  orderNumber: string;
  timestamp: string;
  totalAmount: number;
  paymentMethod: string;
  items: CartItem[];
  status: string;
  note?: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('pepero_orders') || '[]');
      // Sort by newest first
      const sortedOrders = savedOrders.sort((a: Order, b: Order) => {
        // Parse timestamp (DD/MM/YYYY, HH:MM:SS format usually)
        // Simple string comparison works for ISO, but for locale string strictly:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOrderClick = (orderNumber: string) => {
    const encodedOrderNo = encodeURIComponent(orderNumber);
    router.push(`/my-order/${encodedOrderNo}`);
  };

  // Helper for Status Styles
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    
    if (s === 'completed' || s === 'done') {
      return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">Hoàn thành</span>;
    }
    if (s === 'confirmed') {
      return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">Đã xác nhận</span>;
    }
    return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wide">Chờ xử lý</span>;
  };

  // Helper for Payment Icons
  const getPaymentIcon = (method: string) => {
    if (method === 'bank-transfer') return '💳';
    if (method === 'pickup') return '🏠';
    return '🚚';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff1f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-rose-500"></div>
          <p className="text-rose-400 font-bold text-sm tracking-widest uppercase">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff1f2] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Đơn hàng</h1>
            <p className="text-gray-500 text-sm font-medium">Lịch sử mua sắm của bạn 🛍️</p>
          </div>
          <Link 
            href="/"
            className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-rose-100 flex items-center justify-center text-rose-500 hover:scale-105 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 text-center border border-white shadow-lg shadow-rose-100/50 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              📦
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Giỏ hàng đang trống trơn nè! <br/>
              Hãy lấp đầy nó bằng những chiếc bánh xinh xắn nha.
            </p>
            <Link 
              href="/"
              className="inline-flex px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 hover:-translate-y-1 transition-all"
            >
              Đi mua sắm ngay →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, index) => (
              <div 
                key={order.orderNumber}
                onClick={() => handleOrderClick(order.orderNumber)}
                className="group bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-5 shadow-lg shadow-rose-100/30 hover:shadow-rose-200/50 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }} // Stagger animation
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50/0 via-rose-50/30 to-rose-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Top Row: ID & Status */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mã đơn hàng</span>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">
                      #{order.orderNumber}
                    </h3>
                  </div>
                  {/* {getStatusBadge(order.status)} */}
                </div>

                {/* Middle Row: Info Grid */}
                <div className="bg-white/50 rounded-2xl p-3 mb-4 border border-white flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg border border-gray-100">
                           {getPaymentIcon(order.paymentMethod)}
                        </div>
                        <div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày đặt</p>
                           <p className="text-xs font-semibold text-gray-700">{order.timestamp.split(',')[0]}</p> 
                           {/* Splits to show just date if formatted like "HH:mm, DD/MM/YYYY" */}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Số lượng</p>
                        <p className="text-xs font-semibold text-gray-700">{order.items.length} món</p>
                    </div>
                </div>

                {/* Bottom Row: Total & Action */}
                <div className="flex items-center justify-between relative z-10">
                   <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Tổng thanh toán</p>
                      <p className="text-xl font-black text-rose-500">{order.totalAmount.toLocaleString('vi-VN')}đ</p>
                   </div>
                   <button className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>
              </div>
            ))}
            
            <p className="text-center text-xs text-gray-400 font-medium pt-4 pb-8">
              Hiển thị {orders.length} đơn hàng gần nhất
            </p>
          </div>
        )}
      </div>
    </div>
  );
}