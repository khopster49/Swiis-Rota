import { getAllStaff, getEscalationChain } from "@/services/staff-service";
import { PageContainer } from "@/components/layout/page-container";
import { EscalationList } from "@/components/staff/escalation-list";
import { StaffListClient } from "@/components/staff/staff-list-client";

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

      {/* Escalation Chain */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-swiis-red text-lg">priority_high</span>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Escalation Chain
          </h3>
        </div>
        <EscalationList chain={escalation} />
      </section>

      {/* All Staff with search */}
      <section>
        <StaffListClient staff={staff} />
      </section>
    </PageContainer>
  );
}
