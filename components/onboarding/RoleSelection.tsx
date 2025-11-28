"use client";

import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RoleSelectionProps, RoleOption } from "@/types/components";

export function RoleSelection({ value, onChange, error }: RoleSelectionProps) {
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        if (response.ok) {
          const roles = await response.json();
          const options = roles.map((role: any) => ({
            value: role.id,
            title:
              role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1),
            description: role.description || "No description available.",
          }));
          setRoleOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  if (loading) {
    return <div>Loading roles...</div>;
  }
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select Your Role</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to use the platform. This helps us personalize
          your experience.
        </p>
      </div>

      <RadioGroup
        value={value?.toString()}
        onValueChange={(val) => onChange(parseInt(val, 10))}
        className="space-y-4"
      >
        {roleOptions.map((option) => (
          <Card
            key={option.value}
            className={`cursor-pointer transition-colors ${
              value === option.value ? "border-primary" : ""
            }`}
            onClick={() => onChange(option.value)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value.toString()}
                  id={option.value.toString()}
                />
                <Label
                  htmlFor={option.value.toString()}
                  className="cursor-pointer"
                >
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
