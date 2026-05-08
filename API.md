# Koha API — Reference

Base URL: the host the server is running on (e.g. `http://localhost:3000`).  
All endpoints are prefixed with `/api/v1`.

---

## Response envelope

Every response is wrapped in a consistent envelope.

**Success**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Novel not found"
  }
}
```

---

## Common types

### Novel
```ts
{
  id: string        // URL-safe slug, e.g. "ban-giao-huong-banh-ngot"
  name: string      // Original folder name, e.g. "[Oneshot] Bản giao hưởng bánh ngọt"
  path: string      // Raw folder name on disk
  chapters: number  // Total chapter count
}
```

### Chapter
```ts
{
  hash: string      // 8-char SHA-256 of filename — use this as the chapter ID in URLs
  filename: string  // e.g. "chapter-1.md"
  index: number     // 1-based natural sort position
}
```

### PaginationMeta
```ts
{
  page: number
  pageSize: number
  total: number
  totalPages: number
}
```

---

## Endpoints

---

### `GET /api/v1/novels`

Returns a paginated list of all indexed novels that have at least one chapter.

**Query parameters**

| Name | Type | Default | Description |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | Page number |
| `pageSize` | integer 1–100 | `20` | Items per page |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "novels": [
      {
        "id": "ban-giao-huong-banh-ngot",
        "name": "[Oneshot] Bản giao hưởng bánh ngọt",
        "path": "[Oneshot]_Bản_giao_hưởng_bánh_ngọt",
        "chapters": 12
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 142,
      "totalPages": 8
    }
  }
}
```

---

### `GET /api/v1/novels/search`

Search novels by name. Diacritic-insensitive (`ă = a`, `ơ = o`, etc.). Underscores and hyphens are treated as spaces.

**Query parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `q` | string | yes | Search query |
| `page` | integer ≥ 1 | no | Default `1` |
| `pageSize` | integer 1–100 | no | Default `20` |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "novels": [ /* Novel[] */ ],
    "meta": { /* PaginationMeta */ }
  }
}
```

**Error `400`** — `q` is missing, blank, or contains only special characters
```json
{
  "success": false,
  "error": { "statusCode": 400, "message": "q query parameter is required" }
}
```

---

### `GET /api/v1/novels/status`

Returns the current state of the background filesystem indexer.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "ready": true,
    "isScanning": false,
    "lastIndexed": 1746691200000,
    "total": 142
  }
}
```

| Field | Type | Description |
|---|---|---|
| `ready` | boolean | `true` once the first scan has completed |
| `isScanning` | boolean | `true` while a scan is running |
| `lastIndexed` | number \| null | Unix timestamp (ms) of last completed scan |
| `total` | number | Novel count from the last scan |

---

### `GET /api/v1/novels/:id`

Returns metadata and the full chapter list for a single novel.

**Path parameters**

| Name | Description |
|---|---|
| `id` | Novel slug, e.g. `ban-giao-huong-banh-ngot` |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "ban-giao-huong-banh-ngot",
    "name": "[Oneshot] Bản giao hưởng bánh ngọt",
    "chapters": [
      { "hash": "a1b2c3d4", "filename": "chapter-1.md", "index": 1 },
      { "hash": "e5f6g7h8", "filename": "chapter-2.md", "index": 2 }
    ]
  }
}
```

**Error `404`**
```json
{
  "success": false,
  "error": { "statusCode": 404, "message": "Novel not found" }
}
```

---

### `GET /api/v1/novels/:id/:hash`

Returns the raw Markdown content of a single chapter.

**Path parameters**

| Name | Description |
|---|---|
| `id` | Novel slug |
| `hash` | 8-char chapter hash from the chapter list |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "hash": "a1b2c3d4",
    "filename": "chapter-1.md",
    "index": 1,
    "content": "# Chapter 1\n\nLorem ipsum..."
  }
}
```

**Error `404`**
```json
{
  "success": false,
  "error": { "statusCode": 404, "message": "Chapter not found" }
}
```

---

### `GET /api/v1/health`

Returns server health information.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "cachedNovels": 142,
    "lastIndexed": "2026-05-08T10:00:00.000Z",
    "isScanning": false,
    "uptime": 3600.5,
    "memory": {
      "rss": 45.2,
      "heapUsed": 22.1,
      "heapTotal": 32.0
    },
    "nodeVersion": "v25.0.0"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `status` | `"starting"` \| `"scanning"` \| `"ready"` | `"starting"` = first scan not yet done, `"scanning"` = scan in progress, `"ready"` = at least one scan complete |
| `cachedNovels` | number | Novel count in the SQLite index |
| `lastIndexed` | string (ISO 8601) \| null | Timestamp of last completed scan |
| `isScanning` | boolean | |
| `uptime` | number | Process uptime in seconds |
| `memory.rss` | number | Resident set size in MB |
| `memory.heapUsed` | number | V8 heap used in MB |
| `memory.heapTotal` | number | V8 heap total in MB |
| `nodeVersion` | string | Node.js version string |

---

## Error codes

| Status | Meaning |
|---|---|
| `400` | Bad request — invalid or missing query parameters |
| `404` | Resource not found |
| `5xx` | Server error — check server logs |
