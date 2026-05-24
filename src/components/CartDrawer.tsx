/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { CartItem, Saree, ViewState } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  addToCart: (saree: Saree, quantity: number) => void;
  removeFromCart: (sareeId: string) => void;
  clearCart: () => void;
  setView: (view: ViewState) => void;
  userSession?: { id?: string } | null;
  setPostLoginRedirect?: (v: ViewState | null) => void;
  triggerToast?: (title: string, msg: string, t?: any) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  addToCart,
  removeFromCart,
  clearCart,
  setView,
  userSession,
  setPostLoginRedirect,
  triggerToast,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.saree.price * item.quantity, 0);

  const handleCheckoutClick = () => {
    onClose();
    if (!userSession) {
      if (triggerToast) triggerToast("Login Required", "Please sign in or create an account to proceed to checkout.");
      if (setPostLoginRedirect) setPostLoginRedirect("checkout");
      setView("login-register");
    } else {
      setView("checkout");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMinusQuantity = (item: CartItem) => {
    if (item.quantity > 1) {
      addToCart(item.saree, -1);
    } else {
      removeFromCart(item.saree.id);
    }
  };

  const handlePlusQuantity = (item: CartItem) => {
    addToCart(item.saree, 1);
  };

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-sheet">
      <div className="absolute inset-0 overflow-hidden">
        {/* Overlay background */}
        <div
          className="absolute inset-0 bg-[#1C050E]/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        ></div>

        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md bg-brand-ivory flex flex-col justify-between shadow-2xl animate-[slide-in-right_0.3s_ease-out]">
            {/* Header */}
            <div className="px-6 py-6 border-b border-brand-gold/15 bg-brand-sand/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-brand-maroon" />
                <h2 className="serif-heading text-xl text-brand-maroon tracking-wider font-medium">Your Shopping Bag</h2>
                <span className="text-xs bg-brand-maroon/10 text-brand-maroon px-2 py-0.5 rounded-full font-sans font-medium">
                  {cart.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-brand-gold/10 text-brand-maroon rounded-full transition"
                id="cart-drawer-close-btn"
                aria-label="Close shopping bag"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto py-6 px-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-brand-sand/70 flex items-center justify-center text-brand-maroon/60 mb-5">
                    <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                  </div>
                  <h3 className="serif-heading text-lg text-brand-maroon font-light mb-2">Your bespoke bag is empty</h3>
                  <p className="text-xs text-brand-warm-gray leading-relaxed max-w-xs mb-8">
                    Each Art&Anchal Banarasi saree is an archival heritage treasure. Explore our collections to start your story.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      setView("shop");
                    }}
                    className="border border-brand-maroon px-6 py-3 text-xs tracking-widest uppercase text-brand-maroon hover:bg-brand-maroon hover:text-brand-ivory transition duration-300 font-sans cursor-pointer"
                    id="cart-explore-btn"
                  >
                    Browse Core Saree Shop
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => {
                    const itemTotal = new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(item.saree.price * item.quantity);

                    return (
                      <div
                        key={item.saree.id}
                        className="flex items-start pb-6 border-b border-brand-gold/10"
                      >
                        <div className="flex-shrink-0 w-20 h-24 border border-brand-gold/15 bg-brand-sand overflow-hidden">
                          <img
                            src={item.saree.images[0]}
                            alt={item.saree.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-sm font-serif">
                              <h4 className="text-brand-maroon font-medium leading-tight max-w-[200px]">
                                {item.saree.name}
                              </h4>
                              <p className="text-brand-maroon font-mono text-xs font-semibold ml-2 text-right">
                                {itemTotal}
                              </p>
                            </div>
                            <p className="text-[11px] text-brand-gold tracking-wide uppercase mt-1">
                              {item.saree.category} • {item.saree.weavingTechnique}
                            </p>
                            <span className="text-[10px] text-brand-warm-gray mt-1 block">
                              By {item.saree.weaverName || "Master Weaver"}{item.saree.weaverVillage ? ` (${item.saree.weaverVillage.split(",")[0]})` : ""}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-brand-gold/25 bg-[#FDFBF7]">
                              <button
                                onClick={() => handleMinusQuantity(item)}
                                className="px-2.5 py-1 text-xs text-brand-maroon hover:bg-brand-gold/10 cursor-pointer"
                                id={`qty-minus-${item.saree.id}`}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-xs text-brand-maroon font-semibold font-mono border-x border-brand-gold/15">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handlePlusQuantity(item)}
                                className="px-2.5 py-1 text-xs text-brand-maroon hover:bg-brand-gold/10 cursor-pointer"
                                aria-label={`Increase quantity of ${item.saree.name}`}
                                id={`qty-plus-${item.saree.id}`}
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.saree.id)}
                              className="text-brand-warm-gray hover:text-[#B64545] p-1.5 transition cursor-pointer"
                              aria-label={`Remove ${item.saree.name} from cart`}
                              id={`delete-btn-${item.saree.id}`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total aggregate section */}
            {cart.length > 0 && (
              <div className="border-t border-brand-gold/15 bg-brand-sand/50 px-6 py-6 space-y-4">
                <div className="flex justify-between text-base font-serif font-medium text-brand-maroon">
                  <span className="tracking-wide">Bespoke Order Value:</span>
                  <span className="font-mono font-semibold">{formattedAmount}</span>
                </div>
                <p className="text-[10px] text-brand-warm-gray leading-relaxed text-center sm:text-left">
                  Authentic certified gold/silver zari catalog item. Orders ship fully insured globally via premium courier caskets.
                </p>

                <div className="space-y-2 mt-4">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-[#5B0E2D] hover:bg-[#420A20] text-brand-ivory text-xs tracking-widest uppercase py-4 transition duration-300 font-semibold font-sans shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                    id="cart-checkout-btn"
                  >
                    <span>Proceed To Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-[11px] text-brand-warm-gray hover:text-brand-maroon underline tracking-wider cursor-pointer"
                    id="cart-clear-btn"
                  >
                    Clear Entire Shopping Bag
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-brand-gold-dark font-sans pt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Varanasi Craft Trust Handloom Portal</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
