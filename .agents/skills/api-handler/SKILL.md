---
name: api-handler
description: Create a new API domain handler in this project. Use this skill whenever the user asks to add a new API endpoint, a new resource, a new set of API calls, or says anything like "add a handler for X", "wire up the X API", "create queries for X", or "I need to fetch X from the backend". Walks through three layers in order: interface file → service file → query hooks file.
---

# API Handler Skill

## What this skill does

Creates all three layers for a new API domain in one go:

1. **Interface** — TypeScript types: domain models, request params, response shapes
2. **Service** — Plain async axios functions (no React)
3. **Query module** — TanStack Query hooks wrapping the service

## Layer architecture

```
app/lib/
├── axios.ts                        ← singleton, never touch
├── interfaces/
│   ├── common.interface.ts         ← ApiSuccess<T>, ApiError — never touch
│   └── <domain>.interface.ts       ← YOU CREATE THIS
├── services/
│   └── <domain>.service.ts         ← YOU CREATE THIS
└── queries/
    └── <domain>.queries.ts         ← YOU CREATE THIS
```

---

## Step 1 — Gather information

Before writing any file, collect:

- The **domain name** (e.g. `users`, `tags`, `comments`) — becomes the filename prefix
- All **endpoints** for this domain: HTTP method, path, query/path params, response shape
- Any **error cases** worth noting

If an `API.md` or similar spec exists in the repo root, read it first. Ask the user only for what is missing.

---

## Step 2 — Interface file

**Path:** `app/lib/interfaces/<domain>.interface.ts`

If the file already exists, extend it — do not recreate it.

Structure:
```ts
// ---------- Domain models ----------
export interface <Model> { ... }

// ---------- Request params ----------
export interface Get<Model>Params { ... }
export interface Search<Model>Params { q: string; page?: number; pageSize?: number }

// ---------- Response data shapes ----------
export interface <Model>ListData { items: <Model>[]; meta: PaginationMeta }
export interface <Model>DetailData { ... }
```

Rules:
- Use `export interface`, not `type`
- Use `import type` for all type-only cross-file imports (`verbatimModuleSyntax` is on)
- If `PaginationMeta` is already defined elsewhere, import it with `import type`; do not redefine it
- Keep this file free of any logic — types only

---

## Step 3 — Service file

**Path:** `app/lib/services/<domain>.service.ts`

```ts
import apiClient from "~/lib/axios";
import type { Get<Model>Params, <Model>Data } from "~/lib/interfaces/<domain>.interface";

export async function fetch<Model>(params: Get<Model>Params): Promise<<Model>Data> {
  const { data } = await apiClient.get("/<route>", { params });
  return data as <Model>Data;
}
```

Rules:
- Always import `apiClient` from `~/lib/axios` — it is a singleton; never call `axios.create()` here
- The axios interceptor already unwraps `{ success, data }` — destructure `{ data }` from the response directly
- Name functions: `fetch<Model>`, `search<Model>`, `create<Model>`, `update<Model>`, `delete<Model>`
- No React imports, no hooks
- One function per endpoint

---

## Step 4 — Query module

**Path:** `app/lib/queries/<domain>.queries.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { fetch<Model> } from "~/lib/services/<domain>.service";
import type { Get<Model>Params } from "~/lib/interfaces/<domain>.interface";

export const <domain>Keys = {
  all: ["<domain>"] as const,
  lists: () => [...<domain>Keys.all, "list"] as const,
  list: (params: Get<Model>Params) => [...<domain>Keys.lists(), params] as const,
  detail: (id: string) => [...<domain>Keys.all, "detail", id] as const,
};

export function use<Model>s(params: Get<Model>Params = {}) {
  return useQuery({
    queryKey: <domain>Keys.list(params),
    queryFn: () => fetch<Model>s(params),
  });
}

export function use<Model>(id: string) {
  return useQuery({
    queryKey: <domain>Keys.detail(id),
    queryFn: () => fetch<Model>({ id }),
    enabled: id.length > 0,
  });
}
```

Rules:
- Always export a `<domain>Keys` factory — never inline query key arrays in hooks
- Set `enabled: false` (or a guard) when required params are absent
- For search hooks, guard with `params.q.trim().length > 0`
- Use `useMutation` for POST/PUT/PATCH/DELETE operations

---

## Step 5 — Verify

Always run after creating all files:

```bash
pnpm typecheck
```

Fix all type errors before reporting done.

---

## Conventions cheatsheet

| Rule | Detail |
|---|---|
| Path alias | `~/` maps to `app/` — use it for all imports |
| Type imports | `import type` for all type-only imports |
| Axios singleton | `import apiClient from "~/lib/axios"` — one instance for the whole app |
| Envelope unwrap | Done by interceptor — service receives unwrapped `data` |
| Error type | `ApiError` from `~/lib/interfaces/common.interface` — `statusCode` + `message` |
| Query keys | Always use the key factory object, not inline arrays |
| SSR safety | Services are plain async functions — safe in React Router loaders |
