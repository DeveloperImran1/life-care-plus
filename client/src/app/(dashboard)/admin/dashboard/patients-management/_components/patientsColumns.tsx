"use client";

import { DateCell } from "@/components/table/cells/DateCell";
import { StatusBadgeCell } from "@/components/table/cells/StatusBadgeCell";
import { UserInfoCell } from "@/components/table/cells/UserInfoCell";
import { Column } from "@/components/table/ManagementTable";
import { IPatient } from "@/types/patient.type";

export const patientsColumns: Column<IPatient>[] = [
  {
    header: "Patient",
    accessor: (patient) => (
      <UserInfoCell
        name={patient.name}
        email={patient.email}
        photo={patient.profilePhoto}
      />
    ),
    sortKey: "name",
  },
  {
    header: "Contact",
    accessor: (patient) => (
      <div className="flex flex-col">
        <span className="text-sm">{patient.contactNumber}</span>
      </div>
    ),
  },
  {
    header: "Address",
    accessor: (patient) => (
      <span className="text-sm">{patient.address || "N/A"}</span>
    ),
  },
  {
    header: "Gender",
    accessor: (patient) => (
      <span className="text-sm capitalize">
        {patient.patientHealthData?.gender?.toLowerCase() || "N/A"}
      </span>
    ),
  },
  {
    header: "Status",
    accessor: (patient) => <StatusBadgeCell isDeleted={patient.isDeleted} />,
  },
  {
    header: "Joined",
    accessor: (patient) => <DateCell date={patient.createdAt} />,
    sortKey: "createdAt",
  },
];
