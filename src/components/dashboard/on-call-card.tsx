import { Avatar } from "@/components/ui/avatar";
import { format } from "date-fns";

interface OnCallCardProps {
  shift: {
    type: string;
    startTime: string | Date;
    endTime: string | Date;
    assignment?: {
      primaryStaff: { firstName: string; lastName: string; avatarUrl?: string | null; phone?: string | null };
      secondaryStaff: { firstName: string; lastName: string; avatarUrl?: string | null; phone?: string | null };
    } | null;
  } | null;
}

export function OnCallCard({ shift }: OnCallCardProps) {
  if (!shift || !shift.assignment) {
    return (
      <div className="bg-swiis-orange rounded-xl p-5 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
            Currently On-Call
          </p>
          <h2 className="text-lg font-bold mt-2">No Active Shift</h2>
          <p className="text-sm opacity-80 mt-1">
            No one is currently scheduled for on-call duty.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
      </div>
    );
  }

  const { primaryStaff, secondaryStaff } = shift.assignment;
  const endTime = new Date(shift.endTime);
  const shiftLabel = shift.type === "WEEKEND" ? "Weekend Shift" : "Weekday Shift";
  const timeRange =
    shift.type === "WEEKEND"
      ? "Fri 5:00 PM - Mon 9:00 AM"
      : "5:00 PM - 9:00 AM";

  return (
    <div className="bg-swiis-orange rounded-xl p-5 text-white shadow-lg overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
              Currently On-Call
            </p>
            <h2 className="text-lg font-bold">{shiftLabel}</h2>
            <p className="text-[10px] opacity-80 uppercase font-semibold">
              {timeRange}
            </p>
          </div>
          <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold">
            LIVE
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-4">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={`${primaryStaff.firstName} ${primaryStaff.lastName}`}
                src={primaryStaff.avatarUrl ?? undefined}
                size="sm"
              />
              <div>
                <p className="text-[9px] uppercase font-bold opacity-70">Primary</p>
                <p className="text-sm font-bold">
                  {primaryStaff.firstName} {primaryStaff.lastName}
                </p>
              </div>
            </div>
            {primaryStaff.phone && (
              <a href={`tel:${primaryStaff.phone}`} aria-label="Call primary">
                <span className="material-symbols-outlined text-sm">phone_in_talk</span>
              </a>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={`${secondaryStaff.firstName} ${secondaryStaff.lastName}`}
                src={secondaryStaff.avatarUrl ?? undefined}
                size="sm"
              />
              <div>
                <p className="text-[9px] uppercase font-bold opacity-70">Secondary</p>
                <p className="text-sm font-bold">
                  {secondaryStaff.firstName} {secondaryStaff.lastName}
                </p>
              </div>
            </div>
            {secondaryStaff.phone && (
              <a href={`tel:${secondaryStaff.phone}`} aria-label="Call secondary">
                <span className="material-symbols-outlined text-sm">phone_in_talk</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <a
            href={`tel:${primaryStaff.phone}`}
            className="flex-1 bg-white text-swiis-orange text-xs font-bold py-2.5 px-4 rounded flex items-center justify-center space-x-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-base">call</span>
            <span>EMERGENCY CALL</span>
          </a>
        </div>
      </div>
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
    </div>
  );
}
