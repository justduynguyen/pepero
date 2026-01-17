// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { CartItem } from '@/types';
// import { generateTransferQR } from '@/utils/vietqr';
// import QRCode from 'qrcode';

// interface Order {
//   orderNumber: string;
//   timestamp: string;
//   totalAmount: number;
//   paymentMethod: string;
//   items: CartItem[];
//   status: string;
//   recipientName?: string;
//   phone?: string;
//   address?: string;
//   selectedCharms?: string[];
//   selectedAddOns?: string[];
//   note?: string;
//   socialLink?: string;
// }

// export default function OrderSuccessPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [order, setOrder] = useState<Order | null>(null);
//   const [orderStatus, setOrderStatus] = useState<string | null>(null);
//   const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [copied, setCopied] = useState(false);
//   const [qrCodeSVG, setQrCodeSVG] = useState('');
//   const [copiedField, setCopiedField] = useState<string | null>(null);

//   const handleCopyOrderNumber = () => {
//     if (order) {
//       navigator.clipboard.writeText(order.orderNumber);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const handleCopy = async (text: string, field: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedField(field);
//       setTimeout(() => setCopiedField(null), 1000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   };

//   // Generate QR code for bank transfer orders
//   useEffect(() => {
//     if (order && order.paymentMethod === 'bank-transfer') {
//       const qrString = generateTransferQR(order.orderNumber, order.totalAmount);
//       QRCode.toString(qrString, {
//         type: 'svg',
//         width: 200,
//         margin: 1,
//         errorCorrectionLevel: 'M',
//         color: {
//           dark: '#000000',
//           light: '#FFFFFF'
//         }
//       }).then((svg) => {
//         setQrCodeSVG(svg);
//       }).catch((err) => {
//         console.error('Error generating QR code:', err);
//       });
//     }
//   }, [order]);

//   useEffect(() => {
//     try {
//       // Decode order number from URL
//       const encodedOrderId = params.orderId as string;
//       const orderNumber = decodeURIComponent(encodedOrderId);

//       // Get orders from localStorage
//       const savedOrders = JSON.parse(localStorage.getItem('pepero_orders') || '[]');
//       const foundOrder = savedOrders.find((o: Order) => o.orderNumber === orderNumber);

//       if (foundOrder) {
//         setOrder(foundOrder);
//         // SECURITY: Do not fetch remote order data (Google Sheets) to avoid exposing
//         // customer info. Use only the local copy stored in localStorage.
//         const localOrderStatusRaw = (foundOrder.orderStatus || foundOrder.status || '').toString();
//         const localPaymentStatusRaw = (foundOrder.paymentStatus || '').toString();
//         const localOrderStatus = localOrderStatusRaw ? localOrderStatusRaw.toLowerCase() : '';
//         const localPaymentStatus = localPaymentStatusRaw ? localPaymentStatusRaw.toLowerCase() : '';
//         setOrderStatus(localOrderStatus || null);
//         setPaymentStatus(localPaymentStatus || null);
//       } else {
//         // Order not found, redirect to home
//         router.push('/');
//       }
//     } catch (error) {
//       console.error('Error loading order:', error);
//       router.push('/');
//     } finally {
//       setLoading(false);
//     }
//   }, [params.orderId, router]);

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

//   if (!order) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-linear-to-br from-pink-100 to-purple-100 py-8 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Bank Transfer Info - Only show for bank-transfer payment method */}
//         {order.paymentMethod === 'bank-transfer' && (
//           <div className="bg-linear-to-br from-pink-50 via-purple-50 to-pink-50 border-4 border-pink-300 rounded-2xl shadow-2xl p-6 mb-6">
//             <div className="flex items-center gap-3 mb-4">
//                             <div className="text-2xl">💳</div>

//               <h2 className="text-xl font-bold text-pink-700">Chuyển khoản ngân hàng</h2>
//             </div>

//             <div className="mt-3 space-y-3 bg-white rounded-lg p-4">
//               {/* QR Code */}
//               <div className="flex justify-center">
//                 <div className="bg-cream p-3 rounded-lg border-3 border-pink-200 w-[220px] h-[220px] flex items-center justify-center">
//                   {qrCodeSVG ? (
//                     <div 
//                       className="w-full h-full flex items-center justify-center"
//                       dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center text-gray-400 text-sm">
//                       Đang tạo mã QR...
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Bank Info */}
//               <div className="space-y-2">
//                 <p className="text-center text-sm text-gray-700 font-semibold mb-3">
//                   Quét mã QR bên trên để chuyển khoản nhanh chóng
//                 </p>
//                 <p className="text-center text-xs text-gray-600 mb-3">
//                   Hoặc chuyển khoản thủ công với thông tin:
//                 </p>
                
