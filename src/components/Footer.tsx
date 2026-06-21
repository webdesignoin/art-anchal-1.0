/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from "react";
import { ViewState } from "../types";
import { ArrowRight, Instagram, Facebook, ShieldCheck, Gem, UserCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface FooterProps {
  setView: (view: ViewState) => void;
}

export default function Footer({ setView }: FooterProps) {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const navTo = (view: ViewState) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1C050E] text-[#F9F5F0] overflow-hidden relative" id="footer-container">
      {/* Decorative large background text */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] select-none flex justify-center">
        <h2 className="text-[15rem] leading-none font-serif text-brand-gold whitespace-nowrap">ART & ANCHAL</h2>
      </div>

      {/* ── Premium Newsletter & Story Section ─────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 border-b border-brand-gold/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Story & Promise */}
          <div className="space-y-8">
            <h3 className="serif-heading text-4xl sm:text-5xl lg:text-6xl font-light text-brand-ivory leading-tight">
              {language === "hi" ? (
                <>
                  रेशम राजवंश का <br />
                  <span className="italic text-brand-gold font-serif">संरक्षण।</span>
                </>
              ) : (
                <>
                  Preserving the <br />
                  <span className="italic text-brand-gold font-serif">Silk Dynasty.</span>
                </>
              )}
            </h3>
            <p className="text-sm sm:text-base text-brand-warm-gray leading-relaxed max-w-md font-light">
              {t("foot_desc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <Gem className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#C7B7AE] font-medium leading-relaxed">
                  {language === "hi" ? "प्रमाणित 24k सोना और चांदी ज़री" : "Certified 24k Gold & Silver Zari"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#C7B7AE] font-medium leading-relaxed">
                  {language === "hi" ? "75% सीधा कारीगर लाभ साझाकरण" : "75% Direct Artisan Profit Share"}
                </span>
              </div>
            </div>
          </div>

          {/* Oversized Newsletter Signup */}
          <div className="bg-brand-sand/5 border border-brand-gold/20 p-8 sm:p-12 backdrop-blur-sm rounded-sm">
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold mb-4">
              {language === "hi" ? "गिल्ड में शामिल हों" : "Join The Guild"}
            </h4>
            <p className="font-serif text-2xl text-brand-ivory mb-8">
              {language === "hi" 
                ? "निजी संग्रहों, करघा प्रेषणों और विशेष मास्टर बुनकर साक्षात्कारों तक पहुंच प्राप्त करें।" 
                : "Gain access to private collections, loom dispatches, and exclusive master weaver interviews."}
            </p>
            
            <form onSubmit={handleSubscribe} className="relative flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder={language === "hi" ? "अपना ईमेल पता दर्ज करें" : "Enter your email address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-b-2 border-brand-gold/30 text-[#F9F5F0] placeholder-[#7E726B] text-lg focus:outline-none focus:border-brand-gold transition-colors py-3"
                required
                id="newsletter-email-input"
              />
              <button 
                type="submit" 
                className={`flex items-center justify-center gap-2 px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
                  subscribed ? "bg-emerald-600 text-white" : "bg-brand-gold text-brand-maroon hover:bg-white"
                }`}
                id="newsletter-btn"
              >
                {subscribed ? (
                  <>{language === "hi" ? "शामिल हुए" : "Joined"}</>
                ) : (
                  <>{language === "hi" ? "सदस्यता लें" : "Subscribe"}</>
                )}
              </button>
            </form>
            <p className="text-[10px] text-[#7E726B] mt-6 font-mono tracking-wide">
              {language === "hi" ? "हम आपके इनबॉक्स का सम्मान करते हैं। किसी भी समय अनसब्सक्राइब करें।" : "We respect your inbox. Unsubscribe at any time."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Grid ───────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8">
        
        {/* Explore */}
        <div>
          <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-gold font-bold mb-6">
            {language === "hi" ? "एक्सप्लोर" : "Explore"}
          </h4>
          <ul className="space-y-4">
            {["home", "shop", "collections", "artisan-stories"].map((v) => {
              const navKeys: Record<string, string> = {
                "home": "nav_home",
                "shop": "nav_shop",
                "collections": "nav_collections",
                "artisan-stories": "nav_artisans"
              };
              return (
                <li key={v}>
                  <button
                    onClick={() => navTo(v as ViewState)}
                    className="text-xs text-[#C7B7AE] hover:text-[#F9F5F0] hover:translate-x-1 transition-all tracking-widest uppercase font-semibold cursor-pointer text-left"
                  >
                    {t(navKeys[v] || v)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-gold font-bold mb-6">
            {language === "hi" ? "ब्रांड के बारे में" : "About the Brand"}
          </h4>
          <ul className="space-y-4">
            {(language === "hi" 
              ? ["हमारी कहानी", "बुनाई की तकनीक", "तीन महिला संस्थापक"] 
              : ["Our Story", "Weaving Techniques", "Three Women Founders"]
            ).map((item) => (
              <li key={item}>
                <button 
                  onClick={() => navTo("about")} 
                  className="text-xs text-[#C7B7AE] hover:text-[#F9F5F0] hover:translate-x-1 transition-all tracking-widest uppercase font-semibold cursor-pointer text-left"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-gold font-bold mb-6">
            {language === "hi" ? "सहायता" : "Support"}
          </h4>
          <ul className="space-y-4">
            {(language === "hi"
              ? ["संपर्क करें", "शिपिंग और रिटर्न", "वर्चुअल सिटिंग"]
              : ["Contact Us", "Shipping & Returns", "Virtual Sittings"]
            ).map((item) => (
              <li key={item}>
                <button 
                  onClick={() => navTo("contact")} 
                  className="text-xs text-[#C7B7AE] hover:text-[#F9F5F0] hover:translate-x-1 transition-all tracking-widest uppercase font-semibold cursor-pointer text-left"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-gold font-bold mb-6">
            {language === "hi" ? "जुड़ें" : "Connect"}
          </h4>
          <div className="flex items-center gap-4 mb-8">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-brand-sand/10 hover:bg-brand-gold text-brand-gold hover:text-brand-maroon rounded-full transition-all duration-300">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-brand-sand/10 hover:bg-brand-gold text-brand-gold hover:text-brand-maroon rounded-full transition-all duration-300">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
          <address className="not-italic space-y-2">
            <span className="block text-xs text-[#C7B7AE] font-mono leading-relaxed">
              Vishwanath Gali, Kotwalipura,<br />
              Lahori Tola, Varanasi,<br />
              Uttar Pradesh 221001
            </span>
            <span className="block text-xs text-brand-gold font-mono tracking-tight">
              +91 75250 51124
            </span>
          </address>
        </div>

      </div>

      {/* ── Bottom Underbar ────────────────────────────────────────── */}
      <div className="border-t border-brand-gold/10 py-8 px-4 sm:px-6 lg:px-8 text-[#7E726B] text-[10px] tracking-[0.15em] uppercase font-bold relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <img src="/logo2.png" alt="Art & Anchal Logo" className="h-10 w-auto opacity-75" />
            <p>© {new Date().getFullYear()} {t("foot_rights")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            <a href="#" className="hover:text-brand-gold transition cursor-pointer">
              {language === "hi" ? "कारीगर सुरक्षा कोड" : "Security Code of Artisans"}
            </a>
            <a href="#" className="hover:text-brand-gold transition cursor-pointer">
              {language === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
            </a>
            <a href="#" className="hover:text-brand-gold transition cursor-pointer">
              {language === "hi" ? "सेवा की शर्तें" : "Terms of Service"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
