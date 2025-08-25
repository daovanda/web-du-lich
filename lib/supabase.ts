// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gaxmdralfrjhxvczvuvv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdheG1kcmFsZnJqaHh2Y3p2dXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTk1MjMsImV4cCI6MjA2NzczNTUyM30.S3N9_2y5CsCH88s9jktHsBla8U599llSBya-7iQ4Cyo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
