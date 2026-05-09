import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { clearAuthSession, getAccessToken, setAuthSession } from "~/lib/auth-session";
import { ApiError } from "~/lib/interfaces/common.interface";
import type { ApiSuccess, ApiErrorResponse } from "~/lib/interfaces/common.interface";
import type { AuthSessionData } from "~/lib/interfaces/auth.interface";

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

let refreshPromise: Promise<string> | null = null;

async function performTokenRefresh(): Promise<string> {
  const response = await axios.post<ApiSuccess<AuthSessionData> | ApiErrorResponse>(
    `${baseURL}/auth/refresh`,
    undefined,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const body = response.data;
  if (body.success === false) {
    throw new ApiError(body.error.statusCode, body.error.message);
  }

  setAuthSession(body.data.accessToken, body.data.user);
  return body.data.accessToken;
}

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiSuccess<unknown> | ApiErrorResponse;

    if (body.success === false) {
      throw new ApiError(body.error.statusCode, body.error.message);
    }

    // Unwrap the envelope so callers receive `data` directly
    response.data = body.data;
    return response;
  },
  async (error) => {
    // Network / non-2xx errors that didn't reach the interceptor above
    if (axios.isAxiosError(error) && error.response) {
      const originalRequest = error.config as RetryAxiosRequestConfig | undefined;
      const requestUrl = originalRequest?.url ?? "";
      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/signup") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/logout");

      if (
        error.response.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.skipAuthRefresh &&
        !isAuthRequest
      ) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = performTokenRefresh().finally(() => {
              refreshPromise = null;
            });
          }

          const newAccessToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          clearAuthSession();
          throw refreshError;
        }
      }

      const body = error.response.data as ApiErrorResponse;
      if (body?.error) {
        throw new ApiError(body.error.statusCode, body.error.message);
      }
      throw new ApiError(error.response.status, error.message);
    }
    throw error;
  }
);

export default apiClient;
