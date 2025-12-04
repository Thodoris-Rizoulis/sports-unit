"use client";

import * as React from "react";
import { Slider } from "./slider";
import { cn } from "@/lib/utils";

type RangeSliderProps = {
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  value: [number | null, number | null];
  onChange: (value: [number | null, number | null]) => void;
  className?: string;
  formatValue?: (value: number) => string;
};

/**
 * Dual-handle range slider with labels and value display.
 * Supports null values to indicate "no filter" for min/max.
 */
export function RangeSlider({
  label,
  unit = "",
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
  formatValue = (v) => v.toString(),
}: RangeSliderProps) {
  // Convert null values to min/max for the slider
  const sliderValue: [number, number] = [value[0] ?? min, value[1] ?? max];

  // Track if the slider has been touched (to show values)
  const isActive = value[0] !== null || value[1] !== null;

  const handleValueChange = (newValue: number[]) => {
    const [newMin, newMax] = newValue as [number, number];
    // If values are at the extremes, treat as "no filter"
    const minVal = newMin === min ? null : newMin;
    const maxVal = newMax === max ? null : newMax;
    onChange([minVal, maxVal]);
  };

  const handleReset = () => {
    onChange([null, null]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {isActive && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onValueChange={handleValueChange}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {isActive && value[0] !== null
            ? `${formatValue(value[0])}${unit}`
            : `${formatValue(min)}${unit}`}
        </span>
        <span className="text-foreground font-medium">
          {isActive
            ? `${formatValue(sliderValue[0])}${unit} - ${formatValue(
                sliderValue[1]
              )}${unit}`
            : "Any"}
        </span>
        <span>
          {isActive && value[1] !== null
            ? `${formatValue(value[1])}${unit}`
            : `${formatValue(max)}${unit}`}
        </span>
      </div>
    </div>
  );
}
