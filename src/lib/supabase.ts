/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { SAREES, ARTISANS, COLLECTIONS } from "../data/sarees";

// Environment variables check — trim to guard against stray quotes/whitespace
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/^"|"$/g, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim().replace(/^"|"$/g, "");

if (import.meta.env.DEV) {
  console.log("Supabase Init:", { 
    url: supabaseUrl, 
    keyLength: supabaseAnonKey.length,
    isPlaceholderUrl: !supabaseUrl || supabaseUrl.includes("your-project-id") || supabaseUrl.includes("MY_")
  });
}

const isPlaceholder = (val: string) => {
  return (
    !val ||
    val.includes("your-project-id") ||
    val.includes("your-supabase-anon") ||
    val.includes("MY_") ||
    val === ""
  );
};

export const isMock = false;

if (import.meta.env.DEV) {
  console.log(
    `[Art&Anchal Database] Operating in ${isMock ? "Mock / LocalStorage Fallback" : "Connected Supabase (PostgreSQL)"} mode.`
  );
}

// Helper to load/save mock tables from localStorage
const getMockTable = (tableName: string): any[] => {
  const data = localStorage.getItem(`aa_db_${tableName}`);
  return data ? JSON.parse(data) : [];
};

const setMockTable = (tableName: string, data: any[]) => {
  localStorage.setItem(`aa_db_${tableName}`, JSON.stringify(data));
};

