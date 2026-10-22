-- ============================================================================
-- RECIPEVAULT: Relational Database Schema DDL (PostgreSQL 14+ / Supabase)
-- Normalized to Third Normal Form (3NF) with Referential Integrity,
-- Indexes, Triggers, Analytical Views, and Row Level Security (RLS).
-- Supports Clinical Health Engine (Diabetes, PCOS, Hypertension, Celiac, GERD),
-- Recipe Version Ledger, Pantry Matching, Meal Planning & Social Reviews.
-- Authors: Neeraj K (24BCE2393), Eric Titus (24BCE0096)
-- ============================================================================

-- Safe teardown of existing views and tables in dependency order
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
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS recipe_versions CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS cuisines CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS & PROFILES (1NF & 2NF Decomposition)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10) DEFAULT 'U',
    role VARCHAR(50) DEFAULT 'Home Cook',
    bio TEXT,
    cooking_skill VARCHAR(30) DEFAULT 'Home Cook' CHECK (cooking_skill IN ('Beginner', 'Home Cook', 'Seasoned Chef')),
    target_cook_time INT DEFAULT 30 CHECK (target_cook_time > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multivalued User Dietary Profiles (1:N)
CREATE TABLE user_dietary_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    preference_name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, preference_name)
);

-- Multivalued User Disliked Ingredients / Allergen Exclusions (1:N)
CREATE TABLE user_disliked_ingredients (
    exclusion_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    UNIQUE (user_id, ingredient_name)
);

-- Multivalued User Health Considerations (1:N)
-- Directly maps to Clinical Health Engine: 'diabetes', 'pcos', 'hypertension', 'gerd', 'celiac'
CREATE TABLE user_health_profiles (
    health_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    condition_name VARCHAR(100) NOT NULL,
    UNIQUE (user_id, condition_name)
);

