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
}


export interface GameRatingSummary {
  game_key: string;
  average_rating: number;
  ratings_count: number;
  my_rating?: number | null;
}