// Seed Mock Database initially if empty
if (isMock) {
  if (getMockTable("collections").length === 0) {
    const formattedCollections = COLLECTIONS.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      tagline: c.tagline,
      description: c.description,
      cover_image: c.coverImage,
      created_at: new Date().toISOString(),
    }));
    setMockTable("collections", formattedCollections);
  }

  if (getMockTable("artisans").length === 0) {
    const formattedArtisans = ARTISANS.map((a) => ({
      id: a.id,
      name: a.name,
      age: a.age,
      village: a.village,
      experience_years: a.experienceYears,
      specialty: a.specialty,
      quote: a.quote,
      story: a.story,
      image_url: a.imageUrl,
      created_at: new Date().toISOString(),
    }));
    setMockTable("artisans", formattedArtisans);
  }

  if (getMockTable("sarees").length === 0) {
    const formattedSarees = SAREES.map((s, idx) => ({
      id: s.id || `saree-${idx}`,
      name: s.name,
      price: s.price,
      original_price: s.originalPrice || null,
      rating: s.rating,
      reviews_count: s.reviewsCount,
      images: s.images,
      collection_id: COLLECTIONS.find((c) => c.slug === s.category.toLowerCase().replace(/[^a-z]/g, ""))?.id || null,
      colors: [s.color],
      zari_type: s.zariType,
      weaving_technique: s.weavingTechnique,
      material: s.material,
      artisan_id: ARTISANS.find((a) => a.name.includes(s.weaverName || "NOTFOUND"))?.id || null,
      description: s.description,
      drape_recommendation: s.drapeRecommendation,
      is_bestseller: s.isBestseller || false,
      is_featured: s.isFeatured || false,
      is_new: s.isNew || false,
      spec_length: s.specifications.length,
      spec_width: s.specifications.width,
      spec_blouse: s.specifications.blousePiece,
      spec_wash_care: s.specifications.washCare,
      spec_origin: s.specifications.origin,
      stock_quantity: Math.floor(Math.random() * 8) + 1,
      is_active: true,
      sell_online: true,
      created_at: new Date().toISOString(),
    }));
    setMockTable("sarees", formattedSarees);
  }

  if (getMockTable("profiles").length === 0) {
    // Default Admin profile
    setMockTable("profiles", [
      {
        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        auth_user_id: "mock-admin-auth-id",
        name: "Anoop Kumar (Boutique Director)",
        email: "admin@artandanchal.com",
        phone: "+91 94501 12345",
        is_admin: true,
        source: "offline",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  // Pre-seed some mock leads and interactions for a realistic CRM preview
  if (getMockTable("leads").length === 0) {
    setMockTable("leads", [
      {
        id: "lead-1",
        profile_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        name: "Priyanka Sen",
        email: "priyanka.sen@gmail.com",
        phone: "+91 98300 12345",
        sitting_type: "bridal",
        note: "Interested in royal Shikargah collections for winter wedding.",
        source: "online",
        status: "scheduled",
        created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: "lead-2",
        profile_id: null,
        name: "Smriti Patel",
        email: "smriti@gmail.com",
        phone: "+91 98822 34567",
        sitting_type: "bridal",
        note: "Walk-in showroom visitor interested in Pure Gold Katan silk bridal drapes.",
        source: "offline",
        status: "contacted",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      }
    ]);

    setMockTable("lead_interactions", [
      {
        id: "inter-1",
        lead_id: "lead-2",
        admin_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        notes: "Conducted physical showroom drape preview. Smriti preferred the classic Jamdani weaver series. Scheduled WhatsApp sizing video call for Monday.",
        channel: "in_person_showroom",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ]);
  }
}

// Chainable mock builder class
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private isSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields?: string) {
    // Select is a placeholder since we filter fields later if needed
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => {
      // Direct comparison or foreign relation path checking
      return item[column] === value;
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAsc = ascending;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async execute() {
    let rows = getMockTable(this.tableName);

    // Apply filters
    for (const filter of this.filters) {
      rows = rows.filter(filter);
    }

    // Apply sorting
    if (this.orderCol) {
      rows.sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        const comp = valA < valB ? -1 : 1;
        return this.orderAsc ? comp : -comp;
      });
    }

    // Enforce relational joins for shop products / weavers / collections
    if (this.tableName === "sarees") {
      const artisans = getMockTable("artisans");
      const collections = getMockTable("collections");
      rows = rows.map((s) => {
        const artisan = artisans.find((a) => a.id === s.artisan_id);
        const collection = collections.find((c) => c.id === s.collection_id);
        return {
          ...s,
          // Format back into react components layout (legacy structure support)
          category: collection ? collection.name : "Katan Silk",
          weaverName: artisan ? artisan.name : undefined,
          weaverVillage: artisan ? artisan.village : undefined,
          weaverStorySnippet: artisan ? artisan.story?.slice(0, 150) + "..." : undefined,
          specifications: {
            length: s.spec_length || "5.5 meters",
            width: s.spec_width || "45 inches",
            blousePiece: s.spec_blouse || "80 cm unstitched running brocade",
            washCare: s.spec_wash_care || "Dry cleaning only",
            origin: s.spec_origin || "Varanasi, India",
          },
        };
      });
    }

    if (this.tableName === "lead_interactions") {
      const admins = getMockTable("profiles");
      rows = rows.map((inter) => {
        const adminProfile = admins.find((a) => a.id === inter.admin_id);
        return {
          ...inter,
          admin_name: adminProfile ? adminProfile.name : "System Admin",
        };
      });
    }

    if (this.tableName === "leads") {
      const profiles = getMockTable("profiles");
      rows = rows.map((lead) => {
        const prof = profiles.find((p) => p.id === lead.profile_id);
        return {
          ...lead,
          profile_name: prof ? prof.name : undefined,
          profile_phone: prof ? prof.phone : undefined,
          profile_email: prof ? prof.email : undefined,
        };
      });
    }

    if (this.tableName === "orders") {
      const profiles = getMockTable("profiles");
      const orderItems = getMockTable("order_items");
      const sarees = getMockTable("sarees");
      const invoices = getMockTable("invoices");

      rows = rows.map((order) => {
        const clientProfile = profiles.find((p) => p.id === order.profile_id);
        const items = orderItems
          .filter((oi) => oi.order_id === order.id)
          .map((oi) => {
            const saree = sarees.find((s) => s.id === oi.saree_id);
            return {
              ...oi,
              saree: saree || null,
            };
          });
        const invoice = invoices.find((inv) => inv.order_id === order.id);

        return {
          ...order,
          client_profile: clientProfile || null,
          items,
          invoice: invoice || null,
        };
      });
    }

    if (this.tableName === "purchase_items") {
      const sarees = getMockTable("sarees");
      rows = rows.map(pi => ({
        ...pi,
        saree: sarees.find(s => s.id === pi.saree_id) || null,
      }));
    }

    if (this.tableName === "purchases") {
      const purchaseItems = getMockTable("purchase_items");
      const sarees = getMockTable("sarees");
      rows = rows.map(p => ({
        ...p,
        items: purchaseItems
          .filter(pi => pi.purchase_id === p.id)
          .map(pi => ({ ...pi, saree: sarees.find(s => s.id === pi.saree_id) || null })),
      }));
    }

    if (this.tableName === "attendance") {
      const employees = getMockTable("employees");
      rows = rows.map(att => ({
        ...att,
        employee: employees.find(e => e.id === att.employee_id) || null,
      }));
    }

    if (this.isSingle) {
      return { data: rows[0] || null, error: null };
    }

    return { data: rows, error: null };
  }

  // Support thenable for direct await
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async insert(data: any | any[]) {
    const table = getMockTable(this.tableName);
    const inserts = Array.isArray(data) ? data : [data];
    const newItems = inserts.map((item) => ({
      id: item.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...item,
    }));

    setMockTable(this.tableName, [...table, ...newItems]);

    // Secondary auto triggers simulation (auth -> profile)
    if (this.tableName === "auth_users_mock") {
      const profiles = getMockTable("profiles");
      newItems.forEach((user) => {
        profiles.push({
          id: crypto.randomUUID(),
          auth_user_id: user.id,
          name: user.name || "Anonymous Client",
          email: user.email,
          phone: user.phone || null,
          is_admin: user.email.includes("admin"), // Auto-detect admin role
          source: "online",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
      setMockTable("profiles", profiles);
    }

    // Auto trigger for orders -> invoice in mock mode
    if (this.tableName === "orders") {
      newItems.forEach((order) => {
        const invoices = getMockTable("invoices");
        const taxRate = 0.18; // 18% GST
        const total = Number(order.total ?? order.total_amount ?? 0);
        const subtotal = total / (1 + taxRate);
        const tax = total - subtotal;
        
        invoices.push({
          id: crypto.randomUUID(),
          order_id: order.id,
          invoice_number: `AA-INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          subtotal: Number(subtotal.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          grand_total: total,
          billing_date: new Date().toISOString().split("T")[0],
          created_at: new Date().toISOString()
        });
        setMockTable("invoices", invoices);
      });
    }

    return { data: newItems, error: null };
  }

  async update(data: any) {
    let table = getMockTable(this.tableName);
    let updatedItems: any[] = [];

    table = table.map((item) => {
      // Find if item matches filters
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        const updated = {
          ...item,
          ...data,
          updated_at: new Date().toISOString(),
        };
        updatedItems.push(updated);
        return updated;
      }
      return item;
    });

    setMockTable(this.tableName, table);
    return { data: updatedItems, error: null };
  }

  async delete() {
    const table = getMockTable(this.tableName);
    const remaining: any[] = [];
    const deleted: any[] = [];

    table.forEach((item) => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        deleted.push(item);
      } else {
        remaining.push(item);
      }
    });

    setMockTable(this.tableName, remaining);
    return { data: deleted, error: null };
  }
}

// Client wrapper
const mockSupabase = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },
  auth: {
    async signUp({ email, password, options }: any) {
      // Register in our mock users ledger
      const authUsers = getMockTable("auth_users_mock");
      if (authUsers.some((u) => u.email === email)) {
        return { data: null, error: new Error("Email already registered in guild ledger.") };
      }

      const userId = crypto.randomUUID();
      const newUser = {
        id: userId,
        email,
        name: options?.data?.name || "Anonymous Client",
        phone: options?.data?.phone || "",
      };

      authUsers.push(newUser);
      setMockTable("auth_users_mock", authUsers);

      // Trigger automatic profile generation
      const profiles = getMockTable("profiles");
      const isAdmin = email === "admin@artandanchal.com" || (options?.data?.is_admin === true);
      const newProfile = {
        id: crypto.randomUUID(),
        auth_user_id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        is_admin: isAdmin,
        source: "online",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      setMockTable("profiles", profiles);

      return {
        data: {
          user: { id: userId, email },
          session: { user: { id: userId, email } },
        },
        error: null,
      };
    },

    async signInWithPassword({ email, password, options }: any) {
      // In mock mode, we look up or auto-create a profile to make testing effortless
      const profiles = getMockTable("profiles");
      let profile = profiles.find((p) => p.email === email);

      if (!profile) {
        // Simple automatic registration for local testing sandbox
        const userId = crypto.randomUUID();
        const isAdmin = email === "admin@artandanchal.com" || (options?.is_admin === true);
        profile = {
          id: crypto.randomUUID(),
          auth_user_id: userId,
          name: email.split("@")[0].replace(".", " "),
          email,
          phone: "+91 94501 00000",
          is_admin: isAdmin,
          source: "online",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        profiles.push(profile);
        setMockTable("profiles", profiles);
      }

      // If user signed in with Admin checked and they weren't admin, update them to admin for sandbox ease
      if (options?.is_admin === true && !profile.is_admin) {
        profile.is_admin = true;
        setMockTable("profiles", profiles);
      }

      return {
        data: {
          user: { id: profile.auth_user_id, email, profile_id: profile.id, is_admin: profile.is_admin, name: profile.name },
          session: { user: { id: profile.auth_user_id, email } },
        },
        error: null,
      };
    },

    async signOut() {
      return { error: null };
    },

    async getSession() {
      return { data: { session: null }, error: null };
    },

    onAuthStateChange(callback: any) {
      // Return a mock unsubscribe
      return { data: { subscription: { unsubscribe: () => {} } } };
    },

    async signInWithOAuth({ provider }: any) {
      if (provider === "google") {
        const userId = "google-mock-id";
        const email = "google.user@gmail.com";
        const name = "Google Client User";
        
        const profiles = getMockTable("profiles");
        let profile = profiles.find((p) => p.email === email);
        if (!profile) {
          profile = {
            id: crypto.randomUUID(),
            auth_user_id: userId,
            name,
            email,
            phone: null,
            is_admin: false,
            source: "online",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          profiles.push(profile);
          setMockTable("profiles", profiles);
        }

        return {
          data: {
            user: { id: userId, email, name, profile_id: profile.id, is_admin: profile.is_admin },
            session: { user: { id: userId, email } }
          },
          error: null
        };
      }
      return { data: null, error: new Error("Unsupported OAuth provider in sandbox.") };
    },

    async signInWithOtp({ phone }: any) {
      if (!phone) return { data: null, error: new Error("Phone number required.") };
      if (import.meta.env.DEV) console.log(`[Mock SMS Sandbox] OTP sent to ${phone}. Code: 123456`);
      return { data: { message: "OTP code sent successfully (Use 123456 in sandbox)." }, error: null };
    },

    async verifyOtp({ phone, token }: any) {
      if (token !== "123456") {
        return { data: null, error: new Error("Invalid verification code. Please enter 123456.") };
      }

      const email = `phone.${phone.replace(/[^0-9]/g, "")}@artandanchal.com`;
      const userId = `phone-mock-id-${phone.replace(/[^0-9]/g, "")}`;
      
      const profiles = getMockTable("profiles");
      let profile = profiles.find((p) => p.phone === phone);
      if (!profile) {
        profile = {
          id: crypto.randomUUID(),
          auth_user_id: userId,
          name: `Client ${phone}`,
          email,
          phone,
          is_admin: false,
          source: "online",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        profiles.push(profile);
        setMockTable("profiles", profiles);
      }

      return {
        data: {
          user: { id: userId, phone, email, name: profile.name, profile_id: profile.id, is_admin: profile.is_admin },
          session: { user: { id: userId, email } }
        },
        error: null
      };
    }
  },
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Export actual or mock Supabase based on environment key configuration
export const supabase = (isMock || !supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl))
  ? (mockSupabase as any)
  : createClient(supabaseUrl, supabaseAnonKey);
