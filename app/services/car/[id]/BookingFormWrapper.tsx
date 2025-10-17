"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BookingForm from "@/components/BookingForm";

type Props = {
  serviceId: string;
  price: string | null;
  serviceTitle: string;
};

export default function BookingFormWrapper({ serviceId, price, serviceTitle }: Props) {
  const [user, setUser] = useState<any>(null);
  const [privateRoomId, setPrivateRoomId] = useState<string | null>(null);

  // Lấy user hiện tại
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    })();
  }, []);

  // Lấy phòng chat private
  useEffect(() => {
    if (!user) return;

    const fetchPrivateRoom = async () => {
      const { data } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("type", "private")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setPrivateRoomId(data.id);
    };

    fetchPrivateRoom();
  }, [user]);

  // Callback để gửi chat sau khi booking thành công
  const handleSubmitSuccess = async (formData: any) => {
    if (!user || !privateRoomId) return;

    const messageText = `
🚗 **Đơn đặt xe mới**
Dịch vụ: ${serviceTitle}
Giá: ${price ?? "Liên hệ"}
Họ tên: ${formData.fullName}
Số điện thoại: ${formData.phone}
Ngày thuê: ${formData.dateFrom && formData.dateTo ? `${formData.dateFrom} - ${formData.dateTo}` : "Chưa chọn"}
Ghi chú: ${formData.note || "Không có"}

Trạng thái: ⏳ *Đang chờ xác nhận*
    `.trim();

    await supabase.from("chat_messages").insert({
      room_id: privateRoomId,
      sender_id: user.id,
      content: messageText,
      from_admin: false,
    });
  };

  if (!user) return null;

  // Truyền prop onSubmitSuccess thay vì onSubmit
  return (
    <BookingForm
      serviceId={serviceId}
      price={price}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
}
