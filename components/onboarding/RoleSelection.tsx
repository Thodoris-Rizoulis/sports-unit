"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/lib/constants";

interface RoleSelectionProps {
  value?: UserRole;
  onChange: (role: UserRole) => void;
  error?: string;
}

const roleOptions = [
  {
    value: "athlete" as const,
    title: "Athlete",
    description:
      "I play sports and want to connect with coaches, scouts, and other athletes.",
  },
  {
    value: "coach" as const,
    title: "Coach",
    description:
      "I coach sports teams and want to find talented athletes and connect with other coaches.",
  },
];

export function RoleSelection({ value, onChange, error }: RoleSelectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select Your Role</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to use the platform. This helps us personalize
          your experience.
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
        {roleOptions.map((option) => (
          <Card
            key={option.value}
            className={`cursor-pointer transition-colors ${
              value === option.value ? "border-primary" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
                  <CardTitle className="text-base">{option.title}</CardTitle>
                </Label>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{option.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
