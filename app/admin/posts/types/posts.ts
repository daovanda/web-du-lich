// app/admin/posts/types/posts.ts
export type Post = {
  id: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  author_avatar: string | null;
  service_id: string | null;
  service_title: string | null;
  service_type: string | null;
  image_urls: string[] | null; // Đảm bảo view SQL dùng COALESCE
  status: "pending" | "approved" | "rejected";
};