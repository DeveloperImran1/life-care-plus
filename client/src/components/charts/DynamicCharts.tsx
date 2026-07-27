"use client"; // এটি ক্লায়েন্ট কম্পোনেন্ট!

import dynamic from "next/dynamic";

export const DynamicAppointmentBarChart = dynamic(
  () => import("./AppointmentBarChart").then((mod) => mod.AppointmentBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted"></div>
    ),
  },
);

export const DynamicAppointmentPieChart = dynamic(
  () => import("./AppointmentPieChart").then((mod) => mod.AppointmentPieChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted flex items-center justify-center">
        Loading Chart...
      </div>
    ),
  },
);
