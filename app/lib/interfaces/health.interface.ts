export interface MemoryInfo {
  rss: number;
  heapUsed: number;
  heapTotal: number;
}

export interface HealthData {
  status: "starting" | "scanning" | "ready";
  cachedNovels: number;
  lastIndexed: string | null;
  isScanning: boolean;
  uptime: number;
  memory: MemoryInfo;
  nodeVersion: string;
}
