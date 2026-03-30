export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getStaffById, getStaffUpcomingShifts, getStaffShiftHistory } from "@/services/staff-service";
import { ROLES } from "@/lib/constants";

interface Props {
  params: Promise<{ staffId: string }>;
}

export default async function StaffDetailPage({ params }: Props) {
  const { staffId } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [person, upcoming, history]: [any, any[], any[]] = await Promise.all([
    getStaffById(staffId),
    getStaffUpcomingShifts(staffId, 5),
    getStaffShiftHistory(staffId, 10),
  ]);

  if (!person) {
    notFound();
  }

  const fullName = `${person.firstName} ${person.lastName}`;
  const roleLabel = ROLES[person.role as keyof typeof ROLES] ?? person.role;

  return (
    <PageContainer className="p-4 space-y-6">
      {/* Back link */}
      <Link
        href="/staff"
        className="inline-flex items-center gap-1 text-sm text-swiis-blue font-medium hover:underline"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Team Directory
      </Link>

      {/* Profile header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
        <Avatar
          name={fullName}
          src={person.avatarUrl ?? undefined}
          size="lg"
          className="mx-auto mb-3"
        />
        <h2 className="text-xl font-bold">{fullName}</h2>
        <Badge
          variant={
            person.role === "MANAGER" || person.role === "ADMIN"
              ? "purple"
              : person.role === "TEAM_LEAD"
              ? "blue"
              : "default"
          }
          className="mt-1"
        >
          {roleLabel}
        </Badge>

        <div className="mt-4 space-y-1 text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">mail</span>
            <span>{person.email}</span>
          </div>
          {person.phone && (
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">phone</span>
              <span>{person.phone}</span>
            </div>
          )}
          {person.escalationOrder && (
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">priority_high</span>
              <span>Escalation #{person.escalationOrder}</span>
            </div>
          )}
        </div>

        {/* Contact buttons */}
        {person.phone && (
          <div className="flex gap-3 mt-5">
            <a
              href={`tel:${person.phone}`}
              className="flex-1 bg-swiis-blue text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-500/20"
            >
              <span className="material-symbols-outlined text-base">call</span>
              Call
            </a>
            <a
              href={`sms:${person.phone}`}
              className="flex-1 bg-swiis-green text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-green-500/20"
            >
              <span className="material-symbols-outlined text-base">sms</span>
              Message
            </a>
          </div>
        )}
      </div>

      {/* Upcoming shifts */}
      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-swiis-blue text-lg">schedule</span>
          Upcoming Shifts ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 text-center text-slate-400">
            <span className="material-symbols-outlined text-2xl mb-1">event_busy</span>
            <p className="text-sm">No upcoming shifts scheduled</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((shift) => {
              const isWeekend = shift.type === "WEEKEND";
              const isPrimary = shift.assignment?.primaryStaffId === staffId;

              return (
                <div
                  key={shift.id}
                  className={isWeekend
                    ? "bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-swiis-orange"
                    : "bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-swiis-blue"
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={isWeekend
                        ? "text-[10px] font-bold text-swiis-orange uppercase tracking-widest"
                        : "text-[10px] font-bold text-swiis-blue uppercase tracking-widest"
                      }>
                        {format(new Date(shift.startTime), "EEE d MMM")} — {isWeekend ? "Weekend" : "Weekday"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {format(new Date(shift.startTime), "h:mma")} — {format(new Date(shift.endTime), "h:mma")}
                      </p>
                    </div>
                    <Badge variant={isPrimary ? "blue" : "green"}>
                      {isPrimary ? "Primary" : "Secondary"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Shift history */}
      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-swiis-purple text-lg">history</span>
          Shift History ({history.length})
        </h3>
        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 text-center text-slate-400">
            <span className="material-symbols-outlined text-2xl mb-1">history</span>
            <p className="text-sm">No shift history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((shift) => {
              const isWeekend = shift.type === "WEEKEND";
              const isPrimary = shift.assignment?.primaryStaffId === staffId;
              const isPast = new Date(shift.endTime) < new Date();

              return (
                <div
                  key={shift.id}
                  className={`bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm ${isPast ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {format(new Date(shift.startTime), "EEE d MMM yyyy")} — {isWeekend ? "Weekend" : "Weekday"}
                      </p>
                      {shift.assignment && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          with {isPrimary
                            ? `${shift.assignment.secondaryStaff.firstName} ${shift.assignment.secondaryStaff.lastName}`
                            : `${shift.assignment.primaryStaff.firstName} ${shift.assignment.primaryStaff.lastName}`
                          }
                        </p>
                      )}
                    </div>
                    <Badge variant={isPrimary ? "blue" : "green"}>
                      {isPrimary ? "Primary" : "Secondary"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
