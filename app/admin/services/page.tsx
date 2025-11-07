"use client";

import { useEffect, useState } from "react";
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

type TabType = "pending" | "services" | "addNew";

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

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  // Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingService | null>(null);

  const [serviceDetailOpen, setServiceDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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
      await addPendingService(form, avatarFile, additionalFiles);
      alert("✅ Đã thêm dịch vụ chờ duyệt!");
      refreshPending();
      setActiveTab("pending");
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

  // Tab configuration
  const tabs = [
    {
      id: "pending" as TabType,
      label: "Chờ duyệt",
      icon: "⏳",
      count: stats.totalPending,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
    },
    {
      id: "services" as TabType,
      label: "Dịch vụ",
      icon: "✅",
      count: stats.totalConfirmed,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
    },
    {
      id: "addNew" as TabType,
      label: "Thêm mới",
      icon: "➕",
      count: null,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30",
      textColor: "text-violet-400",
    },
  ];

  /* ---------------------- JSX ---------------------- */
  return (
    <div className="bg-black text-gray-100 min-h-screen p-4 md:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Quản lý dịch vụ
        </h1>
        <p className="text-sm md:text-base text-gray-400">Quản lý và phê duyệt các dịch vụ du lịch</p>
      </div>

      {/* Stats Overview - Always visible */}
      <StatsOverview {...stats} />

      {/* Detailed Stats - Always visible below overview */}
      <DetailedStats />

      {/* Full-Width Rounded Tabs */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex gap-2 p-2 bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-xl">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
                  ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-[1.02]`
                      : `${tab.bgColor} ${tab.textColor} hover:scale-[1.01] hover:shadow-md border ${tab.borderColor}`
                  }
                `}
              >
                <span className="text-lg md:text-xl">{tab.icon}</span>
                <span className="text-sm md:text-base font-semibold">{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`
                      px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center
                      ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-neutral-800 text-gray-300"
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
                
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-b-xl" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with smooth transition */}
      <div className="relative min-h-[500px]">
        <div className="absolute inset-0">
          {/* Pending Services Tab */}
          {activeTab === "pending" && (
            <div className="space-y-4 animate-slideIn">
              <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg">
                    ⏳
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Dịch vụ chờ duyệt</h2>
                    <p className="text-sm text-amber-400">{stats.totalPending} dịch vụ đang chờ</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("addNew")}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm rounded-full hover:shadow-lg transition-all hover:scale-105"
                >
                  ➕ Thêm mới
                </button>
              </div>
              <PendingTable
                pendingServices={pendingServices}
                loading={loadingPending}
                onApprove={handleApproveModal}
                onToggle={handleTogglePending}
                onDetail={handleApproveModal}
              />
            </div>
          )}

          {/* Official Services Tab */}
          {activeTab === "services" && (
            <div className="space-y-4 animate-slideIn">
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-xl shadow-lg">
                    ✅
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Dịch vụ chính thức</h2>
                    <p className="text-sm text-emerald-400">{stats.totalConfirmed} dịch vụ đang hoạt động</p>
                  </div>
                </div>
              </div>
              <OfficialTable
                services={services}
                loading={loadingServices}
                onToggleStatus={handleToggleStatus}
                onDetail={(svc) => {
                  setSelectedService(svc);
                  setServiceDetailOpen(true);
                }}
                onRefresh={refreshServices}
              />
            </div>
          )}

          {/* Add New Service Tab */}
          {activeTab === "addNew" && (
            <div className="space-y-4 animate-slideIn">
              <div className="flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg">
                    ➕
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Thêm dịch vụ mới</h2>
                    <p className="text-sm text-violet-400">Tạo dịch vụ chờ duyệt</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("pending")}
                  className="px-4 py-2 bg-neutral-800 text-gray-300 text-sm rounded-full hover:bg-neutral-700 transition-all"
                >
                  ← Quay lại
                </button>
              </div>
              <PendingForm onSubmit={handleAddPending} loading={false} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

      <ServiceDetailModal
        open={serviceDetailOpen}
        service={selectedService}
        onClose={() => {
          setServiceDetailOpen(false);
          setSelectedService(null);
        }}
      />

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scale-102 {
          transform: scale(1.02);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}