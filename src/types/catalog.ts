/**
 * Database types that match the Prisma schema (from DB)
 */
export interface DBCharm {
  id: string;
  emoji: string;
  name: string | null;
  productId: string;
}

export interface DBProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  components: ComponentItem[];
  charms: DBCharm[];
  createdAt: string;
  category?: DBCategory;
}

export interface DBCategory {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  products: DBProduct[];
  createdAt: string;
}

export interface DBAddOn {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string | null;
  isAvailable: boolean;
}

export interface ComponentItem {
  icon: string;
  label: string;
}

/**
 * Frontend types (for backward compatibility with existing UI)
 */
export interface Charm {
  id: string;
  name: string;
  emoji: string;
  image: string;
}

export interface CharmSet {
  id: string;
  name: string;
  image: string;
  charms: Charm[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  price: number;
  unit: string;
  image: string;
  available: boolean;
  stickCount: number;
  includedChocolates: number;
  includedCharms: number;
  availableChocolates: ChocolateFlavor[];
  charmSets?: CharmSet[];
  includedItems: string[];
}

export interface ChocolateFlavor {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  products: CharmSet[];  // Products are rendered as CharmSets in the UI
}

/**
 * API Response types
 */
export interface CatalogResponse {
  success: boolean;
  data: {
    categories: DBCategory[];
    addons: DBAddOn[];
  };
}

/**
 * Adapter: Convert DB types to frontend types
 */
export function adaptDBProductToCharmSet(product: DBProduct): CharmSet {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    charms: product.charms.map(c => ({
      id: c.id,
      name: c.name || '',
      emoji: c.emoji,
      image: '',
    })),
  };
}

export function adaptDBCategoryToFrontend(category: DBCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    image: category.image || '/imgs/Set-A.jpg',
    products: category.products.map(adaptDBProductToCharmSet),
  };
}

export function adaptDBAddOnToFrontend(addon: DBAddOn): AddOn {
  return {
    id: addon.id,
    name: addon.name,
    price: addon.price,
    unit: addon.unit,
  };
}

/**
 * Static chocolate flavors (these are display-only, not user-selectable)
 */
export const chocolateFlavors: ChocolateFlavor[] = [
  { id: 'white', name: 'Socola Trắng', emoji: '🤍', description: 'Vị vanilla béo ngậy', color: '#FFFFFF' },
  { id: 'dark', name: 'Socola Đen', emoji: '🖤', description: 'Vị cacao đậm đà', color: '#2D1B00' },
  { id: 'pink', name: 'Socola Hồng', emoji: '🩷', description: 'Vị dâu ngọt ngào', color: '#FFB6C1' },
  { id: 'green', name: 'Socola Xanh', emoji: '💚', description: 'Vị matcha tươi mát', color: '#90EE90' },
  { id: 'purple', name: 'Socola Tím', emoji: '💜', description: 'Vị việt quất', color: '#DDA0DD' },
];
