"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit3, Activity, Zap, Timer, Gauge, TrendingUp } from "lucide-react";
import { AthleteMetricsSectionProps } from "@/types/components";
import { useAthleteMetrics } from "@/hooks/useAthleteMetrics";
import { MetricsEditModal } from "./MetricsEditModal";

/**
 * AthleteMetricsSection - Displays athlete performance metrics
 * Only visible to athletes (roleName === 'athlete')
 */
export function AthleteMetricsSection({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: AthleteMetricsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show for athletes
  if (profile.roleName !== "athlete") {
    return null;
  }

  const { data: metrics, isLoading } = useAthleteMetrics(profile.publicUuid);

  const handleOpenModal = () => {
    onSetEditing("metrics");
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      onSetEditing(null);
    }
  };

  // Format beep test as "Level X.Y"
  const formatBeepTest = () => {
    if (!metrics?.beepTestLevel) return "Not recorded";
    const shuttle = metrics.beepTestShuttle || 1;
    return `Level ${metrics.beepTestLevel}.${shuttle}`;
  };

  // Format metric with unit
  const formatMetric = (value: number | null, unit: string) => {
    if (value === null || value === undefined) return "Not recorded";
    return `${value}${unit}`;
  };

  // Check if any metrics exist
  const hasMetrics =
    metrics?.sprintSpeed30m ||
    metrics?.agilityTTest ||
    metrics?.beepTestLevel ||
    metrics?.verticalJump;

  if (isLoading) {
    return <AthleteMetricsSectionSkeleton />;
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-5 h-5" />
              Athlete Metrics
            </CardTitle>
            {isOwner && (
              <Button
                onClick={handleOpenModal}
                disabled={
                  currentlyEditing !== null && currentlyEditing !== "metrics"
                }
                variant="outline"
                size="sm"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  currentlyEditing && currentlyEditing !== "metrics"
                    ? `Finish editing ${currentlyEditing} first`
                    : undefined
                }
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasMetrics && !isOwner ? (
            <p className="text-gray-500 text-center py-4">
              No metrics recorded yet.
            </p>
          ) : !hasMetrics && isOwner ? (
            <p className="text-gray-500 text-center py-4">
              Track your athletic performance by adding your metrics.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sprint Speed 30m */}
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">30m Sprint</p>
                  <p className="font-medium">
                    {formatMetric(metrics?.sprintSpeed30m ?? null, "s")}
                  </p>
                </div>
              </div>

              {/* Agility T-Test */}
              <div className="flex items-start gap-3">
                <Timer className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Agility T-Test</p>
                  <p className="font-medium">
                    {formatMetric(metrics?.agilityTTest ?? null, "s")}
                  </p>
                </div>
              </div>

              {/* Beep Test */}
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Beep Test</p>
                  <p className="font-medium">{formatBeepTest()}</p>
                </div>
              </div>

              {/* Vertical Jump */}
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Vertical Jump</p>
                  <p className="font-medium">
                    {formatMetric(metrics?.verticalJump ?? null, " cm")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <MetricsEditModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        uuid={profile.publicUuid}
        metrics={metrics}
      />
    </>
  );
}

/**
 * Loading skeleton for AthleteMetricsSection
 */
export function AthleteMetricsSectionSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
