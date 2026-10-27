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

- Keep the curated craving guide available without AI or a cycle date; use the existing server call only for additional phase-matched suggestions, so the core guide works offline.
- Keep history calculations in a browser-safe helper and localStorage; initialise storage in effects and never invent historical dates, so SSR and privacy remain safe.
- Keep current-page resets in a browser-safe scoped helper and remount suggestion forms to discard pending results; history deletion is a separate local operation that preserves current cycle settings. This prevents reset actions from erasing unrelated logs or restoring stale suggestions.
- Use the existing Nebius server functions for optional wellness suggestions, with explicit symptom-sharing consent and offline general guidance; never expose provider credentials in browser code.
- Keep ingredient caution matching and suggestion normalization in a browser-safe helper shared by the recipe UI and server; attach recipe badges only to validated caution IDs reported as adapted, so warnings remain available without AI and unrelated cards are not labelled.
