# The RecipeVault Design System — "Warm Pantry"

**Philosophy:** A beautiful, tactile digital kitchen shelf. Database complexity and relational precision hidden behind warmth, editorial rhythm, and responsive craft.

---

## 1. Atmosphere Palette System (Time of Day & Mood)

RecipeVault features an interactive 3-mode culinary atmosphere switcher accessible via the header, sidebar, and floating atmosphere bar:

### Mode 1: Morning Dawn & Sunshine (`data-theme="morning"`)
*Philosophy: Crisp morning light streaming through clean kitchen windows, dew on garden herbs, golden citrus sunbeams.*
- **Morning Mist Background**: `#F4F8F6` — cool, bright, refreshing clean dawn air
- **Porcelain White Card**: `#FFFFFF` — clean marble & porcelain surfaces
- **Cool Ink**: `#1E282A` — sharp, high-legibility slate ink
- **Dawn Tangerine Accent**: `#E07A2B` — bright morning sunbeam CTA
- **Dew Herb Secondary**: `#E3F1EC` with `#389868` sage mint
- **Golden Sun Honey**: `#F59E0B`
- **Cool Dew Border**: `#DDE8E3`

### Mode 2: Afternoon & Sunset Pantry (`data-theme="sunset"`, Default)
*Philosophy: Cozy golden hour in an artisan pantry, warm clay pots, dried herbs, amber honey.*
- **Cream Base**: `#FAF6F0` — warm ivory page background
- **Card White**: `#FFFDF9` — warm soft cards
- **Espresso Ink**: `#2C231B` — roasted brown primary text
- **Clay / Terracotta**: `#C4633F` — signature warm accent
- **Muted Sage**: `#7C9070` with `#EBF1EA` background
- **Honey**: `#D9A441` — golden ratings & warm highlights
- **Linen Border**: `#E9DFD2` — soft woven divider

### Mode 3: Night & Restful Sleep (`data-theme="night"` / `.dark`)
*Philosophy: Quiet midnight kitchen, soft moonlight on slate counters, anti-glare, peaceful and restful for tired eyes.*
- **Midnight Obsidian Slate**: `#0D121B` — deep cool resting background
- **Twilight Counter Card**: `#151D29` — dark slate surface with no harsh contrast
- **Moonlit Silver Text**: `#E3E9F2` — soft moonlight typography, zero glare
- **Moonlit Hearth Accent**: `#E59560` — gentle bedside warm glow CTA
- **Deep Indigo Secondary**: `#1C2636`
- **Restful Eucalyptus**: `#6AB38E`
- **Mellow Moon Gold**: `#EBBF57`
- **Twilight Border**: `#232E3F` — subtle divider lines

---

## 2. Typography

- **Headings & Display**: `Fraunces` — A warm, friendly display serif that gives an editorial, magazine-cookbook feel.
- **Body & UI**: `Nunito Sans` — A clean humanist sans-serif for readability, forms, navigation, and crisp culinary descriptions.
- **Data & Quantities**: Tabular numerals (`tabular-nums`) ensuring dynamically scaled ingredient amounts align cleanly in lists and nutrition breakdowns.

---

## 3. Shape, Depth, Borders & Mobile Spacing

- **Radius**: Generous 16–24px on cards, fully rounded pills (9999px) for tags, chips, and primary buttons.
- **Borders & Dividers**: Natural, subtle linen borders (`border-border/70` or `border-border/80`). **Harsh yellow/golden gradient accent stripes have been eliminated** across all cards and containers.
- **Mobile Grid Rules**:
  - Discover feed uses a **2-column compact grid** (`grid-template-columns: repeat(2, minmax(0, 1fr))` with 8–12px gap) on screens ≤ 640px.
  - Page wrapper padding scales down to `px-3 sm:px-6 md:px-8` to guarantee **0px horizontal viewport overflow**.
- **Fixed Mobile Dock**:
  - `fixed bottom-0 inset-x-0 z-50` with backdrop blur (`backdrop-blur-md`).
  - 5 evenly spaced tabs with `env(safe-area-inset-bottom)` support.
- **Depth**: Subtle shadows with warm espresso undertones (`rgba(44, 35, 27, 0.05)`); soft linen borders do more work than heavy drop shadows.
- **Motion**:
  - Slow fades and gentle lifts on card hover (`translateY(-4px)` with warm shadow expansion).
  - Animated quantity transitions on the non-destructive serving stepper.
  - Soft **"tuck into the vault"** feedback animation (`@keyframes tuckIntoVault`) when saving recipes to a personal cookbook.

---

## 4. Academic DBMS & Culinary Intelligence Layer

- **Normalized 3NF Architecture**: Master ingredient directory, recipe junction tables, user dietary profiles, recipe version snapshots, and ratings.
- **Pantry Overlap Engine**: Interactive pantry selector computing overlap percentages in $O(N)$ time ("Cook with what you have!").
- **Transparent Recommendation Scoring**: Weighted multi-factor query evaluating cuisine affinities (35%), dietary restrictions (30%), max prep time (15%), and ratings (20%).
- **Active Strong Password Evaluator**: 5-factor real-time security assessment with a 4-tier color meter and live checklist checkmarks.
- **Persistent Local Store**: Preserves user edits, collections, meal plans, reviews, and version rollbacks across browser reloads, with a canonical demo reset button.
