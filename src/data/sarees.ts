/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Saree, Artisan, Testimonial, Collection } from "../types";

// Asset references
import heroPath from "../assets/images/hero_banarasi_saree_1779547508532.png";
import artisanPath from "../assets/images/artisan_weaving_1779547529004.png";
import katanPath from "../assets/images/katan_collection_1779547545862.png";

// Artisan Images
import femaleArtist1 from "../assets/images/artisans/female_artist_1.webp";
import femaleArtist2 from "../assets/images/artisans/female_artist_2.webp";
import femaleArtist3 from "../assets/images/artisans/female_artist_3.webp";
import maleArtist1 from "../assets/images/artisans/male_artist_1.webp";
import maleArtist2 from "../assets/images/artisans/male_artist_2.webp";
import maleArtist3 from "../assets/images/artisans/male_artist_3.webp";
import maleArtist4 from "../assets/images/artisans/male_artist_4.webp";
import maleArtist5 from "../assets/images/artisans/male_artist_5.webp";
import maleArtist6 from "../assets/images/artisans/male_artist_6.webp";
import maleArtist7 from "../assets/images/artisans/male_artist_7.webp";

// Collection Images
import katanColImg from "../assets/images/collections/katan_collection.webp";
import organzaColImg from "../assets/images/collections/organza_collection.webp";
import shikargahColImg from "../assets/images/collections/shikargah_collection.webp";
import tissueColImg from "../assets/images/collections/tissue_collection.webp";
import kadwaColImg from "../assets/images/collections/kadwa_collection.webp";
import tanchoiColImg from "../assets/images/collections/tanchoi_collection.webp";

export const CUSTOM_ASSETS = {
  hero: heroPath,
  artisan: artisanPath,
  katan: katanPath
};

