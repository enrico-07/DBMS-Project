<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## RecipeVault architecture
- Keep demo recipe, collection, planner and preference state in a shared React provider; no persistence service is connected in the UI-only phase.
- Keep reusable culinary data and calculations in browser-safe lib modules, and render distinct application sections through TanStack file routes.
- Use semantic Kitchen Journal tokens from src/styles.css and the existing shadcn controls for all application interactions; this keeps the UI consistent and accessible.
- Pre-optimize all third-party UI dependencies used by routes in Vite; late dependency discovery can mix React module generations and invalidate the hook dispatcher in an open preview.
