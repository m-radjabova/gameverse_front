export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string | null;
  confirmPassword?: string;
  roles: string[];
  uid?: string;
  created_at?: string;
}

export interface GameComment {
  id: string;
  game_key: string;
  user_id?: string | null;
  username?: string | null;
  avatar?: string | null;
  rating: number;
  comment: string;
  created_at?: string;
  updated_at?: string;
  is_approved?: boolean;
  approved_at?: string | null;
  approved_by?: string | null;
  approver_username?: string | null;
}

export interface GameCommentOut {
  id: string;
  game_key: string;
  user_id?: string | null;
  username?: string | null;
  avatar?: string | null;
  rating: number;
  comment: string;
  created_at?: string;
  updated_at?: string;
  is_approved?: boolean;
  approved_at?: string | null;
  approved_by?: string | null;
  approver_username?: string | null;
}

export interface AdminGameComment extends GameComment {}


export interface GameRatingSummary {
  game_key: string;
  average_rating: number;
  ratings_count: number;
  my_rating?: number | null;
}

export interface GameLeaderboardEntry {
  id: string;
  game_key: string;
  participant_name: string;
  participant_mode: string;
  score: number;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}

export interface SubmitGameResultPayload {
  participant_name: string;
  participant_mode: string;
  score: number;
  metadata?: Record<string, unknown>;
}