-- User Home Pantry Inventory (supports shelf-life & expiration tracking)
CREATE TABLE user_pantry_items (
    pantry_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity NUMERIC(6, 2) DEFAULT 1.0 CHECK (quantity >= 0),
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
-- 3. CANONICAL RECIPES (Normalized Core Entity)
-- ----------------------------------------------------------------------------
CREATE TABLE recipes (
    recipe_id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    servings INT NOT NULL CHECK (servings > 0),
    prep_time INT NOT NULL DEFAULT 10 CHECK (prep_time >= 0),
    cook_time INT NOT NULL DEFAULT 15 CHECK (cook_time >= 0),
    total_time INT GENERATED ALWAYS AS (prep_time + cook_time) STORED,
    difficulty VARCHAR(20) DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Advanced')),
    diet_tag VARCHAR(50) DEFAULT 'Balanced',
    rating NUMERIC(2, 1) DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    rating_count INT DEFAULT 0 CHECK (rating_count >= 0),
    calories INT DEFAULT 0 CHECK (calories >= 0),
    protein INT DEFAULT 0 CHECK (protein >= 0),
    carbs INT DEFAULT 0 CHECK (carbs >= 0),
    fat INT DEFAULT 0 CHECK (fat >= 0),
    fiber INT DEFAULT 0 CHECK (fiber >= 0),
    source_attribution VARCHAR(150),
    source_url TEXT,
    visibility VARCHAR(20) DEFAULT 'Public' CHECK (visibility IN ('Public', 'Private', 'Unlisted')),
    status VARCHAR(20) DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    cuisine_id VARCHAR(50) NOT NULL REFERENCES cuisines(cuisine_id) ON DELETE RESTRICT,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. RECIPE STEPS & TAGS (Normalized 1:N Subordinate Entities)
-- ----------------------------------------------------------------------------
CREATE TABLE recipe_steps (
    step_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    step_number INT NOT NULL CHECK (step_number > 0),
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
-- 5. CLINICAL HEALTH & METABOLIC SUITABILITY (Phase 1 Engine Link)
-- ----------------------------------------------------------------------------
CREATE TABLE recipe_health_suitability (
    suitability_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    condition_id VARCHAR(50) NOT NULL CHECK (condition_id IN ('diabetes', 'pcos', 'hypertension', 'gerd', 'celiac')),
    is_suitable BOOLEAN NOT NULL DEFAULT TRUE,
    clinical_rationale TEXT,
    dietary_badge VARCHAR(50),
    UNIQUE (recipe_id, condition_id)
);

-- ----------------------------------------------------------------------------
-- 6. RECIPE VERSION CONTROL (Immutable Revision Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE recipe_versions (
    version_id VARCHAR(100) PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    change_summary TEXT NOT NULL,
    author_id VARCHAR(50) NOT NULL REFERENCES users(user_id),
    author_name VARCHAR(100) NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (recipe_id, version_number)
);

-- ----------------------------------------------------------------------------
-- 7. MASTER INGREDIENT INTELLIGENCE
-- ----------------------------------------------------------------------------
CREATE TABLE ingredients (
    ingredient_id VARCHAR(50) PRIMARY KEY,
    canonical_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Produce', 'Dairy & Eggs', 'Grains & Pasta', 'Legumes',
        'Pantry & Spices', 'Proteins', 'Baking', 'Condiments'
    )),
    flavor_profile TEXT,
    substitute_summary TEXT,
    storage_guidelines TEXT,
    common_uses TEXT,
    calories_per_100g INT DEFAULT 0,
    protein_per_100g NUMERIC(4, 1) DEFAULT 0,
    carbs_per_100g NUMERIC(4, 1) DEFAULT 0,
    fat_per_100g NUMERIC(4, 1) DEFAULT 0,
    fiber_per_100g NUMERIC(4, 1) DEFAULT 0,
    glycemic_index VARCHAR(20) DEFAULT 'Low' CHECK (glycemic_index IN ('Low', 'Medium', 'High')),
    is_diabetic_friendly BOOLEAN DEFAULT TRUE,
    is_pcos_friendly BOOLEAN DEFAULT TRUE
);

-- Regional & Botanical Aliases (1:N)
CREATE TABLE ingredient_aliases (
    alias_id SERIAL PRIMARY KEY,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    alias_name VARCHAR(100) NOT NULL,
    UNIQUE (ingredient_id, alias_name)
);

-- Ingredient Substitution Intelligence (Self-Referencing M:N with Health Benefits)
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

-- Recipe to Ingredient Junction (M:N with Quantity & Preparation State)
CREATE TABLE recipe_ingredients (
    junction_id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    quantity NUMERIC(6, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(30) NOT NULL,
    preparation_state VARCHAR(100),
    is_optional BOOLEAN DEFAULT FALSE,
    UNIQUE (recipe_id, ingredient_id)
);

-- ----------------------------------------------------------------------------
-- 8. COLLECTIONS & BOOKMARKS
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

-- ----------------------------------------------------------------------------
-- 9. RELATIONAL MEAL PLANNING
-- ----------------------------------------------------------------------------
CREATE TABLE meal_plans (
    plan_id VARCHAR(100) PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE meal_plan_items (
    item_id VARCHAR(100) PRIMARY KEY,
    plan_id VARCHAR(100) NOT NULL REFERENCES meal_plans(plan_id) ON DELETE CASCADE,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    day_offset INT NOT NULL DEFAULT 0 CHECK (day_offset >= 0 AND day_offset < 14),
    date_scheduled DATE NOT NULL,
    meal_slot VARCHAR(20) NOT NULL CHECK (meal_slot IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    custom_servings INT
);

-- ----------------------------------------------------------------------------
-- 10. RATINGS, REVIEWS & COOKING VERIFICATION
-- ----------------------------------------------------------------------------
CREATE TABLE ratings_and_reviews (
    review_id VARCHAR(100) PRIMARY KEY,
    recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    verified_cook BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (recipe_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 11. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine_id);
CREATE INDEX idx_recipes_category ON recipes(category_id);
CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id, step_number);
CREATE INDEX idx_recipe_health_cond ON recipe_health_suitability(condition_id, is_suitable);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_ratings_recipe ON ratings_and_reviews(recipe_id);
CREATE INDEX idx_pantry_user ON user_pantry_items(user_id);
CREATE INDEX idx_meal_plan_user ON meal_plans(user_id);

-- ----------------------------------------------------------------------------
-- 12. DATABASE VIEWS (Defined with SECURITY INVOKER for RLS compliance)
-- ----------------------------------------------------------------------------

-- View: Top Rated Recipes with review counts
CREATE VIEW v_top_rated_recipes WITH (security_invoker = true) AS
SELECT
    r.recipe_id,
    r.title,
    r.cuisine_id,
    r.category_id,
    r.rating,
    r.rating_count,
    u.full_name AS chef_name
FROM recipes r
JOIN users u ON r.user_id = u.user_id
WHERE r.status = 'Published' AND r.rating >= 4.5
ORDER BY r.rating DESC, r.rating_count DESC;

-- View: Healthy Recipe Summary with Macro Breakdown
CREATE VIEW v_healthy_recipe_summary WITH (security_invoker = true) AS
SELECT
    r.recipe_id,
    r.title,
    r.diet_tag,
    r.calories,
    r.protein,
    r.carbs,
    r.fat,
    r.fiber,
    ROUND((r.protein * 4.0 / NULLIF(r.calories, 0)) * 100, 1) AS protein_calorie_pct
FROM recipes r
WHERE r.calories > 0;

-- View: Diabetic & PCOS Clinical Recommendations
CREATE VIEW v_diabetic_pcos_recommendations WITH (security_invoker = true) AS
SELECT
    r.recipe_id,
    r.title,
    r.calories,
    r.carbs,
    r.fiber,
    (r.carbs - COALESCE(r.fiber, 0)) AS net_carbs,
    r.protein,
    rhs.condition_id,
    rhs.dietary_badge,
    rhs.clinical_rationale
FROM recipes r
JOIN recipe_health_suitability rhs ON r.recipe_id = rhs.recipe_id
WHERE rhs.is_suitable = TRUE AND rhs.condition_id IN ('diabetes', 'pcos')
ORDER BY net_carbs ASC;

-- View: User Pantry Match Helper (Aggregates available pantry ingredients against recipes)
CREATE VIEW v_pantry_match_helper WITH (security_invoker = true) AS
SELECT
    p.user_id,
    ri.recipe_id,
    COUNT(DISTINCT ri.ingredient_id) AS matched_ingredients,
    (SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = ri.recipe_id) AS total_ingredients,
    ROUND(
        (COUNT(DISTINCT ri.ingredient_id)::NUMERIC /
        NULLIF((SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = ri.recipe_id), 0)) * 100,
        1
    ) AS match_percentage
FROM user_pantry_items p
JOIN ingredients i ON LOWER(p.ingredient_name) = LOWER(i.canonical_name)
JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id
GROUP BY p.user_id, ri.recipe_id;

-- View: Active Cook Profiles (Aggregates dietary preferences and health conditions per user)
CREATE VIEW v_active_cook_profiles WITH (security_invoker = true) AS
SELECT
    u.user_id,
    u.full_name,
    u.role,
    u.cooking_skill,
    u.target_cook_time,
    COALESCE(ARRAY_AGG(DISTINCT udp.preference_name) FILTER (WHERE udp.preference_name IS NOT NULL), '{}') AS dietary_preferences,
    COALESCE(ARRAY_AGG(DISTINCT uhp.condition_name) FILTER (WHERE uhp.condition_name IS NOT NULL), '{}') AS health_conditions,
    (SELECT COUNT(*) FROM user_pantry_items WHERE user_id = u.user_id) AS pantry_items_stocked
FROM users u
LEFT JOIN user_dietary_profiles udp ON u.user_id = udp.user_id
LEFT JOIN user_health_profiles uhp ON u.user_id = uhp.user_id
GROUP BY u.user_id, u.full_name, u.role, u.cooking_skill, u.target_cook_time;

-- ----------------------------------------------------------------------------
-- 13. TRIGGERS: AUTOMATED CONSISTENCY & RATINGS RECALCULATION
-- ----------------------------------------------------------------------------

-- Trigger Function: Recompute Recipe Rating Aggregates
CREATE OR REPLACE FUNCTION fn_update_recipe_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    UPDATE recipes
    SET
        rating = COALESCE((
            SELECT ROUND(AVG(rating), 1)
            FROM ratings_and_reviews
            WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
        ), 5.0),
        rating_count = (
            SELECT COUNT(*)
            FROM ratings_and_reviews
            WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
        )
    WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recipe_review_aggregate
AFTER INSERT OR UPDATE OR DELETE ON ratings_and_reviews
FOR EACH ROW
EXECUTE FUNCTION fn_update_recipe_rating();

-- Trigger Function: Auto-touch updated_at on recipe modifications
CREATE OR REPLACE FUNCTION fn_touch_recipe_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_recipe_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION fn_touch_recipe_updated_at();

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) & CLIENT ACCESS CONTROL
-- (Streamlined to single permissive policy per table to avoid duplicate checks)
-- ----------------------------------------------------------------------------
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_health_suitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings_and_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dietary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_disliked_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_substitutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Clean Single-Policy per table (Handles SELECT, INSERT, UPDATE, DELETE without overlapping OR-chains)
CREATE POLICY "Public Access on Recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Recipe Steps" ON recipe_steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Recipe Tags" ON recipe_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Health Suitability" ON recipe_health_suitability FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Recipe Versions" ON recipe_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Pantry" ON user_pantry_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on User Dietary Profiles" ON user_dietary_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on User Health Profiles" ON user_health_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on User Disliked Ingredients" ON user_disliked_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Reviews" ON ratings_and_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Collections" ON collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Collection Recipes" ON collection_recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Meal Plans" ON meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Meal Plan Items" ON meal_plan_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Recipe Ingredients" ON recipe_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Ingredient Aliases" ON ingredient_aliases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Ingredient Substitutes" ON ingredient_substitutes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Cuisines" ON cuisines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access on Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
