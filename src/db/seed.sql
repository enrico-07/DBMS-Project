-- ============================================================================
-- RECIPEVAULT: Relational Database Comprehensive Seed Script (PostgreSQL / Supabase)
-- Populates core taxonomy, user personas, clinical health profiles, master ingredients,
-- diabetic/PCOS substitutions, recipe steps, health suitability, and reviews.
-- Authors: Neeraj K (24BCE2393), Eric Titus (24BCE0096)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TAXONOMY: CUISINES & CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO cuisines (cuisine_id, cuisine_name, description) VALUES
('Italian', 'Italian', 'Rich culinary tradition focused on fresh herbs, bronze-cut pasta, and olive oil.'),
('Mediterranean', 'Mediterranean', 'Sun-drenched cuisine rich in legumes, healthy fats, citrus, and fresh produce.'),
('American', 'American', 'Comforting diner classics, weekend brunch stacks, and hearth-baked staples.'),
('Indian', 'Indian', 'Layered spices, slow simmering, aromatics, and rich legume traditions.'),
('Japanese', 'Japanese', 'Seasonal delicacy, precise knife-work, umami dashi, and fermented subtleties.');

INSERT INTO categories (category_id, category_name, description) VALUES
('Breakfast', 'Breakfast', 'Energizing morning meals, fluffy pancakes, and slow-morning oats.'),
('Lunch', 'Lunch', 'Vibrant harvest bowls, grain salads, and midday nourishment.'),
('Dinner', 'Dinner', 'Hearty roasts, simmered soups, and handmade pasta courses.'),
('Desserts', 'Desserts', 'Sweet finishes, baked fruits, and delicate pastries.');

-- ----------------------------------------------------------------------------
-- 2. USERS & PROFILES
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, username, email, password_hash, full_name, avatar, role, bio, cooking_skill, target_cook_time) VALUES
('user-eric', 'erictitus', 'eric@recipevault.internal', '$2a$12$e8x/k...', 'Eric Titus', 'E', 'Home Cook & Curator', 'Passionate home cook fond of slow-simmered sauces and heritage cookbooks.', 'Home Cook', 35),
('user-neeraj', 'neerajk', 'neeraj@recipevault.internal', '$2a$12$e8x/k...', 'Neeraj K', 'N', 'Fitness & Meal Prep Enthusiast', 'Macro tracker and weekend meal planner focusing on clean fuel and high protein.', 'Seasoned Chef', 45),
('user-maya', 'mayalin', 'maya@recipevault.internal', '$2a$12$e8x/k...', 'Maya Lin', 'M', 'Plant-Based Explorer', 'Busy student experimenting with seasonal veggies and bright citrus dressings.', 'Beginner', 25);

-- Multivalued Dietary Profiles (1:N)
INSERT INTO user_dietary_profiles (user_id, preference_name) VALUES
('user-eric', 'Vegetarian'),
('user-eric', 'Diabetic-Friendly'),
('user-neeraj', 'High protein'),
('user-neeraj', 'Heart-Healthy'),
('user-maya', 'Vegan'),
('user-maya', 'Gluten-free');

-- Multivalued Health Considerations (1:N)
-- Directly connects to the Clinical Health Engine
INSERT INTO user_health_profiles (user_id, condition_name) VALUES
('user-eric', 'diabetes'),
('user-eric', 'hypertension'),
('user-neeraj', 'hypertension'),
('user-maya', 'pcos'),
('user-maya', 'celiac');

-- User Pantry Inventory (with stock dates and staple designations)
INSERT INTO user_pantry_items (user_id, ingredient_name, quantity, unit, is_staple) VALUES
('user-eric', 'Artisan Pasta', 500, 'g', true),
('user-eric', 'Extra Virgin Olive Oil', 750, 'ml', true),
('user-eric', 'Garlic', 3, 'bulb', true),
('user-eric', 'Tomatoes', 6, 'whole', false),
('user-eric', 'Lemon', 4, 'whole', false),
('user-eric', 'Ricotta', 250, 'g', false),
('user-neeraj', 'Chicken Breast', 1000, 'g', true),
('user-neeraj', 'Extra Virgin Olive Oil', 500, 'ml', true),
('user-neeraj', 'Yukon Gold Potatoes', 800, 'g', true),
('user-maya', 'Chickpeas', 400, 'g', true),
('user-maya', 'Fresh Basil', 1, 'bunch', false),
('user-maya', 'Lemon', 3, 'whole', false);

