"use client";

import { useEffect, useRef, useState } from "react";
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

  // Chống spam: rate limit 5s giữa các lần submit thành công
  const lastSubmitAtRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const RATE_LIMIT_MS = 5000;

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

  // Map label hiển thị thân thiện cho payment_method/payment_status
  const methodLabel: Record<string, string> = {
    cash: "Tiền mặt",
    credit_card: "Thẻ tín dụng",
    momo: "MoMo",
    zalopay: "ZaloPay",
  };

  const statusLabel: Record<string, string> = {
    unpaid: "Chưa thanh toán",
    paid: "Đã thanh toán",
    refunded: "Đã hoàn tiền",
  };

  const formatCurrency = (n?: number | null) => {
    if (n == null || Number.isNaN(n)) return "—";
    return `${new Intl.NumberFormat("vi-VN").format(n)} đ`;
  };

  // Callback để gửi chat sau khi booking thành công
  const handleSubmitSuccess = async (formData: any) => {
    // Chặn spam: nếu đang xử lý hoặc gửi trong vòng RATE_LIMIT_MS thì bỏ qua
    const now = Date.now();
    if (isProcessingRef.current) return;
    if (now - lastSubmitAtRef.current < RATE_LIMIT_MS) return;

    isProcessingRef.current = true;

    try {
      // Đảm bảo có phòng private; nếu chưa có thì cố gắng tạo nhanh
      let roomId = privateRoomId;
      if (!roomId && user) {
        const { data: existing } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("type", "private")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing?.id) {
          roomId = existing.id;
          setPrivateRoomId(existing.id);
        } else {
          const { data: created } = await supabase
            .from("chat_rooms")
            .insert({ type: "private", user_id: user.id })
            .select("id")
            .single();
          roomId = created?.id ?? null;
          if (created?.id) setPrivateRoomId(created.id);
        }
      }

      if (!user || !roomId) {
        return;
      }

      // Lấy dữ liệu từ BookingForm (đã được bổ sung)
      const bookingId: string | undefined = formData?.bookingId;
      const fullName: string = formData?.fullName ?? formData?.name ?? "—";
      const phone: string = formData?.phone ?? "—";
      const dateFrom: string | null = formData?.dateFrom ?? null;
      const dateTo: string | null = formData?.dateTo ?? null;
      const note: string = formData?.note ?? "Không có";

      // Các trường mới từ BookingForm
      const payment_status_raw: string = (formData?.payment_status ?? "").toString().trim().toLowerCase();
      const payment_method_raw: string = (formData?.payment_method ?? "").toString().trim().toLowerCase();
      const total_price_num: number | null = formData?.total_price ?? null;
      const unitPrice_num: number | null = formData?.unitPrice ?? null;
      const nights: number | null = formData?.nights ?? null;

      // Chuẩn hóa fallback để khớp ràng buộc DB
      const payment_status = ["unpaid", "paid", "refunded"].includes(payment_status_raw)
        ? payment_status_raw
        : "unpaid";

      const payment_method = ["cash", "credit_card", "momo", "zalopay"].includes(payment_method_raw)
        ? payment_method_raw
        : "cash";

      const messageLines: string[] = [
        "🚗 Đơn đặt xe mới",
        `- Dịch vụ: ${serviceTitle}`,
        `- Giá/đêm: ${unitPrice_num != null ? formatCurrency(unitPrice_num) : (price ?? "Liên hệ")}`,
        `- Số đêm: ${nights ?? "—"}`,
        `- Tạm tính: ${formatCurrency(total_price_num)}`,
        `- Họ tên: ${fullName}`,
        `- Số điện thoại: ${phone}`,
        `- Ngày thuê: ${dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : "Chưa chọn"}`,
        `- Ghi chú: ${note}`,
        `- Phương thức thanh toán: ${methodLabel[payment_method] ?? payment_method}`,
        `- Trạng thái thanh toán: ${statusLabel[payment_status] ?? payment_status}`,
        `- Trạng thái: Đang chờ xác nhận`,
      ];

      if (bookingId) {
        messageLines.splice(1, 0, `- Mã đặt: ${bookingId}`);
      }

      const messageText = messageLines.join("\n");

      await supabase.from("chat_messages").insert({
        room_id: roomId,
        sender_id: user.id,
        content: messageText,
        from_admin: false,
      });

      lastSubmitAtRef.current = now;
    } finally {
      isProcessingRef.current = false;
    }
  };

  if (!user) return null;

  return (
    <BookingForm
      serviceId={serviceId}
      price={price}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
}