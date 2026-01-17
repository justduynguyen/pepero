'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { product, addOns as availableAddOns } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import Cart from '@/components/Cart';
import NoticeModal from '@/components/NoticeModal';
import { SelectedAddOn } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const WELCOME_MODAL_KEY = 'pepero_welcome_modal_dismissed';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function PeperoCustomizer() {
  const { addToCart, cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [setQuantities, setSetQuantities] = useState<Record<string, number>>({});
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({});
  const charmSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for window to ensure this only runs on client
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(WELCOME_MODAL_KEY);
      if (!dismissed) {
        setShowWelcomeModal(true);
      }
    }
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem(WELCOME_MODAL_KEY, 'true');
    setShowWelcomeModal(false);
  };

  // Logic to check if an item is ALREADY in the cart to sync UI
  const getCartQuantity = (id: string, type: 'set' | 'addon') => {
    let qty = 0;
    cart.items.forEach(item => {
      if (type === 'set' && item.selectedCharmSet?.id === id) {
        qty += item.quantity;
      }
      if (type === 'addon') {
        const addon = item.selectedAddOns.find(a => a.id === id);
        if (addon) qty += addon.quantity * item.quantity;
      }
    });
    return qty;
  };

  const handleSetQuantityChange = (setId: string, delta: number) => {
    const currentQuantity = setQuantities[setId] || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    setSetQuantities(prev => ({ ...prev, [setId]: newQuantity }));
  };

  const handleAddOnQuantityChange = (addOnId: string, delta: number) => {
    const currentQuantity = addOnQuantities[addOnId] || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    setAddOnQuantities(prev => ({ ...prev, [addOnId]: newQuantity }));
  };

  const handleAddToCart = () => {
    const hasSelectedSets = Object.values(setQuantities).some(qty => qty > 0);
    const hasSelectedAddOns = Object.values(addOnQuantities).some(qty => qty > 0);

    if (!hasSelectedSets && !hasSelectedAddOns) {
      alert('💖 Bạn ơi, chọn ít nhất một món nhé!');
      charmSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Add Sets
    Object.entries(setQuantities).forEach(([setId, quantity]) => {
      if (quantity <= 0) return;
      const charmSet = product.charmSets?.find(s => s.id === setId);
      if (charmSet) addToCart(product, quantity, charmSet, [], '');
    });

    // Add Addons
    if (Object.keys(addOnQuantities).length > 0) {
      Object.entries(addOnQuantities).forEach(([addonId, addonQty]) => {
        if (addonQty <= 0) return;
        const addOn = availableAddOns.find(a => a.id === addonId);
        if (addOn) {
          const selectedAddOn: SelectedAddOn = {
            id: addonId,
            name: addOn.name,
            price: addOn.price,
            unit: addOn.unit,
            quantity: addonQty,
          };
          const addOnProduct = { ...product, basePrice: 0, price: 0, name: addOn.name };
          addToCart(addOnProduct, 1, null, [selectedAddOn], '');
        }
      });
    }

    setSetQuantities({});
    setAddOnQuantities({});
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    handleAddToCart();
  };

  // Calculate price for items currently being selected (not yet in cart)
  const currentSelectionTotal =
    Object.entries(setQuantities).reduce((sum, [, quantity]) => sum + product.basePrice * quantity, 0) +
    Object.entries(addOnQuantities).reduce((sum, [id, quantity]) => {
      const addOn = availableAddOns.find(a => a.id === id);
      return sum + (addOn?.price || 0) * quantity;
    }, 0);

  const queSets = product.charmSets || [];

  const welcomeMessage = (
    <div className='text-center space-y-3'>
      <p className='text-gray-800 font-medium'>Xin chàooo! 💖</p>
      <p className='text-sm text-gray-600'>
        Hiện shop chỉ nhận <strong>Chuyển khoản trước</strong> để tụi mình chuẩn bị đơn tốt nhất nha! 🎀
      </p>
      <div className='flex flex-col gap-2 mt-4'>
        <a href='https://www.tiktok.com/@ngotngaopepero.sg?_t=8rzITfKEaZE&_r=1' target='_blank' className='text-rose-500 font-bold hover:underline'>
          👉 TikTok: ngotngaopepero.sg
        </a>
        <a href='https://www.instagram.com/ngotngaopepero_sg' target='_blank' className='text-rose-500 font-bold hover:underline'>
          👉 Instagram: ngotngaopepero_sg
        </a>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen pb-22  bg-[#fff1f2]/75'>
      <NoticeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onDontShowAgain={handleDontShowAgain}
        showDontShowAgain={true}
        title='📢 Thông báo từ Shop'
        message={welcomeMessage}
      />

      {/* ============================================================== */}
      {/* 1. HEADER - STEREOSCOPIC 3D EFFECT ("RISING SURFACE")          */}
      {/* ============================================================== */}
      <header className='sticky top-0 z-50 transition-all duration-300'>
        {/* The Effect:
            1. Gradient: White -> Gray -> White (Metallic/Volume effect)
            2. Shadow: Deep drop shadow for "floating"
            3. Border-b: Thick bottom border to simulate physical thickness/bevel
            4. Inner Highlight: Inset white ring to catch light on top edge
        */}
        <div
          className='
            bg-gradient-to-b from-gray-100 via-white to-gray-100 
            backdrop-blur-2xl 
            rounded-b-[40px] 
            border-b-4 border-gray-400/40
            shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1)]
        '>
          <div className='container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between relative z-10'>
            {/* Logo - With Deep Inset Shadow */}
            <div className='flex items-center gap-3 group cursor-pointer'>
              <div className='relative w-11 h-11'>
                {/* Outer Glow */}
                <div className='absolute inset-0 bg-rose-300 rounded-full blur-sm opacity-50 group-hover:opacity-80 transition-opacity'></div>
                {/* Icon */}
                <div className='relative w-full h-full bg-rose-500 rounded-full flex items-center justify-center text-white text-xl shadow-[inset_0_-3px_3px_rgba(0,0,0,0.2),0_4px_10px_rgba(244,63,94,0.4)] border-2 border-white/90'>
                  🍫
                </div>
              </div>
              <div className='leading-none flex flex-col'>
                <h1 className='font-black text-rose-600 text-xl tracking-tight drop-shadow-sm'>NGỌT NGÀO</h1>
                <p className='text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase ml-0.5'>Pepero</p>
              </div>
            </div>

            {/* Actions - Buttons with strong 3D press effect */}
            <div className='flex items-center gap-3'>
              {/* TikTok */}
              <a
                href='https://www.tiktok.com/@ngotngaopepero.sg'
                target='_blank'
                className='
                 w-10 h-10 rounded-2xl 
                 bg-gradient-to-b from-gray-800 to-black
                 text-white flex items-center justify-center 
                 shadow-[0_6px_0_rgb(60,60,60),0_10px_10px_rgba(0,0,0,0.2)] 
                 active:shadow-[0_0px_0_rgb(60,60,60)] active:translate-y-[6px] 
                 transition-all border-t border-gray-600
              '>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href='https://www.instagram.com/ngotngaopepero_sg'
                target='_blank'
                className='
    w-10 h-10 rounded-2xl 
    bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600 
    text-white flex items-center justify-center 
    shadow-[0_6px_0_rgb(160,20,60),0_10px_10px_rgba(0,0,0,0.2)] 
    active:shadow-[0_0px_0_rgb(160,20,60)] active:translate-y-[6px] 
    transition-all border-t border-pink-400
  '>
                {/* FIXED SVG BELOW */}
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2.5} strokeLinecap='round' strokeLinejoin='round'>
                  <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
                  <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                  <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
                </svg>
              </a>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className='
                  relative w-12 h-12 rounded-2xl 
                  bg-gradient-to-b from-rose-400 to-rose-600 
                  text-white flex items-center justify-center 
                  shadow-[0_6px_0_rgb(190,18,60),0_10px_10px_rgba(0,0,0,0.2)] 
                  active:shadow-[0_0px_0_rgb(190,18,60)] active:translate-y-[6px] 
                  transition-all border-t border-rose-300
                '>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                </svg>
                {cart.totalItems > 0 && (
                  <span className='absolute -top-2 -right-2 bg-yellow-400 text-rose-900 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce'>
                    {cart.totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <motion.main className='container mx-auto px-4 py-6 max-w-5xl space-y-10' variants={containerVariants} initial='hidden' animate='visible'>
        {/* ============================================== */}
        {/* HERO SECTION                                   */}
        {/* ============================================== */}
        <section className='rounded-3xl overflow-hidden bg-white shadow-xl shadow-rose-100/50'>
          {/* Image only, no overlay on top */}
          <div className='relative h-[250px] sm:h-[350px] w-full'>
            <Image src='/imgs/Demo.jpg' alt='Pepero Set' fill className='object-cover rounded-t-3xl' priority />
          </div>

          {/* Content Container */}
          <div className='p-5 sm:p-8 pt-4 sm:pt-6 bg-white rounded-b-3xl'>
            <h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight text-balance relative z-10'>
              Set Nguyên Liệu <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600'>Pepero Tự Làm</span>
            </h2>

            {/* Description */}
            <p className='text-gray-600 text-sm sm:text-base font-medium mb-6 max-w-xl leading-relaxed'>
              Tự tay làm những chiếc bánh ngọt ngào! Mỗi set bao gồm đầy đủ nguyên liệu cho 15 que bánh, charm trang trí và dụng cụ đóng gói.
            </p>

            {/* Info Cards - Stacked on mobile, Side-by-side on desktop */}
            <div className='flex flex-col md:flex-row gap-4'>
              {/* Card 1: What's inside */}
              <div className='flex-1 bg-rose-50/50 border border-rose-100 rounded-2xl p-4'>
                <h3 className='text-rose-600 font-bold text-sm uppercase mb-3 flex items-center gap-2'>📦 1 Set bao gồm:</h3>
                <ul className='grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 font-medium'>
                  <li className='flex items-center gap-2'>
                    <span className='text-rose-400'>•</span> 15 Que bánh
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-rose-400'>•</span> 3 Charm (theo set)
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-rose-400'>•</span> 3 vị sôcôla (shop chọn ngẫu nhiên)
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-rose-400'>•</span> 15 Túi đựng
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-rose-400'>•</span> 3 Túi bắt kem
                  </li>
                  <li className='flex items-center gap-2 col-span-2'>
                    <span className='text-rose-400'>•</span> Hộp + Giấy rơm + Giấy nến
                  </li>
                </ul>
                <p className='mt-3 text-[11px] text-rose-500 italic'>* Charm sẽ cố định theo mẫu bạn chọn ở dưới.</p>
              </div>

              {/* Card 2: Chocolate Logic */}
              <div className='flex-1 bg-white border-2 border-dashed border-purple-200 rounded-2xl p-4 relative overflow-hidden'>
                <div className='absolute top-0 right-0 bg-purple-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold'>NGẪU NHIÊN 3 VỊ</div>
                <h3 className='text-purple-600 font-bold text-sm uppercase mb-2'>🍫 Socola</h3>
                <p className='text-xs text-gray-500 mb-3'>Mỗi set shop sẽ chọn ngẫu nhiên 3 trong 5 vị sau:</p>

                <div className='flex flex-wrap gap-2'>
                  <span className='px-2 py-1 rounded bg-gray-100 text-xs text-gray-700 border border-gray-200 flex items-center gap-1'>🤍 Vanilla</span>
                  <span className='px-2 py-1 rounded bg-[#795548] text-xs text-white border border-gray-600 flex items-center gap-1'>🖤 Cacao</span>
                  <span className='px-2 py-1 rounded bg-pink-100 text-xs text-pink-700 border border-pink-200 flex items-center gap-1'>🩷 Dâu</span>
                  <span className='px-2 py-1 rounded bg-green-100 text-xs text-green-700 border border-green-200 flex items-center gap-1'>💚 Matcha</span>
                  <span className='px-2 py-1 rounded bg-purple-100 text-xs text-purple-700 border border-purple-200 flex items-center gap-1'>💜 Việt quất</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT LIST */}
        <section ref={charmSectionRef}>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-1.5 h-8 bg-rose-500 rounded-full'></div>
            <h3 className='text-xl font-bold text-gray-800'>Chọn mẫu Charm (Theo Set) 🍢</h3>
          </div>

          <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6'>
            {queSets.map(charmSet => {
              const localQty = setQuantities[charmSet.id] || 0;
              const cartQty = getCartQuantity(charmSet.id, 'set');
              const totalDisplayQty = localQty + cartQty;
              const isSelected = totalDisplayQty > 0;

              return (
                <div key={charmSet.id} className={`modern-card flex flex-col overflow-hidden group ${isSelected ? 'ring-2 ring-rose-500 bg-rose-50/30' : ''}`}>
                  <div className='relative h-42 sm:h-52 bg-gray-100 overflow-hidden'>
                    <Image src={charmSet.image} alt={charmSet.name} fill className='object-cover transition-transform duration-700 group-hover:scale-110' />
                  </div>

                  <div className='p-3 sm:p-5 flex flex-col flex-1'>
                    {/* Header: Name & Price */}
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3'>
                      <h4 className='font-bold text-gray-900 text-sm sm:text-xl line-clamp-1'>{charmSet.name}</h4>
                      <span className='font-extrabold text-rose-500 text-sm sm:text-lg'>{product.basePrice.toLocaleString()}đ</span>
                    </div>

                    {/* The 3 Items Display */}
                    <div className='flex items-center gap-1.5 sm:gap-3 mb-3 sm:mb-6 overflow-x-auto hide-scrollbar'>
                      {charmSet.charms.map(c => (
                        <div
                          key={c.id}
                          className='flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-sm border border-gray-100 text-lg sm:text-xl shrink-0'
                          title={c.name}>
                          {c.emoji}
                        </div>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className='mt-auto flex items-center justify-between bg-gray-50 rounded-full p-1.5 border border-gray-100'>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSetQuantityChange(charmSet.id, -1)}
                        disabled={localQty === 0}
                        className='w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-30'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
                        </svg>
                      </motion.button>

                      {/* Animated Number */}
                      <div className='font-bold text-gray-900 w-8 text-center h-6 overflow-hidden relative'>
                        <AnimatePresence mode='popLayout'>
                          <motion.div
                            key={totalDisplayQty}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -15, opacity: 0 }}
                            className='absolute inset-0 flex items-center justify-center'>
                            {totalDisplayQty}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSetQuantityChange(charmSet.id, 1)}
                        className='w-8 h-8 rounded-full  bg-rose-500 text-white shadow-md flex items-center justify-center'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ADDONS (1 Column - Unchanged) */}
        <section>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-1.5 h-8 bg-yellow-400 rounded-full'></div>
            <h3 className='text-xl font-bold text-gray-800'>Mua thêm phụ kiện 🎀</h3>
          </div>

          <div className='grid grid-cols-1 gap-4'>
            {availableAddOns.map(addOn => {
              const localQty = addOnQuantities[addOn.id] || 0;
              const cartQty = getCartQuantity(addOn.id, 'addon');
              const totalDisplayQty = localQty + cartQty;
              const isSelected = totalDisplayQty > 0;

              return (
                <div key={addOn.id} className={`modern-card p-4 flex items-center justify-between ${isSelected ? 'ring-2 ring-rose-500 bg-rose-50/30' : ''}`}>
                  <div className='flex items-center gap-4'>
                    <div className='w-14 h-14 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center text-3xl shadow-inner'>🎁</div>
                    <div>
                      <h4 className='font-bold text-gray-900 text-lg'>{addOn.name}</h4>
                      <div className='flex items-baseline gap-2'>
                        <p className='text-rose-500 font-bold'>{addOn.price.toLocaleString()}đ</p>
                        <span className='text-xs text-gray-400 font-medium'>/ {addOn.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 bg-gray-100 rounded-full p-1.5'>
                    <button
                      onClick={() => handleAddOnQuantityChange(addOn.id, -1)}
                      className='w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-rose-600 disabled:opacity-50 disabled:hover:text-gray-600'
                      disabled={localQty === 0}>
                      <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M20 12H4' />
                      </svg>
                    </button>
                    <span className={`font-bold w-6 text-center ${totalDisplayQty > 0 ? 'text-rose-600' : 'text-gray-400'}`}>{totalDisplayQty}</span>
                    <button
                      onClick={() => handleAddOnQuantityChange(addOn.id, 1)}
                      className='w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:scale-105 transition-transform'>
                      <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 4v16m8-8H4' />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </motion.main>

      {/* ================= BOTTOM BAR ================= */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className='fixed bottom-6 left-4 right-4 z-40'>
        <div className='container mx-auto max-w-3xl'>
          <div className='bg-gray-900/90 backdrop-blur-xl rounded-full p-2 pl-6 pr-2 flex items-center justify-between shadow-2xl shadow-rose-900/20 border border-white/10'>
            {/* Total */}
            <div className='flex flex-col'>
              <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>Tạm tính</span>
              <AnimatePresence mode='wait'>
                <motion.span
                  key={currentSelectionTotal + cart.totalPrice}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className='text-xl font-bold text-white'>
                  {(currentSelectionTotal + cart.totalPrice).toLocaleString()}đ
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Buttons */}
            <div className='flex items-center gap-2'>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={currentSelectionTotal === 0}
                onClick={handleAddToCart}
                className='hidden sm:flex h-11 px-6 rounded-full items-center justify-center font-bold text-sm text-gray-900 bg-white hover:bg-gray-200 disabled:opacity-50 transition-colors'>
                Thêm
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckout}
                className='h-11 px-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/30 flex items-center gap-2'>
                Thanh Toán <span className='text-lg'>→</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
