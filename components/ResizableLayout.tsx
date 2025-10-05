"use client";

import React from "react";
import DefaultLeftSidebar from "@/components/LeftSidebar";
import DefaultMainContent from "@/components/MainContent";
import DefaultRightSidebar from "@/components/RightSidebar";

type ResizableLayoutProps = {
  children?: React.ReactNode;
  LeftSidebar?: React.ReactNode;
  MainContent?: React.ReactNode;
  RightSidebar?: React.ReactNode;
};

export default function ResizableLayout({
  children,
  LeftSidebar,
  MainContent,
  RightSidebar,
}: ResizableLayoutProps) {
  const leftWidth = 260;
  const rightWidth = 200;

  return (
    <div
      className="container"
      style={{ paddingLeft: `${leftWidth}px`, paddingRight: `${rightWidth}px` }}
    >
      {/* Left Sidebar */}
      {LeftSidebar || <DefaultLeftSidebar width={leftWidth} />}

      <div className="resizer-left hidden sm:block"></div>

      {/* Main Content */}
      <div className="content-wrapper">
        {MainContent || <DefaultMainContent>{children}</DefaultMainContent>}
      </div>

      {/* Right Sidebar */}
      {RightSidebar || <DefaultRightSidebar width={rightWidth} />}

      <style jsx>{`
        .container {
          display: flex;
          min-height: 100vh;
          background-color: #000;
          color: #fff;
          width: 100%;
          box-sizing: border-box;
        }
        .content-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-width: 0;
          width: 100%;
        }
        .resizer-left {
          width: 5px;
          background: #4a5568;
          user-select: none;
          z-index: 10;
        }
        @media (max-width: 1024px) {
          .container {
            padding-right: 0;
          }
          .content-wrapper {
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .container {
            padding-left: 0;
          }
          .resizer-left {
            display: none;
          }
          .content-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
