// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// import { CartItem } from '@/types';

// interface Order {
//   orderNumber: string;
//   timestamp: string;
//   totalAmount: number;
//   paymentMethod: string;
//   items: CartItem[];
//   status: string;
//   note?: string;
// }

// export default function MyOrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     try {
//       const savedOrders = JSON.parse(localStorage.getItem('pepero_orders') || '[]');
//       // Sort by newest first
//       const sortedOrders = savedOrders.sort((a: Order, b: Order) => {
//         return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
//       });
//       setOrders(sortedOrders);
//     } catch (error) {
//       console.error('Error loading orders:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const handleOrderClick = (orderNumber: string) => {
//     const encodedOrderNo = encodeURIComponent(orderNumber);
//     router.push(`/my-order/${encodedOrderNo}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-linear-to-br from-pink-100 to-purple-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
//           <p className="text-gray-700 font-semibold">Đang tải...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-linear-to-br from-pink-100 to-purple-100 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold text-gray-900">📦 Đơn hàng của tôi</h1>
//             <Link 
//               href="/"
//               className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors"
//             >
//               🏠 Về trang chủ
//             </Link>
//           </div>
//           <p className="text-gray-600">
//             Bạn có <span className="font-bold text-pink-700">{orders.length}</span> đơn hàng
//           </p>
//         </div>

//         {/* Orders List */}
//         {orders.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
//             <div className="text-6xl mb-4">📭</div>
//             <h2 className="text-xl font-bold text-gray-900 mb-2">
//               Chưa có đơn hàng nào
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Hãy đặt hàng ngay để thưởng thức các món ngon từ Pepero!
//             </p>
//             <Link 
//               href="/"
//               className="inline-block px-6 py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
//             >
//               🛒 Đặt hàng ngay
//             </Link>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {orders.map((order) => (
//               <div 
//                 key={order.orderNumber}
//                 className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow cursor-pointer"
//                 onClick={() => handleOrderClick(order.orderNumber)}
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900 mb-1">
//                       Đơn hàng #{order.orderNumber}
//                     </h3>
//                     <p className="text-sm text-gray-600">{order.timestamp}</p>
//                   </div>
//                     <div className="text-right">
//                     <p className="text-xl font-bold text-pink-700">
//                       {order.totalAmount.toLocaleString('vi-VN')}₫
//                     </p>
//                     {order.status === 'pending' && (
//                       <span className="inline-block mt-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
//                         ⏳ Chờ xác nhận
//                       </span>
//                     )}
//                     {order.status === 'confirmed' && (
//                       <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
//                         ✅ Đã xác nhận
//                       </span>
//                     )}
//                     {order.status === 'completed' && (
//                       <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
//                         🎉 Hoàn thành
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-200 pt-4">
//                   <div className="flex items-center justify-between text-sm">
//                     <div className="flex items-center gap-4 text-gray-600">
//                       <span>
//                         {order.paymentMethod === 'bank-transfer' && '💳 Chuyển khoản'}
//                         {order.paymentMethod === 'cod' && '🚚 Ship COD'}
//                         {order.paymentMethod === 'pickup' && '🏠 Lấy hàng'}
//                       </span>
//                       <span>•</span>
//                       <span>{order.items.length} món</span>
//                       {order.note && (
//                         <div className="mt-2">
//                           <span className="inline-flex items-center px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-semibold text-yellow-800">📝 Có ghi chú</span>
//                         </div>
//                       )}
//                     </div>
//                     <button className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1">
//                       Xem chi tiết
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
