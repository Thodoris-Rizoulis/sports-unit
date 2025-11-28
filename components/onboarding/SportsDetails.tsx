"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { SportsDetailsInput, Sport, Position, Team } from "@/types/sports";
import { SportsDetailsProps } from "@/types/components";

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
        <Select
          value={value.sportId?.toString()}
          onValueChange={(sportId) => updateField("sportId", parseInt(sportId))}
        >
          <SelectTrigger
            className={errors?.sportId ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select a sport" />
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id.toString()}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <Select
              value={value.teamId?.toString()}
              onValueChange={(teamId) =>
                updateField("teamId", teamId ? parseInt(teamId) : undefined)
              }
            >
              <SelectTrigger
                className={errors?.teamId ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select your current team (optional)" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.teamId && (
              <p className="text-sm text-destructive">{errors.teamId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="strongFoot">
              Strong Foot{" "}
              <span className="text-sm text-muted-foreground">(optional)</span>
            </Label>
            <Select
              value={value.strongFoot}
              onValueChange={(strongFoot) =>
                updateField(
                  "strongFoot",
                  strongFoot as "left" | "right" | "both"
                )
              }
            >
              <SelectTrigger
                className={errors?.strongFoot ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select your strong foot (optional)" />
              </SelectTrigger>
              <SelectContent>
                {VALIDATION_CONSTANTS.STRONG_FOOT_OPTIONS.map((foot) => (
                  <SelectItem key={foot} value={foot}>
                    {foot.charAt(0).toUpperCase() + foot.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
