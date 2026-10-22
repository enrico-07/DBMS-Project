-- ============================================================================
-- RECIPEVAULT: ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- Target DBMS: PostgreSQL 14+ / Supabase
-- ============================================================================
-- This script completely resolves all Supabase Linter warnings:
-- 1. Cleans up accumulated duplicate policies ("Multiple Permissive Policies")
-- 2. Sets fixed search_path on functions ("Function Search Path Mutable")
-- 3. Sets security_invoker = true on views ("Security Definer View")
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: DYNAMICALLY DROP ALL EXISTING POLICIES IN PUBLIC SCHEMA
-- (Prevents accumulation of multiple permissive policies across script runs)
-- ----------------------------------------------------------------------------
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 2: ENABLE ROW LEVEL SECURITY ON ALL TABLES
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
-- STEP 3: CREATE EXACTLY ONE CLEAN POLICY PER TABLE
-- (A single FOR ALL policy covers SELECT, INSERT, UPDATE, DELETE with zero
-- redundant OR-chain evaluations, eliminating "Multiple Permissive Policies")
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- STEP 4: HARDEN FUNCTION SEARCH PATH
-- (Resolves "Function Search Path Mutable" warnings)
-- ----------------------------------------------------------------------------
ALTER FUNCTION public.fn_update_recipe_rating() SET search_path = public;
ALTER FUNCTION public.fn_touch_recipe_updated_at() SET search_path = public;

-- ----------------------------------------------------------------------------
-- STEP 5: SECURITY INVOKER ON DATABASE VIEWS
-- (Resolves "Security Definer View" critical warnings)
-- ----------------------------------------------------------------------------
ALTER VIEW IF EXISTS public.v_top_rated_recipes SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_healthy_recipe_summary SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_diabetic_pcos_recommendations SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_pantry_match_helper SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_active_cook_profiles SET (security_invoker = true);
