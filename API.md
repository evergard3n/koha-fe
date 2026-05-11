# API Reference — koha-be

Base path: `/api/v1`  
All responses are wrapped: `{ success: true, data: ... }` or `{ success: false, error: { statusCode, message } }`  
Protected routes require: `Authorization: Bearer <accessToken>`

---

## Auth

### POST /auth/signup

Create account.

**Body**
```json
{ "username": "reader42", "password": "secret123" }
```
- `username`: 3–30 chars, lowercase letters / digits / underscore only
- `password`: min 8 chars

**200**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<opaque>",
  "user": { "id": "<uuid>", "username": "reader42", "avatar": null }
}
```

**Errors:** 400 (invalid input), 409 (username taken)

---

### POST /auth/login

**Body**
```json
{ "username": "reader42", "password": "secret123" }
```

**200** — same shape as signup  
**Errors:** 401 (invalid credentials)

---

### POST /auth/refresh

Rotate refresh token. Old token is deleted; new pair issued.

**Body**
```json
{ "refreshToken": "<opaque>" }
```

**200** — same shape as signup  
**Errors:** 401 (invalid or expired token)

---

### POST /auth/logout

Revoke refresh token server-side. Client should discard both tokens locally.

**Body**
```json
{ "refreshToken": "<opaque>" }
```

**200**
```json
{ "ok": true }
```

---

## Users

### GET /users/me 🔒

**200**
```json
{ "id": "<uuid>", "username": "reader42", "avatar": null }
```

**Errors:** 401, 404

---

## Novels

All novel routes require Bearer token.

### GET /novels/status 🔒

Background Drive indexer state.

**200**
```json
{
  "ready": true,
  "isScanning": false,
  "lastIndexed": 1715000000000,
  "total": 42
}
```
- `ready`: false until the first scan completes after startup
- `lastIndexed`: unix ms, null before first scan

---

### GET /novels 🔒

Paginated list of all novels with at least one chapter. Served from SQLite — no Drive API call.

**Query**
| Param | Type | Default | Max |
|---|---|---|---|
| `page` | integer | 1 | — |
| `pageSize` | integer | 20 | 100 |

**200**
```json
{
  "novels": [
    { "id": "ban-giao-hu-a1b2c3d4e5", "name": "Bản giao hưởng bánh ngọt", "path": "Bản_giao_hưởng_bánh_ngọt", "chapters": 12 }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 }
}
```

---

### GET /novels/search 🔒

Diacritic-insensitive name search (ă=a, ơ=o, etc.). Underscores and hyphens treated as spaces. Served from SQLite — no Drive API call.

**Query**
| Param | Type | Required | Default | Max |
|---|---|---|---|---|
| `q` | string | yes | — | — |
| `page` | integer | no | 1 | — |
| `pageSize` | integer | no | 20 | 100 |

**200** — same shape as `GET /novels`  
**Errors:** 400 (missing/blank/symbol-only `q`)

---

### GET /novels/:id 🔒

Novel metadata + full chapter list.

**Caching:** makes one Drive `files.get` (metadata only) to compare `modifiedTime` against the cached value in SQLite. Cache hit → serve chapters from DB. Cache miss → fetch chapter list from Drive, update DB.

**Path param**
- `id` — stable novel ID, format: `<slug>-<sha256_prefix>` e.g. `ban-giao-hu-a1b2c3d4e5`

**200**
```json
{
  "id": "ban-giao-hu-a1b2c3d4e5",
  "name": "Bản giao hưởng bánh ngọt",
  "chapters": [
    {
      "hash": "a1b2c3d4",
      "filename": "chapter-01.md",
      "mimeType": "text/plain",
      "index": 1
    },
    {
      "hash": "e5f6a7b8",
      "filename": "volume-1.epub",
      "mimeType": "application/epub+zip",
      "index": 2
    }
  ]
}
```

- `hash`: 8-char SHA-256 of the filename — stable URL key
- `mimeType`: use this to select the correct content route below
- `index`: 1-based natural sort order (numeric-aware)

**Errors:** 404 (novel not found), 500 (Drive metadata call failed)

---

### GET /novels/:id/:hash 🔒

Fetch raw Markdown content for a `.md` chapter. Loads full file into memory from Drive (`alt=media`, `arraybuffer`). **Do not use for epub files.**

**Path params**
- `id` — novel ID
- `hash` — 8-char chapter hash from the chapter list

**200**
```json
{
  "hash": "a1b2c3d4",
  "filename": "chapter-01.md",
  "mimeType": "text/plain",
  "index": 1,
  "content": "# Chapter 1\n\nLorem ipsum..."
}
```

**Errors:** 400 (chapter is epub — use `/stream` instead), 401, 404, 500

---

### GET /novels/:id/:hash/stream

Stream epub file content. **No auth required** — designed for epub reader libraries that load resources via plain URL.

Supports HTTP range requests. Forward `Range` header to enable partial loading (epubjs does this automatically).

**Path params**
- `id` — novel ID
- `hash` — 8-char chapter hash (must be an epub chapter)

**Request headers**
```
Range: bytes=0-65535   (optional — omit for full download)
```

**200 / 206**
```
Content-Type: application/epub+zip
Accept-Ranges: bytes
Content-Range: bytes 0-65535/1048576   (only on 206)
Content-Length: 65536                  (when available)
<binary epub data>
```

**Errors:** 400 (chapter is not epub — use `/:id/:hash` for markdown), 404, 500

---

## How to choose between the two chapter routes

```
chapter.mimeType === 'application/epub+zip'
  → GET /novels/:id/:hash/stream   (binary stream, range-aware)
  
otherwise (.md or text/plain)
  → GET /novels/:id/:hash          (JSON envelope, content string)
```

The `mimeType` field in the chapter list (`GET /novels/:id`) is the canonical signal.
