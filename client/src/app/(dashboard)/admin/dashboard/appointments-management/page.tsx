import AppointmentsFilter from "@/app/(dashboard)/admin/dashboard/appointments-management/_components/AppointmentsFilter";

import AppointmentsTable from "@/app/(dashboard)/admin/dashboard/appointments-management/_components/AppointmentsTable";
import ManagementPageHeader from "@/components/common/ManagementPageHeader";
import TablePagination from "@/components/table/TablePagination";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { queryStringFormatter } from "@/lib/helpers/formatters";
import { getAppointments } from "@/app/(dashboard)/admin/dashboard/appointments-management/_services";
import { Suspense } from "react";

const AppointmentsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);
  const response = await getAppointments(queryString);

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Appointments Management"
        description="View and manage all appointments"
      />

      <AppointmentsFilter />

      <Suspense fallback={<TableSkeleton columns={7} />}>
        <AppointmentsTable appointments={response?.data || []} />
      </Suspense>

      <TablePagination
        currentPage={response?.meta?.page || 1}
        totalPages={response?.meta?.totalPage || 1}
      />
    </div>
  );
};

export default AppointmentsManagementPage;
