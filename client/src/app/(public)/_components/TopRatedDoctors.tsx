import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDoctors } from "@/app/(dashboard)/admin/dashboard/doctors-management/_services";
import { IDoctor } from "@/app/(dashboard)/admin/dashboard/doctors-management/_types";
import TopRatedDoctorCard from "./TopRatedDoctorCard";

const TopRatedDoctors = async () => {
  const res = await getDoctors("limit=3");
  const doctors: IDoctor[] = res?.data || [];

  return (
    <section className="bg-accent/40 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground">
            Our Top Rated Doctor
          </h2>
          <p className="text-muted-foreground mt-4">
            Access to medical experts from various specialities, ready to
            provide you with top-notch medical services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {doctors.map((doctor) => (
            <TopRatedDoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/doctors">View All Doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopRatedDoctors;
