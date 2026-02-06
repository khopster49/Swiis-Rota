import Link from "next/link";

const actions = [
  { href: "/rota", icon: "event_note", label: "3-Month Rota", color: "bg-swiis-blue" },
  { href: "/rota?action=swap", icon: "swap_calls", label: "Request Swap", color: "bg-swiis-green" },
  { href: "/staff", icon: "people_alt", label: "Team Directory", color: "bg-swiis-purple" },
  { href: "/staff?tab=escalation", icon: "priority_high", label: "Escalation List", color: "bg-swiis-red" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow-sm active:scale-95 transition-transform`}
        >
          <span className="material-symbols-outlined mb-2">{action.icon}</span>
          <span className="text-xs font-bold uppercase">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
