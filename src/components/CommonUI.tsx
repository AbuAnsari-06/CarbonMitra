import React from "react";
import { AlertTriangle, RefreshCw, CheckCircle2, Loader2, Inbox, Sparkles } from "lucide-react";
import { motion } from "motion/react";

// ==========================================
// 1. SKELETON PLACEHOLDERS
// ==========================================

export const SkeletonMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="h-3 w-24 bg-zinc-800 rounded"></div>
          <div className="h-7 w-32 bg-zinc-800/90 rounded mt-2"></div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-5 shadow-xl space-y-4 animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-zinc-800 rounded"></div>
              <div className="h-5 w-40 bg-zinc-800/90 rounded"></div>
              <div className="h-3 w-32 bg-zinc-800/60 rounded"></div>
            </div>
            <div className="h-6 w-16 bg-zinc-800 rounded-lg"></div>
          </div>
          <div className="h-20 bg-[#181a20] rounded-xl border border-zinc-800/60"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-20 bg-zinc-800 rounded"></div>
            <div className="h-8 w-24 bg-zinc-800/90 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 2. EMPTY STATE COMPONENT
// ==========================================

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-8 text-center shadow-xl flex flex-col items-center justify-center space-y-4 my-4">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-400 shadow-inner">
        {icon || <Inbox className="w-8 h-8 text-emerald-400" />}
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="font-bold text-base text-zinc-100 font-display">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
          aria-label={actionText}
        >
          <Sparkles className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

// ==========================================
// 3. ERROR STATE WITH RETRY
// ==========================================

interface ErrorStateProps {
  title?: string;
  message: string;
  errorCode?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message,
  errorCode,
  onRetry,
}) => {
  return (
    <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-6 shadow-xl space-y-4 my-4">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-red-200 font-display">{title}</h3>
            {errorCode && (
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] uppercase border border-red-500/30">
                {errorCode}
              </span>
            )}
          </div>
          <p className="text-xs text-red-200/80 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center space-x-1.5"
          aria-label="Retry loading data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. REFETCH / REFRESH INDICATOR BUTTON
// ==========================================

interface RefetchButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  label?: string;
}

export const RefetchButton: React.FC<RefetchButtonProps> = ({
  onRefresh,
  isLoading = false,
  label = "Refresh",
}) => {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isLoading}
      aria-label={label}
      className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#181a20] hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 hover:text-white rounded-xl text-xs font-mono border border-zinc-700/80 transition-all active:scale-95 shrink-0"
    >
      <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
      <span>{isLoading ? "Syncing..." : label}</span>
    </button>
  );
};

// ==========================================
// 5. LAND POLYGON PROCESSING STEP PROGRESS INDICATOR
// ==========================================

export type ProcessingStep = "calculating_area" | "fetching_ndvi" | "computing_score" | "completed";

interface PolygonProcessingStepsProps {
  currentStep: ProcessingStep;
  progressPercent?: number;
}

export const PolygonProcessingSteps: React.FC<PolygonProcessingStepsProps> = ({
  currentStep,
  progressPercent = 33,
}) => {
  const steps: { id: ProcessingStep; label: string; subtext: string }[] = [
    {
      id: "calculating_area",
      label: "Calculating Area",
      subtext: "Deriving Shoelace polygon coordinates (Ha)",
    },
    {
      id: "fetching_ndvi",
      label: "Fetching Sentinel-2 NDVI",
      subtext: "Sentinel Hub Process API satellite pass",
    },
    {
      id: "computing_score",
      label: "Computing Sequestration",
      subtext: "Quantifying CO2e tons & biomass vigor",
    },
  ];

  const getStepStatus = (stepId: ProcessingStep) => {
    if (currentStep === "completed") return "done";
    const stepOrder = ["calculating_area", "fetching_ndvi", "computing_score"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="bg-[#181a20] border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-4 my-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          <span className="font-bold text-xs text-emerald-300 font-display">
            Processing Satellite Analysis...
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Step Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all text-xs flex items-start space-x-2.5 ${
                status === "done"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : status === "active"
                  ? "bg-emerald-900/30 border-emerald-400/80 text-white shadow-lg ring-1 ring-emerald-500/30 animate-pulse"
                  : "bg-[#12141a]/60 border-zinc-800 text-zinc-500"
              }`}
            >
              {status === "done" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : status === "active" ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-zinc-700 bg-zinc-800 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold font-display text-[11px] leading-tight">{step.label}</p>
                <p className="text-[10px] text-zinc-400/80 font-mono mt-0.5 leading-tight">
                  {step.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
