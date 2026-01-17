// Types cho Socola Pepero Shop

export interface Charm {
  id: string;
  name: string;
  emoji: string;
  image: string; // Hình ảnh charm
}

export interface CharmSet {
  id: string;
  name: string;
  image: string;
  charms: Charm[]; // 3 charms trong set
}

export interface ChocolateFlavor {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string; // Để hiển thị màu sắc
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  unit: string; // 'que', 'túi', 'cái'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number; // 60,000đ
  price: number; // Same as basePrice for consistency
  unit: string; // 'set'
  image: string;
  available: boolean;
  
  // Socola Pepero specific
  stickCount: number; // 15 que
  includedChocolates: number; // 3 vị random
  includedCharms: number; // 3 charms trong 1 set
  
  availableChocolates: ChocolateFlavor[]; // 5 loại để hiển thị (shop random)
  charmSets?: CharmSet[]; // 5 sets để khách chọn (Set A, B, C, D, E)
  
  includedItems: string[]; // Giấy nến, 15 túi đựng, túi bắt kem
}

export interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number; // Số lượng set
  selectedCharmSet: CharmSet | null; // Set charms đã chọn (Set A/B/C/D/E)
  selectedAddOns: SelectedAddOn[]; // Add-ons với quantity
  totalPrice: number;
  note?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Types for GIS data (Provinces, Districts, Wards)
export interface Ward {
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

export interface District {
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
  "xa-phuong": {
    [key: string]: Ward;
  };
}

export interface Province {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
  "quan-huyen": {
    [key: string]: District;
  };
}

export interface GisData {
  [key: string]: Province;
}

export interface OrderData {
  orderNumber?: string;
  timestamp: string;
  socialLink: string;
  recipientName: string;
  phone: string;
  address: string;
  selectedCharms: string[];
  selectedAddOns: string[]; // Changed to string[] (already formatted)
  note: string;
  paymentMethod: string;
  totalPrice: number;
  shippingFee: number;
  finalTotal: number;
}


