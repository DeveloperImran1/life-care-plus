// RegisterPage.tsx

import RegisterForm from "@/app/(auth)/_components/RegisterForm";
import { UserPlus } from "lucide-react";

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-foreground">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-accent">
            <UserPlus className="h-9 w-9 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">Create an Account</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your information below to create your account
          </p>
        </div>

        <RegisterForm />
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        © 2026 LifeCare+. All Rights Reserved.
      </p>
    </div>
  );
};

export default RegisterPage;
