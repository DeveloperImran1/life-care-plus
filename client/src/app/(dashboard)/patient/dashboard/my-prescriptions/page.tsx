import PatientPrescriptionsList from "@/app/(dashboard)/patient/dashboard/my-prescriptions/_components/PatientPrescriptionList";
import { getMyPrescriptions } from "@/app/(dashboard)/patient/dashboard/my-prescriptions/_services";
import { IPrescription } from "@/types/prescription.type";

export default async function MyPrescriptionsPage() {
  const response = await getMyPrescriptions();
  const prescriptions: IPrescription[] = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          View all your medical prescriptions from completed appointments
        </p>
      </div>

      <PatientPrescriptionsList prescriptions={prescriptions} />
    </div>
  );
}
