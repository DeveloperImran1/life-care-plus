"use client";

import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";

const SocialLoginButton = ({ redirect }: { redirect?: string }) => {
  return (
    <section>
      {/* Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-border" />

        <span className="text-sm text-muted-foreground">Or continue with</span>

        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Social Login */}

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/google?redirect=${redirect || "/"}`;
          }}
          type="button"
          variant="outline"
          className="h-11 rounded-lg"
        >
          <span className="mr-2 text-lg font-bold text-primary">G</span>
          Google
        </Button>

        <Button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/facebook?redirect=${redirect || "/"}`;
          }}
          type="button"
          variant="outline"
          className="h-11 rounded-lg"
        >
          <Facebook className="mr-2 h-4 w-4 text-primary" />
          Facebook
        </Button>
      </div>
    </section>
  );
};

export default SocialLoginButton;
