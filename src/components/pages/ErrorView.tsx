import React from 'react';
import { ViewState } from '../../types';
import { ArrowLeft, ShieldAlert, AlertCircle } from 'lucide-react';

interface ErrorViewProps {
  type: "404" | "403" | "generic";
  setView: (view: ViewState) => void;
  message?: string;
  subtext?: string;
}

export default function ErrorView({ type, setView, message, subtext }: ErrorViewProps) {
  let defaultTitle = "";
  let defaultSubtext = "";
  let Icon = AlertCircle;
  let actionText = "Return to Homepage";
  let actionView: ViewState = "home";

  if (type === "404") {
    defaultTitle = "Page Not Found";
    defaultSubtext = "The masterpiece you are looking for may have been moved or does not exist.";
    Icon = AlertCircle;
    actionText = "Browse Collections";
    actionView = "shop";
  } else if (type === "403") {
    defaultTitle = "Access Restricted";
    defaultSubtext = "You do not have the weaver's permission to view this exclusive section.";
    Icon = ShieldAlert;
  } else {
    defaultTitle = "Something Went Wrong";
    defaultSubtext = "Our threads got tangled. We are working to resolve this issue.";
  }

  const finalTitle = message || defaultTitle;
  const finalSubtext = subtext || defaultSubtext;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center animate-pulse-slow">
        <h1 className="font-serif text-[15rem] sm:text-[20rem] font-bold text-brand-maroon whitespace-nowrap">
          {type === "generic" ? "Error" : type}
        </h1>
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8 animate-slide-in-up">
        {/* Floating Icon */}
        <div className="flex justify-center animate-float">
          <div className="w-24 h-24 rounded-full border border-brand-gold/30 flex items-center justify-center bg-brand-ivory/50 backdrop-blur-sm shadow-[0_0_40px_rgba(197,168,128,0.15)]">
            <Icon className="w-10 h-10 text-brand-gold" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-maroon font-light tracking-wide">
            {finalTitle}
          </h2>
          <div className="w-12 h-px bg-brand-gold mx-auto"></div>
          <p className="text-brand-warm-gray text-sm leading-relaxed max-w-xs mx-auto">
            {finalSubtext}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => setView(actionView)}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 border border-brand-gold text-brand-maroon overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,168,128,0.2)]"
          >
            <span className="absolute inset-0 bg-brand-gold w-0 transition-all duration-300 ease-out group-hover:w-full"></span>
            <span className="relative flex items-center gap-2 text-xs uppercase tracking-widest font-bold group-hover:text-brand-ivory transition-colors duration-300">
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              {actionText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
