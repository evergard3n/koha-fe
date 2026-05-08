# AGENTS.md

## Project purpose
Frontend for a novel-reading site. Planned features: novel listing with pagination, search, novel detail page, chapter reading page. No auth or favourites.

## Stack
- React Router v7 (framework mode, SSR enabled)
- React 19, TypeScript 5 (strict)
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- Vite 8, pnpm

## Commands
```bash
pnpm dev          # dev server with HMR at http://localhost:5173
pnpm build        # production build → build/client + build/server
pnpm start        # serve production build (port 3000)
pnpm typecheck    # react-router typegen && tsc (run after adding routes)
```

## Key paths
- `app/routes.ts` — central route config; add all routes here using `@react-router/dev/routes` helpers
- `app/routes/` — route modules
- `app/root.tsx` — root layout/shell
- `app/app.css` — global styles (Tailwind entry)
- `.react-router/types/` — generated types; committed by `typecheck`, do not edit manually
- `~/*` path alias maps to `app/*`

## Routing conventions
Uses **React Router v7 framework mode** (not file-based auto-discovery by default). Routes must be explicitly registered in `app/routes.ts`. After adding a new route, run `pnpm typecheck` to regenerate `.react-router/types/`.

## SSR
SSR is on (`ssr: true` in `react-router.config.ts`). Use `.server/` subdirectory convention for server-only modules, `.client/` for client-only. Loader data is typed automatically after typegen.

## TypeScript
`verbatimModuleSyntax` is enabled — use `import type` for type-only imports. Strict mode is on.

## HTTP & data fetching
- Use **axios** for all HTTP requests (not `fetch`).
- Use **TanStack Query** (`@tanstack/react-query`) for all server-state fetching, caching, and synchronisation. Do not manage remote data in component state or loaders unless there is a specific SSR reason.

## Responsive design
All pages must be fully responsive. Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, etc.) — no fixed pixel widths for layout containers.

## No linter or formatter configured yet
No ESLint, Prettier, or test runner is set up. Add before shipping.
