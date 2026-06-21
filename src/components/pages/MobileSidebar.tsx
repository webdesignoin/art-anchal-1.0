import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navSections: NavSection[];
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  navSections,
}) => {
  const { language } = useLanguage();

  const tAdmin = (key: string): string => {
    if (language === 'hi') {
      const trans: Record<string, string> = {
        'Admin Console': 'एडमिन कंट्रोल पैनल',
        'Management Menu': 'प्रबंधन मेनू',
        'Overview': 'व्यापार सारांश',
        'Catalog': 'स्टॉक कैटलॉग',
        'POS Bill': 'बिल बनाएं (POS)',
        'Orders': 'ऑर्डर्स बही',
        'CRM Leads': 'ग्राहक पूछताछ',
        'HR & Staffing': 'कर्मचारी प्रबंधन',
        'Finance': 'वित्त लेजर',
        'Vendors': 'सप्लायर बही',
      };
      return trans[key] ?? key;
    }
    return key;
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-[48] lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#1C050E] text-[#F9F5F0] transform transition-transform duration-300 ease-in-out z-[49] lg:hidden flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-[8px] tracking-[0.25em] uppercase text-brand-gold font-bold">Art &amp; Anchal</p>
            <h2 className="font-serif text-base font-light text-white">{tAdmin('Admin Console')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 active:scale-95 transition text-white/60 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-4 text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map(({ id, label, icon: Icon, badge }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveTab(id);
                        onClose();
                      }}
                      className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all text-sm ${
                        active
                          ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/20'
                          : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="flex-1 text-left text-xs font-medium">{label}</span>
                      {badge && (
                        <span className="ml-2 text-[9px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.5 rounded-full font-bold">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default MobileSidebar;
