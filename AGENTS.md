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

## Architecture rules
- Data access goes through the browser client with RLS; every table scopes to `auth.uid()` and admins read via `has_role()` — security lives in the database, not the UI.
- Admin role lives only in `user_roles` (granted via SQL/backend), never inferred from email in code — prevents privilege escalation.
- Mileage regression is blocked and logged by a DB trigger on `motorcycles` — single source of truth for the rule.
- Demo data lives only in `src/routes/demo.tsx` as static constants — keeps fake data out of production tables and needs no credentials.
- Public backend URL/publishable key have fallbacks in vite.config.ts — .env is gitignored, so repo-based builds otherwise ship without them and crash.
