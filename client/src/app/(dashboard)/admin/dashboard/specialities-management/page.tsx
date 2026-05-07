import RefreshButton from "@/components/shared/RefreshButton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { getSpecialities } from "@/app/(dashboard)/admin/dashboard/specialities-management/_services";
import { Suspense } from "react";
import SpecialitiesManagementHeader from "./_components/SpecialitiesManagementHeader";
import SpecialitiesTable from "./_components/SpecialitiesTable";

const AdminSpecialitiesManagementPage = async () => {
  const result = await getSpecialities();
  return (
    <div className="space-y-6">
      <SpecialitiesManagementHeader />
      <div className="flex">
        <RefreshButton />
      </div>
      <Suspense fallback={<TableSkeleton columns={2} rows={10} />}>
        <SpecialitiesTable specialities={result.data} />
      </Suspense>
    </div>
  );
};

export default AdminSpecialitiesManagementPage;
