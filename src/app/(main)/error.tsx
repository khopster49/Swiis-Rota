"use client";

import { PageContainer } from "@/components/layout/page-container";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-swiis-red/10 p-4 rounded-full mb-4">
        <span className="material-symbols-outlined text-4xl text-swiis-red">error</span>
      </div>
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
        Something went wrong
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="bg-swiis-orange text-white px-6 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-orange-500/20"
      >
        Try Again
      </button>
    </PageContainer>
  );
}
