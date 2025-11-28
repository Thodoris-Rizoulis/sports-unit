"use client";

import { useSession } from "next-auth/react";
import SessionGuard from "@/components/SessionGuard";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <SessionGuard>
      <div>
        <h1>Welcome to your Dashboard, {session?.user?.name}!</h1>
        <p>Role: {session?.user?.roleId}</p>
        {/* Add dashboard content here */}
      </div>
    </SessionGuard>
  );
}
