"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginRegisterModal } from "@/components/LoginRegisterModal";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session && !session.user.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <LoginRegisterModal isOpen={true} onClose={() => {}} />;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard, {session.user.name}!</h1>
      <p>Role: {session.user.roleId}</p>
      {/* Add dashboard content here */}
    </div>
  );
}
