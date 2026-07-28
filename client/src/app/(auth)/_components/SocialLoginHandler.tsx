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
      // ১. টোকেন সেভ করুন (আপনার প্রোজেক্টের ফাংশন অনুযায়ী)
      // Call the server action to set the cookie
      import("../_services/token-handlers.service").then(({ setCookie }) => {
        setCookie("accessToken", token, { 
          secure: true, 
          sameSite: "lax", 
          maxAge: 7 * 24 * 60 * 60 // 7 days (or match your backend's maxAge)
        }).then(() => {
          if (refreshToken) {
            setCookie("refreshToken", refreshToken, { 
              secure: true, 
              sameSite: "lax", 
              maxAge: 90 * 24 * 60 * 60 // 90 days
            });
          }
          // ২. সাকসেস টোস্ট দেখানো
          toast.success("Successfully logged in!");

          // ৩. URL থেকে টোকেনটা মুছে দিয়ে ফ্রেশ URL তৈরি করা
          router.replace(pathname);
        });
      });
    } else if (error && !isProcessed.current) {
      isProcessed.current = true;
      // ১. এরর টোস্ট দেখানো
      toast.error("Login failed! Please try again.");

      // ২. URL থেকে এরর প্যারামিটার মুছে ফ্রেশ URL তৈরি করা
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  return null; // এটি কোনো UI দেখাবে না
};

export default SocialLoginHandler;
