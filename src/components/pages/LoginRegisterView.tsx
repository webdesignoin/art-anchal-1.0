/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from "react";
import { ViewState } from "../../types";
import {
  User, ShieldCheck, Mail, Lock, Unlock, EyeOff, ClipboardList,
  HelpCircle, PhoneCall, LayoutDashboard, Users, ShoppingBag, IndianRupee, RefreshCw
} from "lucide-react";
import { supabase, isMock } from "../../lib/supabase";

interface LoginRegisterViewProps {
  setView: (view: ViewState) => void;
  setUserSession: (session: { id?: string; name: string; email: string; is_admin?: boolean; phone?: string } | null) => void;
  userSession: { id?: string; name: string; email: string; is_admin?: boolean; phone?: string } | null;
  setAppLoading?: (loading: boolean) => void;
  postLoginRedirect?: ViewState | null;
  setPostLoginRedirect?: (v: ViewState | null) => void;
}

export default function LoginRegisterView({
  setView,
  setUserSession,
  userSession,
  setAppLoading,
  postLoginRedirect,
  setPostLoginRedirect,
}: LoginRegisterViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [inp, setInp] = useState({ name: "", email: "", password: "" });

  // Redirect logic upon successful login
  useEffect(() => {
    if (userSession) {
      if (postLoginRedirect) {
        setView(postLoginRedirect);
        if (setPostLoginRedirect) setPostLoginRedirect(null);
      } else if (userSession.is_admin) {
        setView("admin-console");
      } else {
        setView("home");
      }
    }
  }, [userSession, setView, postLoginRedirect, setPostLoginRedirect]);

  // Phone Auth States
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otpValue, setOtpValue] = useState("");

  // Auth States
  const [submitFeedback, setSubmitFeedback] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showMsg = (msg: string) => {
    setSubmitFeedback(msg);
    setTimeout(() => setSubmitFeedback(""), 4000);
  };

  // ── Email Auth ────────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inp.email || !inp.password) return;
    setIsLoading(true);
    try {
      if (isMock) {
        const mockSession = { id: "mock-id", name: inp.name || "Mock User", email: inp.email, is_admin: false };
        setUserSession(mockSession);
        localStorage.setItem("art_anchal_user", JSON.stringify(mockSession));
        return;
      }

      if (isLogin) {
        // Clear any stale cached session before fresh login
        localStorage.removeItem("art_anchal_user");

        const { data, error } = await supabase.auth.signInWithPassword({ email: inp.email, password: inp.password });
        if (error) { showMsg(error.message); return; }

        const userId = data.user.id;
        const userEmail = data.user.email || "";

        // Fetch profile — is_admin comes exclusively from the database
        const { data: profile, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("auth_user_id", userId)
          .single();

        if (profErr && import.meta.env.DEV) console.warn("Profile fetch error:", profErr.message);

        const session = {
          id: userId,
          name: profile?.name || userEmail?.split("@")[0] || "Guest",
          email: userEmail || "",
          is_admin: profile?.is_admin === true,
          phone: profile?.phone || "",
        };
        setUserSession(session);
        localStorage.setItem("art_anchal_user", JSON.stringify(session));
      } else {
        const { data, error } = await supabase.auth.signUp({ email: inp.email, password: inp.password });
        if (error) { showMsg(error.message); return; }
        if (data.user) {
          await supabase.from("profiles").upsert(
            { auth_user_id: data.user.id, name: inp.name || inp.email.split("@")[0], email: inp.email, source: "online" },
            { onConflict: "auth_user_id" }
          );
          showMsg("Account created! Please check your email to verify your account before signing in.");
        }
      }
    } catch (err: any) {
      showMsg(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phone Auth ────────────────────────────────────────────────────────────
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) { showMsg(error.message); return; }
      setOtpSent(true);
      showMsg("OTP sent to " + phone);
    } catch (err: any) {
      showMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpValue) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otpValue, type: "sms" });
      if (error) { showMsg(error.message); return; }
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        const session = {
          id: data.user.id,
          name: profile?.name || phone,
          email: data.user.email || "",
          is_admin: profile?.is_admin || false,
          phone,
        };
        setUserSession(session);
        localStorage.setItem("art_anchal_user", JSON.stringify(session));
      }
    } catch (err: any) {
      showMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setUserSession(null);
    localStorage.removeItem("art_anchal_user");
    showMsg("Logged out successfully.");
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-20 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center" id="login-register-view">
      <div className="max-w-md w-full animate-fade-in">

        {userSession ? (
          /* ── Profile card — regular (non-admin) users ── */
          <div className="bg-[#FAF7F2] border border-brand-gold/25 p-8 sm:p-10 space-y-6">
            {/* Avatar + Name */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-brand-gold/15 border border-brand-gold/25 mx-auto flex items-center justify-center text-brand-maroon">
                <User className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold">Artisan Guild Profile</span>
                <h2 className="serif-heading text-2xl text-brand-maroon font-serif font-light">{userSession.name}</h2>
                <p className="text-xs text-brand-warm-gray font-mono">{userSession.email}</p>
              </div>
            </div>

            {/* Order history placeholder */}
            <div className="border-t border-b border-brand-gold/15 py-4 text-xs text-brand-warm-gray space-y-2 text-left">
              <span className="block text-[10px] uppercase font-bold text-brand-maroon tracking-wider font-sans mb-2 flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-brand-gold" />
                Historic client records
              </span>
              <p className="italic text-brand-warm-gray/70">No prior archival orders registered yet.</p>
              <p>Your Art&amp;Anchal account grants you access to live dispatches, loom previews, and preferred bridal tailor consultations.</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setView("shop")}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/95 text-brand-ivory text-xs uppercase tracking-widest font-sans font-bold py-3.5 cursor-pointer shadow-md"
                id="profile-browse-shop-btn"
              >
                Browse Heirloom Saree Catalogue
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-center text-[11px] text-[#B64545] hover:text-brand-maroon underline tracking-wider cursor-pointer font-sans"
                id="profile-logout-btn"
              >
                Sign Out Of Heritage Account
              </button>
            </div>
          </div>
        ) : (
          /* ── Sign in / Register form ── */
          <div className="bg-[#FAF7F2] border border-brand-gold/25 p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="serif-heading text-2xl text-brand-maroon font-serif font-light leading-tight">
                {isLogin ? "Join The Guild" : "Registry Credentials"}
              </h2>
              <p className="text-xs text-brand-warm-gray font-light">
                {isLogin
                  ? "Welcome back. Log in to preview dispatches."
                  : "Create a secure account to track loom milestones."}
              </p>
            </div>

            {/* ── Email / Password flow ── */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-maroon block">Full Name</label>
                    <input
                      type="text"
                      value={inp.name}
                      onChange={(e) => setInp({ ...inp, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-white border border-brand-gold/25 px-4 py-3 text-xs text-brand-maroon placeholder-brand-warm-gray/50 focus:outline-none focus:border-brand-maroon"
                      id="register-name-input"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-maroon block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                    <input
                      type="email"
                      value={inp.email}
                      onChange={(e) => setInp({ ...inp, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white border border-brand-gold/25 pl-9 pr-4 py-3 text-xs text-brand-maroon placeholder-brand-warm-gray/50 focus:outline-none focus:border-brand-maroon"
                      id="email-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-maroon block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={inp.password}
                      onChange={(e) => setInp({ ...inp, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white border border-brand-gold/25 pl-9 pr-10 py-3 text-xs text-brand-maroon placeholder-brand-warm-gray/50 focus:outline-none focus:border-brand-maroon"
                      id="password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-warm-gray hover:text-brand-maroon"
                    >
                      {showPass ? <Unlock className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>


                {submitFeedback && (
                  <div className="animate-fade-in">
                    <p className="text-[11px] text-center font-sans text-brand-maroon bg-brand-gold/10 border border-brand-gold/20 py-2 px-3">
                      {submitFeedback}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-maroon/90 text-brand-ivory text-xs uppercase tracking-widest font-bold py-3.5 disabled:opacity-60 transition shadow-md"
                  id="auth-submit-btn"
                >
                  {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />}
                  {isLoading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
                </button>

                {!isLogin && (
                  <p className="text-[9px] text-brand-warm-gray/60 text-center leading-relaxed">
                    By registering you agree to our Heritage Craft Privacy Charter and Cooperative Terms of Service.
                  </p>
                )}

                <div className="text-center text-[10px] text-brand-warm-gray font-sans">
                  {isLogin ? "New to Art & Anchal? " : "Already a member? "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setSubmitFeedback(""); }}
                    className="text-brand-maroon font-bold underline cursor-pointer font-sans"
                    id="auth-toggle-btn"
                  >
                    {isLogin ? "Create an Account" : "Log In Credentials"}
                  </button>
                </div>
              </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-brand-gold/20"></div>
              <span className="flex-shrink-0 mx-4 text-brand-warm-gray text-[9px] uppercase tracking-widest font-bold">Or</span>
              <div className="flex-grow border-t border-brand-gold/20"></div>
            </div>
            
            <button
              onClick={async () => {
                if (isMock) {
                  setSubmitFeedback("Google Login is mocked in this environment. Please use email or phone.");
                  return;
                }
                setIsLoading(true);
                localStorage.removeItem("art_anchal_user");
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin
                    }
                  });
                  if (error) throw error;
                } catch (err: any) {
                  setSubmitFeedback(`Google Sign-In failed: ${err.message}`);
                  setIsLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-3 bg-white border border-brand-gold/30 hover:bg-brand-sand text-brand-maroon text-[11px] font-sans font-medium py-3 transition shadow-sm"
              id="google-signin-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[9px] text-brand-gold-dark pt-1.5 font-sans">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Sovereign Weaving Alliance Protocol</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
