const fs = require('fs');
let content = fs.readFileSync('src/components/pages/AdminConsoleView.tsx', 'utf8');

// 1. Add import
content = content.replace(
  'import AdminVendorsTab from "./AdminVendorsTab";',
  'import AdminVendorsTab from "./AdminVendorsTab";\nimport InvoiceDocument, { InvoiceData } from "../InvoiceDocument";'
);

// 2. Add handleViewInvoice
content = content.replace(
  'const handleUpdateOrderStatus = async (e: React.FormEvent) => {',
  `const handleViewInvoice = async (order: any) => {
    setLoading(true);
    try {
      const { data: items } = await supabase.from("order_items").select("*, saree:sarees(*)").eq("order_id", order.id);
      setActiveInvoice({
        invoice_number: order.invoice_number || order.id?.slice(0, 8),
        created_at: order.created_at,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone || undefined,
        customer_email: order.customer_email || undefined,
        is_offline: order.is_offline,
        items: items || [],
        subtotal: order.subtotal || 0,
        discount: order.discount || 0,
        tax: order.tax || 0,
        total: order.total || 0,
        payment_mode: order.payment_mode || "online",
        notes: order.notes,
      });
    } catch (err: any) {
      alert(\`Error loading invoice: \${err.message}\`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {`
);

// 3. Update POS Checkout activeInvoice
content = content.replace(
  /setActiveInvoice\(\{[\s\S]*?payment_mode: posPaymentMethod,\n      \}\);/,
  `setActiveInvoice({
        invoice_number: freshOrder?.invoice_number || \`INV-\${Date.now()}\`,
        created_at: freshOrder?.created_at,
        customer_name: profile.name,
        customer_phone: profile.phone || undefined,
        customer_email: profile.email || undefined,
        is_offline: true,
        items: posCart,
        subtotal: posSubtotal,
        discount: posDiscountAmt,
        tax: posTaxAmt,
        total: posTotal,
        payment_mode: posPaymentMethod,
        notes: posNotes || undefined,
      });`
);

// 4. Wrap main content with activeInvoice check
content = content.replace(
  /<div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">/,
  `<div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {activeInvoice ? (
            <InvoiceDocument invoice={activeInvoice} onBack={() => setActiveInvoice(null)} />
          ) : (
            <>`
);

// We need to close the `) : ( <>` at the very end of the tabs before the Saree modal.
// The Saree modal starts at `{/* ══ MODAL: ADD/EDIT SAREE`
content = content.replace(
  /          \{\/\* ══ MODAL: ADD\/EDIT SAREE/,
  `            </>
          )}

          {/* ══ MODAL: ADD/EDIT SAREE`
);

// 5. Remove the old Invoice Print View section
// It starts at `{/* ══ INVOICE PRINT VIEW ════════════════════════════════════════ */}`
// and ends right before `{/* ══ ORDERS TAB`
const oldInvoiceRegex = /\{\/\* ══ INVOICE PRINT VIEW ════════════════════════════════════════ \*\/\}[\s\S]*?\{\/\* ══ ORDERS TAB ════════════════════════════════════════════════ \*\/\}/;
content = content.replace(oldInvoiceRegex, '{/* ══ ORDERS TAB ════════════════════════════════════════════════ */}');

// 6. Add "View Bill" button in Desktop Orders table
content = content.replace(
  /className="text-\[10px\] uppercase font-bold tracking-widest text-brand-maroon hover:text-brand-gold transition"\n\s*>\n\s*Update\n\s*<\/button>\n\s*<\/td>/g,
  `className="text-[10px] uppercase font-bold tracking-widest text-brand-maroon hover:text-brand-gold transition"
                              >
                                Update
                              </button>
                              <button 
                                onClick={() => handleViewInvoice(o)}
                                className="text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-maroon transition ml-3"
                              >
                                View Bill
                              </button>
                            </td>`
);

// 7. Add "View Bill" button in Mobile Orders table
content = content.replace(
  /className="text-brand-maroon font-bold uppercase hover:text-brand-gold transition"\n\s*>\n\s*Update\n\s*<\/button>\n\s*<\/div>/g,
  `className="text-brand-maroon font-bold uppercase hover:text-brand-gold transition"
                            >
                              Update
                            </button>
                            <button 
                              onClick={() => handleViewInvoice(o)}
                              className="text-brand-gold font-bold uppercase hover:text-brand-maroon transition ml-1"
                            >
                              View Bill
                            </button>
                          </div>`
);

fs.writeFileSync('src/components/pages/AdminConsoleView.tsx', content);
