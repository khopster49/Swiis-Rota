import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
  return (
    <PageContainer className="p-4 space-y-6">
      <Skeleton className="h-8 w-48" />
      {/* Escalation chain skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
      {/* Search bar skeleton */}
      <Skeleton className="h-10 rounded-xl" />
      {/* Staff cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </PageContainer>
  );
}
