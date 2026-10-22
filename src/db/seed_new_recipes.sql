-- ============================================================================
-- RECIPEVAULT: 5 Additional Production Seed Recipes (PostgreSQL / Supabase)
-- Ready to run directly in the Supabase SQL Editor.
-- Authors: Neeraj K (24BCE2393), Eric Titus (24BCE0096)
--
-- Recipes Included:
--   1. Wild Salmon & Herb Quinoa Bowl (High Protein, Mediterranean)
--   2. Fragrant Coconut Red Lentil Dahl (Plant-Powered, Indian)
--   3. Artisan Poached Egg & Avocado Sourdough (Energizing Breakfast, American)
--   4. Slow-Simmered Shiitake Miso Ramen (Deep Umami, Japanese)
--   5. Whipped Greek Yogurt & Berry Parfait (High Protein, Mediterranean)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MASTER INGREDIENTS (If not already present)
-- ----------------------------------------------------------------------------
INSERT INTO ingredients (ingredient_id, canonical_name, category, flavor_profile, substitute_summary, storage_guidelines, common_uses, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, glycemic_index, is_diabetic_friendly, is_pcos_friendly)
VALUES
('ing-salmon', 'Wild Salmon Fillet', 'Proteins', 'Rich, buttery, savory omega-3 rich fish', 'Rainbow trout, arctic char, or firm marinated tofu steaks', 'Keep on ice in fridge up to 2 days or freeze immediately', 'Pan-searing, baking, grain bowls', 208, 20.4, 0, 13.4, 0, 'Low', true, true),
('ing-quinoa', 'Tri-Color Quinoa', 'Grains & Pasta', 'Nutty, slightly earthy with an al dente pop', 'Brown rice, farro, or cauliflower rice for lower carbs', 'Store in a cool dry pantry in an airtight container', 'Warm bowls, cold grain salads, side dishes', 120, 4.4, 21.3, 1.9, 2.8, 'Low', true, true),
('ing-red-lentils', 'Split Red Lentils', 'Legumes', 'Mild, earthy, breaks down into creamy texture', 'Yellow split peas or brown lentils', 'Store in dry airtight container away from light', 'Dahl, soups, stews, purées', 116, 9.0, 20.0, 0.4, 7.9, 'Low', true, true),
('ing-coconut-milk', 'Coconut Milk (Light or Full-Fat)', 'Dairy & Eggs', 'Rich, creamy, slightly sweet tropical fat', 'Almond milk or cashew cream', 'Pantry shelf; once opened, refrigerate in glass container for 4 days', 'Curries, soups, smooth dressings', 197, 2.0, 2.8, 21.0, 0, 'Low', true, true),
('ing-ginger', 'Fresh Ginger Root', 'Produce', 'Zesty, spicy, warm, citrusy pungency', 'Ground ginger (1/4 tsp per 1 tbsp fresh) or galangal', 'Store unpeeled in crisper or freeze whole', 'Aromatic stir-fries, marinades, dahl, teas', 80, 1.8, 17.8, 0.8, 2.0, 'Low', true, true),
('ing-sourdough', 'Artisan Sourdough Bread', 'Grains & Pasta', 'Crusty, tangy, slow-fermented artisanal crumb', 'Gluten-free seed loaf or sprouted grain bread', 'Paper bag at room temp for 3 days or slice and freeze', 'Toasts, bruschetta, dipping into broth', 230, 8.0, 45.0, 1.5, 3.0, 'Medium', true, true),
('ing-avocado', 'Ripe Hass Avocado', 'Produce', 'Buttery, mild, creamy monounsaturated fat', 'Hummus, edamame spread, or whipped ricotta', 'Room temp until soft, then refrigerate up to 5 days', 'Toasts, salads, dressings, guacamole', 160, 2.0, 8.5, 14.7, 6.7, 'Low', true, true),
('ing-eggs', 'Pasture-Raised Eggs', 'Dairy & Eggs', 'Rich golden yolk, mild savory protein', 'Silken tofu or flax egg for baking', 'Refrigerate at 2-4°C carton-stored', 'Poaching, frittatas, baking, scrambling', 143, 12.6, 0.7, 9.5, 0, 'Low', true, true),
('ing-shiitake', 'Fresh Shiitake Mushrooms', 'Produce', 'Deeply savory, woodsy, intense umami', 'Cremini mushrooms or dried porcini rehydrated', 'Paper bag in refrigerator crisper drawer', 'Ramen broth, sautés, broths, stir-fries', 34, 2.2, 6.8, 0.5, 2.5, 'Low', true, true),
('ing-miso', 'White Miso Paste', 'Condiments', 'Savory, sweet-salty fermented soybean umami', 'Yellow miso or coconut aminos with nutritional yeast', 'Refrigerate tightly covered for up to 1 year', 'Soup bases, marinades, dressings, glazes', 198, 12.0, 26.0, 6.0, 5.0, 'Low', true, true),
('ing-soba', 'Buckwheat Soba Noodles', 'Grains & Pasta', 'Nutty, earthy, hearty gluten-friendly noodle', 'Udon noodles, brown rice noodles, or zucchini zoodles', 'Airtight container in cool dry pantry', 'Ramen, cold noodle salads, dashi bowls', 99, 5.1, 21.4, 0.1, 1.4, 'Low', true, true),
('ing-berries', 'Fresh Mixed Wild Berries', 'Produce', 'Sweet, tart, antioxidant-rich juicy clusters', 'Frozen wild blueberries or sliced strawberries', 'Refrigerate unwashed until ready to eat; rinse gently', 'Breakfast parfaits, oatmeal, baking, snacking', 57, 0.7, 14.5, 0.3, 2.4, 'Low', true, true)
ON CONFLICT (ingredient_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. RECIPES
-- ----------------------------------------------------------------------------
INSERT INTO recipes (recipe_id, title, description, servings, prep_time, cook_time, difficulty, diet_tag, rating, rating_count, calories, protein, carbs, fat, fiber, source_attribution, visibility, status, user_id, cuisine_id, category_id, image_url)
VALUES
(
  'wild-salmon-quinoa-bowl',
  'Wild Salmon & Herb Quinoa Bowl',
  'Pan-crisped wild salmon fillet nestled on warm lemon-herb tri-color quinoa with tender asparagus, avocado slices, and a vibrant dill dressing.',
  2, 15, 20, 'Easy', 'High protein', 4.9, 24, 490, 38, 42, 18, 7,
  'The RecipeVault Kitchen', 'Public', 'Published',
  'user-neeraj', 'Mediterranean', 'Lunch',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80'
),
(
  'coconut-red-lentil-dahl',
  'Fragrant Coconut Red Lentil Dahl',
  'Velvety slow-simmered split red lentils steeped in creamy coconut milk, fresh ginger, golden turmeric, and sweet garlic with warm coriander finish.',
  4, 10, 25, 'Easy', 'Vegan', 4.9, 31, 340, 18, 48, 9, 12,
  'The Heritage Spice Journal', 'Public', 'Published',
  'user-maya', 'Indian', 'Dinner',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80'
),
(
  'poached-egg-avocado-toast',
  'Artisan Poached Egg & Avocado Toast',
  'Toasted sourdough slathered with lime-spiked smashed avocado, soft-poached runny egg, Aleppo chili flakes, microgreens, and flaky Maldon salt.',
  2, 10, 8, 'Easy', 'Vegetarian', 4.8, 18, 380, 17, 32, 21, 8,
  'Morning Pantry Kitchen', 'Public', 'Published',
  'user-eric', 'American', 'Breakfast',
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80'
),
(
  'shiitake-miso-ramen',
  'Slow-Simmered Shiitake Miso Ramen',
  'Deeply restorative ginger-garlic shiitake broth over chewy soba noodles, finished with tender baby bok choy, scallions, and toasted sesame.',
  2, 20, 35, 'Medium', 'Vegetarian', 4.9, 27, 440, 22, 64, 12, 6,
  'Tokyo Street Kitchen', 'Public', 'Published',
  'user-eric', 'Japanese', 'Dinner',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80'
),
(
  'berry-greek-yogurt-parfait',
  'Whipped Greek Yogurt & Berry Parfait',
  'Thick Icelandic-style strained yogurt whipped with vanilla bean and lemon zest, layered with warm chia blueberry compote and toasted walnuts.',
  2, 8, 0, 'Easy', 'High protein', 4.8, 15, 280, 24, 26, 6, 5,
  'The RecipeVault Kitchen', 'Public', 'Published',
  'user-neeraj', 'Mediterranean', 'Breakfast',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (recipe_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  servings = EXCLUDED.servings,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  difficulty = EXCLUDED.difficulty,
  diet_tag = EXCLUDED.diet_tag,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber;

-- ----------------------------------------------------------------------------
-- 3. RECIPE STEPS (Step-by-Step Cooking Guidance)
-- ----------------------------------------------------------------------------
DELETE FROM recipe_steps WHERE recipe_id IN (
  'wild-salmon-quinoa-bowl',
  'coconut-red-lentil-dahl',
  'poached-egg-avocado-toast',
  'shiitake-miso-ramen',
  'berry-greek-yogurt-parfait'
);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, duration_minutes, culinary_tip)
VALUES
-- Wild Salmon Bowl
('wild-salmon-quinoa-bowl', 1, 'Rinse quinoa in cold water to remove bitter saponin. Simmer in 1.5 cups vegetable broth with a pinch of sea salt for 15 minutes until light and fluffy.', 15, 'Using broth instead of plain tap water infuses the grain with savory depth from the inside out.'),
('wild-salmon-quinoa-bowl', 2, 'Pat salmon fillets dry with paper towels; season skin and flesh generously with kosher salt and cracked black pepper.', 3, 'A completely dry skin surface guarantees shattering crispness when pan-searing.'),
('wild-salmon-quinoa-bowl', 3, 'Heat 1 tbsp extra virgin olive oil in a heavy stainless or cast-iron skillet over medium-high. Lay salmon skin-side down and press gently for 10 seconds. Sear 4 minutes until skin releases cleanly, flip, and cook 2 minutes more.', 6, 'Do not force or tear the fish; it releases naturally from the pan once the crust is fully set.'),
('wild-salmon-quinoa-bowl', 4, 'Fluff warm quinoa with fresh lemon zest, chopped dill, and olive oil. Assemble bowls with sliced avocado, crisp asparagus, and top with hot crispy salmon.', 3, 'Finish with a pinch of flaky Maldon sea salt and fresh lemon wedges.'),

-- Coconut Red Lentil Dahl
('coconut-red-lentil-dahl', 1, 'Heat olive oil in a deep Dutch oven. Sauté minced garlic, freshly grated ginger, and chopped shallots over medium heat for 3 minutes until aromatic.', 3, 'Stir continually to prevent delicate garlic and ginger from scorching.'),
('coconut-red-lentil-dahl', 2, 'Stir in ground turmeric, cumin, and coriander seed. Bloom the ground spices in hot oil for 45 seconds until fragrant.', 1, 'Blooming oil-soluble spices awakens their volatile essential oils.'),
('coconut-red-lentil-dahl', 3, 'Add rinsed red lentils, 2 cups of vegetable stock, and 1 can of creamy coconut milk. Bring to a gentle boil, then lower heat to simmer covered for 20 minutes.', 20, 'Red lentils break down quickly into a comforting, velvety texture without needing a blender.'),
('coconut-red-lentil-dahl', 4, 'Stir in fresh baby spinach leaves and fresh lime juice until greens are wilted. Garnish generously with fresh cilantro leaves.', 2, 'Acid from lime balances the rich coconut lipids and highlights the earthiness.'),

-- Poached Egg Avocado Toast
('poached-egg-avocado-toast', 1, 'In a small bowl, coarsely mash ripe Hass avocado with 1 tbsp fresh lime juice, extra virgin olive oil, a pinch of sea salt, and black pepper.', 3, 'Leave small chunks of avocado intact for textural contrast rather than pureeing.'),
('poached-egg-avocado-toast', 2, 'Bring 3 inches of water in a skillet to a gentle simmer (around 190°F / 88°C). Stir water in a gentle whirlpool.', 3, 'A slow whirlpool encourages the delicate egg white to wrap smoothly around the yolk.'),
('poached-egg-avocado-toast', 3, 'Slip cracked fresh egg into the center of the whirlpool. Simmer gently for 3 minutes until white is completely set but yolk remains liquid.', 3, 'Use the freshest pasture-raised eggs you can find; fresh albumen holds together far better.'),
('poached-egg-avocado-toast', 4, 'Toast thick artisan sourdough slices until deeply golden. Spread mashed avocado edge-to-edge, place poached egg on top, and scatter with chili flakes.', 2, 'Cut into the yolk immediately at table so the warm emulsion glazes the avocado.'),

-- Shiitake Miso Ramen
('shiitake-miso-ramen', 1, 'Heat sesame oil in a saucepan. Sauté sliced fresh shiitake caps, crushed garlic, and sliced ginger for 4 minutes until mushrooms are tender and caramelized.', 4, 'Caramelizing the mushrooms first extracts rich guanylate umami.'),
('shiitake-miso-ramen', 2, 'Pour in 4 cups vegetable dashi or rich vegetable broth. Simmer gently for 20 minutes to extract deep earthy mushroom essence.', 20, 'Keep on a gentle simmer rather than a rolling boil to keep the broth crystal-clear.'),
('shiitake-miso-ramen', 3, 'Turn off the heat. Whisk white miso paste in a ladle with warm broth until smooth, then stir back into the soup. Do not boil after adding miso.', 2, 'Boiling miso paste destroys its delicate fermented aroma and beneficial enzymes.'),
('shiitake-miso-ramen', 4, 'Cook buckwheat soba noodles in a separate pot for 4 minutes, rinse quickly with warm water, and divide into deep soup bowls. Ladle hot broth over noodles and garnish with scallions.', 4, 'Cooking noodles separately prevents excess starch from clouding your rich broth.'),

-- Greek Yogurt Parfait
('berry-greek-yogurt-parfait', 1, 'In a chilled glass bowl, vigorously whisk thick Greek yogurt with pure vanilla bean extract and lemon zest until airy and silky.', 3, 'Whisking introduces air pockets for a mousse-like, luxurious mouthfeel.'),
('berry-greek-yogurt-parfait', 2, 'Gently warm half the wild berries in a small saucepan with 1 tsp chia seeds for 3 minutes until juices release and naturally thicken.', 3, 'Warm compote against cool yogurt creates a striking sensory temperature contrast.'),
('berry-greek-yogurt-parfait', 3, 'Layer whipped yogurt, warm berry compote, toasted crushed walnuts, and fresh berries into glasses. Drizzle lightly with raw honey.', 2, 'Toasted walnuts add essential omega-3 healthy fats and a satisfying nutty crunch.');

-- ----------------------------------------------------------------------------
-- 4. RECIPE TAGS
-- ----------------------------------------------------------------------------
DELETE FROM recipe_tags WHERE recipe_id IN (
  'wild-salmon-quinoa-bowl',
  'coconut-red-lentil-dahl',
  'poached-egg-avocado-toast',
  'shiitake-miso-ramen',
  'berry-greek-yogurt-parfait'
);

INSERT INTO recipe_tags (recipe_id, tag_name)
VALUES
('wild-salmon-quinoa-bowl', 'High Protein'),
('wild-salmon-quinoa-bowl', 'Omega-3 Rich'),
('wild-salmon-quinoa-bowl', 'Gluten-Free'),
('wild-salmon-quinoa-bowl', 'Clean Eating'),

('coconut-red-lentil-dahl', 'Plant-Powered'),
('coconut-red-lentil-dahl', 'High-Fiber'),
('coconut-red-lentil-dahl', 'Comfort Food'),
('coconut-red-lentil-dahl', 'Gluten-Free'),

('poached-egg-avocado-toast', 'Quick Breakfast'),
('poached-egg-avocado-toast', 'Whole Grains'),
('poached-egg-avocado-toast', 'Healthy Fats'),

('shiitake-miso-ramen', 'Umami-Rich'),
('shiitake-miso-ramen', 'Warm Broth'),
('shiitake-miso-ramen', 'Comfort Food'),

('berry-greek-yogurt-parfait', 'High Protein'),
('berry-greek-yogurt-parfait', 'No-Cook'),
('berry-greek-yogurt-parfait', 'Antioxidant-Rich');

-- ----------------------------------------------------------------------------
-- 5. CLINICAL HEALTH & METABOLIC SUITABILITY
-- ----------------------------------------------------------------------------
DELETE FROM recipe_health_suitability WHERE recipe_id IN (
  'wild-salmon-quinoa-bowl',
  'coconut-red-lentil-dahl',
  'poached-egg-avocado-toast',
  'shiitake-miso-ramen',
  'berry-greek-yogurt-parfait'
);

INSERT INTO recipe_health_suitability (recipe_id, condition_id, is_suitable, clinical_rationale, dietary_badge)
VALUES
-- Wild Salmon Bowl
('wild-salmon-quinoa-bowl', 'diabetes', true, 'Tri-color quinoa provides complex low-GI carbs with 7g fiber; high protein and omega-3s blunt glucose absorption.', 'Diabetic-Friendly'),
('wild-salmon-quinoa-bowl', 'hypertension', true, 'Exceptionally high in anti-inflammatory EPA/DHA omega-3 fatty acids and potassium for arterial vasodilation.', 'Heart-Healthy'),
('wild-salmon-quinoa-bowl', 'pcos', true, 'Clean lean fish protein (38g) and monounsaturated avocado fats help regulate insulin resistance and ovarian stress.', 'PCOS-Balanced'),
('wild-salmon-quinoa-bowl', 'celiac', true, 'Naturally 100% gluten-free pseudo-grain quinoa and unprocessed fish and vegetables.', 'Celiac-Safe'),

-- Coconut Dahl
('coconut-red-lentil-dahl', 'diabetes', true, '12g dietary soluble fiber slows carbohydrate digestion, keeping postprandial glucose flat and stable.', 'Diabetic-Friendly'),
('coconut-red-lentil-dahl', 'hypertension', true, 'Abundant in dietary potassium, magnesium, and fresh ginger gingerols that support healthy blood pressure.', 'Heart-Healthy'),
('coconut-red-lentil-dahl', 'pcos', true, 'Rich in plant-based legume protein, zinc, and anti-inflammatory curcumin from ground turmeric.', 'PCOS-Balanced'),
('coconut-red-lentil-dahl', 'celiac', true, 'Naturally 100% wheat- and gluten-free legume stew.', 'Celiac-Safe'),

-- Avocado Toast
('poached-egg-avocado-toast', 'diabetes', true, 'High soluble fiber and healthy monounsaturated oleic acid prevent glucose spikes when paired with sourdough.', 'Diabetic-Friendly'),
('poached-egg-avocado-toast', 'pcos', true, 'Balanced ratio of healthy fats to bioavailable egg protein (17g) supports satiety and hormonal equilibrium.', 'PCOS-Balanced'),
('poached-egg-avocado-toast', 'hypertension', true, 'Naturally rich in avocado potassium and low in sodium when using light mineral salt.', 'Heart-Healthy'),

-- Miso Ramen
('shiitake-miso-ramen', 'diabetes', true, 'Buckwheat soba delivers resistant starch and d-chiro-inositol, a recognized insulin-sensitizing compound.', 'Diabetic-Friendly'),
('shiitake-miso-ramen', 'celiac', true, '100% pure buckwheat soba noodles are completely gluten-free pseudo-grains safe for celiac individuals.', 'Celiac-Safe'),

-- Yogurt Parfait
('berry-greek-yogurt-parfait', 'diabetes', true, 'High casein protein (24g) with low net glycemic load from polyphenolic berries stabilizes morning glucose.', 'Diabetic-Friendly'),
('berry-greek-yogurt-parfait', 'pcos', true, 'Probiotic live cultures promote gut microbiome health while concentrated protein prevents sugar crashes.', 'PCOS-Balanced'),
('berry-greek-yogurt-parfait', 'hypertension', true, 'Calcium and potassium in strained Greek yogurt support vascular endothelial function and healthy blood pressure.', 'Heart-Healthy'),
('berry-greek-yogurt-parfait', 'celiac', true, 'Naturally 100% gluten-free breakfast parfait.', 'Celiac-Safe');

-- ----------------------------------------------------------------------------
-- 6. RECIPE INGREDIENTS (M:N Junction Rows)
-- ----------------------------------------------------------------------------
DELETE FROM recipe_ingredients WHERE recipe_id IN (
  'wild-salmon-quinoa-bowl',
  'coconut-red-lentil-dahl',
  'poached-egg-avocado-toast',
  'shiitake-miso-ramen',
  'berry-greek-yogurt-parfait'
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, preparation_state)
VALUES
-- Wild Salmon Bowl
('wild-salmon-quinoa-bowl', 'ing-salmon', 340, 'g', 'two skin-on center cut fillets'),
('wild-salmon-quinoa-bowl', 'ing-quinoa', 150, 'g', 'rinsed tri-color quinoa'),
('wild-salmon-quinoa-bowl', 'ing-avocado', 1, 'whole', 'sliced into wedges'),
('wild-salmon-quinoa-bowl', 'ing-olive-oil', 1.5, 'tbsp', 'extra virgin'),
('wild-salmon-quinoa-bowl', 'ing-lemon', 1, 'whole', 'zested and juiced'),

-- Coconut Dahl
('coconut-red-lentil-dahl', 'ing-red-lentils', 250, 'g', 'rinsed split red lentils'),
('coconut-red-lentil-dahl', 'ing-coconut-milk', 400, 'ml', 'full-fat or light canned'),
('coconut-red-lentil-dahl', 'ing-ginger', 20, 'g', 'finely grated fresh root'),
('coconut-red-lentil-dahl', 'ing-garlic', 4, 'clove', 'minced'),
('coconut-red-lentil-dahl', 'ing-olive-oil', 1, 'tbsp', 'for blooming spices'),

-- Avocado Toast
('poached-egg-avocado-toast', 'ing-sourdough', 2, 'slice', 'artisan crusty sourdough'),
('poached-egg-avocado-toast', 'ing-avocado', 1, 'whole', 'ripe Hass avocado'),
('poached-egg-avocado-toast', 'ing-eggs', 2, 'whole', 'large pasture-raised eggs'),
('poached-egg-avocado-toast', 'ing-olive-oil', 1, 'tsp', 'drizzle to finish'),

-- Shiitake Ramen
('shiitake-miso-ramen', 'ing-soba', 180, 'g', 'buckwheat soba noodles'),
('shiitake-miso-ramen', 'ing-shiitake', 150, 'g', 'sliced fresh shiitake caps'),
('shiitake-miso-ramen', 'ing-miso', 2.5, 'tbsp', 'sweet white or yellow miso'),
('shiitake-miso-ramen', 'ing-ginger', 15, 'g', 'sliced fresh rounds'),
('shiitake-miso-ramen', 'ing-garlic', 3, 'clove', 'lightly crushed'),

-- Yogurt Parfait
('berry-greek-yogurt-parfait', 'ing-greek-yogurt', 300, 'g', 'strained plain 0% or 2%'),
('berry-greek-yogurt-parfait', 'ing-berries', 150, 'g', 'fresh blueberries, raspberries & blackberries'),
('berry-greek-yogurt-parfait', 'ing-lemon', 0.5, 'whole', 'fine zest only');

-- ----------------------------------------------------------------------------
-- 7. REVIEWS & RATINGS
-- ----------------------------------------------------------------------------
INSERT INTO ratings_and_reviews (review_id, recipe_id, user_id, rating, review_text, verified_cook)
VALUES
('rev-salmon-1', 'wild-salmon-quinoa-bowl', 'user-eric', 5, 'The salmon skin came out so crispy! Dill with lemon-infused quinoa is brilliant.', true),
('rev-dahl-1', 'coconut-red-lentil-dahl', 'user-neeraj', 5, 'Astonishingly comforting. Blooming the ginger and spices in hot oil first makes the entire house smell incredible.', true),
('rev-toast-1', 'poached-egg-avocado-toast', 'user-maya', 5, 'The whirlpool poaching technique worked like a charm on the first try. Perfect golden runny yolk.', true),
('rev-ramen-1', 'shiitake-miso-ramen', 'user-maya', 5, 'Deep, satisfying umami without needing pork or poultry bones. A weeknight winter staple.', true),
('rev-parfait-1', 'berry-greek-yogurt-parfait', 'user-eric', 5, 'Whisking the lemon zest into the yogurt makes it taste like a pastry chef dessert.', true)
ON CONFLICT (recipe_id, user_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review_text = EXCLUDED.review_text;
