-- ====================================================================
-- RECIPEVAULT TAXONOMY & RELATIONAL INTEGRITY EXPANSION
-- Migration Date: 2026-10-25
-- Description: Adds missing Category and Cuisine taxonomy records
--              ('Baking', 'Snacks', 'Mexican', 'Other') and ensures
--              foreign key integrity for recipe creation and parser imports.
-- ====================================================================

-- 1. Insert missing Categories
INSERT INTO public.categories (category_id, category_name, description)
VALUES
  ('Baking', 'Baking', 'Breads, cakes, pastries, and hearth-baked treats.'),
  ('Snacks', 'Snacks', 'Quick bites, energy bars, dips, and afternoon fuel.')
ON CONFLICT (category_id) DO UPDATE 
SET category_name = EXCLUDED.category_name,
    description = EXCLUDED.description;

-- 2. Insert missing Cuisines
INSERT INTO public.cuisines (cuisine_id, cuisine_name, description)
VALUES
  ('Mexican', 'Mexican', 'Vibrant chiles, warm spices, salsas, and fresh corn tortillas.'),
  ('Other', 'Other', 'Global fusion, experimental, and eclectic kitchen creations.')
ON CONFLICT (cuisine_id) DO UPDATE 
SET cuisine_name = EXCLUDED.cuisine_name,
    description = EXCLUDED.description;

-- 3. Ensure core default demo users exist in public.users to prevent user_id FK violations
INSERT INTO public.users (user_id, username, email, password_hash, full_name, avatar, role, bio, cooking_skill, target_cook_time)
VALUES
  ('user-eric', 'eric_titus', 'eric@recipevault.internal', '$2a$12$demo_hash', 'Eric Titus', 'E', 'Home Cook & Artisan Curator', 'Passionate home cook fond of slow-simmered sauces, roasted herbs, and heritage cookbooks.', 'Home Cook', 35),
  ('user-neeraj', 'neeraj_k', 'neeraj@recipevault.internal', '$2a$12$demo_hash', 'Neeraj K', 'N', 'Fitness & High-Protein Meal Prep', 'Macro tracker and weekend meal planner focusing on energizing proteins and clean fuel.', 'Seasoned Chef', 45),
  ('user-maya', 'maya_lin', 'maya@recipevault.internal', '$2a$12$demo_hash', 'Maya Lin', 'M', 'Plant-Based & Quick Meals', 'Busy student experimenting with seasonal veggies, bright lemon dressings, and 20-minute bowls.', 'Home Cook', 25)
ON CONFLICT (user_id) DO NOTHING;