-- ----------------------------------------------------------------------------
-- 3. MASTER INGREDIENT INTELLIGENCE (With Glycemic Index & Health Suitability)
-- ----------------------------------------------------------------------------
INSERT INTO ingredients (ingredient_id, canonical_name, category, flavor_profile, substitute_summary, storage_guidelines, common_uses, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, glycemic_index, is_diabetic_friendly, is_pcos_friendly) VALUES
('ing-pasta', 'Artisan Pasta', 'Grains & Pasta', 'Clean, wheaty, comforting starch', 'Gluten-free brown rice pasta or soba noodles', 'Cool, dry pantry in sealed airtight container', 'Pasta courses, minestrone additions', 371, 13.0, 74.0, 1.5, 3.2, 'Medium', false, false),
('ing-ricotta', 'Ricotta', 'Dairy & Eggs', 'Mild, silky, subtly sweet and lactic', 'Whipped whole milk cottage cheese', 'Refrigerate at 2-4°C; consume within 3-5 days', 'Filled pastas, cheesecakes, pancakes', 174, 11.3, 3.0, 13.0, 0, 'Low', true, true),
('ing-lemon', 'Lemon', 'Produce', 'Sharp citric acidity; fragrant zest oils', 'Lime juice, white wine vinegar, or ground sumac', 'Store at room temp up to 1 week; crisper drawer for 3 weeks', 'Dressings, marinades, baking balance', 29, 1.1, 9.3, 0.3, 2.8, 'Low', true, true),
('ing-olive-oil', 'Extra Virgin Olive Oil', 'Pantry & Spices', 'Fruity, grassy, peppery finish', 'Cold-pressed avocado oil or mild walnut oil', 'Dark glass bottle in a cool cupboard away from stove heat', 'Finishing warm pastas, dressings, sautéing', 884, 0, 0, 100, 0, 'Low', true, true),
('ing-basil', 'Fresh Basil', 'Produce', 'Peppery, sweet, with warm clove and anise', 'Fresh flat-leaf parsley blended with mint', 'Stems standing in water at room temperature', 'Pesto, Caprese, finishing pastas', 23, 3.2, 2.7, 0.6, 1.6, 'Low', true, true),
('ing-chickpeas', 'Chickpeas', 'Legumes', 'Nutty, buttery, earthy with firm bite', 'Cannellini beans or cooked green lentils', 'Airtight dry storage; refrigerated in broth for 4 days', 'Hummus, crisp oven snacks, harvest bowls', 164, 8.9, 27.4, 2.6, 7.6, 'Low', true, true),
('ing-tomatoes', 'Tomatoes', 'Produce', 'Juicy, bright acidity balanced by umami', 'Canned San Marzano tomatoes or roasted peppers', 'Always at room temp stem-down; never refrigerate', 'Soups, sauces, salads', 18, 0.9, 3.9, 0.2, 1.2, 'Low', true, true),
('ing-garlic', 'Garlic', 'Produce', 'Pungent raw; sweet and mellow roasted', 'Shallots, garlic scapes, or pinch of hing', 'Open basket in cool dark pantry', 'Foundational aromatic base', 149, 6.4, 33.1, 0.5, 2.1, 'Low', true, true),
('ing-chicken', 'Chicken Breast', 'Proteins', 'Mild, lean, receptive to marinades', 'Firm tofu steaks, tempeh, or turkey tenderloin', 'Coldest back shelf of fridge for 2 days or freeze', 'Roasts, skillet sautés, grain bowls', 165, 31.0, 0, 3.6, 0, 'Low', true, true),
('ing-potatoes', 'Yukon Gold Potatoes', 'Produce', 'Naturally buttery, crispy roasted', 'Red creamer potatoes or fingerlings', 'Cool, dark pantry away from onions', 'Crispy wedges, silky mash', 77, 2.0, 17.5, 0.1, 2.2, 'High', false, false),
('ing-chickpea-pasta', 'Chickpea Pasta', 'Grains & Pasta', 'Nutty, earthy, high protein and fiber legume noodle', 'Lentil pasta or edamame noodles', 'Airtight dry container', 'Diabetic-friendly and gluten-free pasta courses', 360, 24.0, 58.0, 3.5, 12.0, 'Low', true, true),
('ing-zucchini', 'Zucchini', 'Produce', 'Mild, tender, hydrating summer squash', 'Yellow squash or ribbons of cucumber', 'Crisper drawer for up to 1 week', 'Zucchini noodles (zoodles), grilling, baking', 17, 1.2, 3.1, 0.3, 1.0, 'Low', true, true),
('ing-greek-yogurt', 'Greek Yogurt (0% or 2%)', 'Dairy & Eggs', 'Thick, creamy, pleasantly tart with concentrated protein', 'Skyr or strained labneh', 'Refrigerate at 2-4°C', 'Sauces, breakfast parfaits, baking replacement', 59, 10.0, 3.6, 0.4, 0, 'Low', true, true);

