import { getDefaultDashboardRoute } from "@/lib/auth/auth-utils";
import { getNavItemsByRole } from "@/lib/configs/nav-items.config";
import { getUserInfo } from "@/features/auth/services/user-info.service";
import { NavSection } from "@/features/dashboard/types/dashboard.type";
import { UserInfo } from "@/features/auth/types/user.type";
import DashboardSidebarContent from "./DashboardSidebarContent";

const DashboardSidebar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;

  const navItems: NavSection[] = await getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardSidebarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardSidebar;