export const SAREES: Saree[] = [
  {
    id: "svarna-ivory",
    name: "Svarna Ivory Katan Silk Handloom Saree",
    price: 148000,
    originalPrice: 175000,
    rating: 4.9,
    reviewsCount: 24,
    images: [
      katanPath,
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Katan Silk",
    color: "Ivory & Gold",
    zariType: "Pure Gold Zari",
    weavingTechnique: "Kadwa Handloom",
    material: "100% Pure Mulberry Katan Silk",
    weaverName: "Ramprasad Maurya",
    weaverVillage: "Sarai Mohana, Varanasi",
    weaverStorySnippet: "Ramprasad has been weaving Katan silk masterworks for over 38 years. His intricate kadwa (embossed) weave motifs are inspired by historic temples along the Ganges.",
    description: "An absolute masterwork of pure heritage, the Svarna Saree is meticulously handwoven using the premium mulberry Katan silk in our signature ivory hue. Wrapped with genuine 24-karat gold-plated silver zari thread (Kadwa design), it is an heirloom treasure representing over 180 hours of silent handloom devotion by master weaver Ramprasad Maurya.",
    drapeRecommendation: "Perfect for Royal Indian Weddings, Heirloom Trousseaus, and Milestone Receptions.",
    isBestseller: true,
    isFeatured: true,
    isNew: false,
    specifications: {
      length: "5.5 Meters",
      width: "45 Inches",
      blousePiece: "80 Centimeters (matching raw silk with border)",
      washCare: "Strictly Dry Clean Only",
      origin: "Varanasi, Uttar Pradesh, India"
    }
  },
  {
    id: "shikargah-maroon",
    name: "Maharani Crimson Shikargah Handloom Saree",
    price: 185000,
    rating: 5.0,
    reviewsCount: 18,
    images: [
      heroPath,
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1610030470208-ebd3c8477ff9?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Shikargah",
    color: "Deep Maroon",
    zariType: "Pure Gold Zari",
    weavingTechnique: "Kadwa Handloom",
    material: "Pure Twill-woven Katan Silk",
    weaverName: "Kabir Ahmed",
    weaverVillage: "Lohta, Varanasi Outskirts",
    weaverStorySnippet: "Belonging to a 5th generation royal weaver family, Kabir specializes in Shikargah drapes, reproducing royal hunts using visual metaphor.",
    description: "The Shikargah is one of the most historically complex Banarasi weaves, depicting dynamic jungle hunting motifs, birds of paradise, roaring lions, and dense foliage. Woven in deep, royal-blooded crimson with authentic light-gold zari, this saree features a classic heavy border and a cascading pallu that captures royal elegance.",
    drapeRecommendation: "A breathtaking choice for Brides on their main Wedding Snaps or Traditional Sangeet ceremonies.",
    isBestseller: true,
    isFeatured: true,
    isNew: true,
    specifications: {
      length: "5.6 Meters",
      width: "44.5 Inches",
      blousePiece: "85 Centimeters (crimson silk with bird motif border)",
      washCare: "Dry Clean Only, Store wrap in pure muslin fabric",
      origin: "Varanasi, Uttar Pradesh, India"
    }
  },
  {
    id: "nilambari-blue",
    name: "Nilambari Classic Cobalt Tanchoi Saree",
    price: 84500,
    originalPrice: 95000,
    rating: 4.8,
    reviewsCount: 31,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Tanchoi",
    color: "Cobalt Blue & Gold",
    zariType: "Tested Zari",
    weavingTechnique: "Tanchoi Weave",
    material: "Satin Silk Weave",
    weaverName: "Zubair Ansari",
    weaverVillage: "Pili Kothi, Varanasi",
    weaverStorySnippet: "Zubair's family was instrumental in bringing Chinese-inspired satin weaving to Varanasi. He specializes in lightweight satin-like drapes.",
    description: "Crafted via the ancient satin-weave style known as Tanchoi, this classic deep-cobalt saree creates a self-pattern gloss on the fabric face. Intertwined with high-grade copper-plated gold-lustre thread, it highlights small paisleys and stylized lotuses across the body of the saree.",
    drapeRecommendation: "Sophisticated formal gatherings, Cocktail dinners, and Festive celebrations.",
    isBestseller: false,
    isFeatured: true,
    isNew: false,
    specifications: {
      length: "5.5 Meters",
      width: "45 Inches",
      blousePiece: "80 Centimeters (Cobalt jacquard silk)",
      washCare: "Dry Clean Only",
      origin: "Varanasi Heritage Belt, India"
    }
  },
  {
    id: "vasundhara-green",
    name: "Vasundhara Emerald Green Katan Handloom",
    price: 98000,
    rating: 4.9,
    reviewsCount: 15,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Katan Silk",
    color: "Emerald Green",
    zariType: "Silver Zari",
    weavingTechnique: "Kadwa Handloom",
    material: "100% Pure Dupion Weft Katan Silk",
    weaverName: "Anjali Mishra",
    weaverVillage: "Kotwa village",
    weaverStorySnippet: "Anjali is one of the pioneering women handloom weavers challenging traditional boundaries under Art&Anchal's cooperative initiative.",
    description: "Vasundhara means the Earth—representing rich natural fertility. Handwoven in shimmering dark emerald with real silver zari thread, this masterpiece includes elaborate mango bootas (paisleys). It features heavy borders displaying traditional floral wines.",
    drapeRecommendation: "Perfect for Diwali, Karwa Chauth, or luxurious family durbars.",
    isBestseller: true,
    isFeatured: false,
    isNew: true,
    specifications: {
      length: "5.5 Meters",
      width: "45 Inches",
      blousePiece: "80 Centimeters (Emerald silk with contrasting borders)",
      washCare: "Dry Clean, Store under cotton wraps in dark wood chests",
      origin: "Varanasi Cooperactive Sector, India"
    }
  },
  {
    id: "gulbano-pink",
    name: "Gulbano Magenta Organza Zardozi Saree",
    price: 63000,
    originalPrice: 68000,
    rating: 4.7,
    reviewsCount: 42,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1610030470208-ebd3c8477ff9?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Organza / Kora",
    color: "Magenta Pink",
    zariType: "Water Gold Zari",
    weavingTechnique: "Fekua Handloom",
    material: "Kora Silk (Organza)",
    weaverName: "Nisha & Shanti",
    weaverVillage: "Sarai Mohana Weaver's Hub",
    weaverStorySnippet: "Nisha and Shanti lead our lightweight series, focusing on translucent Organza silk, providing delicate drapes for a younger aesthetic.",
    description: "The Gulbano saree is incredibly airy, lightweight, and modern, woven from pure Kora (Organza) silk. It features a stunning shade of magenta with translucent gold patterns. Perfect for daytime wear, summer weddings, and elegant tea parties.",
    drapeRecommendation: "Summer garden weddings, Day bridal showers, and sophisticated luncheons.",
    isBestseller: false,
    isFeatured: false,
    isNew: false,
    specifications: {
      length: "5.5 Meters",
      width: "44 Inches",
      blousePiece: "80 Centimeters (Sheer matching organza)",
      washCare: "Gentle Professional Dry Clean Only",
      origin: "Sarai Mohana, Varanasi, India"
    }
  },
  {
    id: "shon-gold",
    name: "Samyukta Antique Gold Tissue Saree",
    price: 210000,
    rating: 5.0,
    reviewsCount: 9,
    images: [
      "https://images.unsplash.com/photo-1610030470208-ebd3c8477ff9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Tissue",
    color: "Metallic Gold",
    zariType: "Pure Gold Zari",
    weavingTechnique: "Jamdani Handloom",
    material: "Pure metallic Zari weft with Silk warp",
    weaverName: "Ramprasad Maurya",
    weaverVillage: "Sarai Mohana, Varanasi",
    weaverStorySnippet: "Only handloom experts with 30+ years of training can attempt high-grade Tissue silk, because the heavy metallic threads break easily during weaving.",
    description: "A breathtaking pinnacle of Banarasi mastery: the Samyukta Tissue Saree. Combining pure silk yarn warp with authentic gold zari weft, this saree appears as liquid gold. Embellished with delicate floral Jamdani clusters, this is fit for royal royalty.",
    drapeRecommendation: "Your absolute centerpiece Bridal wear, reception drape, or high heritage archival collection.",
    isBestseller: true,
    isFeatured: false,
    isNew: true,
    specifications: {
      length: "5.5 Meters",
      width: "46 Inches",
      blousePiece: "90 Centimeters (Antique Gold Tissue heavy fabric)",
      washCare: "Conservation-grade Dry Clean only. Avoid direct scent sprays.",
      origin: "Varanasi Archival Loom, India"
    }
  }
];

export const ARTISANS: Artisan[] = [
  {
    id: "ramprasad",
    name: "Ramprasad Maurya",
    age: 61,
    village: "Sarai Mohana village, Varanasi",
    experienceYears: 42,
    quote: "Each thread of zari carries the heartbeat of the loom. If my mind is at peace, the saree sings.",
    imageUrl: maleArtist1,
    specialty: "Pure Katan & Handcrafted Kadwa Weaves",
    story: "Ramprasad Maurya learned the art of handloom weaving from his grandfather at the age of twelve. In his workshop alongside the sacred Ganges, the gentle clanking of wooden shafts is the background track of his life. Through Art&Anchal, Ramprasad is paid above-market wages directly, helping him train three grandchildren to continue this masterwork instead of leaving for city manufacturing jobs.",
    featuredSareeId: "svarna-ivory"
  },
  {
    id: "anjali-mishra",
    name: "Anjali Mishra",
    age: 29,
    village: "Sarai Mohana community, Varanasi",
    experienceYears: 9,
    quote: "Women were historically barred from the heavy looms, but our hands possess the precise delicacy that heavy zari needs.",
    imageUrl: femaleArtist1,
    specialty: "Translucent Organza & Fine Silver Brocade",
    story: "As one of Art&Anchal's female master weavers, Anjali shattered local stereotypes. After her father suffered a stroke, she stepped in to handle the family's traditional wooden loom. Working with Art&Anchal's women empowerment cooperative, she co-designed our modern pastel collections, blending deep ancestral techniques with contemporary palettes.",
    featuredSareeId: "vasundhara-green"
  },
  {
    id: "kabir-ahmed",
    name: "Mohammad Kabir Ahmed",
    age: 52,
    village: "Lohta weavers district, Varanasi",
    experienceYears: 36,
    quote: "Shikargah requires mathematical precision. A single misplaced yarn, and the lion on the saree loses its shape.",
    imageUrl: maleArtist2,
    specialty: "High-complexity Shikargah & Royal Brocades",
    story: "Kabir is a globally celebrated heritage archivist. He reconstructs historical Banarasi patterns from raw sketches found in Mughal handbooks. He leads a small cooperative of ten weavers in Lohta, collaborating with Art&Anchal to document, produce, and sell royal masterpieces that take up to three months of single-saree weaving time.",
    featuredSareeId: "shikargah-maroon"
  },
  {
    id: "harishankar-prasad",
    name: "Harishankar Prasad",
    age: 58,
    village: "Lohta weavers district, Varanasi",
    experienceYears: 40,
    quote: "I don't just weave patterns; I weave history. The Kadwa technique is our heritage, locked safely in every warp and weft.",
    imageUrl: femaleArtist3,
    specialty: "Intricate Kadwa Booti & Heavy Brocade",
    story: "A true master of the Kadwa (embossed) weaving technique, Harishankar spends up to a month meticulously hand-tying each booti on a single saree. His work is heavily inspired by the historic architecture along the Varanasi ghats. By working directly with the cooperative, Harishankar has bypassed exploitative middlemen, allowing him to save enough to purchase modern healthcare for his aging parents.",
    featuredSareeId: "svarna-ivory"
  },
  {
    id: "meena-ansari",
    name: "Meena Ansari",
    age: 34,
    village: "Pili Kothi, Varanasi",
    experienceYears: 15,
    quote: "Weaving organza is like holding a cloud. You have to be gentle, yet firm enough to shape it into something timeless.",
    imageUrl: femaleArtist2,
    specialty: "Feather-light Organza & Scalloped Borders",
    story: "Meena revolutionized her family's traditional weaving style by specializing in feather-light organza sarees. Her delicate scalloped border designs have become a signature in modern Banarasi fashion. Defying societal norms that discouraged women from commercial weaving, Meena now trains a small group of young women, ensuring the craft empowers the next generation.",
    featuredSareeId: "gulbano-pink"
  },
  {
    id: "dinesh-kumar",
    name: "Dinesh Kumar",
    age: 63,
    village: "Sarai Mohana village, Varanasi",
    experienceYears: 45,
    quote: "A Shikargah saree is a painting made of silk. You must respect the animals and forests you weave, for they carry royal legacies.",
    imageUrl: maleArtist4,
    specialty: "Traditional Shikargah & Royal Hunts",
    story: "Dinesh is one of the last remaining elders in Sarai Mohana who knows the mathematical complexities of the Shikargah weave by heart, without looking at a graph. He weaves hunting scenes that take nearly three months to complete. Partnering with Art&Anchal ensures his masterpieces are sold at true artistic value, allowing him to live comfortably and train his apprentices without financial stress.",
    featuredSareeId: "shikargah-maroon"
  },
  {
    id: "radheshyam-singh",
    name: "Radheshyam Singh",
    age: 52,
    village: "Ramnagar, Varanasi",
    experienceYears: 30,
    quote: "Gold zari is unforgiving. It tests your patience, but when the saree is complete, it reflects the light of your dedication.",
    imageUrl: maleArtist3,
    specialty: "Antique Tissue Silk & Metallic Zari",
    story: "Radhika is an expert in weaving antique tissue silk, a technique that requires handling highly fragile metallic threads alongside pure silk warp. Her masterpieces are often heirloom pieces passed down through generations. After joining Art&Anchal, Radhika was finally able to renovate her ancestral home, ensuring her wooden pit loom remains safe from the monsoon rains.",
    featuredSareeId: "shon-gold"
  },
  {
    id: "brijesh-tiwari",
    name: "Brijesh Tiwari",
    age: 55,
    village: "Lallapura, Varanasi",
    experienceYears: 38,
    quote: "Meenakari is like enameling jewelry, but with thread. The colors must pop against the gold like precious gemstones.",
    imageUrl: maleArtist5,
    specialty: "Meenakari Brocade & Multi-Color Resham",
    story: "Brijesh is a master of Meenakari, adding vibrant colored resham (silk) threads to gold zari motifs to create a stunning, multi-dimensional effect. His loom is known for producing the most vibrant bridal wear in the region. Thanks to the cooperative's zero-middleman policy, Brijesh earns the full margin of his labor, which he uses to support his large extended family.",
    featuredSareeId: "shikargah-maroon"
  },
  {
    id: "rameshwar-nath",
    name: "Rameshwar Nath",
    age: 48,
    village: "Cholaapur, Varanasi",
    experienceYears: 25,
    quote: "Silver zari has a quiet elegance. It doesn't shout for attention, but its beauty captures the eye forever.",
    imageUrl: maleArtist6,
    specialty: "Pure Silver Zari & Ivory Silk",
    story: "Rameshwar specializes in the rare art of weaving pure silver zari on ivory Katan silk, a highly demanded style for modern day-weddings. The precision required to keep the ivory silk pristine during the long weaving process is immense. Art&Anchal provides Rameshwar with an immaculate, well-lit workshop space, ensuring his masterpieces are woven in the perfect environment.",
    featuredSareeId: "svarna-ivory"
  },
  {
    id: "zayed-qureshi",
    name: "Zayed Qureshi",
    age: 36,
    village: "Bajardiha, Varanasi",
    experienceYears: 18,
    quote: "The Jangla weave leaves no empty space. It is a dense forest of silk that wraps the wearer in centuries of luxury.",
    imageUrl: maleArtist7,
    specialty: "Jangla All-Over Patterns & Copper Zari",
    story: "Zayed is an expert in the dense Jangla weave, known for its all-over floral creepers that require immense physical strength and rhythm at the loom. He recently pioneered the use of tested copper zari to create an antique, rustic finish. His consistent income from the cooperative has allowed Zayed to upgrade his loom with ergonomic seating, preserving his health for decades of weaving to come.",
    featuredSareeId: "vasundhara-green"
  }
];

export const COLLECTIONS: Collection[] = [
  {
    id: "714d6600-4b0d-4ce2-b883-7729221199a0",
    name: "The Royal Katan Heritage",
    tagline: "Purest silk, timeless grace",
    description: "Our signature collection featuring 100% pure Katan silk. Woven with the finest mulberry silk threads, these sarees carry the authentic weight and unmistakable drape of classic Banarasi royalty. Perfect for bridal trousseaus and grand festivities.",
    coverImage: katanColImg,
    slug: "royal-katan-heritage"
  },
  {
    id: "714d6600-4b0d-4ce2-b883-7729221199a1",
    name: "Ethereal Organza",
    tagline: "Feather-light modern elegance",
    description: "A contemporary take on traditional weaving. The Organza collection combines the translucent, cloud-like texture of fine silk organza with delicate silver and gold zari motifs. Designed for the modern woman who seeks lightness without compromising on heritage.",
    coverImage: organzaColImg,
    slug: "ethereal-organza"
  },
  {
    id: "714d6600-4b0d-4ce2-b883-7729221199a2",
    name: "Shikargah Chronicles",
    tagline: "Tales of the royal hunt",
    description: "A celebration of Banaras' most complex weaving technique. The Shikargah collection features intricate, continuous patterns depicting dense forests, royal hunts, and wildlife. These are true heirloom pieces, taking master weavers several months to complete.",
    coverImage: shikargahColImg,
    slug: "shikargah-chronicles"
  },
  {
    id: "714d6600-4b0d-4ce2-b883-7729221199a3",
    name: "Vintage Tissue Silk",
    tagline: "Woven with liquid gold",
    description: "Woven with a mix of silk warp and metallic zari weft, the Tissue collection gives off an unparalleled, majestic metallic sheen. Reminiscent of the Mughal era, these sarees are the epitome of vintage luxury and dramatic flair.",
    coverImage: tissueColImg,
    slug: "vintage-tissue-silk"
  },
  {
    id: "714d6600-4b0d-4ce2-b883-7729221199a4",
    name: "The Kadwa Masterpieces",
    tagline: "Embossed artistry",
    description: "Showcasing the painstaking 'Kadwa' technique where each motif is woven separately, leaving no loose threads on the reverse. This collection offers crisp, raised zari designs that pop out against the silk base like masterfully carved jewelry.",
    coverImage: kadwaColImg,
    slug: "kadwa-masterpieces"
  },
  {
    id: "714d6600-4b0d-4ce2-b883-7729221199a5",
    name: "Tanchoi Illusions",
    tagline: "Subtle shadows, infinite depth",
    description: "Known for its smooth satin finish and lack of heavy zari, the Tanchoi weave uses up to five different colored silk threads to create complex, kaleidoscopic 'self-patterns'. A sublime choice for understated elegance and daytime events.",
    coverImage: tanchoiColImg,
    slug: "tanchoi-illusions"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Priyanka Sen",
    location: "Kolkata, India",
    quote: "I wore the Svarna Ivory saree for my wedding ceremony. The weight, the sheen, and knowing it was handloom woven by Ramprasad made me feel connected to Varanasi. Magnificent drapery!",
    rating: 5,
    date: "2026-02-14"
  },
  {
    id: "2",
    name: "Devika Swaroop",
    location: "London, UK",
    quote: "The deep maroon Shikargah is a visual triumph. People couldn't stop looking at the elaborate bird and forest details. The quality easily rivals the grandest designer labels, with far greater soul.",
    rating: 5,
    date: "2026-03-30"
  },
  {
    id: "3",
    name: "Meera Nair",
    location: "New York, USA",
    quote: "Customer support was brilliant. They sent videos of the artisan finishing my saree on the loom before dispatch. This is absolute luxury Indian storytelling at its finest.",
    rating: 5,
    date: "2026-04-12"
  }
];

export const FAQS = [
  {
    question: "Do you supply certificates of authenticity for the Zari?",
    answer: "Yes. Every saree in our 'Pure Gold Zari' series is accompanied by a laboratory certificate of purity, confirming the material details, precious metal weight analysis, and a signed letter from the weaver family."
  },
  {
    question: "How long does a handloom saree take to be made?",
    answer: "Our simpler Tanchoi drapes take approximately 25-45 hours. High-complexity masterpieces like the Shikargah or Antique Tissue require intimate precision work taking up to 180 to 240 active loom hours under multiple master craftsmen."
  },
  {
    question: "Do you offer customizable blouse stitching?",
    answer: "Absolutely. During checkout, you can select 'Premium Blouse Stitching' and provide your dimensions, or request our dedicated designer to schedule a virtual call to finalize traditional or contemporary designs."
  },
  {
    question: "What is your global shipping policy?",
    answer: "We offer secure, insured global express shipping across the USA, UK, UAE, and Canada. Each saree is dispatched inside a climate-controlled cedarwood premium storage casket to prevent moisture oxidation."
  }
];
