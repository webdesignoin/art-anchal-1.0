import React, { useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { Users, Package, DollarSign, ChevronDown, ChevronUp, CreditCard, CheckCircle } from "lucide-react";

export default function AdminVendorsTab({ dbPurchases, dbDues, dbDuePayments = [], fetchAllData }: { dbPurchases: any[], dbDues: any[], dbDuePayments: any[], fetchAllData: () => void }) {
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] });

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

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
    
    const totalOwed = vDues.reduce((acc, d) => acc + (Number(d.total_amount) - Number(d.amount_paid)), 0);
    const totalPaid = totalPurchased - totalOwed;

    const vendorDueIds = new Set(vDues.map(d => d.id));
    const vPayments = dbDuePayments.filter(dp => vendorDueIds.has(dp.due_id));

    return {
      name,
      totalPurchased,
      totalPaid,
      totalOwed,
      purchases: vPurchases,
      dues: vDues,
      payments: vPayments
    };
  }).sort((a, b) => b.totalOwed - a.totalOwed);

  const grandTotalOwed = vendors.reduce((acc, v) => acc + v.totalOwed, 0);

  const handleMakePayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDue || !paymentForm.amount_paid) return;

    try {
      // 1. Insert Payment Record
      const { error: paymentError } = await supabase.from("due_payments").insert({
        due_id: selectedDue.id,
        amount_paid: paymentForm.amount_paid,
        payment_date: paymentForm.payment_date
      });
      if (paymentError) throw paymentError;

      // 2. Update Due Record
      const newAmountPaid = Number(selectedDue.amount_paid || 0) + Number(paymentForm.amount_paid);
      const newStatus = newAmountPaid >= selectedDue.total_amount ? 'cleared' : 'pending';
      
      const { error: dueError } = await supabase.from("dues").update({
        amount_paid: newAmountPaid,
        status: newStatus
      }).eq("id", selectedDue.id);
      if (dueError) throw dueError;

      // 3. If linked to a purchase, update purchase record
      if (selectedDue.linked_purchase_id) {
        const { error: purchaseError } = await supabase.from("purchases").update({
          amount_paid: newAmountPaid,
          status: newStatus === 'cleared' ? 'paid' : 'partially_paid'
        }).eq("id", selectedDue.linked_purchase_id);
        if (purchaseError) throw purchaseError;
      }

      setIsPaymentModalOpen(false);
      setSelectedDue(null);
      setPaymentForm({ amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] });
      fetchAllData();
      showFeedback(`Payment of ₹${paymentForm.amount_paid} logged and ledger updated.`);
    } catch (err: any) {
      alert(`Error logging payment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in print:hidden">
      {feedback && (
        <div className="fixed top-5 right-5 z-50 bg-[#1C050E] text-brand-ivory text-xs px-5 py-3.5 border border-brand-gold/30 flex items-center gap-2 shadow-2xl rounded-lg animate-fade-in">
          <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
          {feedback}
        </div>
      )}

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
                <div className="border-t border-brand-gold/15 bg-[#FAF7F2] p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                  
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
                              <span>{p.items_description} {p.quantity && <span className="text-[10px] text-brand-warm-gray font-normal bg-brand-gold/10 text-brand-gold-dark px-1.5 py-0.5 rounded font-mono">Qty: {p.quantity}</span>}</span>
                              <span className="font-mono">₹{Number(p.total_amount).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between mt-1 items-center">
                              <span className="text-[10px] text-brand-warm-gray">{p.date}</span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : p.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                {p.status ? p.status.replace('_', ' ') : 'unpaid'}
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
                              <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-gold/10">
                                <span className="text-[9px] uppercase font-bold text-brand-warm-gray">{d.due_date ? `Due: ${d.due_date}` : ""}</span>
                                {d.status === "pending" ? (
                                  <button onClick={() => { setSelectedDue(d); setIsPaymentModalOpen(true); }} className="flex items-center gap-1 text-[9px] uppercase font-bold bg-brand-gold/20 text-brand-gold-dark px-2 py-1 rounded hover:bg-brand-gold hover:text-[#1C050E] transition">
                                    <CreditCard className="w-3 h-3" /> Pay Part
                                  </button>
                                ) : (
                                  <span className="text-[9px] uppercase font-bold text-emerald-600 border border-emerald-200 px-2 py-1 rounded">Cleared ✓</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h4 className="text-xs uppercase font-bold text-brand-maroon mb-3 flex items-center gap-2">
                      <CreditCard className="w-3 h-3 text-emerald-700" /> Payment History (Paid Out)
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {vendor.payments.length === 0 ? <p className="text-[10px] italic text-brand-warm-gray">No payments recorded.</p> :
                        vendor.payments.map(p => (
                          <div key={p.id} className="bg-white p-3 rounded border border-brand-gold/10 text-xs shadow-sm flex justify-between items-center">
                            <div>
                              <p className="font-bold text-emerald-700">₹{Number(p.amount_paid).toLocaleString("en-IN")}</p>
                              <p className="text-[10px] text-brand-warm-gray">{p.payment_date}</p>
                            </div>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              Paid
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- PAYMENT MODAL --- */}
      {isPaymentModalOpen && selectedDue && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] max-w-sm w-full border border-brand-gold/30 rounded-lg p-6 shadow-2xl">
            <h3 className="font-serif text-xl text-brand-maroon mb-2">Log Vendor Payment</h3>
            <p className="text-xs text-brand-warm-gray mb-4">
              Paying supplier/entity: <span className="font-bold text-brand-maroon">{selectedDue.entity_name}</span>
            </p>
            <div className="bg-white border border-brand-gold/15 p-3 rounded mb-4 text-xs font-mono">
              <div className="flex justify-between"><span>Total due:</span> <span>₹{selectedDue.total_amount}</span></div>
              <div className="flex justify-between"><span>Paid so far:</span> <span>₹{selectedDue.amount_paid}</span></div>
              <div className="flex justify-between font-bold text-red-600 border-t pt-1 mt-1"><span>Remaining:</span> <span>₹{selectedDue.total_amount - selectedDue.amount_paid}</span></div>
            </div>
            
            <form onSubmit={handleMakePayment} className="space-y-3">
              <input type="date" required value={paymentForm.payment_date} onChange={e => setPaymentForm({...paymentForm, payment_date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="number" min="1" max={selectedDue.total_amount - selectedDue.amount_paid} required placeholder="Amount to Pay (₹)" value={paymentForm.amount_paid || ""} onChange={e => setPaymentForm({...paymentForm, amount_paid: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setIsPaymentModalOpen(false); setSelectedDue(null); }} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs uppercase font-bold px-4 py-2 hover:bg-emerald-700">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
