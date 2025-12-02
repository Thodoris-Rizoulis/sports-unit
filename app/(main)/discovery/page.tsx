"use client";

import { useSession } from "next-auth/react";
import SessionGuard from "@/components/SessionGuard";

export default function Discovery() {
  const { data: session } = useSession();

  return (
    <SessionGuard>
      <div>
        <h1>Welcome to Discovery, {session?.user?.name}!</h1>
        <p>Role: {session?.user?.roleId}</p>
        {/* Add discovery content here */}
      </div>
    </SessionGuard>
  );
}
