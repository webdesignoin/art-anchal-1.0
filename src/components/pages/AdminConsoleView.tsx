/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Art&Anchal Admin Dashboard
 * Features: Catalog CMS (with stock), CRM Leads, POS Billing (stock deduction), Orders
 */

import React, { useState, useEffect, FormEvent, useRef } from "react";
import { ViewState } from "../../types";
import { supabase, isMock } from "../../lib/supabase";
import {
  Plus, Edit, Trash2, Users, ShoppingBag, FileText, PhoneCall,
  TrendingUp, Printer, ArrowLeft, CheckCircle, RefreshCw, Lock,
  Sparkles, Package, AlertTriangle, X, Check, ChevronRight, ChevronLeft, Menu,
  LayoutDashboard, MessageSquare, Minus, Search, IndianRupee,
  ShieldCheck, Tag, Upload, Edit2, Archive, Phone, Download, UserPlus, Image as ImageIcon, CreditCard, HelpCircle, LogOut, MoreHorizontal, Globe,
  CalendarDays, ChevronDown, ChevronUp
} from "lucide-react";

import AdminHRTab from "./AdminHRTab";
import AdminFinanceTab from "./AdminFinanceTab";
import AdminVendorsTab from "./AdminVendorsTab";
import InvoiceDocument, { InvoiceData } from "../InvoiceDocument";
import { useLanguage } from "../../context/LanguageContext";

interface AdminConsoleViewProps {
  userSession: { id?: string; name: string; email: string; is_admin?: boolean } | null;
  setUserSession: (session: any) => void;
  setView: (view: ViewState) => void;
  refreshCatalog: (force?: boolean) => Promise<void>;
}

type TabType = "overview" | "catalog" | "crm" | "pos" | "orders" | "hr" | "finance" | "vendors";

const TAX_RATE = 0.05; // 5% GST for handloom sarees (CGST 2.5% + SGST 2.5%)

const getFirstDayOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyLead = { name: "", email: "", phone: "", interest: "", message: "", status: "new", source: "offline" };
const emptyProfile = { name: "", email: "", phone: "", source: "offline" };
const emptySaree = {
  name: "", price: 0, original_price: "", material: "", colors: "",
  zari_type: "Pure Gold Zari", weaving_technique: "Kadwa Handloom",
  collection_id: "", artisan_id: "", images: ["", "", ""], description: "",
  drape_recommendation: "", stock_quantity: 1,
  is_bestseller: false, is_featured: false, is_new: false,
  sell_online: false,
  spec_length: "5.5 Meters", spec_width: "45 Inches",
  spec_blouse: "80 cm unstitched", spec_wash_care: "Dry clean only",
  spec_origin: "Varanasi, Uttar Pradesh, India",
};

