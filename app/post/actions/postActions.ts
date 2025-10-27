import { supabase } from "@/lib/supabase";
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
  serviceId: string | null,
  images: ImageItem[],
  setLoading: (loading: boolean) => void,
  setCaption: (caption: string) => void,
  setImages: (images: ImageItem[]) => void,
  setCurrentIndex: (index: number) => void,
  uploadImages: (postId: string, images: ImageItem[]) => Promise<string[]>
) => {
  if (!user) {
    toast.error("Bạn cần đăng nhập.");
    return;
  }
  if (!caption.trim()) {
    toast.error("Vui lòng nhập nội dung.");
    return;
  }
  if (!user.id || !isValidUUID(user.id)) {
    toast.error("ID người dùng không hợp lệ.");
    return;
  }
  if (serviceId && !isValidUUID(serviceId)) {
    toast.error("ID dịch vụ không hợp lệ.");
    return;
  }

  setLoading(true);
  try {
    console.log('Inserting post:', { caption, author_id: user.id, service_id: serviceId });
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({ caption, status: "pending", author_id: user.id, service_id: serviceId })
      .select()
      .single();

    if (postError || !post) {
      throw new Error(`Lỗi khi tạo bài đăng: ${postError?.message || "Không nhận được dữ liệu bài đăng"}`);
    }

    console.log('Uploading images for post:', post.id);
    const urls = await uploadImages(post.id, images);

    if (urls.length > 0) {
      const { error: imageError } = await supabase.from("post_images").insert(
        urls.map((url, index) => ({
          post_id: post.id,
          image_url: url,
          order_index: index,
        }))
      );
      if (imageError) {
        throw new Error(`Lỗi khi lưu ảnh: ${imageError.message}`);
      }
    }

    toast.success("✅ Bài đăng đã gửi.");
    setCaption("");
    setImages([]);
    setCurrentIndex(0);
  } catch (error) {
    console.error("Error in createPost:", error);
    const message = error instanceof Error ? error.message : (error ? String(error) : "Không xác định");
    toast.error(`Có lỗi xảy ra: ${message}`);
  } finally {
    setLoading(false);
  }
};


export const deletePost = async (postId: string, userId: string) => {
  try {
    // ✅ Kiểm tra quyền người xóa
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", postId)
      .single();

    if (postError || !post) throw new Error("Bài đăng không tồn tại");
    if (post.author_id !== userId) throw new Error("Bạn không có quyền xóa bài đăng này");

    // ✅ Thư mục chứa ảnh = chính là postId (KHÔNG có /)
    const folder = postId;

    // ✅ Lấy danh sách file trong thư mục
    const { data: files, error: listError } = await supabase.storage
      .from("post_images")
      .list(folder, { limit: 100 });

    console.log("📂 Files trong bucket:", files);
    console.log("⚠️ List error:", listError);

    // ✅ Xoá từng file trong thư mục
    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${folder}/${file.name}`);

      console.log("🗑️ Sẽ xoá file:", filePaths);

      const { error: removeError } = await supabase.storage
        .from("post_images")
        .remove(filePaths);

      console.log("🔍 Kết quả xoá file:", removeError);
      if (removeError) throw new Error(`Không thể xóa ảnh: ${removeError.message}`);
    }

    // ✅ Xoá thư mục rỗng sau khi xoá ảnh
    const { error: folderRemoveError } = await supabase.storage
      .from("post_images")
      .remove([folder]);

    console.log("📁 Kết quả xoá thư mục:", folderRemoveError);

    // ✅ Xoá bài đăng
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) throw new Error(`Lỗi khi xóa bài đăng: ${deleteError.message}`);

    toast.success("✅ Đã xóa bài đăng và ảnh liên quan");
    return { success: true };

  } catch (error) {
    console.error("🚨 Error in deletePost:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi không xác định");
    throw error;
  }
};
