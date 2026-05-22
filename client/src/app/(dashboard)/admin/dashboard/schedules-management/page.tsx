import SchedulesFilter from "@/app/(dashboard)/admin/dashboard/schedules-management/_components/SchedulesFilter";
import SchedulesManagementHeader from "@/app/(dashboard)/admin/dashboard/schedules-management/_components/SchedulesManagementHeader";
import SchedulesTable from "@/app/(dashboard)/admin/dashboard/schedules-management/_components/SchedulesTable";
import TablePagination from "@/components/table/TablePagination";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { queryStringFormatter } from "@/lib/helpers/formatters";
import { getSchedules } from "@/app/(dashboard)/admin/dashboard/schedules-management/_services";
import { Suspense } from "react";

const AdminSchedulesManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;

  const queryString = queryStringFormatter(searchParamsObj);
  const schedulesResult = await getSchedules(queryString);

  const totalPages = Math.ceil(
    (schedulesResult?.meta?.total || 1) / (schedulesResult?.meta?.limit || 1),
  );

  return (
    <div className="space-y-6">
      <SchedulesManagementHeader />

      {/* Filters */}
      <SchedulesFilter />

      <Suspense fallback={<TableSkeleton columns={4} rows={10} />}>
        <SchedulesTable schedules={schedulesResult?.data || []} />
        <TablePagination
          currentPage={schedulesResult?.meta?.page || 1}
          totalPages={totalPages || 1}
        />
      </Suspense>
    </div>
  );
};

export default AdminSchedulesManagementPage;
