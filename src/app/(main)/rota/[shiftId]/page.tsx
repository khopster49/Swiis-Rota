"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { format } from "date-fns";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ROLES } from "@/lib/constants";
import { SwapRequestForm } from "@/components/swap/swap-request-form";
import { SwapRequestCard } from "@/components/swap/swap-request-card";
import { HandoverForm } from "@/components/handover/handover-form";
import { HandoverCard } from "@/components/handover/handover-card";

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.data);

// Demo user — in production this would come from auth
const DEMO_USER_ID = "demo-user-1";
const DEMO_USER_ROLE = "MANAGER";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

interface ShiftDetail {
  id: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  assignment?: {
    id: string;
    primaryStaffId: string;
    secondaryStaffId: string;
    primaryStaff: StaffMember;
    secondaryStaff: StaffMember;
  } | null;
  swapRequests: Array<{
    id: string;
    status: string;
    reason?: string | null;
    createdAt: string;
    requesterId: string;
    targetStaffId: string;
    requester: StaffMember;
    targetStaff: StaffMember;
  }>;
  handovers: Array<{
    id: string;
    notes: string;
    openItems?: string | null;
    completedAt?: string | null;
    createdAt: string;
    fromUserId: string;
    toUserId: string;
    fromUser: StaffMember;
    toUser: StaffMember;
  }>;
}

