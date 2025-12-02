"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OnboardingInput } from "@/types/onboarding";
import { Sport, Position, Team, Role } from "@/types/prisma";
import { ReviewSubmitProps } from "@/types/components";

export function ReviewSubmit({ data, error }: ReviewSubmitProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch sports data
        const [sportsResponse, positionsResponse, teamsResponse, roleResponse] =
          await Promise.all([
            fetch("/api/sports"),
            data.sportsDetails.positionIds.length > 0
              ? fetch(`/api/positions?sportId=${data.sportsDetails.sportId}`)
              : Promise.resolve(null),
            data.sportsDetails.teamId
              ? fetch(`/api/teams?sportId=${data.sportsDetails.sportId}`)
              : Promise.resolve(null),
            data.roleId
              ? fetch(`/api/roles/${data.roleId}`)
              : Promise.resolve(null),
          ]);

        const sportsData = sportsResponse.ok ? await sportsResponse.json() : [];
        const positionsData =
          positionsResponse && positionsResponse.ok
            ? await positionsResponse.json()
            : [];
        const teamsData =
          teamsResponse && teamsResponse.ok ? await teamsResponse.json() : [];
        const roleData =
          roleResponse && roleResponse.ok ? await roleResponse.json() : null;

        setSports(sportsData);
        setPositions(positionsData);
        setTeams(teamsData);
        setRole(roleData);
      } catch (error) {
        console.error("Failed to load review data:", error);
      }
    };

    loadData();
  }, [
    data.sportsDetails.sportId,
    data.sportsDetails.positionIds.length,
    data.sportsDetails.teamId,
  ]);

  const getSportName = (sportId: number) => {
    const sport = sports.find((s) => s.id === sportId);
    return sport ? sport.name : "Football";
  };

  const getPositionNames = (positionIds: number[]) => {
    return positionIds
      .map((id) => {
        const position = positions.find((p) => p.id === id);
        return position ? position.name : `Position ${id}`;
      })
      .join(", ");
  };

  const getTeamName = (teamId?: number) => {
    if (!teamId) return "Not specified";
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : `Team ${teamId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Review Your Information</h3>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting. You can go back to
          edit any section.
        </p>
      </div>

      {error && (
        <div className="p-4 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* All Information in One Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role & Username */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Role & Username
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  <Badge variant="secondary">
                    {role?.roleName || "Unknown Role"}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Username:</span> {data.username}
                </div>
              </div>
            </div>

            <Separator />

            {/* Basic Profile */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Basic Profile
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {data.basicProfile.firstName} {data.basicProfile.lastName}
                </div>
                {data.basicProfile.bio && (
                  <div>
                    <span className="font-medium">Bio:</span>{" "}
                    {data.basicProfile.bio}
                  </div>
                )}
                {data.basicProfile.location && (
                  <div>
                    <span className="font-medium">Location:</span>{" "}
                    {data.basicProfile.location}
                  </div>
                )}
                {data.basicProfile.dateOfBirth && (
                  <div>
                    <span className="font-medium">Date of Birth:</span>{" "}
                    {data.basicProfile.dateOfBirth.toLocaleDateString()}
                  </div>
                )}
                {data.basicProfile.height && (
                  <div>
                    <span className="font-medium">Height:</span>{" "}
                    {data.basicProfile.height} cm
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Sports Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Sports Details
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="font-medium">Sport:</span>{" "}
                  {getSportName(data.sportsDetails.sportId)}
                </div>
                <div>
                  <span className="font-medium">Positions:</span>{" "}
                  {getPositionNames(data.sportsDetails.positionIds)}
                </div>
                <div>
                  <span className="font-medium">Current Team:</span>{" "}
                  {getTeamName(data.sportsDetails.teamId)}
                </div>
                <div>
                  <span className="font-medium">Open to Opportunities:</span>{" "}
                  {data.sportsDetails.openToOpportunities ? "Yes" : "No"}
                </div>
                {data.sportsDetails.strongFoot && (
                  <div>
                    <span className="font-medium">Strong Foot:</span>{" "}
                    {data.sportsDetails.strongFoot}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="text-sm text-muted-foreground">
        <p>
          By submitting this form, you agree to our terms of service and privacy
          policy. Your information will be used to create your sports networking
          profile.
        </p>
      </div>
    </div>
  );
}
