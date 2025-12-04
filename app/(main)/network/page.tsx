"use client";

import { useSession } from "next-auth/react";
import SessionGuard from "@/components/SessionGuard";
import { ConnectionsList } from "@/components/connections/ConnectionsList";

export default function Network() {
  const { data: session } = useSession();

  return (
    <SessionGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Network
          </h1>
          <p className="text-muted-foreground">
            Manage your connections and network
          </p>
        </div>

        <div className="space-y-8">
          <ConnectionsList
            status="pending_received"
            title="Pending Requests"
            emptyMessage="No pending requests"
            showPagination={true}
          />

          <ConnectionsList
            status="accepted"
            title="My Connections"
            emptyMessage="No connections yet. Start connecting with other users!"
            showPagination={true}
          />
        </div>
      </div>
    </SessionGuard>
  );
}
