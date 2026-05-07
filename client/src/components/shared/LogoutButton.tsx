"use client";

import { logoutUser } from "@/features/auth/services/logout-user.service";
import { Button } from "../ui/button";

const LogoutButton = () => {
  const handleLogout = async () => {
    await logoutUser();
  };
  return (
    <Button variant={"destructive"} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
