/**
 * Core Application TypeScript Declarations & Data Models
 * Domain Models for ShopSilo Customer Platform
 */

// 1. User & Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: 'customer' | 'shop' | 'admin' | 'merchant';
  is_active: boolean;
  loyalty_points?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: User;
  requires_phone?: boolean;
}

// 2. Shop Types
export interface Shop {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  pincode?: string;
  whatsapp_number?: string;
  logo_url?: string;
  banners?: string[];
  timing?: string;
  opening_time?: string;
  closing_time?: string;
  weekly_off?: string;
  is_open?: boolean;
  is_currently_open?: boolean;
  is_active?: boolean;
  upi_id?: string;
  average_rating?: number;
  total_reviews?: number;
  distance_km?: number | null;
  created_at?: string;
  updated_at?: string;
}

// 3. Product & Inventory Types
export interface Product {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  price: number;
  compare_price?: number;
  floor_price?: number;
  cost_price?: number;
  allow_bargain?: boolean;
  is_price_public?: boolean;
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  unit?: string;
  images?: string[];
  is_active?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// 4. Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  parent_id?: string | null;
  is_active?: boolean;
  display_order?: number;
}

// 5. Digital Khata Types
export interface CustomerKhata {
  id: string;
  shop_id: string;
  shop_name?: string;
  shop_slug?: string;
  customer_name: string;
  customer_phone: string;
  current_balance: number;
  credit_limit?: number;
  is_active?: boolean;
  last_transaction_at?: string;
}

export interface KhataTransaction {
  id: string;
  khata_id: string;
  shop_id: string;
  type: 'credit' | 'payment' | 'reversal';
  amount: number;
  balance_after: number;
  notes?: string;
  bill_number?: string;
  payment_mode?: string;
  status: 'completed' | 'disputed' | 'reversed';
  dispute_reason?: string;
  upi_ref_no?: string;
  created_at: string;
}

// 6. Reservation / Counter Pickup Types
export interface Reservation {
  id: string;
  reservation_number: string;
  user_id?: string;
  shop_id: string;
  shop_name?: string;
  shop_slug?: string;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  quantity: number;
  pickup_code: string;
  status: 'pending' | 'ready' | 'completed' | 'cancelled' | 'expired';
  expires_at: string;
  completed_at?: string;
  notes?: string;
  created_at?: string;
}

// 7. Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  shopId: string;
  shopSlug: string;
  shopName: string;
}

// 8. API Standard Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
