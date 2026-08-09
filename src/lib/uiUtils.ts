/**
 * UI Utilities & Toast Dispatch Helper for CarbonMitra React Frontend
 */

export function triggerToast(
  type: "success" | "error" | "info",
  message: string,
  errorCode?: string,
  correlationId?: string
) {
  window.dispatchEvent(
    new CustomEvent("app-toast", {
      detail: {
        type,
        message,
        errorCode,
        correlationId,
      },
    })
  );
}
