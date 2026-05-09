import { getMyAppointments } from "@/app/(dashboard)/patient/dashboard/my-appointments/_services";
import { IAppointment } from "@/app/(dashboard)/patient/dashboard/my-appointments/_types";
import { NavSection } from "@/app/(dashboard)/admin/_types/dashboard.type";
import { getDefaultDashboardRoute, UserRole } from "../auth/auth-utils";

export const getCommonNavItems = (role: UserRole): NavSection[] => {
    const defaultDashboard = getDefaultDashboardRoute(role);

    return [
        {
            items: [
                {
                    title: "Home",
                    href: "/",
                    icon: "Home", // ✅ String
                    roles: ["PATIENT", "DOCTOR", "ADMIN"],
                },
                {
                    title: "Dashboard",
                    href: defaultDashboard,
                    icon: "LayoutDashboard",
                    roles: ["PATIENT", "DOCTOR", "ADMIN"],
                },
                {
                    title: "My Profile",
                    href: `/settings/profile`,
                    icon: "User",
                    roles: ["PATIENT", "DOCTOR", "ADMIN"],
                },

            ]
        },
        {
            title: "Settings",
            items: [
                {
                    title: "Change Password",
                    href: "/settings/change-password",
                    icon: "Settings", // ✅ String
                    roles: ["PATIENT"],
                },
            ],
        },
    ]
}

export const getDoctorNavItems = async (): Promise<NavSection[]> => {
    // Fetch upcoming appointments count (only future appointments)
    let upcomingCount = 0;
    try {
        const response = await getMyAppointments("status=SCHEDULED");

        // Filter out appointments that have passed
        const now = new Date();
        const futureAppointments = response?.data?.filter((appointment: IAppointment) => {
            if (appointment.schedule?.endDateTime) {
                const endTime = new Date(appointment.schedule.endDateTime);
                return endTime > now;
            }
            return false;
        }) || [];

        upcomingCount = futureAppointments.length;
    } catch (error) {
        console.error("Error fetching appointments count:", error);
    }

    return [
        {
            title: "Patient Management",
            items: [
                {
                    title: "Appointments",
                    href: "/doctor/dashboard/appointments",
                    icon: "Calendar", // ✅ String
                    badge: upcomingCount > 0 ? upcomingCount.toString() : undefined,
                    roles: ["DOCTOR"],
                },
                {
                    title: "My Schedules",
                    href: "/doctor/dashboard/my-schedules",
                    icon: "Clock", // ✅ String
                    roles: ["DOCTOR"],
                },
                {
                    title: "Prescriptions",
                    href: "/doctor/dashboard/prescriptions",
                    icon: "FileText", // ✅ String
                    roles: ["DOCTOR"],
                },
            ],
        }
    ];
}

export const getPatientNavItems = async (): Promise<NavSection[]> => {
    // Fetch upcoming appointments count (only future appointments)
    let upcomingCount = 0;
    try {
        const response = await getMyAppointments("status=SCHEDULED");

        // Filter out appointments that have passed
        const now = new Date();
        const futureAppointments = response?.data?.filter((appointment: IAppointment) => {
            if (appointment.schedule?.endDateTime) {
                const endTime = new Date(appointment.schedule.endDateTime);
                return endTime > now;
            }
            return false;
        }) || [];

        upcomingCount = futureAppointments.length;
    } catch (error) {
        console.error("Error fetching appointments count:", error);
    }

    return [
        {
            title: "Appointments",
            items: [
                {
                    title: "My Appointments",
                    href: "/patient/dashboard/my-appointments",
                    icon: "Calendar", // ✅ String
                    badge: upcomingCount > 0 ? upcomingCount.toString() : undefined,
                    roles: ["PATIENT"],
                },
                {
                    title: "Book Appointment",
                    href: "/consultation",
                    icon: "ClipboardList", // ✅ String
                    roles: ["PATIENT"],
                },
            ],
        },
        {
            title: "Medical Records",
            items: [
                {
                    title: "My Prescriptions",
                    href: "/patient/dashboard/my-prescriptions",
                    icon: "FileText", // ✅ String
                    roles: ["PATIENT"],
                },
                {
                    title: "Health Records",
                    href: "/patient/dashboard/health-records",
                    icon: "Activity", // ✅ String
                    roles: ["PATIENT"],
                },
            ],
        },

    ]
}

export const adminNavItems: NavSection[] = [
    {
        title: "User Management",
        items: [
            {
                title: "Admins",
                href: "/admin/dashboard/admins-management",
                icon: "Shield", // ✅ String
                roles: ["ADMIN"],
            },
            {
                title: "Doctors",
                href: "/admin/dashboard/doctors-management",
                icon: "Stethoscope", // ✅ String
                roles: ["ADMIN"],
            },
            {
                title: "Patients",
                href: "/admin/dashboard/patients-management",
                icon: "Users", // ✅ String
                roles: ["ADMIN"],
            },
        ],
    },
    {
        title: "Hospital Management",
        items: [
            {
                title: "Appointments",
                href: "/admin/dashboard/appointments-management",
                icon: "Calendar", // ✅ String
                roles: ["ADMIN"],
            },
            {
                title: "Schedules",
                href: "/admin/dashboard/schedules-management",
                icon: "Clock", // ✅ String
                roles: ["ADMIN"],
            },
            {
                title: "Specialities",
                href: "/admin/dashboard/specialities-management",
                icon: "Hospital", // ✅ String
                roles: ["ADMIN"],
            },
        ],
    }
]

export const getNavItemsByRole = async (role: UserRole): Promise<NavSection[]> => {
    const commonNavItems = getCommonNavItems(role);

    switch (role) {
        case "ADMIN":
            return [...commonNavItems, ...adminNavItems];
        case "DOCTOR":
            return [...commonNavItems,
            // ...doctorNavItems
            ...await getDoctorNavItems()
            ];
        case "PATIENT":
            return [...commonNavItems,
            // ...patientNavItems
            ...await getPatientNavItems()
            ];
        default:
            return [];
    }
}
