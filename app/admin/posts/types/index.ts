export type Post = {
  id: string;
  caption: string | null;
  author_id: string | null;
  author_name: string | null;
  author_avatar: string | null;
  service_id: string | null;
  service_title: string | null;
  service_type: string | null;
  image_urls: string[];
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

export type PostStats = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};
