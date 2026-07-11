"use client";
import dynamic from "next/dynamic";

import ManagementPageHeader from "@/components/common/ManagementPageHeader";
import { ISpecialty } from "@/types/specialty.type";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// Normal import
// import DoctorFormDialog from "./DoctorFormDialog";

// Dynamic Import system
const DoctorFormDialog = dynamic(() => import("./DoctorFormDialog"), {
  ssr: false, // ডায়ালগগুলো মূলত ক্লায়েন্ট সাইডে কাজ করে, তাই SSR অফ রাখাই ভালো।
});

interface DoctorsManagementHeaderProps {
  specialities?: ISpecialty[];
}

const DoctorsManagementHeader = ({
  specialities,
}: DoctorsManagementHeaderProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const [dialogKey, setDialogKey] = useState(0);

  const handleOpenDialog = () => {
    setDialogKey((prev) => prev + 1); // Force remount
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  return (
    <>
      <DoctorFormDialog
        key={dialogKey}
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        specialities={specialities}
      />

      <ManagementPageHeader
        title="Doctors Management"
        description="Manage Doctors information and details"
        action={{
          label: "Add Doctor    ",
          icon: Plus,
          onClick: handleOpenDialog,
        }}
      />
    </>
  );
};

export default DoctorsManagementHeader;
