import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/constants";

interface StaffCardProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

function getRoleBadgeVariant(role: string): "purple" | "blue" | "default" {
  if (role === "MANAGER" || role === "ADMIN") return "purple";
  if (role === "TEAM_LEAD") return "blue";
  return "default";
}

export function StaffCard({
  id,
  firstName,
  lastName,
  email,
  role,
  phone,
  avatarUrl,
}: StaffCardProps) {
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href={`/staff/${id}`}>
          <Avatar
            name={fullName}
            src={avatarUrl ?? undefined}
            size="sm"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/staff/${id}`} className="hover:underline">
            <p className="text-sm font-bold truncate">{fullName}</p>
          </Link>
          <p className="text-[10px] text-slate-500 truncate">{email}</p>
        </div>
        <Badge variant={getRoleBadgeVariant(role)}>
          {ROLES[role as keyof typeof ROLES] ?? role}
        </Badge>
      </div>

      {/* Contact actions */}
      {phone && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700">
          <a
            href={`tel:${phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-swiis-blue bg-swiis-blue-light dark:bg-swiis-blue/10 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">call</span>
            Call
          </a>
          <a
            href={`sms:${phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-swiis-green bg-swiis-green-light dark:bg-swiis-green/10 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">sms</span>
            Message
          </a>
          <Link
            href={`/staff/${id}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">person</span>
            Profile
          </Link>
        </div>
      )}
    </div>
  );
}