-- Regional & Botanical Aliases (1:N)
INSERT INTO ingredient_aliases (ingredient_id, alias_name) VALUES
('ing-chickpeas', 'Garbanzo Beans'),
('ing-chickpeas', 'Gram'),
('ing-tomatoes', 'Plum Tomatoes'),
('ing-tomatoes', 'Roma Tomatoes'),
('ing-garlic', 'Allium sativum'),
('ing-basil', 'Sweet Basil'),
('ing-pasta', 'Semolina Pasta');

-- Diabetic & Clinical Health Substitutions (Self-Referencing M:N)
INSERT INTO ingredient_substitutes (ingredient_id, substitute_ingredient_id, ratio, culinary_notes, health_benefit, suitable_conditions) VALUES
('ing-pasta', 'ing-chickpea-pasta', '1:1 ratio', 'Cook 1-2 minutes less than wheat pasta to avoid over-softening.', 'Boosts plant protein and lowers glycemic impact for blood sugar stability', 'diabetes,celiac,pcos'),
('ing-pasta', 'ing-zucchini', '1:1.5 ratio by volume', 'Flash sauté ribbons for 60 seconds or serve raw tossed in warm sauce.', 'Cuts 80% of starches and carbs; ideal for ultra-low GI meals', 'diabetes,celiac,pcos'),
('ing-ricotta', 'ing-greek-yogurt', '1:1 ratio', 'Strain in cheesecloth for 15 minutes for dense ricotta texture.', 'Reduces saturated fat by 50% while doubling lean casein protein', 'diabetes,pcos,hypertension');

