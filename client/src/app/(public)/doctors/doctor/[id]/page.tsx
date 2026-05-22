import DoctorProfileContent from "@/app/(public)/doctors/_components/DoctorDetails/DoctorProfileContent";
import DoctorReviews from "@/app/(public)/doctors/_components/DoctorDetails/DoctorReviews";
import { getDoctorById } from "@/app/(dashboard)/admin/dashboard/doctors-management/_services";

export const revalidate = 600;

const DoctorDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const result = await getDoctorById(id);
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <DoctorProfileContent doctor={result.data} />
      <DoctorReviews doctorId={id} />
    </div>
  );
};

export default DoctorDetailPage;
