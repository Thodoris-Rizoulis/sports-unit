import prisma from "@/lib/prisma";
import { ConnectionStatus } from "@prisma/client";
import { NotificationService } from "./notifications";
import { enforcePaginationLimit, enforcePaginationOffset } from "@/lib/utils";

// ========================================
// Types for ConnectionService
// ========================================

type Connection = {
  id: number;
  requesterId: number;
  recipientId: number;
  status: ConnectionStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type ConnectionListItem = {
  id: number;
  user: {
    id: number;
    username: string;
    publicUuid: string;
  };
  status: string;
  createdAt: Date | null;
};

type ConnectionWithUsers = {
  id: number;
  requester: {
    id: number;
    username: string;
    publicUuid: string;
  };
  recipient: {
    id: number;
    username: string;
    publicUuid: string;
  };
  status: ConnectionStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type ConnectionStatusResponse = {
  status: "none" | "connected" | "pending_sent" | "pending_received";
  connectionId?: number;
  requester?: {
    id: number;
    username: string;
    publicUuid: string;
  };
};

// ========================================
// Connection Service
// ========================================

export class ConnectionService {
  /**
   * Send a connection request from one user to another
   */
  static async sendRequest(
    requesterId: number,
    recipientId: number
  ): Promise<Connection> {
    // Validate not self-connection
    if (requesterId === recipientId) {
      throw new Error("Cannot send connection request to yourself");
    }

    const connection = await prisma.$transaction(async (tx) => {
      // Check if connection already exists
      const existing = await tx.connection.findFirst({
        where: {
          OR: [
            { requesterId, recipientId },
            { requesterId: recipientId, recipientId: requesterId },
          ],
        },
      });

      if (existing) {
        if (existing.status === "accepted") {
          throw new Error("Users are already connected");
        } else if (existing.status === "pending") {
          throw new Error("Connection request already exists");
        }
      }

      // Create new connection request
      return await tx.connection.create({
        data: {
          requesterId,
          recipientId,
          status: "pending",
        },
      });
    });

    // Create notification for the recipient (outside transaction for non-blocking)
    await NotificationService.create({
      recipientId,
      actorId: requesterId,
      type: "CONNECTION_REQUEST",
      entityType: "connection",
      entityId: connection.id,
    });

    return connection;
  }

  /**
   * Respond to a connection request (accept or decline)
   */
  static async respondToRequest(
    connectionId: number,
    action: "accept" | "decline"
  ): Promise<Connection> {
    const newStatus: ConnectionStatus =
      action === "accept" ? "accepted" : "declined";

    const connection = await prisma.connection.updateMany({
      where: {
        id: connectionId,
        status: "pending",
      },
      data: {
        status: newStatus,
      },
    });

    if (connection.count === 0) {
      throw new Error("Connection request not found or already responded to");
    }

    // Fetch the updated connection
    const updated = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!updated) {
      throw new Error("Connection not found after update");
    }

    return updated;
  }

  /**
   * Get user's connections with pagination
   */
  static async getConnections(
    userId: number,
    status?: ConnectionStatus | "pending_received",
    limit: number = 20,
    offset: number = 0
  ): Promise<ConnectionListItem[]> {
    // Enforce pagination limits
    const safeLimit = enforcePaginationLimit(limit);
    const safeOffset = enforcePaginationOffset(offset);

    // Build where clause
    const baseWhere = {
      OR: [{ requesterId: userId }, { recipientId: userId }],
    };

    let statusFilter = {};
    if (status === "pending_received") {
      statusFilter = {
        status: "pending",
        recipientId: userId,
      };
    } else if (status) {
      statusFilter = { status };
    }

    const connections = await prisma.connection.findMany({
      where: {
        ...baseWhere,
        ...statusFilter,
      },
      include: {
        requester: {
          select: { id: true, username: true, publicUuid: true },
        },
        recipient: {
          select: { id: true, username: true, publicUuid: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      skip: safeOffset,
    });

    return connections.map((c) => {
      // Determine the "other" user
      const otherUser = c.requesterId === userId ? c.recipient : c.requester;

      // Determine UI status
      let uiStatus: string;
      if (c.status === "pending") {
        uiStatus =
          c.requesterId === userId ? "pending_sent" : "pending_received";
      } else {
        uiStatus = c.status;
      }

      return {
        id: c.id,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          publicUuid: otherUser.publicUuid,
        },
        status: uiStatus,
        createdAt: c.createdAt,
      };
    });
  }

  /**
   * Get total count of connections for pagination
   */
  static async getConnectionsCount(
    userId: number,
    status?: ConnectionStatus | "pending_received"
  ): Promise<number> {
    const baseWhere = {
      OR: [{ requesterId: userId }, { recipientId: userId }],
    };

    let statusFilter = {};
    if (status === "pending_received") {
      statusFilter = {
        status: "pending",
        recipientId: userId,
      };
    } else if (status) {
      statusFilter = { status };
    }

    return prisma.connection.count({
      where: {
        ...baseWhere,
        ...statusFilter,
      },
    });
  }

  /**
   * Get pending connection requests received by user
   */
  static async getPendingRequests(
    userId: number
  ): Promise<ConnectionWithUsers[]> {
    const connections = await prisma.connection.findMany({
      where: {
        recipientId: userId,
        status: "pending",
      },
      include: {
        requester: {
          select: { id: true, username: true, publicUuid: true },
        },
        recipient: {
          select: { id: true, username: true, publicUuid: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return connections.map((c) => ({
      id: c.id,
      requester: {
        id: c.requester.id,
        username: c.requester.username,
        publicUuid: c.requester.publicUuid,
      },
      recipient: {
        id: c.recipient.id,
        username: c.recipient.username,
        publicUuid: c.recipient.publicUuid,
      },
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  /**
   * Get connection status between two users
   */
  static async getConnectionStatus(
    userId: number,
    targetUserId: number
  ): Promise<ConnectionStatusResponse> {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, recipientId: targetUserId },
          { requesterId: targetUserId, recipientId: userId },
        ],
      },
      include: {
        requester: {
          select: { id: true, username: true, publicUuid: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!connection) {
      return { status: "none" };
    }

    let status: ConnectionStatusResponse["status"];
    const direction = connection.requesterId === userId ? "sent" : "received";

    if (connection.status === "accepted") {
      status = "connected";
    } else if (connection.status === "pending") {
      status = direction === "sent" ? "pending_sent" : "pending_received";
    } else {
      status = "none"; // declined or other
    }

    const response: ConnectionStatusResponse = {
      status,
      connectionId: connection.id,
    };

    // Include requester info for pending_received
    if (status === "pending_received") {
      response.requester = {
        id: connection.requester.id,
        username: connection.requester.username,
        publicUuid: connection.requester.publicUuid,
      };
    }

    return response;
  }

  /**
   * Remove a connection
   */
  static async removeConnection(
    connectionId: number,
    userId: number
  ): Promise<void> {
    // Verify user is part of the connection
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        status: "accepted",
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
    });

    if (!connection) {
      throw new Error("Connection not found or not authorized to remove");
    }

    await prisma.connection.delete({
      where: { id: connectionId },
    });
  }

  /**
   * Cancel a pending connection request (only by the requester)
   */
  static async cancelRequest(
    connectionId: number,
    userId: number
  ): Promise<void> {
    // Verify user is the requester of a pending connection
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        status: "pending",
        requesterId: userId, // Only the requester can cancel
      },
    });

    if (!connection) {
      throw new Error(
        "Connection request not found or not authorized to cancel"
      );
    }

    // Delete the connection request
    await prisma.connection.delete({
      where: { id: connectionId },
    });

    // Delete the associated notification
    await NotificationService.deleteByAction(
      userId,
      "CONNECTION_REQUEST",
      connectionId
    );
  }
}
