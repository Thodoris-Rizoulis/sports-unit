// Database schema type definitions

export interface Sport {
  id: number;
  name: string;
  created_at: Date;
}

export interface Position {
  id: number;
  sport_id: number;
  name: string;
  created_at: Date;
}

export interface Team {
  id: number;
  sport_id: number;
  name: string;
  created_at: Date;
}

export interface UserAttribute {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  bio?: string;
  location?: string;
  date_of_birth?: Date;
  height?: number;
  profile_picture_url?: string;
  cover_picture_url?: string;
  sport_id?: number;
  positions?: number[]; // JSON array of position ids
  team_id?: number;
  open_to_opportunities: boolean;
  strong_foot?: string;
  created_at: Date;
  updated_at: Date;
}
