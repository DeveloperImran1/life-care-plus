import DoctorAppointmentsTable from "@/features/doctor/components/DoctorAppointments/DoctorAppointmentTable";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { getMyAppointments } from "@/features/patient/services/appointment.service";
import { IAppointment } from "@/features/patient/types/appointment.type";
import { Suspense } from "react";

async function AppointmentsContent() {
  const response = await getMyAppointments();
  const appointments: IAppointment[] = response?.data || [];

  return <DoctorAppointmentsTable appointments={appointments} />;
}

export default async function DoctorAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          Manage your patient appointments and prescriptions
        </p>
      </div>

      <Suspense fallback={<TableSkeleton columns={8} rows={10} />}>
        <AppointmentsContent />
      </Suspense>
    </div>
  );
}