//                 {/* Account Number */}
//                 <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className="text-xs text-gray-600 mb-1">Số tài khoản:</p>
//                       <p className="text-sm text-gray-900 font-bold">085 7700655 (Timo Bank)</p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => handleCopy('0857700655', 'account')}
//                       className="ml-2 px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
//                     >
//                       {copiedField === 'account' ? (
//                         <>✓ Đã sao chép</>
//                       ) : (
//                         <>
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                           </svg>
//                           Copy
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Account Name */}
//                 <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
//                   <p className="text-xs text-gray-600 mb-1">Chủ tài khoản:</p>
//                   <p className="text-sm text-gray-900 font-bold">Thái Thị Minh Phương</p>
//                 </div>

//                 {/* Amount */}
//                 <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg px-3 py-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className="text-xs text-gray-700 mb-1 font-semibold">Số tiền:</p>
//                       <p className="text-base text-pink-700 font-extrabold">{order.totalAmount.toLocaleString('vi-VN')}₫</p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => handleCopy(order.totalAmount.toString(), 'amount')}
//                       className="ml-2 px-3 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
//                     >
//                       {copiedField === 'amount' ? (
//                         <>✓ Đã sao chép</>
//                       ) : (
//                         <>
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                           </svg>
//                           Copy
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Transfer Content */}
//                 <div className="bg-pink-50 border-2 border-pink-300 rounded-lg px-3 py-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className="text-xs text-pink-800 mb-1 font-bold">Nội dung CK:</p>
//                       <p className="text-lg text-pink-700 font-extrabold">{order.orderNumber}</p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => handleCopy(order.orderNumber, 'content')}
//                       className="ml-2 px-3 py-1.5 bg-pink-200 hover:bg-pink-300 text-pink-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
//                     >
//                       {copiedField === 'content' ? (
//                         <>✓ Đã sao chép</>
//                       ) : (
//                         <>
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                           </svg>
//                           Copy
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <p className="text-xs text-gray-600 italic text-center mt-2">
//                   ⚠️ Vui lòng chuyển khoản đúng nội dung để shop xác nhận đơn hàng nhanh nhất!
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* CRITICAL: Social media contact - TOP PRIORITY */}
//         <div className="bg-linear-to-br from-pink-50 via-purple-50 to-pink-50 border-4 border-pink-300 rounded-2xl shadow-2xl p-6 mb-6">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="text-2xl">💌</div>
//             <h1 className="text-xl font-bold text-pink-700">Một bước nữa thôi nè! 🎉</h1>
//           </div>
          
//           <div className="bg-white rounded-lg p-4 mb-4 border-2 border-pink-200 shadow-sm">
//             <p className="text-sm text-gray-700 mb-2 font-semibold">📝 Nhắn tin cho shop kèm mã đơn hàng này nhé:</p>
//             <div className="flex items-center gap-2 bg-linear-to-r from-pink-50 to-purple-50 p-3 rounded-lg border-2 border-pink-300">
//               <span className="text-xl font-bold text-pink-600 flex-1">#{order.orderNumber}</span>
//               <button
//                 onClick={handleCopyOrderNumber}
//                 className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
//               >
//                 {copied ? (
//                   <>
//                     <span className="text-lg">✓</span>
//                     <span>Đã copy</span>
//                   </>
//                 ) : (
//                   <>
//                     <span className="text-lg">📋</span>
//                     <span>Copy</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           <div className="bg-linear-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-4 mb-4">
//             <p className="text-orange-800 font-bold text-center text-base flex items-center justify-center gap-2">
//               <span className="text-xl">💖</span>
//               <span>Shop cần bạn nhắn tin xác nhận để chuẩn bị đơn hàng nha!</span>
//               <span className="text-xl">💖</span>
//             </p>
//           </div>

//           <div className="space-y-3">
//             <a 
//               href="https://www.tiktok.com/@ngotngaopepero.sg?_t=8rzITfKEaZE&_r=1" 
//               target="_blank" 
//               rel="noopener noreferrer"
//               className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
//             >
//               <span className="text-2xl">💬</span>
//               <span>Nhắn tin qua TikTok</span>
//             </a>
//             <a 
//               href="https://ig.me/m/ngotngaopepero_sg" 
//               target="_blank" 
//               rel="noopener noreferrer"
//               className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
//             >
//               <span className="text-2xl">💬</span>
//               <span>Nhắn tin qua Instagram</span>
//             </a>
//           </div>
//         </div>

