import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-muted-foreground/20 mb-4">
          404
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page Not Found
        </h1>

        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>

          <Button variant="outline" asChild className="gap-2">
            <Link href="/discovery">
              <Search className="w-4 h-4" />
              Discover
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
