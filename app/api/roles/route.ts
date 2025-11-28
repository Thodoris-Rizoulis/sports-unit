import { RolesService } from "@/services/roles";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const roles = await RolesService.getRoles();
    return createSuccessResponse(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return createErrorResponse("Failed to fetch roles", 500);
  }
}
