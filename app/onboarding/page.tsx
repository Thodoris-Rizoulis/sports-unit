"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { OnboardingInput } from "@/types/validation";

export default function Onboarding() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
    }

    if (session && session.user.onboardingComplete) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Redirecting...</div>;
  }

  const handleComplete = async (data: OnboardingInput) => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Update session
        await update();
        // Redirect to user profile
        const username = session?.user?.name;
        router.push(`/profile/${username}`);
      } else {
        console.error("Onboarding failed");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard
        initialRole={session.user.roleId ? "athlete" : undefined}
        initialUsername={session.user.name || undefined}
        onComplete={handleComplete}
      />
    </div>
  );
}
