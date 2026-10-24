-- ============================================================================
-- RECIPEVAULT: COMPLETE MASTER RELATIONAL SCHEMA & SEED SCRIPT
-- Version: 3.0 (Production 3NF Architecture with Semantic Ingredients & Varieties)
-- Safe to run in Supabase SQL Editor: drops and recreates schema cleanly.
-- ============================================================================

-- Step 1: Teardown existing tables and views in safe dependency order
DROP VIEW IF EXISTS v_diabetic_pcos_recommendations CASCADE;
DROP VIEW IF EXISTS v_pantry_match_helper CASCADE;
DROP VIEW IF EXISTS v_top_rated_recipes CASCADE;
DROP VIEW IF EXISTS v_healthy_recipe_summary CASCADE;
DROP VIEW IF EXISTS v_active_cook_profiles CASCADE;

DROP TABLE IF EXISTS recipe_health_suitability CASCADE;
DROP TABLE IF EXISTS recipe_tags CASCADE;
DROP TABLE IF EXISTS recipe_steps CASCADE;
DROP TABLE IF EXISTS user_pantry_items CASCADE;
DROP TABLE IF EXISTS user_health_profiles CASCADE;
DROP TABLE IF EXISTS user_disliked_ingredients CASCADE;
DROP TABLE IF EXISTS user_dietary_profiles CASCADE;
DROP TABLE IF EXISTS ratings_and_reviews CASCADE;
DROP TABLE IF EXISTS meal_plan_items CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS collection_recipes CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS ingredient_substitutes CASCADE;
DROP TABLE IF EXISTS ingredient_aliases CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS ingredient_varieties CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS recipe_versions CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS cuisines CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS & PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '$2a$12$demo_hash',
    full_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10) DEFAULT 'U',
    role VARCHAR(50) DEFAULT 'Home Cook',
    bio TEXT,
    cooking_skill VARCHAR(30) DEFAULT 'Home Cook',
    target_cook_time INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_dietary_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    preference_name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, preference_name)
);

CREATE TABLE user_disliked_ingredients (
    exclusion_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    UNIQUE (user_id, ingredient_name)
);

CREATE TABLE user_health_profiles (
    health_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    condition_name VARCHAR(100) NOT NULL,
    UNIQUE (user_id, condition_name)
);

CREATE TABLE user_pantry_items (
    pantry_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity NUMERIC(8, 2) DEFAULT 1.0 CHECK (quantity >= 0),
    unit VARCHAR(30) DEFAULT 'item',
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    is_staple BOOLEAN DEFAULT FALSE,
    UNIQUE (user_id, ingredient_name)
);

