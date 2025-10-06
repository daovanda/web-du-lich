"use client";

import React, { useState } from "react";
import DefaultLeftSidebar from "@/components/LeftSidebar";
import DefaultMainContent from "@/components/MainContent";
import DefaultRightSidebar from "@/components/RightSidebar";
import { ChevronDown, Search } from "lucide-react";

type ResizableLayoutProps = {
  children?: React.ReactNode;
  LeftSidebar?: React.ReactNode;
  MainContent?: React.ReactNode;
  RightSidebar?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
};

export default function ResizableLayout({
  children,
  LeftSidebar,
  MainContent,
  RightSidebar,
  searchQuery = "",
  onSearchChange,
}: ResizableLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearchChange) onSearchChange(value);
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen bg-black text-white overflow-hidden">
      {/* Header (mobile) */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-3 bg-black text-white select-none">
        <div
          className="flex items-center space-x-2 font-extrabold text-xl cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span>chagmihaydi</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        <div className="flex items-center bg-[#2f2f2f] rounded-full px-3 py-1 w-40">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-transparent text-sm text-gray-300 placeholder-gray-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Left Sidebar (overlay mobile, fixed desktop) */}
      <div
        className={`${
          isMenuOpen
            ? "fixed top-0 left-0 translate-x-0"
            : "fixed top-0 left-0 -translate-x-full"
        } md:translate-x-0 md:fixed md:top-0 md:left-0 h-full bg-black border-r border-gray-800 z-40 transition-transform duration-300 md:block`}
        style={{
          width: "260px",
          overflow: "hidden", // không cho scroll riêng trong sidebar trên desktop
        }}
      >
        <div className="pt-16 md:pt-0 h-full">
          {LeftSidebar || <DefaultLeftSidebar width={260} overlay={isMenuOpen} />}
        </div>
      </div>

      {/* Overlay background (mobile) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Main content: CHỈ thay đổi ở đây — thêm md:mr-[200px] */}
      <div className="flex-1 flex flex-col md:ml-[260px] md:mr-[200px] overflow-y-auto">
        <div className="flex justify-center items-start w-full">
          {MainContent || <DefaultMainContent>{children}</DefaultMainContent>}
        </div>
      </div>

      {/* Right sidebar (fixed on desktop) */}
      <div className="hidden lg:block fixed right-0 top-0 h-full w-[200px] border-l border-gray-800 bg-black overflow-y-auto">
        {RightSidebar || <DefaultRightSidebar width={200} />}
      </div>
    </div>
  );
}
