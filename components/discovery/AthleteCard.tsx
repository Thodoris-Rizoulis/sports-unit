"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, CheckCircle2 } from "lucide-react";
import type { AthleteDiscoveryResult } from "@/types/discovery";

type AthleteCardProps = {
  athlete: AthleteDiscoveryResult;
  onAddToWatchlist?: (athleteId: string) => void;
  positionsMap?: Map<number, string>;
};

/**
 * Athlete card for discovery results.
 * Displays profile info, sport, position, location, metrics, and watchlist status.
 */
export function AthleteCard({
  athlete,
  onAddToWatchlist,
  positionsMap,
}: AthleteCardProps) {
  const router = useRouter();
  const isInWatchlist = athlete.inWatchlistIds.length > 0;

  // Generate profile URL using publicUuid and username
  const profileUrl = `/profile/${athlete.publicUuid}/${athlete.username}`;

  const handleCardClick = () => {
    router.push(profileUrl);
  };

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.(athlete.publicUuid);
  };

  // Format height in cm (consistent with filter input)
  const formatHeight = (heightCm: number | null) => {
    if (!heightCm) return null;
    return `${heightCm}cm`;
  };

  // Get position names from IDs
  const getPositionNames = (): string[] => {
    if (!athlete.positions || athlete.positions.length === 0 || !positionsMap) {
      return [];
    }
    return athlete.positions
      .map((id) => positionsMap.get(id))
      .filter((name): name is string => !!name);
  };

  const positionNames = getPositionNames();

  return (
    <Card
      className="group hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="shrink-0">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted">
              {athlete.profileImageUrl ? (
                <Image
                  src={athlete.profileImageUrl}
                  alt={`${athlete.firstName} ${athlete.lastName}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xl font-medium">
                  {athlete.firstName?.[0]}
                  {athlete.lastName?.[0]}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
                  {athlete.firstName} {athlete.lastName}
                </span>
                <p className="text-sm text-muted-foreground">
                  @{athlete.username}
                </p>
              </div>

              {/* Add to Watchlist Button */}
              <Button
                variant={isInWatchlist ? "secondary" : "outline"}
                size="sm"
                onClick={handleAddToWatchlist}
                className="shrink-0"
              >
                {isInWatchlist ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">In Lists</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {athlete.inWatchlistIds.length}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Add to List</span>
                  </>
                )}
              </Button>
            </div>

            {/* Sport, Positions & Status */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {athlete.sportName && (
                <Badge variant="default" className="text-xs">
                  {athlete.sportName}
                </Badge>
              )}
              {positionNames.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
              {athlete.openToOpportunities && (
                <Badge
                  variant="outline"
                  className="text-xs text-green-600 border-green-600"
                >
                  Open to Opportunities
                </Badge>
              )}
            </div>

            {/* Location */}
            {athlete.location && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{athlete.location}</span>
              </div>
            )}

            {/* Physical Stats */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {athlete.height && (
                <div>
                  <span className="text-muted-foreground">Height: </span>
                  <span className="font-medium">
                    {formatHeight(athlete.height)}
                  </span>
                </div>
              )}
              {athlete.age !== null && athlete.age > 0 && (
                <div>
                  <span className="text-muted-foreground">Age: </span>
                  <span className="font-medium">{athlete.age}</span>
                </div>
              )}
              {athlete.strongFoot && (
                <div>
                  <span className="text-muted-foreground">Foot: </span>
                  <span className="font-medium capitalize">
                    {athlete.strongFoot}
                  </span>
                </div>
              )}
            </div>

            {/* Metrics - Always show if athlete has metrics */}
            {athlete.metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 p-2 bg-muted/50 rounded-md text-xs">
                {athlete.metrics.sprintSpeed30m !== null && (
                  <div>
                    <span className="text-muted-foreground block">
                      30m Sprint
                    </span>
                    <span className="font-medium">
                      {athlete.metrics.sprintSpeed30m}s
                    </span>
                  </div>
                )}
                {athlete.metrics.agilityTTest !== null && (
                  <div>
                    <span className="text-muted-foreground block">T-Test</span>
                    <span className="font-medium">
                      {athlete.metrics.agilityTTest}s
                    </span>
                  </div>
                )}
                {athlete.metrics.beepTestLevel !== null && (
                  <div>
                    <span className="text-muted-foreground block">
                      Beep Test
                    </span>
                    <span className="font-medium">
                      Lvl {athlete.metrics.beepTestLevel}
                      {athlete.metrics.beepTestShuttle !== null &&
                        `.${athlete.metrics.beepTestShuttle}`}
                    </span>
                  </div>
                )}
                {athlete.metrics.verticalJump !== null && (
                  <div>
                    <span className="text-muted-foreground block">
                      Vert. Jump
                    </span>
                    <span className="font-medium">
                      {athlete.metrics.verticalJump}cm
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
