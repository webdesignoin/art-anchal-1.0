/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from "react";
import { ViewState } from "../../types";
import { FAQS } from "../../data/sarees";
import { Mail, Phone, MapPin, Calendar, Clock, HelpCircle, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ContactViewProps {
  userSession?: { id?: string; name: string; email: string } | null;
}

export default function ContactView({ userSession }: ContactViewProps) {
  const [formInp, setFormInp] = useState({ 
    name: userSession?.name || "", 
    email: userSession?.email || "", 
    phone: "", 
    sittingType: "bridal", 
    note: "" 
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formInp.name && formInp.email) {
      setErrorMsg("");
      try {
        const { error } = await supabase.from("leads").insert({
          profile_id: userSession?.id || null,
          name: formInp.name,
          email: formInp.email,
          phone: formInp.phone || null,
          sitting_type: formInp.sittingType,
          note: formInp.note || null,
          source: "online",
          status: "new"
        });

        if (error) {
          setErrorMsg(`Failed to save lead in guild ledger: ${error.message}`);
          return;
        }

        setSubmitted(true);
        setFormInp({ 
          name: userSession?.name || "", 
          email: userSession?.email || "", 
          phone: "", 
          sittingType: "bridal", 
          note: "" 
        });
        setTimeout(() => setSubmitted(false), 5000);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to schedule consultation.");
      }
    }
  };


  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="contact-view-container">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] tracking-[0.25em] uppercase text-brand-gold font-bold">A Sincere Consultation</span>
          <h1 className="serif-heading text-3xl sm:text-5.5xl text-brand-maroon font-serif font-light leading-tight">Private Inquiries & Sittings</h1>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto my-4"></div>
          <p className="text-xs sm:text-sm text-brand-warm-gray max-w-lg mx-auto leading-relaxed font-light">
            Whether choosing a bride’s main heirloom drape, planning trousseaus, or looking for certified silver Zaris, scheduling a sitting guarantees individual attention.
          </p>
        </div>

        {/* Dual Form/Info Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Block: Communication Coordinates & Google Map Sim */}
          <div className="lg:col-span-5 space-y-8 animate-fade-in text-brand-maroon">
            <h2 className="serif-heading text-2xl font-serif text-brand-maroon tracking-wide">Heritage Coordinates</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-1" />
                <div className="space-y-1 text-xs">
                  <strong className="block text-brand-maroon uppercase tracking-wide">The Varanasi Showrooms</strong>
                  <span className="text-brand-warm-gray block">Vishwanath Gali, Kotwalipura, Lahori Tola, Varanasi, Uttar Pradesh 221001</span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-brand-gold flex-shrink-0 mt-1" />
                <div className="space-y-1 text-xs">
                  <strong className="block text-brand-maroon uppercase tracking-wide">Direct Boutique Line</strong>
                  <span className="text-brand-warm-gray block font-mono underline">+91 75250 51124 (Direct & WhatsApp inquiries)</span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-brand-gold flex-shrink-0 mt-1" />
                <div className="space-y-1 text-xs">
                  <strong className="block text-brand-maroon uppercase tracking-wide">Electronic Dispatch Box</strong>
                  <span className="text-brand-gold underline block">artandanchal.heritage@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Simulated Map Visual */}
            <div className="relative aspect-16/9 bg-brand-sand border border-brand-gold/20 flex flex-col justify-end p-4 overflow-hidden">
              <div className="absolute inset-0 bg-[#EFECE6]/50 opacity-90">
                {/* Visual lines resembling Varanasi coordinates */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-brand-gold/15 rotate-12"></div>
                <div className="absolute top-1/3 left-0 w-full h-1 bg-brand-gold/10 -rotate-3"></div>
                <div className="absolute top-1/4 left-1/2 w-1 h-full bg-brand-gold/10"></div>
                <div className="absolute top-0 left-1/3 w-36 h-24 bg-brand-gold/5 rounded-full blur-md"></div>
              </div>
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-brand-maroon animate-ping absolute"></div>
                <div className="w-4 h-4 rounded-full bg-brand-maroon border-2 border-brand-ivory z-10"></div>
                <span className="bg-[#1C050E] text-brand-ivory text-[8px] uppercase tracking-widest font-mono mt-1 px-1.5 py-0.5 whitespace-nowrap shadow-md">
                  Art&Anchal Varanasi Guild
                </span>
              </div>
              <div className="relative z-10 text-[9px] text-brand-warm-gray uppercase tracking-widest bg-[#FDFBF7]/90 px-3 py-2 border border-brand-gold/15">
                Varanasi Heritage Coordinates • banks of River Ganga
              </div>
            </div>
          </div>

          {/* Right Block: Sittings scheduler Form */}
          <div className="lg:col-span-7 bg-[#FAF7F2] border border-brand-gold/25 p-8 sm:p-10">
            <h2 className="serif-heading text-2xl font-serif text-brand-maroon tracking-wider mb-2">Book Video Sittings</h2>
            <p className="text-xs text-brand-warm-gray leading-relaxed mb-6 font-light">
              Can’t visit Varanasi? Schedule a high-definition private video draping sitting. Our fabric curator will stream live drapes, zoom metal threads, and discuss custom fittings.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formInp.name}
                    onChange={(e) => setFormInp({ ...formInp, name: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-4 py-3 text-brand-maroon focus:outline-none focus:border-brand-maroon"
                    id="contact-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formInp.email}
                    onChange={(e) => setFormInp({ ...formInp, email: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-4 py-3 text-brand-maroon focus:outline-none focus:border-brand-maroon"
                    id="contact-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={formInp.phone}
                    onChange={(e) => setFormInp({ ...formInp, phone: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-4 py-3 text-brand-maroon focus:outline-none focus:border-brand-maroon"
                    id="contact-phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sitting-type" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Consultation Nature</label>
                  <select
                    value={formInp.sittingType}
                    onChange={(e) => setFormInp({ ...formInp, sittingType: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-4 py-3 text-brand-maroon focus:outline-none focus:border-brand-maroon"
                    id="sitting-type"
                  >
                    <option value="bridal">Main Bridal Trousseau Sitting</option>
                    <option value="heritage">Heritage Archival Collectors Consultation</option>
                    <option value="standard">Festive Wardrobe Styling Sitting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label htmlFor="contact-note" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Tell us about your occasion</label>
                <textarea
                  rows={4}
                  placeholder="Occasion date, color matching, weavers preferred, custom pleat requests..."
                  value={formInp.note}
                  onChange={(e) => setFormInp({ ...formInp, note: e.target.value })}
                  className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-4 py-3 text-brand-maroon focus:outline-none focus:border-brand-maroon resize-none"
                  id="contact-note"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-maroon hover:bg-brand-maroon/95 text-brand-ivory text-xs uppercase tracking-widest font-sans font-bold py-4 transition duration-300 shadow-md cursor-pointer"
                id="contact-submit-btn"
              >
                Schedule Video Drape sitting
              </button>

              {submitted && (
                <div className="bg-[#E7F3EC] border border-[#2E7D32]/25 p-4 rounded-none text-center">
                  <span className="text-[#2E7D32] block font-semibold">Video sit schedule requested successfully!</span>
                  <span className="text-brand-warm-gray text-[11px] block mt-0.5">
                    Our textiles curator will coordinate times via WhatsApp/Email within 12 business hours.
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-[#FBEBEB] border border-[#B64545]/25 p-4 rounded-none text-center">
                  <span className="text-[#B64545] block font-semibold">{errorMsg}</span>
                </div>
              )}
            </form>

          </div>

        </div>

        {/* Accordion FAQ section */}
        <div className="border-t border-brand-gold/20 pt-16 max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-brand-gold font-bold">Client Support Desk</span>
            <h3 className="serif-heading text-2xl sm:text-3.5xl text-brand-maroon font-serif text-center">Frequently Answered Queries</h3>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-brand-gold/20 bg-[#FAF7F2] p-5 cursor-pointer select-none transition"
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-semibold text-brand-maroon">{faq.question}</h4>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-brand-gold-dark" /> : <ChevronRight className="w-4 h-4 text-brand-gold" />}
                  </div>
                  {isOpen && (
                    <p className="mt-3 text-xs text-brand-warm-gray leading-relaxed text-left animate-fade-in font-sans">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
