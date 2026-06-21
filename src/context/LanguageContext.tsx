import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    nav_home: "Home",
    nav_shop: "Shop",
    nav_collections: "Collections",
    nav_artisans: "Artisans",
    nav_about: "About",
    nav_contact: "Contact",
    nav_login: "Login / Register",
    nav_dashboard: "My Dashboard",
    nav_admin: "Admin Console",
    nav_logout: "Logout",
    nav_cart: "Cart",
    
    // About View
    about_title: "The Loom Chronicle",
    about_subtitle: "Preserving Banarasi Heritage",
    about_desc: "Art & Anchal is a cooperative initiative connecting multi-generational master weavers in Varanasi directly with collectors worldwide. By eliminating retail middlemen, we secure fair wages for our craftsmen while delivering pure heirloom silk drapes of museum-grade quality.",
    about_explore_btn: "Explore The Collection",
    
    // Home View
    hero_title: "The Banarasi Darbar",
    hero_subtitle: "Heirloom Banarasi Masterpieces",
    hero_desc: "Exquisite handwoven silk sarees, straight from the quiet rhythmic looms of Varanasi to your wardrobe.",
    hero_btn_shop: "Explore Masterpieces",
    home_featured_title: "Featured Masterpieces",
    home_featured_subtitle: "Exquisite drapes hand-selected by our master curators",
    home_collections_title: "Our Curated Collections",
    home_collections_subtitle: "Woven across different handloom styles and zari variations",
    home_artisans_title: "Meet the Master Weavers",
    home_artisans_subtitle: "The master craftsmen keeping the legacy alive",
    home_story_btn: "Read Their Story",
    
    // Categories
    "cat_All": "All",
    "cat_Katan Silk": "Katan Silk",
    "cat_Shikargah": "Shikargah",
    "cat_Tanchoi": "Tanchoi",
    "cat_Organza / Kora": "Organza / Kora",
    "cat_Tissue": "Tissue",

    // Zari Types
    "zari_All": "All",
    "zari_Pure Gold Zari": "Pure Gold Zari",
    "zari_Tested Zari": "Tested Zari",
    "zari_Silver Zari": "Silver Zari",
    "zari_Water Gold Zari": "Water Gold Zari",

    // Weaving Styles
    "weave_All": "All",
    "weave_Kadwa Handloom": "Kadwa Handloom",
    "weave_Fekua Handloom": "Fekua Handloom",
    "weave_Tanchoi Weave": "Tanchoi Weave",
    "weave_Jamdani Handloom": "Jamdani Handloom",

    // Colors
    "color_All": "All",
    "color_Ivory & Gold": "Ivory & Gold",
    "color_Deep Maroon": "Deep Maroon",
    "color_Cobalt Blue & Gold": "Cobalt Blue & Gold",
    "color_Emerald Green": "Emerald Green",
    "color_Magenta Pink": "Magenta Pink",
    "color_Metallic Gold": "Metallic Gold",

    // Shop View
    shop_title: "Our Handwoven Masterpieces",
    shop_desc: "A curation of exquisite weaves, straight from the quiet, rhythmic looms of Banaras. Discover elegance in every thread.",
    shop_refine: "Refine Collections",
    shop_reset: "Reset All",
    shop_category: "Saree Category",
    shop_zari: "Zari Specification",
    shop_weave: "Weaving Style",
    shop_color: "Color Palette",
    shop_price: "Price Boundary",
    shop_sort: "Sort by:",
    shop_showing: "Showing",
    shop_sarees_count: "masterwork sarees",
    shop_sort_featured: "Featured Masterworks",
    shop_sort_asc: "Price: Heirloom to Royal",
    shop_sort_desc: "Price: Royal to Heirloom",
    shop_sort_rating: "Client Favorites",
    shop_no_results: "No matching heritage drapes discovered",
    shop_adjust_filters: "We curate our collection carefully, weaving only in small heritage batches. Try adjusting your filters or price boundaries.",
    shop_reset_refinements: "Reset Refinements",
    shop_video_service: "Personalized Service",
    shop_video_title: "Book a Private Video Consultation",
    shop_video_desc: "Can't find your perfect weave in stock? Schedule a high-definition private video consultation. Zoom in on zari metal threads, inspect the drape live on our showroom mannequin, or request custom loom bookings directly from Varanasi.",
    shop_video_name: "Your Name",
    shop_video_phone: "WhatsApp Phone Number",
    shop_video_note: "Preferred Occasion, Motifs or Time (Optional)",
    shop_video_btn: "Request Private Showcase",
    shop_video_direct: "Chat Directly on WhatsApp",
    shop_video_success: "Consultation Requested Successfully!",
    shop_video_success_desc: "Our textile curator will contact you on WhatsApp at your phone number shortly to schedule your personalized live showcase.",
    shop_quickview: "Quick View",
    shop_new_motif: "New Motif",
    
    // Product Detail
    prod_add_cart: "Add to Cart",
    prod_buy_now: "Buy Now",
    prod_out_of_stock: "Exclusively Woven / Out of Stock",
    prod_only_left: "Only 1 left in Varanasi vault",
    prod_specifications: "Weaving & Craft Specifications",
    prod_tab_details: "Saree Details",
    prod_tab_story: "The Weaver's Tale",
    prod_tab_drape: "Drape & Care Guide",
    prod_details_desc: "Saree Details & Description",
    prod_artisan_title: "Handcrafted by Master Weaver",
    prod_artisan_desc: "Every thread is woven with pure dedication, taking up to 3 months of single-saree weaving time.",
    prod_weaver: "Master Weaver",
    prod_origin: "Weaving Origin",
    prod_zari: "Zari Grade",
    prod_technique: "Weaving Technique",
    prod_weight: "Saree Weight",
    prod_drape_recom: "Drape Recommendation",
    
    // Cart Drawer
    cart_title: "Your Shopping Bag",
    cart_empty: "Your shopping bag is empty",
    cart_empty_desc: "Browse our heritage collections and add handwoven masterworks to your cart.",
    cart_subtotal: "Subtotal",
    cart_checkout: "Proceed to Checkout",
    cart_continue: "Continue Shopping",
    cart_remove: "Remove",
    cart_gst_note: "Tax & Shipping calculated at checkout",
    
    // Checkout View
    checkout_title: "Secure Checkout",
    checkout_cart_summary: "Order Summary",
    checkout_shipping_details: "Shipping Address",
    checkout_email: "Email Address",
    checkout_first_name: "First Name",
    checkout_last_name: "Last Name",
    checkout_address: "Street Address",
    checkout_apartment: "Apartment, suite, unit (optional)",
    checkout_city: "City",
    checkout_state: "State",
    checkout_zip: "ZIP / Postal Code",
    checkout_phone: "WhatsApp Phone Number",
    checkout_payment_method: "Payment Method",
    checkout_payment_rzp: "Razorpay / Cards / UPI / NetBanking",
    checkout_payment_cod: "Cash On Delivery (COD)",
    checkout_btn_place: "Place Order",
    checkout_btn_loading: "Processing Order...",
    checkout_success_title: "Order Confirmed!",
    checkout_success_desc: "Thank you for supporting handloom weavers. Your order has been registered successfully. Our Varanasi curator will reach out to you via WhatsApp shortly.",
    checkout_order_no: "Order Reference",
    
    // Contact View
    contact_title: "Varanasi Darbar",
    contact_subtitle: "Visit Our Boutique",
    contact_desc: "We look forward to welcoming you to our showroom in Varanasi or coordinating virtual showcases from afar.",
    contact_coords: "Boutique Location",
    contact_address_label: "Varanasi Showrooms",
    contact_address_val: "Vishwanath Gali, Kotwalipura, Lahori Tola, Varanasi, Uttar Pradesh 221001",
    contact_phone_label: "Boutique Helpline",
    contact_phone_val: "+91 75250 51124 (Direct & WhatsApp inquiries)",
    contact_email_label: "Email Address",
    contact_book_sitting: "Book a Virtual Video Consultation",
    contact_book_desc: "Schedule a high-definition private video consultation. Our fabric curator will stream live drapes, zoom metal threads, and discuss custom fittings.",
    contact_form_name: "Your Name",
    contact_form_email: "Your Email",
    contact_form_phone: "WhatsApp Phone Number",
    contact_form_type: "Consultation Subject",
    contact_type_bridal: "Bridal Trousseau Showcase",
    contact_type_heritage: "Heritage Collectors Showcase",
    contact_type_standard: "Festive Styling Consultation",
    contact_form_note: "Tell us about your occasion",
    contact_form_note_placeholder: "Occasion date, color matching, weavers preferred, custom pleat requests...",
    contact_form_submit: "Schedule Video Consultation",
    contact_form_success: "Video consultation requested successfully!",
    contact_form_success_desc: "Our textiles curator will coordinate times via WhatsApp/Email within 12 business hours.",
    contact_header_badge: "A Sincere Consultation",
    contact_header_title: "Private Inquiries & Sittings",
    
    
    // Collections View
    collections_header_badge: "Virasat Collections",
    collections_header_title: "The Gharana Editions",
    collections_header_desc: "Exploring the distinct motifs and weaving families of Banaras. From the classic Katan to the royal Shikargah, preserving the golden epochs of Indian textiles.",
    collections_explore_btn: "Explore",
    // New collection name keys
    collection_name_the_royal_katan_heritage: "The Royal Katan Heritage",
    collection_name_ethereal_organza: "Ethereal Organza",
    collection_name_shikargah_chronicles: "Shikargah Chronicles",
    collection_name_vintage_tissue_silk: "Vintage Tissue Silk",
    collection_name_the_kadwa_masterpieces: "The Kadwa Masterpieces",
    collection_name_tanchoi_illusions: "Tanchoi Illusions",
    // New collection tagline keys
    collection_tagline_purest_silk: "Purest silk, timeless grace",
    collection_tagline_feather_light: "Feather-light modern elegance",
    collection_tagline_tales_royal_hunt: "Tales of the royal hunt",
    collection_tagline_liquid_gold: "Woven with liquid gold",
    collection_tagline_embossed_artistry: "Embossed artistry",
    collection_tagline_subtle_shadows: "Subtle shadows, infinite depth",
    
    // Artisan Stories View
    artisan_header_badge: "The Authentic Loom Masterminds",
    artisan_header_title: "Master Artisan Stories",
    artisan_header_desc: "Every Banarasi saree is born from silent moments of loom coordination. Learn about the legacy handloom weavers preserving deep heritage in rural Varanasi cooperatives.",
    artisan_specialty_title: "Weaving Specialty",
    artisan_spotlight_badge: "Spotlight",
    artisan_age: "Age",
    artisan_village: "Village",
    artisan_experience: "Years Loom Training",
    artisan_crafted_by: "Crafted by",
    artisan_explore_details_btn: "Explore Masterpiece Details",
    artisan_browse_catalog_btn: "Browse Loom Master Catalogue",
    artisan_view_work_btn: "View Work",

    // User Profile View
    profile_tab_settings: "Profile Settings",
    profile_tab_acquisitions: "Acquisitions",
    profile_tab_wishlist: "Curated Wishlist",
    profile_tab_coupons: "Coupons & Rewards",
    profile_tab_payment: "Bespoke Payment",
    profile_tab_updates: "Dispatch Feed",
    profile_heading_settings: "Guild Profile Settings",
    profile_desc_settings: "Manage your contact information and loom coordination preferences.",
    profile_heading_addresses: "Saved Delivery Destinations",
    profile_desc_addresses: "Your primary shipping coordinates for dispatching loom masterworks.",
    profile_heading_acquisitions: "Heritage Acquisitions",
    profile_heading_wishlist: "Bespoke Wishlist",
    profile_heading_coupons: "Guild Benefits & Coupons",
    profile_heading_payment: "Payment Preferences",
    profile_heading_updates: "Dispatch Feed & Loom Alerts",

    // Admin ERP sub-tabs
    admin_finance_title: "Finance & Ledger",
    admin_finance_desc: "Track profitability, part-payments, and categorized spending",
    admin_vendors_title: "Vendor Directory & Ledger",
    admin_vendors_desc: "Track transaction history and outstanding balances for all suppliers",
    admin_hr_title: "HR & Staffing",
    admin_hr_desc: "Manage employees and daily attendance",
    admin_hr_add_emp: "Add Employee",
    admin_kpi_revenue: "Total Revenue",
    admin_kpi_purchases: "Purchases (Asset Val)",
    admin_kpi_expenses: "Other Expenses",
    admin_kpi_profit: "Net Profit (Accrual)",
    admin_kpi_debt: "Total Outstanding Debt",

    // Homepage Content
    home_bento_karigari_title: "Authentic Banarasi Karigari",
    home_bento_karigari_desc: "Crafted by master weavers using techniques passed down through generations. True handloom, true heritage.",
    home_bento_empower_title: "Empowering the Weaver",
    home_bento_empower_desc: "Directly supporting the artisan families of Banaras, ensuring the survival of this sacred craft and fair compensation for their art.",
    home_bento_sandook_title: "Heirloom Sandook",
    home_bento_sandook_desc: "Delivered safely anywhere in the world. Your saree arrives in a custom, protective case to preserve the intricate Zari for generations.",
    home_bento_process_btn: "Watch The Process",
    home_seasonal_badge: "Seasonal Chapters",
    home_seasonal_title: "Our Curated Collections",
    home_seasonal_btn: "Explore All Collections",
    home_favorites_badge: "Client Favorites",
    home_favorites_title: "Heritage Bestsellers",
    home_favorites_btn: "Discover All Designs",
    hero_badge: "The Sacred Weaves of Varanasi",
    home_hero_title_line1: "Woven in",
    home_hero_title_line2: "Whispers of Gold",
    hero_btn_parampara: "View the Parampara",
    hero_scroll_discover: "Scroll to discover",

    // Footer
    foot_desc: "A curation of pure handwoven heritage Banarasi silk sarees, crafted directly on traditional wooden handlooms in Varanasi.",
    foot_rights: "Art & Anchal. Woven in Varanasi. All rights reserved.",
  },
  hi: {
    // Navbar
    nav_home: "होम",
    nav_shop: "दुकान",
    nav_collections: "संग्रह",
    nav_artisans: "कारीगर",
    nav_about: "हमारे बारे में",
    nav_contact: "संपर्क",
    home_hero_title_line1: "स्वर्ण धागों से बुनी",
    home_hero_title_line2: "कालजयी विरासत",
    nav_login: "लॉगिन / पंजीकरण",
    nav_dashboard: "मेरा डैशबोर्ड",
    nav_admin: "एडमिन कंसोल",
    nav_logout: "लॉगआउट",
    nav_cart: "कार्ट",
    // New collection name keys (Hindi)
    collection_name_the_royal_katan_heritage: "शाही कतान विरासत",
    collection_name_ethereal_organza: "अलौकिक ऑर्गेंज़ा",
    collection_name_shikargah_chronicles: "शिकारगाह गाथा",
    collection_name_vintage_tissue_silk: "विंटेज टिशू सिल्क",
    collection_name_the_kadwa_masterpieces: "कढ़ुआ मास्टरपीस",
    collection_name_tanchoi_illusions: "तनचोई इल्यूजन्स",
    // New collection tagline keys (Hindi)
    collection_tagline_purest_silk: "प्योर रेशम, सदाबहार सुंदरता",
    collection_tagline_feather_light: "पंख जैसी हल्की, आधुनिक सुंदरता",
    collection_tagline_tales_royal_hunt: "शाही शिकार की कहानियां",
    collection_tagline_liquid_gold: "तरल सोने के धागों से बुनी",
    collection_tagline_embossed_artistry: "उभरी हुई नक्काशीदार कला",
    collection_tagline_subtle_shadows: "सूक्ष्म छाया, अनंत गहराई",
    
    // Home View
    hero_title: "बनारसी दरबार",
    hero_subtitle: "बनारस की कालजयी कलाकृतियाँ",
    hero_desc: "बनारस के पारंपरिक हथकरघों से सीधे आपके वार्डरोब (अलमारी) तक पहुँचने वाली बेहतरीन हाथ से बुनी सिल्क साड़ियाँ।",
    hero_btn_shop: "संग्रह का अन्वेषण करें",
    home_featured_title: "चुनिंदा बनारसी कलाकृतियाँ",
    home_featured_subtitle: "हमारे मास्टर क्यूरेटर द्वारा चुनी गई विशेष साड़ियां",
    home_collections_title: "हमारे विशेष संग्रह",
    home_collections_subtitle: "अलग-अलग हथकरघा शैलियों और ज़री विविधताओं में बुनी हुई साड़ियां",
    home_artisans_title: "विरासत के रचनाकार — हमारे बुनकर",
    home_artisans_subtitle: "विरासत को जीवित रखने वाले मास्टर शिल्पकार",
    home_story_btn: "उनकी कहानी पढ़ें",
    
    // Categories
    "cat_All": "सभी",
    "cat_Katan Silk": "कतान सिल्क",
    "cat_Shikargah": "शिकारगाह",
    "cat_Tanchoi": "तनचोई",
    "cat_Organza / Kora": "ऑर्गेंज़ा / कोरा",
    "cat_Tissue": "टिशू",

    // Zari Types
    "zari_All": "सभी",
    "zari_Pure Gold Zari": "शुद्ध सोने की ज़री",
    "zari_Tested Zari": "टेस्टेड ज़री",
    "zari_Silver Zari": "चांदी की ज़री",
    "zari_Water Gold Zari": "वॉटर गोल्ड ज़री",

    // Weaving Styles
    "weave_All": "सभी",
    "weave_Kadwa Handloom": "कढ़ुआ हथकरघा",
    "weave_Fekua Handloom": "फेकुआ हथकरघा",
    "weave_Tanchoi Weave": "तनचोई बुनाई",
    "weave_Jamdani Handloom": "जामदानी हथकरघा",

    // Colors
    "color_All": "सभी",
    "color_Ivory & Gold": "आइवरी और गोल्डन",
    "color_Deep Maroon": "गहरा मैरून",
    "color_Cobalt Blue & Gold": "कोबाल्ट ब्लू और गोल्डन",
    "color_Emerald Green": "पन्ना हरा",
    "color_Magenta Pink": "मजेंटा गुलाबी",
    "color_Metallic Gold": "मैटेलिक गोल्डन",

    // Shop View
    shop_title: "हमारी हाथ से बुनी उत्कृष्ट साड़ियाँ",
    shop_desc: "बनारस के पारंपरिक करघों से सीधे बुनी गई खूबसूरत साड़ियों का खास कलेक्शन। हर धागे में बनारसी कला का अहसास।",
    shop_refine: "संग्रह फ़िल्टर करें",
    shop_reset: "सभी रीसेट करें",
    shop_category: "साड़ी के प्रकार",
    shop_zari: "ज़री का प्रकार",
    shop_weave: "बुनाई का प्रकार",
    shop_color: "रंग पैलेट",
    shop_price: "कीमत सीमा",
    shop_sort: "सॉर्ट करें:",
    shop_showing: "दिखा रहा है {count} उत्कृष्ट साड़ियाँ",
    shop_sarees_count: "उत्कृष्ट साड़ियाँ",
    shop_sort_featured: "विशेष रूप से चुनी गई बेहतरीन साड़ियाँ",
    shop_sort_asc: "कीमत: कम से अधिक",
    shop_sort_desc: "कीमत: अधिक से कम",
    shop_sort_rating: "ग्राहक पसंदीदा",
    shop_no_results: "आपकी खोज से मेल खाने वाली कोई साड़ी नहीं मिली",
    shop_adjust_filters: "हम छोटे बैचों में बुनाई करते हैं, इसलिए अपना फ़िल्टर या कीमत सीमा बदलकर नई साड़ियाँ देखें।",
    shop_reset_refinements: "फ़िल्टर रीसेट करें",
    shop_video_service: "व्यक्तिगत सेवा",
    shop_video_title: "निजी वीडियो परामर्श बुक करें",
    shop_video_desc: "यदि स्टॉक में आपकी पसंद की साड़ी नहीं है, तो हम निजी वीडियो कॉल के ज़रिये साड़ी दिखा सकते हैं और कस्टम ऑर्डर ले सकते हैं।",
    shop_video_name: "आपका नाम",
    shop_video_phone: "व्हाट्सएप फोन नंबर",
    shop_video_note: "इवेंट, पसंदीदा डिज़ाइन या समय (वैकल्पिक)",
    shop_video_btn: "निजी वीडियो बुक करें",
    shop_video_direct: "व्हॉट्सएप पर तुरंत चैट करें",
    shop_video_success: "परामर्श का अनुरोध सफलतापूर्वक प्राप्त हुआ!",
    shop_video_success_desc: "हमारे बुटीक से टीम सदस्य आपके नंबर पर जल्द ही व्हाट्सएप के जरिए संपर्क करेंगे ताकि वीडियो कॉल का समय तय किया जा सके।",
    shop_quickview: "त्वरित अवलोकन",
    shop_new_motif: "नया रूपांकन",
    
    // Product Detail
    prod_add_cart: "कार्ट में जोड़ें",
    prod_buy_now: "अभी खरीदें",
    prod_out_of_stock: "विशेष रूप से बुनी हुई / स्टॉक समाप्त",
    prod_only_left: "वाराणसी वॉल्ट में केवल 1 बची है",
    prod_specifications: "बुनाई एवं कारीगरी का विवरण",
    prod_tab_details: "साड़ी का विवरण",
    prod_tab_story: "शिल्पकार की कहानी",
    prod_tab_drape: "ड्रेपिंग एवं स्टाइलिंग गाइड",
    prod_details_desc: "साड़ी का विस्तृत विवरण",
    prod_artisan_title: "मास्टर बुनकर की बेजोड़ हस्तकला",
    prod_artisan_desc: "हर एक धागा हमारे बुनकरों के पूरे मन और मेहनत से बुना गया है, जिसे तैयार करने में 3 महीने तक का समय लग जाता है।",
    prod_weaver: "मास्टर बुनकर",
    prod_origin: "बुनाई की उत्पत्ति",
    prod_zari: "ज़री का प्रकार",
    prod_technique: "बुनाई तकनीक",
    prod_weight: "साड़ी का वजन",
    prod_drape_recom: "पहनने का सुझाव",
    
    // Cart Drawer
    cart_title: "आपकी कार्ट",
    cart_empty: "आपकी कार्ट खाली है",
    cart_empty_desc: "हमारी खूबसूरत साड़ियों का कलेक्शन देखें और अपनी पसंद की साड़ियां कार्ट में जोड़ें।",
    cart_subtotal: "कुल मूल्य (Subtotal)",
    cart_checkout: "सुरक्षित चेकआउट करें",
    cart_continue: "शॉपिंग जारी रखें",
    cart_remove: "हटाएं",
    cart_gst_note: "कर और शिपिंग शुल्क चेकआउट के समय जोड़े जाएंगे",
    
    // Checkout View
    checkout_title: "सुरक्षित भुगतान एवं चेकआउट",
    checkout_cart_summary: "ऑर्डर सारांश (Order Summary)",
    checkout_shipping_details: "डिलिवरी का पता (Shipping Address)",
    checkout_email: "ईमेल पता",
    checkout_first_name: "पहला नाम",
    checkout_last_name: "अंतिम नाम",
    checkout_address: "पता (गली / मोहल्ला / मकान नंबर)",
    checkout_apartment: "अपार्टमेंट, फ्लैट नंबर आदि (वैकल्पिक)",
    checkout_city: "शहर",
    checkout_state: "राज्य",
    checkout_zip: "पिन कोड",
    checkout_phone: "व्हाट्सएप फोन नंबर",
    checkout_payment_method: "भुगतान का प्रकार",
    checkout_payment_rzp: "रेज़रपे / कार्ड / यूपीआई / नेटबैंकिंग",
    checkout_payment_cod: "कैश ऑन डिलीवरी (सीओडी)",
    checkout_btn_place: "ऑर्डर सबमिट करें",
    checkout_btn_loading: "ऑर्डर संसाधित हो रहा है...",
    checkout_success_title: "ऑर्डर सफलतापूर्वक पंजीकृत!",
    checkout_success_desc: "बनारसी हथकरघा का साथ देने के लिए आपका धन्यवाद! आपका ऑर्डर बुक हो गया है। हमारी वाराणसी टीम जल्द ही व्हाट्सएप पर आपसे संपर्क करेगी।",
    checkout_order_no: "ऑर्डर संदर्भ संख्या",
    
    // Contact View
    contact_title: "वाराणसी दरबार",
    contact_subtitle: "हमसे संपर्क करें",
    contact_desc: "हम बनारस में अपने शोरूम में आपका स्वागत करने या वीडियो कॉल के ज़रिये आपको साड़ियां दिखाने के लिए हमेशा तैयार हैं।",
    contact_coords: "विरासत बुटीक पता",
    contact_address_label: "वाराणसी बुटीक",
    contact_address_val: "विश्वनाथ गली, कोतवालीपुरा, लाहोरी टोला, वाराणसी, उत्तर प्रदेश 221001",
    contact_phone_label: "सीधा संपर्क नंबर",
    contact_phone_val: "+91 75250 51124 (सीधी और व्हाट्सएप पूछताछ)",
    contact_email_label: "ईमेल पता",
    contact_book_sitting: "लाइव वीडियो प्रदर्शन बुक करें",
    contact_book_desc: "हमारे साथ एक वीडियो कॉल का समय तय करें। हम आपको लाइव साड़ियां दिखाएंगे, उनके डिज़ाइन और कपड़े की क्वालिटी करीब से दिखाएंगे, ताकि आप आसानी से अपनी पसंद चुन सकें।",
    contact_form_name: "आपका नाम",
    contact_form_email: "आपका ईमेल",
    contact_form_phone: "व्हाट्सएप फोन नंबर",
    contact_form_type: "परामर्श का विषय",
    contact_type_bridal: "शादी-ब्याह की खरीदारी (Bridal)",
    contact_type_heritage: "एंटीक / खास सिल्क साड़ी संग्रह (Heritage)",
    contact_type_standard: "त्योहार और विशेष उत्सव स्टाइलिंग",
    contact_form_note: "हमें अपने अवसर के बारे में बताएं",
    contact_form_note_placeholder: "अवसर की तारीख, पसंदीदा रंग, पसंदीदा बुनकर, या विशेष अनुरोध...",
    contact_form_submit: "वीडियो कॉल शेड्यूल करें",
    contact_form_success: "वीडियो सिटिंग का अनुरोध सफलतापूर्वक दर्ज किया गया!",
    contact_form_success_desc: "हमारी टीम जल्द ही (12 घंटे के अंदर) व्हाट्सएप या ईमेल के जरिए आपसे संपर्क करेगी ताकि वीडियो कॉल का समय तय किया जा सके।",
    contact_header_badge: "एक विनम्र निवेदन",
    contact_header_title: "व्यक्तिगत पूछताछ और प्रदर्शन",
    
    // About View
    about_title: "करघा गाथा (The Loom Chronicle)",
    about_subtitle: "बनारसी विरासत को सहेजना",
    about_desc: "आर्ट एंड आंचल वाराणसी के पारंपरिक बुनकरों को सीधे आपके जैसे साड़ी प्रेमियों से जोड़ने की एक खास पहल है। बीच के दलालों को हटाकर, हम अपने बुनकरों को उनकी मेहनत का पूरा दाम दिलाते हैं और आपको असली व बेहतरीन बनारसी साड़ियां सीधे करघे से लाकर देते हैं।",
    about_explore_btn: "संग्रह का अन्वेषण करें",
    
    // Collections View
    collections_header_badge: "विरासत संग्रह",
    collections_header_title: "बनारसी घराना एडिशन",
    collections_header_desc: "बनारस की मशहूर बुनाई कला और पीढ़ियों से बुनाई कर रहे परिवारों की एक झलक। कतान से लेकर शिकारगाह शैली तक, हम पारंपरिक बनारसी कला को सहेज रहे हैं।",
    collections_explore_btn: "संग्रह देखें",
    
    // Artisan Stories View
    artisan_header_badge: "सच्चे हथकरघा शिल्पकार",
    artisan_header_title: "मास्टर कारीगरों की कहानियाँ",
    artisan_header_desc: "हर बनारसी साड़ी करघे की सुंदर खट-खट और बुनकर की कड़ी मेहनत से तैयार होती है। बनारस के गाँवों में काम करने वाले और इस पारंपरिक कला को बचाए रखने वाले हमारे बुनकरों से मिलें।",
    artisan_specialty_title: "बुनाई की विशेषता",
    artisan_spotlight_badge: "विशेष बुनकर",
    artisan_age: "उम्र",
    artisan_village: "गाँव",
    artisan_experience: "वर्षों का अनुभव",
    artisan_crafted_by: "द्वारा निर्मित",
    artisan_explore_details_btn: "उत्कृष्ट कृति का विवरण देखें",
    artisan_browse_catalog_btn: "हथकरघा मास्टर कैटलॉग देखें",
    artisan_view_work_btn: "काम देखें",

    // User Profile View
    profile_tab_settings: "प्रोफ़ाइल सेटिंग्स",
    profile_tab_acquisitions: "मेरी खरीदारी",
    profile_tab_wishlist: "मेरी विशलिस्ट",
    profile_tab_coupons: "कूपन और ऑफ़र",
    profile_tab_payment: "पेमेंट विकल्प",
    profile_tab_updates: "नवीनतम अपडेट",
    profile_heading_settings: "प्रोफ़ाइल सेटिंग्स",
    profile_desc_settings: "अपनी संपर्क जानकारी और साड़ी से जुड़ी पसंद को अपडेट करें।",
    profile_heading_addresses: "सुरक्षित पते",
    profile_desc_addresses: "साड़ियों की डिलीवरी के लिए आपका मुख्य पता।",
    profile_heading_acquisitions: "सफल खरीदारियां (Orders)",
    profile_heading_wishlist: "मेरी पसंदीदा साड़ियाँ (Wishlist)",
    profile_heading_coupons: "कूपन और डिस्काउंट कोड",
    profile_heading_payment: "भुगतान के प्रकार",
    profile_heading_updates: "नये डिज़ाइन और डिलीवरी अपडेट",

    // Admin ERP sub-tabs
    admin_finance_title: "फाइनेंस और लेजर (Accounts)",
    admin_finance_desc: "मुनाफा, भुगतान और विभिन्न खर्चों का विवरण देखें",
    admin_vendors_title: "व्यापारी (Vendor) खाता-बही",
    admin_vendors_desc: "सप्लायर्स के साथ लेन-देन और बकाया भुगतान का विवरण देखें",
    admin_hr_title: "कर्मचारी प्रबंधन (HR)",
    admin_hr_desc: "कर्मचारियों की सूची और दैनिक हाजिरी का प्रबंधन करें",
    admin_hr_add_emp: "कर्मचारी जोड़ें",
    admin_kpi_revenue: "कुल कमाई (Revenue)",
    admin_kpi_purchases: "कुल खरीद (Purchases)",
    admin_kpi_expenses: "अन्य खर्चे (Expenses)",
    admin_kpi_profit: "कुल मुनाफा (Net Profit)",
    admin_kpi_debt: "कुल बकाया भुगतान (Owed)",

    // Homepage Content
    home_bento_karigari_title: "प्रामाणिक बनारसी कारीगरी",
    home_bento_karigari_desc: "पीढ़ियों से चली आ रही पारंपरिक बुनाई के ज़रिये हमारे कारीगरों द्वारा तैयार की गई साड़ियां। शुद्ध हथकरघा, सच्ची विरासत।",
    home_bento_empower_title: "बुनकर स्वावलंबन और सम्मान",
    home_bento_empower_desc: "बनारस के बुनकर परिवारों को सीधे मदद पहुँचाना, ताकि यह कला बची रहे और कलाकारों को उनकी मेहनत का सही दाम मिल सके।",
    home_bento_sandook_title: "विरासत संदूक",
    home_bento_sandook_desc: "दुनिया भर में सुरक्षित डिलीवरी की सुविधा। साड़ी की कीमती ज़री को हमेशा नया जैसी रखने के लिए हम इसे एक खूबसूरत सुरक्षित बॉक्स में भेजते हैं।",
    home_bento_process_btn: "निर्माण प्रक्रिया देखें",
    home_seasonal_badge: "नये मौसमी संग्रह",
    home_seasonal_title: "हमारे चुनिंदा संग्रह",
    home_seasonal_btn: "संपूर्ण संग्रह देखें",
    home_favorites_badge: "ग्राहकों की विशेष पसंद",
    home_favorites_title: "विरासत की श्रेष्ठ रचनाएँ",
    home_favorites_btn: "सभी डिज़ाइनों को देखें",
    hero_badge: "वाराणसी की पवित्र बुनाई",
    hero_btn_parampara: "परंपरा देखें",
    hero_scroll_discover: "खोजने के लिए स्क्रॉल करें",

    // Footer
    foot_desc: "हाथ से बुनी बनारसी साड़ियों का बेहतरीन कलेक्शन, जिन्हें सीधे बनारस के बुनकरों द्वारा पारंपरिक लकड़ी के करघों पर तैयार किया गया है।",
    foot_rights: "आर्ट एंड आंचल। वाराणसी में निर्मित। सर्वाधिकार सुरक्षित।",
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("art_anchal_language");
    return (saved === "hi" ? "hi" : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("art_anchal_language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === "hi") {
      document.body.classList.add("lang-hi");
    } else {
      document.body.classList.remove("lang-hi");
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS["en"][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
