"use client";
import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner"; // আপনি react-hot-toast বা toastify ব্যবহার করলে সেটার ইম্পোর্ট দিবেন

const SocialLoginHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isProcessed = useRef(false);

  useEffect(() => {
    // URL থেকে token এবং error বের করে আনা
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (token && !isProcessed.current) {
      isProcessed.current = true;
      // URL থেকে সাথে সাথে token সরিয়ে দেওয়া যাতে রেন্ডারে লুপ না হয়
      window.history.replaceState(null, "", pathname);

      // ১. টোকেন সেভ করুন
      import("../_services/token-handlers.service").then(({ setCookie }) => {
        setCookie("accessToken", token, { 
          secure: true, 
          sameSite: "lax", 
          maxAge: 7 * 24 * 60 * 60 
        }).then(() => {
          if (refreshToken) {
            setCookie("refreshToken", refreshToken, { 
              secure: true, 
              sameSite: "lax", 
              maxAge: 90 * 24 * 60 * 60 
            });
          }
          toast.success("Successfully logged in!");
          // কুকি সেট হওয়ার পর ড্যাশবোর্ডে বা হোমপেজে রিডাইরেক্ট করে দেওয়া
          router.replace("/");
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      });
    } else if (error && !isProcessed.current) {
      isProcessed.current = true;
      window.history.replaceState(null, "", pathname);
      toast.error("Login failed! Please try again.");
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  return null; // এটি কোনো UI দেখাবে না
};

export default SocialLoginHandler;
