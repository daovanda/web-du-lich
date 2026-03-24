"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { apiFormRequest, apiRequest } from "@/lib/apiClient";
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
  const [isVisible, setIsVisible] = useState(false);

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

    if (booking.deposit_status === "unpaid" && !booking.deposit_proof_url) return 1;
    if (booking.deposit_status === "unpaid" && booking.deposit_proof_url) return 2;
    if (booking.deposit_status === "paid" && booking.payment_status === "unpaid" && !booking.payment_proof_url) return 3;
    if (booking.deposit_status === "paid" && booking.payment_status === "unpaid" && booking.payment_proof_url) return 4;
    if (booking.payment_status === "paid") return 5;

    return 1;
  };

  const currentStep = getCurrentStep();
  const remainingAmount = (booking?.total_price || 0) - (booking?.deposit_amount || 0);

  useEffect(() => {
    if (!bookingId) {
      setError("Thiếu mã đơn đặt chỗ.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await apiRequest<{ data: Booking }>(`/api/bookings/${bookingId}`, {
          fallbackMessage: "Không tìm thấy thông tin thanh toán",
        });
        setBooking(res.data as Booking);
      } catch (err: any) {
        console.error("Payment fetch error:", err);
        setError("Không tìm thấy thông tin thanh toán.");
      } finally {
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    fetchBooking();

    const interval = setInterval(async () => {
      try {
        const res = await apiRequest<{ data: Booking }>(`/api/bookings/${bookingId}`);
        setBooking(res.data);
      } catch {
        // ignore polling errors
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const handleFileUpload = async (file: File) => {
    if (!file || !booking) return;

    setUploading(true);
    setError(null);

    try {
      const isFullPayment = currentStep === 3;

      const formData = new FormData();
      formData.append("bucketName", "payment_proofs");
      formData.append("folderPath", `${booking.id}`);
      formData.append("files", file);

      const uploadPayload = await apiFormRequest<{ data: string[] }>("/api/uploads/images", {
        method: "POST",
        formData,
        fallbackMessage: "Upload chứng từ thất bại",
      });
      const publicUrl = uploadPayload?.data?.[0];
      if (!publicUrl) throw new Error("Không lấy được URL upload");

      const updateField = isFullPayment ? "payment_proof_url" : "deposit_proof_url";
      await apiRequest(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ [updateField]: publicUrl }),
        fallbackMessage: "Không thể cập nhật bằng chứng thanh toán",
      });

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
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-neutral-400">Đang tải thông tin thanh toán...</span>
          </div>
        </div>
      </ResizableLayout>
    );
  }

  if (error || !booking) {
    return (
      <ResizableLayout>
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
          <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Có lỗi xảy ra</h3>
            <p className="text-neutral-400 text-sm">{error || "Không tìm thấy đơn đặt chỗ."}</p>
          </div>
        </div>
      </ResizableLayout>
    );
  }

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24 md:pt-8 space-y-6">
          
          {/* 🎨 Header Card */}
          <div
            className={`bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            {/* Title Section */}
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Thanh toán đơn hàng</h1>
                  <p className="text-sm text-neutral-500">Mã đơn: <span className="text-blue-400 font-semibold">{booking.booking_code}</span></p>
                </div>
              </div>

              {/* Progress Steps */}
              <PaymentProgress currentStep={currentStep} />
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-4">
              {/* Service Info */}
              <div className="flex items-start gap-3 p-4 bg-neutral-900/50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Dịch vụ</p>
                  <p className="text-white font-semibold">{booking.services?.title}</p>
                </div>
              </div>

              {/* Customer & Date Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Customer */}
                <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">Khách hàng</p>
                    <p className="text-white font-medium truncate">{booking.full_name}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">Số điện thoại</p>
                    <p className="text-white font-medium truncate">{booking.phone}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">Thời gian</p>
                    <p className="text-white font-medium text-sm">{booking.date_from} → {booking.date_to}</p>
                  </div>
                </div>

                {/* Quantity */}
                {booking.quantity && (
                  <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500">Số lượng</p>
                      <p className="text-white font-medium">
                        {booking.quantity} {booking.services?.type === "motorbike" ? "xe" : "người"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border-t border-neutral-800">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Tổng tiền</span>
                  <span className="text-white font-semibold text-lg">
                    {formatCurrency(booking.total_price)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Đặt cọc (30%)</span>
                  <div className="flex items-center gap-2">
                    {booking.deposit_status === "paid" && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Đã thanh toán
                      </span>
                    )}
                    <span
                      className={`font-semibold text-lg ${
                        booking.deposit_status === "paid"
                          ? "text-green-400 line-through opacity-50"
                          : "text-yellow-400"
                      }`}
                    >
                      {formatCurrency(booking.deposit_amount)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Còn lại</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Render step components */}
          <div className={`transition-all duration-700 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            {currentStep === 1 && (
              <Step1DepositPayment
                booking={booking}
                bankInfo={bankInfo}
                onFileUpload={handleFileUpload}
                uploading={uploading}
                isInitialLoad={!isVisible}
              />
            )}

            {currentStep === 2 && (
              <Step2WaitingDepositConfirm booking={booking} isInitialLoad={!isVisible} />
            )}

            {currentStep === 3 && (
              <Step3FullPayment
                booking={booking}
                bankInfo={bankInfo}
                remainingAmount={remainingAmount}
                onFileUpload={handleFileUpload}
                uploading={uploading}
                isInitialLoad={!isVisible}
              />
            )}

            {currentStep === 4 && (
              <Step4WaitingPaymentConfirm
                booking={booking}
                remainingAmount={remainingAmount}
                isInitialLoad={!isVisible}
              />
            )}

            {currentStep === 5 && <Step5Completed booking={booking} isInitialLoad={!isVisible} />}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </ResizableLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <ResizableLayout>
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-neutral-400">Đang tải...</span>
            </div>
          </div>
        </ResizableLayout>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}