-- ----------------------------------------------------------------------------
-- 4. CANONICAL RECIPES
-- ----------------------------------------------------------------------------
INSERT INTO recipes (recipe_id, title, description, servings, prep_time, cook_time, difficulty, diet_tag, rating, rating_count, calories, protein, carbs, fat, fiber, source_attribution, visibility, status, user_id, cuisine_id, category_id, image_url) VALUES
('lemon-ricotta-pasta', 'Lemon & Ricotta Pasta', 'A little sunshine in a bowl. Creamy fresh ricotta, bright lemon zest, and fragrant hand-torn basil.', 2, 10, 15, 'Easy', 'Vegetarian', 4.9, 28, 485, 21, 62, 17, 4, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-eric', 'Italian', 'Dinner', '/src/assets/lemon-pasta.jpg'),
('chickpea-harvest-bowl', 'Roasted Chickpea Harvest Bowl', 'Crispy cumin-roasted chickpeas, buttery ripe avocado, sweet tomatoes, and crisp greens with lemon-tahini.', 2, 10, 20, 'Easy', 'Vegan', 4.8, 19, 390, 16, 45, 18, 11, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-maya', 'Mediterranean', 'Lunch', '/src/assets/salad.jpg'),
('roasted-tomato-soup', 'Slow-Roasted Tomato & Garlic Soup', 'Comforting, velvety soup made from plum tomatoes roasted with whole garlic bulbs and basil.', 4, 15, 30, 'Easy', 'Vegetarian', 4.9, 34, 245, 6, 28, 12, 5, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-eric', 'Italian', 'Dinner', '/src/assets/soup.jpg'),
('blueberry-pancakes', 'Sunday Blueberry Ricotta Pancakes', 'Fluffy golden stacks folded with fresh blueberries, ricotta for tenderness, and warm maple syrup.', 4, 10, 12, 'Easy', 'Vegetarian', 4.7, 16, 320, 9, 51, 10, 3, 'Sunday Family Recipe Book', 'Public', 'Published', 'user-eric', 'American', 'Breakfast', '/src/assets/pancakes.jpg'),
('rosemary-roast-chicken', 'Lemon & Rosemary Roast Chicken', 'Crispy skin, tender juicy chicken, and Yukon gold potatoes roasted in lemon juices and fresh rosemary.', 4, 15, 50, 'Medium', 'High protein', 4.8, 22, 520, 42, 31, 25, 4, 'The RecipeVault Kitchen', 'Public', 'Published', 'user-neeraj', 'Mediterranean', 'Dinner', '/src/assets/chicken.jpg');

-- ----------------------------------------------------------------------------
-- 5. RECIPE STEPS (3NF Cooking Procedures)
-- ----------------------------------------------------------------------------
INSERT INTO recipe_steps (recipe_id, step_number, instruction, duration_minutes, culinary_tip) VALUES
('lemon-ricotta-pasta', 1, 'Bring 3 quarts of generously salted water to a rolling boil.', 5, 'Water should taste like seasoned broth for well-salted pasta.'),
('lemon-ricotta-pasta', 2, 'Cook pasta until 1 minute shy of al dente; reserve 1/2 cup of starchy pasta water before draining.', 9, 'Do not rinse the pasta; the surface starch is essential for emulsification.'),
('lemon-ricotta-pasta', 3, 'In a wide serving skillet, whisk together fresh whole milk ricotta, lemon zest, lemon juice, and extra virgin olive oil.', 2, 'Room temperature ricotta emulsifies much more smoothly than ice-cold cheese.'),
('lemon-ricotta-pasta', 4, 'Toss warm drained pasta directly into the ricotta sauce, drizzling warm pasta water a tablespoon at a time until glossy and clinging.', 3, 'Toss vigorously with tongs to create a silk-like emulsion.'),
('lemon-ricotta-pasta', 5, 'Fold in freshly torn basil leaves, crack fresh black pepper over the top, and serve immediately.', 1, 'Tear basil with your fingers rather than chopping with steel to prevent bruising.'),

('chickpea-harvest-bowl', 1, 'Preheat oven to 400°F (200°C). Drain and thoroughly pat chickpeas dry on clean kitchen towels.', 5, 'Removing surface water is the key secret to achieving crispy oven chickpeas.'),
('chickpea-harvest-bowl', 2, 'Toss chickpeas with extra virgin olive oil, ground cumin, smoked paprika, sea salt, and black pepper on a baking sheet.', 2, 'Spread them in a single uncrowded layer so they roast rather than steam.'),
('chickpea-harvest-bowl', 3, 'Roast for 22 to 25 minutes, shaking the pan halfway through until golden and crackling.', 25, 'Listen for a gentle popping sound around the 20-minute mark.'),
('chickpea-harvest-bowl', 4, 'Whisk runny sesame tahini with fresh lemon juice, a minced garlic clove, and ice water until pale and velvety.', 3, 'Tahini will initially seize up when citrus is added; keep whisking with ice water until silky.'),
('chickpea-harvest-bowl', 5, 'Assemble bowls with mixed greens, quartered cherry tomatoes, sliced avocado, crispy chickpeas, and a generous tahini drizzle.', 3, 'Top with toasted sesame seeds or sumac for bright acidity.'),

('roasted-tomato-soup', 1, 'Preheat oven to 375°F (190°C). Slice ripe plum tomatoes in half and slice off the tops of whole garlic heads.', 5, 'Leave the papery skin on the garlic to protect the cloves during roasting.'),
('roasted-tomato-soup', 2, 'Arrange tomatoes cut-side up alongside the garlic bulbs on a baking sheet; drizzle generously with olive oil, salt, and pepper.', 5, 'Cut-side up prevents the natural sugars from burning on the tray.'),
('roasted-tomato-soup', 3, 'Roast for 35 to 40 minutes until tomato skins blister and garlic cloves are caramelized and soft as butter.', 40, 'Your kitchen will smell heavenly when the allium sugars caramelize.'),
('roasted-tomato-soup', 4, 'Squeeze roasted garlic cloves from their skins into a blender with the roasted tomatoes, pan juices, and vegetable broth.', 3, 'Vent the blender lid or cover with a folded towel to release steam safely.'),
('roasted-tomato-soup', 5, 'Puree on high until velvety smooth. Stir in fresh basil ribbons and a splash of olive oil to finish.', 2, 'A tiny splash of red wine vinegar will brighten the roasted sweetness.');

-- ----------------------------------------------------------------------------
-- 6. RECIPE TAGS
-- ----------------------------------------------------------------------------
INSERT INTO recipe_tags (recipe_id, tag_name) VALUES
('lemon-ricotta-pasta', 'Quick'),
('lemon-ricotta-pasta', 'Comfort Food'),
('lemon-ricotta-pasta', 'Weeknight'),
('chickpea-harvest-bowl', 'High-Fiber'),
('chickpea-harvest-bowl', 'Meal-Prep'),
('chickpea-harvest-bowl', 'Grain-Free'),
('roasted-tomato-soup', 'Antioxidant-Rich'),
('roasted-tomato-soup', 'Low-Calorie'),
('rosemary-roast-chicken', 'High-Protein'),
('rosemary-roast-chicken', 'Comfort Food'),
('blueberry-pancakes', 'Weekend Brunch');

-- ----------------------------------------------------------------------------
-- 7. CLINICAL HEALTH & METABOLIC SUITABILITY
-- ----------------------------------------------------------------------------
INSERT INTO recipe_health_suitability (recipe_id, condition_id, is_suitable, clinical_rationale, dietary_badge) VALUES
('lemon-ricotta-pasta', 'diabetes', true, 'Net carbs kept steady when served in 2-serving portions; high casein protein in ricotta slows carbohydrate absorption.', 'Diabetic-Friendly'),
('lemon-ricotta-pasta', 'pcos', true, 'High proportion of monounsaturated fats from olive oil and moderate glycemic index prevent insulin spiking.', 'PCOS-Balanced'),
('chickpea-harvest-bowl', 'diabetes', true, 'High fiber (11g) and slow-digesting resistant starches stabilize post-prandial glycemic response.', 'Diabetic-Friendly'),
('chickpea-harvest-bowl', 'pcos', true, 'Rich in plant protein, magnesium, and healthy tahini lipids; completely free of refined sugars.', 'PCOS-Balanced'),
('chickpea-harvest-bowl', 'hypertension', true, 'Abundant in dietary potassium from avocados and tomatoes; low sodium profile supports healthy vascular tone.', 'Heart-Healthy'),
('chickpea-harvest-bowl', 'celiac', true, 'Naturally 100% gluten-free whole food ingredients.', 'Celiac-Safe'),
('roasted-tomato-soup', 'diabetes', true, 'Low glycemic index and high lycopene antioxidant profile; under 30g total carbs per portion.', 'Diabetic-Friendly'),
('roasted-tomato-soup', 'hypertension', true, 'Potassium-rich simmered plum tomatoes and allicin from roasted garlic promote vasodilation.', 'Heart-Healthy'),
('rosemary-roast-chicken', 'diabetes', true, 'High lean protein (42g) with minimal net carbohydrates; excellent for stable continuous glucose monitoring.', 'Diabetic-Friendly'),
('rosemary-roast-chicken', 'pcos', true, 'Lean poultry protein combined with anti-inflammatory rosemary polyphenols and extra virgin olive oil.', 'PCOS-Balanced');

-- ----------------------------------------------------------------------------
-- 8. RECIPE INGREDIENTS (M:N Junction Rows)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 9. RECIPE VERSION LEDGER (Audited Snapshots)
-- ----------------------------------------------------------------------------
INSERT INTO recipe_versions (version_id, recipe_id, version_number, change_summary, author_id, author_name, snapshot_data) VALUES
('ver-lemon-pasta-1', 'lemon-ricotta-pasta', 1, 'Initial recipe creation with standard ricotta and cream sauce.', 'user-eric', 'Eric Titus', '{"servings": 2, "time": 30}'::jsonb),
('ver-lemon-pasta-2', 'lemon-ricotta-pasta', 2, 'Eliminated heavy cream, increased starchy pasta water emulsification.', 'user-eric', 'Eric Titus', '{"servings": 2, "time": 25}'::jsonb),
('ver-chickpea-bowl-1', 'chickpea-harvest-bowl', 1, 'Initial publication with yogurt sauce.', 'user-maya', 'Maya Lin', '{"servings": 2, "time": 35}'::jsonb),
('ver-chickpea-bowl-2', 'chickpea-harvest-bowl', 2, 'Upgraded to Mediterranean lemon-tahini dressing for superior creaminess and healthy fats.', 'user-maya', 'Maya Lin', '{"servings": 2, "time": 30}'::jsonb);

-- ----------------------------------------------------------------------------
-- 10. COLLECTIONS & SAVED RECIPES
-- ----------------------------------------------------------------------------
INSERT INTO collections (collection_id, collection_name, description, user_id) VALUES
('col-weeknight', 'Quick Weeknight Dinners', 'Low-effort, satisfying meals on the table in under 30 minutes.', 'user-eric'),
('col-comfort', 'Cozy Sunday Cooking', 'Slow roasts, simmering broths, and fresh heritage bakes.', 'user-eric'),
('col-mealprep', 'High-Protein Fuel', 'Fitness-focused weekly lunches with clean macros and high bio-availability.', 'user-neeraj');

INSERT INTO collection_recipes (collection_id, recipe_id) VALUES
('col-weeknight', 'lemon-ricotta-pasta'),
('col-weeknight', 'chickpea-harvest-bowl'),
('col-comfort', 'roasted-tomato-soup'),
('col-comfort', 'rosemary-roast-chicken'),
('col-mealprep', 'rosemary-roast-chicken'),
('col-mealprep', 'chickpea-harvest-bowl');

-- ----------------------------------------------------------------------------
-- 11. MEAL PLANS & SCHEDULED MEALS
-- ----------------------------------------------------------------------------
INSERT INTO meal_plans (plan_id, plan_name, user_id, start_date, end_date) VALUES
('plan-eric-current', 'Eric''s Autumn Meal Schedule', 'user-eric', '2026-10-19', '2026-10-25');

INSERT INTO meal_plan_items (item_id, plan_id, recipe_id, day_offset, date_scheduled, meal_slot, custom_servings) VALUES
('item-1', 'plan-eric-current', 'lemon-ricotta-pasta', 2, '2026-10-21', 'Dinner', 2),
('item-2', 'plan-eric-current', 'chickpea-harvest-bowl', 3, '2026-10-22', 'Lunch', 2),
('item-3', 'plan-eric-current', 'blueberry-pancakes', 6, '2026-10-25', 'Breakfast', 4);

-- ----------------------------------------------------------------------------
-- 12. RATINGS & REVIEWS
-- ----------------------------------------------------------------------------
INSERT INTO ratings_and_reviews (review_id, recipe_id, user_id, rating, review_text, verified_cook) VALUES
('rev-1', 'lemon-ricotta-pasta', 'user-neeraj', 5, 'The starchy pasta water trick completely transformed this! Silky smooth without heavy cream.', true),
('rev-2', 'chickpea-harvest-bowl', 'user-eric', 5, 'The tahini dressing is gold. Roasting the chickpeas thoroughly makes all the difference in crunch.', true),
('rev-3', 'roasted-tomato-soup', 'user-neeraj', 5, 'Roasted the garlic in whole cloves as instructed — unbelievably deep flavor.', true),
('rev-4', 'blueberry-pancakes', 'user-maya', 5, 'Folding the ricotta right into the batter makes the pancakes astonishingly fluffy.', true);
