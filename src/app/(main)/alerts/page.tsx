import { PageContainer } from "@/components/layout/page-container";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, { icon: string; bgColor: string; textColor: string }> = {
  SWAP_REQUEST: { icon: "swap_calls", bgColor: "bg-swiis-purple-light", textColor: "text-swiis-purple" },
  SHIFT_REMINDER: { icon: "schedule", bgColor: "bg-swiis-blue-light", textColor: "text-swiis-blue" },
  HANDOVER: { icon: "assignment_turned_in", bgColor: "bg-swiis-green-light", textColor: "text-swiis-green" },
  ESCALATION: { icon: "priority_high", bgColor: "bg-swiis-red-light", textColor: "text-swiis-red" },
  GENERAL: { icon: "notifications_active", bgColor: "bg-swiis-orange-light", textColor: "text-swiis-orange" },
};

const defaultTypeIcon = { icon: "notifications", bgColor: "bg-slate-100", textColor: "text-slate-500" };

export default async function AlertsPage() {
  // For now, show all notifications (will be filtered by user after auth is added)
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageContainer className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-swiis-dark-blue dark:text-white">
          Alerts
        </h1>
        {notifications.some((n) => !n.isRead) && (
          <button className="text-xs font-bold text-swiis-blue">Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const { icon, bgColor, textColor } =
              typeIcons[notification.type] ?? defaultTypeIcon;

            return (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 ${
                  !notification.isRead ? "border-l-4 border-l-swiis-orange" : ""
                }`}
              >
                <div className={`${bgColor} p-2 rounded ${textColor} shrink-0`}>
                  <span className="material-symbols-outlined text-base">{icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">{notification.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {notification.body}
                  </p>
                  <span className="text-[9px] font-medium text-slate-400 mt-1 block">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-swiis-orange shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
