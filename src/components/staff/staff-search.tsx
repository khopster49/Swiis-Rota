"use client";

interface StaffSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function StaffSearch({ value, onChange, resultCount }: StaffSearchProps) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search staff by name or email..."
        className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400"
      />
      {value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
          {resultCount} found
        </span>
      )}
    </div>
  );
}
