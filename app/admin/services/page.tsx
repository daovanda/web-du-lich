"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchPendingServices,
  fetchServices,
  fetchStats,
  updatePendingStatus,
  addPendingService,
  approvePendingAsService,
  rejectPendingService,
  toggleServiceStatus,
} from "./api";
import { PendingService, Service } from "./types";
import StatsOverview from "./components/StatsOverview";
import PendingTable from "./components/PendingTable";
import PendingForm from "./components/PendingForm";
import OfficialTable from "./components/OfficialTable";
import ApproveModal from "./components/ApproveModal";
import ServiceDetailModal from "./components/ServiceDetailModal";
import DetailedStats from "./components/DetailedStats";

export default function AdminServicesPage() {
  /* ---------------------- State ---------------------- */
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const [stats, setStats] = useState({
    totalServices: 0,
    totalPending: 0,
    totalConfirmed: 0,
    byType: {} as Record<string, number>,
  });

  // Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingService | null>(null);

  const [serviceDetailOpen, setServiceDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // 📌 Ref để cuộn xuống form
  const pendingFormRef = useRef<HTMLDivElement | null>(null);

  /* ---------------------- Fetch data ---------------------- */
  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    setLoadingPending(true);
    setLoadingServices(true);
    const [pending, svc, st] = await Promise.all([
      fetchPendingServices(),
      fetchServices("", "all", "all"),
      fetchStats(),
    ]);
    setPendingServices(pending);
    setServices(svc);
    setStats(st);
    setLoadingPending(false);
    setLoadingServices(false);
  }

  async function refreshPending() {
    setLoadingPending(true);
    const data = await fetchPendingServices();
    setPendingServices(data);
    setStats(await fetchStats());
    setLoadingPending(false);
  }

  async function refreshServices() {
    setLoadingServices(true);
    const data = await fetchServices("", "all", "all");
    setServices(data);
    setStats(await fetchStats());
    setLoadingServices(false);
  }

  /* ---------------------- Pending actions ---------------------- */
  const handleAddPending = async (form: any, avatarFile: File | null, additionalFiles: File[]) => {
    try {
      // Received avatarFile and additionalFiles from PendingForm
      await addPendingService(form, avatarFile, additionalFiles);
      alert("✅ Đã thêm dịch vụ chờ duyệt!");
      refreshPending();
    } catch (err: any) {
      alert(err.message || "❌ Lỗi khi thêm dịch vụ chờ duyệt!");
    }
  };

  const handleTogglePending = async (id: string, newStatus: string) => {
    await updatePendingStatus(id, newStatus);
    refreshPending();
  };

  const handleApproveModal = (p: PendingService) => {
    setSelectedPending(p);
    setApproveModalOpen(true);
  };

  /* ---------------------- Official actions ---------------------- */
  const handleToggleStatus = async (svc: Service, newStatus: string) => {
    await toggleServiceStatus(svc, newStatus);
    refreshServices();
  };

  /* ---------------------- Approve actions ---------------------- */
  const handleApprove = async (form: any, avatarFile: File | null, additionalFiles: File[]) => {
    try {
      if (!selectedPending) return;

      await approvePendingAsService(selectedPending, form, avatarFile, additionalFiles);
      alert("✅ Dịch vụ đã được phê duyệt!");
      setApproveModalOpen(false);
      setSelectedPending(null);
      refreshAll();
    } catch (err: any) {
      alert(err.message || "❌ Lỗi khi phê duyệt dịch vụ!");
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedPending) return;
    await rejectPendingService(selectedPending, reason);
    alert("🚫 Dịch vụ đã bị từ chối");
    setApproveModalOpen(false);
    setSelectedPending(null);
    refreshPending();
  };

  // 📍 Hàm cuộn xuống form pending
  const scrollToPendingForm = () => {
    pendingFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------------- JSX ---------------------- */
  return (
    <div className="bg-black text-gray-100 min-h-screen p-6 space-y-12 font-sans">
      <h1 className="text-3xl font-bold mb-2 text-center tracking-tight">
        Quản lý dịch vụ
      </h1>

      {/* 📊 Stats */}
      <StatsOverview {...stats} />
      <DetailedStats />

      {/* 📦 Danh sách dịch vụ */}
      <div className="space-y-12">
        {/* ✅ Pending Services */}
        <PendingTable
          pendingServices={pendingServices}
          loading={loadingPending}
          onApprove={handleApproveModal}
          onToggle={handleTogglePending}
          onDetail={handleApproveModal}
        />

        {/* 📍 Nút cuộn xuống form ngay dưới bảng pending */}
        <div className="flex justify-center">
          <button
            onClick={scrollToPendingForm}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow hover:opacity-90 transition"
          >
            ➕ Thêm dịch vụ chờ duyệt mới
          </button>
        </div>

        {/* ✅ Official Services */}
        <div className="space-y-4">
          <OfficialTable
            services={services}
            loading={loadingServices}
            onToggleStatus={handleToggleStatus}
            onDetail={(svc) => {
              setSelectedService(svc);
              setServiceDetailOpen(true);
            }}
          />
        </div>
      </div>

      {/* 📥 FORM - chỉ còn pending form */}
      <div
        ref={pendingFormRef}
        className="space-y-12 pt-12 border-t border-neutral-800"
      >
        <PendingForm onSubmit={handleAddPending} loading={false} />
      </div>

      {/* 📦 Pending Approve Modal */}
      <ApproveModal
        open={approveModalOpen}
        pending={selectedPending}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedPending(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        refresh={refreshPending}
      />

      {/* 📄 Service Detail Modal */}
      <ServiceDetailModal
        open={serviceDetailOpen}
        service={selectedService}
        onClose={() => {
          setServiceDetailOpen(false);
          setSelectedService(null);
        }}
      />
    </div>
  );
}
