import { getDefaultDashboardRoute } from "@/lib/auth/auth-utils";
import { getNavItemsByRole } from "@/lib/configs/nav-items.config";
import { getUserInfo } from "@/app/(public)/(auth)/_services/user-info.service";
import { UserInfo } from "@/app/(public)/(auth)/_types/user.type";
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
