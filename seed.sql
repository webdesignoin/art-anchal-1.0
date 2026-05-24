-- =========================================================================
-- Art&Anchal Varanasi Handloom Database Seed Script
-- Execute this in your Supabase SQL Editor after creating the schema.
-- =========================================================================

-- 1. Default Admin Account Profile
INSERT INTO public.profiles (id, name, email, phone, is_admin, source)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
    'Anoop Kumar (Boutique Director)', 
    'admin@artandanchal.com', 
    '+91 94501 12345', 
    TRUE, 
    'offline'
) ON CONFLICT (email) DO NOTHING;

-- 2. Populate Master Artisans (Weavers)
INSERT INTO public.artisans (id, name, age, village, experience_years, specialty, quote, story, image_url)
VALUES 
(
    'e29d6600-4b0d-4ce2-b883-7729221199a0',
    'Ramprasad Maurya',
    61,
    'Sarai Mohana village, Varanasi',
    42,
    'Pure Katan & Handcrafted Kadwa Weaves',
    'Each thread of zari carries the heartbeat of the loom. If my mind is at peace, the saree sings.',
    'Ramprasad Maurya learned the art of handloom weaving from his grandfather at the age of twelve. In his workshop alongside the sacred Ganges, the gentle clanking of wooden shafts is the background track of his life. Through Art&Anchal, Ramprasad is paid above-market wages directly, helping him train three grandchildren to continue this masterwork instead of leaving for city manufacturing jobs.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'
),
(
    'e29d6600-4b0d-4ce2-b883-7729221199a1',
    'Anjali Mishra',
    29,
    'Sarai Mohana community, Varanasi',
    9,
    'Translucent Organza & Fine Silver Brocade',
    'Women were historically barred from the heavy looms, but our hands possess the precise delicacy that heavy zari needs.',
    'As one of Art&Anchal''s female master weavers, Anjali shattered local stereotypes. After her father suffered a stroke, she stepped in to handle the family''s traditional wooden loom. Working with Art&Anchal''s women empowerment cooperative, she co-designed our modern pastel collections, blending deep ancestral techniques with contemporary palettes.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'
),
(
    'e29d6600-4b0d-4ce2-b883-7729221199a2',
    'Mohammad Kabir Ahmed',
    52,
    'Lohta weavers district, Varanasi',
    36,
    'High-complexity Shikargah & Royal Brocades',
    'Shikargah requires mathematical precision. A single misplaced yarn, and the lion on the saree loses its shape.',
    'Kabir is a globally celebrated heritage archivist. He reconstructs historical Banarasi patterns from raw sketches found in Mughal handbooks. He leads a small cooperative of ten weavers in Lohta, collaborating with Art&Anchal to document, produce, and sell royal masterpieces that take up to three months of single-saree weaving time.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Populate Collections
INSERT INTO public.collections (id, name, slug, tagline, description, cover_image)
VALUES
(
    'c39d6600-4b0d-4ce2-b883-7729221199c0',
    'The Royal Shikargah Archive',
    'shikargah',
    'Beasts and Blooms of Imperial Handlooms',
    'Revisiting Mughal-era hunting tapestry weavers, these heavy, twill-woven pure silk sarees depict leopards, falcons, and intricate florals in breathtaking 24k gold zari.',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
),
(
    'c39d6600-4b0d-4ce2-b883-7729221199c1',
    'The Svarna Heritage',
    'katan-silk',
    'Sacred Ivory and Pure Gold Zari Drapes',
    'Crafted exclusively for the modern minimalist bride. Luminous ivory mulberry silk matched with precise Kadwa booties that reflect classical heritage.',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
),
(
    'c39d6600-4b0d-4ce2-b883-7729221199c2',
    'The Tanchoi Symphony',
    'tanchoi',
    'Lightweight Satin Weaves for Midnight Receptions',
    'Soft self-patterned satin drapes utilizing dual-side color yarns. Beautifully fluid, comfortable, and perfect for the dynamic modern woman.',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Populate Sarees (Bespoke Handloom Inventory)
INSERT INTO public.sarees (
    id, name, price, original_price, rating, reviews_count, images, collection_id, colors, zari_type, 
    weaving_technique, material, artisan_id, description, drape_recommendation, is_bestseller, is_featured, is_new,
    spec_length, spec_width, spec_blouse, spec_wash_care, spec_origin
)
VALUES
(
    '10100000-0000-0000-0000-000000000001',
    'Svarna Ivory Katan Silk Handloom Saree',
    148000.00,
    175000.00,
    4.9,
    24,
    ARRAY[
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ],
    'c39d6600-4b0d-4ce2-b883-7729221199c1',
    ARRAY['Ivory', 'Gold'],
    'Pure Gold Zari',
    'Kadwa Handloom',
    '100% Pure Mulberry Katan Silk',
    'e29d6600-4b0d-4ce2-b883-7729221199a0',
    'An absolute masterwork of pure heritage, the Svarna Saree is meticulously handwoven using the premium mulberry Katan silk in our signature ivory hue. Wrapped with genuine 24-karat gold-plated silver zari thread (Kadwa design), it is an heirloom treasure representing over 180 hours of silent handloom devotion by master weaver Ramprasad Maurya.',
    'Perfect for Royal Indian Weddings, Heirloom Trousseaus, and Milestone Receptions.',
    TRUE,
    TRUE,
    FALSE,
    '5.5 Meters',
    '45 Inches',
    '80 Centimeters (matching raw silk with border)',
    'Strictly Dry Clean Only',
    'Varanasi, Uttar Pradesh, India'
),
(
    '10100000-0000-0000-0000-000000000002',
    'Maharani Crimson Shikargah Handloom Saree',
    185000.00,
    NULL,
    5.0,
    18,
    ARRAY[
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610030470208-ebd3c8477ff9?auto=format&fit=crop&q=80&w=800'
    ],
    'c39d6600-4b0d-4ce2-b883-7729221199c0',
    ARRAY['Deep Maroon', 'Gold'],
    'Pure Gold Zari',
    'Kadwa Handloom',
    'Pure Twill-woven Katan Silk',
    'e29d6600-4b0d-4ce2-b883-7729221199a2',
    'The Shikargah is one of the most historically complex Banarasi weaves, depicting dynamic jungle hunting motifs, birds of paradise, roaring lions, and dense foliage. Woven in deep, royal-blooded crimson with authentic light-gold zari, this saree features a classic heavy border and a cascading pallu that captures royal elegance.',
    'A breathtaking choice for Brides on their main Wedding Snaps or Traditional Sangeet ceremonies.',
    TRUE,
    TRUE,
    TRUE,
    '5.6 Meters',
    '44.5 Inches',
    '85 Centimeters (crimson silk with bird motif border)',
    'Dry Clean Only, Store wrap in pure muslin fabric',
    'Varanasi, Uttar Pradesh, India'
),
(
    '10100000-0000-0000-0000-000000000003',
    'Nilambari Classic Cobalt Tanchoi Saree',
    84500.00,
    95000.00,
    4.8,
    31,
    ARRAY[
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ],
    'c39d6600-4b0d-4ce2-b883-7729221199c2',
    ARRAY['Cobalt Blue', 'Gold'],
    'Tested Zari',
    'Tanchoi Weave',
    'Satin Silk Weave',
    NULL,
    'Crafted via the ancient satin-weave style known as Tanchoi, this classic deep-cobalt saree creates a self-pattern gloss on the fabric face. Intertwined with high-grade copper-plated gold-lustre thread, it highlights small paisleys and stylized lotuses across the body of the saree.',
    'Sophisticated formal gatherings, Cocktail dinners, and Festive celebrations.',
    FALSE,
    TRUE,
    FALSE,
    '5.5 Meters',
    '45 Inches',
    '80 Centimeters (Cobalt jacquard silk)',
    'Dry Clean Only',
    'Varanasi Heritage Belt, India'
),
(
    '10100000-0000-0000-0000-000000000004',
    'Vasundhara Emerald Green Katan Handloom',
    98000.00,
    NULL,
    4.9,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
    ],
    'c39d6600-4b0d-4ce2-b883-7729221199c1',
    ARRAY['Emerald Green', 'Silver'],
    'Silver Zari',
    'Kadwa Handloom',
    '100% Pure Dupion Weft Katan Silk',
    'e29d6600-4b0d-4ce2-b883-7729221199a1',
    'Vasundhara means the Earth—representing rich natural fertility. Handwoven in shimmering dark emerald with real silver zari thread, this masterpiece includes elaborate mango bootas (paisleys). It features heavy borders displaying traditional floral wines.',
    'Perfect for Diwali, Karwa Chauth, or luxurious family durbars.',
    TRUE,
    FALSE,
    TRUE,
    '5.5 Meters',
    '45 Inches',
    '80 Centimeters (Emerald silk with contrasting borders)',
    'Dry Clean, Store under cotton wraps in dark wood chests',
    'Varanasi Cooperactive Sector, India'
)
ON CONFLICT (id) DO NOTHING;
