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
  source: 'online' | 'offline';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'canceled';
  tracking_number?: string | null;
  shipping_carrier?: string | null;
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
  payment_method?: 'card' | 'upi' | 'bank_transfer' | 'cash' | null;
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string | null;
  shipping_address: string;
  shipping_zip: string;
  shipping_city?: string | null;
  size_bust_inches?: string | null;
  size_waist_inches?: string | null;
  size_shoulder_inches?: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  client_profile?: DbProfile | null;
  items?: DbOrderItem[];
  invoice?: DbInvoice | null;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  saree_id?: string | null;
  quantity: number;
  unit_price: number;
  saree?: Saree | null;
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
