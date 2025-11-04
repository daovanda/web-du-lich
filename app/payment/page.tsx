"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";
import PaymentProgress from "./components/PaymentProgress";
import Step1DepositPayment from "./components/Step1DepositPayment";
import Step2WaitingDepositConfirm from "./components/Step2WaitingDepositConfirm";
import Step3FullPayment from "./components/Step3FullPayment";
import Step4WaitingPaymentConfirm from "./components/Step4WaitingPaymentConfirm";
import Step5Completed from "./components/Step5Completed";

type Booking = {
  id: string;
  booking_code: string | null;
  full_name: string | null;
  phone: string | null;
  date_from: string;
  date_to: string;
  additional_requests: string | null;
  status: string;
  total_price: number | null;
  deposit_amount: number | null;
  deposit_percentage: number | null;
  deposit_status: string;
  deposit_proof_url: string | null;
  payment_proof_url: string | null;
  payment_status: string;
  services?: {
    title: string;
    price: string | null;
    type: string | null;
  } | null;
  quantity: number | null;
};

function PaymentContent() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Thông tin chuyển khoản
  const bankInfo = {
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "NGUYEN VAN B",
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xác định bước hiện tại
  const getCurrentStep = (): number => {
    if (!booking) return 1;

    // Bước 1: Đặt cọc - chưa có proof URL
    if (booking.deposit_status === "unpaid" && !booking.deposit_proof_url) {
      return 1;
    }

    // Bước 2: Chờ xác nhận đặt cọc - đã upload proof nhưng chưa được admin xác nhận
    if (booking.deposit_status === "unpaid" && booking.deposit_proof_url) {
      return 2;
    }

    // Bước 3: Thanh toán toàn bộ - đặt cọc đã paid, chưa thanh toán full
    if (booking.deposit_status === "paid" && booking.payment_status === "unpaid" && !booking.payment_proof_url) {
      return 3;
    }

    // Bước 4: Chờ xác nhận thanh toán toàn bộ
    if (booking.deposit_status === "paid" && booking.payment_status === "unpaid" && booking.payment_proof_url) {
      return 4;
    }

    // Bước 5: Hoàn thành
    if (booking.payment_status === "paid" ) {
      return 5;
    }

    return 1;
  };

  const currentStep = getCurrentStep();
  const remainingAmount = (booking?.total_price || 0) - (booking?.deposit_amount || 0);

  useEffect(() => {
    if (!bookingId) {
      setError("Thiếu mã đơn đặt chỗ.");
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*, services(title, price, type)")
          .eq("id", bookingId)
          .single();

        if (error) throw error;
        setBooking(data as Booking);
      } catch (err: any) {
        console.error("Payment fetch error:", err);
        setError("Không tìm thấy thông tin thanh toán.");
      } finally {
        setLoading(false);
        setTimeout(() => setIsInitialLoad(false), 150);
      }
    };

    fetchBooking();

    // Real-time subscription để cập nhật trạng thái
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          setBooking((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  const handleFileUpload = async (file: File) => {
    if (!file || !booking) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const isFullPayment = currentStep === 3;
      const fileName = `${isFullPayment ? "payment" : "deposit"}_${Date.now()}.${fileExt}`;
      const filePath = `payment_proofs/${booking.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("payment_proofs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment_proofs").getPublicUrl(filePath);

      // Update booking with correct field
      const updateField = isFullPayment ? "payment_proof_url" : "deposit_proof_url";
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ [updateField]: publicUrl })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // Update local state
      setBooking({ ...booking, [updateField]: publicUrl });

      alert("Đã tải lên thành công! Vui lòng đợi admin xác nhận.");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Tải ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <ResizableLayout>
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-b-2 border-white/60 animate-spin" />
            <span className="text-white/80">Đang tải thông tin thanh toán...</span>
          </div>
        </div>
      </ResizableLayout>
    );
  }

  if (error || !booking) {
    return (
      <ResizableLayout>
        <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
          {error || "Không tìm thấy đơn đặt chỗ."}
        </div>
      </ResizableLayout>
    );
  }

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div
            className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 mb-6 transition-all duration-700 ease-out ${
              isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
            }`}
          >
            <h1 className="text-3xl font-bold text-white mb-6">Thanh toán đơn hàng</h1>

            <PaymentProgress currentStep={currentStep} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <span className="text-gray-400">Mã đơn:</span>
                <span className="ml-2 font-bold text-blue-400">{booking.booking_code}</span>
              </div>
              <div>
                <span className="text-gray-400">Dịch vụ:</span>
                <span className="ml-2 font-semibold text-white">{booking.services?.title}</span>
              </div>
              <div>
                <span className="text-gray-400">Khách hàng:</span>
                <span className="ml-2 font-semibold text-white">{booking.full_name}</span>
              </div>
              <div>
                <span className="text-gray-400">SĐT:</span>
                <span className="ml-2 font-semibold text-white">{booking.phone}</span>
              </div>
              <div>
                <span className="text-gray-400">Thời gian:</span>
                <span className="ml-2 font-semibold text-white">
                  {booking.date_from} → {booking.date_to}
                </span>
              </div>
              {booking.quantity && (
                <div>
                  <span className="text-gray-400">Số lượng:</span>
                  <span className="ml-2 font-semibold text-white">
                    {booking.quantity} {booking.services?.type === "motorbike" ? "xe" : "người"}
                  </span>
                </div>
              )}
              <div className="md:col-span-2 border-t border-white/10 pt-3 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Tổng tiền:</span>
                  <span className="font-semibold text-white text-lg">
                    {formatCurrency(booking.total_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Đặt cọc (30%):</span>
                  <span
                    className={`font-bold text-lg ${
                      booking.deposit_status === "paid"
                        ? "text-green-400 line-through"
                        : "text-yellow-400"
                    }`}
                  >
                    {formatCurrency(booking.deposit_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Còn lại:</span>
                  <span className="font-bold text-red-400 text-xl">
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Render step components */}
          {currentStep === 1 && (
            <Step1DepositPayment
              booking={booking}
              bankInfo={bankInfo}
              onFileUpload={handleFileUpload}
              uploading={uploading}
              isInitialLoad={isInitialLoad}
            />
          )}

          {currentStep === 2 && (
            <Step2WaitingDepositConfirm booking={booking} isInitialLoad={isInitialLoad} />
          )}

          {currentStep === 3 && (
            <Step3FullPayment
              booking={booking}
              bankInfo={bankInfo}
              remainingAmount={remainingAmount}
              onFileUpload={handleFileUpload}
              uploading={uploading}
              isInitialLoad={isInitialLoad}
            />
          )}

          {currentStep === 4 && (
            <Step4WaitingPaymentConfirm
              booking={booking}
              remainingAmount={remainingAmount}
              isInitialLoad={isInitialLoad}
            />
          )}

          {currentStep === 5 && <Step5Completed booking={booking} isInitialLoad={isInitialLoad} />}

          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <ResizableLayout>
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            Đang tải...
          </div>
        </ResizableLayout>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}