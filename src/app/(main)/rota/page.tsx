"use client";

import { useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { ThreeMonthView } from "@/components/rota/three-month-view";
import { ShiftFilter } from "@/components/rota/shift-filter";
import { AddShiftSheet } from "@/components/rota/add-shift-sheet";
import { useSWRConfig } from "swr";

function getThreeMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

export default function RotaPage() {
  const [staffFilter, setStaffFilter] = useState<string | null>(null);
  const [shiftTypeFilter, setShiftTypeFilter] = useState<string | null>(null);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const { mutate } = useSWRConfig();

  const handleShiftCreated = useCallback(() => {
    // Revalidate all shift queries
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/shifts"));
  }, [mutate]);

  return (
    <PageContainer className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-swiis-dark-blue dark:text-white">
        On-Call Calendar
      </h1>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsAddShiftOpen(true)}
          className="bg-swiis-orange text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add Shift
        </button>

        <ShiftFilter
          staffFilter={staffFilter}
          shiftTypeFilter={shiftTypeFilter}
          onStaffFilterChange={setStaffFilter}
          onShiftTypeFilterChange={setShiftTypeFilter}
        />
      </div>

      {/* Three month calendar view */}
      <ThreeMonthView
        initialStartMonth={getThreeMonthStart()}
        staffFilter={staffFilter}
        shiftTypeFilter={shiftTypeFilter}
      />

      {/* Add shift bottom sheet */}
      <AddShiftSheet
        isOpen={isAddShiftOpen}
        onClose={() => setIsAddShiftOpen(false)}
        onShiftCreated={handleShiftCreated}
      />
    </PageContainer>
  );
}
