"use client";

import { useSession } from "next-auth/react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { OnboardingInput } from "@/types/onboarding";
import SessionGuard from "@/components/SessionGuard";
import { getProfileUrl } from "@/lib/utils";

export default function Onboarding() {
  const { data: session, update } = useSession();

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
        // Clear onboarding data from localStorage
        localStorage.removeItem("onboarding-data");
        
        // Update session first to refresh the token for proxy
        console.log("Updating session first");
        await update();
        console.log("Session updated, now redirecting");

        // Then redirect to user profile. Fetch the canonical profile (current user) to obtain `publicUuid`.
        try {
          const res = await fetch(`/api/profile`);
          if (res.ok) {
            const profile = await res.json();
            const url = getProfileUrl(profile);
            console.log("Redirecting to profile:", url);
            // Use window.location for reliable redirect after session update
            window.location.href = url;
            return;
          }
        } catch (e) {
          console.error("Failed to fetch profile:", e);
        }

        // Fallback: go to dashboard
        console.log("Fallback: redirecting to dashboard");
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Onboarding failed:", errorData);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  return (
    <SessionGuard>
      <div className="min-h-screen bg-background">
        <OnboardingWizard
          initialRoleId={session?.user?.roleId ?? undefined}
          initialUsername={session?.user?.name || undefined}
          onComplete={handleComplete}
        />
      </div>
    </SessionGuard>
  );
}
