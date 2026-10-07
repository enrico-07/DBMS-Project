-- ============================================================================
-- RECIPEVAULT: A Database-Driven Recipe Management & Culinary Intelligence System
-- Relational Database Schema DDL (PostgreSQL 14+)
-- Normalized to 3NF with Referential Integrity, Triggers, Views, and Indexes
-- Made by: Neeraj K (24BCE2393), Eric Titus (24BCE0096)
-- ============================================================================

-- Drop existing tables and views if recreating
DROP VIEW IF EXISTS v_top_rated_recipes CASCADE;
DROP VIEW IF EXISTS v_healthy_recipe_summary CASCADE;
DROP VIEW IF EXISTS v_pantry_match_helper CASCADE;

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
-- 1. USERS & PROFILES
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
CREATE TABLE user_health_profiles (
    health_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    condition_name VARCHAR(100) NOT NULL,
    UNIQUE (user_id, condition_name)
);

-- User Home Pantry Inventory
CREATE TABLE user_pantry_items (
    pantry_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
-- 3. CANONICAL RECIPES
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
    visibility VARCHAR(20) DEFAULT 'Public' CHECK (visibility IN ('Public', 'Private', 'Unlisted')),
    status VARCHAR(20) DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    cuisine_id VARCHAR(50) NOT NULL REFERENCES cuisines(cuisine_id) ON DELETE RESTRICT,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. RECIPE VERSION CONTROL (Immutable Audit History)
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
-- 5. MASTER INGREDIENT INTELLIGENCE
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
    fiber_per_100g NUMERIC(4, 1) DEFAULT 0
);

-- Regional & Botanical Aliases (1:N)
CREATE TABLE ingredient_aliases (
    alias_id SERIAL PRIMARY KEY,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    alias_name VARCHAR(100) NOT NULL,
    UNIQUE (ingredient_id, alias_name)
);

-- Ingredient Substitution Relationships (Self-Referencing M:N)
CREATE TABLE ingredient_substitutes (
    substitute_id SERIAL PRIMARY KEY,
    ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    substitute_ingredient_id VARCHAR(50) NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    ratio VARCHAR(50) DEFAULT '1:1 ratio',
    culinary_notes TEXT,
    UNIQUE (ingredient_id, substitute_ingredient_id)
);

-- Recipe to Ingredient Junction (M:N)
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
-- 6. COLLECTIONS & SAVED RECIPES
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
-- 7. MEAL PLANNING
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
    date_scheduled DATE NOT NULL,
    meal_slot VARCHAR(20) NOT NULL CHECK (meal_slot IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    custom_servings INT
);

-- ----------------------------------------------------------------------------
-- 8. RATINGS & REVIEWS
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
-- 9. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine_id);
CREATE INDEX idx_recipes_category ON recipes(category_id);
CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_ratings_recipe ON ratings_and_reviews(recipe_id);
CREATE INDEX idx_pantry_user ON user_pantry_items(user_id);

-- ----------------------------------------------------------------------------
-- 10. DATABASE VIEWS
-- ----------------------------------------------------------------------------

-- View: Top Rated Recipes with review counts
CREATE VIEW v_top_rated_recipes AS
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
CREATE VIEW v_healthy_recipe_summary AS
SELECT
    r.recipe_id,
    r.title,
    r.diet_tag,
    r.calories,
    r.protein,
    r.carbs,
    r.fat,
    ROUND((r.protein * 4.0 / NULLIF(r.calories, 0)) * 100, 1) AS protein_calorie_pct
FROM recipes r
WHERE r.calories > 0;

-- ----------------------------------------------------------------------------
-- 11. TRIGGERS: AUTOMATED CONSISTENCY
-- ----------------------------------------------------------------------------

-- Trigger Function: Recompute Recipe Rating Aggregates
CREATE OR REPLACE FUNCTION fn_update_recipe_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recipe_review_aggregate
AFTER INSERT OR UPDATE OR DELETE ON ratings_and_reviews
FOR EACH ROW
EXECUTE FUNCTION fn_update_recipe_rating();
