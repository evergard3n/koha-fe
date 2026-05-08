import axios from "axios";
import { ApiError } from "~/lib/interfaces/common.interface";
import type { ApiSuccess, ApiErrorResponse } from "~/lib/interfaces/common.interface";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
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
  (error) => {
    // Network / non-2xx errors that didn't reach the interceptor above
    if (axios.isAxiosError(error) && error.response) {
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
