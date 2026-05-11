// ---------- Domain models ----------

import type { PaginationMeta } from "./common.interface";

export interface Novel {
  id: string;
  name: string;
  path: string;
  chapters: number;
}

export interface Chapter {
  hash: string;
  filename: string;
  mimeType: string;
  index: number;
}

// ---------- Request params ----------

export interface GetNovelsParams {
  page?: number;
  pageSize?: number;
}

export interface SearchNovelsParams {
  q: string;
  page?: number;
  pageSize?: number;
}

export interface GetNovelParams {
  id: string;
}

export interface GetChapterParams {
  id: string;
  hash: string;
}

// ---------- Response data shapes ----------

export interface NovelsListData {
  novels: Novel[];
  meta: PaginationMeta;
}

export interface NovelDetailData {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface ChapterData extends Chapter {
  content: string;
}

export interface NovelStatusData {
  ready: boolean;
  isScanning: boolean;
  lastIndexed: number | null;
  total: number;
}
