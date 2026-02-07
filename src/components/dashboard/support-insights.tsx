interface MetricsData {
  responseRate: number;
  carerSatisfaction: number;
  placementStability: number;
}

function MetricCircle({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
      <div className="relative w-12 h-12 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-slate-100 dark:text-slate-700"
            cx="24"
            cy="24"
            r="20"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle
            className={color}
            cx="24"
            cy="24"
            r="20"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-bold">{value}%</span>
      </div>
      <span className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">{label}</span>
    </div>
  );
}

export function SupportInsights({ metrics }: { metrics: MetricsData | null }) {
  if (!metrics) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
        On-Call Support Insights
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <MetricCircle
          value={metrics.responseRate}
          label="Response Rate"
          color="text-swiis-orange"
        />
        <MetricCircle
          value={metrics.carerSatisfaction}
          label="Carer Sat."
          color="text-swiis-blue"
        />
        <MetricCircle
          value={metrics.placementStability}
          label="Stability"
          color="text-swiis-green"
        />
      </div>
    </div>
  );
}
