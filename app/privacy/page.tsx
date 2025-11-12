
// ==================== FILE: page.tsx ====================
"use client";

import { useState } from "react";
import { ChevronDown, Shield, FileText, RefreshCw, Users, CreditCard, AlertCircle } from "lucide-react";
import { TermsContent } from "./components/TermsContent";
import { PrivacyContent } from "./components/PrivacyContent";
import { RefundContent } from "./components/RefundContent";
import { ComplaintsContent } from "./components/ComplaintsContent";
import { PartnerContent } from "./components/PartnerContent";
import { PaymentContent } from "./components/PaymentContent";
import ResizableLayout from "@/components/ResizableLayout";

type TabType = "terms" | "privacy" | "refund" | "complaints" | "partner" | "payment";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function TermsAndPrivacy() {
  const [activeTab, setActiveTab] = useState<TabType>("terms");
  const [expandedSections, setExpandedSections] = useState<string[]>(["terms-1"]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const tabs = [
    { id: "terms" as TabType, label: "Điều khoản", icon: FileText },
    { id: "privacy" as TabType, label: "Bảo mật", icon: Shield },
    { id: "refund" as TabType, label: "Hoàn tiền", icon: RefreshCw },
    { id: "complaints" as TabType, label: "Khiếu nại", icon: AlertCircle },
    { id: "partner" as TabType, label: "Đối tác", icon: Users },
    { id: "payment" as TabType, label: "Thanh toán", icon: CreditCard },
  ];

  const contentMap: Record<TabType, Section[]> = {
    terms: TermsContent,
    privacy: PrivacyContent,
    refund: RefundContent,
    complaints: ComplaintsContent,
    partner: PartnerContent,
    payment: PaymentContent,
  };

  const currentContent = contentMap[activeTab];

  return (
    <ResizableLayout>
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Điều khoản & Chính sách
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base">
            Thông tin pháp lý và chính sách sử dụng dịch vụ chagmihaydi
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-lg shadow-white/20"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-neutral-800">
            {currentContent.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors duration-200"
                >
                  <h3 className="text-left font-medium text-white text-sm sm:text-base">
                    {section.title}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform duration-300 flex-shrink-0 ml-2 ${
                      expandedSections.includes(section.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedSections.includes(section.id)
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6">
                    {section.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-white font-semibold mb-2">Thông tin liên hệ</h3>
            <p className="text-neutral-400 text-sm">Hộ kinh doanh Đào Văn Đà</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📧</div>
              <p className="text-xs text-neutral-500 mb-1">Email</p>
              <p className="text-sm text-blue-400">support@chagmihaydi.vn</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📞</div>
              <p className="text-xs text-neutral-500 mb-1">Hotline</p>
              <p className="text-sm text-emerald-400">1900 1234</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🏢</div>
              <p className="text-xs text-neutral-500 mb-1">Website</p>
              <p className="text-sm text-purple-400">chagmihaydi.vn</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-600">
            Cập nhật lần cuối: Tháng 11, 2025
          </p>
        </div>
      </div>
    </div>
    </ResizableLayout>
  );
}