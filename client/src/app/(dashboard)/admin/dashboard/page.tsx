// Normal import system
// import { AppointmentBarChart } from "@/components/charts/AppointmentBarChart";
// import { AppointmentPieChart } from "@/components/charts/AppointmentPieChart";

// Next Jer maddhome dynamic Import system sudho client compoent a kaj kore. Tai DynamicCharts.tsx namer akta wraper client component er moddhe dynamic vabe import kore aikhane use kortesi.
import {
  DynamicAppointmentBarChart,
  DynamicAppointmentPieChart,
} from "@/components/charts/DynamicCharts";

import { DashboardSkeleton } from "@/components/feedback/DashboardSkeleton";
import { StatsCard } from "@/components/cards/StatCard";
import { getDashboardMetaData } from "@/app/(dashboard)/admin/_services/dashboard.service";
import { IAdminDashboardMeta } from "@/app/(dashboard)/admin/_types/meta.type";
import { Suspense } from "react";

async function AdminDashboardContent() {
  const result = await getDashboardMetaData();

  const data: IAdminDashboardMeta = result.data;

  const totalRevenue = data.totalRevenue?._sum?.amount || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${
          data.adminCount !== undefined ? "xl:grid-cols-6" : "xl:grid-cols-5"
        }`}
      >
        <StatsCard
          title="Total Appointments"
          value={data.appointmentCount.toLocaleString()}
          iconName="CalendarDays"
          description="All time appointments"
          iconClassName="bg-primary/10"
        />
        <StatsCard
          title="Total Patients"
          value={data.patientCount.toLocaleString()}
          iconName="Users"
          description="Registered patients"
          iconClassName="bg-green-100"
        />
        <StatsCard
          title="Total Doctors"
          value={data.doctorCount.toLocaleString()}
          iconName="Stethoscope"
          description="Active doctors"
          iconClassName="bg-purple-100"
        />
        {data.adminCount !== undefined && (
          <StatsCard
            title="Total Admins"
            value={data.adminCount.toLocaleString()}
            iconName="UserCog"
            description="System administrators"
            iconClassName="bg-orange-100"
          />
        )}
        <StatsCard
          title="Total Payments"
          value={data.paymentCount.toLocaleString()}
          iconName="CreditCard"
          description="Payment transactions"
          iconClassName="bg-secondary"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          iconName="DollarSign"
          description="Total earnings"
          iconClassName="bg-emerald-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <DynamicAppointmentBarChart data={data.barChartData} />
        <DynamicAppointmentPieChart data={data.pieCharData} />
      </div>
    </div>
  );
}

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your healthcare system statistics
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
};

export default AdminDashboardPage;
