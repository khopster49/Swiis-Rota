import { PageContainer } from "@/components/layout/page-container";

export default function RotaPage() {
  return (
    <PageContainer className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-swiis-dark-blue dark:text-white">
        On-Call Calendar
      </h1>
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-swiis-orange text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add Shift
        </button>
        <button className="bg-swiis-blue text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          Filter
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-100 dark:border-slate-700 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">calendar_month</span>
        <p className="text-slate-400 text-sm">3-month calendar view coming in Phase 4</p>
      </div>
    </PageContainer>
  );
}
