"use client";
import { useState } from "react";
import { Calendar, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { IDoctor } from "@/app/(dashboard)/admin/dashboard/doctors-management/_types";
import BookAppointmentDialog from "@/app/(public)/doctors/_components/BookAppointmentDialog";

export default function TopRatedDoctorCard({ doctor }: { doctor: IDoctor }) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const primarySpecialty =
    doctor.doctorSpecialties?.[0]?.specialities?.title || "Specialist";

  const profileImage =
    typeof doctor.profilePhoto === "string"
      ? doctor.profilePhoto
      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const reviewsCount = (doctor as any).review?.length || 0;

  return (
    <Card className="text-center overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-accent/50 items-center p-6">
        <Image
          src={profileImage}
          alt={doctor.name}
          width={96}
          height={96}
          unoptimized
          priority={true}
          className="rounded-full border-4 border-white shadow-md object-cover w-24 h-24"
        />
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-lg">{doctor.name}</CardTitle>
        <p className="text-primary font-medium mt-1">{primarySpecialty}</p>
        <div className="flex items-center justify-center my-3 text-sm">
          <Star className="text-yellow-400 fill-current" size={16} />
          <span className="ml-2 text-foreground font-semibold">
            {doctor.averageRating
              ? Number(doctor.averageRating).toFixed(1)
              : "0.0"}
          </span>
          <span className="ml-2 text-muted-foreground">
            ({reviewsCount} reviews)
          </span>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-0">
        <Button variant="outline" asChild>
          <Link href={`/doctors/doctor/${doctor.id}`}>View Profile</Link>
        </Button>
        <Button
          onClick={() => setShowScheduleModal(true)}
          className="flex-1 h-9 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm"
        >
          <Calendar className="w-[18px] h-[18px] mr-2" />
          Book
        </Button>
      </CardFooter>
      <BookAppointmentDialog
        doctor={doctor}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </Card>
  );
}
