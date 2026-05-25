const fs = require('fs');
let content = fs.readFileSync('src/components/pages/UserProfileView.tsx', 'utf8');

// 1. Add import
content = content.replace(
  'import { supabase } from "../../lib/supabase";',
  'import { supabase } from "../../lib/supabase";\nimport InvoiceDocument, { InvoiceData } from "../InvoiceDocument";'
);

// 2. Add state
content = content.replace(
  'const [activeTab, setActiveTab] = useState<TabType>("profile");',
  `const [activeTab, setActiveTab] = useState<TabType>("profile");\n  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);`
);

// 3. Add handleViewInvoice function
content = content.replace(
  'const handleUpdateProfile = async (e: React.FormEvent) => {',
  `const handleViewInvoice = (order: any) => {
    setActiveInvoice({
      invoice_number: order.invoice_number || order.id?.slice(0, 8),
      created_at: order.created_at,
      customer_name: order.customer_name || profile.name || "Customer",
      customer_phone: order.customer_phone || profile.phone || undefined,
      customer_email: order.customer_email || profile.email || undefined,
      is_offline: order.is_offline,
      items: order.items || [],
      subtotal: order.subtotal || 0,
      discount: order.discount || 0,
      tax: order.tax || 0,
      total: order.total || order.total_amount || 0,
      payment_mode: order.payment_mode || "online",
      notes: order.notes,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {`
);

// 4. Wrap "Orders" tab content to conditionally render InvoiceDocument
content = content.replace(
  /<div className="space-y-6 animate-fade-in">/,
  `{activeInvoice ? (
            <div className="animate-fade-in">
              <InvoiceDocument invoice={activeInvoice} onBack={() => setActiveInvoice(null)} />
            </div>
          ) : (
          <div className="space-y-6 animate-fade-in">`
);

// Need to close `) : (` for the orders tab wrapping. 
// It ends where the "Orders" tab ends.
// We can find `{activeTab === "addresses"` which is right after the orders tab ends.
// So we insert `)}` right before `{activeTab === "addresses"`
content = content.replace(
  /          \{\/\* ══ ADDRESSES TAB ════════════════════════════════════════ \*\/}/,
  `          )}

          {/* ══ ADDRESSES TAB ════════════════════════════════════════ */}`
);

// 5. Add onClick to View Invoice button
content = content.replace(
  /<button className="text-\[10px\] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-maroon flex items-center gap-1 transition-colors">/g,
  `<button onClick={() => handleViewInvoice(order)} className="text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-maroon flex items-center gap-1 transition-colors">`
);

fs.writeFileSync('src/components/pages/UserProfileView.tsx', content);
