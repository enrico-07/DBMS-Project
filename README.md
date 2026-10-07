# RecipeVault — A Database-Driven Recipe Management & Culinary Intelligence System

> **DBMS X UI/UX Project**  
> **Authors:** Neeraj K (24BCE2393) & Eric Titus (24BCE0096)  
> **Course / Review:** Relational DBMS & Full-Stack Culinary Engineering

---

## 1. Project Overview & Philosophy

**RecipeVault** is a production-grade culinary information system built to solve the real-world fragmentation of recipe knowledge. Rather than storing recipes as isolated text documents, RecipeVault connects recipes, ingredients, nutrition, cuisines, collections, meal plans, ratings, and historical revisions through a **normalized 3NF relational database architecture**.

On the surface, the application embodies the **"Warm Pantry"** design system — an editorial digital kitchen shelf where database complexity is hidden behind warmth, editorial rhythm, and tactile interaction.

---

## 2. Relational Database Engineering (DBMS Architecture)

RecipeVault demonstrates core academic and industry DBMS concepts:

### Normalized Relational Schema (3NF)
- **`users`**: User identity, role, culinary bio, cooking skill level, and target cooking time.
- **`recipes`**: Canonical recipe metadata (servings, prep time, cook time, total generated time, difficulty, visibility, status).
- **`recipe_versions`**: Immutable revision snapshots capturing historical changes, authors, and timestamps with one-click rollback.
- **`ingredients`**: Master dictionary with canonical names, botanical/culinary classifications, flavor notes, and shelf-life guidelines.
- **`recipe_ingredients`**: M:N junction table with precise quantities, units, and preparation states (e.g., *finely diced*, *room temperature*).
- **`ingredient_aliases`**: 1:N regional and botanical synonyms (e.g., *Garbanzo beans / Ceci / Kabuli chana*).
- **`ingredient_substitutes`**: Self-referencing relationship mapping culinary substitutes with substitution ratios.
- **`collections` & `collection_recipes`**: Custom user-curated shelves and junction mappings.
- **`meal_plans` & `meal_plan_items`**: Weekly schedule matrix with custom serving multipliers.
- **`ratings_and_reviews`**: Verified cook feedback with automated rating recalculation.
- **`user_pantry_items`**: User home cupboard inventory for overlap queries.

### SQL DDL & Seed Scripts
Complete, executable PostgreSQL DDL and seed scripts are located in `src/db/`:
- [`src/db/schema.sql`](file:///c:/Users/ERIC/Downloads/recipevault/src/db/schema.sql): Complete 3NF DDL with primary keys, foreign keys, `CHECK` constraints, indexes, views, and aggregate triggers.
- [`src/db/seed.sql`](file:///c:/Users/ERIC/Downloads/recipevault/src/db/seed.sql): Realistic seed data matching demo personas, recipes, and version revisions.

### Database Triggers & Views
- **`trg_recipe_review_aggregate`**: Automatically recalculates average rating and review counts on `recipes` upon review submission.
- **`v_top_rated_recipes`**: Filtered view for published dishes with ratings $\ge 4.5$.
- **`v_healthy_recipe_summary`**: Analytical view computing macronutrient protein-to-calorie ratios.

---

## 3. The "Warm Pantry" Design System

| Token | Value | Role |
| :--- | :--- | :--- |
| **Cream Base** | `#FAF6F0` | Page background — warm ivory, never stark white |
| **Card White** | `#FFFDF9` | Surfaces & cards with generous 16–24px radius |
| **Espresso Ink** | `#2C231B` | Primary text — warm roasted brown |
| **Clay / Terracotta** | `#C4633F` | Primary accent — CTAs, active states, bookmarks |
| **Sage** | `#7C9070` | Secondary accent — health badges, dietary tags, pantry stock |
| **Honey** | `#D9A441` | Ratings, highlights, warm culinary emphasis |
| **Linen Border** | `#E9DFD2` | Soft dividers doing more work than harsh shadows |

- **Headings**: `Fraunces` display serif (Google Font)
- **Body & UI**: `Nunito Sans` humanist sans-serif
- **Data & Numbers**: Tabular numerals (`tabular-nums`) for clean quantity alignment

---

## 4. Key Application Features

1. **"Cook With What You Have" (Pantry Matching Engine)**:
   - Select stocked ingredients to compute live overlap scores against all recipes.
2. **Transparent Recommendation Scorer**:
   - Multi-factor relational scoring combining cuisine affinities (35%), dietary compliance (30%), time constraints (15%), and ratings (20%).
3. **Non-Destructive Fractional Serving Scaler**:
   - Real-time scaling from 1 to 24 servings with culinary fraction formatting (`1/2`, `1 1/4`, etc.) without mutating database records.
4. **Distraction-Free Cooking Mode**:
   - Full-screen kitchen counter interface with step progress tracking, chef tips, and timed durations.
5. **Recipe Version Control & Rollbacks**:
   - Inspect version history timelines with commit messages and one-click rollback restoration.
6. **Weekly Meal Planner & Consolidated Shopping List**:
   - 7-day schedule with automated aggregation of ingredients grouped by supermarket aisle (Produce, Dairy, Pantry, etc.) with pantry stock cross-checking.
7. **Semantic Ingredient Library**:
   - Explore regional aliases, tested substitutes, storage science, and dishes featuring each ingredient.
8. **Side-by-Side Nutrition Comparator**:
   - Visual comparison bars for calories, protein, carbs, fat, and fiber, accompanied by medical boundary safety disclaimers.
9. **Multi-Persona Demo Switching & Custom Auth**:
   - Instant 1-click persona switching (Eric Titus, Neeraj K, Maya Lin) alongside custom account creation and preference personalization.

---

## 5. Development & Verification

### Prerequisites
- Node.js (v18+)
- npm or bun

### Setup & Run
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit test suite
npx vitest run

# Production build
npm run build
```

---

## 6. Project Architecture

```
src/
├── assets/          # High-resolution food photography
├── components/      # Reusable Warm Pantry UI components
│   ├── recipe-card.tsx    # Card with tuck-into-vault animation & pantry badges
│   ├── vault-provider.tsx # Relational local store & session persistence
│   └── vault-shell.tsx    # Persistent kitchen-shelf sidebar & quick persona switch
├── db/
│   ├── schema.sql         # PostgreSQL 3NF DDL schema
│   └── seed.sql           # Complete relational seed data
├── lib/
│   ├── recipes.ts         # Relational data model, calculation services, algorithms
│   └── metadata.ts        # OpenGraph & SEO helpers
├── routes/
│   ├── __root.tsx         # Root layout with Fraunces & Nunito Sans fonts
│   ├── index.tsx          # Discover & Pantry Overlap Engine
│   ├── recipe/$id.tsx     # Recipe detail, serving scaler, cooking mode, versions
│   ├── create.tsx         # Structured recipe builder & version commit form
│   ├── cookbook.tsx       # Personal shelves, collections, and drafts
│   ├── planner.tsx        # 7-day meal planner & consolidated shopping list
│   ├── ingredients.tsx    # Semantic ingredient encyclopedia
│   ├── nutrition.tsx      # Nutrition dashboard, comparison bars, science FAQs
│   ├── profile.tsx        # Kitchen preferences, allergens, and wellness filters
│   └── login.tsx          # Persona switcher & custom authentication
└── test/
    ├── culinary-engine.test.ts # Tests for scaling, pantry match, & recommendations
    └── app-routing.test.tsx    # Route matching validation
```
