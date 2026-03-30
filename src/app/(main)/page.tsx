export const dynamic = "force-dynamic";

import { PageContainer } from "@/components/layout/page-container";
import { OnCallCard } from "@/components/dashboard/on-call-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ScheduleDefinition } from "@/components/dashboard/schedule-definition";
import { UpcomingShifts } from "@/components/dashboard/upcoming-shifts";
import { SupportInsights } from "@/components/dashboard/support-insights";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { getCurrentOnCallShift, getUpcomingShifts } from "@/services/shift-service";
import { getRecentActivity, getMetrics } from "@/services/activity-service";

export default async function DashboardPage() {
  const [currentShift, upcomingShifts, activities, metrics] = await Promise.all([
    getCurrentOnCallShift(),
    getUpcomingShifts(3),
    getRecentActivity(5),
    getMetrics(),
  ]);

  return (
    <PageContainer className="space-y-6 p-4">
      <section>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <OnCallCard shift={currentShift as any} />
      </section>

      <section>
        <ScheduleDefinition />
      </section>

      <section>
        <QuickActions />
      </section>

      <section>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <UpcomingShifts shifts={upcomingShifts as any} />
      </section>

      <section>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SupportInsights metrics={metrics as any} />
      </section>

      <section>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <RecentActivity activities={activities as any} />
      </section>
    </PageContainer>
  );
}
