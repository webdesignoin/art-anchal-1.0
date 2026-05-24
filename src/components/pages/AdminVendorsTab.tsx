import React, { useState } from "react";
import { Users, Package, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminVendorsTab({ dbPurchases, dbDues }: { dbPurchases: any[], dbDues: any[] }) {
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  // 1. Extract unique vendor names
  const vendorNames = new Set<string>();
  dbPurchases.forEach(p => { if (p.vendor_name) vendorNames.add(p.vendor_name); });
  dbDues.forEach(d => { if (d.entity_name && d.due_type === 'payable') vendorNames.add(d.entity_name); });

  // 2. Build vendor ledger data
  const vendors = Array.from(vendorNames).map(name => {
    const vPurchases = dbPurchases.filter(p => p.vendor_name === name);
    const vDues = dbDues.filter(d => d.entity_name === name && d.due_type === 'payable');
    
    const totalPurchased = vPurchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0) 
                         + vDues.reduce((acc, d) => !d.linked_purchase_id ? acc + Number(d.total_amount || 0) : acc, 0);
    
    // We calculate total balance owed. Dues hold the current balance for part-payments.
    // If a purchase has an unlinked balance, we add it. 
    // Wait, all partial purchases auto-create a due. So dues are the ultimate source of truth for owed money.
    // Let's sum balance_due from vDues.
    const totalOwed = vDues.reduce((acc, d) => acc + (Number(d.total_amount) - Number(d.amount_paid)), 0);
    
    const totalPaid = totalPurchased - totalOwed;

    return {
      name,
      totalPurchased,
      totalPaid,
      totalOwed,
      purchases: vPurchases,
      dues: vDues
    };
  }).sort((a, b) => b.totalOwed - a.totalOwed);

  const grandTotalOwed = vendors.reduce((acc, v) => acc + v.totalOwed, 0);

  return (
    <div className="space-y-6 animate-fade-in print:hidden">
      <div>
        <h2 className="font-serif text-2xl text-brand-maroon font-light">Vendor Directory & Ledger</h2>
        <p className="text-xs text-brand-warm-gray mt-0.5">Track transaction history and outstanding balances for all suppliers</p>
      </div>

      {/* KPI Card */}
      <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 max-w-sm flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] uppercase font-bold text-brand-warm-gray">Total Outstanding Debt</p>
          <p className="font-serif text-3xl text-red-700 font-bold mt-1">₹{grandTotalOwed.toLocaleString("en-IN")}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-red-700" />
        </div>
      </div>

      <div className="space-y-4">
        {vendors.length === 0 ? (
          <div className="text-center py-16 text-brand-warm-gray text-sm italic">
            No vendors found. Add purchases or dues in the Finance tab.
          </div>
        ) : (
          vendors.map(vendor => (
            <div key={vendor.name} className="bg-white border border-brand-gold/20 rounded-lg shadow-sm overflow-hidden transition-all">
              {/* Header */}
              <div 
                className="p-5 flex flex-wrap gap-4 items-center justify-between cursor-pointer hover:bg-brand-sand/30"
                onClick={() => setExpandedVendor(expandedVendor === vendor.name ? null : vendor.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-gold-dark" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-maroon">{vendor.name}</h3>
                    <p className="text-[10px] uppercase font-bold text-brand-warm-gray tracking-wider">
                      {vendor.purchases.length} Purchases • {vendor.dues.length} Ledger Entries
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] uppercase text-brand-warm-gray font-bold">Total Biz Value</p>
                    <p className="font-mono text-sm text-brand-maroon">₹{vendor.totalPurchased.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] uppercase text-emerald-700 font-bold">Total Paid</p>
                    <p className="font-mono text-sm text-emerald-700">₹{vendor.totalPaid.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-red-700 font-bold">Currently Owe</p>
                    <p className="font-mono text-base font-bold text-red-700">₹{vendor.totalOwed.toLocaleString("en-IN")}</p>
                  </div>
                  {expandedVendor === vendor.name ? <ChevronUp className="w-5 h-5 text-brand-warm-gray" /> : <ChevronDown className="w-5 h-5 text-brand-warm-gray" />}
                </div>
              </div>

              {/* Expanded Body */}
              {expandedVendor === vendor.name && (
                <div className="border-t border-brand-gold/15 bg-[#FAF7F2] p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                  
                  {/* Purchases History */}
                  <div>
                    <h4 className="text-xs uppercase font-bold text-brand-maroon mb-3 flex items-center gap-2">
                      <Package className="w-3 h-3" /> Purchase History
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {vendor.purchases.length === 0 ? <p className="text-[10px] italic text-brand-warm-gray">No direct purchases logged.</p> :
                        vendor.purchases.map(p => (
                          <div key={p.id} className="bg-white p-3 rounded border border-brand-gold/10 text-xs shadow-sm">
                            <div className="flex justify-between font-bold">
                              <span>{p.items_description}</span>
                              <span className="font-mono">₹{Number(p.total_amount).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between mt-1 items-center">
                              <span className="text-[10px] text-brand-warm-gray">{p.date}</span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : p.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                {p.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Ledger / Dues History */}
                  <div>
                    <h4 className="text-xs uppercase font-bold text-brand-maroon mb-3 flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Ledger & Payables
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {vendor.dues.length === 0 ? <p className="text-[10px] italic text-brand-warm-gray">No ledger entries.</p> :
                        vendor.dues.map(d => {
                          const bal = Number(d.total_amount) - Number(d.amount_paid);
                          return (
                            <div key={d.id} className={`p-3 rounded border border-brand-gold/10 text-xs shadow-sm ${d.status === 'cleared' ? 'bg-gray-50 opacity-70' : 'bg-white'}`}>
                              <div className="flex justify-between font-bold">
                                <span>Ledger Entry</span>
                                <span className="font-mono text-red-600">Owe: ₹{bal.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex justify-between mt-1 text-[10px] text-brand-warm-gray">
                                <span>Total: ₹{Number(d.total_amount).toLocaleString("en-IN")}</span>
                                <span>Paid: ₹{Number(d.amount_paid).toLocaleString("en-IN")}</span>
                              </div>
                              <div className="mt-2 text-right">
                                {d.status === 'cleared' ? (
                                  <span className="text-[9px] uppercase font-bold text-emerald-600">Cleared ✓</span>
                                ) : (
                                  <span className="text-[9px] uppercase font-bold text-amber-600">Pending</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
