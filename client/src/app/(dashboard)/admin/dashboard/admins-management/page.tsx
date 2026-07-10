import AdminsFilter from "@/app/(dashboard)/admin/dashboard/admins-management/_components/AdminsFilter";
import AdminsManagementHeader from "@/app/(dashboard)/admin/dashboard/admins-management/_components/AdminsManagementHeader";
import AdminsTable from "@/app/(dashboard)/admin/dashboard/admins-management/_components/AdminsTable";
import TablePagination from "@/components/table/TablePagination";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { queryStringFormatter } from "@/lib/helpers/formatters";
import { Suspense } from "react";
import { getAdmins } from "./_services";

const AdminAdminsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  console.log("search params obj", searchParamsObj);
  const queryString = queryStringFormatter(searchParamsObj);
  console.log("queryString", queryString);

  const adminsResult = await getAdmins(queryString);

  const totalPages = Math.ceil(
    (adminsResult?.meta?.total || 1) / (adminsResult?.meta?.limit || 1),
  );

  return (
    <div className="space-y-6">
      <AdminsManagementHeader />

      {/* Search, Filters */}
      <AdminsFilter />

      <Suspense fallback={<TableSkeleton columns={8} rows={10} />}>
        <AdminsTable admins={adminsResult?.data || []} />
        <TablePagination
          currentPage={adminsResult?.meta?.page || 1}
          totalPages={totalPages || 1}
        />
      </Suspense>
    </div>
  );
};

export default AdminAdminsManagementPage;
