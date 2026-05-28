/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { ViewState, Saree, CartItem, Artisan, Collection } from "./types";
import { SAREES, ARTISANS, COLLECTIONS } from "./data/sarees";
import { supabase, isMock } from "./lib/supabase";

// Layout components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import QuickViewModal from "./components/QuickViewModal";

// Views components
import HomeView from "./components/pages/HomeView";
import ShopView from "./components/pages/ShopView";
import CollectionsView from "./components/pages/CollectionsView";
import ProductDetailView from "./components/pages/ProductDetailView";
import AboutView from "./components/pages/AboutView";
import ArtisanStoriesView from "./components/pages/ArtisanStoriesView";
import ContactView from "./components/pages/ContactView";
import CheckoutView from "./components/pages/CheckoutView";
import WishlistView from "./components/pages/WishlistView";
import LoginRegisterView from "./components/pages/LoginRegisterView";
import AdminConsoleView from "./components/pages/AdminConsoleView";
import UserProfileView from "./components/pages/UserProfileView";
import ErrorView from "./components/pages/ErrorView";

import { Sparkles, Eye, ShoppingBag, CheckCircle } from "lucide-react";


export default function App() {
  // App routing and filters
  const [currentView, setView] = useState<ViewState>("home");
  const [selectedSareeId, setSelectedSareeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Synchronize URL hash with React state changes
  useEffect(() => {
    if (currentView === "product-detail" && selectedSareeId) {
      const targetHash = `#/product/${selectedSareeId}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    } else if (currentView === "shop" && selectedCategory) {
      const targetHash = `#/shop?category=${encodeURIComponent(selectedCategory)}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    } else {
      const targetHash = `#/${currentView}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
    
    try {
      localStorage.setItem("art_anchal_view", currentView);
    } catch {}
  }, [currentView, selectedSareeId, selectedCategory]);

  // Listen for window hash changes (e.g. back button / direct link)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#/home";
      const path = hash.replace(/^#\/?/, "");
      
      const queryIndex = path.indexOf("?");
      let view = path;
      let queryString = "";
      if (queryIndex !== -1) {
        view = path.substring(0, queryIndex);
        queryString = path.substring(queryIndex + 1);
      }

      if (view.startsWith("product/")) {
        const id = view.replace("product/", "");
        setSelectedSareeId(id);
        setView("product-detail");
      } else {
        if (view === "shop" && queryString) {
          const params = new URLSearchParams(queryString);
          const cat = params.get("category");
          if (cat) {
            setSelectedCategory(decodeURIComponent(cat));
          }
        }
        setView((view || "home") as ViewState);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Sync initial load

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);


  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Saree[]>([]);
  const [userSession, setUserSession] = useState<{ id?: string; name: string; email: string; is_admin?: boolean; phone?: string } | null>(null);
  const [postLoginRedirect, setPostLoginRedirect] = useState<ViewState | null>(null);
  
  // Global Data State
  const [sarees, setSarees] = useState<Saree[]>(SAREES);
  const [artisans, setArtisans] = useState<Artisan[]>(ARTISANS);
  const [collections, setCollections] = useState<Collection[]>(COLLECTIONS);
  
  // Database re-render trigger state (can eventually be phased out with state sync)
  const [dbTick, setDbTick] = useState(false);

  // Drawer layouts
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewSaree, setQuickViewSaree] = useState<Saree | null>(null);

  // Premium Toast alert hud state
  const [toast, setToast] = useState<{ show: boolean; message: string; subtext?: string } | null>(null);

  // App-wide loading screen state
  const [appLoading, setAppLoading] = useState(true);
  // sessionReady: true once Supabase confirms auth state on page load (prevents order/payment flash)
  const [sessionReady, setSessionReady] = useState(false);

  const refreshCatalog = async (force = false) => {
    try {
      if (!force) {
        const lastFetchStr = localStorage.getItem("art_anchal_last_fetch");
        if (lastFetchStr) {
          const lastFetch = parseInt(lastFetchStr, 10);
          const now = Date.now();
          // TTL of 1 hour (3600000 ms)
          if (now - lastFetch < 3600000) {
            console.log("Cache is still fresh, skipping background catalog fetch.");
            return;
          }
        }
      }

      const { data: dbSarees } = await supabase.from("sarees").select("*");
      const { data: dbArtisans } = await supabase.from("artisans").select("*");
      const { data: dbCollections } = await supabase.from("collections").select("*");

      if (dbSarees && dbSarees.length > 0) {
        setSarees(dbSarees as any[]);
        localStorage.setItem("art_anchal_sarees", JSON.stringify(dbSarees));
      }
      if (dbArtisans && dbArtisans.length > 0) {
        const parsedArtisans = dbArtisans.map((a: any) => ({
          id: a.id,
          name: a.name,
          age: a.age,
          village: a.village,
          experienceYears: a.experience_years,
          quote: a.quote || "",
          story: a.story || "",
          imageUrl: a.image_url || "",
          specialty: a.specialty || "",
          featuredSareeId: a.featured_saree_id || undefined,
        }));
        setArtisans(parsedArtisans);
        localStorage.setItem("art_anchal_artisans", JSON.stringify(parsedArtisans));
      }
      if (dbCollections && dbCollections.length > 0) {
        const parsedCollections = dbCollections.map((c: any) => ({
          id: c.id,
          name: c.name,
          tagline: c.tagline || "",
          description: c.description || "",
          coverImage: c.cover_image || "",
          slug: c.slug,
        }));
        setCollections(parsedCollections);
        localStorage.setItem("art_anchal_collections", JSON.stringify(parsedCollections));
      }
      
      // Update cache timestamp
      localStorage.setItem("art_anchal_last_fetch", Date.now().toString());
      setDbTick((prev) => !prev);
    } catch (err) {
      console.warn("Failed to synchronize database state: ", err);
    }
  };

  // Sync initial sessions on first render
  useEffect(() => {
    // Removed redundant checkSession to prevent race conditions with onAuthStateChange
    const initializeApp = async () => {
      try {
        const savedCart = localStorage.getItem("art_anchal_cart");
        if (savedCart) setCart(JSON.parse(savedCart));

        const savedWish = localStorage.getItem("art_anchal_wish");
        if (savedWish) setWishlist(JSON.parse(savedWish));

        const savedUser = localStorage.getItem("art_anchal_user");
        if (savedUser) setUserSession(JSON.parse(savedUser));

        const savedSarees = localStorage.getItem("art_anchal_sarees");
        if (savedSarees) setSarees(JSON.parse(savedSarees));

        const savedArtisans = localStorage.getItem("art_anchal_artisans");
        if (savedArtisans) setArtisans(JSON.parse(savedArtisans));

        const savedCollections = localStorage.getItem("art_anchal_collections");
        if (savedCollections) setCollections(JSON.parse(savedCollections));
      } catch (err) {
        console.warn("Failed to retrieve localStorage persistence: ", err);
      }

      // Trigger background catalog sync asynchronously to prevent blocking the loader
      refreshCatalog().catch(err => console.warn("Catalog refresh failed:", err));

      setTimeout(() => { setAppLoading(false); }, 1200);

      // Silent safety net — checkSession() sets sessionReady in ~50ms via
      // getSession() so this 3s fallback should never be needed in practice.
      setTimeout(() => { setSessionReady(true); }, 3000);
    };


    initializeApp();

    // Handles: Google OAuth redirect callback, session restore on page refresh
    if (!isMock) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setTimeout(async () => {
            if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
              const u = session.user;
              
              // Pattern 2: Safety upsert — ensures profile always exists even if
              // the database trigger silently failed (e.g. first OAuth login before fix).
              // This is self-healing: safe to run on every login, no duplicates ever.
              const { error: upsertErr } = await supabase.from("profiles").upsert(
                {
                  auth_user_id: u.id,
                  email: u.email,
                  name:
                    u.user_metadata?.full_name ||
                    u.user_metadata?.name ||
                    (u.email ? u.email.split("@")[0] : "Guest"),
                  avatar_url: u.user_metadata?.avatar_url || null,
                  source:
                    u.app_metadata?.provider === "google"
                      ? "google"
                      : u.app_metadata?.provider === "phone"
                      ? "phone"
                      : "online",
                },
                { onConflict: "auth_user_id", ignoreDuplicates: false }
              );

              if (upsertErr) {
                console.error("Profile Upsert Error:", upsertErr);
                triggerToast("Database Error", upsertErr.message);
              }

              // Always update session state so children re-render and re-fetch if they had a stale RLS token

              // Fetch full profile (including is_admin flag)
              const { data: profile, error: fetchErr } = await supabase
                .from("profiles")
                .select("*")
                .eq("auth_user_id", u.id)
                .single();

              if (fetchErr) {
                 console.error("Profile Fetch Error:", fetchErr);
                 triggerToast("Profile Error", fetchErr.message);
              }

              const isAdmin = profile?.is_admin === true;

              const newSession = {
                id: u.id,
                name: profile?.name || u.email?.split("@")[0] || "Guest",
                email: u.email || "",
                is_admin: isAdmin,
                phone: profile?.phone || "",
              };

              setUserSession(newSession);
              localStorage.setItem("art_anchal_user", JSON.stringify(newSession));
              setSessionReady(true); // Unblock order history + payment

              // Route only if coming from login or redirected
              if (currentView === "login-register" || window.location.hash.includes("access_token")) {
                if (isAdmin) setView("admin-console");
                else setView("home");
              }
            }

            if (event === "INITIAL_SESSION" && !session) {
              // Not logged in — still mark session as ready so UI unblocks
              setSessionReady(true);
            }

            if (event === "SIGNED_OUT") {
              setUserSession(null);
              localStorage.removeItem("art_anchal_user");
              setSessionReady(true);
              setView("home");
            }
            if (event === "PASSWORD_RECOVERY") {
              // Unimplemented yet
            }
          }, 0);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // In mock mode, immediately mark session ready since we don't have onAuthStateChange
      setSessionReady(true);
    }
  }, [currentView, isMock]);

  // --- Dynamic Document Title SEO ---
  useEffect(() => {
    switch (currentView) {
      case "home":
        document.title = "Art & Anchal | Authentic Handloom Banarasi Sarees";
        break;
      case "shop":
        document.title = "Shop Masterpieces | Art & Anchal Banarasi Sarees";
        break;
      case "product-detail":
        if (selectedSareeId) {
          const s = sarees.find(s => s.id === selectedSareeId);
          document.title = s ? `${s.name} - Pure Silk Banarasi | Art & Anchal` : "Product Detail | Art & Anchal";
        } else {
          document.title = "Product Detail | Art & Anchal";
        }
        break;
      case "collections":
        document.title = "Heritage Collections | Katan, Shikargah & More | Art & Anchal";
        break;
      case "about":
        document.title = "Our Heritage & Craftsmanship | Art & Anchal";
        break;
      case "artisan-stories":
        document.title = "Master Weavers of Banaras | Art & Anchal";
        break;
      case "user-profile":
        document.title = "My Dashboard | Art & Anchal";
        break;
      case "checkout":
        document.title = "Secure Checkout | Art & Anchal";
        break;
      default:
        document.title = "Art & Anchal";
    }
  }, [currentView, selectedSareeId, sarees]);


  // Sync changes back to local storage
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("art_anchal_cart", JSON.stringify(updatedCart));
  };

  const saveWishToStorage = (updatedWish: Saree[]) => {
    setWishlist(updatedWish);
    localStorage.setItem("art_anchal_wish", JSON.stringify(updatedWish));
  };

  const triggerToast = (message: string, subtext?: string) => {
    setToast({ show: true, message, subtext });
    setTimeout(() => setToast(null), 3500);
  };

  // Add / Modify item inside cart bag
  const addToCart = (saree: Saree, quantity: number) => {
    const existingIndex = cart.findIndex((item) => item.saree.id === saree.id);
    let updatedCart = [...cart];
    const stockLimit = saree.stock_quantity ?? 1;

    if (existingIndex > -1) {
      // Validate stock
      if (quantity > 0 && updatedCart[existingIndex].quantity + quantity > stockLimit) {
        triggerToast("Out of Stock", `Only ${stockLimit} ${stockLimit === 1 ? 'piece is' : 'pieces are'} available.`);
        return;
      }
      const newQuantity = updatedCart[existingIndex].quantity + quantity;
      if (newQuantity <= 0) {
        updatedCart.splice(existingIndex, 1);
        triggerToast("Removed from showroom bag", saree.name);
      } else {
        updatedCart[existingIndex].quantity = newQuantity;
        if (quantity > 0) {
          triggerToast("Added to showroom bag", `${saree.name} (Qty: ${newQuantity})`);
          setIsCartOpen(true);
        }
      }
    } else if (quantity > 0) {
      if (quantity > stockLimit) {
        triggerToast("Out of Stock", `Only ${stockLimit} ${stockLimit === 1 ? 'piece is' : 'pieces are'} available.`);
        return;
      }
      updatedCart.push({ saree, quantity });
      triggerToast("Added to showroom bag", saree.name);
      setIsCartOpen(true);
    }

    saveCartToStorage(updatedCart);
  };

  // Remove completely from cart
  const removeFromCart = (sareeId: string) => {
    const targetItem = cart.find((item) => item.saree.id === sareeId);
    const updatedCart = cart.filter((item) => item.saree.id !== sareeId);
    saveCartToStorage(updatedCart);
    if (targetItem) {
      triggerToast("Removed from showroom bag", targetItem.saree.name);
    }
  };

  // Clear entirely
  const clearCart = () => {
    saveCartToStorage([]);
  };

  // Toggle favorite target saree inside wishlist
  const toggleFavorite = (saree: Saree) => {
    const isAlreadyFaved = wishlist.some((item) => item.id === saree.id);
    let updatedWishlist = [...wishlist];

    if (isAlreadyFaved) {
      updatedWishlist = updatedWishlist.filter((item) => item.id !== saree.id);
      triggerToast("Removed from curated wishlist", saree.name);
    } else {
      updatedWishlist.push(saree);
      triggerToast("Added to curated wishlist", saree.name);
    }

    saveWishToStorage(updatedWishlist);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setView("shop");
  };

  if (appLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#1C050E] flex flex-col items-center justify-center space-y-8 select-none animate-fade-in overflow-hidden">
        {/* Subtle background shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.08)_0%,transparent_60%)] animate-pulse-slow"></div>

        {/* Glowing Logo */}
        <div className="text-center relative animate-float">
          {/* Circular weaving thread spinners */}
          <div className="absolute inset-0 -m-10 rounded-full border border-brand-gold/10 border-t-brand-gold/40 animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute inset-0 -m-12 rounded-full border border-brand-gold/5 border-b-brand-gold/30 animate-[spin_4s_linear_infinite_reverse]"></div>
          
          <h1 className="serif-heading text-4.5xl sm:text-5xl font-light text-brand-ivory tracking-widest select-none relative z-10">
            Art<span className="font-serif italic text-brand-gold">&</span>Anchal
          </h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-brand-gold font-sans font-bold mt-3 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            Varanasi Handlooms
          </p>
        </div>
        
        {/* Status indicators */}
        <div className="flex flex-col items-center space-y-3 pt-6 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex space-x-2">
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="text-[10px] tracking-widest font-serif text-brand-gold/60 italic">
            Preparing your experience...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] text-[#1C050E] font-sans antialiased min-h-screen flex flex-col justify-between">
      
      {/* 1. Header Navigation elements */}
      {currentView !== "admin-console" && (
        <Navbar
          currentView={currentView}
          setView={setView}
          cart={cart}
          wishlist={wishlist}
          setIsCartOpen={setIsCartOpen}
          setSelectedSareeId={setSelectedSareeId}
          onSearch={handleSearchSubmit}
          setSelectedCategory={setSelectedCategory}
          toggleFavorite={toggleFavorite}
          userSession={userSession}
          setUserSession={setUserSession}
        />
      )}


      {/* 2. Primary Layout Page Router State Switch */}
      <main className="flex-grow">
        {currentView === "home" && (
          <HomeView
            setView={setView}
            setSelectedSareeId={setSelectedSareeId}
            setQuickViewSaree={setQuickViewSaree}
            setSelectedCategory={setSelectedCategory}
            sarees={sarees}
            collections={collections}
          />
        )}

        {currentView === "shop" && (
          <ShopView
            setView={setView}
            setSelectedSareeId={setSelectedSareeId}
            setQuickViewSaree={setQuickViewSaree}
            toggleFavorite={toggleFavorite}
            wishlist={wishlist}
            initialSearchQuery={searchQuery}
            setInitialSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sarees={sarees}
          />
        )}

        {currentView === "collections" && (
          <CollectionsView
            setView={setView}
            setSelectedCategory={setSelectedCategory}
            collections={collections}
          />
        )}

        {currentView === "product-detail" && selectedSareeId && (
          <ProductDetailView
            sareeId={selectedSareeId}
            setView={setView}
            toggleFavorite={toggleFavorite}
            wishlist={wishlist}
            addToCart={addToCart}
            setSelectedCategory={setSelectedCategory}
            setSelectedSareeId={setSelectedSareeId}
            setQuickViewSaree={setQuickViewSaree}
            sarees={sarees}
          />
        )}

        {currentView === "product-detail" && !selectedSareeId && (
          <ErrorView type="404" setView={setView} />
        )}

        {currentView === "about" && (
          <AboutView setView={setView} />
        )}

        {currentView === "artisan-stories" && (
          <ArtisanStoriesView
            setView={setView}
            setSelectedSareeId={setSelectedSareeId}
            setSelectedCategory={setSelectedCategory}
            artisans={artisans}
            sarees={sarees}
          />
        )}

        {currentView === "contact" && (
          <ContactView userSession={userSession} />
        )}

        {currentView === "checkout" && (
          <CheckoutView
            cart={cart}
            clearCart={clearCart}
            setView={setView}
            userSession={userSession}
            sessionReady={sessionReady}
          />
        )}

        {currentView === "wishlist" && (
          <WishlistView
            wishlist={wishlist}
            toggleFavorite={toggleFavorite}
            setQuickViewSaree={setQuickViewSaree}
            setView={setView}
            setSelectedSareeId={setSelectedSareeId}
          />
        )}

        {currentView === "login-register" && (
          <LoginRegisterView
            setView={setView}
            setUserSession={setUserSession}
            userSession={userSession}
            setAppLoading={setAppLoading}
            postLoginRedirect={postLoginRedirect}
            setPostLoginRedirect={setPostLoginRedirect}
          />
        )}

        {currentView === "admin-console" && userSession?.is_admin === true && (
          <AdminConsoleView
            userSession={userSession}
            setUserSession={setUserSession}
            setView={setView}
            refreshCatalog={refreshCatalog}
          />
        )}

        {/* Redirect non-admins who somehow reach admin-console — wait for session */}
        {currentView === "admin-console" && sessionReady && !userSession?.is_admin && (
          <ErrorView type="403" setView={setView} />
        )}

        {currentView === "user-profile" && (
          <UserProfileView 
            userSession={userSession}
            setView={setView}
            setUserSession={setUserSession}
            wishlist={wishlist}
            toggleFavorite={toggleFavorite}
            setQuickViewSaree={setQuickViewSaree}
            setSelectedSareeId={setSelectedSareeId}
            sessionReady={sessionReady}
          />
        )}
      </main>


      {/* 3. Global Footer stories */}
      <Footer setView={setView} />

      {/* 4. Sliding Sidebar Drawer for Shopping Bag */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        setView={setView}
        userSession={userSession}
        setPostLoginRedirect={setPostLoginRedirect}
        triggerToast={triggerToast}
      />

      {/* 5. Overlay Quick View Modal */}
      <QuickViewModal
        saree={quickViewSaree}
        onClose={() => setQuickViewSaree(null)}
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        wishlist={wishlist}
        setView={setView}
        setSelectedSareeId={setSelectedSareeId}
      />

      {/* 6. Premium Toast Floating Notification HUD */}
      {toast && toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C050E]/95 border border-brand-gold/30 p-4 sm:p-5 text-[#F9F5F0] shadow-2xl flex items-start space-x-3.5 max-w-sm border-l-4 border-l-brand-gold animate-[slide-in-right_0.25s_ease-out]">
          <div className="bg-brand-gold/15 p-1.5 rounded-full border border-brand-gold/20 text-brand-gold flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-brand-ivory">{toast.message}</h4>
            {toast.subtext && (
              <p className="text-[11px] text-brand-gold truncate leading-tight italic font-serif">
                &ldquo;{toast.subtext}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
