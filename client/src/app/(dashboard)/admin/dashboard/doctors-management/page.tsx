import TablePagination from "@/components/table/TablePagination";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { queryStringFormatter } from "@/lib/helpers/formatters";
import { getDoctors } from "@/app/(dashboard)/admin/dashboard/doctors-management/_services";
import { getSpecialities } from "@/app/(dashboard)/admin/dashboard/specialities-management/_services";
import { Suspense } from "react";
import DoctorsManagementHeader from "./_components/DoctorsManagementHeader";
import DoctorFilters from "./_components/DoctorFilters";
import DoctorsTable from "./_components/DoctorsTable";

const AdminDoctorsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj); // {searchTerm: "John", speciality: "Cardiology" => "?searchTerm=John&speciality=Cardiology"}
  const specialitiesResult = await getSpecialities();
  const doctorsResult = await getDoctors(queryString);
  const totalPages = Math.ceil(
    (doctorsResult?.meta?.total || 1) / (doctorsResult?.meta?.limit || 1),
  );
  return (
    <div className="space-y-6">
      <DoctorsManagementHeader specialities={specialitiesResult?.data || []} />
      <DoctorFilters specialties={specialitiesResult?.data || []} />
      <Suspense fallback={<TableSkeleton columns={10} rows={10} />}>
        <DoctorsTable
          doctors={doctorsResult.data}
          specialities={specialitiesResult?.data || []}
        />
        <TablePagination
          currentPage={doctorsResult?.meta?.page || 1}
          totalPages={totalPages || 1}
        />
      </Suspense>
    </div>
  );
};

export default AdminDoctorsManagementPage;
