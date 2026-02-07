export function ScheduleDefinition() {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Schedule Definition
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center">
          <div className="w-10 h-10 rounded bg-swiis-blue-light dark:bg-swiis-blue/20 flex items-center justify-center text-swiis-blue mr-4">
            <span className="material-symbols-outlined">calendar_view_week</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Weekdays
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mon - Fri: 5pm - 9am</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center">
          <div className="w-10 h-10 rounded bg-swiis-green-light dark:bg-swiis-green/20 flex items-center justify-center text-swiis-green mr-4">
            <span className="material-symbols-outlined">weekend</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Weekends
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fri 5pm - Mon 9am</p>
          </div>
        </div>
      </div>
    </div>
  );
}