//         {/* COD verification warning */}
//         {/* <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl shadow-xl p-6 mb-6">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="text-4xl">🚚</div>
//             <h2 className="text-2xl font-bold text-yellow-900">Đơn hàng Ship COD</h2>
//           </div>
//           <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
//             <ul className="space-y-3 text-yellow-900">
//               <li className="flex items-start gap-2">
//                 <span className="text-xl mt-0.5">📞</span>
//                 <span className="font-semibold">Shop sẽ nhắn tin hoặc &quot;nhá máy&quot; nhẹ nhàng để xác nhận số điện thoại — giúp shipper tìm bạn nhanh hơn 💌</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-xl mt-0.5">⚠️</span>
//                 <span className="font-bold text-red-700 text-lg">Nếu không liên lạc được, đơn hàng sẽ không thể gửi đi được — mong bạn thông cảm ❤️</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-xl mt-0.5">✅</span>
//                 <span className="font-semibold">Hãy để điện thoại sẵn sàng và mở chế độ chuông / rung để không bỏ lỡ cuộc gọi</span>
//               </li>
//             </ul>
//           </div>
//         </div> */}

//         {/* Order Info */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Thông tin đơn hàng</h2>
          
//           <div className="space-y-3">
//             {order.recipientName && (
//               <div className="flex justify-between py-2 border-b border-gray-200">
//                 <span className="text-gray-600">Tên người nhận:</span>
//                 <span className="font-semibold text-gray-900">{order.recipientName}</span>
//               </div>
//             )}

//             {order.phone && (
//               <div className="flex justify-between py-2 border-b border-gray-200">
//                 <span className="text-gray-600">Số điện thoại:</span>
//                 <a className="font-semibold text-pink-700" href={`tel:${order.phone}`}>{order.phone}</a>
//               </div>
//             )}

//             {/* {order.socialLink && (
//               <div className="flex justify-between py-2 border-b border-gray-200">
//                 <span className="text-gray-600">Liên hệ:</span>
//                 <a className="font-semibold text-pink-700" href={order.socialLink} target="_blank" rel="noreferrer">Mở kênh nhắn tin</a>
//               </div>
//             )} */}

//             {order.address && (
//               <div className="flex justify-between py-2 border-b border-gray-200">
//                 <span className="text-gray-600">Địa chỉ:</span>
//                 <span className="font-semibold text-gray-900 text-right max-w-[60%] whitespace-pre-line">{order.address}</span>
//               </div>
//             )}

//             <div className="flex justify-between py-2 border-b border-gray-200">
//               <span className="text-gray-600">Thời gian đặt:</span>
//               <span className="font-semibold text-gray-900">{order.timestamp}</span>
//             </div>
            
//             <div className="flex justify-between py-2 border-b border-gray-200">
//               <span className="text-gray-600">Tổng tiền:</span>
//               <span className="font-bold text-pink-700 text-lg">
//                 {order.totalAmount.toLocaleString('vi-VN')}₫
//               </span>
//             </div>
            
//             <div className="flex justify-between py-2 border-b border-gray-200">
//               <span className="text-gray-600">Hình thức thanh toán:</span>
//               <span className="font-semibold text-gray-900">
//                 {order.paymentMethod === 'bank-transfer' && '💳 Chuyển khoản'}
//                 {order.paymentMethod === 'cod' && '🚚 Ship COD'}
//                 {order.paymentMethod === 'pickup' && '🏠 Lấy hàng trực tiếp'}
//               </span>
//             </div>
//             {/* {paymentStatus && (
//               <div className="flex justify-between py-2 border-b border-gray-200">
//                 <span className="text-gray-600">Tình trạng thanh toán:</span>
//                 {(() => {
//                   const ps = paymentStatus.toLowerCase();
//                   const isPaid = ps === 'đã chuyển khoản';
//                   const isNotPaid = ps === 'chưa chuyển khoản';
//                   const bg = isPaid ? '#D1FAE5' : isNotPaid ? '#F3F4F6' : 'transparent';
//                   const color = isPaid ? '#065F46' : isNotPaid ? '#374151' : '#374151';
//                   const label = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);

//                   return (
//                     <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: bg, color }}>
//                       {label}
//                     </span>
//                   );
//                 })()}
//               </div>
//             )} */}
            
//             {/* <div className="flex justify-between py-2">
//               <span className="text-gray-600">Trạng thái:</span>
//               {(() => {
//                 const raw = orderStatus ? orderStatus : '';
//                 // Normalize and map statuses
//                 const normalized = raw?.toLowerCase();

