-- ============================================================================
-- RECIPEVAULT: Relational Database Seed Script (PostgreSQL)
-- Canonical seed data matching demo personas, recipes, ingredients, and versions
-- ============================================================================

-- 1. Insert Cuisines
INSERT INTO cuisines (cuisine_id, cuisine_name, description) VALUES
('Italian', 'Italian', 'Rich culinary tradition focused on fresh herbs, bronze-cut pasta, and olive oil.'),
('Mediterranean', 'Mediterranean', 'Sun-drenched cuisine rich in legumes, healthy fats, citrus, and fresh produce.'),
('American', 'American', 'Comforting diner classics, weekend brunch stacks, and hearth-baked staples.'),
('Indian', 'Indian', 'Layered spices, slow simmering, aromatics, and rich legume traditions.'),
('Japanese', 'Japanese', 'Seasonal delicacy, precise knife-work, umami dashi, and fermented subtleties.');

-- 2. Insert Categories
INSERT INTO categories (category_id, category_name, description) VALUES
('Breakfast', 'Breakfast', 'Energizing morning meals, fluffy pancakes, and slow-morning oats.'),
('Lunch', 'Lunch', 'Vibrant harvest bowls, grain salads, and midday nourishment.'),
('Dinner', 'Dinner', 'Hearty roasts, simmered soups, and handmade pasta courses.'),
('Desserts', 'Desserts', 'Sweet finishes, baked fruits, and delicate pastries.');

-- 3. Insert Users
INSERT INTO users (user_id, username, email, password_hash, full_name, avatar, role, bio, cooking_skill, target_cook_time) VALUES
('user-eric', 'erictitus', 'eric@recipevault.internal', '$2a$12$e8x/k...', 'Eric Titus', 'E', 'Home Cook & Curator', 'Passionate home cook fond of slow-simmered sauces and heritage cookbooks.', 'Home Cook', 35),
('user-neeraj', 'neerajk', 'neeraj@recipevault.internal', '$2a$12$e8x/k...', 'Neeraj K', 'N', 'Fitness & Meal Prep Enthusiast', 'Macro tracker and weekend meal planner focusing on clean fuel and high protein.', 'Seasoned Chef', 45),
('user-maya', 'mayalin', 'maya@recipevault.internal', '$2a$12$e8x/k...', 'Maya Lin', 'M', 'Plant-Based Explorer', 'Busy student experimenting with seasonal veggies and bright citrus dressings.', 'Beginner', 25);

-- 4. Insert Master Ingredients
INSERT INTO ingredients (ingredient_id, canonical_name, category, flavor_profile, substitute_summary, storage_guidelines, common_uses, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g) VALUES
('ing-pasta', 'Artisan Pasta', 'Grains & Pasta', 'Clean, wheaty, comforting starch', 'Gluten-free brown rice pasta or soba noodles', 'Cool, dry pantry in sealed airtight container', 'Pasta courses, minestrone additions', 371, 13.0, 74.0, 1.5, 3.2),
('ing-ricotta', 'Ricotta', 'Dairy & Eggs', 'Mild, silky, subtly sweet and lactic', 'Whipped whole milk cottage cheese', 'Refrigerate at 2-4°C; consume within 3-5 days', 'Filled pastas, cheesecakes, pancakes', 174, 11.3, 3.0, 13.0, 0),
('ing-lemon', 'Lemon', 'Produce', 'Sharp citric acidity; fragrant zest oils', 'Lime juice, white wine vinegar, or ground sumac', 'Store at room temp up to 1 week; crisper drawer for 3 weeks', 'Dressings, marinades, baking balance', 29, 1.1, 9.3, 0.3, 2.8),
('ing-olive-oil', 'Extra Virgin Olive Oil', 'Pantry & Spices', 'Fruity, grassy, peppery finish', 'Cold-pressed avocado oil or mild walnut oil', 'Dark glass bottle in a cool cupboard away from stove heat', 'Finishing warm pastas, dressings, sautéing', 884, 0, 0, 100, 0),
('ing-basil', 'Fresh Basil', 'Produce', 'Peppery, sweet, with warm clove and anise', 'Fresh flat-leaf parsley blended with mint', 'Stems standing in water at room temperature', 'Pesto, Caprese, finishing pastas', 23, 3.2, 2.7, 0.6, 1.6),
('ing-chickpeas', 'Chickpeas', 'Legumes', 'Nutty, buttery, earthy with firm bite', 'Cannellini beans or cooked green lentils', 'Airtight dry storage; refrigerated in broth for 4 days', 'Hummus, crisp oven snacks, harvest bowls', 164, 8.9, 27.4, 2.6, 7.6),
('ing-tomatoes', 'Tomatoes', 'Produce', 'Juicy, bright acidity balanced by umami', 'Canned San Marzano tomatoes or roasted peppers', 'Always at room temp stem-down; never refrigerate', 'Soups, sauces, salads', 18, 0.9, 3.9, 0.2, 1.2),
('ing-garlic', 'Garlic', 'Produce', 'Pungent raw; sweet and mellow roasted', 'Shallots, garlic scapes, or pinch of hing', 'Open basket in cool dark pantry', 'Foundational aromatic base', 149, 6.4, 33.1, 0.5, 2.1),
('ing-chicken', 'Chicken Breast', 'Proteins', 'Mild, lean, receptive to marinades', 'Firm tofu steaks, tempeh, or turkey tenderloin', 'Coldest back shelf of fridge for 2 days or freeze', 'Roasts, skillet sautés, grain bowls', 165, 31.0, 0, 3.6, 0),
('ing-potatoes', 'Yukon Gold Potatoes', 'Produce', 'Naturally buttery, crispy roasted', 'Red creamer potatoes or fingerlings', 'Cool, dark pantry away from onions', 'Crispy wedges, silky mash', 77, 2.0, 17.5, 0.1, 2.2);

