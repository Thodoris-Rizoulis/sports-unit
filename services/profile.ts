import pool from "@/lib/db-connection";
import { UserProfile, UserAttribute } from "@/types/profile";

// UserService class
export class UserService {
  static async getUserAttributes(
    userId: number
  ): Promise<UserAttribute | null> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT ua.*, u.role_id 
         FROM user_attributes ua 
         JOIN users u ON ua.user_id = u.id 
         WHERE ua.user_id = $1`,
        [userId]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `
        SELECT 
          u.id, 
          u.username, 
          ua.first_name, 
          ua.last_name, 
          ua.bio, 
          ua.location, 
          ua.cover_picture_url, 
          ua.profile_picture_url, 
          ua.open_to_opportunities,
          ua.sport_id,
          t.name as team_name
        FROM users u
        LEFT JOIN user_attributes ua ON u.id = ua.user_id
        LEFT JOIN teams t ON ua.team_id = t.id
        WHERE u.username = $1
      `,
        [userId]
      );

      if (res.rows.length === 0) return null;

      const row = res.rows[0];

      return {
        userId: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        username: row.username,
        teamId: row.team_id,
        teamName: row.team_name,
        location: row.location,
        bio: row.bio,
        coverImageUrl: row.cover_picture_url,
        profileImageUrl: row.profile_picture_url,
        openToOpportunities: row.open_to_opportunities || false,
        sportId: row.sport_id,
      };
    } finally {
      client.release();
    }
  }

  static async getUserIdByUsername(username: string): Promise<string | null> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );
      return res.rows[0]?.id || null;
    } finally {
      client.release();
    }
  }

  static async createUserProfile(
    userId: number,
    profileData: {
      firstName: string;
      lastName: string;
      bio?: string;
      location?: string;
      dateOfBirth?: string;
      height?: number;
      profilePictureUrl?: string;
      coverPictureUrl?: string;
      sportId: number;
      positionIds: number[];
      teamId?: number;
      openToOpportunities: boolean;
      strongFoot?: string;
      roleId: number;
      username?: string;
    }
  ): Promise<UserAttribute> {
    const client = await pool.connect();
    try {
      // Insert user attributes
      const insertQuery = `
        INSERT INTO user_attributes (
          user_id, first_name, last_name, bio, location, date_of_birth,
          height, profile_picture_url, cover_picture_url, sport_id,
          positions, team_id, open_to_opportunities, strong_foot
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const values = [
        userId,
        profileData.firstName,
        profileData.lastName,
        profileData.bio || null,
        profileData.location || null,
        profileData.dateOfBirth || null,
        profileData.height || null,
        profileData.profilePictureUrl || null,
        profileData.coverPictureUrl || null,
        profileData.sportId,
        JSON.stringify(profileData.positionIds),
        profileData.teamId || null,
        profileData.openToOpportunities,
        profileData.strongFoot || null,
      ];

      const result = await client.query(insertQuery, values);

      // Update user role and onboarding status
      await client.query(
        "UPDATE users SET role_id = $1, is_onboarding_complete = true WHERE id = $2",
        [profileData.roleId, userId]
      );

      // Update username if provided
      if (profileData.username) {
        await client.query("UPDATE users SET username = $1 WHERE id = $2", [
          profileData.username,
          userId,
        ]);
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async updateUserAttributes(
    userId: number,
    updates: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      location?: string;
      dateOfBirth?: string;
      height?: number;
      profilePictureUrl?: string;
      coverPictureUrl?: string;
      sportId?: number;
      positionIds?: number[];
      teamId?: number;
      openToOpportunities?: boolean;
      strongFoot?: string;
    }
  ): Promise<UserAttribute> {
    const client = await pool.connect();
    try {
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (updates.firstName !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        values.push(updates.firstName);
      }
      if (updates.lastName !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        values.push(updates.lastName);
      }
      if (updates.bio !== undefined) {
        updateFields.push(`bio = $${paramIndex++}`);
        values.push(updates.bio);
      }
      if (updates.location !== undefined) {
        updateFields.push(`location = $${paramIndex++}`);
        values.push(updates.location);
      }
      if (updates.dateOfBirth !== undefined) {
        updateFields.push(`date_of_birth = $${paramIndex++}`);
        values.push(updates.dateOfBirth);
      }
      if (updates.height !== undefined) {
        updateFields.push(`height = $${paramIndex++}`);
        values.push(updates.height);
      }
      if (updates.profilePictureUrl !== undefined) {
        updateFields.push(`profile_picture_url = $${paramIndex++}`);
        values.push(updates.profilePictureUrl);
      }
      if (updates.coverPictureUrl !== undefined) {
        updateFields.push(`cover_picture_url = $${paramIndex++}`);
        values.push(updates.coverPictureUrl);
      }
      if (updates.sportId !== undefined) {
        updateFields.push(`sport_id = $${paramIndex++}`);
        values.push(updates.sportId);
      }
      if (updates.positionIds !== undefined) {
        updateFields.push(`positions = $${paramIndex++}`);
        values.push(JSON.stringify(updates.positionIds));
      }
      if (updates.teamId !== undefined) {
        updateFields.push(`team_id = $${paramIndex++}`);
        values.push(updates.teamId);
      }
      if (updates.openToOpportunities !== undefined) {
        updateFields.push(`open_to_opportunities = $${paramIndex++}`);
        values.push(updates.openToOpportunities);
      }
      if (updates.strongFoot !== undefined) {
        updateFields.push(`strong_foot = $${paramIndex++}`);
        values.push(updates.strongFoot);
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      const updateQuery = `
        UPDATE user_attributes
        SET ${updateFields.join(", ")}
        WHERE user_id = $${paramIndex}
        RETURNING *
      `;
      values.push(userId);

      const result = await client.query(updateQuery, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
