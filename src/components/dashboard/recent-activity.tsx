import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  createdAt: string | Date;
  user: { firstName: string; lastName: string };
}

const actionIcons: Record<string, { icon: string; bgColor: string; textColor: string }> = {
  SWAP_APPROVED: { icon: "swap_calls", bgColor: "bg-swiis-purple-light", textColor: "text-swiis-purple" },
  SWAP_REQUESTED: { icon: "swap_horiz", bgColor: "bg-swiis-blue-light", textColor: "text-swiis-blue" },
  SHIFT_ASSIGNED: { icon: "event_available", bgColor: "bg-swiis-green-light", textColor: "text-swiis-green" },
  HANDOVER_COMPLETED: { icon: "task_alt", bgColor: "bg-swiis-orange-light", textColor: "text-swiis-orange" },
};

const defaultIcon = { icon: "notifications_active", bgColor: "bg-swiis-orange-light", textColor: "text-swiis-orange" };

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <span className="material-symbols-outlined text-3xl mb-2">history</span>
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Recent Activity
        </h3>
        <Link
          href="/activity"
          className="text-xs font-bold text-swiis-blue flex items-center gap-0.5 hover:underline"
        >
          View all
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Link>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => {
          const { icon, bgColor, textColor } =
            actionIcons[activity.action] ?? defaultIcon;

          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700"
            >
              <div className={`${bgColor} p-2 rounded ${textColor}`}>
                <span className="material-symbols-outlined text-base">{icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold">{activity.description}</p>
                <span className="text-[9px] font-medium text-slate-400 mt-1 block">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
