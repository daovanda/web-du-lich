"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Post, PostStats } from "../types";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<PostStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts_detailed")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setPosts(data as Post[]);
      const total = data.length;
      const approved = data.filter(p => p.status === "approved").length;
      const pending = data.filter(p => p.status === "pending").length;
      const rejected = data.filter(p => p.status === "rejected").length;
      setStats({ total, approved, pending, rejected });
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("posts").update({ status }).eq("id", id);
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, stats, loading, updateStatus };
}