export default function AdminConsoleView({ userSession, setUserSession, setView, refreshCatalog }: AdminConsoleViewProps) {
  const { language, setLanguage } = useLanguage();

  const tAdmin = (key: string): string => {
    if (language === "hi") {
      const trans: Record<string, string> = {
        // Restricted Area
        "Restricted Area": "प्रतिबंधित क्षेत्र",
        "Administrator credentials required.": "प्रशासक क्रेडेंशियल आवश्यक हैं।",
        "Sign In as Admin": "एडमिन के रूप में साइन इन करें",

        // Top mobile header / bottom nav / sidebar
        "Admin Console": "एडमिन कंसोल",
        "Overview": "अवलोकन",
        "Catalog": "कैटलॉग",
        "Catalog & Stock": "कैटलॉग और स्टॉक",
        "POS Bill": "पीओएस बिल",
        "Orders": "ऑर्डर",
        "Order History": "ऑर्डर इतिहास",
        "Finance & Ledger": "वित्त और बहीखाता",
        "Vendors & Suppliers": "व्यापारी और आपूर्तिकर्ता",
        "More": "अधिक",
        "Additional Controls": "अतिरिक्त नियंत्रण",
        "Management Menu": "प्रबंधन मेनू",
        "CRM Leads": "सीआरएम लीड्स",
        "HR & Staffing": "कर्मचारी प्रबंधन",
        "Finance": "फाइनेंस",
        "Vendors": "व्यापारी (Vendors)",
        "Sync Data": "डेटा सिंक करें",
        "Back to Store": "दुकान पर वापस जाएं",
        "Log Out": "लॉग आउट",
        "Expand Sidebar": "साइडबार फैलाएं",
        "Collapse Sidebar": "साइडबार सिकोड़ें",
        "Dashboard": "डैशबोर्ड",
        "Catalog & Inventory": "कैटलॉग और इन्वेंटरी",
        "Sales": "बिक्री (Sales)",
        "CRM": "ग्राहक संबंध (CRM)",
        "Operations": "संचालन (Operations)",
        "Active Date Range": "सक्रिय तिथि सीमा",
        "Filtering Overview, Catalog, Orders, and Finance & Ledger by date": "तिथि के अनुसार अवलोकन, कैटलॉग, ऑर्डर और वित्त व खाता बही को फ़िल्टर करना",
        "to": "से",
        "Reset": "रीसेट",
        "Stock Alerts": "स्टॉक अलर्ट",
        "OUT OF STOCK": "स्टॉक समाप्त",
        "All inventory quantities are healthy.": "सभी इन्वेंटरी मात्रा स्वस्थ हैं।",
        "Pending Receivables": "लंबित प्राप्य (Receivables)",
        "Collection Tracker": "वसूली ट्रैकर",
        "No pending customer outstanding receivables.": "कोई लंबित ग्राहक बकाया प्राप्य नहीं है।",
        
        // Dashboard Overview
        "Dashboard Overview": "डैशबोर्ड अवलोकन",
        "Art&Anchal Varanasi Boutique Management Console": "आर्ट एंड आंचल वाराणसी बुटीक प्रबंधन कंसोल",
        "System Live · Year ": "सिस्टम लाइव · वर्ष ",
        "To Collect (Receivables)": "लेना है (Receivables)",
        "Customer unpaid dues": "ग्राहकों से बकाया राशि",
        "To Pay (Payables)": "देना है (Payables)",
        "Vendor outstanding dues": "सप्लायर्स की बकाया राशि",
        "Cash in Hand": "हाथ में नकद (Cash)",
        "Physical showroom cash float": "शोरूम में उपलब्ध नकद राशि",
        "Bank Balance": "बैंक बैलेंस",
        "Online/UPI/Ledger balance": "ऑनलाइन / यूपीआई / बैंक खाता",
        "Quick Transaction Shortcuts": "त्वरित लेनदेन शॉर्टकट",
        "Add Sale": "बिक्री जोड़ें",
        "Generate POS Bill": "POS बिल जनरेट करें",
        "Add Purchase": "खरीद जोड़ें",
        "Log vendor stock purchase": "सप्लायर से स्टॉक खरीद दर्ज करें",
        "Add Expense": "खर्च जोड़ें",
        "Record showroom expense": "दुकान/शोरूम का खर्च दर्ज करें",
        "Add Party": "पार्टी जोड़ें",
        "Log lead or customer": "लीड या ग्राहक दर्ज करें",
        "Sales vs Purchases Comparison": "बिक्री बनाम खरीद तुलना",
        "Sales (Inflow)": "बिक्री (आवक)",
        "Purchases (Outflow)": "खरीद (जावक)",
        "Consolidated Daybook (Recent Transactions)": "समेकित दिन-बही (हाल के लेनदेन)",
        "Live Feed": "लाइव फीड",
        "Type": "प्रकार",
        "Ref No.": "संदर्भ संख्या",
        "Date": "तारीख",
        "Party / Category": "पार्टी / श्रेणी",
        "Payment Mode": "भुगतान का माध्यम",
        "Status": "स्थिति",
        "Amount": "रकम",
        "No transactions recorded for this period.": "इस अवधि के लिए कोई लेनदेन दर्ज नहीं है।",

        // Date Range Filter
        "Date Range": "तिथि सीमा",
        "Filter": "फ़िल्टर",
        "From": "से",
        "To": "तक",
        "Apply": "लागू करें",
        "Custom": "कस्टम",

        // Revenue & Profit Cards
        "Total Revenue": "कुल राजस्व",
        "All paid orders in date range": "तिथि सीमा में सभी भुगतान किए गए ऑर्डर",
        "Calculation Breakdown": "गणना विवरण",
        "Recent Orders": "हाल के ऑर्डर",
        "No sales in this period": "इस अवधि में कोई बिक्री नहीं",
        "Total": "कुल",
        "Net Profit / Loss": "शुद्ध लाभ / हानि",
        "Revenue − Expenses − Purchases": "राजस्व − खर्च − खरीद",
        "Total Revenue (Sales)": "कुल राजस्व (बिक्री)",
        "Total Expenses": "कुल खर्च",
        "Total Purchases Paid": "कुल खरीद भुगतान",
        "Net Profit": "शुद्ध लाभ",
        "Net Loss": "शुद्ध हानि",
        "View Full Finance Ledger →": "पूरा वित्त बही खाता देखें →",
        "View More Orders →": "और ऑर्डर देखें →",

        // Expandable KPI Cards
        "Tap to view": "विवरण देखें",
        "No pending receivables": "कोई लंबित प्राप्य नहीं",
        "Go to Ledger →": "बही खाता पर जाएं →",
        "Outstanding Payables": "बकाया देनदारियाँ",
        "No pending payables": "कोई लंबित देनदारी नहीं",
        "Go to Vendors →": "व्यापारी पृष्ठ पर जाएं →",
        "Physical showroom cash": "शोरूम में नकद राशि",
        "Cash Sales (Inflow)": "नकद बिक्री (आवक)",
        "Expenses (Outflow)": "खर्च (जावक)",
        "Net Cash": "शुद्ध नकद",
        "View Expenses →": "खर्च देखें →",
        "Online/UPI/Ledger": "ऑनलाइन / यूपीआई / बैंक",
        "Online/Card/UPI Sales": "ऑनलाइन / कार्ड / यूपीआई बिक्री",
        "Purchase Payments": "खरीद भुगतान",
        "Net Bank": "शुद्ध बैंक बैलेंस",
        "View Purchases →": "खरीद देखें →",

        // Catalog & Inventory tab
        "Saree Catalog & Stock": "साड़ी कैटलॉग और स्टॉक",
        "Catalog & Inventory CMS": "कैटलॉग और इन्वेंटरी प्रबंधन",
        "Manage public storefront products, custom weaver details, and vault availability.": "सार्वजनिक स्टोरफ्रंट उत्पादों, बुनकर विवरण और उपलब्ध स्टॉक का प्रबंधन करें।",
        "Search catalog by name or code...": "नाम या कोड द्वारा खोजें...",
        "All Stock Status": "सभी स्टॉक स्थिति",
        "In Stock": "स्टॉक में है",
        "Out of Stock / Loom Booking Needed": "स्टॉक समाप्त / लूम बुकिंग आवश्यक",
        "Add Saree": "नई साड़ी जोड़ें",
        "Image": "छवि",
        "Product Details": "उत्पाद विवरण",
        "Price & Value": "कीमत और मूल्य",
        "Stock": "स्टॉक",
        "Storefront": "स्टोरफ्रंट",
        "Actions": "कार्रवाई",
        "Weaver: ": "बुनकर: ",
        "Zari: ": "ज़री: ",
        "Code: ": "कोड: ",
        "Buy: ": "खरीद: ",
        "Sell: ": "बिक्री: ",
        "Edit Saree": "साड़ी संपादित करें",
        "Delete Saree": "साड़ी हटाएं",
        "Hidden / Draft": "छिपा हुआ / ड्राफ्ट",
        "Visible on Store": "स्टोर पर दृश्यमान",
        "Archive / Inactive": "संग्रहीत / निष्क्रिय",
        "Edit product": "उत्पाद संपादित करें",
        "Delete product": "उत्पाद हटाएं",
        "No sarees match your search/filter parameters.": "आपकी खोज/फ़िल्टर से मेल खाने वाली कोई साड़ी नहीं मिली।",
        "Previous": "पिछला",
        "Page": "पृष्ठ",
        "of": "का",
        "Next": "अगला",

        // Saree Form Modal
        "Configure Masterpiece": "उत्कृष्ट कृति सेटिंग्स",
        "Set metadata, weaver story, images, and care instructions.": "मेटाडेटा, बुनकर की कहानी, चित्र और देखभाल निर्देश सेट करें।",
        "Basic Info": "बुनियादी जानकारी",
        "Weaver Story": "बुनकर की कहानी",
        "Technical Specs": "तकनीकी विवरण",
        "Product Title / Name *": "उत्पाद का शीर्षक / नाम *",
        "Product SKU / Unique Code *": "उत्पाद SKU / विशिष्ट कोड *",
        "Weaving Style *": "बुनाई शैली *",
        "Zari Grade Type *": "ज़री ग्रेड प्रकार *",
        "Saree Category *": "साड़ी श्रेणी *",
        "Color Palette Name *": "रंग पैलेट नाम *",
        "Artisan / Master Weaver *": "बुनकर / मास्टर कारीगर *",
        "-- Unlisted / Unknown --": "-- असूचीबद्ध / अज्ञात --",
        "Buying Price (₹, internal)": "खरीद मूल्य (₹, आंतरिक)",
        "Retail Price (₹, customer-facing) *": "खुदरा मूल्य (₹, ग्राहक के लिए) *",
        "Quantity in Showroom Vault *": "शोरूम तिजोरी में मात्रा *",
        "Visible on Public Storefront": "सार्वजनिक स्टोरफ्रंट पर दृश्यमान",
        "Draft Mode / Hidden from Store": "ड्राफ्ट मोड / स्टोर से छिपाएं",
        "Image Configuration": "छवि कॉन्फ़िगरेशन",
        "Upload via Files (recommended)": "फ़ाइलों के माध्यम से अपलोड करें",
        "Paste URLs Directly (legacy)": "सीधे URL पेस्ट करें",
        "Slot 1 (Main Image) *": "स्लॉट 1 (मुख्य छवि) *",
        "Slot 2 (Zoom Detail)": "स्लॉट 2 (ज़ूम विवरण)",
        "Slot 3 (Drape View)": "स्लॉट 3 (स्टाइल/ड्रेप)",
        "Select Image File": "छवि फ़ाइल चुनें",
        "Select File": "फ़ाइल चुनें",
        "Paste URL": "URL पेस्ट करें",
        "Enter image URL...": "छवि URL दर्ज करें...",
        "Uploading...": "अपलोड हो रहा है...",
        "Upload Failed": "अपलोड विफल",
        "Weaver Story & Custom Drape Text": "बुनकर की कहानी और ड्रेप टेक्स्ट",
        "Weaver Tale / Bio": "बुनकर की कहानी / जीवनी",
        "Write the historical context or weavers background...": "ऐतिहासिक संदर्भ या बुनकर की पृष्ठभूमि लिखें...",
        "Drape & Care Guide (Client instruction)": "ड्रेप और केयर गाइड (ग्राहक निर्देश)",
        "E.g. Dry clean only. Iron on reverse.": "जैसे: केवल ड्राई क्लीन। उल्टी तरफ प्रेस करें।",
        "Product Specifications (Technical Details)": "उत्पाद विवरण (तकनीकी जानकारी)",
        "Saree Length": "साड़ी की लंबाई",
        "Saree Width": "साड़ी की चौड़ाई",
        "Blouse Piece Length": "ब्लाउज पीस की लंबाई",
        "Wash Care Instruction": "धुलाई देखभाल निर्देश",
        "Origin Location": "उत्पत्ति का स्थान",
        "Cancel": "रद्द करें",
        "Save Masterpiece": "उत्कृष्ट कृति सुरक्षित करें",
        "Saving...": "सुरक्षित किया जा रहा है...",

        // CRM Leads
        "CRM Customer Pipeline": "CRM ग्राहक पाइपलाइन",
        "Track WhatsApp consultation requests, store leads, and customer notes.": "व्हाट्सएप परामर्श अनुरोधों, स्टोर लीड्स और ग्राहक नोट्स को ट्रैक करें।",
        "Search leads by name, email or phone...": "नाम, ईमेल या फोन द्वारा खोजें...",
        "Add Manual Lead": "मैनुअल लीड जोड़ें",
        "New Inquiry": "नई पूछताछ",
        "Requested: ": "अनुरोध किया गया: ",
        "Consultation Subject: ": "परामर्श का विषय: ",
        "Notes: ": "नोट्स: ",
        "Status: ": "स्थिति: ",
        "Contact: ": "संपर्क: ",
        "Call Lead": "कॉल करें",
        "WhatsApp Chat": "व्हाट्सएप चैट",
        "Interaction History": "बातचीत का इतिहास",
        "Write a detailed follow-up note...": "एक विस्तृत अनुवर्ती नोट लिखें...",
        "Record Interaction": "बातचीत दर्ज करें",
        "No interactions recorded yet for this client.": "इस ग्राहक के लिए अभी तक कोई बातचीत दर्ज नहीं की गई है।",
        "Create New CRM Lead": "नया CRM लीड बनाएं",
        "Full Name *": "पूरा नाम *",
        "WhatsApp Phone *": "व्हाट्सएप फोन *",
        "Email Address (optional)": "ईमेल पता (वैकल्पिक)",
        "Loom / Styling Preference / Subject": "लूम / स्टाइलिंग प्राथमिकता / विषय",
        "Bridal Trousseau Showcase": "शादी-ब्याह की खरीदारी (Bridal)",
        "Heritage Collectors Showcase": "एंटीक / खास सिल्क साड़ी संग्रह",
        "Festive Styling Consultation": "त्योहार और विशेष उत्सव स्टाइलिंग",
        "Showroom Walk-in Inquiry": "शोरूम में आकर पूछताछ",
        "Initial Notes / Customization Details": "प्रारंभिक नोट्स / अनुकूलन विवरण",
        "E.g. Wants pure gold zari, wedding date Nov 12...": "जैसे: शुद्ध सोने की ज़री चाहिए, शादी की तारीख 12 नवंबर...",
        "Save Lead": "लीड सुरक्षित करें",

        // POS Billing / POS Bill
        "Point of Sale (POS) Billing": "प्वाइंट ऑफ सेल (POS) बिलिंग",
        "Register walkthrough sales, apply custom discounts, print invoices instantly.": "वॉक-थ्रू बिक्री पंजीकृत करें, विशेष छूट लागू करें, इनवॉइस प्रिंट करें।",
        "Select Customer *": "ग्राहक चुनें *",
        "Search customer name, phone, or email...": "ग्राहक का नाम, फोन या ईमेल खोजें...",
        "Create New Customer Profile": "नया ग्राहक प्रोफाइल बनाएं",
        "Item Lookup": "आइटम लुकअप",
        "Search code or name...": "कोड या नाम खोजें...",
        "Showroom Inventory": "शोरूम इन्वेंटरी",
        "Qty: ": "मात्रा: ",
        "In Bag": "बैग में",
        "Add to Invoice": "इनवॉइस में जोड़ें",
        "Cart is Empty": "कार्ट खाली है",
        "No items added to invoice yet. Use lookup above.": "इनवॉइस में अभी तक कोई आइटम नहीं जोड़ा गया है। ऊपर खोजें।",
        "GST / Tax (₹)": "जीएसटी / टैक्स (₹)",
        "Custom Discount (₹)": "कस्टम छूट (₹)",
        "Received Amount (Cash/Bank) (₹) *": "प्राप्त राशि (नकद/बैंक) (₹) *",
        "Notes (Payment mode details, custom fittings etc)": "नोट्स (भुगतान मोड विवरण, कस्टम फिटिंग आदि)",
        "E.g. Paid via PhonePe, needs custom fall and pico before dispatch": "जैसे: PhonePe द्वारा भुगतान किया गया, फॉल और पीको की आवश्यकता है",
        "Register POS Sale": "POS बिक्री पंजीकृत करें",
        "Invoice Summary": "इनवॉइस सारांश",
        "Invoice Reference": "इनवॉइस संदर्भ",
        "Customer Details": "ग्राहक का विवरण",
        "Billed Items": "बिल किए गए आइटम",
        "Price": "कीमत",
        "Subtotal": "उपयोग (Subtotal)",
        "Tax / GST": "टैक्स / जीएसटी",
        "Discount": "छूट (Discount)",
        "Net Payable": "कुल देय",
        "Amount Paid": "भुगतान की गई राशि",
        "Remaining Balance": "शेष देय राशि",
        "Payment Status": "भुगतान की स्थिति",
        "Print Invoice": "इनवॉइस प्रिंट करें",
        "Close Invoice": "इनवॉइस बंद करें",

        // POS customer popup
        "Full Name": "पूरा नाम",
        "WhatsApp / Phone *": "व्हाट्सएप / फोन *",
        "Save Customer": "ग्राहक सुरक्षित करें",

        // Order History
        "Order & Invoice Archives": "ऑर्डर और इनवॉइस अभिलेखागार",
        "Track customer purchases, outstanding balances, and print PDF daybook sheets.": "ग्राहक खरीद, बकाया शेष राशि और पीडीएफ दिन-बही प्रिंट ट्रैक करें।",
        "Search invoices by number or client name...": "इनवॉइस नंबर या ग्राहक के नाम से खोजें...",
        "Date Range Selection": "दिनांक सीमा का चयन",
        "Type / Status": "प्रकार / स्थिति",
        "Invoice No.": "इनवॉइस नं.",
        "Client": "ग्राहक",
        "Net Owed": "कुल बकाया",
        "Paid So Far": "अब तक भुगतान",
        "Outstanding Balance": "शेष देय राशि",
        "Print": "प्रिंट",
        "No orders logged.": "कोई ऑर्डर दर्ज नहीं है।",

        // General
        "Edit": "संपादित करें",
        "Delete": "हटाएं",
        "Save": "सुरक्षित करें"
      };
      return trans[key] || key;
    }
    return key;
  };
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogStockFilter, setCatalogStockFilter] = useState("all");
  const [catalogPage, setCatalogPage] = useState(1);
  const [openFinancePurchaseModal, setOpenFinancePurchaseModal] = useState(false);
  const [openFinanceExpenseModal, setOpenFinanceExpenseModal] = useState(false);
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);

  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const interactionPanelRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const [dbSarees, setDbSarees] = useState<any[]>([]);
  const [dbArtisans, setDbArtisans] = useState<any[]>([]);
  const [dbCollections, setDbCollections] = useState<any[]>([]);
  const [dbLeads, setDbLeads] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbProfiles, setDbProfiles] = useState<any[]>([]);

  // ERP States
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [dbAttendance, setDbAttendance] = useState<any[]>([]);
  const [dbExpenses, setDbExpenses] = useState<any[]>([]);
  const [dbPurchases, setDbPurchases] = useState<any[]>([]);
  const [dbDues, setDbDues] = useState<any[]>([]);
  const [dbDuePayments, setDbDuePayments] = useState<any[]>([]);

  // CMS states
  const [editingSaree, setEditingSaree] = useState<any | null>(null);
  const [isSareeModalOpen, setIsSareeModalOpen] = useState(false);
  const [sareeForm, setSareeForm] = useState({ ...emptySaree });
  // Per-slot image upload state (3 slots)
  const [slotUploading, setSlotUploading] = useState([false, false, false]);
  const [slotProgress, setSlotProgress] = useState([0, 0, 0]);
  const [slotError, setSlotError] = useState(["", "", ""]);
  const [slotPreview, setSlotPreview] = useState(["", "", ""]);
  const [urlInputMode, setUrlInputMode] = useState(false);
  const [sareeModalTab, setSareeModalTab] = useState<"basic" | "details" | "specs">("basic");
  // Separate hidden file inputs per slot — avoids overflow-hidden clipping bug
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // CRM states
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadInteractions, setLeadInteractions] = useState<any[]>([]);
  const [newInteractionNote, setNewInteractionNote] = useState("");
  const [interactionChannel, setInteractionChannel] = useState("phone");
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ ...emptyLead });
  const [leadSearch, setLeadSearch] = useState("");

  // POS states
  const [posSearch, setPosSearch] = useState("");
  const [posCustomerSearch, setPosCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...emptyProfile });
  const [posCart, setPosCart] = useState<Array<{ saree: any; quantity: number; customPrice?: number }>>([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [posNotes, setPosNotes] = useState("");

  // Orders
  const [orderSearch, setOrderSearch] = useState("");
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [statusForm, setStatusForm] = useState({ status: "", tracking_number: "", shipping_carrier: "" });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  // ── Fetch all data ────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await supabase.auth.getSession(); // Guard against race condition on reload
      const [s, ar, col, ld, ord, prof] = await Promise.all([
        supabase.from("sarees").select("*").order("created_at", { ascending: false }),
        supabase.from("artisans").select("*").order("name"),
        supabase.from("collections").select("*").order("name"),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("name"),
      ]);
      if (s.data) setDbSarees(s.data);
      if (ar.data) setDbArtisans(ar.data);
      if (col.data) setDbCollections(col.data);
      if (ld.data) setDbLeads(ld.data);
      if (ord.data) setDbOrders(ord.data);
      if (prof.data) setDbProfiles(prof.data);

      try {
        const [emp, att, exp, pur, due, dp] = await Promise.all([
          supabase.from("employees").select("*").order("name"),
          supabase.from("attendance").select("*, employee:employees(name)").order("date", { ascending: false }),
          supabase.from("expenses").select("*").order("date", { ascending: false }),
          supabase.from("purchases").select("*").order("date", { ascending: false }),
          supabase.from("dues").select("*").order("due_date", { ascending: false }),
          supabase.from("due_payments").select("*").order("payment_date", { ascending: false }),
        ]);
        if (emp.data) setDbEmployees(emp.data);
        if (att.data) setDbAttendance(att.data);
        if (exp.data) setDbExpenses(exp.data);
        if (pur.data) setDbPurchases(pur.data);
        if (due.data) setDbDues(due.data);
        if (dp.data) setDbDuePayments(dp.data);
      } catch (erpErr) {
        console.warn("ERP tables might not exist yet", erpErr);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userSession?.is_admin) fetchAllData();
  }, [userSession, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Date range filter helpers ──────────────────────────────────────────────
  const isWithinDateRange = (dateString?: string) => {
    if (!dateString) return true;
    const itemDate = new Date(dateString).toISOString().split('T')[0];
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  };

  const filteredDbOrders = dbOrders.filter(o => isWithinDateRange(o.created_at));
  const filteredDbDues = dbDues.filter(d => isWithinDateRange(d.due_date || d.created_at));
  const filteredDbExpenses = dbExpenses.filter(e => isWithinDateRange(e.date || e.created_at));
  const filteredDbPurchases = dbPurchases.filter(p => isWithinDateRange(p.date || p.created_at));

  // ── KPI helpers ───────────────────────────────────────────────────────────
  const totalRevenue = filteredDbOrders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const activeLeads = dbLeads.filter(l => l.status !== "won" && l.status !== "lost").length;
  const lowStockSarees = dbSarees.filter(s => s.is_active !== false && (s.stock_quantity ?? 1) <= 2);
  const outOfStock = dbSarees.filter(s => s.is_active !== false && (s.stock_quantity ?? 1) <= 0);

  // Vyapar-style calculations
  const totalReceivables = filteredDbDues
    .filter(d => d.due_type === "receivable" && d.status === "pending")
    .reduce((sum, d) => sum + Number((d.total_amount ?? 0) - (d.amount_paid ?? 0)), 0);

  const totalPayables = filteredDbDues
    .filter(d => d.due_type === "payable" && d.status === "pending")
    .reduce((sum, d) => sum + Number((d.total_amount ?? 0) - (d.amount_paid ?? 0)), 0);

  const baseCashFloat = 0;
  const cashInHand = baseCashFloat 
    + filteredDbOrders.filter(o => o.is_paid && o.payment_mode === "cash").reduce((sum, o) => sum + Number(o.total ?? 0), 0)
    - filteredDbExpenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  const baseBankBalance = 0;
  const bankBalance = baseBankBalance
    + filteredDbOrders.filter(o => o.is_paid && ["online", "card", "upi", "bank_transfer"].includes(o.payment_mode)).reduce((sum, o) => sum + Number(o.total ?? 0), 0)
    - filteredDbPurchases.reduce((sum, p) => sum + Number(p.amount_paid ?? 0), 0);

  const totalExpenses = filteredDbExpenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  const totalPurchasesPaid = filteredDbPurchases.reduce((sum, p) => sum + Number(p.amount_paid ?? 0), 0);
  const netProfit = totalRevenue - totalExpenses - totalPurchasesPaid;

  // Consolidated Daybook transaction feed
  const daybookTransactions = [
    ...filteredDbOrders.map(o => ({
      id: o.id,
      type: "Sale",
      number: o.invoice_number || `SAL-${o.id.slice(0, 5).toUpperCase()}`,
      date: o.created_at,
      party: o.customer_name,
      amount: o.total,
      status: o.is_paid ? "Paid" : "Unpaid",
      colorClass: o.is_paid ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200",
      mode: o.payment_mode.toUpperCase(),
    })),
    ...filteredDbPurchases.map(p => ({
      id: p.id,
      type: "Purchase",
      number: `PUR-${p.id.slice(0, 5).toUpperCase()}`,
      date: p.date || p.created_at,
      party: p.vendor_name,
      amount: p.total_amount,
      status: p.status === "paid" ? "Paid" : p.status === "partially_paid" ? "Partial" : "Unpaid",
      colorClass: p.status === "paid" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : p.status === "partially_paid" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200",
      mode: "BANK",
    })),
    ...filteredDbExpenses.map(e => ({
      id: e.id,
      type: "Expense",
      number: `EXP-${e.id.slice(0, 5).toUpperCase()}`,
      date: e.date || e.created_at,
      party: e.category,
      amount: e.amount,
      status: "Paid",
      colorClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      mode: "CASH",
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // ── CRM ───────────────────────────────────────────────────────────────────
  const handleSelectLead = async (lead: any) => {
    setSelectedLead(lead);
    const { data } = await supabase
      .from("lead_interactions")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });
    setLeadInteractions(data || []);
    
    // Auto-scroll on mobile
    if (window.innerWidth < 1024 && interactionPanelRef.current) {
      setTimeout(() => interactionPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  const handleAddInteraction = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newInteractionNote.trim()) return;
    const { error } = await supabase.from("lead_interactions").insert({
      lead_id: selectedLead.id,
      admin_id: userSession?.id || null,
      notes: newInteractionNote,
      channel: interactionChannel,
    });
    if (!error) {
      setNewInteractionNote("");
      handleSelectLead(selectedLead);
      showFeedback("Interaction logged.");
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    if (status === 'lost' && !confirm("Are you sure you want to mark this lead as Lost?")) return;
    await supabase.from("leads").update({ status }).eq("id", leadId);
    fetchAllData();
    if (selectedLead?.id === leadId) setSelectedLead((p: any) => ({ ...p, status }));
  };

  const handleAddOfflineLead = async (e: FormEvent) => {
    e.preventDefault();
    if (!leadForm.name) return;
    const { error } = await supabase.from("leads").insert({
      name: leadForm.name,
      email: leadForm.email || null,
      phone: leadForm.phone || null,
      interest: leadForm.interest || null,
      message: leadForm.message || null,
      status: "new",
      source: "showroom",
    });
    if (error) { alert(error.message); return; }
    setIsNewLeadModalOpen(false);
    setLeadForm({ ...emptyLead });
    fetchAllData();
    showFeedback("Offline lead created.");
  };

  // ── CMS ───────────────────────────────────────────────────────────────────
  const handleSaveSaree = async (e: FormEvent) => {
    e.preventDefault();
    if (!sareeForm.name || !sareeForm.price || !sareeForm.material || !sareeForm.description) {
      setSareeModalTab("basic");
      alert("Please fill in all required fields (Name, Material, Price, and Description).");
      return;
    }
    const payload = {
      name: sareeForm.name,
      price: Number(sareeForm.price),
      original_price: sareeForm.original_price ? Number(sareeForm.original_price) : null,
      material: sareeForm.material || "Pure Silk",
      colors: sareeForm.colors ? [sareeForm.colors] : [],
      zari_type: sareeForm.zari_type,
      weaving_technique: sareeForm.weaving_technique,
      collection_id: sareeForm.collection_id || null,
      artisan_id: sareeForm.artisan_id || null,
      images: (() => {
        const urls = sareeForm.images.filter(Boolean);
        return urls.length > 0 ? urls : ["/images/katan_collection_1779547545862.png"];
      })(),
      description: sareeForm.description,
      drape_recommendation: sareeForm.drape_recommendation || null,
      stock_quantity: Number(sareeForm.stock_quantity),
      is_bestseller: sareeForm.is_bestseller,
      is_featured: sareeForm.is_featured,
      is_new: sareeForm.is_new,
      sell_online: sareeForm.sell_online,
      is_active: true,
      spec_length: sareeForm.spec_length,
      spec_width: sareeForm.spec_width,
      spec_blouse: sareeForm.spec_blouse,
      spec_wash_care: sareeForm.spec_wash_care,
      spec_origin: sareeForm.spec_origin,
    };
    try {
      if (editingSaree) {
        const { error } = await supabase.from("sarees").update(payload).eq("id", editingSaree.id);
        if (error) throw error;
        showFeedback("Saree updated.");
      } else {
        const { error } = await supabase.from("sarees").insert(payload);
        if (error) throw error;
        showFeedback("New saree added to catalog.");
      }
      setIsSareeModalOpen(false);
      setEditingSaree(null);
      setSareeForm({ ...emptySaree });
      fetchAllData();
      await refreshCatalog(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteSaree = async (id: string) => {
    if (!confirm("Are you sure you want to remove this saree from the catalog?")) return;
    try {
      const { error: deleteError } = await supabase.from("sarees").delete().eq("id", id);
      
      if (deleteError) {
        console.warn("Hard delete failed (referenced elsewhere). Falling back to soft-delete.", deleteError);
        const { error: updateError } = await supabase.from("sarees").update({ is_active: false }).eq("id", id);
        if (updateError) throw updateError;
        showFeedback("Saree retired (soft-deleted due to order history references).");
      } else {
        showFeedback("Saree deleted successfully from catalog.");
      }
      
      fetchAllData();
      await refreshCatalog(true);
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  const handleOpenEditSaree = (s: any) => {
    setEditingSaree(s);
    const existingImages: [string, string, string] = [
      s.images?.[0] || "",
      s.images?.[1] || "",
      s.images?.[2] || "",
    ];
    setSareeForm({
      name: s.name, price: s.price, original_price: s.original_price || "",
      material: s.material || "", colors: s.colors?.[0] || "",
      zari_type: s.zari_type || "Pure Gold Zari",
      weaving_technique: s.weaving_technique || "Kadwa Handloom",
      collection_id: s.collection_id || "", artisan_id: s.artisan_id || "",
      images: existingImages, description: s.description || "",
      drape_recommendation: s.drape_recommendation || "",
      stock_quantity: s.stock_quantity ?? 1,
      is_bestseller: s.is_bestseller || false,
      is_featured: s.is_featured || false,
      is_new: s.is_new || false,
      sell_online: s.sell_online || false,
      spec_length: s.spec_length || "5.5 Meters",
      spec_width: s.spec_width || "45 Inches",
      spec_blouse: s.spec_blouse || "80 cm unstitched",
      spec_wash_care: s.spec_wash_care || "Dry clean only",
      spec_origin: s.spec_origin || "Varanasi, Uttar Pradesh, India",
    });
    setSlotPreview([...existingImages]);
    setSlotError(["", "", ""]);
    setSlotUploading([false, false, false]);
    setSlotProgress([0, 0, 0]);
    setUrlInputMode(false);
    setSareeModalTab("basic");
    setIsSareeModalOpen(true);
  };

  // ── Image Compression (Canvas API — no extra library) ─────────────────────
  const compressImage = (file: File, maxPx = 1200, quality = 0.82): Promise<{ blob: Blob; originalKB: number; compressedKB: number }> =>
    new Promise((resolve, reject) => {
      const originalKB = Math.round(file.size / 1024);
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Calculate new dimensions keeping aspect ratio
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round((height / width) * maxPx); width = maxPx; }
          else { width = Math.round((width / height) * maxPx); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (!blob) { reject(new Error("Canvas compression failed")); return; }
            resolve({ blob, originalKB, compressedKB: Math.round(blob.size / 1024) });
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = url;
    });

  // ── Image Upload (per slot index 0|1|2) ──────────────────────────────────
  const handleImageUpload = async (file: File, slotIdx: number) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setSlotError(prev => { const n = [...prev]; n[slotIdx] = "Only JPG, PNG, WebP or GIF allowed."; return n; });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSlotError(prev => { const n = [...prev]; n[slotIdx] = "Image must be under 10 MB."; return n; });
      return;
    }

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setSlotPreview(prev => { const n = [...prev]; n[slotIdx] = localPreview; return n; });
    setSlotError(prev => { const n = [...prev]; n[slotIdx] = ""; return n; });
    setSlotUploading(prev => { const n = [...prev]; n[slotIdx] = true; return n; });
    setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 10; return n; });

    try {
      // Compress
      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 25; return n; });
      const { blob: compressedBlob } = await compressImage(file);

      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 45; return n; });

      // Upload
      const filename = `sarees/${Date.now()}-slot${slotIdx}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("saree-images")
        .upload(filename, compressedBlob, { cacheControl: "31536000", upsert: false, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 85; return n; });

      // Get URL
      const { data: urlData } = supabase.storage.from("saree-images").getPublicUrl(filename);
      const publicUrl = urlData.publicUrl;

      // Update sareeForm.images[slotIdx]
      setSareeForm(prev => {
        const imgs = [...prev.images] as [string, string, string];
        imgs[slotIdx] = publicUrl;
        return { ...prev, images: imgs };
      });
      setSlotPreview(prev => { const n = [...prev]; n[slotIdx] = publicUrl; return n; });
      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 100; return n; });
    } catch (err: any) {
      setSlotError(prev => { const n = [...prev]; n[slotIdx] = err.message || "Upload failed. Check bucket exists."; return n; });
      setSlotPreview(prev => { const n = [...prev]; n[slotIdx] = ""; return n; });
    } finally {
      setSlotUploading(prev => { const n = [...prev]; n[slotIdx] = false; return n; });
      setTimeout(() => setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 0; return n; }), 1500);
    }
  };

  // ── POS ───────────────────────────────────────────────────────────────────
  const posSubtotal = posCart.reduce((s, i) => s + (i.customPrice ?? i.saree.price) * i.quantity, 0);
  const posDiscountAmt = Math.min(posDiscount, posSubtotal);
  const posAfterDiscount = posSubtotal - posDiscountAmt;
  const posTaxAmt = Math.round(posAfterDiscount * TAX_RATE);
  const posTotal = posAfterDiscount + posTaxAmt;

  const handlePOSAdd = (saree: any) => {
    const avail = saree.stock_quantity ?? 0;
    const inCart = posCart.find(i => i.saree.id === saree.id)?.quantity || 0;
    if (inCart >= avail) { alert(`Only ${avail} in stock.`); return; }
    setPosCart(prev => {
      const idx = prev.findIndex(i => i.saree.id === saree.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { saree, quantity: 1, customPrice: saree.price }];
    });
    showFeedback(`Added "${saree.name}" to bill.`);
  };

  const handlePOSQty = (sareeId: string, delta: number) => {
    setPosCart(prev => prev.map(i => {
      if (i.saree.id !== sareeId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null as any;
      if (newQty > (i.saree.stock_quantity ?? 0)) return i;
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  };

  const handlePOSPriceChange = (sareeId: string, newPrice: number) => {
    setPosCart(prev => prev.map(item =>
      item.saree.id === sareeId
        ? { ...item, customPrice: Math.max(0, newPrice) }
        : item
    ));
  };

  const handleAddProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileForm.name) return;
    // Insert without .select() to avoid RETURNING+RLS issue for authenticated role
    const { error } = await supabase.from("profiles").insert({
      name: profileForm.name,
      email: profileForm.email || null,
      phone: profileForm.phone || null,
      source: "offline",
      is_admin: false,
    });
    if (error) { alert(`Error creating customer: ${error.message}`); return; }
    setIsNewProfileModalOpen(false);
    setProfileForm({ ...emptyProfile });
    // Refetch profiles, then auto-select the newly added one by matching name+phone
    const { data: refreshed } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (refreshed) {
      setDbProfiles(refreshed);
      const newProfile = refreshed.find((p: any) =>
        p.name === profileForm.name && (p.phone === profileForm.phone || p.email === profileForm.email)
      );
      if (newProfile) setSelectedProfileId(newProfile.id);
    }
    showFeedback("Customer profile registered.");
  };

  const handleViewInvoice = async (order: any) => {
    setLoading(true);
    try {
      // Fetch order items with associated saree data
      const { data: items } = await supabase.from("order_items").select("*, saree:sarees(*)").eq("order_id", order.id);
      setActiveInvoice({
        invoice_number: order.invoice_number || `INV-${order.id?.slice(0, 8).toUpperCase()}`,
        created_at: order.created_at,
        customer_name: order.customer_name || "Customer",
        customer_phone: order.customer_phone || undefined,
        customer_email: order.customer_email || undefined,
        is_offline: order.is_offline ?? false,
        items: items || [],
        subtotal: order.subtotal || order.total || 0,
        discount: order.discount || 0,
        tax: order.tax || 0,
        total: order.total ?? 0,
        payment_mode: order.payment_mode || 'online',
        notes: order.notes || undefined,
      });
    } catch (err: any) {
      alert(`Invoice Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // POS bill generation (different from viewing existing order invoice)
  const handlePOSCheckout = async () => {
    if (posCart.length === 0) { alert("Cart is empty."); return; }
    setLoading(true);
    try {
      // Get profile details for the selected customer
      const selectedProfile = dbProfiles.find(p => p.id === selectedProfileId);
      
      // 1. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          profile_id: selectedProfileId || null,
          customer_name: selectedProfile?.name || "Walk-in Customer",
          customer_email: selectedProfile?.email || "walkin@artandanchal.com",
          customer_phone: selectedProfile?.phone || null,
          shipping_address: { address: "Showroom Walk-in", city: "Varanasi", zip: "221001" },
          subtotal: posSubtotal,
          discount: posDiscountAmt,
          tax: posTaxAmt,
          total: posTotal,
          status: "confirmed",
          payment_mode: posPaymentMethod,
          payment_ref: "POS Showroom",
          is_paid: true,
          is_offline: true,
          notes: posNotes || null,
        })
        .select("id, invoice_number, created_at")
        .single();

      if (orderError) throw orderError;

      // 2. Insert Order Items
      const orderItemsPayload = posCart.map(item => ({
        order_id: orderData.id,
        saree_id: item.saree.id,
        product_name: item.saree.name,
        unit_price: item.customPrice ?? item.saree.price,
        original_price: item.saree.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // 3. Decrement Stock Quantity
      for (const item of posCart) {
        const currentStock = Number(item.saree.stock_quantity ?? 1);
        const { error: stockError } = await supabase
          .from("sarees")
          .update({ stock_quantity: Math.max(0, currentStock - item.quantity) })
          .eq("id", item.saree.id);
        
        if (stockError) console.error("Stock update failed for Saree ID:", item.saree.id, stockError);
      }

      setActiveInvoice({
        invoice_number: orderData.invoice_number || `POS-${Date.now()}`,
        created_at: orderData.created_at || new Date().toISOString(),
        customer_name: selectedProfile?.name || "Walk-in Customer",
        customer_phone: selectedProfile?.phone || undefined,
        customer_email: selectedProfile?.email || undefined,
        is_offline: true,
        items: posCart.map(item => ({
          saree: item.saree,
          product_name: item.saree.name,
          unit_price: item.customPrice ?? item.saree.price,
          original_price: item.saree.price,
          quantity: item.quantity
        })),
        subtotal: posSubtotal,
        discount: posDiscountAmt,
        tax: posTaxAmt,
        total: posTotal,
        payment_mode: posPaymentMethod,
        notes: posNotes || undefined,
      });

      // Reset POS
      setPosCart([]);
      setSelectedProfileId("");
      setPosDiscount(0);
      setPosNotes("");
      fetchAllData();
      await refreshCatalog(true);
      showFeedback("Bill generated! Stock updated in database.");
    } catch (err: any) {
      alert(`POS Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Order status update (for admin order management)
  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder || !statusForm.status) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: statusForm.status as any,
          tracking_number: statusForm.tracking_number || null,
          shipping_carrier: statusForm.shipping_carrier || null,
        })
        .eq('id', statusModalOrder.id);
      if (error) throw error;
      setStatusModalOrder(null);
      setStatusForm({ status: "", tracking_number: "", shipping_carrier: "" });
      fetchAllData();
      showFeedback('Order status updated.');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  const handleLogout = async () => {
    try {
      if (!isMock) await supabase.auth.signOut();
      setUserSession(null);
      localStorage.removeItem("art_anchal_user");
      setView("home");
    } catch (err) {
      console.warn("Logout failed", err);
    }
  };

  // ── Access guard ──────────────────────────────────────────────────────────
  if (!userSession?.is_admin) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-[#FAF7F2] border border-brand-gold/25 p-10 text-center space-y-5">
          <Lock className="w-10 h-10 text-brand-maroon mx-auto stroke-[1.2]" />
          <h2 className="font-serif text-3xl text-brand-maroon font-light">{tAdmin("Restricted Area")}</h2>
          <p className="text-xs text-brand-warm-gray leading-relaxed">{tAdmin("Administrator credentials required.")}</p>
          <button onClick={() => setView("login-register")}
            className="w-full bg-brand-maroon text-[#FDFBF7] text-xs uppercase tracking-widest py-3.5 font-bold">
            {tAdmin("Sign In as Admin")}
          </button>
        </div>
      </div>
    );
  }

  // ── Nav items (Grouped by section for SaaS-grade UX) ─────────────────────
  const navSections = [
    {
      title: tAdmin("Dashboard"),
      items: [
        { id: "overview" as TabType, label: tAdmin("Overview"), icon: LayoutDashboard }
      ]
    },
    {
      title: tAdmin("Catalog & Inventory"),
      items: [
        { id: "catalog" as TabType, label: tAdmin("Catalog & Stock"), icon: ShoppingBag, badge: outOfStock.length || undefined }
      ]
    },
    {
      title: tAdmin("Sales"),
      items: [
        { id: "pos" as TabType, label: tAdmin("POS Bill"), icon: IndianRupee, badge: posCart.length > 0 ? posCart.reduce((sum, item) => sum + item.quantity, 0) : undefined },
        { id: "orders" as TabType, label: tAdmin("Order History"), icon: FileText }
      ]
    },
    {
      title: tAdmin("CRM"),
      items: [
        { id: "crm" as TabType, label: tAdmin("CRM Leads"), icon: Users, badge: dbLeads.filter(l => l.status === "new").length || undefined }
      ]
    },
    {
      title: tAdmin("Operations"),
      items: [
        { id: "hr" as TabType, label: tAdmin("HR & Staffing"), icon: UserPlus },
        { id: "finance" as TabType, label: tAdmin("Finance & Ledger"), icon: TrendingUp },
        { id: "vendors" as TabType, label: tAdmin("Vendors & Suppliers"), icon: Package }
      ]
    }
  ];

  const filteredSarees = dbSarees.filter(s =>
    s.is_active !== false &&
    s.name?.toLowerCase().includes(posSearch.toLowerCase())
  );
  const filteredLeads = dbLeads.filter(l =>
    l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.phone?.includes(leadSearch) || l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const filteredCatalogSarees = dbSarees.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          s.material?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          s.weaving_technique?.toLowerCase().includes(catalogSearch.toLowerCase());
    
    const stock = s.stock_quantity ?? 0;
    let matchesStock = true;
    if (catalogStockFilter === "in_stock") matchesStock = stock > 0;
    else if (catalogStockFilter === "out_of_stock") matchesStock = stock <= 0;
    else if (catalogStockFilter === "low_stock") matchesStock = stock > 0 && stock <= 2;

    const matchesDate = isWithinDateRange(s.created_at);
    const isActive = s.is_active !== false;

    return matchesSearch && matchesStock && matchesDate && isActive;
  });

  const CATALOG_ITEMS_PER_PAGE = 10;
  const totalCatalogPages = Math.ceil(filteredCatalogSarees.length / CATALOG_ITEMS_PER_PAGE) || 1;
  const currentCatalogPage = Math.min(catalogPage, totalCatalogPages);
  const paginatedCatalogSarees = filteredCatalogSarees.slice(
    (currentCatalogPage - 1) * CATALOG_ITEMS_PER_PAGE,
    currentCatalogPage * CATALOG_ITEMS_PER_PAGE
  );

  const filteredOrders = dbOrders.filter(o => {
    const matchesSearch = o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.invoice_number?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesDate = isWithinDateRange(o.created_at);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFBF7] font-sans text-brand-maroon pb-20 lg:pb-0" id="admin-console-view">

      {/* ── MOBILE TOP HEADER STRIP (simplified brand strip) ────────────── */}
      <div className="lg:hidden bg-[#1C050E] text-[#F9F5F0] flex items-center justify-between px-5 py-4 sticky top-0 z-[45] shadow-md print:hidden">
        <div>
          <span className="text-[8px] tracking-[0.25em] uppercase text-brand-gold font-bold">Art & Anchal</span>
          <p className="font-serif text-base font-light text-white">{tAdmin("Admin Console")}</p>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded text-[10px] font-sans font-bold hover:bg-brand-gold hover:text-[#1C050E] transition"
            title={language === "en" ? "हिंदी" : "EN"}
          >
            {language === "en" ? "हिंदी" : "EN"}
          </button>
          <button onClick={fetchAllData} disabled={loading} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/5 active:scale-95 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setView("home")} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/5 active:scale-95 transition" title={tAdmin("Back to Store")}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button onClick={handleLogout} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/5 active:scale-95 transition" title={tAdmin("Log Out")}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (Swiggy partner style) ────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c050edc] backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex justify-around items-center shadow-[0_-8px_24px_rgba(0,0,0,0.3)] print:hidden pb-safe">
        {/* Dashboard / Overview */}
        <button
          onClick={() => { setActiveTab("overview"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${
            activeTab === "overview" && !isMoreMenuOpen ? "text-brand-gold scale-105 font-bold" : "text-white/50"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider">{tAdmin("Overview")}</span>
        </button>

        {/* Catalog */}
        <button
          onClick={() => { setActiveTab("catalog"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 relative transition-all ${
            activeTab === "catalog" && !isMoreMenuOpen ? "text-brand-gold scale-105 font-bold" : "text-white/50"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider">{tAdmin("Catalog")}</span>
          {outOfStock.length ? (
            <span className="absolute top-0.5 right-2 bg-red-500 text-white text-[7px] font-bold px-1 rounded-full scale-90">
              {outOfStock.length}
            </span>
          ) : null}
        </button>

        {/* Generate Bill (POS) */}
        <button
          onClick={() => { setActiveTab("pos"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 relative transition-all ${
            activeTab === "pos" && !isMoreMenuOpen ? "text-brand-gold scale-105 font-bold" : "text-white/50"
          }`}
        >
          <IndianRupee className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider">{tAdmin("POS Bill")}</span>
          {posCart.length > 0 ? (
            <span className="absolute top-0.5 right-2 bg-brand-gold text-[#1C050E] text-[7px] font-bold px-1 rounded-full scale-90 min-w-[14px] text-center">
              {posCart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          ) : null}
        </button>

        {/* Orders */}
        <button
          onClick={() => { setActiveTab("orders"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${
            activeTab === "orders" && !isMoreMenuOpen ? "text-brand-gold scale-105 font-bold" : "text-white/50"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider">{tAdmin("Orders")}</span>
        </button>

        {/* Date Range Filter Button */}
        <button
          onClick={() => setIsDateRangeOpen(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 relative transition-all ${
            isDateRangeOpen ? "text-brand-gold scale-105 font-bold" : "text-white/50"
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider">{tAdmin("Filter")}</span>
          {(startDate !== getFirstDayOfMonth() || endDate !== getTodayDateString()) && (
            <span className="absolute top-0.5 right-2 w-2 h-2 bg-brand-gold rounded-full" />
          )}
        </button>

        {/* More Menu */}
        <button
          onClick={() => setIsMoreMenuOpen(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 relative transition-all ${
            isMoreMenuOpen ? "text-brand-gold scale-105 font-bold" : "text-white/50"
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider">{tAdmin("More")}</span>
          {/* Badge indicator if CRM has new leads */}
          {dbLeads.filter(l => l.status === "new").length ? (
            <span className="absolute top-0.5 right-2 bg-brand-gold text-[#1C050E] text-[7px] font-bold px-1 rounded-full scale-90">
              ●
            </span>
          ) : null}
        </button>
      </div>

      {/* ── MOBILE "MORE" BOTTOM SHEET OVERLAY (Swiggy partner style) ────────────── */}
      {isMoreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end transition-opacity print:hidden" onClick={() => setIsMoreMenuOpen(false)}>
          <div className="bg-[#1C050E] border-t border-brand-gold/25 rounded-t-3xl max-h-[75vh] overflow-y-auto flex flex-col p-6 space-y-6 shadow-2xl animate-slide-in-up" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <p className="text-[8px] tracking-[0.25em] uppercase text-brand-gold font-bold">{tAdmin("Additional Controls")}</p>
                <h3 className="font-serif text-lg text-white font-light">{tAdmin("Management Menu")}</h3>
              </div>
              <button onClick={() => setIsMoreMenuOpen(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid list of other tabs */}
            <div className="grid grid-cols-2 gap-4 pb-12">
              {/* CRM Leads */}
              <button
                onClick={() => { setActiveTab("crm"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition ${
                  activeTab === "crm" ? "bg-brand-gold/15 border-brand-gold text-brand-gold" : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-center">{tAdmin("CRM Leads")}</span>
                {dbLeads.filter(l => l.status === "new").length ? (
                  <span className="bg-brand-gold text-[#1C050E] text-[8px] font-bold px-2 py-0.5 rounded-full mt-1">
                    {dbLeads.filter(l => l.status === "new").length} {language === "hi" ? "नया" : "New"}
                  </span>
                ) : null}
              </button>

              {/* HR & Staffing */}
              <button
                onClick={() => { setActiveTab("hr"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition ${
                  activeTab === "hr" ? "bg-brand-gold/15 border-brand-gold text-brand-gold" : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <UserPlus className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-center">{tAdmin("HR & Staffing")}</span>
              </button>

              {/* Finance Ledger */}
              <button
                onClick={() => { setActiveTab("finance"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition ${
                  activeTab === "finance" ? "bg-brand-gold/15 border-brand-gold text-brand-gold" : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-center">{tAdmin("Finance")}</span>
              </button>

              {/* Vendors & Suppliers */}
              <button
                onClick={() => { setActiveTab("vendors"); setActiveInvoice(null); setIsMoreMenuOpen(false); }}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition ${
                  activeTab === "vendors" ? "bg-brand-gold/15 border-brand-gold text-brand-gold" : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <Package className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-center">{tAdmin("Vendors")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR (desktop only) ────────────────────────────────────── */}
      <aside className={`hidden lg:flex flex-shrink-0 bg-[#1C050E] text-[#F9F5F0] flex-col print:hidden sticky top-0 h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        {/* Brand & Collapse toggle */}
        <div className={`px-6 py-7 border-b border-white/10 flex items-center justify-between ${isSidebarCollapsed ? "flex-col gap-4 px-3" : ""}`}>
          {!isSidebarCollapsed && (
            <div>
              <span className="text-[9px] tracking-[0.3em] uppercase text-brand-gold font-bold block">Art & Anchal</span>
              <h1 className="font-serif text-lg font-light mt-0.5 text-white">{tAdmin("Admin Console")}</h1>
            </div>
          )}
          {isSidebarCollapsed && (
            <span className="text-[10px] tracking-wider uppercase text-brand-gold font-bold font-serif">A&A</span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition"
            title={isSidebarCollapsed ? tAdmin("Expand Sidebar") : tAdmin("Collapse Sidebar")}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isSidebarCollapsed && (
                <h3 className="px-4 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ id, label, icon: Icon, badge }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveTab(id);
                        setActiveInvoice(null);
                      }}
                      className={`w-full flex items-center rounded-lg text-left text-sm transition-all relative ${
                        isSidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-2.5"
                      } ${
                        active
                          ? "bg-brand-gold/20 text-brand-gold font-semibold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                      title={isSidebarCollapsed ? label : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-brand-gold" : ""}`} />
                        {!isSidebarCollapsed && <span>{label}</span>}
                      </span>
                      {!isSidebarCollapsed && badge ? (
                        <span className="bg-brand-gold text-[#1C050E] text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {badge}
                        </span>
                      ) : null}
                      {isSidebarCollapsed && badge ? (
                        <span className="absolute top-1.5 right-1.5 bg-brand-gold text-[#1C050E] text-[8px] font-bold px-1 rounded-full scale-90">
                          {badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`px-4 py-5 border-t border-white/10 space-y-3 ${isSidebarCollapsed ? "flex flex-col items-center px-2" : ""}`}>
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className={`w-full flex items-center justify-center gap-2 border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-[#1C050E] text-xs py-2 rounded-lg transition font-bold font-sans ${
              isSidebarCollapsed ? "px-0" : ""
            }`}
            title={language === "en" ? "हिंदी में बदलें" : "Switch to English"}
          >
            <Globe className="w-3.5 h-3.5" />
            {!isSidebarCollapsed && <span>{language === "en" ? "हिंदी (Hindi)" : "English"}</span>}
            {isSidebarCollapsed && <span>{language === "en" ? "हिं" : "EN"}</span>}
          </button>
          <button onClick={fetchAllData} disabled={loading}
            className={`w-full flex items-center justify-center gap-2 border border-white/15 text-white/60 hover:text-white text-xs py-2.5 rounded-lg transition ${
              isSidebarCollapsed ? "px-0" : ""
            }`}
            title={tAdmin("Sync Data")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {!isSidebarCollapsed && <span>{tAdmin("Sync Data")}</span>}
          </button>
          {/* Date Range Filter button (desktop sidebar) */}
          <button
            onClick={() => setIsDateRangeOpen(prev => !prev)}
            className={`w-full flex items-center justify-center gap-2 border text-xs py-2.5 rounded-lg transition ${
              isDateRangeOpen
                ? "bg-brand-gold/20 border-brand-gold/40 text-brand-gold"
                : "border-white/15 text-white/60 hover:text-white"
            } ${
              isSidebarCollapsed ? "px-0" : ""
            }`}
            title={tAdmin("Date Range")}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {!isSidebarCollapsed && (
              <span className="flex items-center gap-1.5">
                {tAdmin("Date Range")}
                {(startDate !== getFirstDayOfMonth() || endDate !== getTodayDateString()) && (
                  <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                )}
              </span>
            )}
          </button>
          <button onClick={() => setView("home")}
            className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white text-xs py-2 transition"
            title={tAdmin("Back to Store")}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 
            {!isSidebarCollapsed && <span>{tAdmin("Back to Store")}</span>}
          </button>
          <div className={`flex items-center gap-2 pt-1 ${isSidebarCollapsed ? "flex-col w-full text-center" : ""}`}>
            <div className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden flex-1 text-left">
                <p className="text-[10px] text-white font-semibold truncate">{userSession?.name}</p>
                <p className="text-[9px] text-white/40 truncate">{userSession?.email}</p>
              </div>
            )}
            <button onClick={handleLogout} className={`p-2 text-white/50 hover:text-white transition ${isSidebarCollapsed ? "w-full flex justify-center" : ""}`} title={tAdmin("Log Out")}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── DATE RANGE FLOATING PANEL ────────────────────────────────────── */}
      {isDateRangeOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-[199] print:hidden"
            onClick={() => setIsDateRangeOpen(false)}
          />
          {/* Floating panel — anchors bottom-left on mobile (above bottom nav), top-left on desktop (below sidebar header) */}
          <div className="fixed z-[200] bottom-16 left-2 right-2 sm:bottom-auto sm:top-20 sm:left-4 sm:right-auto lg:left-[calc(var(--sidebar-w,16rem)+1rem)] lg:top-4 print:hidden">
            <div className="bg-[#1C050E] border border-brand-gold/30 rounded-2xl shadow-2xl p-5 w-full sm:w-72 animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-brand-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{tAdmin("Date Range")}</span>
                </div>
                <button onClick={() => setIsDateRangeOpen(false)} className="text-white/40 hover:text-white transition p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-white/40 tracking-wider block">{tAdmin("From")}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 text-white px-3 py-2 text-xs focus:outline-none focus:border-brand-gold font-mono rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-white/40 tracking-wider block">{tAdmin("To")}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 text-white px-3 py-2 text-xs focus:outline-none focus:border-brand-gold font-mono rounded-lg"
                  />
                </div>
              </div>

              {/* Active range preview */}
              <p className="text-[10px] text-white/30 font-mono mt-3 text-center">
                {startDate} → {endDate}
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {(startDate !== getFirstDayOfMonth() || endDate !== getTodayDateString()) && (
                  <button
                    onClick={() => { setStartDate(getFirstDayOfMonth()); setEndDate(getTodayDateString()); }}
                    className="flex-1 text-[9px] uppercase font-bold tracking-wider text-brand-gold border border-brand-gold/30 py-2 rounded-lg hover:bg-brand-gold/10 transition"
                  >
                    {tAdmin("Reset")}
                  </button>
                )}
                <button
                  onClick={() => setIsDateRangeOpen(false)}
                  className="flex-1 text-[9px] uppercase font-bold tracking-wider bg-brand-gold text-[#1C050E] py-2 rounded-lg hover:bg-brand-gold/90 transition"
                >
                  {tAdmin("Apply")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">


        {/* Feedback toast */}
        {feedback && (
          <div className="fixed top-5 right-5 z-50 bg-[#1C050E] text-brand-ivory text-xs px-5 py-3.5 border border-brand-gold/30 flex items-center gap-2 shadow-2xl rounded-lg animate-fade-in print:hidden">
            <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
            {feedback}
          </div>
        )}

        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {activeInvoice ? (
            <InvoiceDocument invoice={activeInvoice} onBack={() => setActiveInvoice(null)} />
          ) : (
            <>

          {/* ══ OVERVIEW TAB ═══════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in print:hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-gold/10 pb-4">
                <div>
                  <h2 className="font-serif text-3xl text-brand-maroon font-light">{tAdmin("Dashboard Overview")}</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">{tAdmin("Art&Anchal Varanasi Boutique Management Console")}</p>
                </div>
                <div className="mt-2 md:mt-0 text-[10px] text-brand-warm-gray font-mono uppercase bg-brand-sand px-3 py-1.5 rounded select-none">
                  {tAdmin("System Live · Year ")}{new Date().getFullYear()}
                </div>
              </div>

              {/* Quick Transaction Action Bar */}
              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-maroon flex items-center gap-2 border-b border-brand-gold/10 pb-3">
                  <Sparkles className="w-4 h-4 text-brand-gold" /> {tAdmin("Quick Transaction Shortcuts")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button onClick={() => { setActiveTab("pos"); setActiveInvoice(null); }} className="flex items-center gap-3 p-3.5 border border-emerald-500/20 hover:border-emerald-600/40 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer active:scale-95 group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-700">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">{tAdmin("Add Sale")}</span>
                      <span className="text-[9px] text-emerald-600 font-sans block">{tAdmin("Generate POS Bill")}</span>
                    </div>
                  </button>
                  <button onClick={() => { setActiveTab("finance"); setActiveInvoice(null); setOpenFinancePurchaseModal(true); }} className="flex items-center gap-3 p-3.5 border border-rose-500/20 hover:border-rose-600/40 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer active:scale-95 group">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-700">
                      <Minus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">{tAdmin("Add Purchase")}</span>
                      <span className="text-[9px] text-rose-600 font-sans block">{tAdmin("Log vendor stock purchase")}</span>
                    </div>
                  </button>
                  <button onClick={() => { setActiveTab("finance"); setActiveInvoice(null); setOpenFinanceExpenseModal(true); }} className="flex items-center gap-3 p-3.5 border border-amber-500/20 hover:border-amber-600/40 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer active:scale-95 group">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">{tAdmin("Add Expense")}</span>
                      <span className="text-[9px] text-amber-600 font-sans block">{tAdmin("Record showroom expense")}</span>
                    </div>
                  </button>
                  <button onClick={() => { setActiveTab("crm"); setActiveInvoice(null); }} className="flex items-center gap-3 p-3.5 border border-brand-maroon/20 hover:border-brand-maroon/40 bg-brand-maroon/5 hover:bg-brand-maroon/10 rounded-xl transition-all cursor-pointer active:scale-95 group">
                    <div className="w-8 h-8 rounded-lg bg-brand-maroon/15 flex items-center justify-center text-brand-maroon">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-maroon block">{tAdmin("Add Party")}</span>
                      <span className="text-[9px] text-brand-maroon/70 font-sans block">{tAdmin("Log lead or customer")}</span>
                    </div>
                  </button>
                </div>
              </div>


              {/* ── Revenue & Profit Hero Cards ─────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Total Revenue */}
                <div
                  className="bg-[#1C050E] border border-brand-gold/25 rounded-xl p-5 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => setExpandedKpi(expandedKpi === "revenue" ? null : "revenue")}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">{tAdmin("Total Revenue")}</p>
                      <p className="font-serif text-3xl font-bold text-white">₹{totalRevenue.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-white/40">{tAdmin("All paid orders in date range")}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-brand-gold" />
                    </div>
                  </div>
                  {expandedKpi === "revenue" && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <p className="text-[9px] uppercase font-bold text-brand-gold tracking-wider mb-2">{tAdmin("Recent Orders")}</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {filteredDbOrders.length > 0 ? filteredDbOrders.slice(0, 3).map(o => (
                          <div key={o.id} className="flex justify-between text-[10px] py-1.5 border-b border-white/5 last:border-0">
                            <span className="text-white/60 truncate max-w-[60%]">{o.invoice_number || `SAL-${o.id.slice(0,5)}`} · {o.customer_name}</span>
                            <span className={`font-mono font-bold ${o.is_paid ? "text-emerald-400" : "text-red-400"}`}>+₹{Number(o.total ?? 0).toLocaleString("en-IN")}</span>
                          </div>
                        )) : <p className="text-[10px] text-white/30 italic">{tAdmin("No sales in this period")}</p>}
                      </div>
                      {filteredDbOrders.length > 3 && (
                        <div className="pt-1 text-left">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab("orders");
                            }}
                            className="text-[10px] font-bold text-brand-gold hover:underline cursor-pointer inline-block"
                          >
                            {tAdmin("View More Orders →")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Net Profit */}
                <div
                  className={`border rounded-xl p-5 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${
                    netProfit >= 0 ? "bg-emerald-900/80 border-emerald-500/25" : "bg-rose-900/80 border-rose-500/25"
                  }`}
                  onClick={() => setExpandedKpi(expandedKpi === "profit" ? null : "profit")}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className={`text-[10px] uppercase tracking-widest font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{tAdmin("Net Profit / Loss")}</p>
                      <p className="font-serif text-3xl font-bold text-white">₹{netProfit.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-white/40">{tAdmin("Revenue − Expenses − Purchases")}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                      netProfit >= 0 ? "bg-emerald-500/15 border-emerald-500/30" : "bg-rose-500/15 border-rose-500/30"
                    }`}>
                      <IndianRupee className={`w-6 h-6 ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`} />
                    </div>
                  </div>
                  {expandedKpi === "profit" && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5">
                      <p className="text-[9px] uppercase font-bold text-brand-gold tracking-wider mb-2">{tAdmin("Calculation Breakdown")}</p>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/60">{tAdmin("Total Revenue (Sales)")}</span>
                        <span className="text-emerald-400 font-mono font-bold">+₹{totalRevenue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/60">{tAdmin("Total Expenses")}</span>
                        <span className="text-rose-400 font-mono font-bold">−₹{totalExpenses.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/60">{tAdmin("Total Purchases Paid")}</span>
                        <span className="text-rose-400 font-mono font-bold">−₹{totalPurchasesPaid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2 mt-1 border-t border-white/15 font-bold">
                        <span className={netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>{netProfit >= 0 ? tAdmin("Net Profit") : tAdmin("Net Loss")}</span>
                        <span className="text-white font-mono">₹{netProfit.toLocaleString("en-IN")}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab("finance"); }} className="w-full mt-3 text-[9px] uppercase font-bold tracking-wider text-brand-gold border border-brand-gold/30 py-2 rounded-lg hover:bg-brand-gold/10 transition text-center">
                        {tAdmin("View Full Finance Ledger →")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Vyapar Transaction Summary Cards (Expandable) ─────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* To Collect (Receivables) */}
                <div
                  className={`bg-[#FAF7F2] border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${expandedKpi === "receivables" ? "border-amber-500/30 ring-1 ring-amber-500/20" : "border-brand-gold/15"}`}
                  onClick={() => setExpandedKpi(expandedKpi === "receivables" ? null : "receivables")}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-brand-warm-gray font-bold">{tAdmin("To Collect (Receivables)")}</p>
                      <p className="font-serif text-2xl font-bold text-amber-700">₹{totalReceivables.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-brand-warm-gray italic">{tAdmin("Customer unpaid dues")} · <span className="text-amber-600 not-italic font-bold">{tAdmin("Tap to view")}</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-amber-700" />
                    </div>
                  </div>
                  {expandedKpi === "receivables" && (
                    <div className="px-5 pb-5 space-y-2 border-t border-amber-500/15">
                      <p className="text-[9px] uppercase font-bold text-amber-700 tracking-wider pt-3 mb-1">{tAdmin("Pending Receivables")}</p>
                      {filteredDbDues.filter(d => d.due_type === "receivable" && d.status === "pending").length > 0
                        ? filteredDbDues.filter(d => d.due_type === "receivable" && d.status === "pending").map(d => (
                          <div key={d.id} className="flex justify-between text-[10px] py-1.5 border-b border-brand-gold/5 last:border-0">
                            <span className="text-brand-maroon font-semibold truncate max-w-[55%]">{d.entity_name}</span>
                            <span className="font-mono font-bold text-amber-700">₹{Number((d.total_amount ?? 0) - (d.amount_paid ?? 0)).toLocaleString("en-IN")}</span>
                          </div>
                        ))
                        : <p className="text-[10px] text-brand-warm-gray italic py-2">{tAdmin("No pending receivables")}</p>
                      }
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab("finance"); }} className="w-full mt-2 text-[9px] uppercase font-bold tracking-wider text-brand-maroon border border-brand-gold/20 py-2 rounded-lg hover:bg-brand-gold/10 transition">
                        {tAdmin("Go to Ledger →")}
                      </button>
                    </div>
                  )}
                </div>

                {/* To Pay (Payables) */}
                <div
                  className={`bg-[#FAF7F2] border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${expandedKpi === "payables" ? "border-rose-500/30 ring-1 ring-rose-500/20" : "border-brand-gold/15"}`}
                  onClick={() => setExpandedKpi(expandedKpi === "payables" ? null : "payables")}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-brand-warm-gray font-bold">{tAdmin("To Pay (Payables)")}</p>
                      <p className="font-serif text-2xl font-bold text-rose-700">₹{totalPayables.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-brand-warm-gray italic">{tAdmin("Vendor outstanding dues")} · <span className="text-rose-600 not-italic font-bold">{tAdmin("Tap to view")}</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-rose-700" />
                    </div>
                  </div>
                  {expandedKpi === "payables" && (
                    <div className="px-5 pb-5 space-y-2 border-t border-rose-500/15">
                      <p className="text-[9px] uppercase font-bold text-rose-700 tracking-wider pt-3 mb-1">{tAdmin("Outstanding Payables")}</p>
                      {filteredDbDues.filter(d => d.due_type === "payable" && d.status === "pending").length > 0
                        ? filteredDbDues.filter(d => d.due_type === "payable" && d.status === "pending").map(d => (
                          <div key={d.id} className="flex justify-between text-[10px] py-1.5 border-b border-brand-gold/5 last:border-0">
                            <span className="text-brand-maroon font-semibold truncate max-w-[55%]">{d.entity_name}</span>
                            <span className="font-mono font-bold text-rose-700">₹{Number((d.total_amount ?? 0) - (d.amount_paid ?? 0)).toLocaleString("en-IN")}</span>
                          </div>
                        ))
                        : <p className="text-[10px] text-brand-warm-gray italic py-2">{tAdmin("No pending payables")}</p>
                      }
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab("vendors"); }} className="w-full mt-2 text-[9px] uppercase font-bold tracking-wider text-brand-maroon border border-brand-gold/20 py-2 rounded-lg hover:bg-brand-gold/10 transition">
                        {tAdmin("Go to Vendors →")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Cash in Hand */}
                <div
                  className={`bg-[#FAF7F2] border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${expandedKpi === "cash" ? "border-emerald-500/30 ring-1 ring-emerald-500/20" : "border-brand-gold/15"}`}
                  onClick={() => setExpandedKpi(expandedKpi === "cash" ? null : "cash")}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-brand-warm-gray font-bold">{tAdmin("Cash in Hand")}</p>
                      <p className={`font-serif text-2xl font-bold ${cashInHand >= 0 ? "text-emerald-700" : "text-rose-700"}`}>₹{cashInHand.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-brand-warm-gray italic">{tAdmin("Physical showroom cash")} · <span className="text-emerald-600 not-italic font-bold">{tAdmin("Tap to view")}</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-emerald-700" />
                    </div>
                  </div>
                  {expandedKpi === "cash" && (
                    <div className="px-5 pb-5 space-y-1.5 border-t border-emerald-500/15">
                      <p className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider pt-3 mb-1">{tAdmin("Calculation Breakdown")}</p>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-brand-warm-gray">{tAdmin("Cash Sales (Inflow)")}</span>
                        <span className="font-mono font-bold text-emerald-700">
                          +₹{filteredDbOrders.filter(o => o.is_paid && o.payment_mode === "cash").reduce((sum, o) => sum + Number(o.total ?? 0), 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-brand-warm-gray">{tAdmin("Expenses (Outflow)")}</span>
                        <span className="font-mono font-bold text-rose-600">−₹{totalExpenses.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2 mt-1 border-t border-brand-gold/15 font-bold">
                        <span className="text-brand-maroon">{tAdmin("Net Cash")}</span>
                        <span className="font-mono">₹{cashInHand.toLocaleString("en-IN")}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab("finance"); }} className="w-full mt-2 text-[9px] uppercase font-bold tracking-wider text-brand-maroon border border-brand-gold/20 py-2 rounded-lg hover:bg-brand-gold/10 transition">
                        {tAdmin("View Expenses →")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Bank Balance */}
                <div
                  className={`bg-[#FAF7F2] border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${expandedKpi === "bank" ? "border-sky-500/30 ring-1 ring-sky-500/20" : "border-brand-gold/15"}`}
                  onClick={() => setExpandedKpi(expandedKpi === "bank" ? null : "bank")}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-brand-warm-gray font-bold">{tAdmin("Bank Balance")}</p>
                      <p className={`font-serif text-2xl font-bold ${bankBalance >= 0 ? "text-sky-700" : "text-rose-700"}`}>₹{bankBalance.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-brand-warm-gray italic">{tAdmin("Online/UPI/Ledger")} · <span className="text-sky-600 not-italic font-bold">{tAdmin("Tap to view")}</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-sky-700" />
                    </div>
                  </div>
                  {expandedKpi === "bank" && (
                    <div className="px-5 pb-5 space-y-1.5 border-t border-sky-500/15">
                      <p className="text-[9px] uppercase font-bold text-sky-700 tracking-wider pt-3 mb-1">{tAdmin("Calculation Breakdown")}</p>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-brand-warm-gray">{tAdmin("Online/Card/UPI Sales")}</span>
                        <span className="font-mono font-bold text-emerald-700">
                          +₹{filteredDbOrders.filter(o => o.is_paid && ["online","card","upi","bank_transfer"].includes(o.payment_mode)).reduce((sum, o) => sum + Number(o.total ?? 0), 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-brand-warm-gray">{tAdmin("Purchase Payments")}</span>
                        <span className="font-mono font-bold text-rose-600">−₹{totalPurchasesPaid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2 mt-1 border-t border-brand-gold/15 font-bold">
                        <span className="text-brand-maroon">{tAdmin("Net Bank")}</span>
                        <span className="font-mono">₹{bankBalance.toLocaleString("en-IN")}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab("finance"); }} className="w-full mt-2 text-[9px] uppercase font-bold tracking-wider text-brand-maroon border border-brand-gold/20 py-2 rounded-lg hover:bg-brand-gold/10 transition">
                        {tAdmin("View Purchases →")}
                      </button>
                    </div>
                  )}
                </div>
              </div>


              {/* Comparison chart (Sales vs Purchases) */}
              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-maroon flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-gold" /> {tAdmin("Sales vs Purchases Comparison")}
                  </h3>
                  <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-brand-maroon rounded-sm" />
                      <span className="text-brand-maroon">{tAdmin("Sales (Inflow)")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-brand-gold rounded-sm" />
                      <span className="text-brand-gold">{tAdmin("Purchases (Outflow)")}</span>
                    </div>
                  </div>
                </div>

                <div className="h-56 w-full flex items-end justify-between pt-6 px-4 pb-2 border-b border-brand-gold/10 gap-3">
                  {(() => {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const currentYear = new Date().getFullYear();
                    const data = months.map((m, index) => {
                      const sales = dbOrders
                        .filter(o => {
                          const d = new Date(o.created_at);
                          return d.getMonth() === index && d.getFullYear() === currentYear;
                        })
                        .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
                      const purchases = dbPurchases
                        .filter(p => {
                          const d = new Date(p.date || p.created_at);
                          return d.getMonth() === index && d.getFullYear() === currentYear;
                        })
                        .reduce((sum, p) => sum + Number(p.total_amount ?? 0), 0);
                      return { month: m, sales, purchases };
                    });
                    const currentMonthIndex = new Date().getMonth();
                    const startIndex = Math.max(0, currentMonthIndex - 5);
                    const last6Months = data.slice(startIndex, currentMonthIndex + 1);
                    const maxVal = Math.max(...last6Months.map(d => Math.max(d.sales, d.purchases)), 10000);

                    return last6Months.map(d => {
                      const salesPct = (d.sales / maxVal) * 100;
                      const purchasePct = (d.purchases / maxVal) * 100;
                      return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                          {/* Tooltip value */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 text-[8px] font-bold font-mono bg-[#1C050E] text-[#F9F5F0] px-2 py-1 rounded shadow-lg flex flex-col gap-0.5 whitespace-nowrap">
                            <span className="text-emerald-400">{language === "hi" ? "बिक्री" : "Sales"}: ₹{d.sales.toLocaleString("en-IN")}</span>
                            <span className="text-rose-400">{language === "hi" ? "खरीद" : "Purchases"}: ₹{d.purchases.toLocaleString("en-IN")}</span>
                          </div>
                          {/* Side-by-side bars */}
                          <div className="flex items-end justify-center gap-1 w-full h-full">
                            <div 
                              className="w-1/2 bg-brand-maroon hover:bg-brand-maroon/90 border-t border-brand-maroon transition-all duration-300 rounded-t-sm"
                              style={{ height: `${Math.max(4, salesPct)}%` }}
                            />
                            <div 
                              className="w-1/2 bg-brand-gold hover:bg-brand-gold/90 border-t border-brand-gold transition-all duration-300 rounded-t-sm"
                              style={{ height: `${Math.max(4, purchasePct)}%` }}
                            />
                          </div>
                          {/* Month Label */}
                          <span className="text-[9px] font-bold text-brand-warm-gray uppercase tracking-wider mt-1 select-none">
                            {d.month}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Daybook: Consolidated Transaction Feed */}
              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-maroon flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-gold" /> {tAdmin("Consolidated Daybook (Recent Transactions)")}
                  </h3>
                  <span className="text-[8px] font-mono uppercase bg-brand-sand px-2 py-1 rounded">{tAdmin("Live Feed")}</span>
                </div>
                <div className="overflow-x-auto border border-brand-gold/10 rounded-lg">
                  <table className="min-w-full divide-y divide-brand-gold/10 bg-white">
                    <thead className="bg-[#FAF7F2]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-brand-maroon">{tAdmin("Type")}</th>
                        <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-brand-maroon">{tAdmin("Ref No.")}</th>
                        <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-brand-maroon">{tAdmin("Date")}</th>
                        <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-brand-maroon">{tAdmin("Party / Category")}</th>
                        <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-brand-maroon">{tAdmin("Payment Mode")}</th>
                        <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-wider text-brand-maroon">{tAdmin("Status")}</th>
                        <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-wider text-brand-maroon">{tAdmin("Amount")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gold/10">
                      {daybookTransactions.map((tx) => (
                        <tr key={`${tx.type}-${tx.id}`} className="hover:bg-[#FAF7F2]/40 text-xs">
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              tx.type === "Sale" ? "bg-emerald-100 text-emerald-800" :
                              tx.type === "Purchase" ? "bg-rose-100 text-rose-800" :
                              "bg-amber-100 text-amber-800"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-brand-maroon font-semibold">{tx.number}</td>
                          <td className="px-4 py-3 text-brand-warm-gray font-mono text-[10px]">
                            {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-4 py-3 text-brand-maroon font-semibold">{tx.party}</td>
                          <td className="px-4 py-3 text-brand-warm-gray font-mono text-[10px]">{tx.mode}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${tx.colorClass}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-brand-maroon">
                            ₹{tx.amount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                      {daybookTransactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-xs text-brand-warm-gray italic">
                            {tAdmin("No transactions recorded for this period.")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alerts & Dues Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Low Stock Alerts */}
                <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-maroon flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" /> {tAdmin("Stock Alerts")}
                    </h3>
                    <span className="bg-red-100 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded">
                      {lowStockSarees.length} {language === "hi" ? "आइटम कम" : "Items Low"}
                    </span>
                  </div>
                  {lowStockSarees.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {lowStockSarees.map(s => (
                        <div key={s.id} className="flex justify-between items-center text-xs border-b border-brand-gold/5 pb-2.5 last:border-0 last:pb-0">
                          <div>
                            <span className="font-serif text-brand-maroon font-semibold block">{s.name}</span>
                            <span className="text-[9px] text-brand-warm-gray">{s.category} · {s.weaving_technique}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                              (s.stock_quantity ?? 0) <= 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {(s.stock_quantity ?? 0) <= 0 ? tAdmin("OUT OF STOCK") : `${s.stock_quantity} ${language === "hi" ? "शेष" : "left"}`}
                            </span>
                            <button onClick={() => { setActiveTab("vendors"); }} className="text-[10px] font-bold text-brand-maroon hover:underline flex items-center gap-0.5">
                              {language === "hi" ? "खरीदें" : "Buy"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-brand-warm-gray/60 italic">
                      {tAdmin("All inventory quantities are healthy.")}
                    </div>
                  )}
                </div>

                {/* Pending Collections / Outstanding Receivables */}
                <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-maroon flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-600" /> {tAdmin("Pending Receivables")}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                      {tAdmin("Collection Tracker")}
                    </span>
                  </div>
                  {dbDues.filter(d => d.due_type === "receivable" && d.status === "pending").length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {dbDues.filter(d => d.due_type === "receivable" && d.status === "pending").map(due => (
                        <div key={due.id} className="flex justify-between items-center text-xs border-b border-brand-gold/5 pb-2.5 last:border-0 last:pb-0">
                          <div>
                            <span className="font-serif text-brand-maroon font-semibold block">{due.entity_name}</span>
                            {due.due_date && (
                              <span className="text-[9px] text-brand-warm-gray block font-mono">
                                {language === "hi" ? "नियत तिथि" : "Due Date"}: {new Date(due.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            )}
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="font-mono font-bold text-rose-600 block">₹{Number(due.total_amount - due.amount_paid).toLocaleString("en-IN")}</span>
                              <span className="text-[9px] text-brand-warm-gray block">{language === "hi" ? "कुल ₹ में से" : "of ₹"}{due.total_amount?.toLocaleString("en-IN")}</span>
                            </div>
                            <button onClick={() => setActiveTab("finance")} className="text-[10px] font-bold text-brand-maroon hover:underline">
                              {language === "hi" ? "भुगतान" : "Pay"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-brand-warm-gray/60 italic">
                      {tAdmin("No pending customer outstanding receivables.")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* ══ CATALOG TAB ════════════════════════════════════════════════ */}
          {activeTab === "catalog" && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-3xl text-brand-maroon font-light">{tAdmin("Saree Catalog & Stock")}</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">
                    {dbSarees.filter(s => s.is_active !== false).length} {language === "hi" ? "आइटम इन्वेंटरी में" : "items in inventory"}
                  </p>
                </div>
                <button onClick={() => { setEditingSaree(null); setSareeForm({ ...emptySaree }); setSlotPreview(["","",""]); setSlotError(["","",""]); setSlotUploading([false,false,false]); setSlotProgress([0,0,0]); setUrlInputMode(false); setSareeModalTab("basic"); setIsSareeModalOpen(true); }}
                  className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-5 py-3 font-bold flex items-center gap-2 hover:bg-brand-maroon/90 transition">
                  <Plus className="w-4 h-4" /> {tAdmin("Add Saree")}
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row gap-3 bg-[#FAF7F2] border border-brand-gold/15 p-4 rounded-lg">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      setCatalogPage(1);
                    }}
                    placeholder={tAdmin("Search catalog by name or code...")}
                    className="w-full bg-[#FAF7F2] border border-brand-gold/20 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-maroon"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={catalogStockFilter}
                    onChange={(e) => {
                      setCatalogStockFilter(e.target.value);
                      setCatalogPage(1);
                    }}
                    className="w-full bg-[#FAF7F2] border border-brand-gold/20 px-3 py-2.5 text-xs focus:outline-none focus:border-brand-maroon"
                  >
                    <option value="all">{tAdmin("All Stock Status")}</option>
                    <option value="in_stock">{tAdmin("In Stock")}</option>
                    <option value="low_stock">{language === "hi" ? "कम स्टॉक (≤ 2)" : "Low Stock (≤ 2)"}</option>
                    <option value="out_of_stock">{tAdmin("Out of Stock")}</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden">
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#1C050E] text-[#F9F5F0] text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3.5">{tAdmin("Product")}</th>
                        <th className="px-4 py-3.5">{tAdmin("Technique")}</th>
                        <th className="px-4 py-3.5">{tAdmin("Price")}</th>
                        <th className="px-4 py-3.5 text-center">{tAdmin("Stock")}</th>
                        <th className="px-4 py-3.5 text-center">{tAdmin("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gold/10">
                      {paginatedCatalogSarees.map(s => {
                        const stock = s.stock_quantity ?? 0;
                        const stockColor = stock <= 0 ? "text-red-700 bg-red-50" : stock <= 2 ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50";
                        return (
                          <tr key={s.id} className="hover:bg-brand-sand/10 transition">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-12 bg-brand-sand overflow-hidden border border-brand-gold/20 flex-shrink-0 rounded">
                                  <img src={s.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-serif font-semibold text-[13px] text-brand-maroon leading-tight">{s.name}</p>
                                  <div className="flex gap-1 mt-0.5">
                                    {s.is_bestseller && <span className="text-[8px] bg-brand-gold/20 text-brand-gold-dark px-1.5 py-0.5 rounded font-bold uppercase">{language === "hi" ? "सर्वश्रेष्ठ विक्रेता" : "Bestseller"}</span>}
                                    {s.is_featured && <span className="text-[8px] bg-brand-maroon/10 text-brand-maroon px-1.5 py-0.5 rounded font-bold uppercase">{language === "hi" ? "विशेष" : "Featured"}</span>}
                                    {s.is_new && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">{language === "hi" ? "नया" : "New"}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-brand-warm-gray">{s.weaving_technique}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-mono font-bold">₹{Number(s.price).toLocaleString("en-IN")}</p>
                              {s.original_price && <p className="text-[10px] text-brand-warm-gray line-through font-mono">₹{Number(s.original_price).toLocaleString("en-IN")}</p>}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${stockColor}`}>
                                {stock <= 0 ? tAdmin("Out of Stock") : (language === "hi" ? `${stock} पीस` : `${stock} pcs`)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => handleOpenEditSaree(s)} className="text-brand-gold-dark hover:text-brand-maroon transition" title={tAdmin("Edit")}>
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteSaree(s.id)} className="text-red-600 hover:text-red-800 transition" title={language === "hi" ? "हटाएं" : "Remove"}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Card Grid */}
                <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
                  {paginatedCatalogSarees.map(s => {
                    const stock = s.stock_quantity ?? 0;
                    const stockColor = stock <= 0 ? "text-red-700 bg-red-50" : stock <= 2 ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50";
                    return (
                      <div key={s.id} className="glass-card p-4 flex flex-col space-y-2">
                        <div className="flex items-center gap-3">
                          <img src={s.images?.[0]} alt="" className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="font-serif font-semibold text-sm text-brand-maroon">{s.name}</p>
                            <p className="text-xs text-brand-warm-gray">{s.weaving_technique}</p>
                          </div>
                        </div>
                        <p className="font-mono font-bold">₹{Number(s.price).toLocaleString("en-IN")}</p>
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${stockColor}`}>
                          {stock <= 0 ? tAdmin("Out of Stock") : (language === "hi" ? `${stock} पीस` : `${stock} pcs`)}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEditSaree(s)} className="text-brand-gold-dark hover:text-brand-maroon transition" title={tAdmin("Edit")}><Edit className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteSaree(s.id)} className="text-red-600 hover:text-red-800 transition" title={language === "hi" ? "हटाएं" : "Remove"}><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {paginatedCatalogSarees.length === 0 && (
                  <div className="py-16 text-center text-xs text-brand-warm-gray italic">
                    {tAdmin("No sarees match your search/filter parameters.")}
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalCatalogPages > 1 && (
                <div className="flex items-center justify-between bg-[#FAF7F2] border border-brand-gold/15 p-4 rounded-lg">
                  <span className="text-xs text-brand-warm-gray">
                    {language === "hi" ? (
                      <>पृष्ठ <strong className="text-brand-maroon">{currentCatalogPage}</strong> का <strong className="text-brand-maroon">{totalCatalogPages}</strong> (कुल <strong className="text-brand-maroon">{filteredCatalogSarees.length}</strong> आइटम) दिखा रहा है</>
                    ) : (
                      <>Showing Page <strong className="text-brand-maroon">{currentCatalogPage}</strong> of <strong className="text-brand-maroon">{totalCatalogPages}</strong> ({filteredCatalogSarees.length} items total)</>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCatalogPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentCatalogPage === 1}
                      className="p-1.5 rounded border border-brand-gold/20 text-brand-maroon hover:bg-brand-gold/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title={language === "hi" ? "पिछला पृष्ठ" : "Previous Page"}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCatalogPage((prev) => Math.min(prev + 1, totalCatalogPages))}
                      disabled={currentCatalogPage === totalCatalogPages}
                      className="p-1.5 rounded border border-brand-gold/20 text-brand-maroon hover:bg-brand-gold/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title={language === "hi" ? "अगला पृष्ठ" : "Next Page"}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ CRM TAB ════════════════════════════════════════════════════ */}
          {activeTab === "crm" && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-3xl text-brand-maroon font-light">{tAdmin("CRM Customer Pipeline")}</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">{dbLeads.length} {language === "hi" ? "कुल लीड्स" : "total leads"}</p>
                </div>
                <button onClick={() => setIsNewLeadModalOpen(true)}
                  className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-5 py-3 font-bold flex items-center gap-2 hover:bg-brand-maroon/90 transition">
                  <Plus className="w-4 h-4" /> {tAdmin("Add Manual Lead")}
                </button>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: language === "hi" ? "नया" : "New", status: "new", color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: language === "hi" ? "संपर्क किया" : "Contacted", status: "contacted", color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { label: language === "hi" ? "योग्य" : "Qualified", status: "qualified", color: "bg-purple-50 border-purple-200 text-purple-700" },
                  { label: language === "hi" ? "सफल" : "Won", status: "won", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map(st => (
                  <div key={st.status} className={`border rounded-lg p-4 text-center ${st.color}`}>
                    <p className="text-[10px] uppercase font-bold">{st.label}</p>
                    <p className="font-serif text-2xl font-bold">{dbLeads.filter(l => l.status === st.status).length}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Leads list */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                    <input type="text" value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                      placeholder={language === "hi" ? "नाम, फोन या ईमेल से खोजें..." : "Search by name, phone or email..."}
                      className="w-full bg-[#FAF7F2] border border-brand-gold/20 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-maroon" />
                  </div>

                  <div className="space-y-2 max-h-[540px] overflow-y-auto">
                    {filteredLeads.map(lead => {
                      const active = selectedLead?.id === lead.id;
                      const displayStatus = lead.status === "new" ? (language === "hi" ? "नया" : "new") :
                                            lead.status === "contacted" ? (language === "hi" ? "संपर्क किया" : "contacted") :
                                            lead.status === "qualified" ? (language === "hi" ? "योग्य" : "qualified") :
                                            lead.status === "won" ? (language === "hi" ? "सफल" : "won") : lead.status;
                      return (
                        <div key={lead.id} onClick={() => handleSelectLead(lead)}
                          className={`border p-4 cursor-pointer transition rounded-lg ${
                            active ? "border-brand-maroon bg-brand-sand/15 shadow-sm" : "border-brand-gold/20 hover:border-brand-gold/50 bg-[#FAF7F2]"
                          }`}>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-serif font-semibold text-brand-maroon">{lead.name}</h4>
                                <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                  lead.status === "new" ? "bg-blue-100 text-blue-800" :
                                  lead.status === "contacted" ? "bg-amber-100 text-amber-800" :
                                  lead.status === "qualified" ? "bg-purple-100 text-purple-800" :
                                  lead.status === "won" ? "bg-emerald-100 text-emerald-800" :
                                  "bg-gray-100 text-gray-700"
                                }`}>{displayStatus}</span>
                                <span className="text-[8px] uppercase font-mono border border-brand-gold/30 text-brand-gold px-1.5 py-0.5">{lead.source}</span>
                              </div>
                              <p className="text-[10px] text-brand-warm-gray font-mono">{lead.phone} {lead.email && `• ${lead.email}`}</p>
                              {lead.interest && <p className="text-[10px] text-brand-maroon/70 italic">{language === "hi" ? "रुचि: " : "Interest: "}{lead.interest}</p>}
                              {lead.message && <p className="text-xs text-brand-maroon font-serif italic truncate max-w-xs">&ldquo;{lead.message}&rdquo;</p>}
                            </div>
                            <span className="text-[9px] text-brand-warm-gray font-mono flex-shrink-0 ml-2">
                              {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {filteredLeads.length === 0 && (
                      <p className="text-center text-xs text-brand-warm-gray italic py-12">{language === "hi" ? "कोई लीड नहीं मिली।" : "No leads found."}</p>
                    )}
                  </div>
                </div>

                {/* Interaction panel */}
                <div ref={interactionPanelRef} className="lg:col-span-5 space-y-4">
                  <h3 className="font-serif text-lg text-brand-maroon border-b border-brand-gold/15 pb-2">{language === "hi" ? "बातचीत का ब्यौरा" : "Interaction Log"}</h3>
                  {selectedLead ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-[#FAF7F2] border border-brand-gold/20 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-semibold text-brand-maroon">{selectedLead.name}</h4>
                            <p className="text-[10px] text-brand-warm-gray">{selectedLead.phone}</p>
                          </div>
                          <select value={selectedLead.status}
                            onChange={e => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                            className="bg-brand-ivory border border-brand-gold/25 text-brand-maroon text-xs px-2 py-1.5 focus:outline-none">
                            <option value="new">{language === "hi" ? "नया" : "New"}</option>
                            <option value="contacted">{language === "hi" ? "संपर्क किया" : "Contacted"}</option>
                            <option value="qualified">{language === "hi" ? "योग्य" : "Qualified"}</option>
                            <option value="proposal">{language === "hi" ? "प्रस्ताव" : "Proposal"}</option>
                            <option value="won">{language === "hi" ? "सफल ✓" : "Won ✓"}</option>
                            <option value="lost">{language === "hi" ? "असफल" : "Lost"}</option>
                          </select>
                        </div>
                      </div>

                      <form onSubmit={handleAddInteraction} className="bg-[#FAF7F2] border border-brand-gold/20 p-4 rounded-lg space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-brand-maroon">{language === "hi" ? "गतिविधि दर्ज करें" : "Log Activity"}</h4>
                        <select value={interactionChannel} onChange={e => setInteractionChannel(e.target.value)}
                          className="w-full bg-brand-ivory border border-brand-gold/20 px-2.5 py-2 text-xs focus:outline-none">
                          <option value="phone">{language === "hi" ? "फ़ोन कॉल" : "Phone Call"}</option>
                          <option value="whatsapp">{language === "hi" ? "व्हाट्सएप" : "WhatsApp"}</option>
                          <option value="email">{language === "hi" ? "ईमेल" : "Email"}</option>
                          <option value="in_person_showroom">{language === "hi" ? "शोरूम विज़िट" : "Showroom Visit"}</option>
                        </select>
                        <textarea rows={3} required value={newInteractionNote}
                          onChange={e => setNewInteractionNote(e.target.value)}
                          placeholder={language === "hi" ? "इस बातचीत के मुख्य बिंदु..." : "Notes from this interaction..."}
                          className="w-full bg-brand-ivory border border-brand-gold/20 px-2.5 py-2 text-xs focus:outline-none focus:border-brand-maroon resize-none" />
                        <button type="submit"
                          className="w-full bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest py-2.5 font-bold hover:bg-brand-maroon/90 transition">
                          {language === "hi" ? "प्रविष्टि दर्ज करें" : "Log Entry"}
                        </button>
                      </form>

                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {leadInteractions.map(inter => {
                          const displayChannel = inter.channel === "phone" ? (language === "hi" ? "फ़ोन कॉल" : "Phone Call") :
                                                 inter.channel === "whatsapp" ? (language === "hi" ? "व्हाट्सएप" : "WhatsApp") :
                                                 inter.channel === "email" ? (language === "hi" ? "ईमेल" : "Email") :
                                                 inter.channel === "in_person_showroom" ? (language === "hi" ? "शोरूम विज़िट" : "Showroom Visit") :
                                                 inter.channel?.replace(/_/g, " ");
                          return (
                            <div key={inter.id} className="border-l-2 border-brand-gold pl-3 py-1 space-y-0.5">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[9px] uppercase font-bold text-brand-gold">{displayChannel}</span>
                                <span className="text-[9px] font-mono text-brand-warm-gray">
                                  {new Date(inter.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-xs text-brand-maroon font-serif italic">&ldquo;{inter.notes}&rdquo;</p>
                            </div>
                          );
                        })}
                        {leadInteractions.length === 0 && (
                          <p className="text-xs text-brand-warm-gray italic text-center py-4">{language === "hi" ? "अभी तक कोई बातचीत दर्ज नहीं की गई है।" : "No interactions logged yet."}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-brand-gold/25 rounded-lg py-20 text-center text-xs text-brand-warm-gray">
                      {language === "hi" ? "बातचीत का इतिहास देखने के लिए लीड चुनें।" : "Select a lead to view interaction history."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ POS TAB ════════════════════════════════════════════════════ */}
          {activeTab === "pos" && !activeInvoice && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div>
                <h2 className="font-serif text-3xl text-brand-maroon font-light">{language === "hi" ? "शोरूम बिल बनाएं" : "Generate Showroom Bill"}</h2>
                <p className="text-xs text-brand-warm-gray mt-0.5">{language === "hi" ? "स्वचालित स्टॉक कटौती के साथ पीओएस बिलिंग" : "POS billing with automatic stock deduction"}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Customer + Products */}
                <div className="lg:col-span-7 space-y-5">

                  {/* Step 1: Customer */}
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-brand-gold/10 pb-3">
                      <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-maroon">
                        <span className="text-brand-gold mr-1.5">1.</span> {language === "hi" ? "ग्राहक" : "Customer"}
                      </h3>
                      <button onClick={() => setIsNewProfileModalOpen(true)}
                        className="text-[10px] uppercase font-bold text-brand-gold hover:text-brand-maroon flex items-center gap-1 transition">
                        <Plus className="w-3 h-3" /> {language === "hi" ? "नया ग्राहक" : "New Customer"}
                      </button>
                    </div>
                    <div className="relative">
                      {selectedProfileId ? (
                        (() => {
                          const p = dbProfiles.find(x => x.id === selectedProfileId);
                          return p ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs space-y-0.5 relative group">
                              <p className="font-bold text-emerald-800">{p.name}</p>
                              {p.phone && <p className="text-emerald-700 font-mono">{p.phone}</p>}
                              {p.email && <p className="text-emerald-700">{p.email}</p>}
                              <button onClick={() => { setSelectedProfileId(""); setPosCustomerSearch(""); }}
                                className="absolute top-3 right-3 text-emerald-600 hover:text-emerald-900 text-[10px] font-bold uppercase underline">
                                {language === "hi" ? "बदलें" : "Change"}
                              </button>
                            </div>
                          ) : null;
                        })()
                      ) : (
                        <div ref={customerDropdownRef} className="space-y-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                            <input
                              type="text"
                              value={posCustomerSearch}
                              onChange={e => { setPosCustomerSearch(e.target.value); setIsCustomerDropdownOpen(true); }}
                              onFocus={() => setIsCustomerDropdownOpen(true)}
                              placeholder={language === "hi" ? "नाम, फोन या ईमेल से खोजें..." : "Search by name, phone or email..."}
                              className="w-full bg-brand-ivory border border-brand-gold/20 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-maroon"
                            />
                          </div>
                          {isCustomerDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-brand-gold/20 shadow-xl max-h-48 overflow-y-auto">
                              {dbProfiles.filter(p => p.name?.toLowerCase().includes(posCustomerSearch.toLowerCase()) || p.phone?.includes(posCustomerSearch) || p.email?.toLowerCase().includes(posCustomerSearch.toLowerCase())).length > 0 ? (
                                dbProfiles.filter(p => p.name?.toLowerCase().includes(posCustomerSearch.toLowerCase()) || p.phone?.includes(posCustomerSearch) || p.email?.toLowerCase().includes(posCustomerSearch.toLowerCase())).map(p => (
                                  <button key={p.id} onClick={() => { setSelectedProfileId(p.id); setIsCustomerDropdownOpen(false); setPosCustomerSearch(""); }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-brand-sand/30 border-b border-brand-gold/5 transition flex flex-col">
                                    <span className="font-bold text-brand-maroon">{p.name}</span>
                                    <span className="text-[10px] text-brand-warm-gray font-mono">{p.phone ? `${p.phone}` : ""} {p.email ? `• ${p.email}` : ""}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-brand-warm-gray italic">{language === "hi" ? "कोई मेल खाने वाला ग्राहक नहीं मिला" : "No matching customers"}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Products */}
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-4">
                    <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-maroon border-b border-brand-gold/10 pb-3">
                      <span className="text-brand-gold mr-1.5">2.</span> {language === "hi" ? "साड़ी चुनें" : "Select Sarees"}
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                      <input type="text" value={posSearch} onChange={e => setPosSearch(e.target.value)}
                        placeholder={language === "hi" ? "साड़ी खोजें..." : "Search sarees..."} className="w-full bg-brand-ivory border border-brand-gold/20 pl-9 pr-4 py-2 text-xs focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {filteredSarees.map(saree => {
                        const stock = saree.stock_quantity ?? 0;
                        const outOfStockItem = stock <= 0;
                        const inCartQty = posCart.find(i => i.saree.id === saree.id)?.quantity || 0;
                        return (
                          <button key={saree.id} onClick={() => !outOfStockItem && handlePOSAdd(saree)}
                            disabled={outOfStockItem}
                            className={`border p-3 flex gap-3 items-start text-left transition rounded-lg ${
                              outOfStockItem
                                ? "border-red-200 bg-red-50/50 opacity-60 cursor-not-allowed"
                                : "border-brand-gold/15 hover:border-brand-maroon bg-brand-ivory cursor-pointer"
                            }`}>
                            <div className="w-8 h-11 bg-brand-sand overflow-hidden border border-brand-gold/20 flex-shrink-0 rounded">
                              <img src={saree.images?.[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <p className="font-serif font-semibold text-xs text-brand-maroon leading-tight truncate">{saree.name}</p>
                              <p className="text-[9px] text-brand-gold uppercase">{saree.weaving_technique}</p>
                              <p className="text-[10px] font-mono font-bold">₹{Number(saree.price).toLocaleString("en-IN")}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full inline-block ${
                                  outOfStockItem ? "bg-red-100 text-red-700" :
                                  stock <= 2 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                }`}>
                                  {outOfStockItem ? (language === "hi" ? "स्टॉक में नहीं है" : "Out of Stock") : (language === "hi" ? `${stock} स्टॉक में` : `${stock} in stock`)}
                                </span>
                                {inCartQty > 0 && (
                                  <span className="bg-brand-maroon text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full inline-block">
                                    {language === "hi" ? `${inCartQty} कार्ट में` : `${inCartQty} in cart`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Notes */}
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-2">
                    <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-maroon">
                      <span className="text-brand-gold mr-1.5">3.</span> {language === "hi" ? "बिल विवरण/नोट्स (वैकल्पिक)" : "Bill Notes (optional)"}
                    </h3>
                    <textarea rows={2} value={posNotes} onChange={e => setPosNotes(e.target.value)}
                      placeholder={language === "hi" ? "जैसे- कस्टम ब्लाउज़, डिलीवरी की तारीख, परिवर्तन आदि..." : "E.g. custom blouse, delivery date, alterations..."}
                      className="w-full bg-brand-ivory border border-brand-gold/20 px-3 py-2 text-xs focus:outline-none focus:border-brand-maroon resize-none" />
                  </div>
                </div>

                {/* Right: Cart + Checkout */}
                <div className="lg:col-span-5">
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-5 sticky top-6">
                    <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-maroon border-b border-brand-gold/10 pb-3">
                      {language === "hi" ? "बिलिंग कार्ट" : "Billing Cart"}
                    </h3>

                    {posCart.length === 0 ? (
                      <p className="text-xs italic text-brand-warm-gray/60 py-8 text-center">{language === "hi" ? "कार्ट खाली है। जोड़ने के लिए साड़ी पर क्लिक करें।" : "Cart is empty. Click sarees to add."}</p>
                    ) : (
                      <div className="space-y-4">
                        {/* Items */}
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                          {posCart.map(item => (
                            <div key={item.saree.id} className="bg-white border border-brand-gold/10 rounded-lg p-3.5 space-y-3">
                              {/* Row 1: Name + Remove */}
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-serif font-semibold text-xs text-brand-maroon leading-tight flex-1 min-w-0 truncate">{item.saree.name}</p>
                                <button onClick={() => setPosCart(c => c.filter(i => i.saree.id !== item.saree.id))}
                                  className="text-red-400 hover:text-red-600 transition flex-shrink-0 p-0.5">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Row 2: Price + Qty + Line Total (stacked on mobile, inline on lg) */}
                              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-2">
                                {/* Price */}
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-brand-warm-gray tracking-wider block">
                                    {language === "hi" ? "कीमत (₹)" : "Price (₹)"}
                                  </label>
                                  <input 
                                    type="number" 
                                    min="0"
                                    value={item.customPrice ?? item.saree.price}
                                    onChange={e => handlePOSPriceChange(item.saree.id, Number(e.target.value))}
                                    className="w-full bg-brand-ivory border border-brand-gold/15 px-2.5 py-1.5 text-xs font-mono text-brand-maroon focus:outline-none focus:border-brand-maroon font-bold rounded"
                                  />
                                  {item.customPrice !== undefined && item.customPrice !== item.saree.price && (
                                    <span className="text-[8px] line-through text-brand-warm-gray/50 font-mono block mt-0.5">MRP ₹{item.saree.price}</span>
                                  )}
                                </div>

                                {/* Quantity */}
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-brand-warm-gray tracking-wider block">
                                    {language === "hi" ? "मात्रा" : "Qty"}
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <button 
                                      type="button"
                                      onClick={() => handlePOSQty(item.saree.id, -1)}
                                      className="w-8 h-8 border border-brand-gold/30 flex items-center justify-center hover:bg-brand-maroon hover:text-white transition rounded flex-shrink-0 text-base font-bold text-brand-maroon select-none">
                                      -
                                    </button>
                                    <input 
                                      type="number"
                                      min="1"
                                      max={item.saree.stock_quantity ?? 999}
                                      value={item.quantity || ""}
                                      onChange={e => {
                                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                                        setPosCart(prev => prev.map(i => i.saree.id === item.saree.id ? { ...i, quantity: val } : i));
                                      }}
                                      onBlur={() => {
                                        setPosCart(prev => prev.map(i => {
                                          if (i.saree.id !== item.saree.id) return i;
                                          const val = Math.max(1, Math.min(i.saree.stock_quantity ?? 999, i.quantity || 1));
                                          return { ...i, quantity: val };
                                        }));
                                      }}
                                      className="w-full lg:w-14 text-center font-mono text-xs font-bold py-1.5 bg-brand-ivory border border-brand-gold/15 rounded focus:outline-none focus:border-brand-maroon hide-spin"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => handlePOSQty(item.saree.id, 1)}
                                      className="w-8 h-8 border border-brand-gold/30 flex items-center justify-center hover:bg-brand-maroon hover:text-white transition rounded flex-shrink-0 text-base font-bold text-brand-maroon select-none">
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Line Total (mobile only row) */}
                                <div className="flex items-center justify-between border-t border-brand-gold/10 pt-2 mt-1 lg:hidden">
                                  <span className="text-[10px] uppercase font-bold text-brand-warm-gray tracking-wider">
                                    {language === "hi" ? "कुल" : "Total"}
                                  </span>
                                  <span className="font-mono font-bold text-xs text-brand-maroon">
                                    ₹{Number((item.customPrice ?? item.saree.price) * item.quantity).toLocaleString("en-IN")}
                                  </span>
                                </div>

                                {/* Line Total (desktop only column) */}
                                <div className="hidden lg:flex items-end justify-end col-span-1 pb-1">
                                  <p className="font-mono font-bold text-xs text-brand-maroon">
                                    {language === "hi" ? "कुल: " : "Total: "}₹{Number((item.customPrice ?? item.saree.price) * item.quantity).toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Discount */}
                        <div className="border-t border-brand-gold/10 pt-3 space-y-1">
                          <label className="text-[10px] uppercase font-bold text-brand-warm-gray tracking-wider block">
                            <Tag className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                            {language === "hi" ? "छूट (₹)" : "Discount (₹)"}
                          </label>
                          <input type="number" min={0} max={posSubtotal} value={posDiscount || ""}
                            onChange={e => setPosDiscount(Number(e.target.value))}
                            placeholder="0"
                            className="w-full bg-brand-ivory border border-brand-gold/20 px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-maroon rounded" />
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-brand-gold/10 pt-3 text-xs">
                          <div className="flex justify-between text-brand-warm-gray">
                            <span>{language === "hi" ? "उप-योग" : "Subtotal"}</span>
                            <span className="font-mono">₹{posSubtotal.toLocaleString("en-IN")}</span>
                          </div>
                          {posDiscountAmt > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>{language === "hi" ? "छूट" : "Discount"}</span>
                              <span className="font-mono">−₹{posDiscountAmt.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-brand-warm-gray">
                            <span>{language === "hi" ? "जीएसटी (CGST 2.5% + SGST 2.5%)" : "GST (CGST 2.5% + SGST 2.5%)"}</span>
                            <span className="font-mono">₹{posTaxAmt.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm border-t border-brand-maroon/15 pt-2 text-brand-maroon">
                            <span>{language === "hi" ? "कुल योग" : "Grand Total"}</span>
                            <span className="font-mono">₹{posTotal.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-brand-maroon block">{language === "hi" ? "भुगतान का प्रकार" : "Payment Method"}</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "cash", label: language === "hi" ? "नकद" : "Cash" },
                              { id: "upi", label: language === "hi" ? "यूपीआई" : "UPI" },
                              { id: "card", label: language === "hi" ? "कार्ड" : "Card" },
                              { id: "bank_transfer", label: language === "hi" ? "बैंक ट्रांसफर" : "Bank Transfer" },
                            ].map(pay => (
                              <button key={pay.id} type="button" onClick={() => setPosPaymentMethod(pay.id)}
                                className={`border p-2 text-xs text-center font-semibold transition rounded ${
                                  posPaymentMethod === pay.id
                                    ? "bg-brand-maroon text-brand-ivory border-brand-maroon"
                                    : "bg-brand-ivory text-brand-maroon border-brand-gold/20 hover:border-brand-maroon"
                                }`}>
                                {pay.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button onClick={handlePOSCheckout} disabled={loading}
                          className="w-full bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest font-bold py-4 flex items-center justify-center gap-2 hover:bg-brand-maroon/90 transition shadow-md disabled:opacity-50">
                          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                          {language === "hi" ? `बिल बनाएं — ₹${posTotal.toLocaleString("en-IN")}` : `Generate Bill — ₹${posTotal.toLocaleString("en-IN")}`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ORDERS TAB ════════════════════════════════════════════════ */}
          {activeTab === "orders" && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-3xl text-brand-maroon font-light">{language === "hi" ? "ऑर्डर्स का इतिहास" : "Order History"}</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">{dbOrders.length} {language === "hi" ? "कुल ऑर्डर्स" : "total orders"}</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                    placeholder={language === "hi" ? "नाम या इनवॉइस नंबर से खोजें..." : "Search by name or invoice..."}
                    className="bg-[#FAF7F2] border border-brand-gold/20 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-maroon" />
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden">
                
                {/* ── DESKTOP TABLE ── */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#1C050E] text-[#F9F5F0] text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3.5">{language === "hi" ? "इनवॉइस नंबर" : "Invoice #"}</th>
                        <th className="px-4 py-3.5">{language === "hi" ? "ग्राहक" : "Customer"}</th>
                        <th className="px-4 py-3.5">{language === "hi" ? "तारीख" : "Date"}</th>
                        <th className="px-4 py-3.5">{language === "hi" ? "माध्यम" : "Channel"}</th>
                        <th className="px-4 py-3.5">{language === "hi" ? "भुगतान" : "Payment"}</th>
                        <th className="px-4 py-3.5 text-right">{language === "hi" ? "कुल" : "Total"}</th>
                        <th className="px-4 py-3.5 text-center">{language === "hi" ? "स्थिति" : "Status"}</th>
                        <th className="px-4 py-3.5 text-center">{language === "hi" ? "कार्रवाई" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gold/10">
                      {filteredOrders.map(o => {
                        const displayStatus = o.status === "delivered" ? (language === "hi" ? "वितरित" : "delivered") :
                                              o.status === "pending" ? (language === "hi" ? "लंबित" : "pending") :
                                              o.status === "cancelled" ? (language === "hi" ? "रद्द" : "cancelled") : o.status;
                        return (
                          <tr key={o.id} className="hover:bg-brand-sand/10 transition">
                            <td className="px-4 py-3.5 font-mono text-[10px] text-brand-gold font-bold">{o.invoice_number || o.id?.slice(0, 8)}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-serif font-semibold">{o.customer_name}</p>
                              {o.customer_phone && <p className="text-[10px] text-brand-warm-gray font-mono">{o.customer_phone}</p>}
                            </td>
                            <td className="px-4 py-3.5 text-brand-warm-gray">
                              {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                o.is_offline ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                              }`}>{o.is_offline ? (language === "hi" ? "शोरूम" : "Showroom") : (language === "hi" ? "ऑनलाइन" : "Online")}</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono uppercase text-[10px] text-brand-gold-dark">{o.payment_mode || "—"}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-right">₹{Number(o.total || 0).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                o.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                                o.status === "pending" ? "bg-amber-100 text-amber-700" :
                                o.status === "cancelled" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>{displayStatus}</span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button 
                                onClick={() => {
                                  setStatusModalOrder(o);
                                  setStatusForm({ 
                                    status: o.status || "", 
                                    tracking_number: o.tracking_number || "", 
                                    shipping_carrier: o.shipping_carrier || "" 
                                  });
                                }}
                                className="text-[10px] uppercase font-bold tracking-widest text-brand-maroon hover:text-brand-gold transition"
                              >
                                {language === "hi" ? "अपडेट" : "Update"}
                              </button>
                              <button 
                                onClick={() => handleViewInvoice(o)}
                                className="text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-maroon transition ml-3"
                              >
                                {language === "hi" ? "बिल देखें" : "View Bill"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── MOBILE STACKED CARDS ── */}
                <div className="lg:hidden divide-y divide-brand-gold/10">
                  {filteredOrders.map(o => (
                      <div key={o.id} className="p-4 bg-white hover:bg-[#FAF7F2] transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-mono text-[10px] text-brand-gold font-bold bg-[#1C050E] px-1.5 py-0.5 rounded">{o.invoice_number || o.id?.slice(0, 8)}</span>
                            <p className="font-serif font-bold text-base mt-1">{o.customer_name}</p>
                          </div>
                          <span className="font-mono font-bold text-sm text-brand-maroon">₹{Number(o.total || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider mb-2">
                          <span className={`px-2 py-0.5 rounded-full ${
                            o.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                            o.status === "pending" ? "bg-amber-100 text-amber-700" :
                            o.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>{o.status}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            o.is_offline ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>{o.is_offline ? (language === "hi" ? "शोरूम" : "Showroom") : (language === "hi" ? "ऑनलाइन" : "Online")}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-brand-warm-gray pt-2 border-t border-brand-gold/5">
                          <span>{new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <div className="flex items-center gap-4">
                            <span className="font-mono uppercase">{o.payment_mode || "—"}</span>
                            <button 
                              onClick={() => {
                                setStatusModalOrder(o);
                                setStatusForm({ 
                                  status: o.status || "", 
                                  tracking_number: o.tracking_number || "", 
                                  shipping_carrier: o.shipping_carrier || "" 
                                });
                              }}
                              className="text-brand-maroon font-bold uppercase hover:text-brand-gold transition"
                            >
                              {language === "hi" ? "अपडेट" : "Update"}
                            </button>
                            <button 
                              onClick={() => handleViewInvoice(o)}
                              className="text-brand-gold font-bold uppercase hover:text-brand-maroon transition ml-1"
                            >
                              {language === "hi" ? "बिल देखें" : "View Bill"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {dbOrders.length === 0 && (
                  <div className="py-16 text-center text-xs text-brand-warm-gray italic">No orders yet.</div>
                )}
              </div>
            </div>
          )}

          {/* ══ HR TAB ════════════════════════════════════════════════ */}
          {activeTab === "hr" && (
            <AdminHRTab 
              dbEmployees={dbEmployees} 
              dbAttendance={dbAttendance} 
              dbProfiles={dbProfiles}
              dbExpenses={dbExpenses}
              fetchAllData={fetchAllData} 
            />
          )}

          {/* ══ FINANCE TAB ════════════════════════════════════════════════ */}
          {activeTab === "finance" && (
            <AdminFinanceTab 
              dbExpenses={dbExpenses} 
              dbPurchases={dbPurchases} 
              dbDues={dbDues} 
              dbOrders={dbOrders} 
              dbEmployees={dbEmployees}
              dbDuePayments={dbDuePayments}
              dbSarees={dbSarees}
              fetchAllData={fetchAllData} 
              openExpenseModalOnLoad={openFinanceExpenseModal}
              openPurchaseModalOnLoad={openFinancePurchaseModal}
              onCloseExpenseModalOnLoad={() => setOpenFinanceExpenseModal(false)}
              onClosePurchaseModalOnLoad={() => setOpenFinancePurchaseModal(false)}
              startDate={startDate}
              endDate={endDate}
            />
          )}

          {/* ══ VENDORS TAB ════════════════════════════════════════════════ */}
          {activeTab === "vendors" && (
            <AdminVendorsTab 
              dbPurchases={dbPurchases} 
              dbDues={dbDues} 
              dbDuePayments={dbDuePayments}
              fetchAllData={fetchAllData}
            />
          )}

          </>
          )}
        </div>
      </main>

      {/* ══ MODAL: ADD/EDIT SAREE ══════════════════════════════════════════ */}
      {isSareeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-maroon/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#FDFBF7] border-t sm:border border-brand-gold/25 rounded-t-3xl sm:rounded-lg p-5 sm:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl animate-slide-up">
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-brand-maroon">
                {editingSaree 
                  ? (language === "hi" ? "साड़ी संपादित करें" : "Edit Saree") 
                  : (language === "hi" ? "नई साड़ी जोड़ें" : "Add New Saree")}
              </h3>
              <button onClick={() => setIsSareeModalOpen(false)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab navigation headers */}
            <div className="flex border-b border-brand-gold/15 text-[10px] uppercase font-bold tracking-wider">
              <button
                type="button"
                onClick={() => setSareeModalTab("basic")}
                className={`flex-1 py-3 text-center border-b-2 transition ${
                  sareeModalTab === "basic"
                    ? "border-brand-maroon text-brand-maroon bg-brand-gold/5"
                    : "border-transparent text-brand-warm-gray hover:text-brand-maroon"
                }`}
              >
                {language === "hi" ? "1. बुनियादी जानकारी" : "1. Basic Info"}
              </button>
              <button
                type="button"
                onClick={() => setSareeModalTab("details")}
                className={`flex-1 py-3 text-center border-b-2 transition ${
                  sareeModalTab === "details"
                    ? "border-brand-maroon text-brand-maroon bg-brand-gold/5"
                    : "border-transparent text-brand-warm-gray hover:text-brand-maroon"
                }`}
              >
                {language === "hi" ? "2. विशेषताएँ" : "2. Characteristics"}
              </button>
              <button
                type="button"
                onClick={() => setSareeModalTab("specs")}
                className={`flex-1 py-3 text-center border-b-2 transition ${
                  sareeModalTab === "specs"
                    ? "border-brand-maroon text-brand-maroon bg-brand-gold/5"
                    : "border-transparent text-brand-warm-gray hover:text-brand-maroon"
                }`}
              >
                {language === "hi" ? "3. छवियाँ और विवरण" : "3. Images & Specs"}
              </button>
            </div>

            <form onSubmit={handleSaveSaree} className="space-y-4 text-xs text-brand-maroon">
              {/* Tab 1: Basic Info */}
              {sareeModalTab === "basic" && (
                <div className="space-y-4">
                  {/* Name + Material */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "साड़ी का नाम *" : "Saree Name *"}</label>
                      <input type="text" required value={sareeForm.name} onChange={e => setSareeForm({ ...sareeForm, name: e.target.value })}
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "सामग्री *" : "Material *"}</label>
                      <input type="text" required value={sareeForm.material} onChange={e => setSareeForm({ ...sareeForm, material: e.target.value })}
                        placeholder={language === "hi" ? "जैसे: 100% शुद्ध कातान सिल्क" : "e.g. 100% Pure Katan Silk"} list="material-list"
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                      <datalist id="material-list">
                        {Array.from(new Set(dbSarees.map(s => s.material).filter(Boolean))).map((m: any) => <option key={m} value={m} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Price + Original Price + Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "कीमत (₹) *" : "Price (₹) *"}</label>
                      <input type="number" min="0" required value={sareeForm.price} onChange={e => setSareeForm({ ...sareeForm, price: Number(e.target.value) })}
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "मूल कीमत (₹)" : "Original Price (₹)"}</label>
                      <input type="number" min="0" value={sareeForm.original_price} onChange={e => setSareeForm({ ...sareeForm, original_price: e.target.value })}
                        placeholder={language === "hi" ? "वैकल्पिक" : "Optional"} className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block flex items-center gap-1">
                        <Package className="w-3 h-3" /> {language === "hi" ? "स्टॉक मात्रा *" : "Stock Qty *"}
                      </label>
                      <input type="number" min={0} required value={sareeForm.stock_quantity} onChange={e => setSareeForm({ ...sareeForm, stock_quantity: Number(e.target.value) })}
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon font-mono text-xs" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "विवरण *" : "Description *"}</label>
                    <textarea rows={4} required value={sareeForm.description} onChange={e => setSareeForm({ ...sareeForm, description: e.target.value })}
                      className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon resize-none text-xs" />
                  </div>
                </div>
              )}

              {/* Tab 2: Characteristics */}
              {sareeModalTab === "details" && (
                <div className="space-y-4">
                  {/* Zari + Technique + Collection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "जरी प्रकार" : "Zari Type"}</label>
                      <input type="text" value={sareeForm.zari_type} onChange={e => setSareeForm({ ...sareeForm, zari_type: e.target.value })}
                        placeholder={language === "hi" ? "जैसे: शुद्ध सोना जरी" : "e.g. Pure Gold Zari"} list="zari-list"
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                      <datalist id="zari-list">
                        {Array.from(new Set(dbSarees.map(s => s.zari_type).filter(Boolean))).map((z: any) => <option key={z} value={z} />)}
                      </datalist>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "बुनाई तकनीक" : "Technique"}</label>
                      <input type="text" value={sareeForm.weaving_technique} onChange={e => setSareeForm({ ...sareeForm, weaving_technique: e.target.value })}
                        placeholder={language === "hi" ? "जैसे: कढ़ुआ हथकरघा" : "e.g. Kadwa Handloom"} list="technique-list"
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                      <datalist id="technique-list">
                        {Array.from(new Set(dbSarees.map(s => s.weaving_technique).filter(Boolean))).map((t: any) => <option key={t} value={t} />)}
                      </datalist>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "कलेक्शन (संग्रह)" : "Collection"}</label>
                      <select value={sareeForm.collection_id} onChange={e => setSareeForm({ ...sareeForm, collection_id: e.target.value })}
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs">
                        <option value="">{language === "hi" ? "— कोई नहीं —" : "— None —"}</option>
                        {dbCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Artisan + Color + Drape Recommendation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "शिल्पकार (बुनकर)" : "Artisan"}</label>
                      <select value={sareeForm.artisan_id} onChange={e => setSareeForm({ ...sareeForm, artisan_id: e.target.value })}
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs">
                        <option value="">{language === "hi" ? "— कोई नहीं —" : "— None —"}</option>
                        {dbArtisans.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "रंग" : "Color"}</label>
                      <input type="text" value={sareeForm.colors} onChange={e => setSareeForm({ ...sareeForm, colors: e.target.value })}
                        placeholder={language === "hi" ? "जैसे: आइवरी गोल्ड" : "e.g. Ivory Gold"} list="color-list"
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                      <datalist id="color-list">
                        {Array.from(new Set(dbSarees.flatMap(s => s.colors || []).filter(Boolean))).map((c: any) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "ड्रेप सुझाव" : "Drape Recommendation"}</label>
                      <input type="text" value={sareeForm.drape_recommendation} onChange={e => setSareeForm({ ...sareeForm, drape_recommendation: e.target.value })}
                        placeholder={language === "hi" ? "जैसे: क्लासिक शैली सोने के आभूषणों के साथ" : "E.g. Classic style with gold jewelry"}
                        className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3 py-3 border-y border-brand-gold/15">
                    {[
                      { key: "sell_online", label: language === "hi" ? "ऑनलाइन बेचें" : "Sell Online" },
                      { key: "is_bestseller", label: language === "hi" ? "सर्वश्रेष्ठ विक्रेता (Bestseller)" : "Bestseller" },
                      { key: "is_featured", label: language === "hi" ? "विशेष (Featured)" : "Featured" },
                      { key: "is_new", label: language === "hi" ? "नया आगमन (New Arrival)" : "New Arrival" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={(sareeForm as any)[key]}
                          onChange={e => setSareeForm({ ...sareeForm, [key]: e.target.checked })}
                          className="accent-brand-maroon h-4 w-4 cursor-pointer" />
                        <span className="text-xs font-bold">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Images & Specs */}
              {sareeModalTab === "specs" && (
                <div className="space-y-4">
                  {/* Images */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold block">
                        {language === "hi" ? "उत्पाद की छवियाँ *" : "Product Images *"} <span className="text-brand-gold font-normal">({language === "hi" ? "कम से कम 1 आवश्यक" : "at least 1 required"})</span>
                      </label>
                      <span className="text-[9px] text-brand-warm-gray">JPG · PNG · WebP · max 10MB each</span>
                    </div>

                    {/* Hidden file inputs */}
                    {[0, 1, 2].map(idx => (
                      <input
                        key={idx}
                        ref={fileInputRefs[idx]}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, idx);
                          e.target.value = "";
                        }}
                      />
                    ))}

                    {/* 3-slot grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {(["Main", "Detail", "Drape"] as const).map((label, idx) => {
                        const translatedLabel = label === "Main" 
                          ? (language === "hi" ? "मुख्य" : "Main")
                          : label === "Detail" 
                            ? (language === "hi" ? "बारीकी (डिटेल)" : "Detail")
                            : (language === "hi" ? "ड्रेप" : "Drape");
                        return (
                          <div key={idx} className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-brand-warm-gray block text-center font-sans">
                              {translatedLabel} {idx === 0 && <span className="text-red-500">*</span>}
                            </span>

                            <div
                              className={`relative border-2 border-dashed rounded-lg transition group ${
                                slotUploading[idx]
                                  ? "border-brand-gold/60 cursor-wait"
                                  : "border-brand-gold/30 hover:border-brand-maroon cursor-pointer"
                              }`}
                              onClick={() => !slotUploading[idx] && fileInputRefs[idx].current?.click()}
                              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-brand-maroon'); }}
                              onDragLeave={e => { e.currentTarget.classList.remove('border-brand-maroon'); }}
                              onDrop={e => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-brand-maroon');
                                const file = e.dataTransfer.files?.[0];
                                if (file && !slotUploading[idx]) handleImageUpload(file, idx);
                              }}
                            >
                              {slotPreview[idx] ? (
                                <div className="relative rounded-lg overflow-hidden">
                                  <img
                                    src={slotPreview[idx]}
                                    alt={label}
                                    className="w-full h-24 object-cover"
                                  />
                                  {!slotUploading[idx] && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 rounded-lg">
                                      <Upload className="w-4 h-4 text-white" />
                                      <span className="text-white text-[8px] font-bold uppercase">{language === "hi" ? "बदलें" : "Replace"}</span>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setSareeForm(prev => {
                                        const imgs = [...prev.images] as [string, string, string];
                                        imgs[idx] = "";
                                        return { ...prev, images: imgs };
                                      });
                                      setSlotPreview(prev => { const n = [...prev]; n[idx] = ""; return n; });
                                      setSlotError(prev => { const n = [...prev]; n[idx] = ""; return n; });
                                      setSlotProgress(prev => { const n = [...prev]; n[idx] = 0; return n; });
                                    }}
                                    className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="py-5 flex flex-col items-center gap-1 text-brand-warm-gray">
                                  <ImageIcon className="w-4 h-4 text-brand-gold" />
                                  <p className="text-[7.5px] text-center leading-tight">{language === "hi" ? "छवि चुनें /" : "Click/Drop"}<br/>{language === "hi" ? "ड्रॉप करें" : "image"}</p>
                                </div>
                              )}

                              {slotUploading[idx] && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-1 flex items-center gap-1 rounded-b-lg">
                                  <div className="flex-1 bg-white/20 rounded-full h-0.5 overflow-hidden">
                                    <div
                                      className="h-full bg-brand-gold transition-all duration-300 rounded-full"
                                      style={{ width: `${slotProgress[idx]}%` }}
                                    />
                                  </div>
                                  <span className="text-white text-[7px] font-mono">{slotProgress[idx]}%</span>
                                </div>
                              )}
                            </div>

                            {slotError[idx] ? (
                              <p className="text-[8px] text-red-500 flex items-start gap-0.5 leading-tight">
                                <AlertTriangle className="w-2 h-2 mt-0.5 flex-shrink-0" />
                                {slotError[idx]}
                              </p>
                            ) : !slotUploading[idx] && slotProgress[idx] === 100 && slotPreview[idx] ? (
                              <p className="text-[8px] text-emerald-600 flex items-center gap-0.5 justify-center">
                                <CheckCircle className="w-2 h-2" /> {language === "hi" ? "अपलोड हो गया" : "Uploaded"}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="bg-[#FAF7F2] border border-brand-gold/15 p-4 rounded-lg space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-brand-maroon">{language === "hi" ? "विवरण विशिष्टताएँ" : "Specifications"}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "spec_length", label: language === "hi" ? "लंबाई (Length)" : "Length" },
                        { key: "spec_width", label: language === "hi" ? "चौड़ाई (Width)" : "Width" },
                        { key: "spec_blouse", label: language === "hi" ? "ब्लाउज (Blouse)" : "Blouse" },
                        { key: "spec_wash_care", label: language === "hi" ? "धुलाई देखभाल (Wash Care)" : "Wash Care" },
                        { key: "spec_origin", label: language === "hi" ? "उत्पत्ति (Origin)" : "Origin" },
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{label}</label>
                          <input type="text" value={(sareeForm as any)[key]}
                            onChange={e => setSareeForm({ ...sareeForm, [key]: e.target.value })}
                            className="w-full bg-white border border-brand-gold/15 p-2 text-xs focus:outline-none focus:border-brand-maroon" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions (Always Visible at Bottom) */}
              <div className="flex justify-end gap-3 pt-3 border-t border-brand-gold/15">
                <button type="button" onClick={() => setIsSareeModalOpen(false)}
                  className="text-brand-warm-gray uppercase tracking-wider text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition">
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button type="submit" disabled={loading}
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-6 py-3 hover:bg-brand-maroon/90 transition shadow flex items-center gap-2 disabled:opacity-50">
                  {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {editingSaree 
                    ? (language === "hi" ? "परिवर्तन सहेजें" : "Save Changes") 
                    : (language === "hi" ? "कैटलॉग में जोड़ें" : "Add to Catalog")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-maroon/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FDFBF7] border-t sm:border border-brand-gold/25 rounded-t-3xl sm:rounded-lg p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-brand-maroon">{language === "hi" ? "ऑफ़लाइन लीड जोड़ें" : "Add Offline Lead"}</h3>
              <button onClick={() => setIsNewLeadModalOpen(false)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOfflineLead} className="space-y-4 text-xs text-brand-maroon">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "ग्राहक का नाम *" : "Client Name *"}</label>
                <input type="text" required value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "फ़ोन" : "Phone"}</label>
                  <input type="tel" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+91..." className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "ईमेल" : "Email"}</label>
                  <input type="email" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "रुचि / साड़ी का प्रकार" : "Interest / Saree Type"}</label>
                <input type="text" value={leadForm.interest} onChange={e => setLeadForm({ ...leadForm, interest: e.target.value })}
                  placeholder={language === "hi" ? "जैसे: ब्राइडल कातान सिल्क, शिकारगाह कलेक्शन..." : "e.g. Bridal Katan Silk, Shikargah Collection..."}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "टिप्पणियाँ (नोट्स)" : "Notes"}</label>
                <textarea rows={3} value={leadForm.message} onChange={e => setLeadForm({ ...leadForm, message: e.target.value })}
                  placeholder={language === "hi" ? "अवसर (शादी, आदि), बजट, रंग की पसंद, समय-सीमा..." : "Occasion, budget, color preferences, timeline..."}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-brand-gold/15">
                <button type="button" onClick={() => setIsNewLeadModalOpen(false)}
                  className="text-brand-warm-gray uppercase text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition">
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button type="submit"
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-5 py-3 hover:bg-brand-maroon/90 transition shadow">
                  {language === "hi" ? "लीड बनाएं" : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-maroon/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FDFBF7] border-t sm:border border-brand-gold/25 rounded-t-3xl sm:rounded-lg p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-brand-maroon">{language === "hi" ? "ग्राहक पंजीकृत करें" : "Register Customer"}</h3>
              <button onClick={() => setIsNewProfileModalOpen(false)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProfile} className="space-y-4 text-xs text-brand-maroon">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "पूरा नाम *" : "Full Name *"}</label>
                <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "फ़ोन" : "Phone"}</label>
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91..." className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">{language === "hi" ? "ईमेल" : "Email"}</label>
                <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-brand-gold/15">
                <button type="button" onClick={() => setIsNewProfileModalOpen(false)}
                  className="text-brand-warm-gray uppercase text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition">
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button type="submit"
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-5 py-3 hover:bg-brand-maroon/90 transition shadow">
                  {language === "hi" ? "पंजीकृत करें" : "Register Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusModalOrder && (
        <div className="fixed inset-0 bg-brand-maroon/20 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF7F2] w-full max-w-md p-5 sm:p-8 shadow-2xl relative border-t sm:border border-brand-gold/20 rounded-t-3xl sm:rounded-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
            <div className="flex justify-between items-center mb-6 border-b border-brand-gold/15 pb-4">
              <div>
                <h3 className="font-serif text-xl text-brand-maroon">Update Order</h3>
                <p className="text-[10px] text-brand-warm-gray font-mono font-bold uppercase tracking-widest mt-1">Invoice: {statusModalOrder.invoice_number || statusModalOrder.id?.slice(0,8)}</p>
              </div>
              <button onClick={() => setStatusModalOrder(null)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4 text-xs text-brand-maroon">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block tracking-widest">Order Status *</label>
                <select 
                  required
                  value={statusForm.status} 
                  onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon appearance-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid (Unfulfilled)</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(statusForm.status === 'shipped' || statusForm.status === 'delivered') && (
                <div className="space-y-4 pt-2 border-t border-brand-gold/10 mt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold block tracking-widest">Shipping Carrier</label>
                    <input 
                      type="text" 
                      placeholder="e.g. BlueDart, FedEx"
                      value={statusForm.shipping_carrier} 
                      onChange={e => setStatusForm({ ...statusForm, shipping_carrier: e.target.value })}
                      className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold block tracking-widest">Tracking Number</label>
                    <input 
                      type="text" 
                      placeholder="AWB / Tracking Number"
                      value={statusForm.tracking_number} 
                      onChange={e => setStatusForm({ ...statusForm, tracking_number: e.target.value })}
                      className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none font-mono" 
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setStatusModalOrder(null)}
                  className="text-brand-warm-gray uppercase text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition tracking-widest">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingStatus}
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-5 py-3 hover:bg-brand-maroon/90 transition shadow disabled:opacity-50">
                  {isUpdatingStatus ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
