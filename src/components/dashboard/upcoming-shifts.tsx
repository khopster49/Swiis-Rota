import { format } from "date-fns";

interface ShiftData {
  id: string;
  type: string;
  startTime: string | Date;
  endTime: string | Date;
  assignment?: {
    primaryStaff: { firstName: string; lastName: string };
    secondaryStaff: { firstName: string; lastName: string };
  } | null;
}

export function UpcomingShifts({ shifts }: { shifts: ShiftData[] }) {
  if (shifts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <span className="material-symbols-outlined text-3xl mb-2">event_busy</span>
        <p className="text-sm">No upcoming shifts scheduled</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Upcoming Shifts
        </h3>
      </div>
      <div className="space-y-3">
        {shifts.map((shift) => {
          const isWeekend = shift.type === "WEEKEND";
          const borderColor = isWeekend ? "border-l-swiis-green" : "border-l-swiis-blue";
          const labelColor = isWeekend ? "text-swiis-green" : "text-swiis-blue";
          const dateStr = format(new Date(shift.startTime), "EEE d MMM");
          const typeLabel = isWeekend ? "Weekend" : "Weekday";

          return (
            <div
              key={shift.id}
              className={`bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 ${borderColor} shadow-sm border border-slate-100 dark:border-slate-700`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest`}>
                  {dateStr} ({typeLabel})
                </span>
              </div>
              {shift.assignment && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">
                      Primary
                    </p>
                    <p className="text-sm font-bold">
                      {shift.assignment.primaryStaff.firstName}{" "}
                      {shift.assignment.primaryStaff.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">
                      Secondary
                    </p>
                    <p className="text-sm font-bold">
                      {shift.assignment.secondaryStaff.firstName}{" "}
                      {shift.assignment.secondaryStaff.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
