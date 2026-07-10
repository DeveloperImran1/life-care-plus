// RegisterForm.tsx

"use client";

import { registerPatient } from "@/app/(auth)/_services/register-patient.service";
import InputFieldError from "@/components/common/InputFieldError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Home,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import SocialLoginButton from "./SocialLoginButton";

const RegisterForm = () => {
  const [state, formAction, isPending] = useActionState(registerPatient, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-semibold text-foreground"
          >
            Full Name
          </label>

          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className="h-12 rounded-lg border-input bg-background pl-11"
            />
          </div>

          <InputFieldError field="name" state={state} />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label
            htmlFor="address"
            className="text-sm font-semibold text-foreground"
          >
            Address
          </label>

          <div className="relative">
            <Home className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="address"
              name="address"
              type="text"
              placeholder="123 Main St"
              className="h-12 rounded-lg border-input bg-background pl-11"
            />
          </div>

          <InputFieldError field="address" state={state} />
        </div>

        {/* Email */}
        <div className="space-y-2 md:col-span-2">
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
              placeholder="m@example.com"
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
              placeholder="Enter password"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-semibold text-foreground"
          >
            Confirm Password
          </label>

          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="h-12 rounded-lg border-input bg-background px-11"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <InputFieldError field="confirmPassword" state={state} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {isPending ? "Creating Account..." : "Create Account"}

        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Social login section */}
      <SocialLoginButton></SocialLoginButton>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
