// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Client dành cho phía client (trình duyệt)
// Cookie tự động đồng bộ giữa client và middleware
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
