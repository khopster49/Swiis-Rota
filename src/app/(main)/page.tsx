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
        <OnCallCard shift={currentShift} />
      </section>

      <section>
        <ScheduleDefinition />
      </section>

      <section>
        <QuickActions />
      </section>

      <section>
        <UpcomingShifts shifts={upcomingShifts} />
      </section>

      <section>
        <SupportInsights metrics={metrics} />
      </section>

      <section>
        <RecentActivity activities={activities} />
      </section>
    </PageContainer>
  );
}
