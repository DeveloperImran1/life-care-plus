import AppointmentConfirmation from "@/features/patient/components/PatientAppointment/AppointmentConfirmation";
import { getDoctorById } from "@/app/(dashboard)/admin/dashboard/doctors-management/_service";
import { getScheduleById } from "@/app/(dashboard)/admin/dashboard/schedules-management/_services";
import { IDoctor } from "@/features/doctor/types/doctor.type";
import { ISchedule } from "@/features/doctor/types/schedule.type";
import { notFound } from "next/navigation";

interface BookAppointmentPageProps {
  params: Promise<{
    doctorId: string;
    scheduleId: string;
  }>;
}

export default async function BookAppointmentPage({
  params,
}: BookAppointmentPageProps) {
  const { doctorId, scheduleId } = await params;

  // Fetch doctor and schedule in parallel
  const [doctorResponse, scheduleResponse] = await Promise.all([
    getDoctorById(doctorId),
    getScheduleById(scheduleId),
  ]);

  if (!doctorResponse?.success || !scheduleResponse?.success) {
    notFound();
  }

  const doctor: IDoctor = doctorResponse.data;
  const schedule: ISchedule = scheduleResponse.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentConfirmation doctor={doctor} schedule={schedule} />
    </div>
  );
}
