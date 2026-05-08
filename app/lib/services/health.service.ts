import apiClient from "~/lib/axios";
import type { HealthData } from "~/lib/interfaces/health.interface";

export async function fetchHealth(): Promise<HealthData> {
  const { data } = await apiClient.get("/health");
  return data as HealthData;
}
