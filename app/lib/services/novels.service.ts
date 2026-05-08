import apiClient from "~/lib/axios";
import type {
  GetNovelsParams,
  SearchNovelsParams,
  GetNovelParams,
  GetChapterParams,
  NovelsListData,
  NovelDetailData,
  ChapterData,
  NovelStatusData,
} from "~/lib/interfaces/novels.interface";

export async function fetchNovels(params: GetNovelsParams = {}): Promise<NovelsListData> {
  const { data } = await apiClient.get("/novels", { params });
  return data as NovelsListData;
}

export async function searchNovels(params: SearchNovelsParams): Promise<NovelsListData> {
  const { data } = await apiClient.get("/novels/search", { params });
  return data as NovelsListData;
}

export async function fetchNovelStatus(): Promise<NovelStatusData> {
  const { data } = await apiClient.get("/novels/status");
  return data as NovelStatusData;
}

export async function fetchNovel({ id }: GetNovelParams): Promise<NovelDetailData> {
  const { data } = await apiClient.get(`/novels/${id}`);
  return data as NovelDetailData;
}

export async function fetchChapter({ id, hash }: GetChapterParams): Promise<ChapterData> {
  const { data } = await apiClient.get(`/novels/${id}/${hash}`);
  return data as ChapterData;
}
