"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data, error } = await supabase.rpc("random_services"); // 👉 gọi function SQL
      if (error) {
        console.error("Lỗi khi tải gợi ý:", error);
        return;
      }
      if (data) setSuggestions(data);
    };

    fetchSuggestions();
  }, []);

  return (
    <div>
      <h3 className="font-semibold mb-3">Gợi ý cho bạn</h3>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="flex items-center space-x-3 hover:bg-gray-800/30 p-2 rounded-lg transition"
          >
            <img
              src={s.image_url || "/next.svg"}
              alt={s.title}
              className="w-10 h-10 rounded object-cover"
            />
            <div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-gray-400">{s.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
