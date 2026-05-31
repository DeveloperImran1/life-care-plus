import DashboardNavbar from "@/components/layout/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/layout/dashboard/DashboardSidebar";
import { SocketProvider } from "@/contexts/SocketContext";
import { cookies } from "next/headers";
import React from "react";

export const dynamic = "force-dynamic";

const CommonDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value || null;

  return (
    <SocketProvider token={token}>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
            <div className="">{children}</div>
          </main>
        </div>
      </div>
    </SocketProvider>
  );
};

export default CommonDashboardLayout;

