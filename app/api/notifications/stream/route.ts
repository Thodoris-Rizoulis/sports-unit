/**
 * GET /api/notifications/stream
 *
 * Server-Sent Events (SSE) endpoint for real-time notification updates.
 * Sends the current unread count every 5 seconds.
 * Clients use this to receive near-real-time badge updates.
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { NotificationService } from "@/services/notifications";

export const dynamic = "force-dynamic";

// Polling interval in milliseconds (5 seconds per spec)
const POLL_INTERVAL = 5000;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = parseInt(session.user.id);

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;

      // Helper to send SSE event safely
      const sendEvent = (data: object): boolean => {
        if (isClosed) return false;
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
          return true;
        } catch {
          // Controller is closed, mark as closed
          isClosed = true;
          return false;
        }
      };

      // Send initial connection event
      sendEvent({ type: "connected", timestamp: Date.now() });

      // Track if stream is active
      let isActive = true;

      // Handle client disconnect via AbortSignal
      request.signal.addEventListener("abort", () => {
        isActive = false;
        isClosed = true;
      });

      // Polling loop
      const pollNotifications = async () => {
        while (isActive && !isClosed) {
          try {
            const count = await NotificationService.getUnreadCount(userId);
            const sent = sendEvent({
              type: "unread-count",
              count,
              timestamp: Date.now(),
            });
            if (!sent) break; // Exit loop if send failed
          } catch (error) {
            console.error("SSE polling error:", error);
            const sent = sendEvent({
              type: "error",
              message: "Failed to fetch notifications",
              timestamp: Date.now(),
            });
            if (!sent) break; // Exit loop if send failed
          }

          // Wait for next poll interval
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }

        // Safely close controller
        if (!isClosed) {
          try {
            controller.close();
          } catch {
            // Already closed, ignore
          }
          isClosed = true;
        }
      };

      // Start polling (don't await - runs in background)
      pollNotifications();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
