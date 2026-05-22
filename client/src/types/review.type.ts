import { IDoctor } from "@/app/(dashboard)/admin/dashboard/doctors-management/_types";
import { IAppointment } from "../app/(dashboard)/patient/dashboard/my-appointments/_types";
import { IPatient } from "./patient.type";

export interface IReview {
    id: string;
    patientId: string;
    patient?: IPatient;
    doctorId: string;
    doctor?: IDoctor;
    appointmentId: string;
    appointment?: IAppointment;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface IReviewFormData {
    appointmentId: string;
    doctorId?: string;
    rating: number;
    comment: string;
}