export default function ShiftDetailPage() {
  const params = useParams<{ shiftId: string }>();
  const router = useRouter();
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [showHandoverForm, setShowHandoverForm] = useState(false);

  const { data: shift, isLoading } = useSWR<ShiftDetail>(
    `/api/shifts/${params.shiftId}`,
    fetcher
  );

  const { data: allStaff = [] } = useSWR<StaffMember[]>(
    showSwapForm ? "/api/staff" : null,
    fetcher
  );

  const refreshShift = useCallback(() => {
    mutate(`/api/shifts/${params.shiftId}`);
  }, [params.shiftId]);

  const handleSwapSubmit = useCallback(
    async (data: { shiftId: string; requesterId: string; targetStaffId: string; reason?: string }) => {
      await fetch("/api/swap-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setShowSwapForm(false);
      refreshShift();
    },
    [refreshShift]
  );

  const handleSwapAction = useCallback(
    async (requestId: string, action: "APPROVE" | "REJECT" | "CANCEL") => {
      await fetch(`/api/swap-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewerId: DEMO_USER_ID }),
      });
      refreshShift();
    },
    [refreshShift]
  );

  const handleHandoverSubmit = useCallback(
    async (data: { shiftId: string; fromUserId: string; toUserId: string; notes: string; openItems?: string }) => {
      await fetch("/api/handovers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setShowHandoverForm(false);
      refreshShift();
    },
    [refreshShift]
  );

  const handleHandoverComplete = useCallback(
    async (handoverId: string) => {
      await fetch(`/api/handovers/${handoverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPLETE", userId: DEMO_USER_ID }),
      });
      refreshShift();
    },
    [refreshShift]
  );

  if (isLoading) {
    return (
      <PageContainer className="p-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-swiis-orange border-t-transparent rounded-full" />
        </div>
      </PageContainer>
    );
  }

  if (!shift) {
    return (
      <PageContainer className="p-4 text-center py-12">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
        <p className="text-slate-500">Shift not found</p>
        <Link href="/rota" className="text-swiis-blue text-sm mt-2 inline-block hover:underline">
          Back to Rota
        </Link>
      </PageContainer>
    );
  }

  const isWeekend = shift.type === "WEEKEND";
  const canReview = DEMO_USER_ROLE === "MANAGER" || DEMO_USER_ROLE === "ADMIN";
  const isAssigned =
    shift.assignment?.primaryStaffId === DEMO_USER_ID ||
    shift.assignment?.secondaryStaffId === DEMO_USER_ID;
  const hasPendingSwap = shift.swapRequests.some((s) => s.status === "PENDING");

  return (
    <PageContainer className="p-4 space-y-6">
      {/* Back link */}
      <Link
        href="/rota"
        className="inline-flex items-center gap-1 text-sm text-swiis-blue font-medium hover:underline"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Rota
      </Link>

      {/* Shift header */}
      <div className={isWeekend
        ? "bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-swiis-orange"
        : "bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-swiis-blue"
      }>
        <div className="flex items-center justify-between mb-3">
          <Badge variant={isWeekend ? "orange" : "blue"}>
            {isWeekend ? "Weekend" : "Weekday Overnight"}
          </Badge>
          {hasPendingSwap && (
            <Badge variant="orange">Swap Pending</Badge>
          )}
        </div>

        <h2 className="text-lg font-bold">
          {format(new Date(shift.startTime), "EEEE d MMMM yyyy")}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {format(new Date(shift.startTime), "h:mma")} — {format(new Date(shift.endTime), "h:mma")}
        </p>

        {shift.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg mt-3">
            {shift.notes}
          </p>
        )}
      </div>

      {/* Assigned staff */}
      {shift.assignment && (
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className={isWeekend ? "material-symbols-outlined text-swiis-orange text-lg" : "material-symbols-outlined text-swiis-blue text-lg"}>
              group
            </span>
            Assigned Staff
          </h3>

          <div className="space-y-2">
            {/* Primary */}
            <div className={isWeekend
              ? "bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-swiis-orange"
              : "bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-swiis-blue"
            }>
              <div className="flex items-center gap-3">
                <Avatar
                  name={`${shift.assignment.primaryStaff.firstName} ${shift.assignment.primaryStaff.lastName}`}
                  src={shift.assignment.primaryStaff.avatarUrl ?? undefined}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {shift.assignment.primaryStaff.firstName} {shift.assignment.primaryStaff.lastName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Primary — {ROLES[shift.assignment.primaryStaff.role as keyof typeof ROLES] ?? shift.assignment.primaryStaff.role}
                  </p>
                </div>
                {shift.assignment.primaryStaff.phone && (
                  <a
                    href={`tel:${shift.assignment.primaryStaff.phone}`}
                    className={isWeekend
                      ? "p-2 rounded-full hover:bg-swiis-orange/10 transition-colors"
                      : "p-2 rounded-full hover:bg-swiis-blue/10 transition-colors"
                    }
                  >
                    <span className={isWeekend
                      ? "material-symbols-outlined text-lg text-swiis-orange"
                      : "material-symbols-outlined text-lg text-swiis-blue"
                    }>call</span>
                  </a>
                )}
              </div>
            </div>

            {/* Secondary */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-swiis-green">
              <div className="flex items-center gap-3">
                <Avatar
                  name={`${shift.assignment.secondaryStaff.firstName} ${shift.assignment.secondaryStaff.lastName}`}
                  src={shift.assignment.secondaryStaff.avatarUrl ?? undefined}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {shift.assignment.secondaryStaff.firstName} {shift.assignment.secondaryStaff.lastName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Secondary — {ROLES[shift.assignment.secondaryStaff.role as keyof typeof ROLES] ?? shift.assignment.secondaryStaff.role}
                  </p>
                </div>
                {shift.assignment.secondaryStaff.phone && (
                  <a
                    href={`tel:${shift.assignment.secondaryStaff.phone}`}
                    className="p-2 rounded-full hover:bg-swiis-green/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-swiis-green">call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => { setShowSwapForm(true); setShowHandoverForm(false); }}
          disabled={showSwapForm}
          className="flex-1 bg-swiis-blue text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">swap_horiz</span>
          Request Swap
        </button>
        <button
          onClick={() => { setShowHandoverForm(true); setShowSwapForm(false); }}
          disabled={showHandoverForm || !shift.assignment}
          className="flex-1 bg-swiis-purple text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-purple-500/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">assignment_turned_in</span>
          Handover
        </button>
      </div>

      {/* Swap Request Form */}
      {showSwapForm && (
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-swiis-blue text-lg">swap_horiz</span>
            New Swap Request
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
            <SwapRequestForm
              shift={shift}
              currentUserId={DEMO_USER_ID}
              availableStaff={allStaff}
              onSubmit={handleSwapSubmit}
              onCancel={() => setShowSwapForm(false)}
            />
          </div>
        </section>
      )}

      {/* Handover Form */}
      {showHandoverForm && shift.assignment && (
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-swiis-purple text-lg">assignment_turned_in</span>
            New Handover
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
            <HandoverForm
              shift={shift}
              fromUser={shift.assignment.primaryStaff}
              toUser={shift.assignment.secondaryStaff}
              onSubmit={handleHandoverSubmit}
              onCancel={() => setShowHandoverForm(false)}
            />
          </div>
        </section>
      )}

      {/* Swap Requests section */}
      {shift.swapRequests.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-swiis-blue text-lg">swap_horiz</span>
            Swap Requests ({shift.swapRequests.length})
          </h3>
          <div className="space-y-2">
            {shift.swapRequests.map((swap) => (
              <SwapRequestCard
                key={swap.id}
                id={swap.id}
                status={swap.status}
                reason={swap.reason}
                createdAt={swap.createdAt}
                requester={swap.requester}
                targetStaff={swap.targetStaff}
                shift={shift}
                currentUserId={DEMO_USER_ID}
                canReview={canReview}
                onApprove={(id) => handleSwapAction(id, "APPROVE")}
                onReject={(id) => handleSwapAction(id, "REJECT")}
                onCancel={(id) => handleSwapAction(id, "CANCEL")}
              />
            ))}
          </div>
        </section>
      )}

      {/* Handovers section */}
      {shift.handovers.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-swiis-purple text-lg">assignment_turned_in</span>
            Handovers ({shift.handovers.length})
          </h3>
          <div className="space-y-2">
            {shift.handovers.map((handover) => (
              <HandoverCard
                key={handover.id}
                id={handover.id}
                notes={handover.notes}
                openItems={handover.openItems}
                completedAt={handover.completedAt}
                createdAt={handover.createdAt}
                fromUser={handover.fromUser}
                toUser={handover.toUser}
                currentUserId={DEMO_USER_ID}
                onComplete={handleHandoverComplete}
              />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
