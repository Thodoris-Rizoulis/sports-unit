"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VALIDATION_CONSTANTS } from "@/lib/constants";

interface UsernameInputProps {
  value?: string;
  onChange: (username: string) => void;
  error?: string;
  disabled?: boolean;
}

export function UsernameInput({
  value = "",
  onChange,
  error,
  disabled,
}: UsernameInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const isValidLength =
    localValue.length >= VALIDATION_CONSTANTS.USERNAME.MIN_LENGTH &&
    localValue.length <= VALIDATION_CONSTANTS.USERNAME.MAX_LENGTH;
  const isValidFormat = VALIDATION_CONSTANTS.USERNAME.PATTERN.test(localValue);

  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username *</Label>
      <Input
        id="username"
        type="text"
        placeholder="Enter your username"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        className={error ? "border-destructive" : ""}
      />
      <div className="text-xs text-muted-foreground">
        <p>3-20 characters, letters, numbers, and underscores only</p>
        {localValue && (
          <div className="flex gap-2 mt-1">
            <span className={isValidLength ? "text-green-600" : "text-red-600"}>
              ✓ Length ({VALIDATION_CONSTANTS.USERNAME.MIN_LENGTH}-
              {VALIDATION_CONSTANTS.USERNAME.MAX_LENGTH} chars)
            </span>
            <span className={isValidFormat ? "text-green-600" : "text-red-600"}>
              ✓ Format (alphanumeric + _)
            </span>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
