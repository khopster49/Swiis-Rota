import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAllStaff, getEscalationChain } from "@/services/staff-service";
import { ROLES } from "@/lib/constants";

export default async function StaffPage() {
  const [staff, escalation] = await Promise.all([
    getAllStaff(),
    getEscalationChain(),
  ]);

  return (
    <PageContainer className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-swiis-dark-blue dark:text-white">
        Team Directory
      </h1>

      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Escalation Chain
        </h3>
        <div className="space-y-2">
          {escalation.map((person, idx) => (
            <div
              key={person.id}
              className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-swiis-orange text-white flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </div>
              <Avatar
                name={`${person.firstName} ${person.lastName}`}
                size="sm"
              />
              <div className="flex-1">
                <p className="text-sm font-bold">
                  {person.firstName} {person.lastName}
                </p>
                <p className="text-[10px] text-slate-500">
                  {ROLES[person.role as keyof typeof ROLES] ?? person.role}
                </p>
              </div>
              {person.phone && (
                <a
                  href={`tel:${person.phone}`}
                  className="p-2 text-swiis-blue hover:bg-swiis-blue-light rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">call</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          All Staff ({staff.length})
        </h3>
        <div className="space-y-2">
          {staff.map((person) => (
            <div
              key={person.id}
              className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3"
            >
              <Avatar
                name={`${person.firstName} ${person.lastName}`}
                size="sm"
              />
              <div className="flex-1">
                <p className="text-sm font-bold">
                  {person.firstName} {person.lastName}
                </p>
                <p className="text-[10px] text-slate-500">{person.email}</p>
              </div>
              <Badge
                variant={
                  person.role === "MANAGER"
                    ? "purple"
                    : person.role === "TEAM_LEAD"
                    ? "blue"
                    : "default"
                }
              >
                {ROLES[person.role as keyof typeof ROLES] ?? person.role}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
