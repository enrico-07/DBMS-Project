-- ====================================================================
-- RECIPEVAULT 3NF SEMANTIC INGREDIENTS & VARIETIES ONTOLOGY MIGRATION
-- Migration Date: 2026-10-24
-- Description: Establishes first-class semantic entities for ingredients,
--              subdivisions/varieties, allergens array, and dietary tags.
-- ====================================================================

-- 1. Extend the core 'ingredients' table with semantic dietary flags and allergens
ALTER TABLE IF EXISTS public.ingredients
  ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}'::TEXT[];

-- 1b. Update category check constraint to support 'Nuts & Seeds' and flexible culinary categories
ALTER TABLE IF EXISTS public.ingredients 
  DROP CONSTRAINT IF EXISTS ingredients_category_check;

ALTER TABLE IF EXISTS public.ingredients
  ADD CONSTRAINT ingredients_category_check 
  CHECK (category IN (
    'Baking', 
    'Dairy & Eggs', 
    'Produce', 
    'Pantry & Spices', 
    'Nuts & Seeds', 
    'Grains & Pasta', 
    'Legumes', 
    'Proteins', 
    'Condiments',
    'Other'
  ));

-- 2. Create the 3NF Subdivision / Variety table
CREATE TABLE IF NOT EXISTS public.ingredient_varieties (
  variety_id VARCHAR(100) PRIMARY KEY,
  ingredient_id VARCHAR(100) NOT NULL REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE,
  variety_name VARCHAR(255) NOT NULL,
  default_unit VARCHAR(50) DEFAULT 'g',
  culinary_role TEXT,
  relative_calories_multiplier NUMERIC(4,2) DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now())
);

-- Index for high-performance join lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_varieties_ingredient_id 
  ON public.ingredient_varieties(ingredient_id);

-- 3. Link variety to recipe_ingredients junction table
ALTER TABLE IF EXISTS public.recipe_ingredients
  ADD COLUMN IF NOT EXISTS variety_id VARCHAR(100) REFERENCES public.ingredient_varieties(variety_id) ON DELETE SET NULL;

-- 4. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.ingredient_varieties ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ingredient_varieties' AND policyname = 'Public read access for ingredient varieties'
  ) THEN
    CREATE POLICY "Public read access for ingredient varieties"
      ON public.ingredient_varieties FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ingredient_varieties' AND policyname = 'Public insert/update access for ingredient varieties'
  ) THEN
    CREATE POLICY "Public insert/update access for ingredient varieties"
      ON public.ingredient_varieties FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 5. Seed Core Semantic Ingredients
