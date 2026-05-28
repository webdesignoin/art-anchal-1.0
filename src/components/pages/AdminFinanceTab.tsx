import React, { useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle, TrendingUp, TrendingDown, DollarSign, Plus, Package, FileText, CreditCard } from "lucide-react";

export default function AdminFinanceTab({ dbExpenses, dbPurchases, dbDues, dbOrders, dbEmployees = [], dbDuePayments = [], fetchAllData }: { dbExpenses: any[], dbPurchases: any[], dbDues: any[], dbOrders: any[], dbEmployees: any[], dbDuePayments: any[], fetchAllData: () => void }) {
  const [feedback, setFeedback] = useState("");
  
  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Forms
  const [expenseForm, setExpenseForm] = useState({ category: "Operational", amount: 0, description: "", date: new Date().toISOString().split('T')[0] });
  const [purchaseForm, setPurchaseForm] = useState({ vendor_name: "", items_description: "", total_amount: 0, amount_paid: 0, quantity: 1, date: new Date().toISOString().split('T')[0] });
  const [dueForm, setDueForm] = useState({ entity_name: "", due_type: "payable", total_amount: 0, amount_paid: 0, due_date: "" });
  
  // Search dropdown states
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Salary employee selection state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // Payment Form
  const [selectedDue, setSelectedDue] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] });

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    const emp = dbEmployees.find(e => e.id === employeeId);
    if (emp) {
      setExpenseForm(prev => ({
        ...prev,
        amount: Number(emp.base_salary),
        description: `Monthly salary payout for ${emp.name} (${emp.role})`
      }));
    }
  };

  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) return;
    const { error } = await supabase.from("expenses").insert({
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      description: expenseForm.description,
      date: expenseForm.date
    });
    if (error) { alert(error.message); return; }
    setIsExpenseModalOpen(false);
    setExpenseForm({ category: "Operational", amount: 0, description: "", date: new Date().toISOString().split('T')[0] });
    setSelectedEmployeeId("");
    fetchAllData();
    showFeedback("Expense logged successfully.");
  };

  const handleAddPurchase = async (e: FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.total_amount || !purchaseForm.vendor_name) return;
    
    const isPartial = purchaseForm.amount_paid < purchaseForm.total_amount;
    const status = purchaseForm.amount_paid === 0 ? 'unpaid' : isPartial ? 'partially_paid' : 'paid';

    // 1. Insert Purchase
    const { data: purchaseData, error: purchaseError } = await supabase.from("purchases").insert({
      vendor_name: purchaseForm.vendor_name,
      items_description: purchaseForm.items_description,
      amount: Number(purchaseForm.total_amount),
      total_amount: purchaseForm.total_amount,
      amount_paid: purchaseForm.amount_paid,
      quantity: Number(purchaseForm.quantity || 1),
      status: status,
      date: purchaseForm.date
    }).select().single();

    if (purchaseError) { alert(purchaseError.message); return; }

    // 2. Automatically generate a "Due" ledger record
    const dueStatus = purchaseForm.amount_paid >= purchaseForm.total_amount ? 'cleared' : 'pending';
    const { data: dueData, error: dueError } = await supabase.from("dues").insert({
      entity_name: purchaseForm.vendor_name,
      due_type: 'payable',
      amount: Number(purchaseForm.total_amount),
      total_amount: purchaseForm.total_amount,
      amount_paid: purchaseForm.amount_paid,
      status: dueStatus,
      linked_purchase_id: purchaseData.id
    }).select().single();

    if (dueError) {
      alert(`Error auto-creating ledger entry: ${dueError.message}`);
      return;
    }

    // 3. Log initial payment in payment history if amount_paid > 0
    if (purchaseForm.amount_paid > 0 && dueData) {
      const { error: paymentError } = await supabase.from("due_payments").insert({
        due_id: dueData.id,
        amount_paid: purchaseForm.amount_paid,
        payment_date: purchaseForm.date
      });
      if (paymentError) {
        console.error("Error logging initial payment:", paymentError.message);
      }
    }

    setIsPurchaseModalOpen(false);
    setPurchaseForm({ vendor_name: "", items_description: "", total_amount: 0, amount_paid: 0, quantity: 1, date: new Date().toISOString().split('T')[0] });
    fetchAllData();
    showFeedback("Purchase logged & synced to Ledger.");
  };

  const handleAddDue = async (e: FormEvent) => {
    e.preventDefault();
    if (!dueForm.total_amount || !dueForm.entity_name) return;
    const status = dueForm.amount_paid >= dueForm.total_amount ? 'cleared' : 'pending';
    const { error } = await supabase.from("dues").insert({
      ...dueForm,
      amount: Number(dueForm.total_amount),
      status: status,
      due_date: dueForm.due_date || null
    });
    if (error) { alert(error.message); return; }
    setIsDueModalOpen(false);
    setDueForm({ entity_name: "", due_type: "payable", total_amount: 0, amount_paid: 0, due_date: "" });
    fetchAllData();
    showFeedback("Due entry added.");
  };

  const handleMakePayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDue || !paymentForm.amount_paid) return;

    // 1. Insert Payment Record
    const { error: paymentError } = await supabase.from("due_payments").insert({
      due_id: selectedDue.id,
      amount_paid: paymentForm.amount_paid,
      payment_date: paymentForm.payment_date
    });
    if (paymentError) { alert(paymentError.message); return; }

    // 2. Update Due Record
    const newAmountPaid = Number(selectedDue.amount_paid || 0) + Number(paymentForm.amount_paid);
    const newStatus = newAmountPaid >= selectedDue.total_amount ? 'cleared' : 'pending';
    
    await supabase.from("dues").update({
      amount_paid: newAmountPaid,
      status: newStatus
    }).eq("id", selectedDue.id);

    // 3. If linked to a purchase, update purchase record
    if (selectedDue.linked_purchase_id) {
      await supabase.from("purchases").update({
        amount_paid: newAmountPaid,
        status: newStatus === 'cleared' ? 'paid' : 'partially_paid'
      }).eq("id", selectedDue.linked_purchase_id);
    }

    setIsPaymentModalOpen(false);
    setSelectedDue(null);
    setPaymentForm({ amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] });
    fetchAllData();
    showFeedback(`Payment of ₹${paymentForm.amount_paid} logged.`);
  };

  // Calculations (Accrual vs Cash Flow)
  const totalRevenue = dbOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalExpenses = dbExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const totalPurchasesAccrual = dbPurchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
  const cashOutflowPurchases = dbPurchases.reduce((acc, p) => acc + Number(p.amount_paid || 0), 0);
  
  const netProfit = totalRevenue - totalExpenses - totalPurchasesAccrual;

  // Breakdown of expenses
  const expenseBreakdown = dbExpenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in print:hidden">
      {feedback && (
        <div className="fixed top-5 right-5 z-50 bg-[#1C050E] text-brand-ivory text-xs px-5 py-3.5 border border-brand-gold/30 flex items-center gap-2 shadow-2xl rounded-lg animate-fade-in">
          <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
          {feedback}
        </div>
      )}

      <div>
        <h2 className="font-serif text-2xl text-brand-maroon font-light">Finance & Ledger</h2>
        <p className="text-xs text-brand-warm-gray mt-0.5">Track profitability, part-payments, and categorized spending</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: totalRevenue, icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Purchases (Asset Val)", value: totalPurchasesAccrual, icon: Package, color: "text-amber-700", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Other Expenses", value: totalExpenses, icon: TrendingDown, color: "text-red-700", bg: "bg-red-500/10 border-red-500/20" },
          { label: "Net Profit (Accrual)", value: netProfit, icon: DollarSign, color: netProfit >= 0 ? "text-emerald-700" : "text-red-700", bg: netProfit >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-widest text-brand-warm-gray font-bold font-sans">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-full ${kpi.bg} border flex items-center justify-center transition-transform group-hover:scale-110`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className={`font-serif text-2xl font-bold mt-2 ${kpi.color}`}>
              {kpi.value < 0 ? "-" : ""}₹{Math.abs(kpi.value).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      {/* Expense Categories Breakdown */}
      <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg p-5">
        <h3 className="font-serif text-sm font-semibold mb-3">Categorized Spending</h3>
        <div className="flex flex-wrap gap-4">
          <div className="border-l-2 border-brand-maroon pl-3">
            <p className="text-[9px] uppercase text-brand-warm-gray font-bold">Inventory Paid</p>
            <p className="font-mono text-sm text-brand-maroon font-bold">₹{cashOutflowPurchases.toLocaleString("en-IN")}</p>
          </div>
          {Object.entries(expenseBreakdown).map(([cat, amt]) => (
            <div key={cat} className="border-l-2 border-brand-gold pl-3">
              <p className="text-[9px] uppercase text-brand-warm-gray font-bold">{cat}</p>
              <p className="font-mono text-sm text-brand-maroon font-bold">₹{Number(amt).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expenses List */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col h-[500px]">
          <div className="px-5 py-3 border-b border-brand-gold/15 flex justify-between items-center bg-[#1C050E] text-[#F9F5F0]">
            <h3 className="font-serif text-base font-semibold">Expenses</h3>
            <button onClick={() => setIsExpenseModalOpen(true)} className="text-brand-gold hover:text-white transition"><Plus className="w-4 h-4"/></button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {dbExpenses.length === 0 ? <p className="text-center text-xs text-brand-warm-gray italic py-8">No expenses logged.</p> :
              dbExpenses.map(exp => (
                <div key={exp.id} className="border-b border-brand-gold/10 pb-2 last:border-0 text-xs">
                  <div className="flex justify-between font-bold text-brand-maroon">
                    <span>{exp.category}</span>
                    <span className="font-mono text-red-600">₹{Number(exp.amount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-warm-gray mt-1">
                    <span className="truncate pr-2">{exp.description}</span>
                    <span className="font-mono flex-shrink-0">{exp.date}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Purchases List */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col h-[500px]">
          <div className="px-5 py-3 border-b border-brand-gold/15 flex justify-between items-center bg-[#1C050E] text-[#F9F5F0]">
            <h3 className="font-serif text-base font-semibold">Purchases</h3>
            <button onClick={() => setIsPurchaseModalOpen(true)} className="text-brand-gold hover:text-white transition"><Plus className="w-4 h-4"/></button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {dbPurchases.length === 0 ? <p className="text-center text-xs text-brand-warm-gray italic py-8">No purchases logged.</p> :
              dbPurchases.map(pur => {
                const bal = pur.total_amount - pur.amount_paid;
                return (
                  <div key={pur.id} className="border border-brand-gold/10 p-3 rounded-lg text-xs bg-white space-y-2">
                    <div className="flex justify-between font-bold text-brand-maroon">
                      <span className="truncate pr-2">{pur.vendor_name}</span>
                      <span className="font-mono">Total: ₹{Number(pur.total_amount).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="text-[10px] text-brand-warm-gray border-b border-brand-gold/10 pb-2 flex justify-between items-center">
                      <span>{pur.items_description}</span>
                      {pur.quantity && <span className="font-mono bg-brand-gold/10 text-brand-gold-dark px-1.5 py-0.5 rounded text-[9px] font-bold">Qty: {pur.quantity}</span>}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${pur.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {pur.status.replace('_', ' ')}
                      </span>
                      <span className="font-mono font-bold text-[10px] text-red-600">Bal: ₹{bal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Dues List */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col h-[500px]">
          <div className="px-5 py-3 border-b border-brand-gold/15 flex justify-between items-center bg-[#1C050E] text-[#F9F5F0]">
            <h3 className="font-serif text-base font-semibold">Ledger (Installments)</h3>
            <button onClick={() => setIsDueModalOpen(true)} className="text-brand-gold hover:text-white transition"><Plus className="w-4 h-4"/></button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {dbDues.length === 0 ? <p className="text-center text-xs text-brand-warm-gray italic py-8">No dues recorded.</p> :
              dbDues.map(due => {
                const bal = due.total_amount - due.amount_paid;
                return (
                  <div key={due.id} className={`border border-brand-gold/20 p-3 rounded-lg text-xs ${due.status === "cleared" ? "opacity-60 bg-gray-50" : "bg-white"}`}>
                    <div className="flex justify-between font-bold">
                      <span className="text-brand-maroon truncate max-w-[120px]">{due.entity_name}</span>
                      <span className={`font-mono ${due.due_type === "payable" ? "text-red-600" : "text-emerald-600"}`}>
                        {due.due_type === "payable" ? "Owe: " : "Owed: "}₹{Number(bal).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-[9px] text-brand-warm-gray mt-1 flex justify-between">
                      <span>Total: ₹{Number(due.total_amount).toLocaleString("en-IN")}</span>
                      <span>Paid: ₹{Number(due.amount_paid).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-gold/10">
                      <span className="text-[9px] uppercase font-bold text-brand-warm-gray">{due.due_date ? `Due: ${due.due_date}` : ""}</span>
                      {due.status === "pending" ? (
                        <button onClick={() => { setSelectedDue(due); setIsPaymentModalOpen(true); }} className="flex items-center gap-1 text-[9px] uppercase font-bold bg-brand-gold/20 text-brand-gold-dark px-2 py-1 rounded hover:bg-brand-gold hover:text-[#1C050E] transition">
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

      </div>

      {/* --- MODALS --- */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="bg-[#FAF7F2] max-w-sm w-full border border-brand-gold/30 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-brand-maroon mb-4">Log General Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <input type="date" required value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              
              {/* Category Searchable Dropdown */}
              <div className="space-y-1 relative">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">Expense Category *</label>
                <input
                  type="text"
                  required
                  placeholder="Type or select category..."
                  value={expenseForm.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setExpenseForm({ ...expenseForm, category: cat });
                    setIsCategoryDropdownOpen(true);
                    if (cat !== "Salary") {
                      setSelectedEmployeeId("");
                    }
                  }}
                  onFocus={() => setIsCategoryDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setIsCategoryDropdownOpen(false), 200);
                  }}
                  className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none focus:border-brand-maroon"
                />
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 bg-white border border-brand-gold/20 shadow-lg max-h-36 overflow-y-auto mt-1 divide-y divide-brand-gold/10 rounded">
                    {Array.from(new Set(["Operational", "Salary", "Marketing", "Rent/Utilities", "Other", ...dbExpenses.map(e => e.category).filter(Boolean)]))
                      .filter(c => c.toLowerCase().includes(expenseForm.category.toLowerCase()))
                      .map(cat => (
                        <div
                          key={cat}
                          onMouseDown={() => {
                            setExpenseForm({ ...expenseForm, category: cat });
                            setIsCategoryDropdownOpen(false);
                            if (cat === "Salary" && dbEmployees.length > 0) {
                              handleEmployeeChange(dbEmployees[0].id);
                            } else {
                              setSelectedEmployeeId("");
                            }
                          }}
                          className="px-3 py-2 text-xs hover:bg-brand-sand/50 cursor-pointer text-brand-maroon font-semibold"
                        >
                          {cat}
                        </div>
                      ))}
                    {expenseForm.category && !["Operational", "Salary", "Marketing", "Rent/Utilities", "Other", ...dbExpenses.map(e => e.category).filter(Boolean)].some(c => c.toLowerCase() === expenseForm.category.toLowerCase()) && (
                      <div className="px-3 py-2 text-xs text-brand-warm-gray bg-brand-sand/35 font-bold italic">
                        + Create Category: "{expenseForm.category}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {expenseForm.category === "Salary" && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-brand-maroon">Select Staff Member *</label>
                  <select
                    required
                    value={selectedEmployeeId}
                    onChange={e => handleEmployeeChange(e.target.value)}
                    className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none"
                  >
                    <option value="" disabled>-- Select Employee --</option>
                    {dbEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">Amount (₹)</label>
                <input type="number" min="1" required placeholder="Amount (₹)" value={expenseForm.amount || ""} onChange={e => setExpenseForm({...expenseForm, amount: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none font-mono" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">Description</label>
                <input type="text" required placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">Cancel</button>
                <button type="submit" className="bg-brand-maroon text-white text-xs uppercase font-bold px-4 py-2">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsPurchaseModalOpen(false)}>
          <div className="bg-[#FAF7F2] max-w-sm w-full border border-brand-gold/30 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-brand-maroon mb-4">Log Inventory Purchase</h3>
            <form onSubmit={handleAddPurchase} className="space-y-3">
              <input type="date" required value={purchaseForm.date} onChange={e => setPurchaseForm({...purchaseForm, date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              
              {/* Vendor Searchable Dropdown */}
              <div className="space-y-1 relative">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Type or select vendor..."
                  value={purchaseForm.vendor_name}
                  onChange={(e) => {
                    setPurchaseForm({ ...purchaseForm, vendor_name: e.target.value });
                    setIsVendorDropdownOpen(true);
                  }}
                  onFocus={() => setIsVendorDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setIsVendorDropdownOpen(false), 200);
                  }}
                  className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none focus:border-brand-maroon"
                />
                {isVendorDropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 bg-white border border-brand-gold/20 shadow-lg max-h-36 overflow-y-auto mt-1 divide-y divide-brand-gold/10 rounded">
                    {Array.from(new Set([...dbPurchases.map(p => p.vendor_name).filter(Boolean), ...dbDues.filter(d => d.due_type === 'payable').map(d => d.entity_name).filter(Boolean)]))
                      .filter(v => v.toLowerCase().includes(purchaseForm.vendor_name.toLowerCase()))
                      .map(vendor => (
                        <div
                          key={vendor}
                          onMouseDown={() => {
                            setPurchaseForm({ ...purchaseForm, vendor_name: vendor });
                            setIsVendorDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs hover:bg-brand-sand/50 cursor-pointer text-brand-maroon font-semibold"
                        >
                          {vendor}
                        </div>
                      ))}
                    {purchaseForm.vendor_name && !Array.from(new Set([...dbPurchases.map(p => p.vendor_name).filter(Boolean), ...dbDues.filter(d => d.due_type === 'payable').map(d => d.entity_name).filter(Boolean)])).some(v => v.toLowerCase() === purchaseForm.vendor_name.toLowerCase()) && (
                      <div className="px-3 py-2 text-xs text-brand-warm-gray bg-brand-sand/35 font-bold italic">
                        + Add Vendor: "{purchaseForm.vendor_name}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input type="text" required placeholder="Items (e.g. 10x Katan Silk)" value={purchaseForm.items_description} onChange={e => setPurchaseForm({...purchaseForm, items_description: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">Quantity</label>
                <input type="number" min="1" required value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none font-mono" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-brand-warm-gray">Total Bill</label>
                  <input type="number" min="0" required placeholder="₹0" value={purchaseForm.total_amount || ""} onChange={e => setPurchaseForm({...purchaseForm, total_amount: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-emerald-700">Paid Today</label>
                  <input type="number" min="0" placeholder="₹0" value={purchaseForm.amount_paid || ""} onChange={e => setPurchaseForm({...purchaseForm, amount_paid: Number(e.target.value)})} className="w-full bg-white border border-emerald-200 p-2 text-xs text-emerald-800" />
                </div>
              </div>
              {purchaseForm.amount_paid < purchaseForm.total_amount && purchaseForm.total_amount > 0 && (
                <p className="text-[10px] text-amber-600 bg-amber-50 p-2 border border-amber-200 rounded italic">
                  A payable due of ₹{purchaseForm.total_amount - purchaseForm.amount_paid} will be automatically added to the Ledger.
                </p>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">Cancel</button>
                <button type="submit" className="bg-brand-maroon text-white text-xs uppercase font-bold px-4 py-2">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDueModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsDueModalOpen(false)}>
          <div className="bg-[#FAF7F2] max-w-sm w-full border border-brand-gold/30 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-brand-maroon mb-4">Manual Ledger Entry</h3>
            <form onSubmit={handleAddDue} className="space-y-3">
              <select value={dueForm.due_type} onChange={e => setDueForm({...dueForm, due_type: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs font-bold text-brand-maroon">
                <option value="payable">PAYABLE (Money you owe)</option>
                <option value="receivable">RECEIVABLE (Money owed to you)</option>
              </select>
              <input type="text" required placeholder="Entity / Person Name" value={dueForm.entity_name} onChange={e => setDueForm({...dueForm, entity_name: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="number" min="0" required placeholder="Total Amount (₹)" value={dueForm.total_amount || ""} onChange={e => setDueForm({...dueForm, total_amount: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="number" min="0" placeholder="Amount Already Paid (₹)" value={dueForm.amount_paid || ""} onChange={e => setDueForm({...dueForm, amount_paid: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="date" value={dueForm.due_date} onChange={e => setDueForm({...dueForm, due_date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDueModalOpen(false)} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">Cancel</button>
                <button type="submit" className="bg-brand-maroon text-white text-xs uppercase font-bold px-4 py-2">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && selectedDue && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] max-w-sm w-full border border-brand-gold/30 rounded-lg p-6 shadow-2xl">
            <h3 className="font-serif text-xl text-brand-maroon mb-2">Log Payment</h3>
            <p className="text-xs text-brand-warm-gray mb-4">
              {selectedDue.due_type === 'payable' ? `Paying ${selectedDue.entity_name}` : `Receiving from ${selectedDue.entity_name}`}
            </p>
            <div className="bg-white border border-brand-gold/15 p-3 rounded mb-4 text-xs font-mono">
              <div className="flex justify-between"><span>Total:</span> <span>₹{selectedDue.total_amount}</span></div>
              <div className="flex justify-between"><span>Paid:</span> <span>₹{selectedDue.amount_paid}</span></div>
              <div className="flex justify-between font-bold text-red-600 border-t pt-1 mt-1"><span>Bal:</span> <span>₹{selectedDue.total_amount - selectedDue.amount_paid}</span></div>
            </div>
            
            <form onSubmit={handleMakePayment} className="space-y-3">
              <input type="date" required value={paymentForm.payment_date} onChange={e => setPaymentForm({...paymentForm, payment_date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="number" min="0" max={selectedDue.total_amount - selectedDue.amount_paid} required placeholder="Amount to Pay (₹)" value={paymentForm.amount_paid || ""} onChange={e => setPaymentForm({...paymentForm, amount_paid: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
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
