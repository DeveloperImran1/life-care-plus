import { TableSkeleton } from "@/components/table/TableSkeleton";

export default function DoctorAppointmentsLoading() {
  return <TableSkeleton columns={8} rows={10} />;
}
