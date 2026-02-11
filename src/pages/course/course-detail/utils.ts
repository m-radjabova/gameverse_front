import type { SubmissionOut } from "../../../types/types";

export type AssignmentFormState = {
  title: string;
  description: string;
  order: number;
  due_at: string;
  max_score: string;
  is_required: boolean;
};

export const DEFAULT_ASSIGNMENT_FORM: AssignmentFormState = {
  title: "",
  description: "",
  order: 1,
  due_at: "",
  max_score: "",
  is_required: true,
};

export const COURSE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop";

export function getYouTubeEmbedUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
      if (parts[0] === "shorts" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
    }
  } catch {
    return null;
  }

  return null;
}

export function formatDate(value?: string | null): string {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
}

export function getSubmitterLabel(item: SubmissionOut): string {
  return (
    item.full_name ||
    item.username ||
    item.user?.full_name ||
    item.user?.name ||
    item.user?.username ||
    item.user_id
  );
}
