import MyProfile from "@/app/(dashboard)/settings/profile/_components/MyProfile";
import { getUserInfo } from "@/app/(public)/(auth)/_services/user-info.service";

const MyProfilePage = async () => {
  const userInfo = await getUserInfo();
  return <MyProfile userInfo={userInfo} />;
};

export default MyProfilePage;
