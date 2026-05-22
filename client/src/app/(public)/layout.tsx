import PublicFooter from "@/components/layout/public/PublicFooter";
import PublicNavbar from "@/components/layout/public/PublicNavbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
};

export default CommonLayout;
