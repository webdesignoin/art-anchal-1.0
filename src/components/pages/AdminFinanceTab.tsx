import React, { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle, TrendingUp, TrendingDown, DollarSign, Plus, Package, FileText, CreditCard, Minus, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface AdminFinanceTabProps {
  dbExpenses: any[];
  dbPurchases: any[];
  dbDues: any[];
  dbOrders: any[];
  dbEmployees?: any[];
  dbDuePayments?: any[];
  dbSarees?: any[];
  fetchAllData: () => void;
  openExpenseModalOnLoad?: boolean;
  openPurchaseModalOnLoad?: boolean;
  onCloseExpenseModalOnLoad?: () => void;
  onClosePurchaseModalOnLoad?: () => void;
  startDate?: string;
  endDate?: string;
}

export default function AdminFinanceTab({
  dbExpenses,
  dbPurchases,
  dbDues,
  dbOrders,
  dbEmployees = [],
  dbDuePayments = [],
  dbSarees = [],
  fetchAllData,
  openExpenseModalOnLoad = false,
  openPurchaseModalOnLoad = false,
  onCloseExpenseModalOnLoad,
  onClosePurchaseModalOnLoad,
  startDate = "",
  endDate = ""
}: AdminFinanceTabProps) {
  const { t, language } = useLanguage();
  const [feedback, setFeedback] = useState("");
  
  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (openExpenseModalOnLoad) {
      setIsExpenseModalOpen(true);
      if (onCloseExpenseModalOnLoad) onCloseExpenseModalOnLoad();
    }
  }, [openExpenseModalOnLoad, onCloseExpenseModalOnLoad]);

  useEffect(() => {
    if (openPurchaseModalOnLoad) {
      setIsPurchaseModalOpen(true);
      if (onClosePurchaseModalOnLoad) onClosePurchaseModalOnLoad();
    }
  }, [openPurchaseModalOnLoad, onClosePurchaseModalOnLoad]);

  // Forms
  const [expenseForm, setExpenseForm] = useState({ category: "Operational", amount: 0, description: "", date: new Date().toISOString().split('T')[0] });
  const [purchaseForm, setPurchaseForm] = useState({ vendor_name: "", amount_paid: 0, date: new Date().toISOString().split('T')[0] });

  interface PurchaseLineItem {
    saree_id: string;
    product_name: string;
    quantity: number;
    buying_price: number;
    selling_price: number;
  }

  const [purchaseLineItems, setPurchaseLineItems] = useState<PurchaseLineItem[]>([
    { saree_id: "", product_name: "", quantity: 1, buying_price: 0, selling_price: 0 }
  ]);

  const calculatedTotalAmount = purchaseLineItems.reduce((sum, item) => sum + (Number(item.buying_price || 0) * Number(item.quantity || 0)), 0);
  const calculatedTotalQuantity = purchaseLineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const tFinance = (key: string): string => {
    if (language === "hi") {
      const trans: Record<string, string> = {
        "Categorized Spending": "श्रेणीबद्ध खर्च (Categorized Spending)",
        "Inventory Paid": "स्टॉक भुगतान (Inventory)",
        "Expenses": "खर्चे (Expenses)",
        "Purchases": "खरीद (Purchases)",
        "Ledger (Installments)": "खाता-बही (किस्तें)",
        "No expenses logged.": "कोई खर्च दर्ज नहीं है।",
        "No purchases logged.": "कोई खरीद दर्ज नहीं है।",
        "No dues recorded.": "कोई बकाया दर्ज नहीं है।",
        "Owe: ": "देना है: ",
        "Owed: ": "लेना है: ",
        "Paid: ": "भुगतान किया: ",
        "Total: ": "कुल: ",
        "Bal: ": "बकाया: ",
        "Due: ": "तारीख: ",
        "Pay Part": "भुगतान करें",
        "Cleared ✓": "चुकता ✓",
        "Log General Expense": "सामान्य खर्च दर्ज करें",
        "Expense Category *": "खर्च श्रेणी *",
        "Type or select category...": "श्रेणी दर्ज करें या चुनें...",
        "Operational": "परिचालन खर्च",
        "Salary": "वेतन (Salary)",
        "Marketing": "मार्केटिंग खर्च",
        "Rent/Utilities": "किराया / बिजली आदि",
        "Other": "अन्य",
        "+ Create Category:": "+ नई श्रेणी बनाएं:",
        "Select Staff Member *": "कर्मचारी चुनें *",
        "-- Select Employee --": "-- कर्मचारी चुनें --",
        "Amount (₹)": "रकम (₹)",
        "Description": "विवरण / विवरणिका",
        "Cancel": "रद्द करें",
        "Save": "सुरक्षित करें",
        "Log Inventory Purchase": "स्टॉक खरीद दर्ज करें",
        "Purchase Date": "खरीद की तारीख",
        "Vendor Name *": "व्यापारी (Vendor) का नाम *",
        "Type or select vendor...": "सप्लायर का नाम दर्ज करें या चुनें...",
        "+ Add Vendor:": "+ नया सप्लायर जोड़ें:",
        "Purchase Line Items": "खरीदी गई साड़ी की सूची",
        "Add Item": "नया आइटम जोड़ें",
        "Item #": "आइटम #",
        "Select Item": "साड़ी चुनें (Saree)",
        "-- Choose Existing Saree --": "-- स्टॉक में से चुनें --",
        "➕ Add New Item": "➕ नया आइटम जोड़ें",
        "Product Name *": "आइटम का नाम *",
        "E.g. Tanchoi Silk Saree": "जैसे: तनचोई सिल्क साड़ी",
        "Qty": "मात्रा",
        "Buying Price (₹)": "खरीद मूल्य (₹)",
        "Selling Price (₹)": "बिक्री मूल्य (₹)",
        "Total Bill (Calculated)": "कुल बिल (गणना की गई)",
        "Paid Today": "आज किया गया भुगतान",
        "Save Purchase": "खरीद सुरक्षित करें",
        "Manual Ledger Entry": "मैनुअल बही-खाता प्रविष्टि",
        "PAYABLE (Money you owe)": "देय (वह पैसा जो आपको देना है)",
        "RECEIVABLE (Money owed to you)": "प्राप्य (वह पैसा जो आपको मिलना है)",
        "Entity / Person Name": "व्यक्ति या व्यापारी का नाम",
        "Total Amount (₹)": "कुल राशि (₹)",
        "Amount Already Paid (₹)": "पहले से भुगतान की गई राशि (₹)",
        "Log Payment": "भुगतान दर्ज करें",
        "Confirm Payment": "भुगतान की पुष्टि करें",
        "Amount to Pay (₹)": "भुगतान की जाने वाली राशि (₹)",
        "Remaining:": "शेष बकाया:",
        "Total due:": "कुल बकाया:",
        "Paid so far:": "अब तक भुगतान:",
        "paid": "पूर्ण भुगतान",
        "partially_paid": "आंशिक भुगतान",
        "unpaid": "अवैतनिक/बकाया",
        "payable": "देय (Payable)",
        "receivable": "प्राप्य (Receivable)"
      };
      return trans[key] || key;
    }
    return key;
  };

  const handleAddLineItem = () => {
    setPurchaseLineItems([
      ...purchaseLineItems,
      { saree_id: "", product_name: "", quantity: 1, buying_price: 0, selling_price: 0 }
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setPurchaseLineItems(purchaseLineItems.filter((_, idx) => idx !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const updated = [...purchaseLineItems];
    if (field === "saree_id") {
      updated[index].saree_id = value;
      if (value === "new") {
        updated[index].product_name = "";
        updated[index].selling_price = 0;
      } else {
        const selectedSaree = dbSarees.find(s => s.id === value);
        if (selectedSaree) {
          updated[index].product_name = selectedSaree.name;
          updated[index].selling_price = Number(selectedSaree.price || 0);
        }
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setPurchaseLineItems(updated);
  };
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
    showFeedback(language === "hi" ? "खर्च सफलतापूर्वक दर्ज हो गया।" : "Expense logged successfully.");
  };

  const handleAddPurchase = async (e: FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.vendor_name) return;
    if (calculatedTotalAmount <= 0) {
      alert(language === "hi" ? "कृपया कम से कम एक आइटम जोड़ें जिसका खरीद मूल्य हो।" : "Please add at least one line item with a buying price.");
      return;
    }

    // Check that all line items have a name and quantity
    for (const item of purchaseLineItems) {
      if (!item.product_name.trim()) {
        alert(language === "hi" ? "कृपया सुनिश्चित करें कि सभी आइटमों का नाम हो।" : "Please ensure all line items have a product name.");
        return;
      }
      if (item.quantity <= 0) {
        alert(language === "hi" ? "कृपया सुनिश्चित करें कि सभी आइटमों की मात्रा 0 से अधिक हो।" : "Please ensure all line items have a quantity greater than 0.");
        return;
      }
    }

    setFeedback(language === "hi" ? "खरीद दर्ज की जा रही है..." : "Logging purchase...");
    
    try {
      const isPartial = purchaseForm.amount_paid < calculatedTotalAmount;
      const status = purchaseForm.amount_paid === 0 ? 'unpaid' : isPartial ? 'partially_paid' : 'paid';
      const itemsDescription = purchaseLineItems.map(item => `${item.quantity}x ${item.product_name}`).join(", ");

      // 1. Insert Purchase
      const { data: purchaseData, error: purchaseError } = await supabase.from("purchases").insert({
        vendor_name: purchaseForm.vendor_name,
        items_description: itemsDescription,
        amount: Number(calculatedTotalAmount),
        total_amount: calculatedTotalAmount,
        amount_paid: Number(purchaseForm.amount_paid || 0),
        quantity: Number(calculatedTotalQuantity),
        status: status,
        date: purchaseForm.date
      }).select().single();

      if (purchaseError) throw purchaseError;

      // 2. Insert Purchase Line Items & update/create Sarees
      const purchaseItemsToInsert = [];
      for (const item of purchaseLineItems) {
        let resolvedSareeId = item.saree_id;
        if (item.saree_id === 'new' || !item.saree_id) {
          // Create new saree with placeholder details
          const { data: newSareeData, error: newSareeError } = await supabase.from("sarees").insert({
            name: item.product_name,
            price: Number(item.selling_price || 0),
            stock_quantity: Number(item.quantity),
            rating: 5,
            reviews_count: 0,
            images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"],
            colors: ["Gold"],
            zari_type: "Tested Zari",
            weaving_technique: "Tanchoi Weave",
            material: "Pure Silk",
            description: "Newly purchased saree batch. Please update specifications.",
            drape_recommendation: "Perfect for festive wear.",
            is_bestseller: false,
            is_featured: false,
            is_new: true,
            is_active: true,
            spec_length: "5.5 meters",
            spec_width: "45 inches",
            spec_blouse: "80 cm unstitched running brocade",
            spec_wash_care: "Dry cleaning only",
            spec_origin: "Varanasi, India",
            sell_online: false
          }).select().single();

          if (newSareeError) {
            console.error("Error creating new saree:", newSareeError);
            resolvedSareeId = null;
          } else {
            resolvedSareeId = newSareeData.id;
          }
        } else {
          // Update stock of existing saree
          const existingSaree = dbSarees.find(s => s.id === item.saree_id);
          const currentStock = Number(existingSaree?.stock_quantity ?? 0);
          const { error: updateStockErr } = await supabase.from("sarees").update({
            stock_quantity: currentStock + Number(item.quantity)
          }).eq("id", item.saree_id);
          if (updateStockErr) console.error("Error updating stock:", updateStockErr);
        }

        purchaseItemsToInsert.push({
          purchase_id: purchaseData.id,
          saree_id: resolvedSareeId === 'new' ? null : resolvedSareeId || null,
          product_name: item.product_name,
          quantity: Number(item.quantity),
          buying_price: Number(item.buying_price),
          selling_price: Number(item.selling_price)
        });
      }

      // Insert all purchase items
      const { error: piError } = await supabase.from("purchase_items").insert(purchaseItemsToInsert);
      if (piError) {
        console.error("Error inserting purchase items:", piError);
      }

      // 3. Automatically generate a "Due" ledger record
      const dueStatus = purchaseForm.amount_paid >= calculatedTotalAmount ? 'cleared' : 'pending';
      const { data: dueData, error: dueError } = await supabase.from("dues").insert({
        entity_name: purchaseForm.vendor_name,
        due_type: 'payable',
        amount: Number(calculatedTotalAmount),
        total_amount: calculatedTotalAmount,
        amount_paid: Number(purchaseForm.amount_paid || 0),
        status: dueStatus,
        linked_purchase_id: purchaseData.id
      }).select().single();

      if (dueError) {
        console.error(`Error auto-creating ledger entry: ${dueError.message}`);
      }

      // 4. Log initial payment in payment history if amount_paid > 0
      if (purchaseForm.amount_paid > 0 && dueData) {
        const { error: paymentError } = await supabase.from("due_payments").insert({
          due_id: dueData.id,
          amount_paid: Number(purchaseForm.amount_paid),
          payment_date: purchaseForm.date
        });
        if (paymentError) {
          console.error("Error logging initial payment:", paymentError.message);
        }
      }

      setIsPurchaseModalOpen(false);
      setPurchaseForm({ vendor_name: "", amount_paid: 0, date: new Date().toISOString().split('T')[0] });
      setPurchaseLineItems([{ saree_id: "", product_name: "", quantity: 1, buying_price: 0, selling_price: 0 }]);
      fetchAllData();
      showFeedback(language === "hi" ? "खरीद सफलतापूर्वक दर्ज और लेजर में सिंक की गई।" : "Purchase logged & synced to Ledger.");
    } catch (err: any) {
      alert(`Error logging purchase: ${err.message}`);
    }
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
    showFeedback(language === "hi" ? "बकाया प्रविष्टि जोड़ी गई।" : "Due entry added.");
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
    showFeedback(language === "hi" ? `₹${paymentForm.amount_paid} का भुगतान दर्ज किया गया।` : `Payment of ₹${paymentForm.amount_paid} logged.`);
  };

  // Date range filter helpers
  const isWithinDateRange = (dateString?: string) => {
    if (!dateString) return true;
    const itemDate = new Date(dateString).toISOString().split('T')[0];
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  };

  const filteredExpenses = dbExpenses.filter(e => isWithinDateRange(e.date || e.created_at));
  const filteredPurchases = dbPurchases.filter(p => isWithinDateRange(p.date || p.created_at));
  const filteredDues = dbDues.filter(d => isWithinDateRange(d.due_date || d.created_at));
  const filteredOrders = dbOrders.filter(o => isWithinDateRange(o.created_at));

  // Calculations — Cash-basis P&L (more accurate for a small retail business)
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  // Total billed from vendors (accrual — includes unpaid portions, shown in breakdown)
  const totalPurchasesAccrual = filteredPurchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
  // Actual cash paid to vendors (used for P&L — only money that left the account)
  const cashOutflowPurchases = filteredPurchases.reduce((acc, p) => acc + Number(p.amount_paid || 0), 0);
  
  // Net Profit = Revenue − Expenses − Cash paid to vendors
  // (unpaid vendor dues are tracked in the Ledger section, not deducted from profit yet)
  const netProfit = totalRevenue - totalExpenses - cashOutflowPurchases;

  // Breakdown of expenses
  const expenseBreakdown = filteredExpenses.reduce((acc: Record<string, number>, exp) => {
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
        <h2 className="font-serif text-3xl text-brand-maroon font-light">{t("admin_finance_title")}</h2>
        <p className="text-xs text-brand-warm-gray mt-0.5">{t("admin_finance_desc")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("admin_kpi_revenue"), value: totalRevenue, icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: t("admin_kpi_purchases"), value: totalPurchasesAccrual, icon: Package, color: "text-amber-700", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: t("admin_kpi_expenses"), value: totalExpenses, icon: TrendingDown, color: "text-red-700", bg: "bg-red-500/10 border-red-500/20" },
          { label: t("admin_kpi_profit"), value: netProfit, icon: DollarSign, color: netProfit >= 0 ? "text-emerald-700" : "text-red-700", bg: netProfit >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20" },
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
        <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-maroon mb-3">{tFinance("Categorized Spending")}</h3>
        <div className="flex flex-wrap gap-4">
          <div className="border-l-2 border-brand-maroon pl-3">
            <p className="text-[9px] uppercase text-brand-warm-gray font-bold">{tFinance("Inventory Paid")}</p>
            <p className="font-mono text-sm text-brand-maroon font-bold">₹{cashOutflowPurchases.toLocaleString("en-IN")}</p>
          </div>
          {Object.entries(expenseBreakdown).map(([cat, amt]) => (
            <div key={cat} className="border-l-2 border-brand-gold pl-3">
              <p className="text-[9px] uppercase text-brand-warm-gray font-bold">{tFinance(cat)}</p>
              <p className="font-mono text-sm text-brand-maroon font-bold">₹{Number(amt).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expenses List */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col h-[500px]">
          <div className="px-5 py-3 border-b border-brand-gold/15 flex justify-between items-center bg-[#1C050E] text-[#F9F5F0]">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-gold">{tFinance("Expenses")}</h3>
            <button onClick={() => setIsExpenseModalOpen(true)} className="text-brand-gold hover:text-white transition"><Plus className="w-4 h-4"/></button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {filteredExpenses.length === 0 ? <p className="text-center text-xs text-brand-warm-gray italic py-8">{tFinance("No expenses logged.")}</p> :
              filteredExpenses.map(exp => (
                <div key={exp.id} className="border-b border-brand-gold/10 pb-2 last:border-0 text-xs">
                  <div className="flex justify-between font-bold text-brand-maroon">
                    <span>{tFinance(exp.category)}</span>
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
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-gold">{tFinance("Purchases")}</h3>
            <button onClick={() => setIsPurchaseModalOpen(true)} className="text-brand-gold hover:text-white transition"><Plus className="w-4 h-4"/></button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {filteredPurchases.length === 0 ? <p className="text-center text-xs text-brand-warm-gray italic py-8">{tFinance("No purchases logged.")}</p> :
              filteredPurchases.map(pur => {
                const bal = pur.total_amount - pur.amount_paid;
                return (
                  <div key={pur.id} className="border border-brand-gold/10 p-3 rounded-lg text-xs bg-white space-y-2">
                    <div className="flex justify-between font-bold text-brand-maroon">
                      <span className="truncate pr-2">{pur.vendor_name}</span>
                      <span className="font-mono">{tFinance("Total: ")}₹{Number(pur.total_amount).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="text-[10px] text-brand-warm-gray border-b border-brand-gold/10 pb-2 flex justify-between items-center">
                      <span>{pur.items_description}</span>
                      {pur.quantity && <span className="font-mono bg-brand-gold/10 text-brand-gold-dark px-1.5 py-0.5 rounded text-[9px] font-bold">{tFinance("Qty")}: {pur.quantity}</span>}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${pur.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {tFinance(pur.status)}
                      </span>
                      <span className="font-mono font-bold text-[10px] text-red-600">{tFinance("Bal: ")}₹{bal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
 
        {/* Dues List */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col h-[500px]">
          <div className="px-5 py-3 border-b border-brand-gold/15 flex justify-between items-center bg-[#1C050E] text-[#F9F5F0]">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-gold">{tFinance("Ledger (Installments)")}</h3>
            <button onClick={() => setIsDueModalOpen(true)} className="text-brand-gold hover:text-white transition"><Plus className="w-4 h-4"/></button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {filteredDues.length === 0 ? <p className="text-center text-xs text-brand-warm-gray italic py-8">{tFinance("No dues recorded.")}</p> :
              filteredDues.map(due => {
                const bal = due.total_amount - due.amount_paid;
                return (
                  <div key={due.id} className={`border border-brand-gold/20 p-3 rounded-lg text-xs ${due.status === "cleared" ? "opacity-60 bg-gray-50" : "bg-white"}`}>
                    <div className="flex justify-between font-bold">
                      <span className="text-brand-maroon truncate max-w-[120px]">{due.entity_name}</span>
                      <span className={`font-mono ${due.due_type === "payable" ? "text-red-600" : "text-emerald-600"}`}>
                        {due.due_type === "payable" ? tFinance("Owe: ") : tFinance("Owed: ")}₹{Number(bal).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-[9px] text-brand-warm-gray mt-1 flex justify-between">
                      <span>{tFinance("Total: ")}₹{Number(due.total_amount).toLocaleString("en-IN")}</span>
                      <span>{tFinance("Paid: ")}₹{Number(due.amount_paid).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-gold/10">
                      <span className="text-[9px] uppercase font-bold text-brand-warm-gray">{due.due_date ? `${tFinance("Due: ")}${due.due_date}` : ""}</span>
                      {due.status === "pending" ? (
                        <button onClick={() => { setSelectedDue(due); setIsPaymentModalOpen(true); }} className="flex items-center gap-1 text-[9px] uppercase font-bold bg-brand-gold/20 text-brand-gold-dark px-2 py-1 rounded hover:bg-brand-gold hover:text-[#1C050E] transition">
                          <CreditCard className="w-3 h-3" /> {tFinance("Pay Part")}
                        </button>
                      ) : (
                        <span className="text-[9px] uppercase font-bold text-emerald-600 border border-emerald-200 px-2 py-1 rounded">{tFinance("Cleared ✓")}</span>
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
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="bg-[#FAF7F2] max-w-sm w-full border-t sm:border border-brand-gold/30 rounded-t-3xl sm:rounded-lg p-5 sm:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <h3 className="font-serif text-xl text-brand-maroon mb-4">{tFinance("Log General Expense")}</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <input type="date" required value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              
              {/* Category Searchable Dropdown */}
              <div className="space-y-1 relative">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tFinance("Expense Category *")}</label>
                <input
                  type="text"
                  required
                  placeholder={tFinance("Type or select category...")}
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
                          {tFinance(cat)}
                        </div>
                      ))}
                    {expenseForm.category && !["Operational", "Salary", "Marketing", "Rent/Utilities", "Other", ...dbExpenses.map(e => e.category).filter(Boolean)].some(c => c.toLowerCase() === expenseForm.category.toLowerCase()) && (
                      <div className="px-3 py-2 text-xs text-brand-warm-gray bg-brand-sand/35 font-bold italic">
                        {tFinance("+ Create Category:")} "{expenseForm.category}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {expenseForm.category === "Salary" && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tFinance("Select Staff Member *")}</label>
                  <select
                    required
                    value={selectedEmployeeId}
                    onChange={e => handleEmployeeChange(e.target.value)}
                    className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none"
                  >
                    <option value="" disabled>{tFinance("-- Select Employee --")}</option>
                    {dbEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({tFinance(emp.role)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tFinance("Amount (₹)")}</label>
                <input type="number" min="1" required placeholder={tFinance("Amount (₹)")} value={expenseForm.amount || ""} onChange={e => setExpenseForm({...expenseForm, amount: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none font-mono" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tFinance("Description")}</label>
                <input type="text" required placeholder={tFinance("Description")} value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">{tFinance("Cancel")}</button>
                <button type="submit" className="bg-brand-maroon text-white text-xs uppercase font-bold px-4 py-2">{tFinance("Save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsPurchaseModalOpen(false)}>
          <div className="bg-[#FAF7F2] max-w-2xl w-full border-t sm:border border-brand-gold/30 rounded-t-3xl sm:rounded-lg p-5 sm:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <h3 className="font-serif text-xl text-brand-maroon mb-4">{tFinance("Log Inventory Purchase")}</h3>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tFinance("Purchase Date")}</label>
                  <input type="date" required value={purchaseForm.date} onChange={e => setPurchaseForm({...purchaseForm, date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
                </div>
                
                {/* Vendor Searchable Dropdown */}
                <div className="space-y-1 relative">
                  <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tFinance("Vendor Name *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={tFinance("Type or select vendor...")}
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
                          {tFinance("+ Add Vendor:")} "{purchaseForm.vendor_name}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Line Items Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-brand-gold/20 pb-1">
                  <h4 className="text-xs uppercase font-bold text-brand-maroon">{tFinance("Purchase Line Items")}</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-[10px] uppercase font-bold text-brand-gold-dark hover:text-brand-maroon flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> {tFinance("Add Item")}
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {purchaseLineItems.map((item, idx) => (
                    <div key={idx} className="border border-brand-gold/15 p-3 rounded bg-white relative space-y-2">
                      <div className="flex justify-between items-center border-b border-brand-gold/10 pb-1.5">
                        <span className="text-[10px] uppercase font-bold text-brand-gold-dark">{tFinance("Item #")}{idx + 1}</span>
                        {purchaseLineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{tFinance("Select Item")}</label>
                          <select
                            value={item.saree_id}
                            onChange={e => handleLineItemChange(idx, "saree_id", e.target.value)}
                            className="w-full bg-brand-ivory border border-brand-gold/20 p-2 text-xs focus:outline-none focus:border-brand-maroon"
                          >
                            <option value="">{tFinance("-- Choose Existing Saree --")}</option>
                            <option value="new">{tFinance("➕ Add New Item")}</option>
                            {dbSarees.map(s => (
                              <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{tFinance("Product Name *")}</label>
                          <input
                            type="text"
                            required
                            placeholder={tFinance("E.g. Tanchoi Silk Saree")}
                            value={item.product_name}
                            onChange={e => handleLineItemChange(idx, "product_name", e.target.value)}
                            disabled={item.saree_id !== "" && item.saree_id !== "new"}
                            className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none focus:border-brand-maroon disabled:bg-gray-100 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{tFinance("Qty")}</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={e => handleLineItemChange(idx, "quantity", Number(e.target.value))}
                            className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{tFinance("Buying Price (₹)")}</label>
                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="₹0"
                            value={item.buying_price || ""}
                            onChange={e => handleLineItemChange(idx, "buying_price", Number(e.target.value))}
                            className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{tFinance("Selling Price (₹)")}</label>
                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="₹0"
                            value={item.selling_price || ""}
                            onChange={e => handleLineItemChange(idx, "selling_price", Number(e.target.value))}
                            className="w-full bg-white border border-brand-gold/20 p-2 text-xs focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-brand-gold/15 pt-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{tFinance("Total Bill (Calculated)")}</label>
                  <div className="w-full bg-gray-100 border border-brand-gold/20 p-2 text-xs font-mono font-bold text-brand-maroon">
                    ₹{calculatedTotalAmount.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-emerald-700">{tFinance("Paid Today")}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="₹0"
                    value={purchaseForm.amount_paid || ""}
                    onChange={e => setPurchaseForm({...purchaseForm, amount_paid: Number(e.target.value)})}
                    className="w-full bg-white border border-emerald-200 p-2 text-xs text-emerald-800 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              {purchaseForm.amount_paid < calculatedTotalAmount && calculatedTotalAmount > 0 && (
                language === "hi" ? (
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-2 border border-amber-200 rounded italic">
                    ₹{(calculatedTotalAmount - purchaseForm.amount_paid).toLocaleString("en-IN")} का देय बकाया बही-खाते में स्वचालित रूप से जोड़ दिया जाएगा।
                  </p>
                ) : (
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-2 border border-amber-200 rounded italic">
                    A payable due of ₹{(calculatedTotalAmount - purchaseForm.amount_paid).toLocaleString("en-IN")} will be automatically added to the Ledger.
                  </p>
                )
              )}
              
              <div className="flex justify-end gap-2 pt-2 border-t border-brand-gold/15">
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">{tFinance("Cancel")}</button>
                <button type="submit" className="bg-brand-maroon text-white text-xs uppercase font-bold px-4 py-2 hover:bg-brand-maroon/90 transition shadow">{tFinance("Save Purchase")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDueModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsDueModalOpen(false)}>
          <div className="bg-[#FAF7F2] max-w-sm w-full border-t sm:border border-brand-gold/30 rounded-t-3xl sm:rounded-lg p-5 sm:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <h3 className="font-serif text-xl text-brand-maroon mb-4">{tFinance("Manual Ledger Entry")}</h3>
            <form onSubmit={handleAddDue} className="space-y-3">
              <select value={dueForm.due_type} onChange={e => setDueForm({...dueForm, due_type: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs font-bold text-brand-maroon">
                <option value="payable">{tFinance("PAYABLE (Money you owe)")}</option>
                <option value="receivable">{tFinance("RECEIVABLE (Money owed to you)")}</option>
              </select>
              <input type="text" required placeholder={tFinance("Entity / Person Name")} value={dueForm.entity_name} onChange={e => setDueForm({...dueForm, entity_name: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="number" min="0" required placeholder={tFinance("Total Amount (₹)")} value={dueForm.total_amount || ""} onChange={e => setDueForm({...dueForm, total_amount: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="number" min="0" placeholder={tFinance("Amount Already Paid (₹)")} value={dueForm.amount_paid || ""} onChange={e => setDueForm({...dueForm, amount_paid: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="date" value={dueForm.due_date} onChange={e => setDueForm({...dueForm, due_date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDueModalOpen(false)} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">{tFinance("Cancel")}</button>
                <button type="submit" className="bg-brand-maroon text-white text-xs uppercase font-bold px-4 py-2">{tFinance("Save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && selectedDue && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF7F2] max-w-sm w-full border-t sm:border border-brand-gold/30 rounded-t-3xl sm:rounded-lg p-5 sm:p-6 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <h3 className="font-serif text-xl text-brand-maroon mb-2">{tFinance("Log Payment")}</h3>
            <p className="text-xs text-brand-warm-gray mb-4">
              {language === "hi" ? (
                selectedDue.due_type === 'payable' ? `${selectedDue.entity_name} को भुगतान किया जा रहा है` : `${selectedDue.entity_name} से प्राप्त किया जा रहा है`
              ) : (
                selectedDue.due_type === 'payable' ? `Paying ${selectedDue.entity_name}` : `Receiving from ${selectedDue.entity_name}`
              )}
            </p>
            <div className="bg-white border border-brand-gold/15 p-3 rounded mb-4 text-xs font-mono">
              <div className="flex justify-between"><span>{tFinance("Total due:")}</span> <span>₹{selectedDue.total_amount}</span></div>
              <div className="flex justify-between"><span>{tFinance("Paid so far:")}</span> <span>₹{selectedDue.amount_paid}</span></div>
              <div className="flex justify-between font-bold text-red-600 border-t pt-1 mt-1"><span>{tFinance("Remaining:")}</span> <span>₹{selectedDue.total_amount - selectedDue.amount_paid}</span></div>
            </div>
            
            <form onSubmit={handleMakePayment} className="space-y-3">
              <input type="date" required value={paymentForm.payment_date} onChange={e => setPaymentForm({...paymentForm, payment_date: e.target.value})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <input type="number" min="0" max={selectedDue.total_amount - selectedDue.amount_paid} required placeholder={tFinance("Amount to Pay (₹)")} value={paymentForm.amount_paid || ""} onChange={e => setPaymentForm({...paymentForm, amount_paid: Number(e.target.value)})} className="w-full bg-white border border-brand-gold/20 p-2 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setIsPaymentModalOpen(false); setSelectedDue(null); }} className="text-xs uppercase font-bold px-3 text-brand-warm-gray hover:text-brand-maroon">{tFinance("Cancel")}</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs uppercase font-bold px-4 py-2 hover:bg-emerald-700">{tFinance("Confirm Payment")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
