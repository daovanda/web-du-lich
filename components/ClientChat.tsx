"use client";

import ChatWidget from "@/app/admin/components/ChatWidget";

export default function ClientChat() {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
      <ChatWidget />
    </div>
  );
}