import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ROLES } from "@/lib/constants";

interface EscalationPerson {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export function EscalationList({ chain }: { chain: EscalationPerson[] }) {
  if (chain.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <span className="material-symbols-outlined text-3xl mb-2">link_off</span>
        <p className="text-sm">No escalation chain configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {chain.map((person, idx) => {
        const isLast = idx === chain.length - 1;
        const fullName = `${person.firstName} ${person.lastName}`;

        return (
          <div key={person.id} className="flex gap-3">
            {/* Vertical line + numbered badge */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-swiis-orange text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                {idx + 1}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-swiis-orange/20 min-h-[16px]" />
              )}
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex-1 mb-2">
              <div className="flex items-center gap-3">
                <Link href={`/staff/${person.id}`}>
                  <Avatar
                    name={fullName}
                    src={person.avatarUrl ?? undefined}
                    size="sm"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/staff/${person.id}`} className="hover:underline">
                    <p className="text-sm font-bold truncate">{fullName}</p>
                  </Link>
                  <p className="text-[10px] text-slate-500">
                    {ROLES[person.role as keyof typeof ROLES] ?? person.role}
                  </p>
                </div>

                {/* Quick contact buttons */}
                <div className="flex gap-1">
                  {person.phone && (
                    <>
                      <a
                        href={`tel:${person.phone}`}
                        className="p-2 text-swiis-blue hover:bg-swiis-blue-light dark:hover:bg-swiis-blue/10 rounded-full transition-colors"
                        aria-label={`Call ${fullName}`}
                      >
                        <span className="material-symbols-outlined text-lg">call</span>
                      </a>
                      <a
                        href={`sms:${person.phone}`}
                        className="p-2 text-swiis-green hover:bg-swiis-green-light dark:hover:bg-swiis-green/10 rounded-full transition-colors"
                        aria-label={`Message ${fullName}`}
                      >
                        <span className="material-symbols-outlined text-lg">sms</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
