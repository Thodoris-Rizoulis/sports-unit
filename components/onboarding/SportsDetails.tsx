"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { Sport, Position, Team } from "@/types/prisma";
import { SportsDetailsInput } from "@/types/sports";
import { SportsDetailsProps } from "@/types/components";
import { cn } from "@/lib/utils";

export function SportsDetails({ value, onChange, errors }: SportsDetailsProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sportsResponse, positionsResponse, teamsResponse] =
          await Promise.all([
            fetch("/api/sports"),
            value.sportId
              ? fetch(`/api/positions?sportId=${value.sportId}`)
              : Promise.resolve(null),
            value.sportId
              ? fetch(`/api/teams?sportId=${value.sportId}`)
              : Promise.resolve(null),
          ]);

        const sportsData = sportsResponse.ok ? await sportsResponse.json() : [];
        const positionsData =
          positionsResponse && positionsResponse.ok
            ? await positionsResponse.json()
            : [];
        const teamsData =
          teamsResponse && teamsResponse.ok ? await teamsResponse.json() : [];

        setSports(sportsData);
        setPositions(positionsData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Failed to load sports data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [value.sportId]);

  const updateField = <K extends keyof SportsDetailsInput>(
    field: K,
    newValue: SportsDetailsInput[K]
  ) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handlePositionToggle = (positionId: number) => {
    const currentIds = value.positionIds;
    const newIds = currentIds.includes(positionId)
      ? currentIds.filter((id) => id !== positionId)
      : currentIds.length < VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS
      ? [...currentIds, positionId]
      : currentIds;

    updateField("positionIds", newIds);
  };

  const selectedPositions = positions.filter((pos) =>
    value.positionIds.includes(pos.id)
  );

  if (loading) {
    return <div>Loading sports data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Sports Details</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your sports background. Required fields are marked with
          *.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sport">Sport *</Label>
        <div className="relative">
          <select
            id="sport"
            value={value.sportId?.toString() || ""}
            onChange={(e) => updateField("sportId", parseInt(e.target.value))}
            className={cn(
              "flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-2 pr-8 text-sm shadow-xs transition-colors",
              "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !value.sportId && "text-muted-foreground",
              errors?.sportId && "border-destructive"
            )}
          >
            <option value="" disabled>
              Select a sport
            </option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id.toString()}>
                {sport.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        </div>
        {errors?.sportId && (
          <p className="text-sm text-destructive">{errors.sportId}</p>
        )}
      </div>

      {value.sportId && (
        <>
          <div className="space-y-2">
            <Label>
              Positions * (max {VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS})
            </Label>
            <div className="flex flex-wrap gap-2">
              {positions.map((position) => (
                <Badge
                  key={position.id}
                  variant={
                    value.positionIds.includes(position.id)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handlePositionToggle(position.id)}
                >
                  {position.name}
                  {value.positionIds.includes(position.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
            {selectedPositions.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedPositions.map((p) => p.name).join(", ")}
              </p>
            )}
            {errors?.positionIds && (
              <p className="text-sm text-destructive">{errors.positionIds}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">
              Current Team{" "}
              <span className="text-sm text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <select
                id="team"
                value={value.teamId?.toString() || ""}
                onChange={(e) =>
                  updateField(
                    "teamId",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className={cn(
                  "flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-2 pr-8 text-sm shadow-xs transition-colors",
                  "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  !value.teamId && "text-muted-foreground",
                  errors?.teamId && "border-destructive"
                )}
              >
                <option value="">Select your current team (optional)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id.toString()}>
                    {team.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
            </div>
            {errors?.teamId && (
              <p className="text-sm text-destructive">{errors.teamId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="strongFoot">
              Strong Foot{" "}
              <span className="text-sm text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <select
                id="strongFoot"
                value={value.strongFoot || ""}
                onChange={(e) =>
                  updateField(
                    "strongFoot",
                    (e.target.value as "left" | "right" | "both" | undefined) ||
                      undefined
                  )
                }
                className={cn(
                  "flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-2 pr-8 text-sm shadow-xs transition-colors",
                  "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  !value.strongFoot && "text-muted-foreground",
                  errors?.strongFoot && "border-destructive"
                )}
              >
                <option value="">Select your strong foot (optional)</option>
                {VALIDATION_CONSTANTS.STRONG_FOOT_OPTIONS.map((foot) => (
                  <option key={foot} value={foot}>
                    {foot.charAt(0).toUpperCase() + foot.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
            </div>
            {errors?.strongFoot && (
              <p className="text-sm text-destructive">{errors.strongFoot}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="openToOpportunities"
              checked={value.openToOpportunities}
              onCheckedChange={(checked) =>
                updateField("openToOpportunities", !!checked)
              }
            />
            <Label htmlFor="openToOpportunities" className="text-sm">
              I am open to new opportunities *
            </Label>
          </div>
          {errors?.openToOpportunities && (
            <p className="text-sm text-destructive">
              {errors.openToOpportunities}
            </p>
          )}
        </>
      )}
    </div>
  );
}
