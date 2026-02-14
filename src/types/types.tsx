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

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export type CourseOut = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  level?: string | null;
  price: number;
  duration: number;
  rating: number;
  duration_sec?: number | null;
  category_id: string;
};

export type LessonOut = {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  order: number;
  is_free: boolean;
  video_url: string;
  duration_sec: number;
  duration?: number | null;
  rating?: number | null;
};

export type CourseApi = CourseOut;
export type LessonApi = LessonOut;

export interface CourseRatingSummary {
  course_id: string;
  average_rating: number;
  ratings_count: number;
  my_rating?: number | null;
}

export interface AssignmentOut {
  id: string;
  lesson_id: string;
  title: string;
  description?: string | null;
  order: number;
  due_at?: string | null;
  max_score?: number | null;
  is_required: boolean;
  created_at: string;
}

export interface SubmissionOut {
  id: string;
  assignment_id: string;
  user_id: string;
  username?: string | null;
  full_name?: string | null;
  user?: {
    id?: string;
    username?: string | null;
    full_name?: string | null;
    name?: string | null;
  } | null;
  text_answer?: string | null;
  file_url?: string | null;
  status: string;
  score?: number | null;
  submitted_at: string;
  graded_at?: string | null;
}

export interface LessonProgressOut {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  progress_percent: number;
  last_position_sec: number;
  is_completed: boolean;
  updated_at: string;
}

export interface CourseProgressOut {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  lessons: LessonProgressOut[];
}

export interface LessonChatThreadOut {
  id: string;
  lesson_id: string;
  student_id: string;
  student_username?: string | null;
  created_at: string;
}

export interface LessonChatMessageOut {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_username?: string | null;
  text: string;
  created_at: string;
}
