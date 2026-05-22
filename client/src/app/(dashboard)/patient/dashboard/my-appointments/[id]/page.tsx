import { getAppointmentById } from "@/app/(dashboard)/patient/dashboard/my-appointments/_services";
import { IAppointment } from "@/app/(dashboard)/patient/dashboard/my-appointments/_types";
import { notFound } from "next/navigation";
import AppointmentDetails from "../_components/AppointmentDetails";

interface AppointmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  const { id } = await params;

  const response = await getAppointmentById(id);

  if (!response?.success || !response?.data) {
    notFound();
  }

  const appointment: IAppointment = response.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentDetails appointment={appointment} />
    </div>
  );
}
