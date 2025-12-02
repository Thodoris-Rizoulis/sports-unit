"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Users } from "lucide-react";

interface WelcomeHeroProps {
  onCreatePostClick?: () => void;
}

export function WelcomeHero({ onCreatePostClick }: WelcomeHeroProps) {
  const { data: session } = useSession();

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to dominate your sport?",
      "Your next big opportunity awaits",
      "Connect, compete, conquer",
      "Level up your game",
      "Build your sports legacy",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (!session?.user) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-primary/20">
              <AvatarImage
                src={session.user.image || ""}
                alt={`${session.user.name}'s profile`}
              />
              <AvatarFallback className="text-2xl md:text-3xl bg-primary text-primary-foreground">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center md:text-left">
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {session.user.name?.split(" ")[0]}!
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium">
                  {getMotivationalMessage()}
                </p>
              </div>

              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                Share your sports journey, connect with athletes, and discover
                new opportunities in your sport.
              </p>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={onCreatePostClick}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Share Your Story
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative Icons */}
          <div className="hidden md:flex flex-col gap-3 opacity-20">
            <Target className="h-8 w-8 text-primary" />
            <Users className="h-8 w-8 text-secondary" />
            <Trophy className="h-8 w-8 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
