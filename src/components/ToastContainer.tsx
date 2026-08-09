import React, { useState, useEffect } from "react";
import { AlertTriangle, X, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastMessage {
  id: string;
  type: "error" | "success" | "info";
  message: string;
  errorCode?: string;
  correlationId?: string;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { type, message, errorCode, correlationId } = customEvent.detail;
        const newToast: ToastMessage = {
          id: `toast-${Date.now()}-${Math.random()}`,
          type: type || "error",
          message: message || "An operation occurred.",
          errorCode,
          correlationId,
        };

        setToasts((prev: ToastMessage[]) => [...prev.slice(-3), newToast]); // Keep up to 4 toasts

        // Auto remove after 6 seconds
        setTimeout(() => {
          setToasts((prev: ToastMessage[]) => prev.filter((t: ToastMessage) => t.id !== newToast.id));
        }, 6000);
      }
    };

    window.addEventListener("app-toast", handleToastEvent);
    return () => window.removeEventListener("app-toast", handleToastEvent);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev: ToastMessage[]) => prev.filter((t: ToastMessage) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-2.5 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start space-x-3 text-xs font-sans ${
              toast.type === "error"
                ? "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/20"
                : toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/20"
                : "bg-zinc-900/90 border-zinc-700 text-zinc-200 shadow-black/40"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-1 pr-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  {toast.type === "error"
                    ? toast.errorCode === "SENTINEL_NO_IMAGERY"
                      ? "Satellite Imagery Exception"
                      : "System Exception"
                    : "Notification"}
                </span>
                {toast.errorCode && (
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] uppercase border border-red-500/30">
                    {toast.errorCode}
                  </span>
                )}
              </div>
              <p className="text-zinc-300 leading-relaxed">{toast.message}</p>

              {toast.correlationId && (
                <div className="text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
                  Trace ID: <span className="text-zinc-200 select-all">{toast.correlationId}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
