import { useQuery } from "@tanstack/react-query";
import {
  fetchNovels,
  searchNovels,
  fetchNovelStatus,
  fetchNovel,
  fetchChapter,
} from "~/lib/services/novels.service";
import type {
  GetNovelsParams,
  SearchNovelsParams,
} from "~/lib/interfaces/novels.interface";

export const novelKeys = {
  all: ["novels"] as const,
  lists: () => [...novelKeys.all, "list"] as const,
  list: (params: GetNovelsParams) => [...novelKeys.lists(), params] as const,
  search: (params: SearchNovelsParams) => [...novelKeys.all, "search", params] as const,
  status: () => [...novelKeys.all, "status"] as const,
  details: () => [...novelKeys.all, "detail"] as const,
  detail: (id: string) => [...novelKeys.details(), id] as const,
  chapter: (id: string, hash: string) => [...novelKeys.detail(id), "chapter", hash] as const,
};

export function useNovels(params: GetNovelsParams = {}, enabled = true) {
  return useQuery({
    queryKey: novelKeys.list(params),
    queryFn: () => fetchNovels(params),
    enabled,
  });
}

export function useSearchNovels(params: SearchNovelsParams, enabled = true) {
  return useQuery({
    queryKey: novelKeys.search(params),
    queryFn: () => searchNovels(params),
    enabled: enabled && params.q.trim().length > 0,
  });
}

export function useNovelStatus(enabled = true) {
  return useQuery({
    queryKey: novelKeys.status(),
    queryFn: fetchNovelStatus,
    enabled,
  });
}

export function useNovel(id: string, enabled = true) {
  return useQuery({
    queryKey: novelKeys.detail(id),
    queryFn: () => fetchNovel({ id }),
    enabled: enabled && id.length > 0,
  });
}

export function useChapter(id: string, hash: string, enabled = true) {
  return useQuery({
    queryKey: novelKeys.chapter(id, hash),
    queryFn: () => fetchChapter({ id, hash }),
    enabled: enabled && id.length > 0 && hash.length > 0,
  });
}
