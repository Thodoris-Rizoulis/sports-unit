"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RangeSlider } from "@/components/ui/range-slider";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw, ChevronDown, Check } from "lucide-react";
import type { DiscoveryFiltersInput } from "@/types/discovery";

// Debounce delay for text inputs (ms)
const DEBOUNCE_DELAY = 500;

// Validation ranges for all numeric fields
const RANGES = {
  height: {
    HEIGHT_MIN_CM: VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM,
    HEIGHT_MAX_CM: VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM,
  },
  age: { MIN: 10, MAX: 100 },
  sprintSpeed30m: VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M,
  agilityTTest: VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST,
  beepTestLevel: VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL,
  verticalJump: VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP,
} as const;

type Sport = {
  id: number;
  name: string;
};

type Position = {
  id: number;
  name: string;
  sportId: number;
};

type DiscoveryFiltersProps = {
  className?: string;
};

/**
 * Discovery filters panel with all filter controls.
 * Syncs filter state with URL search params for shareable links.
 * Filters are applied automatically as users change them (with debounce for text inputs).
 */
export function DiscoveryFilters({ className }: DiscoveryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse positionIds from URL (comma-separated)
  const parsePositionIds = (param: string | null): number[] => {
    if (!param) return [];
    return param
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
  };

  // Filter state
  const [sportId, setSportId] = useState<number | undefined>(
    searchParams.get("sportId")
      ? Number(searchParams.get("sportId"))
      : undefined
  );
  const [positionIds, setPositionIds] = useState<number[]>(
    parsePositionIds(searchParams.get("positionIds"))
  );
  const [strongFoot, setStrongFoot] = useState<string | undefined>(
    searchParams.get("strongFoot") || undefined
  );
  const [openToOpportunities, setOpenToOpportunities] = useState<
    boolean | undefined
  >(searchParams.get("openToOpportunities") === "true" ? true : undefined);
  const [location, setLocation] = useState<string>(
    searchParams.get("location") || ""
  );

  // Helper to parse number from URL or return null
  const parseNumberParam = (key: string): number | null => {
    const val = searchParams.get(key);
    if (!val) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  // Range filter states using [min, max] tuples with null for "no filter"
  const [heightRange, setHeightRange] = useState<
    [number | null, number | null]
  >([parseNumberParam("heightMin"), parseNumberParam("heightMax")]);
  const [ageRange, setAgeRange] = useState<[number | null, number | null]>([
    parseNumberParam("ageMin"),
    parseNumberParam("ageMax"),
  ]);
  const [sprintSpeed30mRange, setSprintSpeed30mRange] = useState<
    [number | null, number | null]
  >([
    parseNumberParam("sprintSpeed30mMin"),
    parseNumberParam("sprintSpeed30mMax"),
  ]);
  const [agilityTTestRange, setAgilityTTestRange] = useState<
    [number | null, number | null]
  >([parseNumberParam("agilityTTestMin"), parseNumberParam("agilityTTestMax")]);
  const [beepTestLevelRange, setBeepTestLevelRange] = useState<
    [number | null, number | null]
  >([
    parseNumberParam("beepTestLevelMin"),
    parseNumberParam("beepTestLevelMax"),
  ]);
  const [verticalJumpRange, setVerticalJumpRange] = useState<
    [number | null, number | null]
  >([parseNumberParam("verticalJumpMin"), parseNumberParam("verticalJumpMax")]);

  // Data for dropdowns
  const [sports, setSports] = useState<Sport[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoadingSports, setIsLoadingSports] = useState(true);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // Debounce timer ref for text inputs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if initial load is complete (to avoid auto-applying on mount)
  const isInitialMount = useRef(true);

  // Fetch sports on mount
  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch("/api/sports");
        if (res.ok) {
          const data = await res.json();
          // API returns the array directly, not wrapped in { data: ... }
          setSports(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch sports:", error);
      } finally {
        setIsLoadingSports(false);
      }
    }
    fetchSports();
  }, []);

  // Fetch positions when sport changes
  useEffect(() => {
    if (!sportId) {
      setPositions([]);
      setPositionIds([]);
      return;
    }

    async function fetchPositions() {
      setIsLoadingPositions(true);
      try {
        const res = await fetch(`/api/positions?sportId=${sportId}`);
        if (res.ok) {
          const data = await res.json();
          // API returns the array directly, not wrapped in { data: ... }
          setPositions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      } finally {
        setIsLoadingPositions(false);
      }
    }
    fetchPositions();
  }, [sportId]);

  // Toggle a position in the multi-select
  const togglePosition = (posId: number) => {
    setPositionIds((prev) =>
      prev.includes(posId)
        ? prev.filter((id) => id !== posId)
        : [...prev, posId]
    );
  };

  // Build filters object
  const buildFilters = useCallback((): DiscoveryFiltersInput => {
    const filters: DiscoveryFiltersInput = {};

    if (sportId) filters.sportId = sportId;
    if (positionIds.length > 0) filters.positionIds = positionIds;
    if (strongFoot)
      filters.strongFoot = strongFoot as "right" | "left" | "both";
    if (openToOpportunities !== undefined)
      filters.openToOpportunities = openToOpportunities;
    if (location) filters.location = location;

    // Range filters - only include if not null
    if (heightRange[0] !== null) filters.heightMin = heightRange[0];
    if (heightRange[1] !== null) filters.heightMax = heightRange[1];
    if (ageRange[0] !== null) filters.ageMin = ageRange[0];
    if (ageRange[1] !== null) filters.ageMax = ageRange[1];
    if (sprintSpeed30mRange[0] !== null)
      filters.sprintSpeed30mMin = sprintSpeed30mRange[0];
    if (sprintSpeed30mRange[1] !== null)
      filters.sprintSpeed30mMax = sprintSpeed30mRange[1];
    if (agilityTTestRange[0] !== null)
      filters.agilityTTestMin = agilityTTestRange[0];
    if (agilityTTestRange[1] !== null)
      filters.agilityTTestMax = agilityTTestRange[1];
    if (beepTestLevelRange[0] !== null)
      filters.beepTestLevelMin = beepTestLevelRange[0];
    if (beepTestLevelRange[1] !== null)
      filters.beepTestLevelMax = beepTestLevelRange[1];
    if (verticalJumpRange[0] !== null)
      filters.verticalJumpMin = verticalJumpRange[0];
    if (verticalJumpRange[1] !== null)
      filters.verticalJumpMax = verticalJumpRange[1];

    return filters;
  }, [
    sportId,
    positionIds,
    strongFoot,
    openToOpportunities,
    location,
    heightRange,
    ageRange,
    sprintSpeed30mRange,
    agilityTTestRange,
    beepTestLevelRange,
    verticalJumpRange,
  ]);

  // Update URL with current filters
  const updateUrl = useCallback(() => {
    const filters = buildFilters();
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          // For positionIds, join as comma-separated
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      }
    });

    // Keep current sort param but reset page to 1 when filters change
    const currentSort = searchParams.get("sort");
    if (currentSort) params.set("sort", currentSort);

    const url = params.toString() ? `?${params.toString()}` : "";
    router.push(`/discovery${url}`, { scroll: false });
  }, [buildFilters, router, searchParams]);

  // Auto-apply filters when they change (with debounce for text inputs)
  useEffect(() => {
    // Skip initial mount to avoid duplicate API call
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      updateUrl();
    }, DEBOUNCE_DELAY);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    sportId,
    positionIds,
    strongFoot,
    openToOpportunities,
    location,
    heightRange,
    ageRange,
    sprintSpeed30mRange,
    agilityTTestRange,
    beepTestLevelRange,
    verticalJumpRange,
  ]); // Note: updateUrl not included to avoid infinite loop

  // Clear all filters
  const handleClearFilters = () => {
    setSportId(undefined);
    setPositionIds([]);
    setStrongFoot(undefined);
    setOpenToOpportunities(undefined);
    setLocation("");
    setHeightRange([null, null]);
    setAgeRange([null, null]);
    setSprintSpeed30mRange([null, null]);
    setAgilityTTestRange([null, null]);
    setBeepTestLevelRange([null, null]);
    setVerticalJumpRange([null, null]);

    router.push("/discovery", { scroll: false });
  };

  // Count active filters (only count truthy values, not empty strings or false)
  const activeFilterCount = [
    sportId,
    positionIds.length > 0 ? positionIds : undefined,
    strongFoot,
    openToOpportunities === true ? true : undefined, // Only count when explicitly true
    location ? location : undefined, // Don't count empty string
    heightRange[0] !== null || heightRange[1] !== null
      ? heightRange
      : undefined,
    ageRange[0] !== null || ageRange[1] !== null ? ageRange : undefined,
    sprintSpeed30mRange[0] !== null || sprintSpeed30mRange[1] !== null
      ? sprintSpeed30mRange
      : undefined,
    agilityTTestRange[0] !== null || agilityTTestRange[1] !== null
      ? agilityTTestRange
      : undefined,
    beepTestLevelRange[0] !== null || beepTestLevelRange[1] !== null
      ? beepTestLevelRange
      : undefined,
    verticalJumpRange[0] !== null || verticalJumpRange[1] !== null
      ? verticalJumpRange
      : undefined,
  ].filter((v) => v !== undefined).length;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Sport & Position */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="sport">Sport</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="sport"
                  variant="outline"
                  className="w-full mt-1 justify-between font-normal"
                  disabled={isLoadingSports}
                >
                  {isLoadingSports
                    ? "Loading..."
                    : sportId
                    ? sports.find((s) => s.id === sportId)?.name ||
                      "Select sport"
                    : "Select sport"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2" align="start">
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {sports.map((sport) => (
                    <button
                      key={sport.id}
                      type="button"
                      className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setSportId(sport.id);
                        setPositionIds([]);
                      }}
                    >
                      {sport.name}
                      {sportId === sport.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Positions</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-between font-normal"
                  disabled={!sportId || isLoadingPositions}
                >
                  {!sportId
                    ? "Select a sport first"
                    : isLoadingPositions
                    ? "Loading..."
                    : positionIds.length === 0
                    ? "Select positions"
                    : positionIds.length === 1
                    ? positions.find((p) => p.id === positionIds[0])?.name ||
                      "1 selected"
                    : `${positionIds.length} positions selected`}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2" align="start">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {positions.map((pos) => (
                    <div key={pos.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pos-${pos.id}`}
                        checked={positionIds.includes(pos.id)}
                        onCheckedChange={() => togglePosition(pos.id)}
                      />
                      <label
                        htmlFor={`pos-${pos.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {pos.name}
                      </label>
                    </div>
                  ))}
                  {positions.length === 0 && !isLoadingPositions && (
                    <p className="text-sm text-muted-foreground py-2">
                      No positions available
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, State, or Country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Strong Foot */}
        <div>
          <Label htmlFor="strongFoot">Strong Foot</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="strongFoot"
                variant="outline"
                className="w-full mt-1 justify-between font-normal"
              >
                {strongFoot
                  ? strongFoot.charAt(0).toUpperCase() + strongFoot.slice(1)
                  : "Any"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" align="start">
              <div className="space-y-1">
                {[
                  { value: "", label: "Any" },
                  { value: "right", label: "Right" },
                  { value: "left", label: "Left" },
                  { value: "both", label: "Both" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-accent cursor-pointer"
                    onClick={() => setStrongFoot(option.value || undefined)}
                  >
                    {option.label}
                    {(strongFoot || "") === option.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Open to Opportunities */}
        <div className="flex items-center justify-between">
          <Label htmlFor="openToOpportunities">Open to Opportunities</Label>
          <Switch
            id="openToOpportunities"
            checked={openToOpportunities || false}
            onCheckedChange={(checked) =>
              setOpenToOpportunities(checked || undefined)
            }
          />
        </div>

        {/* Height Range */}
        <RangeSlider
          label="Height"
          min={RANGES.height.HEIGHT_MIN_CM}
          max={RANGES.height.HEIGHT_MAX_CM}
          step={1}
          unit="cm"
          value={heightRange}
          onChange={setHeightRange}
        />

        {/* Age Range */}
        <RangeSlider
          label="Age"
          min={RANGES.age.MIN}
          max={RANGES.age.MAX}
          step={1}
          unit="years"
          value={ageRange}
          onChange={setAgeRange}
        />

        {/* Metrics Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Performance Metrics
          </h4>

          {/* Sprint Speed 30m */}
          <RangeSlider
            label="Sprint Speed 30m"
            min={RANGES.sprintSpeed30m.MIN}
            max={RANGES.sprintSpeed30m.MAX}
            step={0.01}
            unit="s"
            value={sprintSpeed30mRange}
            onChange={setSprintSpeed30mRange}
          />

          {/* Agility T-Test */}
          <RangeSlider
            label="Agility T-Test"
            min={RANGES.agilityTTest.MIN}
            max={RANGES.agilityTTest.MAX}
            step={0.01}
            unit="s"
            value={agilityTTestRange}
            onChange={setAgilityTTestRange}
          />

          {/* Beep Test Level */}
          <RangeSlider
            label="Beep Test Level"
            min={RANGES.beepTestLevel.MIN}
            max={RANGES.beepTestLevel.MAX}
            step={1}
            value={beepTestLevelRange}
            onChange={setBeepTestLevelRange}
          />

          {/* Vertical Jump */}
          <RangeSlider
            label="Vertical Jump"
            min={RANGES.verticalJump.MIN}
            max={RANGES.verticalJump.MAX}
            step={1}
            unit="cm"
            value={verticalJumpRange}
            onChange={setVerticalJumpRange}
          />
        </div>
      </div>
    </div>
  );
}
