/**
 * Standard API Response envelope interface.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  errorCode?: string;
  correlationId?: string;
  [key: string]: any;
}

/**
 * Custom Frontend API Error carrying structured backend response metadata.
 */
export class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly errorCode?: string;
  public readonly correlationId?: string;

  constructor(message: string, statusCode?: number, errorCode?: string, correlationId?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode || "API_ERROR";
    this.correlationId = correlationId;
  }
}

/**
 * Global API Fetch Wrapper with automatic error handling, structured parsing,
 * and user-friendly toast notifications.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string> || {}),
      },
    };

    const response = await fetch(endpoint, config);
    let data: any = {};

    try {
      data = await response.json();
    } catch (e) {
      // Non-JSON response
    }

    if (!response.ok || data.success === false) {
      const errorMessage =
        data.error ||
        data.message ||
        `HTTP ${response.status}: Request failed`;
      const errorCode = data.errorCode || (response.status === 422 ? "SENTINEL_NO_IMAGERY" : "REQUEST_FAILED");
      const correlationId = data.correlationId || response.headers.get("x-correlation-id") || undefined;

      const apiErr = new ApiError(errorMessage, response.status, errorCode, correlationId);
      
      // Notify user via toast
      notifyApiError(apiErr);
      throw apiErr;
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network error or unhandled JS exception
    const genericError = new ApiError(
      err.message || "Network error. Please check your internet connection.",
      500,
      "NETWORK_ERROR"
    );

    notifyApiError(genericError);
    throw genericError;
  }
}

/**
 * Display toast notifications for unhandled API errors.
 */
function notifyApiError(err: ApiError) {
  let displayMsg = err.message;
  if (err.errorCode === "SENTINEL_NO_IMAGERY") {
    displayMsg = `🛰️ Satellite Error: ${err.message}`;
  }

  // Fallback to custom DOM notification if react-hot-toast isn't mounted
  if (typeof window !== "undefined") {
    const toastEvent = new CustomEvent("app-toast", {
      detail: {
        type: "error",
        message: displayMsg,
        errorCode: err.errorCode,
        correlationId: err.correlationId,
      },
    });
    window.dispatchEvent(toastEvent);
  }
}
