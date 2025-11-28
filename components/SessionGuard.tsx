"use client";
import { useSession } from "next-auth/react";
import { LoginRegisterModal } from "@/components/landing/LoginRegisterModal";
import { SessionGuardProps } from "@/types/components";

export default function SessionGuard({
  children,
  fallback,
}: SessionGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>; // Or a skeleton
  }

  if (!session) {
    return fallback || <LoginRegisterModal isOpen={true} onClose={() => {}} />;
  }

  return <>{children}</>;
}
