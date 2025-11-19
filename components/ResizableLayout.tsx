"use client";

import React, { useState } from "react";
import DefaultLeftSidebar from "@/components/LeftSidebar";
import DefaultMainContent from "@/components/MainContent";
import DefaultRightSidebar from "@/components/RightSidebar";
import BottomNavBar from "@/components/BottomNavBar";
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
      <header 
        className="md:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-4 bg-black text-white select-none border-b border-gray-800"
        role="banner"
      >
        <button
          className="flex items-center space-x-2 font-extrabold text-xl cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          <span>chagmihaydi</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div className="flex items-center bg-[#2f2f2f] rounded-full px-3 py-1 w-40">
          <Search className="w-4 h-4 text-gray-400 mr-2" aria-hidden="true" />
          <input
            type="search"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Tìm kiếm địa điểm"
            className="bg-transparent text-sm text-gray-300 placeholder-gray-400 focus:outline-none w-full"
          />
        </div>
      </header>

      {/* Overlay background (mobile) - ✅ Đặt TRƯỚC sidebar để có z-index thấp hơn */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar (overlay mobile, fixed desktop) - ✅ z-[70] để che cả overlay và bottom nav */}
      <aside
        className={`${
          isMenuOpen
            ? "fixed top-0 left-0 translate-x-0"
            : "fixed top-0 left-0 -translate-x-full"
        } md:translate-x-0 md:fixed md:top-0 md:left-0 h-full bg-black border-r border-gray-800 z-[70] transition-transform duration-300 md:block`}
        style={{
          width: "260px",
          overflow: "hidden",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="pt-16 md:pt-0 h-full overflow-y-auto">
          {LeftSidebar || <DefaultLeftSidebar width={260} overlay={isMenuOpen} />}
        </div>
      </aside>

      {/* Main content - với padding top cho header và bottom cho nav bar trên mobile */}
      <main className="flex-1 flex flex-col pt-14 pb-16 md:pt-0 md:pb-0 md:ml-[260px] md:mr-[200px] overflow-y-auto">
        <div className="flex justify-center items-start w-full">
          {MainContent || <DefaultMainContent>{children}</DefaultMainContent>}
        </div>
      </main>

      {/* Right sidebar (fixed on desktop) */}
      <aside 
        className="hidden lg:block fixed right-0 top-0 h-full w-[200px] border-l border-gray-800 bg-black overflow-y-auto"
        aria-label="User info and suggestions"
      >
        {RightSidebar || <DefaultRightSidebar width={200} />}
      </aside>

      {/* Bottom Navigation Bar (mobile only) */}
      <BottomNavBar />
    </div>
  );
}