import MyProfile from "@/features/profile/components/MyProfile";
import { getUserInfo } from "@/features/auth/services/user-info.service";

const MyProfilePage = async () => {
  const userInfo = await getUserInfo();
  return <MyProfile userInfo={userInfo} />;
};

export default MyProfilePage;
