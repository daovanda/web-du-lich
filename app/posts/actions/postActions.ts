import { apiRequest } from "@/lib/apiClient";
import { ImageItem } from "../types";
import { toast } from 'react-hot-toast';

const isValidUUID = (str: string | null) => {
  if (!str) return true;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const createPost = async (
  user: any,
  caption: string,
  serviceIdOrLink: string | null,
  images: ImageItem[],
  setLoading: (loading: boolean) => void,
  setCaption: (caption: string) => void,
  setImages: (images: ImageItem[]) => void,
  setCurrentIndex: (index: number) => void,
  uploadImages: (postId: string, images: ImageItem[]) => Promise<string[]>
): Promise<{ success: boolean; message: string }> => {
  if (!user) return { success: false, message: "Bạn cần đăng nhập." };
  if (!caption.trim() && images.length === 0)
  return { success: false, message: "Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh." };
  if (!user.id || !isValidUUID(user.id)) return { success: false, message: "ID người dùng không hợp lệ." };

  setLoading(true);

  try {
    let service_id: string | null = null;
    let custom_service_link: string | null = null;

    if (serviceIdOrLink) {
      // 🧩 Trường hợp là UUID
      if (isValidUUID(serviceIdOrLink)) {
        service_id = serviceIdOrLink;
      }
      // 🧩 Trường hợp là URL /services/.../{uuid}
      else if (/^\/?services\//i.test(serviceIdOrLink)) {
        const parts = serviceIdOrLink.split("/");
        const possibleUUID = parts[parts.length - 1];
        if (isValidUUID(possibleUUID)) {
          service_id = possibleUUID;
          custom_service_link = serviceIdOrLink;
        } else {
          // fallback nếu không đúng cấu trúc
          custom_service_link = serviceIdOrLink;
        }
      }
      // 🧩 Trường hợp là URL ngoài (custom link)
      else {
        custom_service_link = serviceIdOrLink;
      }
    }

    // 🪄 Tạo bài đăng
    const created = await apiRequest<{ data: { id: string } }>("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        caption,
        service_id,
        custom_service_link,
      }),
      fallbackMessage: "Không thể tạo bài đăng",
    });
    const post = created.data;

    // 🖼 Upload ảnh
    const urls = await uploadImages(post.id, images);
    if (urls.length > 0) {
      await apiRequest(`/api/posts/${post.id}/images`, {
        method: "POST",
        body: JSON.stringify({ urls }),
        fallbackMessage: "Không thể lưu ảnh cho bài đăng",
      });
    }

    // ✅ Reset form
    setCaption("");
    setImages([]);
    setCurrentIndex(0);

    return { success: true, message: "✅ Bài đăng đã được gửi thành công." };
  } catch (error) {
    console.error("Error in createPost:", error);
    const message = error instanceof Error ? error.message : "Có lỗi không xác định.";
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};





export const deletePost = async (postId: string) => {
  try {
    await apiRequest(`/api/posts/${postId}`, {
      method: "DELETE",
      fallbackMessage: "Không thể xóa bài đăng",
    });

    toast.success("✅ Đã xóa bài đăng và ảnh liên quan");
    return { success: true };

  } catch (error) {
    console.error("🚨 Error in deletePost:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi không xác định");
    throw error;
  }
};
