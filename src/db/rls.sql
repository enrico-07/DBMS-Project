-- ============================================================================
-- RECIPEVAULT: ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- Target DBMS: PostgreSQL 14+ / Supabase
-- ============================================================================
-- This script configures access control policies so the web frontend can
-- safely read and write data through Supabase APIs.
--
-- Safe for idempotent re-execution. Existing policies with the same names are
-- dropped before recreating.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipe_health_suitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ratings_and_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_dietary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_disliked_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ingredient_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ingredient_substitutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. RECIPES, STEPS, TAGS & REVISION LEDGER
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Access on Recipes" ON recipes;
DROP POLICY IF EXISTS "Public Modify Access on Recipes" ON recipes;
CREATE POLICY "Public Read Access on Recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Recipe Steps" ON recipe_steps;
DROP POLICY IF EXISTS "Public Modify Access on Recipe Steps" ON recipe_steps;
CREATE POLICY "Public Read Access on Recipe Steps" ON recipe_steps FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Recipe Steps" ON recipe_steps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Recipe Tags" ON recipe_tags;
DROP POLICY IF EXISTS "Public Modify Access on Recipe Tags" ON recipe_tags;
CREATE POLICY "Public Read Access on Recipe Tags" ON recipe_tags FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Recipe Tags" ON recipe_tags FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Health Suitability" ON recipe_health_suitability;
DROP POLICY IF EXISTS "Public Modify Access on Health Suitability" ON recipe_health_suitability;
CREATE POLICY "Public Read Access on Health Suitability" ON recipe_health_suitability FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Health Suitability" ON recipe_health_suitability FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Recipe Versions" ON recipe_versions;
DROP POLICY IF EXISTS "Public Modify Access on Recipe Versions" ON recipe_versions;
CREATE POLICY "Public Read Access on Recipe Versions" ON recipe_versions FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Recipe Versions" ON recipe_versions FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 3. USER PANTRY POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Access on Pantry" ON user_pantry_items;
DROP POLICY IF EXISTS "Public Modify Access on Pantry" ON user_pantry_items;
CREATE POLICY "Public Read Access on Pantry" ON user_pantry_items FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Pantry" ON user_pantry_items FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. USERS & MULTIVALUED HEALTH/DIETARY PROFILES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Access on Users" ON users;
DROP POLICY IF EXISTS "Public Modify Access on Users" ON users;
CREATE POLICY "Public Read Access on Users" ON users FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on User Dietary Profiles" ON user_dietary_profiles;
DROP POLICY IF EXISTS "Public Modify Access on User Dietary Profiles" ON user_dietary_profiles;
CREATE POLICY "Public Read Access on User Dietary Profiles" ON user_dietary_profiles FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on User Dietary Profiles" ON user_dietary_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on User Health Profiles" ON user_health_profiles;
DROP POLICY IF EXISTS "Public Modify Access on User Health Profiles" ON user_health_profiles;
CREATE POLICY "Public Read Access on User Health Profiles" ON user_health_profiles FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on User Health Profiles" ON user_health_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on User Disliked Ingredients" ON user_disliked_ingredients;
DROP POLICY IF EXISTS "Public Modify Access on User Disliked Ingredients" ON user_disliked_ingredients;
CREATE POLICY "Public Read Access on User Disliked Ingredients" ON user_disliked_ingredients FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on User Disliked Ingredients" ON user_disliked_ingredients FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. RATINGS & REVIEWS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Access on Reviews" ON ratings_and_reviews;
DROP POLICY IF EXISTS "Public Modify Access on Reviews" ON ratings_and_reviews;
CREATE POLICY "Public Read Access on Reviews" ON ratings_and_reviews FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Reviews" ON ratings_and_reviews FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. COLLECTIONS & BOOKMARKS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Access on Collections" ON collections;
DROP POLICY IF EXISTS "Public Modify Access on Collections" ON collections;
CREATE POLICY "Public Read Access on Collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Collections" ON collections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Collection Recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Public Modify Access on Collection Recipes" ON collection_recipes;
CREATE POLICY "Public Read Access on Collection Recipes" ON collection_recipes FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Collection Recipes" ON collection_recipes FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. MEAL PLANNING POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Access on Meal Plans" ON meal_plans;
DROP POLICY IF EXISTS "Public Modify Access on Meal Plans" ON meal_plans;
CREATE POLICY "Public Read Access on Meal Plans" ON meal_plans FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Meal Plans" ON meal_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Meal Plan Items" ON meal_plan_items;
DROP POLICY IF EXISTS "Public Modify Access on Meal Plan Items" ON meal_plan_items;
CREATE POLICY "Public Read Access on Meal Plan Items" ON meal_plan_items FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Meal Plan Items" ON meal_plan_items FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 8. REFERENCE TAXONOMIES (Cuisines, Categories, Ingredients)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Access on Ingredients" ON ingredients;
DROP POLICY IF EXISTS "Public Modify Access on Ingredients" ON ingredients;
CREATE POLICY "Public Read Access on Ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Recipe Ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Public Modify Access on Recipe Ingredients" ON recipe_ingredients;
CREATE POLICY "Public Read Access on Recipe Ingredients" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Recipe Ingredients" ON recipe_ingredients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Ingredient Aliases" ON ingredient_aliases;
DROP POLICY IF EXISTS "Public Modify Access on Ingredient Aliases" ON ingredient_aliases;
CREATE POLICY "Public Read Access on Ingredient Aliases" ON ingredient_aliases FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Ingredient Aliases" ON ingredient_aliases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Ingredient Substitutes" ON ingredient_substitutes;
DROP POLICY IF EXISTS "Public Modify Access on Ingredient Substitutes" ON ingredient_substitutes;
CREATE POLICY "Public Read Access on Ingredient Substitutes" ON ingredient_substitutes FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Ingredient Substitutes" ON ingredient_substitutes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Cuisines" ON cuisines;
DROP POLICY IF EXISTS "Public Modify Access on Cuisines" ON cuisines;
CREATE POLICY "Public Read Access on Cuisines" ON cuisines FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Cuisines" ON cuisines FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access on Categories" ON categories;
DROP POLICY IF EXISTS "Public Modify Access on Categories" ON categories;
CREATE POLICY "Public Read Access on Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Modify Access on Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
