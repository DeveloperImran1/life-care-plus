import PublicFooter from "@/components/layout/public/PublicFooter";
import PublicNavbar from "@/components/layout/public/PublicNavbar";
import { SocketProvider } from "@/contexts/SocketContext";
import { cookies } from "next/headers";

const CommonLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value || null;

  return (
    <SocketProvider token={token}>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </SocketProvider>
  );
};

export default CommonLayout;
