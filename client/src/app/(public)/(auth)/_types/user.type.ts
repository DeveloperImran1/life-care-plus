import { UserRole } from "@/lib/auth/auth-utils";
import { IPatient } from "@/types/patient.type";
import { IAdmin } from "@/app/(dashboard)/admin/dashboard/admins-management/_types";
import { IDoctor } from "@/app/(dashboard)/admin/dashboard/doctors-management/_types";

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