-- ----------------------------------------------------------------------------
-- 2. TAXONOMY: CUISINES & CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE cuisines (
    cuisine_id VARCHAR(50) PRIMARY KEY,
    cuisine_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE categories (
    category_id VARCHAR(50) PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- ----------------------------------------------------------------------------
-- 3. CANONICAL RECIPES (Using NUMERIC for nutrition to prevent any integer syntax errors)
-- ----------------------------------------------------------------------------
CREATE TABLE recipes (
    recipe_id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    servings INT NOT NULL DEFAULT 4 CHECK (servings > 0),
    prep_time INT NOT NULL DEFAULT 10 CHECK (prep_time >= 0),
    cook_time INT NOT NULL DEFAULT 15 CHECK (cook_time >= 0),
    total_time INT GENERATED ALWAYS AS (prep_time + cook_time) STORED,
    difficulty VARCHAR(20) DEFAULT 'Easy',
    diet_tag VARCHAR(50) DEFAULT 'Balanced',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    rating_count INT DEFAULT 0,
    calories NUMERIC(8, 2) DEFAULT 0,
    protein NUMERIC(8, 2) DEFAULT 0,
    carbs NUMERIC(8, 2) DEFAULT 0,
    fat NUMERIC(8, 2) DEFAULT 0,
    fiber NUMERIC(8, 2) DEFAULT 0,
    source_attribution VARCHAR(150),
    source_url TEXT,
    visibility VARCHAR(20) DEFAULT 'Public',
    status VARCHAR(20) DEFAULT 'Published',
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    cuisine_id VARCHAR(50) NOT NULL REFERENCES cuisines(cuisine_id) ON DELETE RESTRICT,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. RECIPE STEPS & TAGS
-- ----------------------------------------------------------------------------
CREATE TABLE recipe_steps (
    step_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    duration_minutes INT DEFAULT 0 CHECK (duration_minutes >= 0),
    culinary_tip TEXT,
    UNIQUE (recipe_id, step_number)
);

CREATE TABLE recipe_tags (
    tag_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    UNIQUE (recipe_id, tag_name)
);

-- ----------------------------------------------------------------------------
-- 5. MASTER INGREDIENTS & 3NF VARIETIES ONTOLOGY
-- ----------------------------------------------------------------------------
CREATE TABLE ingredients (
    ingredient_id VARCHAR(50) PRIMARY KEY,
    canonical_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'Pantry & Spices',
    flavor_profile TEXT,
    substitute_summary TEXT,
    storage_guidelines TEXT,
    common_uses TEXT,
    calories_per_100g NUMERIC(8, 2) DEFAULT 0,
    protein_per_100g NUMERIC(8, 2) DEFAULT 0,
    carbs_per_100g NUMERIC(8, 2) DEFAULT 0,
    fat_per_100g NUMERIC(8, 2) DEFAULT 0,
    fiber_per_100g NUMERIC(8, 2) DEFAULT 0,
    glycemic_index VARCHAR(20) DEFAULT 'Low',
    is_diabetic_friendly BOOLEAN DEFAULT TRUE,
    is_pcos_friendly BOOLEAN DEFAULT TRUE,
    is_gluten_free BOOLEAN DEFAULT TRUE,
    is_vegan BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN DEFAULT TRUE,
    allergens TEXT[] DEFAULT '{}'::TEXT[]
);

CREATE TABLE ingredient_varieties (
    variety_id VARCHAR(100) PRIMARY KEY,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    variety_name VARCHAR(255) NOT NULL,
    default_unit VARCHAR(50) DEFAULT 'g',
    culinary_role TEXT,
    relative_calories_multiplier NUMERIC(4, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now())
);
CREATE INDEX idx_ingredient_varieties_ingredient_id ON ingredient_varieties(ingredient_id);

CREATE TABLE ingredient_aliases (
    alias_id SERIAL PRIMARY KEY,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    alias_name VARCHAR(100) NOT NULL,
    UNIQUE (ingredient_id, alias_name)
);

CREATE TABLE ingredient_substitutes (
    substitute_id SERIAL PRIMARY KEY,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    substitute_ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    ratio VARCHAR(50) DEFAULT '1:1 ratio',
    culinary_notes TEXT,
    health_benefit TEXT,
    suitable_conditions VARCHAR(100),
    UNIQUE (ingredient_id, substitute_ingredient_id)
);

-- ----------------------------------------------------------------------------
-- 6. RECIPE TO INGREDIENT JUNCTION (3NF M:N)
-- ----------------------------------------------------------------------------
CREATE TABLE recipe_ingredients (
    junction_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    variety_id VARCHAR(100) REFERENCES ingredient_varieties(variety_id) ON DELETE SET NULL,
    quantity NUMERIC(8, 2) NOT NULL DEFAULT 1.0 CHECK (quantity > 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'g',
    preparation_state VARCHAR(100),
    is_optional BOOLEAN DEFAULT FALSE,
    UNIQUE (recipe_id, ingredient_id)
);

-- ----------------------------------------------------------------------------
-- 7. HEALTH SUITABILITY & VERSION CONTROL
-- ----------------------------------------------------------------------------
CREATE TABLE recipe_health_suitability (
    suitability_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    condition_id VARCHAR(50) NOT NULL,
    is_suitable BOOLEAN NOT NULL DEFAULT TRUE,
    clinical_rationale TEXT,
    dietary_badge VARCHAR(50),
    UNIQUE (recipe_id, condition_id)
);

CREATE TABLE recipe_versions (
    version_id VARCHAR(100) PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    version_number BIGINT NOT NULL,
    change_summary TEXT NOT NULL,
    author_id VARCHAR(50) NOT NULL REFERENCES users(user_id),
    author_name VARCHAR(100) NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. COLLECTIONS, RATINGS & REVIEWS, MEAL PLANS
-- ----------------------------------------------------------------------------
CREATE TABLE collections (
    collection_id VARCHAR(100) PRIMARY KEY,
    collection_name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collection_recipes (
    junction_id SERIAL PRIMARY KEY,
    collection_id VARCHAR(100) NOT NULL REFERENCES collections(collection_id) ON DELETE CASCADE,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collection_id, recipe_id)
);

CREATE TABLE ratings_and_reviews (
    review_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    verified_cook BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (recipe_id, user_id)
);

CREATE TABLE meal_plans (
    plan_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, week_start_date)
);

CREATE TABLE meal_plan_items (
    item_id SERIAL PRIMARY KEY,
    plan_id VARCHAR(100) NOT NULL REFERENCES meal_plans(plan_id) ON DELETE CASCADE,
    day_offset INT NOT NULL CHECK (day_offset >= 0 AND day_offset < 14),
    meal_type VARCHAR(20) NOT NULL,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    custom_servings INT,
    UNIQUE (plan_id, day_offset, meal_type)
);

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) & PUBLIC PERMISSIONS
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'user_dietary_profiles', 'user_disliked_ingredients', 'user_health_profiles',
        'user_pantry_items', 'cuisines', 'categories', 'recipes', 'recipe_steps', 'recipe_tags',
        'ingredients', 'ingredient_varieties', 'ingredient_aliases', 'ingredient_substitutes',
        'recipe_ingredients', 'recipe_health_suitability', 'recipe_versions', 'collections',
        'collection_recipes', 'ratings_and_reviews', 'meal_plans', 'meal_plan_items'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public all access on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public all access on %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 10. COMPREHENSIVE SEED DATA
-- ----------------------------------------------------------------------------

-- Taxonomies
INSERT INTO cuisines (cuisine_id, cuisine_name, description) VALUES
('Italian', 'Italian', 'Rich culinary tradition focused on fresh herbs, bronze-cut pasta, and olive oil.'),
('Mediterranean', 'Mediterranean', 'Sun-drenched cuisine rich in legumes, healthy fats, citrus, and fresh produce.'),
('American', 'American', 'Comforting diner classics, weekend brunch stacks, and hearth-baked staples.'),
('Indian', 'Indian', 'Layered spices, slow simmering, aromatics, and rich legume traditions.'),
('Japanese', 'Japanese', 'Seasonal delicacy, precise knife-work, umami dashi, and fermented subtleties.'),
('Mexican', 'Mexican', 'Vibrant chiles, warm spices, salsas, and fresh corn tortillas.'),
('French', 'French', 'Rich butter sauces, delicate pastries, and classic bistro creations.'),
('Asian', 'Asian', 'High-heat wok searing, aromatic ginger, soy, and crisp garden vegetables.'),
('Other', 'Other', 'Global fusion, experimental, and eclectic kitchen creations.');

INSERT INTO categories (category_id, category_name, description) VALUES
('Breakfast', 'Breakfast', 'Energizing morning meals, fluffy pancakes, and slow-morning oats.'),
('Lunch', 'Lunch', 'Vibrant harvest bowls, grain salads, and midday nourishment.'),
('Dinner', 'Dinner', 'Hearty roasts, simmered soups, and handmade pasta courses.'),
('Desserts', 'Desserts', 'Sweet finishes, baked fruits, and delicate pastries.'),
('Baking', 'Baking', 'Breads, cakes, cookies, pastries, and hearth-baked treats.'),
('Snacks', 'Snacks', 'Quick bites, energy bars, dips, and afternoon fuel.'),
('Beverages', 'Beverages', 'Refreshing teas, freshly pressed juices, and infusions.'),
('Salads', 'Salads', 'Crisp greens, grain bowls, and vibrant vinaigrettes.'),
('Soups', 'Soups', 'Slow-simmered broths, creamy chowders, and rustic stews.');

-- Core Demo Users
INSERT INTO users (user_id, username, email, password_hash, full_name, avatar, role, bio, cooking_skill, target_cook_time) VALUES
('user-eric', 'erictitus', 'eric@recipevault.internal', '$2a$12$demo_hash', 'Eric Titus', 'E', 'Home Cook & Curator', 'Passionate home cook fond of slow-simmered sauces, roasted herbs, and heritage cookbooks.', 'Home Cook', 35),
('user-neeraj', 'neerajk', 'neeraj@recipevault.internal', '$2a$12$demo_hash', 'Neeraj K', 'N', 'Fitness & High-Protein Meal Prep', 'Macro tracker and weekend meal planner focusing on clean fuel and high protein.', 'Seasoned Chef', 45),
('user-maya', 'mayalin', 'maya@recipevault.internal', '$2a$12$demo_hash', 'Maya Lin', 'M', 'Plant-Based Explorer', 'Busy student experimenting with seasonal veggies, bright lemon dressings, and 20-minute bowls.', 'Beginner', 25);

-- Master Ingredients
INSERT INTO ingredients (
  ingredient_id, canonical_name, category, flavor_profile, substitute_summary, 
  storage_guidelines, common_uses, calories_per_100g, protein_per_100g, carbs_per_100g, 
  fat_per_100g, fiber_per_100g, glycemic_index, is_diabetic_friendly, is_pcos_friendly, 
  is_gluten_free, is_vegan, is_vegetarian, allergens
) VALUES
('ing-flour', 'Wheat Flour', 'Baking', 'Clean wheaty starchy base', 'Almond flour or GF blend', 'Airtight container in cool pantry', 'Cakes, lava cakes, bread doughs, cookies', 364, 10.3, 76.3, 1.0, 2.7, 'High', false, false, false, true, true, ARRAY['Gluten']),
('ing-almond-flour', 'Almond Flour', 'Baking', 'Sweet, buttery, rich nutty moisture', 'Hazelnut or oat flour', 'Refrigerate sealed', 'Macarons, gluten-free bakes', 571, 21.4, 21.4, 50.0, 10.7, 'Low', true, true, true, true, true, ARRAY['Tree Nuts']),
('ing-sugar', 'Sugar', 'Baking', 'Pure crystalline sweetness', 'Maple syrup or monkfruit', 'Airtight container in dry pantry', 'Aerating butter, caramelization, moisture retention', 387, 0, 100, 0, 0, 'High', false, false, true, true, true, ARRAY[]::TEXT[]),
('ing-chocolate', 'Chocolate', 'Baking', 'Roasted cacao, bittersweet cocoa butter', 'Cocoa powder + butter/oil', 'Cool dark pantry away from sunlight', 'Lava cakes, ganaches, brownies', 546, 4.9, 61.0, 31.0, 7.0, 'Medium', false, false, true, false, true, ARRAY['Dairy']),
('ing-cocoa', 'Cocoa Powder', 'Baking', 'Deep concentrated roasted chocolate essence', 'Melted unsweetened chocolate', 'Dry cupboard airtight', 'Dusting, frosting, devil food cake', 228, 19.6, 57.9, 13.7, 33.2, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
('ing-butter', 'Butter', 'Dairy & Eggs', 'Rich, creamy luscious dairy fat', 'Coconut oil or olive oil', 'Refrigerate at 2-4°C', 'Lava cakes, laminated doughs, sauces, creaming', 717, 0.9, 0.1, 81.1, 0, 'Low', true, true, true, false, true, ARRAY['Dairy']),
('ing-milk', 'Milk & Dairy Cream', 'Dairy & Eggs', 'Mildly sweet, silky butterfat emulsion', 'Oat milk or almond milk', 'Refrigerate at 1-4°C', 'Custards, cakes, ganaches, batters', 61, 3.2, 4.8, 3.3, 0, 'Low', true, true, true, false, true, ARRAY['Dairy']),
('ing-plant-milk', 'Plant-Based Milk', 'Dairy & Eggs', 'Creamy plant-derived cereal milk', 'Dairy milk', 'Refrigerate once opened', 'Vegan bakes, lattes, smoothies', 45, 1.5, 6.5, 1.5, 0.8, 'Low', true, true, true, true, true, ARRAY['Tree Nuts', 'Soy']),
('ing-peanuts', 'Peanuts', 'Nuts & Seeds', 'Roasted nutty savory-sweet legumes', 'Toasted sunflower seeds', 'Airtight container in cool pantry', 'Cookies, satay sauce, brittle', 567, 25.8, 16.1, 49.2, 8.5, 'Low', true, true, true, true, true, ARRAY['Peanuts']),
('ing-pasta', 'Artisan Pasta', 'Grains & Pasta', 'Clean, wheaty, comforting starch', 'Gluten-free brown rice pasta or soba noodles', 'Cool, dry pantry in sealed airtight container', 'Pasta courses, minestrone additions', 371, 13.0, 74.0, 1.5, 3.2, 'Medium', false, false, false, true, true, ARRAY['Gluten']),
('ing-ricotta', 'Ricotta', 'Dairy & Eggs', 'Mild, silky, subtly sweet and lactic', 'Whipped whole milk cottage cheese', 'Refrigerate at 2-4°C; consume within 3-5 days', 'Filled pastas, cheesecakes, pancakes', 174, 11.3, 3.0, 13.0, 0, 'Low', true, true, true, false, true, ARRAY['Dairy']),
('ing-lemon', 'Lemon', 'Produce', 'Sharp citric acidity; fragrant zest oils', 'Lime juice, white wine vinegar, or ground sumac', 'Store at room temp up to 1 week; crisper drawer for 3 weeks', 'Dressings, marinades, baking balance', 29, 1.1, 9.3, 0.3, 2.8, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
('ing-olive-oil', 'Extra Virgin Olive Oil', 'Pantry & Spices', 'Fruity, grassy, peppery finish', 'Cold-pressed avocado oil or mild walnut oil', 'Dark glass bottle in a cool cupboard away from stove heat', 'Finishing warm pastas, dressings, sautéing', 884, 0, 0, 100, 0, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
('ing-basil', 'Fresh Basil', 'Produce', 'Peppery, sweet, with warm clove and anise', 'Fresh flat-leaf parsley blended with mint', 'Stems standing in water at room temperature', 'Pesto, Caprese, finishing pastas', 23, 3.2, 2.7, 0.6, 1.6, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
('ing-chickpeas', 'Chickpeas', 'Legumes', 'Nutty, buttery, earthy with firm bite', 'Cannellini beans or cooked green lentils', 'Airtight dry storage; refrigerated in broth for 4 days', 'Hummus, crisp oven snacks, harvest bowls', 164, 8.9, 27.4, 2.6, 7.6, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
('ing-tomatoes', 'Tomatoes', 'Produce', 'Juicy, bright acidity balanced by umami', 'Canned San Marzano tomatoes or roasted peppers', 'Always at room temp stem-down; never refrigerate', 'Soups, sauces, salads', 18, 0.9, 3.9, 0.2, 1.2, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
('ing-garlic', 'Garlic', 'Produce', 'Pungent raw; sweet and mellow roasted', 'Shallots, garlic scapes, or pinch of hing', 'Open basket in cool dark pantry', 'Foundational aromatic base', 149, 6.4, 33.1, 0.5, 2.1, 'Low', true, true, true, true, true, ARRAY[]::TEXT[]),
('ing-chicken', 'Chicken Breast', 'Proteins', 'Mild, lean, receptive to marinades', 'Firm tofu steaks, tempeh, or turkey tenderloin', 'Coldest back shelf of fridge for 2 days or freeze', 'Roasts, skillet sautés, grain bowls', 165, 31.0, 0, 3.6, 0, 'Low', true, true, true, false, false, ARRAY[]::TEXT[]),
('ing-potatoes', 'Yukon Gold Potatoes', 'Produce', 'Naturally buttery, crispy roasted', 'Red creamer potatoes or fingerlings', 'Cool, dark pantry away from onions', 'Crispy wedges, silky mash', 77, 2.0, 17.5, 0.1, 2.2, 'High', false, false, true, true, true, ARRAY[]::TEXT[]);

-- 3NF Varieties
INSERT INTO ingredient_varieties (variety_id, ingredient_id, variety_name, default_unit, culinary_role, relative_calories_multiplier) VALUES
('var-ap-flour', 'ing-flour', 'All-Purpose Flour (Maida)', 'g', 'Balanced gluten protein (~10-11%) for tender crumb', 1.00),
('var-bread-flour', 'ing-flour', 'High-Protein Bread Flour', 'g', 'High gluten (12-14%) elastic doughs and sourdoughs', 1.02),
('var-cake-flour', 'ing-flour', 'Cake & Pastry Flour', 'g', 'Chlorinated low gluten (~7-8%) for delicate velvet crumb', 0.98),
('var-whole-wheat-flour', 'ing-flour', 'Whole Wheat / Atta Flour', 'g', 'Nutty whole-kernel flour rich in wheat germ & bran fiber', 0.95),
('var-caster-sugar', 'ing-sugar', 'Fine Caster / Superfine Sugar', 'g', 'Dissolves instantly during creaming butter and meringue', 1.00),
('var-powdered-sugar', 'ing-sugar', 'Powdered / Confectioners Sugar', 'g', 'Finely pulverized with 3% cornstarch for frostings & glazes', 0.98),
('var-light-brown-sugar', 'ing-sugar', 'Light Brown Sugar (Soft Molasses)', 'g', 'Subtle butterscotch moisture and golden chewiness', 0.98),
('var-dark-brown-sugar', 'ing-sugar', 'Dark Brown Sugar (Rich Molasses)', 'g', 'Deep treacle flavor, enhanced acidity for baking soda reaction', 0.98),
('var-dark-choc-70', 'ing-chocolate', '70% Bittersweet Dark Chocolate', 'g', 'Clean cocoa snapping snap, low sugar, intense molten aroma', 1.05),
('var-milk-choc', 'ing-chocolate', 'Creamy Milk Chocolate (35% Cocoa)', 'g', 'Silky, dairy-rich, sweet melt for children bakes', 0.98),
('var-white-choc', 'ing-chocolate', 'White Chocolate (Pure Cocoa Butter)', 'g', 'Vanilla-infused cocoa butter without cocoa solids', 1.02),
('var-unsalted-butter', 'ing-butter', 'Unsalted Sweet Cream European Butter (82% Fat)', 'g', 'Precise sodium control, golden flaky crusts', 1.00),
('var-melted-butter', 'ing-butter', 'Melted Warm Butter', 'ml', 'Quick blending for brownies, pancakes, and lava cake batters', 1.00),
('var-brown-butter', 'ing-butter', 'Brown Butter (Beurre Noisette)', 'g', 'Nutty toasted caramelized milk solids for cookies', 1.00),
('var-whole-milk', 'ing-milk', 'Whole Dairy Milk (3.5% Butterfat)', 'ml', 'Classic rich emulsion for pastry creams and cake batters', 1.00),
('var-heavy-cream', 'ing-milk', 'Heavy Whipping Cream (36% Fat)', 'ml', 'Dense butterfat for ganaches, piping peaks, and rich caramels', 1.95),
('var-almond-milk', 'ing-plant-milk', 'Unsweetened Almond Milk', 'ml', 'Light, delicate nutty plant beverage', 0.60),
('var-oat-milk', 'ing-plant-milk', 'Barista Blend Oat Milk', 'ml', 'Naturally sweet cereal beta-glucans with silky body', 0.85);

-- Canonical Recipes
INSERT INTO recipes (
  recipe_id, title, description, image_url, servings, prep_time, cook_time, difficulty, diet_tag, 
  rating, rating_count, calories, protein, carbs, fat, fiber, source_attribution, visibility, status, 
  user_id, cuisine_id, category_id
) VALUES
('rosemary-roast-chicken', 'Lemon & Rosemary Roast Chicken', 'Crispy skin, tender juicy chicken, and Yukon gold potatoes roasted in lemon juices and fresh rosemary.', null, 4, 15, 50, 'Medium', 'High protein', 4.8, 22, 520, 42.0, 31.0, 25.0, 4.0, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-neeraj', 'Mediterranean', 'Dinner'),
('chickpea-harvest-bowl', 'Roasted Chickpea Harvest Bowl', 'Crispy cumin-roasted chickpeas, buttery ripe avocado, sweet tomatoes, and crisp greens with lemon-tahini.', null, 2, 10, 20, 'Easy', 'Vegan', 5.0, 1, 390, 16.0, 45.0, 18.0, 11.0, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-maya', 'Mediterranean', 'Lunch'),
('lemon-herb-pasta', 'Lemon Ricotta Silk Pasta', 'Delicate artisan pasta ribbons enrobed in whipped ricotta, vibrant fresh lemon zest, and garden basil.', null, 2, 10, 15, 'Easy', 'Vegetarian', 4.9, 14, 440, 18.0, 62.0, 14.0, 3.5, 'Eric Titus Kitchen', 'Public', 'Published', 'user-eric', 'Italian', 'Dinner');

-- Recipe Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction, duration_minutes, culinary_tip) VALUES
('rosemary-roast-chicken', 1, 'Preheat oven to 200°C (400°F). Toss potatoes in olive oil, salt, pepper, and fresh chopped rosemary.', 5, 'Par-boil potatoes for 3 minutes for an extra crispy exterior.'),
('rosemary-roast-chicken', 2, 'Season chicken generously. Place skin-side up over the potato layer and roast for 45 minutes.', 45, 'Use an instant-read thermometer targeting 74°C (165°F) at the thickest part.'),
('rosemary-roast-chicken', 3, 'Rest for 8 minutes, squeeze halved grilled lemons over top, and serve hot.', 8, 'Never skip resting; it allows savory juices to redistribute.'),
('chickpea-harvest-bowl', 1, 'Drain and pat chickpeas completely dry with paper towels. Toss with olive oil, cumin, and sea salt.', 5, 'Completely dry chickpeas guarantee a crunchy oven roast rather than a steam.'),
('chickpea-harvest-bowl', 2, 'Roast at 205°C (400°F) for 20 minutes until crisp and golden brown.', 20, 'Shake sheet pan midway through baking.'),
('chickpea-harvest-bowl', 3, 'Assemble with chopped tomatoes, greens, sliced avocado, and drizzle generous lemon-tahini dressing.', 5, 'Season tomatoes with salt 2 minutes prior to enhance flavor.'),
('lemon-herb-pasta', 1, 'Boil salted water and cook artisan pasta until al dente.', 10, 'Reserve 1/2 cup starchy pasta cooking water before draining.'),
('lemon-herb-pasta', 2, 'In warm pan, fold whipped ricotta, lemon zest, juice, and warm olive oil together.', 3, 'Use gentle heat to prevent ricotta from curdling.'),
('lemon-herb-pasta', 3, 'Toss hot pasta with ricotta sauce, stirring in reserved pasta water until glossy.', 2, 'Top with freshly torn sweet basil leaves.');

-- Recipe Tags
INSERT INTO recipe_tags (recipe_id, tag_name) VALUES
('rosemary-roast-chicken', 'Mediterranean'),
('rosemary-roast-chicken', 'High protein'),
('rosemary-roast-chicken', 'Dinner'),
('rosemary-roast-chicken', 'Poultry'),
('chickpea-harvest-bowl', 'Mediterranean'),
('chickpea-harvest-bowl', 'Vegan'),
('chickpea-harvest-bowl', 'Lunch'),
('chickpea-harvest-bowl', 'Gluten-free'),
('lemon-herb-pasta', 'Italian'),
('lemon-herb-pasta', 'Vegetarian'),
('lemon-herb-pasta', 'Dinner'),
('lemon-herb-pasta', 'Pasta');

-- Recipe Ingredients Junction
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, preparation_state, is_optional) VALUES
('rosemary-roast-chicken', 'ing-chicken', 600, 'g', 'bone-in thighs, patted dry', false),
('rosemary-roast-chicken', 'ing-potatoes', 500, 'g', 'halved into bite-sized wedges', false),
('rosemary-roast-chicken', 'ing-lemon', 2, 'whole', 'halved for roasting', false),
('rosemary-roast-chicken', 'ing-olive-oil', 30, 'ml', 'cold-pressed virgin', false),
('chickpea-harvest-bowl', 'ing-chickpeas', 400, 'g', 'rinsed and thoroughly dried', false),
('chickpea-harvest-bowl', 'ing-tomatoes', 150, 'g', 'quartered ripe sweet', false),
('chickpea-harvest-bowl', 'ing-lemon', 1, 'whole', 'freshly squeezed', false),
('chickpea-harvest-bowl', 'ing-olive-oil', 20, 'ml', 'extra virgin', false),
('lemon-herb-pasta', 'ing-pasta', 250, 'g', 'bronze-cut artisan', false),
('lemon-herb-pasta', 'ing-ricotta', 150, 'g', 'whipped whole-milk', false),
('lemon-herb-pasta', 'ing-lemon', 1, 'whole', 'zested and juiced', false),
('lemon-herb-pasta', 'ing-basil', 1, 'bunch', 'freshly torn leaves', false),
('lemon-herb-pasta', 'ing-olive-oil', 25, 'ml', 'extra virgin', false);

-- Initial Version Records
INSERT INTO recipe_versions (version_id, recipe_id, version_number, change_summary, author_id, author_name, snapshot_data) VALUES
('ver-rosemary-roast-chicken-1', 'rosemary-roast-chicken', 1, 'Original kitchen publication', 'user-neeraj', 'Neeraj K', '{"title": "Lemon & Rosemary Roast Chicken"}'),
('ver-chickpea-harvest-bowl-1', 'chickpea-harvest-bowl', 1, 'Original kitchen publication', 'user-maya', 'Maya Lin', '{"title": "Roasted Chickpea Harvest Bowl"}'),
('ver-lemon-herb-pasta-1', 'lemon-herb-pasta', 1, 'Original kitchen publication', 'user-eric', 'Eric Titus', '{"title": "Lemon Ricotta Silk Pasta"}');
