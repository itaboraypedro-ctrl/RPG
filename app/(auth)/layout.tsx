import { Suspense } from "react";
import { AuthLayoutClient } from "./AuthLayoutClient";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh w-full bg-arcana-bg text-arcana-text" />
      }
    >
      <AuthLayoutClient>{children}</AuthLayoutClient>
    </Suspense>
  );
}
