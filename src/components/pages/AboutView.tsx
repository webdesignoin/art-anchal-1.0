import React, { useEffect, useRef } from "react";
import { ViewState } from "../../types";
import { Helmet } from "react-helmet-async";
import { MapPin, Phone } from "lucide-react";

import kamlaDeviImg from '../../assets/images/about/kamla_devi.jpg';
import priyankaYadavImg from '../../assets/images/about/priyanka_yadav.jpg';
import vandanaYadavImg from '../../assets/images/about/vandana_yadav.jpg';
import placeholderWomenImg from '../../assets/images/about/placeholder_women.jpg';
import shoppingWomenImg from '../../assets/images/about/shopping_women.jpg';
import varanasiGhatsImg from '../../assets/images/about/varanasi ghats.jpg';

interface AboutViewProps {
  setView: (view: ViewState) => void;
}

export default function AboutView({ setView }: AboutViewProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-24');
        }
      });
    }, { threshold: 0.2 });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>About Art & Anchal – The Funky Genesis</title>
        <meta name="description" content="Discover the vibrant story behind Art & Anchal, founded by Kamla Devi, Priyanka Yadav, and Vandana Yadav." />
      </Helmet>

      {/* ── HERO SECTION (PARALLAX + GLASSMORPHISM) ───────────────────────── */}
      <section className="relative w-full h-[110vh] overflow-hidden flex items-center justify-center">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed transform scale-105"
          style={{ backgroundImage: `url("${varanasiGhatsImg}")` }}
        />
        {/* Funky Color Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B0E2D]/80 via-[#D4A373]/50 to-[#2A0815]/90 mix-blend-multiply" />
        
        {/* Floating Hero Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-20">
          <div className="md:col-span-7 space-y-6 transform -rotate-2">
            <h1 className="text-7xl sm:text-9xl font-serif font-black text-[#FDFBF7] leading-[0.8] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              THE <br/> <span className="text-[#E8C39E] italic font-light">GENESIS</span>
            </h1>
            <p className="text-xl text-[#FDFBF7] font-bold tracking-[0.3em] uppercase mix-blend-overlay">A Tale of Varanasi</p>
          </div>
          
          <div className="md:col-span-5 relative mt-10 md:mt-0">
            {/* Glassmorphic card skewed the opposite way */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl transform rotate-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:rotate-0 duration-500">
              <h2 className="text-2xl text-[#E8C39E] font-serif mb-4 font-bold">Defying the Arhatiyas</h2>
              <p className="text-[#FDFBF7] text-sm leading-relaxed text-justify mb-6">
                Art&Anchal was born in the bustling lanes of Pili Kothi. Confronted with the rise of industrial powerlooms and the degradation of pure zari, three women decided to flip the script. We bypassed the centuries‑old wholesale middleman chains, establishing a direct-to-consumer artisanal guild that returns power to the weavers.
              </p>
              <button 
                onClick={() => setView("shop")}
                className="w-full bg-[#E8C39E] text-[#2A0815] hover:bg-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-colors"
              >
                Explore The Collection
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE FOUNDERS (HORIZONTAL SCROLL ANIMATED) ────────────────────────────── */}
      <section className="bg-[#1C050E] py-32 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Header: The Visionaries */}
          <div className="text-center space-y-6 mb-24 z-10 animate-on-scroll opacity-0 translate-y-24 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <span className="inline-block py-2 px-4 border border-[#E8C39E] text-[#E8C39E] text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
              The Visionaries
            </span>
            <h2 className="text-5xl sm:text-7xl font-serif text-[#FDFBF7] leading-none">
              Meet the <span className="text-[#E8C39E] italic">Founders</span>
            </h2>
            <p className="text-[#A49387] text-lg max-w-2xl mx-auto leading-relaxed">
              Three forces of nature who wove their passion for Varanasi's heritage into a revolution for fair-trade luxury handlooms.
            </p>
          </div>

          {/* Horizontal Scrapbook Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 justify-items-center pb-10">
            
            {/* Founder 1 */}
            <div className="relative group animate-on-scroll opacity-0 translate-y-24 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[18rem] w-full">
              <div className="absolute inset-0 bg-[#5B0E2D] transform translate-x-3 translate-y-3 rounded-2xl transition-transform group-hover:translate-x-5 group-hover:translate-y-5" />
              <div className="relative bg-[#FDFBF7] p-3 pb-32 rounded-2xl shadow-2xl transform -rotate-2">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-200">
                  <img src={kamlaDeviImg} alt="Kamla Devi" className="w-full h-full object-cover filter contrast-125 saturate-50 transition-all duration-700 group-hover:saturate-100 group-hover:scale-105" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center space-y-2">
                  <div>
                    <h3 className="text-2xl font-serif text-[#2A0815] font-black">Kamla Devi</h3>
                    <p className="text-[#5B0E2D] font-bold uppercase tracking-widest text-[9px]">Co-Founder & Artisan Lead</p>
                  </div>
                  <p className="text-[#A49387] text-[10px] leading-snug italic font-serif px-2">
                    "Every thread we weave carries the whispers of our ancestors. We aren't just making sarees; we are keeping Varanasi's soul alive."
                  </p>
                </div>
              </div>
            </div>

            {/* Founder 2 */}
            <div className="relative group animate-on-scroll opacity-0 translate-y-24 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[18rem] w-full delay-100 mt-0 lg:mt-8">
              <div className="absolute inset-0 bg-[#E8C39E] transform -translate-x-3 translate-y-3 rounded-2xl transition-transform group-hover:-translate-x-5 group-hover:translate-y-5" />
              <div className="relative bg-[#FDFBF7] p-3 pb-32 rounded-2xl shadow-2xl transform rotate-3">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-200">
                  <img src={priyankaYadavImg} alt="Priyanka Yadav" className="w-full h-full object-cover filter contrast-125 saturate-50 transition-all duration-700 group-hover:saturate-100 group-hover:scale-105" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center space-y-2">
                  <div>
                    <h3 className="text-2xl font-serif text-[#2A0815] font-black">Priyanka Yadav</h3>
                    <p className="text-[#5B0E2D] font-bold uppercase tracking-widest text-[9px]">Co-Founder & Design Head</p>
                  </div>
                  <p className="text-[#A49387] text-[10px] leading-snug italic font-serif px-2">
                    "True luxury lies in authenticity. We take centuries-old motifs and breathe fresh, global elegance into them."
                  </p>
                </div>
              </div>
            </div>

            {/* Founder 3 */}
            <div className="relative group animate-on-scroll opacity-0 translate-y-24 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[18rem] w-full delay-200 mt-0 lg:mt-4">
              <div className="absolute inset-0 bg-[#5B0E2D] transform translate-x-3 -translate-y-3 rounded-2xl transition-transform group-hover:translate-x-5 group-hover:-translate-y-5" />
              <div className="relative bg-[#FDFBF7] p-3 pb-32 rounded-2xl shadow-2xl transform -rotate-1">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-200">
                  <img src={vandanaYadavImg} alt="Vandana Yadav" className="w-full h-full object-cover filter contrast-125 saturate-50 transition-all duration-700 group-hover:saturate-100 group-hover:scale-105" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center space-y-2">
                  <div>
                    <h3 className="text-2xl font-serif text-[#2A0815] font-black">Vandana Yadav</h3>
                    <p className="text-[#5B0E2D] font-bold uppercase tracking-widest text-[9px]">Co-Founder & Operations</p>
                  </div>
                  <p className="text-[#A49387] text-[10px] leading-snug italic font-serif px-2">
                    "Empowering our weavers isn't charity—it's justice. When you cut out the middlemen, art finally sustains the artist."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MISSION BREAK (EDGE TO EDGE DECORATIVE) ──────────────────────── */}
      <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
        <img 
          src={placeholderWomenImg} 
          alt="Weavers in action" 
          className="absolute inset-0 w-full h-full object-cover filter grayscale brightness-50"
        />
        <div className="relative z-10 p-8 max-w-4xl text-center mix-blend-difference">
          <h2 className="text-6xl sm:text-8xl font-serif text-white font-black leading-[0.8] mb-8">
            WE RETURN <span className="text-[#E8C39E]">75%</span> OF REVENUE TO THE <span className="italic font-light">WEAVERS</span>
          </h2>
          <p className="text-white text-xl sm:text-2xl uppercase tracking-[0.2em] font-bold">
            No Middlemen. Pure Zari. Pure Trust.
          </p>
        </div>
      </section>

      {/* ── VISIT US (FUNKY TICKET/POSTCARD LAYOUT) ──────────────────────── */}
      <section className="relative bg-[#FDFBF7] py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 shadow-[0_30px_60px_rgba(0,0,0,0.2)] rounded-3xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
          
          {/* Image Side */}
          <div className="relative h-96 md:h-auto">
            <img 
              src={shoppingWomenImg} 
              alt="Visit our shop" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Funky overlay to tie it to brand */}
            <div className="absolute inset-0 bg-[#E8C39E]/20 mix-blend-color-burn" />
          </div>

          {/* Details Side (The Ticket) */}
          <div className="bg-[#5B0E2D] p-12 sm:p-20 text-[#FDFBF7] flex flex-col justify-center relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute -top-24 -right-24 w-64 h-64 border-[40px] border-[#E8C39E]/10 rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 border-[40px] border-[#E8C39E]/10 rounded-full" />
            
            <div className="relative z-10 space-y-10">
              <div>
                <h3 className="text-5xl font-serif font-light mb-2">Visit Our <br/><span className="text-[#E8C39E] font-bold italic">Showroom</span></h3>
                <div className="w-16 h-1 bg-[#E8C39E]" />
              </div>

              <div className="space-y-6 text-lg">
                <div className="flex items-start gap-4">
                  <MapPin className="w-8 h-8 text-[#E8C39E] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold uppercase tracking-widest text-[#E8C39E] text-xs mb-1">Flagship Store</p>
                    <p className="font-serif leading-relaxed">
                      Vishwanath Gali, Kotwalipura,<br/>
                      Lahori Tola, Varanasi,<br/>
                      Uttar Pradesh 221001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-8 h-8 text-[#E8C39E] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold uppercase tracking-widest text-[#E8C39E] text-xs mb-1">Call Us</p>
                    <p className="font-serif text-2xl font-bold">+91 75250 51124</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setView("shop")}
                className="inline-block mt-4 border-2 border-[#E8C39E] text-[#E8C39E] hover:bg-[#E8C39E] hover:text-[#5B0E2D] font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-full transition-colors"
              >
                Shop Online
              </button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
