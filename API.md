# Koha Backend API — frontend reference

Serve this Fastify app (default **`http://localhost:3000`** unless you configure another host/port). All **versioned REST** routes live under **`/api/v1`**.

Interactive docs: **`GET /documentation`** (Swagger UI). OpenAPI is generated from the same route schemas described here.

---

## Response envelope

Every JSON response uses one of these shapes:

**Success**

```json
{
  "success": true,
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "error": {
    "statusCode": 401,
    "message": "…"
  }
}
```

Implement clients with `fetch`/`axios`: check `success`, then read `data` or `error`.

---

## Authentication

### Access token (JWT)

- **Lifetime:** ~15 minutes (short-lived access JWT).
- **Send on protected requests:** HTTP header

  `Authorization: Bearer <accessToken>`

- **Payload:** `sub` = user UUID (you normally only need the opaque token).

### Refresh token

- **Lifetime:** ~30 days.
- **Storage:** `HttpOnly` cookie named `koha_refresh_token`; not readable by frontend JS.
- **Use:** `POST /api/v1/auth/refresh` with `credentials: 'include'` to obtain a new access token. The backend validates + rotates the refresh cookie.

### User profile shape (`UserPublic`)

```json
{
  "id": "<uuid>",
  "username": "reader42",
  "avatar": null
}
```

`avatar` may be `null` or a string URL/path depending on future use.

---

## Public vs protected

| Area                   | Auth required                  |
| ---------------------- | ------------------------------ |
| `/api/v1/health`       | No                             |
| `/api/v1/` (root ping) | No                             |
| `/api/v1/auth/*`       | No (refresh/logout use cookie) |
| `/api/v1/users/me`     | Yes — Bearer access token      |
| `/api/v1/novels/*`     | Yes — Bearer access token      |

---

## Environment (server)

Frontend only needs **`CORS_ORIGIN`** matching its own origin when calling from a browser — set on the server. Auth cookie calls require `credentials: 'include'` on the frontend. Other vars (`ROOT_FOLDER_PATH`, `DB_PATH`, JWT secrets) are server-only.

---

## Endpoints

### `GET /api/v1/`

Lightweight ping (hidden from Swagger UI in some setups).

**200**

```json
{ "success": true, "data": { "root": true } }
```

---

### `GET /api/v1/health`

Indexer/process health snapshot.

**200 `data`** (illustrative)

```json
{
  "status": "ready",
  "cachedNovels": 12,
  "lastIndexed": "2026-05-09T05:47:51.059Z",
  "isScanning": false,
  "uptime": 3600.5,
  "memory": { "rss": 80.1, "heapUsed": 35.2, "heapTotal": 42.0 },
  "nodeVersion": "v22.x.y"
}
```

`status`: `"starting"` | `"scanning"` | `"ready"`.

---

### `POST /api/v1/auth/signup`

**Body**

```json
{
  "username": "reader42",
  "password": "at_least_8_chars"
}
```

**Rules:** Username is normalized (trimmed, lowercased). Allowed pattern: **`^[a-z0-9_]{3,30}$`**.

**200 `data`** — same as login (see below). Also sets `Set-Cookie: koha_refresh_token=...; HttpOnly; Path=/api/v1/auth; ...`.

**409** — username already taken.

---

### `POST /api/v1/auth/login`

**Body**

```json
{
  "username": "reader42",
  "password": "…"
}
```

**200 `data`**

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "…",
    "username": "reader42",
    "avatar": null
  }
}
```

**401** — bad credentials.

**Cookie side effect:** sets/rotates `koha_refresh_token` as an `HttpOnly` cookie scoped to `/api/v1/auth`.

---

### `POST /api/v1/auth/refresh`

**Request:** no body required. Browser must send cookie:

```js
fetch("/api/v1/auth/refresh", {
  method: "POST",
  credentials: "include",
});
```

**200 `data`** — same shape as login (`accessToken`, `user`). Old refresh row is invalidated and backend sets a rotated `koha_refresh_token` cookie.

**401** — invalid/expired/reused refresh token.

---

### `POST /api/v1/auth/logout`

**Request:** no body required. Browser must send cookie with `credentials: 'include'`.

**200 `data`**

```json
{ "ok": true }
```

Clears that refresh token server-side, clears `koha_refresh_token`, and frontend should drop the in-memory access token.

---

### `GET /api/v1/users/me`

**Headers:** `Authorization: Bearer <accessToken>`

**200 `data`:** `UserPublic`

**401** — missing/invalid access token.

**404** — user id in JWT missing from DB (rare).

---

### Novels (all require Bearer access token)

**Headers:** `Authorization: Bearer <accessToken>` on every request below.

**401** — missing/invalid/expired access token.

#### `GET /api/v1/novels/status`

Indexer state.

**200 `data`**

```json
{
  "ready": true,
  "isScanning": false,
  "lastIndexed": 1735123456789,
  "total": 10
}
```

`lastIndexed` is Unix ms or `null` before first completed scan.

---

#### `GET /api/v1/novels`

Paginated catalog (only novels with `chapters > 0` in the index).

**Query:** `page` (default 1), `pageSize` (default 20, max 100).

**200 `data`**

```json
{
  "novels": [
    {
      "id": "ban-giao-hu-a1b2c3d4e5",
      "name": "…",
      "path": "…",
      "chapters": 12
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

#### `GET /api/v1/novels/search?q=`

**Query:** `q` (required, non-empty searchable string), optional `page` / `pageSize`.

**200:** same list + `meta` shape as `GET /novels`.

**400** — bad `q` (missing, blank, or no searchable chars).

---

#### `GET /api/v1/novels/:id`

Novel metadata + chapter list (`id` from list/search).

**200 `data`**

```json
{
  "id": "…",
  "name": "…",
  "chapters": [
    {
      "hash": "a1b2c3d4",
      "filename": "chapter-1.md",
      "index": 1
    }
  ]
}
```

**404** — unknown novel id.

---

#### `GET /api/v1/novels/:id/:hash`

Chapter body (Markdown). `hash` is the 8-char id from the chapter list.

**200 `data`**

```json
{
  "hash": "a1b2c3d4",
  "filename": "chapter-1.md",
  "index": 1,
  "content": "# …markdown…"
}
```

**404** — novel or chapter not found.

---

## Suggested frontend flow

1. **Login or signup** with `credentials: 'include'` → backend stores refresh token in `HttpOnly` cookie; response gives `accessToken` + `user`.
2. **Keep access token in memory** (or short-lived app state). Do not store refresh token in JS storage.
3. **Attach** `Authorization: Bearer ${accessToken}` to **`/api/v1/novels/*`** and **`/api/v1/users/me`**.
4. **On app reload**, call **`/api/v1/auth/refresh`** with `credentials: 'include'` → get new `accessToken` + `user`.
5. **On 401** from a protected route, call refresh once, replace access token, retry once.
6. **Logout:** call **`/api/v1/auth/logout`** with `credentials: 'include'`, then clear access token locally.

---

## CORS

Server uses `@fastify/cors` with `credentials: true`. Your SPA origin must match `CORS_ORIGIN`; frontend cookie calls must use `credentials: 'include'`.

---

## Changelog (recent)

- **Drizzle + SQLite migrations** applied at server startup (`drizzle/migrations`).
- **Auth:** username/password, in-memory access JWT + `HttpOnly` refresh cookie with DB-backed rotation.
- **`/api/v1/novels/*`:** requires valid **Bearer access token** on every novels route.
