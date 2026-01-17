'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartItem } from '@/types';
import { generateTransferQR } from '@/utils/vietqr';
import QRCode from 'qrcode';

interface Order {
  orderNumber: string;
  timestamp: string;
  totalAmount: number;
  paymentMethod: string;
  items: CartItem[];
  status: string;
  recipientName?: string;
  phone?: string;
  address?: string;
  selectedCharms?: string[];
  selectedAddOns?: string[];
  note?: string;
  socialLink?: string;
}

// New SVG Icon Component mimicking the reference image
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ClipboardIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrCodeSVG, setQrCodeSVG] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate QR code for bank transfer orders
  useEffect(() => {
    if (order && order.paymentMethod === 'bank-transfer') {
      const qrString = generateTransferQR(order.orderNumber, order.totalAmount);
      QRCode.toString(qrString, {
        type: 'svg',
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then((svg) => {
        setQrCodeSVG(svg);
      }).catch((err) => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [order]);

  useEffect(() => {
    try {
      const encodedOrderId = params.orderId as string;
      const orderNumber = decodeURIComponent(encodedOrderId);
      const savedOrders = JSON.parse(localStorage.getItem('pepero_orders') || '[]');
      const foundOrder = savedOrders.find((o: Order) => o.orderNumber === orderNumber);

      if (foundOrder) {
        setOrder(foundOrder);
        const localOrderStatusRaw = (foundOrder.orderStatus || foundOrder.status || '').toString();
        const localPaymentStatusRaw = (foundOrder.paymentStatus || '').toString();
        setOrderStatus(localOrderStatusRaw ? localOrderStatusRaw.toLowerCase() : null);
        setPaymentStatus(localPaymentStatusRaw ? localPaymentStatusRaw.toLowerCase() : null);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [params.orderId, router]);

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

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#fff1f2] py-8 px-4 flex justify-center">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-rose-200/40 border border-white/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* URGENT BANNER: Forces user attention */}
        <div className="bg-yellow-50 border-b border-yellow-100 p-4 text-center">
           <p className="text-yellow-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
             <span>⚠️</span> Đơn hàng chưa hoàn tất
           </p>
           <p className="text-yellow-700 text-sm mt-1">
             Vui lòng hoàn thành <strong>2 bước</strong> bên dưới để Shop xác nhận đơn nha!
           </p>
        </div>

        {/* Header Section - Made smaller/secondary */}
        <div className="text-center pt-8 pb-2 px-6">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Đặt hàng thành công! 🎉
          </h1>
          <p className="text-gray-400 text-sm mt-1">Mã đơn: <span className="font-mono font-bold text-gray-600">#{order.orderNumber}</span></p>
        </div>

        <div className="px-4 sm:px-8 pb-10 space-y-8 mt-6">

          {/* STEP 1: BANK TRANSFER (Moved to Top) */}
          {order.paymentMethod === 'bank-transfer' && (
            <section className="relative">
               {/* Step Badge */}
               <div className="absolute -top-3 left-4 z-10 bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md border-2 border-white">
                 BƯỚC 1
               </div>

               <div className="bg-gradient-to-b from-blue-50/60 to-white border-2 border-blue-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
                 
                 <div className="text-center mb-6">
                    <h3 className="text-blue-800 font-bold text-lg">Thanh toán ngay</h3>
                    <p className="text-blue-600/70 text-xs">Quét QR bên dưới để chuyển khoản nhanh</p>
                 </div>

                 {/* QR Code */}
                 <div className="flex justify-center mb-8 mt-2">
                    <div className="bg-white p-4 rounded-3xl border-[3px] border-white shadow-lg shadow-blue-100">
                       <div className="bg-gray-50 rounded-2xl flex items-center justify-center p-2">
                         {qrCodeSVG ? (
                           <div 
                             dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
                             className="flex items-center justify-center"
                           />
                         ) : (
                           <div className="animate-pulse bg-gray-200 w-[200px] h-[200px] rounded-xl"></div>
                         )}
                       </div>
                    </div>
                 </div>

                 {/* Info Stack */}
                 <div className="space-y-3">
                    {/* Account Number */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Số tài khoản (Timo Bank)</p>
                        <p className="text-lg sm:text-xl font-black text-gray-900 truncate">085 7700655</p>
                        <p className="text-xs text-gray-400 font-medium">Thái Thị Minh Phương</p>
                      </div>
                      <button 
                        onClick={() => handleCopy('0857700655', 'account')}
                        className={`
                          h-10 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap min-w-[80px] px-3
                          ${copiedField === 'account' 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200 px-4' 
                            : 'bg-orange-100/50 text-orange-600 hover:bg-orange-100 w-10'
                          }
                        `}
                      >
                          {copiedField === 'account' ? (
                            <><span>Đã copy</span> <span>✓</span></>
                          ) : (
                            <span>Copy</span>
                          )}
                      </button>
                    </div>

                    {/* Amount */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Số tiền</p>
                        <p className="text-lg sm:text-xl font-black text-rose-500 truncate">{order.totalAmount.toLocaleString('vi-VN')}đ</p>
                      </div>
                      <button 
                        onClick={() => handleCopy(order.totalAmount.toString(), 'amount')}
                        className={`
                          h-10 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap min-w-[80px] px-3
                          ${copiedField === 'amount' 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200 px-4' 
                            : 'bg-orange-100/50 text-orange-600 hover:bg-orange-100 w-10'
                          }
                        `}
                      >
                          {copiedField === 'amount' ? (
                            <><span>Đã copy</span> <span>✓</span></>
                          ) : (
                            <span>Copy</span>
                          )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Nội dung CK</p>
                        <p className="text-lg sm:text-xl font-black text-blue-900 truncate">{order.orderNumber}</p>
                      </div>
                      <button 
                        onClick={() => handleCopy(order.orderNumber, 'content')}
                        className={`
                          h-10 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap min-w-[80px] px-3
                          ${copiedField === 'content' 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200 px-4' 
                            : 'bg-orange-100/50 text-orange-600 hover:bg-orange-100 w-10'
                          }
                        `}
                      >
                          {copiedField === 'content' ? (
                            <><span>Đã copy</span> <span>✓</span></>
                          ) : (
                            <span>Copy</span>
                          )}
                      </button>
                    </div>
                 </div>
                 
                 <p className="text-center text-gray-400 text-[11px] font-semibold mt-6">
                   *Quét mã QR là nhanh nhất đó!
                 </p>
               </div>
            </section>
          )}

          {/* STEP 2: SEND ORDER ID */}
          <section className="relative">
            {/* Step Badge */}
            <div className="absolute -top-3 left-4 z-10 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md border-2 border-white">
               BƯỚC 2
            </div>

            <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-lg shadow-rose-100/50 relative overflow-hidden">
               <div className="text-center space-y-4 pt-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    Gửi mã đơn cho Shop
                  </h2>
                  <p className="text-xs text-gray-500 -mt-2">Shop cần mã này để xác nhận tiền đã vào nè!</p>
                  
                  {/* Order ID Copy Box */}
                  <div className="bg-gray-50 rounded-2xl p-3 pl-4 flex items-center justify-between border border-gray-100 gap-2">
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mã đơn hàng</span>
                      <span className="text-lg sm:text-xl font-black text-gray-900 truncate w-full">#{order.orderNumber}</span>
                    </div>
                    <button
                      onClick={handleCopyOrderNumber}
                      className={`
                        px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm whitespace-nowrap
                        ${copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200'
                        }
                      `}
                    >
                      {copied ? 'Đã copy ✓' : 'Copy mã'}
                    </button>
                  </div>

                  {/* Social Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <a 
                      href="https://www.tiktok.com/@ngotngaopepero.sg?_t=8rzITfKEaZE&_r=1" 
                      target="_blank" 
                      className="group flex items-center justify-center gap-3 bg-black text-white py-3.5 px-4 rounded-2xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-400/30"
                    >
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                      <span>Gửi qua TikTok</span>
                    </a>
                    <a 
                      href="https://ig.me/m/ngotngaopepero_sg" 
                      target="_blank" 
                      className="group flex items-center justify-center gap-3 bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600 text-white py-3.5 px-4 rounded-2xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/30"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      <span>Gửi qua Insta</span>
                    </a>
                  </div>
               </div>
            </div>
          </section>

          {/* 3. ORDER DETAILS SUMMARY (Pushed to bottom) */}
          <section className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-3">
                 <div className="h-px flex-1 bg-gray-200"></div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chi tiết đơn (Tham khảo)</h3>
                 <div className="h-px flex-1 bg-gray-200"></div>
             </div>

             <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                {/* Receiver Info */}
                <div className="space-y-6 mb-6 border-b border-gray-200/60 pb-6">
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-xl border border-gray-100 text-purple-600">👤</div>
                      <div className="flex flex-col pt-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Người nhận</p>
                        <p className="font-bold text-gray-900 text-base">{order.recipientName}</p>
                        <p className="text-sm text-gray-500 font-medium">{order.phone}</p>
                      </div>
                   </div>
                   {order.address && (
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-xl border border-gray-100 text-rose-500">📍</div>
                        <div className="flex flex-col pt-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Giao tới</p>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">{order.address}</p>
                        </div>
                     </div>
                   )}
                   <div className="flex items-start gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-xl border border-gray-100 text-blue-500">💳</div>
                        <div className="flex flex-col pt-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Thanh toán</p>
                          <p className="text-sm text-gray-700 font-bold">
                            {order.paymentMethod === 'bank-transfer' && 'Chuyển khoản ngân hàng'}
                            {order.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                            {order.paymentMethod === 'pickup' && 'Lấy tại cửa hàng (Q.10)'}
                          </p>
                        </div>
                     </div>
                </div>

                {/* Item List - ĐÃ CẬP NHẬT: Hiển thị ĐƠN GIÁ (giá 1 cái) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                   
                   {/* --- PHẦN 1: DANH SÁCH SET --- */}
                   {order.items.filter(i => i.selectedCharmSet).map((item) => {
                      // Tính đơn giá cho Set
                      const unitPrice = item.totalPrice / item.quantity;

                      return (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-start p-4 border-b border-gray-100 last:border-0"
                        >
                           {/* Cột Trái: Thông tin */}
                           <div className="pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🎁</span>
                                <span className="font-bold text-gray-900 text-sm sm:text-base">
                                  {item.selectedCharmSet?.name}
                                </span>
                              </div>
                              
                              {/* List Addons đi kèm */}
                              {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1.5 pl-8 space-y-1">
                                  {item.selectedAddOns.map(a => (
                                    <p key={a.id} className="flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                      {a.name} (x{a.quantity})
                                    </p>
                                  ))}
                                </div>
                              )}
                           </div>

                           {/* Cột Phải: Đơn giá & Số lượng */}
                           <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                              <span className="font-bold text-gray-900 text-sm">
                                {unitPrice.toLocaleString('vi-VN')}đ
                              </span>
                              <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                                x{item.quantity}
                              </span>
                           </div>
                        </div>
                      );
                   })}

                   {/* --- PHẦN 2: DANH SÁCH MÓN MUA THÊM --- */}
                   {order.items.some(i => !i.selectedCharmSet) && (
                     <>
                       <div className="bg-gray-50/80 px-4 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-y border-gray-100 flex items-center gap-2">
                          <span>🧩</span> Phần mua thêm
                       </div>
                       {order.items.filter(i => !i.selectedCharmSet).map((item) => {
                          const displayQty = item.selectedAddOns && item.selectedAddOns.length > 0 
                            ? item.selectedAddOns[0].quantity 
                            : item.quantity;
                          
                          // Tính đơn giá cho Món thêm
                          const unitPrice = item.totalPrice / displayQty;

                          return (
                            <div key={item.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0">
                               {/* Cột Trái: Tên */}
                               <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs font-bold pl-1">+</span>
                                  <span className="font-medium text-gray-700 text-sm">
                                    {item.product.name}
                                  </span>
                               </div>

                               {/* Cột Phải: Đơn giá & Số lượng */}
                               <div className="flex flex-col items-end gap-0.5 ml-2 shrink-0">
                                  <span className="font-bold text-gray-900 text-sm">
                                    {unitPrice.toLocaleString('vi-VN')}đ
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    x{displayQty}
                                  </span>
                               </div>
                            </div>
                          );
                       })}
                     </>
                   )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex justify-between items-center">
                   <span className="font-bold text-gray-500">Tổng cộng</span>
                   <span className="font-black text-xl text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
             </div>
          </section>

          {/* 4. ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
             <Link 
               href="/" 
               className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-center hover:bg-gray-200 transition-all"
             >
               🏠 Về trang chủ
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}