export type ImageItem = { original: File; cropped: File; preview: string };


export type UserPost = {
  id: string;
  caption: string | null;
  created_at: string;
  status: "pending" | "approved" | "rejected" | null;
  author_id: string;
  custom_service_link: string | null;
  service_id: string | null;
  service_title: string | null;
  service_type: string | null;
  image_urls: string[];
};