INSERT INTO public.ingredients (
  ingredient_id, canonical_name, category, flavor_profile, substitute_summary, 
  storage_guidelines, common_uses, calories_per_100g, protein_per_100g, 
  carbs_per_100g, fat_per_100g, fiber_per_100g, glycemic_index, 
  is_diabetic_friendly, is_pcos_friendly, is_gluten_free, is_vegan, is_vegetarian, allergens
) VALUES
  -- Baking flours
  ('ing-flour', 'Wheat Flour', 'Baking', 'Clean wheaty starchy base', 'Almond flour or GF blend', 'Airtight container in cool pantry', 'Cakes, lava cakes, bread doughs, cookies', 364, 10.3, 76.3, 1.0, 2.7, 'High', false, false, false, true, true, ARRAY['Gluten']),
  ('ing-almond-flour', 'Almond Flour', 'Baking', 'Sweet, buttery, rich nutty moisture', 'Hazelnut or oat flour', 'Refrigerate sealed', 'Macarons, gluten-free bakes', 571, 21.4, 21.4, 50.0, 10.7, 'Low', true, true, true, true, true, ARRAY['Tree Nuts']),
  -- Sugars & Sweeteners
  ('ing-sugar', 'Sugar', 'Baking', 'Pure crystalline sweetness', 'Maple syrup or monkfruit', 'Airtight container in dry pantry', 'Aerating butter, caramelization, moisture retention', 387, 0, 100, 0, 0, 'High', false, false, true, true, true, ARRAY[]::TEXT[]),
  ('ing-sweeteners-natural', 'Natural Syrups & Honey', 'Baking', 'Complex floral, woody sweetness', 'Date syrup', 'Refrigerate syrup; room temp for honey', 'Glazes, granolas, sweetening batters', 260, 0.1, 67.0, 0.1, 0, 'Medium', false, false, true, false, true, ARRAY[]::TEXT[]),
  -- Chocolates & Cocoa
  ('ing-chocolate', 'Chocolate', 'Baking', 'Roasted cacao, bittersweet cocoa butter', 'Cocoa powder + butter/oil', 'Cool dark pantry away from sunlight', 'Lava cakes, ganaches, brownies', 546, 4.9, 61.0, 31.0, 7.0, 'Medium', false, false, true, false, true, ARRAY['Dairy']),
  ('ing-cocoa', 'Cocoa Powder', 'Baking', 'Deep concentrated roasted chocolate essence', 'Melted unsweetened chocolate', 'Dry cupboard airtight', 'Dusting, frosting, devil food cake', 228, 19.6, 57.9, 13.7, 33.2, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
  -- Butters & Fats
  ('ing-butter', 'Butter', 'Dairy & Eggs', 'Rich, creamy luscious dairy fat', 'Coconut oil or olive oil', 'Refrigerate at 2-4°C', 'Lava cakes, laminated doughs, sauces, creaming', 717, 0.9, 0.1, 81.1, 0, 'Low', true, true, true, false, true, ARRAY['Dairy']),
  -- Milks & Creams
  ('ing-milk', 'Milk & Dairy Cream', 'Dairy & Eggs', 'Mildly sweet, silky butterfat emulsion', 'Oat milk or almond milk', 'Refrigerate at 1-4°C', 'Custards, cakes, ganaches, batters', 61, 3.2, 4.8, 3.3, 0, 'Low', true, true, true, false, true, ARRAY['Dairy']),
  ('ing-plant-milk', 'Plant-Based Milk', 'Dairy & Eggs', 'Creamy plant-derived cereal milk', 'Dairy milk', 'Refrigerate once opened', 'Vegan bakes, lattes, smoothies', 45, 1.5, 6.5, 1.5, 0.8, 'Low', true, true, true, true, true, ARRAY['Tree Nuts', 'Soy']),
  -- Peanuts & Tree Nuts
  ('ing-peanuts', 'Peanuts', 'Nuts & Seeds', 'Roasted nutty savory-sweet legumes', 'Toasted sunflower seeds', 'Airtight container in cool pantry', 'Cookies, satay sauce, brittle', 567, 25.8, 16.1, 49.2, 8.5, 'Low', true, true, true, true, true, ARRAY['Peanuts']),
  ('ing-tree-nuts', 'Tree Nuts', 'Nuts & Seeds', 'Buttery, rich, earthy crunchy halves', 'Pumpkin seeds', 'Refrigerate sealed to avoid rancidity', 'Brownies, banana bread, pestos', 654, 15.2, 13.7, 65.2, 6.7, 'Low', true, true, true, true, true, ARRAY['Tree Nuts']),
  -- Aromatics & Leaveners
  ('ing-vanilla', 'Vanilla', 'Baking', 'Sweet floral aromatic vanillin', 'Almond extract', 'Cool dark cupboard', 'Dessert backbone, cakes, custards', 288, 0.1, 12.7, 0.1, 0, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
  ('ing-leaveners', 'Baking Leaveners', 'Baking', 'Carbon dioxide micro-bubble producer', 'Whipped egg whites', 'Tightly sealed dry pantry', 'Quick breads, cakes, pancakes, pizza dough', 53, 0, 28.0, 0, 0, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
  -- Healthy Carbohydrates
  ('ing-sweet-potato', 'Sweet Potato', 'Produce', 'Sweet, earthy beta-carotene prebiotic fiber', 'Butternut squash', 'Cool dark dry pantry', 'Roasted wedges, healthy brownies, mash', 86, 1.6, 20.1, 0.1, 3.0, 'Medium', true, true, true, true, true, ARRAY[]::TEXT[]),
  ('ing-rice', 'Rice', 'Grains & Pasta', 'Fragrant cereal grain with chew', 'Quinoa or riced cauliflower', 'Airtight container in dry pantry', 'Bowls, pilafs, risottos, sushi', 130, 2.7, 28.0, 0.3, 0.4, 'Medium', false, false, true, true, true, ARRAY[]::TEXT[])
ON CONFLICT (ingredient_id) DO UPDATE SET
  canonical_name = EXCLUDED.canonical_name,
  category = EXCLUDED.category,
  flavor_profile = EXCLUDED.flavor_profile,
  calories_per_100g = EXCLUDED.calories_per_100g,
  protein_per_100g = EXCLUDED.protein_per_100g,
  carbs_per_100g = EXCLUDED.carbs_per_100g,
  fat_per_100g = EXCLUDED.fat_per_100g,
  fiber_per_100g = EXCLUDED.fiber_per_100g,
  glycemic_index = EXCLUDED.glycemic_index,
  is_diabetic_friendly = EXCLUDED.is_diabetic_friendly,
  is_pcos_friendly = EXCLUDED.is_pcos_friendly,
  is_gluten_free = EXCLUDED.is_gluten_free,
  is_vegan = EXCLUDED.is_vegan,
  is_vegetarian = EXCLUDED.is_vegetarian,
  allergens = EXCLUDED.allergens;

-- 6. Seed Semantic Subdivisions & Varieties
INSERT INTO public.ingredient_varieties (variety_id, ingredient_id, variety_name, default_unit, culinary_role, relative_calories_multiplier) VALUES
  -- Flour Varieties
  ('var-flour-ap', 'ing-flour', 'All-Purpose Flour', 'g', 'Standard versatile baking flour (10-12% protein)', 1.00),
  ('var-flour-bread', 'ing-flour', 'High-Protein Bread Flour', 'g', 'High gluten (12-14%) for chewy artisan breads', 1.00),
  ('var-flour-cake', 'ing-flour', 'Cake & Pastry Flour', 'g', 'Low protein bleached flour for delicate crumbs', 0.98),
  ('var-flour-wholewheat', 'ing-flour', 'Whole Wheat Flour', 'g', 'Unrefined grain with bran and germ', 0.95),
  ('var-almond-blanched', 'ing-almond-flour', 'Super-Fine Blanched Almond Flour', 'g', 'Skinless finely milled almond flour for pastries', 1.00),
  ('var-almond-meal', 'ing-almond-flour', 'Coarse Natural Almond Meal', 'g', 'Rustic unblanched ground almonds', 1.00),

  -- Sugar Varieties
  ('var-sugar-granulated', 'ing-sugar', 'Granulated White Sugar', 'g', 'Standard crystalline white table sugar', 1.00),
  ('var-sugar-powdered', 'ing-sugar', 'Powdered / Confectioners Sugar', 'g', 'Pulverized sugar with cornstarch for frostings', 1.00),
  ('var-sugar-light-brown', 'ing-sugar', 'Light Brown Sugar', 'g', '3.5% molasses for subtle caramel and moisture', 0.98),
  ('var-sugar-dark-brown', 'ing-sugar', 'Dark Brown Sugar', 'g', '6.5% molasses for deep toffee flavor', 0.98),
  ('var-sugar-caster', 'ing-sugar', 'Superfine Caster Sugar', 'g', 'Fine crystals for meringues and light sponges', 1.00),
  ('var-sugar-demerara', 'ing-sugar', 'Demerara / Turbinado Raw Sugar', 'g', 'Large crunchy crystals for pie crusts', 1.02),

  -- Sweeteners
  ('var-sweet-maple', 'ing-sweeteners-natural', 'Grade A Pure Maple Syrup', 'ml', 'Woody caramel maple sap syrup', 1.00),
  ('var-sweet-honey', 'ing-sweeteners-natural', 'Raw Wildflower Honey', 'tbsp', 'Floral natural viscous bee nectar', 1.15),
  ('var-sweet-agave', 'ing-sweeteners-natural', 'Blue Agave Nectar', 'tbsp', 'Mild liquid plant sweetener with lower GI spike', 1.18),

  -- Chocolate Varieties
  ('var-choc-dark70', 'ing-chocolate', '70% Bittersweet Dark Chocolate', 'g', 'High cacao content for intense lava cakes', 1.05),
  ('var-choc-semisweet', 'ing-chocolate', 'Semi-Sweet Chocolate (55-60%)', 'g', 'Balanced sweetness for cookies and ganache', 1.00),
  ('var-choc-milk', 'ing-chocolate', 'Creamy Milk Chocolate', 'g', 'Sweet lactic chocolate with dairy solids', 1.02),
  ('var-choc-white', 'ing-chocolate', 'Pure White Chocolate', 'g', 'Cocoa butter and vanilla without cocoa solids', 1.08),
  ('var-choc-chips', 'ing-chocolate', 'Baking Chocolate Chips', 'g', 'Shape-holding chips for muffins and cakes', 0.98),
  ('var-cocoa-dutch', 'ing-cocoa', 'Dutch-Processed Alkalized Cocoa Powder', 'g', 'Neutralized acid dark cocoa powder', 1.00),
  ('var-cocoa-natural', 'ing-cocoa', 'Natural Unsweetened Cocoa Powder', 'g', 'Acidic lighter cocoa pairing with baking soda', 0.95),

  -- Butter Varieties
  ('var-butter-unsalted', 'ing-butter', 'Unsalted European Butter', 'g', '82%+ butterfat without sodium for baking', 1.00),
  ('var-butter-salted', 'ing-butter', 'Salted Sweet Cream Butter', 'g', 'Everyday table butter with 1.5% salt', 1.00),
  ('var-butter-brown', 'ing-butter', 'Brown Butter (Beurre Noisette)', 'g', 'Toasted milk solids yielding nutty aroma', 1.00),
  ('var-butter-melted', 'ing-butter', 'Melted Warm Butter', 'g', 'Liquid emulsified fat for chocolate lava cakes', 1.00),
  ('var-butter-clarified', 'ing-butter', 'Clarified Butter / Desi Ghee', 'tbsp', 'Pure milk fat with solids removed', 1.25),

  -- Dairy Milk Varieties
  ('var-milk-whole', 'ing-milk', 'Whole Dairy Milk (3.25%)', 'ml', 'Full fat dairy milk for moisture and tender crumb', 1.00),
  ('var-milk-skim', 'ing-milk', 'Skim / Non-Fat Milk', 'ml', 'Low calorie non-fat milk', 0.60),
  ('var-milk-heavy-cream', 'ing-milk', 'Heavy Whipping Cream (36%)', 'ml', 'High fat cream for ganaches and whipped topping', 5.50),
  ('var-milk-buttermilk', 'ing-milk', 'Cultured Buttermilk', 'ml', 'Acidic cultured dairy that tenderizes crumb', 0.80),
  ('var-milk-evaporated', 'ing-milk', 'Evaporated Milk', 'ml', '60% water removed for velvety fillings', 2.10),
  ('var-milk-condensed', 'ing-milk', 'Sweetened Condensed Milk', 'ml', 'Caramelized sugary concentrated dairy', 5.20),

  -- Plant Milks
  ('var-milk-oat', 'ing-plant-milk', 'Creamy Barista Oat Milk', 'ml', 'Naturally sweet oat beverage', 1.00),
  ('var-milk-almond', 'ing-plant-milk', 'Unsweetened Almond Milk', 'ml', 'Low calorie nutty plant beverage', 0.35),
  ('var-milk-soy', 'ing-plant-milk', 'Organic Soy Milk', 'ml', 'High protein plant milk that curdles like dairy', 1.10),

  -- Peanuts & Tree Nuts
  ('var-peanuts-roasted', 'ing-peanuts', 'Roasted Salted Peanuts', 'g', 'Golden crunchy roasted peanuts', 1.00),
  ('var-peanuts-raw', 'ing-peanuts', 'Raw Shelled Peanuts', 'g', 'Unroasted peanuts for boiling and baking', 0.95),
  ('var-peanut-butter-creamy', 'ing-peanuts', 'Creamy Smooth Peanut Butter', 'tbsp', 'Emulsified peanut paste for cookies and satay', 1.05),
  ('var-peanut-butter-crunchy', 'ing-peanuts', 'Natural Crunchy Peanut Butter', 'tbsp', 'Crushed nut chunks with natural oil', 1.05),
  ('var-nuts-walnuts', 'ing-tree-nuts', 'Shelled English Walnuts', 'g', 'Earthy tannin-rich nut halves for brownies', 1.00),
  ('var-nuts-pecans', 'ing-tree-nuts', 'Southern Pecan Halves', 'g', 'Sweet buttery nut halves for pecan pies', 1.05),
  ('var-nuts-almonds', 'ing-tree-nuts', 'Sliced Toasted Almonds', 'g', 'Crisp shaved nuts for garnishing bakes', 0.95),

  -- Aromatics & Leaveners
  ('var-vanilla-extract', 'ing-vanilla', 'Pure Madagascar Bourbon Vanilla Extract', 'tsp', 'Standard alcohol vanilla tincture', 1.00),
  ('var-vanilla-bean', 'ing-vanilla', 'Whole Tahitian Vanilla Bean Pod', 'whole', 'Split pod with aromatic seeds', 0.50),
  ('var-vanilla-paste', 'ing-vanilla', 'Concentrated Vanilla Bean Paste', 'tsp', 'Viscous syrup speckled with vanilla caviar', 1.20),
  ('var-leaven-powder', 'ing-leaveners', 'Double-Acting Baking Powder', 'tsp', 'Releases CO2 upon moisture and heat', 1.00),
  ('var-leaven-soda', 'ing-leaveners', 'Pure Baking Soda (Sodium Bicarbonate)', 'tsp', 'Requires acid to activate rise', 0.00),
  ('var-leaven-yeast', 'ing-leaveners', 'Active Dry Baker’s Yeast', 'tsp', 'Ferments dough sugars to rise breads', 1.50),

  -- Produce & Rice
  ('var-sweetpot-orange', 'ing-sweet-potato', 'Beauregard Orange Sweet Potato', 'g', 'Moist beta-carotene rich sweet potato', 1.00),
  ('var-sweetpot-purple', 'ing-sweet-potato', 'Japanese Murasaki Purple Sweet Potato', 'g', 'Nutty dense purple sweet potato', 1.05),
  ('var-rice-brown', 'ing-rice', 'Whole Grain Brown Rice', 'g', 'High fiber low GI diabetic friendly grain', 1.00),
  ('var-rice-jasmine', 'ing-rice', 'Fragrant Jasmine Rice', 'g', 'Floral Thai white long-grain rice', 1.00),
  ('var-rice-basmati', 'ing-rice', 'Aged Himalayan Basmati Rice', 'g', 'Slender aromatic non-sticky rice', 1.00),
  ('var-rice-arborio', 'ing-rice', 'Italian Arborio Risotto Rice', 'g', 'Creamy high starch risotto rice', 1.05)
ON CONFLICT (variety_id) DO UPDATE SET
  variety_name = EXCLUDED.variety_name,
  default_unit = EXCLUDED.default_unit,
  culinary_role = EXCLUDED.culinary_role,
  relative_calories_multiplier = EXCLUDED.relative_calories_multiplier;
