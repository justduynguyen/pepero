'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import CheckoutForm from './CheckoutForm';

interface CartProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface ProductImage {
  id: string;
  name: string;
  image: string;
}

export default function Cart({ isOpen: externalIsOpen, onClose: externalOnClose }: CartProps = {}) {
  const { cart, removeFromCart, updateQuantity, updateAddonQuantity, clearCart } = useCart();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  const isOpen = externalIsOpen ?? internalIsOpen;
  const handleClose = externalOnClose ?? (() => setInternalIsOpen(false));
  const handleOpen = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(true);
    }
  };

  // Fetch fresh product images from catalog API
  useEffect(() => {
    fetch(`/api/catalog?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const images: ProductImage[] = [];
          data.data.categories.forEach((cat: { products: { id: string; name: string; image: string }[] }) => {
            cat.products.forEach((p: { id: string; name: string; image: string }) => {
              images.push({ id: p.id, name: p.name, image: p.image });
            });
          });
          setProductImages(images);
        }
      })
      .catch(console.error);
  }, []);

  // Helper to get fresh image for a product (match by name since IDs change on re-seed)
  const getProductImage = (productName: string, fallbackImage: string) => {
    const found = productImages.find(p => p.name === productName);
    return found?.image || fallbackImage;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('⚠️ Giỏ hàng trống — vui lòng thêm món vào giỏ trước khi thanh toán.');
      return;
    }

    handleClose();
    setTimeout(() => {
      setIsCheckoutOpen(true);
    }, 300);
  };

  const showFloatingButton = externalIsOpen === undefined;

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (cart.totalItems === 0 && !showFloatingButton && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      {showFloatingButton && cart.totalItems > 0 && (
        <button
          onClick={handleOpen}
          className='fixed bottom-4 right-4 btn-primary rounded-full shadow-lg shadow-rose-300/50 px-5 py-3 flex items-center gap-3 z-40 transition-all hover:scale-105'>
          <div className='relative'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            {cart.totalItems > 0 && (
              <span className='absolute -top-2 -right-2 bg-yellow-400 text-rose-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-rose-500'>
                {cart.totalItems}
              </span>
            )}
          </div>
          <span className='font-bold text-white'>{formatPrice(cart.totalPrice)}</span>
        </button>
      )}

      {/* Cart Modal */}
      {isOpen && (
        <div
          className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4'
          onClick={e => {
            if (e.target === e.currentTarget) handleClose();
          }}>
          <div className='w-full max-w-md h-auto max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200'>
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10'>
              <h2 className='font-bold text-xl text-gray-800 flex items-center gap-2'>
                🛍️ Giỏ hàng <span className='text-sm font-normal text-gray-500'>({cart.totalItems} món)</span>
              </h2>
              <button
                onClick={handleClose}
                className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className='flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 min-h-[150px]'>
              {cart.items.length === 0 ? (
                <div className='text-center py-8 flex flex-col items-center justify-center h-full'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4'>🛒</div>
                  <p className='text-gray-500 font-medium'>Giỏ hàng trống trơn à...</p>
                  <button onClick={handleClose} className='mt-3 text-rose-500 font-bold hover:underline'>
                    Đi mua sắm thôi!
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {cart.items.map(item => {
                    // Tính toán số lượng hiện tại để hiển thị và tính đơn giá
                    const currentQuantity = item.selectedCharmSet ? item.quantity : item.selectedAddOns[0].quantity;
                    // Tính đơn giá (Unit Price) = Tổng tiền / Số lượng
                    const unitPrice = item.totalPrice / currentQuantity;

                    return (
                      <div key={item.id} className='modern-card p-4 flex gap-3'>
                        {/* Product Image */}
                        <div className='relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100'>
                          {item.selectedCharmSet ? (
                            <img 
                              src={getProductImage(item.selectedCharmSet.name, item.selectedCharmSet.image)} 
                              alt={item.selectedCharmSet.name} 
                              className='w-full h-full object-cover' 
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center bg-rose-50 text-3xl'>🎁</div>
                          )}
                        </div>

                        {/* Content Wrapper */}
                        <div className='flex-1 min-w-0 flex flex-col w-full'>
                          {/* Header Row: Tên & Nút xóa */}
                          <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='font-bold text-gray-900 line-clamp-1'>
                                  {item.selectedCharmSet 
                                    ? `${item.product.name} - ${item.selectedCharmSet.name}` 
                                    : item.product.name}
                                </h3>
                              {item.selectedCharmSet && (
                                <div className='flex flex-wrap gap-1 mt-1'>
                                  {item.selectedCharmSet.charms.map(c => (
                                    <span key={c.id} className='text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded'>
                                      {c.emoji} {c.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className='text-gray-400 hover:text-red-500 p-1 shrink-0 ml-2'>
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Addons */}
                          {item.selectedAddOns.length > 0 && (
                            <div className='mt-2 bg-rose-50/50 rounded-lg p-2 text-xs text-gray-600 space-y-1 border border-rose-100'>
                              {item.selectedAddOns.map(addon => (
                                <div key={addon.id} className='flex justify-between'>
                                  <span>
                                    + {addon.name} (x{addon.quantity})
                                  </span>
                                  <span className='font-semibold text-rose-600'>{formatPrice(addon.price * addon.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Note */}
                          {item.note && <div className='text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 italic'>💌 {item.note}</div>}

                          {/* Footer Row: Đơn giá & Số lượng */}
                          <div className='mt-auto pt-3 flex items-center justify-between w-full'>
                            {/* 1. Đơn giá x (Bên trái) */}
                            <span className='font-bold text-rose-600 text-base sm:text-lg whitespace-nowrap'>
                              {formatPrice(unitPrice)} <span className="text-gray-400 font-normal text-sm">x</span>
                            </span>

                            {/* 2. Bộ nút tăng giảm (Bên phải) */}
                            <div className='flex items-center ml-1 gap-3 bg-gray-50 rounded-full p-1 border border-gray-200 shrink-0'>
                              <button
                                onClick={() => {
                                  if (item.selectedCharmSet) updateQuantity(item.id, item.quantity - 1);
                                  else updateAddonQuantity(item.id, -1);
                                }}
                                className='w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-rose-600 transition-colors'>
                                -
                              </button>

                              <span className='text-sm font-bold w-6 text-center select-none'>
                                {currentQuantity}
                              </span>

                              <button
                                onClick={() => {
                                  if (item.selectedCharmSet) updateQuantity(item.id, item.quantity + 1);
                                  else updateAddonQuantity(item.id, 1);
                                }}
                                className='w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors'>
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className='p-4 sm:p-6 bg-white border-t border-gray-100 sticky bottom-0 z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <span className='text-gray-500 font-medium'>Tổng cộng</span>
                  <span className='text-2xl font-bold text-rose-600'>{formatPrice(cart.totalPrice)}</span>
                </div>
                <div className='flex gap-3'>
                  <button
                    onClick={clearCart}
                    className='px-5 py-3 rounded-full border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm'>
                    Xóa hết
                  </button>
                  <button onClick={handleCheckout} className='flex-1 btn-modern btn-primary py-3 text-base shadow-lg shadow-rose-200'>
                    Tiến hành đặt hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <CheckoutForm isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} totalPrice={cart.totalPrice} />
    </>
  );
}