import { RolesService } from "@/services/roles";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) {
      return createErrorResponse("Invalid role ID", 400);
    }

    const role = await RolesService.getRoleById(roleId);
    if (!role) {
      return createErrorResponse("Role not found", 404);
    }

    return createSuccessResponse(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    return createErrorResponse("Failed to fetch role", 500);
  }
}
