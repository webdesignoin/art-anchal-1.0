/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useRef, useEffect } from "react";
import { Search, Heart, ShoppingBag, Menu, X, User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { ViewState, Saree, CartItem } from "../types";
import { supabase, isMock } from "../lib/supabase";

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cart: CartItem[];
  wishlist: Saree[];
  setIsCartOpen: (open: boolean) => void;
  setSelectedSareeId: (id: string | null) => void;
  onSearch: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  toggleFavorite: (saree: Saree) => void;
  userSession?: { is_admin?: boolean; name: string; email: string } | null;
  setUserSession: (session: any) => void;
}

export default function Navbar({
  currentView,
  setView,
  cart,
  wishlist,
  setIsCartOpen,
  onSearch,
  userSession,
  setUserSession,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInp, setSearchInp] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  
  // State for scroll-based styling
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    // Initialize immediately
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if the navbar should have the dark glassmorphic look
  // It should be glassmorphic if the user has scrolled down, OR if they are not on the home page (since other pages have light backgrounds)
  const isDarkGlass = isScrolled || currentView !== "home";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (
        searchRef.current && 
        !searchRef.current.contains(e.target as Node) &&
        searchToggleRef.current &&
        !searchToggleRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const prevCartTotal = useRef(totalCartItems);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (totalCartItems > prevCartTotal.current) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 400);
      return () => clearTimeout(timer);
    }
    prevCartTotal.current = totalCartItems;
  }, [totalCartItems]);

  const navLinks: { label: string; view: ViewState }[] = [
    { label: "Shop", view: "shop" },
    { label: "Collections", view: "collections" },
    { label: "Stories", view: "artisan-stories" },
    { label: "About", view: "about" }
  ];

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchInp.trim()) {
      onSearch(searchInp);
      setView("shop");
      setIsSearchOpen(false);
    }
  };


  const selectNavLink = (view: ViewState) => {
    setView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    // Basic logout logic
    try {
      setUserSession(null);
      localStorage.removeItem("art_anchal_user");
      // If we had supabase imported here, we could call supabase.auth.signOut(), 
      // but clearing session is sufficient as it triggers re-render to home/login.
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      setView("home");
    } catch (err) {
      console.warn("Logout failed", err);
    }
  };



  return (
    <>
      {/* Spacer to prevent content from hiding under fixed navbar on non-home pages */}
      {currentView !== "home" && <div className="h-[72px] w-full shrink-0" aria-hidden="true" />}
      
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isDarkGlass 
            ? "bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-brand-gold/20 py-3 shadow-sm" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
          
          {/* ── Left: Logo ─────────────────────────────────────────── */}
          <div className="flex-1 flex items-center justify-start">
            <button
              onClick={() => selectNavLink("home")}
              className="group cursor-pointer focus:outline-none flex flex-col"
            >
              <h1 className={`serif-heading font-light tracking-wide transition-all duration-500 ${isDarkGlass ? 'text-2xl sm:text-3xl text-brand-maroon' : 'text-3xl sm:text-4xl text-brand-ivory drop-shadow-md'}`}>
                Art<span className={`font-serif italic font-normal ${isDarkGlass ? 'text-brand-gold' : 'text-brand-gold drop-shadow-md'}`}>&</span>Anchal
              </h1>
            </button>
          </div>

          {/* ── Center: Main Navigation Links ──────────────────────── */}
          <nav className="hidden lg:flex flex-1 items-center justify-center space-x-12">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => selectNavLink(link.view)}
                className={`font-sans text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative group overflow-hidden ${
                  isDarkGlass 
                    ? (currentView === link.view ? "text-brand-maroon" : "text-brand-warm-gray hover:text-brand-maroon") 
                    : (currentView === link.view ? "text-brand-gold" : "text-brand-ivory hover:text-brand-gold")
                }`}
              >
                {link.label}
                {/* Minimal animated underline */}
                <span className={`absolute bottom-0 left-0 w-full h-[1px] transition-transform duration-300 origin-left ${
                  isDarkGlass ? "bg-brand-maroon" : "bg-brand-gold"
                } ${currentView === link.view ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
              </button>
            ))}
          </nav>

          {/* ── Right: Action Icons ────────────────────────────────── */}
          <div className="flex-1 flex items-center justify-end space-x-5 sm:space-x-8">
            <button
              ref={searchToggleRef}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`transition-colors cursor-pointer ${isDarkGlass ? 'text-brand-maroon hover:text-brand-gold' : 'text-brand-ivory hover:text-brand-gold'}`}
              aria-label="Open search"
              title="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" aria-hidden="true" />
            </button>

            <button
              onClick={() => selectNavLink("wishlist")}
              className={`transition-colors cursor-pointer relative ${isDarkGlass ? 'text-brand-maroon hover:text-brand-gold' : 'text-brand-ivory hover:text-brand-gold'}`}
              aria-label={`Wishlist${wishlist.length > 0 ? `, ${wishlist.length} items` : ''}`}
              title="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" aria-hidden="true" />
              {wishlist.length > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${isDarkGlass ? 'bg-brand-gold text-white' : 'bg-brand-maroon text-white'}`}>
                  {wishlist.length}
                </span>
              )}
            </button>

            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                onClick={() => {
                  if (userSession?.is_admin) selectNavLink("admin-console");
                  else if (userSession) setIsProfileOpen((o) => !o);
                  else selectNavLink("login-register");
                }}
                className={`transition-colors cursor-pointer flex items-center gap-2 ${isDarkGlass ? 'text-brand-maroon hover:text-brand-gold' : 'text-brand-ivory hover:text-brand-gold'}`}
                title="Account"
              >
                {userSession?.is_admin ? (
                  <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                ) : userSession ? (
                  <div className="flex items-center gap-1.5">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                    <ChevronDown className={`w-3 h-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <User className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                )}
              </button>

              {/* User Dropdown */}
              {isProfileOpen && userSession && !userSession.is_admin && (
                <div className="absolute right-0 top-full mt-6 w-64 bg-[#FDFBF7] border border-brand-gold/20 shadow-2xl z-50 animate-fade-in rounded-sm overflow-hidden">
                  <div className="px-6 py-5 bg-brand-maroon text-brand-ivory">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-1">Guild Member</p>
                    <p className="text-lg font-serif">{userSession.name}</p>
                  </div>
                  <div className="py-2 bg-[#FDFBF7]">
                    <button
                      onClick={() => { setIsProfileOpen(false); selectNavLink("user-profile"); }}
                      className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-brand-sand transition group"
                    >
                      <User className="w-4 h-4 text-brand-gold group-hover:text-brand-maroon transition" />
                      <span className="text-xs uppercase tracking-widest font-bold text-brand-maroon">My Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-brand-sand transition group border-t border-brand-gold/10"
                    >
                      <LogOut className="w-4 h-4 text-brand-warm-gray group-hover:text-brand-maroon transition" />
                      <span className="text-xs uppercase tracking-widest font-bold text-brand-warm-gray group-hover:text-brand-maroon">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className={`transition-colors cursor-pointer relative ${isDarkGlass ? 'text-brand-maroon hover:text-brand-gold' : 'text-brand-ivory hover:text-brand-gold'}`}
              aria-label={`Shopping cart${totalCartItems > 0 ? `, ${totalCartItems} items` : ''}`}
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" aria-hidden="true" />
              {totalCartItems > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${
                  isDarkGlass ? 'bg-brand-maroon text-white' : 'bg-white text-brand-maroon'
                } ${shouldPulse ? 'animate-cart-pulse' : ''}`}>
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden transition-colors ${isDarkGlass ? 'text-brand-maroon' : 'text-brand-ivory'}`}
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Expanded Search Bar */}
      <div
        ref={searchRef}
        className={`fixed top-0 left-0 w-full bg-[#FDFBF7] shadow-2xl z-[60] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSearchOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-12 relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-0 w-8 h-8 text-brand-gold" />
            <input
              type="text"
              placeholder="Search by collection, motif, or weaver..."
              value={searchInp}
              onChange={(e) => setSearchInp(e.target.value)}
              className="w-full bg-transparent border-b-2 border-brand-gold/30 text-brand-maroon placeholder-brand-warm-gray/50 focus:outline-none focus:border-brand-maroon transition-colors py-4 pl-12 pr-16 text-2xl sm:text-4xl font-serif font-light"
              autoFocus={isSearchOpen}
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-0 p-2 text-brand-warm-gray hover:text-brand-maroon transition cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-8 h-8 stroke-[1]" aria-hidden="true" />
            </button>
          </form>
          <div className="mt-8 flex flex-wrap gap-4 text-xs uppercase font-bold tracking-widest text-brand-warm-gray">
            <span className="text-brand-gold">Trending:</span>
            {["Banarasi", "Kanjivaram", "Bridal", "Zari", "Master Weaver"].map((term) => (
              <button 
                key={term} 
                onClick={() => { setSearchInp(term); }} 
                className="hover:text-brand-maroon transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#1C050E] h-full shadow-2xl flex flex-col transform animate-slide-in-right">
            
            <div className="px-8 py-8 flex items-center justify-between border-b border-brand-gold/15">
              <h1 className="serif-heading text-2xl font-light text-brand-ivory tracking-wider">
                Art<span className="font-serif italic font-normal text-brand-gold">&</span>Anchal
              </h1>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-gold hover:text-brand-ivory transition" aria-label="Close navigation menu">
                <X className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-10 px-8">
              <ul className="space-y-8">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => selectNavLink(link.view)}
                      className={`text-2xl font-serif tracking-wide transition-colors ${
                        currentView === link.view ? "text-brand-gold italic" : "text-brand-ivory hover:text-brand-gold"
                      }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-8 border-t border-brand-gold/15 bg-[#1C050E]">
              {!userSession ? (
                <button
                  onClick={() => selectNavLink("login-register")}
                  className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-brand-gold hover:text-brand-ivory transition"
                >
                  <User className="w-5 h-5" /> Sign In / Register
                </button>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold mb-1">Signed in as</p>
                    <p className="text-lg font-serif text-brand-ivory">{userSession.name}</p>
                  </div>
                  {userSession.is_admin ? (
                    <button
                      onClick={() => selectNavLink("admin-console")}
                      className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-brand-warm-gray hover:text-brand-ivory transition"
                    >
                      <LayoutDashboard className="w-5 h-5" /> Admin Console
                    </button>
                  ) : (
                    <button
                      onClick={() => selectNavLink("user-profile")}
                      className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-brand-warm-gray hover:text-brand-ivory transition"
                    >
                      <User className="w-5 h-5" /> My Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-brand-warm-gray hover:text-brand-ivory transition"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
