'use client';

import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef } from 'react';
import { Cart, CartItem, Product, CharmSet, SelectedAddOn } from '@/types';

interface CartContextType {
  cart: Cart;
  addToCart: (
    product: Product,
    quantity: number,
    charmSet: CharmSet | null,
    selectedAddOns: SelectedAddOn[],
    note?: string
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateAddonQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  loadCart: (cart: Cart) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'UPDATE_ADDON_QUANTITY'; payload: { itemId: string; delta: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart };

const calculateItemPrice = (
  product: Product,
  quantity: number,
  selectedAddOns: SelectedAddOn[]
): number => {
  let total = product.basePrice;
  // Addons price
  for (const addon of selectedAddOns) {
    total += addon.price * addon.quantity;
  }
  return total * quantity;
};

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItems = [...state.items, action.payload];
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return { items: newItems, totalItems, totalPrice };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return { items: newItems, totalItems, totalPrice };
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: itemId });
      }
      
      const newItems = state.items.map(item => {
        if (item.id === itemId) {
          const newTotalPrice = calculateItemPrice(
            item.product,
            quantity,
            item.selectedAddOns
          );
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      });
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return { items: newItems, totalItems, totalPrice };
    }
    
    case 'UPDATE_ADDON_QUANTITY': {
      const { itemId, delta } = action.payload;
      const item = state.items.find(i => i.id === itemId);
      
      if (!item || !item.selectedAddOns || item.selectedAddOns.length !== 1) {
        return state;
      }
      
      const currentAddonQty = item.selectedAddOns[0].quantity;
      const newAddonQty = currentAddonQty + delta;
      
      // If quantity becomes 0 or less, remove the item
      if (newAddonQty <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: itemId });
      }
      
      // Update addon quantity inside the item
      const updatedAddOns = [{
        ...item.selectedAddOns[0],
        quantity: newAddonQty
      }];
      
      // Recalculate price
      const newTotalPrice = calculateItemPrice(item.product, 1, updatedAddOns);
      
      const newItems = state.items.map(i => 
        i.id === itemId
          ? { ...i, selectedAddOns: updatedAddOns, totalPrice: newTotalPrice }
          : i
      );
      
      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0);
      
      return { items: newItems, totalItems, totalPrice };
    }
    
    case 'CLEAR_CART':
      return { items: [], totalItems: 0, totalPrice: 0 };
    
    case 'LOAD_CART':
      return action.payload;
    
    default:
      return state;
  }
};

const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

export function CartProvider({ children }: { readonly children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  const isInitialMount = useRef(true);

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem('pepero-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
    isInitialMount.current = false;
  }, []);

  // Save cart
  useEffect(() => {
    if (!isInitialMount.current) {
      localStorage.setItem('pepero-cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (
    product: Product,
    quantity: number,
    charmSet: CharmSet | null,
    selectedAddOns: SelectedAddOn[],
    note?: string
  ) => {
    // Logic to merge Addon-only items
    if (!charmSet && selectedAddOns.length === 1) {
      const addonId = selectedAddOns[0].id;
      const newAddonQty = selectedAddOns[0].quantity;
      
      const existingAddonItem = cart.items.find(
        item => !item.selectedCharmSet && 
                item.selectedAddOns.length === 1 && 
                item.selectedAddOns[0].id === addonId
      );
      
      if (existingAddonItem) {
        // Just update the delta
        dispatch({ 
            type: 'UPDATE_ADDON_QUANTITY', 
            payload: { itemId: existingAddonItem.id, delta: newAddonQty } 
        });
        return;
      }
    }
    
    // Add new item
    const totalPrice = calculateItemPrice(product, quantity, selectedAddOns);
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product,
      quantity,
      selectedCharmSet: charmSet,
      selectedAddOns,
      totalPrice,
      note,
    };
    
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const updateAddonQuantity = (itemId: string, delta: number) => {
    dispatch({ type: 'UPDATE_ADDON_QUANTITY', payload: { itemId, delta } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const loadCart = (cart: Cart) => {
    dispatch({ type: 'LOAD_CART', payload: cart });
  };

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateAddonQuantity,
      clearCart,
      loadCart,
    }),
    [cart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}