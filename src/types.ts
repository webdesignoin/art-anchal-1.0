/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Saree {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  category: string; // e.g. "Katan Silk", "Tanchoi", "Organza / Kora", "Shikargah"
  color: string;
  zariType: "Pure Gold Zari" | "Tested Zari" | "Silver Zari" | "Water Gold Zari";
  weavingTechnique: "Kadwa Handloom" | "Fekua Handloom" | "Tanchoi Weave" | "Jamdani Handloom";
  material: string;
  weaverName?: string;
  weaverVillage?: string;
  weaverStorySnippet?: string;
  description: string;
  drapeRecommendation: string;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  stock_quantity?: number;
  specifications: {
    length: string;
    width: string;
    blousePiece: string;
    washCare: string;
    origin: string;
  };
}

export interface Artisan {
  id: string;
  name: string;
  age: number;
  village: string;
  experienceYears: number;
  quote: string;
  story: string;
  imageUrl: string;
  specialty: string;
  featuredSareeId?: string;
}

export interface CartItem {
  saree: Saree;
  quantity: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  date: string;
}

export interface Collection {
  id: string;
  name: string;
  tagline: string;
  description: string;
  coverImage: string;
  slug: string;
}

export type ViewState = 
  | "home"
  | "shop"
  | "collections"
  | "product-detail"
  | "about"
  | "artisan-stories"
  | "contact"
  | "checkout"
  | "wishlist"
  | "login-register"
  | "admin-console"
  | "user-profile";

export interface SavedAddress {
  id: string;
  address: string;
  city: string;
  zip: string;
}

export interface DbProfile {
  id: string;
  auth_user_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  is_admin: boolean;
  source: 'online' | 'offline';
  saved_addresses?: SavedAddress[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbLead {
  id: string;
  profile_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  sitting_type: 'bridal' | 'heritage' | 'standard' | 'general';
  note?: string | null;
  source: 'online' | 'offline';
  status: 'new' | 'contacted' | 'scheduled' | 'won' | 'lost';
  created_at: string;
  updated_at: string;
  profile_name?: string;
  profile_phone?: string;
  profile_email?: string;
}

export interface DbLeadInteraction {
  id: string;
  lead_id: string;
  admin_id?: string | null;
  notes: string;
  channel: 'phone' | 'whatsapp' | 'email' | 'in_person_showroom';
  created_at: string;
  admin_name?: string;
}

export interface DbOrder {
  id: string;
  profile_id?: string | null;
  // Snapshot of customer at time of order
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  // Shipping details as JSONB object
  shipping_address: {
    address: string;
    city: string;
    zip: string;
    bust_size?: string | null;
    waist_size?: string | null;
    shoulder_width?: string | null;
  };
  // Financials — matches DB columns exactly
  subtotal: number;
  discount: number;
  tax: number;
  total: number;               // DB column is "total" NOT "total_amount"
  // Status — matches DB enum order_status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  // Payment — matches DB enum payment_mode
  payment_mode: 'online' | 'cash' | 'card' | 'upi' | 'bank_transfer';
  payment_ref?: string | null;  // Razorpay order ID / UPI ref
  is_paid: boolean;             // DB column is "is_paid" NOT "payment_status"
  is_offline: boolean;
  notes?: string | null;
  invoice_number?: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (not DB columns — from select with joins)
  items?: DbOrderItem[];
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  saree_id?: string | null;
  product_name: string;        // snapshot of name at time of order
  unit_price: number;
  quantity: number;
  subtotal?: number;           // generated column: unit_price * quantity
  created_at: string;
  // Joined
  saree?: { id: string; name: string; images: string[]; } | null;
}

export interface DbInvoice {
  id: string;
  order_id: string;
  invoice_number: string;
  subtotal: number;
  tax: number;
  grand_total: number;
  billing_date: string;
  created_at: string;
}


export interface FilterState {
  categories: string[];
  colors: string[];
  weavingTechniques: string[];
  zariTypes: string[];
  priceRange: [number, number];
  searchQuery: string;
  sortBy: "featured" | "price-asc" | "price-desc" | "rating";
}

export interface DbEmployee {
  id: string;
  name: string;
  role: string;
  base_salary: number;
  phone?: string | null;
  created_at: string;
}

export interface DbAttendance {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  notes?: string | null;
  created_at: string;
  employee?: DbEmployee;
}

export interface DbExpense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface DbPurchase {
  id: string;
  vendor_name: string;
  items_description: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: 'paid' | 'partially_paid' | 'unpaid';
  date: string;
  created_at: string;
}

export interface DbDue {
  id: string;
  entity_name: string;
  due_type: 'payable' | 'receivable';
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: 'pending' | 'cleared';
  due_date?: string | null;
  linked_purchase_id?: string | null;
  created_at: string;
}

export interface DbDuePayment {
  id: string;
  due_id: string;
  amount_paid: number;
  payment_date: string;
  notes?: string | null;
  created_at: string;
}
