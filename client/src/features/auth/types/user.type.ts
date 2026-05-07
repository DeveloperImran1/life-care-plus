import { UserRole } from "@/lib/auth/auth-utils";
import { IDoctor } from "@/features/doctor/types/doctor.type";
import { IPatient } from "@/features/patient/types/patient.type";
import { IAdmin } from "@/app/(dashboard)/admin/dashboard/admins-management/_types";

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    needPasswordChange: boolean;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
    admin?: IAdmin;
    patient?: IPatient;
    doctor?: IDoctor;
    createdAt: string;
    updatedAt: string;
}
