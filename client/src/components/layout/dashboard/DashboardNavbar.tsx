import { getDefaultDashboardRoute } from "@/lib/auth/auth-utils";
import { getNavItemsByRole } from "@/lib/configs/nav-items.config";
import { getUserInfo } from "@/features/auth/services/user-info.service";
import { UserInfo } from "@/features/auth/types/user.type";
import DashboardNavbarContent from "./DashboardNavbarContent";

const DashboardNavbar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;
  const navItems = await getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardNavbarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardNavbar;
