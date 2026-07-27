"use client";

import { loginUser } from "@/app/(auth)/_services/login-user.service";
import InputFieldError from "@/components/common/InputFieldError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import SocialLoginButton from "./SocialLoginButton";

const LoginForm = ({ redirect }: { redirect?: string }) => {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin1234");

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {redirect && <input type="hidden" name="redirect" value={redirect} />}

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-foreground"
        >
          Email Address
        </label>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-12 rounded-lg border-input bg-background pl-11"
          />
        </div>

        <InputFieldError field="email" state={state} />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-foreground"
        >
          Password
        </label>

        <div className="relative">
          <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-12 rounded-lg border-input bg-background px-11"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <InputFieldError field="password" state={state} />
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-border"
          />
          Remember me
        </label>

        <a
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {/* Login Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {isPending ? "Logging in..." : "Login"}

        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Quick Login for Recruiters */}
      <div className="my-4 rounded-lg border border-dashed border-primary/50 p-4 bg-primary/5">
        <p className="mb-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Login For Testing
        </p>
        <div className="flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hover:bg-primary hover:text-white"
            onClick={() => {
              // এখানে আপনার ডাটাবেজে থাকা অ্যাডমিনের ইমেইল ও পাসওয়ার্ড দিন
              setEmail("admin@gmail.com");
              setPassword("admin1234");
            }}
          >
            Admin
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hover:bg-primary hover:text-white"
            onClick={() => {
              // এখানে আপনার ডাটাবেজে থাকা ডাক্তারের ইমেইল ও পাসওয়ার্ড দিন
              setEmail("doctor@gmail.com");
              setPassword("doctor1234");
            }}
          >
            Doctor
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hover:bg-primary hover:text-white"
            onClick={() => {
              // এখানে আপনার ডাটাবেজে থাকা রোগীর ইমেইল ও পাসওয়ার্ড দিন
              setEmail("patient@gmail.com");
              setPassword("patient1234");
            }}
          >
            Patient
          </Button>
        </div>
      </div>

      {/* Social login section */}
      <SocialLoginButton redirect={redirect}></SocialLoginButton>

      {/* Signup */}
      <p className="pt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </a>
      </p>
    </form>
  );
};

export default LoginForm;
