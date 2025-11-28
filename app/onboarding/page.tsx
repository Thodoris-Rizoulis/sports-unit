"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { OnboardingInput } from "@/types/onboarding";
import SessionGuard from "@/components/SessionGuard";

export default function Onboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const handleComplete = async (data: OnboardingInput) => {
    console.log("handleComplete started");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("API response:", response.ok);
      if (response.ok) {
        // Update session first to refresh the token for proxy
        console.log("Updating session first");
        await update();
        console.log("Session updated, now redirecting");

        // Then redirect to user profile
        const username = session?.user?.name;
        console.log("Redirecting to profile:", `/profile/${username}`);
        router.replace(`/profile/${username}`);
      } else {
        console.error("Onboarding failed");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  return (
    <SessionGuard>
      <div className="min-h-screen bg-background">
        <OnboardingWizard
          initialRoleId={session?.user?.roleId}
          initialUsername={session?.user?.name || undefined}
          onComplete={handleComplete}
        />
      </div>
    </SessionGuard>
  );
}
