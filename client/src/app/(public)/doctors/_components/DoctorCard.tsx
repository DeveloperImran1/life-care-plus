"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/helpers/formatters";
import {
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Star,
  Check,
  Bookmark,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BookAppointmentDialog from "./BookAppointmentDialog";
import { IDoctor } from "@/app/(dashboard)/admin/dashboard/doctors-management/_types";

interface DoctorCardProps {
  doctor: IDoctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <>
      <Card className="rounded-2xl gap-0 py-0 border border-gray-100 hover:shadow-lg  overflow-hidden transition-all duration-300 bg-white">
        {/* Header */}
        <div className="p-5 flex items-start gap-4 relative">
          {/* Bookmark Icon */}
          <button className="absolute top-5 right-5 w-8 h-8 rounded-md bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer">
            <Bookmark className="w-4 h-4" strokeWidth={2} />
          </button>

          <div className="relative shrink-0">
            <Avatar className="h-[72px] w-[72px] border border-gray-50 shadow-sm">
              <AvatarImage src={doctor.profilePhoto || ""} alt={doctor.name} />
              <AvatarFallback className="text-xl bg-slate-50 text-slate-600 font-semibold">
                {getInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>
            {/* Verified Badge */}
            <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-[#0f766e] rounded-full border-2 border-white flex items-center justify-center shadow-sm z-10 translate-x-1 -translate-y-1">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1 pr-10">
            <h3 className="text-[17px] font-bold text-gray-900 line-clamp-1 mb-0.5">
              {doctor.name}
            </h3>
            <p className="text-[13px] text-[#0f766e] font-medium mb-2.5 line-clamp-1">
              {doctor.designation}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Star className="h-[15px] w-[15px] fill-amber-400 text-amber-400" />
                <span className="text-[13px] font-bold text-gray-900 mt-0.5">
                  {doctor.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>

              {doctor.doctorSpecialties &&
                doctor.doctorSpecialties.length > 0 && (
                  <span className="bg-emerald-50 text-[#0f766e] px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide">
                    {doctor.doctorSpecialties[0].specialities?.title}
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 py-4 border-b border-t border-gray-100">
          {/* Experience */}
          <div className="flex items-center justify-center px-2">
            <div className="flex items-center gap-1.5">
              <Clock
                className="w-4 h-4 text-slate-500 shrink-0"
                strokeWidth={1.5}
              />
              <span className="text-[12px] sm:text-[13px] font-medium text-slate-700 truncate">
                {doctor.experience} years exp
              </span>
            </div>
          </div>
          {/* Hospital */}
          <div className="flex items-center justify-center px-2">
            <div className="flex items-center gap-1.5">
              <MapPin
                className="w-4 h-4 text-slate-500 shrink-0"
                strokeWidth={1.5}
              />
              <span className="text-[12px] sm:text-[13px] font-medium text-slate-700 truncate">
                {doctor.currentWorkingPlace || "N/A"}
              </span>
            </div>
          </div>
          {/* Fee */}
          <div className="flex flex-col justify-center px-2 items-center">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <DollarSign
                  className="w-4 h-4 text-slate-500 shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-[14px] font-bold text-gray-900">
                  ${doctor.appointmentFee}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium ml-[18px] -mt-0.5">
                Consultation Fee
              </span>
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="p-5 pb-0">
          <p className="text-[13px] font-bold text-slate-800 mb-1.5">
            Qualification:
          </p>
          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
            {doctor.qualification}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-6 flex gap-3">
          <Link href={`/doctors/doctor/${doctor.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-11 border-primary text-primary hover:bg-primary/10 hover:text-primary font-semibold rounded-lg shadow-sm"
            >
              <Eye className="w-[18px] h-[18px] mr-2" />
              View Details
            </Button>
          </Link>
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm"
          >
            <Calendar className="w-[18px] h-[18px] mr-2" />
            Book Appointment
          </Button>
        </div>
      </Card>

      <BookAppointmentDialog
        doctor={doctor}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </>
  );
}
