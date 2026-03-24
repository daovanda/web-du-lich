import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabase();

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Bài đăng không tồn tại" }, { status: 404 });
    }
    if (post.author_id !== user.id) {
      return NextResponse.json({ error: "Bạn không có quyền xóa bài đăng này" }, { status: 403 });
    }

    const folder = id;
    const { data: files } = await supabase.storage.from("post_images").list(folder, { limit: 100 });

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${folder}/${file.name}`);
      const { error: removeError } = await supabase.storage.from("post_images").remove(filePaths);
      if (removeError) {
        return NextResponse.json({ error: removeError.message }, { status: 500 });
      }
    }

    await supabase.storage.from("post_images").remove([folder]);

    const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
