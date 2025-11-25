"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoleSelection } from "./RoleSelection";
import { UsernameInput } from "./UsernameInput";
import { BasicProfile } from "./BasicProfile";
import { SportsDetails } from "./SportsDetails";
import { ReviewSubmit } from "./ReviewSubmit";
import { UserRole } from "@/lib/constants";
import { onboardingSchema, OnboardingInput } from "@/types/validation";

interface OnboardingWizardProps {
  initialRole?: UserRole;
  initialUsername?: string;
  onComplete: (data: OnboardingInput) => Promise<void>;
  isSubmitting?: boolean;
}

const STEPS = [
  { id: "role-username", title: "Role & Username", required: true },
  { id: "basic-profile", title: "Basic Profile", required: true },
  { id: "sports-details", title: "Sports Details", required: true },
  { id: "review-submit", title: "Review & Submit", required: true },
];

export function OnboardingWizard({
  initialRole,
  initialUsername,
  onComplete,
  isSubmitting = false,
}: OnboardingWizardProps) {
  // Load saved data from localStorage for initial state
  const getInitialData = (): Partial<OnboardingInput> => {
    const saved = localStorage.getItem("onboarding-data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Failed to load saved onboarding data:", error);
      }
    }
    // Default data if no saved data or parsing failed
    return {
      role: initialRole,
      username: initialUsername,
      basicProfile: {
        firstName: "",
        lastName: "",
        dateOfBirth: undefined,
      },
      sportsDetails: {
        sportId: 1, // Football
        positionIds: [],
        openToOpportunities: false,
      },
      profilePictureUrl: undefined,
      coverPictureUrl: undefined,
    };
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingInput>>(getInitialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Skip role/username step if role is already set
  const effectiveSteps = initialRole ? STEPS.slice(1) : STEPS;
  const showRoleStep = !initialRole;

  useEffect(() => {
    localStorage.setItem("onboarding-data", JSON.stringify(data));
  }, [data]);

  const updateData = (updates: Partial<OnboardingInput>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear errors when data changes
    setErrors({});
  };

  const validateCurrentStep = (): boolean => {
    try {
      const stepData = { ...data };

      if (currentStep === 0 && showRoleStep) {
        // Validate role and username
        if (!stepData.role) {
          setErrors({ role: "Please select a role" });
          return false;
        }
        if (!stepData.username) {
          setErrors({ username: "Username is required" });
          return false;
        }
      } else if (currentStep === (showRoleStep ? 1 : 0)) {
        // Validate basic profile
        if (
          !stepData.basicProfile?.firstName ||
          !stepData.basicProfile?.lastName
        ) {
          setErrors({
            firstName: !stepData.basicProfile?.firstName
              ? "First name is required"
              : "",
            lastName: !stepData.basicProfile?.lastName
              ? "Last name is required"
              : "",
          });
          return false;
        }
      } else if (currentStep === (showRoleStep ? 2 : 1)) {
        // Validate sports details
        if (!stepData.sportsDetails?.sportId) {
          setErrors({ sportId: "Please select a sport" });
          return false;
        }
        if (!stepData.sportsDetails?.positionIds?.length) {
          setErrors({ positionIds: "Please select at least one position" });
          return false;
        }
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < effectiveSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const validatedData = onboardingSchema.parse(data);
      await onComplete(validatedData);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Failed to submit onboarding data" });
    }
  };

  const progress = ((currentStep + 1) / effectiveSteps.length) * 100;

  const renderStep = () => {
    const stepIndex = showRoleStep ? currentStep : currentStep + 1;

    switch (stepIndex) {
      case 0:
        return (
          <div className="space-y-6">
            <RoleSelection
              value={data.role}
              onChange={(role) => updateData({ role })}
              error={errors.role}
            />
            <UsernameInput
              value={data.username}
              onChange={(username) => updateData({ username })}
              error={errors.username}
            />
          </div>
        );
      case 1:
        return (
          <BasicProfile
            value={
              data.basicProfile || {
                firstName: "",
                lastName: "",
                dateOfBirth: undefined,
              }
            }
            onChange={(basicProfile) => updateData({ basicProfile })}
            errors={{
              firstName: errors.firstName,
              lastName: errors.lastName,
              bio: errors.bio,
              location: errors.location,
              dateOfBirth: errors.dateOfBirth,
              height: errors.height,
            }}
          />
        );
      case 2:
        return (
          <SportsDetails
            value={
              data.sportsDetails || {
                sportId: 1,
                positionIds: [],
                openToOpportunities: false,
              }
            }
            onChange={(sportsDetails) => updateData({ sportsDetails })}
            errors={{
              sportId: errors.sportId,
              positionIds: errors.positionIds,
              teamId: errors.teamId,
              openToOpportunities: errors.openToOpportunities,
              strongFoot: errors.strongFoot,
            }}
          />
        );
      case 3:
        return (
          <ReviewSubmit data={data as OnboardingInput} error={errors.submit} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {effectiveSteps.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{effectiveSteps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button onClick={handleNext} disabled={isSubmitting}>
          {currentStep === effectiveSteps.length - 1 ? (
            isSubmitting ? (
              "Submitting..."
            ) : (
              "Complete Onboarding"
            )
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
