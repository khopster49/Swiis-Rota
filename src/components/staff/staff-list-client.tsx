"use client";

import { useState, useMemo } from "react";
import { StaffCard } from "./staff-card";
import { StaffSearch } from "./staff-search";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export function StaffListClient({ staff }: { staff: StaffMember[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return staff;
    const query = search.toLowerCase();
    return staff.filter(
      (s) =>
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(query)
    );
  }, [staff, search]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
        All Staff ({staff.length})
      </h3>

      <StaffSearch
        value={search}
        onChange={setSearch}
        resultCount={filtered.length}
      />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <span className="material-symbols-outlined text-3xl mb-2">person_search</span>
            <p className="text-sm">No staff matching &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          filtered.map((person) => (
            <StaffCard key={person.id} {...person} />
          ))
        )}
      </div>
    </div>
  );
}
