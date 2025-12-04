"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { BasicProfileInput } from "@/types/profile";
import { BasicProfileProps } from "@/types/components";

// Regex to match only English letters, spaces, hyphens, and apostrophes
const ENGLISH_NAME_REGEX = /^[a-zA-Z\s'-]*$/;

// Date constraints for birth date
const getDateConstraints = () => {
  const today = new Date();
  // Maximum date: 10 years ago (minimum age)
  const maxDate = new Date(
    today.getFullYear() - 10,
    today.getMonth(),
    today.getDate()
  );
  // Minimum date: 100 years ago (maximum age)
  const minDate = new Date(
    today.getFullYear() - 100,
    today.getMonth(),
    today.getDate()
  );
  return {
    min: minDate.toISOString().split("T")[0],
    max: maxDate.toISOString().split("T")[0],
  };
};

export function BasicProfile({ value, onChange, errors }: BasicProfileProps) {
  const dateConstraints = getDateConstraints();
  const updateField = <K extends keyof BasicProfileInput>(
    field: K,
    newValue: BasicProfileInput[K]
  ) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  // Filter input to only allow English characters for names
  const handleNameChange = (
    field: "firstName" | "lastName",
    inputValue: string
  ) => {
    // Only allow English letters, spaces, hyphens, and apostrophes
    if (ENGLISH_NAME_REGEX.test(inputValue)) {
      updateField(field, inputValue);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Basic Profile</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself. Required fields are marked with *.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name (English only)"
            value={value.firstName}
            onChange={(e) => handleNameChange("firstName", e.target.value)}
            className={errors?.firstName ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Only English letters allowed
          </p>
          {errors?.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name (English only)"
            value={value.lastName}
            onChange={(e) => handleNameChange("lastName", e.target.value)}
            className={errors?.lastName ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Only English letters allowed
          </p>
          {errors?.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">
          Bio <span className="text-sm text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          value={value.bio || ""}
          onChange={(e) => updateField("bio", e.target.value)}
          className={errors?.bio ? "border-destructive" : ""}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {value.bio?.length || 0}/{VALIDATION_CONSTANTS.PROFILE.BIO_MAX_LENGTH}{" "}
          characters
        </p>
        {errors?.bio && (
          <p className="text-sm text-destructive">{errors.bio}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">
            Location{" "}
            <span className="text-sm text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="City, Country"
            value={value.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
            className={errors?.location ? "border-destructive" : ""}
          />
          {errors?.location && (
            <p className="text-sm text-destructive">{errors.location}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth{" "}
            <span className="text-sm text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={
              value.dateOfBirth
                ? value.dateOfBirth.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              updateField(
                "dateOfBirth",
                e.target.value ? new Date(e.target.value) : undefined
              )
            }
            min={dateConstraints.min}
            max={dateConstraints.max}
            className={errors?.dateOfBirth ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 10 years old
          </p>
          {errors?.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="height">
          Height (cm){" "}
          <span className="text-sm text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="height"
          type="number"
          placeholder="Enter height in cm"
          value={value.height || ""}
          onChange={(e) =>
            updateField(
              "height",
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
          min={VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM}
          max={VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM}
          className={errors?.height ? "border-destructive" : ""}
        />
        {errors?.height && (
          <p className="text-sm text-destructive">{errors.height}</p>
        )}
      </div>
    </div>
  );
}
