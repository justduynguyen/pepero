'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Cart from '@/components/Cart';
import NoticeModal from '@/components/NoticeModal';
import { SelectedAddOn } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CatalogResponse, 
  adaptDBProductToCharmSet, 
  adaptDBAddOnToFrontend,
  CharmSet,
  AddOn,
  chocolateFlavors 
} from '@/types/catalog';

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
  // 1. Destructure new update methods from Context
  const { addToCart, cart, updateQuantity, updateAddonQuantity, loadCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // 2. Catalog data from API
  const [catalogData, setCatalogData] = useState<CatalogResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch catalog data on mount
  useEffect(() => {
    fetch('/api/catalog')
      .then(res => res.json())
      .then((data: CatalogResponse) => {
        if (data.success) {
          setCatalogData(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // State for hero section tab (Cakepop vs Pepero - Cakepop first)
  const [selectedHeroCategory, setSelectedHeroCategory] = useState<'pepero' | 'cakepop'>('cakepop');

  // Get Pepero category data
  const peperoCategory = useMemo(() => {
    return catalogData?.categories.find(c => c.slug === 'pepero');
  }, [catalogData]);

  // Get Cakepop category data
  const cakepopCategory = useMemo(() => {
    return catalogData?.categories.find(c => c.slug === 'cakepop');
  }, [catalogData]);

  // Pepero products as CharmSets
  const peperoSets: CharmSet[] = useMemo(() => {
    if (!peperoCategory) return [];
    return peperoCategory.products.map(adaptDBProductToCharmSet);
  }, [peperoCategory]);

  // Cakepop products as CharmSets  
  const cakepopSets: CharmSet[] = useMemo(() => {
    if (!cakepopCategory) return [];
    return cakepopCategory.products.map(adaptDBProductToCharmSet);
  }, [cakepopCategory]);

  // Components for hero section (dynamic based on selected category)
  const heroComponents = useMemo(() => {
    const category = selectedHeroCategory === 'pepero' ? peperoCategory : cakepopCategory;
    if (!category?.products[0]?.components) return [];
    return category.products[0].components as { icon: string; label: string }[];
  }, [selectedHeroCategory, peperoCategory, cakepopCategory]);

  // Combined queSets for backward compatibility (used in handleSetChange)
  const queSets = useMemo(() => [...peperoSets, ...cakepopSets], [peperoSets, cakepopSets]);

  const availableAddOns: AddOn[] = useMemo(() => {
    if (!catalogData?.addons) return [];
    return catalogData.addons.map(adaptDBAddOnToFrontend);
  }, [catalogData]);

  // Mock product for backward compatibility (prices and descriptions)
  const product = useMemo(() => ({
    id: 'set-socola-pepero',
    name: 'Set Socola Pepero 15 que',
    description: 'Set gồm 15 que bánh quy giòn tan với 3 vị socola ngẫu nhiên và 1 charm set',
    basePrice: queSets[0]?.id ? (catalogData?.categories.find(c => c.slug === 'pepero')?.products[0]?.price || 60000) : 60000,
    price: 60000,
    unit: 'set',
    image: '/imgs/Set-1.jpg',
    available: true,
    stickCount: 15,
    includedChocolates: 3,
    includedCharms: 3,
    availableChocolates: chocolateFlavors,
    charmSets: queSets,
    includedItems: ['Hộp', 'Giấy rơm', 'Túi đựng', 'Túi bắt kem'],
  }), [queSets, catalogData]);

  useEffect(() => {
    // --- SANITIZE CART: Remove Legacy Items ---
    // If catalog is loaded, check if cart items are valid.
    // Invalid items (old IDs, old names) should be removed to prevent submission errors.
    if (catalogData && cart.items.length > 0) {
      const validProductIds = new Set(queSets.map(p => p.id));
      const validAddonIds = new Set(availableAddOns.map(a => a.id));

      const sanitizedItems = cart.items.filter(item => {
        if (item.selectedCharmSet) {
          // STRICT ID CHECK: Name is not enough anymore.
          // This ensures items match exactly what is in the database (with hardcoded IDs).
          return validProductIds.has(item.selectedCharmSet.id);
        } else {
          const addons = item.selectedAddOns;
          if (!addons || addons.length === 0) return false;
          
          return addons.every(addon => validAddonIds.has(addon.id));
        }
      });

      if (sanitizedItems.length !== cart.items.length) {
        console.log('🧹 Cart sanitized: Removed legacy items', cart.items.length - sanitizedItems.length);
        
        // Recalculate totals
        const newTotalItems = sanitizedItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = sanitizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        loadCart({
          items: sanitizedItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice
        });
      }
    }
  }, [catalogData, queSets, availableAddOns, cart.items, loadCart]);

  useEffect(() => {
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

  // --- CORE LOGIC: HELPER TO FIND ITEMS ---
  const findCartItem = (id: string, type: 'set' | 'addon') => {
    // Strict match by ID only
    // This prevents "Set A" (Pepero) from matching "Set A" (Cakepop)
    return cart.items.find(item => {
      if (type === 'set') return item.selectedCharmSet?.id === id;
      if (type === 'addon') return !item.selectedCharmSet && item.selectedAddOns.some(a => a.id === id);
      return false;
    });
  };

  // --- ACTION: HANDLE SETS (Direct to Cart) ---
  const handleSetChange = (setId: string, delta: number) => {
    const existingItem = findCartItem(setId, 'set');

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + delta);
    } else if (delta > 0) {
      const charmSet = queSets.find(s => s.id === setId);
      if (charmSet) {
        // Fix: Find actual price AND category name for this specific set
        let realPrice = 60000;
        let categoryName = 'Set'; // Default fallback

        if (catalogData) {
          for (const cat of catalogData.categories) {
            const p = cat.products.find(prod => prod.id === setId);
            if (p) {
              realPrice = p.price;
              categoryName = cat.name;
              break;
            }
          }
        }

        const productWithCorrectPrice = { 
          ...product, 
          basePrice: realPrice, 
          price: realPrice,
          name: categoryName // Store "Pepero" or "Cakepop" here
        };
        
        addToCart(productWithCorrectPrice, 1, charmSet, [], '');
      }
    }
  };

  // --- ACTION: HANDLE ADDONS (Direct to Cart) ---
  const handleAddOnChange = (addOnId: string, delta: number) => {
    const existingItem = findCartItem(addOnId, 'addon');

    if (existingItem) {
      updateAddonQuantity(existingItem.id, delta);
    } else if (delta > 0) {
      const addOn = availableAddOns.find(a => a.id === addOnId);
      if (addOn) {
        const selectedAddOn: SelectedAddOn = {
          id: addOnId,
          name: addOn.name,
          price: addOn.price,
          unit: addOn.unit,
          quantity: 1,
        };
        const addOnProduct = { ...product, basePrice: 0, price: 0, name: addOn.name };
        addToCart(addOnProduct, 1, null, [selectedAddOn], '');
      }
    }
  };

  // --- UPDATED WELCOME MESSAGE CONTENT ---
  const welcomeMessage = (
    <div className="text-left space-y-1 text-sm sm:text-base">
      <p className="font-medium text-gray-800">
        Gửi các khách hàng iu dấu của Pepero! 💖
      </p>
      
      <p className="text-gray-600 leading-relaxed">
        Tụi mình luôn cố gắng mang đến sản phẩm chất lượng với mức giá tốt nhất. 
        Việc <strong>nhiều đơn COD bị hoàn về</strong> khiến shop không thể duy trì <strong>COD</strong> nữa...
      </p>

      <p className="text-gray-600">
        Do đó, Shop xin phép:
      </p>

      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-rose-800 font-medium text-center">
        {/* <p className="mb-1 text-sm">
          🎀 Từ nay Shop xin phép chỉ nhận
        </p> */}
        <p className="font-bold text-rose-600 text-lg uppercase">
          CHUYỂN KHOẢN TRƯỚC
        </p>
        <div className="flex items-center justify-center gap-2 text-xs mt-1 text-rose-500 font-normal">
          <span>hoặc</span>
          <span className="font-bold border-b border-rose-400">GHÉ LẤY TRỰC TIẾP</span>
          <span>(Q.10, TP.HCM)</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 mt-2">
        <p className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider text-center">Cần hỗ trợ nhắn shop ngay:</p>
        <div className="flex flex-col gap-2">
          <a 
            href="https://www.tiktok.com/@ngotngaopepero.sg" 
            target="_blank" 
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-white hover:bg-black transition-all bg-gray-50 p-2.5 rounded-xl border border-gray-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            <span className="font-semibold text-sm">ngotngaopepero.sg</span>
          </a>
          <a 
            href="https://instagram.com/ngotngaopepero_sg" 
            target="_blank" 
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-white hover:bg-gradient-to-tr hover:from-amber-400 hover:via-red-500 hover:to-purple-600 transition-all bg-gray-50 p-2.5 rounded-xl border border-gray-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <span className="font-semibold text-sm">ngotngaopepero_sg</span>
          </a>
        </div>
      </div>

      <p className="italic text-gray-500 text-xs text-center mt-2">
        *Rất mong các bạn hiểu và thông cảm...
      </p>
    </div>
  );

  return (
    <div className='min-h-screen pb-16 bg-[#fff1f2]/75'>
      <NoticeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onDontShowAgain={handleDontShowAgain}
        showDontShowAgain={true} // Cho phép user tắt nếu đã đọc
        title='📢 Đôi lời tâm sự từ Shop' // Updated title
        message={welcomeMessage}
      />

      {/* HEADER */}
      <header className='sticky top-0 z-50 transition-all duration-300'>
        <div className='bg-white backdrop-blur-3xl rounded-b-[40px] border-b-2 border-gray-400/50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]'>
          <div className='container mx-auto max-w-5xl px-4 pt-4 pb-5 flex items-center justify-between relative z-10'>
            {/* Logo Group */}
            <div className='flex items-center gap-3 group cursor-pointer'>
              {/* Logo Icon - Soft Rose Gradient */}
              <div
                className='
                relative w-10 h-10 rounded-xl 
                bg-gradient-to-br from-rose-400 to-rose-600 
                text-white flex items-center justify-center
                shadow-md shadow-rose-500/30
                ring-1 ring-white/20
              '>
                <svg className='w-5 h-5 drop-shadow-md' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2.5}>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
              </div>

              <div className='leading-none flex flex-col justify-center'>
                <h1 className='font-black text-gray-900 text-lg tracking-tight'>NGỌT NGÀO</h1>
                <p className='text-[10px] text-rose-500 font-bold tracking-[0.2em] uppercase'>Pepero</p>
              </div>
            </div>

            {/* Actions - Modern Soft Buttons */}
            <div className='flex items-center gap-3'>
              {/* TikTok - Sleek Black */}
              <a
                href='https://www.tiktok.com/@ngotngaopepero.sg'
                target='_blank'
                className='
                 w-10 h-10 rounded-xl 
                 bg-black text-white flex items-center justify-center 
                 shadow-md shadow-gray-400/20
                 hover:-translate-y-0.5 active:scale-95 transition-all duration-200
                 ring-1 ring-white/10
              '>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
                </svg>
              </a>

              {/* Instagram - True Gradient */}
              <a
                href='https://www.instagram.com/ngotngaopepero_sg'
                target='_blank'
                className='
                  w-10 h-10 rounded-xl 
                  bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600 
                  text-white flex items-center justify-center 
                  shadow-md shadow-pink-500/30
                  hover:-translate-y-0.5 active:scale-95 transition-all duration-200
                  ring-1 ring-white/20
                '>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2.5} strokeLinecap='round' strokeLinejoin='round'>
                  <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
                  <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                  <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
                </svg>
              </a>

              {/* Cart - Rose Gradient */}
              <button
                onClick={() => setIsCartOpen(true)}
                className='
                  relative w-10 h-10 rounded-xl 
                  bg-gradient-to-br from-rose-500 to-pink-600 
                  text-white flex items-center justify-center 
                  shadow-md shadow-rose-500/40
                  hover:-translate-y-0.5 active:scale-95 transition-all duration-200
                  ring-1 ring-white/20
                '>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                </svg>

                {/* Notification Dot */}
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

      <motion.main className='container mx-auto px-4 py-6 max-w-5xl space-y-6' variants={containerVariants} initial='hidden' animate='visible'>
        {/* HERO SECTION */}
        <section className='relative'>
          <div className='bg-white rounded-[2.5rem] shadow-xl shadow-rose-100/50 overflow-hidden border-4 border-white ring-1 ring-rose-100 relative z-10'>
            {/* Image Area Wrapper */}
            {/* 'overflow-hidden' here stops the zoom from spilling out */}
            <div className='relative h-[340px] sm:h-[380px] w-full overflow-hidden group'>
              {/* Image - Scales on Hover */}
              <Image src='/imgs/Head.jpg' alt='Pepero Set' fill className='object-cover transition-transform duration-1000 group-hover:scale-105' priority />

              {/* Gradient Overlay - Kept exactly as requested */}
              {/* This blends the image into white at the bottom so the text reads well */}
              <div className='absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-100'></div>

              {/* TITLE PART 1: Inside Image Area */}
              <div className='absolute bottom-0 left-0 right-0 text-center pb-2 z-20'>
                <h2 className='text-3xl md:text-4xl font-black text-gray-900 leading-none drop-shadow-sm tracking-tight'>Set Nguyên Liệu</h2>
              </div>
            </div>

            {/* Content Area */}
            {/* TITLE PART 2: Below Image Area */}
            <div className='px-6 pb-8 pt-0 relative text-center'>
              <div className='mb-6'>
                <h2 className='text-3xl md:text-4xl font-black leading-tight'>
                  <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600'>Tự Làm</span>
                </h2>
                <p className='text-gray-500 text-sm font-medium max-w-md mx-auto leading-relaxed mt-3'>
                  Tự tay làm set bánh ngọt ngào! Đầy đủ nguyên liệu & dụng cụ, chỉ cần làm theo hướng dẫn là xinh ngay! ✨
                </p>
              </div>

              {/* Feature Grid (What's Inside) - with Category Tabs */}
              <div className='bg-rose-50/60 rounded-3xl p-5 mb-5 border border-rose-100/50'>
                {/* Category Tabs - Cakepop first */}
                <div className='flex items-center justify-center gap-2 mb-4'>
                  <button 
                    onClick={() => setSelectedHeroCategory('cakepop')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedHeroCategory === 'cakepop' 
                        ? 'bg-amber-500 text-white shadow-md' 
                        : 'bg-white text-gray-500 hover:bg-amber-100'
                    }`}
                  >
                    🍰 Cakepop
                  </button>
                  <button 
                    onClick={() => setSelectedHeroCategory('pepero')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedHeroCategory === 'pepero' 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : 'bg-white text-gray-500 hover:bg-rose-100'
                    }`}
                  >
                    🥢 Pepero
                  </button>
                </div>

                <div className='flex items-center justify-center gap-2 mb-4 opacity-80'>
                  <div className='h-px w-8 bg-rose-200'></div>
                  <span className='text-[10px] font-bold text-rose-400 uppercase tracking-widest'>Trong hộp có gì?</span>
                  <div className='h-px w-8 bg-rose-200'></div>
                </div>

                {/* Dynamic Components Grid */}
                <div className='grid grid-cols-3 gap-3'>
                  {heroComponents.map((comp, idx) => (
                    <div key={idx} className='flex flex-col items-center text-center gap-1'>
                      <div className='w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl border border-rose-100'>
                        {comp.icon}
                      </div>
                      <span className='text-[11px] font-bold text-gray-600 leading-tight whitespace-pre-line'>
                        {comp.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chocolate Flavors - Both Categories */}
                <div className='mt-4 pt-4 border-t border-rose-100'>
                  <div className='flex items-center gap-2 mb-2 justify-center'>
                    <span className='text-xs font-bold text-gray-400'>🍫 3 Vị Socola ngẫu nhiên:</span>
                  </div>
                  <div className='flex flex-wrap justify-center gap-2'>
                    <span className='px-3 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600 border border-gray-200'>🤍 Vanilla</span>
                    <span className='px-3 py-1.5 rounded-full bg-[#6b483e] text-xs font-bold text-white shadow-sm'>🖤 Cacao</span>
                    <span className='px-3 py-1.5 rounded-full bg-pink-100 text-xs font-bold text-pink-600 border border-pink-200'>🩷 Dâu</span>
                    <span className='px-3 py-1.5 rounded-full bg-green-100 text-xs font-bold text-green-700 border border-green-200'>💚 Matcha</span>
                    <span className='px-3 py-1.5 rounded-full bg-purple-100 text-xs font-bold text-purple-600 border border-purple-200'>💜 Việt quất</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements behind the Hero */}
          <div className='absolute top-20 -left-4 w-24 h-24 bg-yellow-300 rounded-full blur-3xl opacity-30 -z-10'></div>
          <div className='absolute bottom-10 -right-4 w-32 h-32 bg-rose-400 rounded-full blur-3xl opacity-20 -z-10'></div>
        </section>

        {/* CAKEPOP SECTION */}
        <section className='space-y-4'>
          <div className='z-30 flex justify-center mb-2 -mx-4 sm:mx-0'>
            <div className='inline-flex mb-3 sm:mb-0 items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 rounded-full shadow-lg shadow-amber-500/30 border-2 border-white/20 backdrop-blur-md'>
              <h3 className='text-lg sm:text-xl font-black text-white tracking-wide drop-shadow-md'>Chọn Set Cakepop 🍰</h3>
            </div>
          </div>

          <div className='sm:p-6'>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 relative z-10'>
              {cakepopSets.map(charmSet => {
                const existingItem = findCartItem(charmSet.id, 'set');
                const quantity = existingItem ? existingItem.quantity : 0;
                const isSelected = quantity > 0;
                const setPrice = cakepopCategory?.products.find(p => p.id === charmSet.id)?.price || 60000;

                return (
                  <div
                    key={charmSet.id}
                    className={`modern-card flex flex-col overflow-hidden group transition-all duration-300 ${
                      isSelected
                        ? 'ring-[3px] ring-amber-500 bg-amber-50 shadow-xl shadow-amber-200'
                        : 'hover:shadow-lg hover:-translate-y-1'
                    }`}>
                    <div className='relative h-52 bg-gray-100 overflow-hidden'>
                      <Image src={charmSet.image} alt={charmSet.name} fill className='object-cover transition-transform duration-700 group-hover:scale-110' />
                      {isSelected && (
                        <div className='absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md'>
                          Đã chọn
                        </div>
                      )}
                    </div>

                    <div className='p-3 sm:p-5 flex flex-col flex-1 relative'>
                      <div className='mb-2'>
                        <h4 className='font-bold text-gray-900 text-sm sm:text-lg flex items-center gap-2'>
                          <span className='line-clamp-1 leading-none'>{charmSet.name}</span>
                          <div className='flex items-center gap-0.5 shrink-0'>
                            {charmSet.charms.map(c => (
                              <span key={c.id} className='text-sm sm:text-base leading-none pt-0.5'>{c.emoji}</span>
                            ))}
                          </div>
                        </h4>
                        <p className='font-extrabold text-amber-500 text-base mt-2 mb-1'>{setPrice.toLocaleString()}đ</p>
                      </div>

                      <div className={`mt-auto flex items-center justify-between rounded-full p-1 border transition-colors ${isSelected ? 'bg-white border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSetChange(charmSet.id, -1)} disabled={quantity === 0} className='w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:shadow-none border border-gray-100'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' /></svg>
                        </motion.button>
                        <div className='font-bold text-gray-900 w-8 text-center'>{quantity}</div>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSetChange(charmSet.id, 1)} className='w-8 h-8 rounded-full bg-amber-500 text-white shadow-md flex items-center justify-center hover:bg-amber-600 border border-amber-600'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PEPERO SECTION */}
        <section className='space-y-4 pt-4'>
          <div className='z-30 flex justify-center mb-2 -mx-4 sm:mx-0'>
            <div className='inline-flex mb-3 sm:mb-0 items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-3.5 rounded-full shadow-lg shadow-rose-500/30 border-2 border-white/20 backdrop-blur-md'>
              <h3 className='text-lg sm:text-xl font-black text-white tracking-wide drop-shadow-md'>Chọn Set Pepero 🥢</h3>
            </div>
          </div>

          <div className='sm:p-6'>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 relative z-10'>
              {peperoSets.map(charmSet => {
                const existingItem = findCartItem(charmSet.id, 'set');
                const quantity = existingItem ? existingItem.quantity : 0;
                const isSelected = quantity > 0;
                const setPrice = peperoCategory?.products.find(p => p.id === charmSet.id)?.price || 60000;

                return (
                  <div
                    key={charmSet.id}
                    className={`modern-card flex flex-col overflow-hidden group transition-all duration-300 ${
                      isSelected
                        ? 'ring-[3px] ring-rose-500 bg-rose-50 shadow-xl shadow-rose-200'
                        : 'hover:shadow-lg hover:-translate-y-1'
                    }`}>
                    <div className='relative h-52 bg-gray-100 overflow-hidden'>
                      <Image src={charmSet.image} alt={charmSet.name} fill className='object-cover transition-transform duration-700 group-hover:scale-110' />
                      {isSelected && (
                        <div className='absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md'>
                          Đã chọn
                        </div>
                      )}
                    </div>

                    <div className='p-3 sm:p-5 flex flex-col flex-1 relative'>
                      <div className='mb-2'>
                        <h4 className='font-bold text-gray-900 text-sm sm:text-lg flex items-center gap-2'>
                          <span className='line-clamp-1 leading-none'>{charmSet.name}</span>
                          <div className='flex items-center gap-0.5 shrink-0'>
                            {charmSet.charms.map(c => (
                              <span key={c.id} className='text-sm sm:text-base leading-none pt-0.5'>{c.emoji}</span>
                            ))}
                          </div>
                        </h4>
                        <p className='font-extrabold text-rose-500 text-base mt-2 mb-1'>{setPrice.toLocaleString()}đ</p>
                      </div>

                      <div className={`mt-auto flex items-center justify-between rounded-full p-1 border transition-colors ${isSelected ? 'bg-white border-rose-200' : 'bg-gray-50 border-gray-200'}`}>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSetChange(charmSet.id, -1)} disabled={quantity === 0} className='w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:shadow-none border border-gray-100'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' /></svg>
                        </motion.button>
                        <div className='font-bold text-gray-900 w-8 text-center'>{quantity}</div>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSetChange(charmSet.id, 1)} className='w-8 h-8 rounded-full bg-rose-500 text-white shadow-md flex items-center justify-center hover:bg-rose-600 border border-rose-600'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ADDONS SECTION - SECTION 2 (SECONDARY) */}
        <section className='space-y-4 pt-2'>
          {/* SUBTLE WHITE HEADER for Step 2 */}
          <div className='flex justify-center mb-2'>
            <div className='inline-flex items-center gap-3 px-6 py-2.5'>
              <h3 className='text-base font-semibold text-neutral-400/90 border-b-2 border-dashed border-neutral-200/90'>Mua thêm</h3>
            </div>
          </div>

          {/* CAKEPOP ADDONS */}
          <div className='mb-4'>
             <h4 className='text-sm font-bold text-amber-500 mb-2 pl-2 flex items-center gap-2'>
               🍰 Mua thêm cho Cakepop
             </h4>
             <div className='bg-white/40 backdrop-blur-sm border-2 border-dashed border-amber-200/40 rounded-[2rem] p-4 relative overflow-hidden'>
              <div className='grid grid-cols-1 gap-3 relative z-10'>
                {availableAddOns
                  .filter(a => ['Bánh bông lan thêm', 'Cupcake thêm', 'Hộp đựng cakepop thêm', 'Socola thêm', 'Charm thêm'].includes(a.name))
                  .map(addOn => {
                  const existingItem = findCartItem(addOn.id, 'addon');
                  const quantity = existingItem && existingItem.selectedAddOns.length > 0 ? existingItem.selectedAddOns[0].quantity : 0;
                  const isSelected = quantity > 0;

                  return (
                    <div
                      key={addOn.id}
                      className={`modern-card p-3 flex items-center justify-between transition-all duration-300 ${
                        isSelected ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-white hover:bg-gray-50'
                      }`}>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors ${
                            isSelected ? 'bg-amber-200 text-amber-700' : 'bg-gray-100 text-gray-400 grayscale opacity-70'
                          }`}>
                          🎁
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{addOn.name}</h4>
                          <p className='text-amber-600 font-bold text-xs'>
                            {addOn.price.toLocaleString()}đ <span className='text-gray-400 font-normal'>/ {addOn.unit}</span>
                          </p>
                        </div>
                      </div>

                      {/* Smaller controls for addons */}
                      <div className='flex items-center gap-2 bg-white/50 rounded-lg p-1'>
                        <button
                          onClick={() => handleAddOnChange(addOn.id, -1)}
                          disabled={quantity === 0}
                          className='w-7 h-7 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30'>
                          -
                        </button>
                        <span className='font-bold text-sm w-4 text-center'>{quantity}</span>
                        <button
                          onClick={() => handleAddOnChange(addOn.id, 1)}
                          className='w-7 h-7 rounded-lg bg-amber-400 text-white shadow-sm flex items-center justify-center hover:bg-amber-500'>
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PEPERO ADDONS */}
          <div>
             <h4 className='text-sm font-bold text-rose-500 mb-2 pl-2 flex items-center gap-2'>
               🥢 Mua thêm cho Pepero
             </h4>
             <div className='bg-white/40 backdrop-blur-sm border-2 border-dashed border-rose-200/40 rounded-[2rem] p-4 relative overflow-hidden'>
              <div className='grid grid-cols-1 gap-3 relative z-10'>
                {availableAddOns
                  .filter(a => ['Bánh thêm', 'Túi thêm', 'Socola thêm', 'Charm thêm'].includes(a.name))
                  .map(addOn => {
                  const existingItem = findCartItem(addOn.id, 'addon');
                  // Use a distinctive identifier for this section if needed, but for now quantity is shared globaly for the addon ID.
                  // Since 'Socola thêm' and 'Charm thêm' are in both, their quantity will sync. This is likely desired.
                  const quantity = existingItem && existingItem.selectedAddOns.length > 0 ? existingItem.selectedAddOns[0].quantity : 0;
                  const isSelected = quantity > 0;

                  return (
                    <div
                      key={addOn.id}
                      className={`modern-card p-3 flex items-center justify-between transition-all duration-300 ${
                        isSelected ? 'bg-rose-50 ring-1 ring-rose-300' : 'bg-white hover:bg-gray-50'
                      }`}>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors ${
                            isSelected ? 'bg-rose-200 text-rose-700' : 'bg-gray-100 text-gray-400 grayscale opacity-70'
                          }`}>
                          🎁
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{addOn.name}</h4>
                          <p className='text-rose-600 font-bold text-xs'>
                            {addOn.price.toLocaleString()}đ <span className='text-gray-400 font-normal'>/ {addOn.unit}</span>
                          </p>
                        </div>
                      </div>

                      {/* Smaller controls for addons */}
                      <div className='flex items-center gap-2 bg-white/50 rounded-lg p-1'>
                        <button
                          onClick={() => handleAddOnChange(addOn.id, -1)}
                          disabled={quantity === 0}
                          className='w-7 h-7 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30'>
                          -
                        </button>
                        <span className='font-bold text-sm w-4 text-center'>{quantity}</span>
                        <button
                          onClick={() => handleAddOnChange(addOn.id, 1)}
                          className='w-7 h-7 rounded-lg bg-rose-400 text-white shadow-sm flex items-center justify-center hover:bg-rose-500'>
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </motion.main>

      {/* ================= BOTTOM BAR ================= */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className='fixed bottom-2 left-4 right-4 z-40'>
        <div className='container mx-auto max-w-3xl'>
          {/* FIX APPLIED HERE: 
             1. Changed 'pl-6' to 'pl-16' (creates space for the "N" button)
             2. Increased opacity 'bg-gray-900/95' for better contrast
             3. Added 'border-white/20' for a glassmorphism pop
          */}
          <div className='bg-gray-900/95 backdrop-blur-xl rounded-[2.5rem] p-2 pl-16 pr-2 flex items-center justify-between shadow-2xl shadow-rose-900/30 border border-white/20'>
            {/* Total Price */}
            <div className='flex flex-col justify-center'>
              <span className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5'>Tổng cộng</span>
              <AnimatePresence mode='wait'>
                <motion.span
                  key={cart.totalPrice}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  // Made font larger and tabular-nums ensures numbers don't jump around
                  className='text-xl sm:text-2xl font-black text-white leading-none tabular-nums'>
                  {cart.totalPrice.toLocaleString()}
                  <span className='text-sm font-medium text-gray-400 align-top ml-0.5'>đ</span>
                </motion.span>
              </AnimatePresence>
            </div>

            {/* View Cart Button */}
            <div className='flex items-center'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                disabled={cart.totalItems === 0}
                // Made button slightly taller (h-12) and adjusted padding
                className='h-12 pl-6 pr-2 rounded-[2rem] bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/40 flex items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all'>
                <span className='flex flex-col items-start leading-none'>
                  <span>Xem Giỏ</span>
                  <span className='text-[10px] opacity-80 font-medium mt-1'>({cart.totalItems} món)</span>
                </span>
                <span className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M14 5l7 7m0 0l-7 7m7-7H3' />
                  </svg>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}