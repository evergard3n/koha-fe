---
name: koha-api-handler
description: Add a new API domain handler to the Koha frontend. Use when the user asks to add a new API endpoint, a new resource group, or a new set of API handlers following the project's three-layer pattern (interface → service → query hook). Covers creating the interface file, the axios service, the TanStack Query hooks, and verifying types.
---

# Koha API Handler Skill

## Project API layer architecture

```
app/lib/
├── axios.ts                        # Singleton axios instance (DO NOT touch)
├── interfaces/
│   ├── common.interface.ts         # ApiSuccess<T>, ApiError — shared envelope types
│   ├── novels.interface.ts         # Domain models + request params + response shapes
│   └── health.interface.ts         # Health-specific response shapes
├── services/
│   ├── novels.service.ts           # Plain async functions using the axios singleton
│   └── health.service.ts
└── queries/
    ├── novels.queries.ts           # TanStack Query hooks wrapping the service
    └── health.queries.ts
```

Three layers, always in this order:

1. **Interface** (`app/lib/interfaces/<domain>.interface.ts`) — TypeScript types only, no logic
2. **Service** (`app/lib/services/<domain>.service.ts`) — axios calls, no React
3. **Query** (`app/lib/queries/<domain>.queries.ts`) — TanStack Query hooks wrapping the service

---

## Step-by-step workflow

### 1. Read the API spec

Read `API.md` (project root) or ask the user to describe the endpoints. Identify:
- HTTP method + path
- Query / path parameters
- Response data shape
- Error cases

### 2. Determine the domain name

Group endpoints by resource (e.g. `novels`, `health`, `users`). One file per domain per layer.

If the domain already exists, **extend** the existing files rather than creating new ones.

### 3. Create or extend the interface file

File: `app/lib/interfaces/<domain>.interface.ts`

Include:
- Domain model types (plain objects)
- Request param interfaces (`Get<Resource>Params`, `Search<Resource>Params`, etc.)
- Response data interfaces (`<Resource>ListData`, `<Resource>DetailData`, etc.)

Import `ApiSuccess`, `ApiError`, `ApiErrorResponse` from `~/lib/interfaces/common.interface` only if you need them in the interface file (usually not necessary — the axios interceptor handles unwrapping).

Use `export interface` (not `type`) for all shapes. Use `import type` for type-only imports (`verbatimModuleSyntax` is on).

### 4. Create or extend the service file

File: `app/lib/services/<domain>.service.ts`

Rules:
- Import `apiClient` from `~/lib/axios` (singleton — never instantiate axios here)
- Import types using `import type` from the interface file
- One `export async function` per endpoint
- Name functions: `fetch<Resource>`, `search<Resource>`, `create<Resource>`, etc.
- Destructure `{ data }` from the axios response — the interceptor already unwrapped the envelope
- Cast the return: `return data as <ResponseType>`
- No React, no hooks

Example:
```ts
import apiClient from "~/lib/axios";
import type { GetWidgetParams, WidgetData } from "~/lib/interfaces/widget.interface";

export async function fetchWidget({ id }: GetWidgetParams): Promise<WidgetData> {
  const { data } = await apiClient.get(`/widgets/${id}`);
  return data as WidgetData;
}
```

### 5. Create or extend the query file

File: `app/lib/queries/<domain>.queries.ts`

Rules:
- Import `useQuery` (or `useMutation` for writes) from `@tanstack/react-query`
- Import service functions; import param types with `import type`
- Export a `<domain>Keys` query key factory object — use the pattern:
  ```ts
  export const widgetKeys = {
    all: ["widgets"] as const,
    lists: () => [...widgetKeys.all, "list"] as const,
    list: (params: GetWidgetsParams) => [...widgetKeys.lists(), params] as const,
    detail: (id: string) => [...widgetKeys.all, "detail", id] as const,
  };
  ```
- One `export function use<Resource>` hook per logical query
- Set `enabled` to `false` when required params are empty/missing
- For search hooks, guard with `params.q.trim().length > 0`

### 6. Verify

Run:
```bash
pnpm typecheck
```

Fix any type errors before finishing. Do not skip this step.

---

## Conventions

| Convention | Rule |
|---|---|
| Imports | `import type` for all type-only imports |
| Axios | Always use the singleton from `~/lib/axios` |
| Envelope unwrap | Done in the axios interceptor — service functions receive `data` directly |
| Error handling | `ApiError` is thrown by the interceptor; catch it in UI with `.isAxiosError` or check `error instanceof ApiError` |
| `~/*` alias | Maps to `app/*` — use it for all cross-file imports |
| Query keys | Always use the key factory, never inline string arrays |
| SSR | Services are plain async functions — safe to call in loaders if needed |

---

## Example: adding a new `users` domain

### `app/lib/interfaces/users.interface.ts`
```ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
}

export interface UsersListData {
  users: User[];
  meta: PaginationMeta; // import from novels.interface or move PaginationMeta to common
}
```

### `app/lib/services/users.service.ts`
```ts
import apiClient from "~/lib/axios";
import type { GetUsersParams, UsersListData } from "~/lib/interfaces/users.interface";

export async function fetchUsers(params: GetUsersParams = {}): Promise<UsersListData> {
  const { data } = await apiClient.get("/users", { params });
  return data as UsersListData;
}
```

### `app/lib/queries/users.queries.ts`
```ts
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "~/lib/services/users.service";
import type { GetUsersParams } from "~/lib/interfaces/users.interface";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
};

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
  });
}
```
