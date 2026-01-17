'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import AddressSelector from './AddressSelector';
import gisData from '@/constants/gis-v2.json';
import { generateOrderNumber } from '@/utils/vietqr';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
}

type PaymentMethod = 'bank-transfer' | 'cod' | 'pickup';

const BUYER_INFO_KEY = 'pepero_buyer_info';
interface Ward { name: string; name_with_type: string; }
interface District { name: string; name_with_type: string; "xa-phuong": { [key: string]: Ward; }; }
interface Province { name: string; name_with_type: string; "quan-huyen": { [key: string]: District; }; }
interface GisData { [key: string]: Province; }

export default function CheckoutForm({ isOpen, onClose, totalPrice }: CheckoutFormProps) {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    socialLink: '',
    recipientName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailedAddress: '',
    paymentMethod: '' as PaymentMethod | '',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionOrderNumber, setSessionOrderNumber] = useState('');
  const [errorSpotlight, setErrorSpotlight] = useState<string | null>(null);

  // Refs
  const topRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);

  const typedGisData = gisData as GisData;
  const shippingFee = 19000;
  const totalWithShipping = formData.paymentMethod === 'pickup' ? totalPrice : totalPrice + shippingFee;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSessionOrderNumber(generateOrderNumber());
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const savedInfo = localStorage.getItem(BUYER_INFO_KEY);
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setFormData(prev => ({ ...prev, ...parsed, paymentMethod: '' }));
      } catch (error) { console.error(error); }
    }
  }, []);

  useEffect(() => {
    if (errorSpotlight) {
      const timer = setTimeout(() => setErrorSpotlight(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [errorSpotlight]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (errorSpotlight) setErrorSpotlight(null);
  };

  const handlePaymentMethodChange = (value: PaymentMethod | '') => {
    if (value === 'pickup') {
      if (!window.confirm('Bạn chọn "Lấy hàng tại shop" tại Q.10, TP.HCM. Bạn chắc chắn chứ?')) return;
    }
    handleInputChange('paymentMethod', value as string);
    if (errors.paymentMethod) setErrors(prev => ({ ...prev, paymentMethod: '' }));
    setErrorSpotlight(null);
  };

  const getValidationErrors = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.socialLink.trim()) newErrors.socialLink = 'Bạn chưa nhập link IG/TikTok';
    if (!formData.recipientName.trim()) newErrors.recipientName = 'Bạn chưa nhập tên';
    if (!formData.phone.trim()) newErrors.phone = 'Bạn chưa nhập SĐT';
    else if (!/^[0-9]{10,11}$/.test(formData.phone.trim())) newErrors.phone = 'SĐT không hợp lệ';
    
    if (formData.paymentMethod !== 'pickup') {
      if (!formData.province) newErrors.province = 'Chọn Tỉnh/Thành';
      if (!formData.district) newErrors.district = 'Chọn Quận/Huyện';
      if (!formData.ward) newErrors.ward = 'Chọn Phường/Xã';
      if (!formData.detailedAddress.trim()) newErrors.detailedAddress = 'Nhập địa chỉ cụ thể';
    }
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Bạn quên chọn hình thức thanh toán nè!';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validate Cart - ensure cart is not empty (allow add-ons without a Set)
    if (cart.items.length === 0) {
      alert('⚠️ Giỏ hàng trống — vui lòng thêm món vào giỏ trước khi thanh toán.');
      return;
    }

    // 2. Validate Form Fields
    const newErrors = getValidationErrors();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Scroll to error logic
      if (newErrors.socialLink || newErrors.recipientName || newErrors.phone) {
        contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (newErrors.province || newErrors.district || newErrors.ward || newErrors.detailedAddress) {
        addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (newErrors.paymentMethod) {
        setErrorSpotlight('payment'); 
        paymentMethodRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const sendOrderNumber = sessionOrderNumber || generateOrderNumber();
      
      // 3. Format Address
      let fullAddress = 'N/A';
      if (formData.province || formData.district || formData.detailedAddress) {
        const p = formData.province ? typedGisData[formData.province] : undefined;
        const d = formData.district && p ? p["quan-huyen"][formData.district] : undefined;
        const w = formData.ward && d ? d["xa-phuong"][formData.ward] : undefined;
        fullAddress = [formData.detailedAddress, w?.name_with_type, d?.name_with_type, p?.name_with_type].filter(Boolean).join(', ');
      }

      // 4. Prepare Summaries
      const charmsGroupedBySets = cart.items
        .filter(item => item.selectedCharmSet)
        .map(i => {
          const charmDetails = i.selectedCharmSet?.charms
            .map(c => `${c.emoji} ${c.name}`)
            .join(', ');
          // Prepend Product Name (Category) to differentiate sets
          return `${i.product.name} - ${i.selectedCharmSet?.name} (${charmDetails}) x${i.quantity}`;
        });

      const addOnsGroupedBySets = cart.items
        .flatMap(i => i.selectedAddOns)
        .map(a => `${a.name} x${a.quantity}`);

      // 5. Construct COMPLETE Order Data
      const orderData = {
        orderNumber: sendOrderNumber,
        timestamp: new Date().toLocaleString('vi-VN'),
        ...formData,
        address: fullAddress,
        items: cart.items, 
        selectedCharms: charmsGroupedBySets,
        selectedAddOns: addOnsGroupedBySets,
        totalPrice,
        shippingFee: formData.paymentMethod === 'pickup' ? 0 : shippingFee,
        finalTotal: totalWithShipping,
        totalAmount: totalWithShipping, 
        status: 'pending',
        paymentStatus: 'pending' 
      };

      // 6. Send to API (Google Sheets/Backend)
      const res = await fetch('/api/orders', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(orderData) 
      });
      
      const result = await res.json();

      if (result.success) {
        const existingOrders = JSON.parse(localStorage.getItem('pepero_orders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('pepero_orders', JSON.stringify(existingOrders));
        localStorage.setItem(BUYER_INFO_KEY, JSON.stringify({ ...formData }));
        
        clearCart();
        onClose();
        
        setTimeout(() => {
          router.push(`/my-order/${encodeURIComponent(sendOrderNumber)}`);
        }, 100);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = (err: string | undefined) => `
    w-full pl-11 pr-4 py-3.5 rounded-2xl border transition-all duration-300 text-sm font-medium
    ${err 
      ? 'border-red-300 bg-red-50/50 focus:border-red-500' 
      : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100'
    } 
    text-gray-900 placeholder:text-gray-400 outline-none
  `;
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none";
  const sectionTitleClass = "text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4 opacity-80";
  // Style cho dòng thông báo lỗi
  const errorTextClass = "text-red-500 text-[11px] ml-4 mt-1 font-medium text-left animate-pulse";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-xl z-10 sticky top-0 shadow-[0_5px_15px_-10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1)]">
          <div>
            <h2 className="font-black text-xl text-gray-900">Xác nhận đơn hàng</h2>
            <p className="text-xs font-medium text-gray-400">Mã đơn: <span className="font-mono text-rose-500">#{sessionOrderNumber}</span></p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white relative" ref={topRef}>
          {errorSpotlight && (
            <div 
              className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] z-20 transition-all duration-500"
              onClick={() => setErrorSpotlight(null)} 
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            
            {/* 1. Contact Info */}
            <div ref={contactRef} className={`relative transition-all duration-300 scroll-mt-28 ${errorSpotlight ? 'opacity-40 blur-[1px] grayscale' : 'opacity-100'}`}>
              <h3 className={sectionTitleClass}>
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-extrabold">1</span>
                Thông tin liên hệ
              </h3>
              <div className="space-y-4">
                
                {/* Social Link Input */}
                <div className="relative">
                    <div className="relative">
                      <span className={iconClass}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></span>
                      <input type="text" value={formData.socialLink} onChange={e => handleInputChange('socialLink', e.target.value)} placeholder="Link Instagram hoặc TikTok của bạn *" className={inputClass(errors.socialLink)} />
                    </div>
                    {/* Hiển thị lỗi Social Link */}
                    {errors.socialLink && <p className={errorTextClass}>{errors.socialLink}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name Input */}
                    <div className="relative">
                        <div className="relative">
                          <span className={iconClass}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                          <input type="text" value={formData.recipientName} onChange={e => handleInputChange('recipientName', e.target.value)} placeholder="Họ tên *" className={inputClass(errors.recipientName)} />
                        </div>
                        {/* Hiển thị lỗi Tên */}
                        {errors.recipientName && <p className={errorTextClass}>{errors.recipientName}</p>}
                    </div>

                    {/* Phone Input */}
                    <div className="relative">
                        <div className="relative">
                          <span className={iconClass}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></span>
                          <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="Số điện thoại *" className={inputClass(errors.phone)} />
                        </div>
                        {/* Hiển thị lỗi SĐT */}
                        {errors.phone && <p className={errorTextClass}>{errors.phone}</p>}
                    </div>
                </div>
              </div>
            </div>

            {/* 2. Address */}
            <div ref={addressRef} className={`relative transition-all duration-300 scroll-mt-28 ${errorSpotlight ? 'opacity-40 blur-[1px] grayscale' : 'opacity-100'}`}>
              <h3 className={sectionTitleClass}>
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-extrabold">2</span>
                Địa chỉ nhận hàng
              </h3>
              <AddressSelector
                selectedProvince={formData.province}
                selectedDistrict={formData.district}
                selectedWard={formData.ward}
                detailedAddress={formData.detailedAddress}
                onProvinceChange={(v) => handleInputChange('province', v)}
                onDistrictChange={(v) => handleInputChange('district', v)}
                onWardChange={(v) => handleInputChange('ward', v)}
                onDetailedAddressChange={(v) => handleInputChange('detailedAddress', v)}
                errors={errors}
              />
              <div className="mt-4 relative">
                 <span className="absolute left-4 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                 </span>
                 <textarea value={formData.note} onChange={e => handleInputChange('note', e.target.value)} placeholder="Lời nhắn cho shop (không bắt buộc)" rows={1} className={`${inputClass(undefined)} pl-11 resize-none`} />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div 
              ref={paymentMethodRef} 
              className={`
                relative transition-all duration-500 rounded-2xl p-2 -m-2 scroll-mt-28
                ${errorSpotlight === 'payment' ? 'z-30 bg-white scale-[1.02] shadow-2xl ring-4 ring-rose-100/50' : 'z-0'}
              `}
            >
              <h3 className={sectionTitleClass}>
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-extrabold">3</span>
                Hình thức thanh toán
              </h3>

              {errors.paymentMethod && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-2 animate-bounce shadow-sm">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="text-sm font-bold text-red-600">{errors.paymentMethod}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {/* Bank Transfer */}
                 <div 
                   onClick={() => handlePaymentMethodChange('bank-transfer')}
                   className={`
                     relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group flex flex-col items-center text-center gap-2
                     ${formData.paymentMethod === 'bank-transfer' 
                       ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100 ring-1 ring-blue-200' 
                       : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-white hover:shadow-sm'
                     }
                   `}
                 >
                    <div className={`
                      absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                      ${formData.paymentMethod === 'bank-transfer' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 bg-transparent group-hover:border-blue-400'
                      }
                    `}>
                      {formData.paymentMethod === 'bank-transfer' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-1">🏦</div>
                    <p className={`font-bold text-sm ${formData.paymentMethod === 'bank-transfer' ? 'text-blue-700' : 'text-gray-700'}`}>Chuyển khoản</p>
                    <p className="text-[11px] text-gray-500">Quét QR miễn phí</p>
                    
                    {/* Info Block */}
                    {formData.paymentMethod === 'bank-transfer' && (
                      <div className="mt-3 w-full animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-white/60 border border-blue-200 rounded-xl p-3 text-center">
                          <p className="text-xs text-blue-800 font-medium leading-relaxed">
                            <span className="mr-1">ℹ️</span>
                            Thông tin chuyển khoản sẽ hiển thị sau khi bạn xác nhận đơn hàng
                          </p>
                        </div>
                      </div>
                    )}
                 </div>

                 {/* Pickup */}
                 <div 
                   onClick={() => handlePaymentMethodChange('pickup')}
                   className={`
                     relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group flex flex-col items-center text-center gap-2
                     ${formData.paymentMethod === 'pickup' 
                       ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100 ring-1 ring-orange-200' 
                       : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-white hover:shadow-sm'
                     }
                   `}
                 >
                    <div className={`
                      absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                      ${formData.paymentMethod === 'pickup' 
                        ? 'border-orange-500 bg-orange-500' 
                        : 'border-gray-300 bg-transparent group-hover:border-orange-400'
                      }
                    `}>
                      {formData.paymentMethod === 'pickup' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-1">🛍️</div>
                    <p className={`font-bold text-sm ${formData.paymentMethod === 'pickup' ? 'text-orange-700' : 'text-gray-700'}`}>Lấy tại Shop</p>
                    <p className="text-[11px] text-gray-500">Quận 10, TP.HCM</p>
                    
                    {/* Info Block */}
                    {formData.paymentMethod === 'pickup' && (
                      <div className="mt-4 w-full text-left animate-in fade-in zoom-in-95 duration-300 space-y-3">
                        <div className="bg-white border border-orange-200 rounded-xl p-3 shadow-sm">
                           <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5 text-xs">
                             <span className="text-orange-500">📍</span> Địa chỉ lấy hàng:
                           </h4>
                           <p className="text-xs text-gray-700 font-medium ml-5 leading-relaxed">
                             666/59/5 đường 3 tháng 2, P.14, Q.10
                           </p>
                           <a 
                             href="https://maps.app.goo.gl/hEHpekf9xtG1BY1D8" 
                             target="_blank"
                             className="text-[10px] text-blue-500 hover:text-blue-700 hover:underline font-bold ml-5 mt-1 inline-flex items-center gap-1"
                             onClick={(e) => e.stopPropagation()}
                           >
                             👉 Xem bản đồ
                           </a>
                        </div>
                        <div className="bg-orange-100/50 border border-orange-200 rounded-xl p-3">
                          <h4 className="font-bold text-orange-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            ⚠️ Lưu ý quan trọng:
                          </h4>
                          <ul className="text-[11px] text-orange-900/80 space-y-1.5 list-disc pl-4">
                            <li>Chỉ chọn nếu bạn <strong>CÓ THỂ</strong> đến lấy.</li>
                            <li>Ở xa vui lòng chọn <strong>Chuyển khoản</strong> để shop ship.</li>
                            <li>Shop sẽ nhắn tin xác nhận trước.</li>
                          </ul>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </form>
        </div>

        <div className="py-2 px-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-20 safe-area-pb">
            <div className="flex justify-between items-end mb-2">
               <div className="text-sm text-gray-500 flex flex-col">
                 <span>Tổng thanh toán</span>
                 <span className="text-[10px] opacity-70">({formData.paymentMethod === 'pickup' ? 'Không ship' : '+19k ship'})</span>
               </div>
               <div className="text-xl font-black text-gray-900 tracking-tight">{totalWithShipping.toLocaleString()}đ</div>
            </div>
            <div className="flex gap-3">
               <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors text-sm">Hủy</button>
               <button 
                 onClick={handleSubmit}
                 disabled={isSubmitting}
                 className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-bold text-sm py-3 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng →'}
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}