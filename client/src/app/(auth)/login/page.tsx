// LoginPage.tsx
import LoginForm from "@/app/(auth)/_components/LoginForm";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";

const LoginPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) => {
  const params = (await searchParams) || {};

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-accent">
            <LockKeyhole className="h-9 w-9 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">Login to Your Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <LoginForm redirect={params.redirect} />
      </div>

      <div className="mt-10 text-xs text-muted-foreground">
        <p className="">
          &copy; {new Date().getFullYear()}{" "}
          <Link className="font-semibold" href="/">
            LifeCare+.
          </Link>{" "}
          All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
