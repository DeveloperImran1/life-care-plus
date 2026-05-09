import { IDoctor } from "@/app/(dashboard)/admin/dashboard/doctors-management/_types";
import { IAppointment } from "../app/(dashboard)/patient/dashboard/my-appointments/_types";
import { IPatient } from "./patient.type";

export interface IPrescription {
    id: string;
    appointmentId: string;
    appointment?: IAppointment;
    doctorId: string;
    doctor?: IDoctor;
    patientId: string;
    patient?: IPatient;
    instructions: string;
    followUpDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IPrescriptionFormData {
    appointmentId: string;
    instructions: string;
    followUpDate?: string;
}
