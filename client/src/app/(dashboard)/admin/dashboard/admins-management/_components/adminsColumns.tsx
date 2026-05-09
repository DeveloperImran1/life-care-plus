"use client";

import { DateCell } from "@/components/table/cells/DateCell";
import { StatusBadgeCell } from "@/components/table/cells/StatusBadgeCell";
import { UserInfoCell } from "@/components/table/cells/UserInfoCell";
import { Column } from "@/components/table/ManagementTable";
import { IAdmin } from "../_types/index";

export const adminsColumns: Column<IAdmin>[] = [
  {
    header: "Admin",
    accessor: (admin) => (
      <UserInfoCell
        name={admin.name}
        email={admin.email}
        photo={admin.profilePhoto}
      />
    ),
    sortKey: "name",
  },
  {
    header: "Contact",
    accessor: (admin) => (
      <div className="flex flex-col">
        <span className="text-sm">{admin.contactNumber}</span>
      </div>
    ),
  },
  {
    header: "Status",
    accessor: (admin) => <StatusBadgeCell isDeleted={admin.isDeleted} />,
  },
  {
    header: "Joined",
    accessor: (admin) => <DateCell date={admin.createdAt} />,
    sortKey: "createdAt",
  },
];