-- 5. Insert Recipes
INSERT INTO recipes (recipe_id, title, description, servings, prep_time, cook_time, difficulty, diet_tag, rating, rating_count, calories, protein, carbs, fat, fiber, source_attribution, visibility, status, user_id, cuisine_id, category_id) VALUES
('lemon-ricotta-pasta', 'Lemon & Ricotta Pasta', 'A little sunshine in a bowl. Creamy fresh ricotta, bright lemon zest, and fragrant hand-torn basil.', 2, 10, 15, 'Easy', 'Vegetarian', 4.9, 28, 485, 21, 62, 17, 4, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-eric', 'Italian', 'Dinner'),
('chickpea-harvest-bowl', 'Roasted Chickpea Harvest Bowl', 'Crispy cumin-roasted chickpeas, buttery ripe avocado, sweet tomatoes, and crisp greens with lemon-tahini.', 2, 10, 20, 'Easy', 'Vegan', 4.8, 19, 390, 16, 45, 18, 11, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-maya', 'Mediterranean', 'Lunch'),
('roasted-tomato-soup', 'Slow-Roasted Tomato & Garlic Soup', 'Comforting, velvety soup made from plum tomatoes roasted with whole garlic bulbs and basil.', 4, 15, 30, 'Easy', 'Vegetarian', 4.9, 34, 245, 6, 28, 12, 5, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-eric', 'Italian', 'Dinner'),
('blueberry-pancakes', 'Sunday Blueberry Ricotta Pancakes', 'Fluffy golden stacks folded with fresh blueberries, ricotta for tenderness, and warm maple syrup.', 4, 10, 12, 'Easy', 'Vegetarian', 4.7, 16, 320, 9, 51, 10, 3, 'Sunday Family Recipe Book', 'Public', 'Published', 'user-eric', 'American', 'Breakfast'),
('rosemary-roast-chicken', 'Lemon & Rosemary Roast Chicken', 'Crispy skin, tender juicy chicken, and Yukon gold potatoes roasted in lemon juices and fresh rosemary.', 4, 15, 50, 'Medium', 'High protein', 4.8, 22, 520, 42, 31, 25, 4, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-neeraj', 'Mediterranean', 'Dinner');

-- 6. Insert Recipe Ingredients Junction Rows
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, preparation_state) VALUES
('lemon-ricotta-pasta', 'ing-pasta', 200, 'g', 'penne or rigatoni'),
('lemon-ricotta-pasta', 'ing-ricotta', 150, 'g', 'fresh whole milk'),
('lemon-ricotta-pasta', 'ing-lemon', 1, 'whole', 'zested and juiced'),
('lemon-ricotta-pasta', 'ing-olive-oil', 1.5, 'tbsp', 'cold-pressed'),
('lemon-ricotta-pasta', 'ing-basil', 0.25, 'cup', 'hand-torn'),
('chickpea-harvest-bowl', 'ing-chickpeas', 400, 'g', 'rinsed and dried'),
('chickpea-harvest-bowl', 'ing-tomatoes', 150, 'g', 'quartered cherry'),
('chickpea-harvest-bowl', 'ing-olive-oil', 2, 'tbsp', 'for roasting'),
('chickpea-harvest-bowl', 'ing-lemon', 1, 'whole', 'freshly squeezed'),
('roasted-tomato-soup', 'ing-tomatoes', 800, 'g', 'halved plum'),
('roasted-tomato-soup', 'ing-garlic', 5, 'clove', 'unpeeled in skins'),
('roasted-tomato-soup', 'ing-olive-oil', 2, 'tbsp', 'for roasting'),
('roasted-tomato-soup', 'ing-basil', 0.5, 'cup', 'packed leaves'),
('rosemary-roast-chicken', 'ing-chicken', 700, 'g', 'skin-on breasts or thighs'),
('rosemary-roast-chicken', 'ing-potatoes', 500, 'g', 'cut into 1-inch wedges'),
('rosemary-roast-chicken', 'ing-lemon', 2, 'whole', 'sliced into rounds'),
('rosemary-roast-chicken', 'ing-olive-oil', 2.5, 'tbsp', 'generous drizzle');

-- 7. Insert Recipe Version Snapshots
INSERT INTO recipe_versions (version_id, recipe_id, version_number, change_summary, author_id, author_name, snapshot_data) VALUES
('ver-lemon-pasta-1', 'lemon-ricotta-pasta', 1, 'Initial recipe creation with standard ricotta and cream sauce.', 'user-eric', 'Eric Titus', '{"servings": 2, "time": 30}'::jsonb),
('ver-lemon-pasta-2', 'lemon-ricotta-pasta', 2, 'Eliminated heavy cream, increased starchy pasta water emulsification.', 'user-eric', 'Eric Titus', '{"servings": 2, "time": 25}'::jsonb);

-- 8. Insert Reviews
INSERT INTO ratings_and_reviews (review_id, recipe_id, user_id, rating, review_text, verified_cook) VALUES
('rev-1', 'lemon-ricotta-pasta', 'user-neeraj', 5, 'The starchy pasta water trick completely transformed this! Silky smooth without heavy cream.', true),
('rev-2', 'chickpea-harvest-bowl', 'user-eric', 5, 'The tahini dressing is gold. Roasting the chickpeas thoroughly makes all the difference in crunch.', true),
('rev-3', 'roasted-tomato-soup', 'user-neeraj', 5, 'Roasted the garlic in whole cloves as instructed — unbelievably deep flavor.', true);
