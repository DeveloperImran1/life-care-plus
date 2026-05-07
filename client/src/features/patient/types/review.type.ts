import { IDoctor } from "@/features/doctor/types/doctor.type";
import { IAppointment } from "./appointment.type";
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
