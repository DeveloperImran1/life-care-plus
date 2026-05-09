import { IDoctorSchedule } from "@/app/(dashboard)/admin/dashboard/schedules-management/_types";

export interface AIDoctorSuggestionInput {
    symptoms: string;
}

export interface AISuggestedDoctor {
    id: string;
    name: string;
    specialties: string[];
    experience: number;
    averageRating: number;
    appointmentFee: number;
    profilePhoto?: string | null;
    qualification?: string;
    designation?: string;
    currentWorkingPlace?: string;
}


export interface IDoctor {
    id?: string;
    name: string;
    email: string;
    password: string;
    contactNumber: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    gender: "MALE" | "FEMALE";
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    specialties?: string[];
    profilePhoto?: File | string;
    removeSpecialties?: string[];
    isDeleted?: boolean;
    averageRating?: number;
    createdAt?: string;
    updatedAt?: string;
    doctorSpecialties?: Array<{
        specialitiesId: string;
        specialities?: {
            id: string;
            title: string;
            icon?: string;
        };
    }>;

    doctorSchedules?: IDoctorSchedule[];
}