//                 // Remove undesired statuses
//                 const removed = ['chưa xác nhận', 'đang chờ xác nhận', 'không xác nhận được'];
//                 const statusToShow = removed.includes(normalized || '') ? '' : normalized || '';

//                 const isSent = statusToShow === 'đã gửi' || statusToShow === 'đã gửi đvvc' || statusToShow === 'đã gửi đvvc';
//                 const isDeliveryFailed = statusToShow === 'giao hàng không thành công' || statusToShow === 'giao hàng khong thanh cong';
//                 const isDone = statusToShow === 'done';
//                 const isPrepared = statusToShow === 'đã soạn';

//                 const backgroundColor =
//                   !statusToShow ? '#F3F4F6' :
//                   isDeliveryFailed ? '#FEE2E2' :
//                   isSent ? '#DBEAFE' :
//                   isDone ? '#D1FAE5' :
//                   isPrepared ? '#FFFBEB' :
//                   '#F3F4F6';

//                 const color =
//                   !statusToShow ? '#374151' :
//                   isDeliveryFailed ? '#991B1B' :
//                   isSent ? '#1E3A8A' :
//                   isDone ? '#065F46' :
//                   isPrepared ? '#92400E' :
//                   '#374151';

//                 const displayLabel = (() => {
//                   if (!statusToShow) return 'Chưa cập nhật';
//                   // Keep 'Đã gửi ĐVVC' label if it exists
//                   if (statusToShow.includes('đã gửi')) return statusToShow.replace('đã gửi đvvc', 'Đã gửi ĐVVC').replace('đã gửi', 'Đã gửi');
//                   if (statusToShow === 'done') return 'Done';
//                   // Capitalize first letter
//                   return statusToShow.charAt(0).toUpperCase() + statusToShow.slice(1);
//                 })();

//                 return (
//                   <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor, color }}>
//                     {displayLabel}
//                   </span>
//                 );
//               })()}
//             </div> */}

//             {/* Items */}
//             {order.items && order.items.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="text-sm text-gray-600 mb-2">🧾 Món đã đặt:</h3>
//                 <ul className="text-sm text-gray-800 space-y-2">
//                   {order.items.map((item: CartItem) => (
//                     <li key={item.id} className="flex justify-between">
//                       <div>
//                         <div className="font-semibold">{item.product?.name || 'Sản phẩm'}</div>
//                         {item.selectedCharmSet && <div className="text-xs text-gray-500">Charm set: {item.selectedCharmSet.name}</div>}
//                         {item.selectedAddOns && item.selectedAddOns.length > 0 && (
//                           <div className="text-xs text-gray-500">Add-ons: {item.selectedAddOns.map((a) => `${a.name} x${a.quantity}`).join(', ')}</div>
//                         )}
//                       </div>
//                       <div className="text-right">x{item.quantity}</div>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Charms and Add-ons summary */}
//             {order.selectedCharms && order.selectedCharms.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="text-sm text-gray-600 mb-2">🔖 Chi tiết charm:</h3>
//                 <ul className="text-sm text-gray-800 space-y-1">
//                   {order.selectedCharms.map((s: string, idx: number) => (
//                     <li key={idx}>{s}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {order.selectedAddOns && order.selectedAddOns.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="text-sm text-gray-600 mb-2">➕ Add-ons:</h3>
//                 <ul className="text-sm text-gray-800 space-y-1">
//                   {order.selectedAddOns.map((s: string, idx: number) => (
//                     <li key={idx}>{s}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {order.note && (
//               <div className="mt-4">
//                 <h3 className="text-sm text-gray-600 mb-2">📝 Ghi chú:</h3>
//                 <div className="text-sm text-gray-800">{order.note}</div>
//               </div>
//             )}
//           </div>
//         </div>


//         {/* Action Buttons */}
//         <div className="flex gap-4">
//           <Link 
//             href="/"
//             className="flex-1 py-3 px-6 bg-linear-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl text-center hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
//           >
//             🏠 Quay lại trang chủ
//           </Link>
//           <Link 
//             href="/my-orders"
//             className="flex-1 py-3 px-6 bg-white text-gray-800 font-bold rounded-xl text-center hover:bg-gray-100 transition-all shadow-lg border-2 border-gray-300"
//           >
//             📦 Xem đơn hàng của tôi
//           </Link>
//         </div>

//         {/* Footer Note */}
//         <p className="text-center text-sm text-gray-600 mt-6">
//           💖 Xin cảm ơn rất nhiều! Hẹn gặp lại bạn lần sau!
//         </p>
//       </div>
//     </div>
//   );
// }
